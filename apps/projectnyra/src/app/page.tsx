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
  MessageSquareReply,
  RadioTower,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { LeadRadar } from "@/components/leads/lead-radar";
import { Badge } from "@/components/ui/badge";
import {
  CommandStatsSkeleton,
  PriorityQueueSkeleton,
  LeadRadarSkeleton,
} from "@/components/ui/dashboard-skeleton";
import {
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nyra/ui";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { SystemAlerts } from "@/components/dashboard/system-alerts";
import { useApi } from "@/lib/api/hooks";
import { getCrmWorkspaceSnapshot } from "@/lib/api/workspace";
import { cn } from "@/lib/utils";
export default function Home() {
  const {
    data: workspaceResponse,
    isLoading: loadingWorkspace,
    execute: fetchWorkspace,
  } = useApi(getCrmWorkspaceSnapshot);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const workspace = workspaceResponse?.workspace;

  const priorityQueue = (workspace?.operations.nextBestActions ?? []).map(
    (item) => ({
      ...item,
      icon: item.id.startsWith("compliance")
        ? ShieldAlert
        : item.id.startsWith("campaign")
          ? Workflow
          : FileClock,
    })
  );

  const commandStats = [
    {
      label: "Total Leads",
      value: workspace?.crmOverview.activeLeads.toString() ?? "0",
      detail: `${workspace?.leads.length ?? 0} active in CRM`,
      icon: Users,
      tone: "text-turquoise-400",
    },
    {
      label: "Pipeline Value",
      value: workspace?.crmOverview.pipelineValue ?? "$0.0M",
      detail: `${workspace?.applications.length ?? 0} active files`,
      icon: TrendingUp,
      tone: "text-indigo-400",
    },
    {
      label: "Active Applications",
      value: workspace?.crmOverview.activeApplications.toString() ?? "0",
      detail: workspace?.crmOverview.averageCycle ?? "14 Days Avg",
      icon: FileClock,
      tone: "text-pink-400",
    },
    {
      label: "Conversion Rate",
      value: workspace?.crmOverview.conversionRate ?? "0%",
      detail: "Qualified / Total",
      icon: CheckCircle2,
      tone: "text-turquoise-400",
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
      workspace?.source === "mock" ? "Degraded" : "Active",
      workspace?.operations.syncWarnings[0] ||
        "Twenty mirror is synchronized with crm-api.",
    ],
    [
      "Assistant safety",
      "Active",
      "Token verification and HITL approval gates are enforced for all tools.",
    ],
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-10">
        {/* Header Section */}
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <RadioTower className="size-4 animate-pulse text-turquoise-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-turquoise-400">
                Live System Status
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              Broker Command Deck
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Button
              variant="glass"
              size="sm"
              className="h-9 gap-2 px-3 border-white/10"
            >
              <Activity className="size-4" />
              <span className="truncate">Diagnostics</span>
            </Button>
            <Button size="sm" className="h-9 gap-2 px-3">
              <Sparkles className="size-4" />
              <span className="truncate">Ask Nyra</span>
            </Button>
          </div>
        </section>

        {/* Stats Grid */}
        <section>
          {loadingWorkspace ? (
            <CommandStatsSkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {commandStats.map((stat) => (
                <Card
                  key={stat.label}
                  variant="glass"
                  className="bg-white/5 border-white/5"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                      {stat.label}
                    </CardTitle>
                    <stat.icon className={cn("size-4", stat.tone)} />
                  </CardHeader>
                  <CardContent className="px-6">
                    <div className="text-2xl font-black text-white">
                      {stat.value}
                    </div>
                    <p className="mt-1 text-[10px] text-white/30 font-medium uppercase tracking-wider">
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
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Priority Queue
                </h2>
                <Badge
                  variant="glass"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {priorityQueue.length} items
                </Badge>
              </div>
              {loadingWorkspace ? (
                <PriorityQueueSkeleton />
              ) : priorityQueue.length === 0 ? (
                <Card variant="glass" className="bg-white/5 border-white/5">
                  <CardContent className="p-6 text-sm text-white/40">
                    No priority CRM actions are pending from the current
                    workspace snapshot.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {priorityQueue.map((item) => (
                    <Card
                      key={item.title}
                      variant="glass"
                      className="group bg-white/5 border-white/5 hover:bg-white/10 transition-all duration-300"
                    >
                      <CardContent className="flex items-start gap-4 p-5 px-6">
                        <div
                          className={cn(
                            "mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-xl transition-transform group-hover:scale-110",
                            item.severity === "high" &&
                              "text-pink-400 border-pink-500/20",
                            item.severity === "medium" &&
                              "text-amber-400 border-amber-500/20",
                            item.severity === "low" &&
                              "text-turquoise-400 border-turquoise-500/20"
                          )}
                        >
                          <item.icon className="size-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3 className="text-sm font-bold text-white/90">
                            {item.title}
                          </h3>
                          <p className="text-xs leading-relaxed text-white/40">
                            {item.detail}
                          </p>
                          <div className="flex pt-3">
                            <Link
                              href={item.href}
                              className={cn(
                                buttonVariants({
                                  variant: "link",
                                  size: "sm",
                                }),
                                "h-auto p-0 text-primary font-bold uppercase tracking-widest text-[10px]"
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
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-1">
                System Blockers
              </h2>
              <div className="overflow-x-auto rounded-[24px] border border-white/5 bg-white/5 backdrop-blur-xl">
                <table className="min-w-[720px] w-full text-left text-xs">
                  <thead className="border-b border-white/5 bg-white/5">
                    <tr>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-white/30 text-[9px]">
                        Component
                      </th>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-white/30 text-[9px]">
                        Status
                      </th>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-white/30 text-[9px]">
                        Context
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {blockerRows.map(([name, status, context]) => (
                      <tr
                        key={name}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="whitespace-nowrap px-6 py-4 font-bold text-white/70 uppercase tracking-tighter">
                          {name}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "border-none px-0 font-black uppercase tracking-tighter text-[11px]",
                              status === "Clear" && "text-turquoise-400",
                              status === "Active" && "text-indigo-400",
                              status === "Degraded" && "text-pink-400"
                            )}
                          >
                            {status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-white/40 font-medium">
                          {context}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Merged Feature: Recent Activity from Admin App */}
            <RecentActivity />
          </div>

          <div className="space-y-6">
            {/* System Alerts from Admin App */}
            <SystemAlerts />

            {/* Quick Actions */}
            <Card variant="glass" className="bg-white/5 border-white/5">
              <CardHeader className="px-6">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 px-6">
                <Button
                  variant="glass"
                  className="h-auto flex-col items-start gap-3 py-5 rounded-2xl border-white/5 hover:bg-white/10"
                >
                  <Users className="size-5 text-turquoise-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Intake Lead
                  </span>
                </Button>
                <Button
                  variant="glass"
                  className="h-auto flex-col items-start gap-3 py-5 rounded-2xl border-white/5 hover:bg-white/10"
                >
                  <CircleDollarSign className="size-5 text-indigo-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Run Quote
                  </span>
                </Button>
                <Button
                  variant="glass"
                  className="h-auto flex-col items-start gap-3 py-5 rounded-2xl border-white/5 hover:bg-white/10"
                >
                  <GitBranch className="size-5 text-pink-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    New Campaign
                  </span>
                </Button>
                <Button
                  variant="glass"
                  className="h-auto flex-col items-start gap-3 py-5 rounded-2xl border-white/5 hover:bg-white/10"
                >
                  <Bot className="size-5 text-turquoise-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Tune Agent
                  </span>
                </Button>
              </CardContent>
            </Card>

            {/* Live Radar */}
            <Card variant="glass" className="bg-white/5 border-white/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-6">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Operational Awareness
                </CardTitle>
                <Activity className="size-4 text-white/20" />
              </CardHeader>
              <CardContent className="px-6">
                {loadingWorkspace ? <LeadRadarSkeleton /> : <LeadRadar />}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
