# oracle-vps

Last updated: 2026-05-26

## Host Role

oracle-vps is the primary cloud host for Project Nyra. It runs all durable services:
the broker web app backend, TwentyCRM, the quote engine, Activepieces automation,
Gitea source control, the full memory stack (Letta, mem0, Qdrant, FalkorDB), Nexus
Router, Gastown, observability (Prometheus, Loki, Grafana), and the public Cloudflare
tunnel entry point.

This is an Oracle Cloud Infrastructure (OCI) ARM64 Linux VPS — not WSL, not Windows.
Standard Linux Docker operations apply directly; no WSL workarounds needed here.

---

## Network

| Property           | Value                        |
| ------------------ | ---------------------------- |
| Tailscale IP       | 100.64.0.3                   |
| Tailscale hostname | oracle.trex-fiordland.ts.net |
| Arch               | ARM64 (aarch64)              |
| OS                 | Oracle Linux                 |
| Public exposure    | via Cloudflare tunnel only   |

Cloudflare tunnel ID: `ae0bd53a-f22e-4414-8593-5b765dcd044b`
Tunnel token variable: `ORACLE_TUNNEL_TOKEN` (from Infisical — never `TUNNEL_TOKEN`)

---

## Compose Files

| File                                  | Purpose                                                                                                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker-compose.yml`                  | Core network stack: Postgres, Redis, TwentyCRM, Activepieces, n8n, quote services, cloudflared, Prometheus, Loki, Grafana, cAdvisor, OpenLIT, Open WebUI, MCP servers |
| `docker-compose.memory.yml`           | Letta, mem0, FalkorDB, Qdrant, letta-postgres                                                                                                                         |
| `docker-compose.gastown.yml`          | Gastown workspace manager (:8080)                                                                                                                                     |
| `docker-compose.gitea.yml`            | Gitea source control (:3000)                                                                                                                                          |
| `docker-compose.activepieces-mcp.yml` | Activepieces MCP bridge                                                                                                                                               |
| `docker-compose.letta-mcp.yml`        | Letta MCP bridge                                                                                                                                                      |
| `docker-compose.memory-extra.yml`     | Supplemental memory services                                                                                                                                          |
| `docker-compose.clawteam.yml`         | Clawteam agent support                                                                                                                                                |
| `docker-compose.apps.yml`             | Broker web app services                                                                                                                                               |
| `docker-compose.persistent.yml`       | **Portainer CE + Syncthing — NEVER stop**                                                                                                                             |

---

## Key Services Summary

| Service                 | Port               | Notes                                                          |
| ----------------------- | ------------------ | -------------------------------------------------------------- |
| TwentyCRM               | 3000               | Business system of record                                      |
| Nexus Router (Grafbase) | 6000               | MCP/LLM aggregator                                             |
| Gastown                 | 8080               | Workspace manager                                              |
| LiteLLM                 | 4000               | LLM routing to workers                                         |
| Letta                   | 8283               | Agent orchestration                                            |
| Letta MCP               | 8284               | Local MCP bridge to Letta                                      |
| mem0                    | 5001               | Memory REST API                                                |
| OpenMemory MCP          | 8765               | Memory inspection MCP/API                                      |
| MemOS API               | 8001               | MemoryTensor/MemOS API                                         |
| MemOS MCP               | 8095               | MemoryTensor/MemOS MCP SSE endpoint                            |
| MemPalace MCP           | 8002               | MemPalace containerized MCP runtime                            |
| Qdrant                  | internal 6333/6334 | Vector memory; bound only when `ORACLE_TAILSCALE_IP` allows it |
| FalkorDB                | internal 6379      | Graph memory; bound only when `ORACLE_TAILSCALE_IP` allows it  |
| Prometheus              | 9090               | Metrics                                                        |
| Grafana                 | 3001               | Dashboards                                                     |
| Loki                    | 3100               | Logs                                                           |
| Portainer CE            | 9000/9443          | Container management                                           |
| Gitea                   | 3000 (gitea)       | Source control                                                 |
| quote-api               | 8090               | Quote REST API                                                 |
| quote-engine            | 8095               | Quote processing engine                                        |

---

## Deploy / Restart

```bash
# SSH to oracle-vps
ssh user@100.64.0.3

# Bring up core stack
cd infra/hosts/oracle-vps
docker compose -f docker-compose.yml up -d

# Bring up memory stack
docker compose -f docker-compose.memory.yml up -d

# Bring up Gastown
docker compose -f docker-compose.gastown.yml up -d

# Check all containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Or operate remotely via Docker context from orchestrator
docker --context oracle-vps compose -f docker-compose.yml up -d
```

---

## Cloudflare Tunnel Setup

The cloudflared container in `docker-compose.yml` uses `ORACLE_TUNNEL_TOKEN` from
Infisical to establish the tunnel. DNS records are managed in Cloudflare dashboard.

If the tunnel goes down:

1. `docker compose restart cloudflared`
2. If token expired: renew in Infisical → redeploy secrets-init → restart cloudflared
3. See `docs/ops/INCIDENT_RESPONSE_RUNBOOK.md` for full tunnel-down procedure.

---

## Known Gotchas

- **ARM64**: All Docker images must support `linux/arm64`. Verify before adding new images.
  Use `--platform linux/arm64` in Dockerfile FROM lines or ensure multi-arch images.
- **Infisical token**: oracle-vps does not require `INFISICAL_TOKEN` in `.zshrc` —
  the secrets-init sidecar bootstraps via compose. Only orchestrator and worker-rtx5090
  need `.zshrc` bootstrap tokens.
- **Port conflicts**: Gitea and TwentyCRM both want port 3000 — they run in separate
  compose profiles/networks; check compose project names before deploying both.
- **Never use generic `TUNNEL_TOKEN`**: always `ORACLE_TUNNEL_TOKEN`.
- **Persistent stack**: never stop `docker-compose.persistent.yml` (Portainer CE + Syncthing).
