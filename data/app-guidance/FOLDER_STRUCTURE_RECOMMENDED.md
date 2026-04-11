# Recommended folder structure (Project Nyra)

This keeps “your code” separate from “vendored forks/tools”, while still being easy to containerize.

```
project-nyra/
  apps/                       # Your UI (Next.js: admin + borrower portal)
  services/                   # Your APIs (quote-api, campaign-engine, etc.)
    vendor/                   # Your forked orchestrators (containerized later)
      claude-flow/            # github.com/ellisapotheosis/claude-flow
      archon/                 # github.com/ellisapotheosis/archon
  infra/                      # docker-compose, nexus, litellm, databases
  vendor/
    mcp/                      # MCP servers you clone (dev tooling)
      mcp-gemini-assistant/
    devtools/
      Claude-Code-Development-Kit/
  bootstrap/                  # bootstrap overlays + scripts (this kit lives here)
  docs/                       # consolidated documentation (source of truth)
  .claude/                    # created by Claude Code Development Kit (repo-root)
  .mcp.json                   # (optional) Claude Code project MCP config
```

## Why `.claude/` must be at the repo root
Claude Code looks for `.claude/commands` and `.claude/hooks` in the project root.
So the Claude Code Development Kit should be installed into `project-nyra/` directly.
