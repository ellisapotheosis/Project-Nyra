export type CrmRecordId = string;

export type CrmChannel = "SMS" | "EMAIL" | "CALL" | "VOICEMAIL" | "WEBHOOK";

export type CrmConsentStatus =
  | "UNKNOWN"
  | "OPTED_IN"
  | "OPTED_OUT"
  | "DO_NOT_CONTACT";

export type CrmLeadStage =
  | "NEW"
  | "CONTACTED"
  | "NURTURING"
  | "APPLICATION_STARTED"
  | "DOCS_NEEDED"
  | "SUBMITTED"
  | "APPROVED"
  | "CLEAR_TO_CLOSE"
  | "FUNDED"
  | "LOST"
  | "DO_NOT_CONTACT";

export type TwentyLeadContract = {
  id?: CrmRecordId;
  externalId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: string;
  stage: CrmLeadStage;
  consentStatus: CrmConsentStatus;
  doNotContact: boolean;
  customFields?: {
    dedupeKey?: string;
    campaignId?: string;
    campaignStatus?: CampaignEnrollmentStatus;
    loanPurpose?: "PURCHASE" | "REFINANCE" | "HELOC" | string;
    loanAmount?: number;
    propertyState?: string;
    [key: string]: unknown;
  };
};

export type CampaignEnrollmentStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "STOPPED";

export type CampaignEnrollmentContract = {
  id?: CrmRecordId;
  leadId: CrmRecordId;
  campaignId: string;
  status: CampaignEnrollmentStatus;
  currentStepIndex: number;
  nextTouchAt?: string;
  lastActivityAt?: string;
};

export type CommunicationLogContract = {
  id?: CrmRecordId;
  leadId: CrmRecordId;
  channel: CrmChannel;
  direction: "INBOUND" | "OUTBOUND";
  contentPreview: string;
  providerMessageId?: string;
  complianceDecisionId?: string;
  sentAt: string;
};

export type QuoteScenarioContract = {
  label: "LOWEST_PAYMENT" | "BALANCED" | "LOWEST_COST";
  programName: string;
  loanAmount: number;
  interestRate: number;
  apr: number;
  loanTermYears: number;
  monthlyPayment: number;
  closingCosts: number;
  points: number;
};

export type QuoteContract = {
  id?: CrmRecordId;
  leadId: CrmRecordId;
  quoteNumber: string;
  version: number;
  status: "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "EXPIRED";
  options: [
    QuoteScenarioContract,
    QuoteScenarioContract,
    QuoteScenarioContract,
  ];
  assumptions: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
};

export type AuditLedgerContract = {
  id?: CrmRecordId;
  entityType:
    | "LEAD"
    | "CAMPAIGN_ENROLLMENT"
    | "COMMUNICATION_LOG"
    | "QUOTE"
    | "COMPLIANCE_EVENT";
  entityId: string;
  action: string;
  performer: string;
  riskLevel:
    | "READ_ONLY"
    | "INTERNAL_MUTATION"
    | "CRM_MUTATION"
    | "BORROWER_COMMUNICATION"
    | "COMPLIANCE_CRITICAL";
  occurredAt: string;
  details?: Record<string, unknown>;
};

export type CrmWritePlan = {
  lead: TwentyLeadContract;
  campaignEnrollment?: CampaignEnrollmentContract;
  communicationLogs: CommunicationLogContract[];
  quotes: QuoteContract[];
  auditEvents: AuditLedgerContract[];
};
