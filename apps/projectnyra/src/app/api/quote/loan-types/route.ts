import { NextResponse } from "next/server";
import {
  NYRA_ENABLE_MOCKS,
  serviceConfig,
  serviceUnavailable,
} from "@/lib/api/config";

const QUOTE_API_URL = serviceConfig.quoteApiUrl;
const QUOTE_API_SECRET = serviceConfig.quoteApiSecret;

const fallbackLoanTypes = [
  { type: "conventional", name: "Conventional", max_ltv: 97 },
  { type: "fha", name: "FHA", max_ltv: 96.5 },
  { type: "va", name: "VA", max_ltv: 100 },
  { type: "usda", name: "USDA", max_ltv: 100 },
];

export async function GET() {
  if (QUOTE_API_URL) {
    try {
      const response = await fetch(`${QUOTE_API_URL}/quote/loan-types`, {
        headers: {
          ...(QUOTE_API_SECRET ? { "x-api-key": QUOTE_API_SECRET } : {}),
        },
        cache: "no-store",
      });

      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch (error) {
      if (!NYRA_ENABLE_MOCKS) {
        return serviceUnavailable(
          "Quote API",
          error instanceof Error ? error.message : "Loan type request failed",
          502
        );
      }
    }
  }

  if (!NYRA_ENABLE_MOCKS) {
    return serviceUnavailable("Quote API", "QUOTE_API_URL is not configured");
  }

  return NextResponse.json({ loan_types: fallbackLoanTypes, source: "mock" });
}
