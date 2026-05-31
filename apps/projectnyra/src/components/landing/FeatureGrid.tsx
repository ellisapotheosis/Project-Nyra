"use client";

/**
 * FEATURE GRID — "What Nyra Actually Does"
 * 6 feature cards using BorderBeamCard + aurora hover effect.
 * Each card has an icon, label, descriptor, and a micro-detail list.
 */

import { motion } from "framer-motion";
import {
  Inbox, Megaphone, FileText, MessageSquare, Brain, Shield,
} from "lucide-react";
import { BorderBeamCard } from "@/components/neonblade/CornerCutCard";

/* ─────────────────────────────────────────────────────
   Feature data
───────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Inbox,
    label: "Lead Ingestion",
    descriptor: "Every source, one pipe.",
    detail: [
      "Email parsing (IMAP/SMTP)",
      "API & webhook ingest (LendingTree, FRU)",
      "LeadMailbox sync",
      "Manual broker entry",
      "Normalize → dedupe → Twenty CRM write",
    ],
    color: "oklch(0.78 0.20 195)",
    beamDuration: 4.5,
  },
  {
    icon: Megaphone,
    label: "Campaign Engine",
    descriptor: "45–60 day multichannel drip.",
    detail: [
      "Purchase, refi, cash-out, HELOC/HELOAN",
      "Commercial + hard money tracks",
      "SMS, email, voicemail drop, call task",
      "STOP / reply = instant kill switch",
      "Quiet hours + consent enforced",
    ],
    color: "oklch(0.52 0.30 270)",
    beamDuration: 3.8,
  },
  {
    icon: FileText,
    label: "Quote Engine",
    descriptor: "3-option comparison. Broker-approved.",
    detail: [
      "Deterministic — no LLM fabrication",
      "Purchase, refi, cash-out, HELOC/HELOAN",
      "PDF generation per scenario",
      "Pending until broker approval",
      "Synced to Twenty CRM timeline",
    ],
    color: "oklch(0.65 0.32 330)",
    beamDuration: 5.2,
  },
  {
    icon: MessageSquare,
    label: "OpenClaw Assistant",
    descriptor: "AI concierge. Not a loose cannon.",
    detail: [
      "Lead qualification + status updates",
      "Document collection guidance",
      "Appointment scheduling",
      "Never quotes rates or APRs",
      "All convos logged to CRM",
    ],
    color: "oklch(0.78 0.20 195)",
    beamDuration: 4.1,
  },
  {
    icon: Brain,
    label: "Memory Stack",
    descriptor: "Context that persists across sessions.",
    detail: [
      "Mem0 + FalkorDB graph backend",
      "Qdrant vector search",
      "OpenMemory MCP + Mempalace",
      "Letta long-running agent tasks",
      "All memory routed through Nexus",
    ],
    color: "oklch(0.67 0.26 305)",
    beamDuration: 6,
  },
  {
    icon: Shield,
    label: "Compliance Core",
    descriptor: "TCPA. CAN-SPAM. DNC. Built in.",
    detail: [
      "Consent check before every touch",
      "Global STOP suppression",
      "Quiet hours (recipient timezone)",
      "Hash-chained audit log",
      "Guardrail content filter",
    ],
    color: "oklch(0.82 0.22 145)",
    beamDuration: 4.8,
  },
];

/* ─────────────────────────────────────────────────────
   Feature Card
───────────────────────────────────────────────────── */
function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
}) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 90, damping: 18 }}
    >
      <BorderBeamCard beamDuration={feature.beamDuration} className="h-full p-6">
        {/* Icon */}
        <div
          className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded"
          style={{
            background: `${feature.color.replace(")", " / 0.12)")}`,
            border: `1px solid ${feature.color.replace(")", " / 0.30)")}`,
          }}
        >
          <Icon className="h-5 w-5" style={{ color: feature.color }} />
        </div>

        {/* Label */}
        <h3
          className="font-[Michroma] text-base tracking-wide text-[oklch(0.92_0.02_270)]"
        >
          {feature.label}
        </h3>

        {/* Descriptor */}
        <p
          className="mt-1 font-[Electrolize] text-sm"
          style={{ color: feature.color }}
        >
          {feature.descriptor}
        </p>

        {/* Divider */}
        <div
          className="my-4 h-px"
          style={{ background: `${feature.color.replace(")", " / 0.15)")}` }}
        />

        {/* Detail list */}
        <ul className="flex flex-col gap-1.5">
          {feature.detail.map((d, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full"
                style={{ background: feature.color }}
              />
              <span className="font-mono text-[11px] leading-snug text-[oklch(0.52_0.03_270)]">
                {d}
              </span>
            </li>
          ))}
        </ul>
      </BorderBeamCard>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────── */
export function FeatureGrid() {
  return (
    <section className="relative py-28" id="features">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[oklch(0.52_0.30_270)]"
          >
            Core Capabilities
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring", stiffness: 90, damping: 18 }}
            className="font-[Michroma] text-4xl leading-tight text-[oklch(0.96_0.01_270)] lg:text-5xl"
          >
            Everything a broker needs.{" "}
            <span
              style={{
                color: "transparent",
                WebkitTextStroke: "1px oklch(0.78 0.20 195)",
                textShadow: "0 0 28px oklch(0.78 0.20 195 / 0.3)",
              }}
            >
              Nothing they don't.
            </span>
          </motion.h2>
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
