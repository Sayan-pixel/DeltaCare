/**
 * HTTP Client Service for DeltaCare Backend API
 * Connects to FastAPI service with AbortController timeout and typed responses.
 * Traceability: FR-004, FR-005, ADR-002, ADR-007
 */

import { HealthResponse, QuoteRequest, QuoteResponse } from "../types/quote";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_TIMEOUT_MS =
  parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || "20000", 10);

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

/**
 * Executes a POST /predict request with a strict abort timeout.
 */
export async function calculateQuote(
  payload: QuoteRequest,
  signal?: AbortSignal
): Promise<QuoteResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  // Link caller signal if provided
  if (signal) {
    signal.addEventListener("abort", () => controller.abort());
  }

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
        // Fallback to HTTP status text
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
    throw new ApiError(500, (err as Error).message || "Network communication failed. Please check your connection.");
  }
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

