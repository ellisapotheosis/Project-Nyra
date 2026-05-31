"use client";

/**
 * PROBLEM → SOLUTION SECTION
 * Mandatory poof effect #2 fires here (scroll-triggered).
 *
 * Layout:
 *   Left: "The Old Way" — pain points with red/amber indicators
 *   Center: animated beam connector (SVG path with traveling dot)
 *   Right: "The Nyra Way" — solution with green/cyan indicators
 *
 * ScrollPoofEffect fires when the center connector enters viewport.
 */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { X, Check, ArrowRight, AlertTriangle, Zap } from "lucide-react";
import { ScrollPoofEffect } from "./PoofEffect";

/* ─────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────── */
const OLD_WAY = [
  { pain: "Manual lead import from 6+ sources",         severity: "critical" },
  { pain: "Campaigns built in spreadsheets",            severity: "high" },
  { pain: "No STOP / DNC enforcement",                  severity: "critical" },
  { pain: "Quote comparison done in Excel manually",    severity: "high" },
  { pain: "Zero CRM timeline logging",                  severity: "critical" },
  { pain: "Silent failures — no audit trail",           severity: "high" },
  { pain: "LLM that invents rates and APRs",            severity: "critical" },
];

const NYRA_WAY = [
  { fix: "Unified ingest: email, webhook, API, manual", highlight: "accent" },
  { fix: "Visual campaign builder → compliance gated",  highlight: "primary" },
  { fix: "STOP kills all channels instantly, logs DNC", highlight: "accent" },
  { fix: "3-option quote engine, broker approval gate", highlight: "primary" },
  { fix: "Every touch logged to Twenty CRM timeline",   highlight: "accent" },
  { fix: "Hash-chained audit log, full trace trail",    highlight: "primary" },
  { fix: "Quote service only — assistant never quotes", highlight: "accent" },
];

/* ─────────────────────────────────────────────────────
   Pain row
───────────────────────────────────────────────────── */
function PainRow({ pain, severity, index }: { pain: string; severity: string; index: number }) {
  const isCritical = severity === "critical";
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 100, damping: 18 }}
      className="flex items-start gap-3 rounded border border-[oklch(0.22_0.03_270/0.4)] bg-[oklch(0.09_0.02_270/0.5)] px-4 py-3"
    >
      <span
        className="mt-0.5 flex-shrink-0 rounded-full p-0.5"
        style={{
          background: isCritical
            ? "oklch(0.60 0.28 25 / 0.15)"
            : "oklch(0.70 0.20 60 / 0.15)",
          border: `1px solid ${isCritical ? "oklch(0.60 0.28 25 / 0.5)" : "oklch(0.70 0.20 60 / 0.5)"}`,
        }}
      >
        {isCritical
          ? <X className="h-3 w-3 text-[oklch(0.70_0.26_25)]" />
          : <AlertTriangle className="h-3 w-3 text-[oklch(0.78_0.22_60)]" />
        }
      </span>
      <p className="font-[Electrolize] text-sm leading-snug text-[oklch(0.55_0.03_270)]">
        {pain}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   Solution row
───────────────────────────────────────────────────── */
function SolutionRow({ fix, highlight, index }: { fix: string; highlight: string; index: number }) {
  const accentColor = highlight === "accent"
    ? "oklch(0.78 0.20 195)"
    : "oklch(0.52 0.30 270)";

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 100, damping: 18 }}
      className="flex items-start gap-3 rounded border bg-[oklch(0.09_0.02_270/0.5)] px-4 py-3 transition-all duration-300"
      style={{
        borderColor: `${accentColor.replace(")", " / 0.25)")}`,
      }}
    >
      <span
        className="mt-0.5 flex-shrink-0 rounded-full p-0.5"
        style={{
          background: `${accentColor.replace(")", " / 0.15)")}`,
          border: `1px solid ${accentColor.replace(")", " / 0.5)")}`,
        }}
      >
        <Check className="h-3 w-3" style={{ color: accentColor }} />
      </span>
      <p className="font-[Electrolize] text-sm leading-snug text-[oklch(0.72_0.04_270)]">
        {fix}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   Animated beam connector (SVG) + poof origin
───────────────────────────────────────────────────── */
function BeamConnector() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <div ref={ref} className="relative flex flex-col items-center justify-center gap-4">
      {/* MANDATORY POOF EFFECT #2 — scroll triggered */}
      <ScrollPoofEffect count={28} className="absolute top-1/3" />

      {/* Label top */}
      <motion.span
        initial={{ opacity: 0, y: -8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="font-mono text-[9px] uppercase tracking-[0.18em] text-[oklch(0.40_0.03_270)]"
      >
        Before
      </motion.span>

      {/* SVG beam */}
      <div className="relative h-64 w-16">
        <svg
          viewBox="0 0 40 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          {/* Static gradient line */}
          <defs>
            <linearGradient id="beam-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="oklch(0.60 0.28 25)"  stopOpacity="0.6" />
              <stop offset="40%"  stopColor="oklch(0.52 0.30 270)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="oklch(0.78 0.20 195)" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <line x1="20" y1="0" x2="20" y2="200" stroke="url(#beam-grad)" strokeWidth="1.5" />

          {/* Traveling dot */}
          {inView && (
            <circle r="4" fill="oklch(0.78 0.20 195)" filter="url(#dot-glow)">
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                path="M 20 0 L 20 200"
              />
            </circle>
          )}

          <defs>
            <filter id="dot-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Center icon */}
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.3 }}
        className="absolute top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[oklch(0.52_0.30_270/0.6)] bg-[oklch(0.10_0.04_270)]"
        style={{
          boxShadow: "0 0 20px oklch(0.52 0.30 270 / 0.35), 0 0 60px oklch(0.52 0.30 270 / 0.15)",
        }}
      >
        <Zap className="h-5 w-5 text-[oklch(0.78_0.20_195)]" />
      </motion.div>

      {/* Label bottom */}
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="font-mono text-[9px] uppercase tracking-[0.18em] text-[oklch(0.52_0.30_270)]"
      >
        After
      </motion.span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────────────── */
function SectionHeader() {
  return (
    <div className="mb-16 text-center">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[oklch(0.52_0.30_270)]"
      >
        The Honest Case for Nyra
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.1 }}
        className="font-[Michroma] text-4xl leading-tight text-[oklch(0.96_0.01_270)] lg:text-5xl"
      >
        Every pain point.{" "}
        <span
          style={{
            color: "transparent",
            WebkitTextStroke: "1px oklch(0.52 0.30 270)",
            textShadow: "0 0 30px oklch(0.52 0.30 270 / 0.3)",
          }}
        >
          Systematically solved.
        </span>
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25 }}
        className="mx-auto mt-4 max-w-xl font-[Electrolize] text-base text-[oklch(0.52_0.04_270)]"
      >
        Most mortgage CRMs bolt on AI as an afterthought. Nyra is architected from the ground up around compliance, automation, and broker control.
      </motion.p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────── */
export function ProblemSolution() {
  return (
    <section className="relative py-28" id="the-machine">
      {/* Subtle bg grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.52 0.30 270 / 0.025) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.52 0.30 270 / 0.025) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeader />

        {/* Column headers */}
        <div className="mb-6 grid grid-cols-[1fr_80px_1fr] items-center gap-8 lg:grid-cols-[1fr_120px_1fr]">
          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-[oklch(0.60_0.28_25/0.3)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[oklch(0.50_0.12_25)]">
              Old Way
            </span>
          </div>
          <div />
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[oklch(0.60_0.15_195)]">
              Nyra Way
            </span>
            <span className="h-px flex-1 bg-[oklch(0.78_0.20_195/0.3)]" />
          </div>
        </div>

        {/* Main 3-column layout */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_120px_1fr]">
          {/* Left — pain */}
          <div className="flex flex-col gap-3">
            {OLD_WAY.map((item, i) => (
              <PainRow key={i} pain={item.pain} severity={item.severity} index={i} />
            ))}
          </div>

          {/* Center — beam + poof */}
          <div className="hidden items-start justify-center lg:flex">
            <BeamConnector />
          </div>

          {/* Right — solutions */}
          <div className="flex flex-col gap-3">
            {NYRA_WAY.map((item, i) => (
              <SolutionRow key={i} fix={item.fix} highlight={item.highlight} index={i} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 flex justify-center"
        >
          <a
            href="#early-access"
            className="group inline-flex items-center gap-3 font-[Michroma] text-sm uppercase tracking-[0.14em] text-[oklch(0.78_0.20_195)] transition-all duration-200 hover:text-[oklch(0.90_0.15_195)]"
          >
            See how it works end-to-end
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
