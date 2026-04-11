# Infra Consolidation Plan (Canonical Host-First Layout)

## Objective

Consolidate host-specific Compose stacks, env files, and run scripts into a single canonical hierarchy under `infra/hosts/*` while keeping shared building blocks under `infra/compose`, `infra/configs`, and `infra/env`.

## Canonical Rules

1. **Host-owned runtime files live in `infra/hosts/<host>/` only**.
   - Includes host compose entrypoints (`docker-compose.*.yml`) and host `.env.example` templates.
2. **Shared reusable fragments live outside host folders**.
   - Compose fragments: `infra/compose/`
   - Service configs: `infra/configs/`
   - Environment templates: `infra/env/`
3. **Legacy/duplicated host compose files outside `infra/hosts/*` are migration sources, not long-term runtime entrypoints**.
4. **No committed duplicate artifacts with suffixes like ` (2)` / ` (3)` in canonical trees**.

## Current Canonical Host Entrypoints

- `infra/hosts/orchestrator/docker-compose.orchestrator.yml`
- `infra/hosts/oracle-vps/docker-compose.oracle.yml`
- `infra/hosts/worker-rtx5090/docker-compose.worker-5090.yml`
- `infra/hosts/worker-rtx3090ti/docker-compose.worker-3090.yml`
- `infra/hosts/worker-rtx3060/docker-compose.worker-3060.yml`
- `infra/hosts/homeassistant/docker-compose.homeassistant-dashboard.yml`

## Consolidation Actions Completed (this pass)

- Removed duplicated host docs with copy suffixes (`README (2).md`, `README (3).md`) across `infra/hosts/*`.
- Removed duplicate environment templates with copy suffixes (`.env (2).example`) in worker host folders.
- Removed stale Nexus backup config from canonical config directory.
- Removed `infra/ingest/New folder/` (legacy ingest payload copy dump, non-canonical and heavily duplicated).
- Replaced empty deployment restart script with a safe, deterministic implementation:
  - `scripts/deployment/restart-services.sh`

## Remaining Consolidation Work (next pass)

### 1) Compose canonicalization

- Migrate remaining host-like compose files outside `infra/hosts/*` into host folders as wrappers or shared includes.
- Keep `infra/compose/*` as shared profiles/partials; avoid direct host deployment from this folder.

### 2) Config deduplication (`/config` vs `/infra/configs`)

- Keep `infra/configs/*` as runtime canonical.
- Mark `/config/*` as compatibility/shim and wire explicit sync checks in CI.
- Add per-file ownership headers documenting canonical source.

### 3) Environment deduplication (`/environments` vs `/infra/env`)

- Keep `infra/env/*` as host/service templates.
- Keep `/environments/*` only for app runtime mode segregation (dev/staging/prod), with naming and ownership docs.
- Add validation to prevent drift.

### 4) Script hygiene (`/scripts` + `/infra/scripts`)

- Keep orchestration runtime scripts in `infra/scripts/`.
- Keep repo/dev/CI automation in `scripts/`.
- Convert duplicate entrypoints to thin wrappers if both paths must remain for compatibility.
- Enforce no zero-byte script files and no duplicated ` (2)`/` (3)` script copies.

## Suggested Validation Commands

```bash
# Duplicated copy-suffix files
find infra scripts config environments -type f | rg ' \([0-9]+\)\.'

# Ensure no empty scripts remain
find scripts infra/scripts -type f \( -name '*.sh' -o -name '*.ps1' -o -name '*.py' \) -size 0

# Host compose inventory
find infra/hosts -maxdepth 2 -type f -name 'docker-compose*.yml' | sort
```
