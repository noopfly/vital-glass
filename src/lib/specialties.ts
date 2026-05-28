export type SpecialtyId =
  | "family-medicine"
  | "cardiology"
  | "endocrinology"
  | "vascular-surgery"
  | "neurology"
  | "oncology"
  | "pulmonology"
  | "gastroenterology"
  | "dermatology"
  | "orthopedics"
  | "psychiatry"
  | "pediatrics";

const specialtyIds = new Set<SpecialtyId>([
  "family-medicine",
  "cardiology",
  "endocrinology",
  "vascular-surgery",
  "neurology",
  "oncology",
  "pulmonology",
  "gastroenterology",
  "dermatology",
  "orthopedics",
  "psychiatry",
  "pediatrics",
]);

const dashboardSpecialtyStorageKey = "omnis-dashboard-specialty";

export function isSpecialtyId(value: string): value is SpecialtyId {
  return specialtyIds.has(value as SpecialtyId);
}

export function isFamilyMedicineSpecialty(
  specialtyId: SpecialtyId | null | undefined,
) {
  return specialtyId === "family-medicine";
}

export function readStoredDashboardSpecialty(): SpecialtyId | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(dashboardSpecialtyStorageKey);
  return rawValue && isSpecialtyId(rawValue) ? rawValue : null;
}

export function writeStoredDashboardSpecialty(specialtyId: SpecialtyId) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(dashboardSpecialtyStorageKey, specialtyId);
}
