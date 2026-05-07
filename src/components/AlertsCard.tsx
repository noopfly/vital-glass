import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Clock,
  EllipsisVertical,
  FlaskConical,
  Pill,
  ShieldAlert,
  Stethoscope,
  X,
} from "lucide-react";

import { CenteredOverlay } from "@/components/ui/centered-overlay";

type AlertType =
  | "critical"
  | "warning"
  | "info"
  | "medication"
  | "followUp"
  | "labControl"
  | "doseReview"
  | "riskAssessment"
  | "doseReminder";

type OverlayTab = "unread" | "read";

interface AlertItem {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  type: AlertType;
  canMarkAsRead?: boolean;
}

const alerts: AlertItem[] = [
  {
    id: "1",
    title: "Bīstama kombinācija: varfarīns + ibuprofēns",
    description:
      "Paaugstināts asiņošanas risks. Nepieciešama terapijas pārskatīšana.",
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
    canMarkAsRead: true,
  },
  {
    id: "7",
    title: "Kontrole pēc 6 mēnešiem",
    description: "Pacientam nepieciešama atkārtota kontroles vizīte pēc 6 mēnešiem.",
    occurredAt: "2026-04-30T11:15:00",
    type: "followUp",
    canMarkAsRead: true,
  },
  {
    id: "8",
    title: "Pārbaudīt ALAT/ASAT pēc 4 nedēļām",
    description:
      "Aknu funkcijas rādītāju kontrole ieteicama 4 nedēļas pēc terapijas sākšanas.",
    occurredAt: "2026-04-29T09:40:00",
    type: "labControl",
    canMarkAsRead: true,
  },
  {
    id: "9",
    title: "Pārskatīt devu, ja GFĀ < 60",
    description:
      "Nepieciešama devas pielāgošanas izvērtēšana nieru funkcijas pasliktināšanās gadījumā.",
    occurredAt: "2026-04-28T13:20:00",
    type: "doseReview",
  },
  {
    id: "10",
    title: "Kontrolēt kreatinīnu",
    description: "Kreatinīna kontrole nepieciešama terapijas drošuma uzraudzībai.",
    occurredAt: "2026-04-27T10:05:00",
    type: "labControl",
    canMarkAsRead: true,
  },
  {
    id: "11",
    title: "Izvērtēt hipoglikēmijas risku",
    description:
      "Pacientam jāizvērtē hipoglikēmijas risks, ņemot vērā esošo terapiju un glikēmijas rādītājus.",
    occurredAt: "2026-04-26T15:30:00",
    type: "riskAssessment",
  },
  {
    id: "12",
    title: "Pārbaudīt D vitamīnu / kalciju pirms terapijas",
    description:
      "Pirms terapijas uzsākšanas ieteicams pārbaudīt D vitamīna un kalcija līmeni.",
    occurredAt: "2026-04-25T08:50:00",
    type: "labControl",
    canMarkAsRead: true,
  },
  {
    id: "13",
    title: "Nākamās devas atgādinājums",
    description:
      "Nākamā deva jālieto saskaņā ar terapijas grafiku. Pārbaudīt lietošanas laiku.",
    occurredAt: "2026-04-24T18:00:00",
    type: "doseReminder",
    canMarkAsRead: true,
  },
];

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
  followUp:
    "border-[rgba(205,222,235,0.96)] text-[hsl(205,48%,38%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,247,251,0.96))]",
  labControl:
    "border-[rgba(203,224,216,0.96)] text-[hsl(158,38%,36%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,248,245,0.96))]",
  doseReview:
    "border-[rgba(226,213,238,0.96)] text-[hsl(270,38%,42%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,243,250,0.96))]",
  riskAssessment:
    "border-[rgba(236,221,197,0.96)] text-[hsl(34,52%,42%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,245,240,0.96))]",
  doseReminder:
    "border-[rgba(205,222,235,0.96)] text-[hsl(205,48%,38%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,247,251,0.96))]",
};

const dateStyles: Record<AlertType, string> = {
  critical: "bg-[hsl(0,56%,96%)] text-[hsl(0,54%,52%)]",
  medication: "bg-[hsl(0,56%,96%)] text-[hsl(0,54%,52%)]",
  warning: "bg-[hsl(40,56%,94%)] text-[hsl(34,52%,42%)]",
  info: "bg-[hsl(214,22%,95%)] text-[hsl(220,24%,34%)]",
  followUp: "bg-[hsl(205,46%,95%)] text-[hsl(205,48%,38%)]",
  labControl: "bg-[hsl(154,36%,95%)] text-[hsl(158,38%,36%)]",
  doseReview: "bg-[hsl(270,38%,96%)] text-[hsl(270,38%,42%)]",
  riskAssessment: "bg-[hsl(40,56%,94%)] text-[hsl(34,52%,42%)]",
  doseReminder: "bg-[hsl(205,46%,95%)] text-[hsl(205,48%,38%)]",
};

const iconMap: Record<AlertType, typeof ShieldAlert> = {
  critical: ShieldAlert,
  medication: Pill,
  warning: FlaskConical,
  info: Calendar,
  followUp: Calendar,
  labControl: FlaskConical,
  doseReview: Pill,
  riskAssessment: Stethoscope,
  doseReminder: Clock,
};

const alertSectionIconClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(239,208,208,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,243,243,0.96))] text-[hsl(0,54%,52%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]";

const tabButtonBaseClass =
  "inline-flex items-center justify-center rounded-[10px] px-3 py-2 text-sm font-medium transition";

interface AlertRowProps {
  alert: AlertItem;
  compact?: boolean;
  openMenuId: string | null;
  onToggleMenu: (alertId: string) => void;
  onMarkAsRead: (alertId: string) => void;
  menuLabel: string;
}

function AlertRow({
  alert,
  compact = false,
  openMenuId,
  onToggleMenu,
  onMarkAsRead,
  menuLabel,
}: AlertRowProps) {
  const Icon = iconMap[alert.type];
  const isMenuOpen = openMenuId === alert.id;

  return (
    <div
      data-alert-menu-root
      className={`rounded-[10px] border border-[hsl(214,22%,88%)] bg-[hsl(214,20%,98%)] shadow-[0_6px_18px_rgba(29,53,87,0.05)] ${
        compact ? "px-3 py-2.5" : "p-4"
      }`}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1.5">
        <div
          className={`row-span-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] ${iconStyles[alert.type]}`}
        >
          <Icon size={16} />
        </div>

        <p
          className={`min-w-0 font-semibold text-[hsl(222,28%,20%)] ${
            compact
              ? "line-clamp-2 text-[12px] leading-4"
              : "text-sm"
          }`}
        >
          {alert.title}
        </p>

        <div className="flex shrink-0 items-start gap-1.5">
          <span
            className={`rounded-full font-medium ${dateStyles[alert.type]} ${
              compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]"
            }`}
          >
            {formatAlertDate(alert.occurredAt)}
          </span>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => onToggleMenu(alert.id)}
              className="inline-flex h-5 w-5 items-center justify-center text-[hsl(214,14%,48%)] transition hover:text-[hsl(215,22%,28%)]"
              aria-label={menuLabel}
              aria-expanded={isMenuOpen}
            >
              <EllipsisVertical className="h-3.5 w-3.5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-6 z-20 min-w-[164px] overflow-hidden rounded-[10px] border border-[hsl(214,20%,88%)] bg-white shadow-[0_18px_36px_rgba(15,23,42,0.14)]">
                <button
                  type="button"
                  onClick={() => onMarkAsRead(alert.id)}
                  className="flex w-full items-center px-3 py-2.5 text-left text-sm text-[hsl(214,18%,34%)] transition hover:bg-[hsl(214,20%,97%)]"
                >
                  Marķēt kā lasītu
                </button>
              </div>
            )}
          </div>
        </div>

        <p
          className={`col-[2/4] text-[hsl(214,14%,42%)] ${
            compact
              ? "line-clamp-2 text-[11px] leading-4"
              : "text-sm"
          }`}
        >
          {alert.description}
        </p>
      </div>
    </div>
  );
}

const AlertsCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [readAlertIds, setReadAlertIds] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OverlayTab>("unread");

  const sortedAlerts = useMemo(
    () =>
      [...alerts].sort(
        (left, right) =>
          new Date(right.occurredAt).getTime() -
          new Date(left.occurredAt).getTime(),
      ),
    [],
  );

  const unreadAlerts = useMemo(
    () => sortedAlerts.filter((alert) => !readAlertIds.includes(alert.id)),
    [readAlertIds, sortedAlerts],
  );

  const readAlerts = useMemo(
    () => sortedAlerts.filter((alert) => readAlertIds.includes(alert.id)),
    [readAlertIds, sortedAlerts],
  );

  const visibleAlerts = unreadAlerts.slice(0, 3);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest("[data-alert-menu-root]")) return;
      setOpenMenuId(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const markAsRead = (alertId: string) => {
    setReadAlertIds((current) =>
      current.includes(alertId) ? current : [...current, alertId],
    );
    setOpenMenuId(null);
  };

  const toggleMenu = (alertId: string) => {
    setOpenMenuId((current) => (current === alertId ? null : alertId));
  };

  const openAllAlerts = () => {
    setActiveTab("unread");
    setOpenMenuId(null);
    setIsOpen(true);
  };

  const activeList = activeTab === "unread" ? unreadAlerts : readAlerts;

  return (
    <>
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[12px] border border-[hsl(214,22%,88%)] bg-white p-5 shadow-[0_8px_18px_rgba(29,53,87,0.05)]">
        <div className="flex items-center justify-between border-b border-[hsl(214,22%,88%)] pb-4">
          <div className="flex items-center gap-3">
            <div className={alertSectionIconClass}>
              <AlertTriangle size={20} />
            </div>

            <div>
              <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[hsl(0,54%,52%)]">
                Brīdinājumi
              </p>

              <p className="text-xs text-[hsl(214,14%,50%)]">
                Medikamentu, analīžu, kontroles un nākamo devu atgādinājumi
              </p>
            </div>
          </div>

          <div className="flex h-8 min-w-8 items-center justify-center rounded-[12px] bg-[hsl(0,56%,96%)] px-2 text-sm font-semibold text-[hsl(0,54%,52%)]">
            {unreadAlerts.length}
          </div>
        </div>

        <div className="mt-4 flex-1 space-y-2">
          {visibleAlerts.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-[hsl(214,20%,88%)] bg-[hsl(214,20%,98%)] px-4 py-5 text-center">
              <p className="text-sm font-semibold text-[hsl(222,28%,20%)]">
                Nav aktīvu brīdinājumu
              </p>
              <p className="mt-1 text-xs text-[hsl(214,14%,50%)]">
                Visi atzīmējamie brīdinājumi ir pārvietoti uz lasītajiem.
              </p>
            </div>
          ) : (
            visibleAlerts.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                compact
                openMenuId={openMenuId}
                onToggleMenu={toggleMenu}
                onMarkAsRead={markAsRead}
                menuLabel="Atvērt brīdinājuma darbības"
              />
            ))
          )}
        </div>

        <div className="mt-4 border-t border-[hsl(214,22%,88%)] pt-4 text-center">
          <button
            type="button"
            onClick={openAllAlerts}
            className="inline-flex items-center justify-center text-sm font-semibold text-[hsl(220,36%,18%)] transition hover:opacity-70"
          >
            Skatīt visus brīdinājumus →
          </button>
        </div>
      </section>

      {isOpen && (
        <CenteredOverlay
          onClose={() => {
            setIsOpen(false);
            setOpenMenuId(null);
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
                  setOpenMenuId(null);
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
                    Visi brīdinājumi
                  </h3>

                  <p className="text-sm text-[hsl(214,14%,42%)]">
                    Pārvaldiet aktīvos un jau lasītos brīdinājumus vienuviet.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-[hsl(214,22%,88%)] px-6 py-3">
              <div className="inline-flex rounded-[12px] bg-[hsl(214,20%,97%)] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("unread");
                    setOpenMenuId(null);
                  }}
                  className={`${tabButtonBaseClass} ${
                    activeTab === "unread"
                      ? "bg-white text-[hsl(222,28%,20%)] shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
                      : "text-[hsl(214,14%,48%)]"
                  }`}
                >
                  Brīdinājumi
                  <span className="ml-2 rounded-full bg-[hsl(214,20%,96%)] px-2 py-0.5 text-xs font-semibold text-[hsl(214,18%,40%)]">
                    {unreadAlerts.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("read");
                    setOpenMenuId(null);
                  }}
                  className={`${tabButtonBaseClass} ${
                    activeTab === "read"
                      ? "bg-white text-[hsl(222,28%,20%)] shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
                      : "text-[hsl(214,14%,48%)]"
                  }`}
                >
                  Lasītie
                  <span className="ml-2 rounded-full bg-[hsl(214,20%,96%)] px-2 py-0.5 text-xs font-semibold text-[hsl(214,18%,40%)]">
                    {readAlerts.length}
                  </span>
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] space-y-3 overflow-y-auto px-6 py-5">
              {activeList.length === 0 ? (
                <div className="rounded-[10px] border border-dashed border-[hsl(214,20%,88%)] bg-[hsl(214,20%,98%)] px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-[hsl(222,28%,20%)]">
                    {activeTab === "unread"
                      ? "Nav aktīvu brīdinājumu"
                      : "Nav lasīto brīdinājumu"}
                  </p>
                  <p className="mt-1 text-sm text-[hsl(214,14%,42%)]">
                    {activeTab === "unread"
                      ? "Visi atzīmējamie ieraksti jau pārvietoti uz lasītajiem."
                      : "Šeit parādīsies brīdinājumi, ko atzīmēsiet kā lasītus."}
                  </p>
                </div>
              ) : (
                activeList.map((alert) => (
                  <AlertRow
                    key={alert.id}
                    alert={alert}
                    openMenuId={activeTab === "unread" ? openMenuId : null}
                    onToggleMenu={toggleMenu}
                    onMarkAsRead={markAsRead}
                    menuLabel="Atvērt brīdinājuma darbības"
                  />
                ))
              )}
            </div>
          </div>
        </CenteredOverlay>
      )}
    </>
  );
};

export default AlertsCard;
