import { NextResponse } from "next/server";

function canUseLocalMockFallback() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NYRA_ENABLE_MOCKS === "true"
  );
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const n8nWebhookUrl = process.env.N8N_INGEST_WEBHOOK_URL?.trim();

    if (!n8nWebhookUrl) {
      if (!canUseLocalMockFallback()) {
        return NextResponse.json(
          {
            success: false,
            error: "Lead ingest is unavailable",
            detail:
              "Set N8N_INGEST_WEBHOOK_URL or enable NYRA_ENABLE_MOCKS=true for explicit production mock mode.",
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          source: "mock",
          message: "Lead accepted by local RateHunter mock ingest.",
        },
        { status: 202 }
      );
    }

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`n8n responded with ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      message: "Lead captured and routed.",
    });
  } catch (error) {
    console.error("Lead ingest proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to route lead." },
      { status: 500 }
    );
  }
}
