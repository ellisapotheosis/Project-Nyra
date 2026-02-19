# ============================================================================
# Claude Flow V3 Statusline - PowerShell Integration
# ============================================================================
# Add this to your PowerShell profile for statusline integration
# Location: $PROFILE (usually C:\Users\<username>\Documents\PowerShell\Microsoft.PowerShell_profile.ps1)
#
# Quick Install:
#   1. Open PowerShell as Administrator
#   2. Run: . .\scripts\powershell-profile-statusline.ps1
#   3. Run: Install-ClaudeFlowStatusline
# ============================================================================

# Configuration
$CLAUDE_FLOW_REPO = "C:\Dev\Projects\Repos\Project-Nyra"
$ORCHESTRATOR_HOST = "orchestrator.tail-net.ts.net"  # Tailscale hostname
$USE_REMOTE_DATA = $false  # Set to $true to query orchestrator via SSH

# ============================================================================
# Statusline Functions
# ============================================================================

function Get-JavaScriptRuntime {
    <#
    .SYNOPSIS
        Detect available JavaScript runtime (Node.js or Bun)
    .DESCRIPTION
        Returns 'node' or 'bun' depending on which is available, or $null if neither
    #>
    if (Get-Command node -ErrorAction SilentlyContinue) {
        return 'node'
    }
    elseif (Get-Command bun -ErrorAction SilentlyContinue) {
        return 'bun'
    }
    return $null
}

function Get-ClaudeFlowStatus {
    <#
    .SYNOPSIS
        Get Claude Flow V3 status information
    .DESCRIPTION
        Retrieves real-time status from local repo or remote orchestrator
    .PARAMETER Json
        Return data in JSON format
    .PARAMETER Compact
        Return compact JSON (single line)
    .PARAMETER Remote
        Query orchestrator instead of local data
    .EXAMPLE
        Get-ClaudeFlowStatus
        Get-ClaudeFlowStatus -Json
        Get-ClaudeFlowStatus -Remote
    #>
    [CmdletBinding()]
    param(
        [switch]$Json,
        [switch]$Compact,
        [switch]$Remote
    )

    $originalLocation = Get-Location

    try {
        # Navigate to repo
        Set-Location $CLAUDE_FLOW_REPO

        # Determine data source
        if ($Remote -or $USE_REMOTE_DATA) {
            # Query orchestrator via SSH
            Write-Verbose "Querying orchestrator at $ORCHESTRATOR_HOST"

            # Check if SSH is available
            if (!(Get-Command ssh -ErrorAction SilentlyContinue)) {
                Write-Warning "SSH not found. Install OpenSSH or use local data."
                return
            }

            # Run statusline on remote orchestrator
            $remoteCmd = "cd ~/Project-Nyra && node .claude/helpers/statusline.js"
            if ($Json) { $remoteCmd += " --json" }
            if ($Compact) { $remoteCmd += " --compact" }

            $result = ssh $ORCHESTRATOR_HOST $remoteCmd 2>$null

            if ($LASTEXITCODE -ne 0) {
                Write-Warning "Failed to connect to orchestrator. Using local data."
                $Remote = $false
            } else {
                return $result
            }
        }

        # Use local data
        if (!(Test-Path ".claude\helpers\statusline.js")) {
            Write-Error "Statusline script not found at: $CLAUDE_FLOW_REPO\.claude\helpers\statusline.js"
            return
        }

        # Detect JavaScript runtime (Node.js or Bun)
        $runtime = Get-JavaScriptRuntime
        if (-not $runtime) {
            Write-Error "No JavaScript runtime found. Install Node.js (https://nodejs.org) or Bun (https://bun.sh)"
            return
        }

        $args = @()
        if ($Json) { $args += "--json" }
        if ($Compact) { $args += "--compact" }

        # Run local statusline with detected runtime
        $result = & $runtime ".claude\helpers\statusline.js" @args 2>$null

        return $result
    }
    catch {
        Write-Error "Failed to get Claude Flow status: $_"
    }
    finally {
        Set-Location $originalLocation
    }
}

function Show-ClaudeFlowStatus {
    <#
    .SYNOPSIS
        Display Claude Flow V3 statusline with colors
    .DESCRIPTION
        Shows the full formatted statusline with ANSI colors
    .EXAMPLE
        Show-ClaudeFlowStatus
    #>
    Get-ClaudeFlowStatus
}

function Get-ClaudeFlowStatusJson {
    <#
    .SYNOPSIS
        Get Claude Flow status as JSON object
    .DESCRIPTION
        Returns parsed JSON object with status data
    .EXAMPLE
        $status = Get-ClaudeFlowStatusJson
        Write-Host "Active Agents: $($status.swarm.activeAgents)"
    #>
    $json = Get-ClaudeFlowStatus -Json
    if ($json) {
        return $json | ConvertFrom-Json
    }
}

function Watch-ClaudeFlowStatus {
    <#
    .SYNOPSIS
        Continuously watch Claude Flow status
    .DESCRIPTION
        Refreshes status display every N seconds
    .PARAMETER Interval
        Refresh interval in seconds (default: 5)
    .EXAMPLE
        Watch-ClaudeFlowStatus
        Watch-ClaudeFlowStatus -Interval 10
    #>
    param(
        [int]$Interval = 5
    )

    Write-Host "Watching Claude Flow status (Ctrl+C to stop)..." -ForegroundColor Yellow
    Write-Host ""

    while ($true) {
        Clear-Host
        Show-ClaudeFlowStatus
        Write-Host ""
        Write-Host "Refreshing every $Interval seconds... (Ctrl+C to stop)" -ForegroundColor DarkGray
        Start-Sleep -Seconds $Interval
    }
}

# ============================================================================
# Prompt Integration (Optional)
# ============================================================================

function Set-ClaudeFlowPrompt {
    <#
    .SYNOPSIS
        Add Claude Flow status to PowerShell prompt
    .DESCRIPTION
        Adds a compact statusline to your PowerShell prompt
    .PARAMETER Minimal
        Show minimal status (just agent count and memory)
    .EXAMPLE
        Set-ClaudeFlowPrompt
        Set-ClaudeFlowPrompt -Minimal
    #>
    param([switch]$Minimal)

    function global:prompt {
        $status = Get-ClaudeFlowStatusJson

        if ($Minimal) {
            # Minimal: Just agents and memory
            $agents = $status.swarm.activeAgents
            $memory = $status.system.memoryMB
            Write-Host "[$agents🤖 $memory`MB] " -NoNewline -ForegroundColor Cyan
        } else {
            # Full compact status
            $agents = $status.swarm.activeAgents
            $maxAgents = $status.swarm.maxAgents
            $domains = $status.v3Progress.domainsCompleted
            $totalDomains = $status.v3Progress.totalDomains
            $cves = $status.security.cvesFixed
            $totalCves = $status.security.totalCves

            Write-Host "[CF:" -NoNewline -ForegroundColor DarkCyan
            Write-Host "$agents/$maxAgents" -NoNewline -ForegroundColor $(if ($agents -gt 0) { "Green" } else { "DarkGray" })
            Write-Host " D:" -NoNewline -ForegroundColor DarkCyan
            Write-Host "$domains/$totalDomains" -NoNewline -ForegroundColor $(if ($domains -ge 3) { "Green" } elseif ($domains -gt 0) { "Yellow" } else { "Red" })
            Write-Host " CVE:" -NoNewline -ForegroundColor DarkCyan
            Write-Host "$cves/$totalCves" -NoNewline -ForegroundColor $(if ($cves -eq $totalCves) { "Green" } elseif ($cves -gt 0) { "Yellow" } else { "Red" })
            Write-Host "] " -NoNewline -ForegroundColor DarkCyan
        }

        # Standard prompt
        Write-Host "PS " -NoNewline -ForegroundColor Yellow
        Write-Host (Get-Location) -NoNewline -ForegroundColor Blue
        return "> "
    }

    Write-Host "Claude Flow prompt integration enabled!" -ForegroundColor Green
    Write-Host "Your prompt now shows real-time status." -ForegroundColor Green
}

# ============================================================================
# Aliases
# ============================================================================

Set-Alias -Name cfstatus -Value Get-ClaudeFlowStatus -ErrorAction SilentlyContinue
Set-Alias -Name cfshow -Value Show-ClaudeFlowStatus -ErrorAction SilentlyContinue
Set-Alias -Name cfwatch -Value Watch-ClaudeFlowStatus -ErrorAction SilentlyContinue
Set-Alias -Name cfjson -Value Get-ClaudeFlowStatusJson -ErrorAction SilentlyContinue

# ============================================================================
# Installation Function
# ============================================================================

function Install-ClaudeFlowStatusline {
    <#
    .SYNOPSIS
        Install Claude Flow statusline to PowerShell profile
    .DESCRIPTION
        Adds the statusline functions to your PowerShell profile
    .PARAMETER WithPrompt
        Also integrate statusline into prompt
    .EXAMPLE
        Install-ClaudeFlowStatusline
        Install-ClaudeFlowStatusline -WithPrompt
    #>
    param([switch]$WithPrompt)

    Write-Host "Installing Claude Flow V3 Statusline..." -ForegroundColor Cyan
    Write-Host ""

    # Check if profile exists
    if (!(Test-Path $PROFILE)) {
        Write-Host "Creating PowerShell profile at: $PROFILE" -ForegroundColor Yellow
        New-Item -Path $PROFILE -ItemType File -Force | Out-Null
    }

    # Check if already installed
    $profileContent = Get-Content $PROFILE -Raw -ErrorAction SilentlyContinue
    if ($profileContent -match "Claude Flow V3 Statusline") {
        Write-Warning "Claude Flow statusline already installed in profile."
        Write-Host "Edit $PROFILE to modify settings." -ForegroundColor Yellow
        return
    }

    # Add source line to profile
    $sourceCommand = @"

# ============================================================================
# Claude Flow V3 Statusline Integration
# ============================================================================
. "$CLAUDE_FLOW_REPO\scripts\powershell-profile-statusline.ps1"
"@

    if ($WithPrompt) {
        $sourceCommand += @"

# Auto-enable prompt integration
Set-ClaudeFlowPrompt

"@
    }

    Add-Content -Path $PROFILE -Value $sourceCommand

    Write-Host "✓ Installation complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Cyan
    Write-Host "  cfstatus          - Show statusline" -ForegroundColor White
    Write-Host "  cfwatch           - Watch statusline (live updates)" -ForegroundColor White
    Write-Host "  cfjson            - Get status as JSON" -ForegroundColor White
    Write-Host "  Set-ClaudeFlowPrompt - Add to prompt" -ForegroundColor White
    Write-Host ""
    Write-Host "Reload your profile: . `$PROFILE" -ForegroundColor Yellow
}

# ============================================================================
# Auto-load message
# ============================================================================

if ($MyInvocation.InvocationName -ne '.') {
    Write-Host "Claude Flow V3 Statusline Functions Loaded" -ForegroundColor Green
    Write-Host "Run 'Get-Help Install-ClaudeFlowStatusline' for installation" -ForegroundColor DarkGray
}
