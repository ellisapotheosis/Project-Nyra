# 18 UI Registry (Active Surfaces)

## Operator/consumer UI surfaces

| UI | Compose service | Default internal port | Intended access |
|---|---|---|---|
| n8n | `n8n` | 5678 | Access-protected via cloudflared |
| Activepieces | `activepieces` | 80 | Access-protected via cloudflared |
| Twenty CRM | `twentycrm` / `twenty` | 3000 | Access-protected via cloudflared |
| Grafana | `grafana` | 3000 | Access-protected via cloudflared |
| OpenWebUI | `openwebui` | 8080 | private by default |
| Gitea | `gitea` | 3000 | Access-protected via cloudflared |
| Infisical | `infisical` | 8080 | Access-protected via cloudflared |

## Non-UI APIs with controlled ingress

- `litellm`
- `nexus-router`
- `quote-api`

## Exposure discipline

- No direct datastore UIs published to public DNS.
- Admin interfaces use Access policy gates.
- Catch-all 404 prevents accidental host leakage.

## UX governance
- Publicly reachable UIs must have explicit owner, auth policy, and uptime target.
- Admin UIs should include SSO via Access and short session lifetimes.

## Monitoring guidance
- Add synthetic checks for each Access-protected UI hostname.
- Track authentication failures separately from backend availability failures.

## Change policy
- New UI hostname requests must include exposure class and rollback instructions.

## Evidence references
- Source compose: `infra/docker-compose.yml`
- Targeting policy: `infra/cloudflared/config.yml`
- Control surface docs: `docs/02_ports_registry.md`

## Command snippets
```bash
rg -n "<service-name>|ports:" infra/docker-compose.yml
```

```bash
rg -n "hostname:|service:" infra/cloudflared/config.yml
```
