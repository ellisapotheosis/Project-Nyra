"use client";

/**
 * BLINKING BADGE — Neonblade Implementation
 * Status indicator badge with animated dot and pulse ring.
 * Used for: MCP server health, app online status, AI agent activity.
 *
 * Usage:
 *   <BlinkingBadge variant="green" label="Online" />
 *   <BlinkingBadge variant="pink" label="Nyra Active" />
 *   <BlinkingBadge variant="red" label="Disconnected" blink />
 *   <BlinkingBadge variant="amber" label="Degraded" />
 */

import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "green"
  | "cyan"
  | "violet"
  | "pink"
  | "red"
  | "amber"
  | "blue";

interface BlinkingBadgeProps {
  variant?: BadgeVariant;
  label: string;
  /** Force blink animation (red always blinks by default) */
  blink?: boolean;
  /** Optional sub-label shown in muted text */
  sublabel?: string;
  className?: string;
}

const variantMap: Record<
  BadgeVariant,
  { bg: string; border: string; text: string; dot: string }
> = {
  green: {
    bg: "bg-[oklch(0.72_0.18_150/0.15)]",
    border: "border-[oklch(0.72_0.18_150/0.35)]",
    text: "text-[oklch(0.72_0.18_150)]",
    dot: "bg-[oklch(0.72_0.18_150)]",
  },
  cyan: {
    bg: "bg-[oklch(0.78_0.20_195/0.15)]",
    border: "border-[oklch(0.78_0.20_195/0.35)]",
    text: "text-[oklch(0.78_0.20_195)]",
    dot: "bg-[oklch(0.78_0.20_195)]",
  },
  violet: {
    bg: "bg-[oklch(0.52_0.30_270/0.15)]",
    border: "border-[oklch(0.52_0.30_270/0.35)]",
    text: "text-[oklch(0.68_0.28_270)]",
    dot: "bg-[oklch(0.68_0.28_270)]",
  },
  pink: {
    bg: "bg-[oklch(0.65_0.32_330/0.15)]",
    border: "border-[oklch(0.65_0.32_330/0.35)]",
    text: "text-[oklch(0.65_0.32_330)]",
    dot: "bg-[oklch(0.65_0.32_330)]",
  },
  red: {
    bg: "bg-[oklch(0.60_0.28_25/0.15)]",
    border: "border-[oklch(0.60_0.28_25/0.35)]",
    text: "text-[oklch(0.70_0.26_25)]",
    dot: "bg-[oklch(0.70_0.26_25)]",
  },
  amber: {
    bg: "bg-[oklch(0.78_0.22_75/0.15)]",
    border: "border-[oklch(0.78_0.22_75/0.35)]",
    text: "text-[oklch(0.78_0.22_75)]",
    dot: "bg-[oklch(0.78_0.22_75)]",
  },
  blue: {
    bg: "bg-[oklch(0.60_0.24_250/0.15)]",
    border: "border-[oklch(0.60_0.24_250/0.35)]",
    text: "text-[oklch(0.70_0.22_250)]",
    dot: "bg-[oklch(0.70_0.22_250)]",
  },
};

export function BlinkingBadge({
  variant = "green",
  label,
  blink,
  sublabel,
  className,
}: BlinkingBadgeProps) {
  const v = variantMap[variant];
  const shouldBlink = blink || variant === "red";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        v.bg,
        v.border,
        className
      )}
    >
      {/* Dot with optional pulse ring */}
      <span className="relative flex h-1.5 w-1.5 shrink-0 items-center justify-center">
        <span
          className={cn(
            "relative z-10 h-1.5 w-1.5 rounded-full",
            v.dot,
            shouldBlink && "animate-[badge-blink_1.5s_ease-in-out_infinite]"
          )}
        />
        {/* Pulse ring */}
        <span
          className={cn(
            "absolute inset-[-3px] rounded-full opacity-0",
            v.dot,
            "animate-[badge-pulse-ring_1.5s_ease-out_infinite]"
          )}
        />
      </span>

      <span
        className={cn(
          "font-mono text-[10px] font-bold uppercase tracking-[0.12em]",
          v.text
        )}
      >
        {label}
      </span>

      {sublabel && (
        <>
          <span className="text-[oklch(0.35_0.015_270)] mx-0.5">·</span>
          <span className="font-mono text-[10px] text-[oklch(0.50_0.02_270)] tracking-wider">
            {sublabel}
          </span>
        </>
      )}
    </span>
  );
}

/* ─────────────────────────────────────────────────────
   SYSTEM STATUS CLUSTER
   Renders a row of badges for a named service group
───────────────────────────────────────────────────── */
interface ServiceStatus {
  name: string;
  status: "online" | "active" | "degraded" | "offline" | "busy";
  sublabel?: string;
}

const statusToVariant: Record<ServiceStatus["status"], BadgeVariant> = {
  online: "green",
  active: "cyan",
  degraded: "amber",
  offline: "red",
  busy: "pink",
};

const statusToLabel: Record<ServiceStatus["status"], string> = {
  online: "Online",
  active: "Active",
  degraded: "Degraded",
  offline: "Offline",
  busy: "Busy",
};

interface ServiceStatusClusterProps {
  services: ServiceStatus[];
  className?: string;
}

export function ServiceStatusCluster({
  services,
  className,
}: ServiceStatusClusterProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {services.map((svc) => (
        <BlinkingBadge
          key={svc.name}
          variant={statusToVariant[svc.status]}
          label={`${svc.name} · ${statusToLabel[svc.status]}`}
          sublabel={svc.sublabel}
          blink={svc.status === "busy" || svc.status === "offline"}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   PRESET BADGE CLUSTERS for specific UIs
───────────────────────────────────────────────────── */

/** For NexusUI — shows MCP server health */
export function NexusHealthBadges() {
  return (
    <ServiceStatusCluster
      services={[
        { name: "Nexus Router", status: "online" },
        { name: "LiteLLM", status: "active" },
        { name: "OpenRouter", status: "online" },
        { name: "Mem0", status: "active", sublabel: "FalkorDB" },
      ]}
    />
  );
}

/** For Paperclip UI — agent dev workflow */
export function PaperclipStatusBadges() {
  return (
    <ServiceStatusCluster
      services={[
        { name: "Paperclip", status: "active" },
        { name: "Gitea", status: "online" },
        { name: "Docker", status: "online" },
      ]}
    />
  );
}

/** For ClawTeam UI — team agent swarm */
export function ClawTeamStatusBadges() {
  return (
    <ServiceStatusCluster
      services={[
        { name: "ClawTeam", status: "active" },
        { name: "Letta", status: "active" },
        { name: "OpenClaw", status: "active" },
        { name: "Nerve", status: "online" },
      ]}
    />
  );
}

/** For Nerve UI — voice / real-time */
export function NerveStatusBadges() {
  return (
    <ServiceStatusCluster
      services={[
        { name: "Nerve", status: "active" },
        { name: "Kyutai Unmute", status: "online" },
        { name: "VAD", status: "active" },
      ]}
    />
  );
}
