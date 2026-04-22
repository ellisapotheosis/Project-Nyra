# Infra Runbook (Up/Down per node)

## Prerequisites

1. Copy `infra/env/.env.template` to node-specific files in `infra/env/`.
2. Populate secrets from Infisical paths:
   - `/nyra/shared`
   - `/nyra/nodes/<node>`
   - `/nyra/services/<service>`

## Source mapping set used for consolidation

This runbook and the canonical maps were cross-checked against the existing numbered docs set:
`docs/00_scan_baseline.md`, `docs/01_inventory_matrix.md`, `docs/03_env_required.md`, `docs/06_cloudflared_tunnels_dns.md`, `docs/08_compose_sync_report.md`, `docs/09_litellm_nexus_router.md`, `docs/11_public_vs_private_exposure.md`, `docs/12_oracle_deployment.md`, and the ToDo architecture set (`ToDo/docs/00-*` through `ToDo/docs/12_*`).

## Validate compose rendering

```bash
make compose-config-all
```

## Bring up/down by node

```bash
make node-up-orchestrator
make node-down-orchestrator

make node-up-oracle
make node-down-oracle

make node-up-worker-3060
make node-down-worker-3060

make node-up-worker-3090ti
make node-down-worker-3090ti

make node-up-worker-5090
make node-down-worker-5090
```

## Required orchestrator baseline

The orchestrator baseline should include at least:

- `postgres`
- `redis`
- `mongo`
- `n8n`
- `prometheus`/`grafana`/`loki` when observability is enabled
- `infisical` when secrets profile enabled

Start command:

```bash
COMPOSE_PROFILES=core,gateway,workflow,observability,secrets,orchestrator \
  ./infra/scripts/node-up.sh orchestrator
```

## Mortgage lead workflows

Workflows are versioned in `infra/n8n-workflows/`.

Import steps:

```bash
export N8N_API_KEY=... # from Infisical
./infra/scripts/import-n8n-workflows.sh
```

Expected webhook alignment:

- `WEBHOOK_URL` in env must point to the webapp backend ingress domain.
- Workflow endpoints in `infra/n8n-workflows/*.json` should use the same base domain and path prefix.

## Port collision check

```bash
docker compose --env-file infra/env/.env.orchestrator -f infra/docker-compose.yml -f infra/compose/overrides/docker-compose.orchestrator.override.yml config | rg 'published:'
```

If duplicates appear, adjust the conflicting `*_PORT` env values and re-run `make compose-config-all`.

## Rollback

Each infra change commit is atomic and reversible:

```bash
git revert <commit_sha>
```

Then run:

```bash
make compose-config-all
```
