import { NextResponse } from "next/server";

const CRM_API_URL =
  process.env.CRM_API_URL || process.env.LEAD_CAPTURE_API_URL || "";
const CRM_API_KEY =
  process.env.CRM_API_KEY || process.env.LEAD_CAPTURE_API_KEY || "";

export async function POST(request: Request) {
  const body = await request.json();

  if (!CRM_API_URL) {
    return NextResponse.json(
      {
        error: "Lead ingestion is not configured.",
        detail: "Set CRM_API_URL or LEAD_CAPTURE_API_URL server-side.",
      },
      { status: 503 }
    );
  }

  const consentTimestamp = body.consentTimestamp || new Date().toISOString();
  const payload = {
    ...body,
    source: body.source || "ratehunter_landing",
    leadSource: body.leadSource || "ratehunter_landing",
    consentTimestamp,
    consentSource: body.consentSource || "ratehunter_landing_checkbox",
    metadata: {
      ...(body.metadata || {}),
      capturedAt: consentTimestamp,
      capturedBy: "apps/ratehunter-landing",
    },
  };

  try {
    const response = await fetch(
      `${CRM_API_URL.replace(/\/$/, "")}/api/leads`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const responsePayload = await response.json().catch(() => ({}));
    return NextResponse.json(responsePayload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Lead ingestion request failed.",
        detail:
          error instanceof Error ? error.message : "Unknown ingestion failure",
      },
      { status: 502 }
    );
  }
}
