# Portainer Fleet Setup

Current repo truth places Portainer CE on `oracle-vps` in
`infra/hosts/oracle-vps/docker-compose.persistent.yml`. The orchestrator and worker
machines run Portainer agents only. The repo now also includes a Portainer sync
entrypoint that renders the Oracle compose bundle and pushes it to Portainer's API.

## Current control-plane service

- Image: `portainer/portainer-ce:2.27.9`
- Ports: `8000`, `9000`, `9443`
- Docker socket mounted locally for oracle management
- Public hostname: `https://portainer-oracle.projectnyra.com`
- Secondary alias: `https://portainer.projectnyra.com`

## Environment strategy

| Host             | Strategy                                  | Owner-only step                                                      |
| ---------------- | ----------------------------------------- | -------------------------------------------------------------------- |
| oracle-vps       | Portainer Server with local Docker socket | Initialize admin user/password and create an API token               |
| orchestrator     | Portainer Agent over Tailscale            | Add environment in Portainer UI                                      |
| worker-rtx5090   | Portainer Agent over Tailscale            | Add environment in Portainer UI                                      |
| worker-rtx3090ti | Portainer Agent over Tailscale            | Add environment in Portainer UI                                      |
| worker-rtx3060   | Portainer Agent over Tailscale            | Add environment in Portainer UI                                      |
| homeassistant    | Link only by default                      | Do not install agent unless HA Docker access is explicitly supported |

## Canonical deployment path

1. Render the Oracle bundle from the repo with `make oracle-portainer-sync`.
2. Keep `PORTAINER_API_KEY` in Infisical or an exported shell secret, not in git.
3. The target defaults to the Oracle Tailscale endpoint (`https://100.64.0.3:9443`);
   set `PORTAINER_URL` if you need a different Portainer host.
4. Use Portainer as the runtime controller, but keep compose files canonical in Git.
5. Do not use the Portainer web editor as the source of truth unless you intentionally
   detach the stack from the repo workflow.

Do not expose Portainer without Cloudflare Access and Portainer authentication.
