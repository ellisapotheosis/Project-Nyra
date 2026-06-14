import { NextResponse } from "next/server"

import { applications } from "@/lib/mock-data"

export function GET() {
  return NextResponse.json({ applications, source: "mock" })
}
