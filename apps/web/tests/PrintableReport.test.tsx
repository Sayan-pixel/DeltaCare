import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrintableReport } from "../src/components/PrintableReport";
import { QuoteRequest, QuoteResponse, WhatIfComparison } from "../src/types/quote";

const MOCK_PROFILE: QuoteRequest = {
  age: 42,
  sex: "male",
  bmi: 31.2,
  children: 1,
  smoker: "yes",
  region: "southeast",
};

const MOCK_QUOTE: QuoteResponse = {
  predicted_annual: 24000,
  predicted_monthly: 2000,
  confidence_margin_annual: 1645.52,
  confidence_margin_monthly: 137.13,
  range_annual: [22354.48, 25645.52],
  range_monthly: [1862.87, 2137.13],
  currency: "USD",
};

const MOCK_WHAT_IF: WhatIfComparison = {
  currentMonthly: 2000,
  currentAnnual: 24000,
  nonSmokerMonthly: 600,
  nonSmokerAnnual: 7200,
  monthlySavings: 1400,
  annualSavings: 16800,
};

describe("PrintableReport Component", () => {
  it("renders full custom actuarial summary, profile factors, what-if savings, and disclaimer", () => {
    render(
      <PrintableReport
        quote={MOCK_QUOTE}
        profile={MOCK_PROFILE}
        whatIf={MOCK_WHAT_IF}
        pinned={[{ id: 1, profile: MOCK_PROFILE, quote: MOCK_QUOTE }]}
      />
    );

    expect(screen.getByText(/Actuarial Premium Estimate Report/i)).toBeDefined();
    expect(screen.getAllByText(/\$2,000/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/42 years/)).toBeDefined();
    expect(screen.getByText(/31\.2 \(Obese \(higher risk\)\)/)).toBeDefined();
    expect(screen.getByText(/Quitting smoking could save approximately \$16,800 \/ year/)).toBeDefined();
    expect(screen.getByText(/Pinned Comparison Scenarios \(1\)/)).toBeDefined();
    expect(screen.getByText(/This does not constitute an official quote, offer, or insurance binder\./)).toBeDefined();
  });
});
