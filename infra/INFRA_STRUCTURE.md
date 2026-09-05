# Infrastructure Ground Truth

## Canonical Compose Locations

- The single source of truth for all infrastructure deployments is `infra/hosts/<host-name>/`.
- Do NOT place `docker-compose.yml` files in the `infra/` root or any other arbitrary subfolder.
- The `Makefile` relies on paths explicitly defined under `infra/hosts/`.

## Directory Structure

- `infra/hosts/oracle-vps/`: Canonical configuration for the public cloud stack (twenty-crm, gitea, memory, apps, etc.).
- `infra/hosts/worker-rtx3090ti/`: Canonical configuration for local TTS/LLM inference.
- `infra/hosts/worker-rtx5090/`: Canonical configuration for local heavy LLM inference.
- `infra/hosts/orchestrator/`: Canonical configuration for the control plane.
- `infra/images/`: Dockerfile build contexts.
- `infra/configs/`: Shared configuration files (e.g., prometheus.yml) not tied to a specific host compose.
- `infra/cleanup_archive/`: Stale/old configurations. DO NOT USE.
- `infra/waveterm/`, `infra/zellij/`: Cockpit and UI tools.

## Container Naming

- ALWAYS use the prefix `${COMPOSE_PROJECT_NAME:-nyra}-` for all `container_name` fields in compose and overlay files to prevent collisions.
- Hardcoding `container_name: nyra-webapp` is strictly forbidden.

## Port Collisions

- Always verify host port bindings when adding new services or extending an overlay to avoid collisions (e.g. `5000`, `3100`).
