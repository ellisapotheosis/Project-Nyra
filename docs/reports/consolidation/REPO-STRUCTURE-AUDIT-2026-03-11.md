# Repo Structure Audit

- Generated: 2026-03-11T09:45:29-07:00
- Repo: /home/ellisapotheosis/repos/project-nyra

## Hotspot Counts

| Area | File Count |
|---|---:|
| docs/ | 3561 |
| scripts/ | 233 |
| infra/ | 366 |
| apps/ | 1284 |

## Archive State

| Path | Files | Size |
|---|---:|---:|
| docs/archive/repo-history | 2262 | 115M |

## Deprecated Archive Path Check

- OK: `archive/` not present.
- OK: `_archived/` not present.
- OK: `scripts/_archive/` not present.

## Infra Host Scaffolding Check

- OK: `infra/hosts/oracle-host`
- OK: `infra/hosts/orchestrator-host`
- OK: `infra/hosts/worker-pc-hosts`
- OK: `infra/hosts/homeassistant-host`

## Suggested Next Operations

1. Run `make archive-guard` in CI to prevent path regression.
2. Consolidate docs taxonomy (merge duplicate themes like `infra/` vs `infrastructure/`).
3. Merge script entrypoints under one operator CLI and keep old scripts as thin wrappers.
4. Normalize infra host ownership files under `infra/hosts/*`.
