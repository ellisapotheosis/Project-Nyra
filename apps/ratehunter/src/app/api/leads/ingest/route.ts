import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Forward to the Lead Capture API (capture.projectnyra.com)
    const leadCaptureApiUrl =
      process.env.LEAD_CAPTURE_API_URL ||
      "https://capture.projectnyra.com/api/leads";

    // Forward the lead data to the Lead Capture service
    // Include TCPA consent parameter
    const payload = {
      ...data,
      consent: true,
    };

    const response = await fetch(leadCaptureApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Lead Capture API responded with ${response.status}: ${errorText}`
      );
    }

    const resData = await response.json();

    return NextResponse.json({
      success: true,
      message:
        "Lead captured and routed successfully to capture.projectnyra.com.",
      data: resData,
    });
  } catch (error: any) {
    console.error("Lead ingest proxy error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to route lead." },
      { status: 500 }
    );
  }
}
