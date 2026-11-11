export const BMI_MIN = 10.0;
export const BMI_MAX = 60.0;

export type BmiTone = "sky" | "emerald" | "amber" | "rose";

export interface BmiCategory {
  label: string;
  tone: BmiTone;
}

/** Clamps BMI within backend validation bounds [10.0, 60.0]. */
export function clampBmi(bmi: number): number {
  if (!Number.isFinite(bmi)) return 25.0;
  return Math.min(BMI_MAX, Math.max(BMI_MIN, bmi));
}

/** Rounds BMI to one decimal place. */
export function roundBmi(bmi: number): number {
  return Math.round(bmi * 10) / 10;
}

/** Maps a numeric BMI value to standard WHO clinical classification and UI tone. */
export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) {
    return { label: "Underweight", tone: "sky" };
  }
  if (bmi < 25.0) {
    return { label: "Normal weight", tone: "emerald" };
  }
  if (bmi < 30.0) {
    return { label: "Overweight", tone: "amber" };
  }
  return { label: "Obese (higher risk)", tone: "rose" };
}

