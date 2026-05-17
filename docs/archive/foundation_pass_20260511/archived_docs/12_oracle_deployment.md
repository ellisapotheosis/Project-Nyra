# 12 Oracle Deployment

Updated: 2026-04-30

## Primary compose

| Purpose              | File                                                    |
| -------------------- | ------------------------------------------------------- |
| Full Oracle stack    | `infra/hosts/oracle-vps/docker-compose.yml`             |
| Gitea CI/CD stack    | `infra/hosts/oracle-vps/docker-compose.gitea.yml`       |
| App overlay          | `infra/hosts/oracle-vps/docker-compose.apps.yml`        |
| Clawteam overlay     | `infra/hosts/oracle-vps/docker-compose.clawteam.yml`    |
| Agent memory overlay | `infra/hosts/oracle-vps/docker-compose.agentmemory.yml` |

## Always-on services

| Service group               | Services                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| CRM and workflow            | `twenty`, `twenty-worker`, `twenty-mcp`, `activepieces`, `n8n`, `crm-api`, `campaign_engine` |
| Quote and document handling | `quote-api`, `quote_engine`, `paperclip`, `paperclip-mcp`                                    |
| CI/CD                       | `gitea`, `gitea-runner`, `github-mirror-sync`, `gitea-mcp`                                   |
| Observability               | `prometheus`, `loki`, `grafana`, `cadvisor`                                                  |
| Runtime memory              | `mem0-rest`, `falkordb`, `qdrant`, `letta`, `mem-os`, `openmemory-mcp`, `mempalace-mcp`      |
| Operations                  | `cloudflared`, `portainer-edge-agent`, `syncthing` profile                                   |

## Key ports

| Service        |        Port(s) |
| -------------- | -------------: |
| Twenty         |         `3000` |
| Gitea          | `3001`, `2222` |
| n8n            |         `5678` |
| Activepieces   |   `8080 -> 80` |
| Grafana        | `3003 -> 3000` |
| Prometheus     |         `9090` |
| Open WebUI     | `8088 -> 8080` |
| Quote API      |         `7070` |
| CRM API        |         `4001` |
| Paperclip      | `3111 -> 3100` |
| Oracle Nexus   | `6000 -> 3000` |
| OpenMemory MCP |         `8765` |
| Letta          |         `8283` |
| memOS          |         `8085` |

## Cloudflared package

Use `docs/cloudflared/` for the current `ratehunter.net` public hostname
package. The canonical public app hostnames are:

| Hostname                       | Service      |
| ------------------------------ | ------------ |
| `nyra.projectnyra.com`         | WebApp       |
| `crm.projectnyra.com`          | Twenty CRM   |
| `n8n.projectnyra.com`          | n8n          |
| `activepieces.projectnyra.com` | Activepieces |
| `nexus.projectnyra.com`        | Oracle Nexus |
| `grafana.projectnyra.com`      | Grafana      |
| `paperclip.projectnyra.com`    | Paperclip    |

## Placement rationale

Oracle is the always-on host for services that need durable availability when the local workstation or GPU workers are offline. This includes Git hosting, Actions runners, business apps, observability, document handling, and edge tunnel execution.

## Makefile operations

```bash
make up-oracle
make oracle-apps-up
make cicd-up
make cicd-health
make cicd-logs
make paperclip-up
```

## Preflight checklist

- [ ] `.env.gitea` exists on Oracle for `docker-compose.gitea.yml`.
- [ ] Oracle Docker context or SSH target is reachable.
- [ ] Cloudflared token exists in Infisical or host environment.
- [ ] Public hostnames match `docs/cloudflared/hostname-matrix.md`.
- [ ] Public hostnames are Access-gated except marketing Pages.
- [ ] Datastore ports are firewalled from the public internet.

## Post-deploy checklist

- [ ] `make cicd-health` passes.
- [ ] `docker --context oracle compose -f infra/hosts/oracle-vps/docker-compose.yml ps` shows expected services.
- [ ] Gitea UI and runner are healthy.
- [ ] `github-mirror-sync` logs show successful mirror activity.
- [ ] Cloudflared tunnel ends with a catch-all 404 route.

## Known cleanup item

The Oracle compose still contains services that conflict with current architecture rules. Treat those entries as cleanup work before production hardening.
