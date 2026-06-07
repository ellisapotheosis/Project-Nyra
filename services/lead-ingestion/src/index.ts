import { LeadSchema, type AuditEvent, type Lead } from "@nyra/domain-models";
import {
  MockTwentyClient,
  type ITwentyClient,
} from "@nyra/integration-adapters";
import type { CrmWritePlan } from "@nyra/crm-types";
import { z } from "zod";

export const serviceName = "lead-ingestion";
const PENDING_CRM_LEAD_ID = "pending";

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

const rawLeadPayloadSchema = z
  .object({
    id: z.string().trim().uuid().optional(),
    externalId: z.string().trim().optional(),
    firstName: z.string().trim().min(1, "First name is required").optional(),
    lastName: z.string().trim().min(1, "Last name is required").optional(),
    name: z.string().trim().optional(),
    email: z.string().trim().email("Invalid email format").optional(),
    phone: z.string().trim().optional(),
    source: z.string().trim().default("UNKNOWN"),
    consentEmail: z.boolean().default(false),
    consentSms: z.boolean().default(false),
    consentVoice: z.boolean().default(false),
    doNotContact: z.boolean().default(false),
    loanPurpose: z.string().trim().optional(),
    loanAmount: z
      .union([
        z.number().finite().nonnegative(),
        z
          .string()
          .transform((val) => Number(val.replace(/[$,\s]/g, "")))
          .refine((n) => !isNaN(n) && n >= 0, "Invalid loan amount"),
      ])
      .optional(),
    propertyState: z
      .string()
      .trim()
      .length(2, "Use 2-letter state code")
      .optional(),
    campaignId: z.string().trim().optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .superRefine((payload, context) => {
    const hasEmail = cleanString(payload.email) !== undefined;
    const hasPhone = cleanString(payload.phone) !== undefined;

    if (!hasEmail && !hasPhone) {
      context.addIssue({
        code: "custom",
        path: ["email"],
        message: "Lead ingestion requires an email or phone for dedupe.",
      });
    }
  });

export function validateRawLeadPayload(rawPayload: unknown): RawLeadPayload {
  return rawLeadPayloadSchema.parse(rawPayload) as RawLeadPayload;
}

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
    const validatedPayload = validateRawLeadPayload(rawPayload);
    const normalized = normalizeLeadPayload(validatedPayload, {
      id: validatedPayload.id ?? this.idFactory(),
    });
    const dedupeKey = getLeadDedupeKey(normalized);
    const existingLead = await this.store.findByDedupeKey(dedupeKey);
    const now = this.now();

    const lead = LeadSchema.parse({
      ...existingLead,
      ...normalized,
      ...preserveComplianceBlock(existingLead),
      id: existingLead?.id ?? normalized.id,
      createdAt: existingLead?.createdAt ?? now,
      updatedAt: now,
      metadata: {
        ...(existingLead?.metadata ?? {}),
        ...(normalized.metadata ?? {}),
        dedupeKey,
        consent: {
          email: validatedPayload.consentEmail === true,
          sms: validatedPayload.consentSms === true,
          voice: validatedPayload.consentVoice === true,
        },
      },
    });

    const savedLead = await this.crm.upsertLead(lead);
    await this.store.saveDedupeKey(dedupeKey, savedLead);

    const dedupeOutcome = existingLead ? "UPDATED" : "CREATED";
    const campaignEligibility = determineCampaignEligibility(
      savedLead,
      validatedPayload
    );

    const auditEvents = buildLeadAuditEvents({
      lead: savedLead,
      rawPayload: validatedPayload,
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
        rawPayload: validatedPayload,
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
  const validatedPayload = validateRawLeadPayload(rawPayload);
  const nameParts = splitName(validatedPayload.name);
  const email = normalizeEmail(validatedPayload.email);
  const phone = normalizePhone(validatedPayload.phone);
  const firstName =
    cleanString(validatedPayload.firstName) ?? nameParts.firstName;
  const lastName = cleanString(validatedPayload.lastName) ?? nameParts.lastName;

  return LeadSchema.parse({
    id: options.id,
    externalId: cleanString(validatedPayload.externalId),
    firstName,
    lastName,
    email,
    phone,
    source: cleanString(validatedPayload.source) ?? "UNKNOWN",
    consentStatus: deriveConsentStatus(validatedPayload),
    doNotContact: validatedPayload.doNotContact === true,
    metadata: {
      ...(validatedPayload.metadata ?? {}),
      loanPurpose: cleanString(validatedPayload.loanPurpose),
      loanAmount: normalizeNumber(validatedPayload.loanAmount),
      propertyState: cleanString(validatedPayload.propertyState)?.toUpperCase(),
      campaignId: cleanString(validatedPayload.campaignId),
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

function preserveComplianceBlock(
  existingLead: Lead | undefined
): Partial<Pick<Lead, "consentStatus" | "doNotContact">> {
  if (
    !existingLead ||
    (!existingLead.doNotContact &&
      existingLead.consentStatus !== "DO_NOT_CONTACT")
  ) {
    return {};
  }

  return {
    consentStatus: "DO_NOT_CONTACT",
    doNotContact: true,
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
  const isCreate = input.dedupeOutcome === "CREATED";
  const leadId = isCreate
    ? PENDING_CRM_LEAD_ID
    : (input.lead.id ?? input.dedupeKey);
  const campaignId = cleanString(input.rawPayload.campaignId);

  return {
    lead: {
      id: isCreate ? undefined : input.lead.id,
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
    auditEvents: input.auditEvents.map((event) => {
      const shouldRekeyCreateEvent =
        isCreate &&
        (event.entityType === "LEAD" ||
          event.entityType === "CAMPAIGN_ENROLLMENT");
      const entityId = shouldRekeyCreateEvent
        ? PENDING_CRM_LEAD_ID
        : event.entityId;

      return {
        id: event.id,
        entityType:
          event.entityType === "CAMPAIGN_ENROLLMENT"
            ? "CAMPAIGN_ENROLLMENT"
            : "LEAD",
        entityId,
        action: event.action,
        performer: event.performer,
        riskLevel: event.riskLevel,
        occurredAt: event.timestamp.toISOString(),
        details: event.details,
      };
    }),
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
