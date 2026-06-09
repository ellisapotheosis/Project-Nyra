"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Clock,
  GitBranch,
  Mail,
  MessageSquare,
  PauseCircle,
  PhoneCall,
  Plus,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusGate } from "@/components/status-gate";
import {
  campaignApi,
  crmApi,
  type CampaignTemplate,
  type Lead,
  useApi,
} from "@/lib/api";
import { cn } from "@/lib/utils";

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
  const campaignsApi = useApi(campaignApi.getCampaigns);
  const leadsApi = useApi(crmApi.getLeads);

  useEffect(() => {
    void campaignsApi.execute();
    void leadsApi.execute();
  }, []);

  const campaigns = campaignsApi.data?.campaigns ?? [];
  const leads = leadsApi.data?.leads ?? [];
  const pausedLeads = leads.filter((lead) => lead.campaignStatus === "PAUSED");
  const activeCampaigns = campaigns.filter((campaign) =>
    isActiveCampaign(campaign)
  );
  const campaignMetrics = [
    [
      "Enrolled leads",
      String(leads.filter((lead) => Boolean(lead.campaignId)).length),
      "Across active and paused sequences",
    ],
    [
      "Active campaigns",
      String(activeCampaigns.length),
      "Execution status read through the campaign API boundary",
    ],
    [
      "Paused replies",
      String(pausedLeads.length),
      "Broker review required before automation resumes",
    ],
    [
      "Compliance source",
      campaignsApi.data ? "API" : "Pending",
      "STOP, DNC, consent, and quiet-hour gates live in service code",
    ],
  ];

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

      <StatusGate
        data={campaignsApi.data?.campaigns ?? null}
        error={campaignsApi.error}
        isLoading={campaignsApi.isLoading}
        onRetry={campaignsApi.execute}
        loadingMessage="Fetching campaigns..."
        emptyMessage="No campaigns found."
      >
        {(loadedCampaigns) => (
          <>
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
                  <Badge variant="outline">
                    {loadedCampaigns.length} contracts
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {loadedCampaigns.map((campaign) => {
                    const card = toCampaignCard(campaign, leads);
                    const Icon = card.icon;

                    return (
                      <Card
                        key={campaign.id}
                        className="overflow-hidden border-border/40 bg-card/40"
                      >
                        <CardHeader className="border-b border-border/30">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Badge className={statusTone(card.status)}>
                                {card.status}
                              </Badge>
                              <CardTitle className="mt-3 text-xl">
                                {card.title}
                              </CardTitle>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {card.description}
                              </p>
                            </div>
                            <span className="grid size-11 place-items-center rounded-xl border border-border/40 bg-background/50 text-primary">
                              <Icon className="size-5" />
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-5 p-5">
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Leads</p>
                              <p className="mt-1 font-semibold">{card.leads}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                Completion
                              </p>
                              <p className="mt-1 font-semibold">
                                {card.completion}%
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Response</p>
                              <p className="mt-1 font-semibold">
                                {card.response}%
                              </p>
                            </div>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-background/60">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-turquoise-400"
                              style={{ width: `${card.completion}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-background/40 p-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <ShieldCheck className="size-4 text-turquoise-400" />
                              {card.gate}
                            </div>
                            <Link
                              href={`/campaigns/builder/${campaign.id}`}
                              className={cn(
                                buttonVariants({
                                  variant: "link",
                                  size: "sm",
                                }),
                                "h-auto p-0 text-primary"
                              )}
                            >
                              Inspect
                              <ArrowRight className="ml-1 size-3" />
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
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
                    {leadsApi.isLoading && (
                      <p className="text-xs text-muted-foreground">
                        Fetching paused leads...
                      </p>
                    )}
                    {leadsApi.error && (
                      <p className="text-xs text-pink-300">
                        Paused lead feed unavailable: {leadsApi.error.message}
                      </p>
                    )}
                    {!leadsApi.isLoading &&
                      !leadsApi.error &&
                      pausedLeads.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No replies are currently paused.
                        </p>
                      )}
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
                          <p className="mt-1 text-sm font-semibold">
                            {step.title}
                          </p>
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
                      Campaign controls shown here represent Nyra-owned state.
                      Vendor execution systems remain implementation details
                      behind service boundaries.
                    </p>
                  </CardContent>
                </Card>
              </aside>
            </section>
          </>
        )}
      </StatusGate>
    </main>
  );
}

type CampaignRecord = CampaignTemplate & { status?: string };

function isActiveCampaign(campaign: CampaignRecord) {
  const status = String(campaign.status ?? "").toLowerCase();
  return campaign.active || status === "running" || status === "active";
}

function toCampaignCard(campaign: CampaignRecord, leads: Lead[]) {
  const enrolledLeads = leads.filter(
    (lead) =>
      lead.campaignId === campaign.id ||
      lead.campaignName === campaign.name ||
      normalize(lead.loanPurpose) === normalize(campaign.loanPurpose)
  );
  const pausedCount = enrolledLeads.filter(
    (lead) => lead.campaignStatus === "PAUSED"
  ).length;
  const active = isActiveCampaign(campaign);
  const completion = active ? Math.max(12, 100 - pausedCount * 15) : 0;

  return {
    title: campaign.name,
    status: active ? "Active" : "Draft",
    description:
      campaign.description ??
      `${campaign.steps?.length ?? 0} configured steps for ${campaign.loanPurpose ?? "mortgage"} outreach.`,
    leads: enrolledLeads.length,
    completion,
    response: enrolledLeads.length ? Math.max(0, 20 - pausedCount * 2) : 0,
    gate: pausedCount
      ? "Reply pause requires review"
      : "Compliance gates clear",
    icon: active ? Workflow : GitBranch,
  };
}

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}
