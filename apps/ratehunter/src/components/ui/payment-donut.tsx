// apps/ratehunter/src/components/ui/payment-donut.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PaymentDonutProps {
  principal: number;
  interest: number;
  taxes: number;
  insurance: number;
  className?: string;
}

const SEGMENTS = [
  {
    key: "principal",
    label: "Principal",
    color: "oklch(0.5038 0.2937 285.3753)",
  },
  {
    key: "interest",
    label: "Interest",
    color: "oklch(0.8871 0.1828 166.5465)",
  },
  { key: "taxes", label: "Taxes", color: "oklch(0.667 0.295 322.15)" },
  { key: "insurance", label: "Insurance", color: "oklch(0.65 0.27 300)" },
] as const;

type SegmentKey = (typeof SEGMENTS)[number]["key"];

const R = 52;
const CX = 68;
const CY = 68;
const CIRC = 2 * Math.PI * R;

export function PaymentDonut({
  principal,
  interest,
  taxes,
  insurance,
  className,
}: PaymentDonutProps) {
  const [hovered, setHovered] = useState<SegmentKey | null>(null);
  const values: Record<SegmentKey, number> = {
    principal,
    interest,
    taxes,
    insurance,
  };
  const total = principal + interest + taxes + insurance;

  let accumulated = 0;
  const arcs = SEGMENTS.map((seg) => {
    const pct = values[seg.key] / total;
    const dashLen = CIRC * pct - 3;
    const dashOffset = -(CIRC * accumulated) + CIRC * 0.25;
    accumulated += pct;
    return { ...seg, dashLen, dashOffset, value: values[seg.key] };
  });

  const active = arcs.find((a) => a.key === hovered);

  return (
    <div className={cn("flex items-center gap-5", className)}>
      <svg
        width={136}
        height={136}
        viewBox="0 0 136 136"
        role="img"
        aria-label="Payment breakdown donut chart"
      >
        {/* Track */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={9}
        />

        {/* Animated segments */}
        {arcs.map((arc) => (
          <motion.circle
            key={arc.key}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={arc.color}
            strokeWidth={hovered === arc.key ? 13 : 9}
            strokeLinecap="round"
            strokeDashoffset={arc.dashOffset}
            initial={{ strokeDasharray: `0 ${CIRC}` }}
            animate={{
              strokeDasharray: `${arc.dashLen} ${CIRC - arc.dashLen}`,
            }}
            transition={{
              duration: 0.9,
              delay: arcs.indexOf(arc) * 0.08,
              ease: "easeOut",
            }}
            style={{
              cursor: "pointer",
              filter:
                hovered === arc.key
                  ? `drop-shadow(0 0 7px ${arc.color})`
                  : "none",
            }}
            onMouseEnter={() => setHovered(arc.key)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}

        {/* Center label */}
        <text
          x={CX}
          y={CY - 7}
          textAnchor="middle"
          fontSize={11}
          fontWeight="700"
          fill="white"
        >
          {active
            ? `$${active.value.toLocaleString()}`
            : `$${total.toLocaleString()}`}
        </text>
        <text x={CX} y={CY + 8} textAnchor="middle" fontSize={9} fill="#94a3b8">
          {active ? active.label : "total / mo"}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {arcs.map((arc) => (
          <div
            key={arc.key}
            className="flex items-center gap-2 cursor-default"
            onMouseEnter={() => setHovered(arc.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: arc.color }}
            />
            <span className="text-xs text-muted-foreground">{arc.label}</span>
            <span className="text-xs font-semibold ml-auto pl-3">
              ${arc.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
