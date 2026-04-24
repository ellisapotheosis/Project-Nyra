import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BarChart3, Mail, Phone, ShieldCheck, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { campaigns, leads } from "@/lib/mock-data"

const stats = [
  { label: "Total Leads", value: "1,248", detail: "+12.4% this month", icon: Phone },
  { label: "Active Campaigns", value: "8", detail: "Refi, HELOC, purchase", icon: Mail },
  { label: "Response Rate", value: "18.7%", detail: "Across automated sequences", icon: BarChart3 },
]

export default function HomePage() {
  return (
    <main className="pb-16">
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div className="space-y-8">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Rebuilt on Next.js + shadcn + your TweakCN theme
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
              RateHunter now lives as one branded portal with app home, borrower tools, and admin routes.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              This repo is the webapp portal shell, not the public `ratehunter.net` broker site. The uploaded app
              home mockup, webapp flows, and admin dashboard were consolidated into one app-router project so they can
              share the same palette, components, and deployment surface.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/app" className={cn(buttonVariants({ size: "lg" }))}>
              Open Webapp
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/admin" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Open Admin
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map(({ label, value, detail, icon: Icon }) => (
              <Card key={label} className="border-border/60 bg-card/70 shadow-sm backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Icon className="size-4 text-primary" />
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{value}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-card to-muted/40 shadow-xl">
          <CardContent className="p-0">
            <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-accent/10 to-transparent px-6 py-5">
              <Image
                src="/branding/landing/hero-logo.png"
                alt="RateHunter"
                width={380}
                height={96}
                className="h-auto max-w-full"
                priority
              />
            </div>
            <div className="grid gap-4 p-6">
              {campaigns.slice(0, 3).map((campaign) => (
                <div
                  key={campaign.id}
                  className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{campaign.loanPurpose}</p>
                      <h2 className="text-xl font-semibold">{campaign.name}</h2>
                    </div>
                    <Badge variant={campaign.status === "Active" ? "default" : "secondary"}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Leads</p>
                      <p className="font-semibold">{campaign.activeLeads}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Steps</p>
                      <p className="font-semibold">{campaign.steps.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Response</p>
                      <p className="font-semibold">{campaign.responseRate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-[1fr_1fr] lg:px-10">
        <Card className="border-border/70 bg-card/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="size-5 text-primary" />
              Borrower Webapp Routes
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-muted-foreground">
              The original `webapp` pages are now grouped under one route family and styled with the regenerated
              theme instead of their old standalone scaffold.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link href="/app" className="rounded-2xl border border-border/60 p-4 transition hover:border-primary/50 hover:bg-muted/40">
                Dashboard
              </Link>
              <Link href="/app/assistant" className="rounded-2xl border border-border/60 p-4 transition hover:border-primary/50 hover:bg-muted/40">
                Assistant
              </Link>
              <Link href="/app/campaigns" className="rounded-2xl border border-border/60 p-4 transition hover:border-primary/50 hover:bg-muted/40">
                Campaigns
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="size-5 text-primary" />
              Admin Operations Route
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-muted-foreground">
              The admin dashboard now lives at `/admin` as part of the same deployment, while keeping a distinct
              operations-focused presentation.
            </p>
            <div className="grid gap-3">
              {leads.slice(0, 3).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {lead.loanPurpose} · ${lead.loanAmount.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">{lead.campaignStatus}</Badge>
                </div>
              ))}
            </div>
            <Link href="/admin" className={cn(buttonVariants({ variant: "outline" }), "w-fit")}>
              Review Admin Dashboard
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto mt-10 max-w-7xl px-6 lg:px-10">
        <div className="rounded-[2rem] border border-border/70 bg-gradient-to-r from-primary/10 via-accent/10 to-transparent px-6 py-10 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Integrated Brand Assets</p>
              <h2 className="text-3xl font-semibold">Uploaded logos are wired into the shared scaffold.</h2>
              <p className="max-w-2xl text-muted-foreground">
                Portal-home, webapp, and admin logos were copied into `public/branding` and reused across the merged
                routes so future UI work stays on one design system.
              </p>
            </div>
            <Image
              src="/branding/landing/footer-logo.png"
              alt="RateHunter footer logo"
              width={280}
              height={70}
              className="h-auto w-full max-w-[280px]"
            />
          </div>
        </div>
      </section>
    </main>
  )
}
