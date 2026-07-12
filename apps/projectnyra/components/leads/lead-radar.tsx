"use client";

import React, { useState, useEffect } from "react";
import { Users, Zap, ChevronRight, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  mockRadarLeads,
  parseRadarMessage,
  radarChannels,
  toRadarLead,
  type RadarLead,
} from "@/lib/leadRadarEvents";

export function LeadRadar() {
  const [leads, setLeads] = useState<RadarLead[]>(mockRadarLeads);
  const [streamState, setStreamState] = useState<
    "mock" | "connecting" | "live" | "offline"
  >("mock");

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_NYRA_WEBSOCKET_URL;
    if (!wsUrl) {
      return;
    }

    setStreamState("connecting");
    const socket = new WebSocket(wsUrl);

    socket.addEventListener("open", () => {
      setStreamState("live");
      for (const channel of radarChannels) {
        socket.send(
          JSON.stringify({
            type: "subscribe",
            payload: { channel },
          })
        );
      }
    });

    socket.addEventListener("message", (message) => {
      const event = parseRadarMessage(String(message.data));
      if (!event) {
        return;
      }

      const lead = toRadarLead(event);
      setLeads((current) => {
        const deduped = current.filter((item) => item.id !== lead.id);
        return [lead, ...deduped].slice(0, 6);
      });
    });

    socket.addEventListener("error", () => {
      setStreamState("offline");
    });

    socket.addEventListener("close", () => {
      setStreamState((current) => (current === "live" ? "offline" : current));
    });

    return () => {
      socket.close(1000, "Lead radar unmounted");
    };
  }, []);

  const isLive = streamState === "live";
  const statusLabel =
    streamState === "live"
      ? `${leads.length} live`
      : streamState === "connecting"
        ? "connecting"
        : streamState === "offline"
          ? "offline"
          : "mock mode";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="relative flex size-2 items-center justify-center">
            <div
              className={cn(
                "absolute size-full rounded-full opacity-75",
                isLive && "animate-ping bg-turquoise-400"
              )}
            />
            <div
              className={cn(
                "relative size-1.5 rounded-full",
                isLive ? "bg-turquoise-500" : "bg-muted-foreground/40"
              )}
            />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Live Radar
          </h3>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[9px] font-bold uppercase",
            isLive ? "text-turquoise-400/80" : "text-muted-foreground/50"
          )}
        >
          {isLive ? (
            <Wifi className="size-3" />
          ) : (
            <WifiOff className="size-3" />
          )}
          {statusLabel}
        </span>
      </div>

      {/* Sonar sweep overlay */}
      <div className="relative w-full aspect-square max-w-[180px] mx-auto mb-2 pointer-events-none">
        <div
          className="absolute inset-0 rounded-full border border-indigo-500/10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.5038 0.2937 285.3753 / 0.04) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, rgba(80,56,255,0.3) 0deg, transparent 60deg, transparent 360deg)",
            animation: "sonar-sweep 4s linear infinite",
          }}
        />
        <style>{`
          @keyframes sonar-sweep {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
        {/* Centre dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-1.5 rounded-full bg-indigo-400/60" />
        </div>
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
                <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest">
                  {lead.source}
                  {lead.traceId ? ` · ${lead.traceId}` : ""}
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
        {isLive ? "Enter Command Stream" : "Awaiting Live Stream"}
      </button>
    </div>
  );
}
