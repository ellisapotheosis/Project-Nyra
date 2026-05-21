import { NextRequest, NextResponse } from "next/server";

import {
  canUseMockFallback,
  productionWriteUnavailable,
} from "@/lib/api/config";
import { leads } from "@/lib/mock-data";

const CRM_API_URL = process.env.CRM_API_URL;
const CRM_API_KEY = process.env.CRM_API_KEY;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  let upstreamError: unknown;

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
      upstreamError = error;
    }
  }

  if (!canUseMockFallback()) {
    return productionWriteUnavailable(
      "Campaign mutation",
      upstreamError
        ? "Configured CRM API could not be reached"
        : "CRM_API_URL must be configured for production campaign mutations"
    );
  }

  const lead = leads.find((entry) => entry.id === id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  (lead as any).campaignStatus = body.status || (lead as any).campaignStatus;
  return NextResponse.json({ success: true, lead, source: "mock" });
}
