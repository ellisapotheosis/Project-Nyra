import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  GitBranch,
  Mail,
  MessageSquare,
  PauseCircle,
  PhoneCall,
  Plus,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { campaigns, leads } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const campaignMetrics = [
  ["Enrolled leads", "1,248", "Across active and paused sequences"],
  ["Active campaigns", "8", "Two require broker review before scale-up"],
  ["Today's sends", "142", "Email, SMS, and voicemail drops"],
  ["Reply rate", "18.7%", "Refinance Blitz is outperforming baseline"],
];

const campaignCards = [
  {
    title: "Refinance Blitz",
    status: "Active",
    description: "45-day refinance sequence with rate-watch checkpoints.",
    leads: 342,
    completion: 62,
    response: 18.7,
    gate: "Quiet hours clear",
    icon: Workflow,
  },
  {
    title: "Home Equity Pro",
    status: "Completed",
    description: "30-day HELOC education and equity-access review flow.",
    leads: 187,
    completion: 100,
    response: 22.4,
    gate: "STOP audit clean",
    icon: CheckCircle2,
  },
  {
    title: "Purchase Power",
    status: "Draft",
    description: "Purchase nurture with agent referral attribution.",
    leads: 0,
    completion: 0,
    response: 0,
    gate: "Needs consent copy review",
    icon: GitBranch,
  },
  {
    title: "Past Client Nurture",
    status: "Active",
    description: "Annual mortgage review and rate-drop alert surface.",
    leads: 845,
    completion: 12,
    response: 8.2,
    gate: "CRM segment verified",
    icon: Users,
  },
];

const upcomingSteps = [
  {
    time: "Today, 10:30 AM",
    title: "Missed call plus voicemail drop",
    description: "John Doe - Refinance Blitz",
    channel: "Voice",
    icon: PhoneCall,
  },
  {
    time: "Today, 1:45 PM",
    title: "Personalized email",
    description: "Jane Smith - Purchase Power",
    channel: "Email",
    icon: Mail,
  },
  {
    time: "Tomorrow, 9:15 AM",
    title: "SMS follow-up",
    description: "Robert Brown - Home Equity Pro",
    channel: "SMS",
    icon: MessageSquare,
  },
];

function statusTone(status: string) {
  if (status === "Active") return "bg-turquoise-500/15 text-turquoise-300";
  if (status === "Draft") return "bg-pink-500/15 text-pink-300";
  return "bg-indigo-500/15 text-indigo-300";
}

export default function CampaignDashboard() {
  const pausedLeads = leads.filter((lead) => lead.campaignStatus === "PAUSED");

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 lg:px-8">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-turquoise-400">
            <Workflow className="size-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
              Campaign Control
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Campaigns
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Inspect Nyra-owned campaign logic, channel gates, reply behavior,
            pause state, and execution visibility without forcing operators into
            raw workflow JSON.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarDays className="size-4" />
            Export run log
          </Button>
          <Link href="/campaigns/builder">
            <Button size="sm" className="gap-2">
              <Plus className="size-4" />
              New campaign
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {campaignMetrics.map(([title, value, detail]) => (
          <Card key={title} className="border-border/40 bg-card/40">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Campaign cards
            </h2>
            <Badge variant="outline">{campaigns.length} seed contracts</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {campaignCards.map((campaign) => (
              <Card
                key={campaign.title}
                className="overflow-hidden border-border/40 bg-card/40"
              >
                <CardHeader className="border-b border-border/30">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge className={statusTone(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <CardTitle className="mt-3 text-xl">
                        {campaign.title}
                      </CardTitle>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {campaign.description}
                      </p>
                    </div>
                    <span className="grid size-11 place-items-center rounded-xl border border-border/40 bg-background/50 text-primary">
                      <campaign.icon className="size-5" />
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 p-5">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Leads</p>
                      <p className="mt-1 font-semibold">{campaign.leads}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Completion</p>
                      <p className="mt-1 font-semibold">
                        {campaign.completion}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Response</p>
                      <p className="mt-1 font-semibold">{campaign.response}%</p>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-background/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-turquoise-400"
                      style={{ width: `${campaign.completion}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-background/40 p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="size-4 text-turquoise-400" />
                      {campaign.gate}
                    </div>
                    <Link
                      href="/campaigns/builder/1"
                      className={cn(
                        buttonVariants({ variant: "link", size: "sm" }),
                        "h-auto p-0 text-primary"
                      )}
                    >
                      Inspect
                      <ArrowRight className="ml-1 size-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="border-border/40 bg-card/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
                <PauseCircle className="size-4 text-pink-400" />
                Paused by reply
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pausedLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-3"
                >
                  <p className="text-sm font-semibold">
                    {lead.firstName} {lead.lastName}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {lead.nextTouch}. Review before resuming automation.
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
                <Clock className="size-4 text-indigo-400" />
                Execution timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingSteps.map((step) => (
                <div key={step.title} className="flex gap-3">
                  <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-xl border border-border/40 bg-background/50 text-primary">
                    <step.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {step.time} · {step.channel}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{step.title}</p>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertTriangle className="mt-0.5 size-5 text-pink-400" />
              <p className="text-sm leading-6 text-muted-foreground">
                Campaign controls shown here represent Nyra-owned state. Vendor
                execution systems remain implementation details behind service
                boundaries.
              </p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}
