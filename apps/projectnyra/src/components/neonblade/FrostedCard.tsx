"use client"

import { motion } from "framer-motion"
import { type ReactNode, forwardRef } from "react"

type FrostedVariant = "default" | "violet" | "cyan" | "pink" | "mint" | "rose" | "gold"
type FrostedRadius  = "sm" | "md" | "lg" | "xl" | "2xl" | "full"
type FrostedBlur    = "sm" | "md" | "lg" | "xl"

interface FrostedCardProps {
  children: ReactNode
  variant?: FrostedVariant
  radius?: FrostedRadius
  blur?: FrostedBlur
  glow?: boolean
  hover?: boolean
  border?: boolean
  topBeam?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

const VARIANT_STYLES: Record<FrostedVariant, { bg:string; border:string; glow:string; beam:string }> = {
  default: { bg:"bg-white/[0.04]",                    border:"border-white/[0.10]",                  glow:"shadow-[0_0_24px_oklch(0.52_0.30_270/0.10)]",  beam:"from-white/20 via-white/8 to-transparent" },
  violet:  { bg:"bg-[oklch(0.52_0.30_270/0.06)]",    border:"border-[oklch(0.52_0.30_270/0.25)]",   glow:"shadow-[0_0_32px_oklch(0.52_0.30_270/0.18)]",  beam:"from-[oklch(0.52_0.30_270/0.4)] via-[oklch(0.52_0.30_270/0.12)] to-transparent" },
  cyan:    { bg:"bg-[oklch(0.78_0.20_195/0.05)]",    border:"border-[oklch(0.78_0.20_195/0.25)]",   glow:"shadow-[0_0_32px_oklch(0.78_0.20_195/0.16)]",  beam:"from-[oklch(0.78_0.20_195/0.4)] via-[oklch(0.78_0.20_195/0.12)] to-transparent" },
  pink:    { bg:"bg-[oklch(0.65_0.32_330/0.06)]",    border:"border-[oklch(0.65_0.32_330/0.25)]",   glow:"shadow-[0_0_32px_oklch(0.65_0.32_330/0.18)]",  beam:"from-[oklch(0.65_0.32_330/0.4)] via-[oklch(0.65_0.32_330/0.12)] to-transparent" },
  mint:    { bg:"bg-[oklch(0.80_0.18_160/0.05)]",    border:"border-[oklch(0.80_0.18_160/0.22)]",   glow:"shadow-[0_0_28px_oklch(0.80_0.18_160/0.15)]",  beam:"from-[oklch(0.80_0.18_160/0.4)] via-[oklch(0.80_0.18_160/0.12)] to-transparent" },
  rose:    { bg:"bg-[oklch(0.55_0.28_10/0.06)]",     border:"border-[oklch(0.55_0.28_10/0.28)]",    glow:"shadow-[0_0_32px_oklch(0.55_0.28_10/0.20)]",   beam:"from-[oklch(0.55_0.28_10/0.45)] via-[oklch(0.55_0.28_10/0.14)] to-transparent" },
  gold:    { bg:"bg-[oklch(0.80_0.18_80/0.05)]",     border:"border-[oklch(0.80_0.18_80/0.22)]",    glow:"shadow-[0_0_28px_oklch(0.80_0.18_80/0.18)]",   beam:"from-[oklch(0.80_0.18_80/0.4)] via-[oklch(0.80_0.18_80/0.12)] to-transparent" },
}

const RADIUS_MAP: Record<FrostedRadius, string> = { sm:"rounded-sm", md:"rounded-md", lg:"rounded-lg", xl:"rounded-xl", "2xl":"rounded-2xl", full:"rounded-full" }
const BLUR_MAP:   Record<FrostedBlur,   string> = { sm:"backdrop-blur-sm", md:"backdrop-blur-md", lg:"backdrop-blur-lg", xl:"backdrop-blur-xl" }

// ─────────────────────────────────────────────────────────────────────────────
// FrostedCard component
// ─────────────────────────────────────────────────────────────────────────────

export const FrostedCard = forwardRef<HTMLDivElement, FrostedCardProps>(function FrostedCard(
  { children, variant="default", radius="2xl", blur="xl", glow=false, hover=false,
    border=true, topBeam=false, className="", style, onClick },
  ref
) {
  const s = VARIANT_STYLES[variant]
  const cls = [
    "relative overflow-hidden",
    s.bg, BLUR_MAP[blur], RADIUS_MAP[radius],
    border ? `border ${s.border}` : "",
    glow ? s.glow : "",
    hover ? "transition-all duration-500 ease-out cursor-pointer" : "",
    className,
  ].filter(Boolean).join(" ")

  const inner = (
    <>
      {topBeam && <div className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${s.beam}`}/>}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent rounded-[inherit]"/>
      <div className="relative z-10">{children}</div>
    </>
  )

  if (hover || onClick) return (
    <motion.div ref={ref} className={cls} style={style} onClick={onClick}
      whileHover={{ scale:1.015, filter:"brightness(1.10)" }}
      transition={{ duration:0.3, ease:"easeOut" }}>{inner}</motion.div>
  )
  return <div ref={ref} className={cls} style={style} onClick={onClick}>{inner}</div>
})

// ─────────────────────────────────────────────────────────────────────────────
// FrostedPanel — full-section frosted backdrop
// ─────────────────────────────────────────────────────────────────────────────

export function FrostedPanel({ children, className="", style }:
  { children:ReactNode; className?:string; style?:React.CSSProperties }) {
  return (
    <div className={`relative backdrop-blur-2xl bg-[oklch(0.04_0.01_270/0.6)] ${className}`} style={style}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FrostedStat — compact frosted stat chip
// ─────────────────────────────────────────────────────────────────────────────

export function FrostedStat({ label, value, sublabel, variant="default" }:
  { label:string; value:string; sublabel?:string; variant?:FrostedVariant }) {
  const s = VARIANT_STYLES[variant]
  return (
    <div className={`rounded-xl backdrop-blur-xl border px-5 py-4 ${s.bg} ${s.border}`}>
      <div className="text-[0.68rem] uppercase tracking-widest text-white/50 font-mono">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white font-[family-name:var(--font-michroma)]">{value}</div>
      {sublabel && <div className="mt-0.5 text-[0.65rem] text-white/40 font-mono">{sublabel}</div>}
    </div>
  )
}

export default FrostedCard
