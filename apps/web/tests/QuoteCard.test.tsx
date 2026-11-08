import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuoteCard } from "../src/components/QuoteCard";
import { QuoteResponse } from "../src/types/quote";

const MOCK_QUOTE: QuoteResponse = {
  predicted_annual: 4350.0,
  predicted_monthly: 362.5,
  confidence_margin_annual: 1645.52,
  confidence_margin_monthly: 137.13,
  range_annual: [2704.48, 5995.52],
  range_monthly: [225.37, 499.63],
  currency: "USD",
};

describe("QuoteCard Component", () => {
  it("renders prioritized monthly hero price and annualized subtitle", () => {
    render(<QuoteCard quote={MOCK_QUOTE} />);
    expect(screen.getByText("$363")).toBeDefined(); // Formatted integer
    expect(screen.getByText(/4,350/)).toBeDefined();
  });

  it("renders empirical confidence range", () => {
    render(<QuoteCard quote={MOCK_QUOTE} />);
    expect(screen.getByText(/\$225 – \$500/)).toBeDefined();
  });
});

