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

import { PipelineSankey } from "@/components/PipelineSankey";
import { PresenceCursors } from "@/components/ui/presence-cursors";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { RateWall } from "@/components/rate-wall";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { LeadScoreRing } from "@/components/ui/lead-score-ring";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { applications, crmOverview, leads } from "@/lib/mock-data";
import { SpeedDialFAB } from "@/components/ui/speed-dial-fab";

const metrics = [
  {
    title: "Today's leads",
    value: "12",
    icon: Users,
    detail: "+8% from last week",
  },
  {
    title: "Pipeline value",
    value: crmOverview.pipelineValue,
    icon: DollarSign,
    detail: `${applications.length} active loan files`,
  },
  {
    title: "Conversion rate",
    value: crmOverview.conversionRate,
    icon: TrendingUp,
    detail: `${crmOverview.averageCycle} average cycle`,
  },
  {
    title: "Reply pauses",
    value: "2",
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
    value: "24",
    icon: Activity,
    detail: "Recent events in system",
  },
];

const stageSummaries = [
  ["New", leads.filter((lead) => lead.stage === "New").length, "Intake"],
  [
    "Qualified",
    leads.filter((lead) => lead.stage === "Qualified").length,
    "Broker-ready",
  ],
  [
    "Application",
    leads.filter((lead) => lead.stage === "Application").length,
    "Docs needed",
  ],
  ["Underwriting", applications.length, "LOS follow-up"],
];

const recentActivity = [
  "New RateHunter lead routed into refinance review with consent metadata.",
  "Quote artifact opened by borrower; lock expiration watcher updated.",
  "Purchase Power reply paused automation and created broker review task.",
  "Disclosure package delivery logged to CRM timeline.",
];

export default function PipelinePage() {
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
              <div className="text-3xl font-semibold">
                {typeof value === "string" &&
                /^[\d,]+$/.test(
                  value.replace(/[$%]/g, "").replace(/,/g, "")
                ) ? (
                  <AnimatedCounter
                    value={parseFloat(
                      value.replace(/[$,%]/g, "").replace(/,/g, "")
                    )}
                    prefix={value.startsWith("$") ? "$" : ""}
                    suffix={value.endsWith("%") ? "%" : ""}
                  />
                ) : (
                  value
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Live Market Rates
        </h2>
        <RateWall />
      </section>

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

      <section className="mt-8">
        <PipelineSankey />
      </section>
      <PresenceCursors roomId="pipeline" />
      <SpeedDialFAB />
    </main>
  );
}
