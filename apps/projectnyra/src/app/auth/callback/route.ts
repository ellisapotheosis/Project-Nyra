import { NextResponse, type NextRequest } from "next/server";

import { getSafeRedirectPath } from "@/lib/safe-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("error", "auth_callback_failed");
        loginUrl.searchParams.set("redirect", next);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("error", "supabase_not_configured");
      loginUrl.searchParams.set("redirect", next);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
