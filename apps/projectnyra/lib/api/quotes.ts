export type LoanType = "conventional" | "fha" | "va" | "usda";

export type QuoteRequest = {
  property_value: number;
  purchase_price?: number;
  down_payment?: number;
  loan_amount: number;
  credit_score: number;
  annual_interest_rate: number;
  term_years?: number;
  monthly_gross_income: number;
  monthly_debt_payments: number;
  annual_property_tax: number;
  annual_home_insurance: number;
  annual_homeowners_insurance?: number;
  monthly_hoa: number;
  start_date?: string;
};

export type QuoteResult = {
  available: boolean;
  quote_id: string;
  monthly_payment?: number;
  upfront_fees?: number;
  financed_amount?: number;
  total_paid?: number;
  error?: string;
  summary?: {
    assumptions?: Record<string, string | number | boolean>;
    costs?: Record<string, number>;
  };
};

export type ComparisonResponse = {
  comparison: Partial<Record<LoanType, QuoteResult>>;
};

const loanTypes: Array<{ type: LoanType; label: string; description: string }> =
  [
    {
      type: "conventional",
      label: "Conventional",
      description: "Standard conforming loan scenario.",
    },
    {
      type: "fha",
      label: "FHA",
      description: "Low down-payment FHA scenario.",
    },
    { type: "va", label: "VA", description: "VA-eligible borrower scenario." },
    {
      type: "usda",
      label: "USDA",
      description: "USDA rural eligibility scenario.",
    },
  ];

function buildResult(type: LoanType, request: QuoteRequest): QuoteResult {
  const propertyValue = request.purchase_price ?? request.property_value;
  const loanAmount =
    request.loan_amount || propertyValue - (request.down_payment ?? 0);
  const monthlyRate = request.annual_interest_rate / 100 / 12;
  const months = (request.term_years ?? 30) * 12;
  const principalAndInterest = monthlyRate
    ? (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
    : loanAmount / months;
  const insurance =
    request.annual_homeowners_insurance ?? request.annual_home_insurance;
  const escrow =
    request.annual_property_tax / 12 + insurance / 12 + request.monthly_hoa;
  const multiplier =
    type === "fha" ? 1.04 : type === "va" ? 0.99 : type === "usda" ? 1.01 : 1;
  const upfrontFees =
    type === "va"
      ? loanAmount * 0.0215
      : type === "fha"
        ? loanAmount * 0.0175
        : loanAmount * 0.005;

  return {
    available: type !== "usda" || propertyValue <= 750000,
    quote_id: `${type}-${Date.now()}`,
    monthly_payment: Math.round((principalAndInterest + escrow) * multiplier),
    upfront_fees: Math.round(upfrontFees),
    financed_amount: Math.round(loanAmount + upfrontFees),
    total_paid: Math.round(
      (principalAndInterest + escrow) * multiplier * months + upfrontFees
    ),
    summary: {
      assumptions: {
        credit_score: request.credit_score,
        interest_rate: request.annual_interest_rate,
        term_months: months,
      },
      costs: {
        principal_and_interest: Math.round(principalAndInterest),
        escrow: Math.round(escrow),
      },
    },
  };
}

export const quoteApi = {
  async getLoanTypes() {
    return { loan_types: loanTypes };
  },

  async getConventionalQuote(request: QuoteRequest) {
    return buildResult("conventional", request);
  },

  async compareLoanTypes(request: QuoteRequest): Promise<ComparisonResponse> {
    return {
      comparison: {
        conventional: buildResult("conventional", request),
        fha: buildResult("fha", request),
        va: buildResult("va", request),
        usda: buildResult("usda", request),
      },
    };
  },
};
