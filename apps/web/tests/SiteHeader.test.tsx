import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import * as api from "../src/services/api";
import { SiteHeader } from "../src/components/SiteHeader";

describe("SiteHeader Component", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("displays Engine ready when health endpoint reports healthy loaded model", async () => {
    vi.spyOn(api, "checkHealth").mockResolvedValue({
      status: "healthy",
      version: "1.0.0",
      model_loaded: true,
    });

    render(<SiteHeader />);
    expect(screen.getByText(/Checking engine/i)).toBeDefined();

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText(/Engine ready/i)).toBeDefined();
  });

  it("displays Engine standby when health probe fails", async () => {
    vi.spyOn(api, "checkHealth").mockRejectedValue(new Error("Network error"));

    render(<SiteHeader />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText(/Engine standby/i)).toBeDefined();
  });
});

