"use client";

import React, { useState } from "react";
import { ArrowRight, Cigarette, Loader2, Minus, Plus } from "lucide-react";
import { QuoteRequest, Region, Sex, Smoker } from "../types/quote";
import { BmiSlider } from "./BmiSlider";

interface DemographicsFormProps {
  values: QuoteRequest;
  onChange: (updated: QuoteRequest) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const REGION_OPTIONS: { id: Region; label: string; hint: string }[] = [
  { id: "northeast", label: "Northeast", hint: "NE" },
  { id: "northwest", label: "Northwest", hint: "NW" },
  { id: "southeast", label: "Southeast", hint: "SE" },
  { id: "southwest", label: "Southwest", hint: "SW" },
];

const AGE_MIN = 18;
const AGE_MAX = 100;
const CHILDREN_MAX = 10;

const clampAge = (n: number) => Math.min(AGE_MAX, Math.max(AGE_MIN, n));

const Section: React.FC<{ step: number; title: string; children: React.ReactNode }> = ({
  step,
  title,
  children,
}) => (
  <fieldset className="space-y-3">
    <legend className="mb-3 flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
        {step}
      </span>
      <span className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
    </legend>
    {children}
  </fieldset>
);

export const DemographicsForm: React.FC<DemographicsFormProps> = ({
  values,
  onChange,
  onSubmit,
  isLoading,
}) => {
  const [ageDraft, setAgeDraft] = useState<string>(String(values.age));

  const updateField = <K extends keyof QuoteRequest>(field: K, val: QuoteRequest[K]) => {
    onChange({ ...values, [field]: val });
  };

  const setAge = (next: number) => {
    const clamped = clampAge(next);
    setAgeDraft(String(clamped));
    updateField("age", clamped);
  };

  const handleAgeInput = (raw: string) => {
    setAgeDraft(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= AGE_MIN && parsed <= AGE_MAX) {
      updateField("age", parsed);
    }
  };

  const commitAge = () => {
    const parsed = parseInt(ageDraft, 10);
    setAge(isNaN(parsed) ? values.age : parsed);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {/* 1 — About you */}
      <Section step={1} title="About you">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="age" className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Age
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAge(values.age - 1)}
                disabled={isLoading || values.age <= AGE_MIN}
                className="step-btn"
                aria-label="Decrease age"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <input
                id="age"
                type="number"
                inputMode="numeric"
                min={AGE_MIN}
                max={AGE_MAX}
                value={ageDraft}
                onChange={(e) => handleAgeInput(e.target.value)}
                onBlur={commitAge}
                disabled={isLoading}
                className="field h-11 text-center text-lg"
                required
              />
              <button
                type="button"
                onClick={() => setAge(values.age + 1)}
                disabled={isLoading || values.age >= AGE_MAX}
                className="step-btn"
                aria-label="Increase age"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">Between {AGE_MIN} and {AGE_MAX} years</p>
          </div>

          <div>
            <span id="sex-label" className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Biological sex
            </span>
            <div role="group" aria-labelledby="sex-label" className="grid grid-cols-2 gap-2">
              {(["male", "female"] as Sex[]).map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => updateField("sex", gender)}
                  disabled={isLoading}
                  aria-pressed={values.sex === gender}
                  className={`tile h-11 text-sm font-semibold capitalize ${values.sex === gender ? "tile-active" : ""}`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 2 — Body */}
      <Section step={2} title="Body mass">
        <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-5 dark:border-white/10 dark:bg-slate-900/40">
          <BmiSlider value={values.bmi} onChange={(newBmi) => updateField("bmi", newBmi)} disabled={isLoading} />
        </div>
      </Section>

      {/* 3 — Lifestyle */}
      <Section step={3} title="Lifestyle">
        <div
          className={`rounded-2xl border p-4 transition-colors sm:p-5 ${
            values.smoker === "yes"
              ? "border-rose-300 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/20"
              : "border-slate-200/80 bg-white/60 dark:border-white/10 dark:bg-slate-900/40"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  values.smoker === "yes"
                    ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <Cigarette className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <span id="smoker-label" className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Tobacco use
                </span>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Cigarettes, cigars, or electronic nicotine devices.
                </p>
              </div>
            </div>

            <div role="group" aria-labelledby="smoker-label" className="flex gap-2">
              {(["no", "yes"] as Smoker[]).map((opt) => {
                const active = values.smoker === opt;
                const activeStyle =
                  opt === "yes"
                    ? "border-rose-500 bg-rose-500 text-white shadow-sm hover:bg-rose-500 hover:border-rose-500 dark:bg-rose-600"
                    : "border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-600 hover:border-emerald-600";
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateField("smoker", opt)}
                    disabled={isLoading}
                    aria-pressed={active}
                    className={`tile h-10 px-5 text-xs font-bold uppercase tracking-wide ${active ? activeStyle : ""}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* 4 — Household & region */}
      <Section step={4} title="Household & region">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="children" className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Dependent children
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateField("children", Math.max(0, values.children - 1))}
                disabled={isLoading || values.children <= 0}
                className="step-btn"
                aria-label="Decrease children count"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <input
                id="children"
                type="number"
                min={0}
                max={CHILDREN_MAX}
                value={values.children}
                readOnly
                className="field h-11 text-center text-lg"
              />
              <button
                type="button"
                onClick={() => updateField("children", Math.min(CHILDREN_MAX, values.children + 1))}
                disabled={isLoading || values.children >= CHILDREN_MAX}
                className="step-btn"
                aria-label="Increase children count"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div>
            <span id="region-label" className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
              US geographic region
            </span>
            <div role="group" aria-labelledby="region-label" className="grid grid-cols-2 gap-2">
              {REGION_OPTIONS.map((reg) => {
                const active = values.region === reg.id;
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => updateField("region", reg.id)}
                    disabled={isLoading}
                    aria-pressed={active}
                    className={`tile flex h-11 items-center justify-between px-3 text-sm font-semibold ${active ? "tile-active" : ""}`}
                  >
                    <span>{reg.label}</span>
                    <span className="text-[10px] font-bold opacity-50">{reg.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      <button
        type="submit"
        disabled={isLoading}
        className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 text-base font-bold text-white shadow-glow transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg active:scale-[0.985] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-70 dark:focus-visible:ring-emerald-900"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Calculating Quote...
          </>
        ) : (
          <>
            Calculate Health Insurance Estimate
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
};
