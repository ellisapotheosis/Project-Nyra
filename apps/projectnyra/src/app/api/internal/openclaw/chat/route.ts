import { NextRequest, NextResponse } from "next/server";

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
  process.env.OPENCLAW_PUBLIC_BASE_URL || "http://localhost:3401";
const OPENCLAW_CHAT_PATH =
  process.env.OPENCLAW_CHAT_PATH || "/v1/chat/completions";
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";
const OPENCLAW_DEFAULT_MODEL =
  process.env.OPENCLAW_DEFAULT_MODEL || "gpt-4o-mini";
const INTERNAL_PROXY_TOKEN = process.env.NYRA_CHAT_INTERNAL_PROXY_TOKEN || "";

function getAssistantText(payload: ChatPayload): string {
  return (
    payload.choices?.[0]?.message?.content ??
    payload.message ??
    JSON.stringify(payload)
  );
}

export async function POST(req: NextRequest) {
  try {
    if (INTERNAL_PROXY_TOKEN) {
      const incomingToken = req.headers.get("x-nyra-internal-token") || "";
      if (incomingToken !== INTERNAL_PROXY_TOKEN) {
        return NextResponse.json(
          { error: "Unauthorized proxy request" },
          { status: 401 }
        );
      }
    }

    const body = (await req.json()) as { messages?: ChatMessage[] };
    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages[] is required" },
        { status: 400 }
      );
    }

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
          messages,
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
