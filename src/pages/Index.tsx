import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GripVertical, Mail, Phone, RefreshCw } from "lucide-react";

import AlertsCard from "@/components/AlertsCard";
import DashboardSidebar from "@/components/DashboardSidebar";
import EventTimelineHorizontal from "@/components/EventTimelineHorizontal";
import HealthTrends from "@/components/HealthTrends";
import HumanBodyModel from "@/components/HumanBodyModel";
import MedicalImagingViewer from "@/components/MedicalImagingViewer";
import MedicationTable from "@/components/MedicationTable";
import PatientCard from "@/components/PatientCard";
import PatientSummaryCard from "@/components/PatientSummaryCard";
import ReferralHistory from "@/components/ReferralHistory";
import { patients } from "@/data/patients";
import {
  defaultDashboardLayoutOrder,
  normalizeDashboardLayoutOrder,
  readStoredDashboardLayoutOrder,
  type DashboardComponentKey,
} from "@/lib/dashboard-layout";
import { Patient } from "@/types/patient";

type DashboardLocationState = {
  patient?: Patient;
  layoutOrder?: DashboardComponentKey[];
};

const layoutClasses: Record<DashboardComponentKey, string> = {
  patientCard: "lg:col-span-3",
  healthTrends: "lg:col-span-2 lg:aspect-[2/1]",
  medicalImagingViewer: "",
  medicationTable: "",
  alertsCard: "lg:aspect-square",
  patientSummaryCard: "lg:col-span-2 lg:aspect-[2/1]",
  eventTimeline: "lg:col-span-3",
  humanBodyModel: "",
  referralHistory: "",
};

function formatRefreshTime(date: Date) {
  return new Intl.DateTimeFormat("lv-LV", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const InfoDivider = () => (
  <span className="text-[hsl(210,18%,70%)] mx-1">|</span>
);

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as DashboardLocationState | undefined;
  const patient = routeState?.patient;
  const routeLayoutOrder = React.useMemo(
    () =>
      normalizeDashboardLayoutOrder(
        routeState?.layoutOrder ?? readStoredDashboardLayoutOrder(),
      ),
    [routeState?.layoutOrder],
  );

  const [order, setOrder] =
    React.useState<DashboardComponentKey[]>(routeLayoutOrder);
  const [draggedKey, setDraggedKey] =
    React.useState<DashboardComponentKey | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = React.useState(new Date());
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const recentPatients = React.useMemo(() => {
    if (!patient) {
      return patients;
    }

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
    const t = setTimeout(() => {
      setLastRefreshedAt(new Date());
      setIsRefreshing(false);
    }, 1200);
    return () => clearTimeout(t);
  }, [isRefreshing]);

  if (!patient) return null;

  const phone =
    "phone" in patient
      ? patient.phone
      : "";

  const email = "email" in patient ? patient.email : "";

  const componentItems = [
    { key: "patientCard" as const, element: <PatientCard patient={patient} /> },
    { key: "healthTrends" as const, element: <HealthTrends /> },
    { key: "medicalImagingViewer" as const, element: <MedicalImagingViewer /> },
    { key: "medicationTable" as const, element: <MedicationTable /> },
    { key: "alertsCard" as const, element: <AlertsCard /> },
    { key: "eventTimeline" as const, element: <EventTimelineHorizontal /> },
    { key: "humanBodyModel" as const, element: <HumanBodyModel /> },
    { key: "referralHistory" as const, element: <ReferralHistory /> },
  ];

  const visibleItems = order
    .map((key) => componentItems.find((i) => i.key === key))
    .filter(Boolean) as typeof componentItems;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <DashboardSidebar
        activePatient={patient}
        recentPatients={recentPatients}
        allPatients={patients}
        currentView="dashboard"
        dayListCount={patients.length}
        layoutOrder={order}
        onSaveLayoutOrder={setOrder}
      />

      <div className="transition-[padding-left] duration-300 lg:pl-[var(--dashboard-sidebar-width,280px)]">
        {/* HEADER */}
        <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-4 md:px-6">
            
            {/* LEFT */}
            <div className="min-w-0">
              <h1
                className={`font-bold text-[hsl(214,42%,17%)] transition-all ${
                  isScrolled ? "text-[24px]" : "text-[42px]"
                }`}
              >
                {patient.name}
              </h1>

              {!isScrolled && (
                <div className="mt-3 flex flex-wrap items-center text-[14px]">

                  <span className="text-[hsl(214,18%,55%)]">Personas kods</span>
                  <span className="ml-1 font-semibold text-[hsl(214,36%,24%)]">
                    {patient.personalCode}
                  </span>

                  <InfoDivider />

                  <span className="text-[hsl(214,18%,55%)]">Vecums</span>
                  <span className="ml-1 font-semibold text-[hsl(214,36%,24%)]">
                    {patient.age} gadi
                  </span>

                  {phone && (
                    <>
                      <InfoDivider />
                      <Phone className="h-3.5 w-3.5 text-[hsl(214,18%,55%)] ml-1" />
                      <span className="text-[hsl(214,18%,55%)] ml-1">
                        Telefona nr.
                      </span>
                      <span className="ml-1 font-semibold text-[hsl(214,36%,24%)]">
                        {phone}
                      </span>
                    </>
                  )}

                  {email && (
                    <>
                      <InfoDivider />
                      <Mail className="h-3.5 w-3.5 text-[hsl(214,18%,55%)] ml-1" />
                      <span className="text-[hsl(214,18%,55%)] ml-1">
                        E-pasts
                      </span>
                      <span className="ml-1 font-semibold text-[hsl(214,36%,24%)]">
                        {email}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div
              className={`flex items-center gap-3 transition-all ${
                isScrolled
                  ? ""
                  : "rounded-[12px] border bg-[hsl(214,20%,98%)] px-4 py-3"
              }`}
            >
              <button
                onClick={() => !isRefreshing && setIsRefreshing(true)}
                className="relative flex h-10 w-10 items-center justify-center rounded-[10px] border bg-[hsl(214,22%,97%)]"
              >
                <RefreshCw
                  className={isRefreshing ? "animate-spin" : ""}
                  size={18}
                />
              </button>

              {!isScrolled && (
                <div>
                  <div className="text-sm font-semibold">
                    {isRefreshing ? "Notiek atjaunošana..." : "Atjaunot datus"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Pēdējo reizi: {formatRefreshTime(lastRefreshedAt)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* GRID */}
        <main className="px-4 py-5 md:px-6">
          <div className="mx-auto grid w-full max-w-[1280px] gap-4 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <div
                key={item.key}
                draggable
                onDragStart={() => setDraggedKey(item.key)}
                onDragEnd={() => setDraggedKey(null)}
                className={`group relative rounded-[12px] border bg-white shadow ${
                  layoutClasses[item.key]
                }`}
              >
                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100">
                  <GripVertical className="h-3 w-3" />
                </div>
                {item.element}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
