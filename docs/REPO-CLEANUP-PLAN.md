# Project Nyra Repo Cleanup & Consolidation Plan (Execution-Ready)

## 1) Canonical layout decisions

This is the final placement model so the repository stays understandable:

- `infra/` = runtime orchestration and deployment assets only
  - docker-compose files
  - Dockerfiles used by compose builds
  - infra configs (`nexus`, `litellm`, `grafana`, `prometheus`, `loki`)
  - infra scripts (health, inventory, bootstrap helpers)
- `services/` = deployable back-end services (Nexus Router, Archon OS, quote API, adapters)
- `apps/` = user-facing applications and UI shells (admin, borrower/chat UIs, ingestion consoles)
- `packages/` = shared libraries/types/utils consumed by apps/services
- `src/` = orchestration/business domain code that is not its own independent service package
- `workflows/` = n8n and Activepieces export files/source of truth
- `docs/` = architecture, runbooks, migration and operator guidance

### Keep or move: claude-flow, clawdbot/moltbot, MCP servers

- `claude-flow`:
  - Keep implementation in `services/claude-flow` (service lifecycle + image)
  - Keep compose wiring in `infra/docker-compose.yml`
- `moltbot`/`clawdbot`:
  - Keep UI in `apps/` (if borrower-facing chat app)
  - Keep model/tool backend in `services/` (if API service)
  - Keep deployment wiring in `infra/`
- MCP servers:
  - Keep MCP service implementations in `services/*-mcp`
  - Keep MCP registry/routing config in `infra/configs/nexus`
  - Never store MCP runtime orchestration in `src/`

## 2) Consolidation phases

### Phase A — Normalize compose ownership

1. Keep `infra/docker-compose.yml` as the single master compose.
2. Keep legacy compose files only as migration references.
3. Use profile contract:
   - `core`, `gateway`, `workflow`, `crm`, `archon`, `apps`, `observability`, `vector`, `dev`, `oracle`, `worker-*`.

### Phase B — Convert service inventory to tracked backlog

Use `infra/docs/CONSOLIDATION-GAPS.md` as the backlog.
For each missing service:
- decide: integrate / archive / deprecate
- if integrate: add profile + healthcheck + env vars
- if archive: move legacy compose to `infra/compose/archive/` and document reason.

### Phase C — Folder-level prompting + operator docs

Each app/service should have one implementation prompt file:
- `services/<name>/CLAUDE.md` (service contract, dependencies, health checks)
- `apps/<name>/CLAUDE.md` (routes, API dependencies, UX constraints)
- `packages/<name>/CLAUDE.md` (API surface, versioning rules)

If missing, create minimal placeholders and expand incrementally.

### Phase D — Worker and Oracle deployment model

- Orchestrator profiles: core control plane and gateway.
- Oracle profiles: heavy non-latency-critical workloads.
- Worker-specific profiles:
  - `worker-3060`: ollama + embeddings
  - `worker-3090ti`: vLLM medium model lane + exporter
  - `worker-5090`: vLLM large model lane + optional local LiteLLM bridge

### Phase E — Bootstrap intake pipeline

- Browser uploads land in `bootstrap/incoming/`
- Review/approve in `bootstrap/reviewed/`
- Apply into destination folders via script (`scripts/bootstrap/import-bootstrap.sh`)
- Regenerate inventory docs post-apply.

## 3) Definition of done

Repo is considered consolidated when:

1. `infra/docker-compose.yml` is validated and is the only production compose entrypoint.
2. All active services have one clear home (`apps/`, `services/`, `packages/`, or `src/`).
3. Every active app/service has `CLAUDE.md` with a build/run contract.
4. `infra/docs/CONSOLIDATION-GAPS.md` is reduced to either intentional archive items or integrated services.
5. `make up-orchestrator` and `make health` are enough to bootstrap local dev.
6. Worker onboarding is scriptable and profile-driven.

