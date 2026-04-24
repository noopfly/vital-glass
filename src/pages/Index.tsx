import * as React from "react";
import { useLocation } from "react-router-dom";
import PatientCard from "@/components/PatientCard";
import HealthTrends from "@/components/HealthTrends";
import MedicationTable from "@/components/MedicationTable";
import PatientSummaryCard from "@/components/PatientSummaryCard";
import AlertsCard from "@/components/AlertsCard";
import MedicalImagingViewer from "@/components/MedicalImagingViewer";
import EventTimelineHorizontal from "@/components/EventTimelineHorizontal";
import HumanBodyModel from "@/components/HumanBodyModel";
import ReferralHistory from "@/components/ReferralHistory";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical, RefreshCw } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { patients } from "@/data/patients";
import { Patient } from "@/types/patient";

type ComponentKey = "patientCard" | "healthTrends" | "medicalImagingViewer" | "medicationTable" | "alertsCard" | "eventTimeline" | "humanBodyModel" | "referralHistory" | "patientSummaryCard";

type SelectionState = Record<ComponentKey, boolean>;

const layoutClasses: Record<ComponentKey, string> = {
  patientCard: "lg:col-span-3",
  healthTrends: "lg:col-span-2 lg:aspect-[2/1]",
  medicalImagingViewer: "lg:row-span-2",
  medicationTable: "",
  alertsCard: "lg:aspect-square",
  patientSummaryCard: "lg:col-span-3",
  eventTimeline: "lg:col-span-3",
  humanBodyModel: "lg:row-span-2",
  referralHistory: "",
};

const fillHeightKeys: ComponentKey[] = [
  "healthTrends",
  "medicalImagingViewer",
  "medicationTable",
  "alertsCard",
  "humanBodyModel",
  "referralHistory",
];

const defaultSelection: SelectionState = {
  patientCard: true,
  healthTrends: true,
  medicalImagingViewer: true,
  medicationTable: true,
  alertsCard: true,
  patientSummaryCard: true,
  eventTimeline: true,
  humanBodyModel: true,
  referralHistory: true,
};

const defaultOrder: ComponentKey[] = [
  "patientCard",
  "healthTrends",
  "alertsCard",
  "medicalImagingViewer",
  "humanBodyModel",
  "medicationTable",
  "referralHistory",
  "eventTimeline",
  "patientSummaryCard",
];

function formatRefreshTime(date: Date) {
  return new Intl.DateTimeFormat("lv-LV", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const sectionIconClass =
  "flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsla(210,62%,82%,0.42)] bg-[radial-gradient(circle_at_top,hsla(0,100%,100%,0.98),hsla(210,92%,96%,0.96)_48%,hsla(210,78%,92%,0.88))] text-[hsl(210,60%,45%)] shadow-[0_0_0_1px_hsla(0,100%,100%,0.22),0_12px_30px_hsla(210,80%,76%,0.18)]";

const Index = () => {
  const location = useLocation();
  const patient = (location.state?.patient as Patient | undefined) ?? patients[0];

  const [selection, setSelection] = React.useState<SelectionState>(defaultSelection);
  const [order, setOrder] = React.useState<ComponentKey[]>(defaultOrder);
  const [draggedKey, setDraggedKey] = React.useState<ComponentKey | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = React.useState(() => new Date());
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const componentItems = React.useMemo(() => [
    { key: "patientCard" as const, label: "Patient Card", element: <PatientCard patient={patient} /> },
    { key: "healthTrends" as const, label: "Health Trends", element: <HealthTrends /> },
    { key: "medicalImagingViewer" as const, label: "Medical Imaging Viewer", element: <MedicalImagingViewer /> },
    { key: "medicationTable" as const, label: "Medication Table", element: <MedicationTable /> },
    { key: "alertsCard" as const, label: "Alerts Card", element: <AlertsCard /> },
    { key: "eventTimeline" as const, label: "Event Timeline", element: <EventTimelineHorizontal /> },
    { key: "humanBodyModel" as const, label: "Human Body Model", element: <HumanBodyModel /> },
    { key: "referralHistory" as const, label: "Referral History", element: <ReferralHistory /> },
    { key: "patientSummaryCard" as const, label: "Patient Summary", element: (
        <PatientSummaryCard
          summary={patient.summary}
          updatedAt={patient.updatedAt}
        />
      ) },
  ], [patient]);

  const selectedCount = Object.values(selection).filter(Boolean).length;

  React.useEffect(() => {
    setSelection(defaultSelection);
    setOrder(defaultOrder);
    setDraggedKey(null);
    setLastRefreshedAt(new Date());
    setIsRefreshing(false);
  }, [patient.id]);

  React.useEffect(() => {
    if (!isRefreshing) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setLastRefreshedAt(new Date());
      setIsRefreshing(false);
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [isRefreshing]);

  const toggleSelection = (key: ComponentKey, value: boolean) => {
    setSelection((prev) => ({ ...prev, [key]: value }));
  };

  const setAll = (checked: boolean) => {
    setSelection((prev) => {
      const nextState: SelectionState = { ...prev };
      componentItems.forEach((item) => {
        nextState[item.key] = checked;
      });
      return nextState;
    });
  };

  const moveDraggedKey = React.useCallback(
    (targetIndex: number) => {
      if (!draggedKey) {
        return;
      }

      setOrder((currentOrder) => {
        const nextOrder = [...currentOrder];
        const fromIndex = nextOrder.indexOf(draggedKey);

        if (fromIndex === -1) {
          return nextOrder;
        }

        const boundedIndex = Math.max(0, Math.min(targetIndex, nextOrder.length - 1));

        if (fromIndex === boundedIndex) {
          return nextOrder;
        }

        nextOrder.splice(fromIndex, 1);
        nextOrder.splice(boundedIndex, 0, draggedKey);
        return nextOrder;
      });
    },
    [draggedKey],
  );

  const visibleItems = React.useMemo(
    () =>
      order
        .map((key) => componentItems.find((item) => item.key === key))
        .filter((item): item is (typeof componentItems)[number] => Boolean(item) && selection[item.key]),
    [componentItems, order, selection],
  );

  return (
    <SidebarProvider className="min-h-screen">
      <Sidebar collapsible="icon" className="bg-sidebar text-sidebar-foreground">
        <div className="group-data-[collapsible=icon]:hidden">
          <SidebarContent>
            <SidebarHeader>
              <div className="flex items-center justify-between gap-2">
                <SidebarTrigger />
              </div>
            </SidebarHeader>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupLabel>{`Controls (${selectedCount}/${componentItems.length})`}</SidebarGroupLabel>
              <div className="space-y-3 px-2 pb-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button size="sm" variant="secondary" onClick={() => setAll(true)}>
                    Select all
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setAll(false)}>
                    Deselect all
                  </Button>
                </div>

                <div className="space-y-2">
                  {componentItems.map((item) => (
                    <label
                      key={item.key}
                      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/80 px-3 py-3 text-sm transition hover:border-primary hover:bg-primary/5"
                    >
                      <Checkbox
                        checked={selection[item.key]}
                        onCheckedChange={(checked) => toggleSelection(item.key, checked === true)}
                      />
                      <span className="font-medium text-sidebar-foreground">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </SidebarGroup>
          </SidebarContent>
        </div>

        <div className="hidden items-center justify-center p-2 group-data-[collapsible=icon]:flex">
          <SidebarTrigger />
        </div>
      </Sidebar>

      <SidebarInset className="overflow-y-auto bg-[#F5F7FA]">
  <div className="mx-auto flex min-h-screen w-full max-w-[1320px] flex-col gap-5 px-5 py-5 md:px-8 lg:px-10 xl:px-12">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[hsl(214,20%,58%)]">
          Pacienta panelis
        </p>
        <p className="mt-1 text-[14px] text-[hsl(214,18%,52%)]">
          Pārskats par pacienta veselības datiem un nesenajām izmaiņām
        </p>
      </div>

<div className="flex items-center gap-2 rounded-[16px] border border-[hsl(210,22%,88%)] bg-[linear-gradient(180deg,hsla(0,0%,100%,0.85),hsla(210,35%,97%,0.9))] px-3 py-2 shadow-[0_6px_18px_hsla(210,30%,70%,0.08)]">        <button
          type="button"
          onClick={() => {
            if (!isRefreshing) {
              setIsRefreshing(true);
            }
          }}
          disabled={isRefreshing}
className={`${sectionIconClass} group relative shrink-0 transition-all duration-200 hover:-translate-y-[1px] disabled:cursor-default disabled:opacity-80`}          aria-label="Atjaunot datus"
        >
          <RefreshCw
            size={18}
            strokeWidth={1.9}
            className={
              isRefreshing
                ? "animate-spin"
                : "transition-transform duration-200 group-hover:rotate-90"
            }
          />

          {isRefreshing && (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border border-white bg-[hsl(168,68%,45%)] shadow-[0_0_0_4px_hsla(168,68%,45%,0.14)]" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold tracking-[-0.01em] text-[hsl(210,68%,42%)]">
              {isRefreshing ? "Notiek atjaunošana..." : "Atjaunot datus"}
            </p>
            {!isRefreshing && (
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(168,68%,45%)] opacity-80" />
            )}
          </div>

          <p className="text-[12px] text-[hsl(214,18%,58%)]">
            Pēdējo reizi atjaunots: šodien {formatRefreshTime(lastRefreshedAt)}
          </p>
        </div>
      </div>
    </div>

    <div
      className="grid gap-4 lg:grid-cols-3 lg:grid-flow-dense"
      onDragOver={(event) => {
        event.preventDefault();

        if (!draggedKey) {
          return;
        }

        const target = event.target as HTMLElement;
        const hoveredItem = target.closest("[data-grid-item='true']");

        if (!hoveredItem) {
          moveDraggedKey(order.length - 1);
        }
      }}
    >
      {visibleItems.map((item) => (
        <div
          key={item.key}
          data-grid-item="true"
          draggable
          onDragStart={() => setDraggedKey(item.key)}
          onDragEnd={() => setDraggedKey(null)}
          onDragOver={(event) => {
            event.preventDefault();
            if (!draggedKey || draggedKey === item.key) {
              return;
            }

            const toIndex = order.indexOf(item.key);
            if (toIndex !== -1) {
              moveDraggedKey(toIndex);
            }
          }}
          className={
            "group relative h-full w-full self-stretch overflow-hidden rounded-[22px] border border-[#dfe4eb] bg-white/70 shadow-[0_6px_20px_hsla(210,25%,82%,0.08)] transition-opacity " +
            layoutClasses[item.key] +
            " " +
            (fillHeightKeys.includes(item.key) ? "[&>*]:h-full " : "") +
            (draggedKey === item.key ? "opacity-80" : "")
          }
        >
          <div className="absolute right-3 top-3 z-10 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            <GripVertical className="h-3 w-3" />
          </div>
          {item.element}
        </div>
      ))}
    </div>
  </div>
</SidebarInset>
    </SidebarProvider>
  );
};

export default Index;
