"use client";

/**
 * LANDING FOOTER — ProjectNyra.com
 * Dark, minimal. Nyra logo mark + tagline.
 * Links to key sections + legal.
 * Compliance disclaimer.
 */

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Github, ExternalLink } from "lucide-react";

/* ─────────────────────────────────────────────────────
   Nav groups
───────────────────────────────────────────────────── */
const NAV = [
  {
    group: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "The Machine", href: "#pipeline" },
      { label: "OpenClaw AI", href: "#openclaw" },
      { label: "Early Access", href: "#early-access" },
    ],
  },
  {
    group: "Stack",
    links: [
      { label: "Twenty CRM", href: "https://twenty.com", external: true },
      { label: "LiteLLM", href: "https://litellm.ai", external: true },
      { label: "Activepieces", href: "https://activepieces.com", external: true },
      { label: "Infisical", href: "https://infisical.com", external: true },
    ],
  },
  {
    group: "Broker",
    links: [
      { label: "RateHunter.net", href: "https://ratehunter.net", external: true },
      { label: "Book a Call", href: "https://calendly.com/ellis_andersen", external: true },
      { label: "GitHub", href: "https://github.com/ellisapotheosis/Project-Nyra", external: true },
    ],
  },
];

/* ─────────────────────────────────────────────────────
   Nyra mark — text logo mark
───────────────────────────────────────────────────── */
function NyraMark() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        {/* Small mascot circle */}
        <div
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[oklch(0.52_0.30_270/0.4)]"
          style={{ background: "oklch(0.10 0.04 270)" }}
        >
          <Image
            src="/nyra-mascot-circle.avif"
            alt="Nyra"
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        </div>
        <span
          className="font-[Michroma] text-xl tracking-[0.08em]"
          style={{
            color: "transparent",
            WebkitTextStroke: "1px oklch(0.78 0.20 195)",
            textShadow: "0 0 20px oklch(0.78 0.20 195 / 0.3)",
          }}
        >
          PROJECT NYRA
        </span>
      </div>
      <p className="max-w-[240px] font-mono text-[10px] leading-relaxed text-[oklch(0.38_0.03_270)]">
        The AI-Native Mortgage OS. From first contact to funded — automated, compliant, and yours.
      </p>

      <div className="mt-2 flex items-center gap-3">
        <Link
          href="https://github.com/ellisapotheosis/Project-Nyra"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-mono text-[10px] text-[oklch(0.40_0.04_270)] transition-colors hover:text-[oklch(0.65_0.06_270)]"
        >
          <Github className="h-3.5 w-3.5" />
          GitHub
        </Link>
        <span className="text-[oklch(0.25_0.02_270)]">·</span>
        <span className="font-mono text-[10px] text-[oklch(0.32_0.02_270)]">
          Self-hosted. Your data. Your rules.
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────── */
export function LandingFooter() {
  return (
    <footer
      className="relative border-t border-[oklch(0.15_0.03_270/0.5)]"
      style={{ background: "oklch(0.052 0.022 270)" }}
    >
      {/* Top beam */}
      <div
        className="h-px w-full"
        style={{
          background: "linear-gradient(to right, transparent, oklch(0.52 0.30 270 / 0.4) 30%, oklch(0.52 0.30 270 / 0.4) 70%, transparent)",
        }}
      />

      <div className="mx-auto max-w-7xl px-6">
        {/* Main footer grid */}
        <div className="grid gap-12 py-16 md:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <NyraMark />

          {/* Nav groups */}
          {NAV.map((group) => (
            <div key={group.group}>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[oklch(0.42_0.06_270)]">
                {group.group}
              </p>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="group inline-flex items-center gap-1.5 font-[Electrolize] text-[13px] text-[oklch(0.45_0.03_270)] transition-colors hover:text-[oklch(0.72_0.08_270)]"
                    >
                      {link.label}
                      {link.external && (
                        <ExternalLink className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-60" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-[oklch(0.15_0.02_270/0.6)]" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 py-6 text-center sm:flex-row sm:text-left">
          <p className="font-mono text-[10px] text-[oklch(0.32_0.02_270)]">
            © 2026 Project Nyra · Built by Ellis Andersen ·{" "}
            <Link href="https://ratehunter.net" className="hover:text-[oklch(0.50_0.05_270)]">
              ratehunter.net
            </Link>
          </p>

          <div className="flex items-center gap-4">
            {[
              "Not a lender",
              "All rates require broker approval",
              "NMLS 1912260",
            ].map((note, i) => (
              <span key={i} className="font-mono text-[9px] text-[oklch(0.28_0.02_270)]">
                {note}
                {i < 2 && <span className="ml-4 text-[oklch(0.20_0.01_270)]">·</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Compliance disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-[oklch(0.14_0.02_270/0.5)] pb-8 pt-5"
        >
          <p className="font-mono text-[9px] leading-relaxed text-[oklch(0.28_0.015_270)]">
            Project Nyra is a broker automation software platform, not a lender, mortgage broker, or financial advisor. All AI-generated content is for informational purposes only and does not constitute mortgage advice, rate quotes, or credit decisions. Campaign communications are managed by licensed mortgage professionals in accordance with applicable TCPA, CAN-SPAM, and state telemarketing regulations. Rate quotes, APRs, and loan comparisons are generated by the Quote Engine and must be reviewed and approved by a licensed loan officer prior to sharing with consumers. Ellis Andersen | NMLS 1912260 | West Capital Lending, Inc. NMLS 1566096 | CA DRE 02196940 | Company CA DRE 02022356.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
