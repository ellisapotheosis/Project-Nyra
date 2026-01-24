# NYRA PowerShell Profile System - Troubleshooting Guide

## Overview

The NYRA PowerShell profile system is an enhanced, AI-powered terminal setup optimized for multi-agent development workflows. This guide covers common issues, fixes, and maintenance procedures.

## Version Information

- **Current Version**: Enhanced v2.0
- **Bootstrap File**: `bootstrap-enhanced.ps1`
- **Backup Location**: `C:\Dev\Profiles\PowerShell-backup-[timestamp]`

## Quick Fix Commands

### Primary Commands
- `Repair-NYRAProfile` - Automatic repair for most issues
- `Test-ProfileHealth` - Diagnose system health
- `Reset-ProfileEnvironment` - Clean up conflicting environment variables
- `Get-ProfileHelp` - Show all available commands

### Prompt Switching
- `sspeed` - Switch to speed profile (recommended for Warp)
- `sfull` - Switch to full-featured profile
- `sstarship` - Switch to Starship prompt
- `sposh` - Switch to Oh My Posh prompt

## Common Issues and Solutions

### 1. "Unable to create text based on template" Error

**Symptoms**: PowerShell crashes during profile load with template parsing errors

**Root Causes**:
- `NYRA_OMP_CONFIG` pointing to directory instead of file
- Conflicting environment variables between Starship and Oh My Posh
- Corrupted or invalid Oh My Posh theme files

**Solutions**:
```powershell
# Quick fix
Repair-NYRAProfile

# Manual fix
Reset-ProfileEnvironment
Use-Starship  # Fallback to stable prompt
```

### 2. Profile Won't Load or Crashes

**Symptoms**: PowerShell hangs or crashes during startup

**Solutions**:
```powershell
# Emergency fallback (run in clean PowerShell session)
pwsh -NoProfile

# Load safe mode
. 'C:\Dev\Profiles\PowerShell\bootstrap-enhanced.ps1'

# Run repair
Repair-NYRAProfile
```

### 3. Prompt Engine Conflicts

**Symptoms**: Wrong prompt showing, environment variable conflicts

**Solutions**:
```powershell
# Clear all prompt overrides
Clear-PromptOverride
Reset-ProfileEnvironment

# Set specific engine
Use-Starship -Mode ai    # For AI development
Use-Starship -Mode warp  # For Warp terminal
Use-OhMyPosh            # For rich prompts
```

### 4. Warp Terminal Detection Issues

**Symptoms**: Wrong prompt in Warp, performance issues

**Solutions**:
```powershell
# Check detection
Test-TerminalContext
Get-WarpPrompt

# Force Warp mode
Use-Starship -Mode warp
sspeed  # Use speed profile for best performance
```

## Environment Variable Configuration

### Critical Variables

| Variable | Correct Format | Purpose |
|----------|---------------|---------|
| `NYRA_OMP_CONFIG` | `C:\Dev\Profiles\PowerShell\PoshThemes\xulbux-ultimate.omp.json` | Oh My Posh theme file (NOT directory) |
| `STARSHIP_CONFIG` | `C:\Dev\Profiles\PowerShell\Starship\starship-ai.toml` | Starship configuration file |
| `VIRTUAL_ENV_DISABLE_PROMPT` | `1` | Disable Python venv prompts |

### Setting Variables Correctly
```powershell
# Process-level (current session only)
[Environment]::SetEnvironmentVariable("NYRA_OMP_CONFIG", "C:\Dev\Profiles\PowerShell\PoshThemes\xulbux-ultimate.omp.json", "Process")

# User-level (persistent)
[Environment]::SetEnvironmentVariable("NYRA_OMP_CONFIG", "C:\Dev\Profiles\PowerShell\PoshThemes\xulbux-ultimate.omp.json", "User")
```

## File Structure

```
C:\Dev\Profiles\PowerShell\
├── bootstrap-enhanced.ps1          # Main bootstrap (v2.0)
├── bootstrap-safe.ps1              # Fallback bootstrap
├── Microsoft.PowerShell_profile.ps1 # Profile entry point
├── profile-errors.log              # Error log
├── current-variant.txt             # Active profile variant
├── prompt-engine.txt              # Active prompt engine
├── starship-mode.txt              # Starship mode
├── PoshThemes/
│   ├── xulbux-ultimate.omp.json   # Default Oh My Posh theme
│   ├── xulbux-warp-optimized.omp.json
│   └── nyra-neon-xulbux.omp.json
├── Starship/
│   ├── starship.toml              # Main config
│   ├── starship-ai.toml          # AI development optimized
│   └── starship-warp.toml        # Warp terminal optimized
└── profiles/
    ├── profile.speed.ps1          # Speed variant
    ├── profile.full.ps1           # Full-featured variant
    └── profile.minimal.ps1        # Minimal variant
```

## Diagnostic Commands

### Health Check
```powershell
Test-ProfileHealth    # Overall system check
Test-TerminalContext  # Terminal detection analysis
Get-WarpPrompt       # Current configuration
Get-ParentProcess    # Process chain analysis
```

### Logs and Debugging
```powershell
# View error log
Get-Content "C:\Dev\Profiles\PowerShell\profile-errors.log" -Tail 20

# Clear logs
Remove-Item "C:\Dev\Profiles\PowerShell\profile-errors.log" -Force

# Verbose startup
$VerbosePreference = "Continue"
. 'C:\Dev\Profiles\PowerShell\bootstrap-enhanced.ps1'
```

## Maintenance Procedures

### Weekly Maintenance
1. Check error logs: `Get-Content profile-errors.log`
2. Run health check: `Test-ProfileHealth`
3. Update theme files if needed

### Monthly Maintenance
1. Backup profile directory
2. Update Oh My Posh and Starship binaries
3. Review and clean environment variables
4. Test all profile variants

### Before Major Changes
1. Create backup: `Copy-Item -Path "C:\Dev\Profiles\PowerShell" -Destination "C:\Dev\Profiles\PowerShell-backup-$(Get-Date -Format 'yyyy-MM-dd')" -Recurse`
2. Test changes in isolated session: `pwsh -NoProfile`
3. Verify all commands work: `Get-ProfileHelp`

## Recovery Procedures

### Complete Reset (Nuclear Option)
```powershell
# 1. Backup current settings
Copy-Item -Path "C:\Dev\Profiles\PowerShell" -Destination "C:\Dev\Profiles\PowerShell-emergency-backup" -Recurse

# 2. Reset to defaults
'speed' | Set-Content -Path "C:\Dev\Profiles\PowerShell\current-variant.txt"
'starship' | Set-Content -Path "C:\Dev\Profiles\PowerShell\prompt-engine.txt"
'ai' | Set-Content -Path "C:\Dev\Profiles\PowerShell\starship-mode.txt"

# 3. Clear environment variables
$env:NYRA_OMP_CONFIG = $null
$env:POSH_SESSION_ID = $null
$env:POSH_THEME = $null

# 4. Reload profile
. $PROFILE
```

### Restore from Backup
```powershell
# List available backups
Get-ChildItem "C:\Dev\Profiles" -Filter "*PowerShell-backup*" | Select-Object Name, CreationTime

# Restore specific backup
$backupDate = "2025-09-29_03-14-37"  # Replace with desired backup
Remove-Item "C:\Dev\Profiles\PowerShell" -Recurse -Force
Move-Item "C:\Dev\Profiles\PowerShell-backup-$backupDate" "C:\Dev\Profiles\PowerShell"
```

## Advanced Configuration

### Custom Oh My Posh Themes
```powershell
# Validate theme before use
Test-OhMyPoshTemplate -ConfigPath "path\to\theme.omp.json"

# Use custom theme
Use-OhMyPosh -ConfigPath "path\to\theme.omp.json"
```

### Custom Starship Configuration
```powershell
# Use custom config
Use-Starship -ConfigPath "path\to\starship.toml" -Mode custom
```

### Integration with NYRA Project

The profile system is optimized for the NYRA mortgage assistant project:
- UV Python environment detection
- Multi-agent workflow shortcuts
- Docker context awareness
- Git branch and status optimization
- Memory and performance monitoring

### Performance Optimization

For best performance:
1. Use `sspeed` profile variant in Warp
2. Use Starship instead of Oh My Posh in Warp
3. Keep Starship config minimal for Warp mode
4. Monitor startup times with `Measure-Command`

## Support and Troubleshooting

### When to Use Each Command

| Issue | Command | When to Use |
|-------|---------|-------------|
| General problems | `Repair-NYRAProfile` | First attempt at any issue |
| Startup crashes | `pwsh -NoProfile` then repair | Emergency access needed |
| Wrong prompt showing | `Use-Starship` or `Use-OhMyPosh` | Need specific prompt engine |
| Environment conflicts | `Reset-ProfileEnvironment` | Variables are corrupted |
| Performance issues | `sspeed` + `Use-Starship` | Slow startup/response |
| Unknown state | `Test-ProfileHealth` | Need to diagnose problem |

### Error Log Analysis

Common log patterns and meanings:
- `Template validation failed`: Oh My Posh config issue
- `Warp detection failed`: Terminal detection timeout
- `Profile health issues found`: Missing files/commands
- `Bootstrap error`: Critical startup failure

---

*This guide is part of the NYRA project PowerShell enhancement system. For questions or issues not covered here, check the error logs and run the diagnostic commands.*