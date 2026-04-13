# Worker Hosts

## Role

- LAN/Tailscale GPU worker nodes.
- Run model-serving and worker-specific compose profiles.

## Workers

- `worker-rtx5090/`
- `worker-rtx3090ti/`
- `worker-rtx3060/`

## Portainer stack inputs

- `infra/workers/worker-rtx5090/docker-compose.worker.yml`
- `infra/workers/worker-rtx3090ti/docker-compose.worker.yml`
- `infra/workers/worker-rtx3060/docker-compose.worker.yml`

## Guardrails

- Keep one env template per worker class in `infra/env/`.
- Keep worker compose and health checks colocated per worker folder.
