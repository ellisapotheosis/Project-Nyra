# 08 Compose Sync Report (Post-Reconciliation)

## Objective

Validate that docs, Makefile targets, and bootstrap scripts point to real compose files.

## Findings

- `infra/docker-compose.yml` is the primary stack compose.
- `infra/scripts/node-up.sh` and `node-down.sh` use `infra/docker-compose.yml` + overrides.
- `make compose-config-all` previously referenced missing worker override files.
- `make down-orchestrator` previously referenced a missing compose file under `infra/orchestrator/`.

## Corrective actions

1. Updated `make compose-config-all` to validate worker compose files that actually exist.
2. Updated orchestrator down/log/health targets to use `infra/docker-compose.yml` profiles.
3. Added additive `up-gitea/down-gitea/logs-gitea/health-gitea` targets.
4. Added additive `up-infisical/down-infisical/logs-infisical/health-infisical` targets.

## Validation performed

- Docker compose config checks for:
  - base infra stack + orchestrator override
  - worker compose files
  - gitea bootstrap compose
  - infisical bootstrap compose
- cloudflared ingress validation command executed via official container image.
- workflow YAML parse check executed for `.github/workflows` and `.gitea/workflows`.

## Status

- Compose references are synchronized with on-disk repo truth for active targets.

## Remaining caveats
- Full runtime validation requires Docker in the execution environment.
- Some legacy scripts still mention historical paths and should be reviewed in future cleanup PRs.

## Recommended CI additions
- Add a check that every compose path in Makefile exists.
- Add a check that cloudflared config has final 404 catch-all.
- Add a check that datastore services are never listed in hostname map.

## Evidence
- This report is backed by direct grep/sed parsing of Makefile and infra scripts.
