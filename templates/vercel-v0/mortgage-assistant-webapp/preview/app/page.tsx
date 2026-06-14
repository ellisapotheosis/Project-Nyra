import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Bot, BriefcaseBusiness, Calculator, FileSpreadsheet, Sparkles, Workflow } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { applications, campaigns, crmOverview, leads } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const modules = [
  {
    title: "Nyra Assistant",
    href: "/assistant",
    description: "Lead context, communication summaries, and action prompts from one chat surface.",
    icon: Bot,
  },
  {
    title: "Campaigns",
    href: "/campaigns",
    description: "Sequence management, active lead enrollment, and campaign analytics.",
    icon: Workflow,
  },
  {
    title: "Quote Desk",
    href: "/quotes",
    description: "Rate watch, product views, and quote workflow components migrated from admin.",
    icon: Calculator,
  },
  {
    title: "CRM Mirror",
    href: "/crm",
    description: "Twenty-backed lead, application, and pipeline overview pages inside the main webapp.",
    icon: FileSpreadsheet,
  },
  {
    title: "OpenClaw Tooling",
    href: "/tools/openclaw",
    description: "Internal proxy testing surface for the upstream chat integration.",
    icon: BriefcaseBusiness,
  },
]

const kpis = [
  { label: "Active leads", value: `${leads.length}` },
  { label: "Live campaigns", value: `${campaigns.length}` },
  { label: "Applications", value: `${applications.length}` },
  { label: "Pipeline value", value: crmOverview.pipelineValue },
]

export default function HomePage() {
  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden border-border/70 bg-card/80 shadow-sm">
        <CardContent className="grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Broker Workspace</p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance">
              Nyra is now one internal webapp for campaigns, quotes, CRM visibility, and pipeline operations.
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              This app is the broker-facing product for <code>nyra.ratehunter.net</code>. It is separate from the
              public <code>ratehunter.net</code> landing page and now carries the regenerated TweakCN theme tokens and
              merged route structure.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/assistant" className={cn(buttonVariants({}))}>
                Launch Assistant
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/crm" className={cn(buttonVariants({ variant: "outline" }))}>
                Open CRM Mirror
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{kpi.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center rounded-[2rem] border border-border/60 bg-gradient-to-br from-muted/70 to-background p-6">
            <Image
              src="/branding/webapp/dashboard-logo.png"
              alt="RateHunter dashboard"
              width={380}
              height={240}
              className="h-auto w-full max-w-[380px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map(({ title, href, description, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="h-full border-border/70 bg-card/80 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Icon className="size-5 text-primary" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="border-border/70 bg-gradient-to-r from-primary/10 via-accent/10 to-transparent">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Theme Status</p>
            <h2 className="mt-2 text-2xl font-semibold">The live internal app now uses the TweakCN token layer.</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-primary" />
            The old live apps were missing the imported theme globals. This shell now carries them directly.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
