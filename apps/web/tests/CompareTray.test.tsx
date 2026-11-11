import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { buildPinnedCsv, CompareTray, PinnedEstimate } from "../src/components/CompareTray";
import { INITIAL_PROFILE } from "../src/lib/profile";

const MOCK_PINNED: PinnedEstimate[] = [
  {
    id: 1,
    profile: INITIAL_PROFILE,
    quote: {
      predicted_annual: 4350,
      predicted_monthly: 362.5,
      confidence_margin_annual: 1645.52,
      confidence_margin_monthly: 137.13,
      range_annual: [2704.48, 5995.52],
      range_monthly: [225.37, 499.63],
      currency: "USD",
    },
  },
];

describe("CompareTray Component", () => {
  it("generates accurate CSV output for pinned scenarios", () => {
    const csv = buildPinnedCsv(MOCK_PINNED);
    const lines = csv.split("\n");
    expect(lines[0]).toBe(
      "Scenario,Age,Sex,BMI,Children,Smoker,Region,Monthly USD,Annual USD,Range Low Monthly,Range High Monthly"
    );
    expect(lines[1]).toBe("1,35,male,26.5,0,no,northwest,362.50,4350.00,225.37,499.63");
  });

  it("renders Download CSV and Clear all actions", () => {
    const onClear = vi.fn();
    render(<CompareTray pinned={MOCK_PINNED} onRemove={vi.fn()} onClear={onClear} />);

    expect(screen.getByRole("button", { name: /Download CSV/i })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /Clear all/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

