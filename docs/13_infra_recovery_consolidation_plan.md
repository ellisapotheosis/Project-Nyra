# 13 Infra Recovery Consolidation Plan

## Inventory-first findings
1. Active orchestration points to `infra/docker-compose.yml` as base, with node overrides from `infra/compose/overrides/` via `infra/scripts/nyra`.
2. Root bootstrap compose files for Gitea and Infisical exist and are currently the safest integration points (`docker-compose.gitea.yml`, `docker-compose.infisical.yml`).
3. Prior recovery docs incorrectly referenced non-existent paths (for example, `infra/compose/docker-compose.gitea.yml`) and mixed in archived/ingest compose files.

## Recovery actions completed
- Rebuilt active ports registry from authoritative compose/runtime paths only.
- Replaced low-signal docs 13–20 with evidence-based content.
- Regenerated cloudflared edge pack with strict zero-datastore rules.
- Added collision-safe Make targets for Gitea + Infisical bootstrap lifecycle.

## Authoritative compose set used
- `infra/docker-compose.yml`
- `infra/compose/docker-compose.archon.yml`
- `infra/compose/docker-compose.supabase.yml`
- `docker-compose.gitea.yml`
- `docker-compose.infisical.yml`
- `docker-compose.crm-api.yml`
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
- `infra/hosts/orchestrator/docker-compose.orchestrator.yml`
- `infra/hosts/oracle-vps/docker-compose.oracle.yml`
- `infra/hosts/worker-rtx3060/docker-compose.worker.yml`
- `infra/hosts/worker-rtx3090ti/docker-compose.worker.yml`
- `infra/hosts/worker-rtx5090/docker-compose.worker.yml`
- `infra/hosts/worker-rtx3060/docker-compose.gpu.yml`
- `infra/hosts/worker-rtx3090ti/docker-compose.gpu.yml`
- `infra/hosts/worker-rtx5090/docker-compose.gpu.yml`

## Guardrails
- No file deletions.
- No committed real secrets.
- No public datastore exposure.
- Fail-closed cloudflared ingress with final 404.
- Use `orchestrator` naming in all newly written assets.
