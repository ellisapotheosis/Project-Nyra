"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

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

function StagePanel({
  stage,
  index,
  stageIndex,
}: {
  stage: (typeof STAGES)[number];
  index: number;
  stageIndex: MotionValue<number>;
}) {
  const opacity = useTransform(stageIndex, (v: number) => {
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
  progress: MotionValue<number>;
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

function ScrollProgress({ progress }: { progress: MotionValue<number> }) {
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
