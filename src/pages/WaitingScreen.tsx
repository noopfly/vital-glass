import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  HeartPulse,
  Loader2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Patient } from "@/types/patient";

type LoadingStep = {
  title: string;
  detail: string;
  durationMs: number;
  icon: React.ComponentType<{ className?: string }>;
};

const loadingSteps: LoadingStep[] = [
  {
    title: "Piekļuves validācija",
    detail: "Tiek pārbaudītas piekļuves tiesības un izveidota droša sesija darbam ar pacienta datiem.",
    durationMs: 1800,
    icon: ShieldCheck,
  },
  {
    title: "Pacienta pamatdatu ielāde",
    detail: "Tiek ielādēti identifikācijas dati, kontaktinformācija un aktuālās diagnozes.",
    durationMs: 2200,
    icon: UserRound,
  },
  {
    title: "Klīnisko datu ielāde",
    detail: "Tiek apkopoti laboratorijas rezultāti, klīniskie ieraksti, medikamenti un izmeklējumi.",
    durationMs: 2400,
    icon: FlaskConical,
  },
  {
    title: "Klīniskā pārskata konsolidācija",
    detail: "Dati tiek apvienoti vienotā struktūrā pilnvērtīgai pacienta izvērtēšanai.",
    durationMs: 2100,
    icon: ClipboardCheck,
  },
];

const totalDurationMs = loadingSteps.reduce((sum, step) => sum + step.durationMs, 0);

const WaitingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient as Patient | undefined;
  const [elapsedMs, setElapsedMs] = useState(0);
  const isComplete = elapsedMs >= totalDurationMs;

  useEffect(() => {
    if (!patient) {
      navigate("/", { replace: true });
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const nextElapsed = Math.min(Date.now() - startedAt, totalDurationMs);
      setElapsedMs(nextElapsed);
    }, 80);

    return () => window.clearInterval(interval);
  }, [navigate, patient]);

  const progressValue = Math.min(100, Math.max(4, Math.round((elapsedMs / totalDurationMs) * 100)));

  const currentStepIndex = useMemo(() => {
    let accumulated = 0;

    for (let index = 0; index < loadingSteps.length; index += 1) {
      accumulated += loadingSteps[index].durationMs;
      if (elapsedMs < accumulated) {
        return index;
      }
    }

    return loadingSteps.length - 1;
  }, [elapsedMs]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f8fcff_0%,#edf6ff_100%)] px-4 py-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,170,214,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(124,170,214,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(circle at center, black 35%, transparent 88%)",
        }}
      />

      <div className="relative w-full max-w-[700px] rounded-[20px] border border-white/80 bg-[rgba(255,255,255,0.88)] shadow-[0_20px_56px_rgba(120,166,205,0.12)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-[rgba(166,197,223,0.30)] px-5 py-4">
          <div className="flex items-center gap-2.5 text-[hsl(211,74%,54%)]">
            <span className="text-lg font-semibold tracking-[-0.02em] text-[hsl(213,54%,34%)]">
            Omnus
            </span>
          </div>
        </div>

        <div className="mx-auto flex max-w-[560px] flex-col items-center px-5 py-7 text-center md:px-8 md:py-8">
          <div className="flex items-center justify-center text-[hsl(203,64%,52%)]">
            <HeartPulse className="h-11 w-11" />
          </div>

          <h1 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[hsl(213,42%,22%)] md:text-2xl">
            Notiek pacienta klīniskā pārskata sagatavošana...
          </h1>
          <div className="mt-1.5 max-w-sm text-center">
            <p className="text-[11px] leading-4 text-[hsl(208,25%,50%)] md:text-xs md:leading-5">
              Lūdzu, uzgaidiet, kamēr tiek apstrādāti un apkopoti pacienta dati:
            </p>
            <p className="mt-1 text-[12px] font-semibold leading-4 text-[hsl(214,58%,42%)] md:text-[13px]">
              {patient?.name}
            </p>
          </div>

          <div className="mt-5 w-full text-left">
            <div className="flex items-center justify-between text-[11px] font-medium text-[hsl(209,36%,34%)] md:text-xs">
              <span>Progress</span>
              <span>{progressValue}%</span>
            </div>
            <Progress
              value={progressValue}
              className="mt-2 h-1.5 rounded-full bg-[hsl(205,35%,88%)] [&>div]:bg-[linear-gradient(90deg,#72bef2_0%,#429ada_100%)]"
            />

            <div className="mt-4 space-y-2.5">
              {loadingSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted =
                  elapsedMs >=
                  loadingSteps
                    .slice(0, index + 1)
                    .reduce((sum, current) => sum + current.durationMs, 0);
                const isActive = !isCompleted && index === currentStepIndex;
                const isVisible = isComplete || index <= currentStepIndex;

                if (!isVisible) {
                  return null;
                }

                return (
                  <div
                    key={step.title}
                    className={
                      "flex items-start justify-between gap-4 rounded-[12px] border bg-white px-4 py-3 text-left shadow-[0_2px_8px_rgba(31,78,121,0.035)] transition-all duration-500 " +
                      (isCompleted
                        ? "border-[rgba(192,226,208,0.70)]"
                        : isActive
                          ? "border-[rgba(199,218,236,0.78)]"
                          : "border-[rgba(199,218,236,0.72)] text-[hsl(206,12%,56%)]")
                    }
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="shrink-0">
                        <div
                          className={
                            "flex h-8 w-8 items-center justify-center rounded-full border " +
                            (isCompleted
                              ? "border-[rgba(126,214,164,0.34)] bg-[rgba(223,247,232,0.92)] text-[hsl(156,58%,38%)]"
                              : isActive
                                ? "border-[rgba(157,207,238,0.42)] bg-[rgba(235,246,255,0.96)] text-[hsl(203,64%,52%)]"
                                : "border-[rgba(199,218,236,0.72)] bg-[rgba(245,250,255,0.90)] text-[hsl(207,16%,68%)]")
                          }
                        >
                          {isActive ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <StepIcon className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 text-left">
                        <p
                          className={
                            "truncate text-[12px] font-medium md:text-[13px] " +
                            (isCompleted || isActive
                              ? "text-[hsl(212,34%,26%)]"
                              : "text-[hsl(208,14%,50%)]")
                          }
                        >
                          {step.title}
                        </p>

                        {(isCompleted || isActive) && (
                          <p className="mt-1 text-[11px] leading-4 text-[hsl(208,22%,52%)] md:text-[12px]">
                            {step.detail}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 pt-1">
                      <span
                        className={
                          "inline-flex rounded-[10px] px-3 py-1 text-[11px] font-medium " +
                          (isCompleted
                            ? "bg-[rgba(223,247,232,0.96)] text-[hsl(156,58%,38%)]"
                            : isActive
                              ? "bg-[rgba(235,246,255,0.96)] text-[hsl(203,64%,52%)]"
                              : "bg-[rgba(245,250,255,0.9)] text-[hsl(207,16%,68%)]")
                        }
                      >
                        {isCompleted ? "Pabeigts" : isActive ? "Notiek" : "Gaida"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 w-full">
            <Button
              type="button"
              onClick={() => navigate("/components", { state: { patient } })}
              disabled={!isComplete}
              className="h-10 w-full rounded-[12px] bg-[linear-gradient(180deg,#56b4f0_0%,#318dde_100%)] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(90,177,232,0.20)] transition-all duration-500 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Tālāk
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingScreen;
