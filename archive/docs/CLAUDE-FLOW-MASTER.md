# Claude Flow — Master Guide (Project-Nyra)

This is the condensed, authoritative guide for running and integrating **Claude Flow** inside Project‑Nyra. It unifies the scattered .md files, scripts, and configs under a single flow.

---

## What Claude Flow is in Nyra
Claude Flow serves as one of the two primary orchestration pillars (paired with **Archon MCP**). In Nyra we treat it as:
- a composable workflow engine for Anthropic models,
- a first‑class MCP client/host that can call tools via **MetaMCP** routes,
- a bridge to other frameworks (LangGraph, Autogen2, PraisonAI) through MetaMCP channels.

> If you never open Claude Desktop, that’s fine. We wire Claude Flow through **MetaMCP** and (optionally) the **VS Code Claude Code** extension so you can run everything from terminal/VS Code.

---

## Key Directories (source of truth)
- `nyra-orchestration/Claude/claude-flow-gui-main/` – GUI front‑end project for visual flow authoring.
- `nyra-orchestration/anthropic-agents-sdk/` – utility launchers and SDK stubs used by Claude Flow in Nyra.
- `nyra-infra/metamcp-gateway/` – **the** single MCP entrypoint (proxy + channels).
- `nyra-infra/compose/nyra-mcp-stack.yml` – the compose stack that boots MetaMCP + Nyra Stack + Open WebUI.
- `nyra-infra/metamcp-gateway/channels/agents/` – channel bindings for orchestration engines (Claude Flow, Archon, LangGraph).

---

## Running the Orchestration Stack
1) Populate secrets via Infisical (recommended) or a local `.env` (see `nyra-infra/.env.example`).
2) Boot the core stack:
```powershell
# from repo root
cd nyra-infra
# (optional) pull secrets into a file env for compose
# .\sync-secrets.ps1  # already present in repo to export from Infisical

# bring up MetaMCP + Nyra Stack + Open WebUI
docker compose -f .\compose\nyra-mcp-stack.yml up -d --build
```
3) Visit the GUI surfaces:
- Nyra Stack Orchestrator: `http://localhost:${MANAGER_PORT}`
- Open WebUI: `http://localhost:3000` (wired to MetaMCP endpoints as tools)

---

## Claude Flow → MetaMCP → Tools
Claude Flow connects to MCP tools by targeting the MetaMCP gateway. We ship ready‑made channels:
- `agents/claude-flow.json` – tools Claude Flow can see by default
- `always-on.json` – low/no‑context utilities (e.g., Infisical, filesystem, health)
- `context-hungry.json` – heavy tools (websearch, large embeddings) behind dedicated endpoints
- `research.json` – web, notes, summarizers

You can attach/detach these per‑agent in `metamcp.config.json` with simple channel references.

---

## VS Code (Claude Code) without Claude Desktop
Claude Code supports MCP servers via settings. Run:
```powershell
# Windows: write VS Code user/workspace settings
.\nyra-infra\scripts\apply-vscode-mcp.ps1
```
This injects SSE endpoints that point to your local MetaMCP gateway so **Claude Code** in VS Code gets the same tool surface Claude Flow uses.

> No Claude Desktop subscription required. If you *do* have Claude Desktop, you can also drop the provided `claude_desktop_config.json.example` into your desktop config folder; the schema mirrors the same endpoints.

---

## Tight coupling with Archon MCP
- Archon lives under `nyra-orchestration/archon/` and exposes flows as MCP tools.
- The provided channel `agents/archon.json` publishes Archon’s endpoints through MetaMCP so Claude Flow (and VS Code) can call them.
- Cross‑framework handoffs (Claude Flow ↔ Archon ↔ LangGraph) are routed entirely by MetaMCP channel policy, so you avoid mega‑context sessions.

---

## Common Tasks
- **Start all** orchestration UIs and gateways: `docker compose -f nyra-infra/compose/nyra-mcp-stack.yml up -d --build`
- **Tail logs**: `docker logs -f nyra_metamcp` (or use Open WebUI’s tool wrapper)
- **Rotate secrets**: edit Infisical and re‑run `nyra-infra/sync-secrets.ps1`
- **Add a tool**: drop a new MCP server in the gateway config, assign it to one or more channels under `nyra-infra/metamcp-gateway/channels/`, reload.

---

## Environment Summary (see .env.example)
- `MANAGER_PORT` – Nyra Stack dashboard/API port
- `MCP_PROXY_MODE` – `unified` or `individual`
- `MCP_PROXY_TYPE` – `mcpo` or `mcp-bridge` (for individual)
- `PORT_RANGE_START` / `PORT_RANGE_END` – port allocator bounds
- `CLAUDE_CONFIG_PATH` – optional; if you *do* use Claude Desktop
- `INFISICAL_TOKEN` / `INFISICAL_PROJECT_ID` / `INFISICAL_ENV` – secret sync
- `OPENWEBUI_DATA` – bind mount for Open WebUI data

---

## Where to extend next
- Add team‑specific channels (e.g., `agents/security.json`, `agents/research-highcontext.json`).
- Enable unified audit logs in `nyra-infra/storage/nyra.storage.profile.yml`.
- Add health probes in `metamcp.config.json` and surface them in Nyra Stack panels.
