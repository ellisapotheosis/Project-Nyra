import { NextRequest, NextResponse } from "next/server";

import { serviceConfig } from "@/lib/api/config";

type AgentProvider =
  | "openclaw"
  | "llxprt-code"
  | "llxprt-jefe"
  | "llxprt-gemini"
  | "llxprt-claude";

type CampaignBuilderContext = {
  templateName?: string;
  builderMode?: string;
  selectedNode?: string;
  manualApproval?: boolean;
  durationDays?: number;
};

type ProposedAction = {
  id: string;
  label: string;
  detail: string;
  risk: "low" | "approval_required";
  command:
    | "set_mode"
    | "select_node"
    | "require_manual_approval"
    | "queue_save";
  value: string | boolean;
};

const providerModelMap: Record<AgentProvider, string> = {
  openclaw: serviceConfig.openClawDefaultModel || "openclaw-campaign-builder",
  "llxprt-code": "llxprt-codex",
  "llxprt-jefe": "llxprt-codex",
  "llxprt-gemini": "llxprt-gemini",
  "llxprt-claude": "llxprt-claude",
};

export async function POST(req: NextRequest) {
  try {
    if (
      process.env.NODE_ENV === "production" &&
      !serviceConfig.internalProxyToken
    ) {
      return NextResponse.json(
        { error: "NYRA_CHAT_INTERNAL_PROXY_TOKEN is required in production" },
        { status: 500 }
      );
    }

    if (serviceConfig.internalProxyToken) {
      const incomingToken = req.headers.get("x-nyra-internal-token") || "";
      if (incomingToken !== serviceConfig.internalProxyToken) {
        return NextResponse.json(
          { error: "Unauthorized campaign-builder agent request" },
          { status: 401 }
        );
      }
    }

    const body = (await req.json()) as {
      provider?: AgentProvider;
      command?: string;
      context?: CampaignBuilderContext;
    };

    const command = body.command?.trim();
    if (!command) {
      return NextResponse.json(
        { error: "command is required" },
        { status: 400 }
      );
    }

    const provider = body.provider || "openclaw";
    const context = body.context || {};
    const messages = buildMessages(command, context);
    const upstream = await callAgentProvider(provider, messages).catch(
      (error) => {
        const fallback = localCampaignBuilderFallback(
          messages[messages.length - 1]?.content || ""
        );
        const detail =
          error instanceof Error ? error.message : "provider unavailable";
        return `${fallback}\n\nProvider fallback: ${provider} was unreachable (${detail}).`;
      }
    );
    const proposedActions = proposeCampaignBuilderActions(command, upstream);

    return NextResponse.json({
      provider,
      assistant: upstream,
      proposedActions,
      voiceReady: true,
      safety:
        "Agent output is advisory. Builder changes remain local proposed actions until the broker applies them and saves through Nyra campaign APIs.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Campaign builder agent request failed",
      },
      { status: 500 }
    );
  }
}

function buildMessages(command: string, context: CampaignBuilderContext) {
  return [
    {
      role: "system",
      content:
        "You are Project Nyra's mortgage campaign builder copilot. Help a broker build 45-60 day mortgage lead nurture workflows. You may propose builder edits only. Do not send borrower communications, mutate CRM, invent rates, bypass STOP/DNC/consent/quiet-hours checks, or disable broker approval for quote/rate/payment language.",
    },
    {
      role: "user",
      content: JSON.stringify({
        task: command,
        currentBuilderState: context,
        allowedBuilderActions: [
          "set_mode",
          "select_node",
          "require_manual_approval",
          "queue_save",
        ],
      }),
    },
  ];
}

async function callAgentProvider(
  provider: AgentProvider,
  messages: Array<{ role: string; content: string }>
) {
  const model = providerModelMap[provider] || providerModelMap.openclaw;

  if (provider === "openclaw" && serviceConfig.openClawBaseUrl) {
    return callOpenAiCompatible(
      `${serviceConfig.openClawBaseUrl}${serviceConfig.openClawChatPath}`,
      model,
      messages,
      {
        ...(serviceConfig.openClawGatewayToken
          ? { Authorization: `Bearer ${serviceConfig.openClawGatewayToken}` }
          : {}),
      }
    );
  }

  if (provider.startsWith("llxprt") && serviceConfig.llxprtBridgeUrl) {
    return callOpenAiCompatible(
      `${serviceConfig.llxprtBridgeUrl.replace(/\/$/, "")}/v1/chat/completions`,
      model,
      messages,
      {
        ...(serviceConfig.llxprtBridgeApiKey
          ? { Authorization: `Bearer ${serviceConfig.llxprtBridgeApiKey}` }
          : {}),
      }
    );
  }

  if (serviceConfig.liteLlmBaseUrl) {
    return callOpenAiCompatible(
      `${serviceConfig.liteLlmBaseUrl.replace(/\/$/, "")}/chat/completions`,
      model,
      messages,
      {}
    );
  }

  return localCampaignBuilderFallback(
    messages[messages.length - 1]?.content || ""
  );
}

async function callOpenAiCompatible(
  url: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  headers: Record<string, string>
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ model, messages }),
    cache: "no-store",
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `Agent provider request failed: ${response.status} ${text}`
    );
  }

  try {
    const parsed = JSON.parse(text) as {
      choices?: Array<{ message?: { content?: string } }>;
      message?: string;
    };
    return parsed.choices?.[0]?.message?.content || parsed.message || text;
  } catch {
    return text;
  }
}

function localCampaignBuilderFallback(prompt: string) {
  const lower = prompt.toLowerCase();
  if (lower.includes("voice") || lower.includes("call")) {
    return "I can add voice-aware campaign structure: keep voicemail and call tasks behind consent, DNC, quiet-hours, and manual broker approval gates.";
  }
  if (
    lower.includes("rate") ||
    lower.includes("payment") ||
    lower.includes("quote")
  ) {
    return "I can route rate or payment intent into a quote task and keep all borrower-facing quote language blocked until Quote API output and broker approval exist.";
  }
  if (
    lower.includes("timeline") ||
    lower.includes("60") ||
    lower.includes("45")
  ) {
    return "I can switch the builder into Timeline mode and shape the nurture sequence around day 0, days 1-7, days 8-21, days 22-45, and days 46-60.";
  }
  return "I can help shape this mortgage drip workflow with compliant trigger, scoring, SMS, email, wait, reply/STOP branch, broker alert, OpenClaw, and quote-task nodes.";
}

function proposeCampaignBuilderActions(
  command: string,
  assistant: string
): ProposedAction[] {
  const combined = `${command} ${assistant}`.toLowerCase();
  const actions: ProposedAction[] = [];

  if (
    combined.includes("timeline") ||
    combined.includes("45") ||
    combined.includes("60")
  ) {
    actions.push({
      id: "set-timeline",
      label: "Switch to Timeline mode",
      detail:
        "Open the cadence planner so the agent can shape a 45-60 day sequence.",
      risk: "low",
      command: "set_mode",
      value: "timeline",
    });
  }

  if (
    combined.includes("monitor") ||
    combined.includes("failed") ||
    combined.includes("test")
  ) {
    actions.push({
      id: "set-monitor",
      label: "Open Monitor mode",
      detail:
        "Show compliance simulation, failed runs, and Activepieces export steps.",
      risk: "low",
      command: "set_mode",
      value: "monitor",
    });
  }

  if (
    combined.includes("quote") ||
    combined.includes("rate") ||
    combined.includes("payment")
  ) {
    actions.push({
      id: "select-quote-task",
      label: "Focus quote task node",
      detail: "Inspect the quote-task gate for borrower rate/payment requests.",
      risk: "approval_required",
      command: "select_node",
      value: "quote-task",
    });
    actions.push({
      id: "require-quote-approval",
      label: "Require manual approval",
      detail:
        "Keep quote, rate, and payment language blocked until broker approval.",
      risk: "approval_required",
      command: "require_manual_approval",
      value: true,
    });
  }

  if (
    combined.includes("voice") ||
    combined.includes("call") ||
    combined.includes("voicemail")
  ) {
    actions.push({
      id: "select-broker-alert",
      label: "Focus broker alert node",
      detail:
        "Route voice/call intent through broker alert and consent-aware tasks.",
      risk: "low",
      command: "select_node",
      value: "broker-alert",
    });
  }

  actions.push({
    id: "queue-save",
    label: "Queue draft save",
    detail:
      "Save only after broker review through the existing Nyra campaign API boundary.",
    risk: "approval_required",
    command: "queue_save",
    value: "draft",
  });

  return dedupeActions(actions);
}

function dedupeActions(actions: ProposedAction[]) {
  const seen = new Set<string>();
  return actions.filter((action) => {
    if (seen.has(action.id)) return false;
    seen.add(action.id);
    return true;
  });
}
