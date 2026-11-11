"use client";

import React from "react";
import { Loader2, Zap } from "lucide-react";
import { QuoteStatus } from "../types/quote";

interface ColdStartLoaderProps {
  status: QuoteStatus;
}

export const ColdStartLoader: React.FC<ColdStartLoaderProps> = ({ status }) => {
  if (status !== "fast_loading" && status !== "waking_server" && status !== "timeout") {
    return null;
  }

  if (status === "fast_loading") {
    return (
      <div className="surface animate-fadeIn space-y-5 p-6" role="status" aria-live="polite">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" aria-hidden="true" />
          <span className="text-sm font-semibold">Calculating actuarial quote...</span>
        </div>
        <div className="space-y-3" aria-hidden="true">
          <div className="h-12 w-3/5 animate-shimmer rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
          <div className="h-4 w-2/5 animate-shimmer rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
          <div className="h-24 w-full animate-shimmer rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
        </div>
      </div>
    );
  }

  if (status === "waking_server") {
    return (
      <div
        className="animate-fadeIn space-y-4 rounded-3xl border border-amber-300 bg-amber-50 p-6 shadow-soft dark:border-amber-800 dark:bg-amber-950/40"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5 text-sm font-bold text-amber-900 dark:text-amber-300">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            <Zap className="h-4 w-4" aria-hidden="true" />
          </span>
          Waking up the pricing engine...
        </div>
        <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
          DeltaCare runs on $0 perpetual hosting. When idle, the backend container enters low-power standby and takes ~10–15 seconds to spin up.
        </p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-200 dark:bg-amber-900/60">
          <div className="h-1.5 animate-indeterminate rounded-full bg-amber-600" />
        </div>
      </div>
    );
  }

  return null;
};
