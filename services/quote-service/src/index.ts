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
