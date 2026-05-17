import { NextRequest, NextResponse } from "next/server";

import { leads } from "@/lib/mock-data";
import {
  NYRA_ENABLE_MOCKS,
  serviceConfig,
  serviceUnavailable,
} from "@/lib/api/config";

const CRM_API_URL = serviceConfig.crmApiUrl;
const CRM_API_KEY = serviceConfig.crmApiKey;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  if (CRM_API_URL) {
    try {
      const response = await fetch(`${CRM_API_URL}/api/leads/${id}/campaign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      if (!NYRA_ENABLE_MOCKS) {
        return serviceUnavailable(
          "CRM API",
          error instanceof Error
            ? error.message
            : `Lead ${id} campaign mutation failed`,
          502
        );
      }
    }
  }

  if (!NYRA_ENABLE_MOCKS) {
    return serviceUnavailable("CRM API", "CRM_API_URL is not configured");
  }

  const lead = leads.find((entry) => entry.id === id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  (lead as any).campaignStatus = body.status || (lead as any).campaignStatus;
  return NextResponse.json({ success: true, lead, source: "mock" });
}
