"use client";

import type React from "react";
import {
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  History,
  Bot,
  FileText,
  Star,
  ArrowRight,
} from "lucide-react";

import { ActionApprovalCard } from "@/components/assistant/action-approval-card";
import { PageHeader } from "@nyra/ui";
import { Button } from "@nyra/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@nyra/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nyra/ui";
import { Badge } from "@nyra/ui";
import { ComplianceBadge } from "@nyra/ui";
import { StatusBadge } from "@nyra/ui";
import { TimelineShell } from "@/components/timeline/timeline-shell";
import { cn } from "@/lib/utils";

interface LeadWorkspaceProps {
  lead: any;
  logs: any[];
  isTimelineLoading: boolean;
  quietHoursLabel: string;
  inQuietHours: boolean;
  onToggleCampaign: () => void;
  onStopCampaign: () => void;
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
  const displayName = lead.firstName
    ? `${lead.firstName} ${lead.lastName ?? ""}`.trim()
    : (lead.name ?? "Unknown Lead");
  const contactBlocked = Boolean(
    lead.onDncList || lead.hasConsent === false || inQuietHours
  );

  return (
    <div className="space-y-8 p-2">
      <PageHeader
        eyebrow="Registry Ingress"
        title={displayName}
        description="Central record command center for CRM context, campaign state, quote readiness, and assistant-approved actions."
        meta={
          <>
            <StatusBadge
              status={lead.stage || "New"}
              className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
            />
            <StatusBadge status={lead.campaignStatus || "Campaign Unknown"} />
            <ComplianceBadge
              label={lead.hasConsent === false ? "NO_CONSENT" : "CONSENT_CLEAR"}
              state={lead.hasConsent === false ? "blocked" : "clear"}
            />
            <ComplianceBadge
              label={lead.onDncList ? "DNC_ACTIVE" : "NO_DNC"}
              state={lead.onDncList ? "blocked" : "clear"}
            />
            <ComplianceBadge
              label={quietHoursLabel.toUpperCase()}
              state={inQuietHours ? "warning" : "clear"}
            />
          </>
        }
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              disabled={contactBlocked}
              className="border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-400 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6"
            >
              <Phone className="mr-2 size-3.5 text-indigo-400" />
              INITIATE_CALL
            </Button>
            <Button
              variant="outline"
              disabled={contactBlocked}
              className="border-turquoise-500/20 bg-turquoise-500/5 hover:bg-turquoise-500/10 hover:border-turquoise-400 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6"
            >
              <MessageSquare className="mr-2 size-3.5 text-turquoise-400" />
              SEND_SMS
            </Button>
            <Button
              disabled={contactBlocked}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-8 shadow-lg shadow-indigo-500/20"
            >
              <Mail className="mr-2 size-4" />
              DISPATCH_EMAIL
            </Button>
          </div>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[380px_1fr_360px]">
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-2xl border-t-2 border-t-indigo-500 overflow-hidden">
            <CardHeader className="bg-indigo-500/5 border-b border-border/50">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                Record_Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-xl font-black text-indigo-400 shadow-inner">
                  {lead.firstName?.[0] || lead.name?.[0] || "?"}
                  {lead.lastName?.[0] || ""}
                </div>
                <div>
                  <p className="text-lg font-black text-foreground uppercase tracking-tight">
                    {displayName}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {lead.source || "ORGANIC_INGRESS"}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <InfoRow
                  icon={Phone}
                  label={lead.phone || "MISSING_PHONE"}
                  color="turquoise"
                />
                <InfoRow
                  icon={Mail}
                  label={lead.email || "MISSING_EMAIL"}
                  color="indigo"
                />
                <InfoRow
                  icon={MapPin}
                  label={
                    lead.location || lead.propertyState || "LOCATION_UNKNOWN"
                  }
                  color="pink"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-6">
                <Metric
                  label="Loan Purpose"
                  value={lead.loanPurpose || "GENERAL"}
                />
                <Metric
                  label="Credit Index"
                  value={
                    lead.creditRange ||
                    lead.creditBand ||
                    lead.creditScore ||
                    "UNKNOWN"
                  }
                />
                <Metric
                  label="App Volume"
                  value={`$${Number(lead.loanAmount || 0).toLocaleString()}`}
                />
                <Metric
                  label="Property Val"
                  value={`$${Number(lead.propertyValue || 0).toLocaleString()}`}
                />
                <Metric label="Timeframe" value={lead.timeframe || "UNKNOWN"} />
                <Metric
                  label="Record Owner"
                  value={lead.owner || "UNASSIGNED"}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-2xl border-t-2 border-t-turquoise-500 overflow-hidden">
            <CardHeader className="bg-turquoise-500/5 border-b border-border/50">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-turquoise-400">
                Campaign_Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="rounded-2xl border border-border/30 bg-background/50 p-5 shadow-inner">
                <p className="text-sm font-black text-foreground uppercase">
                  {lead.campaignName || lead.campaignId || "NO_ACTIVE_FLOW"}
                </p>
                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground bg-indigo-500/5 inline-block px-1.5 py-0.5 rounded">
                  Next touch: {lead.nextTouch || "PENDING_SYNC"}
                </p>
                <div className="mt-4">
                  <StatusBadge status={lead.campaignStatus || "Unknown"} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  className="font-black uppercase tracking-widest text-[9px] h-10 border-border/50 rounded-xl"
                  onClick={onToggleCampaign}
                >
                  {lead.campaignStatus === "ACTIVE"
                    ? "PAUSE_FLOW"
                    : "RESUME_FLOW"}
                </Button>
                <Button
                  variant="outline"
                  className="font-black uppercase tracking-widest text-[9px] h-10 border-pink-500/20 bg-pink-500/5 text-pink-400 rounded-xl hover:bg-pink-500/10"
                  onClick={onStopCampaign}
                >
                  TERMINATE
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="timeline" className="min-w-0 space-y-6">
          <TabsList className="bg-card/40 backdrop-blur-md border border-border/50 p-1 h-12 rounded-2xl">
            <TabsTrigger
              value="timeline"
              className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="calls"
              className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Calls
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Messages
            </TabsTrigger>
            <TabsTrigger
              value="quotes"
              className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Quotes
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Compliance
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="timeline"
            className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <TimelineShell
              logs={logs}
              isLoading={isTimelineLoading}
              leadName={lead.firstName || displayName}
            />
          </TabsContent>
          <TabsContent
            value="calls"
            className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <TimelineShell
              logs={logs.filter(
                (log) => log.channel === "call" || log.channel === "voicemail"
              )}
              isLoading={isTimelineLoading}
              leadName={lead.firstName || displayName}
            />
          </TabsContent>
          <TabsContent
            value="messages"
            className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <TimelineShell
              logs={logs.filter(
                (log) => log.channel === "sms" || log.channel === "email"
              )}
              isLoading={isTimelineLoading}
              leadName={lead.firstName || displayName}
            />
          </TabsContent>
          <TabsContent
            value="quotes"
            className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden border-t-2 border-t-indigo-500">
              <CardHeader className="bg-indigo-500/5 border-b border-border/50">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  Quote_Readiness_Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <p className="text-xs font-bold leading-5 text-muted-foreground uppercase tracking-tight">
                  Scenario parameters are routed to the 5090 worker. Dashboard
                  displays service-owned audit state.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Metric
                    label="Loan Purpose"
                    value={lead.loanPurpose || "MISSING"}
                  />
                  <Metric
                    label="Credit Index"
                    value={lead.creditRange || "MISSING"}
                  />
                  <Metric
                    label="Volume"
                    value={
                      lead.loanAmount
                        ? `$${Number(lead.loanAmount).toLocaleString()}`
                        : "MISSING"
                    }
                  />
                </div>
                <Button className="w-full bg-turquoise-600 hover:bg-turquoise-500 text-black font-black uppercase tracking-widest text-[10px] rounded-xl h-11">
                  INITIATE_PRICING_ENGINE
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent
            value="compliance"
            className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden border-t-2 border-t-pink-500">
              <CardHeader className="bg-pink-500/5 border-b border-border/50">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-pink-400">
                  Compliance_Sentinel_Audit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="space-y-4">
                  <ComplianceRow
                    label="TCPA Consent"
                    status={lead.hasConsent === false ? "REJECTED" : "VERIFIED"}
                    detail="Consent captured via web-form on 2026-05-11."
                  />
                  <ComplianceRow
                    label="DNC Registry"
                    status={lead.onDncList ? "MATCHED" : "CLEAR"}
                    detail="Checked against national and internal exclusion lists."
                  />
                  <ComplianceRow
                    label="Quiet Hours"
                    status={inQuietHours ? "ACTIVE" : "INACTIVE"}
                    detail={quietHoursLabel}
                  />
                  <ComplianceRow
                    label="Audit Trail"
                    status="LOCKED"
                    detail="All mutations streamed to TwentyCRM timeline."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="space-y-6">
          <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden border-t-2 border-t-indigo-500">
            <CardHeader className="bg-indigo-500/5 border-b border-border/50">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                Comm_Composer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div
                className={`rounded-xl border p-4 text-[10px] font-black uppercase tracking-widest leading-relaxed shadow-inner ${contactBlocked ? "bg-pink-500/10 border-pink-500/20 text-pink-400" : "bg-background/50 border-border/30 text-muted-foreground"}`}
              >
                {contactBlocked
                  ? "PROTOCOL_HALTED: CONTACT_ACTIONS_BLOCKED. VERIFY_CONSENT_OR_QUIET_HOURS."
                  : "READY: COMPOSER_ARMED_FOR_SERVICE_DISPATCH."}
              </div>
              <textarea
                className="min-h-[140px] w-full rounded-2xl border border-border/50 bg-background/60 p-4 text-sm font-medium outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
                placeholder="DRAFT_MESSAGE_BUFFER..."
              />
              <div className="flex flex-col gap-3">
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl h-12 shadow-lg shadow-indigo-500/20 active:scale-95"
                  disabled={contactBlocked}
                >
                  <Send className="mr-2 size-4" />
                  EXECUTE_DISPATCH
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[9px] font-black uppercase rounded-xl h-9"
                  >
                    VOICEMOD_TRANSFORM
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-turquoise-500/20 bg-turquoise-500/5 text-turquoise-400 text-[9px] font-black uppercase rounded-xl h-9"
                  >
                    WHISPER_SYNC
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <ActionApprovalCard
            title="ASSISTANT_PROPOSAL"
            description="Process borrower intent and generate compliant next-touch recommendation."
            risk={contactBlocked ? "high" : "medium"}
            expectedMutation="ATOMIC_CRM_MUTATION_AFTER_BROKER_ACK"
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: "indigo" | "turquoise" | "pink";
}) {
  const colorMap: Record<typeof color, string> = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    turquoise: "text-turquoise-400 bg-turquoise-500/10 border-turquoise-500/20",
    pink: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  };
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl border border-border/30 bg-background/40 hover:bg-background/60 transition-colors group">
      <div className={`p-1.5 rounded-lg border ${colorMap[color]}`}>
        <Icon className="size-3.5" />
      </div>
      <span className="text-xs font-black text-foreground/80 tracking-tight uppercase">
        {label}
      </span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/30 bg-background/50 p-4 shadow-inner">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-xs font-black text-foreground tracking-tighter truncate">
        {value}
      </p>
    </div>
  );
}

function ComplianceRow({ label, status, detail }: any) {
  return (
    <div className="flex items-start justify-between p-4 rounded-2xl border border-border/30 bg-background/50 shadow-inner">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-tight text-foreground">
          {label}
        </p>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
          {detail}
        </p>
      </div>
      <Badge
        className={cn(
          "text-[9px] font-black uppercase tracking-widest px-2 py-0.5",
          status === "REJECTED" || status === "MATCHED"
            ? "bg-pink-500 text-white"
            : status === "VERIFIED" || status === "CLEAR"
              ? "bg-turquoise-500 text-black"
              : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
        )}
      >
        {status}
      </Badge>
    </div>
  );
}
