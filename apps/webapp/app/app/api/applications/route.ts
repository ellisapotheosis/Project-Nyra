import { NextResponse } from "next/server"

import { getCrmWorkspaceData } from "@/lib/crm-data"

export async function GET() {
  const { applications, source } = await getCrmWorkspaceData()
  return NextResponse.json({ applications, source })
}
