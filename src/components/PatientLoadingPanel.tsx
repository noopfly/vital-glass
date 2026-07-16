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
  onProgressChange?: (progress: number, isComplete: boolean) => void;
};

export default function PatientLoadingPanel({
  patient,
  onContinue,
  onCancel,
  variant = "page",
  onProgressChange,
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

  React.useEffect(() => {
    onProgressChange?.(progressValue, isComplete);
  }, [isComplete, onProgressChange, progressValue]);

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
    <section
      className={cn(
        "w-full max-w-2xl overflow-hidden rounded-lg border border-[hsl(214,22%,88%)] bg-white",
        variant === "overlay" && "shadow-[0_16px_34px_rgba(30,64,91,0.08)]",
      )}
      aria-live="polite"
    >
      <div className="px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[hsl(216,24%,94%)] text-[hsl(217,38%,22%)]">
            <HeartPulse className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[hsl(217,40%,18%)]">
              Tiek apkopoti pacienta dati
            </h1>
            <p className="mt-1 text-sm leading-5 text-[hsl(214,18%,52%)]">
              Pacienta profils&nbsp;·&nbsp;
              <span className="font-semibold text-[hsl(217,36%,22%)]">
                {patient.name}
              </span>
              <span className="tabular-nums">&nbsp;·&nbsp;{patient.personalCode}</span>
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-[hsl(214,18%,52%)]">
            <span>Progress</span>
            <span className="tabular-nums">{progressValue}%</span>
          </div>
          <Progress
            value={progressValue}
            className="mt-2 h-1.5 rounded-full bg-[hsl(216,18%,90%)] [&>div]:bg-[hsl(217,38%,22%)]"
          />
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-[hsl(214,22%,88%)] bg-white">
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
                  "flex items-start gap-3 px-4 py-3 transition-colors duration-200 motion-reduce:transition-none",
                  index > 0 && "border-t border-[hsl(214,22%,90%)]",
                  isCompleted && "bg-[hsl(151,40%,98%)]",
                  isActive && "bg-white",
                  !isCompleted && !isActive && "bg-[hsl(210,40%,99%)]",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border",
                    isCompleted &&
                      "border-[hsl(151,30%,78%)] bg-[hsl(151,40%,94%)] text-[hsl(154,44%,30%)]",
                    isActive &&
                      "border-[hsl(214,22%,84%)] bg-[hsl(216,24%,94%)] text-[hsl(217,38%,22%)]",
                    !isCompleted &&
                      !isActive &&
                      "border-[hsl(214,22%,88%)] bg-white text-[hsl(214,16%,58%)]",
                  )}
                >
                  {isActive ? (
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <StepIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-semibold leading-5",
                      isCompleted || isActive
                        ? "text-[hsl(217,36%,22%)]"
                        : "text-[hsl(214,18%,48%)]",
                    )}
                  >
                    {step.title}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs leading-4",
                      isCompleted || isActive
                        ? "text-[hsl(214,18%,52%)]"
                        : "text-[hsl(214,16%,58%)]",
                    )}
                  >
                    {step.detail}
                  </p>
                </div>

                <span
                  className={cn(
                    "mt-1 shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold",
                    isCompleted && "bg-[hsl(151,40%,92%)] text-[hsl(154,44%,30%)]",
                    isActive && "bg-[hsl(216,24%,94%)] text-[hsl(217,38%,22%)]",
                    !isCompleted &&
                      !isActive &&
                      "bg-[hsl(214,18%,96%)] text-[hsl(214,16%,58%)]",
                  )}
                >
                  {isCompleted ? "Pabeigts" : isActive ? "Notiek" : "Gaida"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 border-t border-[hsl(214,22%,90%)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 self-start text-sm text-[hsl(214,18%,48%)] underline underline-offset-4 transition hover:text-[hsl(217,36%,22%)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,54,86,0.16)] motion-reduce:transition-none"
          >
            Atcelt
          </button>
          <Button
            type="button"
            onClick={onContinue}
            disabled={!isComplete}
            className="h-11 w-full rounded-md bg-[hsl(217,38%,22%)] px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[hsl(217,38%,18%)] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
          >
            Tālāk
          </Button>
        </div>
      </div>
    </section>
  );
}
