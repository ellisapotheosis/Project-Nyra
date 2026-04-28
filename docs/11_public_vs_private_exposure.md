# 11 Public vs Private Exposure Matrix

Updated: 2026-04-27

## Public edge rule

Public ingress should flow through Cloudflared only. Operator and internal app surfaces require Cloudflare Access unless explicitly documented as public marketing content.

## Public unauthenticated

| Surface | Preferred origin | Notes |
|---|---|---|
| `ratehunter.net` | Cloudflare Pages | Marketing landing only |
| `www.ratehunter.net` | Cloudflare Pages | Marketing landing alias |

## Access-gated HTTP surfaces

`infra/hosts/oracle-vps/cloudflared-config.yml` currently lists these candidate hostnames:

| Hostname | Origin service |
|---|---|
| `app.ratehunter.net` | `nyra-webapp:3001` |
| `admin.ratehunter.net` | `nyra-admin:3002` |
| `twenty.ratehunter.net` | `nyra-twenty:3000` |
| `n8n.ratehunter.net` | `nyra-n8n:5678` |
| `gitea.ratehunter.net` | `nyra-gitea:3000` |
| `grafana.ratehunter.net` | `nyra-grafana:3000` |
| `prometheus.ratehunter.net` | `nyra-prometheus:9090` |
| `cadvisor.ratehunter.net` | `nyra-cadvisor:8080` |
| `openwebui.ratehunter.net` | `nyra-openwebui:8080` |
| `openclaw.ratehunter.net` | `nyra-openclaw:18790` |
| `clawteam.ratehunter.net` | `nyra-clawteam:8080` |
| `paperclip.ratehunter.net` | `nyra-paperclip:3100` |
| `portainer-oracle.ratehunter.net` | `nyra-portainer:9443` |

## Restricted non-HTTP

| Hostname | Origin service | Rule |
|---|---|---|
| `git-ssh.ratehunter.net` | `ssh://nyra-gitea:2222` | Use only with Cloudflare Access SSH clients and explicit owner approval |

## Private-only

Never publish direct DNS or Cloudflared routes for:

- Postgres and service-specific database containers
- Redis and Redis-compatible graph/cache stores
- Qdrant/vector stores
- Worker `vllm`, `ollama`, model cache, and local LiteLLM ports unless Access-gated for a narrowly scoped internal API
- Worker exporter ports `9100` and `9835`
- Raw voice/media transport ports
- Internal MCP bridges such as `infisical-mcp`, `paperclip-mcp`, and `gitea-mcp`

## Enforcement rules

1. Every non-marketing hostname must have an Access policy.
2. Every tunnel config must end with `http_status:404`.
3. Datastores and worker inference backends must stay private.
4. SSH over Cloudflared requires Access SSH client setup, not open public SSH.

## Verification commands

```bash
rg -n "hostname:|service:" infra/hosts/oracle-vps/cloudflared-config.yml
rg -n "postgres|redis|qdrant|vllm|ollama|9835|9100" infra/hosts/oracle-vps/cloudflared-config.yml
```
