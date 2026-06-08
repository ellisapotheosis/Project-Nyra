# Phase 1 — Tier S UI Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all 10 Tier S features across ratehunter.net and projectnyra.com — the highest-conversion, most memorable UI elements from the approved design spec.

**Architecture:** All new components are `"use client"` and follow the Magic UI pattern (source copied to `src/components/ui/` or `src/components/`). No new npm packages required for Phase 1. Glassmorphism uses pure CSS (`backdrop-filter`). Mock rate data via a `useRates()` hook so all rate components share a single data source.

**Tech Stack:** Next.js 15 App Router · Framer Motion · Canvas 2D · SVG · canvas-confetti (already installed) · TypeScript strict mode

**Spec:** `docs/superpowers/specs/2026-06-07-ui-upgrade-design.md`

---

## File Map

### New files — ratehunter

| File                                                   | Purpose                                                   |
| ------------------------------------------------------ | --------------------------------------------------------- |
| `apps/ratehunter/src/hooks/useRates.ts`                | Shared mock rate data hook (swap for real endpoint later) |
| `apps/ratehunter/src/components/ui/rate-heartbeat.tsx` | Live rate sparkline with color-coded trend                |
| `apps/ratehunter/src/components/ui/ink-reveal.tsx`     | Scroll-triggered wipe-in reveal wrapper                   |
| `apps/ratehunter/src/components/ui/rate-card-3d.tsx`   | 3D flip card: rate front / APR breakdown back             |
| `apps/ratehunter/src/components/ui/payment-donut.tsx`  | SVG donut with animated segments + hover tooltip          |
| `apps/ratehunter/src/components/RateLockWidget.tsx`    | Floating countdown timer + lock CTA                       |
| `apps/ratehunter/src/components/RateParticleCloud.tsx` | Canvas particle field, one particle per lender offer      |

### Modified files — ratehunter

| File                               | Change                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `apps/ratehunter/src/app/page.tsx` | Import + mount all Phase 1 components; wire NumberTicker with prefix/suffix |

### New files — projectnyra

| File                                                     | Purpose                                      |
| -------------------------------------------------------- | -------------------------------------------- |
| `apps/projectnyra/src/components/ui/lead-score-ring.tsx` | Animated SVG ring showing lead quality score |
| `apps/projectnyra/src/components/ai-sidebar.tsx`         | Right-side AI chat drawer (Cmd+Shift+N)      |
| `apps/projectnyra/src/components/rate-wall.tsx`          | Live-updating lender rate mosaic grid        |

### Modified files — projectnyra

| File                                                  | Change                                             |
| ----------------------------------------------------- | -------------------------------------------------- |
| `apps/projectnyra/src/components/site-header.tsx`     | Add AI sidebar state + keyboard shortcut trigger   |
| `apps/projectnyra/src/app/(broker)/pipeline/page.tsx` | Mount LeadScoreRing on lead cards + RateWall panel |

---

## Task 1: useRates hook (shared mock data)

**Files:**

- Create: `apps/ratehunter/src/hooks/useRates.ts`

- [ ] **Step 1: Create the hook**

```typescript
// apps/ratehunter/src/hooks/useRates.ts
"use client";

import { useState, useEffect } from "react";

export interface LenderRate {
  id: string;
  name: string;
  rate: number;
  apr: number;
  monthly: number;
  points: number;
  closingCosts: number;
  loanType: string;
}

const BASE_RATES: LenderRate[] = [
  {
    id: "rocket",
    name: "Rocket Mortgage",
    rate: 6.875,
    apr: 7.12,
    monthly: 2847,
    points: 0.5,
    closingCosts: 4200,
    loanType: "Conv 30yr",
  },
  {
    id: "wells",
    name: "Wells Fargo",
    rate: 6.75,
    apr: 7.01,
    monthly: 2820,
    points: 0.25,
    closingCosts: 3800,
    loanType: "Conv 30yr",
  },
  {
    id: "chase",
    name: "Chase",
    rate: 6.625,
    apr: 6.89,
    monthly: 2793,
    points: 0,
    closingCosts: 3500,
    loanType: "Conv 30yr",
  },
  {
    id: "better",
    name: "Better.com",
    rate: 6.5,
    apr: 6.74,
    monthly: 2766,
    points: 0,
    closingCosts: 2900,
    loanType: "FHA 30yr",
  },
  {
    id: "uwm",
    name: "UWM",
    rate: 6.375,
    apr: 6.61,
    monthly: 2739,
    points: 0.5,
    closingCosts: 3200,
    loanType: "VA 30yr",
  },
  {
    id: "loandepot",
    name: "loanDepot",
    rate: 7.0,
    apr: 7.24,
    monthly: 2874,
    points: 0.75,
    closingCosts: 4500,
    loanType: "Conv 30yr",
  },
  {
    id: "pennymac",
    name: "PennyMac",
    rate: 6.875,
    apr: 7.09,
    monthly: 2847,
    points: 0.5,
    closingCosts: 4100,
    loanType: "Conv 30yr",
  },
  {
    id: "freedom",
    name: "Freedom",
    rate: 6.75,
    apr: 6.98,
    monthly: 2820,
    points: 0,
    closingCosts: 3600,
    loanType: "USDA",
  },
];

export function useRates(live = false) {
  const [rates, setRates] = useState<LenderRate[]>(BASE_RATES);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setRates((prev) =>
        prev.map((r) => ({
          ...r,
          rate: parseFloat((r.rate + (Math.random() - 0.5) * 0.012).toFixed(3)),
        }))
      );
    }, 4000);
    return () => clearInterval(id);
  }, [live]);

  const best = rates.reduce((a, b) => (a.rate < b.rate ? a : b));
  return { rates, best };
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /home/ellisapotheosis/repos/project-nyra && rtk pnpm -C apps/ratehunter exec tsc --noEmit 2>&1 | head -20
```

Expected: no errors referencing `useRates.ts`

- [ ] **Step 3: Commit**

```bash
git add apps/ratehunter/src/hooks/useRates.ts
git commit -m "feat(ratehunter): add useRates mock data hook"
```

---

## Task 2: RateHeartbeat component

**Files:**

- Create: `apps/ratehunter/src/components/ui/rate-heartbeat.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/ratehunter/src/components/ui/rate-heartbeat.tsx
"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RateHeartbeatProps {
  currentRate?: number;
  weeklyAverage?: number;
  width?: number;
  height?: number;
  className?: string;
}

export function RateHeartbeat({
  currentRate = 6.625,
  weeklyAverage = 6.75,
  width = 320,
  height = 56,
  className,
}: RateHeartbeatProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ data: [] as number[], t: 0, raf: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const POINTS = 80;
    const isFavorable = currentRate <= weeklyAverage;
    const lineColor = isFavorable ? "#00CCB2" : "#F59E0B";

    // Seed with smooth noise
    stateRef.current.data = Array.from(
      { length: POINTS },
      (_, i) =>
        currentRate + Math.sin(i * 0.25) * 0.07 + Math.cos(i * 0.11) * 0.04
    );

    function draw() {
      const { data, t } = stateRef.current;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Advance waveform
      const next =
        currentRate +
        Math.sin(t * 0.14) * 0.055 +
        Math.sin(t * 0.33) * 0.025 +
        Math.cos(t * 0.07) * 0.03;
      data.push(next);
      if (data.length > POINTS) data.shift();
      stateRef.current.t += 0.5;

      const min = Math.min(...data) - 0.04;
      const max = Math.max(...data) + 0.04;
      const range = max - min || 0.1;
      const W = canvas!.width;
      const H = canvas!.height;

      const toY = (v: number) => H - ((v - min) / range) * H * 0.82 - 4;

      // Fill under curve
      const grad = ctx!.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, lineColor + "50");
      grad.addColorStop(1, lineColor + "00");
      ctx!.beginPath();
      data.forEach((v, i) => {
        const x = (i / (POINTS - 1)) * W;
        i === 0 ? ctx!.moveTo(x, toY(v)) : ctx!.lineTo(x, toY(v));
      });
      ctx!.lineTo(W, H);
      ctx!.lineTo(0, H);
      ctx!.closePath();
      ctx!.fillStyle = grad;
      ctx!.fill();

      // Stroke line
      ctx!.beginPath();
      ctx!.strokeStyle = lineColor;
      ctx!.lineWidth = 1.5;
      ctx!.shadowColor = lineColor;
      ctx!.shadowBlur = 8;
      data.forEach((v, i) => {
        const x = (i / (POINTS - 1)) * W;
        i === 0 ? ctx!.moveTo(x, toY(v)) : ctx!.lineTo(x, toY(v));
      });
      ctx!.stroke();
      ctx!.shadowBlur = 0;

      // Live dot at trailing edge
      const lastX = W;
      const lastY = toY(data[data.length - 1]);
      ctx!.beginPath();
      ctx!.arc(lastX - 2, lastY, 3.5, 0, Math.PI * 2);
      ctx!.fillStyle = lineColor;
      ctx!.shadowColor = lineColor;
      ctx!.shadowBlur = 10;
      ctx!.fill();
      ctx!.shadowBlur = 0;

      stateRef.current.raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(stateRef.current.raf);
  }, [currentRate, weeklyAverage]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={cn("block", className)}
      aria-label={`Live rate feed: ${currentRate}% — ${currentRate <= weeklyAverage ? "below" : "above"} weekly average`}
    />
  );
}
```

- [ ] **Step 2: Dev server check**

Start ratehunter dev server if not running:

```bash
cd /home/ellisapotheosis/repos/project-nyra && rtk pnpm -C apps/ratehunter dev &
```

Add a temporary import in `apps/ratehunter/src/app/page.tsx` and visually confirm the animated sparkline appears. Remove after confirming.

- [ ] **Step 3: TypeScript check**

```bash
rtk pnpm -C apps/ratehunter exec tsc --noEmit 2>&1 | grep "rate-heartbeat" || echo "No errors"
```

- [ ] **Step 4: Commit**

```bash
git add apps/ratehunter/src/components/ui/rate-heartbeat.tsx
git commit -m "feat(ratehunter): add RateHeartbeat animated sparkline component"
```

---

## Task 3: InkReveal component

**Files:**

- Create: `apps/ratehunter/src/components/ui/ink-reveal.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/ratehunter/src/components/ui/ink-reveal.tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface InkRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function InkReveal({
  children,
  delay = 0,
  duration = 0.75,
  className,
}: InkRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {children}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, oklch(0.5038 0.2937 285.3753), oklch(0.667 0.295 322.15))",
          transformOrigin: "left center",
          zIndex: 10,
        }}
        initial={{ scaleX: 1 }}
        animate={inView ? { scaleX: 0 } : { scaleX: 1 }}
        transition={{
          delay,
          duration,
          ease: [0.76, 0, 0.24, 1],
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
rtk pnpm -C apps/ratehunter exec tsc --noEmit 2>&1 | grep "ink-reveal" || echo "No errors"
```

- [ ] **Step 3: Commit**

```bash
git add apps/ratehunter/src/components/ui/ink-reveal.tsx
git commit -m "feat(ratehunter): add InkReveal scroll-triggered wipe transition component"
```

---

## Task 4: RateCard3D component

**Files:**

- Create: `apps/ratehunter/src/components/ui/rate-card-3d.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/ratehunter/src/components/ui/rate-card-3d.tsx
"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LenderRate } from "@/hooks/useRates";

interface RateCard3DProps {
  lender: LenderRate;
  isBest?: boolean;
  className?: string;
}

export function RateCard3D({ lender, isBest, className }: RateCard3DProps) {
  const [flipped, setFlipped] = useState(false);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (flipped) return;
    const r = cardRef.current!.getBoundingClientRect();
    setRotY(((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 9);
    setRotX(-(((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 9));
  }

  function onMouseLeave() {
    if (!flipped) {
      setRotX(0);
      setRotY(0);
    }
  }

  return (
    <div
      ref={cardRef}
      className={cn("cursor-pointer select-none", className)}
      style={{ perspective: "900px" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={() => {
        setFlipped((f) => !f);
        setRotX(0);
        setRotY(0);
      }}
      role="button"
      aria-label={`${lender.name} rate card — click to flip`}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
    >
      <motion.div
        animate={{ rotateX: flipped ? 180 : rotX, rotateY: flipped ? 0 : rotY }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        style={{
          transformStyle: "preserve-3d",
          position: "relative",
          width: "100%",
          minHeight: 120,
        }}
      >
        {/* Front */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          className={cn(
            "absolute inset-0 rounded-xl border p-4 bg-card flex flex-col justify-between",
            isBest
              ? "border-[oklch(0.8871_0.1828_166.5465)] shadow-[0_0_22px_rgba(0,204,178,0.22)]"
              : "border-border"
          )}
        >
          <div>
            {isBest && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-[oklch(0.8871_0.1828_166.5465)] mb-1 block">
                Best Rate
              </span>
            )}
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {lender.name}
            </div>
            <div
              className={cn(
                "text-3xl font-black mt-1",
                isBest
                  ? "text-[oklch(0.8871_0.1828_166.5465)]"
                  : "text-foreground"
              )}
            >
              {lender.rate.toFixed(3)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              ${lender.monthly.toLocaleString()}/mo
            </div>
          </div>
          <div className="text-[9px] text-muted-foreground opacity-50 mt-2">
            Click for full breakdown →
          </div>
        </div>

        {/* Back */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          className="absolute inset-0 rounded-xl border border-[oklch(0.5038_0.2937_285.3753)] p-4 bg-card shadow-[0_0_24px_rgba(80,56,255,0.2)] flex flex-col"
        >
          <div className="text-[9px] font-bold uppercase tracking-widest text-[oklch(0.5038_0.2937_285.3753)] mb-3">
            Full Breakdown
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {[
              ["Rate", `${lender.rate.toFixed(3)}%`],
              ["APR", `${lender.apr.toFixed(3)}%`],
              ["Monthly", `$${lender.monthly.toLocaleString()}`],
              ["Points", `${lender.points}`],
              ["Closing Costs", `$${lender.closingCosts.toLocaleString()}`],
              ["Loan Type", lender.loanType],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold">{val}</span>
              </div>
            ))}
          </div>
          <div className="text-[9px] text-muted-foreground opacity-50 mt-2">
            Click to flip back
          </div>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
rtk pnpm -C apps/ratehunter exec tsc --noEmit 2>&1 | grep "rate-card-3d" || echo "No errors"
```

- [ ] **Step 3: Commit**

```bash
git add apps/ratehunter/src/components/ui/rate-card-3d.tsx
git commit -m "feat(ratehunter): add RateCard3D flip card component"
```

---

## Task 5: PaymentDonut component

**Files:**

- Create: `apps/ratehunter/src/components/ui/payment-donut.tsx`

- [ ] **Step 1: Create the component**

```tsx
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
    // SVG circles start at 3 o'clock; we want 12 o'clock, so offset by -25% of circumference
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
```

- [ ] **Step 2: TypeScript check**

```bash
rtk pnpm -C apps/ratehunter exec tsc --noEmit 2>&1 | grep "payment-donut" || echo "No errors"
```

- [ ] **Step 3: Commit**

```bash
git add apps/ratehunter/src/components/ui/payment-donut.tsx
git commit -m "feat(ratehunter): add PaymentDonut animated SVG breakdown chart"
```

---

## Task 6: RateLockWidget component

**Files:**

- Create: `apps/ratehunter/src/components/RateLockWidget.tsx`

- [ ] **Step 1: Create the component**

Note: `canvas-confetti` is already in `apps/ratehunter/package.json`. The import uses `@types/canvas-confetti` type signature.

```tsx
// apps/ratehunter/src/components/RateLockWidget.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface RateLockWidgetProps {
  rate?: number;
  lender?: string;
  onLock?: () => void;
}

function formatTime(seconds: number) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function RateLockWidget({
  rate = 6.375,
  lender = "UWM",
  onLock,
}: RateLockWidgetProps) {
  const [seconds, setSeconds] = useState(23 * 3600 + 47 * 60 + 12);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  function handleLock() {
    if (locked) return;
    setLocked(true);
    confetti({
      particleCount: 130,
      spread: 85,
      origin: { y: 0.65 },
      colors: ["#5038ff", "#00ccb2", "#f20d7a", "#8f14ed", "#ffffff"],
    });
    onLock?.();
  }

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2.2, type: "spring", stiffness: 200, damping: 22 }}
    >
      {/* Gradient border wrapper */}
      <div
        style={{
          background: locked
            ? "linear-gradient(135deg, #00ccb2, #5038ff)"
            : "linear-gradient(135deg, rgba(80,56,255,0.5), rgba(242,13,122,0.3))",
          padding: "1px",
          borderRadius: "18px",
          boxShadow: locked
            ? "0 0 30px rgba(0,204,178,0.35)"
            : "0 8px 32px rgba(0,0,0,0.4)",
          transition: "background 0.5s, box-shadow 0.5s",
        }}
      >
        <div
          style={{
            background: "rgba(4,4,14,0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "17px",
            padding: "18px 22px",
            minWidth: "230px",
          }}
        >
          <AnimatePresence mode="wait">
            {!locked ? (
              <motion.div
                key="unlocked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 4,
                  }}
                >
                  {lender} · {rate.toFixed(3)}% — rate valid for
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: seconds < 3600 ? "#f20d7a" : "#f59e0b",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "0.04em",
                    marginBottom: 14,
                  }}
                >
                  {formatTime(seconds)}
                </div>
                <button
                  onClick={handleLock}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: "11px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, oklch(0.5038 0.2937 285.3753), oklch(0.8871 0.1828 166.5465))",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                  }}
                >
                  🔒 Lock My Rate
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="locked"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "4px 0" }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: "#00ccb2" }}
                >
                  Rate Locked!
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    marginTop: 5,
                    lineHeight: 1.45,
                  }}
                >
                  A licensed broker will
                  <br />
                  contact you shortly.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
rtk pnpm -C apps/ratehunter exec tsc --noEmit 2>&1 | grep "RateLockWidget" || echo "No errors"
```

If you see `Cannot find module 'canvas-confetti'`, install the type definitions:

```bash
rtk pnpm -C apps/ratehunter add -D @types/canvas-confetti
```

- [ ] **Step 3: Commit**

```bash
git add apps/ratehunter/src/components/RateLockWidget.tsx
git commit -m "feat(ratehunter): add RateLockWidget floating countdown + confetti lock"
```

---

## Task 7: RateParticleCloud component

**Files:**

- Create: `apps/ratehunter/src/components/RateParticleCloud.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/ratehunter/src/components/RateParticleCloud.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { LenderRate } from "@/hooks/useRates";

interface Particle {
  lender: LenderRate;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  selected: boolean;
}

interface RateParticleCloudProps {
  rates: LenderRate[];
  className?: string;
  onSelect?: (lender: LenderRate) => void;
}

export function RateParticleCloud({
  rates,
  className,
  onSelect,
}: RateParticleCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const [selected, setSelected] = useState<LenderRate | null>(null);

  const buildParticles = useCallback(
    (w: number, h: number) => {
      const minRate = Math.min(...rates.map((r) => r.rate));
      const maxRate = Math.max(...rates.map((r) => r.rate));
      const span = maxRate - minRate || 0.5;

      particlesRef.current = rates.map((lender, i) => {
        const pct = (lender.rate - minRate) / span;
        // Arrange horizontally by rate, stagger vertically
        const targetX = 55 + pct * (w - 110);
        const targetY = h / 2 + Math.sin(i * 1.05 + 0.4) * (h * 0.22);
        const color =
          pct < 0.34
            ? "oklch(0.8871 0.1828 166.5465)" // seafoam — best rates
            : pct < 0.67
              ? "oklch(0.5038 0.2937 285.3753)" // indigo — mid
              : "oklch(0.667 0.295 322.15)"; // pink — expensive
        return {
          lender,
          x: Math.random() * w,
          y: Math.random() * h,
          targetX,
          targetY,
          radius: 22 - pct * 8, // best rates get bigger bubbles
          color,
          vx: 0,
          vy: 0,
          selected: false,
        };
      });
    },
    [rates]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    buildParticles(W, H);

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      for (const p of particlesRef.current) {
        // Spring physics toward target
        p.vx = p.vx * 0.82 + (p.targetX - p.x) * 0.07;
        p.vy = p.vy * 0.82 + (p.targetY - p.y) * 0.07;
        p.x += p.vx;
        p.y += p.vy;

        // Glow halo
        const grd = ctx!.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius + 10
        );
        grd.addColorStop(
          0,
          p.color.replace("oklch", "oklch") +
            " / 0.35)"
              .replace(")", " / 0.35)")
              .replace("oklch(", "oklch(")
              .replace("/ 0.35)", "/ 0.35)")
        );
        // Simpler: use hex-style rgba for the glow
        const glowAlpha = p.selected ? "55" : "30";
        const hexColor = p.color.includes("0.8871")
          ? `#00ccb2${glowAlpha}`
          : p.color.includes("0.5038")
            ? `#5038ff${glowAlpha}`
            : `#f20d7a${glowAlpha}`;
        const hexSolid = p.color.includes("0.8871")
          ? "#00ccb2"
          : p.color.includes("0.5038")
            ? "#5038ff"
            : "#f20d7a";

        const glow = ctx!.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius + 12
        );
        glow.addColorStop(0, hexColor);
        glow.addColorStop(1, "transparent");
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius + 12, 0, Math.PI * 2);
        ctx!.fillStyle = glow;
        ctx!.fill();

        // Bubble
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = p.selected ? hexSolid + "40" : hexSolid + "18";
        ctx!.strokeStyle = hexSolid;
        ctx!.lineWidth = p.selected ? 2 : 1.2;
        if (p.selected) {
          ctx!.shadowColor = hexSolid;
          ctx!.shadowBlur = 12;
        }
        ctx!.fill();
        ctx!.stroke();
        ctx!.shadowBlur = 0;

        // Rate label
        ctx!.fillStyle = p.selected ? "#ffffff" : "#e2e8f0";
        ctx!.font = `${p.selected ? "bold " : ""}${Math.round(p.radius * 0.52)}px ui-sans-serif,system-ui,sans-serif`;
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillText(`${p.lender.rate.toFixed(3)}%`, p.x, p.y);
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [rates, buildParticles]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    let hit: Particle | null = null;
    for (const p of particlesRef.current) {
      if (Math.hypot(p.x - mx, p.y - my) <= p.radius + 4) {
        hit = p;
        break;
      }
    }

    particlesRef.current.forEach((p) => {
      p.selected = false;
    });
    if (hit) {
      hit.selected = true;
      setSelected(hit.lender);
      onSelect?.(hit.lender);
    } else {
      setSelected(null);
    }
  }

  return (
    <div className={className} style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={640}
        height={180}
        onClick={handleClick}
        style={{
          width: "100%",
          height: "auto",
          cursor: "pointer",
          display: "block",
        }}
        aria-label="Interactive rate comparison. Click a bubble to select a lender."
        role="application"
      />
      {selected && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(4,4,14,0.92)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(0,204,178,0.3)",
            borderRadius: 10,
            padding: "8px 18px",
            fontSize: 12,
            color: "white",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          <strong style={{ color: "#00ccb2" }}>{selected.name}</strong>
          {" · "}
          {selected.rate.toFixed(3)}% · ${selected.monthly.toLocaleString()}/mo
          · {selected.loanType}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
rtk pnpm -C apps/ratehunter exec tsc --noEmit 2>&1 | grep -i "particle\|useRates" || echo "No errors"
```

- [ ] **Step 3: Commit**

```bash
git add apps/ratehunter/src/components/RateParticleCloud.tsx
git commit -m "feat(ratehunter): add RateParticleCloud canvas particle comparison widget"
```

---

## Task 8: Wire ratehunter page.tsx

**Files:**

- Modify: `apps/ratehunter/src/app/page.tsx`

Read the current file first:

```bash
head -60 apps/ratehunter/src/app/page.tsx
```

- [ ] **Step 1: Add imports**

Add these imports at the top of the file, after existing component imports:

```tsx
import { RateHeartbeat } from "@/components/ui/rate-heartbeat";
import { InkReveal } from "@/components/ui/ink-reveal";
import { RateCard3D } from "@/components/ui/rate-card-3d";
import { PaymentDonut } from "@/components/ui/payment-donut";
import { RateLockWidget } from "@/components/RateLockWidget";
import { RateParticleCloud } from "@/components/RateParticleCloud";
import { useRates } from "@/hooks/useRates";
import { NumberTicker } from "@/components/ui/number-ticker";
```

- [ ] **Step 2: Add page-level data hook**

Near the top of the page component (before the return statement), add:

```tsx
const { rates, best } = useRates(true); // live=true enables 4s drift
```

- [ ] **Step 3: Mount Savings Counter in the hero section**

Find the hero heading area. Add below the headline:

```tsx
<InkReveal delay={0.3} className="inline-block mt-2">
  <div className="flex items-baseline gap-1">
    <span className="text-sm text-muted-foreground">Save up to</span>
    <NumberTicker
      value={47280}
      prefix="$"
      suffix=" over 30 years"
      className="text-2xl font-black text-[oklch(0.8871_0.1828_166.5465)]"
    />
  </div>
</InkReveal>
```

- [ ] **Step 4: Mount RateHeartbeat below the hero**

```tsx
<InkReveal delay={0.5} className="mt-6">
  <div className="flex items-center gap-3 mb-1">
    <span className="text-xs text-muted-foreground uppercase tracking-wider">
      Live Rate Feed
    </span>
    <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.8871_0.1828_166.5465)] animate-pulse" />
  </div>
  <RateHeartbeat
    currentRate={best.rate}
    weeklyAverage={6.75}
    width={400}
    height={56}
  />
</InkReveal>
```

- [ ] **Step 5: Mount RateParticleCloud as the rate comparison section**

Replace or augment the existing rate comparison table section:

```tsx
<section className="w-full mt-12">
  <InkReveal>
    <h2 className="text-lg font-bold mb-2">Compare Today's Rates</h2>
    <p className="text-sm text-muted-foreground mb-4">
      Click a bubble to select. Seafoam = best available.
    </p>
  </InkReveal>
  <RateParticleCloud
    rates={rates}
    onSelect={(lender) => console.log("Selected:", lender.name)}
  />
</section>
```

- [ ] **Step 6: Mount RateCard3D grid**

Below the particle cloud, add a grid of flip cards:

```tsx
<section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-8 min-h-[120px]">
  {rates.slice(0, 8).map((lender) => (
    <RateCard3D
      key={lender.id}
      lender={lender}
      isBest={lender.id === best.id}
    />
  ))}
</section>
```

- [ ] **Step 7: Mount PaymentDonut in the calculator section**

Find the payment calculator or loan estimator section. Add beside or below it:

```tsx
<PaymentDonut
  principal={1240}
  interest={1380}
  taxes={320}
  insurance={130}
  className="mt-4"
/>
```

- [ ] **Step 8: Mount RateLockWidget**

Add as a sibling to the main page content (it's fixed-position, so location in DOM doesn't matter visually):

```tsx
<RateLockWidget rate={best.rate} lender={best.name} />
```

- [ ] **Step 9: Full TypeScript check**

```bash
rtk pnpm -C apps/ratehunter exec tsc --noEmit 2>&1
```

Expected: 0 errors. Fix any that appear before committing.

- [ ] **Step 10: Dev server visual check**

Verify in browser on `http://localhost:3000`:

- [ ] Savings counter ticks up on scroll-enter
- [ ] Heartbeat sparkline animates
- [ ] Particle cloud bubbles spring into position
- [ ] RateCard3D cards tilt on hover and flip on click
- [ ] PaymentDonut segments animate on load
- [ ] RateLockWidget appears bottom-right after ~2s delay
- [ ] Clicking Lock fires confetti + transitions to locked state
- [ ] Aurora background still visible and smooth (no frame drops)

- [ ] **Step 11: Commit**

```bash
git add apps/ratehunter/src/app/page.tsx
git commit -m "feat(ratehunter): wire Phase 1 Tier S components into page"
```

---

## Task 9: LeadScoreRing component (projectnyra)

**Files:**

- Create: `apps/projectnyra/src/components/ui/lead-score-ring.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/projectnyra/src/components/ui/lead-score-ring.tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface LeadScoreRingProps {
  score: number; // 0–100
  size?: number; // diameter in px (default 44)
  showTooltip?: boolean;
  className?: string;
}

function scoreColor(score: number) {
  if (score >= 70) return "#00ccb2"; // seafoam — hot
  if (score >= 40) return "#f59e0b"; // amber — warm
  return "#f20d7a"; // pink — cold
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
              border: `0 0 1px 1px solid ${color}40`,
            }}
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
rtk pnpm -C apps/projectnyra exec tsc --noEmit 2>&1 | grep "lead-score-ring" || echo "No errors"
```

- [ ] **Step 3: Commit**

```bash
git add apps/projectnyra/src/components/ui/lead-score-ring.tsx
git commit -m "feat(projectnyra): add LeadScoreRing animated SVG score indicator"
```

---

## Task 10: AiSidebar component (projectnyra)

**Files:**

- Create: `apps/projectnyra/src/components/ai-sidebar.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/projectnyra/src/components/ai-sidebar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, X, Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  leadContext?: string;
}

const NEXUS_URL = process.env.NEXT_PUBLIC_NEXUS_ROUTER_URL ?? "";

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi, I'm Nyra. Ask me about your pipeline, leads, or current rates. What do you need?",
};

export function AiSidebar({ isOpen, onClose, leadContext }: AiSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch(`${NEXUS_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          ...(leadContext && { context: `Current lead: ${leadContext}` }),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        response?: string;
        message?: string;
      };
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response ?? data.message ?? "Got it — anything else?",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Nexus Router is offline. Check the infra dashboard and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40"
            style={{
              background: "rgba(0,0,0,0.25)",
              backdropFilter: "blur(2px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
            style={{
              width: 360,
              background: "rgba(4,4,14,0.97)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderLeft: "1px solid rgba(80,56,255,0.25)",
              boxShadow: "-10px 0 50px rgba(80,56,255,0.12)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 310, damping: 32 }}
            aria-label="Ask Nyra AI sidebar"
            role="complementary"
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 16px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, oklch(0.5038 0.2937 285.3753), oklch(0.8871 0.1828 166.5465))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 0 14px rgba(80,56,255,0.5)",
                }}
              >
                <Bot size={16} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
                  Ask Nyra
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "oklch(0.8871 0.1828 166.5465)",
                    marginTop: 1,
                  }}
                >
                  ● Online {leadContext && `— ${leadContext}`}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: 6,
                  lineHeight: 0,
                }}
                aria-label="Close AI sidebar"
              >
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "84%",
                      padding: "9px 13px",
                      borderRadius:
                        msg.role === "user"
                          ? "14px 14px 4px 14px"
                          : "14px 14px 14px 4px",
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg, oklch(0.5038 0.2937 285.3753), oklch(0.65 0.27 300))"
                          : "rgba(255,255,255,0.055)",
                      border:
                        msg.role === "assistant"
                          ? "1px solid rgba(255,255,255,0.07)"
                          : "none",
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      color: "white",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Loader2
                    size={13}
                    color="oklch(0.5038 0.2937 285.3753)"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    Nyra is thinking…
                  </span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div
              style={{
                padding: "10px 12px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Ask about your pipeline…"
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.055)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 12.5,
                  color: "white",
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.4,
                }}
              />
              <button
                onClick={() => void send()}
                disabled={loading || !input.trim()}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "none",
                  background:
                    "linear-gradient(135deg, oklch(0.5038 0.2937 285.3753), oklch(0.8871 0.1828 166.5465))",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: loading || !input.trim() ? 0.4 : 1,
                  transition: "opacity 0.15s",
                  flexShrink: 0,
                }}
                aria-label="Send message"
              >
                <Send size={13} />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
rtk pnpm -C apps/projectnyra exec tsc --noEmit 2>&1 | grep "ai-sidebar" || echo "No errors"
```

- [ ] **Step 3: Commit**

```bash
git add apps/projectnyra/src/components/ai-sidebar.tsx
git commit -m "feat(projectnyra): add AiSidebar Cmd+Shift+N AI chat drawer"
```

---

## Task 11: RateWall component (projectnyra)

**Files:**

- Create: `apps/projectnyra/src/components/rate-wall.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/projectnyra/src/components/rate-wall.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RateTile {
  id: string;
  lender: string;
  rate: number;
  loanType: string;
}

const INITIAL_RATES: RateTile[] = [
  { id: "rocket", lender: "Rocket", rate: 6.875, loanType: "Conv 30yr" },
  { id: "wells", lender: "Wells", rate: 6.75, loanType: "Conv 30yr" },
  { id: "chase", lender: "Chase", rate: 6.625, loanType: "Conv 30yr" },
  { id: "better", lender: "Better", rate: 6.5, loanType: "FHA" },
  { id: "uwm", lender: "UWM", rate: 6.375, loanType: "VA" },
  { id: "loandepot", lender: "loanDepot", rate: 7.0, loanType: "Conv 30yr" },
  { id: "pennymac", lender: "PennyMac", rate: 6.875, loanType: "Conv 30yr" },
  { id: "freedom", lender: "Freedom", rate: 6.75, loanType: "USDA" },
  { id: "flagstar", lender: "Flagstar", rate: 6.625, loanType: "Conv 15yr" },
  { id: "newrez", lender: "NewRez", rate: 6.875, loanType: "Jumbo" },
  { id: "caliber", lender: "Caliber", rate: 7.125, loanType: "Conv 30yr" },
  { id: "amerisave", lender: "AmeriSave", rate: 6.75, loanType: "FHA" },
];

interface RateWallProps {
  className?: string;
}

export function RateWall({ className }: RateWallProps) {
  const [tiles, setTiles] = useState<RateTile[]>(INITIAL_RATES);

  // Simulate live rate drift every 3.5s
  useEffect(() => {
    const id = setInterval(() => {
      setTiles((prev) =>
        prev.map((t) => ({
          ...t,
          rate: parseFloat(
            Math.max(
              5.5,
              Math.min(8.5, t.rate + (Math.random() - 0.5) * 0.018)
            ).toFixed(3)
          ),
        }))
      );
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const minRate = Math.min(...tiles.map((t) => t.rate));

  return (
    <div
      className={cn("grid gap-2", className)}
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))" }}
      aria-label="Live lender rate wall"
      role="list"
    >
      {tiles.map((tile) => {
        const isBest = tile.rate <= minRate + 0.125;
        return (
          <motion.div
            key={tile.id}
            role="listitem"
            animate={{
              borderColor: isBest
                ? "rgba(0,204,178,0.45)"
                : "rgba(255,255,255,0.07)",
              boxShadow: isBest ? "0 0 18px rgba(0,204,178,0.13)" : "none",
              background: isBest
                ? "rgba(0,204,178,0.055)"
                : "rgba(255,255,255,0.022)",
            }}
            transition={{ duration: 0.7 }}
            style={{
              borderRadius: 10,
              border: "1px solid",
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 4,
              }}
            >
              {tile.lender}
            </div>
            <motion.div
              key={tile.rate}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: 16,
                fontWeight: 800,
                fontVariantNumeric: "tabular-nums",
                color: isBest ? "#00ccb2" : "#e2e8f0",
                lineHeight: 1,
              }}
            >
              {tile.rate.toFixed(3)}%
            </motion.div>
            <div style={{ fontSize: 9, color: "#475569", marginTop: 3 }}>
              {tile.loanType}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
rtk pnpm -C apps/projectnyra exec tsc --noEmit 2>&1 | grep "rate-wall" || echo "No errors"
```

- [ ] **Step 3: Commit**

```bash
git add apps/projectnyra/src/components/rate-wall.tsx
git commit -m "feat(projectnyra): add RateWall live lender rate mosaic grid"
```

---

## Task 12: Wire projectnyra — site-header + pipeline page

**Files:**

- Modify: `apps/projectnyra/src/components/site-header.tsx`
- Modify: `apps/projectnyra/src/app/(broker)/pipeline/page.tsx`

Read both files before editing:

```bash
cat apps/projectnyra/src/components/site-header.tsx
cat apps/projectnyra/src/app/(broker)/pipeline/page.tsx
```

### site-header.tsx changes

- [ ] **Step 1: Add AiSidebar import + keyboard shortcut**

At the top of the file, after existing imports:

```tsx
import { AiSidebar } from "@/components/ai-sidebar";
```

Inside the `SiteHeader` component, add a state variable (it already has `useState`):

```tsx
const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
```

Add a `useEffect` for the keyboard shortcut (add after existing useEffects, or create a new one):

```tsx
useEffect(() => {
  function handleKey(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "N") {
      e.preventDefault();
      setAiSidebarOpen((o) => !o);
    }
  }
  document.addEventListener("keydown", handleKey);
  return () => document.removeEventListener("keydown", handleKey);
}, []);
```

Add a trigger button in the header nav (next to the `NotificationBell` or at the end of the nav items):

```tsx
<button
  onClick={() => setAiSidebarOpen(true)}
  title="Ask Nyra (⌘⇧N)"
  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
>
  <Bot size={14} />
  <span className="hidden sm:inline">Ask Nyra</span>
</button>
```

Add `Bot` to existing lucide-react imports.

At the very end of the returned JSX (before or after `CommandPalette`):

```tsx
<AiSidebar isOpen={aiSidebarOpen} onClose={() => setAiSidebarOpen(false)} />
```

### pipeline/page.tsx changes

- [ ] **Step 2: Add RateWall + LeadScoreRing imports**

```tsx
import { RateWall } from "@/components/rate-wall";
import { LeadScoreRing } from "@/components/ui/lead-score-ring";
```

- [ ] **Step 3: Add RateWall panel to the pipeline page**

Add a new panel section (before or after the KanbanBoard, inside the page layout):

```tsx
<section className="mt-8">
  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
    Live Market Rates
  </h2>
  <RateWall />
</section>
```

- [ ] **Step 4: Add LeadScoreRing to lead cards**

Find where lead cards are rendered (likely inside KanbanBoard or a leads list). The score ring should accompany each lead. Look for where `applications` or `leads` data is mapped.

The ring component is self-contained — add it alongside lead name/contact info:

```tsx
<LeadScoreRing
  score={lead.score ?? 72} // use real score field or fallback
  size={40}
  showTooltip
  className="flex-shrink-0"
/>
```

If there's no `score` field on the lead type yet, use a deterministic mock:

```tsx
score={45 + (lead.id.charCodeAt(0) % 55)}
```

- [ ] **Step 5: Full projectnyra TypeScript check**

```bash
rtk pnpm -C apps/projectnyra exec tsc --noEmit 2>&1
```

Expected: 0 errors.

- [ ] **Step 6: Dev server visual check for projectnyra**

Verify on `http://localhost:3001` (or whatever port projectnyra runs on):

- [ ] `Cmd+Shift+N` opens the AI sidebar with slide-in animation
- [ ] "Ask Nyra" button in header triggers the sidebar
- [ ] Sidebar sends to Nexus Router (or shows graceful offline state)
- [ ] `Escape` closes the sidebar
- [ ] RateWall tiles visible on pipeline page, rates drift every ~3.5s
- [ ] LeadScoreRing visible on lead cards, animates in on mount
- [ ] Hover on score ring shows tooltip breakdown

- [ ] **Step 7: Commit**

```bash
git add apps/projectnyra/src/components/site-header.tsx apps/projectnyra/src/app/\(broker\)/pipeline/page.tsx
git commit -m "feat(projectnyra): wire AiSidebar, LeadScoreRing, and RateWall into shell"
```

---

## Task 14: AnimatedBeam Pipeline Status (projectnyra)

**Files:**

- Create: `apps/projectnyra/src/components/ui/animated-beam.tsx`
- Create: `apps/projectnyra/src/components/LoanPipelineBeam.tsx`
- Modify: `apps/projectnyra/src/app/(broker)/pipeline/page.tsx` (add LoanPipelineBeam to loan detail cards)

**Source:** `docs/superpowers/specs/2026-06-07-ui-upgrade-design.md` — feature #51

- [ ] **Step 1: Create the AnimatedBeam base component**

```tsx
// apps/projectnyra/src/components/ui/animated-beam.tsx
"use client";

import { RefObject, useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedBeamProps {
  containerRef: RefObject<HTMLDivElement | null>;
  fromRef: RefObject<HTMLDivElement | null>;
  toRef: RefObject<HTMLDivElement | null>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  className?: string;
}

function getCenter(
  containerRef: RefObject<HTMLDivElement | null>,
  elRef: RefObject<HTMLDivElement | null>
) {
  const c = containerRef.current?.getBoundingClientRect();
  const e = elRef.current?.getBoundingClientRect();
  if (!c || !e) return { x: 0, y: 0 };
  return { x: e.left - c.left + e.width / 2, y: e.top - c.top + e.height / 2 };
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  pathColor = "rgba(255,255,255,0.07)",
  pathWidth = 2,
  gradientStartColor = "oklch(0.5038 0.2937 285.3753)",
  gradientStopColor = "oklch(0.8871 0.1828 166.5465)",
  delay = 0,
  duration = 3,
  className,
}: AnimatedBeamProps) {
  const uid = useId();
  const pathRef = useRef<SVGPathElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [pathD, setPathD] = useState("");
  const [pathLen, setPathLen] = useState(200);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setDims({ w: r.width, h: r.height });
      const from = getCenter(containerRef, fromRef);
      const to = getCenter(containerRef, toRef);
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2 - curvature;
      setPathD(`M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`);
    };
    update();
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [containerRef, fromRef, toRef, curvature]);

  useEffect(() => {
    if (pathRef.current && pathD) {
      setPathLen(pathRef.current.getTotalLength());
    }
  }, [pathD]);

  const beamLen = pathLen * 0.2;
  const gapLen = pathLen * 0.8;

  return (
    <svg
      className={cn("pointer-events-none absolute inset-0", className)}
      width={dims.w}
      height={dims.h}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`beam-grad-${uid}`} gradientUnits="userSpaceOnUse">
          <stop
            offset="0%"
            stopColor={reverse ? gradientStopColor : gradientStartColor}
            stopOpacity={0}
          />
          <stop
            offset="40%"
            stopColor={reverse ? gradientStopColor : gradientStartColor}
          />
          <stop
            offset="60%"
            stopColor={reverse ? gradientStartColor : gradientStopColor}
          />
          <stop
            offset="100%"
            stopColor={reverse ? gradientStartColor : gradientStopColor}
            stopOpacity={0}
          />
        </linearGradient>
      </defs>
      {pathD && (
        <path
          d={pathD}
          fill="none"
          stroke={pathColor}
          strokeWidth={pathWidth}
          strokeLinecap="round"
        />
      )}
      {pathD && pathLen > 0 && (
        <motion.path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke={`url(#beam-grad-${uid})`}
          strokeWidth={pathWidth * 1.6}
          strokeLinecap="round"
          strokeDasharray={`${beamLen} ${gapLen}`}
          initial={{ strokeDashoffset: reverse ? -pathLen : pathLen }}
          animate={{ strokeDashoffset: reverse ? pathLen : -pathLen }}
          transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
        />
      )}
    </svg>
  );
}
```

- [ ] **Step 2: Create LoanPipelineBeam wrapper**

Note: all 5 stage refs are declared individually — **never call `useRef` inside `.map()`** as that violates React's rules of hooks.

```tsx
// apps/projectnyra/src/components/LoanPipelineBeam.tsx
"use client";

import { useRef } from "react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: "preapproval", label: "Pre-Approval", icon: "🏦" },
  { id: "processing", label: "Processing", icon: "📋" },
  { id: "underwriting", label: "Underwriting", icon: "🔍" },
  { id: "approval", label: "Approval", icon: "✅" },
  { id: "closing", label: "Closing", icon: "🔑" },
] as const;

interface LoanPipelineBeamProps {
  currentStage?: number; // 0–4
  borrowerName?: string;
  loanAmount?: string;
  className?: string;
}

export function LoanPipelineBeam({
  currentStage = 2,
  borrowerName,
  loanAmount,
  className,
}: LoanPipelineBeamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Declare refs individually — hooks must not go inside .map()
  const ref0 = useRef<HTMLDivElement>(null);
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);
  const ref4 = useRef<HTMLDivElement>(null);
  const stageRefs = [ref0, ref1, ref2, ref3, ref4];

  return (
    <div className={cn("relative w-full", className)}>
      {(borrowerName || loanAmount) && (
        <div className="flex items-center gap-3 mb-3 text-sm">
          {borrowerName && (
            <span className="font-semibold">{borrowerName}</span>
          )}
          {loanAmount && (
            <span className="text-muted-foreground">{loanAmount}</span>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground uppercase tracking-wider">
            {STAGES[currentStage].label}
          </span>
        </div>
      )}
      <div
        ref={containerRef}
        className="relative flex items-center justify-between py-5 px-2"
        style={{ minHeight: 80 }}
      >
        {stageRefs.map((ref, i) => (
          <div
            key={STAGES[i].id}
            ref={ref}
            className="relative z-10 flex flex-col items-center gap-1.5"
          >
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-500",
                i < currentStage
                  ? "border-[oklch(0.8871_0.1828_166.5465)] bg-[oklch(0.8871_0.1828_166.5465)]/15 shadow-[0_0_10px_rgba(0,204,178,0.35)]"
                  : i === currentStage
                    ? "border-[oklch(0.5038_0.2937_285.3753)] bg-[oklch(0.5038_0.2937_285.3753)]/15 shadow-[0_0_14px_rgba(80,56,255,0.45)] scale-110"
                    : "border-white/10 bg-white/[0.03]"
              )}
            >
              {STAGES[i].icon}
            </div>
            <span
              className={cn(
                "text-[9px] uppercase tracking-wider font-medium",
                i <= currentStage
                  ? "text-foreground"
                  : "text-muted-foreground/40"
              )}
            >
              {STAGES[i].label}
            </span>
          </div>
        ))}

        {/* Beams between each adjacent stage pair */}
        {stageRefs.slice(0, -1).map((fromRef, i) => (
          <AnimatedBeam
            key={i}
            containerRef={containerRef}
            fromRef={fromRef}
            toRef={stageRefs[i + 1]}
            duration={2.2 + i * 0.25}
            delay={i * 0.15}
            pathColor={
              i < currentStage
                ? "rgba(0,204,178,0.12)"
                : "rgba(255,255,255,0.04)"
            }
            gradientStartColor={
              i < currentStage
                ? "oklch(0.8871 0.1828 166.5465)"
                : "oklch(0.5038 0.2937 285.3753)"
            }
            gradientStopColor={
              i < currentStage
                ? "oklch(0.5038 0.2937 285.3753)"
                : "oklch(0.65 0.27 300)"
            }
            curvature={-20}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add LoanPipelineBeam to pipeline page**

In `apps/projectnyra/src/app/(broker)/pipeline/page.tsx`, add import:

```tsx
import { LoanPipelineBeam } from "@/components/LoanPipelineBeam";
```

Add inside each loan/application card (find where `applications` data maps to card components):

```tsx
<LoanPipelineBeam
  currentStage={app.stage ?? 2}
  borrowerName={app.borrowerName}
  loanAmount={
    app.loanAmount ? `$${Number(app.loanAmount).toLocaleString()}` : undefined
  }
  className="mt-3"
/>
```

If `app.stage` doesn't exist yet, derive a deterministic value for the mock:

```tsx
currentStage={Math.floor((app.id.charCodeAt(0) % 5))}
```

- [ ] **Step 4: TypeScript check**

```bash
rtk pnpm -C apps/projectnyra exec tsc --noEmit 2>&1 | grep -i "beam\|pipeline" || echo "No errors"
```

- [ ] **Step 5: Commit**

```bash
git add apps/projectnyra/src/components/ui/animated-beam.tsx \
        apps/projectnyra/src/components/LoanPipelineBeam.tsx \
        apps/projectnyra/src/app/\(broker\)/pipeline/page.tsx
git commit -m "feat(projectnyra): add AnimatedBeam + LoanPipelineBeam loan stage tracker"
```

---

## Task 15: EncryptedText Welcome (projectnyra)

**Files:**

- Create: `apps/projectnyra/src/components/ui/encrypted-text.tsx`
- Modify: broker dashboard page (or layout header) to use `<EncryptedText>` on the welcome heading

**Source:** `docs/superpowers/specs/2026-06-07-ui-upgrade-design.md` — feature #52

- [ ] **Step 1: Create the EncryptedText component**

```tsx
// apps/projectnyra/src/components/ui/encrypted-text.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?><~";

interface EncryptedTextProps {
  text: string;
  duration?: number;
  trigger?: "mount" | "hover" | "inView";
  className?: string;
}

export function EncryptedText({
  text,
  duration = 750,
  trigger = "inView",
  className,
}: EncryptedTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(containerRef, { once: true });
  const animating = useRef(false);

  const [displayed, setDisplayed] = useState(
    trigger === "mount"
      ? text.replace(
          /\S/g,
          () => CHARSET[Math.floor(Math.random() * CHARSET.length)]
        )
      : text
  );

  const scramble = useCallback(() => {
    if (animating.current) return;
    animating.current = true;
    const chars = text.split("");
    const startTime = performance.now();

    function frame(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const revealCount = Math.floor(progress * chars.length);
      setDisplayed(
        chars
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (i < revealCount) return ch;
            return CHARSET[Math.floor(Math.random() * CHARSET.length)];
          })
          .join("")
      );
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setDisplayed(text);
        animating.current = false;
      }
    }
    requestAnimationFrame(frame);
  }, [text, duration]);

  useEffect(() => {
    if (trigger === "mount") scramble();
  }, [trigger, scramble]);

  useEffect(() => {
    if (trigger === "inView" && inView) scramble();
  }, [trigger, inView, scramble]);

  return (
    <span
      ref={containerRef}
      className={cn("font-mono", className)}
      onMouseEnter={trigger === "hover" ? scramble : undefined}
      aria-label={text}
    >
      {displayed}
    </span>
  );
}
```

- [ ] **Step 2: Find the broker dashboard page**

```bash
find apps/projectnyra/src/app -name "page.tsx" | head -15
```

Look for a dashboard or overview page — typically `apps/projectnyra/src/app/(broker)/dashboard/page.tsx` or `apps/projectnyra/src/app/(broker)/page.tsx`.

- [ ] **Step 3: Wire EncryptedText into the welcome heading**

In the dashboard page, add import:

```tsx
import { EncryptedText } from "@/components/ui/encrypted-text";
```

Find the main page heading (e.g., `<h1>Dashboard</h1>` or a welcome message) and wrap it:

```tsx
<h1 className="text-2xl font-black tracking-tight">
  <EncryptedText
    text="Welcome back"
    trigger="mount"
    duration={900}
    className="text-foreground"
  />
</h1>
```

For broker name (if available from session/auth):

```tsx
<EncryptedText
  text={`Welcome back, ${brokerName}`}
  trigger="mount"
  duration={1100}
/>
```

Also add a hover-triggered version on the "Project Nyra" wordmark in the site header:

In `apps/projectnyra/src/components/site-header.tsx`, wrap the brand name:

```tsx
import { EncryptedText } from "@/components/ui/encrypted-text";

// In JSX where the brand name appears:
<EncryptedText text="Project Nyra" trigger="hover" duration={600} />;
```

- [ ] **Step 4: TypeScript check**

```bash
rtk pnpm -C apps/projectnyra exec tsc --noEmit 2>&1 | grep -i "encrypted" || echo "No errors"
```

- [ ] **Step 5: Dev server check**

On `http://localhost:3001`:

- [ ] Dashboard welcome heading scrambles through matrix characters on page load
- [ ] Hovering the "Project Nyra" brand name in the header triggers a 600ms scramble
- [ ] Characters visible during scramble are uppercase + symbols (not lowercase)
- [ ] `aria-label` preserves the original text for screen readers (check DevTools Accessibility panel)

- [ ] **Step 6: Commit**

```bash
git add apps/projectnyra/src/components/ui/encrypted-text.tsx
git commit -m "feat(projectnyra): add EncryptedText matrix scramble reveal component"
```

---

## Task 16: Phase 1 validation gate

- [ ] **Step 1: Full TypeScript check — both apps**

```bash
rtk pnpm -C apps/ratehunter exec tsc --noEmit 2>&1 && rtk pnpm -C apps/projectnyra exec tsc --noEmit 2>&1
```

Expected: no output (zero errors). Fix any errors before proceeding.

- [ ] **Step 2: Lint both apps**

```bash
rtk pnpm -C apps/ratehunter lint 2>&1 | tail -10 && rtk pnpm -C apps/projectnyra lint 2>&1 | tail -10
```

- [ ] **Step 3: Aurora performance check**

On `localhost:3000`, open Chrome DevTools → Performance tab. Record 5 seconds with all Phase 1 components mounted. Check:

- [ ] Frames column shows mostly green (60fps target)
- [ ] No layout thrash from canvas animation (canvas reads/writes are isolated)
- [ ] `backdrop-filter` on RateLockWidget doesn't cause repaints on the aurora layer

- [ ] **Step 4: Final commit + summary**

```bash
git add -u
git commit -m "feat: complete Phase 1 Tier S UI upgrade — 12 components across both apps

Ratehunter: RateParticleCloud, Savings Counter, RateHeartbeat, InkReveal,
RateCard3D, RateLockWidget, PaymentDonut

Projectnyra: AiSidebar (Cmd+Shift+N), LeadScoreRing, RateWall,
AnimatedBeam/LoanPipelineBeam, EncryptedText"
```

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-06-07-phase1-tier-s.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — Fresh subagent per task, review between tasks, fast iteration. Use `superpowers:subagent-driven-development`.

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints.

Which approach?
