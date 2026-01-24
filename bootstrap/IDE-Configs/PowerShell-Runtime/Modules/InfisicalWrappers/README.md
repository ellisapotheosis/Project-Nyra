# InfisicalWrappers Module

**Version**: 2.0.0
**Last Updated**: 2026-01-02

Infisical secret injection wrapper for Claude Code, Claude Flow, Gemini Flow, and MCP servers with Docker integration.

## Features

- 🔐 **Secret Injection**: Automatically inject Infisical secrets into AI CLI tools
- 🚀 **Multi-Tool Support**: Claude, Claude Code, Claude Flow, Gemini Flow, Gemini CLI
- 📦 **Package Manager Variants**: Native, NPX, and PNPM DLX wrappers
- 🖥️ **Claude Desktop Integration**: Inject secrets directly into Claude Desktop config
- 🐳 **Docker Support**: Run Infisical MCP server via Docker with Windows networking
- ⚡ **Zero Config**: Works out of the box with sensible defaults

## Installation

The module is automatically loaded by the NYRA bootstrap system. No manual installation required!

## Quick Start

### 1. Login to Infisical

```powershell
infisical login
```

### 2. Use AI Tools with Secret Injection

```powershell
# Claude family
claude "hello world"
claude-code "analyze this code"
claude-flow init

# Gemini family
gemini-flow "create a new project"
gf "quick command"  # short alias
gemini "run inference"

# NPX variants
npx-claude-code "review my code"
npx-gemini-flow "start server"

# PNPM variants
pnpm-dlx-claude-flow "deploy app"
pnpm-dlx-gemini-flow-alpha "test new features"
```

### 3. Inject Secrets into Claude Desktop

```powershell
Inject-ClaudeDesktopSecrets
```

This will:
- Fetch secrets from Infisical
- Update `%APPDATA%\Claude\config.json`
- Configure Infisical MCP server
- Backup existing config

### 4. Start Infisical MCP Server

**NPX (Recommended)**:
```powershell
Start-InfisicalMCP
# or
infmcp
```

**PNPM**:
```powershell
Start-InfisicalMCP -UsePnpm
```

**Docker** (for persistent server):
```powershell
Start-InfisicalMCPDocker
# or
infmcp-docker

# With custom port
Start-InfisicalMCPDocker -Port 3001 -Detach
```

To stop Docker container:
```powershell
Stop-InfisicalMCPDocker
```

## Docker Windows Networking

When running Infisical MCP via Docker on Windows (non-WSL):

| Client Location | Connection String |
|-----------------|-------------------|
| Windows Host | `tcp://localhost:3000` |
| WSL2 | `tcp://host.docker.internal:3000` |
| Another Container | `tcp://infisical-mcp:3000` |

The Docker Compose automatically configures bridge networking and port mapping.

### Using with Claude Code/Flow

Add to your MCP config (e.g., `.claude/mcp.json`):

```json
{
  "mcpServers": {
    "infisical": {
      "transport": {
        "type": "tcp",
        "host": "localhost",
        "port": 3000
      }
    }
  }
}
```

## Configuration

### Default Infisical Settings

Edit at the top of `SecretsManagement.psm1`:

```powershell
$DefaultInfisicalProject = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
$DefaultInfisicalEnv = "dev"
$DefaultInfisicalPath = "/shared"
```

### Session Hydration (Manual)

To import secrets into your current PowerShell session:

```powershell
Import-InfisicalEnv

# With custom params
Import-InfisicalEnv -ProjectId "abc123" -Env "prod" -Path "/backend"

# Silent mode (no output)
Import-InfisicalEnv -Silent
```

### Bitwarden Integration

Load secrets from Bitwarden vault:

```powershell
# First, login and get session
$env:BW_SESSION = (bw login --raw)

# Import specific items
Import-BWEnv -Items @(
    "API_KEY:MyItem/api_key",
    "DB_PASSWORD:Database/password"
)
```

Format: `ENV_VAR:ItemName/FieldName`

## Available Commands

### Secret Management
- `Import-InfisicalEnv` - Import Infisical secrets into current session
- `Import-BWEnv` - Import Bitwarden secrets into current session
- `Inject-ClaudeDesktopSecrets` - Inject secrets into Claude Desktop config

### MCP Server Management
- `Start-InfisicalMCP` - Start MCP server via NPX/PNPM
- `Start-InfisicalMCPDocker` - Start MCP server via Docker
- `Stop-InfisicalMCPDocker` - Stop Docker MCP server
- `infmcp` - Alias for `Start-InfisicalMCP`
- `infmcp-docker` - Alias for `Start-InfisicalMCPDocker`

### Global Command Wrappers
| Command | Description |
|---------|-------------|
| `claude` | Claude CLI with secrets |
| `claude-code` | Claude Code CLI with secrets |
| `claude-flow` | Claude Flow CLI with secrets |
| `gemini-flow` | Gemini Flow CLI with secrets |
| `gf` | Short alias for gemini-flow |
| `gemini` | Gemini CLI with secrets |
| `gemini-cli` | Gemini CLI with secrets |

### NPX Variants
| Command | Package |
|---------|---------|
| `npx-claude` | `npx -y claude` |
| `npx-claude-code` | `npx -y claude-code` |
| `npx-claude-flow` | `npx -y claude-flow` |
| `npx-claude-flow-alpha` | `npx -y claude-flow@alpha` |
| `npx-gemini-flow` | `npx -y gemini-flow` |
| `npx-gemini-flow-alpha` | `npx -y gemini-flow@alpha` |
| `npx-gemini` | `npx -y gemini-cli` |
| `npx-gemini-cli` | `npx -y gemini-cli` |

### PNPM DLX Variants
| Command | Package |
|---------|---------|
| `pnpm-dlx-claude` | `pnpm dlx claude` |
| `pnpm-dlx-claude-code` | `pnpm dlx claude-code` |
| `pnpm-dlx-claude-flow` | `pnpm dlx claude-flow` |
| `pnpm-dlx-claude-flow-alpha` | `pnpm dlx claude-flow@alpha` |
| `pnpm-dlx-gemini-flow` | `pnpm dlx gemini-flow` |
| `pnpm-dlx-gemini-flow-alpha` | `pnpm dlx gemini-flow@alpha` |
| `pnpm-dlx-gemini` | `pnpm dlx gemini-cli` |
| `pnpm-dlx-gemini-cli` | `pnpm dlx gemini-cli` |

## Troubleshooting

### "infisical CLI not found"

Install Infisical CLI:

```powershell
# Windows
winget install infisical.cli

# Or via Scoop
scoop install infisical

# Or download from https://infisical.com/docs/cli/overview
```

### "Failed to fetch secrets"

1. Login to Infisical:
   ```powershell
   infisical login
   ```

2. Verify project ID and environment:
   ```powershell
   infisical projects list
   infisical secrets list --env dev
   ```

3. Update config in `SecretsManagement.psm1` if needed

### Docker Networking Issues

If Claude Code/Flow can't connect to Docker MCP server:

1. **Check if container is running**:
   ```powershell
   docker ps | Select-String "infisical-mcp"
   ```

2. **Test connectivity**:
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 3000
   ```

3. **Check firewall**:
   - Allow port 3000 in Windows Firewall
   - Or use different port: `Start-InfisicalMCPDocker -Port 3001`

4. **WSL2 specific**:
   - From WSL, use: `tcp://host.docker.internal:3000`
   - Ensure Docker Desktop is running

### Claude Desktop Not Loading MCP Server

1. **Verify config location**:
   ```powershell
   $env:APPDATA\Claude\config.json
   ```

2. **Check config format**:
   ```powershell
   Get-Content "$env:APPDATA\Claude\config.json" | ConvertFrom-Json
   ```

3. **Restart Claude Desktop** after injecting secrets

4. **Check Claude logs**:
   - Windows: `%APPDATA%\Claude\logs\`
   - Look for MCP connection errors

### "unable to create text based on template" Errors

This is now fixed in the Oh-My-Posh theme! If you still see it:

1. **Update Oh-My-Posh**:
   ```powershell
   winget upgrade JanDeDobbeleer.OhMyPosh
   ```

2. **Force reload theme**:
   ```powershell
   $env:POSH_THEME = "C:\Dev\IDE-Configs\PowerShell-Runtime\PoshThemes\xulbux-ultimate.omp.json"
   . $PROFILE
   ```

3. **Switch to Starship** temporarily:
   ```powershell
   "starship" | Set-Content "C:\Dev\IDE-Configs\PowerShell-Runtime\prompt-engine.txt"
   . $PROFILE
   ```

## Environment Variables

The module sets/uses these environment variables:

- `INFISICAL_TOKEN` - Authentication token (auto-fetched)
- `INFISICAL_PROJECT_ID` - Project identifier (auto-fetched)
- `BW_SESSION` - Bitwarden session (if using Bitwarden)

## Security Notes

1. **Secrets are injected at runtime** - Never stored in plaintext files
2. **Session-scoped** - Secrets only exist in current PowerShell session
3. **Claude Desktop secrets** - Stored in `config.json`, ensure file permissions are set correctly
4. **Docker secrets** - Passed as environment variables, not in image layers
5. **Always use `infisical run --`** - Ensures secrets are isolated per command

## Examples

### Full Workflow Example

```powershell
# 1. Login to Infisical (one-time)
infisical login

# 2. Start your AI development session
claude-code "create a new web app"

# 3. Run Gemini Flow for different task
gemini-flow "analyze dependencies"

# 4. Start persistent MCP server
infmcp-docker -Detach

# 5. Configure Claude Desktop
Inject-ClaudeDesktopSecrets

# 6. Use Claude Desktop with MCP integration!
```

### Development Environment Setup

```powershell
# Import secrets into session
Import-InfisicalEnv

# Verify secrets loaded
$env:OPENAI_API_KEY
$env:ANTHROPIC_API_KEY

# Run development commands
npm run dev
```

### Multi-Project Setup

```powershell
# Project A - Development
Import-InfisicalEnv -ProjectId "project-a-id" -Env "dev"
claude-flow "implement feature X"

# Project B - Production
Import-InfisicalEnv -ProjectId "project-b-id" -Env "prod"
gemini-flow "deploy to production"
```

## Contributing

This module is part of the NYRA development stack. To contribute:

1. Edit `SecretsManagement.psm1`
2. Update version in module manifest (`.psd1`)
3. Test with: `. $PROFILE` and verify functions load
4. Commit and sync via Git

## License

Part of the NYRA project. See main repository for license information.

## Support

- GitHub Issues: https://github.com/ruvnet/nyra/issues
- Discord: [NYRA Community](https://discord.gg/nyra)
- Docs: https://nyra.dev/docs

---

**Happy coding with secure secrets! 🔐✨**
