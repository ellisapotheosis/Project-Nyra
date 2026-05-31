"use client";

/**
 * GLITCH TEXT — Neonblade Implementation
 * Renders text with a CSS + JS glitch effect featuring:
 *   - Chromatic aberration via pseudo-elements
 *   - Random clip-path slice animation
 *   - Hue-rotate color shift
 *   - Optional 3D breakaway effect on mount (Framer Motion)
 *
 * Usage:
 *   <GlitchText text="PROJECT NYRA" className="text-display-xl" />
 */

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface GlitchTextProps {
  text: string;
  className?: string;
  /** Glitch intensity: 0 = never, 1 = always subtle, 2 = frequent */
  intensity?: 0 | 1 | 2;
  /** Enable 3D breakaway reveal on mount */
  breakaway?: boolean;
  /** Primary glitch color (chromatic left offset) */
  colorLeft?: string;
  /** Secondary glitch color (chromatic right offset) */
  colorRight?: string;
}

export function GlitchText({
  text,
  className = "",
  intensity = 1,
  breakaway = true,
  colorLeft = "oklch(0.65 0.32 330)",
  colorRight = "oklch(0.78 0.20 195)",
}: GlitchTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [glitching, setGlitching] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Random glitch trigger
  useEffect(() => {
    if (intensity === 0) return;

    const intervalMs = intensity === 2 ? 2000 : 5000;
    const glitchDuration = 400;

    const trigger = () => {
      setGlitching(true);
      timeoutRef.current = setTimeout(() => {
        setGlitching(false);
      }, glitchDuration);
    };

    const randomDelay = () => intervalMs + Math.random() * intervalMs;

    let interval: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      interval = setTimeout(() => {
        trigger();
        scheduleNext();
      }, randomDelay());
    };

    scheduleNext();

    return () => {
      clearTimeout(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [intensity]);

  // Breakaway mount animation (Framer Motion)
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.85, z: -80, rotateX: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      z: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 20,
        mass: 0.8,
      },
    },
  };

  return (
    <motion.span
      ref={ref}
      className={`relative inline-block select-none ${className}`}
      variants={breakaway ? containerVariants : undefined}
      initial={breakaway ? "hidden" : undefined}
      animate={breakaway && inView ? "visible" : undefined}
      style={{ perspective: "1200px" }}
    >
      {/* Base text */}
      <span
        className="relative z-10 block"
        style={{
          filter: glitching
            ? "hue-rotate(var(--glitch-hue, 90deg)) brightness(1.2)"
            : "none",
          transition: "filter 0.05s ease",
          animation: glitching
            ? "glitch-color-shift 0.4s steps(1) forwards"
            : "none",
        }}
      >
        {text}
      </span>

      {/* Chromatic aberration layer — LEFT (pink/red shift) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block z-20"
        style={{
          color: colorLeft,
          opacity: glitching ? 0.75 : 0,
          transform: glitching ? "translate(-3px, 1px)" : "translate(0, 0)",
          animation: glitching
            ? "glitch-clip-1 0.4s steps(1) forwards"
            : "none",
          transition: "opacity 0.05s ease, transform 0.05s ease",
          clipPath: "inset(40% 0 50% 0)",
          mixBlendMode: "screen",
        }}
      >
        {text}
      </span>

      {/* Chromatic aberration layer — RIGHT (cyan shift) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block z-20"
        style={{
          color: colorRight,
          opacity: glitching ? 0.75 : 0,
          transform: glitching ? "translate(3px, -1px)" : "translate(0, 0)",
          animation: glitching
            ? "glitch-clip-2 0.4s steps(1) forwards"
            : "none",
          transition: "opacity 0.05s ease, transform 0.05s ease",
          clipPath: "inset(25% 0 25% 0)",
          mixBlendMode: "screen",
        }}
      >
        {text}
      </span>

      {/* Scan line slice on glitch */}
      {glitching && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 block z-30"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, oklch(0.52 0.30 270 / 0.06) 2px, oklch(0.52 0.30 270 / 0.06) 4px)",
            mixBlendMode: "overlay",
          }}
        />
      )}
    </motion.span>
  );
}
