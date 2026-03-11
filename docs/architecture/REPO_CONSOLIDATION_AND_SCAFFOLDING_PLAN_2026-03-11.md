# Repo Consolidation And Scaffolding Plan (2026-03-11)

## Scope

This plan covers:

- monorepo consolidation and scaffolding cleanup
- archive normalization
- infra host ownership structure
- docs and scripts taxonomy cleanup
- Docker profile strategy
- Turborepo/pnpm workspace normalization

## Current State Snapshot

- `docs/` is oversized and has overlapping taxonomies (`infra/` and `infrastructure/`, `reference/` and `references/`, multiple report buckets).
- `scripts/` has many entrypoints with overlapping responsibilities (`setup`, `operations`, `deployment`, `dev`, `maintenance`, `stack`).
- `infra/` already has strong components, but host ownership is implicit and spread across many folders.
- Archives were previously split across root locations (`archive/`, `_archived/`, `scripts/_archive/`) plus `docs/archive/`.

## Completed In This Pass

1. Moved root archive trees into one canonical location:
   - `docs/archive/repo-history/archive-root/`
   - `docs/archive/repo-history/archived-root/`
   - `docs/archive/repo-history/scripts-archive/`
2. Added archive policy and guardrails:
   - `ARCHIVE_POLICY.md` updated to canonical path.
   - `scripts/maintenance/archive-guard.sh`
   - `make archive-guard`
3. Added repo structure audit tooling:
   - `scripts/maintenance/repo-structure-audit.sh`
   - `make repo-structure-audit`
4. Added infra host scaffolding:
   - `infra/hosts/*` ownership directories with host README files.

## Target Repository Structure

```text
repo/
  apps/
    <runtime apps only>
  packages/
    <shared app/runtime libraries only>
  services/
    <runtime services only>
  infra/
    hosts/
      oracle-host/
      orchestrator-host/
      worker-pc-hosts/
      homeassistant-host/
    bootstrap/
    compose/
    configs/
    scripts/
    workers/
  docs/
    architecture/
    runbooks/
    operations/
    setup/
    reports/
    archive/
      repo-history/
```

## Design Decisions

### 1) Archive Policy

- Keep all historical payloads under `docs/archive/repo-history/`.
- Do not reintroduce root-level archive directories.
- Keep active docs separate from historical payload.

### 2) App vs Infra Code Boundaries

- Keep root-level `apps/`, `packages/`, and `services/` as the only active workspace code roots.
- Keep infra-specific helper code under `infra/services/` only if it is infra-runtime-only and not shared with apps.
- Avoid introducing a second global `packages/` root under `infra` unless there is a strict infra-only build system.

### 3) Docker Profile Strategy

- Standardize profile naming and usage:
  - `core`, `gateway`, `workflow`, `crm`, `archon`, `apps`, `observability`, `vector`, `dev`, `workers`
- Keep production-safe defaults minimal; opt-in dev profiles for heavy/local-only components.
- Add host-specific overlays under `infra/compose/overrides/`.

## Consolidation Roadmap

### Phase A: Taxonomy Lock (1-2 days)

1. Freeze top-level docs categories to a canonical set.
2. Create redirect/readme stubs in deprecated doc folders.
3. Normalize script entrypoint policy:
   - Operator-facing commands in one family (`scripts/operations/*`).
   - Legacy scripts become wrappers.

### Phase B: Docs Cleanup (2-4 days)

1. Merge duplicate doc categories:
   - `infra/` + `infrastructure/` -> one
   - `reference/` + `references/` -> one
2. Move obsolete docs to `docs/archive/repo-history/archive-root/YYYYMMDD/docs/...`.
3. Produce a docs index map at `docs/README.md` with strict ownership.

### Phase C: Scripts Cleanup (2-4 days)

1. Build a single operator command surface:
   - `make` targets for common actions
   - optional shell/TUI wrapper for command discovery
2. Re-home script implementations by lifecycle:
   - bootstrap, operations, deployment, maintenance, validation
3. Leave compatibility wrappers in old paths for one release cycle.

### Phase D: Infra Host Alignment (2-4 days)

1. For each host folder in `infra/hosts/*`, create:
   - ownership manifest
   - active services list
   - bootstrap sequence
   - rollback checklist
2. Link current infra assets to host ownership via README manifests.
3. Normalize worker host naming (`worker-rtx*` only).

### Phase E: Workspace And Build Normalization (2-3 days)

1. Align `pnpm-workspace.yaml` to active runtime roots only.
2. Ensure all workspace projects declare package manager metadata consistently.
3. Validate Turborepo task graph and output caching boundaries.
4. Add CI guard to fail on unresolved workspace entries.

## Home Assistant Integration Track

Use `infra/hosts/homeassistant-host/` as a first-class local operations domain.

Recommended milestones:

1. Establish HA as monitoring/automation plane (read-mostly access).
2. Deploy Vaultwarden and Tailscale integrations in HA host domain.
3. Add worker telemetry pipeline (Glances or Prometheus exporters).
4. Wire alerts for worker GPU load/temperature/offline states.
5. Add runbook automations for low-risk remediations.

## Risk Controls

- No destructive deletes during consolidation phases.
- Archive-first moves with index updates.
- Keep one active path for each operational command.
- Do not mix dev-only and prod profiles by default.

## Success Criteria

- One canonical archive location.
- One clear docs taxonomy with no duplicate thematic roots.
- One primary scripts control plane with compatibility wrappers.
- Host ownership map under `infra/hosts/`.
- Clean pnpm/turbo workspace graph with no orphan projects.
