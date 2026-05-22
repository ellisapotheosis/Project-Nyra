"use client";

import type { Lead } from "@/lib/api";

import { AttributionCard } from "./attribution-card";
import { CampaignControlPanel } from "./campaign-control";
import { ComplianceMatrix } from "./compliance-matrix";
import { LeadIntelligenceCard } from "./lead-intelligence-card";
import { LeadProfileHeader } from "./profile-header";
import { SyncStatusCard } from "./sync-status-card";

interface LeadProfileSidebarProps {
  lead: Lead;
  leadId: string;
  attribution: {
    source: string;
    campaign: string;
  };
  workspaceStatus: Array<{ label: string; value: string; ok: boolean }>;
  quietHoursStatus: {
    inQuietHours: boolean;
    label: string;
  };
  isLoading?: boolean;
  onPauseResume: () => void;
  onStop: () => void;
}

export function LeadProfileSidebar({
  lead,
  leadId,
  attribution,
  workspaceStatus,
  quietHoursStatus,
  isLoading,
  onPauseResume,
  onStop,
}: LeadProfileSidebarProps) {
  return (
    <div className="w-full md:w-[380px] flex flex-col border-r border-border/40 bg-card/20 overflow-y-auto scrollbar-hide">
      <LeadProfileHeader
        firstName={lead.firstName}
        lastName={lead.lastName}
        id={leadId}
        loanPurpose={lead.loanPurpose}
        campaignStatus={lead.campaignStatus}
      />

      <div className="px-6 pb-6 w-full space-y-3">
        <AttributionCard
          source={attribution.source}
          campaign={attribution.campaign}
        />
        <SyncStatusCard status={workspaceStatus} />
      </div>

      <ComplianceMatrix
        hasConsent={lead.hasConsent}
        onDncList={lead.onDncList}
        quietHoursStatus={quietHoursStatus}
      />

      <div className="p-6 space-y-8 flex-1">
        <LeadIntelligenceCard lead={lead} />

        <CampaignControlPanel
          campaignName={lead.campaignName}
          campaignStatus={lead.campaignStatus}
          isLoading={isLoading}
          onPauseResume={onPauseResume}
          onStop={onStop}
        />
      </div>
    </div>
  );
}
