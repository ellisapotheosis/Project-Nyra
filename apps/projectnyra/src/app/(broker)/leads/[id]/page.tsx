"use client";

import React from "react";

import { LeadWorkspace } from "@/components/lead/lead-workspace";
import { StatusGate } from "@nyra/ui";
import { crmApi, useApi } from "@/lib/api";

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
      {(currentLead) => (
        <LeadWorkspace
          lead={currentLead}
          logs={logs}
          isTimelineLoading={conversationApi.isLoading}
          quietHoursLabel={quietHoursStatus.label}
          inQuietHours={quietHoursStatus.inQuietHours}
          onToggleCampaign={() => {
            crmApi
              .updateLeadCampaign(
                id,
                currentLead.campaignStatus === "ACTIVE" ? "PAUSED" : "ACTIVE"
              )
              .then(() => leadApi.execute());
          }}
          onStopCampaign={() => {
            crmApi
              .updateLeadCampaign(id, "STOPPED")
              .then(() => leadApi.execute());
          }}
        />
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
