import React from "react";
import { BarChart3 } from "lucide-react";

export const EmptyState: React.FC = () => {
  return (
    <div className="card space-y-5 p-6 sm:p-7">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
        <BarChart3 className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <p className="eyebrow">Ready when you are</p>
        <h3 className="font-serif text-2xl font-medium text-ink">Your estimate appears here</h3>
        <p className="text-sm leading-relaxed text-ink-soft">
          Adjust your six underwriting factors—or pick an example profile—and click{" "}
          <strong className="font-semibold text-ink">Get my estimate</strong>.
        </p>
      </div>

      <ul className="space-y-2 border-t border-line pt-4 text-xs text-ink-soft">
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          Monthly hero estimate &amp; annualized total
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          Empirical ±MAE statistical confidence range
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          Instant smoking cessation savings comparison
        </li>
      </ul>
    </div>
  );
};

