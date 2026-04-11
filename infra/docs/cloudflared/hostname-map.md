# Hostname Map (Tunnel + DNS)

## Public internet

- `ratehunter.net` -> Cloudflare Pages (`apps/landing/ratehunter-landing`) (public marketing)

> Replace `nyra.example.com` and `<TUNNEL_UUID>` with the real zone and tunnel ID before creating DNS records.

## Tunnel hostnames (Cloudflare Access required)

| Hostname | Local origin | Record type | Notes |
|---|---|---|---|
| `archon.nyra.example.com` | `http://localhost:3737` | proxied CNAME | Archon operator UI |
| `gitea.nyra.example.com` | `http://localhost:3100` | proxied CNAME | git forge UI |
| `infisical.nyra.example.com` | `http://localhost:3201` | proxied CNAME | secrets UI and API |
| `activepieces.nyra.example.com` | `http://localhost:3001` | proxied CNAME | workflow UI |
| `n8n.nyra.example.com` | `http://localhost:5678` | proxied CNAME | automation UI and API |
| `twentycrm.nyra.example.com` | `http://localhost:3000` | proxied CNAME | CRM app |
| `grafana.nyra.example.com` | `http://localhost:3003` | proxied CNAME | observability UI |

Each CNAME points to `<TUNNEL_UUID>.cfargotunnel.com`.

## Explicitly excluded from tunnel

- Datastores: `postgres`, `redis`, `mongo`, `ruvector`, `ruvector-postgres`, `gitea-db`, `infisical-db`, `infisical-redis`
- Worker inference backends: `worker-3060-ollama`, `worker-3090ti-vllm`, `worker-5090-vllm`
- SSH and raw TCP endpoints, including `gitea` SSH on port `22`
