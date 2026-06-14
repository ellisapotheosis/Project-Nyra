"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?><~";

interface EncryptedTextProps {
  text: string;
  duration?: number;
  trigger?: "mount" | "hover" | "inView";
  className?: string;
}

export function EncryptedText({
  text,
  duration = 750,
  trigger = "inView",
  className,
}: EncryptedTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(containerRef, { once: true });
  const animating = useRef(false);

  const [displayed, setDisplayed] = useState(
    trigger === "mount"
      ? text.replace(
          /\S/g,
          () => CHARSET[Math.floor(Math.random() * CHARSET.length)]
        )
      : text
  );

  const scramble = useCallback(() => {
    if (animating.current) return;
    animating.current = true;
    const chars = text.split("");
    const startTime = performance.now();

    function frame(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const revealCount = Math.floor(progress * chars.length);
      setDisplayed(
        chars
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (i < revealCount) return ch;
            return CHARSET[Math.floor(Math.random() * CHARSET.length)];
          })
          .join("")
      );
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setDisplayed(text);
        animating.current = false;
      }
    }
    requestAnimationFrame(frame);
  }, [text, duration]);

  useEffect(() => {
    if (trigger === "mount") scramble();
  }, [trigger, scramble]);

  useEffect(() => {
    if (trigger === "inView" && inView) scramble();
  }, [trigger, inView, scramble]);

  return (
    <span
      ref={containerRef}
      className={cn("font-mono", className)}
      onMouseEnter={trigger === "hover" ? scramble : undefined}
      aria-label={text}
    >
      {displayed}
    </span>
  );
}
