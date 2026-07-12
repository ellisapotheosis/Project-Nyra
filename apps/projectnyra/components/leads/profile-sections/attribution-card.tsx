"use client";

import React from "react";
import { Fingerprint } from "lucide-react";

interface AttributionCardProps {
  source?: string;
  campaign?: string;
}

export function AttributionCard({ source, campaign }: AttributionCardProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 text-left">
      <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">
        <span className="flex items-center gap-1.5">
          <Fingerprint className="size-3" />
          Attribution
        </span>
        <span className="text-turquoise-400/80">Verified</span>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Channel</span>
          <span className="font-semibold text-foreground">
            {source || "Direct"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Entry</span>
          <span className="font-semibold text-foreground">
            {campaign || "Unattributed"}
          </span>
        </div>
      </div>
    </div>
  );
}
