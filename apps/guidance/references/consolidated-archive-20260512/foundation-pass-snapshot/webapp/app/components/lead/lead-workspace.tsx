"use client"

import type React from "react"
import { Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react"

import { ActionApprovalCard } from "@/components/assistant/action-approval-card"
import { PageHeader } from "@/components/layout/page-header"
import { ComplianceBadge } from "@/components/status/compliance-badge"
import { StatusBadge } from "@/components/status/status-badge"
import { TimelineShell } from "@/components/timeline/timeline-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ConversationLog, Lead } from "@/lib/api/crm"

type LeadWorkspaceProps = {
  lead: Lead
  logs: ConversationLog[]
  isTimelineLoading?: boolean
  quietHoursLabel: string
  inQuietHours: boolean
  onToggleCampaign: () => void
  onStopCampaign: () => void
}

export function LeadWorkspace({
  lead,
  logs,
  isTimelineLoading,
  quietHoursLabel,
  inQuietHours,
  onToggleCampaign,
  onStopCampaign,
}: LeadWorkspaceProps) {
  const displayName = lead.firstName ? `${lead.firstName} ${lead.lastName ?? ""}`.trim() : lead.name ?? "Unknown Lead"
  const contactBlocked = Boolean(lead.onDncList || lead.hasConsent === false || inQuietHours)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Lead Workspace"
        title={displayName}
        description="A broker cockpit for CRM context, campaign state, communication history, quote readiness, and assistant-proposed actions."
        meta={
          <>
            <StatusBadge status={lead.stage || "New"} />
            <StatusBadge status={lead.campaignStatus || "Campaign Unknown"} />
            <ComplianceBadge label={lead.hasConsent === false ? "No consent" : "Consent clear"} state={lead.hasConsent === false ? "blocked" : "clear"} />
            <ComplianceBadge label={lead.onDncList ? "DNC active" : "No DNC"} state={lead.onDncList ? "blocked" : "clear"} />
            <ComplianceBadge label={quietHoursLabel} state={inQuietHours ? "warning" : "clear"} />
          </>
        }
        actions={
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" disabled={contactBlocked}>
              <Phone className="mr-2 size-4" />
              Call
            </Button>
            <Button variant="outline" disabled={contactBlocked}>
              <MessageSquare className="mr-2 size-4" />
              Text
            </Button>
            <Button disabled={contactBlocked}>
              <Mail className="mr-2 size-4" />
              Email
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/40 shadow-lg">
            <CardHeader>
              <CardTitle>Record summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-lg font-semibold text-primary">
                  {(lead.firstName?.[0] || lead.name?.[0] || "?")}
                  {lead.lastName?.[0] || ""}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{lead.source || "Source pending"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <InfoRow icon={Phone} label={lead.phone || "Phone missing"} tone="primary" />
                <InfoRow icon={Mail} label={lead.email || "Email missing"} tone="accent" />
                <InfoRow icon={MapPin} label={lead.location || lead.propertyState || "Location pending"} tone="muted" />
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-border/50 pt-5">
                <Metric label="Loan purpose" value={lead.loanPurpose || "General"} />
                <Metric label="Credit band" value={lead.creditBand || lead.creditScore || "Unknown"} />
                <Metric label="Loan amount" value={`$${Number(lead.loanAmount || 0).toLocaleString()}`} />
                <Metric label="Owner" value={lead.owner || "Unassigned"} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/40 shadow-lg">
            <CardHeader>
              <CardTitle>Campaign control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/60 bg-background/45 p-4">
                <p className="text-sm font-semibold text-foreground">{lead.campaignName || lead.campaignId || "No active campaign"}</p>
                <p className="mt-2 text-xs text-muted-foreground">Next touch: {lead.nextTouch || "Pending service sync"}</p>
                <div className="mt-4">
                  <StatusBadge status={lead.campaignStatus || "Unknown"} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={onToggleCampaign}>
                  {lead.campaignStatus === "ACTIVE" ? "Pause" : "Resume"}
                </Button>
                <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={onStopCampaign}>
                  Stop
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="timeline" className="min-w-0 space-y-4">
          <TabsList className="h-auto flex-wrap justify-start bg-card/40">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline" className="mt-0">
            <TimelineShell logs={logs} isLoading={isTimelineLoading} leadName={lead.firstName || displayName} />
          </TabsContent>
          <TabsContent value="calls" className="mt-0">
            <Card className="border-border/50 bg-card/40">
              <CardHeader>
                <CardTitle>Call activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {logs.filter((log) => log.channel === "voice" || log.channel === "call").length ? (
                  logs
                    .filter((log) => log.channel === "voice" || log.channel === "call")
                    .map((log, index) => <TimelineShell key={`${log.sent_at}-${index}`} logs={[log]} leadName={lead.firstName || displayName} />)
                ) : (
                  <p className="text-sm text-muted-foreground">No call records are available yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="messages" className="mt-0">
            <TimelineShell logs={logs.filter((log) => log.channel !== "voice" && log.channel !== "call")} leadName={lead.firstName || displayName} />
          </TabsContent>
          <TabsContent value="quotes" className="mt-0">
            <Card className="border-border/50 bg-card/40">
              <CardHeader>
                <CardTitle>Quote readiness</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Scenario inputs are sent to the quote service. The frontend only displays service-owned readiness and returned quote records.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric label="Loan purpose" value={lead.loanPurpose || "Missing"} />
                  <Metric label="Credit band" value={lead.creditBand || "Missing"} />
                  <Metric label="Loan amount" value={lead.loanAmount ? `$${Number(lead.loanAmount).toLocaleString()}` : "Missing"} />
                </div>
                <Button className="w-full">Request service quote</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="space-y-6">
          <Card className="border-border/50 bg-card/40 shadow-lg">
            <CardHeader>
              <CardTitle>Communication draft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`rounded-lg border p-4 text-sm ${contactBlocked ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-border/60 bg-background/45 text-muted-foreground"}`}>
                {contactBlocked ? "Contact actions are blocked until consent, DNC, or quiet-hours constraints clear." : "Ready for broker-approved communication dispatch."}
              </div>
              <textarea
                className="min-h-[140px] w-full rounded-lg border border-border/60 bg-background/60 p-4 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                placeholder="Draft a broker-reviewed message..."
              />
              <Button className="w-full" disabled={contactBlocked}>
                <Send className="mr-2 size-4" />
                Send through service
              </Button>
            </CardContent>
          </Card>

          <ActionApprovalCard
            title="Assistant proposal"
            description="Review borrower intent and generate a compliant next-touch recommendation."
            risk={contactBlocked ? "high" : "medium"}
            expectedMutation="No CRM mutation until broker approval routes through the service boundary."
          />
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, tone }: { icon: React.ElementType; label: string; tone: "primary" | "accent" | "muted" }) {
  const toneClass = {
    primary: "border-primary/20 bg-primary/10 text-primary",
    accent: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    muted: "border-border/60 bg-background/50 text-muted-foreground",
  }[tone]

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/40 p-3">
      <div className={`rounded-lg border p-1.5 ${toneClass}`}>
        <Icon className="size-4" />
      </div>
      <span className="min-w-0 truncate text-sm text-foreground">{label}</span>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
