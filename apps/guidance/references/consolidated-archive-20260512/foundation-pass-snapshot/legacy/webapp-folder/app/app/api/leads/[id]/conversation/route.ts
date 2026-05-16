import { NextRequest, NextResponse } from "next/server"
import { NYRA_ENABLE_MOCKS, serviceConfig, serviceUnavailable } from "@/lib/api/config"

const CRM_API_URL = serviceConfig.crmApiUrl
const CRM_API_KEY = serviceConfig.crmApiKey

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (CRM_API_URL) {
    try {
      const response = await fetch(`${CRM_API_URL}/api/leads/${id}/conversation`, {
        headers: {
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      if (!NYRA_ENABLE_MOCKS) {
        return serviceUnavailable("CRM API", error instanceof Error ? error.message : `Lead ${id} conversation request failed`, 502)
      }
    }
  }

  if (!NYRA_ENABLE_MOCKS) {
    return serviceUnavailable("CRM API", "CRM_API_URL is not configured")
  }

  return NextResponse.json({ logs: [], source: "mock" })
}
