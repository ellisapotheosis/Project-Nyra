"use client";

import React from "react";
import { RadioTower } from "lucide-react";
import { cn } from "@/lib/utils";

interface SyncStatusCardProps {
  status: Array<{ label: string; value: string; ok: boolean }>;
}

export function SyncStatusCard({ status }: SyncStatusCardProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 text-left">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">
        <RadioTower className="size-3" />
        Sync Status
      </div>
      <div className="grid grid-cols-2 gap-2">
        {status.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 rounded-lg border border-border/30 bg-background/40 p-2"
          >
            <div
              className={cn(
                "size-1.5 rounded-full shadow-[0_0_8px]",
                item.ok
                  ? "bg-turquoise-400 shadow-turquoise-400/50"
                  : "bg-pink-400 shadow-pink-400/50"
              )}
            />
            <span className="text-[10px] font-medium text-muted-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
