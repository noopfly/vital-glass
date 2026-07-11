import { type MouseEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, ChevronDown, Copy, X } from "lucide-react";

import { CenteredOverlay } from "@/components/ui/centered-overlay";
import { DashboardCardHeader } from "@/components/DashboardCardHeader";
import { DashboardListFooter } from "@/components/DashboardListFooter";

type MedicationStatus = "active" | "historical";
type InteractionSeverity = "viegla" | "videja";
type MedicationTableMode = "compact" | "full";

interface Interaction {
  with: string;
  severity: InteractionSeverity;
  summary: string;
}

interface DuplicateAlert {
  with: string;
  summary: string;
}

interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  status: MedicationStatus;
  statusLabel: "izsniegta" | "Izrakstīta" | "Daļēji izsniegta";
  startDate: string;
  endDate: string;
  prescribedBy: string;
  interactions: Interaction[];
  duplicate: DuplicateAlert | null;
}

const medications: Medication[] = [
  {
    id: "metformin",
    name: "Metformīns",
    dose: "500 mg",
    frequency: "2x dienā",
    status: "active",
    statusLabel: "Izsniegta",
    startDate: "12.01.2024",
    endDate: "—",
    prescribedBy: "Dr. Anna Kalniņa",
    interactions: [],
    duplicate: null,
  },
  {
    id: "atorvastatin",
    name: "Atorvastatīns",
    dose: "20 mg",
    frequency: "1x dienā",
    status: "active",
    statusLabel: "Izrakstīta",
    startDate: "03.04.2024",
    endDate: "—",
    prescribedBy: "Dr. Jānis Ozols",
    interactions: [
      {
        with: "Amlodipīns",
        severity: "viegla",
        summary: "Amlodipīns var palielināt atorvastatīna koncentrāciju plazmā.",
      },
    ],
    duplicate: {
      with: "Rosuvastatīns",
      summary:
        "Pacienta terapijā ir atrasts vēl viens statīna ieraksts ar līdzīgu terapeitisko mērķi.",
    },
  },
  {
    id: "amlodipine",
    name: "Amlodipīns",
    dose: "5 mg",
    frequency: "1x dienā",
    status: "active",
    statusLabel: "Daļēji izsniegta",
    startDate: "18.02.2024",
    endDate: "—",
    prescribedBy: "Dr. Jānis Ozols",
    interactions: [
      {
        with: "Atorvastatīns",
        severity: "viegla",
        summary: "Ieteicama blakusparādību novērošana.",
      },
    ],
    duplicate: null,
  },
  {
    id: "amoxicillin",
    name: "Amoksicilīns",
    dose: "500 mg",
    frequency: "3x dienā",
    status: "historical",
    statusLabel: "Izrakstīta",
    startDate: "02.10.2023",
    endDate: "09.10.2023",
    prescribedBy: "Dr. Līga Bērziņa",
    interactions: [],
    duplicate: null,
  },
  {
    id: "pantoprazole",
    name: "Pantoprazols",
    dose: "20 mg",
    frequency: "1x dienā",
    status: "historical",
    statusLabel: "Daļēji izsniegta",
    startDate: "15.08.2023",
    endDate: "15.11.2023",
    prescribedBy: "Dr. Anna Kalniņa",
    interactions: [],
    duplicate: null,
  },
];

const columnLabels = {
  name: "Medikaments",
  dose: "Deva",
  frequency: "Biežums",
  status: "Statuss",
  issuance: "Izsniegta",
  startDate: "Derīga no",
  endDate: "Derīga līdz",
  prescribedBy: "Nozīmējis ārsts",
};

const getMedicationBadgeLabel = (medication: Medication) =>
  medication.status === "historical" ? "Vēsturisks" : medication.statusLabel;

const getMedicationBadgeClasses = (medication: Medication) => {
  if (medication.status === "historical") {
    return "border-[hsl(214,22%,84%)] bg-[hsl(214,22%,96%)] text-[hsl(220,18%,44%)]";
  }

  switch (medication.statusLabel) {
    case "Izrakstīta":
      return "border-[hsl(214,22%,84%)] bg-[hsl(214,22%,96%)] text-[hsl(220,18%,44%)]";
    case "Daļēji izsniegta":
      return "border-[hsl(38,30%,80%)] bg-[hsl(40,52%,94%)] text-[hsl(34,50%,36%)]";
    default:
      return "border-[hsl(152,34%,78%)] bg-[hsl(152,42%,97%)] text-[hsl(152,38%,31%)]";
  }
};

const headingClass =
  "text-xs font-semibold text-heading";

const compactTableGridClass =
  "md:grid-cols-[minmax(0,1.4fr)_0.85fr_0.95fr_auto_auto]";

const fullTableGridClass =
  "md:grid-cols-[minmax(0,1.8fr)_0.85fr_0.9fr_1fr_1fr_1fr_1fr_1.15fr]";

const compactSignalClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border [&>svg]:h-3 [&>svg]:w-3";
const defaultVisibleMedicationCount = 2;

type MedicationSignalOverlayPosition = {
  left: number;
  top: number;
  arrowOffset: number;
  width: number;
};

function MedicationSignalLegend() {
  return (
    <div
      className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs text-heading"
      aria-label="Medikamentu signālu apzīmējumi"
    >
      <span className="inline-flex items-center gap-1.5">
        <span
          className={`${compactSignalClass} border-[rgba(236,221,197,0.96)] bg-[hsl(40,56%,97%)] text-[hsl(34,52%,42%)]`}
          aria-hidden="true"
        >
          <AlertTriangle size={12} strokeWidth={2} />
        </span>
        Mijiedarbība
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className={`${compactSignalClass} border-[rgba(239,208,208,0.96)] bg-[hsl(0,56%,97%)] text-[hsl(0,54%,52%)]`}
          aria-hidden="true"
        >
          <Copy size={12} strokeWidth={2} />
        </span>
        Dublēts
      </span>
    </div>
  );
}

function MedicationInfoContent() {
  return (
    <div className="space-y-3">
      <p>Aktuālie medikamenti, devas un mijiedarbības.</p>
      <div className="border-t border-[hsl(214,22%,90%)] pt-3">
        <p className="mb-2 text-xs font-semibold text-text-dark">
          Medikamentu signāli
        </p>
        <MedicationSignalLegend />
      </div>
    </div>
  );
}

function MedicationSignalOverlay({
  medication,
  overlayPosition,
}: {
  medication: Medication;
  overlayPosition: MedicationSignalOverlayPosition;
}) {
  if (medication.interactions.length === 0 && !medication.duplicate) return null;

  const overlay = (
    <div
      className="pointer-events-none fixed z-[90] -translate-y-[calc(100%+8px)]"
      style={{
        left: `${overlayPosition.left}px`,
        top: `${overlayPosition.top}px`,
        width: `${overlayPosition.width}px`,
      }}
    >
      <div className="relative rounded-[10px] border border-[hsl(214,22%,88%)] bg-white px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
        <div className="divide-y divide-[rgba(220,228,236,0.72)]">
          {medication.interactions.map((interaction, index) => (
            <div
              key={`${medication.id}-interaction-${index}`}
              className={index === 0 ? "pb-4" : "pt-4 pb-4"}
            >
              <div className="mb-2">
                <p className="text-xs font-semibold text-[hsl(34,52%,42%)]">
                  Mijiedarbība
                </p>
              </div>

              <p className="text-sm font-semibold text-text-dark">
                {medication.name} ↔ {interaction.with}
              </p>

              <p className="mt-2 text-sm leading-5 text-heading">
                {interaction.summary}
              </p>
            </div>
          ))}

          {medication.duplicate ? (
            <div className={medication.interactions.length > 0 ? "pt-4" : ""}>
              <div className="mb-2">
                <p className="text-xs font-semibold text-[hsl(0,54%,52%)]">
                  Dublēts
                </p>
              </div>

              <p className="text-sm font-semibold text-text-dark">
                {medication.name} ↔ {medication.duplicate.with}
              </p>

              <p className="mt-2 text-sm leading-5 text-heading">
                {medication.duplicate.summary}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="absolute top-full h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-[hsl(214,22%,88%)]"
        style={{ left: `${overlayPosition.arrowOffset - 8}px` }}
      >
        <div className="absolute -left-[7px] top-0 h-0 w-0 border-x-7 border-x-transparent border-t-7 border-t-white" />
      </div>
    </div>
  );

  return typeof document === "undefined" ? overlay : createPortal(overlay, document.body);
}

function MedicationRow({
  medication,
  mode,
  onActivate,
  onPointerMove,
  onDeactivate,
}: {
  medication: Medication;
  mode: MedicationTableMode;
  onActivate: (medicationId: string, event: MouseEvent<HTMLDivElement>) => void;
  onPointerMove: (event: MouseEvent<HTMLDivElement>) => void;
  onDeactivate: () => void;
}) {
  const isFullMode = mode === "full";
  const tableGridClass =
    isFullMode ? fullTableGridClass : compactTableGridClass;
  const hasSignals =
    medication.interactions.length > 0 || Boolean(medication.duplicate);
  const statusBadgeLabel = getMedicationBadgeLabel(medication);
  const statusBadgeClassName = getMedicationBadgeClasses(medication);

  return (
    <div
      className={`grid min-h-14 w-full gap-x-3 gap-y-1 px-4 py-3 text-left transition-colors hover:bg-[hsl(214,20%,99%)] md:items-center ${hasSignals ? "cursor-help" : ""} ${tableGridClass}`}
      onMouseEnter={(event) => {
        if (!hasSignals) return;
        onActivate(medication.id, event);
      }}
      onMouseMove={(event) => {
        if (!hasSignals) return;
        onPointerMove(event);
      }}
      onMouseLeave={() => {
        if (!hasSignals) return;
        onDeactivate();
      }}
    >
      <div className="min-w-0">
        <p className={`mb-1 md:hidden ${headingClass}`}>{columnLabels.name}</p>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold leading-4 text-text-dark">
            <span className="whitespace-normal break-words">{medication.name}</span>

            {hasSignals ? (
              <span className="inline-flex items-center gap-1" aria-label="Medikamenta signāli">
              {medication.interactions.length > 0 && (
                <span
                  className={`${compactSignalClass} border-[rgba(236,221,197,0.96)] bg-[hsl(40,56%,97%)] text-[hsl(34,52%,42%)]`}
                  role="img"
                  aria-label="Mijiedarbība"
                  title="Mijiedarbība"
                >
                  <AlertTriangle size={12} strokeWidth={2} />
                </span>
              )}

              {medication.duplicate && (
                <span
                  className={`${compactSignalClass} border-[rgba(239,208,208,0.96)] bg-[hsl(0,56%,97%)] text-[hsl(0,54%,52%)]`}
                  role="img"
                  aria-label="Dublēts medikaments"
                  title="Dublēts medikaments"
                >
                  <Copy size={12} strokeWidth={2} />
                </span>
              )}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <p className={`mb-1 md:hidden ${headingClass}`}>{columnLabels.dose}</p>
        <p className="text-xs text-heading">{medication.dose}</p>
      </div>

      <div>
        <p className={`mb-1 md:hidden ${headingClass}`}>{columnLabels.frequency}</p>
        <p className="text-xs text-heading">
          {medication.frequency}
        </p>
      </div>

      <div className={`flex self-start pt-0.5 md:self-auto md:pt-0 ${isFullMode ? "md:justify-start" : "md:justify-end"}`}>
        <div
          className={`flex flex-col ${isFullMode ? "items-start" : "items-end"}`}
        >
          <p className={`mb-1 md:hidden ${headingClass}`}>{columnLabels.status}</p>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClassName}`}
          >
            {statusBadgeLabel}
          </span>
        </div>
      </div>

      {mode === "full" && (
        <div>
          <p className={`mb-1 md:hidden ${headingClass}`}>{columnLabels.issuance}</p>
          <p className="text-xs text-heading">{medication.startDate}</p>
        </div>
      )}

      {mode === "full" && (
        <>
          <div>
            <p className={`mb-1 md:hidden ${headingClass}`}>
              {columnLabels.startDate}
            </p>
            <p className="text-xs tabular-nums text-heading">
              {medication.startDate}
            </p>
          </div>

          <div>
            <p className={`mb-1 md:hidden ${headingClass}`}>
              {columnLabels.endDate}
            </p>
            <p className="text-xs tabular-nums text-heading">
              {medication.endDate}
            </p>
          </div>

          <div className="min-w-0">
            <p className={`mb-1 md:hidden ${headingClass}`}>
              {columnLabels.prescribedBy}
            </p>
            <p className="whitespace-normal break-words text-xs text-heading">
              {medication.prescribedBy}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function MedicationTableContent({
  mode = "compact",
  activeLimit,
  onOpenAll,
}: {
  mode?: MedicationTableMode;
  activeLimit?: number;
  onOpenAll?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredMedicationId, setHoveredMedicationId] = useState<string | null>(
    null,
  );
  const [overlayPosition, setOverlayPosition] =
    useState<MedicationSignalOverlayPosition>({
      left: 0,
      top: 0,
      arrowOffset: 0,
      width: 360,
    });
  const [isHistoricalOpen, setIsHistoricalOpen] = useState(false);

  const activeMedications = medications.filter(
    (medication) => medication.status === "active",
  );

  const historicalMedications = medications.filter(
    (medication) => medication.status === "historical",
  );
  const visibleActiveMedications = activeLimit
    ? activeMedications.slice(0, activeLimit)
    : activeMedications;
  const remainingActiveMedicationCount = activeMedications.length - visibleActiveMedications.length;

  const hoveredMedication =
    medications.find((medication) => medication.id === hoveredMedicationId) ??
    null;

  const tableGridClass =
    mode === "full" ? fullTableGridClass : compactTableGridClass;
  const isFullMode = mode === "full";

  const updateOverlayPosition = (event: MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const horizontalPadding = 12;
    const overlayWidth = Math.min(360, containerRect.width - horizontalPadding * 2);
    const localX = event.clientX - containerRect.left;
    const left = Math.min(
      Math.max(localX - overlayWidth / 2, horizontalPadding),
      containerRect.width - overlayWidth - horizontalPadding,
    );

    setOverlayPosition({
      left: containerRect.left + left,
      top: event.clientY,
      arrowOffset: localX - left,
      width: overlayWidth,
    });
  };

  const renderMedicationRows = (items: Medication[]) =>
    items.map((medication) => (
      <MedicationRow
        key={medication.id}
        medication={medication}
        mode={mode}
        onActivate={(medicationId, event) => {
          setHoveredMedicationId(medicationId);
          updateOverlayPosition(event);
        }}
        onPointerMove={updateOverlayPosition}
        onDeactivate={() => setHoveredMedicationId(null)}
      />
    ));

  return (
    <div ref={containerRef} className="relative overflow-visible">
      <div className="overflow-hidden rounded-[8px] border border-[hsl(214,22%,88%)] bg-white">
        <div className={`hidden gap-x-2.5 border-b border-[hsl(214,22%,88%)] bg-[hsl(214,20%,96%)] px-4 py-2.5 md:grid ${tableGridClass}`}>
          <p className={headingClass}>{columnLabels.name}</p>
          <p className={headingClass}>{columnLabels.dose}</p>
          <p className={headingClass}>{columnLabels.frequency}</p>
          <div className={`flex items-center ${isFullMode ? "md:justify-start" : "md:justify-center"}`}>
            <p className={headingClass}>{columnLabels.status}</p>
          </div>
          {isFullMode ? (
            <div className="flex items-center md:justify-start">
              <p className={headingClass}>{columnLabels.issuance}</p>
            </div>
          ) : null}
          {isFullMode ? (
            <>
              <p className={headingClass}>{columnLabels.startDate}</p>
              <p className={headingClass}>{columnLabels.endDate}</p>
              <p className={headingClass}>{columnLabels.prescribedBy}</p>
            </>
          ) : null}
        </div>

        <div className="divide-y divide-[hsl(214,22%,90%)]">
          {renderMedicationRows(visibleActiveMedications)}

          {mode === "compact" && remainingActiveMedicationCount > 0 && onOpenAll ? (
            <DashboardListFooter
              label={`Vēl ${remainingActiveMedicationCount} ${remainingActiveMedicationCount === 1 ? "medikaments" : "medikamenti"}`}
              onClick={onOpenAll}
              ariaLabel={`Skatīt vēl ${remainingActiveMedicationCount} medikamentus`}
            />
          ) : null}

          {historicalMedications.length > 0 ? (
          <button
            type="button"
            onClick={() => setIsHistoricalOpen((current) => !current)}
            aria-expanded={isHistoricalOpen}
            className="flex min-h-11 w-full items-center justify-between bg-[hsl(214,38%,97%)] px-4 py-2 text-left text-xs font-semibold text-[hsl(222,28%,20%)] transition-colors duration-200 hover:bg-[hsl(214,38%,95%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(214,45%,54%)]"
          >
            <span>Vēsturiskie medikamenti ({historicalMedications.length})</span>
            <ChevronDown size={20} className={`text-[hsl(214,28%,42%)] transition-transform ${isHistoricalOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          ) : null}

          {isHistoricalOpen ? renderMedicationRows(historicalMedications) : null}
        </div>
      </div>

      {hoveredMedication ? (
        <MedicationSignalOverlay medication={hoveredMedication} overlayPosition={overlayPosition} />
      ) : null}
    </div>
  );
}

const MedicationTable = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="clinical-panel relative z-20 flex h-full !overflow-visible flex-col">
        <DashboardCardHeader
          title="Medikamenti"
          infoLabel="Informācija par medikamentiem"
          infoDescription="Aktuālie medikamenti, devas un mijiedarbības"
          infoContent={<MedicationInfoContent />}
        />

        <div className="mt-4">
          <MedicationTableContent
            mode="compact"
            activeLimit={defaultVisibleMedicationCount}
            onOpenAll={() => setIsOpen(true)}
          />
        </div>
      </section>

      {isOpen && (
        <CenteredOverlay
          onClose={() => setIsOpen(false)}
          overlayClassName="bg-[rgba(15,23,42,0.32)] backdrop-blur-sm"
          contentClassName="max-w-6xl"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Medikamenti"
            className="mx-auto w-full overflow-hidden rounded-[12px] border border-[hsl(214,22%,88%)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.16)]"
          >
            <div className="border-b border-[hsl(214,22%,90%)] px-5 py-5 sm:px-6">
              <DashboardCardHeader
                title="Medikamenti"
                infoLabel="Informācija par medikamentiem"
                infoDescription="Aktuālie medikamenti, devas un mijiedarbības"
                infoContent={<MedicationInfoContent />}
              >
                <MedicationSignalLegend />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] text-[hsl(215,14%,42%)] transition hover:bg-[hsl(210,24%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
                  aria-label="Aizvērt medikamentu sarakstu"
                >
                  <X size={18} />
                </button>
              </DashboardCardHeader>
            </div>

            <div className="max-h-[72vh] overflow-y-auto px-5 py-5 sm:px-6">
              <MedicationTableContent mode="full" />
            </div>
          </section>
        </CenteredOverlay>
      )}
    </>
  );
};

export default MedicationTable;
