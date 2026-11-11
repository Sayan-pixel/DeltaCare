import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import * as api from "../src/services/api";
import { SensitivityExplorer } from "../src/components/SensitivityExplorer";
import { INITIAL_PROFILE, profileKey } from "../src/lib/profile";
import { QuoteResponse } from "../src/types/quote";

const SCENARIO_QUOTE: QuoteResponse = {
  predicted_annual: 3900,
  predicted_monthly: 325,
  confidence_margin_annual: 1645.52,
  confidence_margin_monthly: 137.13,
  range_annual: [2254.48, 5545.52],
  range_monthly: [187.87, 462.13],
  currency: "USD",
};

describe("SensitivityExplorer Component", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("supports previewing and pinning sensitivity scenarios", async () => {
    vi.useFakeTimers();
    vi.spyOn(api, "calculateQuote").mockResolvedValue(SCENARIO_QUOTE);

    const onPreview = vi.fn();
    const onPinScenario = vi.fn();

    render(
      <SensitivityExplorer
        profile={INITIAL_PROFILE}
        currentMonthly={362.5}
        pinnedKeys={[profileKey({ ...INITIAL_PROFILE, age: 45 })]}
        canPinMore={true}
        onPreview={onPreview}
        onPinScenario={onPinScenario}
      />
    );

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
      await Promise.resolve();
    });

    const previewButtons = screen.getAllByRole("button", { name: /Preview/i });
    expect(previewButtons.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(previewButtons[0]);
    expect(onPreview).toHaveBeenCalledTimes(1);

    const unpinButton = screen.getByRole("button", { name: /^Unpin$/i });
    expect(unpinButton.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(unpinButton);
    expect(onPinScenario).toHaveBeenCalledTimes(1);
  });
});

