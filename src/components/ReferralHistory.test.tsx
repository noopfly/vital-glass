import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ReferralHistory from "./ReferralHistory";

describe("ReferralHistory", () => {
  it("renders the referral timeline when a referral is opened", () => {
    render(<ReferralHistory />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /e-nosūtījums uz kardiologa konsultāciju/i,
      }),
    );

    expect(screen.getByText("Notikumu vēsture")).toBeTruthy();
  });
});
