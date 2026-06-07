# Portainer Fleet Setup

Current repo evidence shows Portainer CE on the orchestrator in `infra/hosts/orchestrator/docker-compose.yml` and a mesh package in `infra/hosts/orchestrator/portainer-mesh/`.

## Current orchestrator service

- Image: `portainer/portainer-ce:2.27.9`
- Ports: `8000`, `9000`, `9443`
- Docker socket mounted locally for orchestrator management
- Public hostname planned/current: `https://portainer.projectnyra.com`

## Environment strategy

| Host             | Strategy                                   | Owner-only step                                                      |
| ---------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| orchestrator     | Portainer Server with local Docker socket  | Initialize admin user/password in UI if not done                     |
| worker-rtx5090   | Edge Agent or regular Agent over Tailscale | Add environment in Portainer UI                                      |
| worker-rtx3090ti | Edge Agent or regular Agent over Tailscale | Add environment in Portainer UI                                      |
| worker-rtx3060   | Edge Agent or regular Agent over Tailscale | Add environment in Portainer UI                                      |
| oracle-vps       | Edge Agent recommended                     | Add environment in Portainer UI                                      |
| homeassistant    | Link only by default                       | Do not install agent unless HA Docker access is explicitly supported |

Do not expose Portainer without Cloudflare Access and Portainer authentication.
