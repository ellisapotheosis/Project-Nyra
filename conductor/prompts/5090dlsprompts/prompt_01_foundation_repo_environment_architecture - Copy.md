# PROMPT 01 — Foundation, Repo, Environment, and Architecture

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Create or validate the base infrastructure plan and repo scaffolding so every later agent has stable paths, host placement, health checks, network assumptions, and deployment commands.

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

The source material repeatedly converges on a hybrid architecture: local orchestrator for low-latency control, GPU workers for inference, Oracle VPS for always-on state/webhooks, and Cloudflare/Tailscale for access. The final strict naming convention removes Titan/Atlas and uses only `worker-rtx5090`, `worker-rtx3090ti`, and `worker-rtx3060`. A known Cloudflare Pages issue exists: `.gitmodules` is missing a URL for `external/openclaw-n8n-stack`, causing `fatal: No url found for submodule path`.

Recommended infra tree:

```text
/infra/hosts/orchestrator/docker-compose.yml
/infra/hosts/worker-rtx5090/docker-compose.gpu.yml
/infra/hosts/worker-rtx3090ti/docker-compose.gpu.yml
/infra/hosts/worker-rtx3060/docker-compose.gpu.yml
/infra/hosts/oracle-vps/docker-compose.yml
/infra/shared/cloudflared/
/infra/shared/traefik/
/infra/scripts/health-check.sh
/infra/scripts/network-map.sh
/Makefile
/README_SETUP.md
```

Default placement:

- Orchestrator: OpenClaw gateways, Nerve instances, ClawTeam server, LiteLLM/Nexus gateway, Cloudflared if local UIs are exposed, WaveTerm/Zellij operator layer.
- worker-rtx5090: vLLM server, LMCache/Redis, ClawTeam node, heavy coding/reasoning.
- worker-rtx3090ti: vLLM/Ollama server, LMCache/Redis, ClawTeam node, steady production inference.
- worker-rtx3060: embeddings, STT/TTS, small Ollama utility models, vector preprocessing.
- oracle-vps: n8n, Activepieces, Gitea, Letta/Mem0/FalkorDB/Postgres/Redis as selected, SearXNG, Browserless, Traefik/Nginx/Cloudflared.

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

1. Inspect the repo for existing `/infra`, Docker Compose files, Makefile, `.gitmodules`, Cloudflare/Tailscale docs, and service directories.
2. Produce a repo-safe foundation plan showing what exists, what is missing, and what should be created.
3. Fix or specify the `.gitmodules` URL problem for `external/openclaw-n8n-stack` without inventing an unknown upstream URL; if URL is unknown, add a clear placeholder and fail-safe instructions.
4. Create or propose per-host compose files for orchestrator, workers, and Oracle VPS.
5. Create a root Makefile with targets: `status`, `health`, `deploy-orch`, `deploy-5090`, `deploy-3090`, `deploy-3060`, `deploy-oracle`, `swarm-up`, `swarm-down`, `logs`, `pull-secrets`.
6. Create a health-check script that checks Docker containers, Tailscale reachability, vLLM/Ollama endpoints, LiteLLM/Nexus endpoints, Cloudflare tunnel status, and major service HTTP health endpoints.
7. Create `NETWORK-MAP.md` with hostnames, expected IPs/placeholders, ports, subdomains, and internal/external routing.
8. Add README setup instructions that work from Windows/WSL2 and do not assume prior context.

## Expected outputs

- `Makefile` or Makefile patch.
- Per-host compose files or scaffolds.
- `README_SETUP.md`.
- `NETWORK-MAP.md`.
- `health-check.sh`.
- `.gitmodules` fix plan.
- Deployment order and rollback notes.

## Acceptance criteria

- No Titan/Atlas names remain.
- Host placement follows the split brain/default topology.
- Health script can run from orchestrator and produce parseable output.
- Compose configs are additive and do not destroy existing services.
- Secrets are placeholders or secret references only.
- Known Cloudflare Pages submodule issue is addressed or clearly blocked by missing URL.

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
