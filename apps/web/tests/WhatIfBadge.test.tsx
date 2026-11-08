import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WhatIfBadge } from "../src/components/WhatIfBadge";
import { WhatIfComparison } from "../src/types/quote";

const MOCK_WHAT_IF: WhatIfComparison = {
  currentMonthly: 850.0,
  currentAnnual: 10200.0,
  nonSmokerMonthly: 350.0,
  nonSmokerAnnual: 4200.0,
  monthlySavings: 500.0,
  annualSavings: 6000.0,
};

describe("WhatIfBadge Component", () => {
  it("renders quantified annual and monthly smoking cessation savings", () => {
    render(<WhatIfBadge whatIf={MOCK_WHAT_IF} />);
    expect(screen.getByText(/Quitting smoking could save you ~\$6,000 \/ year/)).toBeDefined();
    expect(screen.getByText(/\$500 \/ month/)).toBeDefined();
  });

  it("renders null if annual savings is zero or negative", () => {
    const noSavings: WhatIfComparison = { ...MOCK_WHAT_IF, annualSavings: 0 };
    const { container } = render(<WhatIfBadge whatIf={noSavings} />);
    expect(container.firstChild).toBeNull();
  });
});

