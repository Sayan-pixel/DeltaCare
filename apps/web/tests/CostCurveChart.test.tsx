import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import * as api from "../src/services/api";
import { CostCurveChart } from "../src/components/CostCurveChart";
import { INITIAL_PROFILE } from "../src/lib/profile";
import { QuoteResponse } from "../src/types/quote";

const makeQuote = (monthly: number): QuoteResponse => ({
  predicted_annual: monthly * 12,
  predicted_monthly: monthly,
  confidence_margin_annual: 1645.52,
  confidence_margin_monthly: 137.13,
  range_annual: [Math.max(1000, monthly * 12 - 1645.52), monthly * 12 + 1645.52],
  range_monthly: [Math.max(83, monthly - 137.13), monthly + 137.13],
  currency: "USD",
});

describe("CostCurveChart Component", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stays idle until user clicks Generate curve, then renders SVG chart", async () => {
    const spy = vi.spyOn(api, "calculateQuote").mockImplementation(async (req) => {
      return makeQuote(req.smoker === "yes" ? 1500 + req.bmi * 20 : 300 + req.bmi * 5);
    });

    render(<CostCurveChart profile={INITIAL_PROFILE} currentMonthly={432.5} />);

    // Zero eager API calls before user clicks Generate curve
    expect(spy).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Generate curve/i }));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(spy).toHaveBeenCalledTimes(8);
    expect(
      screen.getByRole("img", { name: /Monthly premium curve across Body Mass Index/i })
    ).toBeDefined();
    expect(screen.getByRole("button", { name: /Refresh curve/i })).toBeDefined();
  });
});

