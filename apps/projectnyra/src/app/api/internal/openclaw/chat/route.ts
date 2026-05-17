import { NextRequest, NextResponse } from "next/server";
import { serviceConfig } from "@/lib/api/config";

type ChatMessage = {
  role: "assistant" | "system" | "user";
  content: string;
};

type ChatChoice = {
  message?: {
    content?: string | null;
  } | null;
};

type ChatPayload = Record<string, unknown> & {
  choices?: ChatChoice[];
  message?: string;
};

const OPENCLAW_BASE_URL =
  serviceConfig.openClawBaseUrl || "http://localhost:3401";
const OPENCLAW_CHAT_PATH = serviceConfig.openClawChatPath;
const OPENCLAW_GATEWAY_TOKEN = serviceConfig.openClawGatewayToken;
const OPENCLAW_DEFAULT_MODEL =
  serviceConfig.openClawDefaultModel || "gpt-4o-mini";
const INTERNAL_PROXY_TOKEN = serviceConfig.internalProxyToken;
const CRM_API_URL = serviceConfig.crmApiUrl;
const CRM_API_KEY = serviceConfig.crmApiKey;

function getAssistantText(payload: ChatPayload): string {
  return (
    payload.choices?.[0]?.message?.content ??
    payload.message ??
    JSON.stringify(payload)
  );
}

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production" && !INTERNAL_PROXY_TOKEN) {
      return NextResponse.json(
        { error: "NYRA_CHAT_INTERNAL_PROXY_TOKEN is required in production" },
        { status: 500 }
      );
    }

    if (INTERNAL_PROXY_TOKEN) {
      const incomingToken = req.headers.get("x-nyra-internal-token") || "";
      if (incomingToken !== INTERNAL_PROXY_TOKEN) {
        return NextResponse.json(
          { error: "Unauthorized proxy request" },
          { status: 401 }
        );
      }
    }

    const body = (await req.json()) as {
      leadId?: string;
      messages?: ChatMessage[];
    };
    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages[] is required" },
        { status: 400 }
      );
    }

    const leadContext = body.leadId ? await getLeadContext(body.leadId) : null;
    const contextualMessages = leadContext
      ? [
          {
            role: "system" as const,
            content:
              "Use this server-fetched Project Nyra lead context only for summarization and proposed actions. Do not claim quotes, rates, approvals, or send communications without calling the appropriate Nyra service boundary and broker approval. Lead context: " +
              JSON.stringify(leadContext),
          },
          ...messages,
        ]
      : messages;

    const upstreamResponse = await fetch(
      `${OPENCLAW_BASE_URL}${OPENCLAW_CHAT_PATH}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(OPENCLAW_GATEWAY_TOKEN
            ? { Authorization: `Bearer ${OPENCLAW_GATEWAY_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({
          model: OPENCLAW_DEFAULT_MODEL,
          messages: contextualMessages,
        }),
        cache: "no-store",
      }
    );

    const upstreamText = await upstreamResponse.text();
    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          error: "Upstream OpenClaw request failed",
          upstreamBody: upstreamText,
          upstreamStatus: upstreamResponse.status,
        },
        { status: 502 }
      );
    }

    try {
      const parsed = JSON.parse(upstreamText) as ChatPayload;
      return NextResponse.json({
        assistant: getAssistantText(parsed),
        raw: parsed,
      });
    } catch {
      return NextResponse.json({ assistant: upstreamText, raw: upstreamText });
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal proxy error",
      },
      { status: 500 }
    );
  }
}

async function getLeadContext(leadId: string) {
  if (!CRM_API_URL) return null;

  try {
    const [leadResponse, conversationResponse] = await Promise.all([
      fetch(`${CRM_API_URL}/api/leads/${leadId}`, {
        headers: CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : undefined,
        cache: "no-store",
      }),
      fetch(`${CRM_API_URL}/api/leads/${leadId}/conversation`, {
        headers: CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : undefined,
        cache: "no-store",
      }),
    ]);

    const lead = leadResponse.ok ? await leadResponse.json() : null;
    const conversation = conversationResponse.ok
      ? await conversationResponse.json()
      : null;

    return {
      leadId,
      lead,
      conversation,
    };
  } catch {
    return { leadId, warning: "CRM lead context fetch failed" };
  }
}
