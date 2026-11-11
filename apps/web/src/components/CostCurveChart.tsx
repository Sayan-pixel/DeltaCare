"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { LineChart, Loader2, RefreshCw } from "lucide-react";
import { cn } from "../lib/cn";
import { formatUSD } from "../lib/format";
import { calculateQuote } from "../services/api";
import { QuoteRequest } from "../types/quote";

type CurveAxis = "bmi" | "age";

interface CostCurveChartProps {
  profile: QuoteRequest;
  currentMonthly: number;
}

interface CurvePoint {
  x: number;
  nonSmokerMonthly: number;
  smokerMonthly: number;
}

const AXIS_POINTS: Record<CurveAxis, number[]> = {
  bmi: [18, 25, 32, 40],
  age: [22, 35, 50, 65],
};

const AXIS_BOUNDS: Record<CurveAxis, { min: number; max: number; label: string; unit: string }> = {
  bmi: { min: 18, max: 40, label: "Body Mass Index (BMI)", unit: "BMI" },
  age: { min: 22, max: 65, label: "Age (Years)", unit: "Age" },
};

const SVG_WIDTH = 560;
const SVG_HEIGHT = 220;
const PAD_LEFT = 54;
const PAD_RIGHT = 20;
const PAD_TOP = 18;
const PAD_BOTTOM = 34;

export const CostCurveChart: React.FC<CostCurveChartProps> = ({ profile, currentMonthly }) => {
  const [axis, setAxis] = useState<CurveAxis>("bmi");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState<CurvePoint[]>([]);
  const [loadedProfile, setLoadedProfile] = useState<QuoteRequest | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const loadCurve = useCallback(
    async (targetAxis: CurveAxis, targetProfile: QuoteRequest) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const xs = AXIS_POINTS[targetAxis];
        const results = await Promise.all(
          xs.map(async (x) => {
            const baseReq: QuoteRequest =
              targetAxis === "bmi"
                ? { ...targetProfile, bmi: x }
                : { ...targetProfile, age: x };

            const [nonSmokerRes, smokerRes] = await Promise.all([
              calculateQuote({ ...baseReq, smoker: "no" }, controller.signal),
              calculateQuote({ ...baseReq, smoker: "yes" }, controller.signal),
            ]);

            return {
              x,
              nonSmokerMonthly: nonSmokerRes.predicted_monthly,
              smokerMonthly: smokerRes.predicted_monthly,
            };
          })
        );

        if (!controller.signal.aborted) {
          setPoints(results);
          setLoadedProfile(targetProfile);
          setOpen(true);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Could not load curve points right now. Please try again shortly.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  const handleAxisSwitch = (nextAxis: CurveAxis) => {
    setAxis(nextAxis);
    if (open) {
      void loadCurve(nextAxis, profile);
    }
  };

  const bounds = AXIS_BOUNDS[axis];
  const plotW = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = SVG_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const allY = points.flatMap((p) => [p.nonSmokerMonthly, p.smokerMonthly]);
  if (open && loadedProfile) {
    allY.push(currentMonthly);
  }
  const maxY = allY.length > 0 ? Math.max(500, Math.ceil(Math.max(...allY) / 250) * 250) : 2500;

  const mapX = (xVal: number) =>
    PAD_LEFT + ((Math.min(bounds.max, Math.max(bounds.min, xVal)) - bounds.min) / (bounds.max - bounds.min)) * plotW;
  const mapY = (yVal: number) => PAD_TOP + plotH - (Math.min(maxY, Math.max(0, yVal)) / maxY) * plotH;

  const buildPath = (getter: (p: CurvePoint) => number) =>
    points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${mapX(p.x).toFixed(1)} ${mapY(getter(p)).toFixed(1)}`).join(" ");

  const activeX = axis === "bmi" ? profile.bmi : profile.age;

  return (
    <section className="card space-y-5 p-6 sm:p-7" aria-label="BMI and age cost curve">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <LineChart className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            Non-linear pricing curve
          </p>
          <h3 className="mt-1 font-serif text-xl font-medium text-ink">
            Smoker vs. non-smoker cost projection
          </h3>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Curve axis" className="inline-flex rounded-lg border border-line bg-paper/60 p-0.5">
            {(["bmi", "age"] as CurveAxis[]).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={axis === option}
                onClick={() => handleAxisSwitch(option)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold uppercase transition-colors",
                  axis === option ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => loadCurve(axis, profile)}
            disabled={loading}
            className="btn-quiet"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Loading…
              </>
            ) : open ? (
              <>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Refresh curve
              </>
            ) : (
              "Generate curve"
            )}
          </button>
        </div>
      </div>

      {!open && !loading && !error && (
        <p className="text-sm text-ink-soft">
          Plot how your estimated monthly premium scales across{" "}
          <strong className="font-semibold text-ink">{bounds.label}</strong> for smokers versus non-smokers on demand (uses cached model evaluations).
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}

      {open && points.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
              Smoker
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brand" aria-hidden="true" />
              Non-smoker
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-ink bg-surface" aria-hidden="true" />
              Your profile ({bounds.unit} {axis === "bmi" ? profile.bmi.toFixed(1) : profile.age})
            </span>
          </div>

          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="h-auto w-full min-w-[340px]"
              role="img"
              aria-label={`Monthly premium curve across ${bounds.label}`}
            >
              {[0, 0.5, 1].map((fraction) => {
                const yVal = maxY * fraction;
                const y = mapY(yVal);
                return (
                  <g key={fraction}>
                    <line
                      x1={PAD_LEFT}
                      x2={SVG_WIDTH - PAD_RIGHT}
                      y1={y}
                      y2={y}
                      stroke="rgb(var(--line))"
                      strokeDasharray={fraction === 0 ? undefined : "4 4"}
                    />
                    <text
                      x={PAD_LEFT - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-ink-faint text-[11px] tabular-nums"
                    >
                      {formatUSD(yVal)}
                    </text>
                  </g>
                );
              })}

              {points.map((p) => (
                <text
                  key={p.x}
                  x={mapX(p.x)}
                  y={SVG_HEIGHT - 10}
                  textAnchor="middle"
                  className="fill-ink-faint text-[11px] tabular-nums"
                >
                  {p.x}
                </text>
              ))}

              <path
                d={buildPath((p) => p.smokerMonthly)}
                fill="none"
                stroke="rgb(var(--accent))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={buildPath((p) => p.nonSmokerMonthly)}
                fill="none"
                stroke="rgb(var(--brand))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {points.map((p) => (
                <g key={p.x}>
                  <circle cx={mapX(p.x)} cy={mapY(p.smokerMonthly)} r="4" fill="rgb(var(--accent))">
                    <title>{`${bounds.unit} ${p.x} (Smoker): ${formatUSD(p.smokerMonthly)}/mo`}</title>
                  </circle>
                  <circle cx={mapX(p.x)} cy={mapY(p.nonSmokerMonthly)} r="4" fill="rgb(var(--brand))">
                    <title>{`${bounds.unit} ${p.x} (Non-smoker): ${formatUSD(p.nonSmokerMonthly)}/mo`}</title>
                  </circle>
                </g>
              ))}

              {activeX >= bounds.min && activeX <= bounds.max && (
                <circle
                  cx={mapX(activeX)}
                  cy={mapY(currentMonthly)}
                  r="6"
                  fill="rgb(var(--surface))"
                  stroke="rgb(var(--ink))"
                  strokeWidth="2.5"
                >
                  <title>{`Current profile (${bounds.unit} ${activeX}): ${formatUSD(currentMonthly)}/mo`}</title>
                </circle>
              )}
            </svg>
          </div>
        </div>
      )}
    </section>
  );
};

