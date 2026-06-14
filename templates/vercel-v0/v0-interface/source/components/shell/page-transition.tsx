"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    filter: "blur(10px)",
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    filter: "blur(10px)",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
