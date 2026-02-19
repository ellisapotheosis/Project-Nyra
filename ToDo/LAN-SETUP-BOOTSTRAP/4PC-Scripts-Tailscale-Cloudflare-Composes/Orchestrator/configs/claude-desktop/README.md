# Claude Desktop Configuration Templates

This directory contains configuration templates for integrating Claude Desktop with Project Nyra's orchestration system.

## Files

### 1. claude_desktop_config.json

Main MCP (Model Context Protocol) server configuration for Claude Desktop.

**Purpose**: Defines all MCP servers that Claude Desktop will connect to, including:
- Claude Flow V3 orchestration
- File system operations
- Git integration
- Memory storage
- Optional services (GitHub, database, search)

**Template Variables**:
- `${PROJECT_ROOT}` - Absolute path to Project Nyra root directory
- `${GITHUB_TOKEN}` - GitHub personal access token (optional)
- `${POSTGRES_CONNECTION_STRING}` - Database connection string (optional)
- `${BRAVE_API_KEY}` - Brave search API key (optional)

**Installation Location**:
- Linux/macOS: `~/.config/claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### 2. custom_instructions.txt

Project-specific context and guidelines for Claude Desktop conversations.

**Purpose**: Provides Claude with:
- Project architecture overview
- Technology stack details
- Development guidelines
- File organization rules
- Multi-agent orchestration patterns
- Performance targets
- Common workflows

**Installation Location**:
- Same directory as `claude_desktop_config.json`

### 3. workspace_settings.json

Workspace-level settings and preferences.

**Purpose**: Configures:
- Editor settings (tab size, formatting)
- File exclusions (node_modules, build artifacts)
- Language-specific settings (TypeScript, Python)
- Claude Flow defaults (swarm topology, memory backend)
- Git integration
- Terminal environment

**Installation Location**:
- Same directory as `claude_desktop_config.json`

## Quick Setup

### Automated (Recommended)

```bash
# Run the setup script from project root
bash bootstrap/orchestrator-mini/scripts/setup-claude-desktop.sh
```

The script will:
1. Detect your operating system
2. Guide Claude Desktop installation
3. Copy and configure templates
4. Validate MCP server connections
5. Initialize Claude Flow

### Manual Setup

1. **Install Claude Desktop**:
   - Download from https://claude.ai/download
   - Install and sign in

2. **Copy Configuration Files**:
   ```bash
   # Linux/macOS
   mkdir -p ~/.config/claude
   cp claude_desktop_config.json ~/.config/claude/
   cp custom_instructions.txt ~/.config/claude/
   cp workspace_settings.json ~/.config/claude/

   # Windows (PowerShell)
   mkdir -Force "$env:APPDATA\Claude"
   Copy-Item claude_desktop_config.json "$env:APPDATA\Claude\"
   Copy-Item custom_instructions.txt "$env:APPDATA\Claude\"
   Copy-Item workspace_settings.json "$env:APPDATA\Claude\"
   ```

3. **Edit Configuration**:
   - Open `claude_desktop_config.json`
   - Replace `${PROJECT_ROOT}` with your actual project path
   - Example: `/Users/you/Projects/Project-Nyra`
   - Add API keys if using optional services

4. **Restart Claude Desktop**:
   - Quit completely
   - Restart
   - Verify MCP servers are connected

## Validation

Test your configuration:

```bash
# Validate Node.js environment
node --version  # Should be 20+
npm --version   # Should be 9+

# Test Claude Flow CLI
npx @claude-flow/cli@latest --version
npx @claude-flow/cli@latest doctor

# Test MCP servers
npx @claude-flow/cli@latest daemon start
npx @claude-flow/cli@latest swarm init --topology hierarchical
```

## Configuration Reference

### MCP Servers

| Server | Purpose | Required | Auto-Start |
|--------|---------|----------|------------|
| `claude-flow` | Multi-agent orchestration | Yes | Yes |
| `filesystem` | File operations | Yes | Yes |
| `git` | Version control | Yes | Yes |
| `memory` | Key-value storage | Yes | Yes |
| `github` | GitHub API | No | No |
| `ruv-swarm` | Advanced coordination | No | No |
| `flow-nexus` | Platform management | No | No |
| `postgres` | Database ops | No | No |
| `brave-search` | Web search | No | No |

### Environment Variables

Required:
- `ANTHROPIC_API_KEY` - Your Claude API key

Optional (if using respective services):
- `GITHUB_TOKEN` - For GitHub integration
- `POSTGRES_CONNECTION_STRING` - For database operations
- `BRAVE_API_KEY` - For web search

Create a `.env` file in project root with these variables.

## Troubleshooting

### MCP Servers Not Connecting

1. Check configuration file location:
   ```bash
   # Linux/macOS
   ls -la ~/.config/claude/claude_desktop_config.json

   # Windows (Git Bash)
   ls -la "$APPDATA/Claude/claude_desktop_config.json"
   ```

2. Validate JSON syntax:
   ```bash
   cat ~/.config/claude/claude_desktop_config.json | jq .
   ```

3. Check for template variables:
   ```bash
   grep '\${' ~/.config/claude/claude_desktop_config.json
   ```
   Should return nothing (all variables replaced)

4. Verify absolute paths (no relative paths or `~`)

5. Restart Claude Desktop completely

### Permission Errors

```bash
# Fix permissions (Linux/macOS)
chmod 600 ~/.config/claude/claude_desktop_config.json
chmod 755 ~/.config/claude
```

### Path Issues on Windows

Use forward slashes in JSON:
```json
{
  "env": {
    "PROJECT_ROOT": "C:/Dev/Projects/Project-Nyra"
  }
}
```

## Advanced Configuration

### Custom MCP Servers

Add your own servers to `mcpServers` section:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["./path/to/server.js"],
      "env": {},
      "autoStart": true
    }
  }
}
```

### Performance Tuning

Reduce concurrent requests for slower machines:

```json
{
  "globalSettings": {
    "maxConcurrentRequests": 5,
    "timeout": 15000
  }
}
```

### Security Hardening

Restrict file system access:

```json
{
  "mcpServers": {
    "filesystem": {
      "allowedPaths": [
        "${PROJECT_ROOT}/src",
        "${PROJECT_ROOT}/tests"
      ]
    }
  }
}
```

## Documentation

- **Detailed Setup Guide**: `../../docs/CLAUDE-DESKTOP-SETUP.md`
- **Main Project Guide**: `../../../CLAUDE.md`
- **Setup Script**: `../../scripts/setup-claude-desktop.sh`
- **Claude Flow Docs**: https://github.com/ruvnet/claude-flow
- **MCP Documentation**: https://modelcontextprotocol.io/

## Support

For issues or questions:

1. Check the detailed setup guide
2. Run diagnostics: `npx @claude-flow/cli@latest doctor`
3. Check logs: `tail -f ~/Project-Nyra/logs/claude-desktop.log`
4. Create an issue on GitHub

## Version Information

- Configuration Version: 1.0.0
- Claude Flow: 3.0.0-alpha.12+
- MCP Schema: Latest
- Last Updated: 2026-01-15

---

**Quick Links**:
- [Detailed Setup Guide](../../docs/CLAUDE-DESKTOP-SETUP.md)
- [Setup Script](../../scripts/setup-claude-desktop.sh)
- [Main CLAUDE.md](../../../CLAUDE.md)
