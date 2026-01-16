# Bootstrap Configuration Templates

Configuration file templates for Project Nyra bootstrap components.

## Overview

This directory contains configuration templates that are copied to appropriate locations during component installation. Each template is pre-configured with sensible defaults for the Project Nyra environment.

## Configuration Files

### Claude Code (`claude-code/settings.json`)

**Copied to**: `%APPDATA%\Claude\settings.json`

Configuration for Claude Code CLI:
- 32K token thinking budget
- Claude Sonnet 4.5 model
- MCP server integrations
- Editor preferences
- Code execution settings

**Key Settings**:
- `thinkingBudget`: 32000 tokens for complex reasoning
- `model`: "claude-sonnet-4-5" (latest model)
- `mcp.enabled`: true (enables MCP server integration)

### Claude Desktop (`claude-desktop/.mcp.json`)

**Copied to**: `%APPDATA%\Claude\.mcp.json`

MCP server configuration for Claude Desktop:
- claude-flow integration
- desktop-commander integration
- flow-nexus integration

**Usage**: Enables Claude Desktop to communicate with local MCP servers for enhanced capabilities.

### Claude Flow (`claude-flow/`)

**Files**:
- `claude-flow.config.json` - Main configuration
- `.env` - Environment variables and API keys

**Copied to**: `%USERPROFILE%\.claude-flow\`

Comprehensive Claude Flow V3 configuration:
- Swarm topology and scaling
- Memory backend settings (HNSW, quantization)
- Neural optimizations (SONA, MoE, Flash Attention)
- Hooks and worker daemon settings
- MCP server configuration
- Provider settings (Anthropic, OpenAI, etc.)
- Security settings (AIDefence, claims)

**Important**: Edit `.env` to add your API keys before using!

### Docker (`docker/daemon.json`)

**Copied to**: `%APPDATA%\Docker\daemon.json`

Docker daemon configuration:
- BuildKit enabled for faster builds
- Overlay2 storage driver
- Log rotation (10MB max per file, 3 files)
- Custom address pools for container networks
- DNS servers (Google Public DNS)
- Resource limits

### WSL (`wsl/.wslconfig`)

**Copied to**: `%USERPROFILE%\.wslconfig`

WSL2 kernel configuration:
- Memory: 8GB (adjust based on available RAM)
- Processors: 4 cores (adjust based on available cores)
- Swap: 4GB
- Networking: localhost forwarding enabled
- Nested virtualization enabled
- Experimental features: auto memory reclaim, sparse VHD

**Note**: Adjust memory and processor allocations based on your hardware.

### Infisical (`infisical/config.json`)

**Copied to**: `%USERPROFILE%\.infisical\config.json`

Secrets management configuration:
- Vault backend settings
- Default project and environment
- Cache settings (5 minute duration)
- Auto-sync (every 10 minutes)
- AES-256-GCM encryption

### Gitea (`gitea/app.ini`)

**Copied to**: Docker volume mount

Self-hosted Git server configuration:
- HTTP port: 3000
- SSH port: 2222
- SQLite3 database
- Repository settings
- UI theme: arc-green
- Open registration enabled (for initial setup)

## Customization

### Before Installation

Edit these templates before running bootstrap scripts:

1. **Claude Flow `.env`**: Add your API keys
   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   OPENAI_API_KEY=sk-...
   ```

2. **WSL `.wslconfig`**: Adjust memory/CPU allocation
   ```ini
   memory=8GB    # Change based on available RAM
   processors=4  # Change based on available cores
   ```

3. **Docker `daemon.json`**: Adjust resource limits if needed
   ```json
   "default-address-pools": [...],
   "default-ulimits": {...}
   ```

### After Installation

Some configurations can be modified after installation:

1. **Claude Flow**: Edit `~/.claude-flow/config.json` for swarm settings
2. **Docker**: Edit `%APPDATA%\Docker\daemon.json` and restart Docker Desktop
3. **WSL**: Edit `%USERPROFILE%\.wslconfig` and run `wsl --shutdown`
4. **Gitea**: Modify through web interface after first launch

## Environment-Specific Settings

### Development Environment
- Claude Flow: `swarm.maxAgents: 8`, `memory.backend: "hybrid"`
- Docker: `log-opts.max-size: "10m"`, storage driver: `overlay2`
- WSL: `memory: 8GB`, `processors: 4`

### Production Environment
Recommended changes for production:
- Claude Flow: Increase `swarm.maxAgents`, enable `performance.metricsInterval`
- Docker: Increase `log-opts.max-file`, add production DNS servers
- WSL: Allocate more memory and processors

## Security Considerations

### API Keys
- **Never commit** `.env` files with actual API keys to version control
- Use Infisical or similar secrets management for production
- Rotate API keys regularly

### File Permissions
Windows automatically sets appropriate permissions for:
- `%APPDATA%` files (user-only access)
- `%USERPROFILE%` files (user-only access)

### Network Security
- Docker: Uses private IP ranges (172.20.0.0/16)
- Gitea: Runs in Docker container with isolated network
- WSL: Uses NAT networking with localhost forwarding

## Troubleshooting

### Configuration Not Applied

**Claude Code/Desktop**:
```powershell
# Verify config location
Get-Content "$env:APPDATA\Claude\settings.json"
```

**Claude Flow**:
```powershell
# Verify config location
Get-Content "$env:USERPROFILE\.claude-flow\config.json"
```

**Docker**:
```powershell
# Verify config and restart Docker
Get-Content "$env:APPDATA\Docker\daemon.json"
# Restart Docker Desktop from system tray
```

**WSL**:
```powershell
# Verify config and restart WSL
Get-Content "$env:USERPROFILE\.wslconfig"
wsl --shutdown
# Restart Ubuntu terminal
```

### Invalid JSON

Validate JSON files:
```powershell
# PowerShell validation
Get-Content "config.json" | ConvertFrom-Json
```

### Permission Issues

Run PowerShell as Administrator if copy operations fail:
```powershell
# Right-click PowerShell -> Run as Administrator
# Rerun the component installation script
```

## Backup and Restore

### Backup Configurations
```powershell
# Create backup directory
mkdir "$env:USERPROFILE\nyra-config-backup"

# Backup Claude configs
Copy-Item "$env:APPDATA\Claude\*" "$env:USERPROFILE\nyra-config-backup\claude\" -Recurse

# Backup Claude Flow configs
Copy-Item "$env:USERPROFILE\.claude-flow\*" "$env:USERPROFILE\nyra-config-backup\claude-flow\" -Recurse

# Backup Docker config
Copy-Item "$env:APPDATA\Docker\daemon.json" "$env:USERPROFILE\nyra-config-backup\"

# Backup WSL config
Copy-Item "$env:USERPROFILE\.wslconfig" "$env:USERPROFILE\nyra-config-backup\"
```

### Restore Configurations
```powershell
# Restore from backup
Copy-Item "$env:USERPROFILE\nyra-config-backup\*" -Destination [...] -Recurse
```

## Version Control

Template files in this directory should be:
- ✅ Committed to version control
- ✅ Updated when defaults change
- ❌ Never contain actual API keys or secrets
- ❌ Never overwritten by installation scripts

User configurations should be:
- ❌ Not committed to version control
- ✅ Backed up separately
- ✅ Migrated when upgrading

## Support

For configuration issues:
- Check component documentation in `bootstrap/docs/`
- Review installation logs
- Verify file permissions
- Ensure all prerequisites are installed
