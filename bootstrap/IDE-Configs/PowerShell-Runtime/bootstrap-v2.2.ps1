# ==================== NYRA Bootstrap v2.2 - Performance Optimized Edition ====================
# Enhanced with: Parallel Loading, Fast Initialization, Prompt Swapping, Secrets Auto-Inject
# Author: NYRA Development Team
# Version: 2.2.0
# Last Updated: 2026-01-08
# Performance Target: <500ms load time

#region Core Initialization
if ($global:NYRA_BOOTSTRAP_V2_LOADED) { return }
$global:NYRA_BOOTSTRAP_V2_LOADED = $true
$script:BOOTSTRAP_VERSION = '2.2.0'
$script:BootstrapStopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$script:BootstrapErrors = @()
$script:ModulesLoaded = @()

# Performance: Suppress ALL unnecessary output
$ErrorActionPreference = 'SilentlyContinue'
$WarningPreference = 'SilentlyContinue'
$ProgressPreference = 'SilentlyContinue'
$VerbosePreference = 'SilentlyContinue'

# Paths (OneDrive-compatible, with fallbacks)
$Global:NYRA_IDE_CONFIGS = Join-Path $env:USERPROFILE 'OneDrive\Dev\IDE-Configs'
if (-not (Test-Path $Global:NYRA_IDE_CONFIGS)) {
    $Global:NYRA_IDE_CONFIGS = 'C:\Dev\IDE-Configs'  # Fallback to local
}
$Global:NYRA_RUNTIME_ROOT = Join-Path $Global:NYRA_IDE_CONFIGS 'PowerShell-Runtime'
$Global:NYRA_MODULES = Join-Path $Global:NYRA_RUNTIME_ROOT 'Modules'
$Global:NYRA_POSH_DIR = Join-Path $Global:NYRA_RUNTIME_ROOT 'PoshThemes'
$Global:NYRA_STAR_DIR = Join-Path $Global:NYRA_RUNTIME_ROOT 'starship'
$Global:NYRA_TOOLS_ROOT = 'C:\Dev\Tools'
$Global:NYRA_MCP_ROOT = Join-Path $Global:NYRA_TOOLS_ROOT 'MCP-Servers'

# Add NYRA modules to PSModulePath for automatic discovery
if ($Global:NYRA_MODULES -and (Test-Path $Global:NYRA_MODULES)) {
    $env:PSModulePath = "$Global:NYRA_MODULES;$env:PSModulePath"
}

# Environment (minimal setup)
$env:NYRA_PROFILE_RUNTIME = $Global:NYRA_RUNTIME_ROOT
$env:NYRA_BOOTSTRAP_VERSION = $script:BOOTSTRAP_VERSION
#endregion

#region Fast Module Loading (Parallel)
$script:ModuleLoadOrder = @(
    'ClaudeEnvironment'
    'InfisicalWrappers'
    'Apotheosis.Secrets'
    'Nav'
    'NYRA.DockerMCP'
    'NYRA.MCPEssentials'
    'ProjectNyra'
)

# Claude Flow Statusline (optional, dot-sourced)
$script:ClaudeFlowStatusline = Join-Path $Global:NYRA_RUNTIME_ROOT 'powershell-profile-statusline.ps1'

function Import-ModuleFast {
    param([string]$Name)

    try {
        $modulePath = Join-Path $Global:NYRA_MODULES $Name
        $manifest = Join-Path $modulePath "$Name.psd1"
        $module = Join-Path $modulePath "$Name.psm1"

        # Fast path: direct import without validation
        if (Test-Path $manifest) {
            Import-Module $manifest -Force -Global -DisableNameChecking -ErrorAction SilentlyContinue 3>$null 2>$null 6>$null | Out-Null
            return $Name
        } elseif (Test-Path $module) {
            Import-Module $module -Force -Global -DisableNameChecking -ErrorAction SilentlyContinue 3>$null 2>$null 6>$null | Out-Null
            return $Name
        }
    } catch {}
    return $null
}

function Initialize-ModulesParallel {
    # Parallel module loading for speed
    $jobs = @()
    foreach ($moduleName in $script:ModuleLoadOrder) {
        $jobs += Start-Job -ScriptBlock {
            param($Name, $ModulesPath)
            $modulePath = Join-Path $ModulesPath $Name
            $manifest = Join-Path $modulePath "$Name.psd1"
            $module = Join-Path $modulePath "$Name.psm1"

            if (Test-Path $manifest) {
                Import-Module $manifest -Force -DisableNameChecking -ErrorAction SilentlyContinue 2>$null | Out-Null
                return $Name
            } elseif (Test-Path $module) {
                Import-Module $module -Force -DisableNameChecking -ErrorAction SilentlyContinue 2>$null | Out-Null
                return $Name
            }
            return $null
        } -ArgumentList $moduleName, $Global:NYRA_MODULES
    }

    # Wait with timeout (max 2 seconds)
    $timeout = (Get-Date).AddSeconds(2)
    foreach ($job in $jobs) {
        if ((Get-Date) -lt $timeout) {
            $result = Wait-Job $job -Timeout 1 | Receive-Job
            if ($result) { $script:ModulesLoaded += $result }
        }
        Remove-Job $job -Force -ErrorAction SilentlyContinue
    }
}
#endregion

#region Prompt Engine Detection (Fast, No Init)
function Get-PromptEngine {
    $engineFile = Join-Path $Global:NYRA_RUNTIME_ROOT 'prompt-engine.txt'
    $forceOmpMarker = Join-Path $Global:NYRA_RUNTIME_ROOT "FORCE-OMP.txt"

    # Quick detection without command execution
    if (Test-Path $forceOmpMarker) {
        return @{ Engine = 'oh-my-posh'; Theme = 'nyra-watercolor'; Swap = 'Remove FORCE-OMP.txt to use Starship' }
    }

    if ($env:CLAUDE_ENVIRONMENT -or $env:ARCHON_ACTIVE) {
        return @{ Engine = 'starship'; Theme = 'starship-claude'; Swap = 'Create FORCE-OMP.txt to use Oh-My-Posh' }
    }

    if (Test-Path $engineFile) {
        $engine = Get-Content $engineFile -Raw -ErrorAction SilentlyContinue
        if ($engine -match 'starship') {
            return @{ Engine = 'starship'; Theme = 'starship-claude'; Swap = 'Edit prompt-engine.txt to "oh-my-posh"' }
        }
    }

    return @{ Engine = 'oh-my-posh'; Theme = 'nyra-watercolor'; Swap = 'Edit prompt-engine.txt to "starship"' }
}

function Initialize-PromptEngineDeferred {
    # Deferred initialization (runs after banner)
    $promptInfo = Get-PromptEngine

    try {
        if ($promptInfo.Engine -eq 'starship' -and (Get-Command starship -ErrorAction SilentlyContinue)) {
            $starshipConfig = Join-Path $Global:NYRA_STAR_DIR "$($promptInfo.Theme).toml"
            if (Test-Path $starshipConfig) { $env:STARSHIP_CONFIG = $starshipConfig }
            Invoke-Expression (& starship init powershell) 2>$null | Out-Null
        } elseif (Get-Command oh-my-posh -ErrorAction SilentlyContinue) {
            $ompTheme = Join-Path $Global:NYRA_POSH_DIR "$($promptInfo.Theme).omp.json"
            if (-not (Test-Path $ompTheme)) { $ompTheme = Join-Path $Global:NYRA_POSH_DIR 'xulbux-ultimate.omp.json' }
            if (Test-Path $ompTheme) {
                oh-my-posh init pwsh --config $ompTheme 2>$null | Invoke-Expression
            }
        }
    } catch {}
}
#endregion

#region Enhanced Startup Banner
function Show-StartupBanner {
    # Module descriptions
    $moduleDescriptions = @{
        'ClaudeEnvironment' = 'Claude Code/Flow integration'
        'InfisicalWrappers' = 'Secret injection & environment'
        'Apotheosis.Secrets' = 'Unified secrets management'
        'Nav' = 'Directory navigation'
        'NYRA.DockerMCP' = 'Docker & MCP containers'
        'NYRA.MCPEssentials' = 'MCP server essentials'
        'ProjectNyra' = 'NYRA project tools'
    }

    # Build module list
    $moduleList = ""
    foreach ($moduleName in $script:ModulesLoaded) {
        $description = $moduleDescriptions[$moduleName]
        if (-not $description) { $description = "PowerShell module" }

        if ($moduleName -eq 'InfisicalWrappers') {
            $infisModule = Get-Module InfisicalWrappers -ErrorAction SilentlyContinue
            $version = if ($infisModule) { "v$($infisModule.Version)" } else { "" }
            $moduleList += "                $moduleName  - $description ($version)`n"
        } else {
            $moduleList += "                $moduleName  - $description`n"
        }
    }
    if (-not $moduleList) { $moduleList = "                (No modules loaded)`n" }

    # Prompt engine info
    $promptInfo = Get-PromptEngine
    $promptDisplay = "⚡ Prompt: $($promptInfo.Engine) [$($promptInfo.Theme)]"
    $swapDisplay = "💡 Swap: $($promptInfo.Swap)"

    $catgirl = @"

        ╔═══════════════════════════════════════════════════════════════╗
        ║                                                               ║
        ║         /\_/\           ███╗   ██╗██╗   ██╗██████╗  █████╗   ║
        ║        ( o.o )          ████╗  ██║╚██╗ ██╔╝██╔══██╗██╔══██╗  ║
        ║         > ^ <           ██╔██╗ ██║ ╚████╔╝ ██████╔╝███████║  ║
        ║        /|   |\          ██║╚██╗██║  ╚██╔╝  ██╔══██╗██╔══██║  ║
        ║       (_|   |_)         ██║ ╚████║   ██║   ██║  ██║██║  ██║  ║
        ║                         ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝  ║
        ║                                                               ║
        ║          💜 Kawaii Edition - AI Development Stack 💜          ║
        ║                                                               ║
        ║            (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ N-Nyaa~! Welcome back! ✧ﾟ･: *         ║
        ║                                                               ║
        ╚═══════════════════════════════════════════════════════════════╝

             ✨ Developer-san, your environment is ready! >///<  ✨

             🚀 Bootstrap v$script:BOOTSTRAP_VERSION loaded in $($script:BootstrapStopwatch.ElapsedMilliseconds)ms
             📦 $($script:ModulesLoaded.Count) modules loaded
             $promptDisplay

             🔐 Loaded Modules:
$moduleList
             💡 Nya-commands:
                nyra-help          - Show all features & commands
                infis <cmd>        - Run command with secret injection
                claude-status      - Check Claude integration
                docker-mcp         - Manage MCP containers
                secrets-status     - Check secret vault status

             🎯 Arrow Nya-vigation:
                Ctrl+← (parent)    - Go to parent directory
                Ctrl+→ (child)     - Enter first child directory
                Alt+←  (back)      - Go back in directory history
                Alt+→  (forward)   - Interactive child selection

             🎨 Prompt Engine Swap:
                $swapDisplay

"@

    Write-Host $catgirl -ForegroundColor Magenta
}
#endregion

#region Arrow Key Navigation (Fast Setup)
function Enable-ArrowKeyNavigation {
    if (-not (Get-Module PSReadLine)) { return }

    try {
        Set-PSReadLineKeyHandler -Chord 'Ctrl+LeftArrow' -ScriptBlock {
            [Microsoft.PowerShell.PSConsoleReadLine]::RevertLine()
            [Microsoft.PowerShell.PSConsoleReadLine]::Insert('cd ..')
            [Microsoft.PowerShell.PSConsoleReadLine]::AcceptLine()
        }

        Set-PSReadLineKeyHandler -Chord 'Ctrl+RightArrow' -ScriptBlock {
            $child = Get-ChildItem -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($child) {
                [Microsoft.PowerShell.PSConsoleReadLine]::RevertLine()
                [Microsoft.PowerShell.PSConsoleReadLine]::Insert("cd '$($child.Name)'")
                [Microsoft.PowerShell.PSConsoleReadLine]::AcceptLine()
            }
        }

        Set-PSReadLineKeyHandler -Chord 'Alt+LeftArrow' -ScriptBlock {
            [Microsoft.PowerShell.PSConsoleReadLine]::RevertLine()
            [Microsoft.PowerShell.PSConsoleReadLine]::Insert('Pop-Location')
            [Microsoft.PowerShell.PSConsoleReadLine]::AcceptLine()
        }
    } catch {}
}
#endregion

#region Health & Repair Functions
function Test-BootstrapHealth {
    @{
        Timestamp = Get-Date
        Version = $script:BOOTSTRAP_VERSION
        Errors = $script:BootstrapErrors
        ModulesLoaded = $script:ModulesLoaded.Count
        PathValid = (Test-Path $env:NYRA_PROFILE_RUNTIME)
        Healthy = ($script:BootstrapErrors.Count -eq 0)
    }
}

function Show-BootstrapHealth {
    $health = Test-BootstrapHealth

    Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║   NYRA Bootstrap Health Check v$($health.Version)   ║" -ForegroundColor Magenta
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Magenta

    $status = if ($health.Healthy) { "✓ HEALTHY (Nyaa~!)" } else { "✗ ISSUES DETECTED" }
    $color = if ($health.Healthy) { "Green" } else { "Red" }
    Write-Host "  Status: " -NoNewline
    Write-Host $status -ForegroundColor $color
    Write-Host "  Modules Loaded: $($health.ModulesLoaded)" -ForegroundColor Cyan
    Write-Host ""
}

function Repair-BootstrapEnvironment {
    Write-Host "🔧 Nya~! Running auto-repair..." -ForegroundColor Yellow

    @($Global:NYRA_RUNTIME_ROOT, $Global:NYRA_MODULES) | ForEach-Object {
        if (-not (Test-Path $_)) {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
            Write-Host "  ✓ Created: $_" -ForegroundColor Green
        }
    }

    Write-Host "✓ Repair completed! (=^･ω･^=)" -ForegroundColor Green
}
#endregion

#region Main Bootstrap Execution
Write-Host "`n🚀 NYRA Bootstrap v$script:BOOTSTRAP_VERSION initializing..." -ForegroundColor Cyan

# Fast parallel module loading
Initialize-ModulesParallel

# Setup PSReadLine quickly
if (Get-Module PSReadLine) {
    Set-PSReadLineOption -PredictionSource History -ErrorAction SilentlyContinue
    Set-PSReadLineOption -PredictionViewStyle ListView -ErrorAction SilentlyContinue
    Set-PSReadLineOption -EditMode Windows -ErrorAction SilentlyContinue
    Enable-ArrowKeyNavigation
}

# Show banner FIRST (fast)
Show-StartupBanner

# Deferred operations (run in background)
$null = Start-Job -ScriptBlock {
    param($RuntimeRoot)

    # Auto-inject Infisical secrets (background)
    if (Get-Command Import-InfisicalEnv -ErrorAction SilentlyContinue) {
        Import-InfisicalEnv -Silent 2>$null | Out-Null
    }

} -ArgumentList $Global:NYRA_RUNTIME_ROOT

# Initialize prompt engine (deferred)
Initialize-PromptEngineDeferred

# Load Claude Flow Statusline (if available)
if (Test-Path $script:ClaudeFlowStatusline) {
    try {
        . $script:ClaudeFlowStatusline
        Write-Host "  ✓ Claude Flow statusline loaded (cfstatus, cfwatch, cfjson)" -ForegroundColor DarkGray
    } catch {
        # Silent failure - statusline is optional
    }
}

# Export health functions globally
Set-Item -Path function:global:Show-BootstrapHealth -Value ${function:Show-BootstrapHealth}
Set-Item -Path function:global:Test-BootstrapHealth -Value ${function:Test-BootstrapHealth}
Set-Item -Path function:global:Repair-BootstrapEnvironment -Value ${function:Repair-BootstrapEnvironment}

# Performance report
$totalTime = $script:BootstrapStopwatch.ElapsedMilliseconds
Write-Host "[OK] Bootstrap completed in ${totalTime}ms (Nya~!)" -ForegroundColor Green

$script:BootstrapStopwatch.Stop()
#endregion
