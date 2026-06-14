import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Pill, X } from "lucide-react";

import { CenteredOverlay } from "@/components/ui/centered-overlay";

type AlertType = "dangerousCombination" | "duplicatePrescription";

interface AlertItem {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  type: AlertType;
}

const alerts: AlertItem[] = [
  {
    id: "1",
    title: "Bīstama kombinācija: varfarīns + ibuprofēns",
    description:
      "Paaugstināts asiņošanas risks. Nepieciešama terapijas pārskatīšana.",
    occurredAt: "2026-05-05T08:45:00",
    type: "dangerousCombination",
  },
  {
    id: "2",
    title: "Dublēta recepte: divi antikoagulanti",
    description: "Apiksabāns un rivaroksabāns izrakstīti vienlaikus.",
    occurredAt: "2026-05-05T08:10:00",
    type: "duplicatePrescription",
  },
];

function formatAlertDate(value: string) {
  return new Intl.DateTimeFormat("lv-LV", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

const iconStyles: Record<AlertType, string> = {
  dangerousCombination: "text-[hsl(34,52%,42%)]",
  duplicatePrescription: "text-[hsl(34,52%,42%)]",
};

const dateStyles: Record<AlertType, string> = {
  dangerousCombination: "bg-[hsl(40,56%,94%)] text-[hsl(34,52%,42%)]",
  duplicatePrescription: "bg-[hsl(40,56%,94%)] text-[hsl(34,52%,42%)]",
};

const iconMap: Record<AlertType, typeof AlertTriangle> = {
  dangerousCombination: AlertTriangle,
  duplicatePrescription: Pill,
};

const alertSectionIconClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border border-[rgba(236,221,197,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,245,240,0.96))] text-[hsl(34,52%,42%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]";

const compactAlertRowGap = 0;

interface AlertRowProps {
  alert: AlertItem;
  compact?: boolean;
  connected?: boolean;
}

function AlertRow({
  alert,
  compact = false,
  connected = false,
}: AlertRowProps) {
  const Icon = iconMap[alert.type];
  const usesConnectedLayout = compact || connected;

  return (
    <div
      data-alert-row
      className={
        usesConnectedLayout
          ? "bg-white transition-colors hover:bg-[hsl(214,20%,98%)]"
          : "rounded-[6px] border border-[hsl(214,22%,88%)] bg-[hsl(214,20%,98%)] p-4"
      }
    >
      <div
        className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 ${
          compact ? "gap-y-1.5" : "gap-y-0.5"
        } ${usesConnectedLayout ? "px-4 py-4" : ""}`}
      >
        <div
          className={`${compact ? "" : "row-span-2 "}flex ${
            compact ? "h-5 w-5" : "h-6 w-6"
          } shrink-0 items-center justify-center self-center ${
            iconStyles[alert.type]
          }`}
        >
          <Icon size={compact ? 16 : 18} strokeWidth={2.2} />
        </div>

        <p
          className={`min-w-0 font-semibold text-[hsl(222,28%,20%)] ${
            compact ? "line-clamp-2 text-[12px] leading-4" : "text-sm"
          }`}
        >
          {alert.title}
        </p>

        <div className="flex shrink-0 items-start gap-1.5">
          <span
            className={`rounded-full font-medium ${dateStyles[alert.type]} ${
              compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1 text-[11px]"
            }`}
          >
            {formatAlertDate(alert.occurredAt)}
          </span>
        </div>

        {!compact && (
          <p
            className={`col-[2/4] text-sm text-[hsl(214,14%,42%)] ${
              connected ? "leading-6" : ""
            }`}
          >
            {alert.description}
          </p>
        )}
      </div>
    </div>
  );
}

const AlertsCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleAlertCount, setVisibleAlertCount] = useState(3);
  const listContainerRef = useRef<HTMLDivElement | null>(null);

  const sortedAlerts = useMemo(
    () =>
      [...alerts].sort(
        (left, right) =>
          new Date(right.occurredAt).getTime() -
          new Date(left.occurredAt).getTime(),
      ),
    [],
  );

  const visibleAlerts = sortedAlerts.slice(0, visibleAlertCount);

  useLayoutEffect(() => {
    const element = listContainerRef.current;
    if (!element) return undefined;

    const updateVisibleAlertCount = () => {
      const firstRow = element.querySelector("[data-alert-row]");
      if (!(firstRow instanceof HTMLElement)) return;

      const nextCount = Math.max(
        1,
        Math.floor(
          (element.clientHeight + compactAlertRowGap) /
            (firstRow.offsetHeight + compactAlertRowGap),
        ),
      );

      setVisibleAlertCount(nextCount);
    };

    updateVisibleAlertCount();

    if (typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(() => {
      updateVisibleAlertCount();
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [sortedAlerts.length]);

  return (
    <>
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[6px] border border-[hsl(214,22%,88%)] bg-white p-5 shadow-[0_8px_18px_rgba(29,53,87,0.05)]">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className={alertSectionIconClass}>
              <AlertTriangle size={20} />
            </div>

            <div>
              <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-heading">
                Brīdinājumi
              </p>

              <p className="text-xs text-text-dark">
                Medikamentu, analīžu, kontroles un nākamo devu atgādinājumi
              </p>
            </div>
          </div>

          <div className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(34,86%,52%)] px-2 text-[13px] font-semibold leading-none text-white">
            {sortedAlerts.length}
          </div>
        </div>

        <div
          ref={listContainerRef}
          className="-mt-3 flex min-h-0 flex-1 flex-col justify-center"
        >
          {visibleAlerts.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-[hsl(214,20%,88%)] bg-[hsl(214,20%,98%)] px-4 py-5 text-center">
              <p className="text-sm font-semibold text-[hsl(222,28%,20%)]">
                Nav aktīvu brīdinājumu
              </p>
              <p className="mt-1 text-xs text-[hsl(214,14%,50%)]">
                Šobrīd nav neviena aktīva medikamentu drošības brīdinājuma.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[hsl(214,22%,90%)] overflow-hidden rounded-[10px] border border-[hsl(214,22%,88%)] bg-white">
              {visibleAlerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} compact connected />
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[hsl(214,22%,88%)] pt-3">
          <p className="text-[11px] font-medium text-[hsl(214,14%,50%)]">
            {visibleAlerts.length} no {sortedAlerts.length}
          </p>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="ml-auto inline-flex items-center justify-center text-[12px] font-semibold text-[hsl(220,36%,18%)] transition hover:opacity-70"
          >
            Skatīt visus brīdinājumus →
          </button>
        </div>
      </section>

      {isOpen && (
        <CenteredOverlay
          onClose={() => {
            setIsOpen(false);
          }}
          overlayClassName="bg-[rgba(241,245,249,0.78)] backdrop-blur-[10px]"
          contentClassName="max-w-3xl"
        >
          <div className="relative mx-auto w-full overflow-hidden rounded-[14px] border border-[hsl(214,22%,88%)] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.12)]">
            <div className="border-b border-[hsl(214,22%,88%)] px-6 py-5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                }}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[hsl(214,20%,96%)] text-[hsl(215,14%,55%)] transition hover:text-[hsl(215,22%,28%)]"
                aria-label="Aizvērt"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 pr-12">
                <div className={alertSectionIconClass}>
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[hsl(222,28%,20%)]">
                    Brīdinājumi
                  </h3>

                  <p className="text-sm text-[hsl(214,14%,42%)]">
                    Medikamentu, analīžu, kontroles un nākamo devu atgādinājumi
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-[70vh] space-y-3 overflow-y-auto px-6 py-5">
              {sortedAlerts.length === 0 ? (
                <div className="rounded-[10px] border border-dashed border-[hsl(214,20%,88%)] bg-[hsl(214,20%,98%)] px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-[hsl(222,28%,20%)]">
                    Nav aktīvu brīdinājumu
                  </p>
                  <p className="mt-1 text-sm text-[hsl(214,14%,42%)]">
                    Šeit parādīsies dublētas receptes un bīstamas kombinācijas.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[hsl(214,22%,90%)] overflow-hidden rounded-[10px] border border-[hsl(214,22%,88%)] bg-white">
                  {sortedAlerts.map((alert) => (
                    <AlertRow key={alert.id} alert={alert} connected />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CenteredOverlay>
      )}
    </>
  );
};

export default AlertsCard;
