"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  FileClock,
  GitBranch,
  LayoutDashboard,
  MessageSquareReply,
  RadioTower,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";

import { LeadRadar } from "@/components/leads/lead-radar";
import { Badge } from "@/components/ui/badge";
import {
  CommandStatsSkeleton,
  PriorityQueueSkeleton,
  LeadRadarSkeleton,
} from "@/components/ui/dashboard-skeleton";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crmApi } from "@/lib/api/crm";
import { useApi } from "@/lib/api/hooks";
import { applications, campaigns, crmOverview, leads } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function Home() {
  const {
    data: leadData,
    error: leadError,
    execute: fetchLeads,
    isLoading: loadingLeads,
  } = useApi(() => crmApi.getLeads());
  const {
    data: pipelineData,
    error: pipelineError,
    execute: fetchPipeline,
    isLoading: loadingPipeline,
  } = useApi(() => crmApi.getPipeline());

  useEffect(() => {
    void fetchLeads().catch(() => undefined);
    void fetchPipeline().catch(() => undefined);
  }, [fetchLeads, fetchPipeline]);

  const activeLeads = leadData?.leads || leads;
  const hotLeadCount = activeLeads.filter((lead) => {
    const status = "status" in lead ? lead.status : undefined;
    return status === "NEW" || lead.stage === "Qualified";
  }).length;
  const dataSourceStatus =
    leadError || pipelineError ? "Local fallback active" : "CRM mirror ready";

  const appSurfaces = [
    {
      title: "Lead Desk",
      route: "/leads",
      detail: "Unified lead intake, status, consent, and next action queue.",
      icon: Users,
    },
    {
      title: "CRM",
      route: "/crm",
      detail: "Broker-safe CRM workspace over the Twenty source of truth.",
      icon: LayoutDashboard,
    },
    {
      title: "Nexus UI",
      route: "/nexus",
      detail: "Nexus Router, LiteLLM, Grafbase, and operator service posture.",
      icon: RadioTower,
    },
    {
      title: "Admin",
      route: "/admin",
      detail: "Owner-only integrations, service posture, and release controls.",
      icon: ShieldCheck,
    },
    {
      title: "Assistant",
      route: "/assistant",
      detail: "OpenClaw-backed broker assistant and lead action workspace.",
      icon: Bot,
    },
    {
      title: "Campaigns",
      route: "/campaigns",
      detail: "Compliant sequence control, pause state, and campaign review.",
      icon: Workflow,
    },
    {
      title: "Quote Desk",
      route: "/quotes",
      detail: "Deterministic quote scenarios and lock window review.",
      icon: CircleDollarSign,
    },
    {
      title: "Pipeline",
      route: "/pipeline",
      detail: "Stage movement, borrower replies, and file progression.",
      icon: GitBranch,
    },
  ];

  const commandStats = [
    {
      label: "New leads",
      value: loadingLeads ? "..." : activeLeads.length.toString(),
      detail: `${hotLeadCount} hot, 3 need same-day follow-up`,
      icon: Users,
      tone: "text-turquoise-400",
    },
    {
      label: "Active replies",
      value: "7",
      detail: "2 paused for broker review",
      icon: MessageSquareReply,
      tone: "text-pink-400",
    },
    {
      label: "Quote desk",
      value: "18",
      detail: "3 locks expire within 7 days",
      icon: CircleDollarSign,
      tone: "text-indigo-400",
    },
    {
      label: "Pipeline value",
      value: crmOverview.pipelineValue,
      detail: `${applications.length} active applications`,
      icon: TrendingUp,
      tone: "text-turquoise-400",
    },
  ];

  const priorityQueue = [
    {
      title: "Borrower reply waiting on HITL approval",
      context:
        "Jane Smith answered the Purchase Power SMS. Automation is paused.",
      route: "/leads/2",
      action: "Open lead",
      severity: "critical",
      icon: ShieldAlert,
    },
    {
      title: "Rate lock expiration review",
      context:
        "Three quote packages need lock-status confirmation before Friday.",
      route: "/quotes",
      action: "Review quotes",
      severity: "warning",
      icon: FileClock,
    },
    {
      title: "Refinance Blitz is outperforming",
      context: "42% reply rate. Consider cloning gates before scaling volume.",
      route: "/campaigns",
      action: "Inspect campaign",
      severity: "healthy",
      icon: Workflow,
    },
  ];

  const blockerRows = [
    [
      "Compliance gate",
      "Clear",
      "No STOP, DNC, quiet-hours, or consent blocks on active hot leads.",
    ],
    [
      "CRM sync",
      "Degraded",
      "Twenty mirror is using cached mock contracts until crm-api is reachable.",
    ],
    [
      "Assistant safety",
      "Active",
      "Token verification and HITL approval gates are enforced for all tools.",
    ],
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-10">
          {/* Header Section */}
          <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <RadioTower className="size-4 animate-pulse text-turquoise-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-turquoise-400">
                  {dataSourceStatus}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Project Nyra Webapp
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Broker command, CRM mirror, Nexus operations, assistant,
                campaigns, quotes, pipeline, and admin surfaces are available
                from this control hub.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <Link
                href="/nexus"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-9 gap-2 px-3"
                )}
              >
                <Activity className="size-4" />
                <span className="truncate">Diagnostics</span>
              </Link>
              <Link
                href="/assistant"
                className={cn(buttonVariants({ size: "sm" }), "h-9 gap-2 px-3")}
              >
                <Sparkles className="size-4" />
                <span className="truncate">Ask Nyra</span>
              </Link>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {appSurfaces.map(({ title, route, detail, icon: Icon }) => (
              <Link
                key={route}
                href={route}
                className="group rounded-xl border border-border/40 bg-card/40 p-4 transition-colors hover:bg-card/65"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-primary" />
                      <h2 className="text-sm font-semibold">{title}</h2>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {detail}
                    </p>
                  </div>
                  <ArrowRight className="mt-0.5 size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </section>

          {/* Stats Grid */}
          <section>
            {loadingLeads || loadingPipeline ? (
              <CommandStatsSkeleton />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {commandStats.map((stat) => (
                  <Card
                    key={stat.label}
                    className="border-border/40 bg-card/40"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                      <stat.icon className={cn("size-4", stat.tone)} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {stat.detail}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Main Workspace */}
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              {/* Priority Queue */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Priority Queue
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-primary/5 text-primary"
                  >
                    {priorityQueue.length} items
                  </Badge>
                </div>
                {loadingLeads ? (
                  <PriorityQueueSkeleton />
                ) : (
                  <div className="grid gap-3">
                    {priorityQueue.map((item) => (
                      <Card
                        key={item.title}
                        className="group border-border/40 bg-card/40 transition-colors hover:bg-card/60"
                      >
                        <CardContent className="flex items-start gap-4 p-4">
                          <div
                            className={cn(
                              "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50",
                              item.severity === "critical" && "text-pink-400",
                              item.severity === "warning" && "text-amber-400",
                              item.severity === "healthy" &&
                                "text-turquoise-400"
                            )}
                          >
                            <item.icon className="size-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <h3 className="text-sm font-semibold">
                              {item.title}
                            </h3>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {item.context}
                            </p>
                            <div className="flex pt-2">
                              <Link
                                href={item.route}
                                className={cn(
                                  buttonVariants({
                                    variant: "link",
                                    size: "sm",
                                  }),
                                  "h-auto p-0 text-primary"
                                )}
                              >
                                <span>{item.action}</span>
                                <ArrowRight className="ml-1 size-3 transition-transform group-hover:translate-x-1" />
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>

              {/* Blockers & Health */}
              <section className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  System Blockers
                </h2>
                <div className="overflow-x-auto rounded-xl border border-border/40 bg-card/20">
                  <table className="min-w-[720px] w-full text-left text-xs">
                    <thead className="border-b border-border/40 bg-muted/30">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-muted-foreground">
                          Component
                        </th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground">
                          Status
                        </th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground">
                          Context
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {blockerRows.map(([name, status, context]) => (
                        <tr key={name} className="hover:bg-muted/10">
                          <td className="whitespace-nowrap px-4 py-3 font-medium">
                            {name}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "border-none px-0 font-bold uppercase tracking-tighter",
                                status === "Clear" && "text-turquoise-400",
                                status === "Active" && "text-indigo-400",
                                status === "Degraded" && "text-pink-400"
                              )}
                            >
                              {status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {context}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-border/40 bg-card/40">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  <Link
                    href="/leads"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-auto flex-col items-start gap-2 py-4"
                    )}
                  >
                    <Users className="size-4 text-turquoise-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Intake Lead
                    </span>
                  </Link>
                  <Link
                    href="/quotes"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-auto flex-col items-start gap-2 py-4"
                    )}
                  >
                    <CircleDollarSign className="size-4 text-indigo-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Run Quote
                    </span>
                  </Link>
                  <Link
                    href="/campaigns/builder"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-auto flex-col items-start gap-2 py-4"
                    )}
                  >
                    <GitBranch className="size-4 text-pink-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      New Campaign
                    </span>
                  </Link>
                  <Link
                    href="/assistant"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-auto flex-col items-start gap-2 py-4"
                    )}
                  >
                    <Bot className="size-4 text-turquoise-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Tune Agent
                    </span>
                  </Link>
                </CardContent>
              </Card>

              {/* Live Radar */}
              <Card className="border-border/40 bg-card/40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Operational Awareness
                  </CardTitle>
                  <Activity className="size-4 text-muted-foreground/50" />
                </CardHeader>
                <CardContent>
                  {loadingLeads ? <LeadRadarSkeleton /> : <LeadRadar />}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
