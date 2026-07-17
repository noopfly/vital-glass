import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type DayOption = {
  dateKey: string;
  dateLabel: string;
  dayLabel: string;
  entryCount: number;
  position: "previous" | "selected" | "next";
};

type DayListDateNavigationProps = {
  days: DayOption[];
  onSelectDay: (dateKey: string) => void;
};

export function DayListDateNavigation({
  days,
  onSelectDay,
}: DayListDateNavigationProps) {
  return (
    <nav
      className="overflow-hidden rounded-lg border border-[hsl(214,22%,88%)] bg-white"
      aria-label="Dienas izvēle"
    >
      <div className="grid gap-px bg-[hsl(214,22%,90%)] md:grid-cols-3">
        {days.map((day) => {
          const isSelected = day.position === "selected";
          const Icon =
            day.position === "previous"
              ? ChevronLeft
              : day.position === "next"
                ? ChevronRight
                : CalendarDays;

          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => onSelectDay(day.dateKey)}
              aria-pressed={isSelected}
              className={cn(
                "group flex min-h-[88px] items-center gap-3 bg-white px-5 py-3.5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(214,45%,54%)] sm:px-6",
                isSelected
                  ? "bg-[hsl(220,36%,18%)] text-white"
                  : "text-[hsl(218,30%,24%)] hover:bg-[hsl(214,28%,98%)]",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                  isSelected
                    ? "bg-white/10 text-white"
                    : "bg-[hsl(214,24%,96%)] text-[hsl(217,22%,42%)]",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>

              <span className="min-w-0">
                <span
                  className={cn(
                    "block text-sm font-semibold",
                    isSelected
                      ? "text-white"
                      : "text-[hsl(222,28%,20%)]",
                  )}
                >
                  {day.dayLabel}
                </span>
                <span
                  className={cn(
                    "mt-1 block text-sm tabular-nums",
                    isSelected
                      ? "text-white/75"
                      : "text-[hsl(215,14%,47%)]",
                  )}
                >
                  {day.dateLabel}
                </span>
                <span className={cn("mt-1 block text-xs leading-4", isSelected ? "text-white/70" : "text-[hsl(215,14%,47%)]")}>
                  {day.entryCount === 0
                    ? "Nav pacientu"
                    : `${day.entryCount} ${day.entryCount === 1 ? "pacients" : "pacienti"}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
