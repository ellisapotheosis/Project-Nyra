"use client";

/**
 * STATS SECTION — animated number counters
 * Numbers count up when section enters viewport (IntersectionObserver).
 * Surrounded by a horizontal separator with sacred geometry motif.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/* ─────────────────────────────────────────────────────
   Stat data
───────────────────────────────────────────────────── */
const STATS = [
  {
    value: 45,
    suffix: "–60d",
    label: "Automated Drip",
    sub: "per loan purpose track",
    color: "oklch(0.78 0.20 195)",
  },
  {
    value: 3,
    suffix: "-Option",
    label: "Quote Comparison",
    sub: "deterministic, never hallucinated",
    color: "oklch(0.52 0.30 270)",
  },
  {
    value: 6,
    suffix: "+",
    label: "Lead Sources",
    sub: "email, API, webhook, manual",
    color: "oklch(0.65 0.32 330)",
  },
  {
    value: 100,
    suffix: "%",
    label: "Audit Logged",
    sub: "every send decision traced",
    color: "oklch(0.82 0.22 145)",
  },
  {
    value: 4,
    suffix: " PCs",
    label: "LAN GPU Workers",
    sub: "self-hosted inference stack",
    color: "oklch(0.67 0.26 305)",
  },
  {
    value: 0,
    suffix: " Hallucinated Rates",
    label: "Guarantee",
    sub: "quote engine is code, not LLM",
    color: "oklch(0.70 0.26 25)",
  },
];

/* ─────────────────────────────────────────────────────
   Animated counter hook
───────────────────────────────────────────────────── */
function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);

  return count;
}

/* ─────────────────────────────────────────────────────
   Stat card
───────────────────────────────────────────────────── */
function StatCard({
  stat,
  index,
  active,
}: {
  stat: (typeof STATS)[0];
  index: number;
  active: boolean;
}) {
  const count = useCountUp(stat.value, 1200, active);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 90, damping: 18 }}
      className="flex flex-col items-center gap-1 text-center"
    >
      {/* Big number */}
      <div className="flex items-baseline gap-0.5">
        <span
          className="font-[Michroma] text-5xl tabular-nums"
          style={{
            color: stat.color,
            textShadow: `0 0 24px ${stat.color.replace(")", " / 0.45)")}`,
          }}
        >
          {count}
        </span>
        <span
          className="font-[Michroma] text-2xl"
          style={{ color: stat.color }}
        >
          {stat.suffix}
        </span>
      </div>

      {/* Label */}
      <p className="font-[Michroma] text-sm tracking-wider text-[oklch(0.80_0.03_270)]">
        {stat.label}
      </p>

      {/* Sub */}
      <p className="font-mono text-[10px] tracking-wide text-[oklch(0.40_0.03_270)]">
        {stat.sub}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   Sacred geometry divider
───────────────────────────────────────────────────── */
function GeoDivider() {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[oklch(0.52_0.30_270/0.3)]" />

      {/* Hexagon motif */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <polygon
          points="12,2 20,7 20,17 12,22 4,17 4,7"
          stroke="oklch(0.52 0.30 270)"
          strokeWidth="0.8"
          fill="oklch(0.52 0.30 270 / 0.06)"
        />
        <polygon
          points="12,6 17,9 17,15 12,18 7,15 7,9"
          stroke="oklch(0.78 0.20 195)"
          strokeWidth="0.5"
          fill="none"
        />
        <circle cx="12" cy="12" r="2" fill="oklch(0.78 0.20 195)" opacity="0.7" />
      </svg>

      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[oklch(0.52_0.30_270/0.3)]" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────── */
export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <section className="relative py-24 overflow-hidden" id="stats">
      {/* Radial bg bloom */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          style={{
            width: 800,
            height: 300,
            background: "radial-gradient(ellipse at center, oklch(0.52 0.30 270 / 0.06) 0%, transparent 70%)",
            filter: "blur(2px)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <GeoDivider />

        <div ref={ref} className="my-16 grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">
          {STATS.map((s, i) => (
            <StatCard key={i} stat={s} index={i} active={inView} />
          ))}
        </div>

        <GeoDivider />
      </div>
    </section>
  );
}
