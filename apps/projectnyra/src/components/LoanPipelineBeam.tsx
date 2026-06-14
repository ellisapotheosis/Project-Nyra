// apps/projectnyra/src/components/LoanPipelineBeam.tsx
"use client";

import { useRef } from "react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: "preapproval", label: "Pre-Approval", icon: "🏦" },
  { id: "processing", label: "Processing", icon: "📋" },
  { id: "underwriting", label: "Underwriting", icon: "🔍" },
  { id: "approval", label: "Approval", icon: "✅" },
  { id: "closing", label: "Closing", icon: "🔑" },
] as const;

interface LoanPipelineBeamProps {
  currentStage?: number;
  borrowerName?: string;
  loanAmount?: string;
  className?: string;
}

export function LoanPipelineBeam({
  currentStage = 2,
  borrowerName,
  loanAmount,
  className,
}: LoanPipelineBeamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ref0 = useRef<HTMLDivElement>(null);
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);
  const ref4 = useRef<HTMLDivElement>(null);
  const stageRefs = [ref0, ref1, ref2, ref3, ref4];

  return (
    <div className={cn("relative w-full", className)}>
      {(borrowerName || loanAmount) && (
        <div className="flex items-center gap-3 mb-3 text-sm">
          {borrowerName && (
            <span className="font-semibold">{borrowerName}</span>
          )}
          {loanAmount && (
            <span className="text-muted-foreground">{loanAmount}</span>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground uppercase tracking-wider">
            {STAGES[currentStage].label}
          </span>
        </div>
      )}
      <div
        ref={containerRef}
        className="relative flex items-center justify-between py-5 px-2"
        style={{ minHeight: 80 }}
      >
        {stageRefs.map((ref, i) => (
          <div
            key={STAGES[i].id}
            ref={ref}
            className="relative z-10 flex flex-col items-center gap-1.5"
          >
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-500",
                i < currentStage
                  ? "border-[oklch(0.8871_0.1828_166.5465)] bg-[oklch(0.8871_0.1828_166.5465)]/15 shadow-[0_0_10px_rgba(0,204,178,0.35)]"
                  : i === currentStage
                    ? "border-[oklch(0.5038_0.2937_285.3753)] bg-[oklch(0.5038_0.2937_285.3753)]/15 shadow-[0_0_14px_rgba(80,56,255,0.45)] scale-110"
                    : "border-white/10 bg-white/[0.03]"
              )}
            >
              {STAGES[i].icon}
            </div>
            <span
              className={cn(
                "text-[9px] uppercase tracking-wider font-medium",
                i <= currentStage
                  ? "text-foreground"
                  : "text-muted-foreground/40"
              )}
            >
              {STAGES[i].label}
            </span>
          </div>
        ))}

        {stageRefs.slice(0, -1).map((fromRef, i) => (
          <AnimatedBeam
            key={i}
            containerRef={containerRef}
            fromRef={fromRef}
            toRef={stageRefs[i + 1]}
            duration={2.2 + i * 0.25}
            delay={i * 0.15}
            pathColor={
              i < currentStage
                ? "rgba(0,204,178,0.12)"
                : "rgba(255,255,255,0.04)"
            }
            gradientStartColor={
              i < currentStage
                ? "oklch(0.8871 0.1828 166.5465)"
                : "oklch(0.5038 0.2937 285.3753)"
            }
            gradientStopColor={
              i < currentStage
                ? "oklch(0.5038 0.2937 285.3753)"
                : "oklch(0.65 0.27 300)"
            }
            curvature={-20}
          />
        ))}
      </div>
    </div>
  );
}
