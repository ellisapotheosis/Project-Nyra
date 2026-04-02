# 18 UI Registry (Active HTTP Surfaces)

## Approved HTTP UIs
| UI surface | Compose service | Internal port | Host port | Intended access |
|---|---|---|---|---|
| n8n | `n8n` | 5678 | 5678 | Access-protected via Cloudflared |
| Activepieces | `activepieces` | 80 | 8082 | Access-protected via Cloudflared |
| Twenty CRM | `twentycrm` / `twenty` | 3000 | 3000 | Access-protected via Cloudflared |
| Archon UI | `archon-ui` | 5173 | 3737 | Access-protected via Cloudflared |
| Grafana | `grafana` | 3000 | 3003 | Access-protected via Cloudflared |
| Gitea (web) | `gitea` | 3000 | 3100 | Access-protected via Cloudflared |
| Infisical | `infisical` | 8080 | 8086 or 3201 | Access-protected via Cloudflared |

## Internal-only operator/API surfaces
- `openwebui` (8088) is currently private by default.
- `nexus-router`, `litellm`, and MCP adapters are private/internal control APIs.
- `quote-api` is domain API traffic and remains private unless explicitly approved.

## Deny-by-default exclusions
- Datastore admin and database ports are non-public.
- Gitea SSH is not part of HTTP ingress.
- Worker inference ports stay private even though HTTP-speaking.

## Ownership and review cadence
- Each public UI requires a named owner and auth policy.
- New hostname requests should include rollback, observability checks, and expected usage class.
- Reconcile this registry with `docs/02_ports_registry.md` every infra change touching ports.

## Evidence
- `infra/docker-compose.yml`
- `infra/oracle/docker-compose.oracle.yml`
- `docker-compose.gitea.yml`
- `docker-compose.infisical.yml`
- `infra/cloudflared/config.yml`

- Periodically validate Access policies still enforce SSO and session limits.
