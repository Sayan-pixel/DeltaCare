"use client";

import React from "react";
import { Download, Trash2, X } from "lucide-react";
import { formatUSD } from "../lib/format";
import { describeProfile } from "../lib/profile";
import { QuoteRequest, QuoteResponse } from "../types/quote";

export interface PinnedEstimate {
  id: number;
  profile: QuoteRequest;
  quote: QuoteResponse;
}

interface CompareTrayProps {
  pinned: PinnedEstimate[];
  onRemove: (id: number) => void;
  onClear: () => void;
}

/** Builds an RFC-4180 CSV export string for pinned comparison scenarios. */
export function buildPinnedCsv(pinned: PinnedEstimate[]): string {
  const headers = [
    "Scenario",
    "Age",
    "Sex",
    "BMI",
    "Children",
    "Smoker",
    "Region",
    "Monthly USD",
    "Annual USD",
    "Range Low Monthly",
    "Range High Monthly",
  ];

  const rows = pinned.map((item, idx) => [
    String(idx + 1),
    String(item.profile.age),
    item.profile.sex,
    item.profile.bmi.toFixed(1),
    String(item.profile.children),
    item.profile.smoker,
    item.profile.region,
    item.quote.predicted_monthly.toFixed(2),
    item.quote.predicted_annual.toFixed(2),
    item.quote.range_monthly[0].toFixed(2),
    item.quote.range_monthly[1].toFixed(2),
  ]);

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

export const CompareTray: React.FC<CompareTrayProps> = ({ pinned, onRemove, onClear }) => {
  if (pinned.length === 0) {
    return null;
  }

  const lowestMonthly = Math.min(...pinned.map((p) => p.quote.predicted_monthly));

  const handleDownloadCsv = () => {
    const csv = buildPinnedCsv(pinned);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "deltacare-scenarios.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="card animate-fadeIn space-y-5 p-6 sm:p-7" aria-label="Pinned scenarios comparison">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Side-by-side comparison</p>
          <h3 className="mt-1 font-serif text-xl font-medium text-ink">
            Pinned scenarios ({pinned.length}/3)
          </h3>
        </div>
        <div className="no-print flex items-center gap-2">
          <button type="button" onClick={handleDownloadCsv} className="btn-quiet">
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Download CSV
          </button>
          <button type="button" onClick={onClear} className="btn-quiet">
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear all
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {pinned.map((item, idx) => {
          const deltaMonthly = item.quote.predicted_monthly - lowestMonthly;
          return (
            <div
              key={item.id}
              className="relative flex flex-col justify-between rounded-xl border border-line bg-paper/60 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-ink-faint">Scenario #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove scenario ${idx + 1}`}
                  className="no-print rounded-lg p-1 text-ink-faint transition-colors hover:bg-line/50 hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl font-medium text-ink tabular-nums">
                    {formatUSD(item.quote.predicted_monthly)}
                  </span>
                  <span className="text-xs text-ink-faint">/ mo</span>
                </div>
                <p className="mt-1 text-xs text-ink-soft tabular-nums">
                  {formatUSD(item.quote.predicted_annual)} / year
                  {pinned.length > 1 && deltaMonthly > 0.5 && (
                    <span className="ml-1.5 font-semibold text-accent">
                      (+{formatUSD(deltaMonthly)}/mo)
                    </span>
                  )}
                </p>
              </div>

              <ul className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-3">
                {describeProfile(item.profile).map((fact) => (
                  <li
                    key={fact}
                    className="rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-soft"
                  >
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};
