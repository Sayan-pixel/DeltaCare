import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiError, calculateQuote, clearQuoteCache } from "../src/services/api";
import { QuoteRequest, QuoteResponse } from "../src/types/quote";

const PROFILE_A: QuoteRequest = {
  age: 35,
  sex: "male",
  bmi: 26.5,
  children: 0,
  smoker: "no",
  region: "northwest",
};

const RESPONSE_A: QuoteResponse = {
  predicted_annual: 4350,
  predicted_monthly: 362.5,
  confidence_margin_annual: 1645.52,
  confidence_margin_monthly: 137.13,
  range_annual: [2704.48, 5995.52],
  range_monthly: [225.37, 499.63],
  currency: "USD",
};

describe("API Client Cache & Deduplication", () => {
  beforeEach(() => {
    clearQuoteCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("caches successful responses by profileKey so repeat lookups make 0 network calls", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => RESPONSE_A,
    });
    vi.stubGlobal("fetch", fetchMock);

    const first = await calculateQuote(PROFILE_A);
    const second = await calculateQuote({ ...PROFILE_A, bmi: 26.5 });

    expect(first).toEqual(RESPONSE_A);
    expect(second).toEqual(RESPONSE_A);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("coalesces concurrent identical requests and isolates caller signal cancellation", async () => {
    let resolveFetch!: (val: unknown) => void;
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    const controller1 = new AbortController();
    const controller2 = new AbortController();

    const p1 = calculateQuote(PROFILE_A, controller1.signal);
    const p2 = calculateQuote(PROFILE_A, controller2.signal);

    // Only one underlying network call despite two concurrent callers
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Aborting caller 1 should only reject caller 1, letting caller 2 complete
    controller1.abort();
    await expect(p1).rejects.toBeInstanceOf(ApiError);

    resolveFetch({
      ok: true,
      json: async () => RESPONSE_A,
    });

    await expect(p2).resolves.toEqual(RESPONSE_A);
  });

  it("does not cache failed responses so subsequent retries hit the API again", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        json: async () => ({ detail: "Rate limit exceeded" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => RESPONSE_A,
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(calculateQuote(PROFILE_A)).rejects.toThrow("Rate limit exceeded");
    await expect(calculateQuote(PROFILE_A)).resolves.toEqual(RESPONSE_A);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

