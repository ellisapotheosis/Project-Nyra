"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress({ className = "" }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 50,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className={`fixed left-0 right-0 top-0 z-[200] h-[2px] origin-left ${className}`}
      style={{
        scaleX,
        background: "linear-gradient(90deg,#5038FF,#00CCB2 50%,#F20D7A)",
      }}
    />
  );
}
