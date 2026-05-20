"use client";

import React, { useState, useEffect } from "react";
import { RadioTower, Users, Zap, TrendingUp, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RadarLead {
  id: string;
  name: string;
  action: string;
  timestamp: string;
  intensity: number; // 0-100
}

export function LeadRadar() {
  const [leads, setLeads] = useState<RadarLead[]>([
    {
      id: "1",
      name: "Sarah J.",
      action: "Viewed Quote",
      timestamp: "Just now",
      intensity: 95,
    },
    {
      id: "2",
      name: "Mike D.",
      action: "Replied to SMS",
      timestamp: "2m ago",
      intensity: 80,
    },
    {
      id: "3",
      name: "Alex K.",
      action: "Opened Email",
      timestamp: "5m ago",
      intensity: 40,
    },
  ]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Periodic shift for demo effect
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="relative flex size-2 items-center justify-center">
            <div className="absolute size-full rounded-full bg-turquoise-400 animate-ping opacity-75" />
            <div className="relative size-1.5 rounded-full bg-turquoise-500" />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Live Radar
          </h3>
        </div>
        <span className="text-[9px] font-bold text-turquoise-400/80 uppercase">
          3 active now
        </span>
      </div>

      <div className="space-y-2">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="group relative flex items-center justify-between p-3 rounded-xl border border-border/30 bg-card/20 hover:border-indigo-500/30 hover:bg-card/40 transition-all cursor-pointer overflow-hidden"
          >
            {/* Intensity Bar (Background) */}
            <div
              className="absolute left-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-500 to-turquoise-400 opacity-30 group-hover:opacity-60 transition-opacity"
              style={{ width: `${lead.intensity}%` }}
            />

            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-background border border-border/40 flex items-center justify-center text-indigo-400">
                <Users className="size-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground">{lead.name}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Zap className="size-2.5 text-amber-400" />
                  {lead.action}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter">
                {lead.timestamp}
              </p>
              <ChevronRight className="size-3 text-muted-foreground/20 group-hover:translate-x-0.5 transition-transform ml-auto mt-0.5" />
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-2 rounded-lg border border-dashed border-border/40 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-indigo-400 hover:border-indigo-500/20 transition-all">
        Enter Command Stream
      </button>
    </div>
  );
}
