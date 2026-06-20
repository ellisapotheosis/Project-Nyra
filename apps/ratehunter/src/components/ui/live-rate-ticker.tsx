"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RATES = [
  { label: "30Y Fixed", value: "6.875", trend: "down" as const },
  { label: "15Y Fixed", value: "6.250", trend: "down" as const },
  { label: "5/1 ARM", value: "6.125", trend: "up" as const },
  { label: "FHA 30Y", value: "6.500", trend: "down" as const },
  { label: "VA 30Y", value: "6.125", trend: "down" as const },
  { label: "Jumbo 30Y", value: "7.125", trend: "up" as const },
];

export function LiveRateTicker() {
  const [active, setActive] = useState(0);
  const [tick, setTick] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((i) => (i + 1) % RATES.length);
      setTick((t) => !t);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 overflow-hidden rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 backdrop-blur-sm">
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Live Rates</span>
      </span>
      <div className="h-3 w-px bg-white/10" />
      <div className="flex gap-4 overflow-hidden">
        {RATES.map((rate, i) => (
          <div
            key={rate.label}
            className={`flex items-center gap-1.5 transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-30"}`}
          >
            <span className="text-[11px] text-white/50">{rate.label}</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={rate.value + String(tick)}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[11px] font-bold text-white"
              >
                {rate.value}%
              </motion.span>
            </AnimatePresence>
            <span className={`text-[9px] ${rate.trend === "down" ? "text-emerald-400" : "text-red-400"}`}>
              {rate.trend === "down" ? "▼" : "▲"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
