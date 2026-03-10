# Archon OS Readiness Guide (Consolidated)

This guide reflects the current repo state after consolidation and fixes the previous missing-source build blocker.

## What Was Fixed

- `services/archon-os/src` is now populated from the upstream Archon Python source tree.
- `services/archon-os/docker/Dockerfile.server`, `Dockerfile.mcp`, and `Dockerfile.agents` are aligned with upstream service definitions.
- `services/archon-os/docker/Dockerfile.archon-os` is patched to run a valid FastAPI entrypoint (`src.server.main:app`) on port `9001`.

## One-Command Bootstrap + Standup

```bash
cd /mnt/c/Users/edane/project-nyra
./infra/scripts/archon/standup_archon_stack.sh
```

Optional:

```bash
ENABLE_ARCHON_AGENTS=false ./infra/scripts/archon/standup_archon_stack.sh
```

## Source Refresh (if needed)

```bash
cd /mnt/c/Users/edane/project-nyra
ARCHON_SOURCE_GIT=https://github.com/coleam00/Archon.git \
ARCHON_SOURCE_REF=main \
./infra/scripts/archon/bootstrap_archon_source.sh
```

## Health Checks

```bash
curl -fsS http://localhost:9001/health   # archon-os
curl -fsS http://localhost:8181/health   # archon-server
curl -fsS http://localhost:8051/health   # archon-mcp
curl -fsS http://localhost:8052/health   # archon-agents (if enabled)
```

## Compose Targets

Archon is split across five modules in:

- `infra/compose/docker-compose.archon.yml`
- `archon-os`
- `archon-server`
- `archon-mcp`
- `archon-agents`
- `archon-ui`
