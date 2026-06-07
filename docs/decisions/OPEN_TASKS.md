# Open Tasks from Consolidation Inventory (2026-04-08)

## High Priority

- Keep duplicate worker directory naming retired. The canonical path convention is now `infra/hosts/worker-*`.
- Reduce root-level compose sprawl by formally deprecating non-canonical compose files in favor of:
  - `infra/hosts/oracle-vps/docker-compose*.yml`
  - `infra/hosts/orchestrator/docker-compose*.yml`
  - `infra/hosts/worker-*/docker-compose*.yml`
- Consolidate active infra documentation under `docs/infra` and keep historical references under `docs/archive` only.

## Medium Priority

- Move remaining legacy ingestion bundles (`ingest/`, `apps/ingestion/`) into dated archive slices when provenance retention is sufficient.
- Add per-stack `.env.example` templates under:
  - `infra/hosts/oracle-vps/.env.example`
  - `infra/hosts/orchestrator/.env.example`
  - `infra/hosts/worker-*/.env.example`
- Publish a single source of truth for Cloudflared hostname mapping and Tailscale ACL routing in `docs/infra`.

## Low Priority

- Add CI guardrails that fail PRs adding new root-level `docker-compose*.yml` outside approved canonical locations.
- Add repo policy check to prevent creating new top-level folders without an owning ADR/decision note.

## Known Risks

- Root-level compose files are still referenced by existing scripts/automation; hard cut-over must be staged.
- Mixed legacy paths in docs can mislead new operators unless linked from canonical index pages.
