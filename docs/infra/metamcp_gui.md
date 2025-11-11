# MetaMCP + CASIStack Orchestrator GUI

This integrates [MetaMCP](https://github.com/metatool-ai/metamcp) as the aggregator with the CASIStack MCP OpenWebUI Orchestrator as a GUI to start/stop and expose OpenAPI endpoints.

## Compose files
- `nyra-infra/compose/compose.metatool.yml` → runs MetaMCP on port `12008` (see `env/metamcp.env.example`).
- `nyra-infra/compose/compose.casistack.yml` → builds and runs CASIStack manager (ports `3001` and `4200-4300`).

## Environment (Infisical friendly)
- CASIStack: see `.env.casistack.example`
- MetaMCP: see `env/metamcp.env.example`

> MetaMCP supports referencing container env vars in server configs using `${VAR_NAME}` which works well with Infisical-managed environment injection.

## Channels / Namespaces
- `namespaces.json` groups always-on vs context-hungry servers.
- `endpoints.example.json` maps namespaces → public SSE endpoints suitable for OpenWebUI or Claude Desktop.
- `claude_desktop_config.json.example` shows how to register these endpoints in Claude Desktop.

## Quick start
```powershell
# From repo root
cd nyra-infra/compose
# 1) MetaMCP
copy .\env\metamcp.env.example .\env\metamcp.env
# (fill env via Infisical)
docker compose -f compose.metatool.yml up -d

# 2) CASIStack Orchestrator
copy .env.casistack.example .env
# ensure CLAUDE_CONFIG_PATH points to your config file
docker compose -f compose.casistack.yml up -d --build

# 3) GUI
..\scripts\start-mcp-dashboard.ps1
```

Then add the three SSE endpoints to OpenWebUI external tool servers.
