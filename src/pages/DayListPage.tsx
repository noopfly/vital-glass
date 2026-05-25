import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  RefreshCcw,
  Trash2,
  UserPlus,
} from "lucide-react";

import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { patients } from "@/data/patients";
import {
  normalizeDashboardLayoutOrder,
  readStoredDashboardLayoutOrder,
  type DashboardComponentKey,
} from "@/lib/dashboard-layout";
import { cn } from "@/lib/utils";
import { Patient } from "@/types/patient";

type DayListLocationState = {
  patient?: Patient;
  layoutOrder?: DashboardComponentKey[];
};

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
const personalCodeGroupSizes = [6, 5] as const;
const personalCodeLength =
  personalCodeGroupSizes[0] + personalCodeGroupSizes[1];

const pageBg = "bg-[hsl(214,34%,97%)]";

const panelClass =
  "relative overflow-hidden rounded-[8px] border border-[hsl(214,28%,88%)] bg-white";

const sectionLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.15em] text-[hsl(218,22%,42%)]";

const mutedLabelClass =
  "text-[10px] font-semibold uppercase tracking-[0.16em] text-[hsl(218,18%,56%)]";

const tableGridClass =
  "grid min-w-[860px] grid-cols-[1.55fr_1.15fr_0.9fr_1.45fr_0.8fr_0.85fr] items-center gap-4";

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

function formatPersonalCode(raw: string) {
  const digits = raw.replace(/[^\d]/g, "").slice(0, personalCodeLength);

  if (digits.length <= personalCodeGroupSizes[0]) return digits;

  return `${digits.slice(0, personalCodeGroupSizes[0])}-${digits.slice(
    personalCodeGroupSizes[0],
  )}`;
}

function createInitialEntries(): DayListEntry[] {
  return [
    {
      patientId: "2",
      status: "ready",
      progress: 100,
      updatedAt: "07:42",
      attempts: 1,
    },
    {
      patientId: "3",
      status: "ready",
      progress: 100,
      updatedAt: "07:48",
      attempts: 1,
    },
    {
      patientId: "1",
      status: "ready",
      progress: 100,
      updatedAt: "10:22",
      attempts: 1,
    },
    {
      patientId: "4",
      status: "ready",
      progress: 100,
      updatedAt: "10:22",
      attempts: 1,
    },
    {
      patientId: "5",
      status: "ready",
      progress: 100,
      updatedAt: "10:22",
      attempts: 1,
    },
    {
      patientId: "6",
      status: "error",
      progress: 0,
      updatedAt: "07:51",
      attempts: 1,
    },
    {
      patientId: "7",
      status: "ready",
      progress: 100,
      updatedAt: "10:22",
      attempts: 1,
    },
  ];
}

function getStatusMeta(status: QueueStatus) {
  switch (status) {
    case "ready":
      return {
        label: "Gatavs",
        badgeClass:
          "bg-[hsl(151,42%,94%)] text-[hsl(154,44%,31%)] border-[hsl(151,35%,88%)]",
        dotClass: "bg-[hsl(154,48%,40%)]",
        progressClass: "bg-[hsl(216,48%,58%)]",
      };
    case "loading":
      return {
        label: "Notiek",
        badgeClass:
          "bg-[hsl(216,48%,95%)] text-[hsl(217,42%,38%)] border-[hsl(216,42%,88%)]",
        dotClass: "bg-[hsl(216,48%,50%)]",
        progressClass: "bg-[hsl(216,48%,58%)]",
      };
    case "waiting":
      return {
        label: "Rindā",
        badgeClass:
          "bg-[hsl(42,62%,95%)] text-[hsl(36,48%,36%)] border-[hsl(42,44%,86%)]",
        dotClass: "bg-[hsl(38,62%,48%)]",
        progressClass: "bg-[hsl(38,62%,50%)]",
      };
    case "error":
      return {
        label: "Kļūda",
        badgeClass:
          "bg-[hsl(0,68%,97%)] text-[hsl(0,58%,48%)] border-[hsl(0,54%,89%)]",
        dotClass: "bg-[hsl(0,58%,50%)]",
        progressClass: "bg-[hsl(0,58%,50%)]",
      };
  }
}

export default function DayListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as DayListLocationState | undefined;

  const activePatient = routeState?.patient ?? patients[0];

  const [layoutOrder, setLayoutOrder] = React.useState<DashboardComponentKey[]>(
    () =>
      normalizeDashboardLayoutOrder(
        routeState?.layoutOrder ?? readStoredDashboardLayoutOrder(),
      ),
  );

  const [query, setQuery] = React.useState("");
  const [error, setError] = React.useState("");
  const [entries, setEntries] = React.useState<DayListEntry[]>(
    () => createInitialEntries(),
  );

  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const personalCodeDigits = React.useMemo(() => {
    const digits = query
      .replace(/[^\d]/g, "")
      .slice(0, personalCodeLength)
      .split("");

    return Array.from(
      { length: personalCodeLength },
      (_, index) => digits[index] ?? "",
    );
  }, [query]);

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
    setLayoutOrder(
      normalizeDashboardLayoutOrder(
        routeState?.layoutOrder ?? readStoredDashboardLayoutOrder(),
      ),
    );
  }, [routeState?.layoutOrder]);

  const updateQueryFromDigits = React.useCallback(
    (nextDigits: string[]) => {
      setQuery(formatPersonalCode(nextDigits.join("")));
      if (error) setError("");
    },
    [error],
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
    const errorCount = entries.filter(
      (entry) => entry.status === "error",
    ).length;

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
    <div className={cn("min-h-screen overflow-y-auto", pageBg)}>
      <DashboardSidebar
        activePatient={activePatient}
        recentPatients={recentPatients}
        allPatients={patients}
        currentView="day-list"
        dayListCount={entries.length}
        layoutOrder={layoutOrder}
        onSaveLayoutOrder={setLayoutOrder}
      />

      <main className="min-h-screen px-4 py-3 sm:px-5 lg:pl-[calc(var(--dashboard-sidebar-width,280px)+24px)] lg:pr-6 lg:pt-5">
        <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-4">
          <div className={panelClass}>
            <div className="relative flex flex-col gap-5 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between xl:px-7">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[hsl(219,44%,19%)]">
                    <CalendarDays className="h-5 w-5" strokeWidth={2.3} />
                  </span>

                  <p className={mutedLabelClass}>
                    Dienas sagatavošana
                    <span className="mx-2 text-[hsl(218,14%,64%)]">·</span>
                    {formatDay(new Date())}
                  </p>
                </div>

                <h1 className="mt-3 max-w-[520px] text-[24px] font-medium leading-[1.15] tracking-[-0.04em] text-[hsl(220,44%,18%)] sm:text-[29px] lg:text-[31px]">
                  Dr. A. Liepiņas dienas saraksts
                </h1>

                <p className="mt-2.5 max-w-[520px] text-[13px] leading-5 text-[hsl(218,17%,48%)]">
                  Pievienojiet šīs dienas pacientus, lai dati būtu gatavi pirms
                  vizītes.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[430px]">
                {[
                  {
                    icon: ClipboardCheck,
                    label: "Gatavi",
                    value: `${stats.ready} / ${entries.length}`,
                    valueClass: "text-[hsl(220,56%,46%)]",
                  },
                  {
                    icon: Clock3,
                    label: "Atlikušais laiks",
                    value: `~ ${stats.estimatedMinutes} min`,
                    valueClass: "text-[hsl(220,42%,18%)]",
                  },
                  {
                    icon: CircleAlert,
                    label: "Kļūdas",
                    value: `${stats.errorCount}`,
                    valueClass:
                      stats.errorCount > 0
                        ? "text-[hsl(0,62%,50%)]"
                        : "text-[hsl(218,18%,42%)]",
                  },
                ].map(({ icon: Icon, label, value, valueClass }) => (
                  <div
                    key={label}
                    className="rounded-[8px] border border-[hsl(214,24%,88%)] bg-white px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                  >
                    <div className="flex items-center gap-1.5 text-[hsl(218,17%,48%)]">
                      <Icon className="h-3 w-3" strokeWidth={2} />
                      <span className="text-[9px] font-semibold uppercase tracking-[0.14em]">
                        {label}
                      </span>
                    </div>

                    <p
                      className={cn(
                        "mt-1.5 text-[21px] font-medium leading-none tracking-[-0.03em]",
                        valueClass,
                      )}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={panelClass}>
            <form
              className="relative flex flex-col gap-5 px-5 py-5 sm:px-6 xl:px-7"
              onSubmit={(event) => {
                event.preventDefault();
                handleAddPatient();
              }}
            >
              <div className="min-w-0">
                <p className={sectionLabelClass}>Pievienot pacientu</p>

                <div className="mt-4 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto py-1">
                      {personalCodeDigits.map((digit, index) => {
                        const showDivider =
                          index === personalCodeGroupSizes[0] - 1;

                        return (
                          <React.Fragment key={index}>
                            <input
                              ref={(node) => {
                                inputRefs.current[index] = node;
                              }}
                              type="text"
                              inputMode="numeric"
                              autoFocus={index === 0}
                              maxLength={1}
                              value={digit}
                              onChange={(event) => {
                                const nextValue = event.target.value
                                  .replace(/[^\d]/g, "")
                                  .slice(-1);

                                const nextDigits = [...personalCodeDigits];
                                nextDigits[index] = nextValue;
                                updateQueryFromDigits(nextDigits);

                                if (
                                  nextValue &&
                                  index < personalCodeLength - 1
                                ) {
                                  inputRefs.current[index + 1]?.focus();
                                  inputRefs.current[index + 1]?.select();
                                }
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Backspace") {
                                  event.preventDefault();

                                  const nextDigits = [...personalCodeDigits];

                                  if (nextDigits[index]) {
                                    nextDigits[index] = "";
                                    updateQueryFromDigits(nextDigits);
                                    return;
                                  }

                                  if (index > 0) {
                                    nextDigits[index - 1] = "";
                                    updateQueryFromDigits(nextDigits);
                                    inputRefs.current[index - 1]?.focus();
                                  }

                                  return;
                                }

                                if (event.key === "ArrowLeft" && index > 0) {
                                  event.preventDefault();
                                  inputRefs.current[index - 1]?.focus();
                                  return;
                                }

                                if (
                                  event.key === "ArrowRight" &&
                                  index < personalCodeLength - 1
                                ) {
                                  event.preventDefault();
                                  inputRefs.current[index + 1]?.focus();
                                  return;
                                }

                                const allowedKeys = ["Delete", "Tab", "Enter"];

                                if (
                                  !/\d/.test(event.key) &&
                                  !allowedKeys.includes(event.key)
                                ) {
                                  event.preventDefault();
                                }
                              }}
                              onPaste={(event) => {
                                event.preventDefault();

                                const pastedDigits = event.clipboardData
                                  .getData("text")
                                  .replace(/[^\d]/g, "")
                                  .slice(0, personalCodeLength - index)
                                  .split("");

                                if (pastedDigits.length === 0) return;

                                const nextDigits = [...personalCodeDigits];

                                pastedDigits.forEach((value, offset) => {
                                  nextDigits[index + offset] = value;
                                });

                                updateQueryFromDigits(nextDigits);

                                const nextFocusIndex = Math.min(
                                  index + pastedDigits.length,
                                  personalCodeLength - 1,
                                );

                                inputRefs.current[nextFocusIndex]?.focus();
                              }}
                              className="h-[42px] w-[42px] shrink-0 rounded-[6px] border border-[hsl(214,28%,84%)] bg-white text-center text-[15px] font-medium text-[hsl(220,38%,24%)] outline-none transition focus:border-[hsl(216,46%,58%)] focus:ring-2 focus:ring-[rgba(59,130,246,0.12)]"
                              aria-label={`Personas koda cipars ${index + 1}`}
                            />

                            {showDivider && (
                              <span className="px-1 text-[17px] font-medium text-[hsl(218,14%,50%)]">
                                -
                              </span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <p
                      className={cn(
                        "mt-2.5 text-[12px]",
                        error
                          ? "font-medium text-[hsl(0,60%,48%)]"
                          : "text-[hsl(218,16%,52%)]",
                      )}
                    >
                      {error || "Ievadiet personas kodu"}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="h-[42px] w-full rounded-[6px] bg-[hsl(219,44%,19%)] px-5 text-[14px] font-medium text-white hover:bg-[hsl(219,44%,22%)] lg:mt-0.5 lg:w-auto lg:min-w-[200px]"
                  >
                    <UserPlus className="mr-2 h-4 w-4" strokeWidth={2.2} />
                    Pievienot pacientu
                  </Button>
                </div>
              </div>
            </form>
          </div>

          <div className={panelClass}>
            <div className="relative">
              <div className="flex items-center border-b border-[hsl(214,26%,90%)] px-5 py-3.5 sm:px-6 xl:px-7">
                <div className="flex items-center gap-3">
                  <p className={sectionLabelClass}>Šodienas pacienti</p>

                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[hsl(220,46%,96%)] px-1.5 text-[12px] font-semibold text-[hsl(220,48%,46%)]">
                    {entries.length}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[860px]">
                  <div
                    className={cn(
                      tableGridClass,
                      "border-b border-[hsl(214,26%,90%)] bg-[hsl(214,34%,98%)] px-6 py-2.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[hsl(218,16%,46%)] xl:px-7",
                    )}
                  >
                    <span>Pacients</span>
                    <span>Personas kods</span>
                    <span>Statuss</span>
                    <span className="pl-1">Progress</span>
                    <span className="text-center">Atjaunots</span>
                    <span>Darbības</span>
                  </div>

                  <div className="bg-white">
                    {entries.map((entry, index) => {
                      const patient = patientMap[entry.patientId];

                      if (!patient) return null;

                      const statusMeta = getStatusMeta(entry.status);

                      const progressValue =
                        entry.status === "error" ? 0 : entry.progress;

                      return (
                        <div
                          key={entry.patientId}
                          onClick={() =>
                            navigate("/components", {
                              state: { patient, layoutOrder },
                            })
                          }
                          className={cn(
                            tableGridClass,
                            "cursor-pointer px-6 py-2.5 text-[13px] transition hover:bg-[hsl(214,36%,98%)] xl:px-7",
                            index > 0 &&
                              "border-t border-[hsl(214,26%,91%)]",
                            entry.status === "error" &&
                              "bg-[linear-gradient(90deg,rgba(254,242,242,0.62),white_32%)]",
                          )}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-medium tracking-[-0.015em] text-[hsl(220,38%,20%)]">
                              {patient.name}
                            </p>
                          </div>

                          <span className="font-medium text-[hsl(218,15%,47%)]">
                            {patient.personalCode}
                          </span>

                          <span
                            className={cn(
                              "inline-flex w-fit items-center gap-1.5 rounded-[4px] border px-2 py-0.5 text-[11px] font-medium",
                              statusMeta.badgeClass,
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                statusMeta.dotClass,
                              )}
                            />
                            {statusMeta.label}
                          </span>

                          <div className="flex items-center gap-3 pr-2">
                            <div className="h-1 flex-1 overflow-hidden rounded-full bg-[hsl(216,28%,92%)]">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-[width]",
                                  statusMeta.progressClass,
                                )}
                                style={{ width: `${progressValue}%` }}
                              />
                            </div>

                            <span className="w-10 text-right text-[12px] font-medium text-[hsl(218,15%,47%)]">
                              {entry.status === "error"
                                ? "-"
                                : `${progressValue}%`}
                            </span>
                          </div>

                          <span className="text-center font-medium text-[hsl(218,15%,47%)]">
                            {entry.updatedAt ?? "-"}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRetry(entry.patientId);
                              }}
                              aria-label={`Atkārtot ${patient.name}`}
                              className="inline-flex h-7 w-7 items-center justify-center text-[hsl(216,44%,48%)] transition hover:opacity-75"
                            >
                              <RefreshCcw
                                className="h-[13px] w-[13px]"
                                strokeWidth={2}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRemove(entry.patientId);
                              }}
                              aria-label={`Noņemt ${patient.name}`}
                              className="inline-flex h-7 w-7 items-center justify-center text-[hsl(0,56%,50%)] transition hover:opacity-75"
                            >
                              <Trash2
                                className="h-[13px] w-[13px]"
                                strokeWidth={2}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
