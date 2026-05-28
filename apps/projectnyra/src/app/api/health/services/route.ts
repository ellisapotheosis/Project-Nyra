import { NextResponse } from "next/server";

import { getIntegrationHealthSnapshot } from "@/lib/api/integrationHealth";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getIntegrationHealthSnapshot();

  return NextResponse.json(snapshot, { status: snapshot.ready ? 200 : 503 });
}
