"use client";

import React, { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface MovingBorderProps {
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  as?: any;
  [key: string]: unknown;
}

export function MovingBorder({
  children,
  duration = 2800,
  rx = "2.25rem",
  ry = "2.25rem",
  className,
  containerClassName,
  borderClassName,
  as: Component = "div",
  ...rest
}: MovingBorderProps) {
  const pathRef = useRef<SVGRectElement>(null);
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const len = pathRef.current?.getTotalLength();
    if (!len) return;
    progress.set((time * (len / duration)) % len);
  });

  const x = useTransform(
    progress,
    (v) => pathRef.current?.getPointAtLength(v).x ?? 0
  );
  const y = useTransform(
    progress,
    (v) => pathRef.current?.getPointAtLength(v).y ?? 0
  );
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <Component
      className={cn("relative overflow-hidden p-px", containerClassName)}
      {...rest}
    >
      {/* SVG path traces the border shape */}
      <div className="pointer-events-none absolute inset-0">
        <svg
          className="absolute h-full w-full"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            ref={pathRef}
            fill="none"
            width="100%"
            height="100%"
            rx={rx}
            ry={ry}
          />
        </svg>
        <motion.div
          style={{ position: "absolute", top: 0, left: 0, transform }}
        >
          <div
            className={cn(
              "h-20 w-20 opacity-90 blur-[8px]",
              "bg-[radial-gradient(circle,#00CCB2_0%,#5038FF_40%,#F20D7A_70%,transparent_100%)]",
              borderClassName
            )}
          />
        </motion.div>
      </div>

      {/* actual content sits on top */}
      <div
        className={cn("relative h-full w-full", className)}
        style={{ borderRadius: `calc(${rx} - 1px) / calc(${ry} - 1px)` }}
      >
        {children}
      </div>
    </Component>
  );
}
