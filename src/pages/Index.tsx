import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import AlertsCard from "@/components/AlertsCard";
import DashboardSidebar from "@/components/DashboardSidebar";
import EventTimelineHorizontal from "@/components/EventTimelineHorizontal";
import HealthTrends from "@/components/HealthTrends";
import HumanBodyModel from "@/components/HumanBodyModel";
import MedicalImagingViewer, {
  formatLatvianDate,
  imagingStudies,
} from "@/components/MedicalImagingViewer";
import MedicationTable from "@/components/MedicationTable";
import PatientCard from "@/components/PatientCard";
import PreventionCard from "@/components/PreventionCard";
import ReferralHistory from "@/components/ReferralHistory";
import { CenteredOverlay } from "@/components/ui/centered-overlay";
import { patients } from "@/data/patients";
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
import {
  dashboardSourceDocumentMap,
  sourceDocumentIds,
} from "@/lib/source-documents";
import { Patient } from "@/types/patient";

type DashboardLocationState = {
  patient?: Patient;
  layoutOrder?: DashboardComponentKey[];
  specialtyId?: SpecialtyId;
};

const dashboardCardHeight = "min-h-[420px]";
const HEADER_COMPACT_ENTER_SCROLL_Y = 96;
const HEADER_COMPACT_EXIT_SCROLL_Y = 24;

const layoutBaseClasses: Record<DashboardComponentKey, string> = {
  patientCard: "lg:col-span-3",
  preventionCard: dashboardCardHeight,
  healthTrends: `lg:col-span-2 ${dashboardCardHeight}`,
  medicalImagingViewer: dashboardCardHeight,
  medicationTable: `lg:col-span-2 ${dashboardCardHeight}`,
  alertsCard: dashboardCardHeight,
  eventTimeline: `lg:col-span-2 ${dashboardCardHeight}`,
  humanBodyModel: dashboardCardHeight,
  referralHistory: dashboardCardHeight,
};

const layoutColumnSpans: Record<DashboardComponentKey, number> = {
  patientCard: 3,
  preventionCard: 1,
  healthTrends: 2,
  medicalImagingViewer: 1,
  medicationTable: 2,
  alertsCard: 1,
  eventTimeline: 2,
  humanBodyModel: 1,
  referralHistory: 1,
};

function compactDashboardGridOrder(
  visibleKeys: readonly DashboardComponentKey[],
): DashboardComponentKey[] {
  const orderedKeys = [...visibleKeys];
  let currentColumn = 0;

  for (let index = 0; index < orderedKeys.length; index += 1) {
    const span = layoutColumnSpans[orderedKeys[index]];
    const remainingColumns = 3 - currentColumn;

    if (currentColumn !== 0 && span > remainingColumns) {
      let candidateIndex = -1;

      for (let searchIndex = index + 1; searchIndex < orderedKeys.length; searchIndex += 1) {
        const candidateSpan = layoutColumnSpans[orderedKeys[searchIndex]];

        if (candidateSpan > remainingColumns) {
          continue;
        }

        if (candidateSpan === remainingColumns) {
          candidateIndex = searchIndex;
          break;
        }

        if (candidateIndex === -1) {
          candidateIndex = searchIndex;
        }
      }

      if (candidateIndex !== -1) {
        const [candidateKey] = orderedKeys.splice(candidateIndex, 1);
        orderedKeys.splice(index, 0, candidateKey);
      }
    }

    const resolvedSpan = layoutColumnSpans[orderedKeys[index]];

    if (currentColumn + resolvedSpan > 3) {
      currentColumn = 0;
    }

    currentColumn += resolvedSpan;

    if (currentColumn >= 3) {
      currentColumn = 0;
    }
  }

  return orderedKeys;
}

function getExpandedLayoutClasses(
  visibleKeys: readonly DashboardComponentKey[],
): Record<DashboardComponentKey, string> {
  const rowItems = new Map<number, DashboardComponentKey[]>();
  const rowStartColumn = new Map<DashboardComponentKey, number>();
  let currentRow = 0;
  let currentColumn = 0;

  for (const key of visibleKeys) {
    const span = layoutColumnSpans[key];

    if (currentColumn + span > 3) {
      currentRow += 1;
      currentColumn = 0;
    }

    rowStartColumn.set(key, currentColumn);

    const items = rowItems.get(currentRow) ?? [];
    items.push(key);
    rowItems.set(currentRow, items);

    currentColumn += span;

    if (currentColumn >= 3) {
      currentRow += 1;
      currentColumn = 0;
    }
  }

  const nextClasses = { ...layoutBaseClasses };

  for (const [, keys] of rowItems) {
    if (keys.length !== 1 || keys[0] !== "eventTimeline") continue;
    if (rowStartColumn.get("eventTimeline") !== 0) continue;

    nextClasses.eventTimeline = `lg:col-span-3 ${dashboardCardHeight}`;
  }

  return nextClasses;
}

function formatRefreshTime(date: Date) {
  return new Intl.DateTimeFormat("lv-LV", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRefreshDate(date: Date) {
  return `${new Intl.DateTimeFormat("lv-LV", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)}.`;
}

function formatRefreshTimestamp(date: Date) {
  return `${formatRefreshDate(date)} ${formatRefreshTime(date)}`;
}

const InfoDivider = () => (
  <span className="mx-2.5 text-[hsl(220,16%,80%)] md:mx-3">|</span>
);

type AssistantMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  sections?: { title: string; lines: string[] }[];
  sourceLabel?: string;
  sourceHref?: string;
  sourceTargetKey?: DashboardComponentKey;
  suggestions?: string[];
  timeLabel: string;
};

const assistantQuickQuestions = [
  "Kādas ir hroniskās slimības?",
  "Kādi ir riska faktori?",
  "Kādas ir aktuālās novirzes?",
];

function getAssistantTimeLabel() {
  return new Intl.DateTimeFormat("lv-LV", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function createWelcomeAssistantMessage(patient: Patient): AssistantMessage {
  return {
    id: "assistant-welcome",
    role: "assistant",
    text: `Varu palīdzēt ātri atrast būtiskāko par ${patient.name}. Uzdodiet jautājumu par diagnozēm, riska faktoriem vai aktuālajām novirzēm.`,
    suggestions: assistantQuickQuestions,
    timeLabel: getAssistantTimeLabel(),
  };
}

function createAssistantSourceReference(
  documentId: (typeof sourceDocumentIds)[keyof typeof sourceDocumentIds],
  targetKey: DashboardComponentKey,
) {
  const sourceDocument = dashboardSourceDocumentMap[documentId];

  return {
    sourceLabel: sourceDocument.linkLabel,
    sourceHref: sourceDocument.url,
    sourceTargetKey: targetKey,
  };
}

function buildAssistantReply(patient: Patient, query: string): AssistantMessage {
  const normalizedQuery = query.toLowerCase();
  const timeLabel = getAssistantTimeLabel();
  const ctStudies = imagingStudies.filter((study) => study.type === "CT");
  const asksAboutCt =
    /(^|[^a-z])ct([^a-z]|$)/i.test(query) ||
    normalizedQuery.includes("datortomogr") ||
    normalizedQuery.includes("tomogr");

  if (asksAboutCt) {
    if (ctStudies.length === 0) {
      return {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: "Šajā kartē CT izmeklējums nav redzams.",
        ...createAssistantSourceReference(
          sourceDocumentIds.ctKnee,
          "medicalImagingViewer",
        ),
        timeLabel,
      };
    }

    return {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      text:
        ctStudies.length === 1
          ? "Jā, šim pacientam kartē ir dokumentēts 1 CT izmeklējums."
          : `Jā, šim pacientam kartē ir dokumentēti ${ctStudies.length} CT izmeklējumi.`,
      sections: [
        {
          title: "CT izmeklējumi",
          lines: ctStudies.map(
            (study) =>
              `${formatLatvianDate(study.date)} · ${study.title} · ${study.status}`,
          ),
        },
      ],
      ...createAssistantSourceReference(
        sourceDocumentIds.ctKnee,
        "medicalImagingViewer",
      ),
      timeLabel,
    };
  }

  if (normalizedQuery.includes("hron")) {
    return {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      text: "Pacientam dokumentētas šādas hroniskās slimības:",
      sections: [
        {
          title: "Hroniskās slimības",
          lines: patient.chronicDiseases.map(
            (item) =>
              `${item.description}${item.diagnosedAt ? ` · kopš ${item.diagnosedAt}` : ""}`,
          ),
        },
      ],
      ...createAssistantSourceReference(
        sourceDocumentIds.ambulatoryVisit,
        "patientCard",
      ),
      timeLabel,
    };
  }

  if (normalizedQuery.includes("riska")) {
    return {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      text: "Pacientam šobrīd redzami šādi riska faktori:",
      sections: [
        {
          title: "Riska faktori",
          lines: patient.riskFactors,
        },
      ],
      ...createAssistantSourceReference(
        sourceDocumentIds.ambulatoryVisit,
        "patientCard",
      ),
      timeLabel,
    };
  }

  if (
    normalizedQuery.includes("novirz") ||
    normalizedQuery.includes("anal") ||
    normalizedQuery.includes("rādīt")
  ) {
    return {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      text: "Aktuālās dokumentētās novirzes šajā kartē ir šādas:",
      sections: [
        {
          title: "Novirzes",
          lines: patient.deviations,
        },
      ],
      ...createAssistantSourceReference(
        sourceDocumentIds.laboratoryBloodPanel,
        "patientCard",
      ),
      timeLabel,
    };
  }

  if (normalizedQuery.includes("diagno")) {
    return {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      text: "Šeit ir galvenās pacienta diagnozes:",
      sections: [
        {
          title: "Diagnozes",
          lines: patient.diagnoses.map(
            (item) =>
              `${item.code} · ${item.description}${item.diagnosedAt ? ` · ${item.diagnosedAt}` : ""}`,
          ),
        },
      ],
      ...createAssistantSourceReference(
        sourceDocumentIds.dischargeSummary,
        "patientCard",
      ),
      timeLabel,
    };
  }

  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    text: patient.summary,
    ...createAssistantSourceReference(
      sourceDocumentIds.ambulatoryVisit,
      "patientCard",
    ),
    suggestions: assistantQuickQuestions,
    timeLabel,
  };
}

function DashboardAssistant({ patient }: { patient: Patient }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [isResponding, setIsResponding] = React.useState(false);
  const [messages, setMessages] = React.useState<AssistantMessage[]>(() => [
    createWelcomeAssistantMessage(patient),
  ]);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const responseTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (responseTimeoutRef.current !== null) {
      window.clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }

    setMessages([createWelcomeAssistantMessage(patient)]);
    setDraft("");
    setIsResponding(false);
    setIsOpen(false);
  }, [patient]);

  React.useEffect(() => {
    return () => {
      if (responseTimeoutRef.current !== null) {
        window.clearTimeout(responseTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  React.useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.scrollTop = element.scrollHeight;
  }, [messages, isOpen, isResponding]);

  const sendMessage = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue || isResponding) return;

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmedValue,
        timeLabel: getAssistantTimeLabel(),
      },
    ]);
    setDraft("");
    setIsResponding(true);

    responseTimeoutRef.current = window.setTimeout(() => {
      setMessages((current) => [...current, buildAssistantReply(patient, trimmedValue)]);
      setIsResponding(false);
      responseTimeoutRef.current = null;

      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }, 700);
  };

  const openSource = (targetKey: DashboardComponentKey | undefined) => {
    if (!targetKey) return;

    document
      .getElementById(`dashboard-card-${targetKey}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-5 right-4 z-[95] inline-flex items-center gap-2.5 rounded-full border px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.24)] transition hover:-translate-y-0.5 md:bottom-6 md:right-6 lg:bottom-7 lg:right-8 ${
          isOpen
            ? "border-[rgba(40,69,123,0.98)] bg-[#17386b]"
            : "border-[rgba(24,45,86,0.98)] bg-[#102445]"
        }`}
        aria-label="Atvērt pacienta datu palīgu"
      >
        <span className="flex h-5 w-5 items-center justify-center">
          <Search className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="hidden sm:inline">Pacienta datu palīgs</span>
      </button>

      {isOpen ? (
        <CenteredOverlay
          onClose={() => setIsOpen(false)}
          className="items-end justify-end p-3 pb-[90px] md:p-6 md:pb-[98px] lg:pr-8 lg:pb-[104px]"
          overlayClassName="bg-[rgba(23,35,58,0.30)] backdrop-blur-[4px]"
          contentClassName="w-[min(400px,calc(100vw-24px))]"
        >
          <div className="relative">
            <section className="flex max-h-[min(640px,calc(100vh-170px))] flex-col overflow-hidden rounded-[14px] border border-[rgba(220,228,236,0.96)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
              <header className="flex items-center justify-between gap-3 border-b border-[rgba(226,232,240,0.92)] px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-[hsl(222,28%,18%)]">
                      Pacienta datu palīgs
                    </p>
                    <span className="inline-flex items-center rounded-full bg-[hsl(219,70%,96%)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(221,44%,48%)]">
                      Beta
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[hsl(221,18%,44%)] transition hover:bg-[hsl(210,32%,96%)]"
                  aria-label="Aizvērt palīgu"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </header>

              <div
                ref={scrollRef}
                className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f8fbff_0%,#f3f7fd_100%)] px-3 py-3"
              >
                <div className="space-y-2.5">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                    >
                    {message.role === "assistant" ? (
                        <div className="flex max-w-[90%] items-start gap-2">
                          <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[hsl(219,50%,52%)] shadow-[0_8px_18px_rgba(86,107,166,0.14)]">
                            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                          </div>

                          <div className="min-w-0">
                            <div className="rounded-[16px] rounded-tl-[6px] border border-[rgba(215,224,237,0.96)] bg-white px-3.5 py-3 shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
                              <p className="text-[11px] leading-5 text-[hsl(222,20%,26%)]">{message.text}</p>

                              {message.sections?.length ? (
                                <div className="mt-3 space-y-2.5">
                                  {message.sections.map((section) => (
                                    <div
                                      key={section.title}
                                      className="rounded-[14px] border border-[rgba(223,229,239,0.96)] bg-[hsl(210,40%,99%)] px-3 py-2.5"
                                    >
                                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[hsl(217,26%,44%)]">
                                        {section.title}
                                      </p>
                                      <div className="mt-2 space-y-1.5">
                                        {section.lines.map((line) => (
                                          <div key={line} className="flex items-start gap-2 text-[11px] text-[hsl(222,20%,26%)]">
                                            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(218,44%,55%)]" />
                                            <span>{line}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : null}

                              <div className="mt-3 flex items-center gap-2 text-[10px] text-[hsl(217,15%,56%)]">
                                {message.sourceLabel && message.sourceHref ? (
                                  <a
                                    href={message.sourceHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 font-medium text-[hsl(220,42%,44%)] transition hover:text-[hsl(220,52%,34%)]"
                                  >
                                    Atsauce: {message.sourceLabel}
                                    <span aria-hidden="true">↗</span>
                                  </a>
                                ) : (
                                  <span>Atsauce: pacienta karte</span>
                                )}
                                {message.sourceTargetKey ? (
                                  <button
                                    type="button"
                                    onClick={() => openSource(message.sourceTargetKey)}
                                    className="inline-flex items-center gap-1 text-[hsl(217,18%,48%)] transition hover:text-[hsl(220,42%,34%)]"
                                  >
                                    Panelī
                                  </button>
                                ) : null}
                                <span className="ml-auto">{message.timeLabel}</span>
                              </div>
                            </div>

                            {message.suggestions?.length ? (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {message.suggestions.map((suggestion) => (
                                  <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => sendMessage(suggestion)}
                                    className="rounded-[9px] border border-[rgba(204,218,240,0.96)] bg-white px-2.5 py-1 text-[9px] font-medium text-[hsl(220,34%,38%)] transition hover:border-[rgba(177,198,235,0.96)] hover:bg-[hsl(210,60%,98%)]"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-[80%] break-words rounded-[16px] rounded-tr-[6px] bg-[linear-gradient(135deg,#dbe9ff,#c8dbff)] px-3 py-2.5 text-[12px] leading-4 text-[hsl(222,28%,22%)] shadow-[0_12px_24px_rgba(129,154,206,0.18)]">
                          <p>{message.text}</p>
                          <p className="mt-1.5 text-right text-[9px] text-[hsl(220,18%,52%)]">
                            {message.timeLabel}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {isResponding ? (
                    <div className="flex justify-start">
                      <div className="flex max-w-[90%] items-start gap-2">
                        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[hsl(219,50%,52%)] shadow-[0_8px_18px_rgba(86,107,166,0.14)]">
                          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </div>

                        <div className="rounded-[16px] rounded-tl-[6px] border border-[rgba(215,224,237,0.96)] bg-white px-3.5 py-3 shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full bg-[hsl(218,28%,68%)] animate-bounce [animation-delay:-0.24s] [animation-duration:0.9s]"
                              aria-hidden="true"
                            />
                            <span
                              className="h-2 w-2 rounded-full bg-[hsl(218,28%,68%)] animate-bounce [animation-delay:-0.12s] [animation-duration:0.9s]"
                              aria-hidden="true"
                            />
                            <span
                              className="h-2 w-2 rounded-full bg-[hsl(218,28%,68%)] animate-bounce [animation-duration:0.9s]"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <footer className="border-t border-[rgba(226,232,240,0.92)] bg-white px-3 py-3">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage(draft);
                  }}
                  className="flex items-center gap-3"
                >
                  <div className="relative min-w-0 flex-1">
                    <input
                      ref={inputRef}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Jautājums par pacienta datiem..."
                      disabled={isResponding}
                      className="h-11 w-full rounded-[15px] border border-[rgba(203,215,233,0.96)] bg-[hsl(210,60%,99%)] pl-4 pr-14 text-[12px] text-[hsl(222,28%,20%)] outline-none transition placeholder:text-[hsl(217,12%,58%)] focus:border-[rgba(113,154,228,0.96)] focus:bg-white focus:ring-4 focus:ring-[rgba(93,136,217,0.14)]"
                    />
                    <button
                      type="submit"
                      disabled={!draft.trim() || isResponding}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[hsl(220,24%,48%)] transition hover:bg-[hsl(214,32%,96%)] hover:text-[hsl(219,42%,24%)] disabled:cursor-not-allowed disabled:opacity-45"
                      aria-label="Nosūtīt jautājumu"
                    >
                      <Send className="h-3.5 w-3.5" strokeWidth={1.65} />
                    </button>
                  </div>
                </form>

                <div className="mt-2 flex items-start gap-2 text-[9px] leading-4 text-[hsl(217,12%,56%)]">
                  <AlertCircle className="mt-[1px] h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
                  <p>
                    Atbildes tiek ģenerētas no pieejamajiem pacienta datiem. Pirms klīniska
                    lēmuma pieņemšanas pārbaudiet informāciju avotā.
                  </p>
                </div>
              </footer>
            </section>

            <div className="absolute bottom-[-8px] right-[52px] h-4 w-4 rotate-45 border-b border-r border-[rgba(220,228,236,0.96)] bg-white shadow-[10px_12px_24px_rgba(15,23,42,0.10)]" />
          </div>
        </CenteredOverlay>
      ) : null}
    </>
  );
}

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeState = location.state as DashboardLocationState | undefined;
  const patient = routeState?.patient ?? readStoredLastViewedPatient(patients);
  const specialtyId = routeState?.specialtyId ?? readStoredDashboardSpecialty();

  const routeLayoutOrder = React.useMemo(
    () =>
      filterDashboardLayoutOrderBySpecialty(
        normalizeDashboardLayoutOrder(
          routeState?.layoutOrder ?? readStoredDashboardLayoutOrder(),
        ),
        specialtyId,
      ),
    [routeState?.layoutOrder, specialtyId],
  );

  const [order, setOrder] =
    React.useState<DashboardComponentKey[]>(routeLayoutOrder);

  const [lastRefreshedAt, setLastRefreshedAt] = React.useState(new Date());
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const recentPatients = React.useMemo(() => {
    if (!patient) return patients;

    return [patient, ...patients.filter((item) => item.id !== patient.id)];
  }, [patient]);

  React.useEffect(() => {
    let frameId: number | null = null;

    const updateScrolledState = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled((previous) => {
        if (previous) {
          return currentScrollY > HEADER_COMPACT_EXIT_SCROLL_Y;
        }

        return currentScrollY > HEADER_COMPACT_ENTER_SCROLL_Y;
      });
    };

    const onScroll = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateScrolledState();
      });
    };

    updateScrolledState();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!patient) {
      navigate("/", { replace: true });
    }
  }, [navigate, patient]);

  React.useEffect(() => {
    if (!patient) {
      return;
    }

    writeStoredLastViewedPatientId(patient.id);
  }, [patient]);

  React.useEffect(() => {
    setOrder(routeLayoutOrder);
  }, [routeLayoutOrder]);

  React.useEffect(() => {
    if (!isRefreshing) return;

    const timeout = setTimeout(() => {
      setLastRefreshedAt(new Date());
      setIsRefreshing(false);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [isRefreshing]);

  if (!patient) return null;

  const phone = "phone" in patient ? patient.phone : "";
  const email = "email" in patient ? patient.email : "";
  const refreshedDateLabel = formatRefreshDate(lastRefreshedAt);

  const componentItems = [
    {
      key: "patientCard" as const,
      element: <PatientCard patient={{ ...patient, updatedAt: refreshedDateLabel }} />,
    },
    {
      key: "preventionCard" as const,
      element: <PreventionCard patient={patient} />,
    },
    {
      key: "healthTrends" as const,
      element: <HealthTrends updatedAt={refreshedDateLabel} />,
    },
    {
      key: "medicalImagingViewer" as const,
      element: <MedicalImagingViewer />,
    },
    {
      key: "medicationTable" as const,
      element: <MedicationTable />,
    },
    {
      key: "alertsCard" as const,
      element: <AlertsCard />,
    },
    {
      key: "eventTimeline" as const,
      element: <EventTimelineHorizontal updatedAt={refreshedDateLabel} />,
    },
    {
      key: "humanBodyModel" as const,
      element: <HumanBodyModel />,
    },
    {
      key: "referralHistory" as const,
      element: <ReferralHistory />,
    },
  ];

  const orderedVisibleKeys = React.useMemo(
    () => compactDashboardGridOrder(order),
    [order],
  );

  const visibleItems = orderedVisibleKeys
    .map((key) => componentItems.find((item) => item.key === key))
    .filter(Boolean) as typeof componentItems;

  const visibleKeys = visibleItems.map((item) => item.key);
  const resolvedLayoutClasses = React.useMemo(
    () => getExpandedLayoutClasses(visibleKeys),
    [visibleKeys],
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <DashboardSidebar
        activePatient={patient}
        recentPatients={recentPatients}
        allPatients={patients}
        currentView="dashboard"
        dayListCount={patients.length}
        layoutOrder={order}
        specialtyId={specialtyId}
        onSaveLayoutOrder={setOrder}
      />

      <div className="transition-[padding-left] duration-300 lg:pl-[var(--dashboard-sidebar-width,280px)]">
        <header className="sticky top-0 z-40 border-b border-[rgba(224,231,243,0.9)] bg-[radial-gradient(circle_at_top_left,rgba(247,250,255,0.95),rgba(255,255,255,0.98)_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,251,255,0.96))] shadow-[0_10px_28px_rgba(148,163,184,0.08)] backdrop-blur-xl">
          <div className="mx-auto w-full max-w-[1280px] px-5 py-6 md:px-8 md:py-7">
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <h1
                  className={`min-w-0 pt-1 md:pt-2 font-bold tracking-[-0.045em] text-[hsl(222,28%,16%)] transition-all ${
                    isScrolled ? "text-[30px] leading-[1.02]" : "text-[38px] leading-[0.96] md:text-[48px]"
                  }`}
                >
                  {patient.name}
                </h1>

                <div className="flex shrink-0 flex-wrap items-stretch justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => !isRefreshing && setIsRefreshing(true)}
                    className={`inline-flex items-center rounded-[8px] border border-[rgba(214,223,237,0.95)] bg-white text-left font-semibold text-[hsl(222,24%,22%)] transition-colors hover:border-[rgba(194,206,226,1)] hover:bg-[hsl(210,40%,99%)] focus:outline-none focus:ring-2 focus:ring-[hsl(214,36%,78%)] ${
                      isScrolled
                        ? "h-11 w-11 justify-center p-0"
                        : "min-h-[56px] min-w-[158px] gap-2 px-3 py-2.5 text-[12px] md:min-w-[166px] md:text-[13px]"
                    }`}
                    aria-label="Atjaunot datus"
                  >
                    <span
                      className={`flex shrink-0 items-center justify-center rounded-[7px] border border-[rgba(223,229,240,0.95)] bg-[hsl(210,40%,99%)] text-[hsl(221,22%,24%)] ${
                        isScrolled ? "h-8 w-8 border-0 bg-transparent" : "h-8 w-8"
                      }`}
                    >
                      <RefreshCw
                        className={isRefreshing ? "animate-spin" : ""}
                        size={18}
                        strokeWidth={1.9}
                      />
                    </span>
                    <span
                      className={`leading-[1.12] ${isScrolled ? "hidden" : "block"}`}
                    >
                      <span className="block text-[13px] font-semibold tracking-[-0.02em] text-[hsl(222,24%,22%)] md:text-[14px]">
                        {isRefreshing ? "Atjauno datus..." : "Atjaunot datus"}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-medium text-[hsl(220,16%,52%)] md:text-[11px]">
                        Pēdējo reizi: {formatRefreshTimestamp(lastRefreshedAt)}
                      </span>
                    </span>
                  </button>
                </div>
              </div>

              <div
                className={`overflow-hidden transition-[max-height,opacity,margin] duration-200 ease-out ${
                  isScrolled
                    ? "mt-0 max-h-0 opacity-0 pointer-events-none"
                    : "mt-4 max-h-20 opacity-100"
                }`}
                aria-hidden={isScrolled}
              >
                <div className="flex flex-wrap items-center text-[12px] leading-6 text-[hsl(220,16%,52%)] md:text-[13px]">
                  <span className="font-medium text-[hsl(220,16%,52%)]">
                    Personas kods
                  </span>

                  <span className="ml-1.5 font-semibold text-[hsl(222,24%,24%)]">
                    {patient.personalCode}
                  </span>

                  <InfoDivider />

                  <span className="font-medium text-[hsl(220,16%,52%)]">Vecums</span>

                  <span className="ml-1.5 font-semibold text-[hsl(222,24%,24%)]">
                    {patient.age} gadi
                  </span>

                  {phone && (
                    <>
                      <InfoDivider />

                      <Phone className="ml-0.5 h-3.5 w-3.5 text-[hsl(220,18%,56%)]" />

                      <span className="ml-1.5 font-medium text-[hsl(220,16%,52%)]">
                        Telefona nr.
                      </span>

                      <span className="ml-1.5 font-semibold text-[hsl(222,24%,24%)]">
                        {phone}
                      </span>
                    </>
                  )}

                  {email && (
                    <>
                      <InfoDivider />

                      <Mail className="ml-0.5 h-3.5 w-3.5 text-[hsl(220,18%,56%)]" />

                      <span className="ml-1.5 font-medium text-[hsl(220,16%,52%)]">
                        E-pasts
                      </span>

                      <span className="ml-1.5 font-semibold text-[hsl(222,24%,24%)]">
                        {email}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 md:px-6">
          <div className="mx-auto grid w-full max-w-[1280px] auto-rows-auto items-stretch gap-4 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <div
                key={item.key}
                id={`dashboard-card-${item.key}`}
                className={`relative min-w-0 ${resolvedLayoutClasses[item.key]}`}
              >
                <div className="h-full">{item.element}</div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <DashboardAssistant patient={patient} />
    </div>
  );
};

export default Index;
