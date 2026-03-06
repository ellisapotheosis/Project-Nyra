# Repo Consolidation V1 Report (2026-03-06)

## TL;DR
- Proposed branch: `refactor/repo-consolidation-v1`.
- Canonical app placements normalized (`apps/landing/app`, `apps/webapp/app`, `apps/admin`, `apps/twenty`).
- Legacy app trees moved to archive to avoid code loss.
- Compose entrypoints consolidated toward oracle/orchestrator/workers split.

## Phase 0: Inventory & Safety

### Root-level clutter (non-canonical)
High-noise roots include: `.claude*`, `.roo`, `_archived`, `infra-archived`, `my-ruvector`, `some`, `memory`, `ai-reviewer`, plus multiple legacy tooling folders.

### Duplicate patterns found
- Many compose variants in `infra/compose/*`, `infra/stacks/*`, `infra/project-nyra-scaffold/*`, `infra/nyra-complete/*`.
- Duplicate app implementations under `apps/web/*` and `apps/*`.
- Multiple tunnel/network docs and scripts under `docs/*`, `infra/*`, `scripts/*`.

### Active vs likely-dead (heuristic)
- Active: canonical compose under `infra/oracle`, `infra/orchestrator`, `infra/workers/*`; app/service/package folders referenced by workspace docs and Make targets.
- Likely-dead/legacy: superseded app variants under `apps/web/*`, old dashboard scaffolds, and historical compose overlays not wired in Make targets.

## Commit Plan (ordered)
1. Create archive policy + index.
2. Move canonical app bases and archive legacy app trees.
3. Normalize compose file homes for orchestrator/workers.
4. Update Makefile with stable oracle/orchestrator/workers/twenty targets.
5. Add canonical infra/docs/env templates and Twenty isolation docs.
6. Update README runbook and operator checklist.

## Before/After Tree (high-level)

### Before
- `apps/web/{ratehunter,webapp,nyra-admin,mortgage-assistant,...}`
- `apps/landing/ratehunter-landing`
- `infra/docker-compose.orchestrator.yml`
- `infra/docker-compose.workers.yml`

### After
- `apps/landing/app`
- `apps/webapp/app`
- `apps/admin/*`
- `apps/twenty/*`
- `archive/20260306/apps-web-legacy`
- `infra/orchestrator/docker-compose.orchestrator.yml`
- `infra/workers/docker-compose.workers.yml`

## Assumptions
1. Archiving legacy implementations is preferable to deleting uncertain code.
2. Existing top-level dot/tooling folders are retained for now to avoid breaking unknown workflows.
