import { NextResponse } from "next/server";

const QUOTE_API_URL = process.env.QUOTE_API_URL;
const QUOTE_API_SECRET = process.env.QUOTE_API_SECRET;

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
    } catch {}
  }

  return NextResponse.json({ loan_types: fallbackLoanTypes, source: "mock" });
}
