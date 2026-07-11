import * as React from "react";
import { useLocation } from "react-router-dom";
import {
  Check,
  ChevronRight,
  ClipboardCheck,
  Download,
  Eye,
  FolderPlus,
  Loader2,
  Maximize2,
  Search,
  Stethoscope,
  X,
} from "lucide-react";
import { renderAsync } from "docx-preview";

import DashboardSidebar from "@/components/DashboardSidebar";
import { CenteredOverlay } from "@/components/ui/centered-overlay";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { patients } from "@/data/patients";
import {
  downloadGeneratedFile,
  generateDocumentDraft,
  generateDocumentPreviewBlob,
  getPatientDocumentData,
  listDocumentTemplates,
  prepareDocumentTemplate,
  searchPatients,
  updateDocumentDraft,
  validateDraftBeforeGeneration,
} from "@/lib/document-template-api";
import {
  documentTemplateMap,
} from "@/lib/document-templates";
import {
  filterDashboardLayoutOrderBySpecialty,
  normalizeDashboardLayoutOrder,
  readStoredDashboardLayoutOrder,
  type DashboardComponentKey,
} from "@/lib/dashboard-layout";
import {
  readStoredDashboardSpecialty,
  type SpecialtyId,
} from "@/lib/specialties";
import {
  readStoredLastViewedPatient,
  writeStoredLastViewedPatientId,
} from "@/lib/last-viewed-patient";
import { cn } from "@/lib/utils";
import {
  type DocumentTemplateSummary,
  type PatientDocumentData,
  type PatientSearchResult,
  type PreparedDocumentDraft,
  type PreparedDraftField,
  type TemplateFieldStatus,
} from "@/types/document-templates";
import { type Patient } from "@/types/patient";

type DocumentDraftsLocationState = {
  patient?: Patient;
  layoutOrder?: DashboardComponentKey[];
  specialtyId?: SpecialtyId;
};

type DraftFieldState = {
  value: string;
};

const surfaceClassName =
  "relative rounded-lg border border-[hsl(214,22%,88%)] bg-white";
const selectItemClassName =
  "focus:bg-[hsl(214,18%,34%)] focus:text-white data-[highlighted]:bg-[hsl(214,18%,34%)] data-[highlighted]:text-white";
const fieldFocusClassName =
  "focus-visible:border-[hsl(217,38%,22%)] focus-visible:ring-[hsl(217,38%,22%)]";
const reviewAlertClassName =
  "rounded-lg border border-[hsl(39,55%,84%)] bg-[hsl(42,72%,96%)] px-3 py-3";

const prepareLoadingSteps = [
  {
    title: "Savācam pacienta datus",
    description: "Tiek ielasīti pacienta pamatdati, diagnozes, analīzes un vizīšu informācija.",
  },
  {
    title: "Atlasām dokumenta sagatavi",
    description: "Tiek piemeklēta izvēlētajam dokumentam atbilstošā veidlapa un nepieciešamie lauki.",
  },
  {
    title: "Ģenerējam automātiskos kopsavilkumus",
    description: "Sistēma apkopo atrastos klīniskos datus un sagatavo sākotnējos melnraksta tekstus.",
  },
  {
    title: "Sagatavojam rediģējamu melnrakstu",
    description: "Tiek aizpildīti automātiskie lauki un izveidots melnraksts ārsta pārbaudei.",
  },
];

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function genderLabel(gender: "male" | "female") {
  return gender === "male" ? "Vīrietis" : "Sieviete";
}

function personInitials(fullName: string) {
  const parts = fullName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function statusLabel(status: TemplateFieldStatus) {
  switch (status) {
    case "auto":
      return "Aizpildīts automātiski";
    case "needs_confirmation":
      return "Jāpārskata";
    case "doctor_required":
      return "Jāpārskata";
    case "missing":
      return "Trūkst datu";
  }
}

function statusClassName(status: TemplateFieldStatus) {
  switch (status) {
    case "auto":
      return "border-[hsl(154,34%,84%)] bg-[hsl(151,40%,96%)] text-[hsl(154,44%,30%)]";
    case "needs_confirmation":
      return "border-[hsl(39,55%,84%)] bg-[hsl(42,72%,96%)] text-[hsl(33,58%,36%)]";
    case "doctor_required":
      return "border-[hsl(39,55%,84%)] bg-[hsl(42,72%,96%)] text-[hsl(33,58%,36%)]";
    case "missing":
      return "border-[hsl(0,42%,88%)] bg-[hsl(0,55%,97%)] text-[hsl(0,42%,44%)]";
  }
}

function buildFieldStateMap(draft: PreparedDocumentDraft) {
  return Object.fromEntries(
    draft.fields.map((field) => [
      field.key,
      {
        value: field.value,
      },
    ]),
  ) as Record<string, DraftFieldState>;
}

function buildPreviewText(
  draft: PreparedDocumentDraft,
  fieldsState: Record<string, DraftFieldState>,
) {
  return draft.fields
    .map((field) => {
      const fieldState = fieldsState[field.key];
      const value = fieldState?.value?.trim() || "[nav aizpildīts]";
      return `${field.label}\n${value}`;
    })
    .join("\n\n");
}

function PrepareProgressPanel({
  patientName,
  templateLabel,
  prepareStepIndex,
}: {
  patientName: string;
  templateLabel: string;
  prepareStepIndex: number;
}) {
  return (
    <div className="rounded-[10px] border border-[rgba(214,223,231,0.98)] bg-white shadow-[0_16px_34px_rgba(30,64,91,0.08)]">
      <div className="px-6 py-6 sm:px-7 sm:py-7">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-[hsl(210,36%,96%)] text-[hsl(216,54%,34%)]">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-[hsl(214,24%,46%)]">
              Notiek sagatavošana
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[hsl(217,40%,18%)]">
              Sagatavojam dokumentu
            </h2>
            <p className="mt-3 text-sm leading-6 text-[hsl(214,16%,44%)]">
              Tiek veidots melnraksts pacientam{" "}
              <span className="font-semibold text-[hsl(217,30%,22%)]">
                {patientName}
              </span>
              {templateLabel ? (
                <>
                  {" "}dokumentam{" "}
                  <span className="font-semibold text-[hsl(217,30%,22%)]">
                    {templateLabel}
                  </span>
                </>
              ) : "."}
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[10px] border border-[rgba(214,223,231,0.98)] bg-[hsl(210,40%,99%)]">
          {prepareLoadingSteps.map((step, index) => {
            const isCompleted = index < prepareStepIndex;
            const isActive = index === prepareStepIndex;

            return (
              <div
                key={step.title}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  index > 0 && "border-t border-[rgba(223,230,237,0.96)]",
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                    isCompleted &&
                      "border-[hsl(154,34%,84%)] bg-[hsl(151,40%,96%)] text-[hsl(154,44%,30%)]",
                    isActive &&
                      "border-[rgba(208,220,229,0.96)] bg-[hsl(220,22%,95%)] text-[hsl(219,36%,24%)]",
                    !isCompleted &&
                      !isActive &&
                      "border-[rgba(223,230,237,0.96)] bg-white text-[hsl(214,16%,58%)]",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : isActive ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-normal",
                      isCompleted || isActive
                        ? "text-[hsl(217,30%,22%)]"
                        : "text-[hsl(214,16%,44%)]",
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[hsl(214,16%,52%)]">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs leading-5 text-[hsl(214,16%,52%)]">
          Ekrāns tiks atjaunināts automātiski, tiklīdz melnraksts būs gatavs pārbaudei.
        </p>
      </div>
    </div>
  );
}

function getRequiredIssues(
  draft: PreparedDocumentDraft | null,
  fieldsState: Record<string, DraftFieldState>,
) {
  if (!draft) {
    return [];
  }

  return draft.fields.filter((field) => {
    const current = fieldsState[field.key];
    if (!field.required) {
      return false;
    }

    if (!current?.value?.trim()) {
      return true;
    }

    return false;
  });
}

function AutoResizeTextarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (nextValue: string) => void;
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) {
      return;
    }

    element.style.height = "0px";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      rows={1}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "min-h-0 resize-none overflow-hidden rounded-[8px] border-[rgba(210,221,230,0.96)] bg-white px-3.5 py-3 text-sm leading-6 shadow-none",
        fieldFocusClassName,
      )}
    />
  );
}

function parseCheckboxFieldValue(value: string, options: string[]) {
  const checked = new Set<string>();
  let customReason = "";

  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const isChecked = /^[☑✓xX]/.test(line);

      options.forEach((option) => {
        if (!line.includes(option)) {
          return;
        }

        if (isChecked) {
          checked.add(option);
        }

        if (option === "Cits iemesls") {
          const parsedReason = line
            .replace(/^[☑✓xX?]\s*/, "")
            .replace(/^Cits iemesls[:\s-]*/i, "")
            .trim();

          if (parsedReason && parsedReason.toLowerCase() !== "nav norādīts") {
            customReason = parsedReason;
          }
        }
      });
    });

  return { checked, customReason };
}

function serializeCheckboxFieldValue(
  options: string[],
  checked: Set<string>,
  customReason: string,
) {
  return options
    .map((option) => {
      const prefix = checked.has(option) ? "?" : "?";

      if (option === "Cits iemesls") {
        return `${prefix} ${option}: ${customReason.trim() || "nav norādīts"}`;
      }

      return `${prefix} ${option}`;
    })
    .join("\n");
}

function CheckboxFieldInput({
  field,
  value,
  onChange,
}: {
  field: PreparedDraftField;
  value: string;
  onChange: (nextValue: string) => void;
}) {
  const options = field.options ?? [];
  const { checked, customReason } = React.useMemo(
    () => parseCheckboxFieldValue(value, options),
    [options, value],
  );

  const handleToggle = (option: string, nextChecked: boolean) => {
    const nextSelected = new Set(checked);

    if (nextChecked) {
      nextSelected.add(option);
    } else {
      nextSelected.delete(option);
    }

    onChange(serializeCheckboxFieldValue(options, nextSelected, customReason));
  };

  const handleCustomReasonChange = (nextValue: string) => {
    onChange(serializeCheckboxFieldValue(options, checked, nextValue));
  };

  return (
    <div className="rounded-[8px] border border-[rgba(214,224,232,0.96)] bg-white px-3.5 py-3">
      <div className="space-y-2.5">
        {options.map((option) => {
          const isChecked = checked.has(option);
          const isCustomReason = option === "Cits iemesls";

          return (
            <div key={option} className="space-y-2">
              <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-6 text-[hsl(217,28%,22%)]">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(nextChecked) => handleToggle(option, nextChecked === true)}
                  className="mt-1 border-[hsl(214,20%,68%)] data-[state=checked]:border-[hsl(217,38%,22%)] data-[state=checked]:bg-[hsl(217,38%,22%)]"
                />
                <span>{option}</span>
              </label>

              {isCustomReason && isChecked && (
                <div className="pl-6">
                  <Input
                    value={customReason}
                    onChange={(event) => handleCustomReasonChange(event.target.value)}
                    placeholder="Norādiet iemeslu"
                    className={cn(
                      "h-10 rounded-[8px] border-[rgba(210,221,230,0.96)] bg-white text-sm",
                      fieldFocusClassName,
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderFieldInput(
  field: PreparedDraftField,
  value: string,
  onChange: (nextValue: string) => void,
) {
  if (!field.editable) {
    return (
      <div className="rounded-[8px] border border-[rgba(214,224,232,0.96)] bg-white px-3.5 py-3 text-sm leading-6 text-[hsl(217,28%,22%)]">
        {value || "Nav pieejams"}
      </div>
    );
  }

  if (field.inputType === "textarea") {
    return <AutoResizeTextarea value={value} onChange={onChange} />;
  }

  if (field.inputType === "checkbox") {
    return <CheckboxFieldInput field={field} value={value} onChange={onChange} />;
  }

  if (field.inputType === "select") {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "h-11 rounded-[8px] border-[rgba(210,221,230,0.96)] bg-white text-sm",
            fieldFocusClassName,
          )}
        >
          <SelectValue placeholder="Izvēlieties vērtību" />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem key={option} value={option} className={selectItemClassName}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type={field.inputType === "date" ? "date" : "text"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "h-11 rounded-[8px] border-[rgba(210,221,230,0.96)] bg-white text-sm",
        fieldFocusClassName,
      )}
    />
  );
}

export default function DocumentDraftsPage() {
  const location = useLocation();
  const routeState = location.state as DocumentDraftsLocationState | undefined;
  const specialtyId = routeState?.specialtyId ?? readStoredDashboardSpecialty();
  const activePatient =
    routeState?.patient ?? readStoredLastViewedPatient(patients) ?? patients[0];

  const [layoutOrder, setLayoutOrder] = React.useState<DashboardComponentKey[]>(
    () =>
      filterDashboardLayoutOrderBySpecialty(
        normalizeDashboardLayoutOrder(
          routeState?.layoutOrder ?? readStoredDashboardLayoutOrder(),
        ),
        specialtyId,
      ),
  );

  const [templates, setTemplates] = React.useState<DocumentTemplateSummary[]>([]);
  const [searchQuery, setSearchQuery] = React.useState(
    activePatient.name,
  );
  const [searchResults, setSearchResults] = React.useState<PatientSearchResult[]>(
    [],
  );
  const [showPatientSearch, setShowPatientSearch] = React.useState(false);
  const [selectedPatientId, setSelectedPatientId] = React.useState(
    activePatient.id,
  );
  const [selectedTemplateId, setSelectedTemplateId] = React.useState("");
  const [patientDocumentData, setPatientDocumentData] =
    React.useState<PatientDocumentData | null>(null);
  const [preparedDraft, setPreparedDraft] =
    React.useState<PreparedDocumentDraft | null>(null);
  const [fieldStateMap, setFieldStateMap] = React.useState<
    Record<string, DraftFieldState>
  >({});
  const [isPreparing, setIsPreparing] = React.useState(false);
  const [prepareStepIndex, setPrepareStepIndex] = React.useState(0);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [isInlinePreviewRendering, setIsInlinePreviewRendering] = React.useState(false);
  const [isPreviewRendering, setIsPreviewRendering] = React.useState(false);
  const [inlinePreviewRenderError, setInlinePreviewRenderError] = React.useState("");
  const [previewRenderError, setPreviewRenderError] = React.useState("");
  const [pageMessage, setPageMessage] = React.useState("");
  const [pageError, setPageError] = React.useState("");

  const previewRef = React.useRef<HTMLDivElement | null>(null);
  const inlinePreviewBodyRef = React.useRef<HTMLDivElement | null>(null);
  const inlinePreviewStylesRef = React.useRef<HTMLDivElement | null>(null);
  const fullscreenPreviewBodyRef = React.useRef<HTMLDivElement | null>(null);
  const fullscreenPreviewStylesRef = React.useRef<HTMLDivElement | null>(null);
  const patientInputRef = React.useRef<HTMLInputElement | null>(null);

  const recentPatients = React.useMemo(
    () =>
      [
        activePatient,
        ...patients.filter((patient) => patient.id !== activePatient.id),
      ].slice(0, 5),
    [activePatient],
  );

  React.useEffect(() => {
    setLayoutOrder(
      filterDashboardLayoutOrderBySpecialty(
        normalizeDashboardLayoutOrder(
          routeState?.layoutOrder ?? readStoredDashboardLayoutOrder(),
        ),
        specialtyId,
      ),
    );
  }, [routeState?.layoutOrder, specialtyId]);

  React.useEffect(() => {
    if (!routeState?.patient) {
      return;
    }

    setSearchQuery(routeState.patient.name);
    setSelectedPatientId(routeState.patient.id);
    setPreparedDraft(null);
    setFieldStateMap({});
    setPageError("");
    setPageMessage("");
  }, [routeState?.patient]);

  React.useEffect(() => {
    listDocumentTemplates().then((result) => {
      setTemplates(result);
      setSelectedTemplateId((current) => current || result[0]?.id || "");
    });
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    searchPatients(searchQuery).then((result) => {
      if (isMounted) {
        setSearchResults(result);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  React.useEffect(() => {
    if (!selectedPatientId) {
      setPatientDocumentData(null);
      return;
    }

    writeStoredLastViewedPatientId(selectedPatientId);

    let isMounted = true;

    getPatientDocumentData(selectedPatientId)
      .then((data) => {
        if (isMounted) {
          setPatientDocumentData(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPatientDocumentData(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedPatientId]);

  React.useEffect(() => {
    if (!isPreparing) {
      setPrepareStepIndex(0);
      return;
    }

    setPrepareStepIndex(0);

    const intervalId = window.setInterval(() => {
      setPrepareStepIndex((current) =>
        Math.min(current + 1, prepareLoadingSteps.length - 1),
      );
    }, 650);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPreparing]);

  const selectedTemplate = selectedTemplateId
    ? documentTemplateMap[selectedTemplateId]
    : null;

  const groupedFields = React.useMemo(() => {
    if (!preparedDraft) {
      return {
        auto: [] as PreparedDraftField[],
        needs_confirmation: [] as PreparedDraftField[],
        doctor_required: [] as PreparedDraftField[],
        missing: [] as PreparedDraftField[],
      };
    }

    return preparedDraft.fields.reduce(
      (accumulator, field) => {
        accumulator[field.status].push(field);
        return accumulator;
      },
      {
        auto: [] as PreparedDraftField[],
        needs_confirmation: [] as PreparedDraftField[],
        doctor_required: [] as PreparedDraftField[],
        missing: [] as PreparedDraftField[],
      },
    );
  }, [preparedDraft]);

  const requiredIssues = React.useMemo(
    () => getRequiredIssues(preparedDraft, fieldStateMap),
    [fieldStateMap, preparedDraft],
  );

  const handleStartNewDraft = () => {
    setSearchQuery("");
    setSelectedPatientId("");
    setSelectedTemplateId("");
    setPatientDocumentData(null);
    setPreparedDraft(null);
    setFieldStateMap({});
    setShowPatientSearch(true);
    setPageError("");
    setPageMessage(
      "Atlasiet pacientu un dokumenta veidu, lai sagatavotu jaunu melnrakstu.",
    );

    window.requestAnimationFrame(() => {
      patientInputRef.current?.focus();
    });
  };

  const handleClearPatientSelection = () => {
    setSearchQuery("");
    setSelectedPatientId("");
    setPatientDocumentData(null);
    setPreparedDraft(null);
    setFieldStateMap({});
    setShowPatientSearch(true);
    setPageError("");
    setPageMessage("");

    window.requestAnimationFrame(() => {
      patientInputRef.current?.focus();
    });
  };

  const handlePrepareDocument = async () => {
    if (!selectedPatientId || !selectedTemplateId) {
      return;
    }

    const prepareStartTime = Date.now();
    setIsPreparing(true);
    setPrepareStepIndex(0);
    setPageError("");
    setPageMessage("");

    try {
      await wait(180);
      const draft = await prepareDocumentTemplate(
        selectedTemplateId,
        selectedPatientId,
      );
      setPrepareStepIndex(prepareLoadingSteps.length - 1);
      setPreparedDraft(draft);
      setFieldStateMap(buildFieldStateMap(draft));
      const elapsed = Date.now() - prepareStartTime;
      const minimumVisibleDuration = 3800;
      if (elapsed < minimumVisibleDuration) {
        await wait(minimumVisibleDuration - elapsed);
      }
    } catch {
      setPageError("Neizdevās sagatavot dokumenta melnrakstu.");
    } finally {
      setIsPreparing(false);
    }
  };

  const handleDraftFieldChange = (key: string, nextValue: string) => {
    setFieldStateMap((current) => ({
      ...current,
      [key]: {
        value: nextValue,
      },
    }));
  };

  const syncDraft = async () => {
    if (!preparedDraft) {
      return;
    }

    await updateDocumentDraft(preparedDraft.draftId, {
      fields: Object.fromEntries(
        Object.entries(fieldStateMap).map(([key, value]) => [key, value.value]),
      ),
    });
  };

  React.useEffect(() => {
    if (!preparedDraft || isPreparing) {
      return;
    }

    const bodyContainer = inlinePreviewBodyRef.current;
    const styleContainer = inlinePreviewStylesRef.current;

    if (!bodyContainer || !styleContainer) {
      return;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setIsInlinePreviewRendering(true);
      setInlinePreviewRenderError("");
      bodyContainer.innerHTML = "";
      styleContainer.innerHTML = "";

      try {
        await syncDraft();
        const blob = await generateDocumentPreviewBlob(preparedDraft.draftId);

        if (isCancelled) {
          return;
        }

        await renderAsync(blob, bodyContainer, styleContainer, {
          className: "docx-preview",
          inWrapper: true,
          breakPages: true,
          useBase64URL: true,
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        if (
          error instanceof Error &&
          error.message === "template_file_missing"
        ) {
          setInlinePreviewRenderError(
            "Word veidlapas fails nav pieejams. Pievienojiet oficiālo .docx template failu mapē public/templates.",
          );
        } else {
          setInlinePreviewRenderError(
            "Neizdevās ielādēt Word dokumenta priekšskatījumu.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsInlinePreviewRendering(false);
        }
      }
    }, 200);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
      bodyContainer.innerHTML = "";
      styleContainer.innerHTML = "";
    };
  }, [fieldStateMap, isPreparing, preparedDraft?.draftId]);

  React.useEffect(() => {
    if (!isPreviewOpen || !preparedDraft) {
      return;
    }

    const bodyContainer = fullscreenPreviewBodyRef.current;
    const styleContainer = fullscreenPreviewStylesRef.current;

    if (!bodyContainer || !styleContainer) {
      return;
    }

    let isCancelled = false;

    const renderPreview = async () => {
      setIsPreviewRendering(true);
      setPreviewRenderError("");
      bodyContainer.innerHTML = "";
      styleContainer.innerHTML = "";

      try {
        await syncDraft();
        const blob = await generateDocumentPreviewBlob(preparedDraft.draftId);

        if (isCancelled) {
          return;
        }

        await renderAsync(blob, bodyContainer, styleContainer, {
          className: "docx-preview",
          inWrapper: true,
          breakPages: true,
          useBase64URL: true,
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        if (
          error instanceof Error &&
          error.message === "template_file_missing"
        ) {
          setPreviewRenderError(
            "Word veidlapas fails nav pieejams. Pievienojiet oficiālo .docx template failu mapē public/templates.",
          );
        } else {
          setPreviewRenderError(
            "Neizdevās atvērt Word dokumenta priekšskatījumu.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsPreviewRendering(false);
        }
      }
    };

    renderPreview();

    return () => {
      isCancelled = true;
      bodyContainer.innerHTML = "";
      styleContainer.innerHTML = "";
    };
  }, [isPreviewOpen, preparedDraft?.draftId]);

  const handleSaveDraft = async () => {
    if (!preparedDraft) {
      return;
    }

    try {
      await syncDraft();
      setPageMessage("Saglabāts kā melnraksts.");
      setPageError("");
    } catch {
      setPageError("Neizdevās saglabāt melnrakstu.");
    }
  };

  const handlePreview = async () => {
    try {
      await syncDraft();
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setPageMessage("Priekšskatījums atjaunots.");
      setPageError("");
    } catch {
      setPageError("Neizdevās atjaunot priekšskatījumu.");
    }
  };

  const handleGenerateWord = async () => {
    if (!preparedDraft) {
      return;
    }

    setIsGenerating(true);
    setPageError("");
    setPageMessage("");

    try {
      await syncDraft();
      const validation = validateDraftBeforeGeneration(preparedDraft.draftId);

      if (!validation.ok) {
        setPageError(validation.message);
        setIsGenerating(false);
        return;
      }

      const result = await generateDocumentDraft(preparedDraft.draftId);
      downloadGeneratedFile(result.fileId);
      setPageMessage("Gatavs lejupielādei.");
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        (error as { message: string }).message ===
          "Lai sagatavotu dokumentu, aizpildiet visus obligātos laukus."
      ) {
        setPageError((error as { message: string }).message);
      } else if (
        error instanceof Error &&
        error.message === "template_file_missing"
      ) {
        setPageError(
          "Word veidlapas fails nav pieejams. Pievienojiet oficiālo .docx template failu mapē public/templates.",
        );
      } else {
        setPageError("Neizdevās sagatavot Word dokumentu.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTemplateLabel =
    templates.find((template) => template.id === selectedTemplateId)?.title ?? "";

  return (
    <div className="min-h-screen bg-[hsl(210,32%,96%)]">
      <DashboardSidebar
        activePatient={activePatient}
        recentPatients={recentPatients}
        allPatients={patients}
        currentView="documents"
        dayListCount={patients.length}
        layoutOrder={layoutOrder}
        specialtyId={specialtyId}
        onSaveLayoutOrder={setLayoutOrder}
      />

      <main className="px-4 pb-6 pt-16 sm:px-5 lg:py-6 lg:pl-[calc(var(--dashboard-sidebar-width,280px)+24px)] lg:pr-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <>
            <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="max-w-[700px] text-2xl font-semibold leading-tight tracking-[-0.05em] text-[hsl(217,40%,18%)] xl:text-3xl">
                  Dokumentu sagataves
                </h1>
                <p className="mt-2 text-sm leading-6 text-[hsl(214,18%,44%)]">
                  Automātiski sagatavoti dokumentu melnraksti, izmantojot
                  pacienta datus.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleStartNewDraft}
                className="h-11 rounded-md bg-[hsl(220,36%,18%)] px-5 text-sm font-semibold text-white hover:bg-[hsl(220,36%,22%)]"
              >
                <FolderPlus className="h-4 w-4" />
                Jauna sagatave
              </Button>
            </section>

            <section className={cn(surfaceClassName, "mt-6 overflow-hidden")}>
              <div className="px-5 py-5 sm:px-6 sm:py-5">
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <div>
                  <label className="text-xs font-semibold text-[hsl(217,28%,24%)]">
                    Pacients
                  </label>
                  <div className="relative mt-2">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(214,16%,58%)]" />
                    <Input
                      ref={patientInputRef}
                      value={searchQuery}
                      onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setShowPatientSearch(true);
                      }}
                      onFocus={() => setShowPatientSearch(true)}
                      onBlur={() => window.setTimeout(() => setShowPatientSearch(false), 120)}
                      placeholder="Meklēt pacientu pēc vārda, uzvārda vai personas koda"
                      className={cn(
                        "h-14 rounded-[10px] border-[rgba(210,221,230,0.96)] bg-white pl-11 pr-11 text-sm shadow-[inset_0_1px_2px_rgba(15,23,42,0.02)]",
                        fieldFocusClassName,
                      )}
                    />

                    {(searchQuery || selectedPatientId) && (
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={handleClearPatientSelection}
                        className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[6px] text-[hsl(214,18%,52%)] transition hover:bg-[hsl(210,30%,96%)] hover:text-[hsl(217,38%,22%)]"
                        aria-label="Notīrīt pacienta izvēli"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}

                    {showPatientSearch && searchResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-40 max-h-[320px] overflow-y-auto rounded-[10px] border border-[rgba(214,223,231,0.98)] bg-white shadow-[0_12px_24px_rgba(30,64,91,0.08)]">
                        {searchResults.map((patient, index) => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => {
                              setSelectedPatientId(patient.id);
                              setSearchQuery(patient.fullName);
                              setShowPatientSearch(false);
                              setPreparedDraft(null);
                            }}
                            className={cn(
                              "flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-[hsl(210,46%,98%)]",
                              index > 0 && "border-t border-[rgba(235,240,244,0.98)]",
                            )}
                          >
                            <div>
                              <p className="text-sm font-semibold text-[hsl(217,36%,20%)]">
                                {patient.fullName}
                              </p>
                              <p className="mt-1 text-xs text-[hsl(214,16%,52%)]">
                                {patient.personalCode} · {patient.age} gadi
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-[hsl(214,16%,58%)]" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[hsl(217,28%,24%)]">
                    Dokumenta veids
                  </label>
                  <Select
                    value={selectedTemplateId}
                    onValueChange={(value) => {
                      setSelectedTemplateId(value);
                      setPreparedDraft(null);
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        "mt-2 h-14 rounded-[10px] border-[rgba(210,221,230,0.96)] bg-white px-4 text-sm shadow-[inset_0_1px_2px_rgba(15,23,42,0.02)]",
                        fieldFocusClassName,
                      )}
                    >
                      <SelectValue placeholder="Izvēlieties dokumenta veidu" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem
                          key={template.id}
                          value={template.id}
                          className={selectItemClassName}
                        >
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end xl:pb-1.5">
                  <Button
                    type="button"
                    disabled={!selectedPatientId || !selectedTemplateId || isPreparing}
                    onClick={handlePrepareDocument}
                    className="h-11 rounded-md bg-[hsl(220,36%,18%)] px-6 text-sm font-semibold text-white hover:bg-[hsl(220,36%,22%)]"
                  >
                    {isPreparing ? "Notiek sagatavošana..." : "Sagatavot dokumentu"}
                  </Button>
                  </div>
              </div>
              </div>

            {patientDocumentData && (
              <section className="border-t border-[rgba(223,230,237,0.96)]">
                <div className="px-4 py-4 sm:px-5 sm:py-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(214,38%,96%)] text-[hsl(216,54%,40%)]">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl font-semibold tracking-[-0.03em] text-[hsl(217,40%,18%)]">
                        {patientDocumentData.patient.fullName}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[hsl(214,16%,44%)]">
                        Atlasītais dokumenta veids:
                        {" "}
                        <span className="font-semibold text-[hsl(217,30%,22%)]">
                          {selectedTemplateLabel}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid overflow-hidden rounded-[10px] border border-[rgba(223,230,237,0.96)] bg-white sm:grid-cols-2 xl:grid-cols-6">
                    {[
                      ["Personas kods", patientDocumentData.patient.personalCode],
                      ["Vecums", `${patientDocumentData.patient.age} gadi`],
                      ["Dzimums", genderLabel(patientDocumentData.patient.gender)],
                      ["Ārstējošais ārsts", patientDocumentData.doctor.name],
                      [
                        "Aktīvās diagnozes",
                        patientDocumentData.clinicalData.activeDiagnoses
                          .map((item) => item.code)
                          .join("; "),
                      ],
                      [
                        "Kontakti",
                        [patientDocumentData.patient.phone, patientDocumentData.patient.email]
                          .filter(Boolean)
                          .join(" ") || "Nav norādīts",
                      ],
                    ].map(([label, value], index) => (
                      <div
                        key={label}
                        className={cn(
                          "min-w-0 border-[rgba(223,230,237,0.96)] px-3 py-2.5",
                          index < 5 && "border-b",
                          index % 2 === 0 && "sm:border-r",
                          index > 3 && "sm:border-b-0",
                          index > 0 && "xl:border-l",
                          "xl:border-y-0 xl:border-r-0",
                        )}
                      >
                        <p className="text-xs font-semibold text-[hsl(214,14%,54%)]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm font-normal leading-6 text-[hsl(217,30%,22%)]">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {(isPreparing || preparedDraft) && (
              <section className="border-t border-[rgba(223,230,237,0.96)]">
                <div className="grid min-h-[calc(100vh-400px)] xl:grid-cols-2 xl:gap-0 xl:min-h-[600px]">
                  <section className="flex min-w-0 flex-col overflow-hidden">
                    <div className="border-b border-[rgba(223,230,237,0.96)] px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[hsl(214,24%,46%)]">
                        <ClipboardCheck className="h-4 w-4" />
                        Sagatavošanas skats
                      </div>
                    </div>

                    <div className="flex-1 overflow-auto px-3 py-4 sm:px-4 sm:py-4">
                      <div className="space-y-3">
                        {!isPreparing && preparedDraft ? (
                          (
                            [
                              {
                                key: "auto",
                                title: "Automātiski aizpildītie dati",
                                fields: groupedFields.auto,
                              },
                              {
                                key: "review",
                                title: "Nepieciešams ārsta apstiprinājums",
                                fields: [
                                  ...groupedFields.needs_confirmation,
                                  ...groupedFields.doctor_required,
                                ],
                              },
                              {
                                key: "missing",
                                title: "Trūkstošie dati",
                                fields: groupedFields.missing,
                              },
                            ] as const
                          ).map(({ key, title, fields }, sectionIndex) => {
                            if (fields.length === 0) {
                              return null;
                            }

                            const isAutoSection = key === "auto";

                            return (
                              <section
                                key={key}
                                className={cn(
                                  key === "review"
                                    ? reviewAlertClassName
                                    : sectionIndex > 0 &&
                                        "border-t border-[rgba(223,230,237,0.96)] pt-3",
                                )}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <h3 className="text-sm font-semibold text-[hsl(217,34%,20%)]">
                                    {title}
                                  </h3>
                                  <span className="text-xs font-normal text-[hsl(214,14%,54%)]">
                                    {fields.length} lauki
                                  </span>
                                </div>

                                <div
                                  className={cn(
                                    "mt-2",
                                    isAutoSection
                                      ? "grid gap-2 md:grid-cols-2"
                                      : "space-y-2",
                                  )}
                                >
                                  {fields.map((field) => {
                                    const current = fieldStateMap[field.key] ?? {
                                      value: field.value,
                                    };

                                    return (
                                      <div
                                        key={field.key}
                                        className={cn(
                                          "rounded-[8px] border border-[rgba(216,225,233,0.96)] bg-white",
                                          isAutoSection ? "p-3" : "p-3 md:p-4",
                                        )}
                                      >
                                        <div className="flex items-start justify-between gap-2.5">
                                          <div className="min-w-0">
                                            <p
                                              className={cn(
                                                "font-semibold text-[hsl(217,34%,20%)]",
                                                isAutoSection ? "text-xs leading-5" : "text-sm",
                                              )}
                                            >
                                              {field.label}
                                            </p>
                                          </div>

                                          {isAutoSection ? (
                                            <span
                                              className={cn(
                                                "inline-flex w-fit shrink-0 flex-col rounded-full border px-2 py-1 text-center text-xs font-semibold leading-3",
                                                statusClassName(field.status),
                                              )}
                                            >
                                              {field.status === "auto" ? (
                                                <>
                                                  <span>Aizpildīts</span>
                                                  <span>automātiski</span>
                                                </>
                                              ) : (
                                                statusLabel(field.status)
                                              )}
                                            </span>
                                          ) : field.status === "missing" ? (
                                            <span
                                              className={cn(
                                                "inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold",
                                                statusClassName(field.status),
                                              )}
                                            >
                                              {statusLabel(field.status)}
                                            </span>
                                          ) : null}
                                        </div>

                                        {isAutoSection ? (
                                          <p className="mt-2 text-sm font-normal leading-6 text-[hsl(217,30%,22%)]">
                                            {current.value || "[nav aizpildīts]"}
                                          </p>
                                        ) : (
                                          <div className="mt-2 rounded-[8px] border border-[rgba(214,224,232,0.96)] bg-[hsl(210,40%,99%)] p-2.5">
                                            <div>
                                              {renderFieldInput(field, current.value, (nextValue) =>
                                                handleDraftFieldChange(field.key, nextValue)
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </section>
                            );
                          })
                        ) : (
                          <>
                            <section>
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="text-sm font-semibold text-[hsl(217,34%,20%)]">
                                  Automātiski aizpildītie dati
                                </h3>
                                <span className="text-xs font-normal text-[hsl(214,14%,54%)]">
                                  Notiek ģenerēšana
                                </span>
                              </div>
                              <div className="mt-2 grid gap-2 md:grid-cols-2">
                                {Array.from({ length: 6 }).map((_, index) => (
                                  <div
                                    key={`auto-placeholder-${index}`}
                                    className="rounded-[8px] border border-[rgba(216,225,233,0.96)] bg-white p-3"
                                  >
                                    <div className="h-3.5 w-28 rounded-full bg-[hsl(210,30%,94%)]" />
                                    <div className="mt-2 inline-flex h-7 w-24 rounded-full bg-[hsl(151,40%,96%)]" />
                                    <div className="mt-2 h-4 w-4/5 rounded-full bg-[hsl(210,30%,94%)]" />
                                    <div className="mt-2 h-4 w-3/5 rounded-full bg-[hsl(210,30%,96%)]" />
                                  </div>
                                ))}
                              </div>
                            </section>

                            <section className={reviewAlertClassName}>
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="text-sm font-semibold text-[hsl(217,34%,20%)]">
                                  Nepieciešams ārsta apstiprinājums
                                </h3>
                                <span className="text-xs font-normal text-[hsl(214,14%,54%)]">
                                  Tiek sagatavots saturs
                                </span>
                              </div>
                              <div className="mt-2 space-y-2">
                                {Array.from({ length: 3 }).map((_, index) => (
                                  <div
                                    key={`review-placeholder-${index}`}
                                    className="rounded-[8px] border border-[rgba(216,225,233,0.96)] bg-white p-3 md:p-4"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <div className="h-3.5 w-40 rounded-full bg-[hsl(210,30%,94%)]" />
                                      </div>
                                      <div className="h-6 w-40 rounded-full bg-[hsl(42,72%,96%)]" />
                                    </div>
                                    <div className="mt-2 rounded-[8px] border border-[rgba(214,224,232,0.96)] bg-[hsl(210,40%,99%)] p-2.5">
                                      <div className="h-3 w-44 rounded-full bg-[hsl(210,30%,94%)]" />
                                      <div className="mt-2 h-20 rounded-[8px] bg-white" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>
                          </>
                        )}
                      </div>
                    </div>

                    {!isPreparing && preparedDraft && (
                      <div className="border-t border-[rgba(223,230,237,0.96)] px-3 py-4 sm:px-4 sm:py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            onClick={handleSaveDraft}
                            className="rounded-[8px] bg-[hsl(217,38%,22%)] text-white hover:bg-[hsl(217,38%,18%)]"
                          >
                            Saglabāt melnrakstu
                          </Button>
                          <Button
                            type="button"
                            disabled={isGenerating || requiredIssues.length > 0}
                            onClick={handleGenerateWord}
                            className="rounded-[8px] bg-[hsl(217,38%,22%)] text-white hover:bg-[hsl(217,38%,18%)]"
                          >
                            <Download className="h-4 w-4" />
                            {isGenerating
                              ? "Notiek ģenerēšana..."
                              : "Lejupielādēt Word dokumentu"}
                          </Button>
                        </div>
                        {requiredIssues.length > 0 && (
                          <p className="mt-3 text-sm leading-5 text-[hsl(0,42%,44%)]">
                            Lai sagatavotu dokumentu, aizpildiet visus obligātos laukus.
                          </p>
                        )}
                        {(pageMessage || pageError) && (
                          <div
                            className={cn(
                              "mt-4 rounded-[8px] px-4 py-3 text-sm leading-5",
                              pageError
                                ? "border border-[hsl(0,42%,88%)] bg-[hsl(0,55%,97%)] text-[hsl(0,42%,44%)]"
                                : "border border-[hsl(154,34%,84%)] bg-[hsl(151,40%,96%)] text-[hsl(154,44%,30%)]",
                            )}
                          >
                            {pageError || pageMessage}
                          </div>
                        )}
                      </div>
                    )}
                  </section>

                  <section
                    ref={previewRef}
                    className="flex flex-col overflow-hidden border-t border-[rgba(223,230,237,0.96)] xl:border-l xl:border-t-0 xl:border-[rgba(223,230,237,0.96)]"
                  >
                  <div className="flex items-center justify-between gap-3 border-b border-[rgba(223,230,237,0.96)] px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[hsl(214,24%,46%)]">
                      <Eye className="h-4 w-4" />
                      Dokumenta priekšskatījums
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={isPreparing || !preparedDraft}
                      onClick={() => setIsPreviewOpen(true)}
                      className="h-10 gap-1 rounded-[8px] border-0 bg-transparent px-2.5 text-xs text-[hsl(214,30%,26%)] hover:bg-[hsl(210,40%,98%)]"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      Pilnekrāns
                    </Button>
                  </div>

                  <div className="flex-1 overflow-hidden py-4">
                    <div ref={inlinePreviewStylesRef} className="hidden" />

                    {(isPreparing || isInlinePreviewRendering) && (
                      <div className="flex h-full items-center justify-center rounded-[10px] border border-[rgba(223,230,237,0.96)] bg-[hsl(214,34%,97%)]">
                        <div className="flex flex-col items-center text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-[hsl(216,54%,34%)]" />
                          <p className="mt-4 text-sm font-semibold text-[hsl(217,30%,22%)]">
                            Tiek ielādēts Word dokumenta priekšskatījums
                          </p>
                        </div>
                      </div>
                    )}

                    {inlinePreviewRenderError && (
                      <div className="rounded-[10px] border border-[hsl(0,42%,88%)] bg-[hsl(0,55%,97%)] px-4 py-3 text-sm leading-5 text-[hsl(0,42%,44%)]">
                        {inlinePreviewRenderError}
                      </div>
                    )}

                    {!isPreparing && preparedDraft && (
                      <div
                        className="h-full cursor-zoom-in overflow-auto rounded-[10px] border border-[rgba(223,230,237,0.96)] bg-[hsl(0,0%,58%)] px-3 py-4"
                        onClick={() => setIsPreviewOpen(true)}
                      >
                        <div
                          ref={inlinePreviewBodyRef}
                          style={{ zoom: 0.66 }}
                          className={cn(
                            "overflow-auto [&_.docx-wrapper]:mx-auto [&_.docx-wrapper]:w-fit [&_.docx-wrapper]:max-w-none [&_.docx-wrapper]:overflow-visible [&_.docx-wrapper]:bg-transparent [&_.docx-wrapper]:p-0 [&_.docx]:mx-auto [&_.docx]:my-0 [&_.docx]:max-w-none [&_.docx]:shadow-[0_10px_28px_rgba(15,23,42,0.18)] [&_.docx]:border [&_.docx]:border-[rgba(15,23,42,0.08)] [&_.docx-page]:shadow-[0_10px_28px_rgba(15,23,42,0.16)] [&_.docx-page]:mb-8 [&_.docx-page]:bg-white",
                            (isInlinePreviewRendering || inlinePreviewRenderError) && "hidden",
                          )}
                        />
                      </div>
                    )}
                  </div>
                  </section>
                </div>
              </section>
            )}
            </section>
          </>
        </div>
      </main>

      {isPreparing && patientDocumentData && (
        <CenteredOverlay
          onClose={() => {}}
          overlayClassName="bg-[rgba(241,245,249,0.76)] backdrop-blur-[10px]"
          contentClassName="max-w-2xl"
        >
          <PrepareProgressPanel
            patientName={searchQuery || patientDocumentData.patient.fullName}
            templateLabel={selectedTemplateLabel}
            prepareStepIndex={prepareStepIndex}
          />
        </CenteredOverlay>
      )}

      {isPreviewOpen && preparedDraft && (
        <CenteredOverlay
          onClose={() => setIsPreviewOpen(false)}
          overlayClassName="bg-[rgba(241,245,249,0.82)] backdrop-blur-[10px]"
          contentClassName="max-w-6xl"
        >
          <div className="relative mx-auto w-full overflow-hidden rounded-[10px] border border-[rgba(214,223,231,0.98)] bg-[hsl(210,40%,99%)] shadow-[0_24px_60px_rgba(30,64,91,0.14)]">
            <div className="flex items-center justify-between border-b border-[rgba(223,230,237,0.96)] px-6 py-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[hsl(214,24%,46%)]">
                  Pilnekrāna priekšskatījums
                </p>
                <h3 className="mt-1 whitespace-normal break-words text-xl font-semibold tracking-[-0.03em] text-[hsl(217,40%,18%)]">
                  {selectedTemplateLabel || "Dokumenta melnraksts"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[rgba(208,220,229,0.96)] bg-white text-[hsl(214,30%,26%)] transition hover:bg-[hsl(210,40%,98%)]"
                aria-label="Aizvērt priekšskatījumu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[84vh] overflow-y-auto bg-[hsl(214,34%,97%)] px-5 py-5 md:px-8 md:py-8">
              <div ref={fullscreenPreviewStylesRef} className="hidden" />

              {isPreviewRendering && (
                <div className="flex min-h-[420px] items-center justify-center rounded-[10px] border border-[rgba(214,223,231,0.98)] bg-white">
                  <div className="flex flex-col items-center text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[hsl(216,54%,34%)]" />
                    <p className="mt-4 text-sm font-semibold text-[hsl(217,30%,22%)]">
                      Tiek ielādēts Word dokumenta priekšskatījums
                    </p>
                  </div>
                </div>
              )}

              {previewRenderError && (
                <div className="rounded-[10px] border border-[hsl(0,42%,88%)] bg-[hsl(0,55%,97%)] px-4 py-3 text-sm leading-5 text-[hsl(0,42%,44%)]">
                  {previewRenderError}
                </div>
              )}

              <div
                ref={fullscreenPreviewBodyRef}
                className={cn(
                  "[&_.docx-wrapper]:bg-transparent [&_.docx-wrapper]:p-0 [&_.docx]:mx-auto [&_.docx]:shadow-[0_14px_36px_rgba(15,23,42,0.08)]",
                  (isPreviewRendering || previewRenderError) && "hidden",
                )}
              />
            </div>
          </div>
        </CenteredOverlay>
      )}
    </div>
  );
}

