/**
 * HTTP Client Service for DeltaCare Backend API
 * Connects to FastAPI service with AbortController timeout, bounded LRU response cache,
 * and in-flight request deduplication to protect rate limits.
 * Traceability: FR-004, FR-005, FR-011, ADR-002, ADR-005, ADR-007, ADR-009
 */

import { profileKey } from "../lib/profile";
import { HealthResponse, QuoteRequest, QuoteResponse } from "../types/quote";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_TIMEOUT_MS =
  parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || "20000", 10);

const MAX_CACHE_ENTRIES = 100;
const quoteCache = new Map<string, QuoteResponse>();
const inFlightRequests = new Map<string, Promise<QuoteResponse>>();

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

/** Clears cached quote responses and pending dedupe entries (primarily for tests). */
export function clearQuoteCache(): void {
  quoteCache.clear();
  inFlightRequests.clear();
}

function setCachedQuote(key: string, value: QuoteResponse): void {
  if (quoteCache.has(key)) {
    quoteCache.delete(key);
  } else if (quoteCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = quoteCache.keys().next().value;
    if (oldestKey !== undefined) {
      quoteCache.delete(oldestKey);
    }
  }
  quoteCache.set(key, value);
}

/** Races an underlying shared request against a caller-specific AbortSignal without canceling other waiters. */
function awaitWithCallerSignal<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) {
    return promise;
  }
  if (signal.aborted) {
    return Promise.reject(
      new ApiError(408, "Request timed out. The server is taking longer than expected to respond.")
    );
  }

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      reject(
        new ApiError(408, "Request timed out. The server is taking longer than expected to respond.")
      );
    };

    signal.addEventListener("abort", onAbort, { once: true });

    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (err) => {
        signal.removeEventListener("abort", onAbort);
        reject(err);
      }
    );
  });
}

async function fetchPrediction(payload: QuoteRequest): Promise<QuoteResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || JSON.stringify(errorData);
      } catch {
        errorMsg = response.statusText || errorMsg;
      }
      throw new ApiError(response.status, errorMsg);
    }

    return (await response.json()) as QuoteResponse;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(408, "Request timed out. The server is taking longer than expected to respond.");
    }
    throw new ApiError(
      500,
      (err as Error).message || "Network communication failed. Please check your connection."
    );
  }
}

/**
 * Executes a POST /predict request with response caching, in-flight deduplication,
 * and a strict AbortController timeout.
 */
export async function calculateQuote(
  payload: QuoteRequest,
  signal?: AbortSignal
): Promise<QuoteResponse> {
  if (signal?.aborted) {
    throw new ApiError(408, "Request timed out. The server is taking longer than expected to respond.");
  }

  const key = profileKey(payload);
  const cached = quoteCache.get(key);
  if (cached) {
    // Refresh recency in bounded cache
    quoteCache.delete(key);
    quoteCache.set(key, cached);
    return cached;
  }

  let sharedPromise = inFlightRequests.get(key);
  if (!sharedPromise) {
    sharedPromise = fetchPrediction(payload)
      .then((result) => {
        setCachedQuote(key, result);
        return result;
      })
      .finally(() => {
        inFlightRequests.delete(key);
      });
    inFlightRequests.set(key, sharedPromise);
  }

  return awaitWithCallerSignal(sharedPromise, signal);
}

/**
 * Executes GET /health to probe service availability and pre-warm container.
 */
export async function checkHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Health check failed");
  }

  return (await response.json()) as HealthResponse;
}
