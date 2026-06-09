"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const W = 560;
const H = 160;
const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

function generateActuals(): number[] {
  const seed: number[] = [];
  let v = 6.9;
  for (let i = 0; i < 30; i++) {
    v += (Math.random() - 0.52) * 0.04;
    v = Math.max(6.4, Math.min(7.6, v));
    seed.push(parseFloat(v.toFixed(3)));
  }
  return seed;
}

function linearRegression(ys: number[]): { slope: number; intercept: number } {
  const n = ys.length;
  const xs = ys.map((_, i) => i);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const slope =
    xs.reduce((acc, x, i) => acc + (x - meanX) * (ys[i] - meanY), 0) /
    xs.reduce((acc, x) => acc + (x - meanX) ** 2, 0);
  return { slope, intercept: meanY - slope * meanX };
}

function toSvgX(i: number, total: number) {
  return PAD.left + (i / (total - 1)) * INNER_W;
}

function toSvgY(v: number, min: number, max: number) {
  return PAD.top + INNER_H - ((v - min) / (max - min)) * INNER_H;
}

function pointsToPath(pts: [number, number][]) {
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
}

const ACTUALS = generateActuals();

export function RateForecastWidget() {
  const { actualPts, forecastPts, gradientId, min, max } = useMemo(() => {
    const allValues = [...ACTUALS];
    const { slope, intercept } = linearRegression(ACTUALS);
    const forecast: number[] = Array.from({ length: 14 }, (_, i) =>
      parseFloat((slope * (ACTUALS.length + i) + intercept).toFixed(3))
    );
    allValues.push(...forecast);
    const min = Math.min(...allValues) - 0.05;
    const max = Math.max(...allValues) + 0.05;
    const total = allValues.length;

    const actualPts: [number, number][] = ACTUALS.map((v, i) => [
      toSvgX(i, total),
      toSvgY(v, min, max),
    ]);
    const forecastPts: [number, number][] = forecast.map((v, i) => [
      toSvgX(ACTUALS.length + i, total),
      toSvgY(v, min, max),
    ]);

    return { actualPts, forecastPts, gradientId: "forecast-grad", min, max };
  }, []);

  const actualPath = pointsToPath(actualPts);
  const forecastPath = [
    `M${actualPts[actualPts.length - 1][0]},${actualPts[actualPts.length - 1][1]}`,
    ...forecastPts.map(([x, y]) => `L${x},${y}`),
  ].join(" ");

  const fillPath = `${actualPath} L${actualPts[actualPts.length - 1][0]},${H} L${actualPts[0][0]},${H} Z`;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white/80">
          30-Day Rate Trend
        </h3>
        <span className="text-[10px] text-white/30 italic">
          Trend estimate — not financial advice
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="oklch(0.5038 0.2937 285.3753)"
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor="oklch(0.5038 0.2937 285.3753)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <path d={fillPath} fill={`url(#${gradientId})`} />

        <motion.path
          d={actualPath}
          fill="none"
          stroke="oklch(0.5038 0.2937 285.3753)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        <motion.path
          d={forecastPath}
          fill="none"
          stroke="oklch(0.667 0.295 322.15)"
          strokeWidth={2}
          strokeDasharray="5 4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
        />

        {[min, (min + max) / 2, max].map((v) => {
          const y = toSvgY(v, min, max);
          return (
            <text
              key={v}
              x={PAD.left - 4}
              y={y + 4}
              textAnchor="end"
              fontSize={9}
              fill="rgba(255,255,255,0.3)"
            >
              {v.toFixed(2)}%
            </text>
          );
        })}

        <rect
          x={PAD.left}
          y={H - 12}
          width={8}
          height={2}
          fill="oklch(0.5038 0.2937 285.3753)"
        />
        <text
          x={PAD.left + 12}
          y={H - 6}
          fontSize={9}
          fill="rgba(255,255,255,0.4)"
        >
          Actual
        </text>
        <rect
          x={PAD.left + 60}
          y={H - 12}
          width={8}
          height={2}
          fill="oklch(0.667 0.295 322.15)"
        />
        <text
          x={PAD.left + 72}
          y={H - 6}
          fontSize={9}
          fill="rgba(255,255,255,0.4)"
        >
          14-day trend
        </text>
      </svg>
    </div>
  );
}
