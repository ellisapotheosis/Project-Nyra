import { describe, expect, it } from "vitest";
import {
  generateBorrowerQuote,
  quoteCreditAssumptions,
  requireApprovedQuoteCreditInput,
} from "./index";

const approvedCreditInput = {
  source: "SOFT_PULL_CREDIT_SUMMARY",
  softPullId: "soft-pull-123",
  consentEventId: "consent-123",
  fico: 742,
  tier: "GOOD",
  scoreModel: "MOCK_MORTGAGE_FICO_V1",
  provider: "MOCK",
  pulledAt: "2026-05-17T18:00:00.000Z",
};

describe("quote-service credit input contract", () => {
  it("accepts only consent-backed soft-pull credit summaries", () => {
    expect(requireApprovedQuoteCreditInput(approvedCreditInput)).toMatchObject({
      source: "SOFT_PULL_CREDIT_SUMMARY",
      consentEventId: "consent-123",
      fico: 742,
      tier: "GOOD",
    });
  });

  it("rejects assistant-invented FICO inputs", () => {
    expect(() =>
      requireApprovedQuoteCreditInput({
        source: "ASSISTANT_MEMORY",
        fico: 742,
        tier: "GOOD",
      })
    ).toThrow();
  });

  it("converts approved input into quote assumptions", () => {
    expect(quoteCreditAssumptions(approvedCreditInput)).toEqual({
      creditScoreSource: "SOFT_PULL_CREDIT_SUMMARY",
      softPullId: "soft-pull-123",
      consentEventId: "consent-123",
      creditTier: "GOOD",
      fico: 742,
      scoreModel: "MOCK_MORTGAGE_FICO_V1",
      provider: "MOCK",
      pulledAt: "2026-05-17T18:00:00.000Z",
    });
  });

  it("generates a versioned deterministic three-option quote", () => {
    const quote = generateBorrowerQuote({
      leadId: "lead-abcdef12",
      loanAmount: 400000,
      propertyValue: 500000,
      creditTier: "GOOD",
      loanPurpose: "PURCHASE",
      approvedCredit: approvedCreditInput,
      createdAt: new Date("2026-05-19T16:00:00.000Z"),
    });

    expect(quote.options).toHaveLength(3);
    expect(quote.quoteNumber).toBe("NYRA-LEAD-ABC-001");
    expect(quote.assumptions).toMatchObject({
      pricingModel: "nyra-deterministic-v1",
      creditScoreSource: "SOFT_PULL_CREDIT_SUMMARY",
      consentEventId: "consent-123",
    });
    expect(quote.history).toHaveLength(1);
  });
});
