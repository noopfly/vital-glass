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
  ...defaultDashboardLayoutOrder,
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
