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
- Never reintroduce RuVector, Graphiti, Letta, openmemory, or Activepieces into the current architecture.
- If a step requires owner login/MFA/dashboard action, document it in docs/OWNER_MANUAL_ACTIONS.md and continue.

If uncertain:
- Use conservative defaults.
- Mark assumptions explicitly.
- Add validation commands, tests, and smoke checks.
```

## Current target architecture

### Control plane
The orchestrator is the primary always-on control plane and hosts:

- Nexus Router
- LiteLLM
- Langfuse
- Prometheus
- Loki
- Grafana
- Portainer Server
- n8n
- Twenty CRM
- Archon OS
- OpenClaw Gateway
- OpenClaw Studio
- Open WebUI
- Mem0
- FalkorDB
- Postgres
- Redis
- Cloudflared

### Compute plane
Workers are GPU appliances:

- `worker-rtx5090` → primary vLLM
- `worker-rtx3090ti` → secondary vLLM
- `worker-rtx3060` → Ollama, ingestion helpers, summarization, extraction, smaller local tasks

### Memory
- Archon OS is the workflow/context/project memory manager.
- Mem0 + FalkorDB is used only for selected assistant/runtime memory.
- Do not add RuVector / Graphiti / Letta / openmemory back into the stack.

### Workflow engine
- n8n is allowed as internal automation glue.
- n8n is not the customer-facing product UI.
- n8n is not the business brain.

### Assistant surfaces
- OpenClaw Gateway + OpenClaw Studio are the primary assistant runtime/dashboard.
- Open WebUI is internal-only model/tool workbench.
- apps/webapp should use the OpenClaw chat experience for the assistant surface.

## Product invariants

- Twenty CRM is the system of record.
- Compliance is explicit code with tests.
- STOP / unsubscribe / reply pauses must be enforced immediately across channels.
- The quote engine owns quote generation. The assistant must not hallucinate rates or costs.
- All communications are logged with metadata and tied back to CRM records.

## Stack preferences

### Languages
- Primary: **TypeScript**
- Secondary: **Python** only where it clearly helps (batch utilities, ingestion, LLM helpers)
- Shell: Bash + PowerShell where appropriate

### Frameworks
- Next.js App Router for apps
- Node.js 20+ for backend services
- Tailwind + shadcn/ui + Magic UI for interfaces
- Zod for validation
- Structured JSON logging
- Docker Compose per node

### UI conventions
- Use a shared tweakcn-driven design token palette
- Keep a consistent shadcn + Magic UI system across admin, landing, and webapp
- Avoid random inline colors and one-off styling decisions
- Keep broker-facing UI professional, modern, and fast

## Directory routing

Agents must place work in the correct location.

### Repo roots
- `apps/admin` → internal operator/admin UI
- `apps/webapp` → broker/customer web application
- `apps/landing` → landing and lead capture
- `services/*` → backend business services
- `packages/*` → shared libraries, types, domain modules
- `workflows/n8n/*` → n8n workflow JSONs
- `deploy/*` → per-node deployment files
- `ops/*` → scripts, tmux, profiles, operational helpers
- `docs/*` → architecture, execution plans, manual steps

### Services responsibility map
- `services/lead-ingestion` → normalize + dedupe inbound leads
- `services/campaign-service` → campaign scheduling and state transitions
- `services/compliance-service` → consent, suppression, STOP/unsubscribe, quiet hours
- `services/communication-service` → provider send/receive logging
- `services/quote-service` → quote generation and PDFs
- `services/crm-api` → Twenty integration boundary
- `services/assistant-service` → assistant-safe tool orchestration

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
