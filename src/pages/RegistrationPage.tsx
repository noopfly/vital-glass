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
  Shield,
  Stethoscope,
  UserRound,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registeredDoctorAccount } from "@/lib/doctor-account";
import { writeStoredDashboardLayoutOrder } from "@/lib/dashboard-layout";
import {
  type SpecialtyId,
  writeStoredDashboardSpecialty,
} from "@/lib/specialties";
import { cn } from "@/lib/utils";

type StepDefinition = {
  title: string;
  subtitle: string;
};

type ModuleId =
  | "patient-card"
  | "prevention"
  | "health-trends"
  | "imaging"
  | "medications"
  | "alerts"
  | "timeline"
  | "body-model"
  | "referrals"

type DashboardComponentKey =
  | "patientCard"
  | "preventionCard"
  | "healthTrends"
  | "medicalImagingViewer"
  | "medicationTable"
  | "alertsCard"
  | "eventTimeline"
  | "humanBodyModel"
  | "referralHistory";

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
  | "prevention"
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
    description: "Pamatiinformācija, diagnozes un primārie riski",
    icon: UserRound,
  },
  {
    id: "prevention",
    title: "Profilakse",
    description: "SCORE2 risks, skrīningi un vakcinācijas process",
    icon: Shield,
  },
  {
    id: "health-trends",
    title: "Kliniskie rādītāji",
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
    title: "Kermeņa pārskats",
    description: "Anatomiskais skats ar atradnēm un reģioniem",
    icon: UserRound,
  },
  {
    id: "referrals",
    title: "E-nosūtījumi",
    description: "Aktīvie un vēsturiskie e-nosūtījumi",
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

const familyRegistrationModules: ModuleId[] = [
  "patient-card",
  "prevention",
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
    modules: familyRegistrationModules,
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
    title: "Pulmologs",
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

const familyRegistrationLayoutOrder: ModuleId[] = [
  "patient-card",
  "prevention",
  ...defaultLayoutOrder.filter((item) => item !== "patient-card"),
];

const moduleIdToDashboardComponentKey: Record<ModuleId, DashboardComponentKey> = {
  "patient-card": "patientCard",
  prevention: "preventionCard",
  "health-trends": "healthTrends",
  alerts: "alertsCard",
  imaging: "medicalImagingViewer",
  "body-model": "humanBodyModel",
  medications: "medicationTable",
  referrals: "referralHistory",
  timeline: "eventTimeline",
};

const modulePreviewDefinitions: Record<ModuleId, ModulePreviewDefinition> = {
  prevention: {
    note: "Profilakse",
    summary: "SCORE2 risks, skrīningi un vakcinācijas process.",
    pattern: "prevention",
    colSpan: 1,
    rowSpan: 1,
    previewClassName: "",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  "patient-card": {
    note: "Pacienta klīniskais profils",
    summary: "Personas dati, diagnozes un primārie riski.",
    pattern: "profile",
    colSpan: 3,
    rowSpan: 1,
    previewClassName: "col-span-3",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  "health-trends": {
    note: "Kliniskie rādītāji",
    summary: "Pulss, glikoze, asinsspiediens un citu rādītāju dinamika.",
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
    summary: "Medikamentu riski un kritiski analīžu rezultāti",
    pattern: "alerts",
    colSpan: 1,
    rowSpan: 1,
    previewClassName: "",
    surfaceClassName:
      "border-[rgba(239,203,203,0.96)] bg-[hsl(0,60%,97%)] shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  timeline: {
    note: "Notikumu laika linija",
    summary: "Vizīšu, analīžu un procedūru hronoloģiska secība.",
    pattern: "timeline",
    colSpan: 2,
    rowSpan: 1,
    previewClassName: "col-span-2",
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
        "overflow-hidden rounded-[16px] border px-3 py-3",
        preview.previewClassName,
        preview.surfaceClassName,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(214,22%,97%)] text-xs font-semibold text-[hsl(219,30%,22%)]">
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[hsl(214,16%,58%)]">
            {preview.note}
          </p>
        </div>
      </div>

      <div className="mt-3">
        {preview.pattern === "profile" && (
          <div className="space-y-2.5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-[12px] bg-[hsl(214,20%,92%)]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-[36%] rounded-full bg-[hsl(214,18%,88%)]" />
                <div className="h-2.5 w-[58%] rounded-full bg-[hsl(214,20%,93%)]" />
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

        {preview.pattern === "prevention" && (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1.5">
                <div className="h-2.5 w-[34%] rounded-full bg-[hsl(214,18%,88%)]" />
                <div className="h-5 w-[28%] rounded-full bg-[hsl(122,46%,86%)]" />
              </div>
              <div className="h-10 w-10 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(231,248,226,0.98),rgba(212,242,206,0.98))]" />
            </div>
            <div className="grid grid-cols-[0.9fr_1.1fr] gap-2">
              <div className="rounded-[10px] bg-[hsl(214,20%,97%)] p-2">
                <div className="h-2 w-[44%] bg-[hsl(214,18%,86%)]" />
                <div className="mt-2 h-5 w-[52%] bg-[hsl(222,54%,74%)]" />
                <div className="mt-2 h-2 w-[72%] bg-[hsl(214,18%,90%)]" />
              </div>
              <div className="space-y-1.5">
                {[0, 1].map((rowIndex) => (
                  <div
                    key={rowIndex}
                    className="rounded-[10px] border border-[hsl(214,22%,88%)] bg-[hsl(214,20%,98%)] p-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="h-4 w-4 rounded-full bg-[hsl(214,20%,92%)]" />
                      <div className="h-2 w-[38%] bg-[hsl(214,18%,88%)]" />
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-[hsl(214,18%,90%)]">
                      <div
                        className={cn(
                          "h-full rounded-full bg-[hsl(216,84%,54%)]",
                          rowIndex === 0 ? "w-[76%]" : "w-[58%]",
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
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
          <div className="rounded-[10px] border border-[rgba(245,197,197,0.96)] bg-[hsl(0,64%,98%)] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-[hsl(0,78%,84%)]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-[90%] rounded-full bg-[hsl(0,58%,86%)]" />
                <div className="h-2.5 w-[62%] rounded-full bg-[hsl(0,44%,90%)]" />
              </div>
            </div>
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
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[hsl(224,81%,56%)]" />
              <div className="h-px flex-1 bg-[hsl(214,22%,84%)]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[hsl(224,81%,56%)]" />
              <div className="h-px flex-1 bg-[hsl(214,22%,84%)]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[hsl(224,81%,56%)]" />
              <div className="h-px flex-1 bg-[hsl(214,22%,84%)]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[hsl(224,81%,56%)]" />
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

function getRegistrationModuleDescription(item: ModuleOption) {
  if (item.id === "prevention") {
    return "SCORE2 risks, skriningi un vakcinacijas progress";
  }

  return item.description;
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

  const aboveTheFoldItems = visibleLayoutItems.slice(0, 3);
  const belowTheFoldItems = visibleLayoutItems.slice(3);

  const applySpecialtyPreset = (specialtyId: SpecialtyId) => {
    const specialty = specialtyMap[specialtyId];
    const specialtyLayoutOrder =
      specialtyId === "family-medicine"
        ? familyRegistrationLayoutOrder
        : defaultLayoutOrder;

    setForm((current) => ({
      specialty: current.specialty === specialtyId ? null : specialtyId,
      modules: current.specialty === specialtyId ? [] : specialty.modules,
      layoutOrder:
        current.specialty === specialtyId
          ? defaultLayoutOrder
          : [
              ...specialtyLayoutOrder,
              ...current.layoutOrder.filter(
                (item) =>
                  specialty.modules.includes(item) &&
                  !specialtyLayoutOrder.includes(item),
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

    const selectedLayoutOrder = form.layoutOrder
      .filter((item) => form.modules.includes(item))
      .map((item) => moduleIdToDashboardComponentKey[item]);

    toast.success("Profils sagatavots", {
      description: `Sākuma panelis ir pielāgots specialitātei “${selectedSpecialty.title}”.`,
    });
    writeStoredDashboardSpecialty(selectedSpecialty.id);
    writeStoredDashboardLayoutOrder(selectedLayoutOrder);
    navigate("/search", {
      state: {
        layoutOrder: selectedLayoutOrder,
        specialtyId: selectedSpecialty.id,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[hsl(219,36%,18%)]">
      <main className="mx-auto flex min-h-screen w-full max-w-[1360px] flex-col px-3 py-3 md:px-5 lg:px-6">
        <div className="border-b border-[rgba(220,228,236,0.96)] pb-3">
          <div className="flex flex-col gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div className="flex items-center gap-4 md:justify-self-start">
              <div className="flex items-center">
                <img
                    src={`${import.meta.env.BASE_URL}prakses-asistents-logo.png`}
                  alt="Prakses Asistents"
                  className="h-auto w-[96px]"
                />
              </div>
            </div>

            <div className="hidden md:flex md:items-center md:justify-center">
              {steps.map((item, index) => {
                const isActive = index === step;
                const isComplete = index < step;

                return (
                  <React.Fragment key={item.subtitle}>
                    <button
                      type="button"
                      onClick={() => {
                        if (index <= step || Boolean(form.specialty)) {
                          setErrors({});
                          setStep(index);
                        }
                      }}
                      className="flex items-center gap-3 text-left"
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold transition",
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
                          "text-sm font-normal tracking-[0.04em]",
                          isActive || isComplete
                            ? "text-[hsl(219,30%,22%)]"
                            : "text-[hsl(214,14%,56%)]",
                        )}
                      >
                        {item.subtitle}
                      </span>
                    </button>

                    {index < steps.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="mx-8 h-px w-20 bg-[rgba(210,219,228,0.72)]"
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-[rgba(220,228,236,0.96)] bg-white px-3 py-2 md:justify-self-end md:self-auto">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(214,20%,96%)] text-[hsl(219,30%,22%)]">
                <UserRound className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-normal text-[hsl(219,30%,22%)]">
                {registeredDoctorAccount.name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col pt-1.5 pb-3">
          {step === 0 && (
            <section className="flex flex-1 flex-col pt-6 md:pt-8">
              <div className="w-full max-w-[920px]">
                <p className="text-xs font-semibold text-[hsl(219,40%,16%)]">
                  Solis 01
                </p>

                <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.06em] text-[hsl(219,40%,16%)]">
                  Izvēlieties savu specialitāti
                </h1>

                <p className="mt-5 max-w-[820px] whitespace-nowrap text-sm leading-7 text-[hsl(214,16%,46%)]">
                  Mēs pielāgosim pacienta pārskatu jūsu darba prioritātēm. Šos
                  iestatījumus varēsiet mainīt jebkurā brīdī.
                </p>
              </div>

              <div className="mt-8 max-w-[520px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(214,14%,58%)]" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Meklēt specialitāti"
                    className="h-14 rounded-[10px] border-[rgba(214,222,230,0.96)] bg-white pl-14 pr-4 text-sm shadow-none placeholder:text-[hsl(214,14%,62%)] focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {filteredSpecialties.map((option) => {
                  const isSelected = form.specialty === option.id;
                  const SpecialtyIcon = option.icon;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => applySpecialtyPreset(option.id)}
                      className={cn(
                        "flex min-h-[112px] items-center gap-5 rounded-[10px] border bg-white px-5 py-5 text-left transition",
                        isSelected
                          ? "border-[hsl(220,36%,18%)] bg-[hsl(220,34%,97%)] shadow-[0_12px_28px_rgba(29,53,87,0.08)]"
                          : "border-[rgba(216,224,232,0.96)] hover:border-[rgba(184,197,210,0.96)]",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[rgba(214,222,230,0.96)] bg-[hsl(214,20%,98%)] text-[hsl(214,18%,52%)]",
                          isSelected &&
                            "border-[hsl(220,36%,18%)] bg-[linear-gradient(180deg,hsl(220,36%,18%),hsl(218,34%,24%))] text-white",
                        )}
                      >
                        <SpecialtyIcon className="h-6 w-6" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[hsl(219,30%,22%)]">
                          {option.title}
                        </span>
                      </span>

                      {isSelected && (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(220,36%,18%)] text-white">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {!filteredSpecialties.length && (
                <div className="mt-8 rounded-[14px] border border-dashed border-[rgba(214,222,230,0.96)] bg-white px-5 py-8 text-sm text-[hsl(214,16%,50%)]">
                  Neatradām nevienu specialitāti pēc ievadītā meklējuma.
                </div>
              )}

              {errors.specialty && (
                <p className="mt-5 text-sm text-[hsl(0,68%,52%)]">
                  {errors.specialty}
                </p>
              )}
            </section>
          )}

          {step === 1 && (
            <section className="flex min-h-0 flex-1 flex-col pt-6 md:pt-8">
              <div className="w-full max-w-[920px]">
                <p className="text-xs font-semibold text-[hsl(219,40%,16%)]">
                  Solis 02
                </p>

                <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.06em] text-[hsl(219,40%,16%)]">
                  Iekārtojiet savu darba paneli
                </h1>

                <p className="mt-5 max-w-[820px] whitespace-nowrap text-sm leading-7 text-[hsl(214,16%,46%)]">
                  {selectedSpecialty ? (
                    <>
                      Sākuma saturs ir pielāgots specialitātei{" "}
                      <strong className="font-semibold text-[hsl(219,30%,22%)]">
                        {selectedSpecialty.title}
                      </strong>
                      . Sakārtojiet komponentes sev ērtiākajā secībā un izkārtojumā. <strong className="font-semibold text-[hsl(219,30%,22%)]">Vēlāk šo izkārtojumu var mainīt.</strong>
                    </>
                  ) : (
                    "Sakārtojiet komponentes sev ērtiākajā secībā."
                  )}
                </p>
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(460px,0.92fr)]">
                <div className="rounded-[20px] border border-[rgba(219,226,235,0.96)] bg-white p-5 shadow-[0_18px_42px_rgba(29,53,87,0.06)]">
                  <div>
                    <p className="text-sm font-semibold text-[hsl(219,30%,22%)]">
                      Sakārtojiet pārskatu pēc nozīmīguma
                    </p>

                    <p className="mt-2 text-sm leading-5 text-[hsl(214,16%,48%)]">
                      Velciet komponentus uz sev atbilstošo izkārtojumu.
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    {visibleLayoutItems.map((item, index) => (
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
                          "flex items-center gap-4 rounded-[14px] border px-4 py-3 shadow-[0_6px_16px_rgba(29,53,87,0.03)] transition",
                          draggedModuleId === item.id
                            ? "border-[hsl(220,36%,18%)] bg-[hsl(220,34%,97%)]"
                            : "border-[rgba(220,228,236,0.96)] bg-white hover:border-[rgba(198,210,223,0.96)]",
                        )}
                      >
                        <div className="flex h-8 w-5 shrink-0 items-center justify-center text-[hsl(214,12%,62%)]">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[hsl(214,22%,97%)] text-sm font-semibold text-[hsl(219,30%,22%)]">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[hsl(219,30%,22%)]">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[hsl(214,16%,48%)]">
                            {getRegistrationModuleDescription(item)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveModuleByOffset(item.id, -1)}
                            disabled={index === 0}
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-[8px] transition",
                              index === 0
                                ? "cursor-not-allowed text-[hsl(214,14%,76%)]"
                                : "text-[hsl(214,16%,54%)] hover:bg-[hsl(214,22%,97%)] hover:text-[hsl(219,30%,22%)]",
                            )}
                            aria-label={`${item.title} uz augšu`}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveModuleByOffset(item.id, 1)}
                            disabled={index === visibleLayoutItems.length - 1}
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-[8px] transition",
                              index === visibleLayoutItems.length - 1
                                ? "cursor-not-allowed text-[hsl(214,14%,76%)]"
                                : "text-[hsl(214,16%,54%)] hover:bg-[hsl(214,22%,97%)] hover:text-[hsl(219,30%,22%)]",
                            )}
                            aria-label={`${item.title} uz leju`}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {false && (
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
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-[hsl(214,20%,96%)] text-xs font-semibold text-[hsl(214,18%,48%)]">
                              {aboveTheFoldItems.length + index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-[hsl(219,30%,22%)]">
                                {item.title}
                              </p>
                              <p className="mt-0.5 whitespace-normal break-words text-xs leading-3.5 text-[hsl(214,16%,48%)]">
                                {getRegistrationModuleDescription(item)}
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
                 
                </div>

                <div className="overflow-hidden rounded-[20px] border border-[rgba(219,226,235,0.96)] bg-white shadow-[0_18px_42px_rgba(29,53,87,0.06)]">
                  <div className="flex items-center justify-between border-b border-[rgba(226,232,239,0.96)] px-5 py-3">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[hsl(214,14%,76%)]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[hsl(214,14%,76%)]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[hsl(214,14%,76%)]" />
                      </div>
                      <span className="text-xs font-semibold text-[hsl(214,16%,62%)]">
                        Priekšskatījums
                      </span>
                    </div>
                  </div>

                  <div className="bg-[linear-gradient(180deg,hsl(214,20%,99%)_0%,white_100%)] p-4">
                    <div className="rounded-[16px] border border-[rgba(223,230,238,0.96)] bg-white px-4 py-3 shadow-[0_8px_18px_rgba(29,53,87,0.03)]">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-[hsl(219,30%,22%)]">
                            Vārds Uzvārds
                          </p>
                          <p className="text-xs text-[hsl(214,14%,58%)]">
                            Kontaktinformācija
                          </p>
                        </div>
                        <div className="h-9 w-9 rounded-[12px] bg-[hsl(214,20%,94%)]" />
                      </div>

                      <div className="mt-3 grid auto-rows-[92px] grid-cols-3 gap-2.5">
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

          <div
            className={cn(
              "mt-8 border-t border-[rgba(220,228,236,0.96)] pt-8",
              step <= 1
                ? "flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                : "flex flex-col items-end gap-2.5 md:flex-row md:items-center md:justify-end",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3",
                step <= 1 && "w-full justify-between",
              )}
            >
              {step === 0 ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSkipSpecialty}
                    className="h-11 self-start border border-transparent px-0 text-sm font-semibold text-[hsl(214,18%,44%)] hover:bg-transparent hover:text-[hsl(219,36%,18%)]"
                  >
                    Izlaist
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!form.specialty}
                    className="h-12 min-w-[168px] self-end rounded-[10px] bg-[linear-gradient(180deg,hsl(220,36%,18%),hsl(218,34%,24%))] px-6 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-45"
                  >
                    Turpināt
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    className="h-11 border border-transparent px-0 text-sm font-semibold text-[hsl(214,18%,44%)] hover:bg-transparent hover:text-[hsl(219,36%,18%)]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Atpakaļ
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="h-12 min-w-[168px] rounded-[10px] bg-[linear-gradient(180deg,hsl(220,36%,18%),hsl(218,34%,24%))] px-6 text-sm font-semibold text-white transition hover:opacity-95"
                  >
                    Sākt darbu
                    <ArrowRight className="h-5 w-5" />
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

