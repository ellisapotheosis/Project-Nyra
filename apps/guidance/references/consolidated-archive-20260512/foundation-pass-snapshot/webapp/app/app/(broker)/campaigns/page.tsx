import Link from "next/link"
import type React from "react"
import { CalendarDays, Mail, MessageSquare, PhoneCall, Plus, ShieldCheck, Workflow } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { ComplianceBadge } from "@/components/status/compliance-badge"
import { StatusBadge } from "@/components/status/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { campaigns, leads } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const campaignStats = [
  { label: "Active leads", value: "1,248", icon: Workflow },
  { label: "Campaign templates", value: `${campaigns.length}`, icon: CalendarDays },
  { label: "Calls due today", value: "142", icon: PhoneCall },
  { label: "Queued messages", value: "1,842", icon: Mail },
]

const timeline = [
  { time: "Today, 10:30 AM", title: "Missed call and voicemail", detail: "Refinance Blitz", channel: "Voice" },
  { time: "Today, 1:45 PM", title: "Personalized rate follow-up", detail: "Purchase Power", channel: "Email" },
  { time: "Tomorrow, 9:15 AM", title: "SMS next touch", detail: "Home Equity Pro", channel: "SMS" },
]

export default function CampaignDashboard() {
  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto min-h-screen">
      <PageHeader
        eyebrow="Orchestration_Engine"
        title="Campaign Management"
        description="Template registry, lead enrollment visibility, and compliance sentinel state."
        meta={
          <div className="flex gap-2">
            <ComplianceBadge label="STOP_ENFORCED" state="clear" />
            <ComplianceBadge label="QUIET_HOURS_VISIBLE" state="warning" />
          </div>
        }
        actions={
          <div className="flex gap-3">
            <Button variant="outline" className="border-primary/20 bg-primary/5 hover:bg-primary/10 font-black uppercase tracking-widest text-[10px] rounded-lg h-10 px-6">EXPORT_REGISTRY</Button>
            <Link href="/campaigns/builder">
              <Button className="bg-primary hover:bg-primary/80 text-white font-black uppercase tracking-widest text-[10px] rounded-lg h-10 px-6 shadow-lg shadow-primary/20">
                <Plus className="mr-2 size-3.5" />
                NEW_CAMPAIGN_PROTO
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {campaignStats.map(({ label, value, icon: Icon }, index) => (
          <Card key={label} className={cn("bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl border-t-2 overflow-hidden group hover:border-primary/30 transition-all", index % 2 === 0 ? "border-t-primary" : "border-t-emerald-500")}>
            <CardContent className="flex items-center gap-5 p-6">
              <div className={cn("flex size-12 items-center justify-center rounded-lg border shadow-inner", index % 2 === 0 ? "bg-primary/10 border-primary/20 text-primary" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300")}>
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">{label}</p>
                <p className="mt-1 text-3xl font-black text-foreground tracking-tighter">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-10 xl:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Campaign Registry</h2>
            <Link href="/campaigns/builder" className="text-[10px] font-black text-primary hover:text-emerald-300 uppercase tracking-widest transition-colors bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
              LAUNCH_BUILDER
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {campaigns.map((campaign, index) => (
              <Card key={campaign.id} className="bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl hover:border-primary/30 transition-all group overflow-hidden border-l-4 border-l-primary">
                <CardHeader className="bg-background/20 border-b border-border/50 p-6 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <StatusBadge status={campaign.status} />
                      <CardTitle className="mt-4 text-xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{campaign.name}</CardTitle>
                    </div>
                    <div className="flex size-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-inner group-hover:scale-105 transition-transform">
                      <Workflow className="size-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <p className="text-[10px] font-bold leading-relaxed text-muted-foreground uppercase tracking-tight opacity-70">
                    {index === 0
                      ? "Purchase lead follow-up sequence with consent-aware SMS and email touches."
                      : index === 1
                        ? "Refinance rate alert sequence routed through quote and communication services."
                        : "Home equity nurture sequence for HELOC candidates."}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <Metric label="Leads" value={campaign.enrolled} />
                    <Metric label="Steps" value={index + 4} />
                    <Metric label="Reply" value={`${18 + index * 2}%`} />
                  </div>
                  <div className="space-y-2 pt-2">
                     <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        <span>Utilization_Index</span>
                        <span>{campaign.status === "Paused" ? "38%" : "72%"}</span>
                     </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-primary/10 border border-primary/20 shadow-inner">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 shadow-[0_0_8px_rgba(20,184,166,0.5)]" style={{ width: `${campaign.status === "Paused" ? 38 : 72}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <aside className="space-y-8">
          <Card className="bg-card/40 border-border/50 shadow-2xl backdrop-blur-md border-t-2 border-t-emerald-500 overflow-hidden">
            <CardHeader className="bg-emerald-500/5 border-b border-border/50">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-300">RECENT_INGRESS_MATCHES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {leads.slice(0, 3).map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/30 bg-background/40 p-4 hover:bg-primary/5 hover:border-primary/30 transition-all group shadow-inner"
                >
                  <div className="space-y-1">
                    <p className="font-black text-xs uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{lead.firstName} {lead.lastName}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{lead.loanPurpose} • {lead.source}</p>
                  </div>
                  <StatusBadge status={lead.campaignStatus} />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border/50 shadow-2xl backdrop-blur-md border-t-2 border-t-destructive overflow-hidden">
            <CardHeader className="bg-destructive/5 border-b border-border/50">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-destructive">UPCOMING_AUTO_DISPATCH</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {timeline.map((item, idx) => (
                <div key={item.title} className="grid grid-cols-[40px_1fr] gap-4 group">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
                    {item.channel === "SMS" ? <MessageSquare className="size-4" /> : item.channel === "Voice" ? <PhoneCall className="size-4" /> : <Mail className="size-4" />}
                  </div>
                  <div className={cn("pb-4", idx !== timeline.length - 1 ? "border-b border-border/30" : "")}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300 mb-1">{item.time}</p>
                    <p className="text-xs font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{item.title}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{item.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/30 bg-background/50 p-3 shadow-inner">
      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-black text-foreground tracking-tighter">{value}</p>
    </div>
  )
}
