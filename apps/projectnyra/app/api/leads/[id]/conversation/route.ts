import { NextResponse } from "next/server";
import { crmProxy } from "@nyra/shared/crm-proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await crmProxy(`/api/leads/${id}/conversation`);

  if (result.ok) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json({ logs: [], source: "mock" });
}
