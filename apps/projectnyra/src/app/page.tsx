"use client";

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

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { applications, campaigns, crmOverview, leads } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const commandStats = [
  {
    label: "New leads",
    value: "12",
    detail: "4 hot, 3 need same-day follow-up",
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
    "Discord alerts",
    "Ready",
    "Operator notification route is configured for review-required events.",
  ],
  [
    "OpenClaw tools",
    "Guarded",
    "Drafting and summarization enabled; direct CRM mutation remains blocked.",
  ],
];

const pipelineMovement = [
  ["Lead capture", 12, "RateHunter intake and referral traffic"],
  [
    "Qualified",
    leads.filter((lead) => lead.stage === "Qualified").length,
    "Consent and scenario verified",
  ],
  ["Application", applications.length, "Docs and loan milestones active"],
  ["Broker review", 5, "Replies, quotes, or compliance need action"],
];

const assistantTools = [
  "Lead lookup",
  "Timeline summary",
  "Quote-readiness check",
  "Campaign assist",
  "Draft note",
  "Escalation brief",
];

function statusClass(status: string) {
  if (status === "Clear" || status === "Ready") {
    return "border-turquoise-400/30 bg-turquoise-400/10 text-turquoise-300";
  }

  if (status === "Degraded") {
    return "border-pink-400/35 bg-pink-400/10 text-pink-300";
  }

  return "border-indigo-400/30 bg-indigo-400/10 text-indigo-300";
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-[1600px] gap-8 px-5 py-8 lg:px-8">
        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="overflow-hidden rounded-3xl border border-indigo-500/20 bg-card/50 shadow-2xl">
            <div className="grid gap-8 p-6 lg:grid-cols-[1fr_0.72fr] lg:p-8">
              <div className="space-y-7">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="rounded-full bg-indigo-500/15 px-3 py-1 text-[10px] font-black uppercase text-indigo-200">
                    Broker Command Deck
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-turquoise-400/25 bg-turquoise-400/8 px-3 py-1 text-[10px] font-black uppercase text-turquoise-300"
                  >
                    System truth first
                  </Badge>
                </div>

                <div>
                  <h1 className="max-w-4xl text-4xl font-black uppercase leading-none tracking-normal text-balance md:text-6xl">
                    Prioritize the mortgage work that needs Ellis now.
                  </h1>
                  <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                    One operator surface for hot leads, replies, quote locks,
                    campaign gates, pipeline movement, CRM sync health, and
                    assistant-mediated work that stays inside approval and audit
                    boundaries.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/leads"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "rounded-xl bg-indigo-600 px-6 font-black uppercase text-white hover:bg-indigo-500"
                    )}
                  >
                    Work hot leads
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/assistant"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "rounded-xl border-turquoise-400/25 bg-turquoise-400/8 px-6 font-black uppercase text-turquoise-200 hover:bg-turquoise-400/12"
                    )}
                  >
                    Ask Nyra
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 rounded-2xl border border-border/50 bg-background/35 p-4">
                {priorityQueue.map((item) => (
                  <Link
                    key={item.title}
                    href={item.route}
                    className="rounded-2xl border border-border/45 bg-card/55 p-4 transition hover:border-indigo-400/50 hover:bg-indigo-500/8"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                          item.severity === "critical"
                            ? "border-pink-400/30 bg-pink-400/10 text-pink-300"
                            : item.severity === "warning"
                              ? "border-indigo-400/30 bg-indigo-400/10 text-indigo-300"
                              : "border-turquoise-400/30 bg-turquoise-400/10 text-turquoise-300"
                        )}
                      >
                        <item.icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black uppercase leading-5">
                          {item.title}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          {item.context}
                        </p>
                        <p className="mt-3 text-[10px] font-black uppercase text-indigo-300">
                          {item.action}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Card className="border-pink-400/25 bg-card/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase text-pink-300">
                <AlertTriangle className="size-4" />
                Blockers and health
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {blockerRows.map(([label, status, detail]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border/45 bg-background/35 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black uppercase">{label}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full text-[10px]",
                        statusClass(status)
                      )}
                    >
                      {status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {detail}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {commandStats.map((stat) => (
            <Card key={stat.label} className="border-border/55 bg-card/55">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-4xl font-black tracking-normal">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={cn("size-5", stat.tone)} />
                </div>
                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  {stat.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-border/55 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
                <GitBranch className="size-4 text-turquoise-300" />
                Pipeline movement
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {pipelineMovement.map(([label, count, detail]) => (
                <div
                  key={label}
                  className="grid gap-3 rounded-2xl border border-border/45 bg-background/30 p-4 sm:grid-cols-[10rem_1fr_auto] sm:items-center"
                >
                  <p className="text-sm font-black uppercase">{label}</p>
                  <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-turquoise-400 to-pink-400"
                      style={{
                        width: `${Math.min(Number(count) * 8 + 18, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xl font-black">{count}</p>
                    <p className="text-xs text-muted-foreground">{detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-indigo-400/25 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
                <Bot className="size-4 text-indigo-300" />
                Assistant and tool wrapper status
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
              <div className="rounded-2xl border border-indigo-400/25 bg-indigo-500/8 p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-turquoise-300" />
                  <p className="text-sm font-black uppercase">
                    Approval gates visible
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Nyra can summarize, draft, and navigate. Sensitive outreach
                  and CRM mutations stay behind broker approval and audit
                  logging.
                </p>
                <Link href="/tools/openclaw">
                  <Button className="mt-5 w-full rounded-xl bg-indigo-600 font-black uppercase hover:bg-indigo-500">
                    Open tool surface
                  </Button>
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {assistantTools.map((tool) => (
                  <div
                    key={tool}
                    className="rounded-2xl border border-border/45 bg-background/30 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-turquoise-300" />
                      <p className="text-xs font-black uppercase">{tool}</p>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Scoped utility, no uncontrolled direct-write power.
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border/55 bg-card/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
                <RadioTower className="size-4 text-pink-300" />
                Live radar
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {leads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="grid gap-3 rounded-2xl border border-border/45 bg-background/30 p-4 transition hover:border-turquoise-400/35 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-black uppercase">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {lead.loanPurpose} · {lead.source} · {lead.location}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Badge variant="outline" className="rounded-full">
                      {lead.campaignStatus}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-full border-turquoise-400/30 text-turquoise-300"
                    >
                      {lead.stage}
                    </Badge>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/55 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
                <Activity className="size-4 text-turquoise-300" />
                Campaign performance
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {campaigns.map((campaign, index) => (
                <div
                  key={campaign.id}
                  className="rounded-2xl border border-border/45 bg-background/30 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black uppercase">
                      {campaign.name}
                    </p>
                    <Badge
                      variant="outline"
                      className="rounded-full border-indigo-400/30 text-indigo-300"
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {campaign.enrolled} enrolled · {18 + index * 4}% reply ·
                    quiet-hours gate active
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <footer className="flex flex-col gap-3 border-t border-border/40 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>
            Project Nyra · broker command center · app.projectnyra.com
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarClock className="size-4 text-indigo-300" />
            Cached demo contracts shown when services are disconnected.
          </span>
        </footer>
      </main>
    </div>
  );
}
