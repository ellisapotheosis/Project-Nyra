# Nyra Orchestration — Integration Master

This doc stitches Claude Flow, Archon MCP, LangGraph, Anthropic Agents SDK, CASIStack Orchestrator, Open WebUI, and MetaMCP into a single mental model.

## The Spine
- **MetaMCP Gateway** (`nyra-infra/metamcp-gateway/`) is the single point of entry. Everything becomes an MCP tool behind it.
- **CASIStack Orchestrator** exposes a dashboard and a management API on `${MANAGER_PORT}` to launch/stop individual MCP servers (unified vs individual mode).
- **Open WebUI** provides a chat/agent front-end that can hit MetaMCP tools, great for “Docker AI” and operational control.

## The Orchestrators
- **Claude Flow** – visual authoring / flow runner. Connects to MetaMCP channels (see `agents/archon-os.json`).
- **Archon MCP** – rule‑graph and ritual‑graph executor. Published via `agents/archon.json`.
- **LangGraph** – graph runtime used for long‑running stateful agents; surfaced via `agents/langgraph.json`.
- **Anthropic Agents SDK** – lightweight programmatic agents; either embedded inside Claude Flow nodes or exposed as MCP tools via MetaMCP.

## Channel Discipline
- **always‑on**: stateless, low‑context utilities (Infisical, fs, health, docker).
- **context‑hungry**: isolation endpoint for heavy web+retrieval tools.
- **research**: curation + summarization stack.
- **agents/**: orchestration surfaces (claude‑flow, archon, langgraph).

Attach channels per client (Claude Flow, VS Code Claude Code, Open WebUI) to control blast radius and cost.

## Start / Stop Everything
```bash
cd nyra-infra
docker compose -f ./compose/nyra-mcp-stack.yml up -d --build
# stop
docker compose -f ./compose/nyra-mcp-stack.yml down
```

## Secret Injection
- Preferred: `nyra-infra/sync-secrets.ps1` to export to `.env` from **Infisical**.
- Compose consumes `.env` automatically; servers read env at boot.
- For live rotation, re‑run sync and restart affected services.

## Health + Logs
- CASIStack dashboard on `${MANAGER_PORT}` shows which MCP servers are up.
- `docker ps`, `docker logs -f <svc>` for raw detail.
- Open WebUI includes administration tools to list containers if Docker socket is mounted (optional).

## Next
- Add Prometheus/Grafana sidecar for unified metrics.
- Wire Qdrant/Postgres/Redis backends here once the data plane is ready.
