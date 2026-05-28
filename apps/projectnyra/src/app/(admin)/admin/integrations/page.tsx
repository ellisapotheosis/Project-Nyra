"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ExternalLink,
  Globe,
  Key,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  IntegrationHealthRecord,
  ServiceHealthSnapshot,
} from "@/lib/api/integrationHealth";
import { healthApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const integrationIcons: Record<string, React.ElementType> = {
  "twenty-crm": Globe,
  n8n: Zap,
  litellm: Server,
  "nexus-router": Activity,
  openmemory: Activity,
  gastown: Server,
  letta: Server,
  mem0: ShieldCheck,
  supabase: ShieldCheck,
};

const emptySnapshot: ServiceHealthSnapshot = {
  ready: false,
  production: false,
  mocksEnabled: false,
  checkedAt: "",
  dependencies: [],
  missingProductionConfig: [],
  integrations: [],
};

export default function IntegrationsPage() {
  const [snapshot, setSnapshot] =
    useState<ServiceHealthSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const body = await healthApi.getServiceHealth();
      setSnapshot(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Health refresh failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const summary = useMemo(() => summarize(snapshot.integrations), [snapshot]);

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
            onClick={() => void refresh()}
            disabled={loading}
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
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

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <StatusMetric label="Healthy" value={summary.healthy} tone="healthy" />
        <StatusMetric label="Protected" value={summary.protected} tone="ok" />
        <StatusMetric label="Degraded" value={summary.degraded} tone="warn" />
        <StatusMetric
          label="Missing Config"
          value={snapshot.missingProductionConfig.length}
          tone="danger"
        />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm font-medium text-pink-300">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {snapshot.integrations.map((item) => {
          const Icon = integrationIcons[item.id] ?? Server;
          const tone = getStatusTone(item.status);

          return (
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
                        <Icon className="size-5" />
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
                          tone === "ok"
                            ? "bg-turquoise-400 shadow-[0_0_8px_rgba(var(--turquoise-rgb),0.5)]"
                            : "bg-pink-400 shadow-[0_0_8px_rgba(var(--pink-rgb),0.5)]"
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-bold",
                          tone === "ok" ? "text-turquoise-400" : "text-pink-400"
                        )}
                      >
                        {formatStatus(item.status)}
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
                            item.health > 90
                              ? "bg-turquoise-500"
                              : "bg-pink-500"
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
                      {item.checks[0]?.latencyMs !== undefined && (
                        <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-2">
                          Probe {item.checks[0].status ?? "failed"} in{" "}
                          {item.checks[0].latencyMs}ms
                        </p>
                      )}
                      {item.category.includes("Memory") &&
                        !item.checks.length && (
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
                        {item.secretEnvs.map((s) => (
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
                          {formatPulse(item.lastPulse)}
                        </p>
                      </div>
                      <Link href={item.url || "#"} target="_blank">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-border/40 gap-2 text-xs font-bold"
                          disabled={!item.url}
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
          );
        })}
      </div>

      <div className="mt-12 p-6 rounded-2xl border border-border/40 bg-indigo-500/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="size-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h4 className="font-bold">Infisical Secret Shield Active</h4>
            <p className="text-sm text-muted-foreground">
              Runtime health is read from `/api/health/services`; secret names
              are shown without exposing values.
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

function summarize(integrations: IntegrationHealthRecord[]) {
  return integrations.reduce(
    (totals, integration) => {
      if (integration.status === "healthy") {
        totals.healthy += 1;
      } else if (integration.status === "protected") {
        totals.protected += 1;
      } else if (integration.status === "degraded") {
        totals.degraded += 1;
      } else {
        totals.degraded += 1;
      }

      return totals;
    },
    { healthy: 0, protected: 0, degraded: 0 }
  );
}

function StatusMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "healthy" | "ok" | "warn" | "danger";
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-card/30 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold",
          tone === "healthy" && "text-turquoise-300",
          tone === "ok" && "text-indigo-300",
          tone === "warn" && "text-amber-300",
          tone === "danger" && "text-pink-300"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function getStatusTone(status: IntegrationHealthRecord["status"]) {
  return status === "healthy" || status === "protected" ? "ok" : "alert";
}

function formatStatus(status: IntegrationHealthRecord["status"]) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatPulse(value: string) {
  if (!value || value === "Not configured") {
    return value || "Pending";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
