"use client";

/**
 * PROJECTNYRA.COM — HERO SECTION
 *
 * Mandatory effects:
 *   1. MountPoofEffect  — fires on page load (top of hero)
 *   2. Canvas star field — cursor-reactive on desktop
 *   3. GlitchText 3D breakaway on "PROJECT NYRA"
 *   4. Nyra mascot float animation
 *   5. SacredGeometryBg at 5% opacity
 *   6. Integrations ticker at the bottom of hero
 *   7. Radial bloom glow behind the headline
 *
 * The second (scroll) poof fires inside <ProblemSolution /> further
 * down the page — not here.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Github, ChevronDown, Sparkles } from "lucide-react";

import { MountPoofEffect } from "./PoofEffect";
import { GlitchText } from "@/components/neonblade/GlitchText";
import { SacredGeometryBg } from "./SacredGeometryBg";

/* ─────────────────────────────────────────────────────
   STAR FIELD CANVAS — cursor reactive
───────────────────────────────────────────────────── */
interface Star {
  x: number;
  y: number;
  z: number;      // depth 0-1 (affects size + alpha)
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
}

function StarFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5 }); // normalized 0-1
  const frameRef = useRef<number>(0);
  const STAR_COUNT = 160;

  const initStars = useCallback((w: number, h: number) => {
    starsRef.current = Array.from({ length: STAR_COUNT }, () => {
      const x = Math.random() * w;
      const y = Math.random() * h;
      return {
        x, y,
        z: Math.random(),
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.06,
        baseX: x,
        baseY: y,
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initStars(canvas.width, canvas.height);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top)  / rect.height,
      };
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let lastTime = 0;
    const draw = (time: number) => {
      const dt = Math.min((time - lastTime) / 16, 3);
      lastTime = time;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const mx = (mouseRef.current.x - 0.5) * 30;  // max pixel push
      const my = (mouseRef.current.y - 0.5) * 20;

      for (const s of starsRef.current) {
        // Slow drift
        s.baseX += s.vx * dt;
        s.baseY += s.vy * dt;

        // Wrap
        if (s.baseX < 0) s.baseX = w;
        if (s.baseX > w) s.baseX = 0;
        if (s.baseY < 0) s.baseY = h;
        if (s.baseY > h) s.baseY = 0;

        // Parallax push toward cursor (depth-weighted)
        const px = s.baseX + mx * s.z * 0.6;
        const py = s.baseY + my * s.z * 0.4;

        const size  = 0.4 + s.z * 1.8;
        const alpha = 0.15 + s.z * 0.65;

        // Color tint: deeper stars more violet, surface stars more cyan
        const hue = s.z > 0.6 ? "195" : "270";
        const sat = s.z > 0.6 ? "0.20" : "0.28";
        const lit = (0.55 + s.z * 0.25).toFixed(2);

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `oklch(${lit} ${sat} ${hue} / ${alpha.toFixed(2)})`;
        ctx.fill();

        // Twinkle: occasional bright flare
        if (s.z > 0.85 && Math.random() < 0.003) {
          ctx.beginPath();
          ctx.arc(px, py, size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `oklch(0.90 0.15 195 / 0.35)`;
          ctx.fill();
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [initStars]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────────────────
   INTEGRATIONS TICKER
   Logos/labels scroll right→left in a continuous loop
───────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  "Twenty CRM", "n8n", "Activepieces", "Composio",
  "LiteLLM", "OpenRouter", "Twilio", "SendGrid",
  "Nexus Router", "mem0", "FalkorDB", "Qdrant",
  "OpenMemory", "Mempalace", "Letta", "vLLM",
  "Ollama", "LendingTree", "Infisical", "Cloudflared",
];

function IntegrationsTicker() {
  // Duplicate for seamless loop
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="relative mt-16 overflow-hidden">
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
        style={{ background: "linear-gradient(to right, oklch(0.07 0.02 270), transparent)" }} />
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
        style={{ background: "linear-gradient(to left, oklch(0.07 0.02 270), transparent)" }} />

      <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-[oklch(0.40_0.03_270)]">
        Connected to your entire stack
      </p>

      <div
        className="flex gap-6 whitespace-nowrap"
        style={{
          animation: "ticker-scroll 36s linear infinite",
          width: "max-content",
        }}
      >
        {items.map((name, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 rounded border border-[oklch(0.22_0.04_270/0.5)] bg-[oklch(0.09_0.02_270/0.6)] px-3 py-1"
          >
            {/* Generic connector dot */}
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "oklch(0.78 0.20 195)" }}
            />
            <span className="font-mono text-[11px] text-[oklch(0.62_0.08_270)]">
              {name}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   MASCOT — Nyra floating character
───────────────────────────────────────────────────── */
function NyraMascot() {
  return (
    <motion.div
      className="relative"
      animate={{
        y: [0, -14, 0],
        rotate: [-0.8, 0.8, -0.8],
      }}
      transition={{
        duration: 5.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Halo glow disc behind mascot */}
      <div
        className="absolute inset-0 -z-10 scale-110 rounded-full"
        style={{
          background: "radial-gradient(ellipse 60% 55% at 50% 60%, oklch(0.52 0.30 270 / 0.35), oklch(0.65 0.32 330 / 0.18) 50%, transparent 80%)",
          filter: "blur(24px)",
        }}
      />

      {/* Sacred geometry halo ring */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(circle at 50% 70%, oklch(0.68 0.28 270 / 0.12), transparent 70%)",
        }}
      />

      <Image
        src="/nyra-mascot.avif"
        alt="Nyra — AI Mortgage Assistant"
        width={480}
        height={560}
        priority
        className="relative z-10 drop-shadow-2xl"
        style={{
          filter: "drop-shadow(0 0 48px oklch(0.52 0.30 270 / 0.45)) drop-shadow(0 0 120px oklch(0.65 0.32 330 / 0.20))",
        }}
      />

      {/* Circuit lines emanating from mascot */}
      <svg
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
        aria-hidden="true"
        viewBox="0 0 480 560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left circuit arm */}
        <path d="M 80 300 L 40 300 L 40 380 L 10 380" stroke="oklch(0.52 0.30 270 / 0.35)" strokeWidth="1" />
        <circle cx="10" cy="380" r="3" fill="oklch(0.78 0.20 195)" style={{ animation: "badge-blink 2.1s ease-in-out infinite" }} />
        {/* Right circuit arm */}
        <path d="M 400 280 L 440 280 L 440 200 L 470 200" stroke="oklch(0.65 0.32 330 / 0.30)" strokeWidth="1" />
        <circle cx="470" cy="200" r="3" fill="oklch(0.65 0.32 330)" style={{ animation: "badge-blink 1.7s ease-in-out infinite" }} />
        {/* Bottom data line */}
        <path d="M 240 530 L 240 558" stroke="oklch(0.78 0.20 195 / 0.4)" strokeWidth="1" strokeDasharray="4 4" />
      </svg>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   RADIAL BLOOM GLOW — pulsing orb behind headline
───────────────────────────────────────────────────── */
function RadialBloom() {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.6, 0.85, 0.6],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        width: 600,
        height: 600,
        background: "radial-gradient(ellipse at center, oklch(0.52 0.30 270 / 0.14) 0%, oklch(0.65 0.32 330 / 0.06) 40%, transparent 70%)",
        filter: "blur(1px)",
      }}
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────────────────
   EYEBROW PILL
───────────────────────────────────────────────────── */
function EyebrowPill() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.1 }}
      className="inline-flex items-center gap-2.5 rounded-full border border-[oklch(0.52_0.30_270/0.4)] bg-[oklch(0.12_0.04_270/0.6)] px-4 py-1.5 backdrop-blur-sm"
    >
      <Sparkles className="h-3.5 w-3.5 text-[oklch(0.78_0.20_195)]" />
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[oklch(0.78_0.20_195)]">
        Private Beta · Broker Early Access
      </span>
      <span
        className="h-1.5 w-1.5 rounded-full bg-[oklch(0.65_0.32_330)]"
        style={{ animation: "badge-blink 1.8s ease-in-out infinite" }}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   SUBHEADLINE
───────────────────────────────────────────────────── */
function SubHeadline() {
  return (
    <motion.p
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.55 }}
      className="mt-6 max-w-xl font-[Electrolize] text-lg leading-relaxed text-[oklch(0.65_0.04_270)]"
    >
      From first contact to funded —{" "}
      <span className="text-[oklch(0.82_0.08_270)]">automated, compliant, and yours.</span>
      {" "}Lead ingestion, multichannel drip, AI-generated quotes, and a broker command deck — all in one self-hosted OS.
    </motion.p>
  );
}

/* ─────────────────────────────────────────────────────
   CTA BUTTONS
───────────────────────────────────────────────────── */
function CTAButtons() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.72 }}
      className="mt-8 flex flex-wrap items-center gap-4"
    >
      {/* Primary CTA */}
      <Link
        href="#early-access"
        className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-sm px-6 py-3 font-[Michroma] text-sm uppercase tracking-[0.12em] text-white transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, oklch(0.52 0.30 270), oklch(0.62 0.28 295))",
          boxShadow: "0 0 20px oklch(0.52 0.30 270 / 0.4), 0 0 60px oklch(0.52 0.30 270 / 0.15)",
          clipPath: "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
        }}
      >
        {/* Shine sweep */}
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          style={{
            background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.15), transparent)",
          }}
        />
        Request Early Access
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>

      {/* Secondary CTA */}
      <Link
        href="https://github.com/ellisapotheosis/Project-Nyra"
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2.5 rounded-sm border border-[oklch(0.30_0.05_270/0.6)] bg-[oklch(0.10_0.02_270/0.5)] px-6 py-3 font-[Michroma] text-sm uppercase tracking-[0.12em] text-[oklch(0.72_0.06_270)] backdrop-blur-sm transition-all duration-300 hover:border-[oklch(0.52_0.30_270/0.6)] hover:text-[oklch(0.90_0.04_270)]"
        style={{
          clipPath: "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
        }}
      >
        <Github className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
        View on GitHub
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   STAT CHIPS — quick social proof
───────────────────────────────────────────────────── */
const HERO_STATS = [
  { value: "45–60d", label: "Drip Campaign" },
  { value: "3-Option", label: "Quote Engine" },
  { value: "TCPA", label: "Compliant" },
  { value: "Self-Hosted", label: "Your Data" },
];

function StatChips() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.0, duration: 0.6 }}
      className="mt-10 flex flex-wrap gap-3"
    >
      {HERO_STATS.map((s, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded border border-[oklch(0.22_0.04_270/0.5)] bg-[oklch(0.10_0.02_270/0.4)] px-3 py-1.5 backdrop-blur-sm"
        >
          <span className="font-[Michroma] text-sm text-[oklch(0.78_0.20_195)]">{s.value}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[oklch(0.45_0.03_270)]">{s.label}</span>
        </div>
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   SCROLL HINT
───────────────────────────────────────────────────── */
function ScrollHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8, duration: 0.6 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[oklch(0.32_0.02_270)]">
        Explore
      </span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-4 w-4 text-[oklch(0.38_0.06_270)]" />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   HERO — MAIN EXPORT
───────────────────────────────────────────────────── */
export function Hero() {
  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{
        background: "linear-gradient(180deg, oklch(0.055 0.025 270) 0%, oklch(0.07 0.018 270) 60%, oklch(0.08 0.015 270) 100%)",
      }}
    >
      {/* ── Background layers ── */}

      {/* Star field — fills entire hero */}
      <StarFieldCanvas />

      {/* Sacred geometry — centered, very faint */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <SacredGeometryBg
          opacity={0.04}
          color="oklch(0.68 0.28 270)"
          size={1100}
          duration={140}
        />
      </div>

      {/* Radial bloom behind headline */}
      <RadialBloom />

      {/* Grid overlay — subtle dark grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.52 0.30 270 / 0.03) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.52 0.30 270 / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />

      {/* Bottom vignette into next section */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
        style={{
          background: "linear-gradient(to bottom, transparent, oklch(0.07 0.02 270))",
        }}
        aria-hidden="true"
      />

      {/* ── MANDATORY POOF EFFECT #1 — fires on mount ── */}
      <div className="absolute left-1/2 top-[20%] -translate-x-1/2">
        <MountPoofEffect count={32} delay={400} />
      </div>

      {/* ── Main hero content ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-32 pt-28 lg:pt-36">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col items-start">
            <EyebrowPill />

            {/* Title: "THE AI-NATIVE MORTGAGE OS." */}
            <div className="mt-6">
              {/* Eyebrow subtitle — smaller, mono */}
              <motion.p
                initial={{ opacity: 0, letterSpacing: "0.4em" }}
                animate={{ opacity: 1, letterSpacing: "0.28em" }}
                transition={{ delay: 0.25, duration: 0.8, ease: "easeOut" }}
                className="mb-2 font-mono text-[11px] uppercase text-[oklch(0.52_0.30_270)] tracking-[0.28em]"
              >
                Project Nyra
              </motion.p>

              {/* Main GlitchText title */}
              <GlitchText
                text="THE AI-NATIVE"
                as="h1"
                className="font-[Michroma] text-5xl leading-[1.08] lg:text-6xl xl:text-7xl"
                style={{ color: "oklch(0.96 0.01 270)" }}
                intensity={1}
                delay={300}
                glitchInterval={6000}
              />

              {/* Second line — double outline + accent color */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.6 }}
              >
                <span
                  className="block font-[Michroma] text-5xl leading-[1.08] lg:text-6xl xl:text-7xl"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: "1.5px oklch(0.52 0.30 270)",
                    textShadow: "0 0 40px oklch(0.52 0.30 270 / 0.35), 0 0 80px oklch(0.52 0.30 270 / 0.15)",
                    paintOrder: "stroke fill",
                  }}
                >
                  MORTGAGE OS.
                </span>
              </motion.div>
            </div>

            <SubHeadline />
            <CTAButtons />
            <StatChips />
          </div>

          {/* ── RIGHT COLUMN — Mascot ── */}
          <div className="relative flex items-center justify-center lg:justify-end">
            {/* Poof effect positioned behind mascot, fires on load */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2">
              <MountPoofEffect count={20} delay={800} />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.88, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 70,
                damping: 18,
                delay: 0.35,
              }}
              className="relative"
            >
              <NyraMascot />

              {/* Floating data cards around mascot */}
              <FloatingCard
                className="absolute -left-16 top-16"
                delay={1.1}
                label="New Lead"
                value="+1 FreeRateUpdate"
                color="accent"
              />
              <FloatingCard
                className="absolute -right-10 bottom-28"
                delay={1.4}
                label="Campaign Fired"
                value="Day 0 · SMS + Email"
                color="pink"
              />
              <FloatingCard
                className="absolute -right-14 top-8"
                delay={1.7}
                label="Quote Ready"
                value="3 options · Pending ✓"
                color="primary"
              />
            </motion.div>
          </div>
        </div>

        {/* ── Integrations ticker ── */}
        <IntegrationsTicker />
      </div>

      {/* Scroll hint */}
      <ScrollHint />
    </section>
  );
}

/* ─────────────────────────────────────────────────────
   FLOATING CARD — small data card orbiting mascot
───────────────────────────────────────────────────── */
interface FloatingCardProps {
  label: string;
  value: string;
  color: "primary" | "accent" | "pink";
  delay?: number;
  className?: string;
}

const floatColorMap = {
  primary: {
    border: "oklch(0.52 0.30 270 / 0.45)",
    glow:   "oklch(0.52 0.30 270 / 0.20)",
    dot:    "oklch(0.78 0.20 195)",
    text:   "oklch(0.78 0.20 195)",
  },
  accent: {
    border: "oklch(0.78 0.20 195 / 0.45)",
    glow:   "oklch(0.78 0.20 195 / 0.18)",
    dot:    "oklch(0.82 0.22 145)",
    text:   "oklch(0.78 0.20 195)",
  },
  pink: {
    border: "oklch(0.65 0.32 330 / 0.45)",
    glow:   "oklch(0.65 0.32 330 / 0.18)",
    dot:    "oklch(0.65 0.32 330)",
    text:   "oklch(0.80 0.20 330)",
  },
};

function FloatingCard({ label, value, color, delay = 0, className = "" }: FloatingCardProps) {
  const c = floatColorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 18, delay }}
      className={`${className} hidden lg:block`}
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5 + delay, repeat: Infinity, ease: "easeInOut" }}
        className="rounded border px-3 py-2 backdrop-blur-md"
        style={{
          borderColor: c.border,
          background: `oklch(0.09 0.03 270 / 0.75)`,
          boxShadow: `0 0 16px ${c.glow}, 0 4px 20px oklch(0 0 0 / 0.4)`,
          clipPath: "polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)",
        }}
      >
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: c.dot, animation: "badge-blink 2s ease-in-out infinite" }}
          />
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[oklch(0.42_0.03_270)]">
            {label}
          </span>
        </div>
        <p
          className="font-[Electrolize] text-[11px] leading-tight"
          style={{ color: c.text }}
        >
          {value}
        </p>
      </motion.div>
    </motion.div>
  );
}
