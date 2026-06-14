"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  MessageSquare,
  Phone,
  Plus,
  UserPlus,
  X,
} from "lucide-react";

const ACTIONS = [
  { icon: UserPlus, label: "Add Lead", color: "oklch(0.8871 0.1828 166.5465)" },
  { icon: Phone, label: "Log Call", color: "oklch(0.5038 0.2937 285.3753)" },
  {
    icon: MessageSquare,
    label: "Send SMS",
    color: "oklch(0.5038 0.2937 285.3753)",
  },
  { icon: FileText, label: "New Quote", color: "oklch(0.667 0.295 322.15)" },
  { icon: Plus, label: "New App", color: "oklch(0.667 0.295 322.15)" },
];

const RADIUS = 88;

function getArcPosition(index: number, total: number) {
  // Fan from 200deg to 340deg (left arc, above the FAB)
  const startAngle = 200;
  const endAngle = 340;
  const angle = startAngle + (index / (total - 1)) * (endAngle - startAngle);
  const rad = (angle * Math.PI) / 180;
  return {
    x: Math.cos(rad) * RADIUS,
    y: Math.sin(rad) * RADIUS,
  };
}

export function SpeedDialFAB() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open &&
          ACTIONS.map((action, i) => {
            const { x, y } = getArcPosition(i, ACTIONS.length);
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                animate={{ x, y: -y, opacity: 1, scale: 1 }}
                exit={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 28,
                  delay: i * 0.04,
                }}
                onClick={() => setOpen(false)}
                title={action.label}
                style={{ borderColor: action.color }}
                className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center rounded-full border-2 bg-[oklch(0.12_0.02_285)] shadow-xl hover:brightness-125 transition-[filter]"
                aria-label={action.label}
              >
                <Icon size={18} style={{ color: action.color }} />
              </motion.button>
            );
          })}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl"
        style={{ background: "oklch(0.5038 0.2937 285.3753)" }}
        aria-label={open ? "Close actions" : "Open actions"}
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <Plus size={22} className="text-white" />
        )}
      </motion.button>

      <AnimatePresence>
        {open &&
          ACTIONS.map((action, i) => {
            const { x, y } = getArcPosition(i, ACTIONS.length);
            return (
              <motion.span
                key={`label-${action.label}`}
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, x: x - 4, y: -y + 38 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="absolute bottom-0 right-0 pointer-events-none whitespace-nowrap text-[10px] font-semibold text-white/70"
              >
                {action.label}
              </motion.span>
            );
          })}
      </AnimatePresence>
    </div>
  );
}
