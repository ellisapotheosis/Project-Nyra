import { NextResponse } from "next/server"

import { applications, leads } from "@/lib/mock-data"

const CRM_API_URL = process.env.CRM_API_URL
const CRM_API_KEY = process.env.CRM_API_KEY

export async function GET() {
  if (CRM_API_URL) {
    try {
      const response = await fetch(`${CRM_API_URL}/api/dashboard/pipeline`, {
        headers: {
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        cache: "no-store",
      })

      if (response.ok) {
        return NextResponse.json(await response.json())
      }
    } catch {}
  }

  const grouped = new Map<string, number>()
  for (const lead of leads) {
    const key = lead.campaignStatus || lead.stage || "Unassigned"
    grouped.set(key, (grouped.get(key) ?? 0) + 1)
  }

  return NextResponse.json({
    pipeline: Array.from(grouped.entries()).map(([status, total]) => ({
      campaign_name: "Mortgage workspace",
      status,
      total,
      next_touch: applications[0]?.updatedAt ?? null,
    })),
    source: "mock",
  })
}
