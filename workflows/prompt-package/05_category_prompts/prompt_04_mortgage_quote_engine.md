# PROMPT 04 — Mortgage Quote Engine, Quote API, and Excel Parity

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Implement or refine a deterministic mortgage quote engine that replaces spreadsheet-style quoting for API/agent/campaign use while avoiding LLM math errors.

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

| Node | Role | Default services |
|---|---|---|
| `orchestrator` | Local CPU control plane / low-latency command center | OpenClaw gateways, Nerve UIs, ClawTeam server, LiteLLM, Nexus/Hive MCP gateway, WaveTerm/Zellij control, Cloudflared where local routing is required |
| `worker-rtx5090` | Heavy inference / coding / complex mortgage reasoning | vLLM OpenAI-compatible server, LMCache/Redis cache, ClawTeam node, optional voice/agent worker profile |
| `worker-rtx3090ti` | Secondary/steady inference / production agent workload | vLLM or Ollama endpoint, LMCache/Redis, ClawTeam node, lead parsing/normalization workload |
| `worker-rtx3060` | Utility GPU node | Embeddings, small Ollama models, STT/TTS/voice utilities, vector preprocessing, lightweight background tasks |
| `oracle-vps` | Always-on cloud plane / public webhooks / durable automation | n8n, Activepieces, Gitea, Letta/Mem0/FalkorDB/Postgres/Redis as selected, SearXNG, Browserless, Traefik/Nginx/Cloudflared, public webhook receiver |

## Critical implementation stance

The cleanest default is **split brain / split muscle**:

- UI, routing, orchestration, and durable public webhook endpoints live on CPU/cloud nodes.
- Raw GPU inference lives on GPU workers.
- Browser-facing apps talk to server-side APIs/proxies; secrets remain server-side.
- The webapp may embed or link specialist tools, but mortgage-critical workflows should eventually be broker-safe wrapper pages rather than raw admin UIs.
- UI/design specifics are intentionally quarantined from implementation until the Claude Desktop design pass is complete.


### Category-specific context


The archive contains a concrete quote-engine concept: Node.js/TypeScript service, Express, Zod validation, deterministic mortgage math, Dockerfile, `/health`, and `/api/v1/quote`. It generates a 3-option comparison: standard/par, buy-down, and lender-credit. It validates inputs so hallucinated or impossible LLM payloads fail cleanly.

Required behavior:

- Calculate principal, LTV, interest rate, P&I, taxes, insurance, HOA, estimated PMI, total monthly payment, and total interest.
- Reject impossible values such as down payment >= property value.
- Return structured JSON suitable for OpenClaw, Activepieces/n8n, CRM records, and PDF/export.
- Keep outputs educational/indicative unless reviewed/locked through actual lender process.
- Add tests for 0% interest edge case, PMI threshold, bad inputs, and three-option consistency.



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


1. Inspect existing quote-engine services or mortgage math utilities.
2. Create/update `services/quote-engine/` with TypeScript, strict validation, Dockerfile, and tests.
3. Implement Zod schema for quote input.
4. Implement amortization math without LLM involvement.
5. Implement 3-option matrix: standard, buyDown, lenderCredit. Use configurable rate adjustments rather than hardcoding only one set.
6. Add `/health` and `/api/v1/quote` endpoints.
7. Add optional `POST /api/quotes/generate` wrapper if the repo already has an app API namespace.
8. Add integration notes for CRM quote records and MCP tool registration.
9. Add test curl and automated tests.
10. Document compliance copy: estimates only, subject to lender review, taxes/insurance/PMI assumptions.


## Expected outputs


- Quote engine code or implementation plan.
- API schema docs.
- Dockerfile/compose snippet.
- Unit tests and sample curl.
- MCP tool registration spec.
- CRM Quote object integration spec.
- Compliance/disclaimer language.


## Acceptance criteria


- Bad or missing numeric inputs return clean validation errors.
- Math tests pass.
- API returns three quote options in structured JSON.
- OpenClaw/n8n/Activepieces can call it safely.
- No browser-side secret exposure.
- The service does not claim binding mortgage terms.


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
