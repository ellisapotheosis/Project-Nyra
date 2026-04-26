import { NextResponse } from "next/server"

import { getCrmWorkspaceData } from "@/lib/crm-data"

export async function GET() {
  const data = await getCrmWorkspaceData()
  return NextResponse.json(data)
}
