import React from "react";
import { BENCHMARK_LABELS, MODEL_BENCHMARKS } from "../lib/benchmarks";

const FACTS = [
  {
    label: "Holdout R² Score",
    value: MODEL_BENCHMARKS.r2Display,
    detail: `Explains ~${Math.round(MODEL_BENCHMARKS.r2Score * 100)}% of variance on unseen out-of-sample test records.`,
  },
  {
    label: "Validation MAE",
    value: BENCHMARK_LABELS.maeAnnual,
    detail: `Empirical annual Mean Absolute Error (${BENCHMARK_LABELS.maeMonthly}/mo) surfaced directly in every quote.`,
  },
  {
    label: "Model Architecture",
    value: "XGBoost",
    detail: "Gradient-boosted decision trees capturing non-linear BMI × smoking interactions.",
  },
  {
    label: "Actuarial Minimum",
    value: BENCHMARK_LABELS.floorAnnual,
    detail: "Strict lower-bound guardrail clamping annualized estimates to realistic floor values.",
  },
];

export const ModelFacts: React.FC = () => {
  return (
    <section id="model" className="scroll-mt-24 space-y-8" aria-labelledby="model-heading">
      <div className="max-w-2xl">
        <p className="eyebrow">Model benchmarks</p>
        <h2 id="model-heading" className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
          Grounded in audited error margins
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          Every DeltaCare release is gated on automated statistical validation against holdout
          underwriting records ({BENCHMARK_LABELS.datasetRows} records; 80/20 split).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FACTS.map((fact) => (
          <div key={fact.label} className="card space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              {fact.label}
            </p>
            <p className="font-serif text-3xl font-medium text-ink tabular-nums">{fact.value}</p>
            <p className="text-xs leading-relaxed text-ink-soft">{fact.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
