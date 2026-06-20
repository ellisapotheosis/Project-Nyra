# Claude Desktop vs Claude Code vs MetaMCP (Nyra FAQ)

**Do I need Claude Desktop?** No. Nyra routes MCP through **MetaMCP** so you can use VS Code (Claude Code), terminal, or Open WebUI.

**What does Desktop buy me?** A polished chat UX with built‑in MCP wiring. If your Anthropic account doesn’t allow Desktop, skip it — you can still consume the same tools via MetaMCP SSE endpoints.

**Can I use Claude Desktop configs without the app?** The schema is simple JSON. We mirror the same endpoints in VS Code settings (see `nyra-infra/scripts/apply-vscode-mcp.ps1`). If you later install Desktop, you can drop an equivalent config in `~/.claude/`.

**How does this help Claude Flow?** Claude Flow just needs the MetaMCP routes. Once MetaMCP is up, Claude Flow and VS Code both see the same tools and channels.

**Where do I edit channels?** `nyra-infra/metamcp-gateway/channels/` — keep heavy, context‑hungry tools isolated and always‑on utilities separate so you’re never forced into ultra‑heavy sessions.
