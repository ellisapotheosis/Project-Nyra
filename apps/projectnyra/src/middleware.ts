import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth/callback", "/auth/forgot-password", "/auth/reset-password"];

// Define public API routes (e.g. for lead ingestion from other domains)
const publicApiRoutes = ["/api/leads/ingest", "/api/health", "/api/auth/callback"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route);
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // 2. Check for authentication session
  // Using both Clerk and Supabase fallback check for the logic scaffold
  const session = request.cookies.get("nyra-session") || 
                  request.cookies.get("sb-access-token") || 
                  request.cookies.get("__session");

  // 3. Protect all other routes (including all non-public /api routes)
  if (!session) {
    // If it's an API request, return unauthorized JSON
    if (pathname.startsWith("/api")) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Otherwise, redirect to login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Ensure middleware runs for all routes except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
