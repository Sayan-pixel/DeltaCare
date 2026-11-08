"use client";

import React from "react";
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

  return (
    <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-5 shadow-sm space-y-2.5 animate-fadeIn">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
          ✓
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
          Lifestyle Impact Analysis
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-200 tracking-tight">
          Quitting smoking could save you ~{annualSavingsFormatted} / year
        </h3>
        <p className="text-sm font-medium text-emerald-800/90 dark:text-emerald-300">
          That equals approximately <strong className="font-bold underline">{monthlySavingsFormatted} / month</strong> back in your household budget.
        </p>
      </div>

      <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 pt-1 border-t border-emerald-200 dark:border-emerald-800">
        Actuarial models heavily weight tobacco usage due to non-linear interaction with BMI.
      </p>
    </div>
  );
};

