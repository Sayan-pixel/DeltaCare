"use client";

import React, { useCallback } from "react";
import { Minus, Plus } from "lucide-react";
import { useNumericDraft } from "../hooks/useNumericDraft";

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
  const formatInt = useCallback((n: number) => String(n), []);
  const clamp = useCallback((n: number) => Math.min(max, Math.max(min, Math.round(n))), [min, max]);

  const { syncImmediate, inputProps } = useNumericDraft({
    value,
    min,
    max,
    step,
    allowDecimal: false,
    format: formatInt,
    normalize: clamp,
    onCommit: onChange,
  });

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
          onClick={() => syncImmediate(value - step)}
          disabled={disabled || value <= min}
          className="step-btn"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>

        <input
          id={id}
          type="text"
          {...inputProps}
          disabled={disabled}
          className="field text-center font-mono tabular-nums"
        />

        <button
          type="button"
          onClick={() => syncImmediate(value + step)}
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
