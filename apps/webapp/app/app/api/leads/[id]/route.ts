import { NextResponse } from "next/server";

import { leads } from "@/lib/mock-data";

const CRM_API_URL = process.env.CRM_API_URL;
const CRM_API_KEY = process.env.CRM_API_KEY;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (CRM_API_URL) {
    try {
      const response = await fetch(`${CRM_API_URL}/api/leads/${id}`, {
        headers: {
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        cache: "no-store",
      });

      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch {}
  }

  const lead = leads.find((entry) => entry.id === id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ lead, source: "mock" });
}
