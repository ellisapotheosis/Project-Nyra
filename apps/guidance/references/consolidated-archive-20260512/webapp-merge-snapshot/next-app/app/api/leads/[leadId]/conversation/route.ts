import { NextResponse } from "next/server"

import { timelines } from "@/lib/mock-data"

const CRM_API_URL = process.env.CRM_API_URL
const CRM_API_KEY = process.env.CRM_API_KEY

export async function GET(_: Request, context: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await context.params

  if (CRM_API_URL) {
    try {
      const response = await fetch(`${CRM_API_URL}/api/leads/${leadId}/conversation`, {
        headers: {
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch {}
  }

  return NextResponse.json({
    logs: timelines[leadId] ?? [],
    source: "mock",
  })
}
