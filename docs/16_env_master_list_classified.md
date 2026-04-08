# 16 Environment Master List (Classified)

## Method summary
This classification is derived from repository env files and compose references, with emphasis on active runtime contexts.

## Classification rules
1. **Secret material**: keys containing `_TOKEN`, `_SECRET`, `_PASSWORD`, `_KEY`, DB URLs, auth credentials.
2. **Runtime routing/config**: hostnames, ports, origins, domains, URLs, deployment modes.
3. **Machine profile**: worker hardware, model limits, orchestration role metadata.
4. **Public-safe config**: `NEXT_PUBLIC_*` and explicit non-sensitive frontend constants.

## Operational guidance
- Keep live values in Infisical or CI secret stores.
- Commit only templates (`*.template`, `*.example`) and non-sensitive defaults.
- Never commit generated local `.env.gitea`, `.env.infisical`, or `.secrets/*` material.

## Priority env sets
### Core platform
- `infra/env/.env.orchestrator`
- `infra/env/.env.worker-rtx3060`
- `infra/env/.env.worker-rtx3090ti`
- `infra/env/.env.worker-rtx5090`

### Dedicated control planes
- `.env.gitea.template` -> `.env.gitea` (ignored local)
- `.env.infisical.template` -> `.env.infisical` (ignored local)

### Overlay/runtime variants
- `infra/compose/overrides/*.override.yml` env references
- `docker-compose.archon.yml` and control-plane env keys

## Risk notes
- Several env keys appear only in docs/examples; treat those as optional until mapped to active compose/script usage.
- Cross-machine drift is most likely in host/port/domain keys; validate during preflight.
- Secret rotation policy should be anchored to Infisical project scopes and CI contexts.

## Compliance reminder
Mortgage workflows handling borrower data must keep credentials and PII-bearing config off git history and under least-privilege secret delivery.
