import { NextResponse } from "next/server";

export async function POST() {
  // Simulate heavy computation
  await new Promise(r => setTimeout(r, 1500));
  return NextResponse.json({ success: true, action: "REBUILD_COMPLETE" });
}
