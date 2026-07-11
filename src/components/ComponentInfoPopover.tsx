import type { ReactNode } from "react";
import { Info } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function ComponentInfoPopover({
  label,
  description,
  content,
}: {
  label: string;
  description: string;
  content?: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-[hsl(215,14%,45%)] transition-colors duration-200 hover:bg-[hsl(210,24%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
          aria-label={label}
        >
          <Info size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 text-left text-xs leading-4 text-[hsl(215,14%,34%)]">
        {content ?? description}
      </PopoverContent>
    </Popover>
  );
}
