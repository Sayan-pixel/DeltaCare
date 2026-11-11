"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { QuoteStatus } from "../types/quote";

interface ColdStartLoaderProps {
  status: QuoteStatus;
}

const SHIMMER =
  "animate-shimmer bg-gradient-to-r from-line/60 via-line/20 to-line/60 bg-[length:200%_100%]";

export const ColdStartLoader: React.FC<ColdStartLoaderProps> = ({ status }) => {
  if (status !== "fast_loading" && status !== "waking_server" && status !== "timeout") {
    return null;
  }

  if (status === "fast_loading") {
    return (
      <div className="card animate-fadeIn space-y-6 p-6 sm:p-7" role="status" aria-live="polite">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden="true" />
          Calculating actuarial quote...
        </div>
        <div className="space-y-4" aria-hidden="true">
          <div className={`h-14 w-3/5 rounded-xl ${SHIMMER}`} />
          <div className={`h-4 w-2/5 rounded-lg ${SHIMMER}`} />
          <div className={`h-28 w-full rounded-xl ${SHIMMER}`} />
        </div>
      </div>
    );
  }

  if (status === "waking_server") {
    return (
      <div
        className="card animate-fadeIn space-y-4 border-accent/40 bg-accent-soft/60 p-6 sm:p-7"
        role="status"
        aria-live="polite"
      >
        <p className="font-serif text-xl font-medium text-ink">Waking up the pricing engine...</p>
        <p className="text-sm leading-relaxed text-ink-soft">
          DeltaCare runs on $0 perpetual hosting. When idle, the backend container enters low-power standby and takes ~10–15 seconds to spin up.
        </p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent/20">
          <div className="h-1.5 animate-indeterminate rounded-full bg-accent" />
        </div>
      </div>
    );
  }

  return null;
};
