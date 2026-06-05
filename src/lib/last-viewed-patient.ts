import { type Patient } from "@/types/patient";

const lastViewedPatientStorageKey = "omnis-last-viewed-patient-id";

export function readStoredLastViewedPatientId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(lastViewedPatientStorageKey);
}

export function readStoredLastViewedPatient(
  allPatients: readonly Patient[],
): Patient | null {
  const patientId = readStoredLastViewedPatientId();

  if (!patientId) {
    return null;
  }

  return allPatients.find((patient) => patient.id === patientId) ?? null;
}

export function writeStoredLastViewedPatientId(patientId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(lastViewedPatientStorageKey, patientId);
}
