import { z } from "zod";
import {
  appendQuoteHistory,
  generateDeterministicQuote,
  type QuoteHistoryEntry,
  type QuoteProfile,
} from "@nyra/quote-domain";

export const serviceName = "quote-service";

export const ApprovedCreditTierSchema = z.enum([
  "EXCELLENT",
  "GOOD",
  "FAIR",
  "POOR",
  "INELIGIBLE",
]);
export type ApprovedCreditTier = z.infer<typeof ApprovedCreditTierSchema>;

export const ApprovedQuoteCreditInputSchema = z.object({
  source: z.literal("SOFT_PULL_CREDIT_SUMMARY"),
  softPullId: z.string().min(1),
  consentEventId: z.string().min(1),
  fico: z.number().int().min(300).max(850),
  tier: ApprovedCreditTierSchema,
  scoreModel: z.string().min(1),
  provider: z.enum(["CERTIFIED_CREDIT", "EQUIFAX", "MOCK", "OTHER_APPROVED"]),
  pulledAt: z.string().datetime(),
});
export type ApprovedQuoteCreditInput = z.infer<
  typeof ApprovedQuoteCreditInputSchema
>;

export function requireApprovedQuoteCreditInput(
  input: unknown
): ApprovedQuoteCreditInput {
  return ApprovedQuoteCreditInputSchema.parse(input);
}

export function quoteCreditAssumptions(input: unknown) {
  const approvedInput = requireApprovedQuoteCreditInput(input);

  return {
    creditScoreSource: approvedInput.source,
    softPullId: approvedInput.softPullId,
    consentEventId: approvedInput.consentEventId,
    creditTier: approvedInput.tier,
    fico: approvedInput.fico,
    scoreModel: approvedInput.scoreModel,
    provider: approvedInput.provider,
    pulledAt: approvedInput.pulledAt,
  };
}

export type GenerateQuoteInput = QuoteProfile & {
  approvedCredit: ApprovedQuoteCreditInput;
  history?: QuoteHistoryEntry[];
  createdAt?: Date;
};

export function generateBorrowerQuote(input: GenerateQuoteInput) {
  const approvedCredit = requireApprovedQuoteCreditInput(input.approvedCredit);
  const quote = generateDeterministicQuote(
    {
      leadId: input.leadId,
      loanAmount: input.loanAmount,
      propertyValue: input.propertyValue,
      creditTier:
        approvedCredit.tier === "INELIGIBLE" ? "POOR" : approvedCredit.tier,
      loanPurpose: input.loanPurpose,
      termYears: input.termYears,
    },
    input.createdAt ?? new Date(),
    input.history ?? []
  );

  return {
    ...quote,
    assumptions: {
      ...quote.assumptions,
      ...quoteCreditAssumptions(approvedCredit),
    },
    history: appendQuoteHistory(input.history ?? [], quote),
  };
}

export type BorrowerQuote = ReturnType<typeof generateBorrowerQuote>;
export type QuoteApprovalState = "DRAFT" | "PENDING_REVIEW" | "APPROVED";

export type StoredBorrowerQuote = BorrowerQuote & {
  approvalState: QuoteApprovalState;
  approvedBy?: string;
  approvedAt?: string;
};

export interface QuoteHistoryStore {
  listByLead(leadId: string): Promise<StoredBorrowerQuote[]>;
  save(quote: StoredBorrowerQuote): Promise<StoredBorrowerQuote>;
  updateApproval(
    quoteNumber: string,
    approval: {
      approvalState: "APPROVED";
      approvedBy: string;
      approvedAt: string;
    }
  ): Promise<StoredBorrowerQuote | undefined>;
}

export class InMemoryQuoteHistoryStore implements QuoteHistoryStore {
  private readonly quotesByNumber = new Map<string, StoredBorrowerQuote>();
  private readonly quoteNumbersByLead = new Map<string, string[]>();

  async listByLead(leadId: string): Promise<StoredBorrowerQuote[]> {
    const quoteNumbers = this.quoteNumbersByLead.get(leadId) ?? [];
    return quoteNumbers
      .map((quoteNumber) => this.quotesByNumber.get(quoteNumber))
      .filter((quote): quote is StoredBorrowerQuote => Boolean(quote))
      .sort((a, b) => a.version - b.version);
  }

  async save(quote: StoredBorrowerQuote): Promise<StoredBorrowerQuote> {
    this.quotesByNumber.set(quote.quoteNumber, quote);
    const quoteNumbers = this.quoteNumbersByLead.get(quote.leadId) ?? [];
    if (!quoteNumbers.includes(quote.quoteNumber)) {
      quoteNumbers.push(quote.quoteNumber);
      this.quoteNumbersByLead.set(quote.leadId, quoteNumbers);
    }

    return quote;
  }

  async updateApproval(
    quoteNumber: string,
    approval: {
      approvalState: "APPROVED";
      approvedBy: string;
      approvedAt: string;
    }
  ): Promise<StoredBorrowerQuote | undefined> {
    const quote = this.quotesByNumber.get(quoteNumber);
    if (!quote) {
      return undefined;
    }

    const updated = {
      ...quote,
      ...approval,
    };
    this.quotesByNumber.set(quoteNumber, updated);
    return updated;
  }
}

export class QuoteService {
  constructor(private readonly store: QuoteHistoryStore) {}

  async generate(input: Omit<GenerateQuoteInput, "history">) {
    const existingQuotes = await this.store.listByLead(input.leadId);
    const quote = generateBorrowerQuote({
      ...input,
      history: existingQuotes.map((entry) => ({
        quoteNumber: entry.quoteNumber,
        version: entry.version,
        createdAt: entry.createdAt,
        expiresAt: entry.expiresAt,
        summary: entry.options
          .map((option) => `${option.label}:${option.interestRate.toFixed(3)}%`)
          .join("|"),
      })),
    });

    return this.store.save({
      ...quote,
      approvalState: "PENDING_REVIEW",
    });
  }

  async approve(
    quoteNumber: string,
    approvedBy: string,
    approvedAt = new Date()
  ) {
    const quote = await this.store.updateApproval(quoteNumber, {
      approvalState: "APPROVED",
      approvedBy,
      approvedAt: approvedAt.toISOString(),
    });

    if (!quote) {
      throw new Error(`Quote ${quoteNumber} was not found`);
    }

    return quote;
  }

  listByLead(leadId: string) {
    return this.store.listByLead(leadId);
  }
}
