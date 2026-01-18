# Claude Code Bootstrap Package

## Overview
This package contains all necessary configuration files to quickly bootstrap Claude Code on multiple machines in your LAN environment. It includes both base settings and advanced claude-flow configurations for alpha mode with all features enabled.

## Contents

### Root Level
- `settings.json` - Base Claude Code settings with bypassPermissions mode enabled
- `.claude.json` - User-level configuration with permissions, MCP servers, and capabilities
- `README.md` - This file
- `deploy.ps1` - PowerShell script to deploy configs to target machines

### claude-flow Subfolder
- `settings-alpha-all-modes.json` - Comprehensive claude-flow settings with ALL alpha features enabled

## File Descriptions

### settings.json
Base settings file for Claude Code with:
- **Permissions**: `bypassPermissions` mode with allow list for Bash, Read, Write, Edit, WebFetch
- **Session Hooks**: Infisical MCP integration on startup
- **Status Line**: Custom PowerShell statusline
- **Plugins**: claude-flow enabled
- **Always Thinking**: Enabled for advanced reasoning

### .claude.json
User-level configuration with:
- **Permissions**: Bypass mode with comprehensive allow list including MCP wildcards
- **Capabilities**: Unsandboxed commands, web search, PDF read
- **Thinking**: 4000 token budget
- **MCP Servers**: Desktop Commander and Rube integrations
- **Project Trust**: Pre-configured for Project-Nyra

### settings-alpha-all-modes.json (Claude-Flow)
Consolidated alpha settings combining:
- **Performance Optimization**: Caching, parallelization, batching, connection pooling
- **Neural Models**: Task predictor, error preventer, performance optimizer with WASM acceleration
- **Memory Management**: Auto-persist, compression, multi-namespace with GitHub backup
- **Checkpoints**: Auto-commit every 5 minutes with metrics
- **Advanced Hooks**: Pre/Post tool use for Bash, Write/Edit, Tasks with batch processing
- **GitHub Integration**: Checkpoint branches, gist backups, auto-issue on errors
- **All Alpha Features**: Complete feature set for multi-agent workflows

## Key Features

### Security
- Infisical integration for secrets management
- Bitwarden MCP support (via .claude.json)
- Safe command restrictions (denies rm -rf /, pipe to bash/sh, eval)

### Performance
- Parallel hook execution with batching
- Neural prediction caching (10ms target)
- Memory operation optimization (20ms target)
- Agent pooling with warm instances

### Monitoring
- Comprehensive metrics tracking (latency, throughput, errors, cache hits)
- Alert thresholds configured
- Session-end summaries with GitHub gist export

### Workflow Enhancements
- SPARC methodology support
- 54-agent swarm coordination
- Auto-checkpoint with git integration
- Continuous learning and pattern recognition

## Deployment Instructions

### Method 1: Manual Deployment
Copy files to each target machine:

```powershell
# On target machine, copy files to user directory
Copy-Item "\\source\path\.claude\claude-code-bootstrap\settings.json" "$env:USERPROFILE\.claude\settings.json" -Force
Copy-Item "\\source\path\.claude\claude-code-bootstrap\.claude.json" "$env:USERPROFILE\.claude.json" -Force

# For claude-flow repo (if installed)
Copy-Item "\\source\path\.claude\claude-code-bootstrap\claude-flow\settings-alpha-all-modes.json" "$env:USERPROFILE\.claude\plugins\marketplaces\claude-flow-marketplace\.claude\settings.json" -Force
```

### Method 2: Automated Deployment (Recommended)
Use the included PowerShell deployment script:

```powershell
# Edit deploy.ps1 to set target machine IPs/hostnames
.\deploy.ps1 -TargetMachines @("192.168.1.101", "192.168.1.102", "192.168.1.103", "192.168.1.104")
```

### Method 3: Network Share
1. Share the bootstrap folder on the network
2. On each target machine, run:

```powershell
$source = "\\primary-pc\claude-code-bootstrap"
Copy-Item "$source\settings.json" "$env:USERPROFILE\.claude\settings.json" -Force
Copy-Item "$source\.claude.json" "$env:USERPROFILE\.claude.json" -Force
```

## Customization Guide

### Adapting for Your Environment

#### Update Infisical Project ID
Edit `settings.json` and `settings-alpha-all-modes.json`:
```json
"command": "infisical run --projectId=\"YOUR-PROJECT-ID\" --env=\"dev\" --path=\"/shared\" -- claude mcp start"
```

#### Adjust Performance Settings
In `settings-alpha-all-modes.json`, tune based on machine specs:
- **Low-end machines**: Reduce `maxConcurrent`, `workerThreads`, agent pool sizes
- **High-end machines**: Increase parallel processing limits

#### Enable/Disable Features
Toggle features via environment variables:
```json
"env": {
  "CLAUDE_FLOW_AUTO_COMMIT": "false",  // Disable auto-commit
  "CLAUDE_FLOW_AUTO_PUSH": "false",    // Keep disabled for safety
  "CLAUDE_FLOW_GITHUB_INTEGRATION": "false"  // Disable GitHub features
}
```

## Local claude-flow Repository Integration

To use this config with your local claude-flow repo:

```powershell
# Navigate to your repo
cd "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-orchestration\Claude\claude-flow"

# Copy the comprehensive settings
Copy-Item "$env:USERPROFILE\.claude\claude-code-bootstrap\claude-flow\settings-alpha-all-modes.json" ".\.claude\settings.json" -Force

# Verify
Get-Content ".\.claude\settings.json" | ConvertFrom-Json | Select-Object -Property env, performance
```

## Troubleshooting

### Permissions Issues
If `bypassPermissions` doesn't activate:
1. Check that `defaultMode` is set to `"bypassPermissions"` (not `"bypass"`)
2. Restart Claude Code completely
3. Verify file permissions allow read access

### Infisical Not Connecting
1. Ensure Infisical CLI is installed: `infisical --version`
2. Authenticate: `infisical login`
3. Verify project access: `infisical secrets list --projectId="YOUR-ID" --env="dev"`

### claude-flow Hooks Not Running
1. Verify claude-flow is installed: `npx claude-flow@alpha --version`
2. Check hook execution permissions in settings
3. Review hook logs in `.claude/logs/`

### Performance Issues
1. Reduce parallelization limits in settings
2. Disable neural optimizations temporarily
3. Increase cache TTL values
4. Check disk I/O for memory persistence

## Version History
- **v1.0.0** (2025-12-22): Initial bootstrap package with consolidated alpha settings

## Support & Contact
For issues or questions, refer to:
- Claude-Flow Documentation: Check marketplace plugin docs
- Project NYRA: See main project repository
- Infisical: https://infisical.com/docs

## License
Internal use only for Project NYRA development environment.
