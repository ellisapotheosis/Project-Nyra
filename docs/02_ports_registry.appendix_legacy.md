# 02 Ports Registry Appendix (Legacy / Non-Authoritative)

These paths were discovered in archived, ingest, or deprecated trees and are **excluded** from ACTIVE port registry generation:

- `infra/ingest/**`
- `docs/archive/**`
- `_archived/**`
- `infra-archived/**`
- reference docs/examples under `docs/**`

Representative excluded compose paths:
- `infra/ingest/infra/docker-compose.yml`
- `infra/ingest/infra/compose/docker-compose.main.yml`
- `docs/archive/repo-history/**/docker-compose*.yml`
- `archive/ingest-orchestrator-backup/compose/docker-compose.orchestration.yml`

Rationale:
- These files pollute host-port discovery with inactive examples.
- They are not referenced by active `Makefile` targets nor active infra run scripts.
- Keeping them in appendix preserves auditability without affecting runtime truth.
