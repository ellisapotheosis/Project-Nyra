# Hostname Map (Tunnel + DNS)

## Public internet

- `ratehunter.net` -> Cloudflare Pages (`apps/landing`) (public marketing)

## Tunnel hostnames (Access required)

| Hostname template | Target service | Record type |
|---|---|---|
| `n8n.${NYRA_DOMAIN_ROOT}` | `n8n:5678` | proxied CNAME |
| `activepieces.${NYRA_DOMAIN_ROOT}` | `activepieces:80` | proxied CNAME |
| `twentycrm.${NYRA_DOMAIN_ROOT}` | `twentycrm:3000` | proxied CNAME |
| `litellm.${NYRA_DOMAIN_ROOT}` | `litellm:4000` | proxied CNAME |
| `nexus.${NYRA_DOMAIN_ROOT}` | `nexus-router:7000` | proxied CNAME |
| `grafana.${NYRA_DOMAIN_ROOT}` | `grafana:3000` | proxied CNAME |
| `gitea.${NYRA_DOMAIN_ROOT}` | `gitea:3000` | proxied CNAME |
| `infisical.${NYRA_DOMAIN_ROOT}` | `infisical:8080` | proxied CNAME |

Each CNAME points to `<CF_TUNNEL_UUID>.cfargotunnel.com`.

## Explicitly excluded from tunnel

- All datastore services (`postgres`, `redis`, `mongo`, `agentdb`, `ruvector-postgres`, `gitea-db`, `infisical-db`, `infisical-redis`).
