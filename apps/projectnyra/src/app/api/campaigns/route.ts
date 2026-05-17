import { NextResponse } from "next/server";

import { campaigns } from "@/lib/mock-data";
import {
  NYRA_ENABLE_MOCKS,
  serviceConfig,
  serviceUnavailable,
} from "@/lib/api/config";

const CAMPAIGN_ENGINE_URL = serviceConfig.campaignEngineUrl;

export async function GET() {
  if (CAMPAIGN_ENGINE_URL) {
    try {
      const response = await fetch(`${CAMPAIGN_ENGINE_URL}/api/campaigns`, {
        cache: "no-store",
      });

      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch (error) {
      if (!NYRA_ENABLE_MOCKS) {
        return serviceUnavailable(
          "Campaign Engine",
          error instanceof Error
            ? error.message
            : "Campaign list request failed",
          502
        );
      }
    }
  }

  if (!NYRA_ENABLE_MOCKS) {
    return serviceUnavailable(
      "Campaign Engine",
      "CAMPAIGN_ENGINE_URL is not configured"
    );
  }

  return NextResponse.json({ campaigns, source: "mock" });
}

export async function POST(request: Request) {
  const payload = await request.json();

  if (CAMPAIGN_ENGINE_URL) {
    try {
      const response = await fetch(`${CAMPAIGN_ENGINE_URL}/api/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return NextResponse.json(await response.json(), {
          status: response.status,
        });
      }
    } catch (error) {
      if (!NYRA_ENABLE_MOCKS) {
        return serviceUnavailable(
          "Campaign Engine",
          error instanceof Error
            ? error.message
            : "Campaign create request failed",
          502
        );
      }
    }
  }

  if (!NYRA_ENABLE_MOCKS) {
    return serviceUnavailable(
      "Campaign Engine",
      "CAMPAIGN_ENGINE_URL is not configured"
    );
  }

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
  );
}
