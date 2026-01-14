# MCP + Services map (Project Nyra)

This repo uses **Claude Code** with an `.mcp.json` file to register **MCP servers** (tools).
Not everything you listed is an MCP server—many are **docker services** (Dify, Open WebUI, Mem0),
or **libraries/CLIs** (agentic-flow, agentdb, epic SDK).

## What goes into `.mcp.json` (Claude Code)
Only tools that can be started as **stdio MCP servers** (or via an MCP bridge) should go here:
- filesystem
- github
- serena
- claude-flow
- ruv-swarm
- flow-nexus
- gemini assistant (optional)

See:
- `config/mcp/.mcp.windows.cmdc.json` (Windows + `cmd /c`)
- `config/mcp/.mcp.no-wrapper.json` (no wrappers / non-Windows shells)

### Where to put it
Copy ONE file to your repo root as `.mcp.json`:
- Windows: copy `config/mcp/.mcp.windows.cmdc.json` → `<repo>/.mcp.json`
- Mac/Linux: copy `config/mcp/.mcp.no-wrapper.json` → `<repo>/.mcp.json`

## What stays in docker-compose (services)
Run these via docker compose (or k8s), not in `.mcp.json`:
- Dify, Open WebUI, n8n, Activepieces
- Nexus Router, LiteLLM, OpenRouter gateway
- Mem0, Letta, Graphiti, FalkorDB/Neo4j, Qdrant
- TwentyCRM

## Known placeholders
`config/mcp/.mcp.template.inventory.json` inventories everything you listed and classifies each item.
Use it as a checklist, not as an executable config.
