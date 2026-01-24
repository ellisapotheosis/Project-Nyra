# 🤖 Claude Development Environment - Complete Setup Guide

## Overview

This comprehensive environment setup provides **automatic detection** and **profile switching** for Claude Code, Claude Flow, and Archon MCP across Windows 11, WSL, and DevContainers.

## ✨ Key Features

- **Automatic Claude Detection**: Detects Claude Code, Claude Flow, and Archon MCP activity
- **Smart Profile Switching**: 
  - Oh-My-Posh (default for PowerShell)
  - Starship (auto-activates for Warp terminal)
  - Starship-Claude (auto-activates when Claude environment detected)
- **WSL Integration**: Seamless Claude development in WSL with proper PATH and tooling
- **DevContainer Support**: VS Code devcontainer templates for Linux-native Claude environments
- **Windows 11 Optimizations**: Native Windows fixes for common Claude issues

---

## 📦 Installation

### Prerequisites

- PowerShell 7+ (`pwsh`)
- Oh-My-Posh installed
- Starship installed (optional but recommended)
- Git, Node.js (via Volta recommended)

### Quick Install

```powershell
# Bootstrap will auto-load ClaudeEnvironment module
. C:\Dev\IDE-Configs\PowerShell-Runtime\bootstrap.unified.ps1

# Verify installation
claude-status
```

---

## 🎯 Profile Behavior

### Default Behavior (Oh-My-Posh)

When you open PowerShell **without** Warp or Claude active:

```powershell
# Oh-My-Posh loads automatically
# Config: C:\Dev\IDE-Configs\PowerShell-Runtime\PoshThemes\xulbux-ultimate.omp.json
```

### Warp Terminal (Starship)

When you open PowerShell via **Warp**:

```powershell
# Auto-switches to Starship for performance
# Config: C:\Dev\IDE-Configs\PowerShell-Runtime\starship\starship-warp.toml
```

### Claude Environment (Starship-Claude)

When **Claude Code**, **Claude Flow**, or **Archon MCP** is detected:

```powershell
# Auto-switches to Starship with Claude-optimized config
# Config: C:\Dev\IDE-Configs\PowerShell-Runtime\starship\starship-claude.toml
# Shows: 🤖CLAUDE ⚡CF 🎯ARCHON badges in prompt
```

---

## 🔍 Claude Detection Methods

The `ClaudeEnvironment` module detects Claude activity through:

### 1. Environment Variables
- `CLAUDE_CODE_SESSION`
- `ANTHROPIC_CLAUDE_SDK`
- `CLAUDE_API_KEY`
- `CLAUDE_FLOW_ACTIVE`
- `ARCHON_MCP_ACTIVE`

### 2. Process Detection
- `claude-code`, `claude`, `anthropic-cli` processes
- Node.js processes running `claude-flow` or `pnpm dev`
- `archon-mcp` process

### 3. Port Detection
- Claude Flow: `localhost:3000`
- Archon MCP: `localhost:8080`

### 4. Directory Markers
- `.claude` folder
- `claude.json` file
- Working directory in `claude-flow` path

---

## 🛠️ Available Commands

### Status & Detection

```powershell
# Show Claude environment status
claude-status
Show-ClaudeEnvironmentStatus

# Check specific components
Test-ClaudeCodeActive
Test-ClaudeFlowActive
Test-ArchonMCPActive
Get-ClaudeEnvironmentContext
```

### Profile Switching

```powershell
# Manually switch to Claude profile
claude-on
Switch-ToClaudeProfile

# Switch back to default Oh-My-Posh
claude-off
Switch-ToDefaultProfile
```

### Claude Flow Management

```powershell
# Start Claude Flow (Windows native)
cf-start
Start-ClaudeFlowDev

# Start Claude Flow in WSL
cf-start -WSL
Start-ClaudeFlowDev -WSL

# Start on custom port
cf-start -Port 3005
```

---

## 🐧 WSL Integration

### Install WSL Profile

```powershell
# Install Claude profile to Ubuntu (default)
Install-WSLClaudeProfile

# Install to specific distro
Install-WSLClaudeProfile -WSLDistro Debian
```

### What It Does

1. Creates `~/.config/claude/claude-env.sh` in WSL
2. Adds to `~/.bashrc` automatically
3. Sets up:
   - `$CLAUDE_FLOW_PATH` environment variable
   - Volta/PNPM PATH additions (Windows-installed, WSL-accessible)
   - Claude development aliases (`cf`, `cf-start`, `cf-build`, `cf-test`)
   - Starship prompt with Claude config
   - Git config optimizations

### WSL Aliases

```bash
# After installing WSL profile
cf           # cd to Claude Flow
cf-start     # Start Claude Flow dev server
cf-build     # Build Claude Flow
cf-test      # Run Claude Flow tests
```

---

## 📋 DevContainer Setup

### Create DevContainer for Claude

```powershell
# Generate devcontainer.json (coming soon)
New-ClaudeDevContainer -Path "./claude-flow"
```

### Manual DevContainer Setup

Create `.devcontainer/devcontainer.json`:

```json
{
  "name": "Claude Development",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-azuretools.vscode-docker"
      ]
    }
  },
  "postCreateCommand": "pnpm install",
  "remoteEnv": {
    "CLAUDE_ENVIRONMENT": "1",
    "CLAUDE_FLOW_ACTIVE": "1"
  }
}
```

---

## 🔧 Windows 11 Specific Fixes

### Common Issues & Solutions

#### Issue: Git/Bash Conflicts with Starship

**Solution**: The bootstrap detects Warp and auto-switches to Starship, avoiding bash/git conflicts.

```powershell
# If issues persist, force Oh-My-Posh
claude-off
```

#### Issue: Node.js PATH Not Found

**Solution**: Use Volta (already configured in bootstrap)

```powershell
# Volta auto-added to PATH
volta --version

# If missing, reinstall from https://volta.sh
```

#### Issue: Claude Flow Won't Start on Windows

**Solution**: Use WSL mode

```powershell
# Start in WSL instead
cf-start -WSL
```

#### Issue: Oh-My-Posh vs Starship Conflicts

**Solution**: The system auto-detects and prevents conflicts:

- Regular PowerShell → Oh-My-Posh
- Warp → Starship (Warp optimized)
- Claude Active → Starship (Claude optimized)

---

## 🎨 Starship Claude Theme Features

The `starship-claude.toml` config provides:

- **Clean, Two-Line Prompt**: `╭─` and `╰─` frame
- **XulbuX Purple Theme**: Consistent with your brand colors
- **Rich Git Integration**:
  - Branch with remote tracking
  - Status indicators (staged, modified, untracked, etc.)
  - State indicators (rebasing, merging, etc.)
- **Environment Badges**:
  - `🤖CLAUDE` when Claude Code active
  - `⚡CF` when Claude Flow running
  - `🎯ARCHON` when Archon MCP active
  - `WSL:distro` when in WSL
- **Language Detection**: Python 🐍, Node.js , Docker 🐳
- **Path Substitutions**:
  - `C:/Dev/DevProjects/Personal-Projects/Project-Nyra` → `NYRA`
  - `C:/Users/edane` → `~`

---

## 📁 File Locations

### Bootstrap & Modules

```
C:\Dev\IDE-Configs\PowerShell-Runtime\
├── bootstrap.unified.ps1              # Main bootstrap (Claude-aware)
├── Modules\
│   ├── ClaudeEnvironment\
│   │   ├── ClaudeEnvironment.psm1     # Detection & switching logic
│   │   └── ClaudeEnvironment.psd1     # Module manifest
│   ├── InfisicalProfile\              # Secrets management (fixed)
│   └── [other modules]
├── starship\
│   ├── starship-claude.toml           # Claude-optimized config
│   ├── starship-warp.toml             # Warp-optimized config
│   └── starship.toml                  # Default config
└── PoshThemes\
    └── xulbux-ultimate.omp.json       # Default Oh-My-Posh theme
```

### Source Files (NYRA-AIO-Bootstrap)

```
C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\
└── PowerShell-Runtime\                # Source of truth
    └── [mirrors deployed structure]
```

---

## 🚀 Quick Start Workflows

### Workflow 1: Regular Development (Oh-My-Posh)

```powershell
# Just open PowerShell normally
pwsh

# Oh-My-Posh loads automatically ◆
```

### Workflow 2: Claude Flow Development

```powershell
# Navigate to Claude Flow
cd C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-orchestration\Claude\claude-flow

# Automatic detection!
# → 🤖 Claude environment detected
# → ✨ Claude Environment activated (Starship)

# Start dev server
pnpm dev  # or cf-start

# Your prompt now shows: ╭─ NYRA on  main ⚡CF
```

### Workflow 3: WSL Claude Development

```powershell
# Install WSL profile (one-time)
Install-WSLClaudeProfile

# Enter WSL
wsl

# 🤖 Claude WSL environment loaded

# Use aliases
cf           # cd to Claude Flow
cf-start     # Start dev server in WSL
```

### Workflow 4: VS Code DevContainer

```powershell
# Open Claude Flow in VS Code
code C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-orchestration\Claude\claude-flow

# Reopen in Container (F1 → "Reopen in Container")
# DevContainer auto-sets CLAUDE_ENVIRONMENT=1
# Starship Claude theme activates automatically
```

---

## 🧪 Testing

### Test Default Behavior

```powershell
# Clear environment
$env:CLAUDE_ENVIRONMENT = $null
$env:CLAUDE_FLOW_ACTIVE = $null

# Reload
. $PROFILE

# Should see Oh-My-Posh ◆
```

### Test Claude Detection

```powershell
# Simulate Claude environment
$env:CLAUDE_CODE_SESSION = "test"

# Reload
. $PROFILE

# Should see: 🤖 Claude environment detected
# Should see: ✨ Claude Environment activated (Starship)
# Prompt shows: ╭─ 🤖CLAUDE ...
```

### Test Warp Detection

```powershell
# Open Warp terminal
# Should automatically use Starship (not Claude variant)
```

---

## 🔄 Updating

### Update Bootstrap

```powershell
# Pull latest from NYRA-AIO-Bootstrap
cd C:\Dev\NYRA-AIO-Bootstrap
git pull

# Run GUI installer or copy manually
& "C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\PowerShell-Runtime-GUI-Installer.ps1"
```

### Update WSL Profile

```powershell
# Re-run install (safe to run multiple times)
Install-WSLClaudeProfile
```

---

## 📊 Troubleshooting

### Claude Not Detected

```powershell
# Check detection
claude-status

# Manually activate
claude-on -Force

# Verify environment variables
Get-ChildItem env: | Where-Object { $_.Name -like "*CLAUDE*" }
```

### Oh-My-Posh Not Loading

```powershell
# Check config exists
Test-Path C:\Dev\IDE-Configs\PowerShell-Runtime\PoshThemes\xulbux-ultimate.omp.json

# Check Oh-My-Posh installed
oh-my-posh --version

# Manually load
& oh-my-posh init pwsh --config C:\Dev\IDE-Configs\PowerShell-Runtime\PoshThemes\xulbux-ultimate.omp.json | Invoke-Expression
```

### Starship Not Loading

```powershell
# Check Starship installed
starship --version

# Check config exists
Test-Path C:\Dev\IDE-Configs\PowerShell-Runtime\starship\starship-claude.toml

# Manually load
$env:STARSHIP_CONFIG = "C:\Dev\IDE-Configs\PowerShell-Runtime\starship\starship-claude.toml"
Invoke-Expression (& starship init powershell)
```

---

## 🎓 Best Practices

1. **Always use Oh-My-Posh as default** - It's the most stable for regular PowerShell
2. **Let auto-detection work** - Don't manually switch unless needed
3. **Use WSL for heavy Claude development** - Better compatibility
4. **Keep environment clean** - Clear `CLAUDE_*` vars when not developing
5. **Update regularly** - Pull latest fixes from NYRA-AIO-Bootstrap

---

## 🔗 Related Documentation

- [Warp Setup Rules](./README-WARP-SETUP.md)
- [MCP Integration](../../Tools/MCP-Servers/README.md)
- [NYRA Project Architecture](../../../NYRA-AIO-Bootstrap/README.md)

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-17  
**Maintainer**: NYRA Development Team
