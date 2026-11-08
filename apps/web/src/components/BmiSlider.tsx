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

function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) {
    return {
      label: "Underweight",
      badgeClass: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800",
    };
  }
  if (bmi < 25.0) {
    return {
      label: "Normal Weight",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    };
  }
  if (bmi < 30.0) {
    return {
      label: "Overweight",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    };
  }
  return {
    label: "Obese (Higher Risk)",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  };
}

export const BmiSlider: React.FC<BmiSliderProps> = ({ value, onChange, disabled = false }) => {
  const category = getBmiCategory(value);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(Math.min(60.0, Math.max(10.0, Math.round(val * 10) / 10)));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(Math.min(60.0, Math.max(10.0, val)));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="bmi-slider" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Body Mass Index (BMI)
        </label>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${category.badgeClass}`}
          >
            {category.label}
          </span>
          <div className="relative w-20">
            <input
              id="bmi-number"
              type="number"
              min="10.0"
              max="60.0"
              step="0.1"
              value={value.toFixed(1)}
              onChange={handleNumberChange}
              disabled={disabled}
              className="w-full text-right font-mono text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              aria-label="Numeric Body Mass Index"
            />
          </div>
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
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:opacity-50"
        aria-label="BMI Range Slider"
      />

      <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 px-0.5">
        <span>10.0 (Min)</span>
        <span>18.5</span>
        <span>25.0</span>
        <span>30.0</span>
        <span>60.0 (Max)</span>
      </div>
    </div>
  );
};

