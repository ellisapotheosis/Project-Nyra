# Cloudflare Validation Report

Updated: 2026-05-08

Scope:

- Repo-side desired-state generation.
- Cloudflare API apply for tunnel configs, DNS records, and UI/admin Access apps.

Validation performed:

```bash
jq . infra/cloudflare/generated-remote/*.json >/dev/null
python3 -c "import yaml; ..."
docker compose -f infra/hosts/orchestrator/docker-compose.cloudflared.yml config --quiet
docker compose -f infra/hosts/oracle-vps/docker-compose.yml -f infra/hosts/oracle-vps/docker-compose.apps.yml config --quiet
```

Results:

- Generated remote JSON payloads are valid JSON.
- Generated/local Cloudflared YAML and host backup YAML parse successfully.
- Orchestrator cloudflared compose is syntactically valid.
- Oracle compose plus apps overlay is syntactically valid.
- Cloudflare API accepted both tunnel configuration updates.
- Cloudflare API upserted 22 DNS records successfully.
- Cloudflare API created or updated 15 Access apps successfully.

Expected warnings:

- Compose warned about unset local secrets such as `ORCHESTRATOR_TUNNEL_TOKEN`, `ORACLE_TUNNEL_TOKEN`, `JWT_SECRET`, and app/provider keys because this local session did not load Infisical machine env files.

Runtime validation:

- `docker --context oracle ps` should use Tailscale/MagicDNS only, preferably `ssh://ubuntu@oracle.trex-fiordland.ts.net:2223`.
- Do not use public Oracle IP addresses for Docker or SSH access.
- `docker --context orchestrator ps` timed out over SSH to `orchestrator.trex-fiordland.ts.net:2223`.
- The live orchestrator tunnel is connected and now has `links`, `linkwarden`, and `openclaw-gateway` routes.
- The Oracle tunnel is connected and healthy with 4 connector connections after recreating `cloudflared`.
- `nyra.ratehunter.net`, `nexus.ratehunter.net`, `litellm.ratehunter.net`, `n8n.ratehunter.net`, and `twenty.ratehunter.net` all reach Cloudflare Access.
- `api.ratehunter.net/auth/v1/health` returns `200`.
- `hooks.ratehunter.net` returns `200`.
- `nexus.ratehunter.net` is the Nexus UI endpoint and `nexus-router.ratehunter.net` is the Nexus Router API/MCP endpoint. Both should remain Cloudflare Access-gated; the router endpoint should use service-token protection for agent traffic.

Runtime caveats:

- The shared Infisical `ORACLE_TUNNEL_TOKEN` must be corrected by the owner; the local machine identity could not update/delete the existing shared secret.
- Re-running Oracle compose without the runtime token override can recreate cloudflared with the wrong token and drop the connector.
- Supabase Auth requires URL-encoded `SUPABASE_DB_URL_PASSWORD` when the raw DB password contains URL-reserved characters.
