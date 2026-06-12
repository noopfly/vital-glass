export type QueueStatus = "ready" | "loading" | "waiting" | "error";

export type DayListEntry = {
  patientId: string;
  status: QueueStatus;
  progress: number;
  updatedAt: string | null;
  attempts: number;
};

export type DayListEntriesByDate = Record<string, DayListEntry[]>;

export const dayListStorageKey = "omnis-day-list-by-date";

const validStatuses = new Set<QueueStatus>([
  "ready",
  "loading",
  "waiting",
  "error",
]);

export function createSeedDayListEntries(): DayListEntry[] {
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

export function formatDayListDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDayListEntry(value: unknown): DayListEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const entry = value as Partial<DayListEntry>;

  if (
    typeof entry.patientId !== "string" ||
    !validStatuses.has(entry.status as QueueStatus)
  ) {
    return null;
  }

  return {
    patientId: entry.patientId,
    status: entry.status as QueueStatus,
    progress:
      typeof entry.progress === "number" && Number.isFinite(entry.progress)
        ? Math.max(0, Math.min(100, Math.round(entry.progress)))
        : 0,
    updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : null,
    attempts:
      typeof entry.attempts === "number" && Number.isFinite(entry.attempts)
        ? Math.max(0, Math.round(entry.attempts))
        : 0,
  };
}

export function normalizeDayListEntries(value: unknown): DayListEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => normalizeDayListEntry(entry))
    .filter((entry): entry is DayListEntry => Boolean(entry));
}

export function resolveDayListEntriesForDate(
  dayLists: DayListEntriesByDate,
  dateKey: string,
  todayKey: string,
) {
  if (dateKey in dayLists) {
    return normalizeDayListEntries(dayLists[dateKey]);
  }

  return dateKey === todayKey ? createSeedDayListEntries() : [];
}

export function readStoredDayLists(
  todayKey = formatDayListDateKey(new Date()),
): DayListEntriesByDate {
  const fallback = { [todayKey]: createSeedDayListEntries() };

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(dayListStorageKey);

    if (!rawValue) {
      return fallback;
    }

    const parsed = JSON.parse(rawValue);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return fallback;
    }

    const normalized = Object.fromEntries(
      Object.entries(parsed).map(([dateKey, entries]) => [
        dateKey,
        normalizeDayListEntries(entries),
      ]),
    ) as DayListEntriesByDate;

    if (!(todayKey in normalized)) {
      normalized[todayKey] = createSeedDayListEntries();
    }

    return normalized;
  } catch {
    return fallback;
  }
}

export function writeStoredDayLists(dayLists: DayListEntriesByDate) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(dayListStorageKey, JSON.stringify(dayLists));
}
