// apps/ratehunter/src/components/RateLockWidget.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface RateLockWidgetProps {
  rate?: number;
  lender?: string;
  onLock?: () => void;
}

function formatTime(seconds: number) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function RateLockWidget({
  rate = 6.375,
  lender = "UWM",
  onLock,
}: RateLockWidgetProps) {
  const [seconds, setSeconds] = useState(23 * 3600 + 47 * 60 + 12);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  function handleLock() {
    if (locked) return;
    setLocked(true);
    confetti({
      particleCount: 130,
      spread: 85,
      origin: { y: 0.65 },
      colors: ["#5038ff", "#00ccb2", "#f20d7a", "#8f14ed", "#ffffff"],
    });
    onLock?.();
  }

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2.2, type: "spring", stiffness: 200, damping: 22 }}
    >
      {/* Gradient border wrapper */}
      <div
        style={{
          background: locked
            ? "linear-gradient(135deg, #00ccb2, #5038ff)"
            : "linear-gradient(135deg, rgba(80,56,255,0.5), rgba(242,13,122,0.3))",
          padding: "1px",
          borderRadius: "18px",
          boxShadow: locked
            ? "0 0 30px rgba(0,204,178,0.35)"
            : "0 8px 32px rgba(0,0,0,0.4)",
          transition: "background 0.5s, box-shadow 0.5s",
        }}
      >
        <div
          style={{
            background: "rgba(4,4,14,0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "17px",
            padding: "18px 22px",
            minWidth: "230px",
          }}
        >
          <AnimatePresence mode="wait">
            {!locked ? (
              <motion.div
                key="unlocked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 4,
                  }}
                >
                  {lender} · {rate.toFixed(3)}% — rate valid for
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: seconds < 3600 ? "#f20d7a" : "#f59e0b",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "0.04em",
                    marginBottom: 14,
                  }}
                >
                  {formatTime(seconds)}
                </div>
                <button
                  onClick={handleLock}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: "11px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, oklch(0.5038 0.2937 285.3753), oklch(0.8871 0.1828 166.5465))",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                  }}
                >
                  🔒 Lock My Rate
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="locked"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "4px 0" }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: "#00ccb2" }}
                >
                  Rate Locked!
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    marginTop: 5,
                    lineHeight: 1.45,
                  }}
                >
                  A licensed broker will
                  <br />
                  contact you shortly.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
