import { createClient } from "./base";

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
  assumptions: any;
}

export interface QuoteResponse {
  quote_id: string;
  inputs: QuoteRequest;
  summary: QuoteSummary;
  schedule?: any[];
  assumptions: any;
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
      summary?: any;
    }
  >;
  property_value: number;
  loan_amount: number;
  credit_score: number;
}

/**
 * Quote API Client (Deterministic Mortgage Math - Python/FastAPI)
 */
const QUOTE_API_URL =
  typeof window === "undefined"
    ? process.env.QUOTE_API_URL || "http://localhost:7070"
    : "";
const QUOTE_API_SECRET =
  typeof window === "undefined" ? process.env.QUOTE_API_SECRET || "" : "";

const client = createClient({
  baseUrl: QUOTE_API_URL,
  apiKey: QUOTE_API_SECRET,
});

export const quoteApi = {
  /**
   * Get available loan types and their characteristics.
   */
  getLoanTypes: () =>
    client.get<{ loan_types: any[] }>("/api/quote/loan-types"),

  /**
   * Get quote for Conventional loan.
   */
  getConventionalQuote: (req: QuoteRequest) =>
    client.post<QuoteResponse>("/api/quote/conventional", req),

  /**
   * Get quote for FHA loan.
   */
  getFHAQuote: (req: QuoteRequest) =>
    client.post<QuoteResponse>("/api/quote/fha", req),

  /**
   * Get quote for VA loan.
   */
  getVAQuote: (req: QuoteRequest) =>
    client.post<QuoteResponse>("/api/quote/va", req),

  /**
   * Get quote for USDA loan.
   */
  getUSDAQuote: (req: QuoteRequest) =>
    client.post<QuoteResponse>("/api/quote/usda", req),

  /**
   * Compare all loan types for the same property/borrower.
   */
  compareLoanTypes: (req: QuoteRequest) =>
    client.post<ComparisonResponse>("/api/quote/compare-loan-types", req),
};
