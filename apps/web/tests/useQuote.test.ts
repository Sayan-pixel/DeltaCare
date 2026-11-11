import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as api from "../src/services/api";
import { useQuote } from "../src/hooks/useQuote";
import { QuoteRequest, QuoteResponse } from "../src/types/quote";

const SMOKER_PROFILE: QuoteRequest = {
  age: 42,
  sex: "male",
  bmi: 31.2,
  children: 1,
  smoker: "yes",
  region: "southeast",
};

const SMOKER_QUOTE: QuoteResponse = {
  predicted_annual: 24000,
  predicted_monthly: 2000,
  confidence_margin_annual: 1645.52,
  confidence_margin_monthly: 137.13,
  range_annual: [22354.48, 25645.52],
  range_monthly: [1862.87, 2137.13],
  currency: "USD",
};

const NON_SMOKER_QUOTE: QuoteResponse = {
  predicted_annual: 7200,
  predicted_monthly: 600,
  confidence_margin_annual: 1645.52,
  confidence_margin_monthly: 137.13,
  range_annual: [5554.48, 8845.52],
  range_monthly: [462.87, 737.13],
  currency: "USD",
};

describe("useQuote Hook", () => {
  beforeEach(() => {
    vi.spyOn(api, "checkHealth").mockResolvedValue({
      status: "healthy",
      version: "1.0.0",
      model_loaded: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("reveals primary quote immediately without blocking on slower what-if counterfactual", async () => {
    let resolveSecondary!: (q: QuoteResponse) => void;
    vi.spyOn(api, "calculateQuote").mockImplementation((payload) => {
      if (payload.smoker === "yes") {
        return Promise.resolve(SMOKER_QUOTE);
      }
      return new Promise((resolve) => {
        resolveSecondary = resolve;
      });
    });

    const { result } = renderHook(() => useQuote());

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.getQuote(SMOKER_PROFILE);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.status).toBe("success");
    expect(result.current.quote).toEqual(SMOKER_QUOTE);
    expect(result.current.whatIf).toBeNull();

    await act(async () => {
      resolveSecondary(NON_SMOKER_QUOTE);
      await pending;
    });

    expect(result.current.whatIf?.annualSavings).toBe(16800);
    expect(result.current.whatIf?.monthlySavings).toBe(1400);
  });

  it("transitions to waking_server after 2000ms and sets timeout on 408 error", async () => {
    vi.useFakeTimers();
    let rejectPrimary!: (err: api.ApiError) => void;
    vi.spyOn(api, "calculateQuote").mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectPrimary = reject;
        })
    );

    const { result } = renderHook(() => useQuote());

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.getQuote({ ...SMOKER_PROFILE, smoker: "no" });
    });

    expect(result.current.status).toBe("fast_loading");

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.status).toBe("waking_server");

    await act(async () => {
      rejectPrimary(new api.ApiError(408, "Timed out"));
      await pending;
    });

    expect(result.current.status).toBe("timeout");
    expect(result.current.errorMessage).toContain("timed out");
  });

  it("handles silent refresh failure as stale while keeping prior quote", async () => {
    const calcSpy = vi
      .spyOn(api, "calculateQuote")
      .mockResolvedValueOnce(NON_SMOKER_QUOTE)
      .mockRejectedValueOnce(new api.ApiError(429, "Too many requests"));

    const { result } = renderHook(() => useQuote());

    await act(async () => {
      await result.current.getQuote({ ...SMOKER_PROFILE, smoker: "no" });
    });
    expect(result.current.quote).toEqual(NON_SMOKER_QUOTE);

    await act(async () => {
      await result.current.getQuote({ ...SMOKER_PROFILE, age: 45, smoker: "no" }, { silent: true });
    });

    expect(calcSpy).toHaveBeenCalledTimes(2);
    expect(result.current.isStale).toBe(true);
    expect(result.current.quote).toEqual(NON_SMOKER_QUOTE);
    expect(result.current.errorMessage).toContain("Rate limit reached");
  });
});
