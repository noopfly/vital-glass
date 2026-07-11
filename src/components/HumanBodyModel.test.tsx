import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HumanBodyModel from "./HumanBodyModel";

describe("HumanBodyModel", () => {
  it("stretches to the full available width like other dashboard cards", () => {
    const { container } = render(<HumanBodyModel />);

    expect(container.firstElementChild).toHaveClass("w-full");
  });

  it("shows the instruction text in the info popover and not as a permanent footer note", () => {
    render(<HumanBodyModel />);

    expect(
      screen.queryByText(/Nospiediet uz orgāna vai diagnozes, lai skatītu detalizētu informāciju/i),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /informācija par ķermeņa pārskatu/i }),
    );

    expect(
      screen.getByText(/Nospiediet uz orgāna vai diagnozes, lai skatītu detalizētu informāciju par atradnēm/i),
    ).toBeInTheDocument();
  });
});
