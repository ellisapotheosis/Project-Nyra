import { NextResponse } from "next/server"

import { campaigns } from "@/lib/mock-data"
import { NYRA_ENABLE_MOCKS, serviceConfig, serviceUnavailable } from "@/lib/api/config"

const CAMPAIGN_ENGINE_URL = serviceConfig.campaignEngineUrl

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (CAMPAIGN_ENGINE_URL) {
    try {
      const response = await fetch(`${CAMPAIGN_ENGINE_URL}/api/campaigns/${id}`, {
        cache: "no-store",
      })

      if (response.ok) {
        return NextResponse.json(await response.json())
      }
    } catch (error) {
      if (!NYRA_ENABLE_MOCKS) {
        return serviceUnavailable("Campaign Engine", error instanceof Error ? error.message : `Campaign ${id} request failed`, 502)
      }
    }
  }

  if (!NYRA_ENABLE_MOCKS) {
    return serviceUnavailable("Campaign Engine", "CAMPAIGN_ENGINE_URL is not configured")
  }

  const campaign = campaigns.find((entry) => entry.id === id)
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
  }

  return NextResponse.json({
    ...campaign,
    loanPurpose: "PURCHASE",
    active: campaign.status === "Running",
    steps: [],
    source: "mock",
  })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  if (CAMPAIGN_ENGINE_URL) {
    try {
      const response = await fetch(`${CAMPAIGN_ENGINE_URL}/api/campaigns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        return NextResponse.json(await response.json())
      }
    } catch (error) {
      if (!NYRA_ENABLE_MOCKS) {
        return serviceUnavailable("Campaign Engine", error instanceof Error ? error.message : `Campaign ${id} update failed`, 502)
      }
    }
  }

  if (!NYRA_ENABLE_MOCKS) {
    return serviceUnavailable("Campaign Engine", "CAMPAIGN_ENGINE_URL is not configured")
  }

  return NextResponse.json({ id, ...body, source: "mock" })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (CAMPAIGN_ENGINE_URL) {
    try {
      const response = await fetch(`${CAMPAIGN_ENGINE_URL}/api/campaigns/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        return NextResponse.json(await response.json())
      }
    } catch (error) {
      if (!NYRA_ENABLE_MOCKS) {
        return serviceUnavailable("Campaign Engine", error instanceof Error ? error.message : `Campaign ${id} delete failed`, 502)
      }
    }
  }

  if (!NYRA_ENABLE_MOCKS) {
    return serviceUnavailable("Campaign Engine", "CAMPAIGN_ENGINE_URL is not configured")
  }

  return NextResponse.json({ success: true, id, source: "mock" })
}
