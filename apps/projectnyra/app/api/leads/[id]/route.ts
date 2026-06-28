import { NextResponse } from "next/server";
import { crmProxy } from "@nyra/shared/crm-proxy";

import { leads } from "@/lib/mock-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await crmProxy(`/api/leads/${id}`);

  if (result.ok) {
    return NextResponse.json(result.data);
  }

  const lead = leads.find((entry) => entry.id === id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ lead, source: "mock" });
}
