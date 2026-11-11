"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { ColdStartLoader } from "../components/ColdStartLoader";
import { CompareTray, PinnedEstimate } from "../components/CompareTray";
import { DemographicsForm } from "../components/DemographicsForm";
import { Disclaimer } from "../components/Disclaimer";
import { EmptyState } from "../components/EmptyState";
import { Faq } from "../components/Faq";
import { HowItWorks } from "../components/HowItWorks";
import { MobileSummaryBar } from "../components/MobileSummaryBar";
import { ModelFacts } from "../components/ModelFacts";
import { PrintableReport } from "../components/PrintableReport";
import { QuoteCard } from "../components/QuoteCard";
import { ResultActions } from "../components/ResultActions";
import { SensitivityExplorer } from "../components/SensitivityExplorer";
import { WhatIfBadge } from "../components/WhatIfBadge";
import { useDebounce } from "../hooks/useDebounce";
import { useQuote } from "../hooks/useQuote";
import { formatUSD } from "../lib/format";
import { INITIAL_PROFILE, profileFromParams, profileKey, profileToParams } from "../lib/profile";
import { QuoteRequest } from "../types/quote";

const DESKTOP_BREAKPOINT_PX = 1024;
const LIVE_DEBOUNCE_MS = 450;
const MAX_PINNED = 3;

const TRUST_POINTS = ["No account needed", "Nothing you enter is stored", "Every estimate shows its error range"];

export default function HomePage() {
  const [profile, setProfile] = useState<QuoteRequest>(INITIAL_PROFILE);
  const [live, setLive] = useState(true);
  const [pinned, setPinned] = useState<PinnedEstimate[]>([]);
  const [resultsVisible, setResultsVisible] = useState(true);
  const { quote, quotedProfile, whatIf, status, errorMessage, isUpdating, isStale, getQuote } = useQuote();

  const hasCalculatedOnce = useRef(false);
  const lastRequestedKey = useRef<string | null>(null);
  const scrollToResultsOnNext = useRef(false);
  const pinCounter = useRef(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debouncedProfile = useDebounce(profile, LIVE_DEBOUNCE_MS);

  const run = useCallback(
    (request: QuoteRequest, options?: { silent?: boolean }) => {
      lastRequestedKey.current = profileKey(request);
      void getQuote(request, options);
    },
    [getQuote]
  );

  // Open a shared link: prefill the form and price it straight away.
  useEffect(() => {
    const shared = profileFromParams(new URLSearchParams(window.location.search));
    if (!shared) return;
    setProfile(shared);
    hasCalculatedOnce.current = true;
    run(shared);
  }, [run]);

  // Live mode: re-price shortly after the form settles (not on every keystroke or slider tick).
  useEffect(() => {
    if (!live || !hasCalculatedOnce.current) return;
    if (profileKey(debouncedProfile) === lastRequestedKey.current) return;
    run(debouncedProfile, { silent: true });
  }, [debouncedProfile, live, run]);

  // Keep the address bar shareable: it always reflects the estimate on screen.
  useEffect(() => {
    if (!quotedProfile) return;
    window.history.replaceState(null, "", `${window.location.pathname}?${profileToParams(quotedProfile).toString()}`);
  }, [quotedProfile]);

  // On phones, bring the first result into view after an explicit submit.
  useEffect(() => {
    if (quote && scrollToResultsOnNext.current) {
      scrollToResultsOnNext.current = false;
      if (window.innerWidth < DESKTOP_BREAKPOINT_PX) {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [quote]);

  // Track whether the result is on screen, to show the floating price bar on phones.
  useEffect(() => {
    const el = resultsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setResultsVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hasCalculatedOnce.current = true;
    scrollToResultsOnNext.current = true;
    run(profile);
  };

  const handleTogglePin = () => {
    if (!quote || !quotedProfile) return;
    const key = profileKey(quotedProfile);
    setPinned((prev) => {
      if (prev.some((p) => profileKey(p.profile) === key)) {
        return prev.filter((p) => profileKey(p.profile) !== key);
      }
      if (prev.length >= MAX_PINNED) return prev;
      pinCounter.current += 1;
      return [...prev, { id: pinCounter.current, profile: quotedProfile, quote }];
    });
  };

  const isLoading = status === "fast_loading" || status === "waking_server";
  const dirty = quotedProfile !== null && profileKey(quotedProfile) !== profileKey(profile);
  const alreadyPinned = quotedProfile !== null && pinned.some((p) => profileKey(p.profile) === profileKey(quotedProfile));
  const pinLabel = alreadyPinned ? "Unpin" : pinned.length >= MAX_PINNED ? "Compare is full" : "Pin to compare";

  return (
    <>
      <div className={quote && quotedProfile ? "space-y-20 md:space-y-28 print:hidden" : "space-y-20 md:space-y-28"}>
      {/* Hero */}
      <section className="max-w-3xl">
        <p className="eyebrow">Health insurance, explained</p>
        <h1 className="mt-4 font-serif text-[2.75rem] font-medium leading-[1.04] tracking-tight text-ink sm:text-6xl md:text-[4.25rem]">
          What will your health insurance{" "}
          <em className="font-medium italic text-brand">really</em> cost?
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Answer six questions and get an instant monthly estimate with an honest margin of error. No sign-up, no sales calls.
        </p>
        <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-soft">
          {TRUST_POINTS.map((point) => (
            <li key={point} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </section>

      {/* Calculator */}
      <section id="estimate" className="-mt-8 scroll-mt-24 md:-mt-14" aria-label="Premium calculator">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="card p-6 sm:p-8 lg:col-span-7">
            <div className="mb-7">
              <h2 className="font-serif text-2xl font-medium text-ink">Your profile</h2>
              <p className="mt-1 text-sm text-ink-soft">Six standard underwriting factors. That&apos;s all the model uses.</p>
            </div>

            <DemographicsForm
              values={profile}
              onChange={setProfile}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              live={live}
              onLiveChange={setLive}
              hasQuote={quote !== null}
              dirty={dirty}
            />
          </div>

          <div ref={resultsRef} className="scroll-mt-24 space-y-4 lg:sticky lg:top-24 lg:col-span-5" aria-live="polite">
            <ColdStartLoader status={status} />

            {errorMessage && (
              <div role="alert" className="card animate-fadeIn space-y-3 border-accent/40 bg-accent-soft/70 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-accent">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  {isStale ? "Couldn't refresh. Showing your last estimate." : "Notice"}
                </p>
                <p className="text-sm text-ink-soft">{errorMessage}</p>
                <button type="button" onClick={() => run(profile)} className="btn-quiet">
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  {status === "timeout" ? "Retry Calculation" : "Try again"}
                </button>
              </div>
            )}

            {quote && quotedProfile && !isLoading && (
              <div className="animate-fadeIn space-y-4">
                <QuoteCard quote={quote} profile={quotedProfile} updating={isUpdating} stale={isStale} />
                <ResultActions
                  profile={quotedProfile}
                  quote={quote}
                  isPinned={alreadyPinned}
                  canPin={alreadyPinned || pinned.length < MAX_PINNED}
                  pinLabel={pinLabel}
                  onPin={handleTogglePin}
                />
                <Disclaimer />
              </div>
            )}

            {!quote && !isLoading && !errorMessage && <EmptyState />}
          </div>
        </div>
      </section>

      {/* Deeper analysis, shown once there is an estimate */}
      {quote && quotedProfile && (
        <section className="space-y-5" aria-label="Explore your estimate">
          {whatIf && <WhatIfBadge whatIf={whatIf} />}
          <SensitivityExplorer profile={quotedProfile} currentMonthly={quote.predicted_monthly} />
          <CompareTray
            pinned={pinned}
            onRemove={(id) => setPinned((prev) => prev.filter((p) => p.id !== id))}
            onClear={() => setPinned([])}
          />
        </section>
      )}

      <div className="no-print space-y-20 md:space-y-28">
        <HowItWorks />
        <ModelFacts />
        <Faq />
      </div>

      {quote && (
        <>
          <p className="sr-only" role="status" aria-live="polite">
            {`Estimated premium ${formatUSD(quote.predicted_monthly)} per month.`}
          </p>
          <MobileSummaryBar
            quote={quote}
            visible={!resultsVisible}
            onView={() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          />
        </>
      )}
      </div>

      {quote && quotedProfile && (
        <PrintableReport quote={quote} profile={quotedProfile} whatIf={whatIf} pinned={pinned} />
      )}
    </>
  );
}
