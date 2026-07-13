import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ReferralHistory from "./ReferralHistory";

describe("ReferralHistory", () => {
  it("uses the medication status-chip style", () => {
    render(<ReferralHistory />);

    expect(screen.getByText("Aktīvs")).toHaveClass(
      "text-[10px]",
      "font-semibold",
      "border-[hsl(152,34%,78%)]",
      "bg-[hsl(152,42%,97%)]",
    );
  });

  it("keeps the dashboard list compact and the expanded list unboxed", () => {
    render(<ReferralHistory />);

    const dashboardReferral = screen
      .getAllByRole("button")
      .find((button) => button.textContent?.includes("kardiologa"));

    expect(dashboardReferral?.parentElement).toHaveClass("clinical-list");

    const openAll = screen
      .getAllByRole("button")
      .find((button) => button.textContent?.includes("2 nos"));

    expect(openAll).toBeTruthy();
    fireEvent.click(openAll!);

    const expandedDialog = screen.getByRole("dialog");

    expect(expandedDialog.querySelector(".clinical-list")).toBeNull();
    expect(expandedDialog.querySelector(".divide-y")).toHaveClass("bg-white");
  });

  it("renders the referral timeline when a referral is opened", () => {
    render(<ReferralHistory />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /e-nosūtījums uz kardiologa konsultāciju/i,
      }),
    );

    expect(screen.getByText("Notikumu vēsture")).toBeTruthy();
  });

  it("uses the clinical detail hierarchy for referral facts and history", () => {
    render(<ReferralHistory />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /e-nosūtījums uz kardiologa konsultāciju/i,
      }),
    );

    const facts = screen.getByText("Statuss").parentElement?.parentElement;
    const timeline = screen.getByText("Notikumu vēsture").nextElementSibling;

    expect(
      screen.getByRole("heading", { name: /kardiologa konsult/i }),
    ).toBeTruthy();
    expect(facts).toHaveClass("grid");
    expect(facts).toHaveClass("border-b");
    expect(timeline).toHaveClass("mt-4");
    expect(timeline).not.toHaveClass("divide-y");
    expect(timeline).not.toHaveClass("border-t");
    expect(screen.queryByText("Nosūtījums ir izveidots.")).toBeNull();
  });

  it("outlines only the newest timeline status", () => {
    render(<ReferralHistory />);

    const openAll = screen
      .getAllByRole("button")
      .find((button) => button.textContent?.includes("2 nosūtījumi"));
    fireEvent.click(openAll!);

    const expandedDialog = screen.getByRole("dialog");
    fireEvent.click(
      within(expandedDialog).getByRole("button", {
        name: /nosūtījums uz rentgenu pēc traumas izvērtēšanas/i,
      }),
    );

    const markers = document.querySelectorAll("[data-timeline-marker]");

    expect(markers).toHaveLength(3);
    expect(markers[0]).toHaveClass("ring-4");
    expect(markers[0]).toHaveAttribute("data-current", "true");
    expect(markers[1]).not.toHaveClass("ring-4");
    expect(markers[2]).not.toHaveClass("ring-4");
  });
});
