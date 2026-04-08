# Stack Readiness Review (2026-04-02)

## Scope
- Reviewed consolidation/status documentation and compose targets related to:
  - Archon OS stack readiness
  - Gitea bootstrap + actions runner + AI reviewer + Infisical sidecar

## Docs reviewed
- `docs/architecture/REPO_CONSOLIDATION_V1.md`
- `docs/deployment/DOCKER-COMPOSE-CONSOLIDATION-STATUS.md`
- `docs/operations/CONSOLIDATION-VALIDATION-REPORT.md`
- `docs/status/STATUS-TAILSCALE-INTEGRATION.md`

## Findings
1. Archon has a dedicated stack file (`docker-compose.archon.yml`) with >5 services and explicit dependencies.
2. Gitea has a bootstrap-capable stack (`docker-compose.gitea.yml` and `docker-compose.gitea.bootstrap.yml`) with:
   - database,
   - app,
   - secrets-init bootstrap,
   - actions runner profile,
   - AI reviewer profile,
   - Infisical sidecar profile.
3. Environment onboarding was not fully ergonomic because `.env.archon`/`.env.gitea` bootstrap files were not guaranteed to exist.

## Remediation completed
- Added `.env.archon.example` and `.env.gitea.example` templates.
- Added `make env-bootstrap` to create `.env.archon` and `.env.gitea` automatically when missing.
- Added stack readiness validator (`scripts/validation/compose_readiness.py`) and Make targets:
  - `make archon-readiness`
  - `make gitea-readiness`
- Added `make gitea-up-full` to bring up Gitea with actions + AI + Infisical profiles in one command.
- Updated Archon Make targets to consistently use `.env.archon` with compose commands.

## Operator startup order
1. `make env-bootstrap`
2. Fill `.env.archon` and `.env.gitea` with Infisical-sourced values.
3. `make archon-readiness`
4. `make gitea-readiness`
5. `make archon-up` and `make gitea-up-full`
6. Validate with `make archon-ps` and `make gitea-ps`

## Notes
- This review intentionally keeps n8n optional/internal and does not alter Activepieces primacy.
- No user code was deleted; changes are additive and workflow-safe.
