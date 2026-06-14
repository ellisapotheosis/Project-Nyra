"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";

type StageStatus = "completed" | "active" | "upcoming";

interface Stage {
  id: string;
  label: string;
  date?: string;
  description: string;
  status: StageStatus;
}

const STAGES: Stage[] = [
  {
    id: "pre-approval",
    label: "Pre-Approval",
    date: "May 15",
    description:
      "Credit check, income verification, and initial loan estimate issued.",
    status: "completed",
  },
  {
    id: "application",
    label: "Application",
    date: "May 18",
    description:
      "Full 1003 application submitted. Documentation package requested.",
    status: "completed",
  },
  {
    id: "processing",
    label: "Processing",
    date: "May 22",
    description: "Loan processor reviewing file. Appraisal ordered.",
    status: "completed",
  },
  {
    id: "underwriting",
    label: "Underwriting",
    date: "Jun 3",
    description:
      "File submitted to underwriter. Decision expected within 3-5 business days.",
    status: "active",
  },
  {
    id: "clear-to-close",
    label: "Clear to Close",
    description:
      "Final approval, closing disclosure issued, and closing scheduled.",
    status: "upcoming",
  },
  {
    id: "closing",
    label: "Closing",
    description: "Loan documents signed, funds disbursed, keys handed over.",
    status: "upcoming",
  },
];

const statusColors: Record<StageStatus, string> = {
  completed: "oklch(0.8871 0.1828 166.5465)",
  active: "oklch(0.5038 0.2937 285.3753)",
  upcoming: "rgba(255,255,255,0.2)",
};

function StageIcon({ status }: { status: StageStatus }) {
  if (status === "completed")
    return <CheckCircle2 size={20} style={{ color: statusColors.completed }} />;
  if (status === "active")
    return <Clock size={20} style={{ color: statusColors.active }} />;
  return <Circle size={20} style={{ color: statusColors.upcoming }} />;
}

function TimelineStage({ stage, index }: { stage: Stage; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="relative flex gap-4 pb-8 last:pb-0"
    >
      {/* Connector line */}
      <div className="relative flex flex-col items-center">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[oklch(0.12_0.02_285)]"
          style={
            stage.status !== "upcoming"
              ? { boxShadow: `0 0 12px -2px ${statusColors[stage.status]}` }
              : undefined
          }
        >
          <StageIcon status={stage.status} />
        </div>
        {/* Vertical line below icon (not on last item) */}
        <div className="mt-1 w-px flex-1 bg-white/10" />
      </div>

      {/* Content */}
      <div className="pt-1.5">
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className="text-sm font-semibold"
            style={{
              color:
                stage.status === "upcoming"
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(255,255,255,0.9)",
            }}
          >
            {stage.label}
          </span>
          {stage.date && (
            <span className="text-[11px] text-white/30">{stage.date}</span>
          )}
          {stage.status === "active" && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{
                background: "oklch(0.5038 0.2937 285.3753 / 0.15)",
                color: "oklch(0.5038 0.2937 285.3753)",
              }}
            >
              In Progress
            </motion.span>
          )}
        </div>
        <p className="text-xs text-white/40 leading-relaxed max-w-sm">
          {stage.description}
        </p>
      </div>
    </motion.div>
  );
}

export function LoanTimeline() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-sm font-semibold text-white/80 mb-6">
        Loan Timeline
      </h3>
      <div>
        {STAGES.map((stage, i) => (
          <TimelineStage key={stage.id} stage={stage} index={i} />
        ))}
      </div>
    </div>
  );
}
