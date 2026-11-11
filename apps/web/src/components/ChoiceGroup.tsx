"use client";

import React from "react";
import { cn } from "../lib/cn";

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  tone?: "default" | "danger";
}

interface ChoiceGroupProps<T extends string> {
  legend: string;
  description?: string;
  name: string;
  value: T;
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
  columns?: 2 | 4;
  disabled?: boolean;
}

export function ChoiceGroup<T extends string>({
  legend,
  description,
  name,
  value,
  options,
  onChange,
  columns = 2,
  disabled = false,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <div>
        <legend className="text-sm font-semibold text-ink">{legend}</legend>
        {description && <p className="mt-0.5 text-xs text-ink-faint">{description}</p>}
      </div>

      <div
        className={cn(
          "grid gap-2",
          columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"
        )}
      >
        {options.map((option) => {
          const checked = option.value === value;
          const isDanger = checked && option.tone === "danger";

          return (
            <label
              key={option.value}
              className={cn(
                "flex min-h-[2.75rem] cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-center text-sm font-semibold transition-colors",
                "focus-within:ring-2 focus-within:ring-brand/30",
                disabled && "cursor-not-allowed opacity-50",
                checked
                  ? isDanger
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-brand bg-brand-soft text-brand-strong dark:text-brand"
                  : "border-line bg-paper/60 text-ink-soft hover:border-ink-faint hover:text-ink"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

