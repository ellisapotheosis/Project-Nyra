# Open Tasks from Consolidation Inventory (2026-04-08)

## High Priority

- Reduce root-level compose sprawl by formally deprecating non-canonical compose files in favor of:
  - `infra/oracle/docker-compose.oracle.yml`
  - `infra/orchestrator/docker-compose.orchestrator.yml`
  - `infra/workers/<worker>/docker-compose.worker.yml`
- Consolidate active infra documentation under `docs/infra` and keep historical references under `docs/archive` only.

## Medium Priority

- Move remaining legacy ingestion bundles (`ingest/`, `apps/ingestion/`) into dated archive slices when provenance retention is sufficient.
- Add per-stack `.env.example` templates under:
  - `infra/oracle/.env.example`
  - `infra/orchestrator/.env.example`
  - `infra/workers/*/.env.example`
- Publish a single source of truth for Cloudflared hostname mapping and Tailscale ACL routing in `docs/infra`.

## Low Priority

- Add CI guardrails that fail PRs adding new root-level `docker-compose*.yml` outside approved canonical locations.
- Add repo policy check to prevent creating new top-level folders without an owning ADR/decision note.

## Known Risks

- Root-level compose files are still referenced by existing scripts/automation; hard cut-over must be staged.
- Mixed legacy paths in docs can mislead new operators unless linked from canonical index pages.
