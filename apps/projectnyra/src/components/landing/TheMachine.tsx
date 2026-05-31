"use client"

/**
 * TheMachine — ProjectNyra.com "The Machine" animated beam flow
 * 8-node pipeline visual showing the full Nyra lead lifecycle
 * Source: design decision package v3 / 02-projectnyra-landing/DESIGN.md
 *
 * Node sequence: INTAKE → NORMALIZE → DEDUPE → CRM SYNC → COMPLY → CAMPAIGN → QUOTE → CLOSE
 * Beam: AnimatedBeam-style SVG path animation traveling node-to-node
 * Compliance gate: halts beam + shows red blocked state on manual trigger
 */

import { useRef, useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import {
  Download, Shuffle, Copy, Database, ShieldAlert,
  Megaphone, Calculator, PartyPopper, CheckCircle, XCircle, Clock,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Node definitions
// ─────────────────────────────────────────────────────────────────────────────

type NodeDef = {
  id: string
  label: string
  sublabel: string
  Icon: React.ElementType
  color: string          // oklch emissive color
  darkBg: string         // background for node card
  border: string         // border color
}

const NODES: NodeDef[] = [
  {
    id: "intake",
    label: "INTAKE",
    sublabel: "Lead captured",
    Icon: Download,
    color: "oklch(0.78 0.20 195)",
    darkBg: "oklch(0.78 0.20 195 / 0.10)",
    border: "oklch(0.78 0.20 195 / 0.30)",
  },
  {
    id: "normalize",
    label: "NORMALIZE",
    sublabel: "E.164 · loan map",
    Icon: Shuffle,
    color: "oklch(0.52 0.30 270)",
    darkBg: "oklch(0.52 0.30 270 / 0.10)",
    border: "oklch(0.52 0.30 270 / 0.30)",
  },
  {
    id: "dedupe",
    label: "DEDUPE",
    sublabel: "Hash check",
    Icon: Copy,
    color: "oklch(0.52 0.30 270)",
    darkBg: "oklch(0.52 0.30 270 / 0.10)",
    border: "oklch(0.52 0.30 270 / 0.30)",
  },
  {
    id: "crm",
    label: "CRM SYNC",
    sublabel: "Twenty · source of record",
    Icon: Database,
    color: "oklch(0.52 0.30 270)",
    darkBg: "oklch(0.52 0.30 270 / 0.10)",
    border: "oklch(0.52 0.30 270 / 0.30)",
  },
  {
    id: "comply",
    label: "COMPLY",
    sublabel: "DNC · consent · TCPA",
    Icon: ShieldAlert,
    color: "oklch(0.65 0.22 27)",   // rose-red — this node can block
    darkBg: "oklch(0.65 0.22 27 / 0.10)",
    border: "oklch(0.65 0.22 27 / 0.35)",
  },
  {
    id: "campaign",
    label: "CAMPAIGN",
    sublabel: "45-day multi-channel",
    Icon: Megaphone,
    color: "oklch(0.65 0.32 330)",
    darkBg: "oklch(0.65 0.32 330 / 0.10)",
    border: "oklch(0.65 0.32 330 / 0.30)",
  },
  {
    id: "quote",
    label: "QUOTE",
    sublabel: "3-option · broker approval",
    Icon: Calculator,
    color: "oklch(0.80 0.18 160)",
    darkBg: "oklch(0.80 0.18 160 / 0.10)",
    border: "oklch(0.80 0.18 160 / 0.30)",
  },
  {
    id: "close",
    label: "CLOSE",
    sublabel: "Loan funded 🎉",
    Icon: PartyPopper,
    color: "oklch(0.78 0.16 80)",   // gold
    darkBg: "oklch(0.78 0.16 80 / 0.12)",
    border: "oklch(0.78 0.16 80 / 0.35)",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Beam SVG path component
// ─────────────────────────────────────────────────────────────────────────────

function BeamLine({
  fromX, toX, y, active, blocked, color,
}: {
  fromX: number
  toX: number
  y: number
  active: boolean
  blocked: boolean
  color: string
}) {
  const length = toX - fromX

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ left: fromX, top: y - 2, width: length, height: 4, overflow: "visible" }}
    >
      {/* Track */}
      <line
        x1={0} y1={2}
        x2={length} y2={2}
        stroke={blocked ? "oklch(0.65 0.22 27 / 0.20)" : "oklch(1 0 0 / 0.08)"}
        strokeWidth={1}
      />
      {/* Animated beam */}
      {active && !blocked && (
        <motion.line
          x1={0} y1={2}
          x2={length} y2={2}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 1, 0.6] }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      )}
      {/* Blocked indicator */}
      {blocked && (
        <motion.line
          x1={0} y1={2}
          x2={length * 0.4} y2={2}
          stroke="oklch(0.65 0.22 27)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="4 3"
          animate={{ strokeDashoffset: [0, -14] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
        />
      )}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Single node card
// ─────────────────────────────────────────────────────────────────────────────

function MachineNode({
  node, state,
}: {
  node: NodeDef
  state: "idle" | "active" | "passed" | "blocked"
}) {
  const Icon = node.Icon

  const isBlocked = state === "blocked"
  const isActive = state === "active"
  const isPassed = state === "passed"

  return (
    <motion.div
      className="relative flex flex-col items-center gap-1.5 w-[88px]"
      animate={{
        scale: isActive ? 1.06 : 1,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Node icon box */}
      <div
        className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
        style={{
          background: isBlocked
            ? "oklch(0.65 0.22 27 / 0.18)"
            : isPassed
            ? `color-mix(in oklch, ${node.color} 20%, transparent)`
            : node.darkBg,
          border: `1px solid ${isBlocked ? "oklch(0.65 0.22 27 / 0.50)" : isPassed ? node.border.replace("0.30", "0.55") : node.border}`,
          boxShadow: isActive
            ? `0 0 20px ${node.color.replace(")", " / 0.35)")}, 0 0 40px ${node.color.replace(")", " / 0.15)")}`
            : isPassed
            ? `0 0 10px ${node.color.replace(")", " / 0.20)")}`
            : "none",
        }}
      >
        <Icon
          size={20}
          style={{
            color: isBlocked ? "oklch(0.65 0.22 27)" : isPassed ? node.color : "oklch(0.60 0.04 270)",
            transition: "color 0.3s ease",
          }}
        />
        {/* Active pulse ring */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{ border: `1px solid ${node.color}` }}
            animate={{ scale: [1, 1.25, 1.5], opacity: [0.8, 0.3, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
        {/* Passed checkmark */}
        {isPassed && (
          <motion.div
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ background: node.color }}
          >
            <CheckCircle size={10} className="text-black" />
          </motion.div>
        )}
        {/* Blocked X */}
        {isBlocked && (
          <motion.div
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ background: "oklch(0.65 0.22 27)" }}
          >
            <XCircle size={10} className="text-white" />
          </motion.div>
        )}
      </div>

      {/* Label */}
      <div className="text-center">
        <p
          className="text-[9px] font-black tracking-widest uppercase"
          style={{
            color: isBlocked
              ? "oklch(0.65 0.22 27)"
              : isPassed || isActive
              ? node.color
              : "oklch(0.45 0.04 270)",
          }}
        >
          {node.label}
        </p>
        <p className="text-[8px] leading-tight mt-0.5" style={{ color: "oklch(0.38 0.04 270)" }}>
          {node.sublabel}
        </p>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main TheMachine component
// ─────────────────────────────────────────────────────────────────────────────

export function TheMachine() {
  const [currentStep, setCurrentStep] = useState(-1)   // -1 = idle
  const [complianceBlocked, setComplianceBlocked] = useState(false)
  const [running, setRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const COMPLY_INDEX = 4

  const runSequence = useCallback(() => {
    if (running) return
    setRunning(true)
    setComplianceBlocked(false)
    setCurrentStep(0)

    let step = 0
    const STEP_MS = 700

    const advance = () => {
      step += 1
      if (step === COMPLY_INDEX) {
        // 50% chance of compliance block for demo
        const willBlock = Math.random() < 0.35
        if (willBlock) {
          setCurrentStep(step)
          setComplianceBlocked(true)
          // Auto-approve after 2s for demo
          timerRef.current = setTimeout(() => {
            setComplianceBlocked(false)
            timerRef.current = setTimeout(advance, STEP_MS)
          }, 2200)
          return
        }
      }
      setCurrentStep(step)
      if (step < NODES.length - 1) {
        timerRef.current = setTimeout(advance, STEP_MS)
      } else {
        // Reset after showing "CLOSE" for 3 seconds
        timerRef.current = setTimeout(() => {
          setCurrentStep(-1)
          setRunning(false)
        }, 3000)
      }
    }

    timerRef.current = setTimeout(advance, STEP_MS)
  }, [running])

  // Auto-start on first mount with a delay
  useEffect(() => {
    const t = setTimeout(runSequence, 1200)
    return () => {
      clearTimeout(t)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Repeat loop
  useEffect(() => {
    if (currentStep === -1 && !running) {
      const t = setTimeout(runSequence, 1800)
      return () => clearTimeout(t)
    }
  }, [currentStep, running, runSequence])

  const getNodeState = (index: number): "idle" | "active" | "passed" | "blocked" => {
    if (currentStep < 0) return "idle"
    if (index === currentStep && index === COMPLY_INDEX && complianceBlocked) return "blocked"
    if (index === currentStep) return "active"
    if (index < currentStep) return "passed"
    return "idle"
  }

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Section background */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 50%, oklch(0.52 0.30 270 / 0.06), transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center gap-10">
        {/* Section heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "oklch(0.78 0.20 195)" }}>
            The machine
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Eight nodes. One pipeline.
          </h2>
          <p className="text-white/50 max-w-lg text-sm leading-relaxed">
            Every lead travels the same path. Every node checks before it fires. Every compliance gate halts the beam if the signal is wrong.
          </p>
        </div>

        {/* The Machine visual */}
        <div className="relative w-full overflow-x-auto">
          <div className="flex items-center justify-between min-w-[720px] px-4 py-8 relative">
            {/* Beam lines (between nodes) */}
            <div className="absolute inset-0 pointer-events-none">
              {NODES.slice(0, -1).map((node, i) => {
                const nodeW = 88
                const gap = Math.floor((720 - nodeW * 8) / 7)
                const fromX = 16 + i * (nodeW + gap) + nodeW
                const toX = fromX + gap
                const isBeamActive = currentStep > i
                const isBlocked = i === COMPLY_INDEX - 1 && complianceBlocked

                return (
                  <BeamLine
                    key={node.id}
                    fromX={fromX}
                    toX={toX}
                    y={32}  // top of node icons
                    active={isBeamActive}
                    blocked={isBlocked}
                    color={node.color}
                  />
                )
              })}
            </div>

            {/* Node cards */}
            {NODES.map((node, i) => (
              <MachineNode
                key={node.id}
                node={node}
                state={getNodeState(i)}
              />
            ))}
          </div>
        </div>

        {/* Compliance blocked overlay banner */}
        <AnimatePresence>
          {complianceBlocked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-3 px-5 py-3 rounded-xl"
              style={{
                background: "oklch(0.65 0.22 27 / 0.14)",
                border: "1px solid oklch(0.65 0.22 27 / 0.40)",
              }}
            >
              <ShieldAlert size={16} style={{ color: "oklch(0.65 0.22 27)" }} />
              <div>
                <p className="text-sm font-bold" style={{ color: "oklch(0.65 0.22 27)" }}>
                  Compliance gate — DNC match detected
                </p>
                <p className="text-xs text-white/40">Beam halted. Awaiting broker review… (auto-resolving demo)</p>
              </div>
              <Clock size={14} className="ml-auto text-white/30 animate-spin" style={{ animationDuration: "3s" }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual replay button */}
        <button
          onClick={runSequence}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
          style={{
            background: "oklch(0.10 0.03 270 / 0.8)",
            border: "1px solid oklch(0.25 0.06 270 / 0.5)",
            color: "oklch(0.65 0.10 270)",
          }}
        >
          {running ? "Processing…" : "↺ Run sequence again"}
        </button>
      </div>
    </section>
  )
}
