"use client"

/**
 * EncryptedLine — Rotating encrypted reveal for ProjectNyra.com hero
 * Shows the pipeline stages cycling through encrypted scramble → reveal → next
 * Usage: <EncryptedLine /> under the H1
 *
 * Sequence: INGEST → SYNC → DRIP → QUOTE → CLOSE
 * Each word reveals from encrypted chars, holds 1.2s, then scrambles to next
 */

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

const STAGES = ["INGEST", "SYNC", "NORMALIZE", "DRIP", "QUOTE", "CLOSE"]
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&"
const HOLD_MS = 1200
const SCRAMBLE_MS = 600
const SCRAMBLE_FPS = 50

function scramble(target: string, progress: number): string {
  return target
    .split("")
    .map((char, i) => {
      if (char === " ") return " "
      const revealed = i / target.length < progress
      if (revealed) return char
      return CHARSET[Math.floor(Math.random() * CHARSET.length)]
    })
    .join("")
}

function useEncryptedCycle(words: string[], holdMs: number, scrambleMs: number) {
  const [index, setIndex] = useState(0)
  const [display, setDisplay] = useState(words[0])
  const [phase, setPhase] = useState<"reveal" | "hold" | "scramble">("reveal")
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let progress = 0
    const target = words[index]

    // Reveal phase
    setPhase("reveal")
    const startTime = Date.now()
    frameRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      progress = Math.min(elapsed / scrambleMs, 1)
      setDisplay(scramble(target, progress))
      if (progress >= 1) {
        clearInterval(frameRef.current!)
        setDisplay(target)
        setPhase("hold")
        // Hold then advance
        timerRef.current = setTimeout(() => {
          setPhase("scramble")
          timerRef.current = setTimeout(() => {
            setIndex(i => (i + 1) % words.length)
          }, 300)
        }, holdMs)
      }
    }, 1000 / SCRAMBLE_FPS)

    return () => {
      clearInterval(frameRef.current!)
      clearTimeout(timerRef.current!)
    }
  }, [index, words, holdMs, scrambleMs])

  return { display, phase, currentWord: words[index] }
}

// ─────────────────────────────────────────────────────────────────────────────
// Arrow connectors between stages
// ─────────────────────────────────────────────────────────────────────────────

function StageConnector() {
  return (
    <span
      className="text-sm font-mono mx-1.5 select-none"
      style={{ color: "oklch(0.35 0.08 270)" }}
    >
      →
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Full pipeline display (all stages, active highlighted)
// ─────────────────────────────────────────────────────────────────────────────

export function EncryptedPipelineLine() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setActiveIndex(i => (i + 1) % STAGES.length)
    }, 1400)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      className="flex items-center justify-center flex-wrap gap-0 font-mono text-xs tracking-widest select-none"
      aria-label="Pipeline stages"
    >
      {STAGES.map((stage, i) => (
        <span key={stage} className="flex items-center">
          <EncryptedStageWord word={stage} active={i === activeIndex} />
          {i < STAGES.length - 1 && <StageConnector />}
        </span>
      ))}
    </div>
  )
}

function EncryptedStageWord({ word, active }: { word: string; active: boolean }) {
  const [display, setDisplay] = useState(word)
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active) {
      setDisplay(word)
      return
    }

    let progress = 0
    const start = Date.now()
    const duration = 400

    frameRef.current = setInterval(() => {
      const elapsed = Date.now() - start
      progress = Math.min(elapsed / duration, 1)
      setDisplay(scramble(word, progress))
      if (progress >= 1) {
        setDisplay(word)
        clearInterval(frameRef.current!)
      }
    }, 1000 / SCRAMBLE_FPS)

    return () => clearInterval(frameRef.current!)
  }, [active, word])

  return (
    <motion.span
      animate={{
        color: active ? "oklch(0.78 0.20 195)" : "oklch(0.35 0.06 270)",
        textShadow: active
          ? "0 0 12px oklch(0.78 0.20 195 / 0.6), 0 0 24px oklch(0.78 0.20 195 / 0.3)"
          : "none",
      }}
      transition={{ duration: 0.2 }}
      style={{ fontFamily: "Space Mono, JetBrains Mono, monospace" }}
    >
      {display}
    </motion.span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Single hero encrypted word (large display version)
// ─────────────────────────────────────────────────────────────────────────────

export function EncryptedHeroWord() {
  const { display } = useEncryptedCycle(STAGES, HOLD_MS, SCRAMBLE_MS)

  return (
    <span
      className="font-mono font-black text-4xl md:text-5xl tracking-widest"
      style={{
        color: "oklch(0.78 0.20 195)",
        textShadow: "0 0 20px oklch(0.78 0.20 195 / 0.5), 0 0 40px oklch(0.78 0.20 195 / 0.2)",
        fontFamily: "Space Mono, JetBrains Mono, monospace",
        minWidth: "6ch",
        display: "inline-block",
        textAlign: "center",
      }}
    >
      {display}
    </span>
  )
}
