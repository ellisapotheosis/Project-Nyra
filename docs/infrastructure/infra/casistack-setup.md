# Casistack MCP OpenWebUI Orchestrator

Runs an MCP-to-OpenAPI proxy manager with unified or individual mode and a management dashboard on :3001. The service reads Claude Desktop MCP config from `nyra-infra/metamcp-gateway/claude_desktop_config.json`. Configure env keys in `.env.master.example` or via Infisical.

**Unified mode** exposes route-based endpoints (e.g., `/letta`, `/memory`) on the base port. **Individual mode** uses per-server ports in the defined range.
