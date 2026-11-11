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

/** Position (0–100) of the prediction inside its confidence range. */
function markerPercent(value: number, [lower, upper]: [number, number]): number {
  const span = upper - lower;
  if (span <= 0) return 50;
  return Math.min(100, Math.max(0, ((value - lower) / span) * 100));
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote }) => {
  const monthlyHero = formatUSD(quote.predicted_monthly);
  const annualTotal = formatUSD(quote.predicted_annual);
  const monthlyLower = formatUSD(quote.range_monthly[0]);
  const monthlyUpper = formatUSD(quote.range_monthly[1]);
  const annualLower = formatUSD(quote.range_annual[0]);
  const annualUpper = formatUSD(quote.range_annual[1]);
  const marker = markerPercent(quote.predicted_monthly, quote.range_monthly);

  return (
    <div className="surface relative overflow-hidden p-6 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl"
      />

      <div className="relative space-y-7">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            Estimated Health Premium
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Actuarial Model Estimate</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="bg-gradient-to-br from-emerald-600 to-teal-500 bg-clip-text text-5xl font-black tracking-tight text-transparent tabular-nums sm:text-6xl dark:from-emerald-300 dark:to-teal-300">
              {monthlyHero}
            </span>
            <span className="text-lg font-semibold text-slate-500 dark:text-slate-400">/ month</span>
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Total Estimated Annual Charges:{" "}
            <strong className="font-bold text-slate-900 tabular-nums dark:text-slate-100">{annualTotal} / year</strong>
          </div>
        </div>

        {/* Confidence range gauge (FR-009, ADR-008) */}
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-900/50">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Statistical Confidence Margin (± MAE)</span>
            <span className="text-emerald-700 dark:text-emerald-400">Empirically Grounded</span>
          </div>

          <div className="px-1 pt-5">
            <div className="relative h-3 rounded-full bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 dark:from-emerald-900 dark:via-emerald-600 dark:to-emerald-900">
              <span
                className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-emerald-600 bg-white shadow-md transition-[left] duration-500 dark:bg-slate-900"
                style={{ left: `${marker}%` }}
                aria-hidden="true"
              />
              <span
                className="absolute -top-6 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-emerald-700 transition-[left] duration-500 dark:text-emerald-400"
                style={{ left: `${marker}%` }}
                aria-hidden="true"
              >
                Estimate
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tabular-nums text-slate-800 dark:text-slate-100">
              {monthlyLower} – {monthlyUpper}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/ month expected range</span>
          </div>

          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Annualized spread: {annualLower} – {annualUpper} (based on holdout MAE of ±
            {formatUSD(quote.confidence_margin_annual)})
          </p>
        </div>
      </div>
    </div>
  );
};
