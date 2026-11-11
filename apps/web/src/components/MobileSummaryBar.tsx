"use client";

import React from "react";
import { ArrowUp } from "lucide-react";
import { formatUSD } from "../lib/format";
import { QuoteResponse } from "../types/quote";

interface MobileSummaryBarProps {
  quote: QuoteResponse;
  visible: boolean;
  onView: () => void;
}

export const MobileSummaryBar: React.FC<MobileSummaryBarProps> = ({
  quote,
  visible,
  onView,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 shadow-lift backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            Estimated premium
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-medium text-ink tabular-nums">
              {formatUSD(quote.predicted_monthly)}
            </span>
            <span className="text-xs text-ink-faint">/ month</span>
          </div>
        </div>

        <button type="button" onClick={onView} className="btn-primary py-2.5 text-sm">
          View estimate
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

