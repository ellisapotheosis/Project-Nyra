import { NextResponse } from "next/server"

import { applications, leads } from "@/lib/mock-data"
import { NYRA_ENABLE_MOCKS, serviceConfig, serviceUnavailable } from "@/lib/api/config"

const CRM_API_URL = serviceConfig.crmApiUrl
const CRM_API_KEY = serviceConfig.crmApiKey

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
    } catch (error) {
      if (!NYRA_ENABLE_MOCKS) {
        return serviceUnavailable("CRM API", error instanceof Error ? error.message : "Pipeline request failed", 502)
      }
    }
  }

  if (!NYRA_ENABLE_MOCKS) {
    return serviceUnavailable("CRM API", "CRM_API_URL is not configured")
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
