import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import MedicalImagingViewer from "./MedicalImagingViewer";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MedicalImagingViewer", () => {
  it("opens PDF documents in a new tab instead of rendering an inline preview", () => {
    const openSpy = vi.fn();
    window.open = openSpy as unknown as typeof window.open;

    render(<MedicalImagingViewer />);

    fireEvent.click(
      screen.getByRole("button", { name: /atvērt pilno slēdzienu/i }),
    );

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining(".pdf"),
      "_blank",
      "noopener,noreferrer",
    );
    expect(screen.queryByTitle(/pilns slēdziens/i)).toBeNull();
  });
});
