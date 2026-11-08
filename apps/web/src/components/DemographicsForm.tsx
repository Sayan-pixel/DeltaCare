"use client";

import React from "react";
import { QuoteRequest, Region, Sex, Smoker } from "../types/quote";
import { BmiSlider } from "./BmiSlider";

interface DemographicsFormProps {
  values: QuoteRequest;
  onChange: (updated: QuoteRequest) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const REGION_OPTIONS: { id: Region; label: string }[] = [
  { id: "northeast", label: "Northeast" },
  { id: "southeast", label: "Southeast" },
  { id: "northwest", label: "Northwest" },
  { id: "southwest", label: "Southwest" },
];

export const DemographicsForm: React.FC<DemographicsFormProps> = ({
  values,
  onChange,
  onSubmit,
  isLoading,
}) => {
  const updateField = <K extends keyof QuoteRequest>(field: K, val: QuoteRequest[K]) => {
    onChange({ ...values, [field]: val });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Age & Sex Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Age Input */}
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Age (Years)
          </label>
          <div className="relative">
            <input
              id="age"
              type="number"
              min={18}
              max={100}
              value={values.age}
              onChange={(e) => updateField("age", Math.min(100, Math.max(18, parseInt(e.target.value) || 18)))}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              required
            />
            <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">18-100</span>
          </div>
        </div>

        {/* Biological Sex Toggle */}
        <div>
          <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Biological Sex
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(["male", "female"] as Sex[]).map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => updateField("sex", gender)}
                disabled={isLoading}
                className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all capitalize ${
                  values.sex === gender
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500 font-semibold"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                } disabled:opacity-50`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive BMI Slider */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <BmiSlider
          value={values.bmi}
          onChange={(newBmi) => updateField("bmi", newBmi)}
          disabled={isLoading}
        />
      </div>

      {/* Tobacco Smoker Toggle with High-Visibility Cue */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div>
            <span className="block text-sm font-semibold text-slate-900 dark:text-white">
              Tobacco Use (Smoker)
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cigarettes, cigars, or electronic nicotine devices.
            </p>
          </div>
          <div className="flex gap-2">
            {(["no", "yes"] as Smoker[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateField("smoker", opt)}
                disabled={isLoading}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-all uppercase tracking-wide ${
                  values.smoker === opt
                    ? opt === "yes"
                      ? "border-rose-500 bg-rose-500 text-white shadow-sm"
                      : "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                } disabled:opacity-50`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dependents & Region Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Dependents Stepper */}
        <div>
          <label htmlFor="children" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Dependent Children
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => updateField("children", Math.max(0, values.children - 1))}
              disabled={isLoading || values.children <= 0}
              className="w-10 h-10 flex items-center justify-center border border-r-0 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-l-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 font-bold"
              aria-label="Decrease children count"
            >
              -
            </button>
            <input
              id="children"
              type="number"
              min={0}
              max={10}
              value={values.children}
              readOnly
              className="w-full text-center h-10 border-y border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
            />
            <button
              type="button"
              onClick={() => updateField("children", Math.min(10, values.children + 1))}
              disabled={isLoading || values.children >= 10}
              className="w-10 h-10 flex items-center justify-center border border-l-0 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-r-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 font-bold"
              aria-label="Increase children count"
            >
              +
            </button>
          </div>
        </div>

        {/* Geographic Region */}
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            US Geographic Region
          </label>
          <select
            id="region"
            value={values.region}
            onChange={(e) => updateField("region", e.target.value as Region)}
            disabled={isLoading}
            className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-900 dark:text-white font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 capitalize"
          >
            {REGION_OPTIONS.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calculate Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-900 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-60 flex items-center justify-center gap-2 text-base cursor-pointer"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Calculating Quote...
          </>
        ) : (
          "Calculate Health Insurance Estimate"
        )}
      </button>
    </form>
  );
};

