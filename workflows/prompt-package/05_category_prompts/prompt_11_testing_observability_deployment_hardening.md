# PROMPT 11 — Testing, Observability, Deployment, and Hardening

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Create the validation, deployment, observability, rollback, and hardening layer that keeps the system from silently failing.

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


The platform has many services and async workflows. Without tests and observability, failures will be invisible: campaigns may keep sending, leads may not sync, quote math may drift, webhooks may fail, or agent tools may overreach.

Focus areas:

- Health checks for every service.
- Contract tests for APIs/webhooks.
- Quote math tests.
- Campaign stop-condition tests.
- Docker Compose validation per host.
- CI/Gitea Actions where applicable.
- Sentry/error capture.
- Langfuse/Phoenix/OpenTelemetry/OTLP/Hive telemetry where applicable.
- Backups and restore drills.



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


1. Inventory test framework and CI/deployment patterns.
2. Add or specify tests for quote engine, CRM API, lead ingestion, campaign stop rules, Twilio/SendGrid webhooks, and template rendering.
3. Create health-check endpoints and compose healthcheck directives.
4. Create deployment validation commands per host.
5. Create smoke test suite after deploy.
6. Add observability plan: structured logs, error capture, LLM tracing, service status aggregation.
7. Add backup/restore plan for Postgres, CRM, Gitea, memory, Redis/Falkor where applicable.
8. Add rollback plan for failed deployment and bad campaign configuration.
9. Add compliance test cases: STOP, unsubscribe, no consent, invalid quote, private data in logs.
10. Create a final hardening checklist.


## Expected outputs


- Test matrix.
- Healthcheck compose snippets.
- Smoke test commands.
- Observability/logging plan.
- Backup/restore plan.
- Rollback procedures.
- Hardening checklist.


## Acceptance criteria


- Quote, CRM, webhook, campaign, and template tests exist or are fully specified.
- Every major service has a health check.
- Deploy can be validated by commands.
- Campaign failures are observable.
- Bad sends and bad configs have rollback/kill-switch paths.


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
