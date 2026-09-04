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
container_name: ${COMPOSE_PROJECT_NAME:-nyra}-worker-5090-vllm
```

## Host Inventory

There are exactly **two** active GPU workers. The third GPU worker
(an RTX 3060, tailnet address `.12`) has been **retired and sold**. It is not a standby, a
fallback, a Wake-on-LAN target, an embedding host, or a deployment target. Do
not reintroduce it.

| Host             | Tailnet IP    | Role                                                                | Canonical Compose                          |
| ---------------- | ------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| oracle-vps       | `100.64.0.3`  | Control plane — LiteLLM gateway, OmniRoute, CRM, DB, memory plane, cloudflared ingress. **aarch64.** | root `compose.yaml` profile `oracle`       |
| worker-rtx5090   | `100.64.0.11` | Primary vLLM inference (**24 GB VRAM, measured**) + LMCache Redis + embedding endpoint | root `compose.yaml` profile `worker-5090`  |
| worker-rtx3090ti | `100.64.0.13` | Secondary vLLM inference (24 GB VRAM). Offline since ~2026-07-27.   | root `compose.yaml` profile `worker-3090ti`|

The canonical deployment surface is the **root `compose.yaml`** with host
profiles, driven by `scripts/deploy/deploy-{oracle,worker-5090,worker-3090ti,all}.sh`.
The per-host overlay files under `hosts/` are being reconciled into it and are
no longer the source of truth for the control plane.

> The 5090 was previously documented here as 32 GB and elsewhere as 48 GB. Both
> were wrong. `nvidia-smi` reports **24463 MiB** (RTX 5090 Laptop GPU). Size all
> inference for 24 GB.

## Oracle-VPS Overlay Files

| File                                  | Purpose                                                    |
| ------------------------------------- | ---------------------------------------------------------- |
| `docker-compose.memory.yml`           | Letta + mem0 + FalkorDB + Qdrant (canonical memory plane)  |
| `docker-compose.oracle.yml`           | Paperclip, SearXNG, Browserless                            |
| `docker-compose.apps.yml`             | Next.js webapp + Nexus UI                                  |
| `docker-compose.forgejo.yml`          | Forgejo + Forgejo DB                                       |
| `docker-compose.letta-mcp.yml`        | Letta MCP bridge                                           |
| `docker-compose.memory-extra.yml`     | Optional memory companions (memos, claudemem)              |
| `docker-compose.clawteam.yml`         | Legacy Oracle ClawTeam definition; primary is orchestrator |
| `docker-compose.paperclip.yml`        | Paperclip MCP gateway (build from images/paperclip/)       |
| `docker-compose.activepieces-mcp.yml` | ActivePieces MCP                                           |
| `docker-compose.restoration.yml`      | Restoration services (llxprt-bridge, activepieces-mcp)     |

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
