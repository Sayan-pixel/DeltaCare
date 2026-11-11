"use client";

import React from "react";
import { TrendingDown } from "lucide-react";
import { formatUSD } from "../lib/format";
import { WhatIfComparison } from "../types/quote";

interface WhatIfBadgeProps {
  whatIf: WhatIfComparison;
}

export const WhatIfBadge: React.FC<WhatIfBadgeProps> = ({ whatIf }) => {
  if (whatIf.annualSavings <= 0) {
    return null;
  }

  const annualSavingsFormatted = formatUSD(whatIf.annualSavings);
  const monthlySavingsFormatted = formatUSD(whatIf.monthlySavings);
  const nonSmokerShare =
    whatIf.currentAnnual > 0 ? Math.min(100, Math.max(4, (whatIf.nonSmokerAnnual / whatIf.currentAnnual) * 100)) : 100;

  return (
    <section className="card animate-fadeIn border-brand/40 bg-brand-soft/60 p-6 sm:p-7" aria-label="Lifestyle impact">
      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            <TrendingDown className="h-4 w-4" aria-hidden="true" />
            Lifestyle impact analysis
          </p>
          <h3 className="mt-3 font-serif text-2xl font-medium leading-snug text-ink sm:text-[1.75rem]">
            Quitting smoking could save you ~{annualSavingsFormatted} / year
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            That equals approximately{" "}
            <strong className="font-semibold text-ink underline decoration-brand/50 underline-offset-4">
              {monthlySavingsFormatted} / month
            </strong>{" "}
            back in your household budget.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            Actuarial models heavily weight tobacco usage due to non-linear interaction with BMI.
          </p>
        </div>

        <div className="space-y-4" aria-hidden="true">
          <div>
            <div className="mb-1.5 flex justify-between text-xs font-semibold text-accent">
              <span>Today (smoker)</span>
              <span className="tabular-nums">{formatUSD(whatIf.currentAnnual)} / yr</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-accent/15">
              <div className="h-full w-full origin-left animate-grow rounded-full bg-accent" />
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-xs font-semibold text-brand">
              <span>Non-smoker</span>
              <span className="tabular-nums">{formatUSD(whatIf.nonSmokerAnnual)} / yr</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-brand/15">
              <div className="h-full origin-left animate-grow rounded-full bg-brand" style={{ width: `${nonSmokerShare}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
