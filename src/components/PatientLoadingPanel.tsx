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
        "clinical-panel relative w-full max-w-[680px]",
        variant === "page" && "shadow-none",
      )}
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-[540px] flex-col items-center px-1 py-1 text-center md:px-2 md:py-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[hsl(214,28%,96%)] text-[hsl(220,36%,22%)]">
          <HeartPulse className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-4 text-xs font-semibold text-[hsl(215,14%,47%)]">
          Pacienta profils
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[hsl(222,28%,18%)] md:text-2xl">
          Tiek apkopoti pacienta dati
        </h1>

        <div className="mt-2 text-center">
          <p className="text-sm font-semibold text-[hsl(222,28%,20%)]">
            {patient.name}
          </p>
          <p className="mt-1 text-xs leading-4 text-[hsl(215,14%,47%)] tabular-nums">
            {patient.personalCode}
          </p>
        </div>

        <div className="mt-4 w-full text-left">
          <div className="flex items-center justify-between text-xs font-normal text-[hsl(214,14%,48%)]">
            <span>Progress</span>
            <span>{progressValue}%</span>
          </div>

          <Progress
            value={progressValue}
            className="mt-2 h-1.5 rounded-full bg-[hsl(216,18%,90%)] [&>div]:bg-[linear-gradient(90deg,hsl(220,38%,22%)_0%,hsl(217,38%,28%)_100%)]"
          />

          <div className="mt-3 overflow-hidden rounded-lg border border-[hsl(214,22%,88%)] bg-white">
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
                    "flex items-center justify-between gap-3 border-b px-4 py-3 text-left transition-all duration-500 last:border-b-0",
                    isCompleted
                      ? "border-[rgba(196,220,205,0.96)] bg-[rgba(247,250,248,0.92)]"
                      : isActive
                        ? "border-[rgba(226,232,238,0.96)] bg-white"
                        : "border-[rgba(232,237,242,0.96)] bg-[rgba(251,252,253,0.96)] text-[hsl(214,12%,56%)]",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="shrink-0">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-md border",
                          isCompleted
                            ? "border-[rgba(174,223,186,0.96)] bg-[rgba(232,248,236,0.98)] text-[hsl(148,54%,34%)]"
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
                          "whitespace-normal break-words text-sm font-semibold",
                          isCompleted || isActive
                            ? "text-[hsl(219,30%,22%)]"
                            : "text-[hsl(214,12%,50%)]",
                        )}
                      >
                        {step.title}
                      </p>

                      <p
                        className={cn(
                          "mt-0.5 text-xs leading-4",
                          isCompleted || isActive
                            ? "text-[hsl(214,14%,54%)]"
                            : "text-[hsl(214,12%,66%)]",
                        )}
                      >
                        {step.detail}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2.5 py-1 text-xs font-semibold",
                        isCompleted
                          ? "bg-[rgba(228,247,233,0.98)] text-[hsl(148,54%,34%)]"
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
            className="h-11 w-full rounded-md bg-[hsl(220,36%,18%)] text-sm font-semibold text-white transition-colors duration-200 hover:bg-[hsl(220,36%,22%)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Tālāk
          </Button>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex text-sm font-normal text-[hsl(219,20%,42%)] underline underline-offset-4 transition hover:text-[hsl(219,30%,24%)]"
            >
              Atcelt
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
