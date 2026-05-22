import * as React from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Columns2,
  GripVertical,
  Info,
  Loader2,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { CenteredOverlay } from "@/components/ui/centered-overlay";
import {
  defaultDashboardLayoutOrder,
  normalizeDashboardLayoutOrder,
  writeStoredDashboardLayoutOrder,
  type DashboardComponentKey,
} from "@/lib/dashboard-layout";
import { cn } from "@/lib/utils";
import { Patient } from "@/types/patient";

type DashboardSidebarProps = {
  activePatient: Patient;
  recentPatients: Patient[];
  allPatients: Patient[];
  currentView: "dashboard" | "day-list" | "search";
  dayListCount?: number;
  layoutOrder?: DashboardComponentKey[];
  onSaveLayoutOrder?: (layoutOrder: DashboardComponentKey[]) => void;
  loadingPatientId?: string | null;
  loadingPatientComplete?: boolean;
};

type SettingsModuleKey = DashboardComponentKey;

type SettingsPreviewPattern =
  | "profile"
  | "trend"
  | "alerts"
  | "imaging"
  | "body"
  | "table"
  | "timeline"
  | "summary";

type SettingsPreviewDefinition = {
  note: string;
  previewClassName: string;
  surfaceClassName: string;
  pattern: SettingsPreviewPattern;
};

const storageKey = "omnis-sidebar-collapsed";
const expandedSidebarWidth = "280px";
const collapsedSidebarWidth = "92px";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const profileMenuItems = [
  {
    title: "Uzzināt vairāk",
    description: "Pamācības, privātuma politika, lietošanas noteikumi",
  },
  {
    title: "Saņemt palīdzību",
    description: "Nosūtīt ziņu atbalsta komandai",
  },
  {
    title: "Iestatījumi",
    description: "Konta un darba vietas konfigurācija",
  },
];

const settingsModules = [
  {
    key: "patientCard",
    title: "Pacienta klīniskais profils",
    description: "Galvenie pacienta dati un kontaktinformacija",
    sizeLabel: "Plats",
    previewColumns: 2,
  },
  {
    key: "healthTrends",
    title: "Klīniskie rādītāji",
    description: "Laboratoriju pārskats un izmaiņas laika",
    sizeLabel: "Plats",
    previewColumns: 2,
  },
  {
    key: "alertsCard",
    title: "Brīdinājumi",
    description: "Kritiskie rādītāji un svarīgi notikumi",
    sizeLabel: "šaurs",
    previewColumns: 1,
  },
  {
    key: "medicalImagingViewer",
    title: "Attēldiagnostika",
    description: "RTG, CT un citu izmeklējumu skati",
    sizeLabel: "šaurs",
    previewColumns: 1,
  },
  {
    key: "humanBodyModel",
    title: "Ķermeņa pārskats",
    description: "Interaktiva problemu zonu karte",
    sizeLabel: "šaurs",
    previewColumns: 1,
  },
  {
    key: "medicationTable",
    title: "Medikamenti",
    description: "Aktuala terapija un mijiedarbibas",
    sizeLabel: "šaurs",
    previewColumns: 1,
  },
  {
    key: "referralHistory",
    title: "E-nosutījumi",
    description: "Aktivie un vesturiskie nosutijumi",
    sizeLabel: "šaurs",
    previewColumns: 1,
  },
  {
    key: "eventTimeline",
    title: "Notikumu laika līnija",
    description: "Laika skala ar kliniskajiem notikumiem",
    sizeLabel: "Plats",
    previewColumns: 2,
  },

] as const;

const defaultSettingsOrder = defaultDashboardLayoutOrder;

const settingsPreviewDefinitions: Record<
  SettingsModuleKey,
  SettingsPreviewDefinition
> = {
  patientCard: {
    note: "Pacienta klīniskais profils",
    pattern: "profile",
    previewClassName: "col-span-3",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  healthTrends: {
    note: "Klīniskie rādītāji",
    pattern: "trend",
    previewClassName: "col-span-2",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  alertsCard: {
    note: "Brīdinājumi",
    pattern: "alerts",
    previewClassName: "",
    surfaceClassName:
      "border-[rgba(239,203,203,0.96)] bg-[hsl(0,60%,97%)] shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  medicalImagingViewer: {
    note: "Attēldiagnostika",
    pattern: "imaging",
    previewClassName: "",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  humanBodyModel: {
    note: "Ķermeņa pārskats",
    pattern: "body",
    previewClassName: "",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  medicationTable: {
    note: "Medikamenti",
    pattern: "table",
    previewClassName: "",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  referralHistory: {
    note: "E-nosūtījumi",
    pattern: "table",
    previewClassName: "",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  eventTimeline: {
    note: "Notikumu laika līnija",
    pattern: "timeline",
    previewClassName: "col-span-2",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
  patientSummaryCard: {
    note: "Pacienta kopsavilkums",
    pattern: "summary",
    previewClassName: "col-span-2",
    surfaceClassName:
      "border-[rgba(220,228,236,0.96)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]",
  },
};

function SettingsPreviewCard({
  module,
  index,
  draggedKey,
  onDragStart,
  onDragEnd,
  onDragOver,
}: {
  module: (typeof settingsModules)[number];
  index: number;
  draggedKey: DashboardComponentKey | null;
  onDragStart: (key: DashboardComponentKey) => void;
  onDragEnd: () => void;
  onDragOver: (key: DashboardComponentKey) => void;
}) {
  const preview = settingsPreviewDefinitions[module.key];

  return (
    <div
      draggable
      onDragStart={() => onDragStart(module.key)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver(module.key);
      }}
      className={cn(
        "cursor-grab overflow-hidden rounded-[14px] border p-2 transition active:cursor-grabbing",
        preview.previewClassName,
        preview.surfaceClassName,
        draggedKey === module.key &&
          "opacity-70 shadow-[0_10px_24px_rgba(29,53,87,0.08)]",
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
            <div className="space-y-1.5">
              {[62, 58, 54].map((width, cardIndex) => (
                <div
                  key={cardIndex}
                  className="flex items-center gap-2 rounded-[10px] bg-[hsl(214,20%,97%)] px-2 py-1.5"
                >
                  <div className="h-5 w-5 shrink-0 rounded-[8px] bg-[hsl(214,20%,90%)]" />
                  <div className="min-w-0 flex-1">
                    <div
                      className="h-2 bg-[hsl(214,18%,88%)]"
                      style={{ width: `${width}%` }}
                    />
                    <div className="mt-1.5 h-2 w-[36%] bg-[hsl(214,20%,82%)]" />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[10px] bg-[hsl(214,20%,97%)] px-2 py-2">
              <div className="mb-2 h-2 w-[28%] bg-[hsl(214,18%,86%)]" />
              <div className="flex h-[26px] items-end gap-1.5">
                {[4, 6, 5, 8, 6, 9].map((height, barIndex) => (
                  <div
                    key={barIndex}
                    className="w-4 rounded-[3px] bg-[hsl(220,34%,74%)]"
                    style={{ height: `${height * 2.5}px` }}
                  />
                ))}
              </div>
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
          <div className="space-y-1.5 rounded-[10px] bg-[hsl(214,20%,97%)] p-2">
            <div className="h-2 w-[56%] bg-[hsl(214,18%,86%)]" />
            <div className="h-2 w-[82%] bg-[hsl(214,18%,90%)]" />
            <div className="h-2 w-[74%] bg-[hsl(214,18%,90%)]" />
            <div className="h-2 w-[48%] bg-[hsl(214,18%,88%)]" />
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
              {[0, 1, 2, 3].map((timelineIndex) => (
                <React.Fragment key={timelineIndex}>
                  <div className="h-2.5 w-2.5 rounded-full bg-[hsl(220,34%,74%)]" />
                  {timelineIndex < 3 && (
                    <div className="h-px flex-1 bg-[hsl(214,18%,86%)]" />
                  )}
                </React.Fragment>
              ))}
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

export default function DashboardSidebar({
  activePatient,
  recentPatients,
  allPatients,
  currentView,
  dayListCount = 0,
  layoutOrder,
  onSaveLayoutOrder,
  loadingPatientId = null,
  loadingPatientComplete = false,
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const footerRef = React.useRef<HTMLDivElement | null>(null);
  const settingsListRef = React.useRef<HTMLDivElement | null>(null);
  const settingsPreviewRef = React.useRef<HTMLDivElement | null>(null);
  const shouldHighlightActivePatient = currentView === "dashboard";
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(storageKey) === "true";
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = React.useState(false);
  const [isAllPatientsOpen, setIsAllPatientsOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [draggedSettingsKey, setDraggedSettingsKey] = React.useState<
    DashboardComponentKey | null
  >(null);
  const [settingsOrder, setSettingsOrder] = React.useState<DashboardComponentKey[]>(
    () => normalizeDashboardLayoutOrder(layoutOrder ?? defaultSettingsOrder),
  );
  const [supportMessage, setSupportMessage] = React.useState("");
  const [reportMessage, setReportMessage] = React.useState("");
  const [reportSeverity, setReportSeverity] = React.useState<
    "blocking" | "annoying" | "suggestion" | null
  >(null);

  const orderedPatients = React.useMemo(
    () => [
      activePatient,
      ...allPatients.filter((patient) => patient.id !== activePatient.id),
    ],
    [activePatient, allPatients],
  );

  const settingsModuleMap = React.useMemo(
    () =>
      Object.fromEntries(
        settingsModules.map((module) => [module.key, module]),
      ) as Record<DashboardComponentKey, (typeof settingsModules)[number]>,
    [],
  );

  const orderedSettingsModules = settingsOrder
    .map((key) => settingsModuleMap[key])
    .filter(Boolean);

  React.useEffect(() => {
    if (!layoutOrder?.length) {
      return;
    }

    setSettingsOrder(normalizeDashboardLayoutOrder(layoutOrder));
  }, [layoutOrder]);

  React.useEffect(() => {
    window.localStorage.setItem(storageKey, String(isCollapsed));
    document.documentElement.style.setProperty(
      "--dashboard-sidebar-width",
      isCollapsed ? collapsedSidebarWidth : expandedSidebarWidth,
    );

    return () => {
      document.documentElement.style.removeProperty(
        "--dashboard-sidebar-width",
      );
    };
  }, [isCollapsed]);

  React.useEffect(() => {
    if (!isProfileMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!footerRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileMenuOpen]);

  React.useEffect(() => {
    if (isCollapsed) {
      setIsProfileMenuOpen(false);
    }
  }, [isCollapsed]);

  React.useEffect(() => {
    if (!isSettingsOpen) {
      return;
    }

    settingsListRef.current?.scrollTo({ top: 0 });
    settingsPreviewRef.current?.scrollTo({ top: 0 });
  }, [isSettingsOpen]);

  const handleProfileMenuItemClick = (title: string) => {
    if (title === "Uzzināt vairāk") {
      setIsProfileMenuOpen(false);
      setIsResourcesOpen(true);
      return;
    }

    if (title === "Saņemt palīdzību") {
      setIsProfileMenuOpen(false);
      setIsHelpOpen(true);
      return;
    }

    if (title === "Iestatījumi") {
      setIsProfileMenuOpen(false);
      setIsSettingsOpen(true);
    }
  };

  const handleSettingsDragOver = (targetKey: DashboardComponentKey) => {
    if (!draggedSettingsKey || draggedSettingsKey === targetKey) {
      return;
    }

    setSettingsOrder((current) => {
      const next = [...current];
      const fromIndex = next.indexOf(draggedSettingsKey);
      const toIndex = next.indexOf(targetKey);

      if (fromIndex === -1 || toIndex === -1) {
        return current;
      }

      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, draggedSettingsKey);
      return next;
    });
  };

  const handleResetSettings = () => {
    setSettingsOrder(defaultSettingsOrder);
  };

  const handleSaveSettings = () => {
    writeStoredDashboardLayoutOrder(settingsOrder);
    onSaveLayoutOrder?.(settingsOrder);
    setIsSettingsOpen(false);
  };

  return (
    <aside
      className={cn(
        "w-full shrink-0 transition-[width] duration-300 lg:fixed lg:left-0 lg:top-0 lg:z-30 lg:h-screen lg:w-[280px]",
        isCollapsed && "lg:w-[92px]",
      )}
    >
      <div className="flex h-full min-h-[calc(100vh-2.5rem)] flex-col rounded-[18px] border border-[rgba(220,228,236,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,251,255,0.92))] shadow-[0_12px_32px_rgba(126,158,187,0.1)] backdrop-blur-xl lg:min-h-screen lg:rounded-none lg:border-y-0 lg:border-l-0 lg:shadow-[12px_0_32px_rgba(126,158,187,0.08)]">
        <div className="border-b border-[rgba(221,228,236,0.96)] px-4 py-4">
          <div
            className={cn(
              "flex items-center justify-between gap-3",
              isCollapsed && "justify-center",
            )}
          >
            {!isCollapsed && (
              <button
                type="button"
                onClick={() =>
                  navigate("/components", {
                    state: { patient: activePatient, layoutOrder },
                  })
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
                aria-label="Atvērt sākuma paneli"
              >
                <img
                  src="/omnus-icon-logo.svg"
                  alt=""
                  className="h-10 w-10 rounded-[10px] object-contain"
                  aria-hidden="true"
                />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCollapsed((current) => !current)}
              className="flex h-8 w-8 shrink-0 items-center justify-center text-[hsl(214,18%,68%)] transition hover:text-[hsl(214,28%,36%)]"
              aria-label={isCollapsed ? "Izvērst sānjoslu" : "Sakļaut sānjoslu"}
            >
              <Columns2 className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="px-3 py-4">
          <Link
            to="/search"
            state={{ patient: activePatient, layoutOrder }}
            className={cn(
              "flex w-full items-center rounded-[9px] px-3 py-3 text-left transition",
              currentView === "search"
                ? "bg-[linear-gradient(180deg,hsl(220,36%,16%),hsl(218,34%,22%))] text-white"
                : "border border-[rgba(216,225,233,0.96)] bg-white text-[hsl(214,30%,28%)] hover:border-[rgba(196,210,223,0.96)]",
              isCollapsed ? "justify-center px-0" : "gap-3",
            )}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center">
              <Plus className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <span className="min-w-0 flex-1 text-[13px] font-semibold">
                Jauna meklēšana
              </span>
            )}
          </Link>

          <Link
            to="/day-list"
            state={{ patient: activePatient, layoutOrder }}
            className={cn(
              "mt-3 flex w-full items-center rounded-[9px] px-3 py-3 text-left transition",
              currentView === "day-list"
                ? "bg-[linear-gradient(180deg,hsl(220,36%,16%),hsl(218,34%,22%))] text-white"
                : "border border-[rgba(216,225,233,0.96)] bg-white text-[hsl(214,30%,28%)] hover:border-[rgba(196,210,223,0.96)]",
              isCollapsed ? "justify-center px-0" : "gap-3",
            )}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center">
              <CalendarDays className="h-4 w-4" />
            </div>

            {!isCollapsed && (
              <>
                <span className="min-w-0 flex-1 text-[13px] font-semibold">
                  Dienas saraksts
                </span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-[5px] bg-[hsl(214,32%,95%)] px-1.5 text-[10px] font-semibold text-[hsl(214,18%,56%)]">
                  {dayListCount}
                </span>
              </>
            )}
          </Link>
        </div>

        {!isCollapsed && (
          <div className="flex-1 px-4 pb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[hsl(214,20%,68%)]">
              Nesen skatītie
            </p>

            <div className="mt-3 space-y-1">
              {recentPatients.slice(0, 3).map((patient) => {
                const isActivePatient =
                  shouldHighlightActivePatient &&
                  patient.id === activePatient.id;
                const isLoadingPatient = patient.id === loadingPatientId;

                if (isLoadingPatient) {
                  return (
                    <div
                      key={patient.id}
                      className="group relative overflow-hidden rounded-[12px] border border-[rgba(204,216,234,0.96)] bg-white px-4 py-3 text-left shadow-[0_10px_22px_rgba(29,53,87,0.08)] transition"
                    >
                      <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-[hsl(220,36%,18%)]" />

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-[15px] font-semibold leading-5 text-[hsl(220,36%,18%)]">
                              {patient.name}
                            </p>

                            <span
                              className={cn(
                                "inline-flex shrink-0 translate-y-px items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold",
                                loadingPatientComplete
                                  ? "bg-[rgba(228,247,233,0.98)] text-[hsl(148,54%,34%)]"
                                  : "bg-[hsl(220,34%,94%)] text-[hsl(220,42%,34%)]",
                              )}
                            >
                              {!loadingPatientComplete && (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              )}
                              {loadingPatientComplete ? "Pabeigts" : "Notiek ielāde"}
                            </span>
                          </div>

                          <p className="mt-0.5 text-[11px] text-[hsl(214,18%,56%)]">
                            {patient.personalCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={patient.id}
                    to="/components"
                    state={{ patient, layoutOrder }}
                    aria-current={isActivePatient ? "page" : undefined}
                    className={cn(
                      "block rounded-[12px] px-3 py-1.5 text-left transition",
                      isActivePatient
                        ? "bg-[linear-gradient(180deg,hsl(220,36%,16%),hsl(218,34%,22%))] text-white"
                        : "text-[hsl(220,36%,18%)] hover:bg-[hsl(214,22%,98%)]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p
                            className={cn(
                              "truncate text-[15px] font-semibold leading-5",
                              undefined,
                            )}
                          >
                            {patient.name}
                          </p>
                        </div>
                        <p
                          className={cn(
                            "mt-0.5 text-[11px]",
                            isActivePatient
                                ? "text-white/72"
                                : "text-[hsl(214,16%,62%)]",
                          )}
                        >
                          {patient.personalCode}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsAllPatientsOpen(true)}
              className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium"
            >
              Visi pacienti
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {!isCollapsed && (
          <div className="px-4 pb-3">
            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="inline-flex items-center gap-2 text-[12px] font-medium text-[hsl(214,16%,58%)] transition hover:text-[hsl(214,24%,38%)]"
            >
              <Info className="h-4 w-4" />
              Ziņot par problēmu
            </button>
          </div>
        )}

        <div
          ref={footerRef}
          className={cn(
            "relative mt-auto border-t border-[rgba(221,228,236,0.96)] px-4 py-4",
            isCollapsed && "px-1 flex flex-col items-center",
          )}
        >
          {!isCollapsed && isProfileMenuOpen && (
            <div className="absolute bottom-[calc(100%+12px)] left-4 right-4 overflow-hidden rounded-[14px] border border-[rgba(220,228,236,0.96)] bg-white shadow-[0_18px_40px_rgba(29,53,87,0.12)]">
              {profileMenuItems.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => handleProfileMenuItemClick(item.title)}
                  className={cn(
                    "flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition hover:bg-[hsl(214,22%,98%)]",
                    index !== profileMenuItems.length - 1 &&
                    "border-b border-[rgba(230,235,241,0.96)]",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold leading-5 text-[hsl(220,36%,18%)]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[12px] leading-4 text-[hsl(214,16%,56%)]">
                      {item.description}
                    </p>
                  </div>
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(214,18%,68%)]" />
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (!isCollapsed) {
                setIsProfileMenuOpen((current) => !current);
              }
            }}
            className={cn(
              "flex w-full items-center transition",
              isCollapsed
                ? "justify-center"
                : "gap-3 rounded-[12px] px-2 py-2 hover:bg-[hsl(214,22%,98%)]",
            )}
            aria-expanded={!isCollapsed ? isProfileMenuOpen : undefined}
            aria-haspopup={!isCollapsed ? "menu" : undefined}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(180deg,hsl(220,38%,22%),hsl(217,40%,30%))] text-[11px] font-semibold text-white shadow-none">
              {getInitials("Dr. A. Liepiņa")}
            </div>

            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[13px] font-semibold">Dr. A. Liepiņa</p>
                  <p className="text-[11px] text-[hsl(214,16%,62%)]">
                    Ģimenes ārsts
                  </p>
                </div>
                {isProfileMenuOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-[hsl(214,18%,54%)]" />
                ) : (
                  <ChevronUp className="h-4 w-4 shrink-0 text-[hsl(214,18%,54%)]" />
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {isHelpOpen && (
        <CenteredOverlay
          onClose={() => setIsHelpOpen(false)}
          overlayClassName="bg-[rgba(16,24,40,0.18)] backdrop-blur-[6px]"
          contentClassName="max-w-[560px]"
        >
          <div className="mx-auto overflow-hidden rounded-[18px] border border-[rgba(220,228,236,0.96)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
            <div className="flex items-start justify-between border-b border-[rgba(230,235,241,0.96)] px-6 py-5">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[hsl(214,18%,62%)]">
                  Atbalsts
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[hsl(220,36%,18%)]">
                  Sazināties ar komandu
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(220,228,236,0.96)] bg-white text-[hsl(220,24%,22%)] transition hover:bg-[hsl(214,22%,98%)]"
                aria-label="Aizvērt atbalsta logu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="text-[14px] leading-6 text-[hsl(220,20%,34%)]">
                Aprakstiet problēmu vai jautājumu. Mēs atbildēsim uz jūsu
                reģistrēto e-pasta adresi.
              </p>

              <textarea
                value={supportMessage}
                onChange={(event) => setSupportMessage(event.target.value)}
                placeholder="Jūsu ziņa..."
                className="mt-5 min-h-[140px] w-full resize-none rounded-[10px] border border-[rgba(220,228,236,0.96)] bg-white px-4 py-3 text-[14px] text-[hsl(220,24%,22%)] outline-none transition placeholder:text-[hsl(214,16%,68%)] focus:border-[hsl(214,28%,76%)]"
              />

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(false)}
                  className="inline-flex items-center rounded-[10px] border border-[rgba(220,228,236,0.96)] bg-white px-5 py-2.5 text-[14px] font-medium text-[hsl(220,24%,34%)] transition hover:bg-[hsl(214,22%,98%)]"
                >
                  Atcelt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsHelpOpen(false);
                    setSupportMessage("");
                  }}
                  className="inline-flex items-center rounded-[10px] bg-[hsl(220,36%,18%)] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[hsl(220,32%,14%)]"
                >
                  Nosūtīt
                </button>
              </div>
            </div>
          </div>
        </CenteredOverlay>
      )}

      {isReportOpen && (
        <CenteredOverlay
          onClose={() => setIsReportOpen(false)}
          overlayClassName="bg-[rgba(16,24,40,0.18)] backdrop-blur-[6px]"
          contentClassName="max-w-[520px]"
        >
          <div className="mx-auto overflow-hidden rounded-[18px] border border-[rgba(220,228,236,0.96)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
            <div className="flex items-start justify-between border-b border-[rgba(230,235,241,0.96)] px-6 py-5">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[hsl(214,18%,62%)]">
                  Ziņojums
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[hsl(220,36%,18%)]">
                  Ziņot par problēmu
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsReportOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(220,228,236,0.96)] bg-white text-[hsl(220,24%,22%)] transition hover:bg-[hsl(214,22%,98%)]"
                aria-label="Aizvērt ziņojuma logu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-6">
              <label
                htmlFor="report-message"
                className="text-[13px] font-semibold text-[hsl(220,24%,24%)]"
              >
                Kas notika?
              </label>

              <textarea
                id="report-message"
                value={reportMessage}
                onChange={(event) => setReportMessage(event.target.value)}
                placeholder='Piemēram, "Pacientu saraksts neielādējas"'
                className="mt-3 min-h-[120px] w-full resize-none rounded-[10px] border border-[rgba(220,228,236,0.96)] bg-white px-4 py-3 text-[14px] text-[hsl(220,24%,22%)] outline-none transition placeholder:text-[hsl(214,16%,68%)] focus:border-[hsl(214,28%,76%)]"
              />

              <div className="mt-5">
                <p className="text-[13px] font-semibold text-[hsl(220,24%,24%)]">
                  Svarīgums
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    {
                      key: "blocking",
                      label: "🔴 Bloķē darbu",
                    },
                    {
                      key: "annoying",
                      label: "🟡 Traucē",
                    },
                    {
                      key: "suggestion",
                      label: "🟢 Ieteikums",
                    },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setReportSeverity((current) =>
                          current === item.key
                            ? null
                            : (item.key as "blocking" | "annoying" | "suggestion"),
                        )
                      }
                      className={cn(
                        "inline-flex items-center rounded-[10px] border px-3 py-2 text-[13px] font-medium transition",
                        reportSeverity === item.key
                          ? "border-[hsl(214,28%,76%)] bg-[hsl(214,22%,98%)] text-[hsl(220,30%,24%)]"
                          : "border-[rgba(220,228,236,0.96)] bg-white text-[hsl(214,18%,48%)] hover:bg-[hsl(214,22%,98%)]",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsReportOpen(false);
                    setReportMessage("");
                    setReportSeverity(null);
                  }}
                  className="inline-flex items-center rounded-[10px] bg-[hsl(220,36%,18%)] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[hsl(220,32%,14%)]"
                >
                  Nosūtīt
                </button>
              </div>
            </div>
          </div>
        </CenteredOverlay>
      )}

      {isResourcesOpen && (
        <CenteredOverlay
          onClose={() => setIsResourcesOpen(false)}
          overlayClassName="bg-[rgba(16,24,40,0.18)] backdrop-blur-[6px]"
          contentClassName="max-w-[560px]"
        >
          <div className="mx-auto overflow-hidden rounded-[18px] border border-[rgba(220,228,236,0.96)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
            <div className="flex items-start justify-between border-b border-[rgba(230,235,241,0.96)] px-6 py-5">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[hsl(214,18%,62%)]">
                  Resursi
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[hsl(220,36%,18%)]">
                  Uzzināt vairāk
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsResourcesOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(220,228,236,0.96)] bg-white text-[hsl(220,24%,22%)] transition hover:bg-[hsl(214,22%,98%)]"
                aria-label="Aizvērt resursu logu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              {[
                {
                  title: "Pamācības",
                  description: "Video ceļveži un soli-pa-solim instrukcijas",
                  badge: "12 resursi",
                },
                {
                  title: "Privātuma politika",
                  description: "Kā mēs apstrādājam un aizsargājam datus",
                  badge: "PDF",
                },
                {
                  title: "Lietošanas noteikumi",
                  description: "Platformas lietošanas nosacījumi",
                  badge: "PDF",
                },
              ].map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-[hsl(214,22%,98%)]",
                    index !== 2 &&
                    "border-b border-[rgba(230,235,241,0.96)]",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-[16px] font-semibold leading-6 text-[hsl(220,36%,18%)]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-5 text-[hsl(214,16%,50%)]">
                      {item.description}
                    </p>
                  </div>

                  <span className="inline-flex shrink-0 items-center rounded-[8px] border border-[rgba(220,228,236,0.96)] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(214,18%,62%)]">
                    {item.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CenteredOverlay>
      )}

      {isAllPatientsOpen && (
        <CenteredOverlay
          onClose={() => setIsAllPatientsOpen(false)}
          overlayClassName="bg-[rgba(16,24,40,0.18)] backdrop-blur-[6px]"
          contentClassName="max-w-[760px]"
        >
          <div className="mx-auto w-full max-w-[760px] overflow-hidden rounded-[18px] border border-[rgba(220,228,236,0.96)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
            <div className="flex items-start justify-between border-b border-[rgba(230,235,241,0.96)] px-8 py-7">
              <div>
                <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[hsl(220,36%,18%)]">
                  Visi pacienti
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsAllPatientsOpen(false)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(220,228,236,0.96)] bg-white text-[hsl(220,24%,22%)] transition hover:bg-[hsl(214,22%,98%)]"
                aria-label="AizvÄ“rt pacientu sarakstu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
              <div className="space-y-2">
                {orderedPatients.map((patient) => {
                  const isActivePatient =
                    shouldHighlightActivePatient &&
                    patient.id === activePatient.id;

                  return (
                    <Link
                      key={patient.id}
                      to="/components"
                      state={{ patient, layoutOrder }}
                      onClick={() => setIsAllPatientsOpen(false)}
                      aria-current={isActivePatient ? "page" : undefined}
                      className={cn(
                        "block w-full overflow-hidden rounded-[14px] border px-4 py-3 transition duration-200",
                        isActivePatient
                          ? "border-[rgba(199,214,231,0.96)] bg-[hsl(214,30%,97%)] text-[hsl(220,36%,18%)] shadow-[0_8px_20px_rgba(29,53,87,0.08)]"
                          : "border-transparent text-[hsl(220,36%,18%)] hover:-translate-y-[1px] hover:border-[rgba(214,222,230,0.96)] hover:bg-[hsl(214,22%,98%)] hover:shadow-[0_8px_18px_rgba(29,53,87,0.06)]",
                      )}
                    >
                      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-6 text-[15px] leading-5">
                        <p className="min-w-0 truncate font-semibold">
                          {patient.name}
                        </p>
                        <p
                          className={cn(
                            "justify-self-center whitespace-nowrap font-normal",
                            isActivePatient
                              ? "text-[hsl(214,16%,52%)]"
                              : "text-[hsl(214,16%,62%)]",
                          )}
                        >
                          {patient.personalCode}
                        </p>
                        <span
                          className={cn(
                            "justify-self-end whitespace-nowrap text-right font-normal",
                            isActivePatient
                              ? "text-[hsl(214,16%,52%)]"
                              : "text-[hsl(214,16%,56%)]",
                          )}
                        >
                          {patient.age} gadi
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </CenteredOverlay>
      )}

      {isSettingsOpen && (
        <CenteredOverlay
          onClose={() => setIsSettingsOpen(false)}
          overlayClassName="bg-[rgba(16,24,40,0.14)] backdrop-blur-[6px]"
          contentClassName="max-w-[1040px]"
        >
          <div className="mx-auto flex h-[min(82vh,760px)] w-[min(1040px,calc(100vw-32px))] flex-col overflow-hidden rounded-[18px] border border-[rgba(220,228,236,0.96)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
            <div className="flex shrink-0 items-start justify-between border-b border-[rgba(230,235,241,0.96)] px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(214,18%,62%)]">
                  Iestatījumi
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-[hsl(220,36%,18%)]">
                  Paneļa izkārtojums
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-[rgba(220,228,236,0.96)] bg-white px-4 py-2 text-[13px] font-medium text-[hsl(220,24%,28%)] transition hover:bg-[hsl(214,22%,98%)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Atiestatīt
                </button>

                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(220,228,236,0.96)] bg-white text-[hsl(220,24%,22%)] transition hover:bg-[hsl(214,22%,98%)]"
                  aria-label="Aizvert iestatijumus"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)] overflow-hidden">
              <div
                ref={settingsListRef}
                className="min-h-0 overflow-y-auto border-r border-[rgba(230,235,241,0.96)] bg-[hsl(214,22%,98%)] px-4 py-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[hsl(214,18%,62%)]">
                      Komponenti
                    </p>
                    <p className="mt-1 text-[12px] text-[hsl(214,16%,50%)]">
                      Velciet, lai pārkārtotu komponenšu izkārtojumu
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {orderedSettingsModules.map((module, index) => (
                    <button
                      key={module.key}
                      type="button"
                      draggable
                      onDragStart={() => setDraggedSettingsKey(module.key)}
                      onDragEnd={() => setDraggedSettingsKey(null)}
                      onDragOver={(event) => {
                        event.preventDefault();
                        handleSettingsDragOver(module.key);
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-[14px] border border-[rgba(223,230,237,0.96)] bg-white px-3 py-2.5 text-left transition",
                        draggedSettingsKey === module.key &&
                        "opacity-70 shadow-[0_10px_24px_rgba(29,53,87,0.08)]",
                      )}
                    >
                      <div className="mt-0.5 flex items-center gap-3 text-[hsl(214,14%,56%)]">
                        <GripVertical className="h-4 w-4" />
                        <span className="text-[11px] font-semibold">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-[hsl(220,36%,18%)]">
                          {module.title}
                        </p>
                        <p className="mt-1 text-[10px] leading-4 text-[hsl(214,16%,52%)]">
                          {module.description}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "inline-flex shrink-0 rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em]",
                          module.sizeLabel === "Plats"
                            ? "border-[rgba(199,214,231,0.96)] bg-[hsl(214,30%,97%)] text-[hsl(214,24%,54%)]"
                            : "border-[rgba(223,212,196,0.96)] bg-[hsl(38,34%,97%)] text-[hsl(34,24%,52%)]",
                        )}
                      >
                        {module.sizeLabel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div
                ref={settingsPreviewRef}
                className="min-h-0 overflow-y-auto bg-white px-4 py-4"
              >
                <div className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[hsl(214,18%,62%)]">
                    Priekšskatījums
                  </p>
                </div>

                <div className="rounded-[18px] border border-[rgba(230,235,241,0.96)] bg-[hsl(214,22%,99%)] p-3">
                  <div className="mb-3 rounded-[16px] border border-[rgba(220,228,236,0.96)] bg-white px-3 py-3 shadow-[0_8px_18px_rgba(29,53,87,0.04)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[8px] font-semibold text-[hsl(214,24%,28%)]">
                          Vārds Uzvārds
                        </p>
                        <p className="mt-1 text-[7px] text-[hsl(214,16%,58%)]">
                          Kontaktinformācija
                        </p>
                      </div>
                      <div className="h-7 w-7 rounded-[10px] bg-[hsl(214,20%,94%)]" />
                    </div>
                  </div>

                  <div className="grid auto-rows-[92px] grid-cols-3 gap-1.5">
                    {orderedSettingsModules.map((module, index) => (
                      <SettingsPreviewCard
                        key={module.key}
                        module={module}
                        index={index}
                        draggedKey={draggedSettingsKey}
                        onDragStart={setDraggedSettingsKey}
                        onDragEnd={() => setDraggedSettingsKey(null)}
                        onDragOver={handleSettingsDragOver}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-[rgba(230,235,241,0.96)] px-5 py-4">
              <p className="text-[12px] text-[hsl(214,16%,52%)]">
                {orderedSettingsModules.length} / {settingsModules.length} komponenti redzami
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="inline-flex items-center rounded-[10px] border border-[rgba(220,228,236,0.96)] bg-white px-4 py-2 text-[13px] font-medium text-[hsl(220,24%,34%)] transition hover:bg-[hsl(214,22%,98%)]"
                >
                  Atcelt
                </button>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="inline-flex items-center rounded-[10px] bg-[hsl(220,36%,18%)] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[hsl(220,32%,14%)]"
                >
                  Saglabāt izkārtojumu
                </button>
              </div>
            </div>
          </div>
        </CenteredOverlay>
      )}
    </aside>
  );
}
