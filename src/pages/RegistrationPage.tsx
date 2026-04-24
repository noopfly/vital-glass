import * as React from "react";
import { Link } from "react-router-dom";
import {
  PersonStanding,
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Clock3,
  FileText,
  GripVertical,
  ImageIcon,
  Pill,
  RefreshCw,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

type ModuleOption = {
  id: ModuleId;
  title: string;
  description: string;
  icon: LucideIcon;
};

type RegistrationForm = {
  modules: ModuleId[];
  layoutOrder: ModuleId[];
};

const steps: StepDefinition[] = [
  { title: "Komponentes", subtitle: "Izvēlieties saturu" },
  { title: "Izkārtojums", subtitle: "Sakārtojiet secību" },
];

const moduleOptions: ModuleOption[] = [
  {
    id: "patient-card",
    title: "Pacienta karte",
    description: "Pamatinformācija: vārds, personas kods, vecums, diagnozes",
    icon: UserRound,
  },
  {
    id: "health-trends",
    title: "Veselības rādītāji",
    description: "Laboratorijas rezultātu pārskats un to izmaiņas laikā",
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
    title: "Medikamentu tabula",
    description: "Aktuālie medikamenti, devas un mijiedarbības",
    icon: Pill,
  },
  {
    id: "alerts",
    title: "Brīdinājumi",
    description: "Nokavētās vizītes, izmainīti laboratorijas rezultāti",
    icon: AlertTriangle,
  },
  {
    id: "timeline",
    title: "Notikumu laika līnija",
    description: "Hronoloģisks pacienta notikumu pārskats",
    icon: Clock3,
  },
  {
    id: "body-model",
    title: "Ķermeņa modelis",
    description: "Pacienta ķermeņa apskats ar atradnēm",
    icon: PersonStanding,
  },
  {
    id: "referrals",
    title: "E-nosūtījumi",
    description: "Aktīvie un vēsturiskie nosūtījumi",
    icon: FileText,
  },
  {
    id: "patient-summary",
    title: "Pacienta kopsavilkums",
    description: "Īss pacienta veselības stāvokļa kopsavilkums",
    icon: ClipboardList,
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

const previewLayoutClasses: Record<ModuleId, string> = {
  "patient-card": "col-span-3 row-span-1",
  "health-trends": "col-span-2 row-span-1",
  imaging: "col-span-1 row-span-2",
  medications: "col-span-1 row-span-1",
  alerts: "col-span-1 row-span-2",
  timeline: "col-span-3 row-span-1",
  "body-model": "col-span-1 row-span-2",
  referrals: "col-span-1 row-span-1",
  "patient-summary": "col-span-3 row-span-1",
};

const previewCardInfo: Record<
  ModuleId,
  { summary: string; note: string; accentClass: string }
> = {
  "patient-card": {
    summary: "Personas dati, diagnozes un primārie riski.",
    note: "Pacienta profils",
    accentClass: "bg-[hsl(208,68%,96%)] text-[hsl(208,46%,42%)]",
  },
  "health-trends": {
    summary: "Pulss, glikoze un asinsspiediens pēdējo 30 dienu griezumā.",
    note: "Klīniskie trendi",
    accentClass: "bg-[hsl(191,64%,95%)] text-[hsl(191,46%,40%)]",
  },
  imaging: {
    summary: "RTG un CT atradnes ar pēdējo aprakstu.",
    note: "Attēli",
    accentClass: "bg-[hsl(217,72%,96%)] text-[hsl(217,52%,44%)]",
  },
  medications: {
    summary: "Aktuālie medikamenti, devas un mijiedarbību signāli.",
    note: "Terapija",
    accentClass: "bg-[hsl(33,100%,96%)] text-[hsl(32,74%,42%)]",
  },
  alerts: {
    summary: "Nokavētas vizītes un izmainīti laboratorijas rezultāti.",
    note: "Brīdinājumi",
    accentClass: "bg-[hsl(6,100%,96%)] text-[hsl(6,72%,48%)]",
  },
  timeline: {
    summary: "Vizīšu, analīžu un procedūru hronoloģiska secība.",
    note: "Pacienta gaita",
    accentClass: "bg-[hsl(212,40%,95%)] text-[hsl(212,28%,44%)]",
  },
  "body-model": {
    summary: "Anatomiskais skats ar atradnēm un saistītajiem reģioniem.",
    note: "Vizualizācija",
    accentClass: "bg-[hsl(191,64%,95%)] text-[hsl(191,46%,40%)]",
  },
  referrals: {
    summary: "Nosūtījumi un iepriekšējās speciālistu konsultācijas.",
    note: "Vēsture",
    accentClass: "bg-[hsl(214,46%,96%)] text-[hsl(214,28%,44%)]",
  },
  "patient-summary": {
    summary: "Īss kopsavilkums ar būtiskākajām izmaiņām un rekomendācijām.",
    note: "Kopsavilkums",
    accentClass: "bg-[hsl(268,42%,96%)] text-[hsl(268,28%,46%)]",
  },
};

const initialForm: RegistrationForm = {
  modules: [],
  layoutOrder: defaultLayoutOrder,
};

export default function RegistrationPage() {
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<RegistrationForm>(initialForm);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [draggedModuleId, setDraggedModuleId] = React.useState<ModuleId | null>(
    null,
  );

  const allModulesSelected = form.modules.length === moduleOptions.length;

  const moduleMap = React.useMemo(
    () =>
      Object.fromEntries(
        moduleOptions.map((option) => [option.id, option]),
      ) as Record<ModuleId, ModuleOption>,
    [],
  );

  const visibleLayoutItems = React.useMemo(
    () =>
      form.layoutOrder
        .filter((item) => form.modules.includes(item))
        .map((item) => moduleMap[item]),
    [form.layoutOrder, form.modules, moduleMap],
  );

  const toggleModule = (moduleId: ModuleId) => {
    setForm((current) => {
      const isSelected = current.modules.includes(moduleId);
      const nextModules = isSelected
        ? current.modules.filter((item) => item !== moduleId)
        : [...current.modules, moduleId];
      const nextLayoutOrder = current.layoutOrder.includes(moduleId)
        ? current.layoutOrder
        : [...current.layoutOrder, moduleId];

      return { ...current, modules: nextModules, layoutOrder: nextLayoutOrder };
    });

    setErrors((current) => {
      if (!current.modules) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors.modules;
      return nextErrors;
    });
  };

  const handleSelectAllModules = () => {
    setForm((current) => ({
      ...current,
      modules: allModulesSelected ? [] : moduleOptions.map((option) => option.id),
      layoutOrder: allModulesSelected
        ? current.layoutOrder
        : [
            ...current.layoutOrder,
            ...defaultLayoutOrder.filter(
              (item) => !current.layoutOrder.includes(item),
            ),
          ],
    }));

    setErrors((current) => {
      if (!current.modules) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors.modules;
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

  const validateStep = () => {
    const nextErrors: Record<string, string> = {};

    if (step === 0 && form.modules.length < 3) {
      nextErrors.modules = "Izvēlieties vismaz 3 komponentes.";
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

  const handleSubmit = () => {
    if (!validateStep()) {
      return;
    }

    toast.success("Profils sagatavots", {
      description:
        "Reģistrācijas plūsma ir gatava. Tālāk var pieslēgt autorizāciju vai backend integrāciju.",
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#e6f1fb_45%,#eef7ff_100%)] text-[hsl(213,42%,22%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-8%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(120,196,242,0.28)_0%,rgba(120,196,242,0)_72%)] blur-2xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(128,229,214,0.18)_0%,rgba(128,229,214,0)_74%)] blur-2xl" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgba(124,170,214,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,170,214,0.08) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
            maskImage:
              "radial-gradient(circle at center, black 28%, transparent 88%)",
          }}
        />
      </div>

      <header className="relative border-b border-[rgba(203,219,232,0.72)] bg-white/42 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[980px] items-center justify-end px-4 py-4 md:px-5 lg:px-6">
          <p className="text-sm text-[hsl(212,18%,46%)]">
            Jau ir profils?{" "}
            <Link
              className="font-semibold text-[hsl(206,78%,48%)] transition hover:text-[hsl(206,78%,42%)]"
              to="/"
            >
              Pieslēgties
            </Link>
          </p>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-[1120px] px-6 py-8 md:px-8 md:py-10">
        <section className="mx-auto max-w-[1120px]">
          <h1 className="text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.04em] text-[hsl(213,58%,18%)] md:text-[3rem]">
            Ārstu reģistrācija
          </h1>
          <p className="mt-3 max-w-[820px] text-[15px] leading-7 text-[hsl(212,24%,42%)] md:text-[16px]">
            Izveidojiet savu kontu un pielāgojiet pacienta paneli pēc savām
            vajadzībām, izvēlieties komponentes un sakārtojiet tās tā, kā jums
            ērtāk strādāt.
          </p>
        </section>

        <div className="mx-auto mt-8 max-w-[1120px] rounded-[1.75rem] border border-[rgba(215,225,235,0.9)] bg-white px-6 py-5 shadow-[0_8px_20px_rgba(111,161,198,0.08)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            {steps.map((item, index) => {
              const isActive = index === step;
              const isComplete = index < step;
              const isLast = index === steps.length - 1;

              return (
                <React.Fragment key={item.title}>
                  <button
                    type="button"
                    onClick={() => {
                      if (index <= step) {
                        setErrors({});
                        setStep(index);
                      }
                    }}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-[15px] font-semibold transition-all duration-300",
                        isActive
                          ? "border-[hsl(206,80%,49%)] bg-[hsl(206,80%,49%)] text-white shadow-[0_12px_24px_rgba(82,163,224,0.20)]"
                          : isComplete
                            ? "border-[hsl(145,49%,49%)] bg-[hsl(145,49%,49%)] text-white"
                            : "border-[rgba(203,214,225,0.92)] bg-white text-[hsl(212,22%,42%)]",
                      )}
                    >
                      {isComplete ? <Check className="h-5 w-5" /> : index + 1}
                    </div>

                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-[15px] font-semibold tracking-[-0.02em]",
                          isActive || isComplete
                            ? "text-[hsl(213,48%,24%)]"
                            : "text-[hsl(212,24%,40%)]",
                        )}
                      >
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[13px] leading-4 text-[hsl(212,24%,46%)]">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>

                  {!isLast && (
                    <div
                      className={cn(
                        "hidden h-px flex-[0.7] md:block",
                        index < step
                          ? "bg-[rgba(88,197,127,0.85)]"
                          : "bg-[rgba(214,223,232,0.95)]",
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-[1120px]">
          <section className="rounded-[1.75rem] border border-[rgba(215,225,235,0.9)] bg-white p-6 shadow-[0_8px_24px_rgba(111,161,198,0.08)] md:p-8">
            <div className="flex flex-col gap-2 border-b border-[rgba(173,197,221,0.42)] pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="mt-2 text-[2.1rem] font-semibold tracking-[-0.03em] text-[hsl(213,58%,18%)]">
                  {step === 0 && "Izvēlieties paneļa komponentes"}
                  {step === 1 && "Pabeidziet darba vides iestatījumus"}
                </h2>

                <p className="mt-2 max-w-[680px] text-[15px] leading-6 text-[hsl(212,24%,45%)]">
                  {step === 0 &&
                    "Atlasiet, kādu informāciju vēlaties redzēt savā pacienta panelī."}
                  {step === 1 &&
                    "Nosakiet, kāds skats atvērsies pēc ielogošanās un kā sistēma jums piegādās svarīgos signālus."}
                </p>
              </div>

              {step === 0 ? (
                <div className="flex items-center gap-3 self-start">
                  <p className="text-[14px] text-[hsl(212,24%,45%)]">
                    Atlasīts:{" "}
                    <span className="font-semibold text-[hsl(213,48%,24%)]">
                      {form.modules.length}/{moduleOptions.length}
                    </span>
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSelectAllModules}
                    className="h-9 rounded-full border-[rgba(182,203,223,0.78)] bg-white/80 px-4 text-[13px] font-medium text-[hsl(213,42%,24%)] shadow-[0_8px_18px_rgba(111,161,198,0.06)] hover:bg-white"
                  >
                    {allModulesSelected ? "Notīrīt visu" : "Atlasīt visu"}
                  </Button>
                </div>
              ) : (
                <div className="inline-flex h-10 items-center rounded-full border border-white/60 bg-white/55 px-4 text-[13px] font-semibold text-[hsl(212,24%,46%)] shadow-[0_10px_24px_rgba(111,161,198,0.08)]">
                  Solis {step + 1} / {steps.length}
                </div>
              )}
            </div>

            <div className="pt-6">
              {step === 0 && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {moduleOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = form.modules.includes(option.id);

                      return (
                        <div
                          key={option.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleModule(option.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              toggleModule(option.id);
                            }
                          }}
                          className={cn(
                            "group rounded-[22px] border p-5 text-left transition-all duration-300",
                            isSelected
                              ? "border-[rgba(24,130,233,0.88)] bg-[linear-gradient(180deg,rgba(215,238,255,0.96),rgba(202,231,252,0.94))] shadow-[0_16px_28px_rgba(97,164,214,0.12)]"
                              : "border-[rgba(196,213,228,0.82)] bg-white/62 hover:border-[rgba(157,199,231,0.78)] hover:bg-white/74",
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 gap-4">
                              <div
                                className={cn(
                                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border transition-all",
                                  isSelected
                                    ? "border-[rgba(24,130,233,0.18)] bg-[linear-gradient(180deg,#2491ea_0%,#1479d1_100%)] text-white"
                                    : "border-[rgba(219,229,238,0.92)] bg-[hsl(210,38%,95%)] text-[hsl(209,35%,24%)]",
                                )}
                              >
                                <Icon className="h-[18px] w-[18px]" />
                              </div>

                              <div className="min-w-0">
                                <p className="text-lg font-semibold tracking-[-0.02em] text-[hsl(213,50%,23%)]">
                                  {option.title}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-[hsl(212,22%,46%)]">
                                  {option.description}
                                </p>
                              </div>
                            </div>

                            <div
                              className={cn(
                                "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                                isSelected
                                  ? "border-[hsl(206,82%,48%)] bg-[hsl(206,82%,48%)] text-white"
                                  : "border-[rgba(207,220,231,0.92)] bg-white/90 text-transparent",
                              )}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {errors.modules && (
                    <p className="text-sm text-[hsl(0,72%,55%)]">
                      {errors.modules}
                    </p>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(241,248,255,0.82))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] md:p-4">
                    <div className="mx-auto max-w-[760px] rounded-[28px] border border-[rgba(220,228,236,0.92)] bg-[#f5f7fa] p-3 shadow-[0_14px_36px_rgba(111,161,198,0.10)]">
                      <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[rgba(217,225,233,0.92)] bg-white/78 px-3 py-2.5 shadow-[0_6px_16px_rgba(111,161,198,0.06)]">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[hsl(214,20%,58%)]">
                            Pacienta panelis
                          </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-[14px] border border-[rgba(217,225,233,0.92)] bg-white/84 px-2.5 py-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-[12px] border border-[rgba(205,218,229,0.92)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(234,245,255,0.94))] text-[hsl(206,80%,49%)]">
                            <RefreshCw className="h-3.5 w-3.5" />
                          </div>
                          <div className="hidden min-w-0 sm:block">
                            <p className="text-[11px] font-semibold text-[hsl(213,42%,24%)]">
                              Atjaunot datus
                            </p>
                            <p className="text-[10px] text-[hsl(214,18%,58%)]">
                              Atjaunots: šodien
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 auto-rows-[96px] gap-3 md:auto-rows-[104px]">
                        {visibleLayoutItems.map((item) => {
                          const Icon = item.icon;
                          const previewInfo = previewCardInfo[item.id];

                          return (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={() => setDraggedModuleId(item.id)}
                              onDragEnd={() => setDraggedModuleId(null)}
                              onDragOver={(event) => {
                                event.preventDefault();
                                if (
                                  !draggedModuleId ||
                                  draggedModuleId === item.id
                                ) {
                                  return;
                                }

                                const toIndex = form.layoutOrder.indexOf(item.id);
                                if (toIndex !== -1) {
                                  moveDraggedModule(toIndex);
                                }
                              }}
                              className={cn(
                                "group relative overflow-hidden rounded-[20px] border border-[#dfe4eb] bg-white/84 p-3 shadow-[0_6px_18px_hsla(210,25%,82%,0.08)] transition-opacity",
                                previewLayoutClasses[item.id],
                                draggedModuleId === item.id && "opacity-70",
                              )}
                            >
                              <div className="absolute right-2 top-2 text-[hsl(214,12%,62%)] opacity-0 transition-opacity group-hover:opacity-100">
                                <GripVertical className="h-3.5 w-3.5" />
                              </div>

                              <div className="flex h-full flex-col">
                                <div className="flex items-start gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] border border-[rgba(219,229,238,0.92)] bg-[hsl(210,38%,95%)] text-[hsl(209,35%,24%)]">
                                    <Icon className="h-4 w-4" />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="truncate text-[11px] font-semibold text-[hsl(213,42%,24%)]">
                                        {item.title}
                                      </p>
                                      <span
                                        className={cn(
                                          "inline-flex rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em]",
                                          previewInfo.accentClass,
                                        )}
                                      />
                                    </div>

                                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[hsl(214,18%,50%)]">
                                      {previewInfo.summary}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-auto pt-3">
                                  <div className="space-y-1.5">
                                    <div className="h-1.5 w-[78%] rounded-full bg-[hsl(210,32%,90%)]" />
                                    <div className="h-1.5 w-[54%] rounded-full bg-[hsl(210,32%,93%)]" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-[rgba(173,197,221,0.42)] pt-5 md:flex-row md:items-center md:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={step === 0}
                className="h-10 justify-start rounded-[14px] px-0 text-[14px] font-semibold text-[hsl(212,18%,50%)] hover:bg-transparent hover:text-[hsl(213,42%,22%)] disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Atpakaļ
              </Button>

              <div className="flex items-center gap-4 self-end md:self-auto">
                <span className="text-[15px] text-[hsl(212,18%,48%)]">
                  Solis {step + 1} / {steps.length}
                </span>

                {step < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="h-10 rounded-[14px] bg-[hsl(206,80%,49%)] px-6 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(90,177,232,0.18)] transition-all duration-300 hover:opacity-95"
                  >
                    Tālāk
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="h-10 rounded-[14px] bg-[hsl(206,80%,49%)] px-6 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(90,177,232,0.18)] transition-all duration-300 hover:opacity-95"
                  >
                    Izveidot profilu
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
