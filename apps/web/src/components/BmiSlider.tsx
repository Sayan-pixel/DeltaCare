"use client";

import React from "react";

interface BmiSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

interface BmiCategory {
  label: string;
  badgeClass: string;
}

const BMI_MIN = 10.0;
const BMI_MAX = 60.0;

function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) {
    return {
      label: "Underweight",
      badgeClass: "bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800",
    };
  }
  if (bmi < 25.0) {
    return {
      label: "Normal weight",
      badgeClass: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800",
    };
  }
  if (bmi < 30.0) {
    return {
      label: "Overweight",
      badgeClass: "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800",
    };
  }
  return {
    label: "Obese (higher risk)",
    badgeClass: "bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800",
  };
}

const clampBmi = (n: number) => Math.min(BMI_MAX, Math.max(BMI_MIN, n));

export const BmiSlider: React.FC<BmiSliderProps> = ({ value, onChange, disabled = false }) => {
  const category = getBmiCategory(value);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(clampBmi(Math.round(val * 10) / 10));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(clampBmi(val));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor="bmi-slider" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Body Mass Index (BMI)
        </label>
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${category.badgeClass}`}
          >
            {category.label}
          </span>
          <input
            id="bmi-number"
            type="number"
            min="10.0"
            max="60.0"
            step="0.1"
            value={value.toFixed(1)}
            onChange={handleNumberChange}
            disabled={disabled}
            className="field w-24 px-2.5 py-1.5 text-right font-mono text-sm"
            aria-label="Numeric Body Mass Index"
          />
        </div>
      </div>

      <input
        id="bmi-slider"
        type="range"
        min="10.0"
        max="60.0"
        step="0.1"
        value={value}
        onChange={handleSliderChange}
        disabled={disabled}
        className="bmi-range"
        aria-label="BMI Range Slider"
      />

      <div className="flex justify-between px-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
        <span>10</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>60</span>
      </div>
    </div>
  );
};
