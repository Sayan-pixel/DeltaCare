"use client";

import React from "react";
import { TrendingDown } from "lucide-react";
import { WhatIfComparison } from "../types/quote";

interface WhatIfBadgeProps {
  whatIf: WhatIfComparison;
}

function formatUSD(val: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

export const WhatIfBadge: React.FC<WhatIfBadgeProps> = ({ whatIf }) => {
  if (whatIf.annualSavings <= 0) {
    return null;
  }

  const annualSavingsFormatted = formatUSD(whatIf.annualSavings);
  const monthlySavingsFormatted = formatUSD(whatIf.monthlySavings);
  const nonSmokerShare =
    whatIf.currentAnnual > 0
      ? Math.min(100, Math.max(4, (whatIf.nonSmokerAnnual / whatIf.currentAnnual) * 100))
      : 100;

  return (
    <div className="relative animate-fadeIn overflow-hidden rounded-3xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-soft dark:border-emerald-800 dark:from-emerald-950/50 dark:to-teal-950/30">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <TrendingDown className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
          Lifestyle Impact Analysis
        </span>
      </div>

      <div className="mt-4 space-y-1.5">
        <h3 className="text-xl font-black tracking-tight text-emerald-950 sm:text-2xl dark:text-emerald-100">
          Quitting smoking could save you ~{annualSavingsFormatted} / year
        </h3>
        <p className="text-sm font-medium text-emerald-900/80 dark:text-emerald-300">
          That equals approximately <strong className="font-bold underline decoration-emerald-400 underline-offset-4">{monthlySavingsFormatted} / month</strong> back in your household budget.
        </p>
      </div>

      {/* Annual comparison bars */}
      <div className="mt-5 space-y-3" aria-hidden="true">
        <div>
          <div className="mb-1 flex justify-between text-xs font-semibold text-rose-700 dark:text-rose-300">
            <span>Current (smoker)</span>
            <span className="tabular-nums">{formatUSD(whatIf.currentAnnual)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-rose-100 dark:bg-rose-950/60">
            <div className="h-full w-full origin-left animate-grow rounded-full bg-rose-500" />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <span>Non-smoker</span>
            <span className="tabular-nums">{formatUSD(whatIf.nonSmokerAnnual)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950/60">
            <div
              className="h-full origin-left animate-grow rounded-full bg-emerald-500"
              style={{ width: `${nonSmokerShare}%` }}
            />
          </div>
        </div>
      </div>

      <p className="mt-5 border-t border-emerald-200 pt-3 text-xs text-emerald-800/80 dark:border-emerald-800 dark:text-emerald-400/80">
        Actuarial models heavily weight tobacco usage due to non-linear interaction with BMI.
      </p>
    </div>
  );
};
