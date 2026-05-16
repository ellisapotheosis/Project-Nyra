# PROMPT 10 — Gitea, WaveTerm, Zellij, Paperclip, and Operator Tooling

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Build the developer/operator cockpit and local code operations layer: Gitea mirror, AI reviewer, WaveTerm/Zellij command deck, Paperclip/Sentry integration, SearXNG/Browserless, and safe CLI orchestration.

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


Source material contains extensive DevEx/operator tooling ideas. Keep this separate from core mortgage workflows so it does not block revenue-critical services.

Key tools:

- Gitea local mirror at `git.ratehunter.net` or `gitea.ratehunter.net`.
- Gitea ports: HTTP `3100`, SSH `2222` from sources.
- Gitea AI reviewer webhook at `/webhook/gitea` pattern.
- Infisical secret injection for tokens.
- WaveTerm/Wave AI terminal command deck.
- Zellij layouts for agent panes and worker SSH panes.
- Paperclip as strategy/ticket/goal dashboard.
- Sentry-to-Paperclip auto-ticketing.
- SearXNG local search and Browserless headless scraping on Oracle.
- Lazydocker, Redis/Falkor monitor, process viewer, Activepieces web deck widgets.

Important safety: Use official/authorized CLI and API sessions. Do not build tooling to bypass access controls, provider metering, or terms.



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


1. Inspect repo for existing Gitea, WaveTerm, Zellij, Paperclip, Sentry, and operator docs.
2. Create Gitea setup plan/compose with safe defaults, actions runner, AI reviewer webhook, and Infisical secrets.
3. Create WaveTerm/Zellij config prompts or files for a local command deck.
4. Add widgets/commands for health, Docker status, worker SSH, logs, quote API, memory stream, and campaign kill switch.
5. Add Paperclip placement decision: default orchestrator for low-latency operator dashboard; Oracle if treating it as always-on async ticket store. Document conflict.
6. Add Sentry-to-Paperclip automation spec.
7. Add SearXNG/Browserless compose/service specs on Oracle.
8. Add safe CLI orchestration guidance for Codex/Gemini/Claude Code sessions without bypassing provider controls.
9. Add troubleshooting docs for Gitea runner, webhook, ports, and Infisical token refresh.


## Expected outputs


- Gitea compose/setup docs.
- AI reviewer webhook spec.
- WaveTerm/Zellij config package or prompt.
- Operator widgets list/config.
- Paperclip/Sentry automation spec.
- SearXNG/Browserless compose spec.
- Troubleshooting guide.


## Acceptance criteria


- Operator tooling can start without touching core app logic.
- Gitea and AI reviewer use secret placeholders only.
- WaveTerm/Zellij layout gives access to agents, workers, logs, and health commands.
- Sentry errors can create actionable tickets.
- Tooling does not encode bypasses around third-party access rules.


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
