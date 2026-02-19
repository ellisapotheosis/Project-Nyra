# Claude Flow V3 Statusline - NYRA Bootstrap Integration

## Overview

The Claude Flow V3 statusline has been integrated into the NYRA-AIO-Bootstrap PowerShell runtime system, providing real-time visibility into your multi-agent development environment.

## What Was Integrated

### Files Added/Modified

1. **`powershell-profile-statusline.ps1`**
   - Location: `C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\Powershell-Runtime\powershell-profile-statusline.ps1`
   - Backup copy of the Claude Flow statusline script
   - Contains all functions for statusline display, JSON export, and live watch

2. **`bootstrap-v2.2.ps1` (Modified)**
   - Location: `C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\PowerShell-Runtime\bootstrap-v2.2.ps1`
   - Added Claude Flow statusline dot-sourcing
   - Loads statusline automatically if file exists
   - Shows confirmation message: "✓ Claude Flow statusline loaded (cfstatus, cfwatch, cfjson)"

3. **`PowerShell-Runtime-GUI-Installer.ps1` (Modified)**
   - Location: `C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\PowerShell-Runtime-GUI-Installer.ps1`
   - Added "Claude Flow Statusline" checkbox in Installation Options
   - Copies statusline script during installation
   - Shows in completion message when installed

## How It Works

### Bootstrap Integration

When your PowerShell profile loads, the NYRA bootstrap:

1. **Loads modules** (ClaudeEnvironment, InfisicalWrappers, etc.)
2. **Shows NYRA banner** with catgirl ASCII art
3. **Dot-sources Claude Flow statusline** (if file exists)
4. **Provides statusline commands** globally (`cfstatus`, `cfwatch`, `cfjson`)

```powershell
# In bootstrap-v2.2.ps1 (lines 321-328)
# Load Claude Flow Statusline (if available)
if (Test-Path $script:ClaudeFlowStatusline) {
    try {
        . $script:ClaudeFlowStatusline
        Write-Host "  ✓ Claude Flow statusline loaded (cfstatus, cfwatch, cfjson)" -ForegroundColor DarkGray
    } catch {
        # Silent failure - statusline is optional
    }
}
```

### GUI Installer Integration

The GUI installer now includes a checkbox for Claude Flow statusline:

**Installation Options:**
```
☑ PowerShell Runtime Setup (Bold, Blue)
  Install bootstrap, modules, themes, shims, and profile configuration

☑ Claude Flow Statusline (Green)
  Real-time Claude Flow V3 status (cfstatus, cfwatch, cfjson commands)
```

When checked, the installer:
- Copies `powershell-profile-statusline.ps1` from bootstrap repo to runtime directory
- Logs the installation
- Shows in completion message

## Usage

### After Installation

Once the GUI installer completes and you restart your terminal, the statusline is automatically loaded.

**Available Commands:**

```powershell
# Show full statusline with colors
cfstatus

# Live watch mode (auto-refresh every 5 seconds)
cfwatch

# Get JSON data for scripting
$status = cfjson
Write-Host "Active Agents: $($status.swarm.activeAgents)"

# Add to prompt (optional)
Set-ClaudeFlowPrompt
# Result: [CF:0/35 D:3/5 CVE:0/3] PS C:\...>
```

### Statusline Output Example

```
▊ Claude Flow V3 ● ellisapotheosis  │  ⎇ main  │  Opus 4.5
─────────────────────────────────────────────────────
🏗️  DDD Domains    [●●●○○]  3/5    ⚡ 1.0x → 2.49x-7.47x
🤖 Swarm  ○ [ 0/35]  👥 0    🔴 CVE 0/3    💾 192MB    📂  60%    🧠  12%
🔧 Architecture    DDD ●60%  │  Security ●PENDING  │  Memory ●AgentDB  │  Integration ●
```

### Bootstrap Startup Sequence

```
🚀 NYRA Bootstrap v2.2.0 initializing...

        ╔═══════════════════════════════════════════════════════════════╗
        ║         /\_/\           ███╗   ██╗██╗   ██╗██████╗  █████╗   ║
        ║        ( o.o )          ████╗  ██║╚██╗ ██╔╝██╔══██╗██╔══██╗  ║
        ║         > ^ <           ██╔██╗ ██║ ╚████╔╝ ██████╔╝███████║  ║
        ║        /|   |\          ██║╚██╗██║  ╚██╔╝  ██╔══██╗██╔══██║  ║
        ║       (_|   |_)         ██║ ╚████║   ██║   ██║  ██║██║  ██║  ║
        ║                         ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝  ║
        ║          💜 Kawaii Edition - AI Development Stack 💜          ║
        ╚═══════════════════════════════════════════════════════════════╝

  ✓ Claude Flow statusline loaded (cfstatus, cfwatch, cfjson)
[OK] Bootstrap completed in 450ms (Nya~!)
```

## Configuration

### Custom Config Location

The statusline reads from the orchestrator-based config at:
- `C:\Dev\Projects\Repos\Project-Nyra\claude-flow.config.json`

It automatically reads:
- `swarm.maxAgents` (default: 35)
- `agents.maxConcurrent` (fallback)
- `swarm.topology` (default: hierarchical-mesh)

### Remote Orchestrator Queries

If you want to query the orchestrator PC (WSL/Linux) instead of local data:

**Edit the statusline script:**
```powershell
# In powershell-profile-statusline.ps1
$ORCHESTRATOR_HOST = "orchestrator.tail-net.ts.net"
$USE_REMOTE_DATA = $true  # Set to true for remote queries
```

**Or query on-demand:**
```powershell
cfstatus -Remote
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ PowerShell Startup                                              │
│   ↓                                                             │
│ $PROFILE (stub)                                                 │
│   ↓                                                             │
│ bootstrap-v2.2.ps1                                              │
│   ├─ Load modules (parallel)                                   │
│   ├─ Show NYRA banner                                          │
│   ├─ Initialize prompt engine                                  │
│   └─ Dot-source powershell-profile-statusline.ps1             │
│       ├─ Functions: Get-ClaudeFlowStatus                       │
│       ├─ Functions: Show-ClaudeFlowStatus                      │
│       ├─ Functions: Get-ClaudeFlowStatusJson                   │
│       ├─ Functions: Watch-ClaudeFlowStatus                     │
│       ├─ Aliases: cfstatus, cfwatch, cfjson                    │
│       └─ Data Source: claude-flow.config.json OR orchestrator  │
└─────────────────────────────────────────────────────────────────┘
```

## Installation Methods

### Method 1: GUI Installer (Recommended)

```powershell
# Run the GUI installer
C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\PowerShell-Runtime-GUI-Installer.ps1

# Check boxes:
# ☑ PowerShell Runtime Setup
# ☑ Claude Flow Statusline

# Click "🚀 Install Runtime"
```

### Method 2: Manual Installation

```powershell
# Copy statusline script
Copy-Item `
  "C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\Powershell-Runtime\powershell-profile-statusline.ps1" `
  "C:\Dev\IDE-Configs\PowerShell-Runtime\powershell-profile-statusline.ps1"

# The bootstrap will automatically load it on next terminal restart
```

### Method 3: Direct Source

If you want to dot-source directly without the installer:

```powershell
# Add to your $PROFILE AFTER bootstrap loads:
. "C:\Dev\Projects\Repos\Project-Nyra\scripts\powershell-profile-statusline.ps1"
```

## Uninstallation

To remove the statusline:

```powershell
# Option 1: Delete the file (silent failure in bootstrap)
Remove-Item "C:\Dev\IDE-Configs\PowerShell-Runtime\powershell-profile-statusline.ps1"

# Option 2: Comment out in bootstrap-v2.2.ps1
# Lines 321-328: comment out the if statement

# Option 3: Re-run installer without checkbox
```

## Troubleshooting

### Statusline Not Loading

**Check 1: File exists**
```powershell
Test-Path "C:\Dev\IDE-Configs\PowerShell-Runtime\powershell-profile-statusline.ps1"
# Should return: True
```

**Check 2: Bootstrap loads it**
```powershell
# Look for this message in terminal:
# "✓ Claude Flow statusline loaded (cfstatus, cfwatch, cfjson)"
```

**Check 3: Commands available**
```powershell
Get-Command cfstatus
# Should show the function definition
```

### Statusline Shows Wrong Data

**Issue**: maxAgents shows 15 instead of 35

**Fix**: The statusline reads from `claude-flow.config.json`. Verify:
```powershell
$config = Get-Content "C:\Dev\Projects\Repos\Project-Nyra\claude-flow.config.json" | ConvertFrom-Json
Write-Host "swarm.maxAgents: $($config.swarm.maxAgents)"
Write-Host "agents.maxConcurrent: $($config.agents.maxConcurrent)"
```

### Node.js Not Found

**Issue**: `node: command not found`

**Fix**: Install Node.js or ensure it's in PATH:
```powershell
# Check Node.js
node --version

# If not found, install via winget
winget install OpenJS.NodeJS
```

## Benefits

### Real-Time Visibility

- See active agents, swarm status, memory usage at a glance
- Monitor V3 implementation progress
- Track security status (CVEs)
- Watch learning metrics (patterns, intelligence %)

### Integration with NYRA Workflow

- Seamlessly integrated with existing bootstrap
- No manual profile editing needed
- Installed via familiar GUI installer
- Dot-sourced for instant availability

### Cross-PC Support

- Query orchestrator for authoritative data
- Local data for fast offline checks
- Configurable remote vs local mode

## References

- **Main Documentation**: `C:\Dev\Projects\Repos\Project-Nyra\docs\POWERSHELL-STATUSLINE-SETUP.md`
- **Quick Start**: `C:\Dev\Projects\Repos\Project-Nyra\QUICK-START.md`
- **Full Setup Guide**: `C:\Dev\Projects\Repos\Project-Nyra\docs\CLAUDE-FLOW-V3-SETUP-SUMMARY.md`

---

**Integration Version**: 1.0
**Date**: 2026-01-18
**Bootstrap Version**: v2.2.0
**Claude Flow Version**: v3.0.0-alpha.104
