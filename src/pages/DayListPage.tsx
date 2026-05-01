import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, RefreshCcw, X } from "lucide-react";

import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { patients } from "@/data/patients";
import { cn } from "@/lib/utils";
import { Patient } from "@/types/patient";

type QueueStatus = "ready" | "loading" | "waiting" | "error";

type DayListEntry = {
  patientId: string;
  status: QueueStatus;
  progress: number;
  updatedAt: string | null;
  attempts: number;
};

const maxParallelPreloads = 2;
const estimatedMinutesPerPatient = 5;

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("lv-LV", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("lv-LV", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function createInitialEntries(): DayListEntry[] {
  return [
    { patientId: "2", status: "ready", progress: 100, updatedAt: "07:42", attempts: 1 },
    { patientId: "3", status: "ready", progress: 100, updatedAt: "07:48", attempts: 1 },
    { patientId: "1", status: "ready", progress: 100, updatedAt: "10:22", attempts: 1 },
    { patientId: "4", status: "ready", progress: 100, updatedAt: "10:22", attempts: 1 },
    { patientId: "5", status: "ready", progress: 100, updatedAt: "10:22", attempts: 1 },
    { patientId: "6", status: "error", progress: 0, updatedAt: "07:51", attempts: 1 },
    { patientId: "7", status: "ready", progress: 100, updatedAt: "10:22", attempts: 1 },
  ];
}

export default function DayListPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const activePatient =
    (location.state?.patient as Patient | undefined) ?? patients[0];

  const [query, setQuery] = React.useState("");
  const [error, setError] = React.useState("");
  const [entries, setEntries] = React.useState<DayListEntry[]>(() =>
    createInitialEntries(),
  );

  const patientMap = React.useMemo(
    () =>
      Object.fromEntries(
        patients.map((patient) => [patient.id, patient]),
      ) as Record<string, Patient>,
    [],
  );

  const recentPatients = React.useMemo(
    () =>
      [
        activePatient,
        ...patients.filter((patient) => patient.id !== activePatient.id),
      ].slice(0, 5),
    [activePatient],
  );

  React.useEffect(() => {
    setEntries((current) => {
      const loadingCount = current.filter(
        (entry) => entry.status === "loading",
      ).length;

      let freeSlots = maxParallelPreloads - loadingCount;

      if (freeSlots <= 0) return current;

      let changed = false;

      const next = current.map((entry) => {
        if (entry.status !== "waiting" || freeSlots <= 0) return entry;

        freeSlots -= 1;
        changed = true;

        return {
          ...entry,
          status: "loading" as const,
          progress: Math.max(entry.progress, 12),
          attempts: entry.attempts + 1,
        };
      });

      return changed ? next : current;
    });
  }, [entries]);

  React.useEffect(() => {
    if (!entries.some((entry) => entry.status === "loading")) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setEntries((current) =>
        current.map((entry) => {
          if (entry.status !== "loading") return entry;

          const increment =
            8 + ((Number(entry.patientId) * 3 + entry.progress) % 11);

          const nextProgress = Math.min(100, entry.progress + increment);

          if (nextProgress >= 100) {
            return {
              ...entry,
              status: "ready",
              progress: 100,
              updatedAt: formatClock(new Date()),
            };
          }

          return {
            ...entry,
            progress: nextProgress,
          };
        }),
      );
    }, 900);

    return () => window.clearInterval(intervalId);
  }, [entries]);

  const stats = React.useMemo(() => {
    const ready = entries.filter((entry) => entry.status === "ready").length;
    const loading = entries.filter((entry) => entry.status === "loading").length;
    const waiting = entries.filter((entry) => entry.status === "waiting").length;
    const errorCount = entries.filter((entry) => entry.status === "error").length;

    const remaining = loading + waiting;

    const estimatedMinutes =
      remaining === 0
        ? 5
        : Math.ceil(remaining / maxParallelPreloads) *
          estimatedMinutesPerPatient;

    return {
      ready,
      remaining,
      estimatedMinutes,
      errorCount,
    };
  }, [entries]);

  const handleAddPatient = () => {
    const trimmedQuery = query.trim();
    const normalizedQuery = normalizeText(trimmedQuery);

    if (!trimmedQuery) {
      setError("Ievadiet personas kodu");
      return;
    }

    const patient = patients.find((item) => {
      if (item.personalCode === trimmedQuery) return true;
      return normalizeText(item.name).includes(normalizedQuery);
    });

    if (!patient) {
      setError("Pacients netika atrasts.");
      return;
    }

    if (entries.some((entry) => entry.patientId === patient.id)) {
      setError("Šis pacients jau ir pievienots dienas sarakstam.");
      return;
    }

    setEntries((current) => [
      {
        patientId: patient.id,
        status: "waiting",
        progress: 0,
        updatedAt: null,
        attempts: 0,
      },
      ...current,
    ]);

    setQuery("");
    setError("");
  };

  const handleRetry = (patientId: string) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.patientId === patientId
          ? {
              ...entry,
              status: "waiting",
              progress: 0,
              updatedAt: null,
            }
          : entry,
      ),
    );
  };

  const handleRemove = (patientId: string) => {
    setEntries((current) =>
      current.filter((entry) => entry.patientId !== patientId),
    );
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-white">
      <DashboardSidebar
        activePatient={activePatient}
        recentPatients={recentPatients}
        currentView="day-list"
        dayListCount={entries.length}
      />

      <main className="min-h-screen px-8 py-8 lg:pl-[calc(var(--dashboard-sidebar-width,280px)+32px)] lg:pr-8">
        <section className="min-h-[calc(100vh-64px)] w-full">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[hsl(215,18%,67%)]">
                Dienas sagatavošana · {formatDay(new Date())}
              </p>

              <h1 className="mt-3 text-[31px] font-semibold tracking-[-0.045em] text-[hsl(216,42%,18%)]">
                Dr. A. Liepiņas dienas saraksts
              </h1>

              <p className="mt-2 max-w-[560px] text-[14px] font-medium leading-6 text-[hsl(215,18%,55%)]">
                Pievienojiet šīs dienas pacientus, lai dati būtu gatavi pirms
                vizītes.
              </p>
            </div>

            <div className="flex items-start gap-10 pt-2">
              {[
                ["Gatavi", `${stats.ready} / ${entries.length}`],
                ["Atlikušās", `~ ${stats.estimatedMinutes} min`],
                ["Kļūdas", stats.errorCount],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[hsl(215,18%,67%)]">
                    {label}
                  </p>
                  <p className="mt-2 text-[24px] font-semibold leading-none tracking-[-0.03em] text-[hsl(216,42%,18%)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="mb-3 mt-8 text-[11px] font-bold uppercase tracking-[0.22em] text-[hsl(215,18%,67%)]">
            Pievienot pacientu
          </p>

          <div className="rounded-[10px] border border-[rgba(214,224,235,0.95)] bg-white px-7 py-6 shadow-[0_8px_20px_rgba(29,53,87,0.025)]">
            <div className="flex items-center gap-5">
              <div className="relative flex-1">
                <Input
  value={query}
  onChange={(event) => {
    setQuery(event.target.value);
    if (error) setError("");
  }}
  onKeyDown={(event) => {
    if (event.key === "Enter") handleAddPatient();
  }}
  placeholder="000000-00000"
  className="h-[44px] rounded-[8px] border-0 bg-transparent px-0 text-[15px] font-semibold tracking-[0.06em] text-[hsl(216,30%,24%)] shadow-none placeholder:text-[hsl(215,18%,67%)] focus-visible:ring-0"
/>
              </div>

              <Button
                type="button"
                onClick={handleAddPatient}
                className="h-[52px] min-w-[150px] rounded-[7px] bg-[hsl(214,58%,18%)] px-6 text-[15px] font-semibold text-white hover:bg-[hsl(214,58%,18%)]"
              >
                Pievienot
                <Plus className="ml-3 h-5 w-5" />
              </Button>
            </div>

            {error && (
              <p className="mt-3 text-[12px] text-[hsl(0,68%,52%)]">
                {error}
              </p>
            )}
          </div>

          <div className="mt-8 rounded-[10px] border border-[rgba(214,224,235,0.95)] bg-white px-7 py-6 shadow-[0_8px_20px_rgba(29,53,87,0.025)]">
            <div className="grid grid-cols-[1.35fr_1.05fr_0.85fr_1.2fr_1fr_0.85fr] border-b border-[rgba(225,232,240,0.95)] px-0 pb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[hsl(215,18%,67%)]">
              <span>Pacients</span>
              <span>Personas kods</span>
              <span>Statuss</span>
              <span>Progress</span>
              <span>Atjaunots</span>
              <span>Darbības</span>
            </div>

            {entries.map((entry) => {
              const patient = patientMap[entry.patientId];

              if (!patient) return null;

              const isError = entry.status === "error";

              return (
                <div
                  key={entry.patientId}
                  onClick={() => navigate("/components", { state: { patient } })}
                  className="grid min-h-[72px] cursor-pointer grid-cols-[1.35fr_1.05fr_0.85fr_1.2fr_1fr_0.85fr] items-center border-b border-[rgba(225,232,240,0.95)] px-0 text-[15px] transition hover:bg-[hsl(214,28%,98%)]"
                >
                  <div className="truncate text-left font-semibold text-[hsl(216,36%,24%)]">
                    {patient.name}
                  </div>

                  <span className="font-medium text-[hsl(215,20%,58%)]">
                    {patient.personalCode}
                  </span>

                  <span
                    className={cn(
                      "inline-flex w-fit items-center gap-2 font-semibold",
                      isError
                        ? "text-[hsl(352,74%,54%)]"
                        : "text-[hsl(215,20%,58%)]",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isError
                          ? "bg-[hsl(352,74%,54%)]"
                          : "bg-[hsl(214,58%,20%)]",
                      )}
                    />
                    {isError ? "Kļūda" : "Gatavs"}
                  </span>

                  <div className="h-[3px] w-[160px] bg-[hsl(215,24%,91%)]">
                    <div
                      className={cn(
                        "h-[3px]",
                        isError
                          ? "bg-transparent"
                          : "bg-[hsl(213,37%,59%)]",
                      )}
                      style={{ width: `${entry.progress}%` }}
                    />
                  </div>

                  <span className="font-medium text-[hsl(215,20%,58%)]">
                    {entry.updatedAt ?? "-"}
                  </span>

                  <div className="flex items-center gap-7 text-[hsl(213,30%,48%)]">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRetry(entry.patientId);
                      }}
                      aria-label={`Atkārtot ${patient.name}`}
                      className="transition hover:text-[hsl(214,58%,18%)]"
                    >
                      <RefreshCcw
                        className="h-[18px] w-[18px]"
                        strokeWidth={2.2}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemove(entry.patientId);
                      }}
                      aria-label={`Noņemt ${patient.name}`}
                      className="text-[hsl(352,74%,52%)] transition hover:text-[hsl(352,82%,44%)]"
                    >
                      <X className="h-[21px] w-[21px]" strokeWidth={2.6} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}