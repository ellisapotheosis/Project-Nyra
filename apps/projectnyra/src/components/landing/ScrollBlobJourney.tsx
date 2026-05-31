"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from "framer-motion"
import { NyraBlobMascot, type BlobExpression } from "@/components/neonblade/NyraBlobMascot"
import {
  Users, Database, Zap, ShieldAlert, MailCheck, Calculator, HandshakeIcon,
  Lock, CheckCircle, UserCircle,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Gate definitions
// ─────────────────────────────────────────────────────────────────────────────

type GateSide = "left" | "right" | "center"

interface Gate {
  id: string
  label: string
  sublabel: string
  desc: string
  side: GateSide
  color: string           // oklch color string
  borderColor: string
  glowColor: string
  icon: React.ElementType
  isCompliance?: boolean  // STOP/DNC gate — blob gets blocked
  isFinal?: boolean       // last gate — celebration
}

const GATES: Gate[] = [
  {
    id: "intake",
    label: "Lead Intake",
    sublabel: "EMAIL · API · WEBHOOK · FORM",
    desc: "Inbound leads from every channel are captured and queued for normalization.",
    side: "right",
    color: "oklch(0.78 0.20 195)",
    borderColor: "oklch(0.78 0.20 195 / 0.4)",
    glowColor: "oklch(0.78 0.20 195 / 0.15)",
    icon: Users,
  },
  {
    id: "normalize",
    label: "Normalize + Dedupe",
    sublabel: "PHONE · SOURCE · LOAN TYPE",
    desc: "Phones normalized to E.164. Duplicates matched and merged. Loan purpose mapped.",
    side: "left",
    color: "oklch(0.52 0.30 270)",
    borderColor: "oklch(0.52 0.30 270 / 0.4)",
    glowColor: "oklch(0.52 0.30 270 / 0.15)",
    icon: Database,
  },
  {
    id: "crm",
    label: "TwentyCRM Sync",
    sublabel: "SYSTEM OF RECORD",
    desc: "Canonical lead record written to TwentyCRM. Timeline event logged. Campaign fields set.",
    side: "right",
    color: "oklch(0.52 0.30 270)",
    borderColor: "oklch(0.52 0.30 270 / 0.4)",
    glowColor: "oklch(0.52 0.30 270 / 0.15)",
    icon: Zap,
  },
  {
    id: "compliance",
    label: "STOP / DNC Gate",
    sublabel: "TCPA · CAN-SPAM · QUIET HOURS",
    desc: "Any reply, STOP keyword, DNC flag, or quiet-hours violation halts automation before the next touch. Human broker controls what happens next.",
    side: "left",
    color: "oklch(0.55 0.28 10)",
    borderColor: "oklch(0.55 0.28 10 / 0.5)",
    glowColor: "oklch(0.55 0.28 10 / 0.20)",
    icon: ShieldAlert,
    isCompliance: true,
  },
  {
    id: "campaign",
    label: "45-Day Drip Campaign",
    sublabel: "SMS · EMAIL · VOICEMAIL · CALL",
    desc: "Loan-purpose–matched multi-channel sequence. Every touchpoint pre-checked before send.",
    side: "right",
    color: "oklch(0.65 0.32 330)",
    borderColor: "oklch(0.65 0.32 330 / 0.4)",
    glowColor: "oklch(0.65 0.32 330 / 0.15)",
    icon: MailCheck,
  },
  {
    id: "quote",
    label: "Quote Engine",
    sublabel: "3-OPTION DETERMINISTIC COMPARISON",
    desc: "Broker approves all quotes before the borrower sees anything. SAMPLE / MOCK until live APIs connected.",
    side: "left",
    color: "oklch(0.67 0.26 305)",
    borderColor: "oklch(0.67 0.26 305 / 0.4)",
    glowColor: "oklch(0.67 0.26 305 / 0.15)",
    icon: Calculator,
  },
  {
    id: "close",
    label: "Broker Close",
    sublabel: "HUMAN IN CONTROL · ALWAYS",
    desc: "Every funded loan was reviewed, approved, and closed by a licensed human broker — not an algorithm.",
    side: "center",
    color: "oklch(0.80 0.18 80)",
    borderColor: "oklch(0.80 0.18 80 / 0.4)",
    glowColor: "oklch(0.80 0.18 80 / 0.20)",
    icon: HandshakeIcon,
    isFinal: true,
  },
]

// X positions per gate side
const BLOB_X: Record<GateSide, string> = { right: "28vw", left: "-28vw", center: "0vw" }
// Expression per gate
const GATE_EXPR: Record<number, BlobExpression> = { 0:"excited", 1:"happy", 2:"happy", 3:"blocked", 4:"excited", 5:"thinking", 6:"celebrating" }


// ─────────────────────────────────────────────────────────────────────────────
// GateCard sub-component
// ─────────────────────────────────────────────────────────────────────────────

interface GateCardProps {
  gate: Gate
  active: boolean       // blob is near this gate
  passed: boolean       // blob has moved past this gate
  compliance: "idle" | "blocked" | "approved"  // only meaningful when gate.isCompliance
}

function GateCard({ gate, active, passed, compliance }: GateCardProps) {
  const Icon = gate.icon
  const isBlocked = gate.isCompliance && compliance === "blocked"
  const isApproved = gate.isCompliance && compliance === "approved"

  return (
    <motion.div
      className="relative flex flex-col gap-3 rounded-2xl p-5 max-w-[380px]"
      style={{
        background: active || passed
          ? `radial-gradient(ellipse at center, ${gate.glowColor}, transparent 70%),
             oklch(0.08 0.02 270 / 0.75)`
          : "oklch(0.06 0.01 270 / 0.50)",
        border: `1.5px solid ${active || passed ? gate.borderColor : "oklch(0.20 0.03 270 / 0.3)"}`,
        backdropFilter: "blur(16px)",
        boxShadow: active ? `0 0 32px ${gate.glowColor}` : "none",
      }}
      animate={{
        opacity: active || passed ? 1 : 0.35,
        y: active ? 0 : 8,
        scale: active ? 1 : 0.97,
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
          style={{ background: `${gate.color.replace(")", " / 0.18)")}`, border: `1px solid ${gate.borderColor}` }}
        >
          {isBlocked ? (
            <Lock size={17} style={{ color: gate.color }} />
          ) : isApproved || passed ? (
            <CheckCircle size={17} style={{ color: gate.color }} />
          ) : (
            <Icon size={17} style={{ color: gate.color }} />
          )}
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: gate.color }}>
            {gate.sublabel}
          </p>
          <h3 className="text-base font-bold text-white leading-tight">{gate.label}</h3>
        </div>
        {(passed || isApproved) && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${gate.color.replace(")", " / 0.18)")}`, color: gate.color }}
          >
            ✓ PASSED
          </motion.div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-white/60 leading-relaxed">{gate.desc}</p>

      {/* Compliance gate special states */}
      <AnimatePresence>
        {isBlocked && (
          <motion.div
            key="blocked-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[oklch(0.55_0.28_10/0.18)] border border-[oklch(0.55_0.28_10/0.4)]">
              <ShieldAlert size={14} className="text-[oklch(0.80_0.25_10)] shrink-0" />
              <span className="text-xs text-[oklch(0.85_0.15_10)]">
                Automation halted — awaiting broker review
              </span>
            </div>
          </motion.div>
        )}
        {isApproved && (
          <motion.div
            key="approved-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[oklch(0.55_0.22_150/0.18)] border border-[oklch(0.55_0.22_150/0.4)]">
              <UserCircle size={14} className="text-[oklch(0.78_0.20_150)] shrink-0" />
              <span className="text-xs text-[oklch(0.82_0.12_150)]">
                Broker approved — resuming sequence
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ScrollBlobJourney export
// ─────────────────────────────────────────────────────────────────────────────

export function ScrollBlobJourney() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeGate, setActiveGate] = useState<number>(-1)
  const [blobExpr, setBlobExpr] = useState<BlobExpression>("happy")
  const [complianceState, setComplianceState] = useState<"idle" | "blocked" | "approved">("idle")

  // One gate every ~1/7 of scroll range, centered inside the container
  // progress: 0 = top of scroll zone, 1 = bottom
  const gateCount = GATES.length
  // Midpoint of each gate in scroll progress (0.05 → 0.95, evenly spaced)
  const gateProgress = GATES.map((_, i) => 0.05 + (i / (gateCount - 1)) * 0.90)

  // X positions for the blob for each gate (matching BLOB_X by side)
  const xValues = GATES.map(g => BLOB_X[g.side])

  // Scroll progress bound to this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Blob X: lerp between gate X positions as scroll progresses
  // We add a leading "center" for before first gate and trailing for after last
  const blobX = useTransform(
    scrollYProgress,
    [0, ...gateProgress, 1],
    ["0vw", ...xValues, "0vw"],
  )

  // Blob Y: slight vertical drift between gates (cosmetic)
  const blobY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["-5vh", "0vh", "5vh"],
  )

  // Track which gate is active and drive blob expression + compliance state
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Find the nearest gate
    let nearest = -1
    let nearestDist = Infinity
    for (let i = 0; i < gateProgress.length; i++) {
      const dist = Math.abs(latest - gateProgress[i])
      if (dist < nearestDist) { nearestDist = dist; nearest = i }
    }

    // "Active" window: ±0.06 of gate center
    const isNear = nearestDist < 0.06
    const newActive = isNear ? nearest : -1
    setActiveGate(newActive)

    if (newActive === -1) {
      // Between gates — keep current expression or reset to happy
      setBlobExpr(prev => (prev === "blocked" || prev === "celebrating") ? prev : "happy")
      return
    }

    const gate = GATES[newActive]

    if (gate.isCompliance) {
      // Compliance gate sequence
      if (latest < gateProgress[newActive]) {
        // Approaching — show blocked
        setBlobExpr("blocked")
        setComplianceState("blocked")
      } else {
        // Passed — human approved, show happy
        setBlobExpr("happy")
        setComplianceState("approved")
      }
    } else {
      setComplianceState("idle")
      setBlobExpr(GATE_EXPR[newActive] ?? "happy")
    }
  })

  // Determine which gates are "passed" (scroll is clearly past them)
  const passedGates = gateProgress.map(p => {
    // This is a derived value; we use a stable approach: compare against scrollYProgress
    return false // Will be overridden by scroll events — placeholder for SSR
  })


  // Track passed gates as state (updated on scroll)
  const [passedSet, setPassedSet] = useState<Set<number>>(new Set())
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setPassedSet(prev => {
      const next = new Set(prev)
      for (let i = 0; i < gateProgress.length; i++) {
        if (latest > gateProgress[i] + 0.04) next.add(i)
        else next.delete(i)
      }
      return next
    })
  })

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: "700vh" }}   // tall scroll container
    >
      {/* Section header — outside sticky zone */}
      <div className="flex flex-col items-center gap-3 pt-24 pb-8 px-6 text-center">
        <span className="text-xs font-semibold tracking-widest uppercase text-[oklch(0.78_0.20_195)]">
          How it works
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight max-w-2xl">
          One lead. Every step. <span className="text-[oklch(0.65_0.32_330)]">Zero gaps.</span>
        </h2>
        <p className="text-base text-white/50 max-w-xl">
          Scroll to watch Nyra guide your lead from raw capture to funded loan — with a human broker in control at every compliance gate.
        </p>
      </div>

      {/* Sticky viewport — blob + gates */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">

        {/* Background ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,oklch(0.52_0.30_270/0.07),transparent)]" />
        </div>

        {/* Gate cards — left column */}
        <div className="absolute left-4 md:left-12 top-0 h-full flex flex-col justify-around py-16 pointer-events-none">
          {GATES.filter(g => g.side === "left").map(g => {
            const idx = GATES.indexOf(g)
            return (
              <GateCard
                key={g.id} gate={g}
                active={activeGate === idx}
                passed={passedSet.has(idx)}
                compliance={g.isCompliance ? complianceState : "idle"}
              />
            )
          })}
        </div>

        {/* Gate cards — right column */}
        <div className="absolute right-4 md:right-12 top-0 h-full flex flex-col justify-around py-16 pointer-events-none">
          {GATES.filter(g => g.side === "right").map(g => {
            const idx = GATES.indexOf(g)
            return (
              <GateCard
                key={g.id} gate={g}
                active={activeGate === idx}
                passed={passedSet.has(idx)}
                compliance="idle"
              />
            )
          })}
        </div>

        {/* Final (center) gate — bottom of sticky zone */}
        {GATES.filter(g => g.side === "center").map(g => {
          const idx = GATES.indexOf(g)
          return (
            <div key={g.id} className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pointer-events-none">
              <GateCard
                gate={g}
                active={activeGate === idx}
                passed={passedSet.has(idx)}
                compliance="idle"
              />
            </div>
          )
        })}

        {/* ── Nyra blob mascot (sticky, scroll-driven X position) ── */}
        <motion.div
          className="absolute z-10 pointer-events-none"
          style={{ x: blobX, y: blobY, top: "50%", translateY: "-50%" }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
        >
          {/* Glow halo behind blob */}
          <motion.div
            className="absolute inset-0 rounded-full blur-3xl -z-10"
            style={{ background: "oklch(0.65 0.32 270 / 0.25)", scale: 1.6 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <NyraBlobMascot
            expression={blobExpr}
            size={140}
            glowing={activeGate !== -1}
          />

          {/* Expression label for compliance gate */}
          <AnimatePresence>
            {blobExpr === "blocked" && (
              <motion.div
                key="blocked-tag"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold tracking-wider text-[oklch(0.80_0.25_10)] bg-[oklch(0.08_0.02_10/0.8)] border border-[oklch(0.55_0.28_10/0.5)] rounded-full px-3 py-1"
              >
                ✋ STOP — checking with broker
              </motion.div>
            )}
            {blobExpr === "celebrating" && (
              <motion.div
                key="celebrating-tag"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold tracking-wider text-[oklch(0.85_0.22_80)] bg-[oklch(0.08_0.02_80/0.8)] border border-[oklch(0.80_0.18_80/0.5)] rounded-full px-3 py-1"
              >
                🎉 Loan closed!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Scroll progress indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <motion.div
            className="w-px bg-white/30"
            style={{ height: "40px", scaleY: scrollYProgress, originY: 0 }}
          />
          <span className="text-[10px] tracking-widest uppercase text-white/40">scroll</span>
        </div>
      </div>
    </section>
  )
}
