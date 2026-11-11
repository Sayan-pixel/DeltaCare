import { formatUSD } from "./format";

/**
 * Audited model benchmarks synchronized with apps/api/models/model_metadata.json.
 * Updating here keeps ModelFacts, Faq, and PrintableReport consistent across the UI.
 */
export const MODEL_BENCHMARKS = {
  modelName: "DeltaCare XGBoost Regressor",
  version: "1.0.0",
  r2Score: 0.8695,
  r2Display: "0.87",
  maeAnnual: 1645.52,
  maeMonthly: 137.13,
  datasetRows: 1338,
  trainRows: 1070,
  testRows: 268,
  floorAnnual: 1000.0,
} as const;

export const BENCHMARK_LABELS = {
  maeAnnual: `±${formatUSD(MODEL_BENCHMARKS.maeAnnual)}`,
  maeMonthly: `±${formatUSD(MODEL_BENCHMARKS.maeMonthly)}`,
  floorAnnual: `${formatUSD(MODEL_BENCHMARKS.floorAnnual)} / yr`,
  datasetRows: MODEL_BENCHMARKS.datasetRows.toLocaleString("en-US"),
} as const;

