import { z } from "zod";
import type { AuditEvent } from "@nyra/domain-models";

export const serviceName = "soft-pull-credit";

export const CreditProviderSchema = z.enum([
  "CERTIFIED_CREDIT",
  "EQUIFAX",
  "MOCK",
  "OTHER_APPROVED",
]);
export type CreditProvider = z.infer<typeof CreditProviderSchema>;

export const CreditTierSchema = z.enum([
  "EXCELLENT",
  "GOOD",
  "FAIR",
  "POOR",
  "INELIGIBLE",
]);
export type CreditTier = z.infer<typeof CreditTierSchema>;

export const BorrowerCreditIdentitySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().min(8),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().length(2),
  postalCode: z.string().min(5),
  ssn: z.string().min(4).optional(),
  ssnLastFour: z.string().length(4).optional(),
});
export type BorrowerCreditIdentity = z.infer<
  typeof BorrowerCreditIdentitySchema
>;

export const SoftPullRequestSchema = z.object({
  leadId: z.string().uuid(),
  borrowerId: z.string().uuid().optional(),
  consentEventId: z.string().min(1),
  requestedBy: z.string().min(1),
  provider: CreditProviderSchema.default("MOCK"),
  purpose: z.enum(["QUOTE_INPUT", "PREQUALIFICATION"]).default("QUOTE_INPUT"),
  correlationId: z.string().min(1).optional(),
  identity: BorrowerCreditIdentitySchema,
});
export type SoftPullRequest = z.infer<typeof SoftPullRequestSchema>;

export const SoftPullSummarySchema = z.object({
  softPullId: z.string().min(1),
  leadId: z.string().uuid(),
  borrowerId: z.string().uuid().optional(),
  consentEventId: z.string().min(1),
  provider: CreditProviderSchema,
  fico: z.number().int().min(300).max(850),
  tier: CreditTierSchema,
  scoreModel: z.string().min(1),
  pulledAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  sourceReference: z.string().min(1).optional(),
});
export type SoftPullSummary = z.infer<typeof SoftPullSummarySchema>;

export const QuoteCreditInputSchema = z.object({
  source: z.literal("SOFT_PULL_CREDIT_SUMMARY"),
  softPullId: z.string().min(1),
  consentEventId: z.string().min(1),
  fico: z.number().int().min(300).max(850),
  tier: CreditTierSchema,
  scoreModel: z.string().min(1),
  provider: CreditProviderSchema,
  pulledAt: z.string().datetime(),
});
export type QuoteCreditInput = z.infer<typeof QuoteCreditInputSchema>;

export type SoftPullStatus = "PENDING" | "SUBMITTED" | "COMPLETED" | "FAILED";

export type SoftPullRecord = {
  id: string;
  leadId: string;
  borrowerId?: string;
  consentEventId: string;
  provider: CreditProvider;
  status: SoftPullStatus;
  requestedBy: string;
  purpose: SoftPullRequest["purpose"];
  correlationId: string;
  requestedAt: string;
  updatedAt: string;
  summary?: SoftPullSummary;
  failureReason?: string;
};

export type QuoteInputEvent = {
  type: "quote.credit_input.available";
  leadId: string;
  softPullId: string;
  consentEventId: string;
  quoteCreditInput: QuoteCreditInput;
  occurredAt: string;
  correlationId: string;
};

export type SoftPullRequestResult = {
  record: SoftPullRecord;
  quoteInputEvent?: QuoteInputEvent;
  auditEvents: AuditEvent[];
};

export interface SoftPullCreditProvider {
  readonly provider: CreditProvider;
  requestSoftPull(input: ProviderSoftPullInput): Promise<ProviderSoftPullResult>;
}

export type ProviderSoftPullInput = {
  requestId: string;
  consentEventId: string;
  identity: BorrowerCreditIdentity;
  correlationId: string;
};

export type ProviderSoftPullResult = {
  fico: number;
  scoreModel: string;
  sourceReference?: string;
};

export interface SoftPullStore {
  save(record: SoftPullRecord): Promise<void>;
  get(id: string): Promise<SoftPullRecord | undefined>;
}

export class InMemorySoftPullStore implements SoftPullStore {
  private readonly records = new Map<string, SoftPullRecord>();

  async save(record: SoftPullRecord): Promise<void> {
    this.records.set(record.id, record);
  }

  async get(id: string): Promise<SoftPullRecord | undefined> {
    return this.records.get(id);
  }
}

export type SoftPullCreditServiceOptions = {
  provider?: SoftPullCreditProvider;
  store?: SoftPullStore;
  now?: () => Date;
  idFactory?: () => string;
};

export class SoftPullCreditService {
  private readonly provider: SoftPullCreditProvider;
  private readonly store: SoftPullStore;
  private readonly now: () => Date;
  private readonly idFactory: () => string;

  constructor(options: SoftPullCreditServiceOptions = {}) {
    this.provider = options.provider ?? new MockSoftPullCreditProvider();
    this.store = options.store ?? new InMemorySoftPullStore();
    this.now = options.now ?? (() => new Date());
    this.idFactory = options.idFactory ?? createUuid;
  }

  async requestSoftPull(
    rawInput: unknown
  ): Promise<SoftPullRequestResult> {
    const input = SoftPullRequestSchema.parse(rawInput);
    const requestedAt = this.now().toISOString();
    const requestId = this.idFactory();
    const correlationId = input.correlationId ?? requestId;

    const submittedRecord: SoftPullRecord = {
      id: requestId,
      leadId: input.leadId,
      borrowerId: input.borrowerId,
      consentEventId: input.consentEventId,
      provider: input.provider,
      status: "SUBMITTED",
      requestedBy: input.requestedBy,
      purpose: input.purpose,
      correlationId,
      requestedAt,
      updatedAt: requestedAt,
    };
    await this.store.save(submittedRecord);

    try {
      const providerResult = await this.provider.requestSoftPull({
        requestId,
        consentEventId: input.consentEventId,
        identity: input.identity,
        correlationId,
      });
      const completedAt = this.now().toISOString();
      const summary = SoftPullSummarySchema.parse({
        softPullId: requestId,
        leadId: input.leadId,
        borrowerId: input.borrowerId,
        consentEventId: input.consentEventId,
        provider: this.provider.provider,
        fico: providerResult.fico,
        tier: creditTierForFico(providerResult.fico),
        scoreModel: providerResult.scoreModel,
        pulledAt: completedAt,
        expiresAt: addDays(this.now(), 30).toISOString(),
        sourceReference: providerResult.sourceReference,
      });
      const record: SoftPullRecord = {
        ...submittedRecord,
        provider: this.provider.provider,
        status: "COMPLETED",
        updatedAt: completedAt,
        summary,
      };
      await this.store.save(record);

      const quoteCreditInput = toQuoteCreditInput(summary);
      return {
        record,
        quoteInputEvent: {
          type: "quote.credit_input.available",
          leadId: input.leadId,
          softPullId: requestId,
          consentEventId: input.consentEventId,
          quoteCreditInput,
          occurredAt: completedAt,
          correlationId,
        },
        auditEvents: [
          createAuditEvent({
            action: "SOFT_PULL_REQUESTED",
            entityId: requestId,
            leadId: input.leadId,
            requestedBy: input.requestedBy,
            correlationId,
            details: redactSoftPullPayload(input),
            timestamp: requestedAt,
          }),
          createAuditEvent({
            action: "SOFT_PULL_COMPLETED",
            entityId: requestId,
            leadId: input.leadId,
            requestedBy: input.requestedBy,
            correlationId,
            details: {
              consentEventId: input.consentEventId,
              provider: this.provider.provider,
              fico: summary.fico,
              tier: summary.tier,
              scoreModel: summary.scoreModel,
            },
            timestamp: completedAt,
          }),
        ],
      };
    } catch (error) {
      const failedAt = this.now().toISOString();
      const record: SoftPullRecord = {
        ...submittedRecord,
        status: "FAILED",
        updatedAt: failedAt,
        failureReason: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      };
      await this.store.save(record);

      return {
        record,
        auditEvents: [
          createAuditEvent({
            action: "SOFT_PULL_FAILED",
            entityId: requestId,
            leadId: input.leadId,
            requestedBy: input.requestedBy,
            correlationId,
            details: {
              consentEventId: input.consentEventId,
              provider: this.provider.provider,
              failureReason: record.failureReason,
            },
            timestamp: failedAt,
          }),
        ],
      };
    }
  }

  async getStatus(id: string): Promise<SoftPullRecord | undefined> {
    const record = await this.store.get(id);
    if (!record) {
      return undefined;
    }

    return removeSummaryFromStatus(record);
  }

  async getSummary(id: string): Promise<SoftPullSummary | undefined> {
    const record = await this.store.get(id);
    return record?.summary;
  }
}

export class MockSoftPullCreditProvider implements SoftPullCreditProvider {
  readonly provider = "MOCK" as const;

  async requestSoftPull(
    input: ProviderSoftPullInput
  ): Promise<ProviderSoftPullResult> {
    const seed = input.identity.ssnLastFour ?? input.identity.ssn?.slice(-4);
    const numericSeed = seed ? Number(seed) : 740;
    const fico = Number.isFinite(numericSeed)
      ? 620 + (numericSeed % 201)
      : 740;

    return {
      fico,
      scoreModel: "MOCK_MORTGAGE_FICO_V1",
      sourceReference: `mock-${input.requestId}`,
    };
  }
}

export class CertifiedCreditProvider implements SoftPullCreditProvider {
  readonly provider = "CERTIFIED_CREDIT" as const;

  constructor(private readonly configured: boolean) {}

  async requestSoftPull(): Promise<ProviderSoftPullResult> {
    if (!this.configured) {
      throw new Error("CERTIFIED_CREDIT_PROVIDER_NOT_CONFIGURED");
    }

    throw new Error("CERTIFIED_CREDIT_ADAPTER_NOT_IMPLEMENTED");
  }
}

export class EquifaxProvider implements SoftPullCreditProvider {
  readonly provider = "EQUIFAX" as const;

  constructor(private readonly configured: boolean) {}

  async requestSoftPull(): Promise<ProviderSoftPullResult> {
    if (!this.configured) {
      throw new Error("EQUIFAX_PROVIDER_NOT_CONFIGURED");
    }

    throw new Error("EQUIFAX_ADAPTER_NOT_IMPLEMENTED");
  }
}

export type RestHandlerInput = {
  method: "GET" | "POST";
  path: string;
  body?: unknown;
};

export type RestHandlerResponse = {
  status: number;
  body: unknown;
};

export function createSoftPullRestHandler(service: SoftPullCreditService) {
  return async function handleSoftPullRestRequest(
    input: RestHandlerInput
  ): Promise<RestHandlerResponse> {
    if (input.method === "POST" && input.path === "/soft-pull/request") {
      const result = await service.requestSoftPull(input.body);
      return {
        status: result.record.status === "COMPLETED" ? 201 : 202,
        body: result,
      };
    }

    const statusMatch = input.path.match(/^\/soft-pull\/([^/]+)\/status$/);
    if (input.method === "GET" && statusMatch?.[1]) {
      const record = await service.getStatus(statusMatch[1]);
      return record
        ? { status: 200, body: record }
        : { status: 404, body: { error: "SOFT_PULL_NOT_FOUND" } };
    }

    const summaryMatch = input.path.match(/^\/soft-pull\/([^/]+)\/summary$/);
    if (input.method === "GET" && summaryMatch?.[1]) {
      const summary = await service.getSummary(summaryMatch[1]);
      return summary
        ? { status: 200, body: summary }
        : { status: 404, body: { error: "SOFT_PULL_SUMMARY_NOT_FOUND" } };
    }

    return { status: 404, body: { error: "ROUTE_NOT_FOUND" } };
  };
}

export const softPullMcpTools = [
  {
    name: "soft_pull_request",
    method: "POST",
    path: "/soft-pull/request",
    risk: "COMPLIANCE_CRITICAL",
  },
  {
    name: "soft_pull_status",
    method: "GET",
    path: "/soft-pull/:id/status",
    risk: "READ_ONLY",
  },
  {
    name: "soft_pull_summary",
    method: "GET",
    path: "/soft-pull/:id/summary",
    risk: "READ_ONLY",
  },
] as const;

export function toQuoteCreditInput(
  summary: SoftPullSummary
): QuoteCreditInput {
  return QuoteCreditInputSchema.parse({
    source: "SOFT_PULL_CREDIT_SUMMARY",
    softPullId: summary.softPullId,
    consentEventId: summary.consentEventId,
    fico: summary.fico,
    tier: summary.tier,
    scoreModel: summary.scoreModel,
    provider: summary.provider,
    pulledAt: summary.pulledAt,
  });
}

export function creditTierForFico(fico: number): CreditTier {
  if (fico >= 760) return "EXCELLENT";
  if (fico >= 720) return "GOOD";
  if (fico >= 660) return "FAIR";
  if (fico >= 620) return "POOR";
  return "INELIGIBLE";
}

export function redactSoftPullPayload(input: SoftPullRequest) {
  return {
    leadId: input.leadId,
    borrowerId: input.borrowerId,
    consentEventId: input.consentEventId,
    requestedBy: input.requestedBy,
    provider: input.provider,
    purpose: input.purpose,
    correlationId: input.correlationId,
    identity: {
      firstName: input.identity.firstName,
      lastName: input.identity.lastName,
      state: input.identity.state,
      postalCode: input.identity.postalCode,
      ssn: input.identity.ssn ? "[REDACTED]" : undefined,
      ssnLastFour: input.identity.ssnLastFour
        ? `***${input.identity.ssnLastFour}`
        : undefined,
    },
  };
}

function removeSummaryFromStatus(record: SoftPullRecord): SoftPullRecord {
  const statusOnly = { ...record };
  delete statusOnly.summary;
  return statusOnly;
}

function createAuditEvent(input: {
  action: string;
  entityId: string;
  leadId: string;
  requestedBy: string;
  correlationId: string;
  details: Record<string, unknown>;
  timestamp: string;
}): AuditEvent {
  return {
    entityType: "SOFT_PULL_CREDIT",
    entityId: input.entityId,
    action: input.action,
    riskLevel: "COMPLIANCE_CRITICAL",
    performer: input.requestedBy,
    details: {
      ...input.details,
      leadId: input.leadId,
      correlationId: input.correlationId,
      service: serviceName,
    },
    timestamp: new Date(input.timestamp),
  };
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function createUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (token) => {
    const value = Math.floor(Math.random() * 16);
    const nibble = token === "x" ? value : (value & 0x3) | 0x8;
    return nibble.toString(16);
  });
}
