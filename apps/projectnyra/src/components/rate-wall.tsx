// apps/projectnyra/src/components/rate-wall.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RateTile {
  id: string;
  lender: string;
  rate: number;
  loanType: string;
}

const INITIAL_RATES: RateTile[] = [
  { id: "rocket", lender: "Rocket", rate: 6.875, loanType: "Conv 30yr" },
  { id: "wells", lender: "Wells", rate: 6.75, loanType: "Conv 30yr" },
  { id: "chase", lender: "Chase", rate: 6.625, loanType: "Conv 30yr" },
  { id: "better", lender: "Better", rate: 6.5, loanType: "FHA" },
  { id: "uwm", lender: "UWM", rate: 6.375, loanType: "VA" },
  { id: "loandepot", lender: "loanDepot", rate: 7.0, loanType: "Conv 30yr" },
  { id: "pennymac", lender: "PennyMac", rate: 6.875, loanType: "Conv 30yr" },
  { id: "freedom", lender: "Freedom", rate: 6.75, loanType: "USDA" },
  { id: "flagstar", lender: "Flagstar", rate: 6.625, loanType: "Conv 15yr" },
  { id: "newrez", lender: "NewRez", rate: 6.875, loanType: "Jumbo" },
  { id: "caliber", lender: "Caliber", rate: 7.125, loanType: "Conv 30yr" },
  { id: "amerisave", lender: "AmeriSave", rate: 6.75, loanType: "FHA" },
];

interface RateWallProps {
  className?: string;
}

export function RateWall({ className }: RateWallProps) {
  const [tiles, setTiles] = useState<RateTile[]>(INITIAL_RATES);

  useEffect(() => {
    const id = setInterval(() => {
      setTiles((prev) =>
        prev.map((t) => ({
          ...t,
          rate: parseFloat(
            Math.max(
              5.5,
              Math.min(8.5, t.rate + (Math.random() - 0.5) * 0.018)
            ).toFixed(3)
          ),
        }))
      );
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const minRate = Math.min(...tiles.map((t) => t.rate));

  return (
    <div
      className={cn("grid gap-2", className)}
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))" }}
      aria-label="Live lender rate wall"
      role="list"
    >
      {tiles.map((tile) => {
        const isBest = tile.rate <= minRate + 0.125;
        return (
          <motion.div
            key={tile.id}
            role="listitem"
            animate={{
              borderColor: isBest
                ? "rgba(0,204,178,0.45)"
                : "rgba(255,255,255,0.07)",
              boxShadow: isBest ? "0 0 18px rgba(0,204,178,0.13)" : "none",
              background: isBest
                ? "rgba(0,204,178,0.055)"
                : "rgba(255,255,255,0.022)",
            }}
            transition={{ duration: 0.7 }}
            style={{
              borderRadius: 10,
              border: "1px solid",
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 4,
              }}
            >
              {tile.lender}
            </div>
            <motion.div
              key={tile.rate}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: 16,
                fontWeight: 800,
                fontVariantNumeric: "tabular-nums",
                color: isBest ? "#00ccb2" : "#e2e8f0",
                lineHeight: 1,
              }}
            >
              {tile.rate.toFixed(3)}%
            </motion.div>
            <div style={{ fontSize: 9, color: "#475569", marginTop: 3 }}>
              {tile.loanType}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
