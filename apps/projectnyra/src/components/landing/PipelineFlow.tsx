"use client";

/**
 * PIPELINE FLOW — "The Machine"
 * Visual flowchart of the Nyra lead-to-close pipeline.
 * Each node is a CornerCutCard with an animated connector line.
 * The STOP gate is highlighted in red as a critical safety node.
 */

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Inbox, UserCheck, Megaphone, MessageSquare, FileText,
  OctagonX, CheckCircle2, Database, ArrowDown,
} from "lucide-react";

/* ─────────────────────────────────────────────────────
   Pipeline node data
───────────────────────────────────────────────────── */
type NodeVariant = "normal" | "gate" | "stop" | "success";

interface PipelineNode {
  icon: React.ElementType;
  label: string;
  sub: string;
  variant: NodeVariant;
}

const NODES: PipelineNode[] = [
  {
    icon: Inbox,
    label: "Lead Arrives",
    sub: "Email · API · Webhook · Manual",
    variant: "normal",
  },
  {
    icon: UserCheck,
    label: "Normalize & Dedupe",
    sub: "CRM API validates, maps, writes to Twenty",
    variant: "normal",
  },
  {
    icon: Megaphone,
    label: "Campaign Assigned",
    sub: "Loan purpose → drip track → Day 0 fires",
    variant: "normal",
  },
  {
    icon: Database,
    label: "Compliance Gate",
    sub: "Consent · DNC · Quiet hours · Guardrails",
    variant: "gate",
  },
  {
    icon: MessageSquare,
    label: "Touch Executed",
    sub: "SMS / Email / Voicemail / Call task",
    variant: "normal",
  },
  {
    icon: OctagonX,
    label: "STOP Detected",
    sub: "Any reply or STOP → immediate kill switch",
    variant: "stop",
  },
  {
    icon: FileText,
    label: "Quote Requested",
    sub: "Engine generates 3-option PDF · Broker approval",
    variant: "normal",
  },
  {
    icon: CheckCircle2,
    label: "Loan Funded",
    sub: "Full timeline logged · CRM updated · Campaign archived",
    variant: "success",
  },
];

/* ─────────────────────────────────────────────────────
   Color scheme by variant
───────────────────────────────────────────────────── */
const variantStyles: Record<NodeVariant, { border: string; bg: string; icon: string; text: string }> = {
  normal: {
    border: "oklch(0.22 0.04 270 / 0.5)",
    bg:     "oklch(0.09 0.02 270 / 0.7)",
    icon:   "oklch(0.78 0.20 195)",
    text:   "oklch(0.72 0.04 270)",
  },
  gate: {
    border: "oklch(0.70 0.22 60 / 0.5)",
    bg:     "oklch(0.09 0.04 60 / 0.5)",
    icon:   "oklch(0.78 0.22 60)",
    text:   "oklch(0.68 0.10 60)",
  },
  stop: {
    border: "oklch(0.60 0.28 25 / 0.6)",
    bg:     "oklch(0.08 0.04 25 / 0.6)",
    icon:   "oklch(0.70 0.26 25)",
    text:   "oklch(0.62 0.14 25)",
  },
  success: {
    border: "oklch(0.82 0.22 145 / 0.5)",
    bg:     "oklch(0.08 0.04 145 / 0.5)",
    icon:   "oklch(0.82 0.22 145)",
    text:   "oklch(0.70 0.12 145)",
  },
};

/* ─────────────────────────────────────────────────────
   Single pipeline node
───────────────────────────────────────────────────── */
function PNode({ node, index }: { node: PipelineNode; index: number }) {
  const Icon = node.icon;
  const s = variantStyles[node.variant];
  const isStop = node.variant === "stop";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 110, damping: 18 }}
      className="relative flex items-center gap-4 rounded border px-4 py-3.5 backdrop-blur-sm"
      style={{
        borderColor: s.border,
        background: s.bg,
        boxShadow: isStop
          ? `0 0 20px oklch(0.60 0.28 25 / 0.20), 0 0 50px oklch(0.60 0.28 25 / 0.08)`
          : node.variant === "success"
          ? `0 0 18px oklch(0.82 0.22 145 / 0.15)`
          : "none",
        clipPath: "polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)",
      }}
    >
      {/* Step number */}
      <span
        className="absolute -left-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[9px]"
        style={{
          borderColor: s.border,
          background: "oklch(0.07 0.02 270)",
          color: s.icon,
        }}
      >
        {index + 1}
      </span>

      {/* Icon */}
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded"
        style={{
          background: `${s.icon.replace(")", " / 0.12)")}`,
          border: `1px solid ${s.icon.replace(")", " / 0.30)")}`,
        }}
      >
        <Icon className="h-4 w-4" style={{ color: s.icon }} />
      </div>

      {/* Text */}
      <div>
        <p
          className="font-[Michroma] text-[13px] tracking-wide"
          style={{ color: node.variant === "normal" ? "oklch(0.88 0.03 270)" : s.icon }}
        >
          {node.label}
        </p>
        <p className="mt-0.5 font-mono text-[10px]" style={{ color: s.text }}>
          {node.sub}
        </p>
      </div>

      {/* STOP badge */}
      {isStop && (
        <span
          className="ml-auto flex-shrink-0 rounded border border-[oklch(0.60_0.28_25/0.5)] bg-[oklch(0.60_0.28_25/0.12)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[oklch(0.70_0.26_25)]"
          style={{ animation: "badge-blink 1.6s ease-in-out infinite" }}
        >
          All Channels Kill
        </span>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   Connector arrow between nodes
───────────────────────────────────────────────────── */
function Connector({ index }: { index: number }) {
  // At the STOP node (index 5 is the stop, connector before it is at 4)
  const isBeforeStop = index === 4;

  return (
    <motion.div
      initial={{ scaleY: 0, opacity: 0 }}
      whileInView={{ scaleY: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 + 0.04 }}
      className="flex items-center justify-center py-1"
      style={{ originY: 0 }}
    >
      <ArrowDown
        className="h-4 w-4"
        style={{
          color: isBeforeStop
            ? "oklch(0.60 0.28 25 / 0.6)"
            : "oklch(0.35 0.05 270 / 0.6)",
        }}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────── */
export function PipelineFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <section className="relative py-28 overflow-hidden" id="pipeline">
      {/* Vertical accent line */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
        style={{
          background: "linear-gradient(to bottom, transparent, oklch(0.52 0.30 270 / 0.12) 20%, oklch(0.52 0.30 270 / 0.12) 80%, transparent)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-2xl px-6" ref={ref}>
        {/* Header */}
        <div className="mb-14 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[oklch(0.52_0.30_270)]"
          >
            End-to-End Workflow
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring", stiffness: 90, damping: 18 }}
            className="font-[Michroma] text-4xl leading-tight text-[oklch(0.96_0.01_270)]"
          >
            The Machine
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-md font-[Electrolize] text-sm text-[oklch(0.50_0.04_270)]"
          >
            Every node in the pipeline has a compliance check before it executes.
            No silent sends. No hallucinated rates. Every action leaves an audit record.
          </motion.p>
        </div>

        {/* Pipeline nodes */}
        <div className="flex flex-col pl-4">
          {NODES.map((node, i) => (
            <div key={i}>
              <PNode node={node} index={i} />
              {i < NODES.length - 1 && <Connector index={i} />}
            </div>
          ))}
        </div>

        {/* Bottom legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          {[
            { color: "oklch(0.78 0.20 195)", label: "Normal step" },
            { color: "oklch(0.78 0.22 60)",  label: "Gate check" },
            { color: "oklch(0.70 0.26 25)",  label: "STOP / kill" },
            { color: "oklch(0.82 0.22 145)", label: "Success" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: item.color }}
              />
              <span className="font-mono text-[10px] text-[oklch(0.42_0.03_270)]">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
