# NYRA – Nexus + LiteLLM All‑in‑One Stack (Orchestrator + Workers)

This kit stands up a **single orchestration plane** on your **orchestrator-mini** that:
- uses **grafbase/nexus** as the MCP proxy + fuzzy tool selector
- uses **LiteLLM** as the model broker (cloud + local GPU workers)
- runs shared infra: **Postgres**, **Redis**, **ruvector**, **RuVector**, **Graph (Neo4j or FalkorDB)**, optional **Twenty CRM**
- provides UI: **Open WebUI** + **LobeChat** (optional)
- integrates a **single “Docker MCP Toolkit entrypoint”** so you don’t have to add each toolkit server individually

> Secrets should come from **Infisical** (recommended), but you can also use `.env`.
> This kit includes a master env template and small starter envs.

## Quick start (Orchestrator)
1) Copy `master.example.env` → `.env` (or use Infisical injection)
2) Start the stack:
   - **Core** stack:
     - `docker compose -f docker-compose.nyra.yml --profile core up -d`
   - Add UIs:
     - `docker compose -f docker-compose.nyra.yml --profile ui up -d`
   - Add Twenty CRM (optional):
     - `docker compose -f docker-compose.nyra.yml --profile twenty up -d`
   - Pick ONE graph backend:
     - Neo4j: `--profile graph-neo4j`
     - FalkorDB: `--profile graph-falkor`

## Quick start (Workers)
On each GPU worker, run one of the worker compose files in `./workers/`.
- `worker-ollama.compose.yml` (easy)
- `worker-vllm.compose.yml` (fast OpenAI-compatible)

Then configure LiteLLM on orchestrator via env vars:
- `WORKER_RTX3060_OPENAI_BASE_URL`
- `WORKER_RTX3090TI_OPENAI_BASE_URL`
- `WORKER_RTX5090_OPENAI_BASE_URL`

## File access when orchestrators are containerized
If archon-os/Archon run in Docker, they **cannot** see your host filesystem unless:
- you mount host folders into the container, OR
- you provide a **filesystem MCP server** (recommended) with controlled mounts.

This kit assumes you will expose a **single MCP endpoint** for “Docker Desktop MCP Toolkit”, which internally serves:
- filesystem MCP (with allowed folders mounted)
- docker mcp / docker hub mcp
- any other “simple/general” MCPs you enable

Then **Nexus** only needs one MCP server entry: `docker-toolkit`.

See: `config/nexus/nexus.config.yaml` and `config/mcp-toolkit/toolkit.yaml`.

## What to edit
- `docker-compose.nyra.yml`  (ports, volumes, profiles)
- `config/litellm/litellm.config.yaml` (models + worker endpoints)
- `config/nexus/nexus.config.yaml` (providers + tool routing + fuzzy selection)
- `.env` (prefer Infisical)

---
