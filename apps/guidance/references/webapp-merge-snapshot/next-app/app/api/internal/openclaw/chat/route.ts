import { NextResponse } from "next/server"

type ChatMessage = {
  role: "assistant" | "user"
  content: string
}

type Lead = {
  firstName: string
  lastName: string
  loanPurpose: string
} | null

type ChatPayload = Record<string, unknown> & {
  choices?: Array<{
    message?: {
      content?: string | null
    } | null
  }>
  message?: string
}

const OPENCLAW_BASE_URL = process.env.OPENCLAW_PUBLIC_BASE_URL
const OPENCLAW_CHAT_PATH = process.env.OPENCLAW_CHAT_PATH || "/v1/chat/completions"
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || ""
const OPENCLAW_DEFAULT_MODEL = process.env.OPENCLAW_DEFAULT_MODEL || "gpt-4o-mini"
const INTERNAL_PROXY_TOKEN = process.env.NYRA_CHAT_INTERNAL_PROXY_TOKEN || ""

function getAssistantText(payload: ChatPayload): string {
  return payload.choices?.[0]?.message?.content ?? payload.message ?? JSON.stringify(payload)
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    lead?: Lead
    messages?: ChatMessage[]
  }

  if (INTERNAL_PROXY_TOKEN) {
    const incomingToken = request.headers.get("x-nyra-internal-token") || ""
    if (incomingToken !== INTERNAL_PROXY_TOKEN) {
      return NextResponse.json({ error: "Unauthorized proxy request" }, { status: 401 })
    }
  }

  const latestUserMessage = [...(body.messages ?? [])].reverse().find((message) => message.role === "user")
  const leadContext = body.lead
    ? `${body.lead.firstName} ${body.lead.lastName} (${body.lead.loanPurpose})`
    : "general workspace"

  if (OPENCLAW_BASE_URL && Array.isArray(body.messages) && body.messages.length > 0) {
    try {
      const upstreamResponse = await fetch(`${OPENCLAW_BASE_URL}${OPENCLAW_CHAT_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(OPENCLAW_GATEWAY_TOKEN ? { Authorization: `Bearer ${OPENCLAW_GATEWAY_TOKEN}` } : {}),
        },
        body: JSON.stringify({
          model: OPENCLAW_DEFAULT_MODEL,
          messages: body.messages,
        }),
        cache: "no-store",
      })

      const upstreamText = await upstreamResponse.text()
      if (upstreamResponse.ok) {
        try {
          const parsed = JSON.parse(upstreamText) as ChatPayload
          return NextResponse.json({
            assistant: getAssistantText(parsed),
            raw: parsed,
            source: "openclaw",
          })
        } catch {
          return NextResponse.json({
            assistant: upstreamText,
            raw: upstreamText,
            source: "openclaw",
          })
        }
      }
    } catch {}
  }

  return NextResponse.json({
    assistant: latestUserMessage
      ? `Mock OpenClaw reply for ${leadContext}: I received "${latestUserMessage.content}" and would route that through the internal proxy from this merged scaffold.`
      : "Mock OpenClaw proxy is online.",
    source: "mock",
  })
}
