import { NextResponse } from "next/server";

import { getCrmWorkspaceData } from "@/lib/crm-data";

export async function GET() {
  try {
    const workspace = await getCrmWorkspaceData();

    return NextResponse.json({
      workspace,
      source: workspace.source,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "CRM workspace data unavailable",
        detail: error instanceof Error ? error.message : "Unknown CRM error",
      },
      { status: 503 }
    );
  }
}
