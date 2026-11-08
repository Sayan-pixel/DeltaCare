/**
 * TypeScript Data Contracts for DeltaCare
 * Synchronized with FastAPI Pydantic schemas (apps/api/src/schemas/quote.py)
 * Traceability: FR-005, FR-008, FR-009, ADR-003, ADR-008
 */

export type Sex = "male" | "female";
export type Smoker = "yes" | "no";
export type Region = "northeast" | "southeast" | "southwest" | "northwest";

export interface QuoteRequest {
  age: number;
  sex: Sex;
  bmi: number;
  children: number;
  smoker: Smoker;
  region: Region;
}

export interface QuoteResponse {
  predicted_annual: number;
  predicted_monthly: number;
  confidence_margin_annual: number;
  confidence_margin_monthly: number;
  range_annual: [number, number];
  range_monthly: [number, number];
  currency: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  model_loaded: boolean;
}

export interface WhatIfComparison {
  currentMonthly: number;
  currentAnnual: number;
  nonSmokerMonthly: number;
  nonSmokerAnnual: number;
  monthlySavings: number;
  annualSavings: number;
}

export type QuoteStatus = "idle" | "fast_loading" | "waking_server" | "success" | "error" | "timeout";

