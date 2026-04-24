import { useEffect, useMemo, useRef, useState } from "react";
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
  Scissors,
  Stethoscope,
} from "lucide-react";

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
    facility: "Ģimenes ārsta prakse – Dr. I. Bērziņa",
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
  "flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsla(210,62%,82%,0.42)] bg-[radial-gradient(circle_at_top,hsla(0,100%,100%,0.98),hsla(210,92%,96%,0.96)_48%,hsla(210,78%,92%,0.88))] text-[hsl(210,60%,45%)] shadow-[0_0_0_1px_hsla(0,100%,100%,0.22),0_12px_30px_hsla(210,80%,76%,0.18)]";

const typeConfig: Record<
  EventType,
  {
    label: string;
    icon: React.ReactNode;
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
      "border-[hsl(196,62%,76%)] bg-[hsl(194,100%,97%)] shadow-[0_0_0_4px_hsl(194_100%_97%/0.95)]",
    dotInnerClass: "bg-[hsl(195,72%,48%)]",
    activeDotOuterClass:
      "border-[hsl(196,62%,76%)] bg-[hsl(194,100%,97%)] shadow-[0_0_0_4px_hsl(194_100%_97%/0.95)]",
    activeDotInnerClass: "bg-[hsl(195,72%,48%)]",
    textClass: "text-[hsl(195,72%,42%)]",
    badgeClass:
      "border-[hsl(196,58%,84%)] bg-[hsl(193,100%,96%)] text-[hsl(195,72%,42%)]",
    activeBorderClass: "border-[hsl(196,58%,84%)]",
    activeTextClass: "text-[hsl(195,72%,42%)]",
    activeBackgroundClass: "bg-[hsl(193,100%,97%)]",
    detailDotClass: "bg-[hsl(195,72%,42%)]",
    activeConnectorClass: "bg-[hsl(196,50%,76%)]",
  },
  ambulatora_vizite: {
    label: "Ambulatorā vizīte",
    icon: <Stethoscope size={12} strokeWidth={1.8} />,
    dotOuterClass:
      "border-[hsl(154,34%,78%)] bg-[hsl(152,50%,97%)] shadow-[0_0_0_4px_hsl(152_50%_97%/0.95)]",
    dotInnerClass: "bg-[hsl(156,48%,46%)]",
    activeDotOuterClass:
      "border-[hsl(154,34%,78%)] bg-[hsl(152,50%,97%)] shadow-[0_0_0_4px_hsl(152_50%_97%/0.95)]",
    activeDotInnerClass: "bg-[hsl(156,48%,46%)]",
    textClass: "text-[hsl(156,54%,38%)]",
    badgeClass:
      "border-[hsl(154,32%,84%)] bg-[hsl(154,58%,96%)] text-[hsl(156,54%,38%)]",
    activeBorderClass: "border-[hsl(154,32%,84%)]",
    activeTextClass: "text-[hsl(156,54%,38%)]",
    activeBackgroundClass: "bg-[hsl(154,58%,97%)]",
    detailDotClass: "bg-[hsl(156,54%,38%)]",
    activeConnectorClass: "bg-[hsl(154,34%,76%)]",
  },
  stacionars: {
    label: "Stacionārs",
    icon: <Hospital size={12} strokeWidth={1.8} />,
    dotOuterClass:
      "border-[hsl(344,44%,80%)] bg-[hsl(345,75%,98%)] shadow-[0_0_0_4px_hsl(345_75%_98%/0.95)]",
    dotInnerClass: "bg-[hsl(345,68%,58%)]",
    activeDotOuterClass:
      "border-[hsl(344,44%,80%)] bg-[hsl(345,75%,98%)] shadow-[0_0_0_4px_hsl(345_75%_98%/0.95)]",
    activeDotInnerClass: "bg-[hsl(345,68%,58%)]",
    textClass: "text-[hsl(345,62%,50%)]",
    badgeClass:
      "border-[hsl(344,38%,84%)] bg-[hsl(343,100%,97%)] text-[hsl(345,62%,50%)]",
    activeBorderClass: "border-[hsl(344,38%,84%)]",
    activeTextClass: "text-[hsl(345,62%,50%)]",
    activeBackgroundClass: "bg-[hsl(343,100%,98%)]",
    detailDotClass: "bg-[hsl(345,62%,50%)]",
    activeConnectorClass: "bg-[hsl(344,42%,78%)]",
  },
  procedura: {
    label: "Procedūra",
    icon: <Scissors size={12} strokeWidth={1.8} />,
    dotOuterClass:
      "border-[hsl(41,56%,78%)] bg-[hsl(45,100%,97%)] shadow-[0_0_0_4px_hsl(45_100%_97%/0.95)]",
    dotInnerClass: "bg-[hsl(39,84%,54%)]",
    activeDotOuterClass:
      "border-[hsl(41,56%,78%)] bg-[hsl(45,100%,97%)] shadow-[0_0_0_4px_hsl(45_100%_97%/0.95)]",
    activeDotInnerClass: "bg-[hsl(39,84%,54%)]",
    textClass: "text-[hsl(38,84%,44%)]",
    badgeClass:
      "border-[hsl(42,42%,82%)] bg-[hsl(45,100%,96%)] text-[hsl(38,84%,44%)]",
    activeBorderClass: "border-[hsl(42,42%,82%)]",
    activeTextClass: "text-[hsl(38,84%,44%)]",
    activeBackgroundClass: "bg-[hsl(45,100%,98%)]",
    detailDotClass: "bg-[hsl(38,84%,44%)]",
    activeConnectorClass: "bg-[hsl(42,48%,76%)]",
  },
  atteldiagnostika: {
    label: "Attēldiagnostika",
    icon: <Activity size={12} strokeWidth={1.8} />,
    dotOuterClass:
      "border-[hsl(263,42%,82%)] bg-[hsl(264,100%,98%)] shadow-[0_0_0_4px_hsl(264_100%_98%/0.95)]",
    dotInnerClass: "bg-[hsl(263,56%,62%)]",
    activeDotOuterClass:
      "border-[hsl(263,42%,82%)] bg-[hsl(264,100%,98%)] shadow-[0_0_0_4px_hsl(264_100%_98%/0.95)]",
    activeDotInnerClass: "bg-[hsl(263,56%,62%)]",
    textClass: "text-[hsl(263,48%,54%)]",
    badgeClass:
      "border-[hsl(264,34%,84%)] bg-[hsl(266,100%,97%)] text-[hsl(263,48%,54%)]",
    activeBorderClass: "border-[hsl(266,46%,82%)]",
    activeTextClass: "text-[hsl(263,48%,54%)]",
    activeBackgroundClass: "bg-[hsl(266,100%,98%)]",
    detailDotClass: "bg-[hsl(263,48%,54%)]",
    activeConnectorClass: "bg-[hsl(264,42%,78%)]",
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

const EventTimelineHorizontal = () => {
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>(allTypes);
  const [activeEventId, setActiveEventId] = useState<string | null>("3");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
      const container = containerRef.current;
      if (!container) return;
      if (container.contains(event.target as Node)) return;
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

  useEffect(() => {
    updateScrollState();
  }, [filteredEvents]);

  return (
    <div ref={containerRef} className="glass-card rounded-2xl p-5">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className={sectionIconClass}>
          <History size={18} />
        </div>

        <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-heading">
          Notikumu laika līnija
        </p>

        <div className="ml-auto flex flex-wrap gap-2">
          {allTypes.map((type) => {
            const isSelected = selectedTypes.includes(type);
            const config = typeConfig[type];

            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-medium transition-all ${isSelected
                    ? `${config.badgeClass} shadow-sm`
                    : "border-[hsl(214,20%,88%)] bg-white/65 text-heading opacity-75"
                  }`}
              >
                <span className={config.textClass}>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="flex min-h-[110px] items-center justify-center rounded-xl border border-dashed border-[hsl(211,24%,86%)] bg-white/60 px-4 text-center text-[12px] text-heading">
          Nav atlasītu notikumu tipu.
        </div>
      ) : (
        <div className="relative">
          {canScrollLeft ? (
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-10 rounded-l-xl bg-gradient-to-r from-[rgba(255,255,255,0.94)] via-[rgba(255,255,255,0.75)] to-transparent" />
          ) : null}

          {canScrollRight ? (
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 rounded-r-xl bg-gradient-to-l from-[rgba(255,255,255,0.98)] via-[rgba(255,255,255,0.88)] to-transparent" />
          ) : null}

          {canScrollLeft ? (
            <button
              type="button"
              onClick={() => scrollByAmount("left")}
              className="absolute left-1 top-[88px] z-30 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(210,24%,86%)] bg-white/95 text-[hsl(215,18%,44%)] shadow-[0_8px_24px_rgba(148,163,184,0.18)] transition hover:bg-white hover:text-text-dark"
              aria-label="Ritināt pa kreisi"
            >
              <ChevronLeft size={16} />
            </button>
          ) : null}

          {canScrollRight ? (
            <button
              type="button"
              onClick={() => scrollByAmount("right")}
              className="absolute right-1 top-[88px] z-30 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(210,24%,86%)] bg-white/95 text-[hsl(215,18%,44%)] shadow-[0_8px_24px_rgba(148,163,184,0.18)] transition hover:bg-white hover:text-text-dark"
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
            <div className="relative min-w-max px-3 pt-2 pr-12">
              <div className="absolute left-5 right-5 top-[47px] h-px bg-[hsl(220,22%,90%)]" />

              <div className="flex items-start gap-6">
                {filteredEvents.map((event) => {
                  const config = typeConfig[event.type];
                  const active = activeEventId === event.id;

                  return (
                    <div
                      key={event.id}
                      className={`relative shrink-0 transition-all duration-200 ${active ? "w-[300px]" : "w-[186px]"
                        }`}
                    >
                      <div className="relative flex flex-col items-center">
                        <p
                          className={`mb-3 text-[11px] font-semibold tracking-[0.03em] ${active
                              ? "text-[hsl(263,34%,58%)]"
                              : "text-[hsl(215,14%,48%)]"
                            }`}
                        >
                          {formatDate(event.date)}
                        </p>

                        <div
                          className={`relative z-10 flex items-center justify-center rounded-full border transition-all ${active
                              ? `h-8 w-8 ${config.activeDotOuterClass}`
                              : `h-5 w-5 ${config.dotOuterClass}`
                            }`}
                        >
                          <span
                            className={`rounded-full ${active
                                ? `h-3.5 w-3.5 ${config.activeDotInnerClass}`
                                : `h-2 w-2 ${config.dotInnerClass}`
                              }`}
                          />
                        </div>

                        <div
                          className={`w-px transition-all ${active ? `h-9 ${config.activeConnectorClass}` : "h-5 bg-[hsl(210,18%,80%)]"
                            }`}
                        />
                      </div>

                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          setActiveEventId((current) =>
                            current === event.id ? null : event.id,
                          )
                        }
                        onKeyDown={(eventKey) => {
                          if (eventKey.key === "Enter" || eventKey.key === " ") {
                            eventKey.preventDefault();
                            setActiveEventId((current) =>
                              current === event.id ? null : event.id,
                            );
                          }
                        }}
                        aria-expanded={active}
                        className={`relative w-full text-left transition-all duration-300 ease-out ${active
                            ? `rounded-[22px] border ${config.activeBorderClass} bg-white px-5 py-5 shadow-[0_12px_28px_rgba(177,155,234,0.12)]`
                            : "rounded-[14px] border border-[hsl(210,22%,88%)] bg-white/94 px-2.5 py-3 shadow-[0_10px_24px_rgba(148,163,184,0.11)] backdrop-blur-sm hover:bg-white"
                          }`}
                      >
                        {active ? (
                          <button
                            type="button"
                            onClick={(eventClick) => {
                              eventClick.stopPropagation();
                              setActiveEventId((current) =>
                                current === event.id ? null : event.id,
                              );
                            }}
                            aria-label="Sakļaut detaļas"
                            className={`absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full transition ${config.activeTextClass} ${config.activeBackgroundClass}`}
                          >
                            <ChevronUp size={12} />
                          </button>
                        ) : null}

                        <div className={active ? "mb-4 pr-10" : "mb-2"}>
                          <div className="min-w-0">
                            <div
                              className={`flex items-center gap-1.5 ${active ? "mb-4" : "mb-1"
                                }`}
                            >
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-xl border ${active
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
                              className={`font-semibold text-text-dark ${active ? "text-[15px] leading-[22px]" : "text-[12px] leading-[16px]"
                                }`}
                            >
                              {event.title}
                            </h3>

                            <p
                              className={`${active
                                  ? "mt-1.5 text-[12px] leading-[20px] text-[hsl(214,18%,54%)]"
                                  : "mt-0.5 line-clamp-2 text-[10px] leading-[14px] text-heading"
                                }`}
                            >
                              {event.summary}
                            </p>

                            <div
                              className={`flex items-start gap-2 ${active
                                  ? "mt-2 text-[12px] leading-[20px] text-[hsl(214,18%,50%)]"
                                  : "mt-1 text-[10px] leading-[14px] text-heading"
                                }`}
                            >
                              <Building2
                                size={active ? 14 : 12}
                                className="mt-[2px] shrink-0 text-[hsl(214,18%,60%)]"
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
                              setActiveEventId((current) =>
                                current === event.id ? null : event.id,
                              );
                            }}
                            aria-label="Izvērst detaļas"
                            className="absolute right-2.5 top-3 inline-flex h-5 w-5 items-center justify-center rounded-md text-heading transition hover:bg-[hsl(210,30%,97%)] hover:text-text-dark"
                          >
                            <ChevronDown size={12} />
                          </button>
                        ) : null}

                        <div
                          className={`overflow-hidden transition-all duration-300 ease-out ${active && (event.details?.length || event.originalDocumentUrl)
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
      )}

      <p className="mt-4 text-xs text-[hsl(214,18%,62%)]">Atjaunināts: 14.04.2026.</p>
    </div>
  );
};

export default EventTimelineHorizontal;