"use client";

import React from "react";
import { useParams } from "next/navigation";

import { crmApi, type Lead, useApi } from "@/lib/api";
import { StatusGate } from "@/components/status-gate";
import { LeadActivityWorkspace } from "@/components/leads/profile-sections/lead-activity-workspace";
import { LeadProfileSidebar } from "@/components/leads/profile-sections/lead-profile-sidebar";

export default function LeadProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

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
  const workspaceStatus = getWorkspaceStatus(lead);

  return (
    <StatusGate
      data={lead ?? null}
      isLoading={leadApi.isLoading}
      error={leadApi.error}
      onRetry={() => {
        leadApi.execute();
        conversationApi.execute();
      }}
    >
      {(currentLead: Lead) => (
        <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
          <LeadProfileSidebar
            lead={currentLead}
            leadId={id}
            attribution={attribution}
            workspaceStatus={workspaceStatus}
            quietHoursStatus={quietHoursStatus}
            isLoading={leadApi.isLoading}
            onPauseResume={() => {
              crmApi
                .updateLeadCampaign(
                  id,
                  currentLead.campaignStatus === "ACTIVE" ? "PAUSED" : "ACTIVE"
                )
                .then(() => leadApi.execute());
            }}
            onStop={() => {
              if (confirm("Stop automation for this lead?")) {
                crmApi.updateLeadCampaign(id, "STOPPED").then(() => {
                  leadApi.execute();
                });
              }
            }}
          />

          <LeadActivityWorkspace
            lead={currentLead}
            logs={logs}
            isLoading={conversationApi.isLoading}
          />
        </div>
      )}
    </StatusGate>
  );
}

// ... helper functions (getQuietHoursStatus, etc) remain the same ...
function getQuietHoursStatus(lead: Lead | null | undefined): {
  inQuietHours: boolean;
  label: string;
} {
  const timeZone =
    getLeadString(lead, "timeZone") ||
    getLeadString(lead, "timezone") ||
    timeZoneForState(lead?.propertyState || getLeadString(lead, "state")) ||
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

function getSourceAttribution(lead: Lead | null | undefined): {
  source: string;
  campaign: string;
  capturedAt: string;
} {
  return {
    source:
      lead?.source ||
      getLeadString(lead, "leadSource") ||
      getLeadString(lead, "utmSource") ||
      "Direct",
    campaign:
      getLeadString(lead, "utmCampaign") ||
      getLeadString(lead, "campaignName") ||
      getLeadString(lead, "campaignId") ||
      "Unattributed",
    capturedAt: lead?.createdAt
      ? formatShortDate(lead.createdAt)
      : getLeadString(lead, "lastTouch") || "Unknown",
  };
}

function getWorkspaceStatus(
  lead: Lead | null | undefined
): Array<{ label: string; value: string; ok: boolean }> {
  const workspace = getLeadRecord(lead, "workspace");
  const compliance = getNestedRecord(workspace, "compliance");
  const campaign = getNestedRecord(workspace, "campaign");
  const quote = getNestedRecord(workspace, "quote");
  const campaignStatus =
    getNestedString(campaign, "status") || lead?.campaignStatus;

  return [
    {
      label: "CRM",
      value: workspace?.crmBacked === true ? "Live" : "Mock",
      ok: workspace?.crmBacked === true,
    },
    {
      label: "Compliance",
      value: compliance?.sendBlocked === true ? "Blocked" : "Eligible",
      ok: compliance?.sendBlocked !== true,
    },
    {
      label: "Campaign",
      value: campaignStatus || "Unassigned",
      ok: campaignStatus === "ACTIVE",
    },
    {
      label: "Quotes",
      value:
        quote?.sourceOfTruth === "quote-service" ? "Service Owned" : "Pending",
      ok: quote?.sourceOfTruth === "quote-service",
    },
  ];
}

function getLeadString(
  lead: Lead | null | undefined,
  field: string
): string | undefined {
  const value = lead?.[field];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getLeadRecord(
  lead: Lead | null | undefined,
  field: string
): Record<string, unknown> | undefined {
  const value = lead?.[field];
  return isRecord(value) ? value : undefined;
}

function getNestedRecord(
  record: Record<string, unknown> | undefined,
  field: string
): Record<string, unknown> | undefined {
  const value = record?.[field];
  return isRecord(value) ? value : undefined;
}

function getNestedString(
  record: Record<string, unknown> | undefined,
  field: string
): string | undefined {
  const value = record?.[field];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
