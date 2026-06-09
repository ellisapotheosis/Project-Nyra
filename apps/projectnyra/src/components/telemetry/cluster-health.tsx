"use client";

import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, Zap, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { healthApi, type HeartbeatStatus } from "@/lib/api";

export function ClusterHealthHeartbeat() {
  const [data, setData] = useState<HeartbeatStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealth() {
      try {
        setData(await healthApi.getHeartbeat());
      } catch (error) {
        console.error("Health check failed", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center gap-3 opacity-50">
        <div className="size-2 rounded-full bg-slate-500 animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          PULSE_CONNECTING...
        </span>
      </div>
    );
  }

  const isHealthy = data.status === "MISSION_GREEN";

  return (
    <div className="flex items-center gap-6">
      {/* Global Status */}
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "size-2 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.6)] animate-pulse",
            isHealthy ? "bg-turquoise-400" : "bg-pink-500 shadow-pink-500/60"
          )}
        />
        <span
          className={cn(
            "text-[9px] font-black uppercase tracking-widest",
            isHealthy ? "text-turquoise-400" : "text-pink-500"
          )}
        >
          {data.status}
        </span>
      </div>

      {/* Node Mini-Grid */}
      <div className="hidden sm:flex items-center gap-4 border-l border-border/30 pl-6">
        {data.nodes.map((node) => (
          <div key={node.id} className="flex flex-col gap-0.5">
            <span className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-tighter">
              {node.id}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-bold text-foreground">
                {node.load}
              </span>
              <div className="w-8 h-1 bg-indigo-500/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500/40"
                  style={{ width: node.load }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Services Badge */}
      <div className="hidden xl:flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg px-3 py-1">
        <Zap size={10} className="text-indigo-400" />
        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">
          LETTA_READY
        </span>
      </div>
    </div>
  );
}
