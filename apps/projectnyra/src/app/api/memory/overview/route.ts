import { NextResponse } from "next/server";
import { serviceConfig } from "@/lib/api/config";

const CRM_API_URL = serviceConfig.crmApiUrl;
const CRM_API_KEY = serviceConfig.crmApiKey;

export async function GET() {
  if (CRM_API_URL) {
    try {
      const response = await fetch(`${CRM_API_URL}/api/memory/overview`, {
        headers: {
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        cache: "no-store",
      });

      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch (e) {
      console.error("[Memory API] Fetch failed, using fallback mock.");
    }
  }

  // Fallback Mock Data
  return NextResponse.json({
    totalMemories: 1452,
    leadMemories: 840,
    campaignMemories: 320,
    agentMemories: 212,
    systemMemories: 80,
    recentWrites: 45,
    failedWrites: 2,
    averageConfidence: 0.94,
    source: "mock",
  });
}
