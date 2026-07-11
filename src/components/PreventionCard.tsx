import * as React from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  ClipboardCheck,
  HeartPulse,
  Shield,
  Syringe,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Patient } from "@/types/patient";
import { DashboardCardHeader } from "@/components/DashboardCardHeader";
import { DashboardListFooter } from "@/components/DashboardListFooter";

type PreventionStatus = "done" | "overdue" | "upcoming";

type PreventionGroupItem = {
  label: string;
  status: PreventionStatus;
  dateLabel: string;
  actionLabel?: string;
};

type PreventionGroup = {
  id: "screenings" | "vaccinations" | "annualCheckup";
  title: string;
  progressLabel: string;
  icon: typeof Shield;
  progress: number;
  items: PreventionGroupItem[];
};

const femaleScreeningItems: PreventionGroupItem[] = [
  {
    label: "Krūts vēža skrīnings",
    status: "overdue",
    dateLabel: "Nokavēts kopš 20.01.2025",
    actionLabel: "Jāpārbauda skrīninga statuss",
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
    label: "Prostatas skrīnings",
    status: "overdue",
    dateLabel: "Nokavēts kopš 20.01.2025",
    actionLabel: "Jāpiedāvā skrīninga vizīte",
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
    actionLabel: "Jāpiedāvā balstvakcinācija",
  },
];

const annualCheckupItems: PreventionGroupItem[] = [
  {
    label: "Ikgadējā profilaktiskā pārbaude",
    status: "overdue",
    dateLabel: "Nokavēta kopš 01.01.2026",
    actionLabel: "Jāieplāno vizīte",
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
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border border-[rgba(210,219,228,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,246,249,0.96))] text-[hsl(220,16%,38%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]";

function formatProgressLabel(items: PreventionGroupItem[]) {
  const completedCount = items.filter((item) => item.status === "done").length;
  return `${completedCount} no ${items.length} veikti`;
}

function getProgress(items: PreventionGroupItem[]) {
  const completedCount = items.filter((item) => item.status === "done").length;
  return Math.round((completedCount / items.length) * 100);
}

function getMissingItems(items: PreventionGroupItem[]) {
  return items.filter((item) => item.status === "overdue");
}

function getMissingSummary(items: PreventionGroupItem[]) {
  const missingItems = getMissingItems(items);

  if (missingItems.length === 0) {
    return null;
  }

  if (missingItems.length === 1) {
    return `${missingItems[0].label}`;
  }

  return `${missingItems[0].label} +${missingItems.length - 1}`;
}

function getVisibleSummaryGroups(groups: PreventionGroup[]) {
  const groupsWithMissing = groups.filter(
    (group) => getMissingItems(group.items).length > 0,
  );
  const groupsWithoutMissing = groups.filter(
    (group) => getMissingItems(group.items).length === 0,
  );

  return [...groupsWithMissing, ...groupsWithoutMissing].slice(0, 3);
}

function extractDateValue(dateLabel: string) {
  const match = dateLabel.match(/(\d{2})\.(\d{2})\.(\d{4})/);

  if (!match) {
    return Number.NEGATIVE_INFINITY;
  }

  const [, day, month, year] = match;
  return Date.UTC(Number(year), Number(month) - 1, Number(day));
}

function prioritizeItems(items: PreventionGroupItem[]) {
  const statusPriority: Record<PreventionStatus, number> = {
    overdue: 0,
    upcoming: 1,
    done: 2,
  };

  return [...items].sort((left, right) => {
    const statusDiff = statusPriority[left.status] - statusPriority[right.status];

    if (statusDiff !== 0) {
      return statusDiff;
    }

    return extractDateValue(right.dateLabel) - extractDateValue(left.dateLabel);
  });
}

function getStatusStyles(status: PreventionStatus) {
  if (status === "done") {
    return {
      icon: Check,
      iconClass: "text-[#34A85C]",
      pillClass: "border-[#D9EBDD] bg-[#F7FCF8] text-[#3E8C55]",
      label: "Veikts",
    };
  }

  if (status === "upcoming") {
    return {
      icon: CircleAlert,
      iconClass: "text-[#A06B13]",
      pillClass: "border-[#F0D9A8] bg-[#FFF9EC] text-[#A06B13]",
      label: "Drīzumā",
    };
  }

  return {
    icon: CircleAlert,
    iconClass: "text-[#D44D57]",
    pillClass: "border-[#F2DEE0] bg-[#FFF9F9] text-[#A85C62]",
    label: "Nokavēts",
  };
}

function RowIconTile({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#E3E7F0] bg-[#F8FAFD]">
      {children}
    </div>
  );
}

function ScoreCard({
  isExpanded = false,
  onToggle,
  onOpenDetails,
  expandable = false,
}: {
  isExpanded?: boolean;
  onToggle?: () => void;
  onOpenDetails?: () => void;
  expandable?: boolean;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[6px] bg-white", panelBorder)}>
      <div className="px-5 pb-3 pt-4">
        <div className="grid grid-cols-[minmax(0,1fr)_124px] items-start gap-x-7 gap-y-4">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "whitespace-nowrap text-sm font-semibold tracking-[-0.02em]",
                titleColor,
              )}
            >
              SCORE2 risks (10 gadu)
            </p>

            <p
              className={cn(
                "mt-4 text-3xl font-semibold leading-none tracking-[-0.06em]",
                titleColor,
              )}
            >
              1.8%
            </p>

            {onOpenDetails ? (
              <button
                type="button"
                onClick={onOpenDetails}
                className={cn(
                  "mt-3 inline-flex items-center gap-1 whitespace-nowrap text-xs font-normal transition hover:text-[#23314D]",
                  mutedColor,
                )}
              >
                <span>Aprēķināts 05.02.2025</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
              </button>
            ) : (
              <p className={cn("mt-3 whitespace-nowrap text-xs font-normal", mutedColor)}>
                Aprēķināts 05.02.2025
              </p>
            )}
          </div>

          <div className="ml-auto flex min-w-0 flex-col items-center pt-1 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_center,rgba(243,252,245,0.98),rgba(229,247,233,0.98))]">
              <HeartPulse className="h-6 w-6 text-[#2F9A53]" strokeWidth={1.9} />
            </div>

            <span className="mt-2 inline-flex min-w-[74px] items-center justify-center rounded-full border border-[#BEE5C7] bg-[#F8FFFA] px-2 py-0.5 text-xs font-semibold text-[#2F9A53] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
              Zems risks
            </span>
          </div>
        </div>
      </div>

      {expandable && (
        <div className="border-t border-[#E8EBF3]">
          <button
            type="button"
            onClick={onToggle}
            className="flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-[#F7F8FC]"
          >
            <span className={cn("text-xs font-semibold tracking-[-0.02em]", titleColor)}>
              Aprēķina dati
            </span>

            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-[#59627D]" strokeWidth={1.8} />
            ) : (
              <ChevronRight className="h-5 w-5 text-[#59627D]" strokeWidth={1.8} />
            )}
          </button>

          {isExpanded && (
            <div className="border-t border-[#E8EBF3] bg-white">
              {scoreInputs.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-[#F0F2F7] px-3 py-2 first:border-t-0"
                >
                  <span className={cn("text-xs", titleColor)}>{item.label}</span>
                  <span className={cn("text-xs", mutedColor)}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PreventionGroupSummaryRow({
  group,
  onClick,
}: {
  group: PreventionGroup;
  onClick: () => void;
}) {
  const Icon = group.icon;
  const missingSummary = getMissingSummary(group.items);

  return (
    <div className="border-b border-[#E8EBF3] last:border-b-0">
      <button
        type="button"
        onClick={onClick}
        className="w-full px-4 py-3 text-left transition hover:bg-[#F7F8FC]"
      >
        <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-x-3 gap-y-2">
        <RowIconTile>
          <Icon className="h-4 w-4 text-[#23314D]" strokeWidth={1.9} />
        </RowIconTile>

        <div className="min-w-0">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
            <p className={cn("min-w-fit text-xs font-semibold", titleColor)}>
              {group.title}
            </p>

            <div className="flex min-w-0 justify-end">
                {missingSummary ? (
                  <span className="inline-flex max-w-full items-center rounded-full border border-[#F0DEC5] bg-[#FFF8F0] px-2 py-0.5 text-[10px] font-semibold leading-4 text-[#B26A2B]">
                    <CircleAlert className="h-3 w-3 text-[#B26A2B] mr-1" strokeWidth={1.6} />
                    <span className="min-w-0 truncate">{missingSummary}</span>
                  </span>
                ) : (
                <span className="inline-flex shrink-0 items-center rounded-full border border-[#D9EBDD] bg-[#F7FCF8] px-2.5 py-0.5 text-xs font-semibold leading-4 text-[#3E8C55]">
                  viss veikts
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-[#E2E6F1]">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: accentColor,
                  width: `${group.progress}%`,
                }}
              />
            </div>

            <p className="whitespace-nowrap text-right text-xs font-normal text-[#68738C]">
              {group.progressLabel}
            </p>
          </div>
        </div>
        </div>
      </button>
    </div>
  );
}

function PreventionGroupExpandableRow({
  group,
  isExpanded,
  onToggle,
  isLast,
}: {
  group: PreventionGroup;
  isExpanded: boolean;
  onToggle: () => void;
  isLast?: boolean;
}) {
  const Icon = group.icon;
  const missingSummary = getMissingSummary(group.items);

  return (
    <div className={cn(!isLast && "border-b border-[#E8EBF3]")}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 text-left transition hover:bg-[#F7F8FC]"
      >
        <div className="grid grid-cols-[36px_minmax(0,1fr)_auto] gap-x-3 gap-y-2">
          <RowIconTile>
            <Icon className="h-4 w-4 text-[#23314D]" strokeWidth={1.9} />
          </RowIconTile>

          <div className="min-w-0">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
              <p className={cn("min-w-fit text-xs font-semibold", titleColor)}>
                {group.title}
              </p>

              <div className="flex min-w-0 justify-end">
                {missingSummary ? (
                  <span className="inline-flex max-w-full items-center rounded-full border border-[#F0DEC5] bg-[#FFF8F0] px-2 py-0.5 text-[10px] font-semibold leading-4 text-[#B26A2B]">
                    <CircleAlert className="h-3 w-3 text-[#B26A2B] mr-1" strokeWidth={1.6} />
                    <span className="min-w-0 truncate">{missingSummary}</span>
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center rounded-full border border-[#D9EBDD] bg-[#F7FCF8] px-2.5 py-0.5 text-xs font-semibold leading-4 text-[#3E8C55]">
                    viss veikts
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-[#E2E6F1]">
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: accentColor,
                    width: `${group.progress}%`,
                  }}
                />
              </div>

              <p className="whitespace-nowrap text-right text-xs font-normal text-[#68738C]">
                {group.progressLabel}
              </p>
            </div>
          </div>

          <span className="flex h-5 w-5 shrink-0 items-center justify-center self-start pt-1 text-[#59627D]">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" strokeWidth={1.8} />
            ) : (
              <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
            )}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-[#ECEEF4] bg-[#FBFCFE] px-4 py-2">
          {group.items.map((item, index) => {
            const status = getStatusStyles(item.status);
            const StatusIcon = status.icon;

            return (
              <div
                key={item.label}
                className={cn(
                  "grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 px-1 py-2",
                  index !== 0 && "border-t border-[#EEF1F6]",
                )}
              >
                <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center", status.iconClass)}>
                  <StatusIcon className="h-4 w-4" strokeWidth={2} />
                </span>

                <div className="min-w-0">
                  <p className={cn("whitespace-normal break-words text-xs font-normal", titleColor)}>
                    {item.label}
                  </p>

                  {item.actionLabel && item.status !== "done" ? (
                    <p className="mt-0.5 whitespace-normal break-words text-xs font-normal text-[#23314D]">
                      {item.actionLabel}
                    </p>
                  ) : (
                    <p className={cn("mt-0.5 whitespace-normal break-words text-xs", mutedColor)}>
                      {item.dateLabel}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-1.5 py-0.5 text-[11px] font-semibold",
                      status.pillClass,
                    )}
                  >
                    {status.label}
                  </span>

                  {item.actionLabel && item.status !== "done" && (
                    <p className={cn("mt-1 text-xs", mutedColor)}>{item.dateLabel}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PreventionFullViewModal({
  open,
  onClose,
  groups,
  initialExpandedGroupId,
  initialScoreExpanded,
}: {
  open: boolean;
  onClose: () => void;
  groups: PreventionGroup[];
  initialExpandedGroupId: PreventionGroup["id"] | null;
  initialScoreExpanded: boolean;
}) {
  const [isScoreDataExpanded, setIsScoreDataExpanded] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<
    Record<PreventionGroup["id"], boolean>
  >({
    screenings: false,
    vaccinations: false,
    annualCheckup: false,
  });

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setExpandedGroups({
      screenings: initialExpandedGroupId === "screenings",
      vaccinations: initialExpandedGroupId === "vaccinations",
      annualCheckup: initialExpandedGroupId === "annualCheckup",
    });
    setIsScoreDataExpanded(initialScoreExpanded);
  }, [initialExpandedGroupId, initialScoreExpanded, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/45 px-4 py-6">
      <button
        type="button"
        aria-label="Aizvērt"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <section className="relative flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[8px] border border-[rgba(220,228,236,0.96)] bg-white shadow-[0_24px_70px_rgba(16,24,40,0.22)]">
        <div className="flex shrink-0 items-center justify-between border-b border-[#E8EBF3] px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className={sectionIconClass}>
              <Shield
                className="h-[18px] w-[18px]"
                strokeWidth={1.8}
              />
            </div>

            <div className="min-w-0">
              <p className="whitespace-normal break-words text-sm font-semibold text-[hsl(220,18%,30%)]">
                Profilakse
              </p>
              <p className="whitespace-normal break-words text-xs font-normal text-[hsl(220,16%,52%)]">
                Risks, skrīningi un vakcinācijas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E3E5EE] bg-white text-[#59627D] transition hover:bg-[#F7F8FC]"
            aria-label="Aizvērt"
          >
            <X className="h-4 w-4" strokeWidth={1.9} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-5">
          <div className="flex flex-col gap-3">
            <ScoreCard
              expandable
              isExpanded={isScoreDataExpanded}
              onOpenDetails={() => setIsScoreDataExpanded(true)}
              onToggle={() => setIsScoreDataExpanded((current) => !current)}
            />

            <div className="overflow-hidden rounded-[8px] border border-[#E3E5EE] bg-white">
              {groups.map((group, index) => (
                <PreventionGroupExpandableRow
                  key={group.id}
                  group={group}
                  isExpanded={expandedGroups[group.id]}
                  isLast={index === groups.length - 1}
                  onToggle={() =>
                    setExpandedGroups((current) => ({
                      ...current,
                      [group.id]: !current[group.id],
                    }))
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PreventionCard({ patient }: { patient: Patient }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [initialExpandedGroupId, setInitialExpandedGroupId] = React.useState<
    PreventionGroup["id"] | null
  >(null);
  const [initialScoreExpanded, setInitialScoreExpanded] = React.useState(false);

  const screeningItems =
    patient.gender === "female" ? femaleScreeningItems : maleScreeningItems;

  const prioritizedScreeningItems = React.useMemo(
    () => prioritizeItems(screeningItems),
    [screeningItems],
  );

  const prioritizedVaccinationItems = React.useMemo(
    () => prioritizeItems(vaccinationItems),
    [],
  );

  const prioritizedAnnualCheckupItems = React.useMemo(
    () => prioritizeItems(annualCheckupItems),
    [],
  );

  const preventionGroups = React.useMemo<PreventionGroup[]>(
    () => [
      {
        id: "screenings",
        title: "Vēža skrīningi",
        progressLabel: formatProgressLabel(prioritizedScreeningItems),
        icon: Shield,
        progress: getProgress(prioritizedScreeningItems),
        items: prioritizedScreeningItems,
      },
      {
        id: "vaccinations",
        title: "Vakcinācijas",
        progressLabel: formatProgressLabel(prioritizedVaccinationItems),
        icon: Syringe,
        progress: getProgress(prioritizedVaccinationItems),
        items: prioritizedVaccinationItems,
      },
      {
        id: "annualCheckup",
        title: "Ikgadējā pārbaude",
        progressLabel: formatProgressLabel(prioritizedAnnualCheckupItems),
        icon: ClipboardCheck,
        progress: getProgress(prioritizedAnnualCheckupItems),
        items: prioritizedAnnualCheckupItems,
      },
    ],
    [
      prioritizedScreeningItems,
      prioritizedVaccinationItems,
      prioritizedAnnualCheckupItems,
    ],
  );

  const displayedPreventionGroups = React.useMemo(
    () => preventionGroups.filter((group) => group.id !== "annualCheckup"),
    [preventionGroups],
  );

  const visibleSummaryGroups = getVisibleSummaryGroups(displayedPreventionGroups);
  const handleOpenFullView = (
    groupId: PreventionGroup["id"] | null = null,
    options?: { scoreExpanded?: boolean },
  ) => {
    setInitialExpandedGroupId(groupId);
    setInitialScoreExpanded(Boolean(options?.scoreExpanded));
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="clinical-panel flex h-full flex-col">
        <DashboardCardHeader
          title="Profilakse"
          infoLabel="Informācija par profilaksi"
          infoDescription="Pacienta riska faktori, skrīningu statuss un vakcinācijas"
        />

        <div className="flex flex-1 flex-col gap-3">
          <ScoreCard onOpenDetails={() => handleOpenFullView(null, { scoreExpanded: true })} />

          <div className="overflow-hidden rounded-[8px] border border-[#E3E5EE] bg-white">
            {visibleSummaryGroups.map((group) => (
              <PreventionGroupSummaryRow
                key={group.id}
                group={group}
                onClick={() => handleOpenFullView(group.id)}
              />
            ))}

            <div className="border-t border-[#E8EBF3]">
              <DashboardListFooter
                label={"Skatīt pilno pārskatu"}
                onClick={() => handleOpenFullView()}
              />
            </div>
          </div>
        </div>

        
      </section>

      <PreventionFullViewModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groups={displayedPreventionGroups}
        initialExpandedGroupId={initialExpandedGroupId}
        initialScoreExpanded={initialScoreExpanded}
      />
    </>
  );
}
