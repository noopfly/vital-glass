import * as React from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Columns2,
  Info,
  LayoutGrid,
  Plus,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { CenteredOverlay } from "@/components/ui/centered-overlay";
import { cn } from "@/lib/utils";
import { Patient } from "@/types/patient";

type DashboardSidebarProps = {
  activePatient: Patient;
  recentPatients: Patient[];
  currentView: "dashboard" | "day-list" | "search";
  dayListCount?: number;
};

const storageKey = "omnis-sidebar-collapsed";
const expandedSidebarWidth = "280px";
const collapsedSidebarWidth = "56px";

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

export default function DashboardSidebar({
  activePatient,
  recentPatients,
  currentView,
  dayListCount = 0,
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const footerRef = React.useRef<HTMLDivElement | null>(null);
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(storageKey) === "true";
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = React.useState(false);
  const [supportMessage, setSupportMessage] = React.useState("");

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
      navigate("/settings", { state: { patient: activePatient } });
    }
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
                  navigate("/components", { state: { patient: activePatient } })
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,hsl(219,36%,18%),hsl(218,34%,24%))] text-white shadow-[0_8px_20px_rgba(29,53,87,0.18)]"
                aria-label="Atvērt sākuma paneli"
              >
                <LayoutGrid className="h-4 w-4" />
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
            state={{ patient: activePatient }}
            className={cn(
              "flex w-full items-center rounded-[12px] px-3 py-3 text-left transition",
              currentView === "search"
                ? "bg-[linear-gradient(180deg,hsl(220,36%,16%),hsl(218,34%,22%))] text-white shadow-[0_8px_20px_rgba(29,53,87,0.16)]"
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
            state={{ patient: activePatient }}
            className={cn(
              "mt-3 flex w-full items-center rounded-[12px] px-3 py-3 text-left transition",
              currentView === "day-list"
                ? "bg-[linear-gradient(180deg,hsl(220,36%,16%),hsl(218,34%,22%))] text-white shadow-[0_8px_20px_rgba(29,53,87,0.16)]"
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

            <div className="mt-4 space-y-3">
              {recentPatients.slice(0, 3).map((patient) => (
                <Link
                  key={patient.id}
                  to="/components"
                  state={{ patient }}
                  className="block w-full text-left"
                >
                  <p className="truncate text-[15px] font-semibold leading-5">
                    {patient.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[hsl(214,16%,62%)]">
                    {patient.personalCode}
                  </p>
                </Link>
              ))}
            </div>

            <button className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium">
              Visi pacienti
              <ArrowRight className="h-3.5 w-3.5" />
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(180deg,hsl(220,38%,22%),hsl(217,40%,30%))] text-[11px] font-semibold text-white">
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
          contentClassName="max-w-[820px]"
        >
          <div className="mx-auto overflow-hidden rounded-[18px] border border-[rgba(220,228,236,0.96)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
            <div className="flex items-start justify-between border-b border-[rgba(230,235,241,0.96)] px-10 py-8">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[hsl(214,18%,62%)]">
                  Atbalsts
                </p>
                <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-[hsl(220,36%,18%)]">
                  Sazināties ar komandu
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(220,228,236,0.96)] bg-white text-[hsl(220,24%,22%)] transition hover:bg-[hsl(214,22%,98%)]"
                aria-label="Aizvērt atbalsta logu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-10 py-10">
              <p className="max-w-[620px] text-[18px] leading-10 text-[hsl(220,20%,34%)]">
                Aprakstiet problēmu vai jautājumu. Mēs atbildēsim uz jūsu
                reģistrēto e-pasta adresi.
              </p>

              <textarea
                value={supportMessage}
                onChange={(event) => setSupportMessage(event.target.value)}
                placeholder="Jūsu ziņa..."
                className="mt-8 min-h-[230px] w-full resize-none rounded-[10px] border border-[rgba(220,228,236,0.96)] bg-white px-6 py-5 text-[18px] text-[hsl(220,24%,22%)] outline-none transition placeholder:text-[hsl(214,16%,68%)] focus:border-[hsl(214,28%,76%)]"
              />

              <div className="mt-7 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(false)}
                  className="inline-flex items-center rounded-[10px] border border-[rgba(220,228,236,0.96)] bg-white px-8 py-3 text-[18px] font-medium text-[hsl(220,24%,34%)] transition hover:bg-[hsl(214,22%,98%)]"
                >
                  Atcelt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsHelpOpen(false);
                    setSupportMessage("");
                  }}
                  className="inline-flex items-center rounded-[10px] bg-[hsl(220,36%,18%)] px-8 py-3 text-[18px] font-medium text-white transition hover:bg-[hsl(220,32%,14%)]"
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
          contentClassName="max-w-[820px]"
        >
          <div className="mx-auto overflow-hidden rounded-[18px] border border-[rgba(220,228,236,0.96)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
            <div className="flex items-start justify-between border-b border-[rgba(230,235,241,0.96)] px-10 py-8">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[hsl(214,18%,62%)]">
                  Resursi
                </p>
                <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-[hsl(220,36%,18%)]">
                  Uzzināt vairāk
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsResourcesOpen(false)}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(220,228,236,0.96)] bg-white text-[hsl(220,24%,22%)] transition hover:bg-[hsl(214,22%,98%)]"
                aria-label="Aizvērt resursu logu"
              >
                <X className="h-6 w-6" />
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
                    "flex w-full items-center justify-between gap-5 px-10 py-8 text-left transition hover:bg-[hsl(214,22%,98%)]",
                    index !== 2 &&
                      "border-b border-[rgba(230,235,241,0.96)]",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-[20px] font-semibold leading-7 text-[hsl(220,36%,18%)]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[17px] leading-7 text-[hsl(214,16%,50%)]">
                      {item.description}
                    </p>
                  </div>

                  <span className="inline-flex shrink-0 items-center rounded-[8px] border border-[rgba(220,228,236,0.96)] bg-white px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(214,18%,62%)]">
                    {item.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CenteredOverlay>
      )}
    </aside>
  );
}
