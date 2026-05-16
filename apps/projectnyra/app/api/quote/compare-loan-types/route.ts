import { NextResponse } from "next/server";

const QUOTE_API_URL = process.env.QUOTE_API_URL;
const QUOTE_API_SECRET = process.env.QUOTE_API_SECRET;

type QuoteScenario = {
  property_value: number;
  loan_amount: number;
  annual_interest_rate: number;
  term_years: number;
  credit_score: number;
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
          body: JSON.stringify(body),
          cache: "no-store",
        }
      );

      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch {}
  }

  return NextResponse.json({
    comparison: buildFallbackComparison(body),
    property_value: body.property_value,
    loan_amount: body.loan_amount,
    credit_score: body.credit_score,
    source: "mock",
  });
}
