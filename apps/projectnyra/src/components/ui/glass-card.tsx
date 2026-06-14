"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  glowColor?: string;
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      glow = false,
      glowColor = "oklch(0.5038 0.2937 285.3753)",
      hover = true,
      children,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "relative rounded-2xl border border-white/10",
          "bg-white/[0.04] backdrop-blur-xl",
          "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]",
          className
        )}
        style={{
          ...(glow && {
            boxShadow: `0 4px 24px -4px rgba(0,0,0,0.4), 0 0 32px -8px ${glowColor}`,
          }),
          ...style,
        }}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";
