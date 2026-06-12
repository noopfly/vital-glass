import { describe, expect, it } from "vitest";

import {
  familyMedicineDashboardLayoutOrder,
  getDefaultDashboardLayoutOrderForSpecialty,
  normalizeDashboardLayoutOrder,
} from "@/lib/dashboard-layout";

describe("dashboard layout presets", () => {
  it("keeps the family medicine patient card only once", () => {
    expect(familyMedicineDashboardLayoutOrder).toEqual([
      "patientCard",
      "preventionCard",
      "healthTrends",
      "alertsCard",
      "medicalImagingViewer",
      "humanBodyModel",
      "medicationTable",
      "referralHistory",
      "eventTimeline",
    ]);
    expect(new Set(familyMedicineDashboardLayoutOrder).size).toBe(
      familyMedicineDashboardLayoutOrder.length,
    );
  });

  it("returns a deduplicated family medicine default order", () => {
    const layoutOrder = getDefaultDashboardLayoutOrderForSpecialty(
      "family-medicine",
    );

    expect(new Set(layoutOrder).size).toBe(layoutOrder.length);
    expect(layoutOrder[0]).toBe("patientCard");
    expect(layoutOrder[1]).toBe("preventionCard");
  });

  it("normalizes repeated layout keys down to one entry", () => {
    expect(
      normalizeDashboardLayoutOrder([
        "patientCard",
        "preventionCard",
        "patientCard",
      ]),
    ).toEqual([
      "patientCard",
      "preventionCard",
      "healthTrends",
      "alertsCard",
      "medicalImagingViewer",
      "humanBodyModel",
      "medicationTable",
      "referralHistory",
      "eventTimeline",
    ]);
  });
});
