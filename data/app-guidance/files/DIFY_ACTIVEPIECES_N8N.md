# Dify + Activepieces + n8n (Nyra control plane)

## Why all three
- **Dify**: chat UI + AI app runtime + knowledge/RAG UX
- **n8n**: timers, drip scheduling, retries, long-running workflow orchestration
- **Activepieces**: connector catalog + approvals, and an MCP surface for agents

Use **Nexus Router** as the only ingress for:
- model calls (via LiteLLM/OpenRouter)
- MCP tool calls (Activepieces, GitHub, Graphiti, etc.)

## Recommended integration pattern
1) Dify app uses Nexus as:
   - model endpoint (OpenAI-compatible via LiteLLM)
   - tool endpoint (MCP via Nexus)
2) Dify does NOT directly call 20 different tools — it calls Nexus.
3) When Dify needs to run a deterministic workflow (send SMS chain / schedule):
   - call an Activepieces tool (MCP) that triggers a workflow
   - OR call an n8n webhook, which then triggers Activepieces connectors

## Do you keep Open-WebUI?
Optional:
- Keep it for **internal debugging** and “multi-model chat” (developers/ops only).
- It is not required if Dify is your embedded UI.
- If you keep it, put it behind Cloudflare Access / Tailscale and do not expose it publicly.
