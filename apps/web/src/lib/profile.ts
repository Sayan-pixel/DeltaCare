import { QuoteRequest, Region, Sex, Smoker } from "../types/quote";
import { BMI_MAX, BMI_MIN, clampBmi, roundBmi } from "./bmi";

export const LIMITS = {
  age: { min: 18, max: 100 },
  bmi: { min: BMI_MIN, max: BMI_MAX },
  children: { min: 0, max: 10 },
} as const;

export const REGION_LABELS: Record<Region, string> = {
  northeast: "Northeast",
  southeast: "Southeast",
  southwest: "Southwest",
  northwest: "Northwest",
};

export const INITIAL_PROFILE: QuoteRequest = {
  age: 35,
  sex: "male",
  bmi: 26.5,
  children: 0,
  smoker: "no",
  region: "northwest",
};

export interface Preset {
  id: string;
  label: string;
  profile: QuoteRequest;
}

export const PRESETS: Preset[] = [
  {
    id: "young-adult",
    label: "Healthy 28 yr",
    profile: { age: 28, sex: "female", bmi: 22.4, children: 0, smoker: "no", region: "northwest" },
  },
  {
    id: "family-parent",
    label: "Family of 4",
    profile: { age: 38, sex: "male", bmi: 26.8, children: 2, smoker: "no", region: "northeast" },
  },
  {
    id: "smoker-profile",
    label: "Smoker (42 yr)",
    profile: { age: 42, sex: "male", bmi: 31.2, children: 1, smoker: "yes", region: "southeast" },
  },
  {
    id: "senior-adult",
    label: "Older adult (60 yr)",
    profile: { age: 60, sex: "female", bmi: 27.5, children: 0, smoker: "no", region: "southwest" },
  },
];

/** Canonical comparison key for two profiles. */
export function profileKey(p: QuoteRequest): string {
  return `${p.age}|${p.sex}|${roundBmi(p.bmi).toFixed(1)}|${p.children}|${p.smoker}|${p.region}`;
}

/** Encodes a profile into shareable URL query parameters. */
export function profileToParams(p: QuoteRequest): URLSearchParams {
  return new URLSearchParams({
    age: String(p.age),
    sex: p.sex,
    bmi: roundBmi(p.bmi).toFixed(1),
    children: String(p.children),
    smoker: p.smoker,
    region: p.region,
  });
}

const VALID_SEXES: Sex[] = ["male", "female"];
const VALID_SMOKERS: Smoker[] = ["yes", "no"];
const VALID_REGIONS: Region[] = ["northeast", "southeast", "southwest", "northwest"];

/** Parses and validates a shared profile from URLSearchParams; returns null if empty or invalid. */
export function profileFromParams(params: URLSearchParams): QuoteRequest | null {
  const ageRaw = params.get("age");
  const sexRaw = params.get("sex");
  const bmiRaw = params.get("bmi");
  const childrenRaw = params.get("children");
  const smokerRaw = params.get("smoker");
  const regionRaw = params.get("region");

  if (!ageRaw && !sexRaw && !bmiRaw && !childrenRaw && !smokerRaw && !regionRaw) {
    return null;
  }

  const age = Number.parseInt(ageRaw ?? "", 10);
  const bmi = Number.parseFloat(bmiRaw ?? "");
  const children = Number.parseInt(childrenRaw ?? "", 10);

  if (
    !Number.isFinite(age) ||
    !Number.isFinite(bmi) ||
    !Number.isFinite(children) ||
    !VALID_SEXES.includes(sexRaw as Sex) ||
    !VALID_SMOKERS.includes(smokerRaw as Smoker) ||
    !VALID_REGIONS.includes(regionRaw as Region)
  ) {
    return null;
  }

  return {
    age: Math.min(LIMITS.age.max, Math.max(LIMITS.age.min, age)),
    sex: sexRaw as Sex,
    bmi: clampBmi(roundBmi(bmi)),
    children: Math.min(LIMITS.children.max, Math.max(LIMITS.children.min, children)),
    smoker: smokerRaw as Smoker,
    region: regionRaw as Region,
  };
}

/** Human-readable summary chips rendered on the quote card and compare tray. */
export function describeProfile(p: QuoteRequest): string[] {
  const childLabel = p.children === 1 ? "1 child" : `${p.children} children`;
  return [
    `Age ${p.age}`,
    p.sex === "male" ? "Male" : "Female",
    `BMI ${roundBmi(p.bmi).toFixed(1)}`,
    childLabel,
    p.smoker === "yes" ? "Smoker" : "Non-smoker",
    REGION_LABELS[p.region],
  ];
}

