"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Smoothly interpolates numeric transitions when `target` updates.
 * Initializes directly to `target` on first mount and tracks current rendered frame
 * values so rapid target changes never snap backward.
 */
export function useCountUp(target: number, durationMs = 360): number {
  const [display, setDisplay] = useState<number>(target);
  const displayRef = useRef<number>(target);

  useEffect(() => {
    const startVal = displayRef.current;

    if (startVal === target) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof requestAnimationFrame !== "function") {
      displayRef.current = target;
      setDisplay(target);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startVal + (target - startVal) * eased;
      displayRef.current = current;
      setDisplay(current);

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        displayRef.current = target;
        setDisplay(target);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs]);

  return display;
}
