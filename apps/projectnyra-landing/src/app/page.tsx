"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Bot, Brain, Shield, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Lead Intelligence",
    desc: "Every inbound lead is scored, profiled, and routed before your team picks up the phone.",
  },
  {
    icon: Zap,
    title: "Automated Compliance",
    desc: "TCPA, DNC, RESPA, and TILA guardrails enforced at the infrastructure layer.",
  },
  {
    icon: TrendingUp,
    title: "Pipeline Intelligence",
    desc: "Real-time dashboards tracking every deal from first contact to funded.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "End-to-end encrypted operations. Your borrower data never leaves your infrastructure.",
  },
];

const STATS = [
  { label: "Active Deals Tracked", value: "$24.5M" },
  { label: "Avg Response Time", value: "< 2 min" },
  { label: "Compliance Score", value: "98.5%" },
  { label: "AI Tools Ready", value: "9 active" },
];

function GlowOrb({ x, y, color }: { x: string; y: string; color: string }) {
  return (
    <div
      className="pointer-events-none absolute rounded-full blur-[120px] opacity-20"
      style={{
        left: x,
        top: y,
        width: 600,
        height: 600,
        background: color,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}

function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, -80]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="relative min-h-screen text-white overflow-hidden">
      <GridBackground />
      <GlowOrb x="50%" y="0%" color="rgba(99,102,241,1)" />
      <GlowOrb x="80%" y="60%" color="rgba(20,184,166,1)" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <Bot size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">Project Nyra</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://app.projectnyra.com"
            className="flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/30"
          >
            Enter App <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center pt-20"
      >
        <AnimatePresence>
          {mounted && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-300"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400" />
                </span>
                AI-Native Mortgage Operations · Live
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="max-w-4xl text-6xl font-black tracking-tighter leading-[0.9] md:text-8xl"
              >
                The Neural{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-teal-400 bg-clip-text text-transparent">
                  Command Deck
                </span>{" "}
                for Modern Brokers
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mt-8 max-w-xl text-lg text-white/60 leading-relaxed"
              >
                Project Nyra gives mortgage brokers an AI-powered operations layer — from lead
                intake to closing, fully automated and always compliant.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="mt-10 flex flex-wrap items-center justify-center gap-4"
              >
                <Link
                  href="https://app.projectnyra.com"
                  className="flex items-center gap-2 rounded-full bg-indigo-500 px-8 py-4 text-sm font-bold text-white hover:bg-indigo-400 transition-colors shadow-xl shadow-indigo-500/30"
                >
                  Enter Command Deck <ArrowRight size={16} />
                </Link>
                <Link
                  href="https://ratehunter.net"
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  Borrower Portal →
                </Link>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Stats bar */}
      <section className="relative border-y border-white/5 bg-white/[0.02] backdrop-blur-sm py-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 px-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="mt-1 text-[11px] text-white/40 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-5xl px-4 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
            Platform
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            Built for how brokers actually work
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group rounded-3xl border border-white/8 bg-white/[0.03] p-8 backdrop-blur-sm transition-colors hover:border-indigo-500/20 hover:bg-indigo-500/5"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <f.icon size={20} className="text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-3xl px-4 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-16"
        >
          <h2 className="text-4xl font-black tracking-tight">Ready to operate at a different level?</h2>
          <p className="mt-4 text-white/50">Ellis Andersen · West Capital Lending · NMLS 1912260</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="https://app.projectnyra.com"
              className="rounded-full bg-indigo-500 px-10 py-4 text-sm font-bold text-white hover:bg-indigo-400 transition-colors shadow-xl shadow-indigo-500/30"
            >
              Enter Command Deck
            </Link>
            <Link
              href="https://ratehunter.net"
              className="rounded-full border border-white/10 px-10 py-4 text-sm font-semibold text-white/70 hover:text-white hover:border-white/20 transition-colors"
            >
              Borrower Portal
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-[11px] text-white/25">
          © 2026 Project Nyra · Ellis Andersen · West Capital Lending · NMLS 1912260 · DRE 02196940
        </p>
      </footer>
    </main>
  );
}
