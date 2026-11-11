"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface UseNumericDraftOptions {
  value: number;
  min: number;
  max: number;
  step?: number;
  allowDecimal?: boolean;
  debounceMs?: number;
  format: (n: number) => string;
  normalize: (n: number) => number;
  onCommit: (n: number) => void;
}

/**
 * Manages local draft string state for numeric inputs so users can clear fields or type
 * multi-digit / decimal values freely without premature min/max clamping mid-keystroke.
 * Commits settled in-range edits after a short debounce, and clamps on blur or Enter.
 */
export function useNumericDraft({
  value,
  min,
  max,
  step = 1,
  allowDecimal = false,
  debounceMs = 450,
  format,
  normalize,
  onCommit,
}: UseNumericDraftOptions) {
  const [draft, setDraft] = useState<string>(() => format(value));
  const isFocusedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Sync external updates (slider drags, stepper clicks, presets) when input is not being edited
  useEffect(() => {
    if (!isFocusedRef.current) {
      setDraft(format(value));
    }
  }, [value, format]);

  useEffect(() => clearTimer, [clearTimer]);

  const commitDraft = useCallback(
    (raw: string) => {
      clearTimer();
      const parsed = allowDecimal ? Number.parseFloat(raw) : Number.parseInt(raw, 10);
      if (!Number.isFinite(parsed)) {
        setDraft(format(value));
        return;
      }
      const next = normalize(parsed);
      setDraft(format(next));
      if (next !== value) {
        onCommit(next);
      }
    },
    [allowDecimal, clearTimer, format, normalize, onCommit, value]
  );

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    commitDraft(draft);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const pattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
    if (!pattern.test(raw)) {
      return;
    }

    setDraft(raw);
    clearTimer();

    if (raw === "" || (allowDecimal && raw.endsWith("."))) {
      return;
    }

    const parsed = allowDecimal ? Number.parseFloat(raw) : Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed >= min && parsed <= max) {
      const normalized = normalize(parsed);
      timerRef.current = setTimeout(() => {
        if (normalized !== value) {
          onCommit(normalized);
        }
      }, debounceMs);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitDraft(draft);
    } else if (e.key === "Escape") {
      clearTimer();
      setDraft(format(value));
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      clearTimer();
      const parsed = allowDecimal ? Number.parseFloat(draft) : Number.parseInt(draft, 10);
      const base = Number.isFinite(parsed) ? parsed : value;
      const next = normalize(base + (e.key === "ArrowUp" ? step : -step));
      setDraft(format(next));
      if (next !== value) {
        onCommit(next);
      }
    }
  };

  const syncImmediate = useCallback(
    (next: number) => {
      clearTimer();
      const normalized = normalize(next);
      setDraft(format(normalized));
      onCommit(normalized);
    },
    [clearTimer, format, normalize, onCommit]
  );

  return {
    draft,
    syncImmediate,
    inputProps: {
      value: draft,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      inputMode: (allowDecimal ? "decimal" : "numeric") as "decimal" | "numeric",
      role: "spinbutton" as const,
      "aria-valuemin": min,
      "aria-valuemax": max,
      "aria-valuenow": value,
    },
  };
}

