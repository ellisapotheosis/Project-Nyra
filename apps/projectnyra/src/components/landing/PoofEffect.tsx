"use client";

/**
 * POOF EFFECT — MANDATORY on ProjectNyra.com
 * Framer Motion particle burst that appears on mount (hero) and
 * on scroll-trigger (further down the page).
 *
 * Two variants:
 *   <MountPoofEffect />       — triggers once on component mount
 *   <ScrollPoofEffect />      — triggers when element enters viewport
 */

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────
   Particle types
───────────────────────────────────────────────────── */
interface Particle {
  id: number;
  x: number;  // final x offset (vw units relative to center)
  y: number;  // final y offset
  size: number;
  color: string;
  duration: number;
  delay: number;
  rotation: number;
  shape: "circle" | "square" | "star";
}

const POOF_COLORS = [
  "oklch(0.52 0.30 270)",   // primary violet
  "oklch(0.78 0.20 195)",   // cyan
  "oklch(0.65 0.32 330)",   // hot pink
  "oklch(0.67 0.26 305)",   // heliotrope
  "oklch(0.80 0.18 160)",   // mint
  "oklch(0.82 0.22 145)",   // neon green
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 60 + Math.random() * 120;
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      size: 4 + Math.random() * 8,
      color: POOF_COLORS[Math.floor(Math.random() * POOF_COLORS.length)],
      duration: 0.6 + Math.random() * 0.5,
      delay: Math.random() * 0.15,
      rotation: Math.random() * 720 - 360,
      shape: (["circle", "square", "star"] as const)[Math.floor(Math.random() * 3)],
    };
  });
}

/* ─────────────────────────────────────────────────────
   Star shape (SVG polygon)
───────────────────────────────────────────────────── */
function StarShape({ size, color }: { size: number; color: string }) {
  const pts = Array.from({ length: 5 }, (_, i) => {
    const outer = (i * 72 - 90) * (Math.PI / 180);
    const inner = outer + 36 * (Math.PI / 180);
    const r1 = size / 2;
    const r2 = size / 4;
    return [
      `${r1 * Math.cos(outer) + r1},${r1 * Math.sin(outer) + r1}`,
      `${r2 * Math.cos(inner) + r1},${r2 * Math.sin(inner) + r1}`,
    ].join(" ");
  }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill={color}>
      <polygon points={pts} />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────
   Single poof burst
───────────────────────────────────────────────────── */
interface PoofBurstProps {
  particles: Particle[];
  onComplete?: () => void;
}

function PoofBurst({ particles, onComplete }: PoofBurstProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: 0,
            opacity: 0,
            rotate: p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.0, 0.9, 0.57, 1.0],
          }}
          onAnimationComplete={p.id === 0 ? onComplete : undefined}
        >
          {p.shape === "circle" && (
            <div
              style={{
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: p.color,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              }}
            />
          )}
          {p.shape === "square" && (
            <div
              style={{
                width: p.size * 0.8,
                height: p.size * 0.8,
                background: p.color,
                boxShadow: `0 0 ${p.size}px ${p.color}`,
              }}
            />
          )}
          {p.shape === "star" && <StarShape size={p.size} color={p.color} />}
        </motion.div>
      ))}

      {/* Central flash */}
      <motion.div
        className="absolute rounded-full"
        initial={{ scale: 0, opacity: 0.9 }}
        animate={{ scale: 8, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          width: 20,
          height: 20,
          background: "radial-gradient(circle, oklch(0.78 0.20 195 / 0.8), transparent 70%)",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   HERO MOUNT POOF — triggers once on mount
   Place at the TOP of the Hero component
───────────────────────────────────────────────────── */
interface MountPoofEffectProps {
  /** Number of particles */
  count?: number;
  /** Delay after mount before triggering (ms) */
  delay?: number;
  className?: string;
}

export function MountPoofEffect({
  count = 28,
  delay = 300,
  className = "",
}: MountPoofEffectProps) {
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(false);
  const particles = useRef(generateParticles(count));

  useEffect(() => {
    const t = setTimeout(() => setActive(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (done) return null;

  return (
    <div className={`relative ${className}`} style={{ zIndex: 10 }}>
      <AnimatePresence>
        {active && (
          <PoofBurst
            particles={particles.current}
            onComplete={() => setTimeout(() => setDone(true), 800)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   SCROLL POOF — triggers when scrolled into view
   Place further down the page for the secondary effect
───────────────────────────────────────────────────── */
interface ScrollPoofEffectProps {
  count?: number;
  className?: string;
  /** re-trigger each time element enters view */
  repeat?: boolean;
}

export function ScrollPoofEffect({
  count = 22,
  className = "",
  repeat = false,
}: ScrollPoofEffectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: !repeat,
    margin: "-20%",
  });
  const [fired, setFired] = useState(false);
  const [active, setActive] = useState(false);
  const particles = useRef(generateParticles(count));

  useEffect(() => {
    if (inView && !fired) {
      setFired(true);
      setActive(true);
    }
    if (!inView && repeat) {
      setFired(false);
      setActive(false);
      // Regenerate particles for next trigger
      particles.current = generateParticles(count);
    }
  }, [inView, fired, repeat, count]);

  return (
    <div ref={ref} className={`relative ${className}`} style={{ zIndex: 10 }}>
      <AnimatePresence>
        {active && (
          <PoofBurst
            particles={particles.current}
            onComplete={() => setTimeout(() => setActive(false), 1000)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   HERO TEXT POOF REVEAL
   Wraps a text element with a combined:
     1. Element fades in with spring from below
     2. Poof burst fires when element appears
───────────────────────────────────────────────────── */
interface HeroPoofRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  particleCount?: number;
}

export function HeroPoofReveal({
  children,
  delay = 0,
  className = "",
  particleCount = 20,
}: HeroPoofRevealProps) {
  const [poofActive, setPoofActive] = useState(false);
  const particles = useRef(generateParticles(particleCount));

  return (
    <div className={`relative ${className}`}>
      {/* The element that appears */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 18,
          delay,
        }}
        onAnimationStart={() => {
          setTimeout(() => setPoofActive(true), delay * 1000 + 100);
        }}
      >
        {children}
      </motion.div>

      {/* Poof particles */}
      <AnimatePresence>
        {poofActive && (
          <PoofBurst
            particles={particles.current}
            onComplete={() => setTimeout(() => setPoofActive(false), 600)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
