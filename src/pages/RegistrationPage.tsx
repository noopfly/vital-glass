import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Baby,
  Bone,
  Brain,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronUp,
  Dna,
  FileText,
  GripVertical,
  Heart,
  HeartPulse,
  ImageIcon,
  Info,
  Pill,
  Radiation,
  ScanLine,
  Search,
  Stethoscope,
  UserRound,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type StepDefinition = {
  title: string;
  subtitle: string;
};

type ModuleId =
  | "patient-card"
  | "health-trends"
  | "imaging"
  | "medications"
  | "alerts"
  | "timeline"
  | "body-model"
  | "referrals"

type DashboardComponentKey =
  | "patientCard"
  | "healthTrends"
  | "medicalImagingViewer"
  | "medicationTable"
  | "alertsCard"
  | "eventTimeline"
  | "humanBodyModel"
  | "referralHistory"

type SpecialtyId =
  | "family-medicine"
  | "cardiology"
  | "endocrinology"
  | "vascular-surgery"
  | "neurology"
  | "oncology"
  | "pulmonology"
  | "gastroenterology"
  | "dermatology"
  | "orthopedics"
  | "psychiatry"
  | "pediatrics";

type ModuleOption = {
  id: ModuleId;
  title: string;
  description: string;
  icon: LucideIcon;
};

type SpecialtyOption = {
  id: SpecialtyId;
  title: string; 
  icon: LucideIcon;
  modules: ModuleId[];
};

type RegistrationForm = {
  specialty: SpecialtyId | null;
  modules: ModuleId[];
  layoutOrder: ModuleId[];
};

type PreviewPattern =
  | "profile"
  | "trend"
  | "imaging"
  | "table"
  | "alerts"
  | "body"
  | "timeline"
  | "summary";

type ModulePreviewDefinition = {
  note: string;
  summary: string;
  pattern: PreviewPattern;
  colSpan: 1 | 2 | 3;
  rowSpan: 1 | 2;
  previewClassName: string;
  surfaceClassName: string;
};

const steps: StepDefinition[] = [
  { title: "01", subtitle: "Specialitāte" },
  { title: "02", subtitle: "Darba panelis" },
];

const moduleOptions: ModuleOption[] = [
  {
    id: "patient-card",
    title: "Pacienta klīniskais profils",
    description: "Pamatinformācija, diagnozes un primārie riski",
    icon: UserRound,
  },
  {
    id: "health-trends",
    title: "Klīniskie rādītāji",
    description: "Laboratorijas rezultātu un mērījumu dinamika",
    icon: Activity,
  },
  {
    id: "imaging",
    title: "Attēldiagnostika",
    description: "RTG, CT un citu izmeklējumu pārskats",
    icon: ImageIcon,
  },
  {
    id: "medications",
    title: "Medikamenti",
    description: "Aktuālie medikamenti, devas un mijiedarbības",
    icon: Pill,
  },
  {
    id: "alerts",
    title: "Brīdinājumi",
    description: "Izmaiņas, kavējumi un kritiskie signāli",
    icon: AlertTriangle,
  },
  {
    id: "timeline",
    title: "Notikumu laika līnija",
    description: "Hronoloģisks pacienta notikumu pārskats",
    icon: CalendarClock,
  },
  {
    id: "body-model",
    title: "Ķermeņa pārskats",
    description: "Anatomiskais skats ar atradnēm un reģioniem",
    icon: UserRound,
  },
  {
    id: "referrals",
    title: "E-nosūtījumi",
    description: "Aktīvie un vēsturiskie nosūtījumi",
    icon: FileText,
  },

];

const sharedRegistrationModules: ModuleId[] = [
  "patient-card",
  "health-trends",
  "alerts",
  "imaging",
  "body-model",
  "medications",
  "referrals",
  "timeline",
];

const specialtyOptions: SpecialtyOption[] = [
  {
    id: "family-medicine",
    title: "Ģimenes ārsts",
    icon: Stethoscope,
    modules: sharedRegistrationModules,
  },
  {
    id: "cardiology",
    title: "Kardiologs",
    icon: Heart,
    modules: sharedRegistrationModules,
  },
  {
    id: "endocrinology",
    title: "Endokrinologs",
    icon: Dna,
    modules: sharedRegistrationModules,
  },
  {
    id: "vascular-surgery",
    title: "Asinsvadu ķirurgs",
    icon: HeartPulse,
    modules: sharedRegistrationModules,
  },
  {
    id: "neurology",
    title: "Neirologs",
    icon: Brain,
    modules: sharedRegistrationModules,
  },
  {
    id: "oncology",
    title: "Onkologs",
    icon: Radiation,
    modules: sharedRegistrationModules,
  },
  {
    id: "pulmonology",
    title: "Pulmonologs",
    icon: Wind,
    modules: sharedRegistrationModules,
  },
  {
    id: "gastroenterology",
    title: "Gastroenterologs",
    icon: ScanLine,
    modules: sharedRegistrationModules,
  },
  {
    id: "dermatology",
    title: "Dermatologs",
    icon: UserRound,
    modules: sharedRegistrationModules,
  },
  {
    id: "orthopedics",
    title: "Ortopēds",
    icon: Bone,
    modules: sharedRegistrationModules,
  },
  {
    id: "psychiatry",
    title: "Psihiatrs",
    icon: Brain,
    modules: sharedRegistrationModules,
  },
  {
    id: "pediatrics",
    title: "Pediatrs",
    icon: Baby,
    modules: sharedRegistrationModules,
  },
];

const defaultLayoutOrder: ModuleId[] = [
  "patient-card",
  "health-trends",
  "alerts",
  "imaging",
  "body-model",
  "medications",
  "referrals",
  "timeline",
];

const moduleIdToDashboardComponentKey: Record<ModuleId, DashboardComponentKey> = {
  "patient-card": "patientCard",
  "health-trends": "healthTrends",
  alerts: "alertsCard",
  imaging: "medicalImagingViewer",
  "body-model": "humanBodyModel",
  medications: "medicationTable",
  referrals: "referralHistory",
  timeline: "eventTimeline",
};

const previewCardInfo: Record<ModuleId, { note: string; summary: string }> = {
  "patient-card": {
    note: "Pacienta profils",
    summary: "Personas dati, diagnozes un primārie riski.",
  },
  "health-trends": {
    note: "Klīniskie rādītāji",
    summary: "Pulss, glikoze un asinsspiediens 30 dienu griezumā.",
  },
  imaging: {
    note: "Attēli",
    summary: "RTG un CT atradnes ar jaunāko aprakstu.",
  },
  medications: {
    note: "Medikamenti",
    summary: "Aktuālie medikamenti, devas un mijiedarbību signāli.",
  },
  alerts: {
    note: "Brīdinājumi",
    summary: "Nokavētas vizītes un izmainīti laboratorijas rezultāti.",
  },
  timeline: {
    note: "Notikuma laika līnija",
    summary: "Vizīšu, analīžu un procedūru hronoloģiskā secība.",
  },
  "body-model": {
    note: "Ķermeņa pārskats",
    summary: "Anatomiskais skats ar atradnēm un saistītajiem reģioniem.",
  },
  referrals: {
    note: "E-nosūtījumi",
    summary: "Nosūtījumi un iepriekšējās speciālistu konsultācijas.",
  },
};

const modulePreviewDefinitions: Record<ModuleId, ModulePreviewDefinition> = {
  "patient-card": {
    note: "Pacienta profils",
    summary: "Personas dati, diagnozes un primārie riski.",
    pattern: "profile",
    colSpan: 3,
    rowSpan: 1,
    previewClassName: "col-span-3",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  "health-trends": {
    note: "Klīniskie rādītāji",
    summary: "Pulss, glikoze un asinsspiediens un citi rādītāji dinamikā.",
    pattern: "trend",
    colSpan: 2,
    rowSpan: 1,
    previewClassName: "col-span-2",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  imaging: {
    note: "Attēldiagnostika",
    summary: "RTG un CT atradnes ar jaunāko aprakstu.",
    pattern: "imaging",
    colSpan: 1,
    rowSpan: 1,
    previewClassName: "",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  medications: {
    note: "Medikamenti",
    summary: "Aktuālie medikamenti, devas un mijiedarbību signāli.",
    pattern: "table",
    colSpan: 1,
    rowSpan: 1,
    previewClassName: "",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  alerts: {
    note: "Brīdinājumi",
    summary: "Nokavētas vizītes un izmainīti laboratorijas rezultāti.",
    pattern: "alerts",
    colSpan: 1,
    rowSpan: 1,
    previewClassName: "",
    surfaceClassName:
      "border-[rgba(239,203,203,0.96)] bg-[hsl(0,60%,97%)] shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  timeline: {
    note: "Notikuma laika līnija",
    summary: "Vizīšu, analīžu un procedūru hronoloģiskā secība.",
    pattern: "timeline",
    colSpan: 3,
    rowSpan: 1,
    previewClassName: "col-span-3",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  "body-model": {
    note: "Ķermeņa pārskats",
    summary: "Anatomiskais skats ar atradnēm un saistītajiem reģioniem.",
    pattern: "body",
    colSpan: 1,
    rowSpan: 1,
    previewClassName: "",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  referrals: {
    note: "E-nosūtījumi",
    summary: "Nosūtījumi un iepriekšējās speciālistu konsultācijas.",
    pattern: "table",
    colSpan: 1,
    rowSpan: 1,
    previewClassName: "",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
};

const initialForm: RegistrationForm = {
  specialty: null,
  modules: [],
  layoutOrder: defaultLayoutOrder,
};

type ModulePlacement = {
  id: ModuleId;
  row: number;
};

function computeModulePlacements(moduleIds: ModuleId[]): ModulePlacement[] {
  const occupied = new Set<string>();
  const columns = 3;

  const canPlace = (
    row: number,
    column: number,
    colSpan: number,
    rowSpan: number,
  ) => {
    if (column + colSpan - 1 > columns) {
      return false;
    }

    for (let currentRow = row; currentRow < row + rowSpan; currentRow += 1) {
      for (
        let currentColumn = column;
        currentColumn < column + colSpan;
        currentColumn += 1
      ) {
        if (occupied.has(`${currentRow}:${currentColumn}`)) {
          return false;
        }
      }
    }

    return true;
  };

  const markOccupied = (
    row: number,
    column: number,
    colSpan: number,
    rowSpan: number,
  ) => {
    for (let currentRow = row; currentRow < row + rowSpan; currentRow += 1) {
      for (
        let currentColumn = column;
        currentColumn < column + colSpan;
        currentColumn += 1
      ) {
        occupied.add(`${currentRow}:${currentColumn}`);
      }
    }
  };

  return moduleIds.map((id) => {
    const definition = modulePreviewDefinitions[id];

    for (let row = 1; row < 100; row += 1) {
      for (let column = 1; column <= columns; column += 1) {
        if (canPlace(row, column, definition.colSpan, definition.rowSpan)) {
          markOccupied(row, column, definition.colSpan, definition.rowSpan);
          return { id, row };
        }
      }
    }

    return { id, row: 100 };
  });
}

function PreviewCard({
  item,
  index,
}: {
  item: ModuleOption;
  index: number;
}) {
  const preview = modulePreviewDefinitions[item.id];

  return (
      <div
      className={cn(
        "overflow-hidden rounded-[14px] border p-2",
        preview.previewClassName,
        preview.surfaceClassName,
      )}
    >
      <div className="flex items-center justify-between gap-1.5">
        <div className="min-w-0 pr-1">
          <p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-[hsl(214,16%,58%)]">
            {preview.note}
          </p>
        </div>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[9px] bg-[hsl(214,20%,96%)] text-[9px] font-semibold text-[hsl(214,16%,48%)]">
          {index + 1}
        </span>
      </div>

      <div className="mt-2">
        {preview.pattern === "profile" && (
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-[10px] bg-[hsl(214,20%,90%)]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-[34%] bg-[hsl(214,18%,88%)]" />
                <div className="h-2.5 w-[48%] bg-[hsl(214,20%,93%)]" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="h-8 rounded-[10px] bg-[hsl(214,20%,95%)]" />
              <div className="h-8 rounded-[10px] bg-[hsl(214,20%,95%)]" />
              <div className="h-8 rounded-[10px] bg-[hsl(214,20%,95%)]" />
              <div className="h-8 rounded-[10px] bg-[hsl(214,20%,95%)]" />
            </div>
          </div>
        )}

        {preview.pattern === "trend" && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
              <div className="rounded-[10px] bg-[hsl(214,20%,97%)] p-1.5">
                <div className="h-2 w-[62%] bg-[hsl(214,18%,88%)]" />
                <div className="mt-1.5 h-3 w-[44%] bg-[hsl(214,20%,82%)]" />
              </div>
              <div className="rounded-[10px] bg-[hsl(214,20%,97%)] p-1.5">
                <div className="h-2 w-[58%] bg-[hsl(214,18%,88%)]" />
                <div className="mt-1.5 h-3 w-[36%] bg-[hsl(214,20%,82%)]" />
              </div>
              <div className="rounded-[10px] bg-[hsl(214,20%,97%)] p-1.5">
                <div className="h-2 w-[54%] bg-[hsl(214,18%,88%)]" />
                <div className="mt-1.5 h-3 w-[40%] bg-[hsl(214,20%,82%)]" />
              </div>
            </div>
            <div className="flex h-[42px] items-end gap-1.5 rounded-[10px] bg-[hsl(214,20%,97%)] px-2 pb-2 pt-1.5">
              <div className="h-4 w-4 rounded-[3px] bg-[hsl(220,34%,74%)]" />
              <div className="h-6 w-4 rounded-[3px] bg-[hsl(220,34%,74%)]" />
              <div className="h-5 w-4 rounded-[3px] bg-[hsl(220,34%,74%)]" />
              <div className="h-8 w-4 rounded-[3px] bg-[hsl(220,34%,74%)]" />
              <div className="h-6 w-4 rounded-[3px] bg-[hsl(220,34%,74%)]" />
              <div className="h-9 w-4 rounded-[3px] bg-[hsl(220,34%,74%)]" />
            </div>
          </div>
        )}

        {preview.pattern === "alerts" && (
          <div className="space-y-1.5">
            {[0, 1, 2].map((alertIndex) => (
              <div
                key={alertIndex}
                className="rounded-[10px] border border-[rgba(239,203,203,0.96)] bg-white/70 px-2 py-1.5"
              >
                <div className="flex items-start gap-1.5">
                  <div className="mt-0.5 h-5 w-5 rounded-[8px] bg-[hsl(0,56%,90%)]" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-[88%] bg-[hsl(0,30%,88%)]" />
                    <div className="h-2 w-[64%] bg-[hsl(0,24%,92%)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {preview.pattern === "body" && (
          <div className="flex h-[58px] items-center justify-center rounded-[12px] bg-[hsl(214,20%,97%)]">
            <div className="relative h-[46px] w-[24px] rounded-[999px] bg-[linear-gradient(180deg,hsl(214,18%,90%),hsl(214,18%,84%))]">
              <span className="absolute left-[46%] top-[18%] h-1.5 w-1.5 rounded-full bg-[hsl(0,56%,82%)]" />
              <span className="absolute left-[28%] top-[44%] h-1.5 w-1.5 rounded-full bg-[hsl(40,56%,78%)]" />
              <span className="absolute right-[28%] top-[61%] h-1.5 w-1.5 rounded-full bg-[hsl(214,28%,74%)]" />
            </div>
          </div>
        )}

        {preview.pattern === "imaging" && (
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="h-[56px] rounded-[10px] bg-[linear-gradient(135deg,hsl(214,18%,90%),hsl(214,18%,84%))]" />
              <div className="h-[56px] rounded-[10px] bg-[linear-gradient(135deg,hsl(214,18%,92%),hsl(214,18%,86%))]" />
            </div>
            <div className="h-2 w-[58%] bg-[hsl(214,18%,88%)]" />
          </div>
        )}

        {preview.pattern === "table" && (
          <div className="overflow-hidden rounded-[10px] border border-[hsl(214,22%,88%)] bg-[hsl(214,20%,97%)]">
            <div className="grid grid-cols-[1.2fr_0.9fr] gap-1.5 border-b border-[hsl(214,22%,88%)] px-2 py-1.5">
              <div className="h-2 w-[72%] bg-[hsl(214,18%,88%)]" />
              <div className="ml-auto h-2 w-[52%] bg-[hsl(214,18%,90%)]" />
            </div>
            {[0, 1, 2].map((rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[1.2fr_0.9fr] gap-1.5 px-2 py-1.5"
              >
                <div className="h-2 w-[84%] bg-[hsl(214,18%,90%)]" />
                <div className="ml-auto h-2 w-[56%] bg-[hsl(214,18%,92%)]" />
              </div>
            ))}
          </div>
        )}

        {preview.pattern === "timeline" && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[hsl(220,34%,74%)]" />
              <div className="h-px flex-1 bg-[hsl(214,18%,86%)]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[hsl(220,34%,74%)]" />
              <div className="h-px flex-1 bg-[hsl(214,18%,86%)]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[hsl(220,34%,74%)]" />
              <div className="h-px flex-1 bg-[hsl(214,18%,86%)]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[hsl(220,34%,74%)]" />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <div className="h-8 rounded-[10px] bg-[hsl(214,20%,95%)]" />
              <div className="h-8 rounded-[10px] bg-[hsl(214,20%,95%)]" />
              <div className="h-8 rounded-[10px] bg-[hsl(214,20%,95%)]" />
              <div className="h-8 rounded-[10px] bg-[hsl(214,20%,95%)]" />
            </div>
          </div>
        )}

        {preview.pattern === "summary" && (
          <div className="space-y-1.5 rounded-[10px] bg-[hsl(214,20%,97%)] p-2">
            <div className="h-2 w-[22%] bg-[hsl(214,18%,86%)]" />
            <div className="h-2 w-[82%] bg-[hsl(214,18%,90%)]" />
            <div className="h-2 w-[76%] bg-[hsl(214,18%,90%)]" />
            <div className="h-2 w-[68%] bg-[hsl(214,18%,90%)]" />
          </div>
        )}
      </div>
    </div>
  );
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [form, setForm] = React.useState<RegistrationForm>(initialForm);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [draggedModuleId, setDraggedModuleId] =
    React.useState<ModuleId | null>(null);

  const moduleMap = React.useMemo(
    () =>
      Object.fromEntries(
        moduleOptions.map((option) => [option.id, option]),
      ) as Record<ModuleId, ModuleOption>,
    [],
  );

  const specialtyMap = React.useMemo(
    () =>
      Object.fromEntries(
        specialtyOptions.map((option) => [option.id, option]),
      ) as Record<SpecialtyId, SpecialtyOption>,
    [],
  );

  const selectedSpecialty = form.specialty ? specialtyMap[form.specialty] : null;
  const normalizedSearchQuery = normalizeText(searchQuery);

  const filteredSpecialties = React.useMemo(
    () =>
      specialtyOptions.filter((option) => {
        if (!normalizedSearchQuery) {
          return true;
        }

        return [option.title].some((value) =>
          normalizeText(value).includes(normalizedSearchQuery),
        );
      }),
    [normalizedSearchQuery],
  );

  const visibleLayoutItems = React.useMemo(
    () =>
      form.layoutOrder
        .filter((item) => form.modules.includes(item))
        .map((item) => moduleMap[item]),
    [form.layoutOrder, form.modules, moduleMap],
  );

  const modulePlacements = React.useMemo(
    () =>
      computeModulePlacements(
        form.layoutOrder.filter((item) => form.modules.includes(item)),
      ),
    [form.layoutOrder, form.modules],
  );

  const aboveTheFoldModuleIds = React.useMemo(
    () =>
      new Set(
        modulePlacements
          .filter((placement) => placement.row <= 2)
          .map((placement) => placement.id),
      ),
    [modulePlacements],
  );

  const aboveTheFoldItems = visibleLayoutItems.slice(0, 3);
  const belowTheFoldItems = visibleLayoutItems.slice(3);

  const applySpecialtyPreset = (specialtyId: SpecialtyId) => {
    const specialty = specialtyMap[specialtyId];

    setForm((current) => ({
      specialty: current.specialty === specialtyId ? null : specialtyId,
      modules: current.specialty === specialtyId ? [] : specialty.modules,
      layoutOrder:
        current.specialty === specialtyId
          ? defaultLayoutOrder
          : [
              ...current.layoutOrder,
              ...defaultLayoutOrder.filter(
                (item) => !current.layoutOrder.includes(item),
              ),
            ],
    }));

    setErrors((current) => {
      if (!current.specialty) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors.specialty;
      return nextErrors;
    });

  };

  const moveDraggedModule = React.useCallback(
    (targetIndex: number) => {
      if (!draggedModuleId) {
        return;
      }

      setForm((current) => {
        const nextOrder = [...current.layoutOrder];
        const fromIndex = nextOrder.indexOf(draggedModuleId);

        if (fromIndex === -1) {
          return current;
        }

        const boundedIndex = Math.max(
          0,
          Math.min(targetIndex, nextOrder.length - 1),
        );

        if (fromIndex === boundedIndex) {
          return current;
        }

        nextOrder.splice(fromIndex, 1);
        nextOrder.splice(boundedIndex, 0, draggedModuleId);
        return { ...current, layoutOrder: nextOrder };
      });
    },
    [draggedModuleId],
  );

  const moveModuleByOffset = (moduleId: ModuleId, offset: -1 | 1) => {
    setForm((current) => {
      const fromIndex = current.layoutOrder.indexOf(moduleId);

      if (fromIndex === -1) {
        return current;
      }

      const toIndex = Math.max(
        0,
        Math.min(fromIndex + offset, current.layoutOrder.length - 1),
      );

      if (fromIndex === toIndex) {
        return current;
      }

      const nextOrder = [...current.layoutOrder];
      nextOrder.splice(fromIndex, 1);
      nextOrder.splice(toIndex, 0, moduleId);
      return { ...current, layoutOrder: nextOrder };
    });
  };

  const validateStep = () => {
    const nextErrors: Record<string, string> = {};

    if (step === 0 && !form.specialty) {
      nextErrors.specialty = "Izvēlieties specialitāti, lai turpinātu.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const handleBack = () => {
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSkipSpecialty = () => {
    applySpecialtyPreset("family-medicine");
    setErrors({});
    setStep(1);
  };

  const handleSubmit = () => {
    if (!selectedSpecialty) {
      setStep(0);
      validateStep();
      return;
    }

    toast.success("Profils sagatavots", {
      description: `Sākuma panelis ir pielāgots specialitātei “${selectedSpecialty.title}”.`,
    });
    navigate("/search", {
      state: {
        layoutOrder: form.layoutOrder
          .filter((item) => form.modules.includes(item))
          .map((item) => moduleIdToDashboardComponentKey[item]),
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[hsl(219,36%,18%)]">
      <main className="mx-auto flex min-h-screen w-full max-w-[1360px] flex-col px-3 py-3 md:px-5 lg:px-6">
        <div className="border-b border-[rgba(220,228,236,0.96)] pb-3">
          <div className="flex flex-col gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div className="flex items-center gap-4 md:justify-self-start">
              <div className="flex items-center gap-3">
                <p className="text-[15px] font-semibold uppercase tracking-[0.22em] text-[hsl(219,36%,18%)]">
                  OMNUS
                </p>
                <span className="hidden h-4 w-px bg-[rgba(214,222,230,0.96)] md:block" />
              </div>
            </div>

            <div className="hidden md:flex md:items-center md:justify-center md:gap-6">
              {steps.map((item, index) => {
                const isActive = index === step;
                const isComplete = index < step;

                return (
                  <button
                    key={item.subtitle}
                    type="button"
                    onClick={() => {
                      if (index <= step || Boolean(form.specialty)) {
                        setErrors({});
                        setStep(index);
                      }
                    }}
                    className="flex items-center gap-2 text-left"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold transition",
                        isActive
                          ? "border-[hsl(220,36%,18%)] bg-[hsl(220,36%,18%)] text-white"
                          : isComplete
                            ? "border-[hsl(220,36%,18%)] bg-white text-[hsl(220,36%,18%)]"
                            : "border-[rgba(210,219,228,0.96)] bg-white text-[hsl(214,14%,56%)]",
                      )}
                    >
                      {isComplete ? <Check className="h-3 w-3" /> : item.title}
                    </span>

                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-[0.18em]",
                        isActive || isComplete
                          ? "text-[hsl(219,30%,22%)]"
                          : "text-[hsl(214,14%,56%)]",
                      )}
                    >
                      {item.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-[rgba(220,228,236,0.96)] bg-white px-3 py-2 shadow-[0_4px_16px_rgba(29,53,87,0.04)] md:justify-self-end md:self-auto">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(180deg,hsl(220,36%,18%),hsl(218,34%,24%))] text-white">
                <UserRound className="h-3.5 w-3.5" />
              </div>
              <span className="text-[11px] font-medium text-[hsl(219,30%,22%)]">
                Dr. A. Liepiņa
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col pt-1.5 pb-3">
          {step === 0 && (
            <section className="flex flex-1 flex-col">
              <div className="w-full">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[hsl(214,18%,60%)]">
                  Solis 01
                </p>

                <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.05em] text-[hsl(219,40%,16%)] md:text-[34px]">
                  Izvēlieties savu specialitāti
                </h1>

                <p className="mt-1 max-w-[760px] text-[13px] leading-5 text-[hsl(214,16%,46%)]">
                  Mēs pielāgosim pacienta pārskatu jūsu darba prioritātēm. Šos
                  iestatījumus varēsiet mainīt jebkurā brīdī.
                </p>
              </div>

              <div className="mt-3 max-w-[420px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(214,14%,58%)]" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Meklēt specialitāti..."
                    className="h-9 border-[rgba(214,222,230,0.96)] bg-white pl-10 pr-3 text-[13px] shadow-none placeholder:text-[hsl(214,14%,62%)] focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                {filteredSpecialties.map((option) => {
                  const isSelected = form.specialty === option.id;
                  const SpecialtyIcon = option.icon;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => applySpecialtyPreset(option.id)}
                      className={cn(
                        "border bg-white px-3 py-2.5 text-left transition",
                        isSelected
                          ? "border-[hsl(220,36%,18%)] bg-[hsl(220,34%,97%)] shadow-[0_10px_24px_rgba(29,53,87,0.08)]"
                          : "border-[rgba(216,224,232,0.96)] hover:border-[rgba(184,197,210,0.96)]",
                      )}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-[9px] border border-[rgba(214,222,230,0.96)] bg-[hsl(214,20%,98%)] text-[hsl(214,18%,52%)]">
                        <SpecialtyIcon className="h-4 w-4" />
                      </span>

                      <p className="mt-2 text-[21px] font-semibold text-[hsl(219,30%,22%)]">
                        {option.title}
                      </p>
                    </button>
                  );
                })}
              </div>

              {!filteredSpecialties.length && (
                <div className="mt-4 border border-dashed border-[rgba(214,222,230,0.96)] bg-white px-5 py-8 text-[14px] text-[hsl(214,16%,50%)]">
                  Neatradām nevienu specialitāti pēc ievadītā meklējuma.
                </div>
              )}

              {errors.specialty && (
                <p className="mt-4 text-sm text-[hsl(0,68%,52%)]">
                  {errors.specialty}
                </p>
              )}
            </section>
          )}

          {step === 1 && (
            <section className="flex min-h-0 flex-1 flex-col">
              <div className="max-w-[880px]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[hsl(214,18%,60%)]">
                  Solis 02
                </p>

                <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.05em] text-[hsl(219,40%,16%)] md:text-[34px]">
                  Iekārtojiet savu darba paneli
                </h1>

                <p className="mt-1.5 text-[13px] leading-5 text-[hsl(214,16%,46%)]">
                  {selectedSpecialty ? (
                    <>
                      Sākuma saturs ir pielāgots specialitātei {" "}
                      <strong className="font-semibold text-[hsl(219,30%,22%)]">
                        {selectedSpecialty.title}
                      </strong>
                      . Sakārtojiet komponentes sev ērtākajā secībā un izkārtojumā.
                    </>
                  ) : (
                    "Sakārtojiet moduļus sev ērtākajā secībā."
                  )}
                </p>
              </div>

              <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.68fr)]">
                <div className="flex flex-col border border-[rgba(216,224,232,0.96)] bg-white p-3">
                  <div>
                    <p className="text-[14px] font-semibold text-[hsl(219,30%,22%)]">
                      Sakārtojiet pārskatu pēc nozīmīguma
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-[hsl(214,16%,48%)]">
                      Velciet komponentus uz sev atbilstošo izkārtojumu.
                    </p>
                  </div>

                  <div className="mt-3 space-y-1 pr-1">
                    {aboveTheFoldItems.map((item, index) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => setDraggedModuleId(item.id)}
                        onDragEnd={() => setDraggedModuleId(null)}
                        onDragOver={(event) => {
                          event.preventDefault();
                          if (!draggedModuleId || draggedModuleId === item.id) {
                            return;
                          }

                          const toIndex = form.layoutOrder.indexOf(item.id);
                          if (toIndex !== -1) {
                            moveDraggedModule(toIndex);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2.5 border px-2.5 py-2 transition",
                          draggedModuleId === item.id
                            ? "border-[hsl(220,36%,18%)] bg-[hsl(220,34%,97%)]"
                            : "border-[rgba(216,224,232,0.96)] bg-white",
                        )}
                      >
                        <GripVertical className="h-3.5 w-3.5 shrink-0 text-[hsl(214,12%,58%)]" />
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-[hsl(214,20%,96%)] text-[11px] font-semibold text-[hsl(214,18%,48%)]">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-[hsl(219,30%,22%)]">
                            {item.title}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-[10px] leading-3.5 text-[hsl(214,16%,48%)]">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveModuleByOffset(item.id, -1)}
                            className="flex h-7 w-7 items-center justify-center border border-transparent text-[hsl(214,16%,54%)] transition hover:border-[rgba(214,222,230,0.96)] hover:bg-[hsl(214,20%,98%)]"
                            aria-label={`${item.title} uz augšu`}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveModuleByOffset(item.id, 1)}
                            className="flex h-7 w-7 items-center justify-center border border-transparent text-[hsl(214,16%,54%)] transition hover:border-[rgba(214,222,230,0.96)] hover:bg-[hsl(214,20%,98%)]"
                            aria-label={`${item.title} uz leju`}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {belowTheFoldItems.length > 0 && (
                    <>
                      <div className="space-y-1 pr-1">
                        {belowTheFoldItems.map((item, index) => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={() => setDraggedModuleId(item.id)}
                            onDragEnd={() => setDraggedModuleId(null)}
                            onDragOver={(event) => {
                              event.preventDefault();
                              if (!draggedModuleId || draggedModuleId === item.id) {
                                return;
                              }

                              const toIndex = form.layoutOrder.indexOf(item.id);
                              if (toIndex !== -1) {
                                moveDraggedModule(toIndex);
                              }
                            }}
                            className={cn(
                              "flex items-center gap-2.5 border px-2.5 py-2 transition",
                              draggedModuleId === item.id
                                ? "border-[hsl(220,36%,18%)] bg-[hsl(220,34%,97%)]"
                                : "border-[rgba(216,224,232,0.96)] bg-white",
                            )}
                          >
                            <GripVertical className="h-3.5 w-3.5 shrink-0 text-[hsl(214,12%,58%)]" />
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-[hsl(214,20%,96%)] text-[11px] font-semibold text-[hsl(214,18%,48%)]">
                              {aboveTheFoldItems.length + index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-semibold text-[hsl(219,30%,22%)]">
                                {item.title}
                              </p>
                              <p className="mt-0.5 line-clamp-1 text-[10px] leading-3.5 text-[hsl(214,16%,48%)]">
                                {item.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveModuleByOffset(item.id, -1)}
                                className="flex h-7 w-7 items-center justify-center border border-transparent text-[hsl(214,16%,54%)] transition hover:border-[rgba(214,222,230,0.96)] hover:bg-[hsl(214,20%,98%)]"
                                aria-label={`${item.title} uz augšu`}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveModuleByOffset(item.id, 1)}
                                className="flex h-7 w-7 items-center justify-center border border-transparent text-[hsl(214,16%,54%)] transition hover:border-[rgba(214,222,230,0.96)] hover:bg-[hsl(214,20%,98%)]"
                                aria-label={`${item.title} uz leju`}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="mt-3 flex items-start gap-2.5 border border-[rgba(216,224,232,0.96)] bg-[hsl(214,22%,98%)] px-2.5 py-2 text-[11px] text-[hsl(214,16%,48%)]">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(214,24%,50%)]" />
                    <p>
                      Prioritātes un izkārtojumu varēsiet mainīt arī vēlāk savos iestatījumos.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col border border-[rgba(216,224,232,0.96)] bg-white p-3">
                  <div className="border border-[rgba(216,224,232,0.96)] bg-[hsl(214,20%,98%)] px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[hsl(214,14%,76%)]" />
                        <span className="h-2 w-2 rounded-full bg-[hsl(214,14%,76%)]" />
                        <span className="h-2 w-2 rounded-full bg-[hsl(214,14%,76%)]" />
                      </div>
                      <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[hsl(214,16%,58%)]">
                        Priekšskatījums
                      </span>
                    </div>
                  </div>

                  <div className="border-x border-b border-[rgba(216,224,232,0.96)] bg-[hsl(214,20%,98%)] p-2.5">
                    <div className="rounded-[16px] border border-[rgba(220,228,236,0.96)] bg-[hsl(214,20%,99%)] p-2">
                      <div className="flex items-center justify-between border-b border-[rgba(220,228,236,0.96)] pb-2">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-semibold text-[hsl(219,30%,22%)]">
                            Vārds Uzvards
                          </p>
                          <p className="text-[8px] text-[hsl(214,14%,52%)]">
                            Kontakfinformācija
                          </p>
                        </div>
                        <div className="h-7 w-7 rounded-[10px] bg-[hsl(214,20%,94%)]" />
                      </div>

                      <div className="mt-2 grid auto-rows-[76px] grid-cols-3 gap-1.5">
                        {visibleLayoutItems.map((item, index) => (
                          <PreviewCard key={item.id} item={item} index={index} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="mt-3 flex flex-col items-end gap-2.5 border-t border-[rgba(220,228,236,0.96)] pt-3 md:flex-row md:items-center md:justify-end">
  <div className="flex items-center gap-3">
              {step === 0 ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSkipSpecialty}
                    className="h-9 border border-transparent px-3.5 text-[13px] font-semibold text-[hsl(214,18%,44%)] hover:bg-[hsl(214,20%,98%)] hover:text-[hsl(219,36%,18%)]"
                  >
                    Izlaist
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!form.specialty}
                    className="h-9 rounded-[9px] bg-[linear-gradient(180deg,hsl(220,36%,18%),hsl(218,34%,24%))] px-4 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(29,53,87,0.16)] transition hover:opacity-95 disabled:opacity-45"
                  >
                    Turpināt
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    className="h-9 border border-transparent px-3.5 text-[13px] font-semibold text-[hsl(214,18%,44%)] hover:bg-[hsl(214,20%,98%)] hover:text-[hsl(219,36%,18%)]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Atpakaļ
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="h-9 rounded-[9px] bg-[linear-gradient(180deg,hsl(220,36%,18%),hsl(218,34%,24%))] px-4 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(29,53,87,0.16)] transition hover:opacity-95"
                  >
                    Sākt darbu
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
