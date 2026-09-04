# Repo Consolidation V1 Report (2026-03-07)

## TL;DR
- Consolidated legacy scaffold trees into `archive/20260307/infra/*` using git-safe moves.
- Preserved Makefile workflows while making package commands auto-detect `pnpm` vs `npm`.
- Kept split topology explicit: Oracle VM, Orchestrator control plane, and 3 worker GPU nodes.
- Confirmed network model boundaries for Cloudflared (public/access) + Tailscale (internal-only).
- Left TwentyCRM source in-repo under `apps/twenty` and documented clean detachment steps.

## Assumptions used
1. Existing canonical homes under `apps/`, `services/`, `packages/`, `infra/{oracle,orchestrator,workers}`, and `workflows/` are authoritative.
2. Any uncertain/legacy scaffolds should be archived, not deleted.
3. Activepieces remains primary workflow engine; n8n remains optional/internal.

## Phase 0 — inventory and safety

### Root-level inventory highlights
- Canonical domains present: `apps/`, `services/`, `packages/`, `infra/`, `workflows/`, `docs/`.
- High-noise clutter observed: duplicate scaffold trees in `infra/project-nyra-scaffold`, `infra/nyra-complete`, `infra/RateHunter`.
- Existing safety controls already present: `ARCHIVE_POLICY.md`, `archive/INDEX.md`.

### Docs and references sanity check
- Legacy scaffold paths were mostly referenced in reporting/baseline docs, not active runtime entrypoints.
- Runtime workflows remain anchored in `Makefile` targets pointing to:
  - `infra/oracle/docker-compose.oracle.yml`
  - `infra/orchestrator/docker-compose.orchestrator.yml`
  - `infra/workers/*/docker-compose.worker.yml`

### Environment and port inventory (canonical)
- Canonical env template: `.env.stack.example` with stack-level secrets and ports.
- Node-role env files found for orchestrator and workers (`.env.orchestrator`, `.env.worker-*`, `infra/env/.env.*`).
- Canonical ports are documented in `docs/port-map.md`:
  - Core: Postgres 5432, Redis 6379, Mongo 27017
  - Control plane: LiteLLM 4000, Nexus 7000/8080/9091, n8n 5678, Activepieces 8082, Twenty 3000
  - Workers: 11434, 8100, 8101

## Phase 1 — canonical structure alignment

### Git-safe moves applied
- `infra/project-nyra-scaffold` → `archive/20260307/infra/project-nyra-scaffold`
- `infra/nyra-complete` → `archive/20260307/infra/nyra-complete`
- `infra/RateHunter` → `archive/20260307/infra/RateHunter`

### Makefile improvements (workflow-safe)
- Kept all existing targets and behavior.
- Added package manager auto-detection:
  - Uses `pnpm` when `pnpm-lock.yaml` exists.
  - Falls back to `npm` otherwise.
- Updated `install`, `test`, `lint`, and `validate` targets to use detected manager.

### TwentyCRM in-repo staging policy
- `apps/twenty` remains temporarily in-repo.
- Added a dedicated README for detaching to separate Git/Gitea repository after bootstrap stabilization.

## Before/after structure (high-level)

### Before
```text
infra/
├── RateHunter/
├── nyra-complete/
├── project-nyra-scaffold/
├── oracle/
├── orchestrator/
└── workers/
```

### After
```text
infra/
├── oracle/
├── orchestrator/
└── workers/

archive/20260307/infra/
├── RateHunter/
├── nyra-complete/
└── project-nyra-scaffold/
```

## Network model retained
- **Public (Cloudflared):** landing/webapp/admin public hostnames.
- **Access-protected (Cloudflare Access):** operator panels and sensitive control endpoints.
- **Internal-only (Tailscale):** orchestrator↔worker traffic, GPU model endpoints, control mesh.

## Canonical topology retained
- **Oracle VM:** data + workflow infra (Postgres/Ruvector/Twenty/Activepieces/n8n + service workloads).
- **Orchestrator home control plane:** Nexus routing, secrets tooling, observability, operator interfaces.
