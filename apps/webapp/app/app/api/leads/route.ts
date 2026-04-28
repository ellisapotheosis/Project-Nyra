import { NextResponse } from "next/server"

import { getCrmWorkspaceData } from "@/lib/crm-data"

export async function GET() {
  const { leads, source } = await getCrmWorkspaceData()
  return NextResponse.json({ leads, source })
}
