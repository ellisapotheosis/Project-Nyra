import { NextResponse } from "next/server";

import { NYRA_ENABLE_MOCKS, serviceConfig, serviceUnavailable } from "@/lib/api/config";

const CRM_API_URL = serviceConfig.crmApiUrl;
const CRM_API_KEY = serviceConfig.crmApiKey;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (CRM_API_URL) {
    try {
      const response = await fetch(`${CRM_API_URL}/api/quotes/${id}`, {
        headers: CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : undefined,
        cache: "no-store",
      });

      if (response.ok) {
        return NextResponse.json(await response.json(), { status: response.status });
      }
    } catch (error) {
      if (!NYRA_ENABLE_MOCKS) {
        return serviceUnavailable("CRM API", error instanceof Error ? error.message : `Quote ${id} request failed`, 502);
      }
    }
  }

  if (!NYRA_ENABLE_MOCKS) {
    return serviceUnavailable("CRM API", "CRM_API_URL is not configured");
  }

  return NextResponse.json({
    quote: {
      id,
      status: "PENDING",
      leadId: "mock-lead",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      options: [
        { id: "lowest-payment", label: "Lowest payment", rate: 6.95, apr: 7.12, points: 0 },
        { id: "balanced", label: "Balanced", rate: 6.75, apr: 6.96, points: 0.5 },
        { id: "lowest-cost", label: "Lowest cost", rate: 6.5, apr: 6.82, points: 1 },
      ],
    },
    source: "mock",
  });
}
