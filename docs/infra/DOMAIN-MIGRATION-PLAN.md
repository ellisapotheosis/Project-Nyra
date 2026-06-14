# Domain Migration Plan

## Decision

- `ratehunter.net` remains Cloudflare Pages only.
- `projectnyra.com` subdomains carry Project Nyra app, admin, service, and worker UI routes.
- Admin, worker, and infrastructure-control routes require Cloudflare Access or tailnet-only policy before exposure.

## Local work completed

- Inventoried compose files and tunnel configs.
- Generated `infra/service-registry.yaml`.
- Generated Home Assistant command deck YAML from registry entries.

## Owner-only work

See `docs/OWNER_MANUAL_ACTIONS.md` for Cloudflare, Spaceship, Portainer UI, and Home Assistant dashboard import actions.

| Domain          | Hostname                         | Purpose                      | Backing system                                     | Tunnel/Page    | Public/Auth             | Owner | Status  |
| --------------- | -------------------------------- | ---------------------------- | -------------------------------------------------- | -------------- | ----------------------- | ----- | ------- |
| projectnyra.com | clawteam.projectnyra.com         | Clawteam                     | oracle / `http://clawteam:8080`                    | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | gasteam.projectnyra.com          | GasTeam                      | unknown / `none`                                   | Tunnel/planned | required                | Nyra  | Planned |
| projectnyra.com | gastown.projectnyra.com          | GasTown                      | unknown / `none`                                   | Tunnel/planned | required                | Nyra  | Planned |
| projectnyra.com | openclaw-gateway.projectnyra.com | Openclaw Gateway             | orchestrator / `http://nyra-openclaw-gateway:8001` | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | openwebui.projectnyra.com        | Openwebui                    | oracle / `http://openwebui:8080`                   | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | app.projectnyra.com              | App                          | oracle / `http://webapp:3001`                      | Tunnel/planned | required                | Nyra  | Current |
| ratehunter.net  | ratehunter.net                   | RateHunter Landing           | cloudflare-pages / `none`                          | Pages          | not-required            | Ellis | Planned |
| projectnyra.com | borrower-chat.projectnyra.com    | Borrower ChatUI              | orchestrator / `none`                              | Tunnel/planned | required                | Nyra  | Planned |
| projectnyra.com | broker-chat.projectnyra.com      | Broker ChatUI                | orchestrator / `none`                              | Tunnel/planned | required                | Nyra  | Planned |
| projectnyra.com | campaigns.projectnyra.com        | Campaign Builder             | oracle / `none`                                    | Tunnel/planned | required                | Nyra  | Planned |
| projectnyra.com | quotes.projectnyra.com           | Quote Workspace              | oracle / `none`                                    | Tunnel/planned | required                | Nyra  | Planned |
| projectnyra.com | crm.projectnyra.com              | Crm                          | oracle / `http://twenty:3000`                      | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | twenty.projectnyra.com           | Twenty                       | oracle / `http://twenty:3000`                      | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | admin.projectnyra.com            | Admin Page                   | orchestrator / `none`                              | Tunnel/planned | required                | Nyra  | Planned |
| projectnyra.com | cadvisor.projectnyra.com         | Cadvisor                     | oracle / `http://cadvisor:8080`                    | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | grafana.projectnyra.com          | Grafana                      | oracle / `http://grafana:3000`                     | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | ha.projectnyra.com               | Home Assistant               | homeassistant / `none`                             | Tunnel/planned | required                | Nyra  | Planned |
| projectnyra.com | litellm.projectnyra.com          | Litellm                      | oracle / `http://litellm:4000`                     | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | nexus.projectnyra.com            | Nexus                        | oracle / `http://nexus-ui:3016`                    | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | nexus-router.projectnyra.com     | Nexus Router                 | oracle / `http://nexus:3000`                       | Tunnel/planned | service-token-or-signed | Nyra  | Current |
| projectnyra.com | portainer-oracle.projectnyra.com | Portainer Oracle             | oracle / `https://portainer:9443`                  | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | prometheus.projectnyra.com       | Prometheus                   | oracle / `http://prometheus:9090`                  | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | status.projectnyra.com           | Status Bridge                | orchestrator / `none`                              | Tunnel/planned | required                | Nyra  | Planned |
| projectnyra.com | activepieces.projectnyra.com     | Activepieces                 | oracle / `http://activepieces:80`                  | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | api.projectnyra.com              | Api                          | oracle / `http://supabase-kong:8000`               | Tunnel/planned | not-required            | Nyra  | Current |
| projectnyra.com | git-ssh.projectnyra.com          | Git Ssh                      | oracle / `ssh://gitea:2222`                        | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | gitea.projectnyra.com            | Gitea                        | oracle / `http://gitea:3000`                       | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | hooks.projectnyra.com            | Hooks                        | oracle / `http://n8n:5678`                         | Tunnel/planned | service-token-or-signed | Nyra  | Current |
| projectnyra.com | links.projectnyra.com            | Links                        | orchestrator / `http://100.64.0.2:3007`            | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | linkwarden.projectnyra.com       | Linkwarden                   | orchestrator / `http://100.64.0.2:3007`            | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | n8n.projectnyra.com              | N8N                          | oracle / `http://n8n:5678`                         | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | paperclip.projectnyra.com        | Paperclip                    | oracle / `http://paperclip:3100`                   | Tunnel/planned | required                | Nyra  | Current |
| projectnyra.com | claw-3090.projectnyra.com        | Worker RTX3090Ti OpenClaw UI | worker-rtx3090ti / `none`                          | Tunnel/planned | required                | Nyra  | Planned |
| projectnyra.com | claw-5090.projectnyra.com        | Worker RTX5090 OpenClaw UI   | worker-rtx5090 / `none`                            | Tunnel/planned | required                | Nyra  | Planned |
| projectnyra.com | nerve-3060.projectnyra.com       | Worker RTX3060 Nerve UI      | worker-rtx3060 / `none`                            | Tunnel/planned | required                | Nyra  | Planned |
| projectnyra.com | nerve-3090.projectnyra.com       | Worker RTX3090Ti Nerve UI    | worker-rtx3090ti / `none`                          | Tunnel/planned | required                | Nyra  | Planned |
| projectnyra.com | nerve-5090.projectnyra.com       | Worker RTX5090 Nerve UI      | worker-rtx5090 / `none`                            | Tunnel/planned | required                | Nyra  | Planned |
| projectnyra.com | picoclaw-3060.projectnyra.com    | Worker RTX3060 PicoClaw UI   | worker-rtx3060 / `none`                            | Tunnel/planned | required                | Nyra  | Planned |
