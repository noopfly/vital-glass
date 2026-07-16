import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircleAlert, ClipboardCheck, Clock3, ListPlus } from "lucide-react";

import DashboardSidebar from "@/components/DashboardSidebar";
import { DayListDateNavigation } from "@/components/day-list/DayListDateNavigation";
import { DayListPatientForm } from "@/components/day-list/DayListPatientForm";
import { DayListPatientQueue } from "@/components/day-list/DayListPatientQueue";
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
import { type Patient } from "@/types/patient";

type DayListLocationState = {
  patient?: Patient;
  layoutOrder?: DashboardComponentKey[];
  specialtyId?: SpecialtyId;
};

const maxParallelPreloads = 2;
const estimatedMinutesPerPatient = 5;
const personalCodeLength = 11;
const pageBg = "bg-[hsl(210,32%,96%)]";

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("lv-LV", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatPersonalCode(raw: string) {
  const digits = raw.replace(/[^\d]/g, "").slice(0, personalCodeLength);
  return digits.length <= 6 ? digits : `${digits.slice(0, 6)}-${digits.slice(6)}`;
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

function formatWeekday(date: Date) {
  return capitalize(new Intl.DateTimeFormat("lv-LV", { weekday: "long" }).format(date));
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
        badgeClass: "border-[hsl(151,35%,88%)] bg-[hsl(151,42%,94%)] text-[hsl(154,44%,31%)]",
        dotClass: "bg-[hsl(154,48%,40%)]",
        progressClass: "bg-[hsl(220,36%,18%)]",
      };
    case "loading":
      return {
        label: "Notiek",
        badgeClass: "border-[hsl(216,42%,88%)] bg-[hsl(216,48%,95%)] text-[hsl(217,42%,38%)]",
        dotClass: "bg-[hsl(216,48%,50%)]",
        progressClass: "bg-[hsl(220,36%,18%)]",
      };
    case "waiting":
      return {
        label: "Rindā",
        badgeClass: "border-[hsl(42,44%,86%)] bg-[hsl(42,62%,95%)] text-[hsl(36,48%,36%)]",
        dotClass: "bg-[hsl(38,62%,48%)]",
        progressClass: "bg-[hsl(38,62%,50%)]",
      };
    case "error":
      return {
        label: "Kļūda",
        badgeClass: "border-[hsl(0,54%,89%)] bg-[hsl(0,68%,97%)] text-[hsl(0,58%,48%)]",
        dotClass: "bg-[hsl(0,58%,50%)]",
        progressClass: "bg-[hsl(0,58%,50%)]",
      };
  }
}

function createQueuedEntry(patientId: string): DayListEntry {
  return { patientId, status: "waiting", progress: 0, updatedAt: null, attempts: 0 };
}

export default function DayListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as DayListLocationState | undefined;
  const specialtyId = routeState?.specialtyId ?? readStoredDashboardSpecialty();
  const activePatient = routeState?.patient ?? readStoredLastViewedPatient(patients) ?? patients[0];
  const todayKey = React.useMemo(() => formatDayListDateKey(new Date()), []);
  const [selectedDateKey, setSelectedDateKey] = React.useState(todayKey);
  const [layoutOrder, setLayoutOrder] = React.useState<DashboardComponentKey[]>(() =>
    filterDashboardLayoutOrderBySpecialty(
      normalizeDashboardLayoutOrder(routeState?.layoutOrder ?? readStoredDashboardLayoutOrder()),
      specialtyId,
    ),
  );
  const [codeQuery, setCodeQuery] = React.useState("");
  const [error, setError] = React.useState("");
  const [dayListsByDate, setDayListsByDate] = React.useState<DayListEntriesByDate>(() =>
    readStoredDayLists(todayKey),
  );

  const selectedDate = React.useMemo(() => parseDateKey(selectedDateKey), [selectedDateKey]);
  const previousDate = React.useMemo(() => addCalendarDays(selectedDate, -1), [selectedDate]);
  const nextDate = React.useMemo(() => addCalendarDays(selectedDate, 1), [selectedDate]);
  const entries = React.useMemo(() => dayListsByDate[selectedDateKey] ?? [], [dayListsByDate, selectedDateKey]);
  const patientMap = React.useMemo(
    () => Object.fromEntries(patients.map((patient) => [patient.id, patient])) as Record<string, Patient>,
    [],
  );
  const queuedPatientIds = React.useMemo(() => new Set(entries.map((entry) => entry.patientId)), [entries]);
  const recentPatients = React.useMemo(
    () => [activePatient, ...patients.filter((patient) => patient.id !== activePatient.id)]
      .filter((patient, index, all) => all.findIndex((item) => item.id === patient.id) === index)
      .slice(0, 5),
    [activePatient],
  );

  React.useEffect(() => { writeStoredLastViewedPatientId(activePatient.id); }, [activePatient]);
  React.useEffect(() => {
    setLayoutOrder(filterDashboardLayoutOrderBySpecialty(
      normalizeDashboardLayoutOrder(routeState?.layoutOrder ?? readStoredDashboardLayoutOrder()), specialtyId,
    ));
  }, [routeState?.layoutOrder, specialtyId]);
  React.useEffect(() => { setError(""); }, [selectedDateKey]);
  React.useEffect(() => { writeStoredDayLists(dayListsByDate); }, [dayListsByDate]);

  React.useEffect(() => {
    setDayListsByDate((current) => {
      const currentEntries = current[selectedDateKey] ?? [];
      let freeSlots = maxParallelPreloads - currentEntries.filter((entry) => entry.status === "loading").length;
      if (freeSlots <= 0) return current;
      let changed = false;
      const nextEntries = currentEntries.map((entry) => {
        if (entry.status !== "waiting" || freeSlots <= 0) return entry;
        freeSlots -= 1;
        changed = true;
        return { ...entry, status: "loading" as const, progress: Math.max(entry.progress, 12), attempts: entry.attempts + 1 };
      });
      return changed ? { ...current, [selectedDateKey]: nextEntries } : current;
    });
  }, [entries, selectedDateKey]);

  React.useEffect(() => {
    if (!entries.some((entry) => entry.status === "loading")) return undefined;
    const intervalId = window.setInterval(() => {
      setDayListsByDate((current) => {
        const currentEntries = current[selectedDateKey] ?? [];
        let changed = false;
        const nextEntries = currentEntries.map((entry) => {
          if (entry.status !== "loading") return entry;
          const increment = 8 + ((Number(entry.patientId) * 3 + entry.progress) % 11);
          const progress = Math.min(100, entry.progress + increment);
          changed = true;
          return progress >= 100
            ? { ...entry, status: "ready" as const, progress: 100, updatedAt: formatClock(new Date()) }
            : { ...entry, progress };
        });
        return changed ? { ...current, [selectedDateKey]: nextEntries } : current;
      });
    }, 900);
    return () => window.clearInterval(intervalId);
  }, [entries, selectedDateKey]);

  const stats = React.useMemo(() => {
    const ready = entries.filter((entry) => entry.status === "ready").length;
    const remaining = entries.filter((entry) => entry.status === "loading" || entry.status === "waiting").length;
    const errorCount = entries.filter((entry) => entry.status === "error").length;
    return {
      ready,
      estimatedMinutes: remaining === 0 ? 0 : Math.ceil(remaining / maxParallelPreloads) * estimatedMinutesPerPatient,
      errorCount,
    };
  }, [entries]);

  const updateEntriesForSelectedDate = React.useCallback((updater: (items: DayListEntry[]) => DayListEntry[]) => {
    setDayListsByDate((current) => ({ ...current, [selectedDateKey]: updater(current[selectedDateKey] ?? []) }));
  }, [selectedDateKey]);

  const addPatientToSelectedDate = React.useCallback((patient: Patient) => {
    if (queuedPatientIds.has(patient.id)) {
      setError("Šis pacients jau ir pievienots šīs dienas sarakstam.");
      return;
    }
    updateEntriesForSelectedDate((current) => [createQueuedEntry(patient.id), ...current]);
    setCodeQuery("");
    setError("");
  }, [queuedPatientIds, updateEntriesForSelectedDate]);

  const handleAddPatientByCode = () => {
    const trimmedQuery = codeQuery.trim();
    const queryDigits = getPersonalCodeDigits(trimmedQuery);
    if (!trimmedQuery) return setError("Ievadiet personas kodu.");
    if (queryDigits.length < personalCodeLength) return setError("Ievadiet pilnu pacienta personas kodu.");
    const patient = patients.find((item) => getPersonalCodeDigits(item.personalCode) === queryDigits);
    if (!patient) return setError("Pacients netika atrasts.");
    addPatientToSelectedDate(patient);
  };

  const handleRetry = (patientId: string) => updateEntriesForSelectedDate((current) =>
    current.map((entry) => entry.patientId === patientId
      ? { ...entry, status: "waiting", progress: 0, updatedAt: null }
      : entry),
  );
  const handleRemove = (patientId: string) => updateEntriesForSelectedDate((current) =>
    current.filter((entry) => entry.patientId !== patientId),
  );

  const dayStatusItems = [
    { icon: ClipboardCheck, label: "Gatavi", value: `${stats.ready} / ${entries.length}`, valueClass: "text-[hsl(220,56%,46%)]" },
    { icon: Clock3, label: "Atlikušais laiks", value: `~ ${stats.estimatedMinutes} min`, valueClass: "text-[hsl(220,42%,18%)]" },
    { icon: CircleAlert, label: "Kļūdas", value: `${stats.errorCount}`, valueClass: stats.errorCount > 0 ? "text-[hsl(0,62%,50%)]" : "text-[hsl(218,18%,42%)]" },
  ];
  const navigationDays = [previousDate, selectedDate, nextDate].map((date, index) => {
    const dateKey = formatDayListDateKey(date);
    return {
      dateKey,
      dateLabel: formatNumericDate(date),
      dayLabel: getRelativeDayLabel(dateKey, todayKey),
      entryCount: dayListsByDate[dateKey]?.length ?? 0,
      position: (index === 0 ? "previous" : index === 1 ? "selected" : "next") as "previous" | "selected" | "next",
    };
  });

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

      <div className="transition-[padding-left] duration-300 lg:pl-[var(--dashboard-sidebar-width,280px)]">
        <header className="sticky top-0 z-40 border-b border-[hsl(214,22%,88%)] bg-[rgba(255,255,255,0.97)] backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-5 py-4 md:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[hsl(220,22%,94%)] text-[hsl(221,46%,22%)] sm:flex">
                <ListPlus className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 pl-14 sm:pl-0">
                <h1 className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-[hsl(222,28%,16%)]">Dienas saraksts</h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm leading-5 text-[hsl(220,16%,52%)]">
                  <span>{registeredDoctorAccount.name}</span>
                </p>
              </div>
            </div>
            <div className="hidden overflow-hidden rounded-md border border-[hsl(214,22%,88%)] bg-white lg:grid lg:grid-cols-3">
              {dayStatusItems.map(({ icon: Icon, label, value, valueClass }) => (
                <div key={label} className="flex min-w-[142px] flex-col justify-center border-l border-[hsl(214,22%,90%)] px-4 py-2.5 first:border-l-0">
                  <div className="flex items-center gap-1.5 text-[hsl(218,17%,48%)]">
                    <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                    <span className="text-xs font-semibold leading-4">{label}</span>
                  </div>
                  <p className={cn("mt-1 text-lg font-semibold leading-none tracking-[-0.04em] tabular-nums", valueClass)}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <main className="min-h-screen px-4 py-6 sm:px-5 md:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5">
            <DayListDateNavigation
              days={navigationDays}
              onSelectDay={setSelectedDateKey}
            />
            <DayListPatientForm
              codeQuery={codeQuery}
              error={error}
              onCodeChange={(value) => {
                setCodeQuery(formatPersonalCode(value));
                if (error) setError("");
              }}
              onSubmit={handleAddPatientByCode}
            />
            <DayListPatientQueue
              entries={entries}
              selectedDateKey={selectedDateKey}
              patientMap={patientMap}
              getStatusMeta={getStatusMeta}
              onOpenPatient={(patient) => navigate("/clinical-dashboard", { state: { patient, layoutOrder, specialtyId } })}
              onRetry={handleRetry}
              onRemove={handleRemove}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
