"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const statuses = [
  { id: "nexus", label: "Nexus", status: "live" },
  { id: "twenty", label: "Twenty", status: "live" },
  { id: "vllm", label: "vLLM", status: "live" },
  { id: "quote", label: "Quote API", status: "live" },
  { id: "campaign", label: "Campaigns", status: "live" },
  { id: "n8n", label: "n8n", status: "degraded" },
];

export function TopHealthRail() {
  return (
    <div className="flex h-1.5 w-full overflow-hidden bg-white/5">
      {statuses.map((sys) => (
        <div
          key={sys.id}
          className={cn(
            "h-full flex-1 transition-all duration-500",
            sys.status === "live" &&
              "bg-turquoise-500/80 shadow-[0_0_10px_rgba(var(--turquoise-rgb),0.5)]",
            sys.status === "degraded" && "bg-amber-500/80 animate-pulse",
            sys.status === "offline" && "bg-destructive/80"
          )}
          title={`${sys.label}: ${sys.status}`}
        />
      ))}
    </div>
  );
}
