# CLAUDE.md

Claude Code CLI rules for Project Nyra.

Claude must read `AGENTS.md` before making changes.

## Required behavior
- Follow `AGENTS.md` as the global project contract.
- Prefer small, verifiable changes.
- Keep implementation aligned with the current Nyra architecture.
- If a step requires a human login or MFA, add it to `docs/OWNER_MANUAL_ACTIONS.md` and continue.

## Serena MCP
Recommended environment when using Serena with Claude Code:

```bash
export MCP_TIMEOUT=60000
export ENABLE_TOOL_SEARCH=true
```

Recommended Serena registration:

```bash
claude mcp add --scope user serena -- \
  uvx --from git+https://github.com/oraios/serena \
  serena start-mcp-server --context=claude-code --project-from-cwd
```

## Config placement
- Global Serena config: `~/.serena/serena_config.yml`
- Project Serena config: `<repo>/.serena/project.yml`
