"use client";

import React, { useState } from "react";
import { Calculator } from "lucide-react";
import { clampBmi, roundBmi } from "../lib/bmi";

interface BmiCalculatorProps {
  onApply: (bmi: number) => void;
  disabled?: boolean;
}

export const BmiCalculator: React.FC<BmiCalculatorProps> = ({ onApply, disabled = false }) => {
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");
  const [pounds, setPounds] = useState("175");
  const [cm, setCm] = useState("175");
  const [kg, setKg] = useState("79");

  const compute = (): number | null => {
    if (unit === "imperial") {
      const f = Number.parseFloat(feet);
      const i = Number.parseFloat(inches);
      const w = Number.parseFloat(pounds);
      const totalInches = (Number.isFinite(f) ? f : 0) * 12 + (Number.isFinite(i) ? i : 0);
      if (totalInches <= 0 || !Number.isFinite(w) || w <= 0) return null;
      return roundBmi((w / (totalInches * totalInches)) * 703);
    }
    const heightM = Number.parseFloat(cm) / 100;
    const weightKg = Number.parseFloat(kg);
    if (!Number.isFinite(heightM) || heightM <= 0 || !Number.isFinite(weightKg) || weightKg <= 0) {
      return null;
    }
    return roundBmi(weightKg / (heightM * heightM));
  };

  const computed = compute();

  const handleApply = () => {
    if (computed !== null) {
      onApply(clampBmi(computed));
    }
  };

  return (
    <details className="rounded-xl border border-line bg-paper/40 px-4 py-3 text-sm">
      <summary className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-ink-soft hover:text-ink">
        <span className="flex items-center gap-2">
          <Calculator className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
          Not sure of your BMI? Calculate from height &amp; weight
        </span>
        <span className="text-ink-faint">Toggle</span>
      </summary>

      <div className="mt-4 space-y-3 border-t border-line pt-3">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex rounded-lg border border-line bg-surface p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setUnit("imperial")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                unit === "imperial" ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
              }`}
            >
              US (ft / lb)
            </button>
            <button
              type="button"
              onClick={() => setUnit("metric")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                unit === "metric" ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
              }`}
            >
              Metric (cm / kg)
            </button>
          </div>
          {computed !== null && (
            <span className="font-mono text-xs font-semibold text-ink">
              BMI: {clampBmi(computed).toFixed(1)}
            </span>
          )}
        </div>

        {unit === "imperial" ? (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="bmi-feet" className="block text-[11px] font-medium text-ink-faint">
                Feet
              </label>
              <input
                id="bmi-feet"
                type="number"
                min={3}
                max={8}
                value={feet}
                onChange={(e) => setFeet(e.target.value)}
                className="field mt-1 py-1.5 text-sm tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="bmi-inches" className="block text-[11px] font-medium text-ink-faint">
                Inches
              </label>
              <input
                id="bmi-inches"
                type="number"
                min={0}
                max={11}
                value={inches}
                onChange={(e) => setInches(e.target.value)}
                className="field mt-1 py-1.5 text-sm tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="bmi-pounds" className="block text-[11px] font-medium text-ink-faint">
                Weight (lb)
              </label>
              <input
                id="bmi-pounds"
                type="number"
                min={50}
                max={600}
                value={pounds}
                onChange={(e) => setPounds(e.target.value)}
                className="field mt-1 py-1.5 text-sm tabular-nums"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="bmi-cm" className="block text-[11px] font-medium text-ink-faint">
                Height (cm)
              </label>
              <input
                id="bmi-cm"
                type="number"
                min={100}
                max={250}
                value={cm}
                onChange={(e) => setCm(e.target.value)}
                className="field mt-1 py-1.5 text-sm tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="bmi-kg" className="block text-[11px] font-medium text-ink-faint">
                Weight (kg)
              </label>
              <input
                id="bmi-kg"
                type="number"
                min={25}
                max={280}
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                className="field mt-1 py-1.5 text-sm tabular-nums"
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleApply}
          disabled={disabled || computed === null}
          className="btn-quiet w-full"
        >
          Apply BMI{computed !== null ? ` (${clampBmi(computed).toFixed(1)})` : ""}
        </button>
      </div>
    </details>
  );
};

