"use client";

import React from "react";
import { BMI_MAX, BMI_MIN, BmiTone, clampBmi, getBmiCategory, roundBmi } from "../lib/bmi";
import { cn } from "../lib/cn";

interface BmiSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const TONE_CLASSES: Record<BmiTone, string> = {
  sky: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  emerald: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  amber: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  rose: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
};

const TICKS = [10, 18.5, 25, 30, 60];
const positionOf = (v: number) => ((v - BMI_MIN) / (BMI_MAX - BMI_MIN)) * 100;

export const BmiSlider: React.FC<BmiSliderProps> = ({ value, onChange, disabled = false }) => {
  const category = getBmiCategory(value);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!Number.isNaN(val)) onChange(clampBmi(roundBmi(val)));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!Number.isNaN(val)) onChange(clampBmi(roundBmi(val)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor="bmi-slider" className="text-sm font-semibold text-ink">
          Body mass index (BMI)
        </label>
        <div className="flex items-center gap-2.5">
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", TONE_CLASSES[category.tone])}>
            {category.label}
          </span>
          <input
            id="bmi-number"
            type="number"
            min={BMI_MIN}
            max={BMI_MAX}
            step="0.1"
            value={value.toFixed(1)}
            onChange={handleNumberChange}
            disabled={disabled}
            className="field w-[5.5rem] px-2.5 py-1.5 text-right font-mono text-sm tabular-nums"
            aria-label="Numeric Body Mass Index"
          />
        </div>
      </div>

      <input
        id="bmi-slider"
        type="range"
        min={BMI_MIN}
        max={BMI_MAX}
        step="0.1"
        value={value}
        onChange={handleSliderChange}
        disabled={disabled}
        className="bmi-range"
        aria-label="BMI Range Slider"
        aria-valuetext={`${value.toFixed(1)}, ${category.label}`}
      />

      <div className="relative h-4 text-[11px] font-medium text-ink-faint" aria-hidden="true">
        {TICKS.map((tick) => (
          <span
            key={tick}
            className="absolute -translate-x-1/2 tabular-nums"
            style={{ left: `${positionOf(tick)}%`, ...(tick === BMI_MIN ? { transform: "none" } : {}), ...(tick === BMI_MAX ? { transform: "translateX(-100%)" } : {}) }}
          >
            {tick}
          </span>
        ))}
      </div>
    </div>
  );
};
