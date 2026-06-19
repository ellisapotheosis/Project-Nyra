# 11 Public vs Private Exposure Matrix

Updated: 2026-04-30

## Public edge rule

Public ingress should flow through Cloudflared only. Operator and internal app surfaces require Cloudflare Access unless explicitly documented as public marketing content.

## Public unauthenticated

| Surface              | Preferred origin | Notes                   |
| -------------------- | ---------------- | ----------------------- |
| `ratehunter.net`     | Cloudflare Pages | Marketing landing only  |
| `www.ratehunter.net` | Cloudflare Pages | Marketing landing alias |

## Access-gated HTTP surfaces

`docs/cloudflared/hostname-matrix.md` is the current consolidated hostname checklist. Primary candidate hostnames:

| Hostname                      | Origin service        |
| ----------------------------- | --------------------- |
| `nyra.ratehunter.net`         | `webapp:3001`         |
| `crm.ratehunter.net`          | `twenty:3000`         |
| `n8n.ratehunter.net`          | `n8n:5678`            |
| `activepieces.ratehunter.net` | `activepieces:80`     |
| `nexus.ratehunter.net`        | `nexus:3000`          |
| `gitea.ratehunter.net`        | `gitea:3000`          |
| `grafana.ratehunter.net`      | `grafana:3000`        |
| `prometheus.ratehunter.net`   | `prometheus:9090`     |
| `loki.ratehunter.net`         | `loki:3100`           |
| `cadvisor.ratehunter.net`     | `cadvisor:8080`       |
| `openwebui.ratehunter.net`    | `openwebui:8080`      |
| `openmemory.ratehunter.net`   | `openmemory-mcp:8765` |
| `letta.ratehunter.net`        | `letta:8283`          |
| `paperclip.ratehunter.net`    | `paperclip:3100`      |
| `clawteam.ratehunter.net`     | `clawteam:8080`       |

## Restricted non-HTTP

| Hostname                 | Origin service          | Rule                                                                    |
| ------------------------ | ----------------------- | ----------------------------------------------------------------------- |
| `git-ssh.ratehunter.net` | `ssh://nyra-gitea:2222` | Use only with Cloudflare Access SSH clients and explicit owner approval |

## Private-only

Never publish direct DNS or Cloudflared routes for:

- Postgres and service-specific database containers
- Redis and Redis-compatible graph/cache stores
- Qdrant/vector stores
- Worker `vllm`, `ollama`, model cache, and local LiteLLM ports unless Access-gated for a narrowly scoped internal API
- Worker exporter ports `9100` and `9835`
- Raw voice/media transport ports
- Internal MCP bridges unless they are explicitly owner-only Access-gated in `docs/cloudflared/hostname-matrix.md`

## Enforcement rules

1. Every non-marketing hostname must have an Access policy.
2. Every tunnel config must end with `http_status:404`.
3. Datastores and worker inference backends must stay private.
4. SSH over Cloudflared requires Access SSH client setup, not open public SSH.

## Verification commands

```bash
rg -n "hostname:|service:" docs/cloudflared/*.yml
rg -n "postgres|redis|qdrant|vllm|ollama|9835|9100" docs/cloudflared/*.yml
```
