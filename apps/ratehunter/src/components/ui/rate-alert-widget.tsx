"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCircle2 } from "lucide-react";

type FormState = "idle" | "submitting" | "success";

export function RateAlertWidget() {
  const [email, setEmail] = useState("");
  const [threshold, setThreshold] = useState("6.5");
  const [formState, setFormState] = useState<FormState>("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !threshold) return;
    setFormState("submitting");
    setTimeout(() => setFormState("success"), 1200);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={16} style={{ color: "oklch(0.667 0.295 322.15)" }} />
        <h3 className="text-sm font-semibold text-white/80">Rate Alert</h3>
        <span className="ml-auto text-[10px] text-white/30">
          Get notified when rates drop
        </span>
      </div>

      <AnimatePresence mode="wait">
        {formState === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
                delay: 0.1,
              }}
            >
              <CheckCircle2
                size={40}
                style={{ color: "oklch(0.8871 0.1828 166.5465)" }}
              />
            </motion.div>
            <p className="text-sm font-medium text-white/80">Alert set!</p>
            <p className="text-xs text-white/40 text-center">
              We&apos;ll email you when 30yr fixed drops below {threshold}%
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <div>
              <label className="block text-[11px] font-medium text-white/50 mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-[oklch(0.5038_0.2937_285.3753)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/50 mb-1">
                Alert me when 30yr fixed falls below
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  min={3}
                  max={10}
                  step={0.125}
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[oklch(0.5038_0.2937_285.3753)] transition-colors"
                />
                <span className="text-sm text-white/50">% APR</span>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={formState === "submitting"}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ background: "oklch(0.5038 0.2937 285.3753)" }}
            >
              {formState === "submitting" ? "Setting alert…" : "Set Rate Alert"}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
