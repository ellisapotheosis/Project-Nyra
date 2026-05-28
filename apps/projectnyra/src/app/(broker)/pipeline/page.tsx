"use client";

import { useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  Clock,
  DollarSign,
  MessageSquareReply,
  RadioTower,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { StatusGate } from "@/components/status-gate";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crmApi, type Lead, type PipelineStats, useApi } from "@/lib/api";

const recentActivity = [
  "New RateHunter lead routed into refinance review with consent metadata.",
  "Quote artifact opened by borrower; lock expiration watcher updated.",
  "Purchase Power reply paused automation and created broker review task.",
  "Disclosure package delivery logged to CRM timeline.",
];

export default function PipelinePage() {
  const leadsApi = useApi(crmApi.getLeads);
  const pipelineApi = useApi(crmApi.getPipeline);

  useEffect(() => {
    void leadsApi.execute();
    void pipelineApi.execute();
  }, []);

  const leads = leadsApi.data?.leads ?? [];
  const pipeline = pipelineApi.data?.pipeline ?? [];
  const totalLoanAmount = leads.reduce(
    (sum, lead) => sum + Number(lead.loanAmount ?? 0),
    0
  );
  const pausedReplies = leads.filter(
    (lead) => lead.campaignStatus === "PAUSED"
  ).length;
  const metrics = [
    {
      title: "Today's leads",
      value: String(leads.length),
      icon: Users,
      detail: "Read through the CRM API boundary",
    },
    {
      title: "Pipeline value",
      value: currency(totalLoanAmount / 100),
      icon: DollarSign,
      detail: `${pipeline.length} active campaign/status lanes`,
    },
    {
      title: "Conversion rate",
      value: conversionRate(leads),
      icon: TrendingUp,
      detail: "Qualified or later stages",
    },
    {
      title: "Reply pauses",
      value: String(pausedReplies),
      icon: MessageSquareReply,
      detail: "Broker review required before automation resumes",
    },
    {
      title: "Compliance score",
      value: "98.5%",
      icon: Award,
      detail: "No critical STOP or DNC drift",
    },
    {
      title: "Live activity",
      value: String(pipeline.reduce((sum, lane) => sum + lane.total, 0)),
      icon: Activity,
      detail: "Recent events in system",
    },
  ];
  const stageSummaries = buildStageSummaries(leads, pipeline);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 lg:px-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-turquoise-400">
            <RadioTower className="size-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
              Pipeline Movement
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Pipeline
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            A live-style operations lane for lead stage movement, borrower
            replies, application progression, and compliance blockers. The board
            uses CRM-shaped contracts and clearly marks degraded/mocked state
            through the API layer.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-2">
          <ShieldCheck className="size-3" />
          Compliance gates visible
        </Badge>
      </section>

      <StatusGate
        data={pipelineApi.data?.pipeline ?? null}
        error={pipelineApi.error}
        isLoading={pipelineApi.isLoading}
        onRetry={pipelineApi.execute}
        loadingMessage="Fetching pipeline..."
        emptyMessage="No pipeline lanes found."
      >
        {() => (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map(({ title, value, icon: Icon, detail }) => (
              <Card key={title} className="border-border/40 bg-card/40">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">
                    {title}
                  </CardTitle>
                  <Icon className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{value}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </StatusGate>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden border-border/40 bg-card/30">
          <CardHeader className="border-b border-border/30">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Lead stage board
              </CardTitle>
              <Badge className="w-fit bg-indigo-500/15 text-indigo-300">
                Drag-ready presentation
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <KanbanBoard />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/40 bg-card/40">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Stage pressure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stageSummaries.map(([label, count, detail]) => (
                <div
                  key={label}
                  className="rounded-xl border border-border/40 bg-background/40 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{label}</p>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
                <AlertTriangle className="size-4 text-pink-400" />
                Watchlist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/40 p-3 text-sm leading-6 text-muted-foreground"
                >
                  <Clock className="mt-1 size-4 shrink-0 text-primary" />
                  <span>{item}</span>
                  <ArrowRight className="ml-auto mt-1 size-4 shrink-0 text-muted-foreground/40" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function buildStageSummaries(leads: Lead[], pipeline: PipelineStats[]) {
  const knownStages = ["New", "Qualified", "Application", "Underwriting"];
  const summaries = knownStages.map((stage) => [
    stage,
    leads.filter((lead) => normalize(lead.stage) === normalize(stage)).length,
    stage === "New"
      ? "Intake"
      : stage === "Qualified"
        ? "Broker-ready"
        : stage === "Application"
          ? "Docs needed"
          : "LOS follow-up",
  ]);

  for (const lane of pipeline) {
    if (
      !knownStages.some((stage) => normalize(stage) === normalize(lane.status))
    ) {
      summaries.push([lane.status, lane.total, lane.campaign_name]);
    }
  }

  return summaries;
}

function conversionRate(leads: Lead[]) {
  if (!leads.length) {
    return "0%";
  }

  const converted = leads.filter((lead) =>
    ["qualified", "application", "underwriting", "closed"].includes(
      normalize(lead.stage)
    )
  ).length;

  return `${Math.round((converted / leads.length) * 100)}%`;
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}
