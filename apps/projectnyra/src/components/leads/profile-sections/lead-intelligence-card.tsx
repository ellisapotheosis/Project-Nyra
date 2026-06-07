"use client";

import { CreditCard, User } from "lucide-react";

import type { Lead } from "@/lib/api";

interface LeadIntelligenceCardProps {
  lead: Lead;
}

export function LeadIntelligenceCard({ lead }: LeadIntelligenceCardProps) {
  return (
    <div>
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-4 flex items-center gap-2">
        <User className="size-3" />
        Lead Intelligence
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Loan Amount</span>
          <span className="text-sm font-bold text-foreground">
            ${(lead.loanAmount || 0).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">FICO Score</span>
          <span className="text-sm font-bold text-turquoise-400 flex items-center gap-1.5">
            <CreditCard className="size-3" />
            {lead.creditScore || lead.creditBand || "720+"}
          </span>
        </div>
      </div>
    </div>
  );
}
