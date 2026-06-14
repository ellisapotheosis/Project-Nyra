// apps/ratehunter/src/components/ui/ink-reveal.tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface InkRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function InkReveal({
  children,
  delay = 0,
  duration = 0.75,
  className,
}: InkRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {children}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, oklch(0.5038 0.2937 285.3753), oklch(0.667 0.295 322.15))",
          transformOrigin: "left center",
          zIndex: 10,
        }}
        initial={{ scaleX: 1 }}
        animate={inView ? { scaleX: 0 } : { scaleX: 1 }}
        transition={{
          delay,
          duration,
          ease: [0.76, 0, 0.24, 1],
        }}
      />
    </div>
  );
}
