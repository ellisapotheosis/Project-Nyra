"use client"

/**
 * SplitFlapText — Framer Motion departure-board flip animation.
 * No GSAP. No Web Audio (optional prop for future). Bun-compatible.
 *
 * Usage:
 *   <SplitFlapText text="NYRA" />
 *   <SplitFlapDisplay texts={["PURCHASE", "REFINANCE", "CASH-OUT"]} />
 */

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ·-"
const SETTLE_MS = 60   // ms per character settle step
const SCRAMBLE_ROUNDS = 6  // how many random chars before settling

// ─────────────────────────────────────────────────────────────────────────────
// SplitFlapChar — single character tile
// ─────────────────────────────────────────────────────────────────────────────

interface SplitFlapCharProps {
  char: string
  delay?: number       // ms before this char starts
  className?: string
}

function SplitFlapChar({ char, delay = 0, className = "" }: SplitFlapCharProps) {
  const [display, setDisplay] = useState(" ")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let step = 0
    const totalSteps = SCRAMBLE_ROUNDS

    function tick() {
      if (step < totalSteps) {
        setDisplay(CHARSET[Math.floor(Math.random() * CHARSET.length)])
        step++
        timeoutRef.current = setTimeout(tick, SETTLE_MS)
      } else {
        setDisplay(char.toUpperCase())
      }
    }

    timeoutRef.current = setTimeout(tick, delay)
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [char, delay])

  return (
    <span
      className={`inline-flex items-center justify-center font-mono font-black select-none ${className}`}
      style={{
        background: "oklch(0.08 0.02 270 / 0.80)",
        border: "1px solid oklch(0.30 0.08 270 / 0.6)",
        borderRadius: "4px",
        minWidth: "1.1em",
        padding: "0 0.15em",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={display}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.07, ease: "easeOut" }}
          style={{ display: "inline-block", transformOrigin: "50% 50%" }}
        >
          {display}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SplitFlapText — animate a string once on mount
// ─────────────────────────────────────────────────────────────────────────────

interface SplitFlapTextProps {
  text: string
  className?: string          // applied to outer span
  charClassName?: string      // applied to each char tile
  charDelayMs?: number        // stagger delay per char (default 40ms)
  gap?: string                // gap between chars (default "2px")
}

export function SplitFlapText({
  text,
  className = "",
  charClassName = "",
  charDelayMs = 40,
  gap = "2px",
}: SplitFlapTextProps) {
  return (
    <span className={`inline-flex flex-wrap ${className}`} style={{ gap }}>
      {text.split("").map((ch, i) => (
        <SplitFlapChar
          key={i}
          char={ch === " " ? " " : ch}
          delay={i * charDelayMs}
          className={charClassName}
        />
      ))}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SplitFlapDisplay — cycles through an array of strings (departure board style)
// ─────────────────────────────────────────────────────────────────────────────

interface SplitFlapDisplayProps {
  texts: string[]
  holdMs?: number             // how long each text is shown (default 2200ms)
  className?: string
  charClassName?: string
  charDelayMs?: number
}

export function SplitFlapDisplay({
  texts,
  holdMs = 2200,
  className = "",
  charClassName = "",
  charDelayMs = 35,
}: SplitFlapDisplayProps) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const maxLen = Math.max(...texts.map(t => t.length))
    const animDuration = maxLen * charDelayMs + SCRAMBLE_ROUNDS * SETTLE_MS + 100
    const interval = setInterval(() => {
      setIdx(prev => (prev + 1) % texts.length)
    }, holdMs + animDuration)
    return () => clearInterval(interval)
  }, [texts, holdMs, charDelayMs])

  const current = texts[idx]
  const maxLen = Math.max(...texts.map(t => t.length))
  // Pad to max length so tile count stays stable
  const padded = current.padEnd(maxLen, " ")

  return (
    <SplitFlapText
      key={idx}
      text={padded}
      className={className}
      charClassName={charClassName}
      charDelayMs={charDelayMs}
    />
  )
}
