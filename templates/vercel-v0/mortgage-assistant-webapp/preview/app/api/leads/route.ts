import { NextResponse } from "next/server"

import { leads } from "@/lib/mock-data"

const CRM_API_URL = process.env.CRM_API_URL
const CRM_API_KEY = process.env.CRM_API_KEY

export async function GET() {
  if (CRM_API_URL) {
    try {
      const response = await fetch(`${CRM_API_URL}/api/leads`, {
        headers: {
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch {}
  }

  return NextResponse.json({ leads, source: "mock" })
}
