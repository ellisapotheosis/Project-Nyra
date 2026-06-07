import { NextResponse, type NextRequest } from "next/server";

import {
  buildRateLimitHeaders,
  checkRateLimit,
  getRequestRateLimitKey,
} from "@/lib/api/rateLimit";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // 1. Rate Limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Exclude health checks from strict rate limiting
    if (!request.nextUrl.pathname.includes("/health/")) {
      const rateLimitKey = getRequestRateLimitKey(request, "api");
      const rateLimit = checkRateLimit(rateLimitKey, {
        limit: 100, // 100 requests
        windowMs: 60 * 1000, // per minute
      });

      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: "Too many requests",
            retryAfter: rateLimit.retryAfterSeconds,
          },
          { status: 429, headers: buildRateLimitHeaders(rateLimit) }
        );
      }
    }
  }

  // 2. Auth Session Management
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
