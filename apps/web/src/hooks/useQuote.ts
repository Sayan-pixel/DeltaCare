"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { calculateQuote, checkHealth, ApiError } from "../services/api";
import { QuoteRequest, QuoteResponse, QuoteStatus, WhatIfComparison } from "../types/quote";

export function useQuote() {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [whatIf, setWhatIf] = useState<WhatIfComparison | null>(null);
  const [status, setStatus] = useState<QuoteStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeAbortController = useRef<AbortController | null>(null);
  const wakeUpTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-warm container on initial mount (fire-and-forget GET /health)
  useEffect(() => {
    checkHealth().catch(() => {
      // Quiet background warm-up; ignored if inactive
    });
  }, []);

  const getQuote = useCallback(async (request: QuoteRequest) => {
    // Cancel any in-flight request
    if (activeAbortController.current) {
      activeAbortController.current.abort();
    }
    if (wakeUpTimerRef.current) {
      clearTimeout(wakeUpTimerRef.current);
    }

    const controller = new AbortController();
    activeAbortController.current = controller;

    setStatus("fast_loading");
    setErrorMessage(null);

    // FR-012: Transition to waking_server if request takes > 2000ms
    wakeUpTimerRef.current = setTimeout(() => {
      setStatus((prev) => (prev === "fast_loading" ? "waking_server" : prev));
    }, 2000);

    try {
      // 1. Fetch primary quote
      const primaryQuote = await calculateQuote(request, controller.signal);
      setQuote(primaryQuote);

      // 2. FR-010: Dynamic What-If smoking delta calculation
      if (request.smoker === "yes") {
        try {
          const nonSmokerRequest: QuoteRequest = { ...request, smoker: "no" };
          const nonSmokerQuote = await calculateQuote(nonSmokerRequest, controller.signal);

          const annualSavings = Math.max(0, primaryQuote.predicted_annual - nonSmokerQuote.predicted_annual);
          const monthlySavings = Math.max(0, primaryQuote.predicted_monthly - nonSmokerQuote.predicted_monthly);

          setWhatIf({
            currentMonthly: primaryQuote.predicted_monthly,
            currentAnnual: primaryQuote.predicted_annual,
            nonSmokerMonthly: nonSmokerQuote.predicted_monthly,
            nonSmokerAnnual: nonSmokerQuote.predicted_annual,
            monthlySavings: Math.round(monthlySavings * 100) / 100,
            annualSavings: Math.round(annualSavings * 100) / 100,
          });
        } catch {
          // If secondary what-if fetch fails, non-blocking: retain primary quote
          setWhatIf(null);
        }
      } else {
        setWhatIf(null);
      }

      setStatus("success");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 408) {
        setStatus("timeout");
        setErrorMessage("Pricing engine warmup timed out. Free cloud instances take a few seconds to wake up. Please click calculate again.");
      } else if (err instanceof ApiError && err.status === 429) {
        setStatus("error");
        setErrorMessage("Rate limit reached (60 requests/minute). Please wait a moment before calculating again.");
      } else if (err instanceof ApiError) {
        setStatus("error");
        setErrorMessage(err.detail);
      } else {
        setStatus("error");
        setErrorMessage("An unexpected error occurred while communicating with the pricing engine.");
      }
    } finally {
      if (wakeUpTimerRef.current) {
        clearTimeout(wakeUpTimerRef.current);
      }
    }
  }, []);

  return {
    quote,
    whatIf,
    status,
    errorMessage,
    getQuote,
  };
}

