"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";

interface NumberStepperProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  hint?: string;
  disabled?: boolean;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  hint,
  disabled = false,
}) => {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(e.target.value, 10);
    if (!Number.isNaN(parsed)) {
      onChange(clamp(parsed));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {hint && <span className="text-xs text-ink-faint">{hint}</span>}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          disabled={disabled || value <= min}
          className="step-btn"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>

        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className="field text-center font-mono tabular-nums"
        />

        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          disabled={disabled || value >= max}
          className="step-btn"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

