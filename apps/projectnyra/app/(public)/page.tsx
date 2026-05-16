import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Calculator,
  ChartNetwork,
  ClipboardList,
  ExternalLink,
  FileSpreadsheet,
  Gauge,
  GitBranch,
  LayoutDashboard,
  LockKeyhole,
  MessageSquareText,
  Sparkles,
  UsersRound,
  Workflow,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { applications, campaigns, crmOverview, leads } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const primarySurfaces = [
  {
    title: "Admin Console",
    href: "/admin",
    description: "Operator controls, platform status, and owner workflows.",
    icon: LayoutDashboard,
    access: "Internal",
  },
  {
    title: "Nexus UI",
    href:
      process.env.NEXT_PUBLIC_NEXUS_UI_URL ?? "https://nexus.projectnyra.com",
    description: "Router visibility for model, MCP, and agent entrypoints.",
    icon: ChartNetwork,
    access: "Access gated",
    external: true,
  },
  {
    title: "Twenty CRM",
    href:
      process.env.NEXT_PUBLIC_TWENTY_URL ?? "https://twenty.projectnyra.com",
    description: "System-of-record contact, company, loan, and activity data.",
    icon: UsersRound,
    access: "Access gated",
    external: true,
  },
  {
    title: "Mortgage CRM",
    href: "/crm",
    description: "Broker-facing CRM mirror, lead context, and pipeline views.",
    icon: FileSpreadsheet,
    access: "App route",
  },
  {
    title: "Campaign Builder",
    href: "/campaigns/builder",
    description: "Campaign drafting, channel previews, and sequence setup.",
    icon: GitBranch,
    access: "App route",
  },
  {
    title: "Assistant",
    href: "/assistant",
    description: "OpenClaw-backed workspace for lead and campaign support.",
    icon: Bot,
    access: "App route",
  },
];

const productAreas = [
  {
    title: "Leads",
    href: "/leads",
    description:
      "Lead queue, borrower records, recent activity, and follow-up state.",
    icon: ClipboardList,
  },
  {
    title: "Campaigns",
    href: "/campaigns",
    description:
      "Sequence management, active lead enrollment, and campaign analytics.",
    icon: Workflow,
  },
  {
    title: "Quotes",
    href: "/quotes",
    description:
      "Deterministic quote workflows and borrower-facing option review.",
    icon: Calculator,
  },
  {
    title: "Pipeline",
    href: "/pipeline",
    description:
      "Operational mortgage pipeline, status aging, and value snapshots.",
    icon: BarChart3,
  },
  {
    title: "Applications",
    href: "/applications",
    description:
      "Application intake, status review, and document collection handoff.",
    icon: BriefcaseBusiness,
  },
  {
    title: "OpenClaw Tools",
    href: "/tools/openclaw",
    description: "Internal proxy testing for the assistant integration.",
    icon: MessageSquareText,
  },
];

const platformLinks = [
  {
    title: "Nexus Router MCP",
    href: "https://nexus-router.projectnyra.com/mcp",
    description: "Canonical MCP endpoint for agents and tool routing.",
    icon: ChartNetwork,
  },
  {
    title: "Activepieces",
    href:
      process.env.NEXT_PUBLIC_ACTIVEPIECES_URL ??
      "https://activepieces.projectnyra.com",
    description: "Internal workflow automation surface.",
    icon: Workflow,
  },
  {
    title: "n8n",
    href: process.env.NEXT_PUBLIC_N8N_URL ?? "https://n8n.projectnyra.com",
    description: "Automation glue, callbacks, and operational workflows.",
    icon: GitBranch,
  },
  {
    title: "OpenLIT",
    href: "https://openlit.projectnyra.com",
    description: "Owner-only observability for traces and LLM telemetry.",
    icon: Gauge,
  },
  {
    title: "Grafana",
    href: "https://grafana.projectnyra.com",
    description: "Monitoring dashboards for the platform stack.",
    icon: BarChart3,
  },
  {
    title: "RateHunter Landing",
    href: "https://ratehunter.net",
    description: "Personal mortgage brokerage website, separate from Nyra.",
    icon: ExternalLink,
  },
];

const kpis = [
  { label: "Active leads", value: `${leads.length}` },
  { label: "Live campaigns", value: `${campaigns.length}` },
  { label: "Applications", value: `${applications.length}` },
  { label: "Pipeline value", value: crmOverview.pipelineValue },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid min-h-[520px] gap-8 py-4 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-8">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
            projectnyra.com
          </p>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
              Project Nyra is the canonical home for the mortgage automation
              platform.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Use this landing page as the launch point for the broker app,
              admin console, Nexus router UI, CRM surfaces, campaign builder,
              assistant workspace, and protected platform tools.{" "}
              <code>ratehunter.net</code> stays reserved for the personal
              mortgage brokerage landing page only.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className={cn(buttonVariants({}))}>
              Open Admin
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/campaigns/builder"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Campaign Builder
            </Link>
            <Link
              href={
                process.env.NEXT_PUBLIC_NEXUS_UI_URL ??
                "https://nexus.projectnyra.com"
              }
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              Nexus UI
              <ExternalLink className="size-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-lg border border-border/60 bg-card/70 px-4 py-3 shadow-sm"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
          <Image
            src="/branding/webapp/dashboard-logo.png"
            alt="Project Nyra dashboard preview"
            width={760}
            height={520}
            priority
            className="h-auto w-full object-cover p-8"
          />
          <div className="border-t border-border/70 bg-background/80 px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LockKeyhole className="size-4 text-primary" />
              Protected tools should stay behind Cloudflare Access and use
              projectnyra.com hostnames.
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
              Launch Surface
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Core app and control-plane entrypoints
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            These are the links that should hang off the public Project Nyra
            landing page. Internal and owner-only tools remain access-gated at
            Cloudflare, auth, or the service layer.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {primarySurfaces.map(
            ({ title, href, description, icon: Icon, access, external }) => (
              <Link
                key={href}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
              >
                <Card className="h-full border-border/70 bg-card/80 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-3 text-xl">
                      <span className="flex items-center gap-2">
                        <Icon className="size-5 text-primary" />
                        {title}
                      </span>
                      {external ? (
                        <ExternalLink className="mt-1 size-4 text-muted-foreground" />
                      ) : null}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                    <span className="inline-flex rounded-full border border-border/70 px-2.5 py-1 text-xs text-muted-foreground">
                      {access}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            )
          )}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
            Product Routes
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Broker workspace pages
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            These routes live inside `apps/projectnyra` and should be available
            from the main app shell and Project Nyra landing page.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {productAreas.map(({ title, href, description, icon: Icon }) => (
            <Link key={href} href={href}>
              <Card className="h-full border-border/70 bg-card/80 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Icon className="size-5 text-primary" />
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
            Protected Platform
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            projectnyra.com service links
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {platformLinks.map(({ title, href, description, icon: Icon }) => (
            <Link key={href} href={href} target="_blank" rel="noreferrer">
              <Card className="h-full border-border/70 bg-card/80 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-3 text-xl">
                    <span className="flex items-center gap-2">
                      <Icon className="size-5 text-primary" />
                      {title}
                    </span>
                    <ExternalLink className="mt-1 size-4 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Card className="border-border/70 bg-card/80">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
              Domain Boundary
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              RateHunter stays personal. Project Nyra owns the platform.
            </h2>
          </div>
          <div className="flex max-w-xl items-center gap-2 text-sm leading-6 text-muted-foreground">
            <Sparkles className="size-4 text-primary" />
            Do not attach MCP servers, app dashboards, CRM tools, workers, or
            admin services to ratehunter.net.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
