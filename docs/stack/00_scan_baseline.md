# 00 - Baseline Scan Output

## 1) Repo structure (top-level + runtime roots)
- Runtime roots discovered: `/apps`, `/services`, `/infra`.
- Archive root requested `/_archived` was not found.

Top-level runtime folders:
- `apps/claude-flow-dashboard`
- `apps/ingestion`
- `apps/landing`
- `apps/nexus-dashboard`
- `apps/shared`
- `apps/utilities`
- `apps/web`

- 36 folders under `services/`.
- 20 folders under `infra/`.

## 2) Compose files discovered and what they include
Primary active compose:
- `infra/docker-compose.yml` (22 services; profiles: core/gateway/workflow/crm/archon/apps/observability/edge/worker/vector)

Additional active compose files:
- `infra/docker-compose.orchestrator.yml`
- `infra/docker-compose.workers.yml`
- `infra/docker-compose.oracle.yml`
- `infra/docker-compose.orchestrator-cf-tunnel.yml`
- `infra/compose/docker-compose.cloudflared.yml`
- `infra/workers/worker-*/docker-compose.worker-*.yml`

Many historical/ingestion/ToDo compose files also exist and are not used as canonical runtime.

## 3) Initial inventory list
- Apps list, services list, infra list gathered via `find` and recorded in `01_inventory_matrix.md`.
