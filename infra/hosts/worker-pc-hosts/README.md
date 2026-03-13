# Worker PC Hosts

## Role

- LAN/Tailscale GPU worker nodes.
- Run model-serving and worker-specific compose profiles.

## Workers

- `worker-rtx3060/`
- `worker-rtx3090ti/`
- `worker-rtx5090/`

## Current Source Paths To Consolidate

- `infra/workers/worker-rtx3060/`
- `infra/workers/worker-rtx3090ti/`
- `infra/workers/worker-rtx5090/`
- `infra/scripts/workers/`

## Guardrails

- Keep one env template per worker class in `infra/env/`.
- Keep worker compose and health checks colocated per worker folder.
