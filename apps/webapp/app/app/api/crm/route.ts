import { NextResponse } from "next/server"

export async function GET() {
  // This route is deprecated in favor of direct crmApi calls from client components.
  // Returning empty object to satisfy typecheck for now.
  return NextResponse.json({ message: "Deprecated. Use crmApi.getPipeline() instead." })
}
