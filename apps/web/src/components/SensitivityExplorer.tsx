"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight, BookmarkCheck, BookmarkPlus, SlidersHorizontal } from "lucide-react";
import { cn } from "../lib/cn";
import { clampBmi, roundBmi } from "../lib/bmi";
import { formatUSD } from "../lib/format";
import { LIMITS, profileKey } from "../lib/profile";
import { calculateQuote } from "../services/api";
import { QuoteRequest, QuoteResponse } from "../types/quote";

interface SensitivityExplorerProps {
  profile: QuoteRequest;
  currentMonthly: number;
  pinnedKeys?: string[];
  canPinMore?: boolean;
  onPreview?: (profile: QuoteRequest) => void;
  onPinScenario?: (profile: QuoteRequest, quote: QuoteResponse) => void;
}

interface ScenarioResult {
  label: string;
  req: QuoteRequest;
  res: QuoteResponse;
  monthly: number;
  delta: number;
}

export const SensitivityExplorer: React.FC<SensitivityExplorerProps> = ({
  profile,
  currentMonthly,
  pinnedKeys = [],
  canPinMore = true,
  onPreview,
  onPinScenario,
}) => {
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const candidates: Array<{ label: string; req: QuoteRequest }> = [];
    if (profile.bmi > 24.9) {
      candidates.push({
        label: "If BMI were 24.0 (Normal)",
        req: { ...profile, bmi: 24.0 },
      });
    } else if (profile.bmi < 29.0) {
      candidates.push({
        label: "If BMI were +5 higher",
        req: { ...profile, bmi: clampBmi(roundBmi(profile.bmi + 5)) },
      });
    }

    if (profile.age + 10 <= LIMITS.age.max) {
      candidates.push({
        label: `At age ${profile.age + 10} (+10 yrs)`,
        req: { ...profile, age: profile.age + 10 },
      });
    }

    candidates.push({
      label: profile.smoker === "yes" ? "If non-smoker" : "If smoker",
      req: { ...profile, smoker: profile.smoker === "yes" ? "no" : "yes" },
    });

    setLoading(true);
    const timer = setTimeout(() => {
      Promise.all(
        candidates.map(async (c) => {
          const res = await calculateQuote(c.req, controller.signal);
          return {
            label: c.label,
            req: c.req,
            res,
            monthly: res.predicted_monthly,
            delta: res.predicted_monthly - currentMonthly,
          };
        })
      )
        .then((results) => {
          if (!controller.signal.aborted) {
            setScenarios(results);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setScenarios([]);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [profile, currentMonthly]);

  if (!loading && scenarios.length === 0) {
    return null;
  }

  return (
    <section className="card space-y-5 p-6 sm:p-7" aria-label="Factor sensitivity analysis">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            What moves your price
          </p>
          <h3 className="mt-1 font-serif text-xl font-medium text-ink">
            Single-factor sensitivity
          </h3>
        </div>
        <span className="text-xs text-ink-faint">All else held constant</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-line bg-paper/60" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {scenarios.map((s) => {
            const saves = s.delta < -0.5;
            const increases = s.delta > 0.5;
            const isPinned = pinnedKeys.includes(profileKey(s.req));
            const pinDisabled = !isPinned && !canPinMore;

            return (
              <div
                key={s.label}
                className="flex flex-col justify-between rounded-xl border border-line bg-paper/60 p-4"
              >
                <div>
                  <span className="text-xs font-semibold text-ink-soft">{s.label}</span>
                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <span className="font-serif text-2xl font-medium text-ink tabular-nums">
                      {formatUSD(s.monthly)}
                      <span className="font-sans text-xs font-normal text-ink-faint"> / mo</span>
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                        saves
                          ? "bg-brand-soft text-brand"
                          : increases
                          ? "bg-accent-soft text-accent"
                          : "bg-line/40 text-ink-soft"
                      )}
                    >
                      {saves
                        ? `-${formatUSD(Math.abs(s.delta))}`
                        : increases
                        ? `+${formatUSD(s.delta)}`
                        : "±$0"}
                    </span>
                  </div>
                </div>

                {(onPreview || onPinScenario) && (
                  <div className="no-print mt-3 flex items-center gap-2 border-t border-line/70 pt-3">
                    {onPreview && (
                      <button
                        type="button"
                        onClick={() => onPreview(s.req)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
                      >
                        Preview
                        <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                      </button>
                    )}
                    {onPinScenario && (
                      <button
                        type="button"
                        onClick={() => onPinScenario(s.req, s.res)}
                        disabled={pinDisabled}
                        aria-pressed={isPinned}
                        className={cn(
                          "inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                          isPinned
                            ? "border-brand bg-brand-soft/60 text-brand"
                            : "border-line bg-surface text-ink-soft hover:border-ink-faint hover:text-ink"
                        )}
                      >
                        {isPinned ? (
                          <BookmarkCheck className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <BookmarkPlus className="h-3 w-3" aria-hidden="true" />
                        )}
                        {isPinned ? "Unpin" : "Pin"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
