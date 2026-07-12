import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarClock,
  ContactRound,
  FileText,
  Gauge,
  Landmark,
  MessagesSquare,
  ShieldCheck,
  Target,
  Users,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCrmWorkspaceData, type WorkspaceData } from "@/lib/crm-data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getStageCounts(leads: WorkspaceData["leads"]) {
  return leads.reduce<Record<string, number>>((counts, lead) => {
    const stage = lead.stage || "New";
    counts[stage] = (counts[stage] ?? 0) + 1;
    return counts;
  }, {});
}

function getCampaignCounts(leads: WorkspaceData["leads"]) {
  return leads.reduce<Record<string, number>>((counts, lead) => {
    const status = lead.campaignStatus || "UNKNOWN";
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});
}

export default async function CrmPage() {
  const { leads, applications, crmOverview, recentActivity, source } =
    await getCrmWorkspaceData();
  const pipelineValue = applications.reduce(
    (sum, application) => sum + application.amount,
    0
  );
  const stageCounts = getStageCounts(leads);
  const campaignCounts = getCampaignCounts(leads);
  const topLeads = leads.slice(0, 5);
  const topApplications = applications.slice(0, 4);
  const activeCampaigns =
    (campaignCounts.ACTIVE ?? 0) + (campaignCounts.Running ?? 0);
  const pausedCampaigns =
    (campaignCounts.PAUSED ?? 0) + (campaignCounts.Paused ?? 0);

  const kpis = [
    {
      label: "Pipeline",
      value: pipelineValue
        ? compactCurrency(pipelineValue)
        : crmOverview.pipelineValue,
      detail: `${applications.length} active files`,
      icon: Landmark,
    },
    {
      label: "Leads",
      value: `${leads.length}`,
      detail: `${Object.keys(stageCounts).length} active stages`,
      icon: Users,
    },
    {
      label: "Conversion",
      value: crmOverview.conversionRate,
      detail: "Qualified to application",
      icon: Target,
    },
    {
      label: "Cycle",
      value: crmOverview.averageCycle,
      detail: "Oldest open file",
      icon: CalendarClock,
    },
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5 rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              Mortgage CRM
            </Badge>
            <Badge variant="outline" className="rounded-full">
              Source: {source}
            </Badge>
          </div>
          <div className="space-y-3">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance">
              Mortgage CRM command center for leads, files, campaigns,
              compliance, and quote handoffs.
            </h1>
            <p className="max-w-3xl text-muted-foreground">
              Twenty remains the system of record while this workspace keeps
              broker operations focused on the next compliant action.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/leads" className={cn(buttonVariants({}))}>
              Open Lead Desk
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/quotes"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Quote Desk
            </Link>
            <Link
              href="/campaigns"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Campaigns
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Compliance posture
                </p>
                <p className="mt-2 text-2xl font-semibold">Guarded outreach</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <ShieldCheck className="size-6" />
              </div>
            </div>
            <div className="mt-5 grid gap-2 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-3 py-2">
                <span className="text-muted-foreground">
                  STOP / DNC enforcement
                </span>
                <Badge variant="secondary">Required</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-3 py-2">
                <span className="text-muted-foreground">Quote terms</span>
                <Badge variant="outline">Service-owned</Badge>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Campaign load
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {activeCampaigns} active
                </p>
              </div>
              <div className="rounded-full bg-accent p-3 text-accent-foreground">
                <Workflow className="size-6" />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="size-4 text-destructive" />
              {pausedCampaigns} paused for broker review
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, detail, icon: Icon }) => (
          <Card key={label} className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="size-5 text-primary" />
              Pipeline Stages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stageCounts).map(([stage, count]) => {
              const width = leads.length
                ? Math.max(12, Math.round((count / leads.length) * 100))
                : 0;
              return (
                <div key={stage} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{stage}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessagesSquare className="size-5 text-primary" />
              Live Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity}
                className="flex gap-3 rounded-xl border border-border/60 bg-background/50 p-3"
              >
                <Activity className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">{activity}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <ContactRound className="size-5 text-primary" />
              Priority Leads
            </CardTitle>
            <Link
              href="/leads"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              View all
              <ArrowRight className="size-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {topLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="grid gap-3 rounded-xl border border-border/60 bg-background/50 p-4 transition hover:border-primary/40 hover:bg-background sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <Badge variant="outline">{lead.stage}</Badge>
                    <Badge
                      variant={
                        lead.campaignStatus === "ACTIVE"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {lead.campaignStatus}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {lead.loanPurpose} • {lead.location} • {lead.source}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold">{currency(lead.loanAmount)}</p>
                  <p className="text-sm text-muted-foreground">
                    {lead.creditBand}
                  </p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Application Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topApplications.map((application) => (
              <div
                key={application.id}
                className="rounded-xl border border-border/60 bg-background/50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{application.borrower}</p>
                    <p className="text-sm text-muted-foreground">
                      {application.product}
                    </p>
                  </div>
                  <Badge variant="outline">{application.status}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Loan</p>
                    <p className="font-medium">
                      {currency(application.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Updated</p>
                    <p className="font-medium">
                      {formatDate(application.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "CRM Boundary",
            value: "Twenty",
            detail: "System of record",
            icon: Banknote,
          },
          {
            label: "Quote Authority",
            value: "Quote API",
            detail: "Deterministic scenarios",
            icon: BadgeCheck,
          },
          {
            label: "Assistant Surface",
            value: "OpenClaw",
            detail: "Proposed actions only",
            icon: MessagesSquare,
          },
        ].map(({ label, value, detail, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm"
          >
            <Icon className="size-5 text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
