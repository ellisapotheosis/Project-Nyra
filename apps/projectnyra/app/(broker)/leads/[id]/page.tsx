"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
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
} from "lucide-react";
import { useParams } from "next/navigation";

import { crmApi, useApi } from "@/lib/api";
import { StatusGate } from "@/components/status-gate";
import { Timeline } from "@/components/leads/timeline";

export default function LeadProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

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
        <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">
          {/* Left Column: Lead Details & Actions */}
          <div className="w-full md:w-[400px] flex flex-col border-r border-slate-200 bg-white overflow-y-auto">
            {/* Profile Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-sm">
                {currentLead.firstName?.[0]}
                {currentLead.lastName?.[0]}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {currentLead.firstName} {currentLead.lastName}
              </h2>
              <div className="flex items-center mt-2 space-x-2">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">
                  {currentLead.loanPurpose || "General"}
                </Badge>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">
                  {currentLead.campaignStatus || "Active Campaign"}
                </Badge>
              </div>

              <div className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <Fingerprint className="h-3.5 w-3.5" />
                  Source Attribution
                </div>
                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Source</span>
                    <span className="font-semibold text-slate-900">
                      {attribution.source}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Campaign</span>
                    <span className="font-semibold text-slate-900">
                      {attribution.campaign}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Captured</span>
                    <span className="font-semibold text-slate-900">
                      {attribution.capturedAt}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 text-left">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <Tags className="h-3.5 w-3.5" />
                  Tags
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-slate-200 bg-slate-50 text-slate-700"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Compliance Badges */}
              <div className="flex items-center mt-4 space-x-2">
                <Badge
                  variant="outline"
                  className={`${currentLead.hasConsent ? "border-green-200 text-green-700 bg-green-50" : "border-red-200 text-red-700 bg-red-50"} text-[10px] uppercase font-bold`}
                >
                  {currentLead.hasConsent ? "✓ Consent" : "✗ No Consent"}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${currentLead.onDncList ? "border-red-200 text-red-700 bg-red-50" : "border-slate-200 text-slate-500 bg-white"} text-[10px] uppercase font-bold`}
                >
                  {currentLead.onDncList ? "! DNC List" : "✓ Not DNC"}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${quietHoursStatus.inQuietHours ? "border-amber-200 text-amber-700 bg-amber-50" : "border-blue-200 text-blue-700 bg-blue-50"} text-[10px] uppercase font-bold`}
                >
                  {quietHoursStatus.label}
                </Badge>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 grid grid-cols-3 gap-2 border-b border-slate-100 bg-slate-50/50">
              <Button
                variant="outline"
                className="flex flex-col h-auto py-3 bg-white hover:bg-slate-50 hover:text-blue-600 border-slate-200"
              >
                <Phone className="h-4 w-4 mb-1" />
                <span className="text-xs">Call</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-3 bg-white hover:bg-slate-50 hover:text-blue-600 border-slate-200"
              >
                <MessageSquare className="h-4 w-4 mb-1" />
                <span className="text-xs">Text</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-3 bg-white hover:bg-slate-50 hover:text-blue-600 border-slate-200"
              >
                <Mail className="h-4 w-4 mb-1" />
                <span className="text-xs">Email</span>
              </Button>
            </div>

            {/* Details Section */}
            <div className="p-6 space-y-6 flex-1">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Contact Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="h-4 w-4 mr-3 text-slate-400" />
                    {currentLead.phone || "No phone"}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="h-4 w-4 mr-3 text-slate-400" />
                    {currentLead.email}
                  </div>
                  <div className="flex items-start text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-3 text-slate-400 mt-0.5" />
                    <span>{currentLead.location || "Location unknown"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Loan Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Loan Amount</span>
                    <span className="font-semibold text-slate-900">
                      ${(currentLead.loanAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Property Value</span>
                    <span className="font-semibold text-slate-900">
                      ${(currentLead.propertyValue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Credit Score</span>
                    <span className="font-semibold text-slate-900 flex items-center">
                      <CreditCard className="h-3 w-3 mr-1 text-green-600" />
                      {currentLead.creditScore ||
                        currentLead.creditBand ||
                        "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Campaign Controls */}
              <div className="border-t pt-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Campaign Management
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">
                        {currentLead.campaignName || "Refinance Blitz"}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">
                        Current Step: 3 of 5
                      </span>
                    </div>
                    <Badge
                      className={
                        currentLead.campaignStatus === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {currentLead.campaignStatus || "PAUSED"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold"
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
                        ? "Pause Campaign"
                        : "Resume Campaign"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs font-semibold bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to stop this campaign?"
                          )
                        ) {
                          crmApi
                            .updateLeadCampaign(id, "STOPPED")
                            .then(() => leadApi.execute());
                        }
                      }}
                    >
                      Stop Campaign
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Communication History / Activity Feed */}
          <div className="flex-1 flex flex-col bg-slate-50">
            <Tabs defaultValue="all" className="flex min-h-0 flex-1 flex-col">
              {/* Feed Header */}
              <div className="h-16 px-8 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                <h2 className="text-lg font-bold text-slate-900">
                  Activity & Communications
                </h2>
                <TabsList className="bg-slate-100">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="calls">Calls</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                </TabsList>
              </div>

              {/* Scrollable Feed */}
              <ScrollArea className="flex-1 p-8">
                <TabsContent value="all" className="mt-0">
                  <Timeline
                    logs={logs}
                    isLoading={conversationApi.isLoading}
                    leadName={currentLead.firstName}
                  />
                </TabsContent>

                <TabsContent value="calls" className="mt-0">
                  <Timeline
                    logs={logs.filter(
                      (l) => l.channel === "call" || l.channel === "voicemail"
                    )}
                    isLoading={conversationApi.isLoading}
                    leadName={currentLead.firstName}
                  />
                </TabsContent>

                <TabsContent value="messages" className="mt-0">
                  <Timeline
                    logs={logs.filter(
                      (l) => l.channel === "sms" || l.channel === "email"
                    )}
                    isLoading={conversationApi.isLoading}
                    leadName={currentLead.firstName}
                  />
                </TabsContent>

                <TabsContent
                  value="pricing"
                  className="mt-0 max-w-3xl mx-auto space-y-8"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Pricing Comparison
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      Compare Conventional, FHA, VA, and HELOC options via
                      Rocket & LenderPrice.
                    </p>

                    <div className="space-y-6">
                      {/* Scenario 1: Conventional Cash Out */}
                      <Card className="border border-blue-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                        <CardHeader className="pb-3 bg-slate-50/50">
                          <div className="flex justify-between items-center">
                            <div>
                              <Badge className="bg-blue-100 text-blue-800 border-none mb-2">
                                Conventional Cash Out
                              </Badge>
                              <CardTitle className="text-lg text-slate-900">
                                Rocket Mortgage (Primary)
                              </CardTitle>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-slate-500 border-slate-200"
                            >
                              720 FICO | 80% LTV
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-y border-slate-100">
                              <tr>
                                <th className="px-6 py-3 font-semibold">
                                  Rate
                                </th>
                                <th className="px-6 py-3 font-semibold">APR</th>
                                <th className="px-6 py-3 font-semibold">
                                  Cost / Credit
                                </th>
                                <th className="px-6 py-3 font-semibold">
                                  Mo. Payment
                                </th>
                                <th className="px-6 py-3 font-semibold text-right">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              <tr className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-slate-900">
                                  6.250%
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  6.345%
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  $1,250 (0.38%)
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-900">
                                  $2,001
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                  >
                                    Propose
                                  </Button>
                                </td>
                              </tr>
                              <tr className="hover:bg-slate-50 bg-blue-50/30">
                                <td className="px-6 py-4 font-bold text-slate-900">
                                  6.500%
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  6.550%
                                </td>
                                <td className="px-6 py-4 text-green-600 font-medium">
                                  ($500) Credit
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-900">
                                  $2,054
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Propose
                                  </Button>
                                </td>
                              </tr>
                              <tr className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-slate-900">
                                  6.750%
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  6.780%
                                </td>
                                <td className="px-6 py-4 text-green-600 font-medium">
                                  ($2,100) Credit
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-900">
                                  $2,108
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                  >
                                    Propose
                                  </Button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </CardContent>
                      </Card>

                      {/* Scenario 2: FHA Cash Out (Alternative) */}
                      <Card className="border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                        <CardHeader className="pb-3 bg-slate-50/50">
                          <div className="flex justify-between items-center">
                            <div>
                              <Badge className="bg-purple-100 text-purple-800 border-none mb-2">
                                FHA Cash Out
                              </Badge>
                              <CardTitle className="text-lg text-slate-900">
                                LenderPrice (Fallback)
                              </CardTitle>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-slate-500 border-slate-200"
                            >
                              Better for &lt;680 FICO
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <table className="w-full text-sm text-left opacity-75">
                            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-y border-slate-100">
                              <tr>
                                <th className="px-6 py-3 font-semibold">
                                  Rate
                                </th>
                                <th className="px-6 py-3 font-semibold">APR</th>
                                <th className="px-6 py-3 font-semibold">
                                  Cost / Credit
                                </th>
                                <th className="px-6 py-3 font-semibold">
                                  Mo. Payment
                                </th>
                                <th className="px-6 py-3 font-semibold text-right">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              <tr className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-slate-900">
                                  5.875%
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  6.850% (inc. MIP)
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  $850 (0.26%)
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-900">
                                  $2,110
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Button size="sm" variant="outline">
                                    Propose
                                  </Button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </CardContent>
                      </Card>

                      {/* Scenario 3: HELOC (Alternative) */}
                      <Card className="border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
                        <CardHeader className="pb-3 bg-slate-50/50">
                          <div className="flex justify-between items-center">
                            <div>
                              <Badge className="bg-green-100 text-green-800 border-none mb-2">
                                HELOC / Home Equity
                              </Badge>
                              <CardTitle className="text-lg text-slate-900">
                                Rocket Mortgage
                              </CardTitle>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-slate-500 border-slate-200"
                            >
                              Keep 1st Mortgage
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="p-6 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-900 mb-1">
                                Standalone HELOC ($75,000 line)
                              </p>
                              <p className="text-xs text-slate-500">
                                Prime + 1.25% (Currently 9.75%)
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              className="text-green-700 border-green-200 hover:bg-green-50"
                            >
                              Propose HELOC Option
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <div className="max-w-3xl mx-auto flex items-end space-x-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-shadow p-2">
                    <textarea
                      className="w-full bg-transparent border-none focus:ring-0 resize-none outline-none text-sm p-2 min-h-[60px]"
                      placeholder="Type a message to send via SMS..."
                    />
                    <div className="flex justify-between items-center px-2 pb-1">
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-slate-600"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-slate-600"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <input
                          type="checkbox"
                          id="stop-msg"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="stop-msg" className="cursor-pointer">
                          Append STOP instructions
                        </label>
                      </div>
                    </div>
                  </div>
                  <Button className="h-auto py-3 bg-blue-600 hover:bg-blue-700 rounded-xl px-6">
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      )}
    </StatusGate>
  );
}

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
