// apps/projectnyra/src/components/ui/lead-score-ring.tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface LeadScoreRingProps {
  score: number;
  size?: number;
  showTooltip?: boolean;
  className?: string;
}

function scoreColor(score: number) {
  if (score >= 70) return "#00ccb2";
  if (score >= 40) return "#f59e0b";
  return "#f20d7a";
}

function scoreLabel(score: number) {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

export function LeadScoreRing({
  score,
  size = 44,
  showTooltip = false,
  className,
}: LeadScoreRingProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });

  const R = (size - 7) / 2;
  const CX = size / 2;
  const CY = size / 2;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC * (1 - score / 100);
  const color = scoreColor(score);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center group",
        className
      )}
    >
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={`Lead score: ${score} — ${scoreLabel(score)}`}
        role="img"
      >
        {/* Track ring */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={4.5}
        />

        {/* Score arc */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={inView ? { strokeDashoffset: dashOffset } : {}}
          transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        />

        {/* Score number */}
        <text
          x={CX}
          y={CY + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.28}
          fontWeight="800"
          fill={color}
        >
          {score}
        </text>
      </svg>

      {/* Tooltip on hover */}
      {showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
          <div
            style={{
              background: "rgba(4,4,14,0.95)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${color}40`,
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 11,
              color: "white",
              whiteSpace: "nowrap",
              boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
            }}
          >
            <div style={{ fontWeight: 700, color, marginBottom: 4 }}>
              {scoreLabel(score)} Lead — {score}/100
            </div>
            <div style={{ color: "#94a3b8", lineHeight: 1.6 }}>
              Credit: {Math.round(score * 0.4)}/40
              <br />
              Income: {Math.round(score * 0.35)}/35
              <br />
              Urgency: {Math.round(score * 0.25)}/25
            </div>
          </div>
          <div
            style={{
              width: 6,
              height: 6,
              background: "rgba(4,4,14,0.95)",
              transform: "rotate(45deg) translateY(-3px)",
            }}
          />
        </div>
      )}
    </div>
  );
}
