import { NextResponse } from "next/server";

const CRM_API_URL = process.env.CRM_API_URL;
const CRM_API_KEY = process.env.CRM_API_KEY;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

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
    } catch {}
  }

  return NextResponse.json({
    success: true,
    quoteId: id,
    approvedBy: body.approvedBy,
    source: "mock",
  });
}
