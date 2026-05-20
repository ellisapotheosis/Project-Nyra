# PROMPT 02 — AI Agent Stack, Model Routing, MCP, and Memory Systems

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Consolidate and implement the AI routing and memory architecture: OpenClaw/Nerve/ClawTeam, LiteLLM, Nexus/Hive/Grafbase-style MCP routing, local GPU endpoints, cloud fallback, and tiered memory.

## Context to ingest

# Canonical Project Context

## Project family

Project Nyra / RateHunter / Project Apotheosis-adjacent AI infrastructure.

## Mission

Build a distributed AI mortgage operating system that combines lead capture, CRM, mortgage quoting, campaign automation, AI assistant workflows, local GPU inference, memory systems, and a unified broker command center. The platform should convert mortgage/real-estate leads into managed borrower journeys while giving Ellis a secure, high-leverage command layer over CRM, campaigns, quotes, agent tasks, and infrastructure.

## Business purpose

Nyra is intended to become a revenue-generating mortgage automation platform: ingest leads, normalize/contact them, quote them, nurture them for 45–60+ days, stop appropriately on replies/opt-outs, sync statuses to TwentyCRM, and surface all important work through a command-center webapp. It should reduce manual follow-up, improve response speed, and provide an AI-assisted operational layer for mortgage brokerage work.

## Core product surfaces

- Public RateHunter landing page and lead-capture funnel.
- Internal RateHunter/Nyra webapp command center.
- TwentyCRM as the CRM/system-of-record surface or linked CRM backend.
- Campaign builder and campaign status surfaces.
- Quote desk / quote engine surface.
- Agent/operator console for OpenClaw/Nerve/Paperclip/ClawTeam and infrastructure tools.
- Automation surfaces for n8n, Activepieces, Composio, Twilio, SendGrid, and webhooks.
- Memory/knowledge surfaces for Letta/Mem0/FalkorDB/Graphiti/OpenMemory-derived components, with final memory architecture treated as a conflict/default decision.

## Canonical production topology default

| Node               | Role                                                         | Default services                                                                                                                                     |
| ------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orchestrator`     | Local CPU control plane / low-latency command center         | OpenClaw gateways, Nerve UIs, ClawTeam server, LiteLLM, Nexus/Hive MCP gateway, WaveTerm/Zellij control, Cloudflared where local routing is required |
| `worker-rtx5090`   | Heavy inference / coding / complex mortgage reasoning        | vLLM OpenAI-compatible server, LMCache/Redis cache, ClawTeam node, optional voice/agent worker profile                                               |
| `worker-rtx3090ti` | Secondary/steady inference / production agent workload       | vLLM or Ollama endpoint, LMCache/Redis, ClawTeam node, lead parsing/normalization workload                                                           |
| `worker-rtx3060`   | Utility GPU node                                             | Embeddings, small Ollama models, STT/TTS/voice utilities, vector preprocessing, lightweight background tasks                                         |
| `oracle-vps`       | Always-on cloud plane / public webhooks / durable automation | n8n, Activepieces, Gitea, Letta/Mem0/FalkorDB/Postgres/Redis as selected, SearXNG, Browserless, Traefik/Nginx/Cloudflared, public webhook receiver   |

## Critical implementation stance

The cleanest default is **split brain / split muscle**:

- UI, routing, orchestration, and durable public webhook endpoints live on CPU/cloud nodes.
- Raw GPU inference lives on GPU workers.
- Browser-facing apps talk to server-side APIs/proxies; secrets remain server-side.
- The webapp may embed or link specialist tools, but mortgage-critical workflows should eventually be broker-safe wrapper pages rather than raw admin UIs.
- UI/design specifics are intentionally quarantined from implementation until the Claude Desktop design pass is complete.

### Category-specific context

Important source details:

- OpenClaw should be model-agnostic and useful for local LLMs.
- Nerve is a cockpit/UI layer over OpenClaw/gateway sessions, not a replacement gateway.
- Current final topology favors two OpenClaw gateways on orchestrator, each targeting a GPU worker endpoint.
- vLLM/OpenAI-compatible endpoints serve worker GPUs. LiteLLM routes tasks to local/cloud endpoints.
- Nexus/Hive/Grafbase-style MCP router should aggregate tools and enable fuzzy/semantic tool search so agents do not load every tool into context.
- MCP router endpoint pattern from source: `http://100.64.0.10:4000/mcp/sse` with `Authorization: Bearer ${{ORCHESTRATOR_TUNNEL_TOKEN}}` and Hive/Grafbase telemetry headers.
- Memory has conflicts: some sources prefer Letta as master memory manager; one converged source says drop Letta and use Mem0/Postgres/FalkorDB. Safe default: deploy Letta as protected optional memory manager while keeping Postgres/Twenty as durable system of record and Mem0/FalkorDB/Graphiti as data substrate.
- OpenMemory/Mem0 synchronous blocking must be avoided; use async/background workers.

## Universal agent operating rules

- Treat this as a consolidated multi-agent project package, not a brainstorming note.
- Do not ask basic clarification questions. Make safe assumptions, document them, and continue.
- Prefer additive implementation: new files, overlays, wrappers, docs, interfaces, and tests before broad rewrites.
- Never hardcode secrets. Use Infisical, Vaultwarden, environment placeholders, or secret mounts.
- Never expose provider/API credentials to browser-side code.
- Keep visual UI/design decisions quarantined unless the prompt is explicitly in the UI quarantine folder.
- Preserve strict hostnames: `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Do not use the deprecated placeholder names `Titan` or `Atlas`.
- Do not implement Hermes containers unless a later explicit decision reverses the current final plan.
- Use vLLM/OpenAI-compatible endpoints for primary GPU inference and LiteLLM/Nexus/Hive-compatible routing where possible.
- Keep mortgage compliance constraints visible: rate/quote outputs are estimates, not binding commitments; opt-outs must be honored; borrower data must be protected.
- Use official/authorized CLIs and APIs only. Do not automate around access controls, metering, rate limits, or third-party terms of service.

## Systems involved

Infer from the context above and explicitly account for all systems that touch this category. At minimum, consider Docker/WSL2/Tailscale/Cloudflare, the relevant app/service directories, Infisical secrets, health checks, and downstream agent/webhook consumers.

## What has already been decided

- Strict hostnames are `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Use additive files/overlays where possible.
- Visual UI/design choices are quarantined unless this prompt explicitly says otherwise.
- Secrets must remain server-side or in secret management.
- Mortgage calculations must be deterministic and validated, not freehand LLM math.
- Campaign automation must stop/pause on replies, STOP/unsubscribe, status transitions, or manual kill switch.

## Assumptions

- The active repo may already contain partial implementations. Inspect before changing.
- If exact service images or versions are unknown, use stable placeholders and document them.
- If a dependency is missing, create a clear scaffold plus README instructions rather than blocking.
- If source material conflicts, use the defaults in `07_conflicts_and_missing_info.md`.

## Do not touch / do not decide

- Do not finalize colors, theme, animation, R3F, shadcn/TweakCN, visual dashboard design, typography, or visual layout.
- Do not delete existing files without explicit instruction.
- Do not expose secrets to client-side code.
- Do not implement bypasses around third-party access controls or terms.

## Exact work to perform

1. Inventory existing agent/routing/memory files and docs.
2. Define a clear service map for OpenClaw gateways, Nerve UIs, ClawTeam server/nodes, LiteLLM, Nexus/Hive MCP router, vLLM/Ollama endpoints, and memory services.
3. Create or propose MCP router config that centralizes tools and supports role-based/fuzzy tool exposure.
4. Add or document MCP client configs for Claude Code/Codex/Gemini/OpenClaw where appropriate.
5. Configure model routing defaults:
   - heavy/code/reasoning → worker-rtx5090
   - steady/draft/production parsing → worker-rtx3090ti
   - embeddings/fast utility/STT/TTS → worker-rtx3060
   - cloud fallback → OpenRouter/Anthropic/OpenAI only when allowed and secreted.
6. Create memory architecture docs/configs:
   - durable CRM data in Twenty/Postgres
   - Redis hot memory/cache
   - Mem0/OpenMemory async memory extraction
   - FalkorDB/Graphiti graph relation layer
   - Letta protected optional memory-manager UI/agent
7. Add guardrails so borrower-facing agents do not receive dev/filesystem tools.
8. Add health checks for model/router/memory endpoints.

## Expected outputs

- `AGENT_ROUTING.md`.
- `MCP_ROUTER_CONFIG.md` or actual config files if repo patterns exist.
- LiteLLM/Nexus/Hive config stubs.
- Memory architecture doc and compose/profile recommendations.
- Role-based tool exposure matrix.
- Health check endpoints and validation commands.

## Acceptance criteria

- Agent routing prevents tool bloat and role leakage.
- Memory stack avoids synchronous blocking on lead workflows.
- No hardcoded API keys.
- Letta/Mem0/FalkorDB conflict is documented and implemented with optional profiles or clear default.
- Router can list available tools through a test query.

## Edge cases

Document edge cases found during work. Respect opt-outs, secrets, and no-UI-design quarantine.

## Dependencies

None

## Completion report format

When finished, report exactly:

```text
Completed:
Files changed:
Commands run:
Tests run:
Assumptions made:
Conflicts encountered:
Issues found:
Security notes:
Recommended next prompt:
```

## Final instruction

Do not ask clarification questions. Make safe assumptions, document them, and proceed. Produce implementation-grade outputs, not generic advice.
