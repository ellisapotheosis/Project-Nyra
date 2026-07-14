"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useRef } from "react";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  yOffset?: number;
  inViewMargin?: string;
  blur?: string;
}

export function BlurFade({
  children,
  className,
  duration = 0.45,
  delay = 0,
  yOffset = 8,
  inViewMargin = "-60px",
  blur = "8px",
}: BlurFadeProps) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, {
    once: true,
    margin: inViewMargin as any,
  });

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ y: yOffset, opacity: 0, filter: `blur(${blur})` }}
        animate={
          inViewResult
            ? { y: 0, opacity: 1, filter: "blur(0px)" }
            : { y: yOffset, opacity: 0, filter: `blur(${blur})` }
        }
        transition={{
          delay: 0.05 + delay,
          duration,
          ease: [0.21, 1.02, 0.73, 0.99],
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
