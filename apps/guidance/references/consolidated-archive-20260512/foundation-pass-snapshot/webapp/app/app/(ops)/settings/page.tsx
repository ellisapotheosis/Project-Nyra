import { Bot, KeyRound, Network, ShieldCheck, ServerCog } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const platformNotes = [
  {
    title: "Auth Direction",
    icon: KeyRound,
    status: "planned",
    detail:
      "Final broker auth should use the Oracle VPS Supabase stack. Clerk artifacts are not part of the target platform.",
  },
  {
    title: "CRM Boundary",
    icon: ServerCog,
    status: "active",
    detail:
      "UI routes should read and mutate mortgage records through the CRM API boundary, not direct Twenty database access.",
  },
  {
    title: "Assistant Surface",
    icon: Network,
    status: "active",
    detail:
      "OpenClaw and Nexus remain internal broker tools, with the webapp using server-side proxy routes for chat calls.",
  },
  {
    title: "Compliance Guardrails",
    icon: ShieldCheck,
    status: "required",
    detail:
      "STOP, unsubscribe, reply-pausing, quiet hours, and quote generation must stay in services with tests.",
  },
]

const envGroups = [
  "CRM_API_URL / CRM_API_KEY",
  "QUOTE_API_URL / QUOTE_API_SECRET",
  "OPENCLAW_PUBLIC_BASE_URL / OPENCLAW_GATEWAY_TOKEN",
  "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_NEXUS_UI_URL",
]

export default function SettingsPage() {
  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">System Configuration</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Settings</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Platform governance and environment contracts for the Project Nyra AI cluster.
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black text-[10px]">AUTH_MODE: SUPABASE_CLOUD</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {platformNotes.map(({ title, icon: Icon, status, detail }) => (
          <Card key={title} className="bg-card/40 backdrop-blur-md border border-border/50 shadow-lg hover:border-primary/30 transition-all group border-t-2 border-t-primary">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-base font-black uppercase tracking-tight">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                  <Icon className="size-5" />
                </div>
                {title}
              </CardTitle>
              <Badge className="bg-emerald-500 text-black font-black text-[9px] uppercase tracking-widest px-2">{status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-bold leading-5 text-muted-foreground uppercase tracking-tight">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/20 backdrop-blur-sm border border-border/40 shadow-2xl overflow-hidden border-b-2 border-b-destructive">
        <CardHeader className="bg-background/20 border-b border-border/50">
          <CardTitle className="text-lg font-black text-emerald-300 flex items-center gap-2">
             <Bot className="size-5" />
             ENVIRONMENT_CONTRACT
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid gap-4 sm:grid-cols-2">
          {envGroups.map((env) => (
            <div key={env} className="rounded-lg border border-primary/5 bg-primary/5 px-4 py-4 font-mono text-[10px] font-black text-primary shadow-inner flex items-center gap-3">
              <div className="size-1.5 rounded-full bg-primary" />
              {env}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
