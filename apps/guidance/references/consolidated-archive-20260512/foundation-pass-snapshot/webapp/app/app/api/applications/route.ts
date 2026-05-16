import { NextResponse } from "next/server"

import { applications } from "@/lib/mock-data"
import { NYRA_ENABLE_MOCKS, serviceConfig, serviceUnavailable } from "@/lib/api/config"

const CRM_API_URL = serviceConfig.crmApiUrl
const CRM_API_KEY = serviceConfig.crmApiKey

export async function GET() {
  if (CRM_API_URL) {
    try {
      const response = await fetch(`${CRM_API_URL}/api/applications`, {
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
        return serviceUnavailable("CRM API", error instanceof Error ? error.message : "Application list request failed", 502)
      }
    }
  }

  if (!NYRA_ENABLE_MOCKS) {
    return serviceUnavailable("CRM API", "CRM_API_URL is not configured")
  }

  return NextResponse.json({ applications, source: "mock" })
}
