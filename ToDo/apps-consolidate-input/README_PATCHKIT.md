# Nyra MCP + Infisical Patch Kit (v1)

This kit adds:
- MCP configs (`config/mcp/`)
- Infisical export/run scripts (`scripts/infisical/`)
- Safe repo consolidation helper (`scripts/repo/`)
- A master SPARC batch prompt (`prompts/claude-flow/NYRA_MASTER_SWARM.md`)

## Apply
1) Copy files into your Project-Nyra repo (merge folders).
2) Choose your MCP config and copy to repo root as `.mcp.json`.
3) Start MCP servers via Claude Code, then run:
   `npx claude-flow sparc batch "prompts/claude-flow/NYRA_MASTER_SWARM.md"`

## Notes
- Some listed components are services/libraries, not MCP servers.
  See `docs/MCP_STACK_MAP.md`.
