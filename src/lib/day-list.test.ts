import { beforeEach, describe, expect, it } from "vitest";

import {
  createSeedDayListEntries,
  formatDayListDateKey,
  normalizeDayListEntries,
  readStoredDayLists,
  resolveDayListEntriesForDate,
} from "@/lib/day-list";

describe("day list storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("formats calendar dates as stable local keys", () => {
    expect(formatDayListDateKey(new Date(2026, 5, 12))).toBe("2026-06-12");
  });

  it("seeds only today when a day has not been stored yet", () => {
    const todaySeed = resolveDayListEntriesForDate({}, "2026-06-12", "2026-06-12");
    const otherDay = resolveDayListEntriesForDate({}, "2026-06-13", "2026-06-12");

    expect(todaySeed).toEqual(createSeedDayListEntries());
    expect(otherDay).toEqual([]);
  });

  it("normalizes invalid stored entries out of the schedule", () => {
    expect(
      normalizeDayListEntries([
        {
          patientId: "1",
          status: "ready",
          progress: 100,
          updatedAt: "07:00",
          attempts: 1,
        },
        {
          patientId: "2",
          status: "unknown",
          progress: 40,
          updatedAt: null,
          attempts: 0,
        },
      ]),
    ).toEqual([
      {
        patientId: "1",
        status: "ready",
        progress: 100,
        updatedAt: "07:00",
        attempts: 1,
      },
    ]);
  });

  it("restores stored days and adds today if it is missing", () => {
    window.localStorage.setItem(
      "omnis-day-list-by-date",
      JSON.stringify({
        "2026-06-13": [
          {
            patientId: "8",
            status: "waiting",
            progress: 0,
            updatedAt: null,
            attempts: 0,
          },
        ],
      }),
    );

    expect(readStoredDayLists("2026-06-12")).toEqual({
      "2026-06-13": [
        {
          patientId: "8",
          status: "waiting",
          progress: 0,
          updatedAt: null,
          attempts: 0,
        },
      ],
      "2026-06-12": createSeedDayListEntries(),
    });
  });
});
