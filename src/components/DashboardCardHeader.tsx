import type { ReactNode } from "react";
import { Maximize2 } from "lucide-react";

import { ComponentInfoPopover } from "@/components/ComponentInfoPopover";

type DashboardCardHeaderProps = {
  title: string;
  infoLabel: string;
  infoDescription: string;
  infoContent?: ReactNode;
  onExpand?: () => void;
  expandLabel?: string;
  children?: ReactNode;
};

/** Shared compact header for dashboard cards and their primary detail action. */
export function DashboardCardHeader({
  title,
  infoLabel,
  infoDescription,
  infoContent,
  onExpand,
  expandLabel = "Atvērt pilnskatu",
  children,
}: DashboardCardHeaderProps) {
  return (
    <header className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex min-w-0 items-center gap-1">
          <h2 className="text-xl font-semibold tracking-[-0.035em] text-[hsl(222,28%,20%)]">
            {title}
          </h2>
          <span onClick={(event) => event.stopPropagation()}>
            <ComponentInfoPopover
              label={infoLabel}
              description={infoDescription}
              content={infoContent}
            />
          </span>
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-1">
        {children}
        {onExpand ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onExpand();
            }}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-[hsl(220,18%,30%)] transition-colors duration-200 hover:bg-[hsl(210,24%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
            aria-label={expandLabel}
            title={expandLabel}
          >
            <Maximize2 className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </header>
  );
}
