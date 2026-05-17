# Cloudflare Tunnel Static Discovery

Updated: 2026-05-08

Canonical planning pack: `/home/ellisapotheosis/repos/project-nyra-cloudflare-final-prompt-pack`.

Relevant repo files:

- `infra/hosts/orchestrator/cloudflared-config.yml`
- `infra/hosts/orchestrator/docker-compose.cloudflared.yml`
- `infra/hosts/oracle-vps/cloudflared-config.yml`
- `infra/hosts/oracle-vps/docker-compose.yml`
- `infra/hosts/oracle-vps/docker-compose.apps.yml`
- `infra/hosts/oracle-vps/docker-compose.clawteam.yml`
- `docs/cloudflared/hostname-matrix.md`
- `docs/OWNER_MANUAL_ACTIONS.md`

Static findings:

- `ratehunter.net` and `ratehunter.net` are Cloudflare Pages hostnames and must not be routed through either tunnel.
- Oracle VPS has the durable app/service stack: webapp, Supabase Kong/Auth/REST, Twenty, n8n, Gitea, Activepieces, observability, Open WebUI, LiteLLM, Nexus, Paperclip, and MCP sidecars.
- Orchestrator currently has a smaller local stack in this repo: cloudflared, OpenClaw Gateway, Portainer edge agent, Syncthing.
- `docker-compose.cloudflared.yml` on orchestrator runs a token-based remote/API-managed connector, not a local YAML-managed tunnel.
- Oracle `cloudflared` also uses a tunnel token, so the live source of truth is Cloudflare API/dashboard config unless API desired state is applied.
- The old `infra/hosts/oracle-vps/cloudflared-config.yml` included apex/www tunnel routes and some non-existent Oracle OpenClaw/admin/landing origins; those were removed or moved to desired-state review.
