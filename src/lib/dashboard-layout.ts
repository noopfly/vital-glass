import {
  isFamilyMedicineSpecialty,
  type SpecialtyId,
} from "@/lib/specialties";

export type DashboardComponentKey =
  | "patientCard"
  | "preventionCard"
  | "healthTrends"
  | "medicalImagingViewer"
  | "medicationTable"
  | "alertsCard"
  | "eventTimeline"
  | "humanBodyModel"
  | "referralHistory";

export const layoutBaseClasses: Record<DashboardComponentKey, string> = {
  patientCard: "col-span-full",
  preventionCard: "lg:col-span-1",
  healthTrends: "lg:col-span-2",
  medicalImagingViewer: "lg:col-span-1",
  medicationTable: "lg:col-span-2",
  alertsCard: "lg:col-span-1",
  eventTimeline: "lg:col-span-2",
  humanBodyModel: "lg:col-span-1",
  referralHistory: "lg:col-span-1",
};

export const dashboardGridColumnSpans: Record<DashboardComponentKey, number> = {
  patientCard: 3,
  preventionCard: 1,
  healthTrends: 2,
  medicalImagingViewer: 1,
  medicationTable: 2,
  alertsCard: 1,
  eventTimeline: 2,
  humanBodyModel: 1,
  referralHistory: 1,
};

export const defaultDashboardLayoutOrder: DashboardComponentKey[] = [
  "patientCard",
  "healthTrends",
  "alertsCard",
  "medicalImagingViewer",
  "humanBodyModel",
  "medicationTable",
  "referralHistory",
  "eventTimeline",
];

export const familyMedicineDashboardLayoutOrder: DashboardComponentKey[] = [
  "patientCard",
  "preventionCard",
  "medicationTable",
  "healthTrends",
  "alertsCard",
  "medicalImagingViewer",
  "humanBodyModel",
  "referralHistory",
  "eventTimeline",
];

const validDashboardComponentKeys = new Set<DashboardComponentKey>([
  ...familyMedicineDashboardLayoutOrder,
]);

export const dashboardLayoutStorageKey = "omnis-dashboard-layout";

export function normalizeDashboardLayoutOrder(
  layoutOrder?: readonly string[],
): DashboardComponentKey[] {
  const orderedKeys = (layoutOrder ?? []).filter((key): key is DashboardComponentKey =>
    validDashboardComponentKeys.has(key as DashboardComponentKey),
  );

  return [...new Set<DashboardComponentKey>([...orderedKeys, ...defaultDashboardLayoutOrder])];
}

export function filterDashboardLayoutOrderBySpecialty(
  layoutOrder: readonly DashboardComponentKey[],
  specialtyId: SpecialtyId | null | undefined,
) {
  if (isFamilyMedicineSpecialty(specialtyId)) {
    return [...layoutOrder];
  }

  return layoutOrder.filter((key) => key !== "preventionCard");
}

export function getDefaultDashboardLayoutOrderForSpecialty(
  specialtyId: SpecialtyId | null | undefined,
) {
  return isFamilyMedicineSpecialty(specialtyId)
    ? [...familyMedicineDashboardLayoutOrder]
    : [...defaultDashboardLayoutOrder];
}

export function getDashboardLayoutClasses(
  visibleKeys: readonly DashboardComponentKey[],
): Record<DashboardComponentKey, string> {
  const classes = { ...layoutBaseClasses };

  let occupiedColumns = 0;

  for (let index = 0; index < visibleKeys.length; index += 1) {
    const key = visibleKeys[index];
    const columnSpan = dashboardGridColumnSpans[key];

    if (occupiedColumns + columnSpan > 3) {
      occupiedColumns = 0;
    }

    if (key === "eventTimeline") {
      const nextKey = visibleKeys[index + 1];
      const nextColumnSpan = nextKey ? dashboardGridColumnSpans[nextKey] : undefined;

      if (!nextKey) {
        classes.eventTimeline = "lg:col-span-3";
      } else if (
        nextColumnSpan !== undefined &&
        occupiedColumns + dashboardGridColumnSpans.eventTimeline + nextColumnSpan <= 3
      ) {
        classes.eventTimeline = "lg:col-span-2";
      } else {
        classes.eventTimeline = "lg:col-span-3";
      }
    }

    occupiedColumns += columnSpan;
  }

  return classes;
}

export function readStoredDashboardLayoutOrder(): DashboardComponentKey[] {
  if (typeof window === "undefined") {
    return defaultDashboardLayoutOrder;
  }

  try {
    const rawValue = window.localStorage.getItem(dashboardLayoutStorageKey);

    if (!rawValue) {
      return defaultDashboardLayoutOrder;
    }

    const parsed = JSON.parse(rawValue);
    return normalizeDashboardLayoutOrder(Array.isArray(parsed) ? parsed : undefined);
  } catch {
    return defaultDashboardLayoutOrder;
  }
}

export function writeStoredDashboardLayoutOrder(
  layoutOrder: readonly DashboardComponentKey[],
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    dashboardLayoutStorageKey,
    JSON.stringify(normalizeDashboardLayoutOrder(layoutOrder)),
  );
}
