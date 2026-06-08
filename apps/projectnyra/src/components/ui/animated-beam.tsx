// apps/projectnyra/src/components/ui/animated-beam.tsx
"use client";

import { RefObject, useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedBeamProps {
  containerRef: RefObject<HTMLDivElement | null>;
  fromRef: RefObject<HTMLDivElement | null>;
  toRef: RefObject<HTMLDivElement | null>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  className?: string;
}

function getCenter(
  containerRef: RefObject<HTMLDivElement | null>,
  elRef: RefObject<HTMLDivElement | null>
) {
  const c = containerRef.current?.getBoundingClientRect();
  const e = elRef.current?.getBoundingClientRect();
  if (!c || !e) return { x: 0, y: 0 };
  return { x: e.left - c.left + e.width / 2, y: e.top - c.top + e.height / 2 };
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  pathColor = "rgba(255,255,255,0.07)",
  pathWidth = 2,
  gradientStartColor = "oklch(0.5038 0.2937 285.3753)",
  gradientStopColor = "oklch(0.8871 0.1828 166.5465)",
  delay = 0,
  duration = 3,
  className,
}: AnimatedBeamProps) {
  const uid = useId();
  const pathRef = useRef<SVGPathElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [pathD, setPathD] = useState("");
  const [pathLen, setPathLen] = useState(200);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setDims({ w: r.width, h: r.height });
      const from = getCenter(containerRef, fromRef);
      const to = getCenter(containerRef, toRef);
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2 - curvature;
      setPathD(`M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`);
    };
    update();
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [containerRef, fromRef, toRef, curvature]);

  useEffect(() => {
    if (pathRef.current && pathD) {
      setPathLen(pathRef.current.getTotalLength());
    }
  }, [pathD]);

  const beamLen = pathLen * 0.2;
  const gapLen = pathLen * 0.8;

  return (
    <svg
      className={cn("pointer-events-none absolute inset-0", className)}
      width={dims.w}
      height={dims.h}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`beam-grad-${uid}`} gradientUnits="userSpaceOnUse">
          <stop
            offset="0%"
            stopColor={reverse ? gradientStopColor : gradientStartColor}
            stopOpacity={0}
          />
          <stop
            offset="40%"
            stopColor={reverse ? gradientStopColor : gradientStartColor}
          />
          <stop
            offset="60%"
            stopColor={reverse ? gradientStartColor : gradientStopColor}
          />
          <stop
            offset="100%"
            stopColor={reverse ? gradientStartColor : gradientStopColor}
            stopOpacity={0}
          />
        </linearGradient>
      </defs>
      {pathD && (
        <path
          d={pathD}
          fill="none"
          stroke={pathColor}
          strokeWidth={pathWidth}
          strokeLinecap="round"
        />
      )}
      {pathD && pathLen > 0 && (
        <motion.path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke={`url(#beam-grad-${uid})`}
          strokeWidth={pathWidth * 1.6}
          strokeLinecap="round"
          strokeDasharray={`${beamLen} ${gapLen}`}
          initial={{ strokeDashoffset: reverse ? -pathLen : pathLen }}
          animate={{ strokeDashoffset: reverse ? pathLen : -pathLen }}
          transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
        />
      )}
    </svg>
  );
}
