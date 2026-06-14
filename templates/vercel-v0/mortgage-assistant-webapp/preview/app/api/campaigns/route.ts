import { NextResponse } from "next/server"

import { campaigns } from "@/lib/mock-data"

export function GET() {
  return NextResponse.json({ campaigns, source: "mock" })
}

export async function POST(request: Request) {
  const payload = await request.json()

  return NextResponse.json(
    {
      success: true,
      campaign: {
        id: `campaign-${Date.now()}`,
        ...payload,
      },
      source: "mock",
    },
    { status: 201 }
  )
}
