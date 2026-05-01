import * as React from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  GripVertical,
  HeartPulse,
  ImageIcon,
  Info,
  Pill,
  Search,
  Stethoscope,
  UserRound,
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
  | "patient-summary";

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
  description: string;
  icon: LucideIcon;
  modules: ModuleId[];
};

type RegistrationForm = {
  specialty: SpecialtyId | null;
  modules: ModuleId[];
  layoutOrder: ModuleId[];
};

const steps: StepDefinition[] = [
  { title: "01", subtitle: "Specialitāte" },
  { title: "02", subtitle: "Darba panelis" },
];

const moduleOptions: ModuleOption[] = [
  {
    id: "patient-card",
    title: "Pacienta kopsavilkums",
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
    title: "Ķermeņa modelis",
    description: "Anatomiskais skats ar atradnēm un reģioniem",
    icon: UserRound,
  },
  {
    id: "referrals",
    title: "E-nosūtījumi",
    description: "Aktīvie un vēsturiskie nosūtījumi",
    icon: FileText,
  },
  {
    id: "patient-summary",
    title: "Pacienta kopsavilkums+",
    description: "Ātrs klīniskais kopsavilkums ar rekomendācijām",
    icon: FileText,
  },
];

const specialtyOptions: SpecialtyOption[] = [
  {
    id: "family-medicine",
    title: "Ģimenes ārsts",
    description: "Plašs vispārējās aprūpes pārskats",
    icon: Stethoscope,
    modules: [
      "patient-card",
      "health-trends",
      "medications",
      "alerts",
      "timeline",
      "patient-summary",
    ],
  },
  {
    id: "cardiology",
    title: "Kardiologs",
    description: "Sirds un asinsvadu sistēma",
    icon: HeartPulse,
    modules: [
      "patient-card",
      "health-trends",
      "imaging",
      "medications",
      "alerts",
      "timeline",
      "patient-summary",
    ],
  },
  {
    id: "endocrinology",
    title: "Endokrinologs",
    description: "Hormonu un metabolo slimību pārskats",
    icon: Activity,
    modules: [
      "patient-card",
      "health-trends",
      "medications",
      "alerts",
      "timeline",
      "patient-summary",
    ],
  },
  {
    id: "vascular-surgery",
    title: "Asinsvadu ķirurgs",
    description: "Vēnu un artēriju ķirurģija",
    icon: HeartPulse,
    modules: [
      "patient-card",
      "health-trends",
      "imaging",
      "alerts",
      "timeline",
      "referrals",
    ],
  },
  {
    id: "neurology",
    title: "Neirologs",
    description: "Nervu sistēmas slimības",
    icon: Brain,
    modules: [
      "patient-card",
      "health-trends",
      "imaging",
      "medications",
      "timeline",
      "patient-summary",
    ],
  },
  {
    id: "oncology",
    title: "Onkologs",
    description: "Audzēju diagnostika un terapija",
    icon: AlertTriangle,
    modules: [
      "patient-card",
      "health-trends",
      "imaging",
      "medications",
      "alerts",
      "timeline",
      "referrals",
      "patient-summary",
    ],
  },
  {
    id: "pulmonology",
    title: "Pulmonologs",
    description: "Plaušu un elpceļu slimības",
    icon: Stethoscope,
    modules: [
      "patient-card",
      "health-trends",
      "imaging",
      "medications",
      "alerts",
      "timeline",
    ],
  },
  {
    id: "gastroenterology",
    title: "Gastroenterologs",
    description: "Gremošanas sistēmas pārskats",
    icon: Pill,
    modules: [
      "patient-card",
      "health-trends",
      "medications",
      "alerts",
      "timeline",
      "patient-summary",
    ],
  },
  {
    id: "dermatology",
    title: "Dermatologs",
    description: "Ādas slimības un izmaiņas",
    icon: UserRound,
    modules: [
      "patient-card",
      "imaging",
      "medications",
      "timeline",
      "patient-summary",
    ],
  },
  {
    id: "orthopedics",
    title: "Ortopēds",
    description: "Skelets un balsta aparāts",
    icon: Activity,
    modules: [
      "patient-card",
      "imaging",
      "medications",
      "timeline",
      "referrals",
      "patient-summary",
    ],
  },
  {
    id: "psychiatry",
    title: "Psihiatrs",
    description: "Garīgās veselības aprūpe",
    icon: Brain,
    modules: [
      "patient-card",
      "medications",
      "alerts",
      "timeline",
      "patient-summary",
    ],
  },
  {
    id: "pediatrics",
    title: "Pediatrs",
    description: "Bērnu vispārējā aprūpe",
    icon: Stethoscope,
    modules: [
      "patient-card",
      "health-trends",
      "medications",
      "alerts",
      "timeline",
      "patient-summary",
    ],
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
  "patient-summary",
];

const previewCardInfo: Record<ModuleId, { note: string; summary: string }> = {
  "patient-card": {
    note: "Pacienta profils",
    summary: "Personas dati, diagnozes un primārie riski.",
  },
  "health-trends": {
    note: "Klīniskie trendi",
    summary: "Pulss, glikoze un asinsspiediens 30 dienu griezumā.",
  },
  imaging: {
    note: "Attēli",
    summary: "RTG un CT atradnes ar jaunāko aprakstu.",
  },
  medications: {
    note: "Terapija",
    summary: "Aktuālie medikamenti, devas un mijiedarbību signāli.",
  },
  alerts: {
    note: "Brīdinājumi",
    summary: "Nokavētas vizītes un izmainīti laboratorijas rezultāti.",
  },
  timeline: {
    note: "Pacienta gaita",
    summary: "Vizīšu, analīžu un procedūru hronoloģiskā secība.",
  },
  "body-model": {
    note: "Vizualizācija",
    summary: "Anatomiskais skats ar atradnēm un saistītajiem reģioniem.",
  },
  referrals: {
    note: "Vēsture",
    summary: "Nosūtījumi un iepriekšējās speciālistu konsultācijas.",
  },
  "patient-summary": {
    note: "Kopsavilkums",
    summary: "Īss kopsavilkums ar būtiskākajām izmaiņām un rekomendācijām.",
  },
};

const initialForm: RegistrationForm = {
  specialty: null,
  modules: [],
  layoutOrder: defaultLayoutOrder,
};

const aboveTheFoldCount = 3;

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function RegistrationPage() {
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

        return [option.title, option.description].some((value) =>
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

  const aboveTheFoldItems = visibleLayoutItems.slice(0, aboveTheFoldCount);
  const belowTheFoldItems = visibleLayoutItems.slice(aboveTheFoldCount);

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
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[hsl(219,36%,18%)]">
      <main className="mx-auto flex min-h-screen w-full max-w-[1360px] flex-col px-5 py-6 md:px-8 lg:px-10">
        <div className="border-b border-[rgba(220,228,236,0.96)] pb-2">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,hsl(220,36%,18%),hsl(218,34%,24%))] text-white shadow-[0_10px_24px_rgba(29,53,87,0.16)]">
                <Check className="h-5 w-5" />
              </div>

              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[hsl(214,18%,60%)]">
                OMNUS
              </p>
            </div>
          </div>

          <div className="mx-auto mt-3 hidden w-full max-w-[760px] md:block">
            <div className="relative flex items-start justify-between">
              <div className="absolute left-[90px] right-[90px] top-5 h-px bg-[rgba(214,222,230,0.96)]" />
              <div
                className="absolute left-[90px] top-5 h-px bg-[hsl(220,36%,18%)] transition-all duration-300"
                style={{ width: step === 0 ? "180px" : "calc(100% - 180px)" }}
              />

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
                    className="relative z-10 flex w-[180px] flex-col items-center text-center"
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border bg-white text-[16px] font-semibold transition",
                        isActive
                          ? "border-[hsl(220,36%,18%)] bg-[hsl(220,36%,18%)] text-white shadow-[0_8px_20px_rgba(29,53,87,0.14)]"
                          : isComplete
                            ? "border-[hsl(220,36%,18%)] bg-white text-[hsl(220,36%,18%)]"
                            : "border-[rgba(210,219,228,0.96)] text-[hsl(214,14%,56%)]",
                      )}
                    >
                      {isComplete ? <Check className="h-4 w-4" /> : item.title}
                    </span>

                    <span
                      className={cn(
                        "mt-2 text-[14px] font-semibold",
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
          </div>
        </div>

        <div className="flex flex-1 flex-col pt-3 pb-8">
          {step === 0 && (
            <section className="flex flex-1 flex-col">
              <div className="w-full">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[hsl(214,18%,60%)]">
                  Solis 01
                </p>

                <h1 className="mt-2 text-[38px] font-semibold tracking-[-0.05em] text-[hsl(219,40%,16%)] md:text-[52px]">
                  Izvēlieties savu specialitāti
                </h1>

                <p className="mt-2 w-full text-[17px] leading-8 text-[hsl(214,16%,46%)]">
                  Mēs pielāgosim pacienta pārskatu jūsu darba prioritātēm. Šos
                  iestatījumus varēsiet mainīt jebkurā brīdī.
                </p>
              </div>

              <div className="mt-7 max-w-[520px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(214,14%,58%)]" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Meklēt specialitāti..."
                    className="h-12 border-[rgba(214,222,230,0.96)] bg-white pl-11 pr-4 text-[15px] shadow-none placeholder:text-[hsl(214,14%,62%)] focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {filteredSpecialties.map((option) => {
                  const isSelected = form.specialty === option.id;
                  const SpecialtyIcon = option.icon;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => applySpecialtyPreset(option.id)}
                      className={cn(
                        "border bg-white px-4 py-4 text-left transition",
                        isSelected
                          ? "border-[hsl(220,36%,18%)] bg-[hsl(220,34%,97%)] shadow-[0_10px_24px_rgba(29,53,87,0.08)]"
                          : "border-[rgba(216,224,232,0.96)] hover:border-[rgba(184,197,210,0.96)]",
                      )}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[rgba(214,222,230,0.96)] bg-[hsl(214,20%,98%)] text-[hsl(214,18%,52%)]">
                        <SpecialtyIcon className="h-4 w-4" />
                      </span>

                      <p className="mt-4 text-[17px] font-semibold text-[hsl(219,30%,22%)]">
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
            <section className="flex flex-1 flex-col">
              <div className="max-w-[880px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[hsl(214,18%,60%)]">
                  Solis 02
                </p>

                <h1 className="mt-4 text-[40px] font-semibold tracking-[-0.05em] text-[hsl(219,40%,16%)] md:text-[52px]">
                  Izkārtojiet savu darba paneli
                </h1>

                <p className="mt-4 text-[18px] leading-8 text-[hsl(214,16%,46%)]">
                  {selectedSpecialty ? (
                    <>
                      Sākuma saturs ir pielāgots{" "}
                      <strong className="font-semibold text-[hsl(219,30%,22%)]">
                        {selectedSpecialty.title}
                      </strong>
                      . Sakārtojiet moduļus sev ērtākajā secībā.
                    </>
                  ) : (
                    "Sakārtojiet moduļus sev ērtākajā secībā."
                  )}
                </p>
              </div>

              <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.74fr)]">
                <div className="border border-[rgba(216,224,232,0.96)] bg-white p-5">
                  <div>
                    <p className="text-[18px] font-semibold text-[hsl(219,30%,22%)]">
                      Sakārtojiet pārskatu pēc nozīmīguma
                    </p>

                    <p className="mt-2 text-[15px] leading-7 text-[hsl(214,16%,48%)]">
                      Velciet komponentus uz atbilstošo pozīciju. Izvēle tiks
                      saglabāta{" "}
                      {selectedSpecialty
                        ? selectedSpecialty.title.toLowerCase()
                        : "profilam"}
                      .
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
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
                          "flex items-center gap-4 border px-4 py-4 transition",
                          draggedModuleId === item.id
                            ? "border-[hsl(220,36%,18%)] bg-[hsl(220,34%,97%)]"
                            : "border-[rgba(216,224,232,0.96)] bg-white",
                        )}
                      >
                        <GripVertical className="h-4 w-4 shrink-0 text-[hsl(214,12%,58%)]" />
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[hsl(214,20%,96%)] text-[13px] font-semibold text-[hsl(214,18%,48%)]">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-semibold text-[hsl(219,30%,22%)]">
                            {item.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveModuleByOffset(item.id, -1)}
                            className="flex h-8 w-8 items-center justify-center border border-transparent text-[hsl(214,16%,54%)] transition hover:border-[rgba(214,222,230,0.96)] hover:bg-[hsl(214,20%,98%)]"
                            aria-label={`${item.title} uz augšu`}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveModuleByOffset(item.id, 1)}
                            className="flex h-8 w-8 items-center justify-center border border-transparent text-[hsl(214,16%,54%)] transition hover:border-[rgba(214,222,230,0.96)] hover:bg-[hsl(214,20%,98%)]"
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
                      <div className="my-6 flex items-center gap-4">
                        <div className="h-px flex-1 bg-[rgba(220,228,236,0.96)]" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(214,18%,60%)]">
                          Lapa beidzas šeit
                        </p>
                        <div className="h-px flex-1 bg-[rgba(220,228,236,0.96)]" />
                      </div>

                      <div className="space-y-3">
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
                              "flex items-center gap-4 border px-4 py-4 transition",
                              draggedModuleId === item.id
                                ? "border-[hsl(220,36%,18%)] bg-[hsl(220,34%,97%)]"
                                : "border-[rgba(216,224,232,0.96)] bg-white",
                            )}
                          >
                            <GripVertical className="h-4 w-4 shrink-0 text-[hsl(214,12%,58%)]" />
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[hsl(214,20%,96%)] text-[13px] font-semibold text-[hsl(214,18%,48%)]">
                              {aboveTheFoldCount + index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[15px] font-semibold text-[hsl(219,30%,22%)]">
                                {item.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveModuleByOffset(item.id, -1)}
                                className="flex h-8 w-8 items-center justify-center border border-transparent text-[hsl(214,16%,54%)] transition hover:border-[rgba(214,222,230,0.96)] hover:bg-[hsl(214,20%,98%)]"
                                aria-label={`${item.title} uz augšu`}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveModuleByOffset(item.id, 1)}
                                className="flex h-8 w-8 items-center justify-center border border-transparent text-[hsl(214,16%,54%)] transition hover:border-[rgba(214,222,230,0.96)] hover:bg-[hsl(214,20%,98%)]"
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

                  <div className="mt-6 flex items-start gap-3 border border-[rgba(216,224,232,0.96)] bg-[hsl(214,22%,98%)] px-4 py-3 text-[14px] text-[hsl(214,16%,48%)]">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(214,24%,50%)]" />
                    <p>
                      Prioritātes un izkārtojumu varēsiet mainīt arī vēlāk
                      pacienta dashboardā.
                    </p>
                  </div>
                </div>

                <div className="border border-[rgba(216,224,232,0.96)] bg-white p-5">
                  <div className="border border-[rgba(216,224,232,0.96)] bg-[hsl(214,20%,98%)] px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[hsl(214,14%,76%)]" />
                        <span className="h-2 w-2 rounded-full bg-[hsl(214,14%,76%)]" />
                        <span className="h-2 w-2 rounded-full bg-[hsl(214,14%,76%)]" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(214,16%,58%)]">
                        Preview
                      </span>
                    </div>
                  </div>

                  <div className="border-x border-b border-[rgba(216,224,232,0.96)] bg-white p-4">
                    <div className="border border-[rgba(220,228,236,0.96)] bg-white p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 bg-[hsl(220,28%,84%)]" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-[58%] bg-[hsl(214,16%,88%)]" />
                          <div className="h-3 w-[42%] bg-[hsl(214,16%,92%)]" />
                        </div>
                      </div>
                      <div className="mt-5 grid grid-cols-3 gap-3">
                        <div className="h-6 bg-[hsl(214,18%,92%)]" />
                        <div className="h-6 bg-[hsl(214,18%,92%)]" />
                        <div className="h-6 bg-[hsl(214,18%,92%)]" />
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3">
                      {visibleLayoutItems.slice(0, 4).map((item, index) => {
                        const previewInfo = previewCardInfo[item.id];
                        const isAlertCard = item.id === "alerts";
                        const isTrendCard = item.id === "health-trends";

                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "border p-4",
                              isAlertCard
                                ? "border-[rgba(239,203,203,0.96)] bg-[hsl(0,60%,97%)]"
                                : "border-[rgba(220,228,236,0.96)] bg-white",
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(214,16%,58%)]">
                                  {previewInfo.note}
                                </p>
                                <p className="mt-1 text-[13px] leading-5 text-[hsl(214,18%,42%)]">
                                  {previewInfo.summary}
                                </p>
                              </div>
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-[hsl(214,20%,96%)] text-[hsl(214,16%,48%)]">
                                {index + 1}
                              </span>
                            </div>

                            <div className="mt-4">
                              {isTrendCard ? (
                                <div className="flex h-[62px] items-end gap-2">
                                  <div className="h-4 w-8 bg-[hsl(220,34%,74%)]" />
                                  <div className="h-8 w-8 bg-[hsl(220,34%,74%)]" />
                                  <div className="h-5 w-8 bg-[hsl(220,34%,74%)]" />
                                  <div className="h-12 w-8 bg-[hsl(220,34%,74%)]" />
                                </div>
                              ) : (
                                <div
                                  className={cn(
                                    "h-[54px]",
                                    isAlertCard
                                      ? "bg-[rgba(255,255,255,0.72)]"
                                      : "bg-[hsl(214,20%,95%)]",
                                  )}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="mt-8 flex flex-col items-end gap-4 border-t border-[rgba(220,228,236,0.96)] pt-5 md:flex-row md:items-center md:justify-end">
  <div className="flex items-center gap-3">
              {step === 0 ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSkipSpecialty}
                    className="h-10 border border-transparent px-4 text-[14px] font-semibold text-[hsl(214,18%,44%)] hover:bg-[hsl(214,20%,98%)] hover:text-[hsl(219,36%,18%)]"
                  >
                    Izlaist
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!form.specialty}
                    className="h-10 bg-[linear-gradient(180deg,hsl(220,36%,18%),hsl(218,34%,24%))] px-5 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(29,53,87,0.16)] transition hover:opacity-95 disabled:opacity-45"
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
                    className="h-10 border border-transparent px-4 text-[14px] font-semibold text-[hsl(214,18%,44%)] hover:bg-[hsl(214,20%,98%)] hover:text-[hsl(219,36%,18%)]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Atpakaļ
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="h-10 bg-[linear-gradient(180deg,hsl(220,36%,18%),hsl(218,34%,24%))] px-5 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(29,53,87,0.16)] transition hover:opacity-95"
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
