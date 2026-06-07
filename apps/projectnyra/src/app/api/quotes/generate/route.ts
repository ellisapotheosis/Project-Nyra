import { NextResponse } from "next/server";

import {
  canUseMockFallback,
  productionWriteUnavailable,
} from "@/lib/api/config";

const QUOTE_API_URL = process.env.QUOTE_API_URL;
const QUOTE_API_SECRET = process.env.QUOTE_API_SECRET;

export async function POST(request: Request) {
  const payload = await request.json();
  let upstreamError: unknown;

  if (QUOTE_API_URL) {
    try {
      const response = await fetch(buildQuoteEndpoint(QUOTE_API_URL), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(QUOTE_API_SECRET
            ? { Authorization: `Bearer ${QUOTE_API_SECRET}` }
            : {}),
        },
        body: JSON.stringify(buildQuoteRequest(payload)),
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        return NextResponse.json(data, { status: response.status });
      }

      return NextResponse.json(
        {
          error: "Quote service failed",
          detail: data,
          source: "quote-service",
        },
        { status: response.status }
      );
    } catch (error) {
      upstreamError = error;
    }
  }

  if (!canUseMockFallback()) {
    return productionWriteUnavailable(
      "Quote service",
      upstreamError
        ? "Configured quote service could not be reached"
        : "QUOTE_API_URL must be configured for production quote generation"
    );
  }

  const loanAmount =
    numberOrUndefined(payload.loanAmount) ??
    centsToDollars(payload.loanScenario?.loanAmount?.amountCents) ??
    400000;
  const propertyValue =
    numberOrUndefined(payload.propertyValue) ??
    centsToDollars(payload.loanScenario?.propertyValue?.amountCents) ??
    500000;
  const createdAt = new Date();

  return NextResponse.json(
    {
      leadId: payload.leadId,
      status: "DRAFT",
      source: "mock",
      warning: "QUOTE_API_URL is not configured",
      options: [
        option("LOWEST_PAYMENT", loanAmount, propertyValue, 6.375, 1.25),
        option("BALANCED", loanAmount, propertyValue, 6.5, 0.5),
        option("LOWEST_COST", loanAmount, propertyValue, 6.75, 0),
      ],
      createdAt: createdAt.toISOString(),
      expiresAt: new Date(
        createdAt.getTime() + 7 * 24 * 60 * 60_000
      ).toISOString(),
    },
    { status: 202 }
  );
}

function buildQuoteEndpoint(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/$/, "");
  return trimmed.endsWith("/quote") ? trimmed : `${trimmed}/quote`;
}

function buildQuoteRequest(payload: any) {
  return {
    loan_amount:
      numberOrUndefined(payload.loan_amount) ??
      numberOrUndefined(payload.loanAmount) ??
      centsToDollars(payload.loanScenario?.loanAmount?.amountCents) ??
      400000,
    annual_interest_rate: normalizeRate(
      numberOrUndefined(payload.annual_interest_rate) ??
        numberOrUndefined(payload.rate) ??
        numberOrUndefined(payload.interestRate) ??
        numberOrUndefined(payload.loanScenario?.interestRate)
    ),
    term_years:
      numberOrUndefined(payload.term_years) ??
      numberOrUndefined(payload.termYears) ??
      numberOrUndefined(payload.loanScenario?.termYears) ??
      30,
    start_date:
      typeof payload.start_date === "string"
        ? payload.start_date
        : new Date().toISOString().slice(0, 10),
    annual_property_tax:
      numberOrUndefined(payload.annual_property_tax) ??
      numberOrUndefined(payload.annualPropertyTax) ??
      0,
    annual_home_insurance:
      numberOrUndefined(payload.annual_home_insurance) ??
      numberOrUndefined(payload.annualHomeInsurance) ??
      0,
    monthly_hoa:
      numberOrUndefined(payload.monthly_hoa) ??
      numberOrUndefined(payload.monthlyHoa) ??
      0,
    monthly_pmi:
      numberOrUndefined(payload.monthly_pmi) ??
      numberOrUndefined(payload.monthlyPmi) ??
      0,
    include_schedule: payload.include_schedule === true,
  };
}

function normalizeRate(value: number | undefined) {
  if (value === undefined) return 0.065;
  return value > 1 ? value / 100 : value;
}

function option(
  kind: "LOWEST_PAYMENT" | "BALANCED" | "LOWEST_COST",
  loanAmount: number,
  propertyValue: number,
  rate: number,
  points: number
) {
  const monthlyPayment = Math.round(monthlyPi(loanAmount, rate, 30) * 100);
  const closingCosts = Math.round(loanAmount * (0.0125 + points / 100) * 100);

  return {
    kind,
    label: kind
      .toLowerCase()
      .split("_")
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" "),
    rate,
    apr: Math.round((rate + 0.18 + points * 0.035) * 1000) / 1000,
    points,
    monthlyPayment: { amountCents: monthlyPayment, currency: "USD" },
    cashToClose: {
      amountCents: closingCosts + Math.max(propertyValue - loanAmount, 0) * 100,
      currency: "USD",
    },
    closingCosts: { amountCents: closingCosts, currency: "USD" },
    assumptions: [
      "nyra-deterministic-v1",
      "not a lock",
      "broker review required",
    ],
  };
}

function monthlyPi(principal: number, annualRate: number, termYears: number) {
  const monthlyRate = annualRate / 100 / 12;
  const payments = termYears * 12;
  return (
    (principal * monthlyRate * (1 + monthlyRate) ** payments) /
    ((1 + monthlyRate) ** payments - 1)
  );
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function centsToDollars(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value / 100
    : undefined;
}
