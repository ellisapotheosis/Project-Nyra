# Claude Flow V3 - PowerShell Statusline Setup

## Overview

The Claude Flow V3 statusline provides real-time visibility into your multi-agent development environment directly in PowerShell. This guide covers setup for Windows 11 with orchestrator data from WSL/Linux.

## Features

- **Real-time Status Display**: Shows V3 progress, active agents, security status, memory usage
- **Prompt Integration**: Optional compact status in your PowerShell prompt
- **Remote Data Support**: Can query orchestrator PC via SSH for authoritative data
- **Live Watch Mode**: Continuous status updates
- **JSON Export**: Machine-readable status for automation

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Windows 11 PC (Your Workstation)                               │
│                                                                 │
│  PowerShell                                                     │
│    ↓                                                            │
│  statusline.js (Node.js)                                        │
│    ↓                                                            │
│  Local Repo Data                    OR      SSH Connection      │
│    • .archon-os.config.json              ↓                   │
│    • .claude/memory.db                  Orchestrator PC         │
│    • .swarm/memory.db                   (WSL/Linux)            │
│    • Git info                             • Authoritative data  │
│                                            • Swarm status       │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

1. **Node.js** installed on Windows (v18+)
2. **PowerShell 7+** recommended (works with 5.1+)
3. **Git** for repository info
4. **SSH** (optional, for remote orchestrator queries)

### Installation

#### Method 1: Automatic Installation

```powershell
# Navigate to repo
cd C:\Dev\Projects\Repos\Project-Nyra

# Load the script
. .\scripts\powershell-profile-statusline.ps1

# Install to profile
Install-ClaudeFlowStatusline

# Reload profile
. $PROFILE
```

#### Method 2: Manual Installation

1. Open your PowerShell profile:
   ```powershell
   notepad $PROFILE
   ```

2. Add this line at the end:
   ```powershell
   . "C:\Dev\Projects\Repos\Project-Nyra\scripts\powershell-profile-statusline.ps1"
   ```

3. Save and reload:
   ```powershell
   . $PROFILE
   ```

## Usage

### Basic Commands

```powershell
# Show full statusline
cfstatus
# or
Show-ClaudeFlowStatus

# Watch with live updates (refreshes every 5 seconds)
cfwatch
# or
Watch-ClaudeFlowStatus -Interval 10

# Get JSON data
cfjson
# or
Get-ClaudeFlowStatusJson

# Get specific data
$status = cfjson
Write-Host "Active Agents: $($status.swarm.activeAgents)"
Write-Host "Patterns Learned: $($status.v3Progress.patternsLearned)"
```

### Prompt Integration

Add compact status to your PowerShell prompt:

```powershell
# Full compact status in prompt
Set-ClaudeFlowPrompt

# Minimal status (just agents and memory)
Set-ClaudeFlowPrompt -Minimal
```

Example prompts:

```powershell
# Full compact:
[CF:0/35 D:3/5 CVE:0/3] PS C:\Dev\Projects\Repos\Project-Nyra>

# Minimal:
[0🤖 12MB] PS C:\Dev\Projects\Repos\Project-Nyra>
```

### Remote Orchestrator Queries

To query the orchestrator PC (WSL/Linux) for authoritative data:

```powershell
# One-time remote query
Get-ClaudeFlowStatus -Remote

# Always use remote data
$USE_REMOTE_DATA = $true
cfstatus
```

**Prerequisites for remote queries:**
1. SSH access to orchestrator
2. Orchestrator hostname in Tailscale: `orchestrator.tail-net.ts.net`
3. Project repo at `~/Project-Nyra` on orchestrator

## Configuration

Edit `scripts\powershell-profile-statusline.ps1` to customize:

```powershell
# Repository location (Windows path)
$CLAUDE_FLOW_REPO = "C:\Dev\Projects\Repos\Project-Nyra"

# Orchestrator hostname (Tailscale)
$ORCHESTRATOR_HOST = "orchestrator.tail-net.ts.net"

# Use remote data by default
$USE_REMOTE_DATA = $false  # Set to $true for remote
```

## Statusline Output Explained

```
▊ Claude Flow V3 ● ellisapotheosis  │  ⎇ main  │  Opus 4.5
─────────────────────────────────────────────────────
🏗️  DDD Domains    [●●●○○]  3/5    ⚡ 1.0x → 2.49x-7.47x
🤖 Swarm  ○ [ 0/35]  👥 0    🔴 CVE 0/3    💾 12MB    📂  60%    🧠  12%
🔧 Architecture    DDD ●60%  │  Security ●PENDING  │  Memory ●ruvector  │  Integration ●
```

### Symbols & Colors

| Symbol | Meaning |
|--------|---------|
| `▊` | Claude Flow V3 branding |
| `●` | Active/online indicator |
| `○` | Inactive/offline indicator |
| `◉` | Coordination active |
| `⎇` | Git branch |
| `🏗️` | DDD domains progress |
| `🤖` | Swarm agents |
| `👥` | Sub-agents |
| `🔴🟡🟢` | Security status (pending/in-progress/clean) |
| `💾` | Memory usage |
| `📂` | Context percentage |
| `🧠` | Intelligence percentage |
| `⚡` | Performance multiplier |

### Metrics

| Metric | Description |
|--------|-------------|
| **DDD Domains** | Completed domains (3/5 = 60%) |
| **Swarm** | Active agents / max capacity (0/35) |
| **Sub-agents** | Spawned worker agents (👥 0) |
| **CVE** | Fixed CVEs / total critical (0/3) |
| **Memory** | Process memory usage (12MB) |
| **Context** | Session context percentage (60%) |
| **Intelligence** | Learned patterns intelligence (12%) |
| **Performance** | Current → Target speedup (1.0x → 2.49x-7.47x) |

## Examples

### Basic Workflow

```powershell
# Morning standup - check system status
cfstatus

# Start working - watch status while coding
cfwatch

# Check specific metrics for reporting
$status = cfjson
Write-Host "Learning Progress: $($status.v3Progress.patternsLearned) patterns"
Write-Host "Security Status: $($status.security.status)"

# Query orchestrator for authoritative data
cfstatus -Remote
```

### Automation Example

```powershell
# Alert if agents are idle for too long
$status = cfjson
if ($status.swarm.activeAgents -eq 0) {
    Write-Warning "No active agents! Consider spawning swarm."
}

# Check memory usage
if ($status.system.memoryMB -gt 4096) {
    Write-Warning "High memory usage: $($status.system.memoryMB)MB"
}

# Track learning progress
if ($status.v3Progress.patternsLearned -lt 100) {
    Write-Host "Still learning... $($status.v3Progress.patternsLearned) patterns so far"
}
```

### Custom Prompt Example

```powershell
function global:prompt {
    $status = Get-ClaudeFlowStatusJson

    # Custom format: show agents in green if active
    $agents = $status.swarm.activeAgents
    $color = if ($agents -gt 0) { "Green" } else { "DarkGray" }

    Write-Host "[$agents/" -NoNewline -ForegroundColor DarkCyan
    Write-Host "$($status.swarm.maxAgents)" -NoNewline -ForegroundColor $color
    Write-Host "🤖] " -NoNewline -ForegroundColor DarkCyan

    # Show patterns learned
    Write-Host "[$($status.v3Progress.patternsLearned)📚] " -NoNewline -ForegroundColor Magenta

    # Standard prompt
    "PS $(Get-Location)> "
}
```

## Troubleshooting

### Statusline not showing colors

PowerShell 5.1 has limited ANSI color support. Upgrade to PowerShell 7+:

```powershell
winget install Microsoft.PowerShell
```

### Node.js not found

Ensure Node.js is in PATH:

```powershell
node --version  # Should show v18+
```

### SSH connection fails

Check Tailscale connection:

```powershell
# Test SSH connection
ssh orchestrator.tail-net.ts.net "echo 'Connected!'"

# Check Tailscale status
tailscale status
```

### Memory database not found

The statusline looks for memory databases at:
- `.swarm/memory.db`
- `.claude/memory.db`
- `data/memory.db`

Ensure at least one exists:

```powershell
# Initialize memory database
npx @archon-os/cli@latest memory init --force
```

### Config validation warnings

These are non-critical warnings that don't affect statusline functionality:

```
[WARN] Invalid config at C:\Dev\Projects\Repos\Project-Nyra\archon-os.config.json: Required, Expected object, received boolean
```

The system works fine despite these warnings.

## Data Sources

### Local Data (Windows)

When using local data, statusline reads from:

| Data | Source |
|------|--------|
| User info | Git config (`git config user.name`) |
| Branch | Git (`git branch --show-current`) |
| Patterns | `.claude/memory.db` file size |
| Sessions | `.claude/sessions/*.json` files |
| CVEs | `.claude/security-scans/*.json` files |
| Agents | Process list (`ps aux`) |
| Memory | Process memory usage |

### Remote Data (Orchestrator)

When using `-Remote` flag:

| Data | Source |
|------|--------|
| All metrics | SSH to `orchestrator.tail-net.ts.net` |
| Command | `node .claude/helpers/statusline.js` |
| Path | `~/Project-Nyra` on orchestrator |

## Best Practices

1. **Use Remote Data for Production**: Query orchestrator for authoritative swarm status
2. **Use Local Data for Development**: Faster response, no network dependency
3. **Watch Mode for Debugging**: Use `cfwatch` when troubleshooting agent issues
4. **Prompt Integration for Awareness**: Keep compact status in prompt for constant visibility
5. **JSON for Automation**: Use `cfjson` in scripts and automated workflows

## Advanced: Custom Statusline

Create your own statusline script:

```powershell
# Custom compact statusline
function My-ClaudeStatus {
    $s = Get-ClaudeFlowStatusJson
    Write-Host "🤖 $($s.swarm.activeAgents)/$($s.swarm.maxAgents) | " -NoNewline
    Write-Host "📚 $($s.v3Progress.patternsLearned) | " -NoNewline
    Write-Host "🔒 $($s.security.cvesFixed)/$($s.security.totalCves)" -ForegroundColor $(
        if ($s.security.status -eq 'CLEAN') { 'Green' }
        elseif ($s.security.status -eq 'IN_PROGRESS') { 'Yellow' }
        else { 'Red' }
    )
}

# Add to prompt
function global:prompt {
    My-ClaudeStatus
    "PS $(Get-Location)> "
}
```

## Performance

- **Local query**: ~50-100ms (fast, no network)
- **Remote query**: ~200-500ms (depends on SSH latency)
- **Prompt integration**: Adds ~50ms to prompt rendering
- **Watch mode**: Configurable interval (default 5s)

## Security Notes

- **SSH Keys**: Use key-based auth for remote queries (no password prompts)
- **Tailscale**: Encrypted mesh VPN between Windows and orchestrator
- **Local Data**: Read-only access to repo files
- **No Secrets**: Statusline never displays API keys or credentials

## Support

For issues or questions:
- Documentation: `docs/archon-os-V3-SETUP-SUMMARY.md`
- Repository: `C:\Dev\Projects\Repos\Project-Nyra`
- Config: `archon-os.config.json`

---

**Generated**: 2026-01-18
**Version**: Claude Flow V3 Alpha (v3.0.0-alpha.104)
