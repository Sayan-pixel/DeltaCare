import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SiteFooter } from "../src/components/SiteFooter";

describe("SiteFooter Component", () => {
  it("opens and closes the MIT License dialog when MIT License is clicked", () => {
    render(<SiteFooter />);

    const trigger = screen.getByRole("button", { name: /MIT License/i });
    fireEvent.click(trigger);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/Copyright \(c\) 2026 DeltaCare Contributors/)).toBeDefined();

    const closeBtn = screen.getByRole("button", { name: /Close MIT License modal/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

