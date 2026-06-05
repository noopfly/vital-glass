import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  Beaker,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  History,
  Hospital,
  Maximize2,
  Scissors,
  Stethoscope,
  X,
} from "lucide-react";

import { CenteredOverlay } from "@/components/ui/centered-overlay";

type EventType =
  | "laboratorija"
  | "ambulatora_vizite"
  | "stacionars"
  | "procedura"
  | "atteldiagnostika";

interface TimelineEvent {
  id: string;
  type: EventType;
  date: string;
  title: string;
  facility: string;
  summary: string;
  details?: string[];
  originalDocumentLabel?: string;
  originalDocumentUrl?: string;
}

const events: TimelineEvent[] = [
  {
    id: "1",
    type: "laboratorija",
    date: "2026-04-14",
    title: "Asins analīzes",
    facility: "Rīgas 1. slimnīca",
    summary: "Pilna asins aina, bioķīmija",
    details: [
      "Hemoglobīns normas robežās.",
      "Leikocīti bez būtiskām novirzēm.",
      "CRP paaugstinājums nav konstatēts.",
    ],
    originalDocumentLabel: "Skatīt laboratorijas izrakstu",
    originalDocumentUrl: "#original-document-1",
  },
  {
    id: "2",
    type: "ambulatora_vizite",
    date: "2026-04-10",
    title: "Ģimenes ārsta ambulatorā vizīte",
    facility: "Ģimenes ārsta prakse - Dr. I. Bērziņa",
    summary: "Regulārā pārbaude, recepšu atjaunošana",
    details: [
      "Asinsspiediens stabils, normas robežās.",
      "Turpināt esošo terapiju.",
      "Ieteikta kontrole pēc 3 mēnešiem.",
    ],
    originalDocumentLabel: "Skatīt ambulatorās vizītes protokolu",
    originalDocumentUrl: "#original-document-2",
  },
  {
    id: "3",
    type: "atteldiagnostika",
    date: "2026-04-02",
    title: "Krūškurvja rentgens",
    facility: "Diagnostikas centrs",
    summary: "Plaušu RTG izmeklēšana",
    details: [
      "Plaušu laukos infiltratīvas izmaiņas netiek konstatētas.",
      "Sirds ēna normāla izmēra un konfigurācijas.",
      "Pleiras dobumos šķidrums netiek konstatēts.",
    ],
    originalDocumentLabel: "Skatīt radiologa slēdzienu",
    originalDocumentUrl: "#original-document-3",
  },
  {
    id: "4",
    type: "procedura",
    date: "2026-03-25",
    title: "Elektrokardiogrāfija",
    facility: "Rīgas 1. slimnīca",
    summary: "EKG (12 novadījumos)",
    details: [
      "Sinusa ritms.",
      "Sirdsdarbības frekvence: 68 sit./min.",
      "PR intervāls: 162 ms.",
      "ST segmenta izmaiņas nav konstatētas.",
    ],
    originalDocumentLabel: "Skatīt EKG protokolu",
    originalDocumentUrl: "#original-document-4",
  },
  {
    id: "5",
    type: "stacionars",
    date: "2026-03-18",
    title: "Stacionāra ārstēšana",
    facility: "Paula Stradiņa klīniskā universitātes slimnīca",
    summary: "Plānveida hospitalizācija (3 dienas)",
    details: [
      "Veikta pacienta novērošana stacionārā.",
      "Nozīmēta un realizēta terapija bez komplikācijām.",
      "Pacients izrakstīts stabilā vispārējā stāvoklī.",
    ],
    originalDocumentLabel: "Skatīt izraksta epikrīzi",
    originalDocumentUrl: "#original-document-5",
  },
  {
    id: "6",
    type: "laboratorija",
    date: "2026-03-10",
    title: "Urīna analīze",
    facility: "VCA laboratorija",
    summary: "Vispārējā urīna analīze",
    details: [
      "Olbaltums urīnā netika konstatēts.",
      "Leikocītu līmenis normas robežās.",
      "Glikoze urīnā nav konstatēta.",
    ],
    originalDocumentLabel: "Skatīt laboratorijas izrakstu",
    originalDocumentUrl: "#original-document-6",
  },
];

const sectionIconClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border border-[rgba(210,219,228,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,246,249,0.96))] text-[hsl(220,36%,18%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]";

const typeConfig: Record<
  EventType,
  {
    label: string;
    icon: ReactNode;
    dotOuterClass: string;
    dotInnerClass: string;
    activeDotOuterClass: string;
    activeDotInnerClass: string;
    textClass: string;
    badgeClass: string;
    activeBorderClass: string;
    activeTextClass: string;
    activeBackgroundClass: string;
    detailDotClass: string;
    activeConnectorClass: string;
  }
> = {
  laboratorija: {
    label: "Laboratorija",
    icon: <Beaker size={12} strokeWidth={1.8} />,
    dotOuterClass:
      "border-[hsl(196,20%,78%)] bg-[hsl(192,30%,95%)] shadow-sm",
    dotInnerClass: "bg-[hsl(196,34%,36%)]",
    activeDotOuterClass:
      "border-[hsl(196,20%,78%)] bg-[hsl(192,30%,95%)] shadow-sm",
    activeDotInnerClass: "bg-[hsl(196,34%,36%)]",
    textClass: "text-[hsl(196,30%,34%)]",
    badgeClass:
      "border-[hsl(196,22%,80%)] bg-[hsl(192,30%,94%)] text-[hsl(196,30%,34%)]",
    activeBorderClass: "border-[hsl(196,22%,80%)]",
    activeTextClass: "text-[hsl(196,30%,34%)]",
    activeBackgroundClass: "bg-[hsl(192,30%,94%)]",
    detailDotClass: "bg-[hsl(196,34%,36%)]",
    activeConnectorClass: "bg-[hsl(196,18%,68%)]",
  },
  ambulatora_vizite: {
    label: "Ambulatorā vizīte",
    icon: <Stethoscope size={12} strokeWidth={1.8} />,
    dotOuterClass:
      "border-[hsl(152,24%,78%)] bg-[hsl(150,32%,95%)] shadow-sm",
    dotInnerClass: "bg-[hsl(152,36%,38%)]",
    activeDotOuterClass:
      "border-[hsl(152,24%,78%)] bg-[hsl(150,32%,95%)] shadow-sm",
    activeDotInnerClass: "bg-[hsl(152,36%,38%)]",
    textClass: "text-[hsl(152,38%,31%)]",
    badgeClass:
      "border-[hsl(152,24%,80%)] bg-[hsl(150,32%,94%)] text-[hsl(152,38%,31%)]",
    activeBorderClass: "border-[hsl(152,24%,80%)]",
    activeTextClass: "text-[hsl(152,38%,31%)]",
    activeBackgroundClass: "bg-[hsl(150,32%,94%)]",
    detailDotClass: "bg-[hsl(152,36%,38%)]",
    activeConnectorClass: "bg-[hsl(152,24%,68%)]",
  },
  stacionars: {
    label: "Stacionārs",
    icon: <Hospital size={12} strokeWidth={1.8} />,
    dotOuterClass:
      "border-[hsl(0,28%,80%)] bg-[hsl(0,42%,95%)] shadow-sm",
    dotInnerClass: "bg-[hsl(0,38%,46%)]",
    activeDotOuterClass:
      "border-[hsl(0,28%,80%)] bg-[hsl(0,42%,95%)] shadow-sm",
    activeDotInnerClass: "bg-[hsl(0,38%,46%)]",
    textClass: "text-[hsl(0,42%,40%)]",
    badgeClass:
      "border-[hsl(0,28%,80%)] bg-[hsl(0,42%,94%)] text-[hsl(0,42%,40%)]",
    activeBorderClass: "border-[hsl(0,28%,80%)]",
    activeTextClass: "text-[hsl(0,42%,40%)]",
    activeBackgroundClass: "bg-[hsl(0,42%,94%)]",
    detailDotClass: "bg-[hsl(0,38%,46%)]",
    activeConnectorClass: "bg-[hsl(0,26%,68%)]",
  },
  procedura: {
    label: "Procedūra",
    icon: <Scissors size={12} strokeWidth={1.8} />,
    dotOuterClass:
      "border-[hsl(38,30%,80%)] bg-[hsl(40,52%,95%)] shadow-sm",
    dotInnerClass: "bg-[hsl(36,50%,42%)]",
    activeDotOuterClass:
      "border-[hsl(38,30%,80%)] bg-[hsl(40,52%,95%)] shadow-sm",
    activeDotInnerClass: "bg-[hsl(36,50%,42%)]",
    textClass: "text-[hsl(34,50%,36%)]",
    badgeClass:
      "border-[hsl(38,30%,80%)] bg-[hsl(40,52%,94%)] text-[hsl(34,50%,36%)]",
    activeBorderClass: "border-[hsl(38,30%,80%)]",
    activeTextClass: "text-[hsl(34,50%,36%)]",
    activeBackgroundClass: "bg-[hsl(40,52%,94%)]",
    detailDotClass: "bg-[hsl(36,50%,42%)]",
    activeConnectorClass: "bg-[hsl(38,28%,68%)]",
  },
  atteldiagnostika: {
    label: "Attēldiagnostika",
    icon: <Activity size={12} strokeWidth={1.8} />,
    dotOuterClass:
      "border-[hsl(220,24%,80%)] bg-[hsl(220,36%,95%)] shadow-sm",
    dotInnerClass: "bg-[hsl(220,28%,40%)]",
    activeDotOuterClass:
      "border-[hsl(220,24%,80%)] bg-[hsl(220,36%,95%)] shadow-sm",
    activeDotInnerClass: "bg-[hsl(220,28%,40%)]",
    textClass: "text-[hsl(220,28%,34%)]",
    badgeClass:
      "border-[hsl(220,24%,80%)] bg-[hsl(220,36%,94%)] text-[hsl(220,28%,34%)]",
    activeBorderClass: "border-[hsl(220,24%,80%)]",
    activeTextClass: "text-[hsl(220,28%,34%)]",
    activeBackgroundClass: "bg-[hsl(220,36%,94%)]",
    detailDotClass: "bg-[hsl(220,28%,40%)]",
    activeConnectorClass: "bg-[hsl(220,22%,68%)]",
  },
};

const allTypes = Object.keys(typeConfig) as EventType[];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("lv-LV", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

type TimelineContentProps = {
  updatedAt: string;
  selectedTypes: EventType[];
  activeEventId: string | null;
  filteredEvents: TimelineEvent[];
  onToggleType: (type: EventType) => void;
  onToggleEvent: (eventId: string) => void;
  onOpenExpanded?: () => void;
  expanded?: boolean;
};

function TimelineContent({
  updatedAt,
  selectedTypes,
  activeEventId,
  filteredEvents,
  onToggleType,
  onToggleEvent,
  onOpenExpanded,
  expanded = false,
}: TimelineContentProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const element = scrollRef.current;
    if (!element) return;

    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    setCanScrollLeft(element.scrollLeft > 4);
    setCanScrollRight(element.scrollLeft < maxScrollLeft - 4);
  };

  const scrollByAmount = (direction: "left" | "right") => {
    const element = scrollRef.current;
    if (!element) return;

    element.scrollBy({
      left: direction === "right" ? 260 : -260,
      behavior: "smooth",
    });
  };

  const handleCardClick = () => {
    if (!expanded) {
      onOpenExpanded?.();
    }
  };

  useEffect(() => {
    updateScrollState();
  }, [filteredEvents, activeEventId, expanded]);

  return (
    <div
      data-timeline-container
      onClick={handleCardClick}
      className={`flex w-full flex-col rounded-[6px] border border-[hsl(214,22%,88%)] bg-white p-5 shadow-sm transition ${
        expanded
          ? "min-h-[640px]"
          : "h-full min-h-[420px] cursor-pointer hover:border-[hsl(214,24%,82%)] hover:shadow-[0_12px_28px_rgba(29,53,87,0.08)]"
      }`}
    >
      <div className="mb-5 flex flex-nowrap items-center gap-3">
        <div className={sectionIconClass}>
          <History size={18} />
        </div>

        <p className="shrink-0 whitespace-nowrap text-[13px] font-semibold uppercase leading-[1.12] tracking-[0.08em] text-heading md:text-[14px]">
          Notikumu laika līnija
        </p>

        <div
          className={`ml-auto flex min-w-0 flex-1 items-center justify-end overflow-hidden ${
            expanded ? "gap-2 pr-16" : "gap-1"
          }`}
        >
          {allTypes.map((type) => {
            const isSelected = selectedTypes.includes(type);
            const config = typeConfig[type];

            return (
              <button
                key={type}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleType(type);
                }}
                className={`inline-flex shrink-0 items-center rounded-full border font-medium transition-all ${
                  expanded
                    ? "gap-1.5 px-2.5 py-1.5 text-[10px]"
                    : "gap-0.5 px-1.5 py-[3px] text-[8px]"
                } ${
                  isSelected
                    ? `${config.badgeClass} shadow-sm`
                    : "border-[hsl(214,20%,88%)] bg-[hsl(214,20%,98%)] text-[hsl(214,18%,38%)]"
                }`}
              >
                <span className={`${config.textClass} ${expanded ? "" : "scale-75"}`}>
                  {config.icon}
                </span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>

        {!expanded && onOpenExpanded ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenExpanded();
            }}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-[hsl(220,36%,18%)] transition hover:opacity-70"
            aria-label="Izvērst pilnskatā"
            title="Izvērst pilnskatā"
          >
            <Maximize2 size={15} />
          </button>
        ) : null}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="flex min-h-[110px] flex-1 items-center justify-center rounded-[10px] border border-dashed border-[hsl(211,24%,86%)] bg-[hsl(214,20%,98%)] px-4 text-center text-[12px] text-heading">
          Nav atlasītu notikumu veidu.
        </div>
      ) : (
        <div className={`relative flex-1 ${expanded ? "flex items-center -mt-20" : "pt-8"}`}>
          <div className={`relative w-full ${expanded ? "mt-10" : ""}`}>
            {canScrollLeft ? (
              <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-10 rounded-l-xl bg-gradient-to-r from-[rgba(255,255,255,0.94)] via-[rgba(255,255,255,0.75)] to-transparent" />
            ) : null}

            {canScrollRight ? (
              <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 rounded-r-xl bg-gradient-to-l from-[rgba(255,255,255,0.98)] via-[rgba(255,255,255,0.88)] to-transparent" />
            ) : null}

            {canScrollLeft ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  scrollByAmount("left");
                }}
                className={`absolute left-1 z-30 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(210,24%,86%)] bg-white/95 text-[hsl(215,18%,44%)] shadow-sm transition hover:bg-white hover:text-text-dark ${
                  expanded ? "top-[128px]" : "top-[88px]"
                }`}
                aria-label="Ritināt pa kreisi"
              >
                <ChevronLeft size={16} />
              </button>
            ) : null}

            {canScrollRight ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  scrollByAmount("right");
                }}
                className={`absolute right-1 z-30 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(210,24%,86%)] bg-white/95 text-[hsl(215,18%,44%)] shadow-sm transition hover:bg-white hover:text-text-dark ${
                  expanded ? "top-[128px]" : "top-[88px]"
                }`}
                aria-label="Ritināt pa labi"
              >
                <ChevronRight size={16} />
              </button>
            ) : null}

            <div
              ref={scrollRef}
              onScroll={updateScrollState}
              className="overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className={`relative min-w-max px-3 pr-12 ${expanded ? "pt-12" : "pt-2"}`}>
                <div
                  className={`absolute left-5 right-5 h-px bg-[hsl(220,22%,90%)] ${
                    expanded ? "top-[95px]" : "top-[47px]"
                  }`}
                />

                <div className="flex items-start gap-6">
                  {filteredEvents.map((event) => {
                    const config = typeConfig[event.type];
                    const active = activeEventId === event.id;

                    return (
                      <div
                        key={event.id}
                        role="button"
                        tabIndex={0}
                        onClick={(eventClick) => {
                          eventClick.stopPropagation();
                          onToggleEvent(event.id);
                        }}
                        onKeyDown={(eventKey) => {
                          if (eventKey.key === "Enter" || eventKey.key === " ") {
                            eventKey.preventDefault();
                            eventKey.stopPropagation();
                            onToggleEvent(event.id);
                          }
                        }}
                        aria-expanded={active}
                        className={`relative shrink-0 cursor-pointer transition-all duration-200 ${
                          active ? "w-[300px]" : "w-[186px]"
                        }`}
                      >
                        <div className="relative flex flex-col items-center">
                          <p
                            className={`mb-3 text-[11px] font-semibold tracking-[0.03em] ${
                              active
                                ? "text-[hsl(220,24%,36%)]"
                                : "text-[hsl(215,18%,40%)]"
                            }`}
                          >
                            {formatDate(event.date)}
                          </p>

                          <div
                            className={`relative z-10 flex items-center justify-center rounded-full border transition-all ${
                              active
                                ? `h-8 w-8 ${config.activeDotOuterClass}`
                                : `h-5 w-5 ${config.dotOuterClass}`
                            }`}
                          >
                            <span
                              className={`rounded-full ${
                                active
                                  ? `h-3.5 w-3.5 ${config.activeDotInnerClass}`
                                  : `h-2 w-2 ${config.dotInnerClass}`
                              }`}
                            />
                          </div>

                          <div
                            className={`w-px transition-all ${
                              active
                                ? `h-9 ${config.activeConnectorClass}`
                                : "h-5 bg-[hsl(210,18%,80%)]"
                            }`}
                          />
                        </div>

                        <div
                          className={`relative w-full text-left transition-all duration-300 ease-out ${
                            active
                              ? `rounded-[10px] border ${config.activeBorderClass} bg-white px-5 py-5 shadow-sm`
                              : "rounded-[10px] border border-[hsl(210,22%,88%)] bg-white px-2.5 py-3 shadow-sm hover:bg-white"
                          }`}
                        >
                          {active ? (
                            <button
                              type="button"
                              onClick={(eventClick) => {
                                eventClick.stopPropagation();
                                onToggleEvent(event.id);
                              }}
                              aria-label="Sakļaut detaļas"
                              className={`absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full transition ${config.activeTextClass} ${config.activeBackgroundClass}`}
                            >
                              <ChevronUp size={12} />
                            </button>
                          ) : null}

                          <div className={active ? "mb-4 pr-10" : "mb-2"}>
                            <div className="min-w-0">
                              <div className={`flex items-center gap-1.5 ${active ? "mb-4" : "mb-1"}`}>
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-xl border ${
                                    active
                                      ? `${config.activeBorderClass} ${config.activeBackgroundClass} px-3 py-1.5 text-[11px] font-semibold ${config.activeTextClass}`
                                      : `${config.badgeClass} px-1.5 py-0.5 text-[9px] font-medium`
                                  }`}
                                >
                                  <span className={active ? config.activeTextClass : config.textClass}>
                                    {config.icon}
                                  </span>
                                  <span>{config.label}</span>
                                </span>
                              </div>

                              <h3
                                className={`font-semibold text-text-dark ${
                                  active
                                    ? "text-[15px] leading-[22px]"
                                    : "text-[12px] leading-[16px]"
                                }`}
                              >
                                {event.title}
                              </h3>

                              <p
                                className={`${
                                  active
                                    ? "mt-1.5 text-[12px] leading-[20px] text-[hsl(214,18%,54%)]"
                                    : "mt-0.5 line-clamp-2 text-[10px] leading-[14px] text-[hsl(214,18%,40%)]"
                                }`}
                              >
                                {event.summary}
                              </p>

                              <div
                                className={`flex items-start gap-2 ${
                                  active
                                    ? "mt-2 text-[12px] leading-[20px] text-[hsl(214,18%,50%)]"
                                    : "mt-1 text-[10px] leading-[14px] text-[hsl(214,18%,40%)]"
                                }`}
                              >
                                <Building2
                                  size={active ? 14 : 12}
                                  className="mt-[2px] shrink-0 text-[hsl(214,18%,52%)]"
                                />
                                <span>{event.facility}</span>
                              </div>
                            </div>
                          </div>

                          {!active ? (
                            <button
                              type="button"
                              onClick={(eventClick) => {
                                eventClick.stopPropagation();
                                onToggleEvent(event.id);
                              }}
                              aria-label="Izvērst detaļas"
                              className="absolute right-2.5 top-3 inline-flex h-5 w-5 items-center justify-center rounded-md text-heading transition hover:bg-[hsl(210,30%,97%)] hover:text-text-dark"
                            >
                              <ChevronDown size={12} />
                            </button>
                          ) : null}

                          <div
                            className={`overflow-hidden transition-all duration-300 ease-out ${
                              active && (event.details?.length || event.originalDocumentUrl)
                                ? "mt-5 max-h-[320px] border-t pt-5 opacity-100"
                                : "mt-0 max-h-0 border-t-0 pt-0 opacity-0"
                            } ${active ? config.activeBorderClass : "border-transparent"}`}
                          >
                            {active && (event.details?.length || event.originalDocumentUrl) ? (
                              <>
                                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(214,14%,50%)]">
                                  Kopsavilkums
                                </p>

                                {event.details?.length ? (
                                  <ul className="space-y-1">
                                    {event.details.map((detail, index) => (
                                      <li
                                        key={`${event.id}-${index}`}
                                        className="flex items-start gap-2 text-[12px] leading-[20px]"
                                      >
                                        <span
                                          className={`mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full ${config.detailDotClass}`}
                                        />
                                        <span className="text-text-dark">{detail}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}

                                {event.originalDocumentUrl ? (
                                  <a
                                    href={event.originalDocumentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`mt-5 inline-flex items-center gap-1 text-[12px] font-semibold transition hover:opacity-80 ${config.activeTextClass}`}
                                    onClick={(eventClick) => eventClick.stopPropagation()}
                                  >
                                    {event.originalDocumentLabel ?? "Skatīt oriģinālo dokumentu"}
                                    <span aria-hidden="true">→</span>
                                  </a>
                                ) : null}
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="w-6 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-[hsl(214,18%,62%)]">Atjaunināts: {updatedAt}</p>
    </div>
  );
}

const EventTimelineHorizontal = ({ updatedAt }: { updatedAt: string }) => {
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>(allTypes);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [isExpandedOpen, setIsExpandedOpen] = useState(false);

  const filteredEvents = useMemo(() => {
    return [...events]
      .filter((event) => selectedTypes.includes(event.type))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedTypes]);

  useEffect(() => {
    if (activeEventId && !filteredEvents.some((event) => event.id === activeEventId)) {
      setActiveEventId(null);
    }
  }, [activeEventId, filteredEvents]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest("[data-timeline-container]")) return;

      setActiveEventId(null);
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const toggleType = (type: EventType) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  };

  const toggleEvent = (eventId: string) => {
    setActiveEventId((current) => (current === eventId ? null : eventId));
  };

  const openExpanded = () => {
    setIsExpandedOpen(true);
  };

  const closeExpanded = () => {
    setIsExpandedOpen(false);
  };

  return (
    <>
      <TimelineContent
        updatedAt={updatedAt}
        selectedTypes={selectedTypes}
        activeEventId={activeEventId}
        filteredEvents={filteredEvents}
        onToggleType={toggleType}
        onToggleEvent={toggleEvent}
        onOpenExpanded={openExpanded}
      />

      {isExpandedOpen ? (
        <CenteredOverlay
          onClose={closeExpanded}
          overlayClassName="bg-[rgba(241,245,249,0.78)] backdrop-blur-[10px]"
          contentClassName="max-w-[1280px]"
        >
          <div className="relative mx-auto w-full max-w-[1280px]">
            <button
              type="button"
              onClick={closeExpanded}
              className="absolute right-5 top-5 z-20 flex h-6 w-6 items-center justify-center text-[hsl(215,14%,55%)] transition hover:opacity-70 hover:text-[hsl(215,22%,28%)]"
              aria-label="Aizvērt pilnskatu"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="overflow-hidden">
              <TimelineContent
                updatedAt={updatedAt}
                selectedTypes={selectedTypes}
                activeEventId={activeEventId}
                filteredEvents={filteredEvents}
                onToggleType={toggleType}
                onToggleEvent={toggleEvent}
                expanded
              />
            </div>
          </div>
        </CenteredOverlay>
      ) : null}
    </>
  );
};

export default EventTimelineHorizontal;
