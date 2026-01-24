# Project Nyra PowerShell Module
# Integrates with NYRA Bootstrap System v5.0
# Provides Project Nyra specific functions, aliases, and paths

#region Configuration
$script:ProjectNyraRoot = "C:\Dev\DevProjects\Personal-Projects\Project-Nyra"
$script:ClaudeFlowPath = Join-Path $script:ProjectNyraRoot "claude-flow.cmd"
#endregion

#region Volta Integration Enhancement
function Initialize-VoltaForNyra {
    <#
    .SYNOPSIS
    Enhanced Volta initialization specifically for Project Nyra
    Supplements the base Initialize-NodeEnvironment from bootstrap
    #>

    $voltaHome = "$env:LOCALAPPDATA\Volta"
    $voltaBin = Join-Path $voltaHome "bin"

    if (Test-Path $voltaBin) {
        # Volta already added by bootstrap, just verify
        if (Get-Command volta -ErrorAction SilentlyContinue) {
            try {
                $voltaVersion = volta --version 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Verbose "Project Nyra: Volta $voltaVersion configured"

                    # Set volta home for consistency
                    $env:VOLTA_HOME = $voltaHome

                    return $true
                }
            } catch {
                Write-Warning "Project Nyra: Volta detection failed"
            }
        }
    }

    Write-Warning "Project Nyra: Volta not found. Install from https://volta.sh"
    return $false
}
#endregion

#region Project Navigation
function cdnyra {
    <#
    .SYNOPSIS
    Navigate to Project Nyra root directory
    #>
    Set-Location $script:ProjectNyraRoot
}

function cdnyra-claude {
    <#
    .SYNOPSIS
    Navigate to Project Nyra claude-flow directory
    #>
    $claudeDir = Join-Path $script:ProjectNyraRoot "nyra-orchestration\claude\claude-flow"
    if (Test-Path $claudeDir) {
        Set-Location $claudeDir
    } else {
        Write-Warning "Claude-flow directory not found: $claudeDir"
    }
}

function cdnyra-orch {
    <#
    .SYNOPSIS
    Navigate to Project Nyra orchestration directory
    #>
    $orchDir = Join-Path $script:ProjectNyraRoot "nyra-orchestration"
    if (Test-Path $orchDir) {
        Set-Location $orchDir
    } else {
        Write-Warning "Orchestration directory not found: $orchDir"
    }
}
#endregion

#region Claude-Flow Integration
function nyra-flow {
    <#
    .SYNOPSIS
    Run claude-flow commands in Project Nyra context
    .EXAMPLE
    nyra-flow status
    nyra-flow start --ui
    nyra-flow swarm "task description"
    #>
    param(
        [Parameter(ValueFromRemainingArguments=$true)]
        [string[]]$Arguments
    )

    if (-not (Test-Path $script:ProjectNyraRoot)) {
        Write-Error "Project Nyra root not found: $script:ProjectNyraRoot"
        return
    }

    Push-Location $script:ProjectNyraRoot
    try {
        if (Test-Path $script:ClaudeFlowPath) {
            & $script:ClaudeFlowPath @Arguments
        } else {
            # Fallback to npx
            npx claude-flow@alpha @Arguments
        }
    } finally {
        Pop-Location
    }
}

function nyra-flow-ui {
    <#
    .SYNOPSIS
    Start Claude-Flow UI for Project Nyra
    #>
    Write-Host "Starting Claude-Flow UI for Project Nyra..." -ForegroundColor Cyan
    nyra-flow start --ui
}

function nyra-flow-status {
    <#
    .SYNOPSIS
    Get Claude-Flow status for Project Nyra
    #>
    nyra-flow status
}

function nyra-sparc {
    <#
    .SYNOPSIS
    Run SPARC workflows for Project Nyra
    .EXAMPLE
    nyra-sparc modes
    nyra-sparc run spec-pseudocode "Build REST API"
    nyra-sparc tdd "User authentication"
    #>
    param(
        [Parameter(ValueFromRemainingArguments=$true)]
        [string[]]$Arguments
    )

    nyra-flow sparc @Arguments
}
#endregion

#region Infisical Integration
function nyra-secrets {
    <#
    .SYNOPSIS
    Run Project Nyra commands with Infisical secrets
    .EXAMPLE
    nyra-secrets { nyra-flow status }
    nyra-secrets { ./scripts/setup/test-infrastructure.sh }
    #>
    param(
        [Parameter(Mandatory=$true)]
        [ScriptBlock]$Command
    )

    if (-not (Get-Command infisical -ErrorAction SilentlyContinue)) {
        Write-Error "Infisical CLI not installed. Install from https://infisical.com/docs/cli/overview"
        return
    }

    Push-Location $script:ProjectNyraRoot
    try {
        infisical run -- pwsh -NoProfile -Command $Command
    } finally {
        Pop-Location
    }
}

function nyra-login {
    <#
    .SYNOPSIS
    Login to Infisical for Project Nyra secrets
    #>
    if (Get-Command infisical -ErrorAction SilentlyContinue) {
        infisical login
        infisical whoami
    } else {
        Write-Error "Infisical CLI not installed"
    }
}
#endregion

#region Docker & Infrastructure
function nyra-docker {
    <#
    .SYNOPSIS
    Docker operations for Project Nyra
    .EXAMPLE
    nyra-docker up
    nyra-docker down
    nyra-docker ps
    #>
    param(
        [Parameter(ValueFromRemainingArguments=$true)]
        [string[]]$Arguments
    )

    Push-Location $script:ProjectNyraRoot
    try {
        docker compose @Arguments
    } finally {
        Pop-Location
    }
}

function nyra-logs {
    <#
    .SYNOPSIS
    View Project Nyra logs
    .PARAMETER Service
    Service to view logs for (orchestrator, worker, tunnel, claude-flow)
    #>
    param(
        [ValidateSet('orchestrator','worker','tunnel','claude-flow','all')]
        [string]$Service = 'all'
    )

    Push-Location $script:ProjectNyraRoot
    try {
        switch ($Service) {
            'claude-flow' { Get-Content "logs\claude-flow.log" -Tail 50 -Wait }
            'all' { docker compose logs -f }
            default { docker compose logs -f $Service }
        }
    } finally {
        Pop-Location
    }
}
#endregion

#region Git Operations
function nyra-git-status {
    <#
    .SYNOPSIS
    Git status for Project Nyra
    #>
    Push-Location $script:ProjectNyraRoot
    try {
        git status
    } finally {
        Pop-Location
    }
}

function nyra-git-pull {
    <#
    .SYNOPSIS
    Git pull for Project Nyra
    #>
    Push-Location $script:ProjectNyraRoot
    try {
        git pull
    } finally {
        Pop-Location
    }
}
#endregion

#region Module Initialization
function Initialize-ProjectNyra {
    <#
    .SYNOPSIS
    Initialize Project Nyra environment (called automatically on module load)
    #>

    # Verify project exists
    if (-not (Test-Path $script:ProjectNyraRoot)) {
        Write-Warning "Project Nyra root not found: $script:ProjectNyraRoot"
        return
    }

    # Initialize Volta
    Initialize-VoltaForNyra | Out-Null

    # Set environment variables
    $env:NYRA_PROJECT_ROOT = $script:ProjectNyraRoot

    Write-Verbose "Project Nyra module loaded (Root: $script:ProjectNyraRoot)"
}

# Auto-initialize on module load
Initialize-ProjectNyra
#endregion

#region Exports
# Export functions
Export-ModuleMember -Function @(
    'cdnyra', 'cdnyra-claude', 'cdnyra-orch',
    'nyra-flow', 'nyra-flow-ui', 'nyra-flow-status', 'nyra-sparc',
    'nyra-secrets', 'nyra-login',
    'nyra-docker', 'nyra-logs',
    'nyra-git-status', 'nyra-git-pull',
    'Initialize-VoltaForNyra'
)

# Legacy aliases for backwards compatibility
Set-Alias -Name nf -Value nyra-flow -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name nfs -Value nyra-flow-status -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name nfu -Value nyra-flow-ui -Scope Global -ErrorAction SilentlyContinue
#endregion
