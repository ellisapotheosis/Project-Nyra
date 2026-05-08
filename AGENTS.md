# AGENTS.md

Universal configuration for AI agents working on Project Nyra.

This file is the global contract for Claude Code, Codex CLI, Gemini CLI, Cursor, Copilot, Aider, Serena-aware agents, and any repo automation.

## Nyra Dev system prompt

Use this as the baseline system prompt for any coding/build agent:

```text
You are Nyra Dev, an expert DevEx Engineer and Principal AI Architect for Project Nyra.

Mission:
- Build and maintain an AI-powered mortgage automation platform.
- Treat compliance as first-class domain logic.
- Keep the control plane stable and workers replaceable.
- Prefer small, verifiable, production-quality changes.

Hard rules:
- Never commit secrets.
- Never expose worker inference endpoints publicly.
- Never make n8n the system-of-record or the business brain.
- Never let the assistant directly mutate CRM or databases.
- Never reintroduce RuVector or Graphiti into the current architecture.
- If a step requires owner login/MFA/dashboard action, document it in docs/OWNER_MANUAL_ACTIONS.md and continue.

If uncertain:
- Use conservative defaults.
- Mark assumptions explicitly.
- Add validation commands, tests, and smoke checks.
```

## Current target architecture

### Control plane

The control plane is split between the local **orchestrator** (MinisForum) and the **oracle-vps** (Cloud).

#### Orchestrator (LAN)

- Nexus Router
- LiteLLM
- Prometheus / Loki / Grafana (LAN)
- Portainer Server
- n8n (Internal)
- OpenClaw Gateway
- OpenClaw Studio
- Pocket TTS
- Syncthing (Cluster Sync)
- Open WebUI
- Quote API (FastAPI)
- Campaign Engine
- Mem0
- Cloudflared Tunnel (Public Ingress)

#### Oracle-VPS (Cloud)

- Twenty CRM (System of Record)
- Gitea
- Activepieces
- Qdrant / FalkorDB
- Mem0

### Data Synchronization

- **Syncthing** is used across all 4 local nodes (orchestrator, rtx5090, rtx3090ti, rtx3060) to sync the `~/` folder.
- All Syncthing containers mount `/home/ellisapotheosis` to `/var/syncthing/data/home`.

### Memory & Orchestration Endpoint

- **Nexus Router** (on orchestrator:6000) is the **singular endpoint** for all agents.
- It aggregates LLM routing and all MCP tools, including the memory stack on oracle-vps.
- All agent memory interactions should go through Nexus.

### Compute plane

Workers are GPU appliances:

- `worker-rtx5090` → primary vLLM
- `worker-rtx3090ti` → secondary vLLM
- `worker-rtx3060` → Embeddings, Extraction, Background Tasks, Summarization

## Product invariants

- Twenty CRM is the system of record.
- Compliance is explicit code with tests.
- STOP / unsubscribe / reply pauses must be enforced immediately across channels.
- The quote engine owns quote generation. The assistant must not hallucinate rates or costs.

## Directory routing

Agents must place work in the correct location.

### Repo roots

- `apps/webapp` → canonical broker/customer webapp control surface
- `apps/landing` → public landing/lead capture, remains separate
- `apps/admin` → internal operator/admin UI, being merged into webapp where useful
- `services/*` → backend business services
- `packages/*` → shared libraries, types, domain modules
- `workflows/n8n/*` → n8n workflow JSONs
- `infra/hosts/<host-name>/*` → the only valid per-host Docker Compose and deployment files
- `ops/*` → scripts, tmux, profiles, operational helpers
- `docs/*` → architecture, execution plans, manual steps

### Services responsibility map

- `services/crm-api` → Twenty integration boundary, lead ingestion, campaigns, quotes
- `services/campaign-engine` → campaign definitions and execution control
- `services/n8n-workflows` → workflow JSON and automation execution
- `services/openclaw` → assistant persona and runtime boundary
- `services/quote-api` → deterministic mortgage math (Python/FastAPI)

## Security rules

- Never expose Postgres, Redis, FalkorDB, worker vLLM, or worker Ollama publicly.
- All public ingress is through Cloudflared on the orchestrator only.
- Admin surfaces should be Cloudflare Access-gated.
- Secrets live in gitignored `.env` files or secret managers, never in source.

## Definition of done

Work is only done when:

- implementation is complete
- tests or validation checks exist
- docs are updated
- smoke checks pass
- no deprecated architecture is reintroduced
