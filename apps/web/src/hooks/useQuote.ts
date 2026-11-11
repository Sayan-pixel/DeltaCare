"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { calculateQuote, checkHealth, ApiError } from "../services/api";
import { QuoteRequest, QuoteResponse, QuoteStatus, WhatIfComparison } from "../types/quote";

export interface GetQuoteOptions {
  silent?: boolean;
}

export function useQuote() {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quotedProfile, setQuotedProfile] = useState<QuoteRequest | null>(null);
  const [whatIf, setWhatIf] = useState<WhatIfComparison | null>(null);
  const [status, setStatus] = useState<QuoteStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isStale, setIsStale] = useState<boolean>(false);

  const activeAbortController = useRef<AbortController | null>(null);
  const wakeUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quoteRef = useRef<QuoteResponse | null>(null);

  useEffect(() => {
    quoteRef.current = quote;
  }, [quote]);

  // Pre-warm container on initial mount (fire-and-forget GET /health)
  useEffect(() => {
    checkHealth().catch(() => {
      // Quiet background warm-up; ignored if inactive
    });

    return () => {
      activeAbortController.current?.abort();
      if (wakeUpTimerRef.current) {
        clearTimeout(wakeUpTimerRef.current);
      }
    };
  }, []);

  const getQuote = useCallback(async (request: QuoteRequest, options?: GetQuoteOptions) => {
    if (activeAbortController.current) {
      activeAbortController.current.abort();
    }
    if (wakeUpTimerRef.current) {
      clearTimeout(wakeUpTimerRef.current);
    }

    const controller = new AbortController();
    activeAbortController.current = controller;

    const silent = Boolean(options?.silent && quoteRef.current !== null);
    setErrorMessage(null);
    setIsStale(false);

    if (silent) {
      setIsUpdating(true);
    } else {
      setStatus("fast_loading");
      // FR-012: Transition to waking_server if explicit request takes > 2000ms
      wakeUpTimerRef.current = setTimeout(() => {
        setStatus((prev) => (prev === "fast_loading" ? "waking_server" : prev));
      }, 2000);
    }

    // Launch primary quote and optional counterfactual in parallel so smokers don't pay 2x sequential latency
    const primaryPromise = calculateQuote(request, controller.signal);
    const nonSmokerPromise =
      request.smoker === "yes"
        ? calculateQuote({ ...request, smoker: "no" }, controller.signal).catch(() => null)
        : Promise.resolve(null);

    try {
      const primaryQuote = await primaryPromise;
      if (controller.signal.aborted) return;

      if (wakeUpTimerRef.current) {
        clearTimeout(wakeUpTimerRef.current);
        wakeUpTimerRef.current = null;
      }

      // Reveal primary estimate immediately without waiting on counterfactual completion
      setQuote(primaryQuote);
      setQuotedProfile(request);
      setStatus("success");

      if (request.smoker === "yes") {
        const nonSmokerQuote = await nonSmokerPromise;
        if (controller.signal.aborted) return;

        if (nonSmokerQuote) {
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
        } else {
          setWhatIf(null);
        }
      } else {
        setWhatIf(null);
      }
    } catch (err: unknown) {
      // Request superseded by a newer request; exit silently
      if (controller.signal.aborted) return;

      const hasExistingQuote = quoteRef.current !== null;
      if (hasExistingQuote) {
        setIsStale(true);
      }

      if (err instanceof ApiError && err.status === 408) {
        if (!hasExistingQuote) setStatus("timeout");
        setErrorMessage(
          "Pricing engine warmup timed out. Free cloud instances take a few seconds to wake up. Please try calculating again."
        );
      } else if (err instanceof ApiError && err.status === 429) {
        if (!hasExistingQuote) setStatus("error");
        setErrorMessage("Rate limit reached (60 requests/minute). Please wait a moment before calculating again.");
      } else if (err instanceof ApiError) {
        if (!hasExistingQuote) setStatus("error");
        setErrorMessage(err.detail);
      } else {
        if (!hasExistingQuote) setStatus("error");
        setErrorMessage("An unexpected error occurred while communicating with the pricing engine.");
      }
    } finally {
      if (wakeUpTimerRef.current) {
        clearTimeout(wakeUpTimerRef.current);
      }
      if (!controller.signal.aborted) {
        setIsUpdating(false);
      }
    }
  }, []);

  return {
    quote,
    quotedProfile,
    whatIf,
    status,
    errorMessage,
    isUpdating,
    isStale,
    getQuote,
  };
}
