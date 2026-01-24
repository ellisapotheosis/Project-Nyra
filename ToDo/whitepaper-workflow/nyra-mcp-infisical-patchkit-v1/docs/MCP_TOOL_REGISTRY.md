# MCP Tool Registry (Nyra)

Route all tools through **Nexus Router**.

## Zones
- DEV: filesystem write access, docker control tools (never in prod borrower env)
- OPS: CRM tools, scheduling, messaging connectors (prod; approval-gated)
- BORROWER: minimal tool surface (read status, request docs, schedule)

## Recommended MCP servers
- GitHub MCP Server (repo/issues/PRs automation)
- Filesystem MCP (dev only, allowlisted dirs)
- Docker Hub MCP (image discovery)
- Docker MCP Gateway/Toolkit (optional dev convenience)
- Serena MCP (semantic code retrieval/editing; LSP-based)
- Archon MCP (project knowledge/tasks; internal-only)
- Activepieces MCP (connectors exposed as tools)

## Governance rules
- Borrower apps get a hard allowlist (no filesystem/docker/github)
- Internal dev agents can access Serena + filesystem + github
