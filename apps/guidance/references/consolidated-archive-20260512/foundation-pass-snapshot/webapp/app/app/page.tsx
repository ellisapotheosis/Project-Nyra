import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Bot, CheckCircle2, LockKeyhole, ShieldCheck, Workflow, Cpu, Monitor, Zap } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const privateModules = [
  {
    title: "Lead command center",
    description: "Subscriber teams work leads, communications, campaign state, quotes, and assistant context in one place.",
    icon: Workflow,
  },
  {
    title: "Compliance-visible actions",
    description: "STOP, DNC, quiet-hours, consent, and approval gates stay visible near every borrower-contact action.",
    icon: ShieldCheck,
  },
  {
    title: "Nyra assistant surface",
    description: "OpenClaw-powered assistance proposes actions, but service boundaries own CRM, quote, campaign, and send execution.",
    icon: Bot,
  },
]

export default function HomePage() {
  return (
    <div className="space-y-16 py-12 max-w-7xl mx-auto min-h-screen">
      <section className="grid min-h-[calc(100vh-350px)] gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
          <div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.3em] mb-10 shadow-inner">
              SYSTEM_V1.0_FOUNDATION_ACTIVE
            </Badge>
            <h1 className="text-7xl font-black tracking-tighter text-foreground leading-[0.85] lg:text-8xl uppercase text-balance italic">
              Private <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Mortgage_Ops</span>
            </h1>
            <p className="mt-10 text-xl text-muted-foreground font-medium max-w-xl leading-relaxed uppercase tracking-tight opacity-80">
              Authenticated cockpit for subscriber broker teams. Synchronized lead flow, deterministic quotes, and AI orchestration in a single high-density workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 pt-6">
            <Link href="/leads" className={cn(buttonVariants({ size: "lg" }), "bg-primary hover:bg-primary/80 text-white font-black uppercase tracking-[0.2em] px-10 h-16 rounded-lg shadow-2xl shadow-primary/30 active:scale-95 transition-all text-xs")}>
              <LockKeyhole className="mr-3 size-5" />
              LAUNCH_COCKPIT
              <ArrowRight className="ml-3 size-5" />
            </Link>
            <Link href="/fleet" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300 font-black uppercase tracking-[0.2em] px-10 h-16 rounded-lg backdrop-blur-md transition-all shadow-xl text-xs")}>
              <Cpu className="mr-3 size-5" />
              FLEET_STATUS
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-8">
            {["System of Record", "Service-Owned Quotes", "Compliant Drip Logic"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-primary/10 bg-primary/5 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-primary shadow-inner">
                <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(20,184,166,0.8)]" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-xl p-0 shadow-2xl rounded-lg border-t-2 border-t-primary animate-in fade-in zoom-in-95 duration-1000">
          <CardContent className="p-0">
            <div className="border-b border-border/50 bg-background/40 p-16 relative overflow-hidden flex items-center justify-center min-h-[360px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />
               <div className="relative z-10 space-y-2 text-center">
                 <div className="size-24 rounded-lg bg-primary mx-auto flex items-center justify-center shadow-2xl shadow-primary/40 border border-primary/30">
                    <Zap className="size-12 text-white fill-current" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary pt-4">HUB_TERMINAL_ONLINE</p>
               </div>
            </div>
            <div className="grid gap-px bg-border/30 sm:grid-cols-3">
              {privateModules.map(({ title, description, icon: Icon }) => (
                <div key={title} className="space-y-4 bg-background/40 p-8 hover:bg-primary/10 transition-all group">
                  <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all w-fit shadow-lg">
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground leading-tight">{title}</h2>
                    <p className="mt-3 text-[9px] font-bold leading-relaxed text-muted-foreground uppercase tracking-tight opacity-60">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/50 bg-card/20 backdrop-blur-md shadow-2xl rounded-lg border-b-2 border-b-destructive overflow-hidden">
        <CardHeader className="bg-background/20 border-b border-border/50 p-8">
          <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-destructive flex items-center gap-3">
            <Bot className="size-5" />
            GLOBAL_ORCHESTRATION_ROUTE_MAP
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 grid gap-6 text-[10px] font-black text-muted-foreground md:grid-cols-4">
          {["/leads", "/campaigns", "/quotes", "/pipeline", "/assistant", "/fleet", "/settings", "/crm"].map((route) => (
            <Link key={route} href={route} className="rounded-lg border border-border/30 bg-background/40 px-6 py-5 font-mono hover:border-primary/50 hover:text-primary hover:bg-primary/10 transition-all text-center uppercase tracking-tighter shadow-inner">
              {route}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
