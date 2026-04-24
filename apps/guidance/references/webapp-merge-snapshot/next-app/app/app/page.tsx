import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Bot, BriefcaseBusiness, Sparkles, Workflow } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const modules = [
  {
    title: "Nyra Assistant",
    href: "/app/assistant",
    description: "Lead context, communication summaries, and action prompts.",
    icon: Bot,
  },
  {
    title: "Campaigns",
    href: "/app/campaigns",
    description: "Sequence management, performance cards, and lead enrollment views.",
    icon: Workflow,
  },
  {
    title: "OpenClaw Tooling",
    href: "/app/tools/openclaw",
    description: "Internal proxy testing surface for the chat integration route.",
    icon: BriefcaseBusiness,
  },
]

export default function WebappHomePage() {
  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden border-border/70 bg-card/80 shadow-sm">
        <CardContent className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Internal Tools</p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance">Nyra Webapp</h1>
            <p className="max-w-2xl text-muted-foreground">
              The old `webapp` routes now live inside this shared project, but retain their own route family under
              `/app` so they can deploy together with the portal home and admin dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/app/assistant" className={cn(buttonVariants({}))}>
                Launch Assistant
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/app/campaigns" className={cn(buttonVariants({ variant: "outline" }))}>
                Manage Campaigns
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-[2rem] border border-border/60 bg-gradient-to-br from-muted/70 to-background p-6">
            <Image
              src="/branding/webapp/dashboard-logo.png"
              alt="RateHunter dashboard"
              width={360}
              height={220}
              className="h-auto w-full max-w-[360px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
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
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Shared Theme</p>
            <h2 className="mt-2 text-2xl font-semibold">This route family now inherits the regenerated TweakCN palette.</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-primary" />
            <code>pnpm</code>, <code>shadcn init</code>, and your TweakCN URL were re-applied before the merge.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
