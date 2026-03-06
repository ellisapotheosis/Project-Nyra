# 14 Infra Target Tree (Active Runtime)

## Makefile-driven targets

- `make up/down/logs/ps` -> `infra/docker-compose.yml`
- `make compose-config-all` -> base compose + node-specific overlays/worker files
- `make node-up-*` -> `infra/scripts/node-up.sh`
- `make node-down-*` -> `infra/scripts/node-down.sh`
- `make bootstrap-ultimate` -> `infra/scripts/ultimate-bootstrap.sh`
- `make gitea-*` -> `docker-compose.gitea.yml`
- `make infisical-*` -> `docker-compose.infisical.yml`

## Infra scripts path tree

- `infra/scripts/node-up.sh`
  - env: `infra/env/.env.<node>`
  - compose: `infra/docker-compose.yml`
  - optional override: `infra/compose/overrides/docker-compose.<node>.override.yml`
- `infra/scripts/ultimate-bootstrap.sh`
  - compose: `infra/docker-compose.yml`
  - profiles selected by role

## Standalone compose roots

- `infra/oracle/docker-compose.oracle.yml`
- `infra/workers/worker-rtx3060/docker-compose.worker.yml`
- `infra/workers/worker-rtx3090ti/docker-compose.worker.yml`
- `infra/workers/worker-rtx5090/docker-compose.worker.yml`
- `infra/orchestrator/docker-compose.nexus-one-hop.yml`

## Edge path

- `infra/cloudflared/config.yml`
- `infra/cloudflared/hostname-map.md`
- validation command references official cloudflared image.

## Tree confidence
- High for Makefile-driven paths.
- Medium for legacy scripts not currently invoked by standard flows.

## Follow-up hardening
- Add a script to enumerate missing compose paths and fail CI.
- Add documentation generation hooks so target tree remains synchronized after infra edits.
- Pin authoritative scope inside docs metadata for future agents.
