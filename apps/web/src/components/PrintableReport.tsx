"use client";

import React from "react";
import { getBmiCategory } from "../lib/bmi";
import { formatUSD } from "../lib/format";
import { describeProfile, REGION_LABELS } from "../lib/profile";
import { QuoteRequest, QuoteResponse, WhatIfComparison } from "../types/quote";
import { PinnedEstimate } from "./CompareTray";

interface PrintableReportProps {
  quote: QuoteResponse;
  profile: QuoteRequest;
  whatIf: WhatIfComparison | null;
  pinned: PinnedEstimate[];
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  quote,
  profile,
  whatIf,
  pinned,
}) => {
  const bmiCategory = getBmiCategory(profile.bmi);
  const generatedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  const lowestPinnedMonthly =
    pinned.length > 0 ? Math.min(...pinned.map((item) => item.quote.predicted_monthly)) : 0;

  return (
    <article
      className="hidden print:block text-ink"
      aria-label="Printable health insurance estimate report"
    >
      {/* Report Header */}
      <header className="flex items-start justify-between border-b-2 border-ink pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
            DeltaCare • Transparent Health Insurance Pricing
          </p>
          <h1 className="mt-1 font-serif text-3xl font-medium text-ink">
            Actuarial Premium Estimate Report
          </h1>
        </div>
        <div className="text-right text-xs text-ink-soft">
          <p className="font-semibold text-ink">Generated: {generatedAt}</p>
          <p>100% Stateless • Zero PII Retained</p>
        </div>
      </header>

      {/* Primary Estimate Hero + Confidence Interval */}
      <section className="mt-5 grid grid-cols-12 gap-4 rounded-xl border border-line bg-surface p-5">
        <div className="col-span-6 border-r border-line pr-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
            Estimated Monthly Premium
          </p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-serif text-4xl font-medium tabular-nums text-ink">
              {formatUSD(quote.predicted_monthly)}
            </span>
            <span className="text-sm text-ink-soft">/ month</span>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            Total Estimated Annual Charges:{" "}
            <strong className="font-semibold tabular-nums text-ink">
              {formatUSD(quote.predicted_annual)} / year
            </strong>
          </p>
        </div>

        <div className="col-span-6 pl-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
            Statistical Confidence Range (± MAE)
          </p>
          <div className="mt-2 space-y-1.5 text-sm">
            <p className="flex justify-between">
              <span className="text-ink-soft">Monthly Range:</span>
              <strong className="font-semibold tabular-nums text-ink">
                {formatUSD(quote.range_monthly[0])} – {formatUSD(quote.range_monthly[1])} / mo
              </strong>
            </p>
            <p className="flex justify-between">
              <span className="text-ink-soft">Annual Range:</span>
              <strong className="font-semibold tabular-nums text-ink">
                {formatUSD(quote.range_annual[0])} – {formatUSD(quote.range_annual[1])} / yr
              </strong>
            </p>
            <p className="text-xs text-ink-faint">
              Holdout empirical margin: ±{formatUSD(quote.confidence_margin_annual)}/yr (±
              {formatUSD(quote.confidence_margin_monthly)}/mo)
            </p>
          </div>
        </div>
      </section>

      {/* Submitted Profile Details */}
      <section className="mt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-faint">
          Submitted Underwriting Profile (6 Factors)
        </h2>
        <div className="mt-2 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-line p-3">
            <p className="text-[11px] text-ink-faint">Age</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">{profile.age} years</p>
          </div>
          <div className="rounded-lg border border-line p-3">
            <p className="text-[11px] text-ink-faint">Biological Sex</p>
            <p className="mt-0.5 text-sm font-semibold capitalize text-ink">{profile.sex}</p>
          </div>
          <div className="rounded-lg border border-line p-3">
            <p className="text-[11px] text-ink-faint">Body Mass Index (BMI)</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">
              {profile.bmi.toFixed(1)} ({bmiCategory.label})
            </p>
          </div>
          <div className="rounded-lg border border-line p-3">
            <p className="text-[11px] text-ink-faint">Dependent Children</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">{profile.children}</p>
          </div>
          <div className="rounded-lg border border-line p-3">
            <p className="text-[11px] text-ink-faint">Tobacco Use</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">
              {profile.smoker === "yes" ? "Yes (Smoker)" : "No (Non-smoker)"}
            </p>
          </div>
          <div className="rounded-lg border border-line p-3">
            <p className="text-[11px] text-ink-faint">US Geographic Region</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">{REGION_LABELS[profile.region]}</p>
          </div>
        </div>
      </section>

      {/* What-If Smoking Cessation Savings */}
      {whatIf && whatIf.annualSavings > 0 && (
        <section className="mt-5 rounded-xl border border-brand/40 bg-brand-soft/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand">
            Lifestyle Impact Analysis (Smoking Cessation Counterfactual)
          </p>
          <p className="mt-1 text-base font-semibold text-ink">
            Quitting smoking could save approximately {formatUSD(whatIf.annualSavings)} / year (
            {formatUSD(whatIf.monthlySavings)} / month)
          </p>
          <div className="mt-2 flex gap-6 text-xs text-ink-soft">
            <span>
              Current (smoker):{" "}
              <strong className="text-ink">{formatUSD(whatIf.currentAnnual)} / yr</strong>
            </span>
            <span>
              Non-smoker counterfactual:{" "}
              <strong className="text-ink">{formatUSD(whatIf.nonSmokerAnnual)} / yr</strong>
            </span>
          </div>
        </section>
      )}

      {/* Pinned Comparison Scenarios */}
      {pinned.length > 0 && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-faint">
            Pinned Comparison Scenarios ({pinned.length})
          </h2>
          <table className="mt-2 w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-line text-ink-faint">
                <th className="py-2 pr-3 font-semibold">#</th>
                <th className="py-2 pr-3 font-semibold">Profile Summary</th>
                <th className="py-2 pr-3 text-right font-semibold">Monthly</th>
                <th className="py-2 pr-3 text-right font-semibold">Annual</th>
                <th className="py-2 text-right font-semibold">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pinned.map((item, idx) => {
                const delta = item.quote.predicted_monthly - lowestPinnedMonthly;
                return (
                  <tr key={item.id}>
                    <td className="py-2 pr-3 font-semibold text-ink">{idx + 1}</td>
                    <td className="py-2 pr-3 text-ink-soft">
                      {describeProfile(item.profile).join(" • ")}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold tabular-nums text-ink">
                      {formatUSD(item.quote.predicted_monthly)}/mo
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-ink-soft">
                      {formatUSD(item.quote.predicted_annual)}/yr
                    </td>
                    <td className="py-2 text-right tabular-nums text-ink-soft">
                      {delta > 0.5 ? `+${formatUSD(delta)}/mo` : "Lowest"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {/* Methodology & Mandatory Legal Disclaimer */}
      <footer className="mt-6 border-t border-line pt-4 text-[11px] leading-relaxed text-ink-faint">
        <p className="font-semibold text-ink-soft">
          Model &amp; Methodology: DeltaCare XGBoost Regressor (Holdout R² = 0.87, MAE = ±$1,646/yr,
          $1,000/yr minimum actuarial floor).
        </p>
        <p className="mt-1">
          Estimates are generated by a machine learning model for informational purposes only. This
          does not constitute an official quote, offer, or insurance binder. Actual premiums are
          determined by underwriting.
        </p>
      </footer>
    </article>
  );
};

