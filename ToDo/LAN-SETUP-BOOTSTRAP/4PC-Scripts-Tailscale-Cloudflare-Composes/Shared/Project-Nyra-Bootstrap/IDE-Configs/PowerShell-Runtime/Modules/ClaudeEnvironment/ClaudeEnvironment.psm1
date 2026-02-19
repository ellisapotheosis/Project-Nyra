# ==================== Claude Environment Detection Module ====================
# Detects Claude Code, Claude Flow, and Archon MCP activity in PowerShell sessions
# Auto-switches to optimized Starship prompts for better AI-assisted development
#
# Features:
# - Claude Code detection (process, environment variables)
# - Claude Flow detection (port, process, cwd markers)
# - Archon MCP detection (orchestrator activity)
# - WSL compatibility helpers
# - Auto-profile switching with Oh-My-Posh fallback

#region Core Detection Functions

function Test-ClaudeCodeActive {
    <#
    .SYNOPSIS
    Detects if Claude Code is currently active in the session
    #>
    
    # Check environment variables set by Claude Code
    $claudeEnvVars = @(
        'CLAUDE_CODE_SESSION',
        'ANTHROPIC_CLAUDE_SDK',
        'CLAUDE_API_KEY'
    )
    
    foreach ($var in $claudeEnvVars) {
        if (Test-Path "env:$var") {
            return $true
        }
    }
    
    # Check for Claude Code process
    $claudeProcesses = @('claude-code', 'claude', 'anthropic-cli')
    foreach ($proc in $claudeProcesses) {
        if (Get-Process -Name $proc -ErrorAction SilentlyContinue) {
            return $true
        }
    }
    
    # Check working directory for Claude Code markers
    $claudeMarkers = @('.claude', 'claude.json', '.anthropic')
    foreach ($marker in $claudeMarkers) {
        if (Test-Path (Join-Path $PWD $marker)) {
            return $true
        }
    }
    
    return $false
}

function Test-ClaudeFlowActive {
    <#
    .SYNOPSIS
    Detects if Claude Flow development server is running
    #>
    
    # Check for Claude Flow environment variable
    if ($env:CLAUDE_FLOW_ACTIVE -eq '1') {
        return $true
    }
    
    # Check for Claude Flow process
    if (Get-Process -Name 'node' -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like '*claude-flow*'
    }) {
        return $true
    }
    
    # Check default Claude Flow port (3000)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($connection) {
            # Verify it's actually Claude Flow by checking process
            $nodeProcs = Get-Process -Name node -ErrorAction SilentlyContinue
            foreach ($proc in $nodeProcs) {
                try {
                    $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
                    if ($cmdLine -like '*claude-flow*' -or $cmdLine -like '*pnpm*dev*') {
                        return $true
                    }
                } catch {}
            }
        }
    } catch {}
    
    # Check working directory
    $cfPath = 'C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-orchestration\Claude\claude-flow'
    if ($PWD.Path -like "$cfPath*") {
        return $true
    }
    
    return $false
}

function Test-ArchonMCPActive {
    <#
    .SYNOPSIS
    Detects if Archon MCP orchestrator is active
    #>
    
    # Check Archon environment variable
    if ($env:ARCHON_MCP_ACTIVE -eq '1' -or $env:MCP_ORCHESTRATOR -eq 'archon') {
        return $true
    }
    
    # Check for Archon process
    if (Get-Process -Name 'archon-mcp' -ErrorAction SilentlyContinue) {
        return $true
    }
    
    # Check Archon MCP port (default 8080)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port 8080 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($connection) {
            return $true
        }
    } catch {}
    
    return $false
}

function Get-ClaudeEnvironmentContext {
    <#
    .SYNOPSIS
    Returns comprehensive Claude environment context
    #>
    
    $context = @{
        ClaudeCode = Test-ClaudeCodeActive
        ClaudeFlow = Test-ClaudeFlowActive
        ArchonMCP = Test-ArchonMCPActive
        IsWSL = ($env:WSL_DISTRO_NAME -or $env:WSL_INTEROP)
        IsDevContainer = ($env:REMOTE_CONTAINERS -eq 'true')
        IsVSCode = ($env:TERM_PROGRAM -eq 'vscode')
        SuggestedPrompt = 'omp'  # Default
    }
    
    # Determine suggested prompt engine
    if ($context.ClaudeCode -or $context.ClaudeFlow -or $context.ArchonMCP) {
        $context.SuggestedPrompt = 'starship-claude'
    }
    
    return $context
}

#endregion

#region Profile Switching Functions

function Switch-ToClaudeProfile {
    <#
    .SYNOPSIS
    Switch to Claude-optimized Starship profile
    #>
    
    param([switch]$Force)
    
    $context = Get-ClaudeEnvironmentContext
    
    if (-not $context.ClaudeCode -and -not $context.ClaudeFlow -and -not $context.ArchonMCP -and -not $Force) {
        Write-Warning "No Claude environment detected. Use -Force to switch anyway."
        return $false
    }
    
    # Set environment marker
    $env:CLAUDE_ENVIRONMENT = '1'
    
    # Switch to Starship with Claude config
    $claudeStarshipConfig = 'C:\Dev\IDE-Configs\PowerShell-Runtime\starship\starship-claude.toml'
    
    if (Test-Path $claudeStarshipConfig) {
        $env:STARSHIP_CONFIG = $claudeStarshipConfig
        
        if (Get-Command starship -ErrorAction SilentlyContinue) {
            try {
                Invoke-Expression (& starship init powershell)
                Write-Host "✨ Claude Environment activated (Starship)" -ForegroundColor Cyan
                return $true
            } catch {
                Write-Warning "Failed to initialize Starship: $($_.Exception.Message)"
            }
        }
    } else {
        Write-Warning "Claude Starship config not found at $claudeStarshipConfig"
    }
    
    return $false
}

function Switch-ToDefaultProfile {
    <#
    .SYNOPSIS
    Switch back to default Oh-My-Posh profile
    #>
    
    $env:CLAUDE_ENVIRONMENT = $null
    
    if (Get-Command oh-my-posh -ErrorAction SilentlyContinue) {
        $ompConfig = 'C:\Dev\IDE-Configs\PowerShell-Runtime\PoshThemes\xulbux-ultimate.omp.json'
        
        if (Test-Path $ompConfig) {
            try {
                Invoke-Expression (& oh-my-posh init pwsh --config $ompConfig)
                Write-Host "◆ Default profile activated (Oh-My-Posh)" -ForegroundColor Magenta
                return $true
            } catch {
                Write-Warning "Failed to initialize Oh-My-Posh: $($_.Exception.Message)"
            }
        }
    }
    
    return $false
}

function Initialize-ClaudeAutoDetection {
    <#
    .SYNOPSIS
    Enable automatic Claude environment detection and profile switching
    #>
    
    $context = Get-ClaudeEnvironmentContext
    
    if ($context.ClaudeCode -or $context.ClaudeFlow -or $context.ArchonMCP) {
        Write-Host "🤖 Claude environment detected:" -ForegroundColor Cyan
        if ($context.ClaudeCode) { Write-Host "   • Claude Code: Active" -ForegroundColor Green }
        if ($context.ClaudeFlow) { Write-Host "   • Claude Flow: Running" -ForegroundColor Green }
        if ($context.ArchonMCP) { Write-Host "   • Archon MCP: Active" -ForegroundColor Green }
        
        return Switch-ToClaudeProfile
    }
    
    return $false
}

#endregion

#region WSL Integration Functions

function Get-WSLClaudeSetup {
    <#
    .SYNOPSIS
    Generate bashrc additions for Claude in WSL
    #>
    
    @"
# ==================== Claude Environment Setup for WSL ====================
# Auto-generated by ClaudeEnvironment PowerShell Module

# Claude Flow PATH additions
export CLAUDE_FLOW_PATH="/mnt/c/Dev/DevProjects/Personal-Projects/Project-Nyra/nyra-orchestration/Claude/claude-flow"

# Node.js via Volta (Windows-installed, accessible via WSL)
export VOLTA_HOME="/mnt/c/Users/edane/AppData/Local/Volta"
export PATH="`$VOLTA_HOME/bin:`$PATH"

# PNPM global bin
export PNPM_HOME="/mnt/c/Users/edane/AppData/Local/pnpm"
export PATH="`$PNPM_HOME:`$PATH"

# Claude environment markers
export CLAUDE_WSL_MODE=1

# Aliases for Claude development
alias cf='cd `$CLAUDE_FLOW_PATH'
alias cf-start='cd `$CLAUDE_FLOW_PATH && pnpm dev'
alias cf-build='cd `$CLAUDE_FLOW_PATH && pnpm build'
alias cf-test='cd `$CLAUDE_FLOW_PATH && pnpm test'

# Starship prompt for Claude (if installed)
if command -v starship &> /dev/null; then
    eval "`$(starship init bash)"
    export STARSHIP_CONFIG="/mnt/c/Dev/IDE-Configs/PowerShell-Runtime/starship/starship-claude.toml"
fi

# Git config optimizations for Claude
git config --global core.autocrlf input
git config --global core.filemode false  # Ignore Windows permission changes

echo "🤖 Claude WSL environment loaded"
"@
}

function Install-WSLClaudeProfile {
    <#
    .SYNOPSIS
    Install Claude profile additions to WSL bashrc
    #>
    
    param([string]$WSLDistro = 'Ubuntu')
    
    $bashrcContent = Get-WSLClaudeSetup
    $tempFile = [System.IO.Path]::GetTempFileName()
    
    try {
        $bashrcContent | Set-Content -Path $tempFile -Encoding UTF8
        
        # Copy to WSL
        wsl -d $WSLDistro bash -c "mkdir -p ~/.config/claude"
        Get-Content $tempFile | wsl -d $WSLDistro bash -c "cat > ~/.config/claude/claude-env.sh"
        
        # Add source line to bashrc if not present
        $checkCmd = "grep -q 'claude-env.sh' ~/.bashrc || echo 'source ~/.config/claude/claude-env.sh' >> ~/.bashrc"
        wsl -d $WSLDistro bash -c $checkCmd
        
        Write-Host "✅ Claude WSL profile installed to $WSLDistro" -ForegroundColor Green
        Write-Host "   Run: wsl -d $WSLDistro bash" -ForegroundColor Cyan
        
        return $true
    } catch {
        Write-Warning "Failed to install WSL profile: $($_.Exception.Message)"
        return $false
    } finally {
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
}

#endregion

#region Helper Functions

function Show-ClaudeEnvironmentStatus {
    <#
    .SYNOPSIS
    Display current Claude environment status
    #>
    
    $context = Get-ClaudeEnvironmentContext
    
    Write-Host "`n🤖 Claude Environment Status" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    
    $status = if ($context.ClaudeCode) { "✓ Active" } else { "✗ Inactive" }
    $color = if ($context.ClaudeCode) { "Green" } else { "Gray" }
    Write-Host "  Claude Code:      " -NoNewline
    Write-Host $status -ForegroundColor $color
    
    $status = if ($context.ClaudeFlow) { "✓ Running" } else { "✗ Stopped" }
    $color = if ($context.ClaudeFlow) { "Green" } else { "Gray" }
    Write-Host "  Claude Flow:      " -NoNewline
    Write-Host $status -ForegroundColor $color
    
    $status = if ($context.ArchonMCP) { "✓ Active" } else { "✗ Inactive" }
    $color = if ($context.ArchonMCP) { "Green" } else { "Gray" }
    Write-Host "  Archon MCP:       " -NoNewline
    Write-Host $status -ForegroundColor $color
    
    Write-Host "`n  Environment:      " -NoNewline
    if ($context.IsWSL) { 
        Write-Host "WSL ($env:WSL_DISTRO_NAME)" -ForegroundColor Yellow 
    } elseif ($context.IsDevContainer) {
        Write-Host "DevContainer" -ForegroundColor Blue
    } elseif ($context.IsVSCode) {
        Write-Host "VS Code" -ForegroundColor Cyan
    } else {
        Write-Host "Windows (Native)" -ForegroundColor White
    }
    
    Write-Host "  Suggested Prompt: " -NoNewline
    Write-Host $context.SuggestedPrompt -ForegroundColor Magenta
    Write-Host ""
}

function Start-ClaudeFlowDev {
    <#
    .SYNOPSIS
    Start Claude Flow development server with proper environment
    #>
    
    param(
        [switch]$WSL,
        [string]$Port = "3000"
    )
    
    $cfPath = 'C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-orchestration\Claude\claude-flow'
    
    if ($WSL) {
        $wslPath = '/mnt/c/Dev/DevProjects/Personal-Projects/Project-Nyra/nyra-orchestration/Claude/claude-flow'
        Write-Host "🚀 Starting Claude Flow in WSL..." -ForegroundColor Cyan
        wsl bash -c "cd $wslPath && export CLAUDE_FLOW_ACTIVE=1 && pnpm dev"
    } else {
        if (-not (Test-Path $cfPath)) {
            Write-Error "Claude Flow path not found: $cfPath"
            return
        }
        
        Push-Location $cfPath
        try {
            $env:CLAUDE_FLOW_ACTIVE = '1'
            $env:PORT = $Port
            Write-Host "🚀 Starting Claude Flow on port $Port..." -ForegroundColor Cyan
            pnpm dev
        } finally {
            Pop-Location
            $env:CLAUDE_FLOW_ACTIVE = $null
        }
    }
}

#endregion

#region Export Module Members

Export-ModuleMember -Function @(
    'Test-ClaudeCodeActive',
    'Test-ClaudeFlowActive',
    'Test-ArchonMCPActive',
    'Get-ClaudeEnvironmentContext',
    'Switch-ToClaudeProfile',
    'Switch-ToDefaultProfile',
    'Initialize-ClaudeAutoDetection',
    'Get-WSLClaudeSetup',
    'Install-WSLClaudeProfile',
    'Show-ClaudeEnvironmentStatus',
    'Start-ClaudeFlowDev'
)

# Aliases for convenience
Set-Alias -Name 'claude-status' -Value 'Show-ClaudeEnvironmentStatus'
Set-Alias -Name 'claude-on' -Value 'Switch-ToClaudeProfile'
Set-Alias -Name 'claude-off' -Value 'Switch-ToDefaultProfile'
Set-Alias -Name 'cf-start' -Value 'Start-ClaudeFlowDev'

Export-ModuleMember -Alias @('claude-status', 'claude-on', 'claude-off', 'cf-start')

#endregion
