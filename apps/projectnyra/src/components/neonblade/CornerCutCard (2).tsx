"use client";

/**
 * CORNER CUT CARD + NOTCH CARD — Neonblade Implementation
 * Polygon clip-path cards with neon glow border on hover.
 *
 * Usage:
 *   <CornerCutCard glowColor="primary">
 *     <p>Content</p>
 *   </CornerCutCard>
 *
 *   <NotchCard>
 *     <p>Notch-corner content</p>
 *   </NotchCard>
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type GlowColor = "primary" | "accent" | "pink" | "destructive" | "none";

interface CornerCutCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: GlowColor;
  /** Cut size in px */
  cutSize?: number;
  /** Add aurora gradient overlay on hover */
  aurora?: boolean;
  /** Interactive with hover transform */
  interactive?: boolean;
  onClick?: () => void;
}

const glowMap: Record<GlowColor, string> = {
  primary:     "hover:shadow-[0_0_20px_oklch(0.52_0.30_270/0.35),0_0_60px_oklch(0.52_0.30_270/0.2)]",
  accent:      "hover:shadow-[0_0_20px_oklch(0.78_0.20_195/0.35),0_0_60px_oklch(0.78_0.20_195/0.2)]",
  pink:        "hover:shadow-[0_0_20px_oklch(0.65_0.32_330/0.40),0_0_60px_oklch(0.65_0.32_330/0.25)]",
  destructive: "hover:shadow-[0_0_20px_oklch(0.60_0.28_25/0.40),0_0_60px_oklch(0.60_0.28_25/0.25)]",
  none:        "",
};

export function CornerCutCard({
  children,
  className,
  glowColor = "primary",
  cutSize = 14,
  aurora = false,
  interactive = false,
  onClick,
}: CornerCutCardProps) {
  const clipPath = `polygon(${cutSize}px 0%, 100% 0%, 100% calc(100% - ${cutSize}px), calc(100% - ${cutSize}px) 100%, 0% 100%, 0% ${cutSize}px)`;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden",
        "bg-[oklch(0.09_0.02_270)] border border-[oklch(0.22_0.03_270/0.6)]",
        "transition-all duration-300",
        glowMap[glowColor],
        interactive && "cursor-pointer hover:-translate-y-0.5",
        className
      )}
      style={{ clipPath }}
    >
      {/* Aurora overlay */}
      {aurora && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.52 0.30 270 / 0.08) 0%, oklch(0.78 0.20 195 / 0.05) 50%, oklch(0.65 0.32 330 / 0.06) 100%)",
            backgroundSize: "300% 300%",
            animation: "aurora-shift 8s ease infinite",
          }}
        />
      )}

      {/* Glow border inset — visible on hover via CSS */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
        style={{
          background: "linear-gradient(135deg, oklch(0.52 0.30 270 / 0.06), transparent 60%)",
          clipPath,
        }}
      />

      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   NOTCH CARD — bite from top-right corner
───────────────────────────────────────────────────── */
interface NotchCardProps {
  children: ReactNode;
  className?: string;
  notchSize?: number;
  glowColor?: GlowColor;
  interactive?: boolean;
  onClick?: () => void;
}

export function NotchCard({
  children,
  className,
  notchSize = 24,
  glowColor = "primary",
  interactive = false,
  onClick,
}: NotchCardProps) {
  const clipPath = `polygon(0% 0%, calc(100% - ${notchSize}px) 0%, 100% ${notchSize}px, 100% 100%, 0% 100%)`;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden",
        "bg-[oklch(0.09_0.02_270)] border border-[oklch(0.22_0.03_270/0.6)]",
        "transition-all duration-300",
        glowMap[glowColor],
        interactive && "cursor-pointer hover:-translate-y-0.5",
        className
      )}
      style={{ clipPath }}
    >
      {/* Notch corner accent line */}
      <div
        className="pointer-events-none absolute top-0 right-0 z-10"
        style={{
          width: `${notchSize}px`,
          height: `${notchSize}px`,
          background: "linear-gradient(225deg, oklch(0.52 0.30 270 / 0.6), transparent)",
        }}
      />

      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   BORDER BEAM CARD — animated rotating gradient border
───────────────────────────────────────────────────── */
interface BorderBeamCardProps {
  children: ReactNode;
  className?: string;
  beamDuration?: number;
}

export function BorderBeamCard({
  children,
  className,
  beamDuration = 4,
}: BorderBeamCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "[background:var(--background-card)]",
        className
      )}
    >
      {/* Rotating beam border */}
      <div
        className="pointer-events-none absolute inset-[-1px] rounded-[inherit] z-0"
        style={{
          background: `conic-gradient(from var(--beam-angle, 0deg), transparent 0%, oklch(0.52 0.30 270) 5%, oklch(0.78 0.20 195) 10%, transparent 15%)`,
          animation: `border-beam-rotate ${beamDuration}s linear infinite`,
        }}
      />
      {/* Inner fill */}
      <div className="absolute inset-[1px] rounded-[calc(1rem-1px)] z-0 bg-[oklch(0.09_0.02_270)]" />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

