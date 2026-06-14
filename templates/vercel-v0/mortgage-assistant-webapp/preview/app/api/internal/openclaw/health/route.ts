import { NextResponse } from 'next/server'

const OPENCLAW_BASE_URL = process.env.OPENCLAW_PUBLIC_BASE_URL || 'http://localhost:3401'

export async function GET() {
  try {
    const response = await fetch(`${OPENCLAW_BASE_URL}/health`, { cache: 'no-store' })
    const body = await response.text()

    return NextResponse.json({
      body,
      ok: response.ok,
      status: response.status,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Health probe failed', ok: false },
      { status: 500 },
    )
  }
}
