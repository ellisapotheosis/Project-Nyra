"use client"

/**
 * ProjectNyra.com — Final quality landing page
 * Stack: Next.js 15, Framer Motion, TweakCN oklch, shadcn/ui
 * Integrates: AnimatedNoise, ScrollBlobJourney, FrostedCard,
 *             ScrambleTextOnHover, SplitFlapDisplay, NyraBlobMascot
 *
 * All oklch colors reference the Nyra Foundation Palette:
 *   Void Black   #030006 → oklch(0.02 0.01 270)
 *   Deep Plum    #14051F → oklch(0.07 0.05 290)
 *   Nyra Purple  #8F4DFF → oklch(0.52 0.30 270)
 *   Hot Pink     #FF4FC4 → oklch(0.65 0.32 330)
 *   Electric Cyan #30E7FF → oklch(0.78 0.20 195)
 *   Seafoam      #8AFFC1 → oklch(0.80 0.18 160)
 *   Rose Lock    #FF3D6E → oklch(0.55 0.28 10)
 */

import { useRef, useState, useEffect, useCallback } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { ScrollBlobJourney } from "@/components/landing/ScrollBlobJourney"
import { FrostedCard, FrostedStat } from "@/components/neonblade/FrostedCard"
import { ScrambleTextOnHover, AnimatedNoise } from "@/components/neonblade/ScrambleText"
import { SplitFlapDisplay } from "@/components/neonblade/SplitFlapText"
import {
  Zap, ShieldCheck, Bot, BarChart3, Phone, Mail, MessageSquare,
  CheckCircle, ArrowRight, ChevronDown, Star, Lock, Globe, Cpu,
  Database, FileText, Users, Calculator, Layers,
} from "lucide-react"
import { TheMachine } from "@/components/landing/TheMachine"
import { EncryptedPipelineLine } from "@/components/landing/EncryptedLine"

// ─────────────────────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = ["Platform", "Compliance", "Quote Engine", "Integrations", "Pricing"]

function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 transition-all duration-300"
      style={{
        background: scrolled ? "oklch(0.05 0.02 270 / 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid oklch(0.20 0.05 270 / 0.3)" : "none",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[oklch(0.52_0.30_270)] flex items-center justify-center">
          <span className="text-white font-black text-sm leading-none">N</span>
        </div>
        <span className="font-black text-white text-base tracking-tight">PROJECT NYRA</span>
      </div>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-7">
        {NAV_LINKS.map(link => (
          <ScrambleTextOnHover
            key={link}
            text={link}
            className="text-sm font-medium text-white/60 hover:text-white transition-colors cursor-pointer"
            scrambleClassName="text-[oklch(0.78_0.20_195)]"
          />
        ))}
      </div>

      {/* CTA */}
      <a
        href="#early-access"
        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-black transition-all"
        style={{ background: "oklch(0.65 0.32 330)" }}
      >
        Get Early Access <ArrowRight size={14} />
      </a>
    </nav>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[oklch(0.02_0.01_270)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,oklch(0.52_0.30_270/0.15),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_80%,oklch(0.65_0.32_330/0.08),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,oklch(0.78_0.20_195/0.07),transparent)]" />

      {/* Film grain */}
      <AnimatedNoise opacity={0.04} frameSkip={3} className="absolute inset-0 pointer-events-none z-10" />

      <div className="relative z-20 flex flex-col items-center text-center gap-6 px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{ background: "oklch(0.52_0.30_270/0.15)", border: "1px solid oklch(0.52 0.30 270 / 0.3)", color: "oklch(0.78 0.20 195)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.78_0.20_195)] animate-pulse" />
          AI-Native Mortgage Automation
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-black text-white leading-[0.95] tracking-tight"
        >
          The Stack That{" "}
          <span style={{
            background: "linear-gradient(135deg, oklch(0.65 0.32 330), oklch(0.52 0.30 270), oklch(0.78 0.20 195))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Never Sleeps.
          </span>
        </motion.h1>

        {/* Encrypted pipeline line */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }}
          className="py-2"
        >
          <EncryptedPipelineLine />
        </motion.div>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-white/55 max-w-2xl leading-relaxed"
        >
          Capture leads from every channel. Normalize, dedupe, and sync to TwentyCRM.
          Run compliant 45-day multi-channel drip campaigns — and stop instantly on any reply.
          Broker-approved quotes only. Human in control, always.
        </motion.p>

        {/* Channel badges */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {["Email Parsing", "LendingTree API", "FreeRateUpdate", "LeadMailbox", "Webhooks", "Manual Entry"].map(ch => (
            <span
              key={ch}
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: "oklch(0.10 0.03 270 / 0.8)", border: "1px solid oklch(0.25 0.06 270 / 0.5)", color: "oklch(0.70 0.10 270)" }}
            >
              {ch}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 mt-2"
        >
          <a
            href="#early-access"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base text-black transition-all hover:brightness-110 active:scale-95"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.32 330), oklch(0.52 0.30 270))" }}
          >
            Get Early Access <ArrowRight size={16} />
          </a>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base text-white/80 transition-all hover:text-white hover:bg-white/5"
            style={{ border: "1px solid oklch(0.25 0.06 270 / 0.5)" }}
          >
            See how it works <ChevronDown size={16} />
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-4 mt-8 w-full max-w-xl"
        >
          {[
            { value: "45-Day", label: "Multi-channel drip" },
            { value: "6 Types", label: "Loan purposes covered" },
            { value: "100%", label: "Human-approved quotes" },
          ].map(s => (
            <FrostedStat key={s.label} value={s.value} label={s.label} />
          ))}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={18} className="text-white/30" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE GRID
// ─────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: Layers, title: "Multi-Channel Ingestion", desc: "Email, API, webhook, LeadMailbox, missed call, manual entry — every lead route captured.", variant: "cyan" as const },
  { icon: Database, title: "Normalize + Dedupe", desc: "Phones normalized, loan purpose mapped, duplicates merged before a single record writes.", variant: "violet" as const },
  { icon: Users, title: "TwentyCRM Sync", desc: "Canonical records in TwentyCRM. Timeline events logged. Campaign fields auto-set.", variant: "violet" as const },
  { icon: ShieldCheck, title: "STOP / DNC Guardrails", desc: "Any reply, STOP keyword, or quiet-hours flag halts automation. Broker decides what's next.", variant: "rose" as const },
  { icon: MessageSquare, title: "45-Day Drip Campaigns", desc: "SMS, email, voicemail drop, call tasks — by loan purpose. Every touch pre-compliance-checked.", variant: "pink" as const },
  { icon: Calculator, title: "Quote Engine", desc: "3-option deterministic comparison. Broker approves before any rate reaches a borrower.", variant: "mint" as const },
  { icon: Bot, title: "OpenClaw Assistant", desc: "AI concierge that can answer, qualify, and help — but cannot quote rates or promise approval.", variant: "violet" as const },
  { icon: BarChart3, title: "Pipeline Analytics", desc: "Lead timeline, campaign performance, quote conversion — all in one command center.", variant: "cyan" as const },
  { icon: Lock, title: "Compliance-First", desc: "TCPA/CAN-SPAM controls, consent tracking, DNC list enforcement, and full audit trail.", variant: "rose" as const },
  { icon: Cpu, title: "Local GPU Inference", desc: "RTX 5090/3090Ti/3060 workers for private LLM inference. No leads sent to third-party LLMs.", variant: "mint" as const },
  { icon: Globe, title: "Nexus MCP Router", desc: "Single gateway for all AI tool calls — memory, CRM, quote, campaign — with spend controls.", variant: "violet" as const },
  { icon: FileText, title: "Quote PDF Generation", desc: "PDF quotes with full assumptions, expiry dates, and broker approval stamp.", variant: "cyan" as const },
]

function FeatureGrid() {
  return (
    <section className="relative py-32 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,oklch(0.52_0.30_270/0.06),transparent)]" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center gap-3 text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-[oklch(0.65_0.32_330)]">
            Full platform
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Everything a broker needs.{" "}
            <span className="text-[oklch(0.52_0.30_270)]">Nothing they don't.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FrostedCard
              key={f.title}
              variant={f.variant}
              className="p-5 flex flex-col gap-3"
              hover
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `var(--frosted-glow-${f.variant}, oklch(0.52 0.30 270 / 0.18))` }}
              >
                <f.icon size={17} className="text-white/80" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{f.desc}</p>
              </div>
            </FrostedCard>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LOAN TYPES
// ─────────────────────────────────────────────────────────────────────────────

const LOAN_TYPES = [
  { label: "Purchase", color: "oklch(0.78 0.20 195)", icon: "🏠" },
  { label: "Refinance", color: "oklch(0.52 0.30 270)", icon: "🔄" },
  { label: "Cash-Out", color: "oklch(0.65 0.32 330)", icon: "💸" },
  { label: "HELOC / HELOAN", color: "oklch(0.67 0.26 305)", icon: "🏦" },
  { label: "Commercial", color: "oklch(0.80 0.18 80)", icon: "🏢" },
  { label: "Hard Money", color: "oklch(0.55 0.28 10)", icon: "⚡" },
]

function LoanTypesSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-3 text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-[oklch(0.80_0.18_160)]">
            Campaign routing
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Campaigns matched to every loan type
          </h2>
          <p className="text-white/50 max-w-xl text-base">
            Each lead is routed to a purpose-built drip sequence. The messaging, timing, and channels are tuned for how that loan type actually closes.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {LOAN_TYPES.map(lt => (
            <FrostedCard key={lt.label} className="p-4 flex items-center gap-3">
              <span className="text-2xl">{lt.icon}</span>
              <div>
                <p className="font-bold text-white text-sm">{lt.label}</p>
                <p className="text-xs mt-0.5" style={{ color: lt.color }}>45-day sequence</p>
              </div>
            </FrostedCard>
          ))}
        </div>

        {/* Channels row */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {[
            { icon: Phone, label: "Call Task" },
            { icon: MessageSquare, label: "SMS" },
            { icon: Mail, label: "Email" },
            { icon: Zap, label: "Voicemail Drop" },
          ].map(ch => (
            <div
              key={ch.label}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/70"
              style={{ background: "oklch(0.08 0.02 270 / 0.6)", border: "1px solid oklch(0.20 0.05 270 / 0.4)" }}
            >
              <ch.icon size={14} className="text-[oklch(0.78_0.20_195)]" />
              {ch.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS SECTION with SplitFlapDisplay
// ─────────────────────────────────────────────────────────────────────────────

function StatsSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[oklch(0.05_0.02_270/0.4)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,oklch(0.65_0.32_330/0.06),transparent)]" />
      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center gap-8 text-center">
        <h2 className="text-3xl font-black text-white">
          Built for the mortgage broker who refuses to lose a lead
        </h2>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span className="text-white/50 text-sm">Campaigns built for:</span>
          <SplitFlapDisplay
            texts={["PURCHASE LEADS", "REFINANCE LEADS", "CASH-OUT LEADS", "HELOC LEADS", "COMMERCIAL", "HARD MONEY"]}
            className="text-lg font-black"
            charClassName="text-[oklch(0.65_0.32_330)] text-lg"
            holdMs={2500}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-4">
          <FrostedStat value="Day 0" label="First touch" sublabel="SMS within minutes of capture" />
          <FrostedStat value="4 Channels" label="Per sequence" sublabel="Call · SMS · Email · VM Drop" />
          <FrostedStat value="Instant" label="Campaign stop" sublabel="On any reply or STOP keyword" />
          <FrostedStat value="Broker" label="Quote approval" sublabel="No rate reaches a borrower unapproved" />
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLIANCE CALLOUT
// ─────────────────────────────────────────────────────────────────────────────

function ComplianceSection() {
  const items = [
    "TCPA consent verified before every outbound touch",
    "Quiet hours enforced in the recipient's local timezone",
    "STOP / UNSUBSCRIBE / QUIT / CANCEL / OPT-OUT all recognized",
    "Global suppression applied instantly across all channels",
    "Full audit trail for every send decision — allowed or denied",
    "DNC list enforced; violations never reach send queue",
    "Broker approval required for all quotes",
    "Human override available at any campaign stage",
  ]

  return (
    <section className="relative py-28 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,oklch(0.55_0.28_10/0.06),transparent)]" />
      <div className="max-w-5xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-5">
          <span className="text-xs font-semibold tracking-widest uppercase text-[oklch(0.55_0.28_10)]">
            Compliance-first
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
            Automation with a{" "}
            <span className="text-[oklch(0.80_0.25_10)]">human emergency brake</span>.
          </h2>
          <p className="text-white/55 leading-relaxed">
            Nyra automates the repetitive work, but the broker is always in control. Every compliance gate is enforced in code — not left to a workflow setting someone might click past.
          </p>
          <FrostedCard variant="rose" className="p-4 flex items-start gap-3">
            <ShieldCheck size={18} className="text-[oklch(0.80_0.25_10)] mt-0.5 shrink-0" />
            <p className="text-sm text-white/70">
              A single STOP keyword immediately ends <em>all</em> automation for that contact — across every channel, every future campaign — forever, until manually reviewed.
            </p>
          </FrostedCard>
        </div>

        <div className="flex flex-col gap-2.5">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ background: "oklch(0.07 0.02 270 / 0.6)", border: "1px solid oklch(0.18 0.04 270 / 0.4)" }}
            >
              <CheckCircle size={14} className="text-[oklch(0.80_0.25_10)] mt-0.5 shrink-0" />
              <span className="text-sm text-white/70">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// EARLY ACCESS FORM
// ─────────────────────────────────────────────────────────────────────────────

function EarlyAccessSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  return (
    <section id="early-access" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,oklch(0.52_0.30_270/0.12),transparent)]" />
      <AnimatedNoise opacity={0.03} frameSkip={4} className="absolute inset-0 pointer-events-none" />
      <div className="max-w-xl mx-auto relative z-10 flex flex-col items-center gap-6 text-center">
        <span className="text-xs font-semibold tracking-widest uppercase text-[oklch(0.65_0.32_330)]">
          Early access
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
          Be first in.<br />
          <span style={{
            background: "linear-gradient(135deg, oklch(0.65 0.32 330), oklch(0.78 0.20 195))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Build your waitlist.
          </span>
        </h2>
        <p className="text-white/50">
          Limited to licensed mortgage brokers. Demo access available after verification.
        </p>
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              onSubmit={e => { e.preventDefault(); setSubmitted(true) }}
              className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@brokerage.com"
                required
                className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[oklch(0.65_0.32_330/0.5)]"
                style={{ background: "oklch(0.08 0.02 270 / 0.8)", border: "1px solid oklch(0.25 0.06 270 / 0.5)" }}
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-bold text-sm text-black hover:brightness-110 transition-all"
                style={{ background: "linear-gradient(135deg, oklch(0.65 0.32 330), oklch(0.52 0.30 270))" }}
              >
                Request Access
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 px-5 py-4 rounded-xl"
              style={{ background: "oklch(0.52 0.30 270 / 0.15)", border: "1px solid oklch(0.52 0.30 270 / 0.4)" }}
            >
              <CheckCircle size={18} className="text-[oklch(0.80_0.18_160)]" />
              <span className="text-white font-medium text-sm">You're on the list. We'll be in touch.</span>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-xs text-white/30">No spam. No sharing. Unsubscribe any time.</p>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="relative border-t border-white/8 py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[oklch(0.52_0.30_270)] flex items-center justify-center">
            <span className="text-white font-black text-xs leading-none">N</span>
          </div>
          <span className="font-black text-white/70 text-sm tracking-tight">PROJECT NYRA</span>
        </div>
        <div className="flex flex-wrap gap-6 text-xs text-white/35">
          {["Privacy", "Terms", "Compliance Policy", "Contact"].map(l => (
            <a key={l} href="#" className="hover:text-white/60 transition-colors">{l}</a>
          ))}
        </div>
        <p className="text-xs text-white/25">
          © 2025 Project Nyra. Not a lender. Not a broker. AI infrastructure for licensed professionals.
        </p>
      </div>
      <p className="text-center text-[10px] text-white/20 mt-6 max-w-3xl mx-auto">
        SAMPLE / MOCK DATA ONLY. No rates quoted. No approvals implied. All campaign sends require broker-configured compliance rules. TCPA, CAN-SPAM, and state regulations apply. Consult legal counsel before deploying automated outreach.
      </p>
    </footer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectNyraLanding() {
  return (
    <main
      className="min-h-screen text-white antialiased"
      style={{ background: "oklch(0.02 0.01 270)", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <LandingNav />
      <Hero />
      <StatsSection />
      <FeatureGrid />

      {/* The Machine — 8-node pipeline visual */}
      <div id="the-machine" style={{ background: "oklch(0.03 0.015 270)" }}>
        <TheMachine />
      </div>

      <LoanTypesSection />

      {/* Scroll blob journey — full How It Works */}
      <div id="how-it-works" style={{ background: "oklch(0.03 0.015 270)" }}>
        <ScrollBlobJourney />
      </div>

      <ComplianceSection />
      <EarlyAccessSection />
      <Footer />
    </main>
  )
}

