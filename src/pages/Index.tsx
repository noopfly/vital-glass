import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, Phone, RefreshCw } from "lucide-react";

import AlertsCard from "@/components/AlertsCard";
import DashboardSidebar from "@/components/DashboardSidebar";
import EventTimelineHorizontal from "@/components/EventTimelineHorizontal";
import HealthTrends from "@/components/HealthTrends";
import HumanBodyModel from "@/components/HumanBodyModel";
import MedicalImagingViewer from "@/components/MedicalImagingViewer";
import MedicationTable from "@/components/MedicationTable";
import PatientCard from "@/components/PatientCard";
import PreventionCard from "@/components/PreventionCard";
import ReferralHistory from "@/components/ReferralHistory";
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
  medicationTable: dashboardCardHeight,
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
  medicationTable: 1,
  alertsCard: 1,
  eventTimeline: 2,
  humanBodyModel: 1,
  referralHistory: 1,
};

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
    if (
      keys.length === 2 &&
      keys[0] === "medicationTable" &&
      rowStartColumn.get("medicationTable") === 0
    ) {
      nextClasses.medicationTable = `lg:col-span-2 ${dashboardCardHeight}`;
    }

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

const InfoDivider = () => (
  <span className="mx-2.5 text-[hsl(220,16%,80%)] md:mx-3">|</span>
);

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

  const visibleItems = order
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
                        Pēdējo reizi: {formatRefreshTime(lastRefreshedAt)}
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
                className={`relative min-w-0 ${resolvedLayoutClasses[item.key]}`}
              >
                <div className="h-full">{item.element}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
