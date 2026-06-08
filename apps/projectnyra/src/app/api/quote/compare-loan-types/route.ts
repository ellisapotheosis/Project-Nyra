import { NextResponse } from "next/server";

import {
  canUseMockFallback,
  productionReadUnavailable,
} from "@/lib/api/config";

const QUOTE_API_URL = process.env.QUOTE_API_URL;
const QUOTE_API_SECRET = process.env.QUOTE_API_SECRET;

type QuoteScenario = {
  property_value: number;
  loan_amount: number;
  annual_interest_rate: number;
  term_years: number;
  credit_score: number;
  start_date?: string;
  loan_type?: "conventional" | "fha" | "va" | "usda";
  down_payment?: number;
  annual_property_tax?: number;
  annual_home_insurance?: number;
  monthly_hoa?: number;
  include_schedule?: boolean;
};

function payment(principal: number, annualRate: number, years: number) {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;

  if (!monthlyRate) {
    return principal / months;
  }

  return (
    principal *
    ((monthlyRate * (1 + monthlyRate) ** months) /
      ((1 + monthlyRate) ** months - 1))
  );
}

function buildFallbackComparison(input: QuoteScenario) {
  const ltv = input.property_value
    ? (input.loan_amount / input.property_value) * 100
    : 0;
  const products = {
    conventional: { maxLtv: 97, rateAdjustment: 0, feeRate: 0.01 },
    fha: { maxLtv: 96.5, rateAdjustment: 0.125, feeRate: 0.0175 },
    va: { maxLtv: 100, rateAdjustment: -0.125, feeRate: 0.0215 },
    usda: { maxLtv: 100, rateAdjustment: 0.25, feeRate: 0.01 },
  };

  return Object.fromEntries(
    Object.entries(products).map(([type, product]) => {
      const available = ltv <= product.maxLtv;
      const annualRate = input.annual_interest_rate + product.rateAdjustment;
      const upfrontFees = Math.round(input.loan_amount * product.feeRate);
      const monthlyPayment = Math.round(
        payment(input.loan_amount + upfrontFees, annualRate, input.term_years)
      );

      return [
        type,
        available
          ? {
              available: true,
              quote_id: `mock-${type}-${Date.now()}`,
              monthly_payment: monthlyPayment,
              total_paid: monthlyPayment * input.term_years * 12,
              upfront_fees: upfrontFees,
              financed_amount: input.loan_amount + upfrontFees,
              summary: {
                assumptions: {
                  ltv: `${ltv.toFixed(1)}%`,
                  annual_rate: `${annualRate.toFixed(3)}%`,
                  credit_score: input.credit_score,
                },
              },
            }
          : {
              available: false,
              error: `LTV ${ltv.toFixed(1)}% exceeds ${product.maxLtv}% program maximum`,
            },
      ];
    })
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as QuoteScenario;

  if (QUOTE_API_URL) {
    try {
      const response = await fetch(
        `${QUOTE_API_URL}/quote/compare-loan-types`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(QUOTE_API_SECRET ? { "x-api-key": QUOTE_API_SECRET } : {}),
          },
          body: JSON.stringify(buildLoanTypeRequest(body)),
          cache: "no-store",
        }
      );

      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch {}
  }

  if (!canUseMockFallback()) {
    return productionReadUnavailable(
      "Quote service",
      "QUOTE_API_URL must be configured for production quote comparison"
    );
  }

  return NextResponse.json({
    comparison: buildFallbackComparison(body),
    property_value: body.property_value,
    loan_amount: body.loan_amount,
    credit_score: body.credit_score,
    source: "mock",
  });
}

function buildLoanTypeRequest(input: QuoteScenario) {
  return {
    loan_amount: numberOrDefault(input.loan_amount, 400000),
    property_value: numberOrDefault(input.property_value, 500000),
    annual_interest_rate: normalizeRate(input.annual_interest_rate),
    term_years: numberOrDefault(input.term_years, 30),
    start_date:
      typeof input.start_date === "string"
        ? input.start_date
        : new Date().toISOString().slice(0, 10),
    loan_type: input.loan_type ?? "conventional",
    credit_score: numberOrDefault(input.credit_score, 720),
    down_payment:
      numberOrUndefined(input.down_payment) ??
      Math.max(
        numberOrDefault(input.property_value, 500000) -
          numberOrDefault(input.loan_amount, 400000),
        0
      ),
    annual_property_tax: numberOrDefault(input.annual_property_tax, 0),
    annual_home_insurance: numberOrDefault(input.annual_home_insurance, 0),
    monthly_hoa: numberOrDefault(input.monthly_hoa, 0),
    include_schedule: input.include_schedule === true,
  };
}

function normalizeRate(value: number | undefined) {
  const numeric = numberOrDefault(value, 0.065);
  return numeric > 1 ? numeric / 100 : numeric;
}

function numberOrDefault(value: unknown, fallback: number) {
  return numberOrUndefined(value) ?? fallback;
}

function numberOrUndefined(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}
