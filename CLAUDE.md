# CLAUDE.md

Claude Code CLI projection for Project Nyra.

`AGENTS.md` is the canonical repo-level operating contract. Claude-specific instructions in this file stay thin: they describe Claude-specific tooling and aliases.

## Required behavior

- Read `AGENTS.md` before changing files.
- Document owner login, MFA, and dashboard tasks in `docs/OWNER_MANUAL_ACTIONS.md`.
- Refer to `docs/MASTER_ARCHITECTURE.md` for deep technical context.

## Serena MCP

Recommended environment for Serena:

```bash
export MCP_TIMEOUT=60000
export ENABLE_TOOL_SEARCH=true
```

## RTK (Rust Token Killer)

**Always prefix commands with `rtk`** to optimize token usage (Git, GH, Pnpm, Test).
Example: `rtk git status && rtk pnpm build`
