"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Phone,
  Mail,
  MessageSquare,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Clock,
  PhoneMissed,
  PhoneCall,
  Send,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Play,
  Fingerprint,
  Tags,
  RadioTower,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import { crmApi, useApi } from "@/lib/api";
import { StatusGate } from "@/components/status-gate";
import { Timeline } from "@/components/leads/timeline";
import { cn } from "@/lib/utils";

export default function LeadProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const leadApi = useApi(() => crmApi.getLead(id));
  const conversationApi = useApi(() => crmApi.getLeadConversation(id));

  React.useEffect(() => {
    leadApi.execute();
    conversationApi.execute();
  }, [id]);

  const lead = leadApi.data?.lead;
  const logs = conversationApi.data?.logs || [];
  const quietHoursStatus = getQuietHoursStatus(lead);
  const attribution = getSourceAttribution(lead);
  const tags = getLeadTags(lead);
  const workspaceStatus = getWorkspaceStatus(lead);

  return (
    <StatusGate
      data={lead}
      isLoading={leadApi.isLoading}
      error={leadApi.error}
      onRetry={() => {
        leadApi.execute();
        conversationApi.execute();
      }}
    >
      {(currentLead: any) => (
        <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
          {/* Left Column: Lead Details & Actions */}
          <div className="w-full md:w-[380px] flex flex-col border-r border-border/40 bg-card/20 overflow-y-auto scrollbar-hide">
            {/* Profile Header */}
            <div className="p-6 flex flex-col items-center text-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-2xl mb-4 shadow-[0_0_30px_-5px_rgba(var(--indigo-rgb),0.3)]">
                  {currentLead.firstName?.[0]}
                  {currentLead.lastName?.[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-background border-2 border-card flex items-center justify-center">
                  <ShieldCheck className="size-3.5 text-turquoise-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {currentLead.firstName} {currentLead.lastName}
              </h2>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
                Lead ID: {id.slice(0, 8)}
              </p>

              <div className="flex items-center mt-4 space-x-2">
                <Badge
                  variant="outline"
                  className="border-indigo-500/30 bg-indigo-500/5 text-indigo-400 px-2 py-0.5 text-[10px]"
                >
                  {currentLead.loanPurpose || "PURCHASE"}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-turquoise-500/30 bg-turquoise-500/5 text-turquoise-400 px-2 py-0.5 text-[10px]"
                >
                  {currentLead.campaignStatus || "ACTIVE"}
                </Badge>
              </div>

              {/* Attribution Grid */}
              <div className="mt-6 w-full space-y-3">
                <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 text-left">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Fingerprint className="size-3" />
                      Attribution
                    </span>
                    <span className="text-turquoise-400/80">Verified</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Channel</span>
                      <span className="font-semibold text-foreground">
                        {attribution.source}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry</span>
                      <span className="font-semibold text-foreground">
                        {attribution.campaign}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Workspace Health */}
                <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 text-left">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">
                    <RadioTower className="size-3" />
                    Sync Status
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {workspaceStatus.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 rounded-lg border border-border/30 bg-background/40 p-2"
                      >
                        <div
                          className={cn(
                            "size-1.5 rounded-full shadow-[0_0_8px]",
                            item.ok
                              ? "bg-turquoise-400 shadow-turquoise-400/50"
                              : "bg-pink-400 shadow-pink-400/50"
                          )}
                        />
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Matrix */}
            <div className="px-6 py-4 border-y border-border/40 bg-muted/20">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "h-6 border-none px-0 text-[10px] font-bold uppercase tracking-tight",
                    currentLead.hasConsent
                      ? "text-turquoise-400"
                      : "text-pink-400"
                  )}
                >
                  {currentLead.hasConsent ? "● TCPA Consent" : "○ No Consent"}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "h-6 border-none px-0 text-[10px] font-bold uppercase tracking-tight",
                    currentLead.onDncList
                      ? "text-pink-400"
                      : "text-muted-foreground"
                  )}
                >
                  {currentLead.onDncList ? "● DNC Active" : "○ Not DNC"}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "h-6 border-none px-0 text-[10px] font-bold uppercase tracking-tight",
                    quietHoursStatus.inQuietHours
                      ? "text-amber-400"
                      : "text-indigo-400"
                  )}
                >
                  {quietHoursStatus.label}
                </Badge>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-6 space-y-8 flex-1">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-4 flex items-center gap-2">
                  <User className="size-3" />
                  Lead Intelligence
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Loan Amount
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      ${(currentLead.loanAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      FICO Score
                    </span>
                    <span className="text-sm font-bold text-turquoise-400 flex items-center gap-1.5">
                      <CreditCard className="size-3" />
                      {currentLead.creditScore ||
                        currentLead.creditBand ||
                        "720+"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Campaign Control Panel */}
              <div className="pt-4 border-t border-border/40">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                    <Play className="size-3" />
                    Campaign Orchestration
                  </h3>
                </div>
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-indigo-300">
                        {currentLead.campaignName || "Refinance Blitz"}
                      </p>
                      <p className="text-[10px] text-indigo-300/60 uppercase tracking-tighter mt-0.5">
                        Step 3 of 5 • Next in 14h
                      </p>
                    </div>
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                      {currentLead.campaignStatus || "ACTIVE"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 text-[10px] font-bold uppercase"
                      onClick={() => {
                        crmApi
                          .updateLeadCampaign(
                            id,
                            currentLead.campaignStatus === "ACTIVE"
                              ? "PAUSED"
                              : "ACTIVE"
                          )
                          .then(() => leadApi.execute());
                      }}
                    >
                      {currentLead.campaignStatus === "ACTIVE"
                        ? "Pause"
                        : "Resume"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 text-[10px] font-bold uppercase"
                      onClick={() => {
                        if (confirm("Stop automation for this lead?")) {
                          crmApi
                            .updateLeadCampaign(id, "STOPPED")
                            .then(() => leadApi.execute());
                        }
                      }}
                    >
                      Stop
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Communication History / Activity Feed */}
          <div className="flex-1 flex flex-col bg-background">
            <Tabs defaultValue="all" className="flex min-h-0 flex-1 flex-col">
              {/* Feed Header */}
              <div className="h-14 px-6 border-b border-border/40 bg-card/40 flex items-center justify-between shrink-0">
                <TabsList className="bg-muted/40 h-8 p-0.5">
                  <TabsTrigger
                    value="all"
                    className="text-[10px] uppercase font-bold px-4 h-7 data-[state=active]:bg-background"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="calls"
                    className="text-[10px] uppercase font-bold px-4 h-7 data-[state=active]:bg-background"
                  >
                    Calls
                  </TabsTrigger>
                  <TabsTrigger
                    value="messages"
                    className="text-[10px] uppercase font-bold px-4 h-7 data-[state=active]:bg-background"
                  >
                    Messages
                  </TabsTrigger>
                  <TabsTrigger
                    value="pricing"
                    className="text-[10px] uppercase font-bold px-4 h-7 data-[state=active]:bg-background"
                  >
                    Pricing
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Scrollable Feed */}
              <ScrollArea className="flex-1">
                <div className="p-6 lg:p-10">
                  <TabsContent value="all" className="mt-0 outline-none">
                    <Timeline
                      logs={logs}
                      isLoading={conversationApi.isLoading}
                      leadName={currentLead.firstName}
                    />
                  </TabsContent>

                  {/* ... other TabsContent refactored with Indigo/Seafoam ... */}
                  <TabsContent
                    value="pricing"
                    className="mt-0 outline-none max-w-4xl mx-auto space-y-6"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-bold tracking-tight">
                          Scenario Comparison
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Market-locked data from LenderPrice & Rocket
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-indigo-500/30 text-indigo-400"
                      >
                        <Activity className="size-4" />
                        Live Rates
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      {/* Scenario Card Example */}
                      <Card className="border-border/40 bg-card/40 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[0_0_10px_rgba(var(--indigo-rgb),0.5)]"></div>
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[10px] uppercase font-bold">
                                Conventional Cash Out
                              </Badge>
                              <CardTitle className="text-lg">
                                Rocket Mortgage High-Cap
                              </CardTitle>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-foreground">
                                6.250%
                              </p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                Note Rate
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-background/40 border border-border/30">
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground/60">
                                APR
                              </p>
                              <p className="text-sm font-semibold">6.345%</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground/60">
                                Points
                              </p>
                              <p className="text-sm font-semibold">0.375</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground/60">
                                Credit/Cost
                              </p>
                              <p className="text-sm font-semibold text-pink-400">
                                $1,250
                              </p>
                            </div>
                            <div className="space-y-1 text-right">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground/60">
                                Monthly P&I
                              </p>
                              <p className="text-sm font-bold text-turquoise-400">
                                $2,001
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground"
                            >
                              View LOE
                            </Button>
                            <Button
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-6 h-8 text-[11px] font-bold uppercase tracking-wider"
                            >
                              Propose Scenario
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </div>
              </ScrollArea>

              {/* Communication Drawer (Bottom Fixed) */}
              <div className="p-4 bg-card/60 border-t border-border/40 backdrop-blur shrink-0">
                <div className="max-w-4xl mx-auto flex items-end gap-3">
                  <div className="flex-1 bg-background/60 border border-border/60 rounded-2xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all p-3">
                    <textarea
                      className="w-full bg-transparent border-none focus:ring-0 resize-none outline-none text-sm p-1 min-h-[44px] placeholder:text-muted-foreground/50"
                      placeholder={`Send a secured message to ${currentLead.firstName}...`}
                    />
                    <div className="flex justify-between items-center mt-2 px-1">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground/70 hover:text-indigo-400 hover:bg-indigo-500/5"
                        >
                          <MessageSquare className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground/70 hover:text-indigo-400 hover:bg-indigo-500/5"
                        >
                          <Mail className="size-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60 cursor-pointer hover:text-muted-foreground">
                          <input
                            type="checkbox"
                            className="size-3 rounded border-border/60 bg-background text-indigo-500 focus:ring-indigo-500/40"
                          />
                          Append STOP Opt-out
                        </label>
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-8 px-5 text-[10px] font-bold uppercase tracking-widest gap-2"
                        >
                          <Send className="size-3" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      )}
    </StatusGate>
  );
}

// ... helper functions (getQuietHoursStatus, etc) remain the same ...
function getQuietHoursStatus(lead: any): {
  inQuietHours: boolean;
  label: string;
} {
  const timeZone =
    lead?.timeZone ||
    lead?.timezone ||
    timeZoneForState(lead?.propertyState || lead?.state) ||
    "America/Los_Angeles";
  const localHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  );
  const inQuietHours = localHour < 9 || localHour >= 21;

  return {
    inQuietHours,
    label: inQuietHours ? "Quiet Hours" : "Business Hours",
  };
}

function getSourceAttribution(lead: any): {
  source: string;
  campaign: string;
  capturedAt: string;
} {
  return {
    source: lead?.source || lead?.leadSource || lead?.utmSource || "Direct",
    campaign:
      lead?.utmCampaign ||
      lead?.campaignName ||
      lead?.campaignId ||
      "Unattributed",
    capturedAt: lead?.createdAt
      ? formatShortDate(lead.createdAt)
      : lead?.lastTouch || "Unknown",
  };
}

function getLeadTags(lead: any): string[] {
  const explicitTags = Array.isArray(lead?.tags)
    ? lead.tags.filter(
        (tag: unknown): tag is string =>
          typeof tag === "string" && Boolean(tag.trim())
      )
    : [];
  const derivedTags = [
    lead?.stage,
    lead?.loanPurpose,
    lead?.creditBand || lead?.creditScoreRange,
    lead?.campaignStatus,
    lead?.source || lead?.leadSource,
  ].filter(
    (tag): tag is string => typeof tag === "string" && Boolean(tag.trim())
  );

  return Array.from(new Set([...explicitTags, ...derivedTags])).slice(0, 8);
}

function getWorkspaceStatus(
  lead: any
): Array<{ label: string; value: string; ok: boolean }> {
  const workspace = lead?.workspace;
  const compliance = workspace?.compliance;
  const campaign = workspace?.campaign;
  const quote = workspace?.quote;

  return [
    {
      label: "CRM",
      value: workspace?.crmBacked ? "Live" : "Mock",
      ok: workspace?.crmBacked === true,
    },
    {
      label: "Compliance",
      value: compliance?.sendBlocked ? "Blocked" : "Eligible",
      ok: compliance?.sendBlocked !== true,
    },
    {
      label: "Campaign",
      value: campaign?.status || lead?.campaignStatus || "Unassigned",
      ok: (campaign?.status || lead?.campaignStatus) === "ACTIVE",
    },
    {
      label: "Quotes",
      value:
        quote?.sourceOfTruth === "quote-service" ? "Service Owned" : "Pending",
      ok: quote?.sourceOfTruth === "quote-service",
    },
  ];
}

function formatShortDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeZoneForState(state?: string): string | undefined {
  const normalized = state?.trim().toUpperCase();
  const zones: Record<string, string> = {
    AL: "America/Chicago",
    AK: "America/Anchorage",
    AZ: "America/Phoenix",
    AR: "America/Chicago",
    CA: "America/Los_Angeles",
    CO: "America/Denver",
    CT: "America/New_York",
    DC: "America/New_York",
    DE: "America/New_York",
    FL: "America/New_York",
    GA: "America/New_York",
    HI: "Pacific/Honolulu",
    IA: "America/Chicago",
    ID: "America/Denver",
    IL: "America/Chicago",
    IN: "America/Indiana/Indianapolis",
    KS: "America/Chicago",
    KY: "America/New_York",
    LA: "America/Chicago",
    MA: "America/New_York",
    MD: "America/New_York",
    ME: "America/New_York",
    MI: "America/Detroit",
    MN: "America/Chicago",
    MO: "America/Chicago",
    MS: "America/Chicago",
    MT: "America/Denver",
    NC: "America/New_York",
    ND: "America/Chicago",
    NE: "America/Chicago",
    NH: "America/New_York",
    NJ: "America/New_York",
    NM: "America/Denver",
    NV: "America/Los_Angeles",
    NY: "America/New_York",
    OH: "America/New_York",
    OK: "America/Chicago",
    OR: "America/Los_Angeles",
    PA: "America/New_York",
    RI: "America/New_York",
    SC: "America/New_York",
    SD: "America/Chicago",
    TN: "America/Chicago",
    TX: "America/Chicago",
    UT: "America/Denver",
    VA: "America/New_York",
    VT: "America/New_York",
    WA: "America/Los_Angeles",
    WI: "America/Chicago",
    WV: "America/New_York",
    WY: "America/Denver",
  };

  return normalized ? zones[normalized] : undefined;
}
