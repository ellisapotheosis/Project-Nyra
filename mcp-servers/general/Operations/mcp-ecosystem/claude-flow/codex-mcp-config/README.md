# Codex MCP Config (.codex.toml)

This package contains a ready-to-drop-in `.codex.toml` for the VS Code Codex extension,
converted from your Claude-flow style JSON into the TOML format Codex expects.

## Where to place it
- Recommended path on Windows: `C:\Users\edane\.codex\config.toml` or `.codex.toml` in your workspace root.
- If using a workspace-specific config, put the file at the root of that repo/folder.

## Environment variables you must set
- `NOTION_TOKEN` (for the HTTP Notion MCP)
- `WORKSPACE_ROOT` (optional; defaults to current workspace when `${WORKSPACE_ROOT:.}` is used)
- `ARCHON_MCP_MODULE` (e.g., `archon_mcp.server` or your module path)
- `MCP_USE_PACKAGE` (e.g., `@your-scope/mcp-use`)
- `TOME_MCP_PACKAGE` (e.g., `@your-scope/tome-mcp`)
- `GOFASTMCP_PACKAGE` (e.g., `@your-scope/gofastmcp`)
- `ACTIVEPIECES_MCP_PACKAGE` (e.g., `@activepieces/mcp`)
- `PULSE_FILESYSTEM_PACKAGE` (e.g., `@your-scope/pulse-fs-mcp`)

> For `npx`, this config includes `-y` so it won't prompt on first run.

## Notes on transports and commands
- Most servers run via stdio with `command = "npx"`.
- The Notion entry uses `transport = "http"` with `url` and `headers` for auth.
- Items like `mcp-use`, `tome`, `gofastmcp`, `activepieces`, and `pulse-fs` use package names
  provided by env vars so you can swap implementations without editing the TOML.

## Quick test checklist
1. Open VS Code with the Codex extension enabled.
2. Ensure the required environment variables are available in the VS Code process:
   - System-wide: Environment Variables in Windows
   - Or start VS Code from a terminal session where they’re exported (`setx` for persistence).
3. Run the "Codex: Reload Config" command (if available).
4. Open the Codex sidebar and verify the servers appear and can be pinged.

## Troubleshooting
- If an `npx`-launched server fails the first time, VS Code may need to be restarted
  after `npx` installs the package into the cache.
- Confirm Python is on PATH for the `archon` server (`python -V` in a terminal).
- If an HTTP server returns authorization errors, re-check your `NOTION_TOKEN`.
