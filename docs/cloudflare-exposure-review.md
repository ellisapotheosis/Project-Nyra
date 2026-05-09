# Cloudflare Exposure Review

Updated: 2026-05-08

Decision summary:

- Keep `ratehunter.net` and `www.ratehunter.net` on Cloudflare Pages.
- Route app/service subdomains through Cloudflare Tunnel.
- Use Oracle VPS for durable app, Supabase, CRM, workflow, observability, Nexus, LiteLLM, and most MCP sidecars.
- Use orchestrator tunnel for orchestrator-local services and `links.ratehunter.net` to Home Assistant Green / Linkwarden.
- Do not expose databases, caches, vector stores, worker model servers, Docker socket, or raw internal ports.

Highest-risk routes:

- `api.ratehunter.net`: points to self-hosted Supabase Kong. Keep this browser-reachable for auth/API, but lock down Supabase anon/service roles correctly.
- `hooks.ratehunter.net`: webhooks should use signed paths, provider allowlists, or Access service tokens where compatible.
- `nexus.ratehunter.net`: should be service-token protected if exposed externally. Prefer Tailscale/private usage for agents when possible.
- `nexus-ui.ratehunter.net`: should be protected by the owner/team Cloudflare Access policy.
- MCP direct hostnames: default should be Nexus-first. Only create direct MCP hostnames with Cloudflare Access service tokens.

Routes to create first:

- Oracle: `nyra`, `api`, `twenty`, `crm`, `n8n`, `gitea`, `grafana`, `openwebui`, `nexus`, `nexus-ui`, `litellm`.
- Orchestrator: `links`, `linkwarden`, `openclaw-gateway`.

Routes to delay until service health is confirmed:

- `paperclip.ratehunter.net`
- `clawteam.ratehunter.net`
- `prometheus.ratehunter.net`
- `cadvisor.ratehunter.net`
- direct MCP hostnames
- `git-ssh.ratehunter.net`
