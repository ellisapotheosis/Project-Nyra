"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LeadProfileHeaderProps {
  firstName?: string;
  lastName?: string;
  id: string;
  loanPurpose?: string;
  campaignStatus?: string;
}

export function LeadProfileHeader({
  firstName,
  lastName,
  id,
  loanPurpose,
  campaignStatus,
}: LeadProfileHeaderProps) {
  return (
    <div className="p-6 flex flex-col items-center text-center">
      <div className="relative">
        <div className="h-20 w-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-2xl mb-4 shadow-[0_0_30px_-5px_rgba(var(--indigo-rgb),0.3)]">
          {firstName?.[0]}
          {lastName?.[0]}
        </div>
        <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-background border-2 border-card flex items-center justify-center">
          <ShieldCheck className="size-3.5 text-turquoise-400" />
        </div>
      </div>
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        {firstName} {lastName}
      </h2>
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
        Lead ID: {id.slice(0, 8)}
      </p>

      <div className="flex items-center mt-4 space-x-2">
        <Badge
          variant="outline"
          className="border-indigo-500/30 bg-indigo-500/5 text-indigo-400 px-2 py-0.5 text-[10px]"
        >
          {loanPurpose || "PURCHASE"}
        </Badge>
        <Badge
          variant="outline"
          className="border-turquoise-500/30 bg-turquoise-500/5 text-turquoise-400 px-2 py-0.5 text-[10px]"
        >
          {campaignStatus || "ACTIVE"}
        </Badge>
      </div>
    </div>
  );
}
