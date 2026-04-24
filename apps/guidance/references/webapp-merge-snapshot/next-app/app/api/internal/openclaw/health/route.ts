import { NextResponse } from "next/server"

const OPENCLAW_BASE_URL = process.env.OPENCLAW_PUBLIC_BASE_URL

export async function GET() {
  if (OPENCLAW_BASE_URL) {
    try {
      const response = await fetch(`${OPENCLAW_BASE_URL}/health`, { cache: "no-store" })
      const body = await response.text()

      return NextResponse.json({
        ok: response.ok,
        status: response.status,
        body,
        source: "openclaw",
      })
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Health probe failed",
          source: "openclaw",
        },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({
    ok: true,
    status: 200,
    body: "Mock OpenClaw health response",
    source: "mock",
  })
}
