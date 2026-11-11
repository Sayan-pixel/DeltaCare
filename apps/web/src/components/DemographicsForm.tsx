"use client";

import React, { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { INITIAL_PROFILE, LIMITS, Preset, profileKey, REGION_LABELS } from "../lib/profile";
import { QuoteRequest, Region, Sex, Smoker } from "../types/quote";
import { BmiCalculator } from "./BmiCalculator";
import { BmiSlider } from "./BmiSlider";
import { ChoiceGroup, ChoiceOption } from "./ChoiceGroup";
import { NumberStepper } from "./NumberStepper";
import { PresetBar } from "./PresetBar";
import { Switch } from "./Switch";

interface DemographicsFormProps {
  values: QuoteRequest;
  onChange: (updated: QuoteRequest) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  /** Auto-recalculate when inputs change. */
  live?: boolean;
  onLiveChange?: (live: boolean) => void;
  /** True once at least one estimate exists. */
  hasQuote?: boolean;
  /** True when the form differs from the estimate on screen. */
  dirty?: boolean;
}

const SEX_OPTIONS: ChoiceOption<Sex>[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const SMOKER_OPTIONS: ChoiceOption<Smoker>[] = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes", tone: "danger" },
];

const REGION_OPTIONS: ChoiceOption<Region>[] = (Object.keys(REGION_LABELS) as Region[]).map((id) => ({
  value: id,
  label: REGION_LABELS[id],
}));

const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-4 border-t border-line pt-6 first:border-t-0 first:pt-0">
    <h3 className="eyebrow">{title}</h3>
    {children}
  </section>
);

export const DemographicsForm: React.FC<DemographicsFormProps> = ({
  values,
  onChange,
  onSubmit,
  isLoading,
  live = false,
  onLiveChange,
  hasQuote = false,
  dirty = false,
}) => {
  const [undoProfile, setUndoProfile] = useState<QuoteRequest | null>(null);

  const update = <K extends keyof QuoteRequest>(field: K, val: QuoteRequest[K]) => {
    setUndoProfile(null);
    onChange({ ...values, [field]: val });
  };

  const applyPreset = (preset: Preset) => {
    if (profileKey(values) !== profileKey(preset.profile)) {
      setUndoProfile(values);
    }
    onChange({ ...preset.profile });
  };

  const handleUndoPreset = () => {
    if (!undoProfile) return;
    const prev = undoProfile;
    setUndoProfile(null);
    onChange({ ...prev });
  };

  const handleReset = () => {
    setUndoProfile(null);
    onChange({ ...INITIAL_PROFILE });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate aria-label="Your profile">
      <PresetBar
        current={values}
        onSelect={applyPreset}
        canUndo={undoProfile !== null}
        onUndo={handleUndoPreset}
        onReset={handleReset}
        disabled={isLoading}
      />

      <Group title="About you">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <NumberStepper
            id="age"
            label="Age"
            value={values.age}
            min={LIMITS.age.min}
            max={LIMITS.age.max}
            onChange={(age) => update("age", age)}
            hint={`${LIMITS.age.min}–${LIMITS.age.max} years`}
            disabled={isLoading}
          />
          <ChoiceGroup
            legend="Biological sex"
            name="sex"
            value={values.sex}
            options={SEX_OPTIONS}
            onChange={(sex) => update("sex", sex)}
            disabled={isLoading}
          />
        </div>
      </Group>

      <Group title="Body">
        <BmiSlider value={values.bmi} onChange={(bmi) => update("bmi", bmi)} disabled={isLoading} />
        <BmiCalculator onApply={(bmi) => update("bmi", bmi)} disabled={isLoading} />
      </Group>

      <Group title="Lifestyle &amp; household">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ChoiceGroup
            legend="Tobacco use"
            description="Cigarettes, cigars or e-cigarettes"
            name="smoker"
            value={values.smoker}
            options={SMOKER_OPTIONS}
            onChange={(smoker) => update("smoker", smoker)}
            disabled={isLoading}
          />
          <NumberStepper
            id="children"
            label="Dependent children"
            value={values.children}
            min={LIMITS.children.min}
            max={LIMITS.children.max}
            onChange={(children) => update("children", children)}
            hint={`Up to ${LIMITS.children.max}`}
            disabled={isLoading}
          />
        </div>
        <ChoiceGroup
          legend="US region"
          name="region"
          value={values.region}
          options={REGION_OPTIONS}
          columns={4}
          onChange={(region) => update("region", region)}
          disabled={isLoading}
        />
      </Group>

      <div className="space-y-4 border-t border-line pt-6">
        {onLiveChange && (
          <Switch
            id="live-mode"
            checked={live}
            onChange={onLiveChange}
            label="Update as I change things"
            description="Re-price automatically a moment after each edit."
            disabled={isLoading}
          />
        )}

        <button type="submit" disabled={isLoading} className="btn-primary w-full text-base">
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Calculating…
            </>
          ) : (
            <>
              {hasQuote ? (dirty ? "Update estimate" : "Recalculate") : "Get my estimate"}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </>
          )}
        </button>

        {hasQuote && dirty && !live && (
          <p className="text-center text-xs text-accent" role="status">
            You&apos;ve changed your profile since the last estimate.
          </p>
        )}
      </div>
    </form>
  );
};
