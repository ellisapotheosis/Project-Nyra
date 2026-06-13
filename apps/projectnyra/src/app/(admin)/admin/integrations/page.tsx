"use client";

import React from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe,
  Key,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const integrations = [
  {
    name: "Twenty CRM",
    category: "System of Record",
    status: "Healthy",
    lastSync: "2m ago",
    health: 100,
    secrets: ["API_KEY", "DB_URL"],
    url: "https://twenty.projectnyra.com",
    icon: Globe,
  },
  {
    name: "n8n Workflow",
    category: "Execution Engine",
    status: "Healthy",
    lastSync: "5s ago",
    health: 98,
    secrets: ["ENCRYPTION_KEY", "WEBHOOK_URL"],
    url: "https://n8n.projectnyra.com",
    icon: Zap,
  },
  {
    name: "LiteLLM Proxy",
    category: "AI Gateway",
    status: "Healthy",
    lastSync: "Instant",
    health: 100,
    secrets: ["MASTER_KEY", "OPENAI_KEY", "ANTHROPIC_KEY"],
    url: "https://litellm.projectnyra.com",
    icon: Server,
  },
  {
    name: "Nexus Aggregator",
    category: "MCP Router",
    status: "Degraded",
    lastSync: "1h ago",
    health: 75,
    secrets: ["NEXUS_TOKEN"],
    url: "https://nexus.projectnyra.com",
    icon: Activity,
    alert: "Connection to worker-3090ti timed out",
  },
  {
    name: "OpenMemory MCP",
    category: "Memory Diagnostics",
    status: "Protected",
    lastSync: "On demand",
    health: 100,
    secrets: ["OPENMEMORY_MCP_TOKEN", "NEXUS_TOKEN"],
    url: "https://openmemory.projectnyra.com",
    icon: Activity,
  },
  {
    name: "Letta Memory Manager",
    category: "Agent Memory",
    status: "Protected",
    lastSync: "On demand",
    health: 100,
    secrets: ["LETTA_SERVER_PASSWORD", "LETTA_DB_PASSWORD"],
    url: "https://letta.projectnyra.com",
    icon: Server,
  },
  {
    name: "Mem0 Runtime Memory",
    category: "Assistant Memory",
    status: "Protected",
    lastSync: "On demand",
    health: 100,
    secrets: ["MEM0_API_KEY", "QDRANT_API_KEY"],
    url: "https://mem0.projectnyra.com",
    icon: ShieldCheck,
  },
  {
    name: "Supabase Auth",
    category: "Identity",
    status: "Healthy",
    lastSync: "Active",
    health: 100,
    secrets: ["JWT_SECRET", "SERVICE_ROLE"],
    url: "https://api.projectnyra.com",
    icon: ShieldCheck,
  },
];

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased p-6 lg:p-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Integrations Hub
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
            Real-time infrastructure & secret registry
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-border/40"
          >
            <RefreshCw className="size-3.5" />
            <span>Resync All</span>
          </Button>
          <Link href="https://portainer.projectnyra.com" target="_blank">
            <Button
              size="sm"
              className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-500"
            >
              <ExternalLink className="size-3.5" />
              <span>Orchestrator Control</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        {integrations.map((item) => (
          <Card
            key={item.name}
            className="border-border/40 bg-card/40 overflow-hidden hover:bg-card/60 transition-colors"
          >
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row lg:items-center">
                {/* Brand/Status Side */}
                <div className="p-6 lg:w-72 border-b lg:border-b-0 lg:border-r border-border/20 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <item.icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "size-2 rounded-full",
                        item.status === "Healthy" || item.status === "Protected"
                          ? "bg-turquoise-400 shadow-[0_0_8px_rgba(var(--turquoise-rgb),0.5)]"
                          : "bg-pink-400 shadow-[0_0_8px_rgba(var(--pink-rgb),0.5)]"
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-bold",
                        item.status === "Healthy" || item.status === "Protected"
                          ? "text-turquoise-400"
                          : "text-pink-400"
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Health/Stats Side */}
                <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                      <span>Service Health</span>
                      <span>{item.health}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-1000",
                          item.health > 90 ? "bg-turquoise-500" : "bg-pink-500"
                        )}
                        style={{ width: `${item.health}%` }}
                      />
                    </div>
                    {item.alert && (
                      <p className="text-[10px] text-pink-400 font-bold flex items-center gap-1 mt-2">
                        <AlertTriangle className="size-3" />
                        {item.alert}
                      </p>
                    )}
                    {item.category.includes("Memory") && (
                      <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-2">
                        Launch opens the Access-gated diagnostic surface.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
                      <Key className="size-3" />
                      Active Secrets
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.secrets.map((s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="h-5 text-[9px] font-mono border-border/40 bg-background/50 text-muted-foreground/80 lowercase"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4">
                    <div className="text-right mr-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                        Last Pulse
                      </p>
                      <p className="text-xs font-bold text-foreground/70">
                        {item.lastSync}
                      </p>
                    </div>
                    <Link href={item.url} target="_blank">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-border/40 gap-2 text-xs font-bold"
                      >
                        Launch
                        <ExternalLink className="size-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-2xl border border-border/40 bg-indigo-500/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="size-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h4 className="font-bold">Infisical Secret Shield Active</h4>
            <p className="text-sm text-muted-foreground">
              All runtime secrets are managed via Infisical machine tokens.
              Hardcoded defaults are disabled.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-indigo-500/30 text-indigo-400 gap-2 shrink-0"
        >
          <Activity className="size-4" />
          Infrastructure Logs
        </Button>
      </div>
    </div>
  );
}
