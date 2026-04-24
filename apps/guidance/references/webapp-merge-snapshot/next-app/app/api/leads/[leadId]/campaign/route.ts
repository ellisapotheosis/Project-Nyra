import { NextResponse } from "next/server"

export async function PATCH(request: Request, context: { params: Promise<{ leadId: string }> }) {
  const body = (await request.json()) as { status?: string }
  const { leadId } = await context.params
  const CRM_API_URL = process.env.CRM_API_URL
  const CRM_API_KEY = process.env.CRM_API_KEY

  if (CRM_API_URL) {
    try {
      const response = await fetch(`${CRM_API_URL}/api/leads/${leadId}/campaign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch {}
  }

  return NextResponse.json({
    ok: true,
    leadId,
    status: body.status ?? null,
    source: "mock",
  })
}
