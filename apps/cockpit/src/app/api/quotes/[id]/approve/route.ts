import { NextResponse } from "next/server"
import { NYRA_ENABLE_MOCKS, serviceConfig, serviceUnavailable } from "@/lib/api/config"

const CRM_API_URL = serviceConfig.crmApiUrl
const CRM_API_KEY = serviceConfig.crmApiKey

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  if (CRM_API_URL) {
    try {
      const response = await fetch(`${CRM_API_URL}/api/quotes/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        return NextResponse.json(await response.json())
      }
    } catch (error) {
      if (!NYRA_ENABLE_MOCKS) {
        return serviceUnavailable("CRM API", error instanceof Error ? error.message : `Quote ${id} approval failed`, 502)
      }
    }
  }

  if (!NYRA_ENABLE_MOCKS) {
    return serviceUnavailable("CRM API", "CRM_API_URL is not configured")
  }

  return NextResponse.json({
    success: true,
    quoteId: id,
    approvedBy: body.approvedBy,
    source: "mock",
  })
}
