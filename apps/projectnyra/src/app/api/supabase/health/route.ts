import { NextResponse } from "next/server";

import { getSupabasePublicConfig } from "@/lib/supabase/env";

export function GET() {
  const config = getSupabasePublicConfig();

  return NextResponse.json({
    configured: Boolean(config),
    url: config?.url ?? null,
  });
}
