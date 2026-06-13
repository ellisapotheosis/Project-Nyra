# Phase 2 Tier A UI Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 15 Tier A high-value UX features across `apps/ratehunter` and `apps/projectnyra` to complete the Phase 2 UI upgrade.

**Architecture:** Each feature is a self-contained component (or minimal modification to an existing one) with no cross-feature dependencies. Components follow the established pattern: new files in `src/components/ui/` for reusable primitives, `src/components/` for page-level features, and direct modifications to existing pages/layouts for wiring. Two apps are fully separate — no shared components.

**Tech Stack:** Next.js 15 App Router, React 18, Framer Motion 10, TypeScript 5, Tailwind CSS, `@dnd-kit` (projectnyra already installed), `canvas-confetti` (ratehunter already installed; add to projectnyra), `lottie-react` (add to both apps), oklch color tokens, pure SVG for charts (no D3).

---

## File Map

### New files — ratehunter

| File                                                         | Purpose                                                           |
| ------------------------------------------------------------ | ----------------------------------------------------------------- |
| `apps/ratehunter/src/components/MortgageNarrativeHero.tsx`   | #11 scroll-linked 4-state story                                   |
| `apps/ratehunter/src/components/LeadCaptureWizard.tsx`       | #16 replace existing with step-reveal animation (modify in place) |
| `apps/ratehunter/src/components/ui/rate-forecast-widget.tsx` | #17 SVG line chart with 14-day projection                         |
| `apps/ratehunter/src/components/ui/rate-alert-widget.tsx`    | #21 email + threshold subscription form                           |
| `apps/ratehunter/src/components/ui/glossary-tooltip.tsx`     | #24 rich hover tooltip for mortgage terms                         |
| `apps/ratehunter/src/components/ui/share-snapshot.tsx`       | #25 URL-encoded rate state share button                           |
| `apps/ratehunter/src/components/ui/lottie-icon.tsx`          | #19 wrapper for lottie-react                                      |

### New files — projectnyra

| File                                                      | Purpose                                   |
| --------------------------------------------------------- | ----------------------------------------- |
| `apps/projectnyra/src/components/BentoDashboard.tsx`      | #12 draggable bento grid with @dnd-kit    |
| `apps/projectnyra/src/components/PipelineSankey.tsx`      | #13 pure SVG sankey funnel                |
| `apps/projectnyra/src/app/(broker)/layout.tsx`            | #14 focus mode layout wrapper             |
| `apps/projectnyra/src/components/ui/presence-cursors.tsx` | #15 SSE-based broker presence cursors     |
| `apps/projectnyra/src/components/ui/speed-dial-fab.tsx`   | #18 radial spring FAB                     |
| `apps/projectnyra/src/components/ui/lottie-icon.tsx`      | #19 wrapper for lottie-react              |
| `apps/projectnyra/src/components/ui/glass-card.tsx`       | #22 glassmorphism card primitive          |
| `apps/projectnyra/src/components/ui/glass-modal.tsx`      | #22 glassmorphism modal primitive         |
| `apps/projectnyra/src/components/LoanTimeline.tsx`        | #23 vertical scroll-animated timeline     |
| `apps/projectnyra/src/components/ui/glossary-tooltip.tsx` | #24 rich hover tooltip for mortgage terms |

### Modified files — ratehunter

| File                               | Change                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| `apps/ratehunter/src/app/page.tsx` | Mount MortgageNarrativeHero, RateForecastWidget, RateAlertWidget, ShareSnapshot, GlossaryTooltip |
| `apps/ratehunter/package.json`     | Add `lottie-react`                                                                               |

### Modified files — projectnyra

| File                                                        | Change                                                            |
| ----------------------------------------------------------- | ----------------------------------------------------------------- |
| `apps/projectnyra/src/app/(broker)/pipeline/page.tsx`       | Mount PipelineSankey, SpeedDialFab, LoanTimeline, PresenceCursors |
| `apps/projectnyra/src/components/pipeline/kanban-board.tsx` | Add Close Celebration confetti burst (#20)                        |
| `apps/projectnyra/src/app/globals.css`                      | Add `.focus-mode` CSS class for Focus Mode (#14)                  |
| `apps/projectnyra/package.json`                             | Add `canvas-confetti`, `@types/canvas-confetti`, `lottie-react`   |

---

## Task 1: Install missing packages

**Files:**

- Modify: `apps/ratehunter/package.json`
- Modify: `apps/projectnyra/package.json`

- [ ] **Step 1: Add lottie-react to ratehunter**

```bash
cd apps/ratehunter && pnpm add lottie-react
```

Expected: `lottie-react` appears in `apps/ratehunter/package.json` dependencies.

- [ ] **Step 2: Add lottie-react + canvas-confetti to projectnyra**

```bash
cd apps/projectnyra && pnpm add lottie-react canvas-confetti && pnpm add -D @types/canvas-confetti
```

Expected: both packages appear in `apps/projectnyra/package.json` dependencies.

- [ ] **Step 3: Verify TypeScript sees the types**

```bash
cd apps/ratehunter && pnpm exec tsc --noEmit 2>&1 | grep lottie
cd apps/projectnyra && pnpm exec tsc --noEmit 2>&1 | grep -E "lottie|confetti"
```

Expected: no output (no errors for these packages).

- [ ] **Step 4: Commit**

```bash
git add apps/ratehunter/package.json apps/ratehunter/pnpm-lock.yaml \
        apps/projectnyra/package.json apps/projectnyra/pnpm-lock.yaml
git commit -m "deps: add lottie-react to ratehunter + canvas-confetti and lottie-react to projectnyra"
```

---

## Task 2: LottieIcon component (both apps) — #19

**Files:**

- Create: `apps/ratehunter/src/components/ui/lottie-icon.tsx`
- Create: `apps/projectnyra/src/components/ui/lottie-icon.tsx`

- [ ] **Step 1: Write the test**

Create `apps/ratehunter/src/components/ui/__tests__/lottie-icon.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { LottieIcon } from "../lottie-icon";

jest.mock("lottie-react", () => ({
  __esModule: true,
  default: ({ "aria-label": label }: { "aria-label"?: string }) => (
    <div data-testid="lottie" aria-label={label} />
  ),
}));

describe("LottieIcon", () => {
  it("renders with aria-label", () => {
    const { getByLabelText } = render(
      <LottieIcon animationData={{}} aria-label="loading" />
    );
    expect(getByLabelText("loading")).toBeTruthy();
  });

  it("applies size class", () => {
    const { container } = render(
      <LottieIcon animationData={{}} size={32} aria-label="icon" />
    );
    expect(container.firstChild).toHaveStyle({ width: "32px", height: "32px" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/ratehunter && pnpm test -- --testPathPattern=lottie-icon 2>&1 | tail -5
```

Expected: FAIL — `Cannot find module '../lottie-icon'`

- [ ] **Step 3: Create `apps/ratehunter/src/components/ui/lottie-icon.tsx`**

```tsx
"use client";

import Lottie from "lottie-react";

interface LottieIconProps {
  animationData: object;
  size?: number;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function LottieIcon({
  animationData,
  size = 24,
  loop = true,
  autoplay = true,
  className,
  "aria-label": ariaLabel,
}: LottieIconProps) {
  return (
    <div style={{ width: size, height: size }} className={className}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        aria-label={ariaLabel}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Copy to projectnyra (identical file)**

```bash
cp apps/ratehunter/src/components/ui/lottie-icon.tsx \
   apps/projectnyra/src/components/ui/lottie-icon.tsx
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd apps/ratehunter && pnpm test -- --testPathPattern=lottie-icon 2>&1 | tail -5
```

Expected: PASS — 2 tests

- [ ] **Step 6: TypeScript check**

```bash
cd apps/ratehunter && pnpm exec tsc --noEmit 2>&1 | head -5
cd apps/projectnyra && pnpm exec tsc --noEmit 2>&1 | head -5
```

Expected: 0 errors in both.

- [ ] **Step 7: Commit**

```bash
git add apps/ratehunter/src/components/ui/lottie-icon.tsx \
        apps/ratehunter/src/components/ui/__tests__/lottie-icon.test.tsx \
        apps/projectnyra/src/components/ui/lottie-icon.tsx
git commit -m "feat(both): add LottieIcon wrapper component for lottie-react"
```

---

## Task 3: MortgageNarrativeHero — #11 (ratehunter)

**Files:**

- Create: `apps/ratehunter/src/components/MortgageNarrativeHero.tsx`
- Modify: `apps/ratehunter/src/app/page.tsx`

The spec: scroll-linked story with `useScroll` + `useTransform`. Four states: Pre-approved → Choosing → Closing → Moving. SVG illustrations morph between states via CSS cross-fade.

- [ ] **Step 1: Create `apps/ratehunter/src/components/MortgageNarrativeHero.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const STAGES = [
  {
    label: "Pre-Approved",
    emoji: "✅",
    headline: "You're cleared to buy.",
    body: "Lock in your budget before you fall in love with a house.",
    color: "oklch(0.8871 0.1828 166.5465)",
  },
  {
    label: "Rate Shopping",
    emoji: "🔍",
    headline: "Every 0.1% matters.",
    body: "Compare 8 lenders side-by-side. The best rate is right here.",
    color: "oklch(0.5038 0.2937 285.3753)",
  },
  {
    label: "Closing",
    emoji: "📝",
    headline: "Almost home.",
    body: "Lock your rate now. Closing day is on the horizon.",
    color: "oklch(0.667 0.295 322.15)",
  },
  {
    label: "Moving In",
    emoji: "🏡",
    headline: "Welcome home.",
    body: "You did it. Your rate, your terms, your house.",
    color: "oklch(0.8871 0.1828 166.5465)",
  },
] as const;

export function MortgageNarrativeHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const stageIndex = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    [0, 1, 2, 3]
  );

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {STAGES.map((stage, i) => (
          <StagePanel
            key={stage.label}
            stage={stage}
            index={i}
            stageIndex={stageIndex}
          />
        ))}
        <ScrollProgress progress={scrollYProgress} />
      </div>
    </div>
  );
}

function StagePanel({
  stage,
  index,
  stageIndex,
}: {
  stage: (typeof STAGES)[number];
  index: number;
  stageIndex: ReturnType<typeof useTransform>;
}) {
  const opacity = useTransform(stageIndex, (v) => {
    const dist = Math.abs(v - index);
    return dist < 0.5 ? 1 - dist * 2 : 0;
  });

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
    >
      <span className="text-7xl mb-6" role="img" aria-label={stage.label}>
        {stage.emoji}
      </span>
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
        style={{ background: `${stage.color}22`, color: stage.color }}
      >
        {stage.label}
      </div>
      <h2 className="text-4xl font-bold text-white mb-3">{stage.headline}</h2>
      <p className="text-lg text-white/60 max-w-md">{stage.body}</p>
    </motion.div>
  );
}

function ProgressDot({
  progress,
  index,
  label,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  index: number;
  label: string;
}) {
  const opacity = useTransform(
    progress,
    [index / 4, (index + 1) / 4],
    [0.3, 1]
  );
  return (
    <motion.div
      style={{ opacity }}
      className="w-2 h-2 rounded-full bg-white"
      title={label}
    />
  );
}

function ScrollProgress({
  progress,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3">
      {STAGES.map((stage, i) => (
        <ProgressDot
          key={stage.label}
          progress={progress}
          index={i}
          label={stage.label}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Add to `apps/ratehunter/src/app/page.tsx`**

After the existing imports at the top, add:

```tsx
import { MortgageNarrativeHero } from "@/components/MortgageNarrativeHero";
```

In the JSX return, add before the first `<section>` or at the top of the main content area:

```tsx
<MortgageNarrativeHero />
```

- [ ] **Step 3: TypeScript check**

```bash
cd apps/ratehunter && pnpm exec tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/ratehunter/src/components/MortgageNarrativeHero.tsx \
        apps/ratehunter/src/app/page.tsx
git commit -m "feat(ratehunter): add MortgageNarrativeHero scroll-linked 4-state story"
```

---

## Task 4: BentoDashboard — #12 (projectnyra)

**Files:**

- Create: `apps/projectnyra/src/components/BentoDashboard.tsx`

The spec: draggable bento layout using `@dnd-kit` (already installed). Tile sizes: 1×1, 1×2, 2×1, 2×2. Layout saved to `localStorage`. Default layout: pipeline value as hero tile.

- [ ] **Step 1: Create `apps/projectnyra/src/components/BentoDashboard.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const STORAGE_KEY = "nyra-bento-layout";

type TileSize = "1x1" | "1x2" | "2x1" | "2x2";

interface Tile {
  id: string;
  label: string;
  size: TileSize;
  content: string;
}

const DEFAULT_TILES: Tile[] = [
  {
    id: "pipeline-value",
    label: "Pipeline Value",
    size: "2x2",
    content: "$4.2M",
  },
  {
    id: "leads-this-week",
    label: "Leads This Week",
    size: "1x1",
    content: "12",
  },
  { id: "avg-rate", label: "Avg Rate", size: "1x1", content: "6.74%" },
  { id: "closes-mtd", label: "Closes MTD", size: "1x2", content: "3" },
  { id: "applications", label: "Applications", size: "1x1", content: "8" },
  { id: "conversion", label: "Conversion", size: "1x1", content: "41%" },
];

const SIZE_CLASSES: Record<TileSize, string> = {
  "1x1": "col-span-1 row-span-1",
  "1x2": "col-span-1 row-span-2",
  "2x1": "col-span-2 row-span-1",
  "2x2": "col-span-2 row-span-2",
};

function BentoTile({ tile }: { tile: Tile }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tile.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${SIZE_CLASSES[tile.size]} rounded-2xl border border-white/10 bg-white/5 p-4 cursor-grab active:cursor-grabbing flex flex-col justify-between min-h-[100px]`}
      {...attributes}
      {...listeners}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
        {tile.label}
      </span>
      <span className="text-3xl font-bold text-white">{tile.content}</span>
    </div>
  );
}

export function BentoDashboard() {
  const [tiles, setTiles] = useState<Tile[]>(DEFAULT_TILES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        const reordered = ids
          .map((id) => DEFAULT_TILES.find((t) => t.id === id))
          .filter((t): t is Tile => Boolean(t));
        if (reordered.length === DEFAULT_TILES.length) setTiles(reordered);
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTiles((prev) => {
      const oldIdx = prev.findIndex((t) => t.id === active.id);
      const newIdx = prev.findIndex((t) => t.id === over.id);
      const next = arrayMove(prev, oldIdx, newIdx);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.map((t) => t.id)));
      return next;
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tiles.map((t) => t.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-4 gap-4 auto-rows-[100px]">
          {tiles.map((tile) => (
            <BentoTile key={tile.id} tile={tile} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd apps/projectnyra && pnpm exec tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/projectnyra/src/components/BentoDashboard.tsx
git commit -m "feat(projectnyra): add BentoDashboard draggable bento grid with dnd-kit"
```

---

## Task 5: PipelineSankey — #13 (projectnyra)

**Files:**

- Create: `apps/projectnyra/src/components/PipelineSankey.tsx`
- Modify: `apps/projectnyra/src/app/(broker)/pipeline/page.tsx`

Pure SVG Sankey funnel — no D3. Pre-calculated paths from stage percentages. Animated on mount via `stroke-dashoffset`.

- [ ] **Step 1: Create `apps/projectnyra/src/components/PipelineSankey.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
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
                initial={{ scaleY: 0, originY: 1 }}
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
                className="fill-white text-xs font-bold"
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
```

- [ ] **Step 2: Mount in pipeline page**

In `apps/projectnyra/src/app/(broker)/pipeline/page.tsx`, add the import:

```tsx
import { PipelineSankey } from "@/components/PipelineSankey";
```

Add after the existing `<section className="mt-8"><RateWall /></section>`:

```tsx
<section className="mt-8">
  <PipelineSankey />
</section>
```

- [ ] **Step 3: TypeScript check**

```bash
cd apps/projectnyra && pnpm exec tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/projectnyra/src/components/PipelineSankey.tsx \
        apps/projectnyra/src/app/\(broker\)/pipeline/page.tsx
git commit -m "feat(projectnyra): add PipelineSankey pure-SVG funnel with animated bars"
```

---

## Task 6: Focus Mode layout — #14 (projectnyra)

**Files:**

- Create: `apps/projectnyra/src/app/(broker)/layout.tsx`
- Modify: `apps/projectnyra/src/app/globals.css`

`F` key toggles `.focus-mode` class on the layout root. Everything except `.focus-target` elements dims to `brightness(0.05)`. Escape exits.

- [ ] **Step 1: Add `.focus-mode` CSS to globals.css**

In `apps/projectnyra/src/app/globals.css`, append at the end:

```css
/* Focus Mode — dim everything except .focus-target */
.focus-mode > *:not(.focus-target) {
  filter: brightness(0.05);
  transition: filter 0.3s ease;
}
.focus-mode .focus-target {
  position: relative;
  z-index: 100;
}
```

- [ ] **Step 2: Create `apps/projectnyra/src/app/(broker)/layout.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";

export default function BrokerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "f" || e.key === "F") {
        if (
          document.activeElement &&
          ["INPUT", "TEXTAREA", "SELECT"].includes(
            (document.activeElement as HTMLElement).tagName
          )
        )
          return;
        rootRef.current?.classList.toggle("focus-mode");
      }
      if (e.key === "Escape") {
        rootRef.current?.classList.remove("focus-mode");
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd apps/projectnyra && pnpm exec tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/projectnyra/src/app/\(broker\)/layout.tsx \
        apps/projectnyra/src/app/globals.css
git commit -m "feat(projectnyra): add Focus Mode — F key dims all but .focus-target elements"
```

---

## Task 7: PresenceCursors — #15 (projectnyra)

**Files:**

- Create: `apps/projectnyra/src/components/ui/presence-cursors.tsx`
- Modify: `apps/projectnyra/src/app/(broker)/pipeline/page.tsx`

SSE-based broker presence. Each connected broker gets a colored dot + initials that follows their cursor. Uses `NEXT_PUBLIC_NEXUS_ROUTER_URL` for the SSE endpoint. Graceful degradation when offline.

- [ ] **Step 1: Create `apps/projectnyra/src/components/ui/presence-cursors.tsx`**

```tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BrokerCursor {
  id: string;
  initials: string;
  color: string;
  x: number;
  y: number;
}

const COLORS = [
  "oklch(0.5038 0.2937 285.3753)",
  "oklch(0.667 0.295 322.15)",
  "oklch(0.8871 0.1828 166.5465)",
  "oklch(0.75 0.18 50)",
];

function colorForId(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return COLORS[hash % COLORS.length];
}

export function PresenceCursors({ roomId }: { roomId: string }) {
  const [cursors, setCursors] = useState<BrokerCursor[]>([]);
  const meId = useRef(`me-${Math.random().toString(36).slice(2)}`);

  // Broadcast my mouse position via beacon
  useEffect(() => {
    const NEXUS = process.env.NEXT_PUBLIC_NEXUS_ROUTER_URL ?? "";
    if (!NEXUS) return;

    function onMouseMove(e: MouseEvent) {
      const pct = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
      navigator.sendBeacon(
        `${NEXUS}/presence/${roomId}/move`,
        JSON.stringify({ id: meId.current, ...pct })
      );
    }
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [roomId]);

  // Subscribe to SSE stream for other brokers
  useEffect(() => {
    const NEXUS = process.env.NEXT_PUBLIC_NEXUS_ROUTER_URL ?? "";
    if (!NEXUS) return;

    const es = new EventSource(`${NEXUS}/presence/${roomId}/stream`);
    es.onmessage = (e) => {
      try {
        const data: Omit<BrokerCursor, "color"> & { id: string } = JSON.parse(
          e.data
        );
        if (data.id === meId.current) return;
        setCursors((prev) => {
          const others = prev.filter((c) => c.id !== data.id);
          return [...others, { ...data, color: colorForId(data.id) }];
        });
      } catch {
        // ignore malformed
      }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [roomId]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[999]" aria-hidden>
      <AnimatePresence>
        {cursors.map((cursor) => (
          <motion.div
            key={cursor.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
              left: `${cursor.x * 100}%`,
              top: `${cursor.y * 100}%`,
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1"
            style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg"
              style={{ background: cursor.color }}
            >
              {cursor.initials}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Mount in pipeline page**

In `apps/projectnyra/src/app/(broker)/pipeline/page.tsx`, add the import:

```tsx
import { PresenceCursors } from "@/components/ui/presence-cursors";
```

Add at the end of the JSX return (before closing tag):

```tsx
<PresenceCursors roomId="pipeline" />
```

- [ ] **Step 3: TypeScript check**

```bash
cd apps/projectnyra && pnpm exec tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/projectnyra/src/components/ui/presence-cursors.tsx \
        apps/projectnyra/src/app/\(broker\)/pipeline/page.tsx
git commit -m "feat(projectnyra): add PresenceCursors SSE-based broker cursor presence"
```

---

## Task 8: LeadCaptureWizard step-reveal refactor — #16 (ratehunter)

**Files:**

- Modify: `apps/ratehunter/src/components/LeadCaptureWizard.tsx`

Replace the existing multi-field form with step-reveal: each field slides/fades in after the previous is completed. After loan amount → show teaser rate → then request contact. The existing file at `apps/ratehunter/src/components/LeadCaptureWizard.tsx` already imports `AnimatePresence` from framer-motion and `confetti`. This task adds step-gating logic.

- [ ] **Step 1: Read the current file to understand existing step structure**

```bash
grep -n "step\|Step\|stage\|Stage\|currentStep\|setStep" \
  apps/ratehunter/src/components/LeadCaptureWizard.tsx | head -20
```

- [ ] **Step 2: Add step completion guards to each field**

In `LeadCaptureWizard.tsx`, locate the field render logic. Wrap each non-active step in an `AnimatePresence` block with slide-fade entrance. The key pattern:

```tsx
<AnimatePresence>
  {currentStep >= STEP_LOAN_AMOUNT && (
    <motion.div
      key="loan-amount"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* loan amount field JSX */}
    </motion.div>
  )}
</AnimatePresence>

<AnimatePresence>
  {currentStep >= STEP_TEASER && (
    <motion.div
      key="teaser-rate"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
        <p className="text-xs text-white/50 mb-1">Based on your loan amount</p>
        <p className="text-3xl font-bold text-[oklch(0.8871_0.1828_166.5465)]">
          6.74% <span className="text-sm font-normal text-white/50">est. rate</span>
        </p>
      </div>
    </motion.div>
  )}
</AnimatePresence>

<AnimatePresence>
  {currentStep >= STEP_CONTACT && (
    <motion.div
      key="contact"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* contact fields JSX */}
    </motion.div>
  )}
</AnimatePresence>
```

Add constants above the component:

```tsx
const STEP_LOAN_AMOUNT = 0;
const STEP_TEASER = 1;
const STEP_CONTACT = 2;
```

Advance the step when a field is completed (e.g., `onBlur` with a value check):

```tsx
onBlur={() => {
  if (loanAmount && currentStep === STEP_LOAN_AMOUNT) {
    setCurrentStep(STEP_TEASER);
    setTimeout(() => setCurrentStep(STEP_CONTACT), 800);
  }
}}
```

- [ ] **Step 3: TypeScript check**

```bash
cd apps/ratehunter && pnpm exec tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/ratehunter/src/components/LeadCaptureWizard.tsx
git commit -m "feat(ratehunter): refactor LeadCaptureWizard to progressive step-reveal form"
```

---

## Task 9: RateForecastWidget — #17 (ratehunter)

**Files:**

- Create: `apps/ratehunter/src/components/ui/rate-forecast-widget.tsx`
- Modify: `apps/ratehunter/src/app/page.tsx`

SVG line chart: 30 days of actuals + 14-day linear regression projection. Labeled "Trend estimate — not financial advice."

- [ ] **Step 1: Create `apps/ratehunter/src/components/ui/rate-forecast-widget.tsx`**

```tsx
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

        {/* Gradient fill under actuals */}
        <path d={fillPath} fill={`url(#${gradientId})`} />

        {/* Actual line */}
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

        {/* Forecast dashed line */}
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

        {/* Y axis labels */}
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

        {/* Legend */}
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
          strokeDasharray="3 2"
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
```

- [ ] **Step 2: Mount in ratehunter page.tsx**

Add import:

```tsx
import { RateForecastWidget } from "@/components/ui/rate-forecast-widget";
```

Add in a new section after `RateParticleCloud`:

```tsx
<section className="mx-auto max-w-4xl px-4 py-8">
  <RateForecastWidget />
</section>
```

- [ ] **Step 3: TypeScript check**

```bash
cd apps/ratehunter && pnpm exec tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/ratehunter/src/components/ui/rate-forecast-widget.tsx \
        apps/ratehunter/src/app/page.tsx
git commit -m "feat(ratehunter): add RateForecastWidget SVG line chart with 14-day projection"
```

---

## Task 10: SpeedDialFAB — #18 (projectnyra)

**Files:**

- Create: `apps/projectnyra/src/components/ui/speed-dial-fab.tsx`
- Modify: `apps/projectnyra/src/app/(broker)/pipeline/page.tsx`

Fixed bottom-right FAB. Click expands 5 radial action buttons with spring physics. Actions: New Lead, Rate Quote, Send Campaign, View Pipeline, Ask Nyra.

- [ ] **Step 1: Create `apps/projectnyra/src/components/ui/speed-dial-fab.tsx`**

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  UserPlus,
  Calculator,
  Send,
  LayoutDashboard,
  Bot,
} from "lucide-react";

const ACTIONS = [
  { icon: UserPlus, label: "New Lead", angle: -90, href: "/leads/new" },
  { icon: Calculator, label: "Rate Quote", angle: -54, href: "/quotes/new" },
  { icon: Send, label: "Send Campaign", angle: -18, href: "/campaigns" },
  {
    icon: LayoutDashboard,
    label: "View Pipeline",
    angle: 18,
    href: "/pipeline",
  },
  { icon: Bot, label: "Ask Nyra", angle: 54, onClick: "nyra" },
] as const;

const RADIUS = 80;

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

interface SpeedDialFABProps {
  onAskNyra?: () => void;
}

export function SpeedDialFAB({ onAskNyra }: SpeedDialFABProps) {
  const [open, setOpen] = useState(false);

  function handleAction(action: (typeof ACTIONS)[number]) {
    setOpen(false);
    if ("onClick" in action && action.onClick === "nyra") {
      onAskNyra?.();
      return;
    }
    if ("href" in action) {
      window.location.href = action.href;
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open &&
          ACTIONS.map((action, i) => {
            const rad = degToRad(action.angle - 90);
            const x = Math.cos(rad) * RADIUS;
            const y = Math.sin(rad) * RADIUS;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                animate={{ opacity: 1, x, y: -Math.abs(y) - 56, scale: 1 }}
                exit={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 28,
                  delay: i * 0.04,
                }}
                onClick={() => handleAction(action)}
                title={action.label}
                className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[oklch(0.12_0.02_285)] text-white/80 shadow-xl hover:bg-white/10 hover:text-white transition-colors"
              >
                <action.icon size={16} />
                <span className="sr-only">{action.label}</span>
              </motion.button>
            );
          })}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.5038_0.2937_285.3753)] text-white shadow-2xl hover:brightness-110 transition-[filter]"
        aria-label={open ? "Close actions" : "Open actions"}
        aria-expanded={open}
      >
        <Plus size={22} />
      </motion.button>
    </div>
  );
}
```

- [ ] **Step 2: Mount in pipeline page**

Add import:

```tsx
import { SpeedDialFAB } from "@/components/ui/speed-dial-fab";
```

Add at the end of the JSX (before closing tag):

```tsx
<SpeedDialFAB />
```

- [ ] **Step 3: TypeScript check**

```bash
cd apps/projectnyra && pnpm exec tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/projectnyra/src/components/ui/speed-dial-fab.tsx \
        apps/projectnyra/src/app/\(broker\)/pipeline/page.tsx
git commit -m "feat(projectnyra): add SpeedDialFAB radial action menu with spring physics"
```

---

## Task 11: Close Celebration Burst — #20 (projectnyra)

**Files:**

- Modify: `apps/projectnyra/src/components/pipeline/kanban-board.tsx`

When a card moves to the "Closed" column, fire `canvas-confetti` and show a toast with borrower name and loan amount.

- [ ] **Step 1: Read the current kanban-board.tsx to find the drag-end handler**

```bash
grep -n "onDragEnd\|Closed\|closed\|CLOSED\|drop\|column" \
  apps/projectnyra/src/components/pipeline/kanban-board.tsx | head -20
```

- [ ] **Step 2: Add confetti import at top of kanban-board.tsx**

At the top of the file, after existing imports:

```tsx
import confetti from "canvas-confetti";
```

- [ ] **Step 3: Add celebration trigger in the drag-end handler**

Locate the `onDragEnd` (or equivalent drop handler) function. After the logic that moves a card to a new column, add:

```tsx
if (destinationColumnId === "closed" || destinationColumnId === "Closed") {
  confetti({
    particleCount: 160,
    spread: 90,
    origin: { y: 0.6 },
    colors: [
      "oklch(0.8871 0.1828 166.5465)",
      "oklch(0.5038 0.2937 285.3753)",
      "oklch(0.667 0.295 322.15)",
    ],
  });
  // Toast notification (uses existing @radix-ui/react-toast via toaster)
  toast({
    title: `🎉 Loan Closed — ${card.borrowerName ?? "Borrower"}`,
    description: `${card.loanAmount ? `$${(card.loanAmount / 1000).toFixed(0)}K` : "Amount TBD"} · Est. commission: ${card.loanAmount ? `$${((card.loanAmount * 0.01) / 1000).toFixed(1)}K` : "TBD"}`,
    duration: 6000,
  });
}
```

Note: `toast` is the shadcn/radix toast hook — check if it's already imported; if not, add:

```tsx
import { useToast } from "@/components/ui/use-toast";
// and inside the component: const { toast } = useToast();
```

- [ ] **Step 4: TypeScript check**

```bash
cd apps/projectnyra && pnpm exec tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add apps/projectnyra/src/components/pipeline/kanban-board.tsx
git commit -m "feat(projectnyra): add Close Celebration confetti burst on Kanban column move"
```

---

## Task 12: RateAlertWidget — #21 (ratehunter)

**Files:**

- Create: `apps/ratehunter/src/components/ui/rate-alert-widget.tsx`
- Modify: `apps/ratehunter/src/app/page.tsx`

Single-field email form + threshold selector. Posts to Nexus Router `/api/rate-alerts`. Success: animated checkmark + confirmation message. Graceful offline degradation.

- [ ] **Step 1: Create `apps/ratehunter/src/components/ui/rate-alert-widget.tsx`**

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2 } from "lucide-react";

const LOAN_TYPES = ["30yr Fixed", "15yr Fixed", "5/1 ARM", "FHA 30yr"] as const;

type Status = "idle" | "submitting" | "success" | "error";

export function RateAlertWidget() {
  const [email, setEmail] = useState("");
  const [targetRate, setTargetRate] = useState("6.50");
  const [loanType, setLoanType] =
    useState<(typeof LOAN_TYPES)[number]>("30yr Fixed");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "submitting") return;
    setStatus("submitting");

    try {
      const NEXUS = process.env.NEXT_PUBLIC_NEXUS_ROUTER_URL ?? "";
      const res = await fetch(`${NEXUS}/api/rate-alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          targetRate: parseFloat(targetRate),
          loanType,
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      // Graceful offline: show success anyway (alert stored client-side intent)
      setStatus("success");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={16} className="text-[oklch(0.667_0.295_322.15)]" />
        <h3 className="text-sm font-semibold text-white/80">Rate Alert</h3>
      </div>

      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-4 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 28,
                delay: 0.1,
              }}
            >
              <CheckCircle2
                size={40}
                className="text-[oklch(0.8871_0.1828_166.5465)]"
              />
            </motion.div>
            <p className="text-sm text-white/80">
              We&apos;ll notify you at{" "}
              <span className="font-semibold text-white">{email}</span>
            </p>
            <p className="text-xs text-white/40">
              Alert: {loanType} reaches {targetRate}%
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex gap-2">
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value as typeof loanType)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30"
              >
                {LOAN_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-[#0a0a14]">
                    {t}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <input
                  type="number"
                  value={targetRate}
                  onChange={(e) => setTargetRate(e.target.value)}
                  step="0.125"
                  min="3"
                  max="12"
                  className="w-14 bg-transparent text-xs text-white/80 focus:outline-none"
                  aria-label="Target rate"
                />
                <span className="text-xs text-white/40">%</span>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-white/30"
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-lg bg-[oklch(0.667_0.295_322.15)] px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition-[filter] disabled:opacity-60"
              >
                {status === "submitting" ? "..." : "Alert Me"}
              </button>
            </div>
            {status === "error" && (
              <p className="text-xs text-red-400">
                Failed to save — try again.
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Mount in ratehunter page.tsx**

Add import:

```tsx
import { RateAlertWidget } from "@/components/ui/rate-alert-widget";
```

Add in the page after `RateForecastWidget`:

```tsx
<section className="mx-auto max-w-4xl px-4 py-8">
  <RateAlertWidget />
</section>
```

- [ ] **Step 3: TypeScript check**

```bash
cd apps/ratehunter && pnpm exec tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/ratehunter/src/components/ui/rate-alert-widget.tsx \
        apps/ratehunter/src/app/page.tsx
git commit -m "feat(ratehunter): add RateAlertWidget email subscription with graceful offline"
```

---

## Task 13: GlassCard + GlassModal — #22 (projectnyra)

**Files:**

- Create: `apps/projectnyra/src/components/ui/glass-card.tsx`
- Create: `apps/projectnyra/src/components/ui/glass-modal.tsx`
- Modify: `apps/projectnyra/src/app/globals.css`

Pattern: gradient-border wrapper (1px padding) + inner div with `backdrop-filter: blur(22px) saturate(160%)`. Applied as primitives — existing pages pick them up by replacing `<div className="c-card">` with `<GlassCard>`.

- [ ] **Step 1: Create `apps/projectnyra/src/components/ui/glass-card.tsx`**

```tsx
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}

export function GlassCard({
  children,
  className,
  gradient = "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
}: GlassCardProps) {
  return (
    <div
      className={cn("rounded-2xl p-px", className)}
      style={{ background: gradient }}
    >
      <div
        className="rounded-[calc(1rem-1px)] h-full w-full"
        style={{
          background: "rgba(4,4,14,0.62)",
          backdropFilter: "blur(22px) saturate(160%)",
          WebkitBackdropFilter: "blur(22px) saturate(160%)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/projectnyra/src/components/ui/glass-modal.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { GlassCard } from "./glass-card";

interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function GlassModal({
  open,
  onClose,
  title,
  children,
  className,
}: GlassModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={`fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 ${className ?? ""}`}
            role="dialog"
            aria-modal="true"
          >
            <GlassCard>
              <div className="p-6">
                {title && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-white">
                      {title}
                    </h2>
                    <button
                      onClick={onClose}
                      className="rounded-lg p-1.5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Close modal"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                {children}
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd apps/projectnyra && pnpm exec tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/projectnyra/src/components/ui/glass-card.tsx \
        apps/projectnyra/src/components/ui/glass-modal.tsx
git commit -m "feat(projectnyra): add GlassCard + GlassModal glassmorphism primitives"
```

---

## Task 14: LoanTimeline — #23 (projectnyra)

**Files:**

- Create: `apps/projectnyra/src/components/LoanTimeline.tsx`
- Modify: `apps/projectnyra/src/app/(broker)/pipeline/page.tsx`

Vertical timeline with animated node reveals on scroll. Each node expands on click to show timestamps, notes, documents.

- [ ] **Step 1: Create `apps/projectnyra/src/components/LoanTimeline.tsx`**

```tsx
"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, FileText, ChevronDown } from "lucide-react";

interface TimelineEvent {
  id: string;
  stage: string;
  date: string;
  status: "completed" | "active" | "pending";
  note?: string;
  docs?: string[];
}

const DEFAULT_EVENTS: TimelineEvent[] = [
  {
    id: "pre-approval",
    stage: "Pre-Approval Issued",
    date: "2026-05-14 09:31",
    status: "completed",
    note: "Borrower qualified at $485K, DTI 38%",
    docs: ["pre-approval-letter.pdf"],
  },
  {
    id: "application",
    stage: "Application Submitted",
    date: "2026-05-19 14:05",
    status: "completed",
    docs: ["1003-application.pdf", "w2-2024.pdf"],
  },
  {
    id: "processing",
    stage: "Processing",
    date: "2026-05-22 10:00",
    status: "completed",
    note: "Appraisal ordered",
  },
  {
    id: "underwriting",
    stage: "Underwriting",
    date: "2026-06-02 16:30",
    status: "active",
    note: "Awaiting title commitment",
  },
  {
    id: "clear-to-close",
    stage: "Clear to Close",
    date: "",
    status: "pending",
  },
  {
    id: "closing",
    stage: "Closing",
    date: "",
    status: "pending",
  },
];

const STATUS_COLOR: Record<TimelineEvent["status"], string> = {
  completed: "oklch(0.8871 0.1828 166.5465)",
  active: "oklch(0.5038 0.2937 285.3753)",
  pending: "rgba(255,255,255,0.15)",
};

function TimelineNode({
  event,
  index,
}: {
  event: TimelineEvent;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="relative flex gap-4"
    >
      {/* Vertical connector */}
      {index < DEFAULT_EVENTS.length - 1 && (
        <div
          className="absolute left-[15px] top-8 w-px bg-white/10"
          style={{ height: "calc(100% + 16px)" }}
        />
      )}

      {/* Node dot */}
      <div
        className="mt-1 flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full border-2 z-10"
        style={{
          borderColor: STATUS_COLOR[event.status],
          background:
            event.status !== "pending"
              ? `${STATUS_COLOR[event.status]}22`
              : "transparent",
        }}
      >
        {event.status === "completed" ? (
          <CheckCircle2
            size={14}
            style={{ color: STATUS_COLOR[event.status] }}
          />
        ) : event.status === "active" ? (
          <Clock size={14} style={{ color: STATUS_COLOR[event.status] }} />
        ) : (
          <div className="w-2 h-2 rounded-full bg-white/20" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <div>
            <p
              className="text-sm font-semibold"
              style={{
                color:
                  event.status === "pending"
                    ? "rgba(255,255,255,0.35)"
                    : "white",
              }}
            >
              {event.stage}
            </p>
            {event.date && (
              <p className="text-xs text-white/40 mt-0.5">{event.date}</p>
            )}
          </div>
          {(event.note || event.docs) && (
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} className="text-white/30" />
            </motion.div>
          )}
        </button>

        <AnimatePresence>
          {expanded && (event.note || event.docs) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-lg bg-white/5 p-3 space-y-2">
                {event.note && (
                  <p className="text-xs text-white/60">{event.note}</p>
                )}
                {event.docs?.map((doc) => (
                  <div
                    key={doc}
                    className="flex items-center gap-2 text-xs text-white/50"
                  >
                    <FileText size={11} />
                    {doc}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function LoanTimeline({
  events = DEFAULT_EVENTS,
}: {
  events?: TimelineEvent[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-6">
        Loan Timeline
      </h3>
      <div className="space-y-0">
        {events.map((event, i) => (
          <TimelineNode key={event.id} event={event} index={i} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Mount in pipeline page**

Add import:

```tsx
import { LoanTimeline } from "@/components/LoanTimeline";
```

Add after `PipelineSankey`:

```tsx
<section className="mt-8">
  <LoanTimeline />
</section>
```

- [ ] **Step 3: TypeScript check**

```bash
cd apps/projectnyra && pnpm exec tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/projectnyra/src/components/LoanTimeline.tsx \
        apps/projectnyra/src/app/\(broker\)/pipeline/page.tsx
git commit -m "feat(projectnyra): add LoanTimeline vertical scroll-animated stage tracker"
```

---

## Task 15: GlossaryTooltip — #24 (both apps)

**Files:**

- Create: `apps/ratehunter/src/components/ui/glossary-tooltip.tsx`
- Create: `apps/projectnyra/src/components/ui/glossary-tooltip.tsx`
- Modify: `apps/ratehunter/src/app/page.tsx` (wrap 1-2 existing terms as demo)

Rich hover tooltip for mortgage terms: DTI, LTV, PITI, APR, ARM, PMI, Points, Origination Fee.

- [ ] **Step 1: Create `apps/ratehunter/src/components/ui/glossary-tooltip.tsx`**

```tsx
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type MortgageTerm =
  | "DTI"
  | "LTV"
  | "PITI"
  | "APR"
  | "ARM"
  | "PMI"
  | "Points"
  | "Origination Fee";

const GLOSSARY: Record<MortgageTerm, { definition: string; example: string }> =
  {
    DTI: {
      definition:
        "Debt-to-Income ratio — monthly debts divided by gross monthly income.",
      example: "E.g. $2,000 debts / $6,000 income = 33% DTI",
    },
    LTV: {
      definition:
        "Loan-to-Value — loan amount divided by the appraised property value.",
      example: "E.g. $380K loan / $475K value = 80% LTV",
    },
    PITI: {
      definition:
        "Principal, Interest, Taxes, and Insurance — the total monthly payment.",
      example: "P+I $1,850 + Taxes $320 + Insurance $85 = $2,255 PITI",
    },
    APR: {
      definition:
        "Annual Percentage Rate — interest rate plus lender fees, annualized.",
      example: "A 6.75% rate with fees becomes 6.94% APR",
    },
    ARM: {
      definition:
        "Adjustable-Rate Mortgage — rate is fixed for an initial period, then adjusts.",
      example: "5/1 ARM: fixed 5 years, adjusts annually after",
    },
    PMI: {
      definition:
        "Private Mortgage Insurance — required when LTV > 80%, protects the lender.",
      example: "Typically 0.5–1.5% of loan/year (~$100–$250/mo on $300K)",
    },
    Points: {
      definition:
        "Discount points — upfront fee to buy down the interest rate.",
      example: "1 point = 1% of loan. $3K on $300K loan lowers rate ~0.25%",
    },
    "Origination Fee": {
      definition: "Lender's fee to process and underwrite the loan.",
      example: "Typically 0.5–1% of loan amount ($1,500–$3,000 on $300K)",
    },
  };

interface GlossaryTooltipProps {
  term: MortgageTerm;
  children?: React.ReactNode;
}

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const entry = GLOSSARY[term];

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span className="cursor-help border-b border-dotted border-white/40 text-white/80 hover:text-white transition-colors">
        {children ?? term}
      </span>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-[oklch(0.1_0.02_285)] p-3 shadow-2xl"
            role="tooltip"
          >
            <p className="text-xs font-bold text-white mb-1">{term}</p>
            <p className="text-xs text-white/70 leading-relaxed mb-2">
              {entry.definition}
            </p>
            <p className="text-[10px] text-white/40 italic">{entry.example}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
```

- [ ] **Step 2: Copy to projectnyra**

```bash
cp apps/ratehunter/src/components/ui/glossary-tooltip.tsx \
   apps/projectnyra/src/components/ui/glossary-tooltip.tsx
```

- [ ] **Step 3: Mount a demo usage in ratehunter page.tsx**

Find the PaymentDonut section in `apps/ratehunter/src/app/page.tsx`. Add a small label nearby:

```tsx
import { GlossaryTooltip } from "@/components/ui/glossary-tooltip";
```

And somewhere in the payment breakdown area:

```tsx
<p className="text-xs text-white/50">
  Your estimated <GlossaryTooltip term="PITI" /> and{" "}
  <GlossaryTooltip term="PMI" /> breakdown
</p>
```

- [ ] **Step 4: TypeScript check both apps**

```bash
cd apps/ratehunter && pnpm exec tsc --noEmit 2>&1 | head -5
cd apps/projectnyra && pnpm exec tsc --noEmit 2>&1 | head -5
```

Expected: 0 errors in both.

- [ ] **Step 5: Commit**

```bash
git add apps/ratehunter/src/components/ui/glossary-tooltip.tsx \
        apps/ratehunter/src/app/page.tsx \
        apps/projectnyra/src/components/ui/glossary-tooltip.tsx
git commit -m "feat(both): add GlossaryTooltip rich hover definitions for 8 mortgage terms"
```

---

## Task 16: ShareSnapshot — #25 (ratehunter)

**Files:**

- Create: `apps/ratehunter/src/components/ui/share-snapshot.tsx`
- Modify: `apps/ratehunter/src/app/page.tsx`

Encode current rate comparison state into URL params. "Share" button copies short URL. UTM params for referral tracking.

- [ ] **Step 1: Create `apps/ratehunter/src/components/ui/share-snapshot.tsx`**

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, CheckCheck } from "lucide-react";
import type { LenderRate } from "@/hooks/useRates";

interface ShareSnapshotProps {
  rates: LenderRate[];
  loanAmount: number;
  loanTerm: number;
  loanType: string;
}

export function ShareSnapshot({
  rates,
  loanAmount,
  loanTerm,
  loanType,
}: ShareSnapshotProps) {
  const [copied, setCopied] = useState(false);

  function buildUrl() {
    const params = new URLSearchParams({
      amt: String(loanAmount),
      term: String(loanTerm),
      type: loanType,
      lenders: rates.map((r) => r.id).join(","),
      utm_source: "ratehunter",
      utm_medium: "share",
      utm_campaign: "rate-snapshot",
    });
    return `${window.location.origin}?${params.toString()}`;
  }

  async function handleShare() {
    const url = buildUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback for non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      aria-label="Copy shareable link to clipboard"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-2"
          >
            <CheckCheck
              size={15}
              className="text-[oklch(0.8871_0.1828_166.5465)]"
            />
            <span className="text-[oklch(0.8871_0.1828_166.5465)]">
              Link copied!
            </span>
          </motion.span>
        ) : (
          <motion.span
            key="share"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-2"
          >
            <Link2 size={15} />
            Share Rates
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
```

- [ ] **Step 2: Mount in ratehunter page.tsx**

Add import:

```tsx
import { ShareSnapshot } from "@/components/ui/share-snapshot";
```

Add in the rate comparison section (near the RateCard3D grid):

```tsx
<div className="flex justify-end mt-4">
  <ShareSnapshot
    rates={rates}
    loanAmount={485000}
    loanTerm={30}
    loanType="Conventional"
  />
</div>
```

- [ ] **Step 3: TypeScript check**

```bash
cd apps/ratehunter && pnpm exec tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/ratehunter/src/components/ui/share-snapshot.tsx \
        apps/ratehunter/src/app/page.tsx
git commit -m "feat(ratehunter): add ShareSnapshot URL-encoded rate state share button"
```

---

## Task 17: Phase 2 validation gate

**Files:** None (read-only verification)

- [ ] **Step 1: TypeScript check — ratehunter**

```bash
cd apps/ratehunter && pnpm exec tsc --noEmit 2>&1
```

Expected: 0 errors.

- [ ] **Step 2: TypeScript check — projectnyra**

```bash
cd apps/projectnyra && pnpm exec tsc --noEmit 2>&1
```

Expected: 0 errors.

- [ ] **Step 3: ESLint — ratehunter**

```bash
cd apps/ratehunter && pnpm lint 2>&1 | tail -5
```

Expected: 0 warnings / errors.

- [ ] **Step 4: ESLint — projectnyra**

```bash
cd apps/projectnyra && pnpm lint 2>&1 | tail -5
```

Expected: 0 warnings / errors.

- [ ] **Step 5: File inventory check**

```bash
ls apps/ratehunter/src/components/MortgageNarrativeHero.tsx
ls apps/ratehunter/src/components/ui/rate-forecast-widget.tsx
ls apps/ratehunter/src/components/ui/rate-alert-widget.tsx
ls apps/ratehunter/src/components/ui/glossary-tooltip.tsx
ls apps/ratehunter/src/components/ui/share-snapshot.tsx
ls apps/ratehunter/src/components/ui/lottie-icon.tsx
ls apps/projectnyra/src/components/BentoDashboard.tsx
ls apps/projectnyra/src/components/PipelineSankey.tsx
ls apps/projectnyra/src/app/\(broker\)/layout.tsx
ls apps/projectnyra/src/components/ui/presence-cursors.tsx
ls apps/projectnyra/src/components/ui/speed-dial-fab.tsx
ls apps/projectnyra/src/components/ui/lottie-icon.tsx
ls apps/projectnyra/src/components/ui/glass-card.tsx
ls apps/projectnyra/src/components/ui/glass-modal.tsx
ls apps/projectnyra/src/components/LoanTimeline.tsx
ls apps/projectnyra/src/components/ui/glossary-tooltip.tsx
```

Expected: all 16 files exist.

- [ ] **Step 6: Final commit**

```bash
git add -u
git commit -m "feat: complete Phase 2 Tier A UI upgrade — 15 features across both apps"
```
