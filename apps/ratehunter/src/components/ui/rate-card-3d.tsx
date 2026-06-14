// apps/ratehunter/src/components/ui/rate-card-3d.tsx
"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LenderRate } from "@/hooks/useRates";

interface RateCard3DProps {
  lender: LenderRate;
  isBest?: boolean;
  className?: string;
}

export function RateCard3D({ lender, isBest, className }: RateCard3DProps) {
  const [flipped, setFlipped] = useState(false);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (flipped) return;
    const r = cardRef.current!.getBoundingClientRect();
    setRotY(((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 9);
    setRotX(-(((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 9));
  }

  function onMouseLeave() {
    if (!flipped) {
      setRotX(0);
      setRotY(0);
    }
  }

  return (
    <div
      ref={cardRef}
      className={cn("cursor-pointer select-none", className)}
      style={{ perspective: "900px" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={() => {
        setFlipped((f) => !f);
        setRotX(0);
        setRotY(0);
      }}
      role="button"
      aria-label={`${lender.name} rate card — click to flip`}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
    >
      <motion.div
        animate={{ rotateX: flipped ? 180 : rotX, rotateY: flipped ? 0 : rotY }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        style={{
          transformStyle: "preserve-3d",
          position: "relative",
          width: "100%",
          minHeight: 120,
        }}
      >
        {/* Front */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          className={cn(
            "absolute inset-0 rounded-xl border p-4 bg-card flex flex-col justify-between",
            isBest
              ? "border-[oklch(0.8871_0.1828_166.5465)] shadow-[0_0_22px_rgba(0,204,178,0.22)]"
              : "border-border"
          )}
        >
          <div>
            {isBest && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-[oklch(0.8871_0.1828_166.5465)] mb-1 block">
                Best Rate
              </span>
            )}
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {lender.name}
            </div>
            <div
              className={cn(
                "text-3xl font-black mt-1",
                isBest
                  ? "text-[oklch(0.8871_0.1828_166.5465)]"
                  : "text-foreground"
              )}
            >
              {lender.rate.toFixed(3)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              ${lender.monthly.toLocaleString()}/mo
            </div>
          </div>
          <div className="text-[9px] text-muted-foreground opacity-50 mt-2">
            Click for full breakdown →
          </div>
        </div>

        {/* Back */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          className="absolute inset-0 rounded-xl border border-[oklch(0.5038_0.2937_285.3753)] p-4 bg-card shadow-[0_0_24px_rgba(80,56,255,0.2)] flex flex-col"
        >
          <div className="text-[9px] font-bold uppercase tracking-widest text-[oklch(0.5038_0.2937_285.3753)] mb-3">
            Full Breakdown
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {[
              ["Rate", `${lender.rate.toFixed(3)}%`],
              ["APR", `${lender.apr.toFixed(3)}%`],
              ["Monthly", `$${lender.monthly.toLocaleString()}`],
              ["Points", `${lender.points}`],
              ["Closing Costs", `$${lender.closingCosts.toLocaleString()}`],
              ["Loan Type", lender.loanType],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold">{val}</span>
              </div>
            ))}
          </div>
          <div className="text-[9px] text-muted-foreground opacity-50 mt-2">
            Click to flip back
          </div>
        </div>
      </motion.div>
    </div>
  );
}
