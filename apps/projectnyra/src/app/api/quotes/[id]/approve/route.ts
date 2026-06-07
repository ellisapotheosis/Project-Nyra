import { NextResponse } from "next/server";

import {
  canUseMockFallback,
  productionWriteUnavailable,
} from "@/lib/api/config";

const CRM_API_URL = process.env.CRM_API_URL;
const CRM_API_KEY = process.env.CRM_API_KEY;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  let upstreamError: unknown;

  if (CRM_API_URL) {
    try {
      const response = await fetch(`${CRM_API_URL}/api/quotes/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch (error) {
      upstreamError = error;
    }
  }

  if (!canUseMockFallback()) {
    return productionWriteUnavailable(
      "Quote approval",
      upstreamError
        ? "Configured CRM API could not be reached"
        : "CRM_API_URL must be configured for production quote approvals"
    );
  }

  return NextResponse.json({
    success: true,
    quoteId: id,
    approvedBy: body.approvedBy,
    source: "mock",
  });
}
