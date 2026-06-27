import { NextRequest, NextResponse } from "next/server";
import { crmProxy } from "@nyra/shared";

import { leads } from "@/lib/mock-data";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const result = await crmProxy(`/api/leads/${id}/campaign`, {
    method: "PATCH",
    body,
  });

  if (result.ok) {
    return NextResponse.json(result.data);
  }

  const lead = leads.find((entry) => entry.id === id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  (lead as any).campaignStatus = body.status || (lead as any).campaignStatus;
  return NextResponse.json({ success: true, lead, source: "mock" });
}
