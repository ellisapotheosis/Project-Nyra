import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Forward to n8n WF_LEAD_INGEST Webhook
    // In production, this URL comes from an ENV var
    const n8nWebhookUrl =
      process.env.N8N_INGEST_WEBHOOK_URL ||
      "http://localhost:5678/webhook/lead-ingest";

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
