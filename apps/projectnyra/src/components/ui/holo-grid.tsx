"use client";

import { motion } from "framer-motion";

export function HoloGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.6) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Diagonal accent lines */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            rgba(99,102,241,0.8) 0px,
            rgba(99,102,241,0.8) 1px,
            transparent 1px,
            transparent 48px
          )`,
        }}
      />
      {/* Animated scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"
        initial={{ top: "0%" }}
        animate={{ top: "100%" }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
      />
      {/* Radial glow center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(99,102,241,0.06),transparent)]" />
    </div>
  );
}
