# Consolidation Inventory Status

Generated from the 2026-04-08 consolidation inventory.
Last reconciled: 2026-05-26.

This file is no longer the active task queue. Current executable work is tracked
in `docs/CONDUCTOR_TASKS.md`, `conductor/tracks/`, and owner-only gates under
`docs/user-todo/`.

## Reconciled High Priority

- [x] Keep duplicate worker directory naming retired. The canonical path convention is now `infra/hosts/worker-*`.
- [x] Reduce root-level compose sprawl by formally deprecating non-canonical compose files in favor of:
  - `infra/hosts/oracle-vps/docker-compose*.yml`
  - `infra/hosts/orchestrator/docker-compose*.yml`
  - `infra/hosts/worker-*/docker-compose*.yml`
- [x] Consolidate active infra documentation under `docs/infra` and keep historical references under `docs/archive` only.

Evidence: `find . -maxdepth 1 -name 'docker-compose*.yml' -o -name 'docker-compose*.yaml'` returns no root-level compose files, and host compose files live under `infra/hosts/<host>/`.

## Reconciled Medium Priority

- [x] Move remaining legacy ingestion bundles (`ingest/`, `apps/ingestion/`) into dated archive slices when provenance retention is sufficient.
- [x] Add per-stack `.env.example` templates under:
  - `infra/hosts/oracle-vps/.env.example`
  - `infra/hosts/orchestrator/.env.example`
  - `infra/hosts/worker-*/.env.example`
- [x] Publish a single source of truth for Cloudflared hostname mapping and Tailscale ACL routing in `docs/infra`.

Evidence: `ingest/` and `apps/ingestion/` are absent, all canonical host folders have `.env.example`, and current routing documentation lives under `docs/infra/`.

## Remaining Governance Follow-Ups

- [x] Add CI guardrails that fail PRs adding new root-level `docker-compose*.yml` outside approved canonical locations.
- [x] Add repo policy check to prevent creating new top-level folders without an owning ADR/decision note.

Evidence: `scripts/infra/validate-repo-policy.sh` validates the approved
top-level directory set, rejects root-level compose files, and calls
`scripts/infra/assert-compose-source-of-truth.sh`. It is exposed as
`pnpm infra:check:repo-policy` and is called by `scripts/ci/validate-infra.sh`.
Both `.github/workflows/infra-validate.yml` and
`.gitea/workflows/infra-validate.yml` run that validator on pull requests.

## Known Risks

- Root-level compose files may still be mentioned in archived or reference docs;
  active runtime compose should remain under `infra/hosts/<host>/`.
- Mixed legacy paths in old docs can mislead new operators unless linked from
  canonical index pages.
