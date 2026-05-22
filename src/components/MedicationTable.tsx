import { useRef, useState } from "react";
import { AlertTriangle, Clock3, Pill, X } from "lucide-react";

import { CenteredOverlay } from "@/components/ui/centered-overlay";

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
    startDate: "15.08.2023",
    endDate: "15.11.2023",
    prescribedBy: "Dr. Anna Kalniņa",
    interactions: [],
    duplicate: null,
  },
];

const statusStyles: Record<MedicationStatus, string> = {
  active:
    "border-[rgba(199,223,210,0.96)] bg-[hsl(152,34%,94%)] text-[hsl(152,42%,34%)]",
  historical:
    "border-[rgba(210,219,228,0.96)] bg-[hsl(214,22%,95%)] text-[hsl(220,14%,48%)]",
};

const statusLabels: Record<MedicationStatus, string> = {
  active: "Aktīvs",
  historical: "Vēsturisks",
};

const columnLabels = {
  name: "Medikaments",
  dose: "Deva",
  frequency: "Biežums",
  status: "Statuss",
  startDate: "Sākuma datums",
  endDate: "Beigu datums",
  prescribedBy: "Nozīmējis ārsts",
};

const headingClass =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(214,14%,56%)]";

const compactTableGridClass =
  "md:grid-cols-[minmax(0,1.4fr)_0.85fr_0.95fr_0.95fr]";

const fullTableGridClass =
  "md:grid-cols-[minmax(0,1.8fr)_0.85fr_0.9fr_1fr_1fr_1fr_1.15fr]";

const sectionIconClass =
  "flex h-10 w-10 items-center justify-center rounded-[10px] border border-[rgba(210,219,228,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,246,249,0.96))] text-[hsl(220,36%,18%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]";

const interactionBadgeClass =
  "inline-flex items-center gap-1.5 rounded-full border border-[rgba(236,221,197,0.96)] bg-[hsl(40,56%,97%)] px-2.5 py-1 text-[10px] font-medium text-[hsl(34,52%,42%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]";

const duplicateBadgeClass =
  "inline-flex items-center gap-1.5 rounded-full border border-[rgba(239,208,208,0.96)] bg-[hsl(0,56%,97%)] px-2.5 py-1 text-[10px] font-medium text-[hsl(0,54%,52%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]";

const compactSignalBadgeClass = "shrink-0 gap-1 px-1.5 py-0.5 text-[8px] [&>svg]:h-[10px] [&>svg]:w-[10px]";
const fullSignalBadgeClass = "shrink-0 gap-1 px-1.5 py-0.5 text-[8px] [&>svg]:h-[10px] [&>svg]:w-[10px]";
const interactionOverlayOffsetX = -8;
const interactionOverlayOffsetY = 18;

function MedicationSignalOverlay({
  medication,
  overlayPosition,
}: {
  medication: Medication;
  overlayPosition: { x: number; y: number };
}) {
  if (medication.interactions.length === 0 && !medication.duplicate) return null;

  return (
    <div
      className="pointer-events-none absolute z-30 w-[360px] -translate-x-1/2 -translate-y-[calc(100%-18px)]"
      style={{
        left: `${overlayPosition.x + interactionOverlayOffsetX}px`,
        top: `${overlayPosition.y + interactionOverlayOffsetY}px`,
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
                <p className="text-[10px] font-semibold text-[hsl(34,52%,42%)]">
                  Mijiedarbība
                </p>
              </div>

              <p className="text-[14px] font-semibold text-[hsl(222,28%,20%)]">
                {medication.name} ↔ {interaction.with}
              </p>

              <p className="mt-2 text-[13px] leading-6 text-[hsl(214,14%,42%)]">
                {interaction.summary}
              </p>
            </div>
          ))}

          {medication.duplicate ? (
            <div className={medication.interactions.length > 0 ? "pt-4" : ""}>
              <div className="mb-2">
                <p className="text-[10px] font-semibold text-[hsl(0,54%,52%)]">
                  Dublēts
                </p>
              </div>

              <p className="text-[14px] font-semibold text-[hsl(222,28%,20%)]">
                {medication.name} ↔ {medication.duplicate.with}
              </p>

              <p className="mt-2 text-[13px] leading-6 text-[hsl(214,14%,42%)]">
                {medication.duplicate.summary}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
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
  onActivate: (medicationId: string, rowElement: HTMLDivElement) => void;
  onPointerMove: (rowElement: HTMLDivElement) => void;
  onDeactivate: () => void;
}) {
  const isFullMode = mode === "full";
  const tableGridClass =
    isFullMode ? fullTableGridClass : compactTableGridClass;
  const hasSignals =
    medication.interactions.length > 0 || Boolean(medication.duplicate);

  return (
    <div
      className={`grid w-full gap-x-2.5 gap-y-1.5 px-4 py-3.5 text-left transition-colors md:items-start ${hasSignals ? "cursor-help hover:bg-[hsl(214,20%,99%)]" : ""} ${tableGridClass}`}
      onMouseEnter={(event) => {
        if (!hasSignals) return;
        onActivate(medication.id, event.currentTarget);
      }}
      onMouseMove={(event) => {
        if (!hasSignals) return;
        onPointerMove(event.currentTarget);
      }}
      onMouseLeave={() => {
        if (!hasSignals) return;
        onDeactivate();
      }}
    >
      <div className="min-w-0">
        <p className={`mb-1 md:hidden ${headingClass}`}>{columnLabels.name}</p>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold leading-tight text-[hsl(222,28%,20%)]">
            {medication.name}
          </p>

          {hasSignals && (
            <div
              className={`mt-2.5 flex items-center gap-2 ${
                isFullMode ? "flex-nowrap whitespace-nowrap" : "flex-nowrap whitespace-nowrap"
              }`}
            >
              {medication.interactions.length > 0 && (
                <span
                  className={`${interactionBadgeClass} ${
                    isFullMode ? fullSignalBadgeClass : compactSignalBadgeClass
                  }`}
                >
                  <AlertTriangle size={12} strokeWidth={2} />
                  Mijiedarbība
                </span>
              )}

              {medication.duplicate && (
                <span
                  className={`${duplicateBadgeClass} ${
                    isFullMode ? fullSignalBadgeClass : compactSignalBadgeClass
                  }`}
                >
                  <AlertTriangle size={12} strokeWidth={2} />
                  Dublēts
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <p className={`mb-1 md:hidden ${headingClass}`}>{columnLabels.dose}</p>
        <p className="text-[11px] text-[hsl(214,18%,36%)]">{medication.dose}</p>
      </div>

      <div>
        <p className={`mb-1 md:hidden ${headingClass}`}>
          {columnLabels.frequency}
        </p>
        <p className="text-[11px] text-[hsl(214,18%,36%)]">
          {medication.frequency}
        </p>
      </div>

      <div
        className={`flex self-start pt-0.5 ${isFullMode ? "md:justify-start" : "md:justify-center"}`}
      >
        <div
          className={`flex flex-col items-start ${isFullMode ? "md:items-start" : "md:items-center"}`}
        >
          <p className={`mb-1 md:hidden ${headingClass}`}>
            {columnLabels.status}
          </p>
          <span
            className={`inline-flex items-center justify-center rounded-full border px-1.5 py-1 text-[9px] font-medium leading-none tracking-[0.02em] ${statusStyles[medication.status]}`}
          >
            {statusLabels[medication.status]}
          </span>
        </div>
      </div>

      {mode === "full" && (
        <>
          <div>
            <p className={`mb-1 md:hidden ${headingClass}`}>
              {columnLabels.startDate}
            </p>
            <p className="text-[11px] text-[hsl(214,18%,36%)]">
              {medication.startDate}
            </p>
          </div>

          <div>
            <p className={`mb-1 md:hidden ${headingClass}`}>
              {columnLabels.endDate}
            </p>
            <p className="text-[11px] text-[hsl(214,18%,36%)]">
              {medication.endDate}
            </p>
          </div>

          <div className="min-w-0">
            <p className={`mb-1 md:hidden ${headingClass}`}>
              {columnLabels.prescribedBy}
            </p>
            <p className="truncate text-[11px] text-[hsl(214,18%,36%)]">
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
}: {
  mode?: MedicationTableMode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredMedicationId, setHoveredMedicationId] = useState<string | null>(
    null,
  );
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });

  const activeMedications = medications.filter(
    (medication) => medication.status === "active",
  );

  const historicalMedications = medications.filter(
    (medication) => medication.status === "historical",
  );

  const hoveredMedication =
    medications.find((medication) => medication.id === hoveredMedicationId) ??
    null;

  const tableGridClass =
    mode === "full" ? fullTableGridClass : compactTableGridClass;
  const isFullMode = mode === "full";

  const updateOverlayPosition = (rowElement: HTMLDivElement) => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const rowRect = rowElement.getBoundingClientRect();
    const localX = rowRect.left - containerRect.left + rowRect.width / 2;
    const localY = rowRect.top - containerRect.top;
    const overlayHalfWidth = 180;
    const horizontalPadding = 18;

    setOverlayPosition({
      x: Math.min(
        Math.max(localX, overlayHalfWidth + horizontalPadding),
        containerRect.width - overlayHalfWidth - horizontalPadding,
      ),
      y: Math.max(localY, 80),
    });
  };

  return (
    <>
      <div
        ref={containerRef}
        className="relative overflow-visible rounded-[10px] border border-[hsl(214,22%,88%)] bg-white"
      >
        <div
          className={`hidden gap-x-2.5 border-b border-[hsl(214,22%,88%)] bg-[hsl(214,20%,96%)] px-4 py-2.5 md:grid ${tableGridClass}`}
        >
          <p className={headingClass}>{columnLabels.name}</p>
          <p className={headingClass}>{columnLabels.dose}</p>
          <p className={headingClass}>{columnLabels.frequency}</p>
          <div
            className={`flex items-center ${isFullMode ? "md:justify-start" : "md:justify-center"}`}
          >
            <p className={headingClass}>{columnLabels.status}</p>
          </div>

          {mode === "full" && (
            <>
              <p className={headingClass}>{columnLabels.startDate}</p>
              <p className={headingClass}>{columnLabels.endDate}</p>
              <p className={headingClass}>{columnLabels.prescribedBy}</p>
            </>
          )}
        </div>

        <div className="divide-y divide-[hsl(214,22%,88%)]">
          {activeMedications.map((medication) => (
            <MedicationRow
              key={medication.id}
              medication={medication}
              mode={mode}
              onActivate={(medicationId, rowElement) => {
                setHoveredMedicationId(medicationId);
                updateOverlayPosition(rowElement);
              }}
              onPointerMove={updateOverlayPosition}
              onDeactivate={() => setHoveredMedicationId(null)}
            />
          ))}

          {historicalMedications.length > 0 && (
            <div className="bg-[hsl(214,20%,96%)] px-4 py-1.5">
              <div className="inline-flex items-center gap-2 text-[hsl(214,14%,56%)]">
                <Clock3 className="h-3.5 w-3.5" strokeWidth={1.8} />
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-current">
                  Vēsturiskie medikamenti
                </p>
              </div>
            </div>
          )}

          {historicalMedications.map((medication) => (
            <MedicationRow
              key={medication.id}
              medication={medication}
              mode={mode}
              onActivate={(medicationId, rowElement) => {
                setHoveredMedicationId(medicationId);
                updateOverlayPosition(rowElement);
              }}
              onPointerMove={updateOverlayPosition}
              onDeactivate={() => setHoveredMedicationId(null)}
            />
          ))}
        </div>

        {hoveredMedication ? (
          <MedicationSignalOverlay
            medication={hoveredMedication}
            overlayPosition={overlayPosition}
          />
        ) : null}
      </div>
    </>
  );
}

const MedicationTable = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="flex h-full flex-col rounded-[6px] border border-[hsl(214,22%,88%)] bg-white p-4 shadow-[0_8px_18px_rgba(29,53,87,0.05)]">
        <div className="mb-3.5 flex items-center gap-3">
          <div className={sectionIconClass}>
            <Pill size={18} className="text-current" />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[hsl(214,18%,44%)]">
              Medikamenti
            </p>
            <p className="text-xs text-[hsl(214,14%,50%)]">
              Aktuālie medikamenti, devas un mijiedarbības
            </p>
          </div>
        </div>

        <div className="flex-1">
          <MedicationTableContent mode="compact" />
        </div>

        <div className="mt-auto border-t border-[hsl(214,22%,88%)] pt-3 text-center">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center text-[12px] font-semibold text-[hsl(220,36%,18%)] transition hover:opacity-70"
          >
            Skatīt visus medikamentus →
          </button>
        </div>
      </section>

      {isOpen && (
        <CenteredOverlay
          onClose={() => setIsOpen(false)}
          overlayClassName="bg-[rgba(241,245,249,0.78)] backdrop-blur-[10px]"
          contentClassName="max-w-6xl"
        >
          <div className="relative mx-auto w-full overflow-hidden rounded-[14px] border border-[hsl(214,22%,88%)] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.12)]">
            <div className="border-b border-[hsl(214,22%,88%)] px-6 py-5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[hsl(214,20%,96%)] text-[hsl(215,14%,55%)] transition hover:text-[hsl(215,22%,28%)]"
                aria-label="Aizvērt"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 pr-12">
                <div className={sectionIconClass}>
                  <Pill size={18} className="text-current" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[hsl(222,28%,20%)]">
                    Visi medikamenti
                  </h3>
                  <p className="text-sm text-[hsl(214,14%,42%)]">
                    Pilns medikamentu saraksts ar vēsturiskajiem ierakstiem.
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-[78vh] overflow-y-auto px-6 py-5">
              <MedicationTableContent mode="full" />
            </div>
          </div>
        </CenteredOverlay>
      )}
    </>
  );
};

export default MedicationTable;
