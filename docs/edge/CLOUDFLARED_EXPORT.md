# Cloudflared Export (Owner Summary)

## Guardrails

- Tunnel only explicit HTTP(S) apps.
- Cloudflare Access is required for every tunneled hostname in this pack.
- The marketing landing page remains on Cloudflare Pages and stays public.
- No datastore, SSH, or raw TCP ingress is included.
- Final ingress rule is `http_status:404`.

> Replace the example domain `nyra.example.com` and `<TUNNEL_UUID>` before applying DNS or tunnel routes.

## DNS records to create

- `archon.nyra.example.com` -> `<TUNNEL_UUID>.cfargotunnel.com`
- `gitea.nyra.example.com` -> `<TUNNEL_UUID>.cfargotunnel.com`
- `infisical.nyra.example.com` -> `<TUNNEL_UUID>.cfargotunnel.com`
- `activepieces.nyra.example.com` -> `<TUNNEL_UUID>.cfargotunnel.com`
- `n8n.nyra.example.com` -> `<TUNNEL_UUID>.cfargotunnel.com`
- `twentycrm.nyra.example.com` -> `<TUNNEL_UUID>.cfargotunnel.com`
- `grafana.nyra.example.com` -> `<TUNNEL_UUID>.cfargotunnel.com`

## CLI alternative

```bash
cloudflared tunnel route dns <NAME_OR_UUID> archon.nyra.example.com
cloudflared tunnel route dns <NAME_OR_UUID> gitea.nyra.example.com
cloudflared tunnel route dns <NAME_OR_UUID> infisical.nyra.example.com
cloudflared tunnel route dns <NAME_OR_UUID> activepieces.nyra.example.com
cloudflared tunnel route dns <NAME_OR_UUID> n8n.nyra.example.com
cloudflared tunnel route dns <NAME_OR_UUID> twentycrm.nyra.example.com
cloudflared tunnel route dns <NAME_OR_UUID> grafana.nyra.example.com
```

## Active tunnel hostnames

| Hostname | Local origin | Access policy | Notes |
|---|---|---|---|
| `archon.nyra.example.com` | `http://localhost:3737` | required | Archon operator UI |
| `gitea.nyra.example.com` | `http://localhost:3100` | required | git forge UI |
| `infisical.nyra.example.com` | `http://localhost:3201` | required | secrets UI and API |
| `activepieces.nyra.example.com` | `http://localhost:3001` | required | workflow UI |
| `n8n.nyra.example.com` | `http://localhost:5678` | required | automation UI and API |
| `twentycrm.nyra.example.com` | `http://localhost:3000` | required | CRM app |
| `grafana.nyra.example.com` | `http://localhost:3003` | required | observability UI |

## Explicitly non-exposed services

- `postgres`, `redis`, `mongo`, `ruvector`, `ruvector-postgres`, `gitea-db`, `infisical-db`, `infisical-redis`
- `worker-3060-ollama`, `worker-3090ti-vllm`, `worker-5090-vllm`
- `gitea` SSH on port `22`
