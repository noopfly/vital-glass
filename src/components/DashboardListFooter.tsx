import { ChevronRight } from "lucide-react";

type DashboardListFooterProps = {
  label: string;
  onClick: () => void;
  ariaLabel?: string;
};

/** Shared disclosure row for compact dashboard cards. */
export function DashboardListFooter({
  label,
  onClick,
  ariaLabel = label,
}: DashboardListFooterProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-[hsl(214,38%,97%)] px-4 py-2 text-left transition-colors duration-200 hover:bg-[hsl(214,38%,95%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(214,45%,54%)]"
    >
      <span className="text-sm font-semibold text-[hsl(222,28%,20%)]">
        {label}
      </span>
      <ChevronRight
        size={20}
        className="text-[hsl(214,28%,42%)]"
        aria-hidden="true"
      />
    </button>
  );
}
