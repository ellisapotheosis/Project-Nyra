import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  DatabaseZap,
  FileClock,
  GitBranch,
  KeyRound,
  LockKeyhole,
  RadioTower,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fleetStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const controlCards = [
  {
    title: "CRM Boundary",
    status: "Twenty is system of record",
    detail:
      "Broker UI reads through crm-api contracts. Direct database writes stay outside the assistant surface.",
    href: "/crm",
    icon: DatabaseZap,
    tone: "text-turquoise-400",
  },
  {
    title: "Compliance Gates",
    status: "Outbound gated",
    detail:
      "STOP, unsubscribe, quiet hours, and HITL approval remain service-owned before any send leaves Nyra.",
    href: "/leads",
    icon: ShieldCheck,
    tone: "text-indigo-400",
  },
  {
    title: "Assistant Tools",
    status: "Supervised mode",
    detail:
      "OpenClaw and Nexus can suggest, summarize, and draft. Sensitive actions stay behind approval.",
    href: "/assistant",
    icon: Bot,
    tone: "text-pink-400",
  },
  {
    title: "Workflow Substrate",
    status: "Execution only",
    detail:
      "n8n and Activepieces remain internal glue. Campaign logic is represented by Nyra-owned routes.",
    href: "/campaigns",
    icon: Workflow,
    tone: "text-turquoise-400",
  },
];

const adminQueue = [
  {
    title: "Owner dashboard actions",
    status: "Manual",
    detail:
      "Cloudflare, provider OAuth, and MFA-bound changes should be recorded in docs/OWNER_MANUAL_ACTIONS.md.",
    icon: KeyRound,
  },
  {
    title: "CRM sync degradation",
    status: "Watch",
    detail:
      "UI is showing cached contracts when live crm-api is unavailable. Keep degraded state visible to operators.",
    icon: AlertTriangle,
  },
  {
    title: "Quote review discipline",
    status: "Required",
    detail:
      "Assistant surfaces must route quote requests to quote-service artifacts, not generated rate text.",
    icon: FileClock,
  },
];

const topology = [
  ["orchestrator", "Cloudflared, Nexus, LiteLLM, OpenClaw, observability"],
  ["oracle-vps", "Twenty CRM, campaign engine, quote API, memory backends"],
  ["worker-rtx5090", "Primary private vLLM worker"],
  ["worker-rtx3090ti", "Secondary private vLLM worker"],
  ["worker-rtx3060", "Embeddings, extraction, background tasks"],
];

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 lg:px-8">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-turquoise-400">
            <RadioTower className="size-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
              Operator Admin
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Control Plane Review
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              A broker-safe admin surface for service posture, owner-only
              actions, compliance posture, and tool routing. This page exposes
              operating truth without turning the UI into a vendor console.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/integrations">
            <Button variant="outline" size="sm" className="gap-2">
              <Activity className="size-4" />
              Integrations
            </Button>
          </Link>
          <Link href="/tools/openclaw">
            <Button size="sm" className="gap-2">
              <Bot className="size-4" />
              OpenClaw
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {controlCards.map((item) => (
          <Card key={item.title} className="border-border/40 bg-card/40">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-xl border border-border/40 bg-background/60",
                    item.tone
                  )}
                >
                  <item.icon className="size-5" />
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {item.status}
                </Badge>
              </div>
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {item.detail}
              </p>
              <Link
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "link", size: "sm" }),
                  "h-auto p-0 text-primary"
                )}
              >
                Inspect surface
                <ArrowRight className="ml-1 size-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="border-border/40 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
              <GitBranch className="size-4 text-indigo-400" />
              Topology Map
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {topology.map(([node, detail]) => (
              <div
                key={node}
                className="grid gap-3 rounded-xl border border-border/40 bg-background/40 p-4 md:grid-cols-[180px_1fr]"
              >
                <div className="flex items-center gap-2 font-mono text-xs uppercase text-turquoise-400">
                  <CheckCircle2 className="size-4" />
                  {node}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {detail}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/40 bg-card/40">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Fleet Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Health</span>
                <Badge className="bg-turquoise-500/15 text-turquoise-400">
                  {fleetStatus.overallHealth}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Workers</span>
                <span>{fleetStatus.activeWorkers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Available VRAM</span>
                <span>{fleetStatus.availableVRAM}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active agents</span>
                <span>{fleetStatus.activeAgents}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
                <LockKeyhole className="size-4 text-pink-400" />
                Admin Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {adminQueue.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border/40 bg-background/40 p-3"
                >
                  <div className="flex items-start gap-3">
                    <item.icon className="mt-0.5 size-4 text-primary" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <Badge variant="outline" className="text-[9px]">
                          {item.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
