"use client";

import React from "react";
import { QuoteResponse } from "../types/quote";

interface QuoteCardProps {
  quote: QuoteResponse;
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote }) => {
  const monthlyHero = formatUSD(quote.predicted_monthly);
  const annualTotal = formatUSD(quote.predicted_annual);
  const monthlyLower = formatUSD(quote.range_monthly[0]);
  const monthlyUpper = formatUSD(quote.range_monthly[1]);
  const annualLower = formatUSD(quote.range_annual[0]);
  const annualUpper = formatUSD(quote.range_annual[1]);

  return (
    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header Tag */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider uppercase text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full">
          Estimated Health Premium
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Actuarial Model Estimate
        </span>
      </div>

      {/* Dual Metric Presentation (FR-008) */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {monthlyHero}
          </span>
          <span className="text-lg font-semibold text-slate-500 dark:text-slate-400">
            / month
          </span>
        </div>
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Total Estimated Annual Charges: <strong className="text-slate-900 dark:text-slate-200 font-bold">{annualTotal} / year</strong>
        </div>
      </div>

      {/* Statistical Confidence Range Rendering (FR-009, ADR-008) */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Statistical Confidence Margin (± MAE)</span>
          <span className="text-emerald-700 dark:text-emerald-400">Empirically Grounded</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
            {monthlyLower} – {monthlyUpper}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            / month expected range
          </span>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Annualized spread: {annualLower} – {annualUpper} (based on holdout MAE of ±{formatUSD(quote.confidence_margin_annual)})
        </div>
      </div>
    </div>
  );
};

