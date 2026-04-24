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
    name: "Metformīns",
    dose: "500 mg",
    frequency: "2x dienā",
    status: "active",
    interactions: [],
  },
  {
    id: "atorvastatin",
    name: "Atorvastatīns",
    dose: "20 mg",
    frequency: "1x dienā",
    status: "active",
    interactions: [
      {
        with: "Amlodipīns",
        severity: "viegla",
        summary: "Amlodipīns var palielināt atorvastatīna koncentrāciju plazmā.",
      },
    ],
  },
  {
    id: "amlodipine",
    name: "Amlodipīns",
    dose: "5 mg",
    frequency: "1x diena",
    status: "active",
    interactions: [
      {
        with: "Atorvastatīns",
        severity: "viegla",
        summary: "Ieteicama blakusparādību novērošana.",
      },
    ],
  },
  {
    id: "amoxicillin",
    name: "Amoksicilīns",
    dose: "500 mg",
    frequency: "3x diena",
    status: "completed",
    interactions: [
    ],
  },
];

const statusStyles: Record<MedicationStatus, string> = {
  active:
    "border-white/45 bg-[linear-gradient(180deg,hsla(191,70%,92%,0.72),hsla(191,58%,88%,0.5))] text-[hsl(191,52%,36%)] shadow-[inset_0_1px_0_hsla(0,0%,100%,0.7)] backdrop-blur-md",
  paused:
    "border-white/45 bg-[linear-gradient(180deg,hsla(36,100%,94%,0.78),hsla(35,92%,90%,0.52))] text-[hsl(33,82%,48%)] shadow-[inset_0_1px_0_hsla(0,0%,100%,0.72)] backdrop-blur-md",
  completed:
    "border-white/40 bg-[linear-gradient(180deg,hsla(213,20%,96%,0.82),hsla(213,18%,91%,0.56))] text-[hsl(215,12%,50%)] shadow-[inset_0_1px_0_hsla(0,0%,100%,0.68)] backdrop-blur-md",
};

const severityStyles: Record<InteractionSeverity, string> = {
  viegla:
    "border-white/45 bg-[linear-gradient(180deg,hsla(191,70%,92%,0.72),hsla(191,58%,88%,0.5))] text-[hsl(191,52%,36%)] shadow-[inset_0_1px_0_hsla(0,0%,100%,0.7)] backdrop-blur-md",
  videja:
    "border-white/45 bg-[linear-gradient(180deg,hsla(36,100%,94%,0.78),hsla(35,92%,90%,0.52))] text-[hsl(33,82%,48%)] shadow-[inset_0_1px_0_hsla(0,0%,100%,0.72)] backdrop-blur-md",
};

const statusLabels: Record<MedicationStatus, string> = {
  active: "Aktīvs",
  paused: "Pārtraukts",
  completed: "Pabeigts",
};

const severityLabels: Record<InteractionSeverity, string> = {
  viegla: "Viegla",
  videja: "Vidēja",
};

const columnLabels = {
  name: "Medikaments",
  dose: "Deva",
  frequency: "Biežums",
  status: "Statuss",
};

const headingClass =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-heading";

const tableGridClass =
  "md:grid-cols-[minmax(0,1.4fr)_0.85fr_0.95fr_0.95fr]";

const sectionIconClass =
  "flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsla(210,62%,82%,0.42)] bg-[radial-gradient(circle_at_top,hsla(0,100%,100%,0.98),hsla(210,92%,96%,0.96)_48%,hsla(210,78%,92%,0.88))] text-[hsl(210,60%,45%)] shadow-[0_0_0_1px_hsla(0,100%,100%,0.22),0_12px_30px_hsla(210,80%,76%,0.18)]";
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
      <div className="relative rounded-xl border border-[hsla(215,24%,25%,0.28)] bg-[hsla(0,0%,100%,0.995)] px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.16)]">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(215,18%,52%)]">
          Mijiedarbība
        </p>

        <div className="mb-0.5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(36,100%,95%)] text-[hsl(33,90%,52%)]">
            <AlertTriangle size={15} />
          </div>

          <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-text-dark">
            {medication.name} ↔ {interaction.with}
          </p>

          <span
            className={`inline-flex items-center justify-center rounded-full border px-2 py-1 text-[10px] font-medium leading-none tracking-[0.02em] ${severityStyles[interaction.severity]}`}
          >
            {severityLabels[interaction.severity]}
          </span>
        </div>

        <p className="pl-10 text-[13px] text-[hsl(215,18%,42%)]">
          {interaction.summary}
        </p>

        <div className="absolute left-1/2 top-full -translate-x-1/2">
          <div className="h-0 w-0 border-l-[11px] border-r-[11px] border-t-[11px] border-l-transparent border-r-transparent border-t-[hsla(215,24%,25%,0.42)]" />
          <div className="absolute left-1/2 top-[-1px] h-0 w-0 -translate-x-1/2 border-l-[9px] border-r-[9px] border-t-[9px] border-l-transparent border-r-transparent border-t-[hsla(0,0%,100%,0.995)]" />
        </div>
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
      className={`grid w-full gap-x-2.5 gap-y-1.5 px-4 py-3.5 text-left transition-colors ${tableGridClass} ${interactive ? "cursor-help hover:bg-[hsl(202,64%,97%)]" : ""
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
        <p className="truncate text-[11px] font-semibold leading-tight text-text-dark">
          {medication.name}
          {medication.interactions.length > 0 && (
            <span className="ml-1 text-[hsl(33,82%,48%)]">*</span>
          )}
        </p>
      </div>

      <div>
        <p className={`mb-1 md:hidden ${headingClass}`}>{columnLabels.dose}</p>
        <p className="text-[11px] text-text-dark">{medication.dose}</p>
      </div>

      <div>
        <p className={`mb-1 md:hidden ${headingClass}`}>{columnLabels.frequency}</p>
        <p className="text-[11px] text-text-dark">{medication.frequency}</p>
      </div>

      <div className="flex items-center md:justify-end">
        <div className="flex flex-col items-start md:items-end">
          <p className={`mb-1 md:hidden ${headingClass}`}>{columnLabels.status}</p>
          <span
            className={`inline-flex min-w-[68px] items-center justify-center rounded-full border px-1.5 py-0.5 text-[9px] font-medium leading-none tracking-[0.02em] ${statusStyles[medication.status]}`}
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
    <section className="flex h-full flex-col rounded-2xl border border-white/75 bg-[linear-gradient(180deg,hsla(0,0%,100%,0.96),hsla(195,42%,99%,0.84))] p-4 shadow-[0_10px_24px_hsl(var(--glass-shadow))] backdrop-blur-xl">
      <div className="mb-3.5 flex items-center gap-3">
        <div className={sectionIconClass}>
          <Pill size={18} className="text-current" />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-heading">
            Medikamenti
          </p>
          <p className="text-xs text-heading">
            Aktuālie medikamenti, devas un mijiedarbības
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 overflow-visible rounded-xl border border-[hsl(210,24%,90%)] bg-[linear-gradient(180deg,hsla(0,0%,100%,0.9),hsla(205,34%,97%,0.8))] shadow-[inset_0_1px_0_hsla(0,0%,100%,0.8)]"
      >
        <div
          className={`hidden gap-x-2.5 border-b border-[hsl(208,28%,89%)] bg-[linear-gradient(180deg,hsl(204,56%,97%),hsl(208,40%,95%))] px-4 py-2.5 md:grid ${tableGridClass}`}
        >
          <p className={headingClass}>{columnLabels.name}</p>
          <p className={headingClass}>{columnLabels.dose}</p>
          <p className={headingClass}>{columnLabels.frequency}</p>
          <div className="flex items-center md:justify-end md:pr-4">
            <p className={headingClass}>{columnLabels.status}</p>
          </div>
        </div>

        <div className="divide-y divide-[hsl(208,28%,89%)]">
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

      <p className="mt-4 ml-1 text-[10px] leading-4 text-muted-foreground">
        Novietojiet kursoru uz rindas ar <span className="text-[hsl(33,82%,48%)] font-semibold">*</span>, lai skatītu mijiedarbības
      </p>
    </section>
  );
};

export default MedicationTable;
