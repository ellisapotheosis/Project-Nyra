import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicConfig } from "./env";

const PUBLIC_ROUTES = new Set([
  "/",
  "/auth",
  "/auth/callback",
  "/auth/forgot-password",
  "/auth/login",
  "/auth/reset-password",
  "/auth/signup",
]);

const PUBLIC_API_PREFIXES = [
  "/api/auth/callback",
  "/api/health",
  "/api/leads/ingest",
  "/api/supabase/health",
];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_ROUTES.has(pathname) ||
    PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });
  const pathname = request.nextUrl.pathname;
  const publicConfig = getSupabasePublicConfig();

  if (!publicConfig) {
    if (isPublicPath(pathname)) {
      return response;
    }

    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503 }
      );
    }

    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("error", "supabase_not_configured");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient(publicConfig.url, publicConfig.anonKey, {
    cookieOptions: {
      name: "nyra-supabase-auth",
      path: "/",
      sameSite: "lax",
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, options, value }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath(pathname)) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
