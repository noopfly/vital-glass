import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface CenteredOverlayProps {
  children: ReactNode;
  onClose: () => void;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

export function CenteredOverlay({
  children,
  onClose,
  className,
  overlayClassName,
  contentClassName,
}: CenteredOverlayProps) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[80] flex items-center justify-center p-4",
        className,
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "absolute inset-0 bg-[rgba(241,245,249,0.72)] backdrop-blur-[8px]",
          overlayClassName,
        )}
      />

      <div
        className={cn("relative z-10 w-full", contentClassName)}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
