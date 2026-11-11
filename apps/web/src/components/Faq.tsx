import React from "react";
import { ChevronDown } from "lucide-react";

const ITEMS = [
  {
    q: "Is any personal information stored when I request a quote?",
    a: "No. DeltaCare is 100% stateless in Phase 1. There is no database, no cookies, no user accounts, and request payloads are never written to application logs.",
  },
  {
    q: "Why does the estimate include a ±MAE confidence range?",
    a: "No machine learning model predicts individual medical costs with zero error. Surfacing the empirical Mean Absolute Error (±$1,646/yr, or ±$137/mo) from our holdout test set shows the realistic band rather than a false point guarantee.",
  },
  {
    q: "Why does tobacco use raise the predicted premium so sharply?",
    a: "Actuarial health cost datasets exhibit a strong non-linear interaction between smoking status and BMI. Gradient boosted trees (XGBoost) capture this compounded risk curve directly.",
  },
  {
    q: "Why can the first calculation take 10–15 seconds?",
    a: "DeltaCare operates on a strict $0 perpetual hosting budget using free-tier cloud containers that enter low-power standby after periods of inactivity. Subsequent calculations typically complete in under 50 milliseconds.",
  },
];

export const Faq: React.FC = () => {
  return (
    <section id="faq" className="scroll-mt-24 space-y-8" aria-labelledby="faq-heading">
      <div className="max-w-2xl">
        <p className="eyebrow">Frequently asked questions</p>
        <h2 id="faq-heading" className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
          Common questions
        </h2>
      </div>

      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {ITEMS.map((item) => (
          <details key={item.q} className="group p-5 sm:p-6">
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-ink">
              <span>{item.q}</span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
};

