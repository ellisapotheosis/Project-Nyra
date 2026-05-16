# Cloudflare Exposure Review

Updated: 2026-05-08

Decision summary:

- Keep `ratehunter.net` and `www.ratehunter.net` on Cloudflare Pages.
- Route app/service subdomains through Cloudflare Tunnel.
- Use Oracle VPS for durable app, Supabase, CRM, workflow, observability, Nexus, LiteLLM, and most MCP sidecars.
- Use orchestrator tunnel for orchestrator-local services and `links.ratehunter.net` to Home Assistant Green / Linkwarden.
- Do not expose databases, caches, vector stores, worker model servers, Docker socket, or raw internal ports.

Highest-risk routes:

- `api.projectnyra.com`: points to self-hosted Supabase Kong. Keep this browser-reachable for auth/API, but lock down Supabase anon/service roles correctly.
- `hooks.projectnyra.com`: webhooks should use signed paths, provider allowlists, or Access service tokens where compatible.
- `nexus.projectnyra.com`: Nexus UI. Keep protected by the owner/team Cloudflare Access policy.
- `nexus-router.ratehunter.net`: Nexus Router API/MCP endpoint. Use Cloudflare Access service-token protection for agent traffic and prefer Tailscale/private usage where possible.
- MCP direct hostnames: default should be Nexus-first. Only create direct MCP hostnames with Cloudflare Access service tokens.

Routes to create first:

- Oracle: `nyra`, `api`, `twenty`, `crm`, `n8n`, `gitea`, `grafana`, `openwebui`, `nexus`, `nexus-router`, `litellm`.
- Orchestrator: `links`, `linkwarden`, `openclaw-gateway`.

Routes to delay until service health is confirmed:

- `paperclip.projectnyra.com`
- `clawteam.projectnyra.com`
- `prometheus.projectnyra.com`
- `cadvisor.projectnyra.com`
- direct MCP hostnames
- `git-ssh.projectnyra.com`
