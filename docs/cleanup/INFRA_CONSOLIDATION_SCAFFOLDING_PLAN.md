# Infra Consolidation & Scaffolding Cleanup Plan

## Scope
- Infrastructure topology under `infra/hosts/*`
- Bootstrapping assets under `infra/bootstrap/*`
- Root-level script/doc hygiene (`scripts/`, `docs/`)
- Archive consolidation without breaking runtime paths

## Immediate changes completed
1. Standardized bootstrap import automation to `infra/bootstrap/*` paths.
2. Added canonical bootstrap folders: `incoming`, `applied`, and docs.
3. Updated setup scripts to point at `infra/bootstrap/docs/USER-ACTION-GUIDE.md`.

## Proposed target structure

```text
infra/
  hosts/
    oracle-host/
    orchestrator-host/
    worker-pc-hosts/
    homeassistant-host/
  bootstrap/
    docs/
    incoming/
    applied/
    file-map.csv
  scripts/
  docker-compose/
  stacks/
```

## Cleanup phases

### Phase 1 (safe, no path breakage)
- Keep existing runtime file locations unchanged.
- Add compatibility wrappers only when moving executable scripts.
- Consolidate archive sprawl into `docs/archive/repo-history/*`.

### Phase 2 (controlled relocation)
- Move non-runtime historical files from root-level or ad-hoc archive dirs to `docs/archive/repo-history/`.
- Add/update index manifest mapping old->new paths.
- Run compose+make validation after each move.

### Phase 3 (apps/services/package ownership)
- Keep monorepo canonical roots (`apps/`, `services/`, `packages/`) at repo root.
- For infra-only components, use `infra/services/*` naming where needed.
- Avoid duplicate `apps/services/packages` trees inside `infra/` unless code is deploy-only.

## Home Assistant utilization recommendations
1. **Vaultwarden** on HA add-on store for secrets UX + autofill.
2. **Glances/Node-RED + Tailscale** for LAN observability fan-out.
3. **Prometheus exporters** from worker PCs forwarded to HA dashboards.
4. **HACS: Scheduler + Auto-backup** for maintenance windows and snapshot rotation.
5. **Webhook bridge** from HA automations to `infra/scripts/health/*` checks.

## Validation checklist before future moves
- `docker compose -f infra/docker-compose.yml config`
- `make stack-verify`
- `make archive-guard`
- `make repo-structure-audit`

## Archive consolidation policy
- Single canonical archive root: `docs/archive/repo-history/`
- Keep historical snapshots read-only.
- New archives must include timestamped folder names (`YYYYMMDD-HHMM`).
