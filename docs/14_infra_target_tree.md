# 14 Infra Target Tree (Post-Move Active Runtime)

## Canonical execution roots
This target tree is generated from compose usage in root `Makefile`, `ingest/Makefile`, and infra run scripts.

## Root Makefile runtime map
| Target group | Primary compose/files |
|---|---|
| Core stack (`up/down/logs/ps`) | `infra/docker-compose.yml` |
| Global config validation (`compose-config-all`) | `infra/docker-compose.yml`, worker compose files, `infra/compose/overrides/*.override.yml` |
| Oracle stack (`up-oracle` etc.) | `infra/oracle/docker-compose.oracle.yml` |
| Worker stacks | `infra/workers/worker-rtx3060/docker-compose.worker.yml`, `infra/workers/worker-rtx3090ti/docker-compose.worker.yml`, `infra/workers/worker-rtx5090/docker-compose.worker.yml` |
| Archon dedicated stack | `docker-compose.archon.yml` |
| Gitea dedicated stack | `docker-compose.gitea.yml` (+ bootstrap variant) |
| Infisical dedicated stack | `docker-compose.infisical.yml` (+ bootstrap variant) |

## Ingest Makefile runtime map
| Target group | Primary compose/files |
|---|---|
| Main ingest stack | `ingest/infra/compose/docker-compose.main.yml` |
| Workers | `ingest/infra/compose/docker-compose.workers.yml` |
| Oracle cloud profile | `ingest/infra/compose/docker-compose.oracle-cloud.yml` |
| Apotheosis profile | `ingest/infra/compose/docker-compose.apotheosis.yml` |

## Infra script path tree
- `infra/scripts/node-up.sh`
  - base compose: `infra/docker-compose.yml`
  - node env: `infra/env/.env.<node>`
  - optional override: `infra/compose/overrides/docker-compose.<node>.override.yml`
- `infra/scripts/node-down.sh`
  - same compose/env conventions as node-up.
- `infra/scripts/ultimate-bootstrap.sh`
  - profile-driven bring-up over `infra/docker-compose.yml`.

## Edge/runtime docs ownership
- Tunnel config canonical path: `infra/cloudflared/config.yml`.
- Hostname policy map: `infra/cloudflared/hostname-map.md`.
- Ops handoff summaries: `docs/06_cloudflared_tunnels_dns.md`, `docs/edge/CLOUDFLARED_EXPORT.md`.

## Trust level
- **Confirmed**: direct targets/scripts in active Makefiles and infra scripts.
- **Secondary**: compose files only referenced by overlays/examples and moved to appendix documentation.
