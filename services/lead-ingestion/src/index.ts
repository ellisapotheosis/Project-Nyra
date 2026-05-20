import { LeadSchema, type AuditEvent, type Lead } from "@nyra/domain-models";
import {
  MockTwentyClient,
  type ITwentyClient,
} from "@nyra/integration-adapters";
import type { CrmWritePlan } from "@nyra/crm-types";

export const serviceName = "lead-ingestion";

export type RawLeadPayload = {
  id?: string;
  externalId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  consentEmail?: boolean;
  consentSms?: boolean;
  consentVoice?: boolean;
  doNotContact?: boolean;
  loanPurpose?: "PURCHASE" | "REFINANCE" | "HELOC" | string;
  loanAmount?: number | string;
  propertyState?: string;
  campaignId?: string;
  metadata?: Record<string, unknown>;
};

export type LeadIngestionEvent =
  | {
      type: "lead.created" | "lead.updated";
      leadId: string;
      dedupeKey: string;
      occurredAt: string;
    }
  | {
      type: "campaign.eligible";
      leadId: string;
      campaignId: string;
      occurredAt: string;
    }
  | {
      type: "campaign.ineligible";
      leadId: string;
      reason: CampaignEligibility["reason"];
      occurredAt: string;
    };

export type CampaignEligibility =
  | {
      eligible: true;
      campaignId: string;
      reason: "QUALIFIED_WITH_CONSENT";
    }
  | {
      eligible: false;
      reason:
        | "MISSING_CAMPAIGN"
        | "MISSING_CONSENT"
        | "DO_NOT_CONTACT"
        | "INVALID_DESTINATION";
    };

export type IngestLeadResult = {
  lead: Lead;
  dedupeKey: string;
  dedupeOutcome: "CREATED" | "UPDATED";
  campaignEligibility: CampaignEligibility;
  events: LeadIngestionEvent[];
  auditEvents: AuditEvent[];
  crmWritePlan: CrmWritePlan;
};

export interface CrmWritePlanPersistenceClient {
  execute(plan: CrmWritePlan): Promise<unknown>;
}

export interface LeadIngestionStore {
  findByDedupeKey(dedupeKey: string): Promise<Lead | undefined>;
  saveDedupeKey(dedupeKey: string, lead: Lead): Promise<void>;
}

export class InMemoryLeadIngestionStore implements LeadIngestionStore {
  private readonly leadsByDedupeKey = new Map<string, Lead>();

  async findByDedupeKey(dedupeKey: string): Promise<Lead | undefined> {
    return this.leadsByDedupeKey.get(dedupeKey);
  }

  async saveDedupeKey(dedupeKey: string, lead: Lead): Promise<void> {
    this.leadsByDedupeKey.set(dedupeKey, lead);
  }
}

export type LeadIngestionServiceOptions = {
  crm?: ITwentyClient;
  store?: LeadIngestionStore;
  now?: () => Date;
  idFactory?: () => string;
};

export class LeadIngestionService {
  private readonly crm: ITwentyClient;
  private readonly store: LeadIngestionStore;
  private readonly now: () => Date;
  private readonly idFactory: () => string;

  constructor(options: LeadIngestionServiceOptions = {}) {
    this.crm = options.crm ?? new MockTwentyClient();
    this.store = options.store ?? new InMemoryLeadIngestionStore();
    this.now = options.now ?? (() => new Date());
    this.idFactory = options.idFactory ?? createUuid;
  }

  async ingest(rawPayload: RawLeadPayload): Promise<IngestLeadResult> {
    const normalized = normalizeLeadPayload(rawPayload, {
      id: rawPayload.id ?? this.idFactory(),
    });
    const dedupeKey = getLeadDedupeKey(normalized);
    const existingLead = await this.store.findByDedupeKey(dedupeKey);
    const now = this.now();

    const lead = LeadSchema.parse({
      ...existingLead,
      ...normalized,
      id: existingLead?.id ?? normalized.id,
      createdAt: existingLead?.createdAt ?? now,
      updatedAt: now,
      metadata: {
        ...(existingLead?.metadata ?? {}),
        ...(normalized.metadata ?? {}),
        dedupeKey,
        consent: {
          email: rawPayload.consentEmail === true,
          sms: rawPayload.consentSms === true,
          voice: rawPayload.consentVoice === true,
        },
      },
    });

    const savedLead = await this.crm.upsertLead(lead);
    await this.store.saveDedupeKey(dedupeKey, savedLead);

    const dedupeOutcome = existingLead ? "UPDATED" : "CREATED";
    const campaignEligibility = determineCampaignEligibility(
      savedLead,
      rawPayload
    );

    const auditEvents = buildLeadAuditEvents({
      lead: savedLead,
      rawPayload,
      dedupeKey,
      dedupeOutcome,
      campaignEligibility,
      timestamp: now,
    });

    return {
      lead: savedLead,
      dedupeKey,
      dedupeOutcome,
      campaignEligibility,
      events: buildLeadEvents({
        lead: savedLead,
        dedupeKey,
        dedupeOutcome,
        campaignEligibility,
        occurredAt: now.toISOString(),
      }),
      auditEvents,
      crmWritePlan: buildCrmWritePlan({
        lead: savedLead,
        rawPayload,
        dedupeKey,
        dedupeOutcome,
        campaignEligibility,
        auditEvents,
        timestamp: now,
      }),
    };
  }
}

export async function persistCrmWritePlan(
  result: IngestLeadResult,
  client: CrmWritePlanPersistenceClient
): Promise<unknown> {
  return client.execute(result.crmWritePlan);
}

type NormalizeOptions = {
  id: string;
};

export function normalizeLeadPayload(
  rawPayload: RawLeadPayload,
  options: NormalizeOptions
): Lead {
  const nameParts = splitName(rawPayload.name);
  const email = normalizeEmail(rawPayload.email);
  const phone = normalizePhone(rawPayload.phone);
  const firstName = cleanString(rawPayload.firstName) ?? nameParts.firstName;
  const lastName = cleanString(rawPayload.lastName) ?? nameParts.lastName;

  return LeadSchema.parse({
    id: options.id,
    externalId: cleanString(rawPayload.externalId),
    firstName,
    lastName,
    email,
    phone,
    source: cleanString(rawPayload.source) ?? "UNKNOWN",
    consentStatus: deriveConsentStatus(rawPayload),
    doNotContact: rawPayload.doNotContact === true,
    metadata: {
      ...(rawPayload.metadata ?? {}),
      loanPurpose: cleanString(rawPayload.loanPurpose),
      loanAmount: normalizeNumber(rawPayload.loanAmount),
      propertyState: cleanString(rawPayload.propertyState)?.toUpperCase(),
      campaignId: cleanString(rawPayload.campaignId),
    },
  });
}

export function getLeadDedupeKey(lead: Pick<Lead, "email" | "phone">): string {
  if (lead.email) {
    return `email:${normalizeEmail(lead.email)}`;
  }

  if (lead.phone) {
    return `phone:${normalizePhone(lead.phone)}`;
  }

  throw new Error("Lead dedupe requires email or phone");
}

export function determineCampaignEligibility(
  lead: Lead,
  rawPayload: Pick<
    RawLeadPayload,
    "campaignId" | "consentEmail" | "consentSms" | "consentVoice"
  >
): CampaignEligibility {
  const campaignId = cleanString(rawPayload.campaignId);

  if (!campaignId) {
    return { eligible: false, reason: "MISSING_CAMPAIGN" };
  }

  if (lead.doNotContact || lead.consentStatus === "DO_NOT_CONTACT") {
    return { eligible: false, reason: "DO_NOT_CONTACT" };
  }

  if (!lead.email && !lead.phone) {
    return { eligible: false, reason: "INVALID_DESTINATION" };
  }

  if (
    rawPayload.consentEmail !== true &&
    rawPayload.consentSms !== true &&
    rawPayload.consentVoice !== true
  ) {
    return { eligible: false, reason: "MISSING_CONSENT" };
  }

  return {
    eligible: true,
    campaignId,
    reason: "QUALIFIED_WITH_CONSENT",
  };
}

type BuildLeadEventsInput = {
  lead: Lead;
  dedupeKey: string;
  dedupeOutcome: IngestLeadResult["dedupeOutcome"];
  campaignEligibility: CampaignEligibility;
  occurredAt: string;
};

function buildLeadEvents(input: BuildLeadEventsInput): LeadIngestionEvent[] {
  const leadId = input.lead.id ?? input.dedupeKey;
  const events: LeadIngestionEvent[] = [
    {
      type: input.dedupeOutcome === "CREATED" ? "lead.created" : "lead.updated",
      leadId,
      dedupeKey: input.dedupeKey,
      occurredAt: input.occurredAt,
    },
  ];

  if (input.campaignEligibility.eligible) {
    events.push({
      type: "campaign.eligible",
      leadId,
      campaignId: input.campaignEligibility.campaignId,
      occurredAt: input.occurredAt,
    });
  } else {
    events.push({
      type: "campaign.ineligible",
      leadId,
      reason: input.campaignEligibility.reason,
      occurredAt: input.occurredAt,
    });
  }

  return events;
}

type BuildLeadAuditEventsInput = {
  lead: Lead;
  rawPayload: RawLeadPayload;
  dedupeKey: string;
  dedupeOutcome: IngestLeadResult["dedupeOutcome"];
  campaignEligibility: CampaignEligibility;
  timestamp: Date;
};

function buildLeadAuditEvents(input: BuildLeadAuditEventsInput): AuditEvent[] {
  const entityId = input.lead.id ?? input.dedupeKey;

  return [
    {
      entityType: "LEAD",
      entityId,
      action: `LEAD_${input.dedupeOutcome}`,
      riskLevel: "CRM_MUTATION",
      performer: "lead-ingestion",
      details: {
        source: input.lead.source,
        externalId: input.lead.externalId,
        dedupeKey: input.dedupeKey,
        hasEmail: Boolean(input.lead.email),
        hasPhone: Boolean(input.lead.phone),
      },
      timestamp: input.timestamp,
    },
    {
      entityType: "CAMPAIGN_ENROLLMENT",
      entityId,
      action: input.campaignEligibility.eligible
        ? "CAMPAIGN_ELIGIBLE"
        : "CAMPAIGN_BLOCKED",
      riskLevel: "COMPLIANCE_CRITICAL",
      performer: "lead-ingestion",
      details: {
        campaignId: input.rawPayload.campaignId,
        eligibility: input.campaignEligibility,
      },
      timestamp: input.timestamp,
    },
  ];
}

type BuildCrmWritePlanInput = BuildLeadAuditEventsInput & {
  auditEvents: AuditEvent[];
};

export function buildCrmWritePlan(input: BuildCrmWritePlanInput): CrmWritePlan {
  const leadId = input.lead.id ?? input.dedupeKey;
  const campaignId = cleanString(input.rawPayload.campaignId);

  return {
    lead: {
      id: input.lead.id,
      externalId: input.lead.externalId,
      firstName: input.lead.firstName,
      lastName: input.lead.lastName,
      email: input.lead.email,
      phone: input.lead.phone,
      source: input.lead.source,
      stage: input.lead.stage,
      consentStatus: input.lead.consentStatus,
      doNotContact: input.lead.doNotContact,
      customFields: {
        ...(input.lead.metadata ?? {}),
        dedupeKey: input.dedupeKey,
        campaignId,
        campaignStatus: input.campaignEligibility.eligible
          ? "ACTIVE"
          : "STOPPED",
      },
    },
    campaignEnrollment:
      input.campaignEligibility.eligible && campaignId
        ? {
            leadId,
            campaignId,
            status: "ACTIVE",
            currentStepIndex: 0,
          }
        : undefined,
    communicationLogs: [],
    quotes: [],
    auditEvents: input.auditEvents.map((event) => ({
      id: event.id,
      entityType:
        event.entityType === "CAMPAIGN_ENROLLMENT"
          ? "CAMPAIGN_ENROLLMENT"
          : "LEAD",
      entityId: event.entityId,
      action: event.action,
      performer: event.performer,
      riskLevel: event.riskLevel,
      occurredAt: event.timestamp.toISOString(),
      details: event.details,
    })),
  };
}

function deriveConsentStatus(
  rawPayload: RawLeadPayload
): Lead["consentStatus"] {
  if (rawPayload.doNotContact) {
    return "DO_NOT_CONTACT";
  }

  if (
    rawPayload.consentEmail === true ||
    rawPayload.consentSms === true ||
    rawPayload.consentVoice === true
  ) {
    return "OPTED_IN";
  }

  return "UNKNOWN";
}

function splitName(name: string | undefined): {
  firstName: string | undefined;
  lastName: string | undefined;
} {
  const cleanName = cleanString(name);

  if (!cleanName) {
    return { firstName: undefined, lastName: undefined };
  }

  const parts = cleanName.split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ") || "Unknown";

  return { firstName, lastName };
}

function normalizeEmail(email: string | undefined): string | undefined {
  return cleanString(email)?.toLowerCase();
}

function normalizePhone(phone: string | undefined): string | undefined {
  const digits = cleanString(phone)?.replace(/\D/g, "");

  if (!digits) {
    return undefined;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  return `+${digits}`;
}

function normalizeNumber(
  value: number | string | undefined
): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number(value.replace(/[$,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function cleanString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const cleanValue = value.trim();
  return cleanValue.length > 0 ? cleanValue : undefined;
}

function createUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (token) => {
    const value = Math.floor(Math.random() * 16);
    const nibble = token === "x" ? value : (value & 0x3) | 0x8;
    return nibble.toString(16);
  });
}
