"use client";

import React, { useState } from "react";
import { useCountUp } from "../hooks/useCountUp";
import { cn } from "../lib/cn";
import { formatUSD } from "../lib/format";
import { describeProfile } from "../lib/profile";
import { QuoteRequest, QuoteResponse } from "../types/quote";

interface QuoteCardProps {
  quote: QuoteResponse;
  /** The profile this estimate was calculated for; shown as chips when provided. */
  profile?: QuoteRequest | null;
  /** A background refresh is in flight. */
  updating?: boolean;
  /** The last refresh failed; this is the previous result. */
  stale?: boolean;
}

type View = "monthly" | "annual";

/** Position (0–100) of the estimate inside its confidence range. */
function markerPercent(value: number, [lower, upper]: [number, number]): number {
  const span = upper - lower;
  if (span <= 0) return 50;
  return Math.min(100, Math.max(0, ((value - lower) / span) * 100));
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote, profile, updating = false, stale = false }) => {
  const [view, setView] = useState<View>("monthly");
  const isMonthly = view === "monthly";

  const monthly = useCountUp(quote.predicted_monthly);
  const annual = useCountUp(quote.predicted_annual);

  const hero = formatUSD(isMonthly ? monthly : annual);
  const range = isMonthly ? quote.range_monthly : quote.range_annual;
  const marker = markerPercent(isMonthly ? quote.predicted_monthly : quote.predicted_annual, range);

  return (
    <article
      className={cn("card relative overflow-hidden p-6 transition-opacity duration-200 sm:p-7", stale && "opacity-60")}
      aria-label="Your estimated premium"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">Estimated health premium</p>
        <div role="group" aria-label="Price period" className="inline-flex rounded-lg border border-line bg-paper/60 p-0.5">
          {(["monthly", "annual"] as View[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-colors",
                view === option ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-[3.5rem] font-medium leading-none tracking-tight text-ink tabular-nums sm:text-[4.25rem]">
            {hero}
          </span>
          <span className="text-lg font-medium text-ink-faint">{isMonthly ? "/ month" : "/ year"}</span>
        </div>

        <p className="mt-3 text-sm text-ink-soft">
          {isMonthly ? (
            <>
              Total Estimated Annual Charges:{" "}
              <strong className="font-semibold text-ink tabular-nums">{formatUSD(annual)} / year</strong>
            </>
          ) : (
            <>
              That&apos;s about <strong className="font-semibold text-ink tabular-nums">{formatUSD(monthly)} / month</strong>
            </>
          )}
        </p>

        <p
          className={cn(
            "mt-2 flex items-center gap-1.5 text-xs font-medium text-ink-faint transition-opacity",
            updating ? "opacity-100" : "opacity-0"
          )}
          role="status"
          aria-live="polite"
        >
          <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-brand" aria-hidden="true" />
          {updating ? "Updating…" : " "}
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-line bg-paper/50 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-semibold text-ink-soft">Likely range</p>
          <p className="text-xs text-ink-faint">Statistical confidence margin (± MAE)</p>
        </div>

        <div className="relative mb-9 mt-9">
          <div className="h-2 rounded-full bg-brand/25" />
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-500 ease-out"
            style={{ left: `${marker}%` }}
            aria-hidden="true"
          >
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-brand">
              Estimate
            </span>
            <span className="block h-5 w-1.5 rounded-full bg-brand ring-4 ring-surface" />
          </div>
          <div className="absolute left-0 top-4 text-xs font-medium tabular-nums text-ink-soft">{formatUSD(range[0])}</div>
          <div className="absolute right-0 top-4 text-xs font-medium tabular-nums text-ink-soft">{formatUSD(range[1])}</div>
        </div>

        <p className="text-sm text-ink">
          <span className="font-semibold tabular-nums">
            {formatUSD(range[0])} – {formatUSD(range[1])}
          </span>{" "}
          <span className="text-ink-faint">{isMonthly ? "/ month expected range" : "/ year expected range"}</span>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-faint">
          Based on a holdout MAE of ±{formatUSD(quote.confidence_margin_annual)} per year: the model&apos;s typical error
          on data it had never seen.
        </p>
      </div>

      {profile && (
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Profile used for this estimate">
          {describeProfile(profile).map((fact) => (
            <li key={fact} className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-soft">
              {fact}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};
