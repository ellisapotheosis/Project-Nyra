import { createClient } from "./base";
import { serviceConfig } from "./config";

export type LoanType = "conventional" | "fha" | "va" | "usda";

export interface QuoteRequest {
  property_value: number;
  loan_amount: number;
  annual_interest_rate: number;
  term_years: number;
  credit_score: number;
  ltv?: number;
  down_payment?: number;
  include_schedule?: boolean;
}

export type QuoteAssumptions = Record<string, unknown>;

export type AmortizationScheduleRow = Record<string, number | string>;

export interface LoanTypeInfo {
  id?: string;
  name?: string;
  type?: LoanType | string;
  description?: string;
  min_credit_score?: number;
  max_ltv?: number;
  min_down_payment_percent?: number;
  metadata?: Record<string, unknown>;
}

export interface QuoteSummary {
  quote_id: string;
  periodic_payment_piti: number;
  periodic_payment_principal_interest: number;
  periodic_payment_tax_insurance: number;
  total_paid: number;
  total_interest: number;
  upfront_fees: number;
  financed_amount: number;
  apr: number;
  ltv: number;
  assumptions: QuoteAssumptions;
}

export interface QuoteResponse {
  quote_id: string;
  inputs: QuoteRequest;
  summary: QuoteSummary;
  schedule?: AmortizationScheduleRow[];
  assumptions: QuoteAssumptions;
}

export interface ComparisonResponse {
  comparison: Record<
    LoanType,
    {
      available: boolean;
      error?: string;
      quote_id?: string;
      monthly_payment?: number;
      total_paid?: number;
      upfront_fees?: number;
      financed_amount?: number;
      summary?: QuoteSummary;
    }
  >;
  property_value: number;
  loan_amount: number;
  credit_score: number;
}

export interface CanonicalQuoteRequest {
  leadId: string;
  loanScenario: {
    purpose: "PURCHASE" | "REFI_RATE" | "REFI_CASH" | "HELOC";
    loanAmount: { amountCents: number; currency?: string };
    propertyValue?: { amountCents: number; currency?: string };
    downPayment?: { amountCents: number; currency?: string };
    state: string;
    occupancy: "PRIMARY" | "SECOND_HOME" | "INVESTMENT";
    loanType?: "CONVENTIONAL" | "FHA" | "VA" | "USDA" | "JUMBO" | "HELOC";
    creditScore?: number;
  };
  requestedBy: string;
  requestedAt: string;
}

export interface CanonicalQuoteResponse {
  id?: string;
  leadId: string;
  status: "DRAFT" | "READY" | "APPROVED" | "SENT" | "EXPIRED";
  options: Array<{
    id?: string;
    kind: "LOWEST_PAYMENT" | "BALANCED" | "LOWEST_COST";
    label: string;
    rate: number;
    apr: number;
    points: number;
    monthlyPayment: { amountCents: number; currency: string };
    cashToClose: { amountCents: number; currency: string };
    closingCosts: { amountCents: number; currency: string };
    assumptions: string[];
  }>;
  expiresAt?: string;
  createdAt?: string;
}

/**
 * Quote API Client (Deterministic Mortgage Math - Python/FastAPI)
 */
const QUOTE_API_URL =
  typeof window === "undefined"
    ? serviceConfig.quoteApiUrl || "http://localhost:7070"
    : "";
const QUOTE_API_SECRET =
  typeof window === "undefined" ? serviceConfig.quoteApiSecret : "";
const isBrowser = typeof window !== "undefined";
const quotePath = (path: string) => (isBrowser ? `/api${path}` : path);

const client = createClient({
  baseUrl: QUOTE_API_URL,
  apiKey: QUOTE_API_SECRET,
});

export const quoteApi = {
  /**
   * Get available loan types and their characteristics.
   */
  getLoanTypes: () =>
    client.get<{ loan_types: LoanTypeInfo[] }>(quotePath("/quote/loan-types")),

  /**
   * Generate the canonical Project Nyra three-option quote shape.
   */
  generateCanonicalQuote: (req: CanonicalQuoteRequest) =>
    client.post<CanonicalQuoteResponse>("/api/quotes/generate", req),

  /**
   * Get quote for Conventional loan.
   */
  getConventionalQuote: (req: QuoteRequest) =>
    client.post<QuoteResponse>(quotePath("/quote/conventional"), req),

  /**
   * Get quote for FHA loan.
   */
  getFHAQuote: (req: QuoteRequest) =>
    client.post<QuoteResponse>(quotePath("/quote/fha"), req),

  /**
   * Get quote for VA loan.
   */
  getVAQuote: (req: QuoteRequest) =>
    client.post<QuoteResponse>(quotePath("/quote/va"), req),

  /**
   * Get quote for USDA loan.
   */
  getUSDAQuote: (req: QuoteRequest) =>
    client.post<QuoteResponse>(quotePath("/quote/usda"), req),

  /**
   * Compare all loan types for the same property/borrower.
   */
  compareLoanTypes: (req: QuoteRequest) =>
    client.post<ComparisonResponse>(
      quotePath("/quote/compare-loan-types"),
      req
    ),
};
