"use client";

import React, { useEffect, useRef, useState } from "react";
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

export default function HomePage() {
  const [profile, setProfile] = useState<QuoteRequest>(INITIAL_PROFILE);
  const { quote, whatIf, status, errorMessage, getQuote } = useQuote();

  const hasCalculatedOnce = useRef(false);
  const debouncedBmi = useDebounce(profile.bmi, 400);

  // Auto-refresh estimate when BMI slider settles (if already calculated once)
  useEffect(() => {
    if (hasCalculatedOnce.current) {
      getQuote(profile);
    }
  }, [debouncedBmi]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hasCalculatedOnce.current = true;
    getQuote(profile);
  };

  const isLoading = status === "fast_loading" || status === "waking_server";

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span>🛡️</span> Zero Sales Calls • Zero Email Harvesting • 100% Stateless
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Transparent Health Insurance Pricing
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Instant, statistically backed actuarial estimates using standard underwriting factors. Discover how lifestyle choices impact your bottom line.
        </p>
      </div>

      {/* Grid: Form on Left/Top, Results on Right/Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Actuarial Profile Input */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📋</span> Actuarial Factors
            </h2>
            <span className="text-xs text-slate-400 font-medium">Standard 6 Metrics</span>
          </div>

          <DemographicsForm
            values={profile}
            onChange={setProfile}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: Dynamic Price Engine Output */}
        <div className="lg:col-span-5 space-y-6">
          {/* Cold Start Progressive Loader (FR-012) */}
          <ColdStartLoader status={status} />

          {/* Error / Timeout Notification Card */}
          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
                <span>⚠️</span> Notice
              </div>
              <p className="text-sm text-rose-700 dark:text-rose-300">
                {errorMessage}
              </p>
              {status === "timeout" && (
                <button
                  type="button"
                  onClick={() => getQuote(profile)}
                  className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                >
                  Retry Calculation
                </button>
              )}
            </div>
          )}

          {/* Active Pricing Results View */}
          {quote && (
            <div className="space-y-6 animate-fadeIn">
              {/* Dual-Metric Quote Card (FR-008, FR-009) */}
              <QuoteCard quote={quote} />

              {/* Dynamic What-If Smoking Delta Badge (FR-010) */}
              {whatIf && <WhatIfBadge whatIf={whatIf} />}

              {/* Mandatory Non-Binder Statutory Disclaimer (FR-013) */}
              <Disclaimer />
            </div>
          )}

          {/* Initial State Explanatory Card */}
          {!quote && !isLoading && !errorMessage && (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/40">
              <span className="text-3xl block">💡</span>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Ready for Calculation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Fill in your actuarial demographics and click <strong>Calculate</strong> to view monthly pricing and statistical confidence bounds.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
