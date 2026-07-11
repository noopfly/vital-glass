import { useMemo, useState } from "react";
import { AlertTriangle, FlaskConical, Pill, X } from "lucide-react";

import { CenteredOverlay } from "@/components/ui/centered-overlay";
import { DashboardCardHeader } from "@/components/DashboardCardHeader";
import { DashboardListFooter } from "@/components/DashboardListFooter";

type AlertType = "dangerousCombination" | "duplicatePrescription" | "criticalLabResult";
type AlertSeverity = "critical" | "warning";

interface AlertItem {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  type: AlertType;
  severity: AlertSeverity;
}

interface LaboratoryReportResult {
  id: string;
  indicatorName: string;
  value: number;
  unit: string;
  resultDate: string;
  normalReference: string;
  interpretationCode?: string;
  criticalMarker?: string;
}

const medicationAlerts: AlertItem[] = [
  {
    id: "med-1",
    title: "Bīstama mijiedarbība: varfarīns + ibuprofēns",
    description: "Paaugstināts asiņošanas risks. Ieteicama terapijas pārskatīšana.",
    occurredAt: "2026-05-05T08:45:00",
    type: "dangerousCombination",
    severity: "warning",
  },
  {
    id: "med-2",
    title: "Iespējama dublēšanās: divi antikoagulanti",
    description: "Vienlaikus aktīvas līdzīgas darbības zāles: apiksabāns un rivaroksabāns.",
    occurredAt: "2026-05-05T08:10:00",
    type: "duplicatePrescription",
    severity: "warning",
  },
];

const laboratoryReports: LaboratoryReportResult[] = [
  {
    id: "lab-1",
    indicatorName: "Kālijs",
    value: 6.4,
    unit: "mmol/L",
    resultDate: "2026-06-14T09:18:00",
    normalReference: "3,5–5,1 mmol/L",
    interpretationCode: "HH",
  },
  {
    id: "lab-2",
    indicatorName: "Leikocīti",
    value: 2.1,
    unit: "× 10⁹/L",
    resultDate: "2026-06-12T07:42:00",
    normalReference: "4,0–10,0 × 10⁹/L",
    criticalMarker: "LL",
  },
];

const criticalInterpretationCodes = new Set(["LL", "HH", "AA"]);

const alertIcon: Record<AlertType, typeof AlertTriangle> = {
  dangerousCombination: AlertTriangle,
  duplicatePrescription: Pill,
  criticalLabResult: FlaskConical,
};

const severityClass: Record<AlertSeverity, string> = {
  critical: "text-[hsl(0,54%,40%)]",
  warning: "text-[hsl(34,55%,32%)]",
};

function formatAlertDate(value: string) {
  return new Intl.DateTimeFormat("lv-LV", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatLabValue(value: number) {
  return value.toString().replace(".", ",");
}

function getCriticalLabAlerts(reports: LaboratoryReportResult[]): AlertItem[] {
  return reports
    .filter((report) => {
      const interpretationCode = report.interpretationCode?.toUpperCase();
      const criticalMarker = report.criticalMarker?.toUpperCase();

      return (
        (interpretationCode && criticalInterpretationCodes.has(interpretationCode)) ||
        (criticalMarker && criticalInterpretationCodes.has(criticalMarker))
      );
    })
    .map((report) => {
      const marker = report.criticalMarker?.toUpperCase() ?? report.interpretationCode?.toUpperCase() ?? "";
      const direction = marker === "LL" ? "Zem kritiskās robežas" : "Virs kritiskās robežas";

      return {
        id: `critical-lab-${report.id}`,
        title: `${report.indicatorName}: ${formatLabValue(report.value)} ${report.unit}`,
        description: `${direction}. Norma: ${report.normalReference}.`,
        occurredAt: report.resultDate,
        type: "criticalLabResult",
        severity: "critical",
      };
    });
}

function AlertRow({ alert, showDescription = false }: { alert: AlertItem; showDescription?: boolean }) {
  const Icon = alertIcon[alert.type];

  return (
    <article className="px-4 py-3">
      <div className={`flex gap-3 ${showDescription ? "items-center" : "items-start"}`}>
        <Icon
          size={18}
          className={`${showDescription ? "" : "mt-0.5"} shrink-0 ${severityClass[alert.severity]}`}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="whitespace-normal break-words text-xs font-semibold text-text-dark">{alert.title}</p>
          {showDescription ? (
            <p className="mt-1 text-xs leading-4 text-[hsl(215,14%,42%)]">{alert.description}</p>
          ) : null}
        </div>
        <time className="shrink-0 self-center text-xs leading-4 text-[hsl(215,14%,48%)]" dateTime={alert.occurredAt}>
          {formatAlertDate(alert.occurredAt)}
        </time>
      </div>
    </article>
  );
}

const AlertsCard = () => {
  const [isOpen, setIsOpen] = useState(false);

  const alerts = useMemo(
    () =>
      [...medicationAlerts, ...getCriticalLabAlerts(laboratoryReports)].sort((left, right) => {
        const severityDifference = Number(left.severity === "critical") - Number(right.severity === "critical");
        if (severityDifference !== 0) return -severityDifference;
        return new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime();
      }),
    [],
  );

  const visibleAlerts = alerts.slice(0, 3);
  const remainingAlerts = alerts.length - visibleAlerts.length;

  return (
    <>
      <section className="clinical-panel flex h-full w-full flex-col">
        <DashboardCardHeader
          title="Brīdinājumi"
          infoLabel="Informācija par brīdinājumiem"
          infoDescription="Medikamentu riski un kritiski analīžu rezultāti"
        />

        <div className="clinical-list mt-1">
          {visibleAlerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
          <DashboardListFooter
            label={
              remainingAlerts === 1
                ? "Vēl 1 brīdinājums"
                : `Skatīt visus ${alerts.length} brīdinājumus`
            }
            onClick={() => setIsOpen(true)}
          />
        </div>
      </section>

      {isOpen ? (
        <CenteredOverlay onClose={() => setIsOpen(false)} overlayClassName="bg-[rgba(15,23,42,0.32)] backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
          <section role="dialog" aria-modal="true" aria-label={"Br\u012bdin\u0101jumi"} className="mx-auto max-h-[calc(100vh-3rem)] w-full max-w-4xl overflow-y-auto rounded-[12px] border border-[hsl(214,22%,88%)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.16)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-200">
            <div className="border-b border-[hsl(214,22%,90%)] px-5 py-5 sm:px-6 [&>button]:hidden">
              <DashboardCardHeader
                title={"Br\u012bdin\u0101jumi"}
                infoLabel={"Inform\u0101cija par br\u012bdin\u0101jumiem"}
                infoDescription={"Medikamentu riski un kritiski anal\u012b\u017eu rezult\u0101ti"}
              >
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] text-[hsl(215,18%,42%)] transition hover:bg-[hsl(210,24%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)] focus-visible:ring-offset-2"
                  aria-label={"Aizv\u0113rt"}
                >
                  <X size={25} strokeWidth={1.8} />
                </button>
              </DashboardCardHeader>
              <div className="hidden">
                <h2 id="all-alerts-title" className="text-2xl font-semibold tracking-[-0.035em] text-text-dark">Visi brīdinājumi</h2>
                <p className="mt-1 text-sm leading-5 text-heading">Detalizēts medikamentu risku un kritisku analīžu rezultātu pārskats.</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] text-[hsl(215,18%,42%)] transition-colors hover:bg-[hsl(210,24%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)] focus-visible:ring-offset-2" aria-label="Aizvērt">
                <X size={25} strokeWidth={1.8} />
              </button>
            </div>
            <div className="px-5 py-5 sm:px-6">
              <div className="overflow-hidden rounded-[8px] border border-[hsl(214,22%,88%)] divide-y divide-[hsl(214,22%,90%)]">
                {alerts.map((alert) => (
                  <AlertRow key={alert.id} alert={alert} showDescription />
                ))}
              </div>
            </div>
          </section>
        </CenteredOverlay>
      ) : null}
    </>
  );
};

export default AlertsCard;
