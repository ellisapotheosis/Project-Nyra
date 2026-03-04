# Cloudflared Runtime Notes

Use one authoritative tunnel config path:
- Compose: `infra/compose/docker-compose.cloudflared.yml`
- Config: `infra/compose/configs/cloudflared/config.yml`

Bring up:
```bash
docker compose -f infra/compose/docker-compose.cloudflared.yml up -d
```

Environment:
- `CLOUDFLARE_TUNNEL_TOKEN` for dedicated cloudflared compose
- `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR` for canonical `infra/docker-compose.yml`

Recommendation: converge to one env var name across both compose files.
