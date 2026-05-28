# Prompt 00 — Root AGENTS.md Generator

Paste into Codex from the repo root to create or update `AGENTS.md`.

```text
You are Codex CLI operating inside the Project Nyra repository.

MISSION:
Create or update the root AGENTS.md so every future Codex/Claude/Gemini/OpenClaw agent receives the true Project Nyra stack, boundaries, and safety rules before acting.

DO NOT TOUCH UI/THEME/COMPONENTS.

REQUIRED AGENTS.md CONTENT:
1. Project Nyra mission: broker-facing AI mortgage operations platform and future SaaS.
2. Product surfaces: RateHunter.net landing, ProjectNyra.com landing, authenticated Project Nyra webapp, TwentyCRM external/access-gated system-of-record, Activepieces primary builder, optional constrained n8n fallback.
3. Current stack truth: Supabase local auth/backend, TwentyCRM, Activepieces, n8n fallback, Twilio, SendGrid, Calendly, Rebump, Google Workspace, CRM API, Quote Engine, Rate Quoting API, Campaign Engine, Letta, OpenClaw, NerveUI, Gastown, Clawteam, Composio, memorytensor/memOS, mem0, Qdrant, Mempalace, ClaudeMem, OpenMemory MCP, Letta MCP, LiteLLM, OpenRouter, Nexus Router/Grafbase/Hive, Docker MCP Toolkit, Gitea/Gitea MCP/Tea CLI, Infisical, Cloudflare Tunnel, Tailscale, local Supabase, Vaultwarden, Linkwarden, Prometheus, Loki, Grafana, cAdvisor, node-exporter, gpu-exporter, promtail, health-monitor.
4. Host topology: orchestrator, worker-rtx5090, worker-rtx3090ti, worker-rtx3060, optional worker-rtx4060 backup gateway, oracle, homeassistant-green.
5. Repo topology: host compose stacks under /infra/hosts/<host>.
6. Secrets model: Infisical sidecars + Makefile + Docker contexts; bootstrap env vars only on orchestrator and worker-rtx5090 terminals; no committed secrets.
7. Compliance gates: STOP/DNC, consent, human approval, audit events.
8. Deprecated/do-not-reintroduce list: Claude-Flow, ruv-swarm, ruflo, agentic-flow, flow-nexus, agentdb, ruvector, Dify unless only documenting/migrating existing references.
9. UI quarantine: do not touch UI/theme/design unless explicitly prompted.
10. Archiving rule: never delete docs; archive categorized copies for later RAG-Anything ingestion.

Also add links to the local docs/prompt pack if present.

FINAL RESPONSE:
List files changed and any gaps. Do not ask follow-up questions.
```
