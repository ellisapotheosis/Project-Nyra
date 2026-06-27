import { NextResponse } from "next/server";
import { crmProxy } from "@nyra/shared";

import { leads } from "@/lib/mock-data";

export async function GET() {
  const result = await crmProxy("/api/leads");

  if (result.ok) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json({ leads, source: "mock" });
}
