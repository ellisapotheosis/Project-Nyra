# Project Nyra Orchestrator — Deploy (Docker Desktop + WSL2)

This `infra/orchestrator` stack is written for **Windows + Docker Desktop (WSL2 backend)**, not native Docker Engine inside WSL.

## Ground rules (important)
- **Docker Desktop on Windows** is the container runtime
- **WSL2** is the Linux execution environment for Docker Desktop
- You can run `docker compose` from **PowerShell** or from your **WSL shell**
- Best performance is usually achieved if the repo lives inside the WSL filesystem (`~/code/...`), not `C:\...`

## Authoritative inputs used in this package
- **`infra/docs/PORTS-REGISTRY.txt`** (from your uploaded `ports.txt`) is treated as the latest port/IP source of truth
- Standalone uploaded compose/config files were copied into `infra/_ingested_uploads/` for audit/reference
- This package intentionally removes or excludes:
  - Dify
  - Open WebUI
  - LobeChat
  - Mem0 / OpenMemory MCP
  - OpenRouter (as requested)

## What this orchestrator stack includes
- **Nexus (Grafbase)**
  - Single LLM + MCP entrypoint/proxy aggregator (`:6000`)
  - Fuzzy tool search enabled
  - Routes to LiteLLM and MCP backends
- **LiteLLM**
  - Routes to worker GPUs (vLLM on 5090 + 3090 Ti) and Ollama on 3060
- **Archon OS (split containers)**
  - api / server / agents / os / mcp / ui placeholders wired
- **Claude Flow stack**
  - brain + cicd + modules container set
  - ruvector-postgres + module placeholders (agentdb, agentic-flow, epic-sdk, agent-booster, ruv-swarm, onnx)
- **Memory / graph / data**
  - Letta, Graphiti MCP, FalkorDB, Redis, MongoDB, PostgreSQL, Qdrant
- **Workflows**
  - n8n, n8n-mcp, Activepieces
- **CRM**
  - Twenty CRM + Twenty MCP placeholder adapter
- **OpenClaw / ClawHub (MoltBot path)**
  - web/api/worker wrapper containers + MCP adapter placeholder
- **Observability**
  - Prometheus, Grafana, Loki, Promtail, cAdvisor
- **Ops**
  - Infisical, pgAdmin

## Prereqs (Windows host)
1. Install Docker Desktop and enable **WSL2 engine**
2. Enable Docker Desktop WSL integration for your distro
3. Install Tailscale and verify MagicDNS / node reachability
4. (Optional but recommended) Install NVIDIA driver on orchestrator too if you’ll run any GPU-sidecars (not required for this stack)

## Bring up the orchestrator
```bash
cd infra/orchestrator
cp ../configs/env/.env.orchestrator.example .env
# Edit .env secrets and provider keys before first run
make up
```

### If your Docker Compose version does not support `include:`
The Makefile auto-falls back to a multi-file invocation.

## Start with OpenClaw / ClawHub profile too
```bash
make openclaw
```

## Start Claude Flow dev module swarm too
```bash
make claude-flow-dev
```

## Recommended startup order across all PCs
1. Worker 5090 (`infra/worker-rtx5090`)
2. Worker 3090 Ti (`infra/worker-rtx3090ti`)
3. Worker 3060 (`infra/worker-rtx3060`)
4. Orchestrator (`infra/orchestrator`)
5. Validate LiteLLM → workers, then Nexus → LiteLLM, then agents/apps → Nexus

## Endpoint summary (from ports doc + package defaults)
- Nexus (LLM + MCP entrypoint): `http://orchestrator.tail-net.ts.net:6000`
- Archon API: `:4000`
- Archon UI: `:3737`
- Archon MCP: `:8051`
- LiteLLM: `:4001`
- n8n: `:5678`
- Grafana: `:3000`
- Prometheus: `:9090`
- Loki: `:3100`
- Infisical: `:8080`
- pgAdmin: `:5050`
- Twenty CRM: `:3006`
- ClawHub UI/API (wrapper defaults): `:3010 / :3011`

## Notes on placeholder wrappers
Some ecosystems (Archon split images, Twenty MCP variants, OpenClaw/ClawHub self-hosting, some Claude Flow modules) change frequently or publish multiple images/packages. This package gives you:
- Compose wiring
- Port reservations
- Volumes, healthchecks, networks
- Environment templates
- Dockerfiles/entrypoints you can pin and harden

As you confirm exact upstream images/commands in your repo, replace the placeholder wrappers one-by-one without changing the overall topology.
