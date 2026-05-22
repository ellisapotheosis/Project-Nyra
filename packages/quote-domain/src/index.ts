export const quoteOptionCount = 3;

export type QuoteProfile = {
  leadId: string;
  loanAmount: number;
  propertyValue: number;
  creditTier: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  loanPurpose: "PURCHASE" | "REFINANCE" | "HELOC";
  termYears?: number;
};

export type QuoteOptionLabel = "LOWEST_PAYMENT" | "BALANCED" | "LOWEST_COST";

export type DeterministicQuoteOption = {
  label: QuoteOptionLabel;
  programName: string;
  loanAmount: number;
  interestRate: number;
  apr: number;
  loanTermYears: number;
  monthlyPayment: number;
  closingCosts: number;
  points: number;
};

export type DeterministicQuote = {
  leadId: string;
  quoteNumber: string;
  version: number;
  options: [
    DeterministicQuoteOption,
    DeterministicQuoteOption,
    DeterministicQuoteOption,
  ];
  assumptions: {
    pricingModel: "nyra-deterministic-v1";
    creditTier: QuoteProfile["creditTier"];
    ltv: number;
  };
  createdAt: string;
  expiresAt: string;
};

export type QuoteHistoryEntry = {
  quoteNumber: string;
  version: number;
  createdAt: string;
  expiresAt: string;
  summary: string;
};

const baseRates: Record<QuoteProfile["creditTier"], number> = {
  EXCELLENT: 6.25,
  GOOD: 6.5,
  FAIR: 6.875,
  POOR: 7.375,
};

export function generateDeterministicQuote(
  profile: QuoteProfile,
  createdAt: Date,
  priorHistory: QuoteHistoryEntry[] = []
): DeterministicQuote {
  const termYears = profile.termYears ?? 30;
  const version = priorHistory.length + 1;
  const ltv = round(profile.loanAmount / profile.propertyValue, 4);
  const baseRate = baseRates[profile.creditTier] + ltvAdjustment(ltv);
  const quoteNumber = `NYRA-${profile.leadId.slice(0, 8).toUpperCase()}-${String(
    version
  ).padStart(3, "0")}`;

  const options: DeterministicQuote["options"] = [
    option("LOWEST_PAYMENT", profile, termYears, baseRate - 0.125, 1.25),
    option("BALANCED", profile, termYears, baseRate, 0.5),
    option("LOWEST_COST", profile, termYears, baseRate + 0.25, 0),
  ];

  const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60_000);

  return {
    leadId: profile.leadId,
    quoteNumber,
    version,
    options,
    assumptions: {
      pricingModel: "nyra-deterministic-v1",
      creditTier: profile.creditTier,
      ltv,
    },
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export function appendQuoteHistory(
  history: QuoteHistoryEntry[],
  quote: DeterministicQuote
): QuoteHistoryEntry[] {
  return [
    ...history,
    {
      quoteNumber: quote.quoteNumber,
      version: quote.version,
      createdAt: quote.createdAt,
      expiresAt: quote.expiresAt,
      summary: quote.options
        .map((entry) => `${entry.label}:${entry.interestRate.toFixed(3)}%`)
        .join("|"),
    },
  ];
}

function option(
  label: QuoteOptionLabel,
  profile: QuoteProfile,
  termYears: number,
  interestRate: number,
  points: number
): DeterministicQuoteOption {
  const monthlyPayment = principalAndInterestPayment(
    profile.loanAmount,
    interestRate,
    termYears
  );
  const closingCosts = round(profile.loanAmount * (0.0125 + points / 100), 2);

  return {
    label,
    programName: `${profile.loanPurpose} ${termYears} Year Fixed`,
    loanAmount: profile.loanAmount,
    interestRate: round(interestRate, 3),
    apr: round(interestRate + 0.18 + points * 0.035, 3),
    loanTermYears: termYears,
    monthlyPayment,
    closingCosts,
    points,
  };
}

function principalAndInterestPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const paymentCount = termYears * 12;
  const payment =
    (principal * monthlyRate * (1 + monthlyRate) ** paymentCount) /
    ((1 + monthlyRate) ** paymentCount - 1);

  return round(payment, 2);
}

function ltvAdjustment(ltv: number): number {
  if (ltv <= 0.6) {
    return -0.125;
  }

  if (ltv <= 0.8) {
    return 0;
  }

  if (ltv <= 0.9) {
    return 0.25;
  }

  return 0.5;
}

function round(value: number, precision: number): number {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}
