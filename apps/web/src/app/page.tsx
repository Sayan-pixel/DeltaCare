"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, BarChart3, Lock, RotateCcw, ShieldCheck, Sparkles, TrendingDown } from "lucide-react";
import { ColdStartLoader } from "../components/ColdStartLoader";
import { DemographicsForm } from "../components/DemographicsForm";
import { Disclaimer } from "../components/Disclaimer";
import { QuoteCard } from "../components/QuoteCard";
import { WhatIfBadge } from "../components/WhatIfBadge";
import { useDebounce } from "../hooks/useDebounce";
import { useQuote } from "../hooks/useQuote";
import { QuoteRequest } from "../types/quote";

const INITIAL_PROFILE: QuoteRequest = {
  age: 35,
  sex: "male",
  bmi: 26.5,
  children: 0,
  smoker: "no",
  region: "northwest",
};

const MOBILE_BREAKPOINT_PX = 1024;

const HIGHLIGHTS = [
  {
    icon: Lock,
    title: "Anonymous by design",
    body: "No sign-up, no email, no sales calls. Your inputs are never stored.",
  },
  {
    icon: BarChart3,
    title: "An honest range",
    body: "Every estimate comes with an empirical error margin, not a single magic number.",
  },
  {
    icon: TrendingDown,
    title: "See what moves the price",
    body: "Adjust BMI or tobacco status and watch the estimate respond.",
  },
];

export default function HomePage() {
  const [profile, setProfile] = useState<QuoteRequest>(INITIAL_PROFILE);
  const { quote, whatIf, status, errorMessage, getQuote } = useQuote();

  const hasCalculatedOnce = useRef(false);
  const scrollToResultsOnNext = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debouncedBmi = useDebounce(profile.bmi, 400);

  // Auto-refresh estimate when BMI slider settles (if already calculated once)
  useEffect(() => {
    if (hasCalculatedOnce.current) {
      getQuote(profile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedBmi]);

  // On small screens, bring the first result into view after an explicit submit
  useEffect(() => {
    if (quote && scrollToResultsOnNext.current) {
      scrollToResultsOnNext.current = false;
      if (window.innerWidth < MOBILE_BREAKPOINT_PX) {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [quote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hasCalculatedOnce.current = true;
    scrollToResultsOnNext.current = true;
    getQuote(profile);
  };

  const isLoading = status === "fast_loading" || status === "waking_server";

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="mx-auto max-w-3xl space-y-5 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Zero Sales Calls • Zero Email Harvesting • 100% Stateless
        </div>
        <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
          Transparent health insurance{" "}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            pricing
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
          Instant, statistically backed actuarial estimates using standard underwriting factors. Discover how lifestyle choices impact your bottom line.
        </p>
      </section>

      {/* Calculator */}
      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8" aria-label="Premium calculator">
        <div className="surface p-6 sm:p-8 lg:col-span-7">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              <Sparkles className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              Your profile
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              6 standard factors
            </span>
          </div>

          <DemographicsForm
            values={profile}
            onChange={setProfile}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        <div ref={resultsRef} className="scroll-mt-24 space-y-5 lg:sticky lg:top-24 lg:col-span-5">
          {/* Cold Start Progressive Loader (FR-012) */}
          <ColdStartLoader status={status} />

          {/* Error / Timeout Notification Card */}
          {errorMessage && (
            <div
              role="alert"
              className="animate-fadeIn space-y-3 rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-soft dark:border-rose-900 dark:bg-rose-950/30"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-rose-800 dark:text-rose-300">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                Notice
              </div>
              <p className="text-sm text-rose-700 dark:text-rose-300">{errorMessage}</p>
              {status === "timeout" && (
                <button
                  type="button"
                  onClick={() => getQuote(profile)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Retry Calculation
                </button>
              )}
            </div>
          )}

          {/* Active Pricing Results View */}
          {quote && (
            <div className="animate-fadeIn space-y-5">
              <QuoteCard quote={quote} />
              {whatIf && <WhatIfBadge whatIf={whatIf} />}
              <Disclaimer />
            </div>
          )}

          {/* Initial State */}
          {!quote && !isLoading && !errorMessage && (
            <div className="surface relative overflow-hidden border-dashed p-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
                <BarChart3 className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Ready for calculation</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Fill in your profile and press <strong className="text-slate-700 dark:text-slate-200">Calculate</strong> to see your monthly price and its statistical confidence range.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Highlights */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Why DeltaCare">
        {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="surface p-6 transition-transform duration-200 hover:-translate-y-0.5">
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
