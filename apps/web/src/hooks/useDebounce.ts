"use client";

import { useEffect, useState } from "react";

/**
 * useDebounce Hook
 * Damps high-frequency state updates (e.g., slider dragging) to prevent API rate-limit exhaustion.
 * Traceability: FR-011, ADR-009
 *
 * @param value Current reactive input value
 * @param delayMs Delay in milliseconds (default: 400ms)
 * @returns Settled debounced value
 */
export function useDebounce<T>(value: T, delayMs: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

