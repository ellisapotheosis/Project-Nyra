import { NextResponse } from "next/server";

function canUseLocalMockFallback() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NYRA_ENABLE_MOCKS === "true"
  );
}

function redactLogText(value: string): string {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]")
    .replace(/\+?\d[\d\s().-]{8,}\d/g, "[REDACTED_PHONE]")
    .replace(/(token|secret|key|authorization)=([^&\s]+)/gi, "$1=[REDACTED]");
}

function summarizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: redactLogText(error.message),
    };
  }

  return { message: redactLogText(String(error)) };
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const leadIngestionUrl = process.env.LEAD_INGESTION_API_URL?.trim();
    const n8nWebhookUrl = process.env.N8N_INGEST_WEBHOOK_URL?.trim();

    // Ensure source is explicitly set to ratehunter if not provided
    if (!data.source) {
      data.source = "ratehunter";
    }

    const targetUrl = leadIngestionUrl
      ? buildLeadIngestionUrl(leadIngestionUrl)
      : n8nWebhookUrl;

    if (!targetUrl) {
      if (!canUseLocalMockFallback()) {
        return NextResponse.json(
          {
            success: false,
            error: "Lead ingest is unavailable",
            detail:
              "Set LEAD_INGESTION_API_URL, N8N_INGEST_WEBHOOK_URL, or enable NYRA_ENABLE_MOCKS=true.",
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          source: "mock",
          message: "Lead accepted by local RateHunter mock ingest.",
          data: redactLogValue(data),
        },
        { status: 202 }
      );
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LEAD_INGESTION_API_KEY
          ? { "x-lead-ingestion-api-key": process.env.LEAD_INGESTION_API_KEY }
          : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Upstream responded with ${response.status}: ${JSON.stringify(errorData)}`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lead captured and routed to ingestion pipeline.",
    });
  } catch (error) {
    console.error("Lead ingest proxy error:", summarizeError(error));
    return NextResponse.json(
      { success: false, error: "Failed to route lead." },
      { status: 500 }
    );
  }
}

function buildLeadIngestionUrl(baseUrl: string) {
  return baseUrl.endsWith("/ingest")
    ? baseUrl
    : `${baseUrl.replace(/\/$/, "")}/api/leads/ingest`;
}

function redactLogValue(value: any) {
  if (typeof value === "string") return redactLogText(value);
  if (typeof value === "object" && value !== null) {
    const redacted: any = Array.isArray(value) ? [] : {};
    for (const key in value) {
      redacted[key] = redactLogValue(value[key]);
    }
    return redacted;
  }
  return value;
}
