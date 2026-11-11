"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Smoothly interpolates numeric transitions when `target` updates.
 * Initializes directly to `target` on first mount so initial renders and tests display exact values immediately.
 */
export function useCountUp(target: number, durationMs = 360): number {
  const [display, setDisplay] = useState<number>(target);
  const previousRef = useRef<number>(target);

  useEffect(() => {
    const startVal = previousRef.current;
    previousRef.current = target;

    if (startVal === target) {
      setDisplay(target);
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof requestAnimationFrame !== "function") {
      setDisplay(target);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(startVal + (target - startVal) * eased);

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs]);

  return display;
}

