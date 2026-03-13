# OpenClaw Future Routing

This document describes the intended migration path from the current cloud-backed OpenClaw MVP to the longer-term Nyra routing model.

## Current state

- OpenClaw core uses direct OpenAI-compatible cloud access.
- Mem0 runs in cloud/platform mode through `@mem0/openclaw-mem0`.
- Kyutai Unmute is an optional cloud-backed voice overlay.
- Internal UI access is expected to move through an admin-side server proxy.

## Near-term migration hooks already in place

- `OPENCLAW_OPENAI_BASE_URL`
  - lets the core overlay switch from direct OpenAI to LiteLLM later without changing topology.
- `NEXUS_MCP_URL`
  - keeps tool routing pointed at Nexus rather than baking direct tool endpoints into the client.
- `OPENCLAW_PUBLIC_BASE_URL`
  - supports reverse-proxy and internal UI routing alignment.
- `NYRA_CHAT_INTERNAL_API_BASE_URL`
  - leaves room for an internal admin-side proxy/API layer.

## Planned routing evolution

### 1. Direct OpenAI now -> LiteLLM later

Current:

```dotenv
OPENCLAW_PROVIDER=openai
OPENCLAW_OPENAI_BASE_URL=https://api.openai.com/v1
```

Later:

```dotenv
OPENCLAW_PROVIDER=openai
OPENCLAW_OPENAI_BASE_URL=http://litellm:4000/v1
```

This preserves the OpenAI-compatible contract while moving routing, spend controls, and provider failover into LiteLLM.

### 2. Cloud-only voice now -> hybrid/local voice later

Current:

- `openclaw.voice.compose.yml` runs only when the `voice` profile is enabled.
- voice stays cloud-backed and isolated.

Later:

- point Unmute or a sibling overlay at local or hybrid STT/TTS services,
- keep voice optional and profile-gated,
- prefer Tailscale-reachable GPU workers rather than exposing local worker services publicly.

### 3. Mem0 cloud now -> hybrid memory later

Current:

- Mem0 plugin uses platform mode and `MEM0_API_KEY`.

Later:

- keep Mem0 cloud for conversational/operator memory,
- layer in Nyra-native memory systems such as Graphiti, Letta, or related tools through Nexus/MCP rather than hardwiring them into the first-pass OpenClaw client.

### 4. Internal chat now -> richer operator console later

Current:

- reverse-proxy path can bridge `/tools/openclaw`,
- preferred direction is an internal admin-side route and chat page.

Later:

- add operator context,
- add CRM actions,
- add workflow triggers,
- add MCP trace visibility,
- add audit and approval patterns where required.

### 5. OpenClaw operator now -> deeper MCP/CRM/workflow execution later

Current:

- route tool calls through Nexus MCP,
- keep direct external tool wiring minimal.

Later:

- use Nexus as the gateway for TwentyCRM, n8n, Activepieces, and additional Nyra MCP tools,
- keep authorization, routing, and auditability centralized.

## Tailscale worker model

Do not change worker deployment in the MVP phase.

When ready:

- keep local workers reachable over Tailscale only,
- route model traffic through LiteLLM or Nexus rather than directly from every caller,
- avoid putting worker-specific IPs into UI code or browser-facing paths,
- preserve the current compose overlays and change routing via env/config only where possible.

## Recommended migration order

1. Keep current cloud MVP stable.
2. Move core LLM routing to LiteLLM.
3. Expand Nexus/MCP tool coverage.
4. Add admin-side internal chat UI.
5. Introduce local/hybrid voice and Tailscale worker routing only after the operator path is stable.
