import { NextResponse } from "next/server";

import { getSupabasePublicConfig } from "@/lib/supabase/env";
import { getSupabaseServiceRoleKey } from "@/lib/supabase/server-env";

export function GET() {
  const config = getSupabasePublicConfig();

  return NextResponse.json({
    configured: Boolean(config),
    serviceRoleConfigured: Boolean(getSupabaseServiceRoleKey()),
    url: config?.url ?? null,
  });
}
