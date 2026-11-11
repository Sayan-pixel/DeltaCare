import React from "react";

const STEPS = [
  {
    number: "01",
    title: "Enter six underwriting factors",
    description:
      "Provide age, biological sex, BMI, dependent children, tobacco status, and US region. No email, name, or phone number is ever requested.",
  },
  {
    number: "02",
    title: "Unified ML pipeline inference",
    description:
      "Your anonymized profile runs through a locked Scikit-Learn ColumnTransformer and XGBoost regressor with zero train-serve drift.",
  },
  {
    number: "03",
    title: "Honest confidence bounds & insights",
    description:
      "Every prediction shows its empirical holdout MAE interval and immediately quantifies potential savings from lifestyle adjustments.",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="scroll-mt-24 space-y-8" aria-labelledby="how-heading">
      <div className="max-w-2xl">
        <p className="eyebrow">Methodology</p>
        <h2 id="how-heading" className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
          How DeltaCare prices an estimate
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          Traditional insurance portals obscure pricing behind lead-capture forms. DeltaCare keeps the math transparent from input to output.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.number} className="card space-y-3 p-6">
            <span className="font-mono text-xs font-bold text-brand">{step.number}</span>
            <h3 className="font-serif text-xl font-medium text-ink">{step.title}</h3>
            <p className="text-sm leading-relaxed text-ink-soft">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

