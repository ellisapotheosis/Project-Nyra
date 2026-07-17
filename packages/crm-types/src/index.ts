export type CrmRecordId = string;

export type CrmConsentStatus =
  | "UNKNOWN"
  | "OPTED_IN"
  | "OPTED_OUT"
  | "DO_NOT_CONTACT";

export type TwentyLeadContract = {
  id?: CrmRecordId;
  externalId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  source?: string;
  stage?: string;
  consentStatus?: CrmConsentStatus;
  doNotContact?: boolean;
  customFields?: Record<string, unknown> & {
    dedupeKey?: string;
  };
};

export type AuditLedgerContract = {
  entityType: string;
  entityId: string;
  action: string;
  actor?: string;
  metadata?: Record<string, unknown>;
  occurredAt?: string;
};

export type CrmWritePlan = {
  lead: TwentyLeadContract;
  campaignEnrollment?: Record<string, unknown>;
  communicationLogs: Array<Record<string, unknown>>;
  quotes: Array<Record<string, unknown>>;
  auditEvents: AuditLedgerContract[];
};
