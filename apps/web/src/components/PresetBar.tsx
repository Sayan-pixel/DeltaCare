"use client";

import React from "react";
import { RotateCcw, Undo2 } from "lucide-react";
import { cn } from "../lib/cn";
import { INITIAL_PROFILE, PRESETS, Preset, profileKey } from "../lib/profile";
import { QuoteRequest } from "../types/quote";

interface PresetBarProps {
  current: QuoteRequest;
  onSelect: (preset: Preset) => void;
  canUndo?: boolean;
  onUndo?: () => void;
  onReset?: () => void;
  disabled?: boolean;
}

export const PresetBar: React.FC<PresetBarProps> = ({
  current,
  onSelect,
  canUndo = false,
  onUndo,
  onReset,
  disabled = false,
}) => {
  const currentKey = profileKey(current);
  const isModified = currentKey !== profileKey(INITIAL_PROFILE);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-ink-faint">Try an example profile</span>
        <div className="flex items-center gap-3">
          {canUndo && onUndo && (
            <button
              type="button"
              onClick={onUndo}
              disabled={disabled}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:text-brand-strong disabled:pointer-events-none disabled:opacity-45"
            >
              <Undo2 className="h-3 w-3" aria-hidden="true" />
              Undo preset
            </button>
          )}
          {isModified && onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={disabled}
              className="inline-flex items-center gap-1 text-xs font-semibold text-ink-soft transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-45"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Example profiles">
        {PRESETS.map((preset) => {
          const active = profileKey(preset.profile) === currentKey;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              disabled={disabled}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
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
