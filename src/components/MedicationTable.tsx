import { useRef, useState } from "react";
import { AlertTriangle, Pill } from "lucide-react";

type MedicationStatus = "active" | "paused" | "completed";
type InteractionSeverity = "viegla" | "videja";

interface Interaction {
  with: string;
  severity: InteractionSeverity;
  summary: string;
}

interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  status: MedicationStatus;
  interactions: Interaction[];
}

const medications: Medication[] = [
  {
    id: "metformin",
    name: "Metformins",
    dose: "500 mg",
    frequency: "2x diena",
    status: "active",
    interactions: [],
  },
  {
    id: "atorvastatin",
    name: "Atorvastatins",
    dose: "20 mg",
    frequency: "1x diena",
    status: "active",
    interactions: [
      {
        with: "Amlodipins",
        severity: "viegla",
        summary: "Amlodipins var palielinat atorvastatina koncentraciju plazma.",
      },
    ],
  },
  {
    id: "amlodipine",
    name: "Amlodipins",
    dose: "5 mg",
    frequency: "1x diena",
    status: "active",
    interactions: [
      {
        with: "Atorvastatins",
        severity: "viegla",
        summary: "Ieteicama blakusparadibu noverosana.",
      },
    ],
  },
  {
    id: "amoxicillin",
    name: "Amoksicilins",
    dose: "500 mg",
    frequency: "3x diena",
    status: "completed",
    interactions: [],
  },
];

const statusStyles: Record<MedicationStatus, string> = {
  active:
    "border-[rgba(199,223,210,0.96)] bg-[hsl(152,34%,94%)] text-[hsl(152,42%,34%)]",
  paused:
    "border-[rgba(236,221,197,0.96)] bg-[hsl(40,56%,94%)] text-[hsl(34,52%,42%)]",
  completed:
    "border-[rgba(210,219,228,0.96)] bg-[hsl(214,22%,95%)] text-[hsl(220,14%,48%)]",
};

const severityStyles: Record<InteractionSeverity, string> = {
  viegla:
    "border-[rgba(236,221,197,0.96)] bg-[hsl(40,56%,94%)] text-[hsl(34,52%,42%)]",
  videja:
    "border-[rgba(239,208,208,0.96)] bg-[hsl(0,56%,96%)] text-[hsl(0,54%,52%)]",
};

const statusLabels: Record<MedicationStatus, string> = {
  active: "Aktivs",
  paused: "Partraukts",
  completed: "Pabeigts",
};

const severityLabels: Record<InteractionSeverity, string> = {
  viegla: "Viegla",
  videja: "Videja",
};

const columnLabels = {
  name: "Medikaments",
  dose: "Deva",
  frequency: "Biezums",
  status: "Statuss",
};

const headingClass =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(214,14%,56%)]";

const tableGridClass =
  "md:grid-cols-[minmax(0,1.4fr)_0.85fr_0.95fr_0.95fr]";

const sectionIconClass =
  "flex h-10 w-10 items-center justify-center rounded-[14px] border border-[rgba(210,219,228,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,246,249,0.96))] text-[hsl(220,36%,18%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]";

function InteractionOverlay({
  medication,
  cursorPosition,
}: {
  medication: Medication;
  cursorPosition: { x: number; y: number };
}) {
  if (medication.interactions.length === 0) {
    return null;
  }

  const interaction = medication.interactions[0];

  return (
    <div
      className="pointer-events-none absolute z-30 w-[360px] -translate-x-[46%] -translate-y-[calc(100%+18px)]"
      style={{
        left: `${cursorPosition.x}px`,
        top: `${cursorPosition.y}px`,
      }}
    >
      <div className="relative rounded-[14px] border border-[hsl(214,22%,88%)] bg-white px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(214,14%,52%)]">
          Mijiedarbiba
        </p>

        <div className="mb-0.5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] border border-[rgba(236,221,197,0.96)] bg-[hsl(40,56%,94%)] text-[hsl(34,52%,42%)]">
            <AlertTriangle size={15} />
          </div>

          <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[hsl(222,28%,20%)]">
            {medication.name} ↔ {interaction.with}
          </p>

          <span
            className={`inline-flex items-center justify-center rounded-full border px-2 py-1 text-[10px] font-medium leading-none tracking-[0.02em] ${severityStyles[interaction.severity]}`}
          >
            {severityLabels[interaction.severity]}
          </span>
        </div>

        <p className="pl-10 text-[13px] text-[hsl(214,14%,42%)]">
          {interaction.summary}
        </p>
      </div>
    </div>
  );
}

function MedicationRow({
  medication,
  onActivate,
  onPointerMove,
  onDeactivate,
}: {
  medication: Medication;
  onActivate: (medicationId: string, position: { x: number; y: number }) => void;
  onPointerMove: (position: { x: number; y: number }) => void;
  onDeactivate: () => void;
}) {
  const interactive = medication.interactions.length > 0;

  return (
    <div
      className={`grid w-full gap-x-2.5 gap-y-1.5 px-4 py-3.5 text-left transition-colors ${tableGridClass} ${
        interactive ? "cursor-help hover:bg-[hsl(214,20%,99%)]" : ""
      }`}
      onMouseEnter={(event) => {
        if (!interactive) return;
        onActivate(medication.id, {
          x: event.clientX,
          y: event.clientY,
        });
      }}
      onMouseMove={(event) => {
        if (!interactive) return;
        onPointerMove({
          x: event.clientX,
          y: event.clientY,
        });
      }}
      onMouseLeave={() => {
        if (!interactive) return;
        onDeactivate();
      }}
    >
      <div className="min-w-0">
        <p className={`mb-1 md:hidden ${headingClass}`}>{columnLabels.name}</p>
        <p className="truncate text-[11px] font-semibold leading-tight text-[hsl(222,28%,20%)]">
          {medication.name}
          {medication.interactions.length > 0 && (
            <span className="ml-1 text-[hsl(34,52%,42%)]">*</span>
          )}
        </p>
      </div>

      <div>
        <p className={`mb-1 md:hidden ${headingClass}`}>{columnLabels.dose}</p>
        <p className="text-[11px] text-[hsl(214,18%,36%)]">{medication.dose}</p>
      </div>

      <div>
        <p className={`mb-1 md:hidden ${headingClass}`}>{columnLabels.frequency}</p>
        <p className="text-[11px] text-[hsl(214,18%,36%)]">{medication.frequency}</p>
      </div>

      <div className="flex items-center md:justify-end">
        <div className="flex flex-col items-start md:items-end">
          <p className={`mb-1 md:hidden ${headingClass}`}>{columnLabels.status}</p>
          <span
            className={`inline-flex min-w-[72px] items-center justify-center rounded-full border px-2 py-1 text-[9px] font-medium leading-none tracking-[0.02em] ${statusStyles[medication.status]}`}
          >
            {statusLabels[medication.status]}
          </span>
        </div>
      </div>
    </div>
  );
}

const MedicationTable = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredMedicationId, setHoveredMedicationId] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const hoveredMedication =
    medications.find((medication) => medication.id === hoveredMedicationId) ?? null;

  const updateCursorPosition = (position: { x: number; y: number }) => {
    const container = containerRef.current;

    if (!container) {
      setCursorPosition(position);
      return;
    }

    const rect = container.getBoundingClientRect();
    const localX = position.x - rect.left;
    const localY = position.y - rect.top;
    const cardHalfWidth = 180;
    const horizontalPadding = 18;

    setCursorPosition({
      x: Math.min(
        Math.max(localX, cardHalfWidth + horizontalPadding),
        rect.width - cardHalfWidth - horizontalPadding,
      ),
      y: Math.max(localY, 80),
    });
  };

  return (
    <section className="flex h-full flex-col rounded-[16px] border border-[hsl(214,22%,88%)] bg-white p-4 shadow-[0_8px_18px_rgba(29,53,87,0.05)]">
      <div className="mb-3.5 flex items-center gap-3">
        <div className={sectionIconClass}>
          <Pill size={18} className="text-current" />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[hsl(214,18%,44%)]">
            Medikamenti
          </p>
          <p className="text-xs text-[hsl(214,14%,50%)]">
            Aktualie medikamenti, devas un mijiedarbibas
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 overflow-visible rounded-[14px] border border-[hsl(214,22%,88%)] bg-[hsl(214,20%,98%)]"
      >
        <div
          className={`hidden gap-x-2.5 border-b border-[hsl(214,22%,88%)] bg-[hsl(214,20%,96%)] px-4 py-2.5 md:grid ${tableGridClass}`}
        >
          <p className={headingClass}>{columnLabels.name}</p>
          <p className={headingClass}>{columnLabels.dose}</p>
          <p className={headingClass}>{columnLabels.frequency}</p>
          <div className="flex items-center md:justify-end md:pr-4">
            <p className={headingClass}>{columnLabels.status}</p>
          </div>
        </div>

        <div className="divide-y divide-[hsl(214,22%,88%)]">
          {medications.map((medication) => (
            <MedicationRow
              key={medication.id}
              medication={medication}
              onActivate={(medicationId, position) => {
                setHoveredMedicationId(medicationId);
                updateCursorPosition(position);
              }}
              onPointerMove={updateCursorPosition}
              onDeactivate={() => setHoveredMedicationId(null)}
            />
          ))}
        </div>

        {hoveredMedication && (
          <InteractionOverlay
            medication={hoveredMedication}
            cursorPosition={cursorPosition}
          />
        )}
      </div>
    </section>
  );
};

export default MedicationTable;
