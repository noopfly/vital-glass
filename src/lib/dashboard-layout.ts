export type DashboardComponentKey =
  | "patientCard"
  | "healthTrends"
  | "medicalImagingViewer"
  | "medicationTable"
  | "alertsCard"
  | "eventTimeline"
  | "humanBodyModel"
  | "referralHistory"
  | "patientSummaryCard";

export const defaultDashboardLayoutOrder: DashboardComponentKey[] = [
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

export const dashboardLayoutStorageKey = "omnis-dashboard-layout";

export function normalizeDashboardLayoutOrder(
  layoutOrder?: readonly string[],
): DashboardComponentKey[] {
  const validKeys = new Set<DashboardComponentKey>(defaultDashboardLayoutOrder);
  const orderedKeys = (layoutOrder ?? []).filter((key): key is DashboardComponentKey =>
    validKeys.has(key as DashboardComponentKey),
  );

  return [...new Set<DashboardComponentKey>([...orderedKeys, ...defaultDashboardLayoutOrder])];
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
