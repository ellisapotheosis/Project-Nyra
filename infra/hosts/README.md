# Infra Hosts

Runtime ownership boundary for active infrastructure stacks.

## Canonical host folders

- `orchestrator/`
- `worker-rtx3060/`
- `worker-rtx3090ti/`
- `worker-rtx5090/`
- `oracle-vps/`
- `homeassistant/`

## Runtime rule

Active docker compose entrypoints that are actually launched should live under a host folder (`infra/hosts/<host>`).

## Supporting files

- Shared configs/templates can stay outside host folders.
- Root-level env/compose templates were migrated to `infra/environments/`.
- Legacy root compose files are retained in `infra/environments/legacy-root-compose/` until fully retired.
