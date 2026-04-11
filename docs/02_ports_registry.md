# 02 Ports Registry (ACTIVE ONLY)

This registry is generated from the **authoritative post-move runtime set**:
- compose files referenced by active orchestration (`Makefile`, `infra/scripts/nyra`)
- active infra compose files under `infra/compose/` and `infra/hosts/`
- excludes `docs/**`, `_archived/**`, `infra-archived/**`, and `infra/ingest/**`

## Active port map

| Service | Repo path (FINAL) | Compose service name | Container port(s) | Host port(s) | Protocol | Health endpoint | Exposure | Proposed hostname | Cloudflared ingress snippet |
|---|---|---|---|---|---|---|---|---|---|
| Gitea | `docker-compose.gitea.yml` | `gitea` | 3000, 22 | 3100, 2222 | tcp | `/api/healthz` | access-protected (web) + private ssh | `gitea.nyra.example.com` | `- hostname: gitea.nyra.example.com\n  service: http://orchestrator:3100` |
| Infisical | `docker-compose.infisical.yml` | `infisical` | 8080 | 3201 | tcp | `/api/status` | access-protected | `infisical.nyra.example.com` | `- hostname: infisical.nyra.example.com\n  service: http://orchestrator:3201` |
| Archon UI | `infra/compose/docker-compose.archon.yml` | `archon` | 3000 | 3737 | tcp | `/` | access-protected | `archon.nyra.example.com` | `- hostname: archon.nyra.example.com\n  service: http://orchestrator:3737` |
| Nexus Router | `infra/docker-compose.yml` | `nexus-router` | 7000, 8080, 9091 | 7000, 8080, 9091 | tcp | `/health` | access-protected | `nexus.nyra.example.com` | `- hostname: nexus.nyra.example.com\n  service: http://orchestrator:7000` |
| n8n | `infra/hosts/oracle-vps/docker-compose.oracle.yml` | `n8n` | 5678 | 5678 | tcp | `/healthz` | access-protected | `n8n.nyra.example.com` | `- hostname: n8n.nyra.example.com\n  service: http://oracle:5678` |
| Activepieces | `infra/hosts/oracle-vps/docker-compose.oracle.yml` | `activepieces` | 80 | 8080 | tcp | `/` | access-protected | `activepieces.nyra.example.com` | `- hostname: activepieces.nyra.example.com\n  service: http://oracle:8080` |
| Twenty CRM | `infra/hosts/oracle-vps/docker-compose.oracle.yml` | `twenty` | 3000 | 3000 | tcp | `/` | access-protected | `twentycrm.nyra.example.com` | `- hostname: twentycrm.nyra.example.com\n  service: http://oracle:3000` |
| Grafana | `infra/hosts/oracle-vps/docker-compose.oracle.yml` | `grafana` | 3000 | 3003 | tcp | `/api/health` | access-protected | `grafana.nyra.example.com` | `- hostname: grafana.nyra.example.com\n  service: http://oracle:3003` |
| Open WebUI | `infra/docker-compose.yml` | `openwebui` | 8080 | 8088 | tcp | `/health` | access-protected | `openwebui.nyra.example.com` | `- hostname: openwebui.nyra.example.com\n  service: http://orchestrator:8088` |
| CRM API | `docker-compose.crm-api.yml` | `nyra-crm-api` | 4001 | 4001 | tcp | `/health` | private |  |  |
| Ollama worker | `infra/hosts/worker-rtx3060/docker-compose.gpu.yml` | `ollama-server` | 11434 | 11434 | tcp | `/api/tags` | private |  |  |
| vLLM 3090Ti | `infra/hosts/worker-rtx3090ti/docker-compose.gpu.yml` | `vllm-server` | 8000 | 8000 | tcp | `/health` | private |  |  |
| vLLM 5090 | `infra/hosts/worker-rtx5090/docker-compose.gpu.yml` | `vllm-server` | 8000 | 8000 | tcp | `/health` | private |  |  |
| Postgres (core) | `infra/docker-compose.yml` | `postgres` | 5432 | 5432 | tcp | `pg_isready` | private |  |  |
| Redis (core) | `infra/docker-compose.yml` | `redis` | 6379 | 6379 | tcp | `redis-cli ping` | private |  |  |
| Mongo (core) | `infra/docker-compose.yml` | `mongo` | 27017 | 27017 | tcp | `db.adminCommand('ping')` | private |  |  |
| FalkorDB | `infra/hosts/oracle-vps/docker-compose.oracle.yml` | `falkordb` | 6379 | 6381 | tcp | `PING` | private |  |  |

## Safety constraints enforced
- No datastore-like service receives a public hostname.
- No cloudflared ingress snippets are created for datastores.
- Exposure defaults to private unless explicitly a user-facing HTTP app.

See legacy/reference-only entries in `docs/02_ports_registry.appendix_legacy.md`.
