import { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  FlaskConical,
  Pill,
  ShieldAlert,
  X,
} from "lucide-react";

import { CenteredOverlay } from "@/components/ui/centered-overlay";

type AlertType = "critical" | "warning" | "info" | "medication";

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
    description: "Paaugstināts asiņošanas risks. Nepieciešama terapijas pārskatīšana.",
    occurredAt: "2026-05-05T08:45:00",
    type: "critical",
  },
  {
    id: "2",
    title: "Dublēta recepte: divi antikoagulanti",
    description: "Apiksabāns un rivaroksabāns izrakstīti vienlaikus.",
    occurredAt: "2026-05-05T08:10:00",
    type: "medication",
  },
  {
    id: "3",
    title: "Kreatinīns virs normas",
    description: "Kreatinīns 2.4 mg/dL pēdējās analīzēs.",
    occurredAt: "2026-05-04T10:30:00",
    type: "warning",
  },
  {
    id: "4",
    title: "HbA1c virs normas",
    description: "HbA1c 9.2%. Nepieciešama glikēmijas kontroles izvērtēšana.",
    occurredAt: "2026-05-03T09:20:00",
    type: "warning",
  },
  {
    id: "5",
    title: "Nokavēta kardiologa vizīte",
    description: "Vizīte pie Dr. Bērziņa nav pārplānota.",
    occurredAt: "2026-05-02T14:00:00",
    type: "critical",
  },
  {
    id: "6",
    title: "Plānotas asins analīzes",
    description: "Paraugu nodošana ieplānota centrālajā laboratorijā.",
    occurredAt: "2026-05-01T08:00:00",
    type: "info",
  },
];

const sortedAlerts = [...alerts].sort(
  (left, right) =>
    new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
);

const visibleAlerts = sortedAlerts.slice(0, 3);

function formatAlertDate(value: string) {
  return new Intl.DateTimeFormat("lv-LV", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

const iconStyles: Record<AlertType, string> = {
  critical:
    "border-[rgba(239,208,208,0.96)] text-[hsl(0,54%,52%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,243,243,0.96))]",
  medication:
    "border-[rgba(239,208,208,0.96)] text-[hsl(0,54%,52%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,243,243,0.96))]",
  warning:
    "border-[rgba(236,221,197,0.96)] text-[hsl(34,52%,42%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,245,240,0.96))]",
  info:
    "border-[rgba(210,219,228,0.96)] text-[hsl(220,24%,34%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,246,249,0.96))]",
};

const dateStyles: Record<AlertType, string> = {
  critical: "bg-[hsl(0,56%,96%)] text-[hsl(0,54%,52%)]",
  medication: "bg-[hsl(0,56%,96%)] text-[hsl(0,54%,52%)]",
  warning: "bg-[hsl(40,56%,94%)] text-[hsl(34,52%,42%)]",
  info: "bg-[hsl(214,22%,95%)] text-[hsl(220,24%,34%)]",
};

const iconMap: Record<AlertType, typeof ShieldAlert> = {
  critical: ShieldAlert,
  medication: Pill,
  warning: FlaskConical,
  info: Calendar,
};

const AlertsCard = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[16px] border border-[hsl(214,22%,88%)] bg-white p-5 shadow-[0_8px_18px_rgba(29,53,87,0.05)]">
        <div className="flex items-center justify-between border-b border-[hsl(214,22%,88%)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[rgba(239,208,208,0.96)] bg-[hsl(0,56%,96%)] text-[hsl(0,54%,52%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
              <AlertTriangle size={20} />
            </div>

            <div>
              <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[hsl(0,54%,52%)]">
                Brīdinājumi
              </p>
              <p className="text-xs text-[hsl(214,14%,50%)]">
                Sakārtoti pēc jaunākajiem notikumiem
              </p>
            </div>
          </div>

          <div className="flex h-8 min-w-8 items-center justify-center rounded-[12px] bg-[hsl(0,56%,96%)] px-2 text-sm font-semibold text-[hsl(0,54%,52%)]">
            {sortedAlerts.length}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {visibleAlerts.map((alert) => {
            const Icon = iconMap[alert.type];

            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-[13px] border border-[hsl(214,20%,90%)] bg-[hsl(214,20%,98%)] px-3 py-2.5 transition hover:bg-white"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] ${iconStyles[alert.type]}`}
                >
                  <Icon size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 pr-1 text-[12px] font-semibold leading-4 text-[hsl(222,28%,20%)] line-clamp-2">
                      {alert.title}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${dateStyles[alert.type]}`}
                    >
                      {formatAlertDate(alert.occurredAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-[hsl(214,14%,50%)] line-clamp-2">
                    {alert.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto border-t border-[hsl(214,22%,88%)] pt-4 text-center">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center text-sm font-semibold text-[hsl(220,36%,18%)] transition hover:opacity-70"
          >
            Skatīt visus brīdinājumus →
          </button>
        </div>
      </section>

      {isOpen && (
        <CenteredOverlay
          onClose={() => setIsOpen(false)}
          overlayClassName="bg-[rgba(241,245,249,0.78)] backdrop-blur-[10px]"
          contentClassName="max-w-3xl"
        >
          <div className="relative mx-auto w-full overflow-hidden rounded-[18px] border border-[hsl(214,22%,88%)] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.12)]">
            <div className="border-b border-[hsl(214,22%,88%)] px-6 py-5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-[12px] bg-[hsl(214,20%,96%)] text-[hsl(215,14%,55%)] transition hover:text-[hsl(215,22%,28%)]"
                aria-label="Aizvērt"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 pr-12">
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[rgba(239,208,208,0.96)] bg-[hsl(0,56%,96%)] text-[hsl(0,54%,52%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[hsl(222,28%,20%)]">
                    Visi brīdinājumi
                  </h3>
                  <p className="text-sm text-[hsl(214,14%,42%)]">
                    Jaunākie brīdinājumi un notikumi dilstošā secībā.
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-[78vh] space-y-3 overflow-y-auto px-6 py-5">
              {sortedAlerts.map((alert) => {
                const Icon = iconMap[alert.type];

                return (
                  <div
                    key={alert.id}
                    className="rounded-[14px] border border-[hsl(214,22%,88%)] bg-[hsl(214,20%,98%)] p-4 shadow-[0_6px_18px_rgba(29,53,87,0.05)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] ${iconStyles[alert.type]}`}
                        >
                          <Icon size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[hsl(222,28%,20%)]">
                            {alert.title}
                          </p>
                          <p className="mt-1 text-sm text-[hsl(214,14%,42%)]">
                            {alert.description}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ${dateStyles[alert.type]}`}
                      >
                        {formatAlertDate(alert.occurredAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CenteredOverlay>
      )}
    </>
  );
};

export default AlertsCard;
