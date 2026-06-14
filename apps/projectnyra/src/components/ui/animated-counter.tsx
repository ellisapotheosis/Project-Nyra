"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.5,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(
    () =>
      spring.on("change", (v) => {
        if (ref.current)
          ref.current.textContent =
            prefix + Math.round(v).toLocaleString() + suffix;
      }),
    [spring, prefix, suffix]
  );

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
