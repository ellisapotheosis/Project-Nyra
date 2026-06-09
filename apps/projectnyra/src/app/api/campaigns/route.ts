import { NextResponse } from "next/server";

import {
  canUseMockFallback,
  productionReadUnavailable,
  productionWriteUnavailable,
} from "@/lib/api/config";
import { toCampaignContract } from "@/lib/campaign-contract";
import { campaigns } from "@/lib/mock-data";

const CAMPAIGN_ENGINE_URL = process.env.CAMPAIGN_ENGINE_URL;

export async function GET() {
  if (CAMPAIGN_ENGINE_URL) {
    try {
      const response = await fetch(`${CAMPAIGN_ENGINE_URL}/api/campaigns`, {
        cache: "no-store",
      });

      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch {}
  }

  if (!canUseMockFallback()) {
    return productionReadUnavailable(
      "Campaign service",
      "CAMPAIGN_ENGINE_URL must be configured for production campaign reads"
    );
  }

  return NextResponse.json({ campaigns, source: "mock" });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const campaignContract = toCampaignContract(payload);

  if (CAMPAIGN_ENGINE_URL) {
    try {
      const response = await fetch(`${CAMPAIGN_ENGINE_URL}/api/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignContract),
        cache: "no-store",
      });

      if (response.ok) {
        return NextResponse.json(await response.json(), {
          status: response.status,
        });
      }

      return NextResponse.json(
        {
          error: "Campaign service failed",
          detail: await response.json().catch(() => ({})),
          source: "campaign-service",
        },
        { status: response.status }
      );
    } catch {}
  }

  if (!canUseMockFallback()) {
    return productionWriteUnavailable(
      "Campaign service",
      "CAMPAIGN_ENGINE_URL must be configured for production campaign writes"
    );
  }

  return NextResponse.json(
    {
      success: true,
      campaign: {
        id: `campaign-${Date.now()}`,
        ...campaignContract,
        active: payload.active ?? payload.status === "ACTIVE",
        status: payload.status ?? "DRAFT",
        contract: {
          sourceOfTruth: "campaign-service",
          stateMachine: "nyra-campaign-v1",
          sendEligibilityRequiresCompliance: true,
        },
      },
      source: "mock",
    },
    { status: 201 }
  );
}
