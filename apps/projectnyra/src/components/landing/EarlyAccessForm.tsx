"use client";

/**
 * EARLY ACCESS FORM
 * Multi-field form for broker early access requests.
 * Uses NeonInput components, CornerCutCard wrapper,
 * and a glowing submit button.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { NeonInput, NeonSelect } from "@/components/neonblade/NeonInput";
import { SacredGeometryBg } from "./SacredGeometryBg";

/* ─────────────────────────────────────────────────────
   Form state
───────────────────────────────────────────────────── */
interface FormState {
  name: string;
  email: string;
  phone: string;
  brokerage: string;
  volume: string;
  primaryUse: string;
}

const VOLUME_OPTIONS = [
  { value: "", label: "Monthly loan volume..." },
  { value: "0-5", label: "0–5 loans/month" },
  { value: "5-15", label: "5–15 loans/month" },
  { value: "15-30", label: "15–30 loans/month" },
  { value: "30+", label: "30+ loans/month" },
];

const USE_OPTIONS = [
  { value: "", label: "Primary use case..." },
  { value: "lead-followup", label: "Lead follow-up automation" },
  { value: "campaign-drip", label: "Multi-channel drip campaigns" },
  { value: "quote-engine", label: "Quote generation & comparison" },
  { value: "crm-sync", label: "CRM + pipeline management" },
  { value: "all", label: "All of the above" },
];

/* ─────────────────────────────────────────────────────
   Success state
───────────────────────────────────────────────────── */
function SuccessState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="flex flex-col items-center gap-4 py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.15 }}
        className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[oklch(0.82_0.22_145/0.6)] bg-[oklch(0.10_0.04_145/0.4)]"
        style={{ boxShadow: "0 0 30px oklch(0.82 0.22 145 / 0.25)" }}
      >
        <CheckCircle2 className="h-8 w-8 text-[oklch(0.82_0.22_145)]" />
      </motion.div>

      <h3 className="font-[Michroma] text-2xl text-[oklch(0.96_0.01_270)]">
        You're on the list.
      </h3>
      <p className="max-w-sm font-[Electrolize] text-sm leading-relaxed text-[oklch(0.55_0.04_270)]">
        We'll reach out personally as soon as we're ready to onboard your brokerage. No automated drip — just a real conversation with the builder.
      </p>

      <div
        className="mt-2 flex items-center gap-2 rounded border border-[oklch(0.82_0.22_145/0.25)] bg-[oklch(0.10_0.04_145/0.2)] px-4 py-2"
      >
        <Lock className="h-3 w-3 text-[oklch(0.60_0.10_145)]" />
        <span className="font-mono text-[10px] text-[oklch(0.50_0.08_145)]">
          Your data is never sold or shared.
        </span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────── */
export function EarlyAccessForm() {
  const [form, setForm] = useState<FormState>({
    name: "", email: "", phone: "", brokerage: "", volume: "", primaryUse: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission delay — wire to actual API/Infisical-secured endpoint
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section
      className="relative overflow-hidden py-28"
      id="early-access"
      style={{
        background: "linear-gradient(180deg, oklch(0.07 0.02 270) 0%, oklch(0.055 0.025 270) 100%)",
      }}
    >
      {/* Sacred geometry */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <SacredGeometryBg
          opacity={0.035}
          color="oklch(0.65 0.32 330)"
          size={900}
          duration={180}
        />
      </div>

      {/* Radial bloom */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 700,
          height: 500,
          background: "radial-gradient(ellipse at center, oklch(0.52 0.30 270 / 0.10), oklch(0.65 0.32 330 / 0.05) 50%, transparent 75%)",
          filter: "blur(2px)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-2xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[oklch(0.65_0.32_330)]"
          >
            Private Beta
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring", stiffness: 90, damping: 18 }}
            className="font-[Michroma] text-4xl leading-tight text-[oklch(0.96_0.01_270)]"
          >
            Get early access.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-md font-[Electrolize] text-sm text-[oklch(0.52_0.04_270)]"
          >
            We're onboarding a small cohort of independent mortgage brokers. First-mover brokers help shape the product and lock preferred pricing.
          </motion.p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, type: "spring", stiffness: 80, damping: 18 }}
          className="overflow-hidden rounded-lg border border-[oklch(0.22_0.04_270/0.5)] bg-[oklch(0.08_0.025_270/0.8)] backdrop-blur-sm"
          style={{
            boxShadow: "0 0 40px oklch(0.52 0.30 270 / 0.12), 0 24px 60px oklch(0 0 0 / 0.4)",
            clipPath: "polygon(16px 0%, 100% 0%, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0% 100%, 0% 16px)",
          }}
        >
          {/* Top beam */}
          <div
            className="h-0.5 w-full"
            style={{
              background: "linear-gradient(to right, transparent, oklch(0.52 0.30 270), oklch(0.65 0.32 330) 60%, oklch(0.78 0.20 195), transparent)",
            }}
          />

          <div className="p-8">
            <AnimatePresence mode="wait">
              {submitted ? (
                <SuccessState key="success" />
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="flex flex-col gap-5"
                >
                  {/* Row 1 */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <NeonInput
                      label="Full Name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange("name")}
                      required
                      color="primary"
                    />
                    <NeonInput
                      label="Email Address"
                      type="email"
                      placeholder="you@brokerage.com"
                      value={form.email}
                      onChange={handleChange("email")}
                      required
                      color="accent"
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <NeonInput
                      label="Phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={form.phone}
                      onChange={handleChange("phone")}
                      color="primary"
                    />
                    <NeonInput
                      label="Brokerage / Company"
                      placeholder="West Capital Lending"
                      value={form.brokerage}
                      onChange={handleChange("brokerage")}
                      color="accent"
                    />
                  </div>

                  {/* Row 3 */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <NeonSelect
                      label="Monthly Loan Volume"
                      options={VOLUME_OPTIONS}
                      value={form.volume}
                      onChange={handleChange("volume")}
                      color="primary"
                    />
                    <NeonSelect
                      label="Primary Use Case"
                      options={USE_OPTIONS}
                      value={form.primaryUse}
                      onChange={handleChange("primaryUse")}
                      color="pink"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative mt-2 flex items-center justify-center gap-3 overflow-hidden rounded-sm py-4 font-[Michroma] text-sm uppercase tracking-[0.14em] text-white transition-all duration-300 disabled:opacity-70"
                    style={{
                      background: submitting
                        ? "oklch(0.35 0.10 270)"
                        : "linear-gradient(135deg, oklch(0.52 0.30 270), oklch(0.62 0.28 300))",
                      boxShadow: submitting
                        ? "none"
                        : "0 0 20px oklch(0.52 0.30 270 / 0.4), 0 0 60px oklch(0.52 0.30 270 / 0.15)",
                      clipPath: "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
                    }}
                  >
                    {/* Shine */}
                    <span
                      className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                      style={{ background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.12), transparent)" }}
                    />

                    {submitting ? (
                      <>
                        <span
                          className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Request Early Access
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  {/* Privacy note */}
                  <p className="text-center font-mono text-[10px] text-[oklch(0.35_0.02_270)]">
                    <Lock className="mr-1 inline h-2.5 w-2.5" />
                    No spam. No automated drip. Your data is protected by Infisical-managed secrets.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
