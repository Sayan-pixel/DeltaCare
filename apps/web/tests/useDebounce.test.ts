import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../src/hooks/useDebounce";

describe("useDebounce Hook", () => {
  it("delays updating settled value until specified delay passes", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 25.0, delay: 400 } }
    );

    expect(result.current).toBe(25.0);

    // Update input
    rerender({ value: 30.0, delay: 400 });
    expect(result.current).toBe(25.0); // Still old value before timer

    // Fast-forward 200ms (not yet 400ms)
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(25.0);

    // Fast-forward remaining 200ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(30.0);

    vi.useRealTimers();
  });
});

