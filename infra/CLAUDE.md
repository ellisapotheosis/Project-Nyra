# infra/ — Canonical Structure & Agent Rules

## The Law: Where Things Live

| Type                           | Canonical Location                              | Example                                      |
| ------------------------------ | ----------------------------------------------- | -------------------------------------------- |
| Docker Compose (primary)       | `hosts/<hostname>/docker-compose.yml`           | `hosts/oracle-vps/docker-compose.yml`        |
| Docker Compose (overlay)       | `hosts/<hostname>/docker-compose.<purpose>.yml` | `hosts/oracle-vps/docker-compose.memory.yml` |
| Dockerfiles & build contexts   | `images/<image-name>/Dockerfile`                | `images/clawteam/Dockerfile`                 |
| Service runtime configs        | `configs/<service>/`                            | `configs/litellm/config.yaml`                |
| Operational scripts            | `scripts/<category>/`                           | `scripts/bootstrap/setup.sh`                 |
| Environment / secret files     | `env/`                                          | `env/nyra.env.example`                       |
| Env overlays per environment   | `env/environments/<env>/`                       | `env/environments/production/`               |
| Infrastructure docs            | `docs/`                                         | `docs/cloudflared/README.md`                 |
| App configs (waveterm, zellij) | `configs/<app>/`                                | `configs/waveterm/settings.json`             |
| Cloudflare IaC                 | `cloudflare/`                                   | `cloudflare/desired-state/`                  |
| Archived / deprecated          | `cleanup_archive/`                              | `cleanup_archive/workers/`                   |

## Container Naming Convention (MANDATORY)

Every `container_name:` field MUST use the variable pattern:

```yaml
container_name: ${COMPOSE_PROJECT_NAME:-nyra}-<service-name>
```

NEVER hardcode `nyra-<service>` directly. The variable prefix allows renaming the project
without touching compose files and prevents collisions between stacks.

Worker-scoped containers may append the worker identity after the prefix:

```yaml
container_name: ${COMPOSE_PROJECT_NAME:-nyra}-worker-3060-ollama
```

## Host Inventory

| Host             | Role                                                       | Primary Compose                             |
| ---------------- | ---------------------------------------------------------- | ------------------------------------------- |
| oracle-vps       | Cloud backend — CRM, DB, memory plane, public ingress      | `hosts/oracle-vps/docker-compose.yml`       |
| orchestrator     | Control plane — LiteLLM, Nexus router, observability       | `hosts/orchestrator/docker-compose.yml`     |
| worker-rtx3060   | Ollama inference (12 GB VRAM), distributed-voice STT       | `hosts/worker-rtx3060/docker-compose.yml`   |
| worker-rtx3090ti | vLLM inference (24 GB VRAM), distributed-voice TTS         | `hosts/worker-rtx3090ti/docker-compose.yml` |
| worker-rtx5090   | Primary vLLM inference (32 GB VRAM), distributed-voice LLM | `hosts/worker-rtx5090/docker-compose.yml`   |

## Oracle-VPS Overlay Files

| File                                  | Purpose                                                   |
| ------------------------------------- | --------------------------------------------------------- |
| `docker-compose.memory.yml`           | Letta + mem0 + FalkorDB + Qdrant (canonical memory plane) |
| `docker-compose.oracle.yml`           | Gastown replacement note, SearXNG, Browserless            |
| `docker-compose.apps.yml`             | Next.js webapp + Nexus UI                                 |
| `docker-compose.gitea.yml`            | Gitea + Gitea DB                                          |
| `docker-compose.letta-mcp.yml`        | Letta MCP bridge                                          |
| `docker-compose.memory-extra.yml`     | Optional memory companions (memos, claudemem)             |
| `docker-compose.clawteam.yml`         | ClawTeam primary node (oracle)                            |
| `docker-compose.gastown.yml`          | Gastown workspace manager                                 |
| `docker-compose.activepieces-mcp.yml` | ActivePieces MCP                                          |
| `docker-compose.restoration.yml`      | Restoration services (llxprt-bridge, activepieces-mcp)    |

## Voice Setup Topology

Two Kyutai Unmute configurations exist side-by-side per worker:

### Setup 1 — Standalone (one complete instance per worker)

Each worker runs a fully self-contained Unmute instance.

```bash
# On any worker:
docker compose -f docker-compose.voice.yml up -d
```

### Setup 2 — Distributed (one session across all three workers, ~300-400ms latency)

GPU work is pipelined by role across the three workers:

- **worker-rtx3060** — STT (speech-to-text, lighter VRAM)
- **worker-rtx3090ti** — TTS (text-to-speech, moderate VRAM)
- **worker-rtx5090** — LLM (heaviest inference, RTX 5090)

```bash
# Start all three simultaneously (Tailscale mesh connects them):
# On worker-rtx3060:   docker compose -f docker-compose.distributed-voice.yml up -d
# On worker-rtx3090ti: docker compose -f docker-compose.distributed-voice.yml up -d
# On worker-rtx5090:   docker compose -f docker-compose.distributed-voice.yml up -d
```

## Memory Stack (Oracle VPS — CRITICAL)

The Letta + mem0 + FalkorDB + Qdrant memory plane lives exclusively in:
`hosts/oracle-vps/docker-compose.memory.yml`

**The mem0+FalkorDB integration uses a custom community plugin** that enables FalkorDB
as mem0's graph database backend. This is intentional and non-standard. Do NOT:

- Remove FalkorDB from the memory stack
- Change mem0's graph backend configuration
- Duplicate these services into docker-compose.yml (already cleaned up)

## Secrets / Infisical

The infisical-secrets-init image lives at `images/infisical-secrets-init/`.
Build context in compose files must be `../../images/infisical-secrets-init`.

Two roles:

- `secrets-init` — runs once at startup, writes secrets to volume
- `infisical-agent` — sidecar that polls and refreshes secrets

## Persistent Services Architecture (CRITICAL)

Portainer and Syncthing are managed by **`docker-compose.persistent.yml`** on EACH host.
These are deployed with `make persistent-up` (or per-host variants) and use `restart: always`.

**NEVER** include portainer or syncthing in any canonical `docker-compose.yml` or overlay.
**NEVER** call `make persistent-down` — these services must run 24/7 indefinitely.

| Host             | Services                                   | Compose                         |
| ---------------- | ------------------------------------------ | ------------------------------- |
| orchestrator     | portainer-edge-agent + syncthing           | `docker-compose.persistent.yml` |
| oracle-vps       | portainer-CE + portainer-agent + syncthing | `docker-compose.persistent.yml` |
| worker-rtx3060   | portainer-edge-agent + syncthing           | `docker-compose.persistent.yml` |
| worker-rtx3090ti | portainer-edge-agent + syncthing           | `docker-compose.persistent.yml` |
| worker-rtx5090   | portainer-edge-agent + syncthing           | `docker-compose.persistent.yml` |

**Volume pinning**: All syncthing/portainer volumes use explicit `name:` fields so they
NEVER get orphaned when compose project names change. Orchestrator syncthing uses
`external: true, name: orchestrator_syncthing_config` to preserve existing settings.
Workers bind-mount `/home/ellisapotheosis:/var/syncthing` (config lives in home dir).

**Portainer CE lives on oracle only** (ports 9000/9443 HTTP/HTTPS, 8050 edge tunnel).
All other hosts run portainer-edge-agent only.

## What Agents Must NOT Do

1. Move compose files out of `hosts/<hostname>/` to any other location
2. Create new top-level directories in `infra/` without updating this file
3. Hardcode `nyra-` in `container_name` — always use `${COMPOSE_PROJECT_NAME:-nyra}-`
4. Delete or move `configs/waveterm/` or `configs/zellij/` — active user configurations
5. Delete `docker-compose.distributed-voice.yml` from any worker — Setup 2 needs all three
6. Place Dockerfiles anywhere other than `images/<name>/Dockerfile`
7. Place `.env` / config files in `infra/` root — use `env/` or `configs/`
8. Merge the memory stack services back into the main `docker-compose.yml`
9. Reference `infra/docker/` or `infra/infisical-secrets-init/` in build contexts — both moved to `images/`
10. Add portainer or syncthing to any canonical `docker-compose.yml` — use `docker-compose.persistent.yml`
11. Run `make down` targets that include persistent services — they must NEVER be stopped by automation
