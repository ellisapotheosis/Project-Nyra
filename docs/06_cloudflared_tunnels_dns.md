# 06 Cloudflared Tunnels + DNS (Regenerated, Zero-Datastore-Leak)

## Guardrails

- Tunnel only HTTP(S) services.
- Datastores (postgres/redis/mongo/etc.) are never mapped to hostnames.
- Default access model is Cloudflare Access required.
- Final ingress rule must be `http_status:404`.

## Active ingress hostnames

| Hostname | Internal service target | Access policy | Notes |
|---|---|---|---|
| `n8n.${NYRA_DOMAIN_ROOT}` | `http://n8n:5678` | required | automation UI/API |
| `activepieces.${NYRA_DOMAIN_ROOT}` | `http://activepieces:80` | required | workflow UI |
| `twentycrm.${NYRA_DOMAIN_ROOT}` | `http://twentycrm:3000` | required | CRM app |
| `litellm.${NYRA_DOMAIN_ROOT}` | `http://litellm:4000` | required | LLM gateway |
| `nexus.${NYRA_DOMAIN_ROOT}` | `http://nexus-router:7000` | required | router API |
| `grafana.${NYRA_DOMAIN_ROOT}` | `http://grafana:3000` | required | observability |
| `gitea.${NYRA_DOMAIN_ROOT}` | `http://gitea:3000` | required | git forge UI |
| `infisical.${NYRA_DOMAIN_ROOT}` | `http://infisical:8080` | required | secrets UI/API |

## DNS records

Each hostname should be a proxied CNAME to:

- `<TUNNEL_UUID>.cfargotunnel.com`

CLI alternative per hostname:

```bash
cloudflared tunnel route dns <NAME_OR_UUID> n8n.<domain>
cloudflared tunnel route dns <NAME_OR_UUID> activepieces.<domain>
cloudflared tunnel route dns <NAME_OR_UUID> twentycrm.<domain>
cloudflared tunnel route dns <NAME_OR_UUID> litellm.<domain>
cloudflared tunnel route dns <NAME_OR_UUID> nexus.<domain>
cloudflared tunnel route dns <NAME_OR_UUID> grafana.<domain>
cloudflared tunnel route dns <NAME_OR_UUID> gitea.<domain>
cloudflared tunnel route dns <NAME_OR_UUID> infisical.<domain>
```

## Explicitly non-exposed services

- `postgres`, `redis`, `mongo`, `agentdb`, `ruvector-postgres`, `gitea-db`, `infisical-db`, `infisical-redis`
