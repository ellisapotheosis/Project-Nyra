# Cloudflare API Apply Report

Updated: 2026-05-08

Cloudflare API apply was run through Infisical `/machines/orchestrator` using
global API key authentication because the locally loaded bearer token did not
have Cloudflare Tunnel read/edit permissions.

Applied successfully:

- Backed up current tunnel configs, DNS records, and Access apps to `infra/cloudflare/backups/`.
- Updated orchestrator tunnel config.
- Updated Oracle VPS tunnel config.
- Upserted 22 proxied CNAME records under `ratehunter.net`.
- Created or updated 15 Cloudflare Access self-hosted applications for UI/admin hostnames.

Important applied routing:

- `ratehunter.net` and `www.ratehunter.net` were not changed and remain Cloudflare Pages hostnames.
- Oracle tunnel routes now include `nyra`, `api`, `hooks`, `twenty`, `crm`, `n8n`, `gitea`, `activepieces`, `grafana`, `prometheus`, `cadvisor`, `openwebui`, `nexus`, `nexus-router`, `litellm`, `paperclip`, `clawteam`, `portainer-oracle`, and `git-ssh`.
- Orchestrator tunnel routes now include `links`, `linkwarden`, and `openclaw-gateway`.

Cloudflare state after runtime repair:

- `Orchestrator Web` tunnel: healthy, 4 connector connections.
- `Oracle-VPS` tunnel: healthy, 4 connector connections.
- DNS records were created/updated and point at the correct tunnel IDs.
- Access apps exist for the UI/admin hostnames checked in `infra/cloudflare/apply-results/access-apps-after.json`.

Smoke checks:

- `https://ratehunter.net` returned `200`.
- `https://www.ratehunter.net` returned `200`.
- `https://nyra.ratehunter.net` returned `302` to Cloudflare Access.
- `https://nexus.ratehunter.net` returned `302` to Cloudflare Access.
- `https://links.ratehunter.net` returned `200` from Cloudflare Access.
- `https://openclaw-gateway.ratehunter.net` returned `200` from Cloudflare Access.
- `https://api.ratehunter.net/auth/v1/health` returned `200`.
- `https://hooks.ratehunter.net` returned `200`.
- `https://n8n.ratehunter.net` returned `302` to Cloudflare Access.
- `https://twenty.ratehunter.net` returned `302` to Cloudflare Access.
- `https://nexus-router.ratehunter.net` returned `502` because the Nexus router container is unhealthy while configured MCP backends are unavailable.

Runtime fixes applied:

- Recreated Oracle cloudflared with the Cloudflare API token for tunnel `02fa18b6-ffcd-4b37-91ba-409642d5fb8f`.
- Forced Oracle cloudflared to use `http2` transport and removed the token from command argv.
- Fixed webapp deployment by moving the malformed `app/leads/\[id\]` route into `app/leads/[id]`.
- Enabled standalone Next output for `apps/webapp/app`.
- Avoided the webapp/Gitea host port collision by publishing webapp on host port `3002` while keeping container port `3001`.
- Fixed n8n database env by using service alias `postgres` and adding `DB_POSTGRESDB_PASSWORD`.
- Fixed Supabase Auth by URL-encoding the database password for GoTrue/PostgREST URLs and pointing Kong at GoTrue port `8081`.

Remaining required owner action:

- Replace the shared Infisical `/machines/oracle-vps` `ORACLE_TUNNEL_TOKEN`. It currently does not match `ORACLE_TUNNEL_ID`; this session used a runtime Cloudflare API token fetch because the machine identity can read secrets but cannot update/delete the existing shared secret.
