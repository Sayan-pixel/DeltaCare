"use client";

import React from "react";
import { cn } from "../lib/cn";
import { PRESETS, Preset, profileKey } from "../lib/profile";
import { QuoteRequest } from "../types/quote";

interface PresetBarProps {
  current: QuoteRequest;
  onSelect: (preset: Preset) => void;
}

export const PresetBar: React.FC<PresetBarProps> = ({ current, onSelect }) => {
  const currentKey = profileKey(current);

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-ink-faint">Try an example profile</span>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Example profiles">
        {PRESETS.map((preset) => {
          const active = profileKey(preset.profile) === currentKey;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                active
                  ? "border-brand bg-brand text-brand-on"
                  : "border-line bg-paper/60 text-ink-soft hover:border-ink-faint hover:text-ink"
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

