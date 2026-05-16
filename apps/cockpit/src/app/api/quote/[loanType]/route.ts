import { NextResponse } from "next/server";

import { serviceConfig } from "@/lib/api/config";

const QUOTE_API_URL = serviceConfig.quoteApiUrl;
const QUOTE_API_SECRET = serviceConfig.quoteApiSecret;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ loanType: string }> }
) {
  const { loanType } = await params;
  const body = await request.json();

  if (!QUOTE_API_URL) {
    return NextResponse.json(
      {
        error: "QUOTE_API_URL is not configured. Quote math is service-owned and is not executed by the webapp.",
        source: "quote-api-unconfigured",
      },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${QUOTE_API_URL}/quote/${loanType}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(QUOTE_API_SECRET ? { "x-api-key": QUOTE_API_SECRET } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Quote API request failed.",
        detail: error instanceof Error ? error.message : "Unknown quote API error",
        source: "quote-api-proxy",
      },
      { status: 502 }
    );
  }
}
