"use client";

import React from "react";
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
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center justify-center gap-3 text-slate-600 dark:text-slate-300">
        <svg className="animate-spin h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="text-sm font-medium">Calculating actuarial quote...</span>
      </div>
    );
  }

  if (status === "waking_server") {
    return (
      <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-6 shadow-sm space-y-3 animate-pulse">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
          <span>⚡</span> Waking up the pricing engine...
        </div>
        <p className="text-sm text-amber-900 dark:text-amber-200">
          DeltaCare runs on $0 perpetual hosting. When idle, the backend container enters low-power standby and takes ~10–15 seconds to spin up.
        </p>
        <div className="w-full bg-amber-200 dark:bg-amber-900/60 rounded-full h-1.5 overflow-hidden">
          <div className="bg-amber-600 h-1.5 rounded-full animate-indeterminate" />
        </div>
      </div>
    );
  }

  return null;
};

