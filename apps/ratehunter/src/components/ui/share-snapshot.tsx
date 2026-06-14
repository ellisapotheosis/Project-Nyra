"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Share2 } from "lucide-react";

interface ShareSnapshotProps {
  loanAmount?: number;
  rateType?: string;
  term?: number;
  rate?: number;
}

export function ShareSnapshot({
  loanAmount = 400000,
  rateType = "fixed",
  term = 30,
  rate = 6.875,
}: ShareSnapshotProps) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const params = new URLSearchParams({
      amount: String(loanAmount),
      type: rateType,
      term: String(term),
      rate: String(rate),
    });

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  return (
    <motion.button
      onClick={handleShare}
      whileTap={{ scale: 0.95 }}
      disabled={copied}
      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:cursor-default"
      aria-label="Copy shareable link to clipboard"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
            style={{ color: "oklch(0.8871 0.1828 166.5465)" }}
          >
            <Check size={15} />
            Copied!
          </motion.span>
        ) : (
          <motion.span
            key="share"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Share2 size={15} />
            Share Scenario
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
