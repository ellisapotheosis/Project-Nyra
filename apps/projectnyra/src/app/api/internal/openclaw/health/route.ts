import { NextResponse } from "next/server";
import {
  buildRateLimitHeaders,
  checkRateLimit,
  getRequestRateLimitKey,
} from "@/lib/api/rateLimit";

const OPENCLAW_BASE_URL =
  process.env.OPENCLAW_PUBLIC_BASE_URL || "http://localhost:3401";
const RATE_LIMIT = {
  limit: Number(process.env.NYRA_INTERNAL_API_RATE_LIMIT ?? 60),
  windowMs: 60_000,
};

export async function GET(request: Request) {
  try {
    const rateLimit = checkRateLimit(
      getRequestRateLimitKey(request, "internal:openclaw:health"),
      RATE_LIMIT
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", ok: false },
        { status: 429, headers: buildRateLimitHeaders(rateLimit) }
      );
    }

    const response = await fetch(`${OPENCLAW_BASE_URL}/health`, {
      cache: "no-store",
    });
    const body = await response.text();

    return NextResponse.json(
      {
        body,
        ok: response.ok,
        status: response.status,
      },
      { headers: buildRateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Health probe failed",
        ok: false,
      },
      { status: 500 }
    );
  }
}
