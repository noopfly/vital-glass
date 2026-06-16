import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
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
  type DayListEntry,
  type DayListEntriesByDate,
  formatDayListDateKey,
  readStoredDayLists,
  writeStoredDayLists,
} from "@/lib/day-list";
import { registeredDoctorAccount } from "@/lib/doctor-account";
import {
  filterDashboardLayoutOrderBySpecialty,
  normalizeDashboardLayoutOrder,
  readStoredDashboardLayoutOrder,
  type DashboardComponentKey,
} from "@/lib/dashboard-layout";
import {
  readStoredLastViewedPatient,
  writeStoredLastViewedPatientId,
} from "@/lib/last-viewed-patient";
import {
  readStoredDashboardSpecialty,
  type SpecialtyId,
} from "@/lib/specialties";
import { cn } from "@/lib/utils";
import { Patient } from "@/types/patient";

type DayListLocationState = {
  patient?: Patient;
  layoutOrder?: DashboardComponentKey[];
  specialtyId?: SpecialtyId;
};

const maxParallelPreloads = 2;
const estimatedMinutesPerPatient = 5;
const personalCodeGroupSizes = [6, 5] as const;
const personalCodeLength =
  personalCodeGroupSizes[0] + personalCodeGroupSizes[1];

const pageBg = "bg-[hsl(214,34%,97%)]";

const panelClass =
  "relative overflow-hidden rounded-[18px] border border-[hsl(214,28%,88%)] bg-white shadow-[0_18px_42px_rgba(29,53,87,0.05)]";

const sectionLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.15em] text-[hsl(218,22%,42%)]";

const tableGridClass =
  "grid min-w-[920px] grid-cols-[1.55fr_1.15fr_0.9fr_1.45fr_0.8fr_0.85fr] items-center gap-4";

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("lv-LV", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatPersonalCode(raw: string) {
  const digits = raw.replace(/[^\d]/g, "").slice(0, personalCodeLength);

  if (digits.length <= personalCodeGroupSizes[0]) {
    return digits;
  }

  return `${digits.slice(0, personalCodeGroupSizes[0])}-${digits.slice(
    personalCodeGroupSizes[0],
  )}`;
}

function getPersonalCodeDigits(raw: string) {
  return raw.replace(/[^\d]/g, "").slice(0, personalCodeLength);
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addCalendarDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getDayNumber(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

function formatNumericDate(date: Date) {
  return new Intl.DateTimeFormat("lv-LV", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatMonthDate(date: Date) {
  return capitalize(
    new Intl.DateTimeFormat("lv-LV", {
      day: "numeric",
      month: "long",
    }).format(date),
  );
}

function formatWeekday(date: Date) {
  return capitalize(
    new Intl.DateTimeFormat("lv-LV", {
      weekday: "long",
    }).format(date),
  );
}

function getRelativeDayLabel(dateKey: string, todayKey: string) {
  const difference = getDayNumber(dateKey) - getDayNumber(todayKey);

  if (difference === -1) return "Vakar";
  if (difference === 0) return "Šodiena";
  if (difference === 1) return "Rīt";

  return formatWeekday(parseDateKey(dateKey));
}

function getStatusMeta(status: DayListEntry["status"]) {
  switch (status) {
    case "ready":
      return {
        label: "Gatavs",
        badgeClass:
          "border-[hsl(151,35%,88%)] bg-[hsl(151,42%,94%)] text-[hsl(154,44%,31%)]",
        dotClass: "bg-[hsl(154,48%,40%)]",
        progressClass: "bg-[hsl(216,62%,56%)]",
      };
    case "loading":
      return {
        label: "Notiek",
        badgeClass:
          "border-[hsl(216,42%,88%)] bg-[hsl(216,48%,95%)] text-[hsl(217,42%,38%)]",
        dotClass: "bg-[hsl(216,48%,50%)]",
        progressClass: "bg-[hsl(216,62%,56%)]",
      };
    case "waiting":
      return {
        label: "Rindā",
        badgeClass:
          "border-[hsl(42,44%,86%)] bg-[hsl(42,62%,95%)] text-[hsl(36,48%,36%)]",
        dotClass: "bg-[hsl(38,62%,48%)]",
        progressClass: "bg-[hsl(38,62%,50%)]",
      };
    case "error":
      return {
        label: "Kļūda",
        badgeClass:
          "border-[hsl(0,54%,89%)] bg-[hsl(0,68%,97%)] text-[hsl(0,58%,48%)]",
        dotClass: "bg-[hsl(0,58%,50%)]",
        progressClass: "bg-[hsl(0,58%,50%)]",
      };
  }
}

function createQueuedEntry(patientId: string): DayListEntry {
  return {
    patientId,
    status: "waiting",
    progress: 0,
    updatedAt: null,
    attempts: 0,
  };
}

export default function DayListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as DayListLocationState | undefined;
  const specialtyId = routeState?.specialtyId ?? readStoredDashboardSpecialty();

  const activePatient =
    routeState?.patient ?? readStoredLastViewedPatient(patients) ?? patients[0];

  const todayKey = React.useMemo(() => formatDayListDateKey(new Date()), []);
  const [selectedDateKey, setSelectedDateKey] = React.useState(todayKey);

  const [layoutOrder, setLayoutOrder] = React.useState<DashboardComponentKey[]>(
    () =>
      filterDashboardLayoutOrderBySpecialty(
        normalizeDashboardLayoutOrder(
          routeState?.layoutOrder ?? readStoredDashboardLayoutOrder(),
        ),
        specialtyId,
      ),
  );

  const [codeQuery, setCodeQuery] = React.useState("");
  const [error, setError] = React.useState("");
  const [dayListsByDate, setDayListsByDate] =
    React.useState<DayListEntriesByDate>(() => readStoredDayLists(todayKey));

  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const selectedDate = React.useMemo(
    () => parseDateKey(selectedDateKey),
    [selectedDateKey],
  );

  const previousDate = React.useMemo(
    () => addCalendarDays(selectedDate, -1),
    [selectedDate],
  );

  const nextDate = React.useMemo(
    () => addCalendarDays(selectedDate, 1),
    [selectedDate],
  );

  const entries = React.useMemo(
    () => dayListsByDate[selectedDateKey] ?? [],
    [dayListsByDate, selectedDateKey],
  );

  const patientMap = React.useMemo(
    () =>
      Object.fromEntries(
        patients.map((patient) => [patient.id, patient]),
      ) as Record<string, Patient>,
    [],
  );

  const queuedPatientIds = React.useMemo(
    () => new Set(entries.map((entry) => entry.patientId)),
    [entries],
  );

  const recentPatients = React.useMemo(
    () =>
      [
        activePatient,
        ...patients.filter((patient) => patient.id !== activePatient.id),
      ]
        .filter((patient, index, array) => {
          return array.findIndex((item) => item.id === patient.id) === index;
        })
        .slice(0, 5),
    [activePatient],
  );

  const personalCodeDigits = React.useMemo(() => {
    const digits = getPersonalCodeDigits(codeQuery).split("");

    return Array.from(
      { length: personalCodeLength },
      (_, index) => digits[index] ?? "",
    );
  }, [codeQuery]);

  React.useEffect(() => {
    writeStoredLastViewedPatientId(activePatient.id);
  }, [activePatient]);

  React.useEffect(() => {
    setLayoutOrder(
      filterDashboardLayoutOrderBySpecialty(
        normalizeDashboardLayoutOrder(
          routeState?.layoutOrder ?? readStoredDashboardLayoutOrder(),
        ),
        specialtyId,
      ),
    );
  }, [routeState?.layoutOrder, specialtyId]);

  React.useEffect(() => {
    setError("");
  }, [selectedDateKey]);

  React.useEffect(() => {
    writeStoredDayLists(dayListsByDate);
  }, [dayListsByDate]);

  React.useEffect(() => {
    setDayListsByDate((current) => {
      const currentEntries = current[selectedDateKey] ?? [];
      const loadingCount = currentEntries.filter(
        (entry) => entry.status === "loading",
      ).length;

      let freeSlots = maxParallelPreloads - loadingCount;

      if (freeSlots <= 0) {
        return current;
      }

      let changed = false;

      const nextEntries = currentEntries.map((entry) => {
        if (entry.status !== "waiting" || freeSlots <= 0) {
          return entry;
        }

        freeSlots -= 1;
        changed = true;

        return {
          ...entry,
          status: "loading" as const,
          progress: Math.max(entry.progress, 12),
          attempts: entry.attempts + 1,
        };
      });

      if (!changed) {
        return current;
      }

      return {
        ...current,
        [selectedDateKey]: nextEntries,
      };
    });
  }, [entries, selectedDateKey]);

  React.useEffect(() => {
    if (!entries.some((entry) => entry.status === "loading")) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setDayListsByDate((current) => {
        const currentEntries = current[selectedDateKey] ?? [];
        let changed = false;

        const nextEntries = currentEntries.map((entry) => {
          if (entry.status !== "loading") {
            return entry;
          }

          const increment =
            8 + ((Number(entry.patientId) * 3 + entry.progress) % 11);
          const nextProgress = Math.min(100, entry.progress + increment);

          changed = true;

          if (nextProgress >= 100) {
            return {
              ...entry,
              status: "ready" as const,
              progress: 100,
              updatedAt: formatClock(new Date()),
            };
          }

          return {
            ...entry,
            progress: nextProgress,
          };
        });

        if (!changed) {
          return current;
        }

        return {
          ...current,
          [selectedDateKey]: nextEntries,
        };
      });
    }, 900);

    return () => window.clearInterval(intervalId);
  }, [entries, selectedDateKey]);

  const stats = React.useMemo(() => {
    const ready = entries.filter((entry) => entry.status === "ready").length;
    const loading = entries.filter(
      (entry) => entry.status === "loading",
    ).length;
    const waiting = entries.filter(
      (entry) => entry.status === "waiting",
    ).length;
    const errorCount = entries.filter(
      (entry) => entry.status === "error",
    ).length;
    const remaining = loading + waiting;

    return {
      ready,
      remaining,
      estimatedMinutes:
        remaining === 0
          ? 0
          : Math.ceil(remaining / maxParallelPreloads) *
            estimatedMinutesPerPatient,
      errorCount,
    };
  }, [entries]);

  const updateCodeQueryFromDigits = React.useCallback(
    (nextDigits: string[]) => {
      setCodeQuery(formatPersonalCode(nextDigits.join("")));
      if (error) {
        setError("");
      }
    },
    [error],
  );

  const updateEntriesForSelectedDate = React.useCallback(
    (updater: (entries: DayListEntry[]) => DayListEntry[]) => {
      setDayListsByDate((current) => ({
        ...current,
        [selectedDateKey]: updater(current[selectedDateKey] ?? []),
      }));
    },
    [selectedDateKey],
  );

  const addPatientToSelectedDate = React.useCallback(
    (patient: Patient) => {
      if (queuedPatientIds.has(patient.id)) {
        setError("Šis pacients jau ir pievienots šīs dienas sarakstam.");
        return;
      }

      updateEntriesForSelectedDate((current) => [
        createQueuedEntry(patient.id),
        ...current,
      ]);

      setCodeQuery("");
      setError("");
    },
    [queuedPatientIds, updateEntriesForSelectedDate],
  );

  const handleAddPatientByCode = () => {
    const trimmedQuery = codeQuery.trim();
    const queryDigits = getPersonalCodeDigits(trimmedQuery);

    if (!trimmedQuery) {
      setError("Ievadiet personas kodu.");
      return;
    }

    if (queryDigits.length < personalCodeLength) {
      setError("Ievadiet pilnu pacienta personas kodu.");
      return;
    }

    const patient = patients.find(
      (item) => getPersonalCodeDigits(item.personalCode) === queryDigits,
    );

    if (!patient) {
      setError("Pacients netika atrasts.");
      return;
    }

    addPatientToSelectedDate(patient);
  };

  const handleRetry = (patientId: string) => {
    updateEntriesForSelectedDate((current) =>
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
    updateEntriesForSelectedDate((current) =>
      current.filter((entry) => entry.patientId !== patientId),
    );
  };

  const headerDayLabel = getRelativeDayLabel(selectedDateKey, todayKey);

  return (
    <div className={cn("min-h-screen overflow-y-auto", pageBg)}>
      <DashboardSidebar
        activePatient={activePatient}
        recentPatients={recentPatients}
        allPatients={patients}
        currentView="day-list"
        dayListCount={entries.length}
        layoutOrder={layoutOrder}
        specialtyId={specialtyId}
        onSaveLayoutOrder={setLayoutOrder}
      />

      <main className="min-h-screen px-4 py-4 sm:px-5 lg:pl-[calc(var(--dashboard-sidebar-width,280px)+24px)] lg:pr-6 lg:pt-6">
        <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-4">
          <header className="px-1 pb-2 pt-1 sm:px-0">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(500px,600px)] lg:items-start">
              <div className="flex min-w-0 flex-col justify-center">
                <h1 className="max-w-[700px] text-[28px] font-semibold leading-[1.05] tracking-[-0.05em] text-[hsl(217,40%,18%)] sm:text-[34px] xl:text-[38px]">
                  {registeredDoctorAccount.name} dienas saraksts
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-[15px] font-semibold text-[hsl(220,58%,52%)] md:text-[16px]">
                  <span>{headerDayLabel}</span>
                  <span className="text-[hsl(217,18%,64%)]">·</span>
                  <span>{formatNumericDate(selectedDate)}</span>
                  <CalendarDays className="h-4 w-4 text-[hsl(217,18%,64%)]" />
                </div>

                <p className="mt-3 max-w-[620px] text-[14px] leading-6 text-[hsl(214,18%,44%)] md:text-[15px]">
                  Pievienojiet šīs dienas pacientus, lai dati būtu gatavi pirms
                  vizītes.
                </p>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-3 lg:self-start">
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
                    className="flex min-h-[72px] flex-col justify-between rounded-[14px] border border-[rgba(214,223,231,0.82)] px-3.5 py-3"
                  >
                    <div className="flex items-center gap-2 text-[hsl(218,17%,48%)]">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(220,46%,96%)]">
                        <Icon className="h-[15px] w-[15px]" strokeWidth={2} />
                      </span>
                      <span className="text-[10px] font-semibold uppercase leading-tight tracking-[0.14em]">
                        {label}
                      </span>
                    </div>

                    <div className="mt-2">
                      <p
                        className={cn(
                          "text-[20px] font-semibold leading-none tracking-[-0.04em]",
                          valueClass,
                        )}
                      >
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </header>

          <div className={cn(panelClass, "overflow-hidden")}>
            <section className="px-4 py-4 sm:px-5 xl:px-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className={sectionLabelClass}>Dienas izvēle</p>
                <span className="rounded-full bg-[hsl(220,46%,96%)] px-3 py-1 text-[11px] font-medium text-[hsl(220,48%,46%)]">
                  Saraksts: {formatMonthDate(selectedDate)}
                </span>
              </div>
              <div className="grid gap-2.5 md:grid-cols-[1fr_1.08fr_1fr]">
                {[
                  {
                    date: previousDate,
                    label: getRelativeDayLabel(
                      formatDayListDateKey(previousDate),
                      todayKey,
                    ),
                    icon: ChevronLeft,
                    iconPlacement: "left" as const,
                    action: () =>
                      setSelectedDateKey(formatDayListDateKey(previousDate)),
                    active: false,
                  },
                  {
                    date: selectedDate,
                    label: headerDayLabel,
                    icon: CalendarDays,
                    iconPlacement: "left" as const,
                    action: () =>
                      setSelectedDateKey(formatDayListDateKey(selectedDate)),
                    active: true,
                  },
                  {
                    date: nextDate,
                    label: getRelativeDayLabel(
                      formatDayListDateKey(nextDate),
                      todayKey,
                    ),
                    icon: ChevronRight,
                    iconPlacement: "right" as const,
                    action: () =>
                      setSelectedDateKey(formatDayListDateKey(nextDate)),
                    active: false,
                  },
                ].map(
                  ({
                    date,
                    label,
                    icon: Icon,
                    action,
                    active,
                    iconPlacement,
                  }) => {
                    const dateKey = formatDayListDateKey(date);
                    const dayEntryCount = dayListsByDate[dateKey]?.length ?? 0;
                   
                    return (
                      <button
                        key={`${label}-${dateKey}`}
                        type="button"
                        onClick={action}
                        className={cn(
                          "flex min-h-[74px] items-center justify-between gap-3 rounded-[12px] border px-3.5 py-2.5 text-left transition",
                          active
                            ? "border-[hsl(220,36%,18%)] bg-[linear-gradient(180deg,hsl(220,36%,18%),hsl(218,34%,24%))] text-white shadow-[0_16px_30px_rgba(29,53,87,0.18)]"
                            : "border-[rgba(214,223,231,0.82)] bg-white text-[hsl(218,30%,24%)] hover:border-[rgba(189,202,215,0.96)] hover:bg-[hsl(214,28%,98%)]",
                        )}
                      >
                        {iconPlacement !== "right" && (
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]",
                              active
                                ? "bg-[rgba(255,255,255,0.1)]"
                                : "bg-[hsl(214,24%,96%)] text-[hsl(217,22%,42%)]",
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-[10px] font-semibold uppercase tracking-[0.08em]",
                              active
                                ? "text-[rgba(255,255,255,0.88)]"
                                : "text-[hsl(214,14%,44%)]",
                            )}
                          >
                            {label}
                          </p>
                          <p className="mt-0.5 text-[15px] font-semibold tracking-[-0.03em] md:text-[16px]">
                            {formatNumericDate(date)}
                          </p>
                          <p
                            className={cn(
                              "mt-1 text-[12px] font-medium",
                              active
                                ? "text-[rgba(255,255,255,0.7)]"
                                : "text-[hsl(214,15%,52%)]",
                            )}
                          >
                          </p>
                        </div>

                        {iconPlacement === "right" && (
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]",
                              active
                                ? "bg-[rgba(255,255,255,0.1)]"
                                : "bg-[hsl(214,24%,96%)] text-[hsl(217,22%,42%)]",
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            </section>

            <form
              className="relative flex flex-col gap-4 border-t border-[hsl(214,26%,90%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.55))] px-4 py-4 sm:px-5 xl:px-6"
              onSubmit={(event) => {
                event.preventDefault();
                handleAddPatientByCode();
              }}
            >
              <div className="min-w-0">
                <p className={sectionLabelClass}>Pievienot pacientu</p>

                <div className="mt-3 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
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
                                updateCodeQueryFromDigits(nextDigits);

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
                                    updateCodeQueryFromDigits(nextDigits);
                                    return;
                                  }

                                  if (index > 0) {
                                    nextDigits[index - 1] = "";
                                    updateCodeQueryFromDigits(nextDigits);
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

                                updateCodeQueryFromDigits(nextDigits);

                                const nextFocusIndex = Math.min(
                                  index + pastedDigits.length,
                                  personalCodeLength - 1,
                                );

                                inputRefs.current[nextFocusIndex]?.focus();
                              }}
                              className="h-[36px] w-[36px] shrink-0 rounded-[6px] border border-[hsl(214,28%,84%)] bg-white text-center text-[14px] font-medium text-[hsl(220,38%,24%)] outline-none transition focus:border-[hsl(216,46%,58%)] focus:ring-2 focus:ring-[rgba(59,130,246,0.12)]"
                              aria-label={`Personas koda cipars ${index + 1}`}
                            />

                            {showDivider && (
                              <span className="px-1 text-[15px] font-medium text-[hsl(218,14%,50%)]">
                                -
                              </span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <p
                      className={cn(
                        "mt-2 text-[11px]",
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
                    className="h-[38px] w-full rounded-[6px] bg-[hsl(219,44%,19%)] px-4 text-[13px] font-medium text-white hover:bg-[hsl(219,44%,22%)] lg:mt-0.5 lg:w-auto lg:min-w-[180px]"
                  >
                    <UserPlus className="mr-2 h-3.5 w-3.5" strokeWidth={2.2} />
                    Pievienot pacientu
                  </Button>
                </div>
              </div>
            </form>

            <section className="relative border-t border-[hsl(214,26%,90%)] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(214,26%,90%)] px-5 py-4 sm:px-6 xl:px-7">
                <div className="flex items-center gap-3">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[hsl(218,18%,36%)]">
                    Pacienti {formatMonthDate(selectedDate)}
                  </p>

                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[hsl(220,46%,96%)] px-2 text-[12px] font-semibold text-[hsl(220,48%,46%)]">
                    {entries.length}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[920px]">
                  <div
                    className={cn(
                      tableGridClass,
                      "border-b border-[hsl(214,26%,90%)] bg-[hsl(214,34%,98%)] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(218,16%,46%)] xl:px-7",
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
                    {entries.length === 0 ? (
                      <div className="px-6 py-12 text-center xl:px-7">
                        <div className="mx-auto max-w-[520px]">
                          <p className="text-[20px] font-semibold tracking-[-0.03em] text-[hsl(219,30%,22%)]">
                            Šī diena pagaidām ir tukša
                          </p>
                          <p className="mt-3 text-[14px] leading-6 text-[hsl(214,16%,48%)]">
                            Pievienojiet pacientus ar personas kodu.
                          </p>
                        </div>
                      </div>
                    ) : (
                      entries.map((entry, index) => {
                        const patient = patientMap[entry.patientId];

                        if (!patient) {
                          return null;
                        }

                        const statusMeta = getStatusMeta(entry.status);
                        const progressValue =
                          entry.status === "error" ? 0 : entry.progress;

                        return (
                          <div
                            key={`${selectedDateKey}-${entry.patientId}`}
                            onClick={() =>
                              navigate("/components", {
                                state: { patient, layoutOrder, specialtyId },
                              })
                            }
                            className={cn(
                              tableGridClass,
                              "cursor-pointer px-6 py-3 text-[13px] transition hover:bg-[hsl(214,36%,98%)] xl:px-7",
                              index > 0 && "border-t border-[hsl(214,26%,91%)]",
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
                                "inline-flex w-fit items-center gap-1.5 rounded-[6px] border px-2.5 py-1 text-[11px] font-medium",
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
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(216,28%,92%)]">
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
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[hsl(216,44%,48%)] transition hover:bg-[hsl(214,28%,96%)]"
                              >
                                <RefreshCcw
                                  className="h-[14px] w-[14px]"
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
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[hsl(0,56%,50%)] transition hover:bg-[hsl(0,72%,98%)]"
                              >
                                <Trash2
                                  className="h-[14px] w-[14px]"
                                  strokeWidth={2}
                                />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
