import * as React from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  HeartPulse,
  Shield,
  Syringe,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Patient } from "@/types/patient";

type PreventionGroupItem = {
  label: string;
  status: "done" | "overdue";
  dateLabel: string;
};

type PreventionGroup = {
  id: "screenings" | "vaccinations";
  title: string;
  subtitle: string;
  icon: typeof Shield;
  progress: number;
  items: PreventionGroupItem[];
};

const femaleScreeningItems: PreventionGroupItem[] = [
  {
    label: "Krūts vēža skrīnings",
    status: "overdue",
    dateLabel: "Nokavēts kopš 20.01.2025",
  },
  {
    label: "Dzemdes kakla skrīnings",
    status: "done",
    dateLabel: "Veikts 15.07.2024",
  },
  {
    label: "Zarnu vēža skrīnings",
    status: "done",
    dateLabel: "Veikts 10.04.2024",
  },
];

const maleScreeningItems: PreventionGroupItem[] = [
  {
    label: "Zarnu vēža skrīnings",
    status: "done",
    dateLabel: "Veikts 10.04.2024",
  },
  {
    label: "Prostatas vēža skrīnings",
    status: "overdue",
    dateLabel: "Nokavēts kopš 20.01.2025",
  },
];

const vaccinationItems: PreventionGroupItem[] = [
  {
    label: "Gripas vakcīna",
    status: "done",
    dateLabel: "Veikta 20.10.2024",
  },
  {
    label: "Covid-19 balstdeva",
    status: "done",
    dateLabel: "Veikta 25.11.2024",
  },
  {
    label: "Ērču encefalīta vakcīna",
    status: "done",
    dateLabel: "Veikta 03.07.2023",
  },
  {
    label: "Hepatīta B vakcīna",
    status: "done",
    dateLabel: "Veikta 12.03.2025",
  },
  {
    label: "Stingumkrampju/difterijas balstvakcīna",
    status: "overdue",
    dateLabel: "Nokavēta kopš 18.02.2024",
  },
];

const scoreInputs = [
  { label: "Smēķēšana", value: "Nē" },
  { label: "Sistoliskais asinsspiediens", value: "135 mmHg" },
  { label: "Kopējais holesterīns", value: "5.8 mmol/L" },
  { label: "ABL holesterīns", value: "3.4 mmol/L" },
];

const panelBorder = "border border-[#E3E5EE]";
const titleColor = "text-[#1D2150]";
const mutedColor = "text-[#68738C]";
const accentColor = "#23314D";
const sectionIconClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border border-[rgba(210,219,228,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,246,249,0.96))] text-[hsl(220,36%,18%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]";

function formatProgressSubtitle(items: PreventionGroupItem[]) {
  const completedCount = items.filter((item) => item.status === "done").length;

  return `${completedCount} no ${items.length} veikti`;
}

function getProgress(items: PreventionGroupItem[]) {
  const completedCount = items.filter((item) => item.status === "done").length;

  return Math.round((completedCount / items.length) * 100);
}

function getAttentionItem(items: PreventionGroupItem[]) {
  return items.find((item) => item.status === "overdue") ?? null;
}

function extractDateValue(dateLabel: string) {
  const match = dateLabel.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return Number.NEGATIVE_INFINITY;

  const [, day, month, year] = match;
  return Date.UTC(Number(year), Number(month) - 1, Number(day));
}

function prioritizeOverdueItems(items: PreventionGroupItem[]) {
  return [
    ...items.filter((item) => item.status === "overdue"),
    ...items
      .filter((item) => item.status !== "overdue")
      .sort((left, right) => extractDateValue(right.dateLabel) - extractDateValue(left.dateLabel)),
  ];
}

function formatAttentionLabel(label: string) {
  return label.replace(/\svēža/gi, "");
}

function ProgressSummary({
  group,
  isExpanded,
  onToggle,
}: {
  group: PreventionGroup;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const Icon = group.icon;
  const attentionItem = getAttentionItem(group.items);

  return (
    <div className={cn("overflow-hidden rounded-[6px] bg-white", panelBorder)}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-2.5 py-3 text-left transition hover:bg-[#F7F8FC]"
      >
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center">
            <Icon
              className="h-4 w-4"
              strokeWidth={1.9}
              style={{ color: accentColor }}
            />
          </div>

          <div className="min-w-0 self-center">
            <p className={cn("truncate text-[12px] font-semibold", titleColor)}>
              {group.title}
            </p>
            <p className={cn("mt-0.5 text-[10px]", mutedColor)}>{group.subtitle}</p>
          </div>

          <div className="flex items-start gap-2">
            {attentionItem ? (
              <span className="inline-flex max-w-[150px] items-center gap-1.5 rounded-[10px] border border-[#F5C5C8] bg-[#FFF8F8] px-2.5 py-1 text-[9px] font-semibold text-[#D44D57]">
                <span className="min-w-0 truncate">
                  Trūkst: {formatAttentionLabel(attentionItem.label)}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center rounded-[10px] border border-[#CDE8D4] bg-[#F3FBF5] px-2.5 py-1 text-[9px] font-semibold text-[#2F9A53]">
                Viss veikts
              </span>
            )}

            <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#59627D]">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" strokeWidth={1.8} />
              ) : (
                <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
              )}
            </span>
          </div>

          <div className="col-[2/4] h-1.5 overflow-hidden rounded-full bg-[#E2E6F1]">
            <div
              className="h-full rounded-full"
              style={{ backgroundColor: accentColor, width: `${group.progress}%` }}
            />
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-[#ECEEF4]">
          {group.items.map((item) => (
            <div
              key={item.label}
              className="border-t border-[#F0F2F7] px-3 py-2.5 first:border-t-0"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full border",
                      item.status === "done"
                        ? "border-[#4AB86E] text-[#34A85C]"
                        : "border-[#F08E96] text-[#D44D57]",
                    )}
                  >
                    {item.status === "done" ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
                    ) : (
                      <CircleAlert className="h-3.5 w-3.5" strokeWidth={2.2} />
                    )}
                  </span>

                  <p className={cn("min-w-0 text-[11px] font-medium", titleColor)}>
                    {item.label}
                  </p>
                </div>

                <span className={cn("text-right text-[10px]", mutedColor)}>
                  {item.dateLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PreventionCard({ patient }: { patient: Patient }) {
  const [isScoreDataExpanded, setIsScoreDataExpanded] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<
    Record<PreventionGroup["id"], boolean>
  >({
    screenings: false,
    vaccinations: false,
  });

  const screeningItems =
    patient.gender === "female" ? femaleScreeningItems : maleScreeningItems;
  const prioritizedScreeningItems = React.useMemo(
    () => prioritizeOverdueItems(screeningItems),
    [screeningItems],
  );
  const prioritizedVaccinationItems = React.useMemo(
    () => prioritizeOverdueItems(vaccinationItems),
    [],
  );

  const preventionGroups = React.useMemo<PreventionGroup[]>(
    () => [
      {
        id: "screenings",
        title: "Vēža skrīningi",
        subtitle: formatProgressSubtitle(prioritizedScreeningItems),
        icon: Shield,
        progress: getProgress(prioritizedScreeningItems),
        items: prioritizedScreeningItems,
      },
      {
        id: "vaccinations",
        title: "Vakcinācijas",
        subtitle: formatProgressSubtitle(prioritizedVaccinationItems),
        icon: Syringe,
        progress: getProgress(prioritizedVaccinationItems),
        items: prioritizedVaccinationItems,
      },
    ],
    [prioritizedScreeningItems, prioritizedVaccinationItems],
  );

  return (
    <section className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-[6px] border border-[rgba(220,228,236,0.96)] bg-white p-5 shadow-[0_8px_18px_rgba(29,53,87,0.05)]">
      <div className="mb-5 flex shrink-0 items-center gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className={sectionIconClass}>
            <Shield
              className="h-[18px] w-[18px]"
              strokeWidth={1.8}
              style={{ color: accentColor }}
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold uppercase tracking-[0.12em] text-heading">
              Profilakse
            </p>
            <p className="truncate text-xs text-heading">
              Risks, skrīningi un vakcinācijas
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className={cn("overflow-hidden rounded-[6px] bg-white", panelBorder)}>
          <div className="px-5 pb-3 pt-4">
            <div className="grid grid-cols-[minmax(0,1fr)_124px] items-start gap-x-7 gap-y-4">
              <div className="min-w-0 flex-1">
                <p className={cn("whitespace-nowrap text-[14px] font-semibold tracking-[-0.02em]", titleColor)}>
                  SCORE2 risks (10 gadu)
                </p>

                <p
                  className={cn(
                    "mt-4 text-[44px] font-semibold leading-none tracking-[-0.06em]",
                    titleColor,
                  )}
                >
                  1.8%
                </p>

                <p className={cn("mt-3 whitespace-nowrap text-[11px] font-medium", mutedColor)}>
                  {"Apr\u0113\u0137in\u0101ts 05.02.2025"}
                </p>

                <p className={cn("hidden", mutedColor)}>
                  PÄ“dÄ“jais aprÄ“Ä·ins 05.02.2025
                </p>
              </div>

              <div className="ml-auto flex min-w-0 flex-col items-center pt-1 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_center,rgba(243,252,245,0.98),rgba(229,247,233,0.98))]">
                  <HeartPulse
                    className="h-6 w-6 text-[#2F9A53]"
                    strokeWidth={1.9}
                  />
                </div>

                <span className="mt-2 inline-flex min-w-[74px] items-center justify-center rounded-full border border-[#BEE5C7] bg-[#F8FFFA] px-2 py-0.5 text-[10px] font-semibold text-[#2F9A53] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
                  Zems risks
                </span>

                <p className={cn("mt-3 hidden text-[10px]", mutedColor)}>
                  Pēdējais aprēķins 05.02.2025
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E8EBF3]">
            <button
              type="button"
              onClick={() => setIsScoreDataExpanded((current) => !current)}
              className="flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-[#F7F8FC]"
            >
              <span className={cn("text-[12px] font-semibold tracking-[-0.02em]", titleColor)}>
                Aprēķina dati
              </span>
              {isScoreDataExpanded ? (
                <ChevronUp className="h-5 w-5 text-[#59627D]" strokeWidth={1.8} />
              ) : (
                <ChevronRight className="h-5 w-5 text-[#59627D]" strokeWidth={1.8} />
              )}
            </button>

            {isScoreDataExpanded && (
              <div className="border-t border-[#E8EBF3] bg-white">
                {scoreInputs.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-[#F0F2F7] px-3 py-2 first:border-t-0"
                  >
                    <span className={cn("text-[10px]", titleColor)}>
                      {item.label}
                    </span>
                    <span className={cn("text-[10px]", mutedColor)}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {preventionGroups.map((group) => (
          <ProgressSummary
            key={group.id}
            group={group}
            isExpanded={expandedGroups[group.id]}
            onToggle={() =>
              setExpandedGroups((current) => ({
                ...current,
                [group.id]: !current[group.id],
              }))
            }
          />
        ))}
      </div>
    </section>
  );
}
