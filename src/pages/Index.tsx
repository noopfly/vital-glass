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
import { Patient } from "@/types/patient";

type DashboardLocationState = {
  patient?: Patient;
  layoutOrder?: DashboardComponentKey[];
  specialtyId?: SpecialtyId;
};

const dashboardCardHeight = "min-h-[420px]";

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
    if (keys.length !== 1 || keys[0] !== "eventTimeline") continue;
    if (rowStartColumn.get("eventTimeline") !== 0) continue;

    nextClasses.eventTimeline = `lg:col-span-3 ${dashboardCardHeight}`;
    break;
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
  <span className="mx-2.5 text-[hsl(220,9%,72%)]">|</span>
);

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeState = location.state as DashboardLocationState | undefined;
  const patient = routeState?.patient;
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
    const onScroll = () => setIsScrolled(window.scrollY > 32);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (!patient) {
      navigate("/", { replace: true });
    }
  }, [navigate, patient]);

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
        <header className="sticky top-0 z-40 border-b border-[hsl(214,22%,88%)] bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-4 md:px-6">
            <div className="min-w-0">
              <h1
                className={`font-bold tracking-[-0.03em] text-heading transition-all ${
                  isScrolled ? "text-[24px]" : "text-[42px]"
                }`}
              >
                {patient.name}
              </h1>

              {!isScrolled && (
                <div className="mt-3 flex flex-wrap items-center text-[14px]">
                  <span className="font-normal text-muted-foreground">
                    Personas kods
                  </span>

                  <span className="ml-1 font-semibold text-text-dark">
                    {patient.personalCode}
                  </span>

                  <InfoDivider />

                  <span className="font-normal text-muted-foreground">Vecums</span>

                  <span className="ml-1 font-semibold text-text-dark">
                    {patient.age} gadi
                  </span>

                  {phone && (
                    <>
                      <InfoDivider />

                      <Phone className="ml-1 h-3.5 w-3.5 text-muted-foreground" />

                      <span className="ml-1 font-normal text-muted-foreground">
                        Telefona nr.
                      </span>

                      <span className="ml-1 font-semibold text-text-dark">
                        {phone}
                      </span>
                    </>
                  )}

                  {email && (
                    <>
                      <InfoDivider />

                      <Mail className="ml-1 h-3.5 w-3.5 text-muted-foreground" />

                      <span className="ml-1 font-normal text-muted-foreground">
                        E-pasts
                      </span>

                      <span className="ml-1 font-semibold text-text-dark">
                        {email}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => !isRefreshing && setIsRefreshing(true)}
              className={`flex items-center gap-2.5 text-left transition-all ${
                isScrolled
                  ? ""
                  : "rounded-[6px] border border-[rgba(220,228,236,0.96)] bg-white px-3 py-3 shadow-[0_8px_18px_rgba(29,53,87,0.05)]"
              }`}
            >
              <div
                className="relative flex h-10 w-10 items-center justify-center rounded-[5px] text-heading"
                aria-hidden="true"
              >
                <RefreshCw
                  className={isRefreshing ? "animate-spin" : ""}
                  size={18}
                />
              </div>

              {!isScrolled && (
                <div>
                  <div className="text-sm font-semibold text-heading">
                    {isRefreshing ? "Notiek atjaunošana..." : "Atjaunot datus"}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Pēdējo reizi: {formatRefreshTime(lastRefreshedAt)}
                  </div>
                </div>
              )}
            </button>
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
