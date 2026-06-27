import { Request } from "express";

export type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
} from "@nyra/shared";

export interface LeadInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  loanAmount: number;
  propertyValue: number;
  creditScore: CreditScoreRange;
  propertyType: PropertyType;
  loanType: LoanType;
  zipCode: string;
}

export interface QuoteInput {
  loanAmount: number;
  propertyValue: number;
  loanTerm: number;
  creditScore: CreditScoreRange;
  loanType: LoanType;
  propertyType: PropertyType;
  zipCode: string;
  downPayment?: number;
}

export interface MortgageCalculation {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  interestRate: number;
  apr: number;
  downPayment: number;
  loanAmount: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  closingCosts: number;
  amortizationSchedule?: AmortizationEntry[];
}

export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export type CreditScoreRange =
  | "excellent" // 740+
  | "good" // 670-739
  | "fair" // 580-669
  | "poor"; // <580

export type PropertyType =
  | "single_family"
  | "condo"
  | "townhouse"
  | "multi_family";

export type LoanType = "conventional" | "fha" | "va" | "usda" | "jumbo";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "application"
  | "closed"
  | "lost";

export interface RateQuote {
  id: string;
  interestRate: number;
  apr: number;
  loanTerm: number;
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  downPayment?: number;
  closingCosts?: number;
  propertyTax?: number;
  homeInsurance?: number;
  pmi?: number;
  expiresAt: string;
  createdAt: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface CacheConfig {
  ttl: number;
  key: string;
}

export interface RequestWithContext extends Request {
  requestId?: string;
  startTime?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}
