# Infra Consolidation Report (2026-04-20)

## Objective

Consolidate infrastructure runtime ownership so active compose stacks are host-scoped under `infra/hosts/<host>` and remove root-level runtime ambiguity.

## What `/infra` currently contains

- `infra/hosts/` — **runtime owner folders** (orchestrator, workers, oracle-vps, homeassistant).
- `infra/compose/` — shared/legacy compose fragments and overlays.
- `infra/configs/` — service config assets (prometheus, loki, grafana, litellm, etc.).
- `infra/docker/` — container build contexts and Dockerfiles.
- `infra/cloudflared/` — shared cloudflared config/assets.
- `infra/stacks/` and `infra/ingest/` — archived/alternate packaging that should not be primary runtime paths.
- `infra/environments/` — **new canonical template location** for env templates and retired root compose files.

## Changes applied in this consolidation pass

1. Moved root env templates into `infra/environments/templates/**`.
2. Moved root-level compose files into `infra/environments/legacy-root-compose/`.
3. Added host-scoped cloudflared compose wrapper:
   - `infra/hosts/orchestrator/docker-compose.cloudflared.yml`
4. Rewired both root `Makefile` and `infra/Makefile` to default to host-scoped runtime compose files.
5. Updated bootstrap/standup scripts to reference the new env/compose canonical paths.

## Merge candidates into main host stacks

### High priority (merge into `infra/hosts/orchestrator`)

- `infra/configs/gitea/docker-compose.gitea.yml`
- `infra/docker-compose.twenty.yml`
- `infra/compose/docker-compose.supabase.yml`
- `infra/compose/docker-compose.archon.yml`

Reason: these are operational services for control-plane workflows and should be grouped under orchestrator ownership.

### Keep as shared config/assets (do not run directly)

- `infra/configs/**`
- `infra/docker/**`
- `infra/cloudflared/config.*.yml`

Reason: these are reusable inputs, not runtime entrypoints.

### Deprioritize / archive candidates

- `infra/stacks/nyra-mortgage/*`
- `infra/ingest/infra/*` compose trees
- `infra/compose/overrides/*`

Reason: mostly alternate or historical stacks; keep only if still actively referenced by automation.

## Suggested final target state

1. Exactly one runtime compose entrypoint per host folder:
   - `infra/hosts/orchestrator/docker-compose.orchestrator.yml`
   - `infra/hosts/orchestrator/docker-compose.cloudflared.yml`
   - `infra/hosts/worker-rtx*/docker-compose.worker-*.yml`
   - `infra/hosts/oracle-vps/docker-compose.oracle.yml`
2. Makefiles reference only files above.
3. Service-specific compose files become includes or are migrated into host compose files.
4. Root folder has **zero** compose and env template runtime files.

## Follow-up cleanup checklist

- [ ] Fold gitea/twenty/supabase/archon compose definitions into orchestrator host compose (or orchestrator-local include files).
- [ ] Remove/retire `infra/compose/docker-compose.cloudflared.yml` after confirming no automation depends on it.
- [ ] Prune `infra/ingest/infra` compose duplicates if not used by ingestion workflows anymore.
- [ ] Update any remaining docs that still point to old root env/compose paths.
