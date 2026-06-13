"use client";

import { motion } from "framer-motion";

interface SankeyStage {
  label: string;
  count: number;
  dropoffPct: number;
}

const STAGES: SankeyStage[] = [
  { label: "Leads", count: 120, dropoffPct: 0 },
  { label: "Pre-Qual", count: 84, dropoffPct: 30 },
  { label: "Application", count: 52, dropoffPct: 38 },
  { label: "Processing", count: 31, dropoffPct: 40 },
  { label: "Closed", count: 18, dropoffPct: 42 },
];

const SVG_W = 640;
const SVG_H = 320;
const BAR_W = 80;
const GAP = (SVG_W - BAR_W * STAGES.length) / (STAGES.length - 1);
const MAX_H = SVG_H - 40;
const MAX_COUNT = STAGES[0].count;

function barHeight(count: number) {
  return Math.max(20, (count / MAX_COUNT) * MAX_H);
}

function barX(i: number) {
  return i * (BAR_W + GAP);
}

function barY(count: number) {
  return SVG_H - barHeight(count);
}

const INDIGO = "oklch(0.5038 0.2937 285.3753)";
const SEAFOAM = "oklch(0.8871 0.1828 166.5465)";
const PINK = "oklch(0.667 0.295 322.15)";

export function PipelineSankey() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
        Pipeline Funnel
      </h3>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-auto"
        aria-label="Pipeline funnel chart"
      >
        {/* Connector trapezoids between bars */}
        {STAGES.slice(0, -1).map((stage, i) => {
          const x1 = barX(i) + BAR_W;
          const y1top = barY(stage.count);
          const y1bot = SVG_H;
          const x2 = barX(i + 1);
          const next = STAGES[i + 1];
          const y2top = barY(next.count);
          const y2bot = SVG_H;
          return (
            <motion.path
              key={`conn-${i}`}
              d={`M${x1},${y1top} L${x2},${y2top} L${x2},${y2bot} L${x1},${y1bot} Z`}
              fill={INDIGO}
              fillOpacity={0.15}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 + 0.3, duration: 0.4 }}
            />
          );
        })}

        {/* Bars */}
        {STAGES.map((stage, i) => {
          const x = barX(i);
          const h = barHeight(stage.count);
          const y = barY(stage.count);
          const fill =
            i === 0 ? SEAFOAM : i === STAGES.length - 1 ? PINK : INDIGO;
          return (
            <g key={stage.label}>
              <motion.rect
                x={x}
                y={y}
                width={BAR_W}
                height={h}
                rx={8}
                fill={fill}
                fillOpacity={0.85}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.5,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                style={{ transformOrigin: `${x + BAR_W / 2}px ${SVG_H}px` }}
              />
              <text
                x={x + BAR_W / 2}
                y={y - 8}
                textAnchor="middle"
                fontSize={12}
                fill="white"
              >
                {stage.count}
              </text>
              <text
                x={x + BAR_W / 2}
                y={SVG_H + 16}
                textAnchor="middle"
                fontSize={10}
                fill="rgba(255,255,255,0.5)"
              >
                {stage.label}
              </text>
              {stage.dropoffPct > 0 && (
                <text
                  x={x + BAR_W / 2}
                  y={y + 16}
                  textAnchor="middle"
                  fontSize={10}
                  fill="rgba(255,255,255,0.4)"
                >
                  -{stage.dropoffPct}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
