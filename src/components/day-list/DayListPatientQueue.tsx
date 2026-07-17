import { RefreshCcw, Trash2, UsersRound } from "lucide-react";

import { type DayListEntry } from "@/lib/day-list";
import { cn } from "@/lib/utils";
import { type Patient } from "@/types/patient";

type StatusMeta = {
  label: string;
  badgeClass: string;
  dotClass: string;
  progressClass: string;
};

type DayListPatientQueueProps = {
  entries: DayListEntry[];
  selectedDateKey: string;
  patientMap: Record<string, Patient>;
  getStatusMeta: (status: DayListEntry["status"]) => StatusMeta;
  onOpenPatient: (patient: Patient) => void;
  onRetry: (patientId: string) => void;
  onRemove: (patientId: string) => void;
};

const tableGridClass =
  "grid items-center gap-4 md:grid-cols-[1.5fr_1.1fr_0.85fr_1.45fr_0.75fr_0.7fr]";

function PatientStatus({
  status,
  meta,
}: {
  status: DayListEntry["status"];
  meta: StatusMeta;
}) {
  const isReady = status === "ready";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 text-xs font-semibold leading-4",
        isReady
          ? "text-[hsl(154,44%,31%)]"
          : cn("rounded-md border px-2.5 py-1", meta.badgeClass),
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dotClass)} />
      {meta.label}
    </span>
  );
}

function ProgressBar({
  value,
  status,
  progressClass,
}: {
  value: number;
  status: DayListEntry["status"];
  progressClass: string;
}) {
  const progress = status === "error" ? 0 : value;

  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(216,28%,92%)]">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            progressClass,
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs tabular-nums text-[hsl(218,15%,47%)]">
        {status === "error" ? "–" : `${progress}%`}
      </span>
    </div>
  );
}

function PatientActions({
  patient,
  onRetry,
  onRemove,
}: {
  patient: Patient;
  onRetry: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onRetry}
        aria-label={`Atkārtot ${patient.name}`}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[hsl(216,44%,48%)] transition-colors duration-200 hover:bg-[hsl(214,28%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
      >
        <RefreshCcw className="h-4 w-4" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Noņemt ${patient.name}`}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[hsl(0,56%,50%)] transition-colors duration-200 hover:bg-[hsl(0,72%,98%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

export function DayListPatientQueue({
  entries,
  selectedDateKey,
  patientMap,
  getStatusMeta,
  onOpenPatient,
  onRetry,
  onRemove,
}: DayListPatientQueueProps) {
  return (
    <section
      className="overflow-hidden rounded-lg border border-[hsl(214,22%,88%)] bg-white"
      aria-labelledby="day-patients-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[hsl(214,22%,90%)] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[hsl(214,28%,96%)] text-[hsl(217,36%,37%)]">
            <UsersRound className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <h2
              id="day-patients-title"
              className="text-xl font-semibold tracking-[-0.03em] text-[hsl(222,28%,20%)]"
            >
              Pacientu dienas saraksts
            </h2>
          </div>
        </div>
        <span className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-full bg-[hsl(220,46%,96%)] px-2.5 text-sm font-semibold tabular-nums text-[hsl(220,48%,42%)]">
          {entries.length}
          <span className="sr-only"> pacienti</span>
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="px-6 py-14 text-center sm:px-8">
          <UsersRound className="mx-auto h-7 w-7 text-[hsl(217,18%,64%)]" strokeWidth={1.7} />
          <p className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[hsl(219,30%,22%)]">
            Šī diena pagaidām ir tukša
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-5 text-[hsl(214,16%,48%)]">
            Pievienojiet pacientu ar personas kodu, lai sāktu datu sagatavošanu.
          </p>
        </div>
      ) : (
        <>
          <div
            className={cn(
              tableGridClass,
              "hidden border-b border-[hsl(214,22%,90%)] bg-[hsl(214,38%,98%)] px-6 py-3 text-xs font-semibold text-[hsl(215,14%,47%)] md:grid",
            )}
          >
            <span>Pacients</span>
            <span>Personas kods</span>
            <span>Statuss</span>
            <span>Progress</span>
            <span className="text-center">Atjaunots</span>
            <span>Darbības</span>
          </div>

          <div className="hidden md:block">
            {entries.map((entry, index) => {
              const patient = patientMap[entry.patientId];
              if (!patient) return null;

              const meta = getStatusMeta(entry.status);

              return (
                <div
                  key={`${selectedDateKey}-${entry.patientId}`}
                  className={cn(
                    tableGridClass,
                    "px-6 py-4 text-sm transition-colors duration-200 hover:bg-[hsl(214,36%,98%)]",
                    index > 0 && "border-t border-[hsl(214,26%,91%)]",
                    entry.status === "error" && "bg-[hsl(0,72%,99%)]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onOpenPatient(patient)}
                    className="min-w-0 text-left text-sm font-semibold text-[hsl(220,38%,20%)] transition-colors hover:text-[hsl(216,48%,42%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
                  >
                    {patient.name}
                  </button>
                  <span className="text-sm tabular-nums text-[hsl(218,15%,47%)]">
                    {patient.personalCode}
                  </span>
                  <PatientStatus status={entry.status} meta={meta} />
                  <ProgressBar
                    value={entry.progress}
                    status={entry.status}
                    progressClass={meta.progressClass}
                  />
                  <span className="text-center text-sm tabular-nums text-[hsl(218,15%,47%)]">
                    {entry.updatedAt ?? "–"}
                  </span>
                  <PatientActions
                    patient={patient}
                    onRetry={() => onRetry(entry.patientId)}
                    onRemove={() => onRemove(entry.patientId)}
                  />
                </div>
              );
            })}
          </div>

          <div className="divide-y divide-[hsl(214,26%,91%)] md:hidden">
            {entries.map((entry) => {
              const patient = patientMap[entry.patientId];
              if (!patient) return null;

              const meta = getStatusMeta(entry.status);

              return (
                <article
                  key={`${selectedDateKey}-${entry.patientId}`}
                  className={cn(
                    "p-4",
                    entry.status === "error" && "bg-[hsl(0,72%,99%)]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onOpenPatient(patient)}
                        className="text-left text-sm font-semibold text-[hsl(220,38%,20%)] transition-colors hover:text-[hsl(216,48%,42%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
                      >
                        {patient.name}
                      </button>
                      <p className="mt-1 text-xs tabular-nums leading-4 text-[hsl(218,15%,47%)]">
                        {patient.personalCode}
                      </p>
                    </div>
                    <PatientStatus status={entry.status} meta={meta} />
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <ProgressBar
                        value={entry.progress}
                        status={entry.status}
                        progressClass={meta.progressClass}
                      />
                    </div>
                    <PatientActions
                      patient={patient}
                      onRetry={() => onRetry(entry.patientId)}
                      onRemove={() => onRemove(entry.patientId)}
                    />
                  </div>

                  {entry.updatedAt && (
                    <p className="mt-3 text-xs tabular-nums leading-4 text-[hsl(218,15%,47%)]">
                      Atjaunots {entry.updatedAt}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
