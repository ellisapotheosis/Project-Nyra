import { NextRequest, NextResponse } from "next/server";

const CRM_API_URL = process.env.CRM_API_URL;
const CRM_API_KEY = process.env.CRM_API_KEY;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (CRM_API_URL) {
    try {
      const response = await fetch(
        `${CRM_API_URL}/api/leads/${id}/conversation`,
        {
          headers: {
            ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
          },
          cache: "no-store",
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch {}
  }

  return NextResponse.json({ logs: [], source: "mock" });
}
