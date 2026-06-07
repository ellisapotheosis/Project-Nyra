import { describe, expect, it } from "vitest";
import {
  appendQuoteHistory,
  generateDeterministicQuote,
  quoteOptionCount,
} from "./index";

const profile = {
  leadId: "lead-abcdef12",
  loanAmount: 400000,
  propertyValue: 500000,
  creditTier: "GOOD" as const,
  loanPurpose: "PURCHASE" as const,
};

describe("quote-domain", () => {
  it("generates exactly three deterministic quote options", () => {
    const quote = generateDeterministicQuote(
      profile,
      new Date("2026-05-19T16:00:00.000Z")
    );

    expect(quote.options).toHaveLength(quoteOptionCount);
    expect(quote.options.map((option) => option.label)).toEqual([
      "LOWEST_PAYMENT",
      "BALANCED",
      "LOWEST_COST",
    ]);
    expect(quote.quoteNumber).toBe("NYRA-LEAD-ABC-001");
  });

  it("versions quotes using prior quote history", () => {
    const firstQuote = generateDeterministicQuote(
      profile,
      new Date("2026-05-19T16:00:00.000Z")
    );
    const history = appendQuoteHistory([], firstQuote);
    const secondQuote = generateDeterministicQuote(
      profile,
      new Date("2026-05-20T16:00:00.000Z"),
      history
    );

    expect(secondQuote.version).toBe(2);
    expect(secondQuote.quoteNumber).toBe("NYRA-LEAD-ABC-002");
  });
});
