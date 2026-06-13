"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const GLOSSARY: Record<string, string> = {
  APR: "Annual Percentage Rate — the yearly cost of a loan including interest and fees, expressed as a percentage.",
  LTV: "Loan-to-Value ratio — the loan amount divided by the appraised property value. Lower LTV means less risk for lenders.",
  DTI: "Debt-to-Income ratio — your total monthly debt payments divided by gross monthly income. Most lenders prefer under 43%.",
  PMI: "Private Mortgage Insurance — required when LTV exceeds 80%. Protects the lender, not you. Typically 0.5–1.5% annually.",
  "Rate Lock":
    "A lender's guarantee to hold your interest rate for a set period (usually 30–60 days) while your loan closes.",
  Points:
    "Upfront fees paid to lower your interest rate. One point = 1% of loan amount. Useful if you plan to stay long-term.",
  Escrow:
    "A third-party account holding funds for property taxes and insurance, paid monthly as part of your mortgage payment.",
  Amortization:
    "The process of paying off a loan in equal installments over time. Early payments are mostly interest; later payments are mostly principal.",
};

interface GlossaryTooltipProps {
  term: keyof typeof GLOSSARY | string;
  children?: React.ReactNode;
}

// Usage: <GlossaryTooltip term="APR" /> or <GlossaryTooltip term="LTV">LTV ratio</GlossaryTooltip>
export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const [visible, setVisible] = useState(false);
  const definition = GLOSSARY[term];

  if (!definition) return <>{children ?? <span>{term}</span>}</>;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span
        className="cursor-help border-b border-dashed border-white/40 text-inherit"
        tabIndex={0}
        role="button"
        aria-describedby={`glossary-${term}`}
      >
        {children ?? term}
      </span>

      <AnimatePresence>
        {visible && (
          <motion.div
            id={`glossary-${term}`}
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-[oklch(0.12_0.02_285)] p-3 shadow-xl"
          >
            <p className="text-[11px] font-semibold text-white/90 mb-1">
              {term}
            </p>
            <p className="text-[11px] text-white/60 leading-relaxed">
              {definition}
            </p>
            {/* Caret */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 rounded-sm border-b border-r border-white/10 bg-[oklch(0.12_0.02_285)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
