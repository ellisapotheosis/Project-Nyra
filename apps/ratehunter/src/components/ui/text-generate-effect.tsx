"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  duration?: number;
  delay?: number;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  visible: (duration: number) => ({
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration },
  }),
};

export function TextGenerateEffect({
  words,
  className,
  duration = 0.5,
  delay = 0,
}: TextGenerateEffectProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true });

  const wordList = words.split(" ");

  return (
    <motion.p
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={{ transitionDelay: `${delay}s` }}
      className={cn("", className)}
    >
      {wordList.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          custom={duration}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}
