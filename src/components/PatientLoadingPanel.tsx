import * as React from "react";
import {
  ClipboardCheck,
  FlaskConical,
  HeartPulse,
  Loader2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
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
    detail:
      "Tiek pārbaudītas piekļuves tiesības un izveidota droša sesija darbam ar pacienta datiem.",
    durationMs: 1800,
    icon: ShieldCheck,
  },
  {
    title: "Pacienta pamatdatu ielāde",
    detail:
      "Tiek ielādēti identifikācijas dati, kontaktinformācija un aktuālās diagnozes.",
    durationMs: 2200,
    icon: UserRound,
  },
  {
    title: "Klīnisko datu ielāde",
    detail:
      "Tiek apkopoti laboratorijas rezultāti, klīniskie ieraksti, medikamenti un izmeklējumi.",
    durationMs: 2400,
    icon: FlaskConical,
  },
  {
    title: "Klīniskā pārskata konsolidācija",
    detail:
      "Dati tiek apvienoti vienotā struktūrā pilnvērtīgai pacienta izvērtēšanai.",
    durationMs: 2100,
    icon: ClipboardCheck,
  },
];

const totalDurationMs = loadingSteps.reduce(
  (sum, step) => sum + step.durationMs,
  0,
);

type PatientLoadingPanelProps = {
  patient: Patient;
  onContinue: () => void;
  onCancel: () => void;
  variant?: "page" | "overlay";
};

export default function PatientLoadingPanel({
  patient,
  onContinue,
  onCancel,
  variant = "page",
}: PatientLoadingPanelProps) {
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const isComplete = elapsedMs >= totalDurationMs;

  React.useEffect(() => {
    setElapsedMs(0);
    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      const nextElapsed = Math.min(Date.now() - startedAt, totalDurationMs);
      setElapsedMs(nextElapsed);
    }, 80);

    return () => window.clearInterval(intervalId);
  }, [patient.id]);

  const progressValue = Math.min(
    100,
    Math.max(4, Math.round((elapsedMs / totalDurationMs) * 100)),
  );

  const currentStepIndex = React.useMemo(() => {
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
    <div
      className={cn(
        "relative w-full max-w-[680px]",
        variant === "page" ? "rounded-none" : "rounded-none",
      )}
    >
      <div className="mx-auto flex max-w-[540px] flex-col items-center px-5 py-5 text-center md:px-7 md:py-6">
        
        <h1 className="mt-3 text-[22px] font-semibold tracking-[-0.03em] text-[hsl(219,36%,18%)] md:text-[26px]">
          Tiek apkopoti pacienta dati
        </h1>

        <div className="mt-2 text-center">
          <p className="flex flex-wrap items-center justify-center gap-2 text-[12px] leading-5 text-[hsl(214,16%,50%)]">
            <span>Pacients</span>
            <span className="font-semibold text-[hsl(219,30%,24%)]">
              {patient.name}
            </span>
            <span aria-hidden="true" className="text-[hsl(214,16%,60%)]">
              &bull;
            </span>
            <span>{patient.personalCode}</span>
          </p>
        </div>

        <div className="mt-4 w-full text-left">
          <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(214,14%,48%)]">
            <span>Progress</span>
            <span>{progressValue}%</span>
          </div>

          <Progress
            value={progressValue}
            className="mt-2 h-1.5 rounded-full bg-[hsl(216,18%,90%)] [&>div]:bg-[linear-gradient(90deg,hsl(220,38%,22%)_0%,hsl(217,38%,28%)_100%)]"
          />

          <div className="mt-3 overflow-hidden rounded-[12px] border border-[rgba(214,221,229,0.96)] bg-[rgba(255,255,255,0.98)]">
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
                  className={cn(
                    "flex items-start justify-between gap-3 border-b px-4 py-3 text-left transition-all duration-500 last:border-b-0",
                    isCompleted
                      ? "border-[rgba(196,220,205,0.96)] bg-[rgba(247,250,248,0.92)]"
                      : isActive
                        ? "border-[rgba(226,232,238,0.96)] bg-white"
                        : "border-[rgba(232,237,242,0.96)] bg-[rgba(251,252,253,0.96)] text-[hsl(214,12%,56%)]",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="shrink-0">
                      <div
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full border",
                          isCompleted
                            ? "border-[rgba(181,204,191,0.92)] bg-[rgba(241,247,243,0.96)] text-[hsl(154,30%,34%)]"
                            : isActive
                              ? "border-[rgba(199,210,223,0.96)] bg-[hsl(220,22%,95%)] text-[hsl(219,36%,24%)]"
                              : "border-[rgba(221,228,236,0.92)] bg-[hsl(214,18%,97%)] text-[hsl(214,10%,68%)]",
                        )}
                      >
                        {isActive ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <StepIcon className="h-3 w-3" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <p
                        className={cn(
                          "truncate text-[13px] font-semibold",
                          isCompleted || isActive
                            ? "text-[hsl(219,30%,22%)]"
                            : "text-[hsl(214,12%,50%)]",
                        )}
                      >
                        {step.title}
                      </p>

                      <p
                        className={cn(
                          "mt-0.5 text-[11px] leading-4",
                          isCompleted || isActive
                            ? "text-[hsl(214,14%,54%)]"
                            : "text-[hsl(214,12%,66%)]",
                        )}
                      >
                        {step.detail}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pt-1">
                    <span
                      className={cn(
                        "inline-flex rounded-[8px] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em]",
                        isCompleted
                          ? "bg-[rgba(241,247,243,0.96)] text-[hsl(154,30%,34%)]"
                          : isActive
                            ? "bg-[hsl(220,22%,95%)] text-[hsl(219,36%,24%)]"
                            : "bg-[hsl(214,18%,97%)] text-[hsl(214,10%,68%)]",
                      )}
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
            onClick={onContinue}
            disabled={!isComplete}
            className="h-10 w-full rounded-[12px] bg-[linear-gradient(180deg,hsl(220,36%,18%)_0%,hsl(218,34%,24%)_100%)] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(29,53,87,0.16)] transition-all duration-500 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Tālāk
          </Button>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex text-[15px] font-medium text-[hsl(219,20%,42%)] underline underline-offset-4 transition hover:text-[hsl(219,30%,24%)]"
            >
              Atcelt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
