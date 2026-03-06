# Docker Configuration Consolidation Script (Windows PowerShell)
# Wraps the bash script for easier Windows execution

param(
    [switch]$DryRun,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BashScript = Join-Path $ScriptDir "consolidate-docker-configs.sh"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Show-Help {
    Write-ColorOutput "Docker Configuration Consolidation" -Color Cyan
    Write-ColorOutput "=================================" -Color Cyan
    Write-ColorOutput ""
    Write-ColorOutput "This script consolidates 155+ scattered docker-compose files" -Color White
    Write-ColorOutput "into a single source of truth in the infra/ directory." -Color White
    Write-ColorOutput ""
    Write-ColorOutput "Usage:" -Color Yellow
    Write-ColorOutput "  .\consolidate-docker-configs.ps1           # Run consolidation"
    Write-ColorOutput "  .\consolidate-docker-configs.ps1 -DryRun   # Preview without changes"
    Write-ColorOutput "  .\consolidate-docker-configs.ps1 -Help     # Show this help"
    Write-ColorOutput ""
    Write-ColorOutput "What it does:" -Color Yellow
    Write-ColorOutput "  1. Finds all docker-compose*.yml files in the repository"
    Write-ColorOutput "  2. Archives them to _archive/docker-configs-[timestamp]/"
    Write-ColorOutput "  3. Analyzes unique services across all files"
    Write-ColorOutput "  4. Generates consolidation report"
    Write-ColorOutput "  5. Identifies services missing from bootstrap/"
    Write-ColorOutput ""
    Write-ColorOutput "Output:" -Color Yellow
    Write-ColorOutput "  - Archive: _archive/docker-configs-[timestamp]/"
    Write-ColorOutput "  - Analysis: infra/analysis/"
    Write-ColorOutput "  - Report: infra/analysis/CONSOLIDATION-REPORT.md"
    Write-ColorOutput ""
    exit 0
}

if ($Help) {
    Show-Help
}

Write-ColorOutput ""
Write-ColorOutput "╔════════════════════════════════════════════════════════════╗" -Color Cyan
Write-ColorOutput "║     Docker Configuration Consolidation (PowerShell)        ║" -Color Cyan
Write-ColorOutput "╚════════════════════════════════════════════════════════════╝" -Color Cyan
Write-ColorOutput ""

# Check if bash is available (Git Bash or WSL)
$BashAvailable = $false

# Try Git Bash first
$GitBashPaths = @(
    "C:\Program Files\Git\bin\bash.exe",
    "C:\Program Files (x86)\Git\bin\bash.exe",
    "$env:ProgramFiles\Git\bin\bash.exe",
    "$env:ProgramFiles(x86)\Git\bin\bash.exe"
)

$BashPath = $null
foreach ($path in $GitBashPaths) {
    if (Test-Path $path) {
        $BashPath = $path
        $BashAvailable = $true
        Write-ColorOutput "✓ Found Git Bash: $path" -Color Green
        break
    }
}

# Try WSL if Git Bash not found
if (-not $BashAvailable) {
    try {
        $wslCheck = wsl --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $BashPath = "wsl"
            $BashAvailable = $true
            Write-ColorOutput "✓ Using WSL bash" -Color Green
        }
    }
    catch {
        # WSL not available
    }
}

if (-not $BashAvailable) {
    Write-ColorOutput "✗ Error: Bash not found!" -Color Red
    Write-ColorOutput ""
    Write-ColorOutput "This script requires bash (Git Bash or WSL)." -Color Yellow
    Write-ColorOutput ""
    Write-ColorOutput "Please install one of:" -Color Yellow
    Write-ColorOutput "  - Git for Windows (includes Git Bash): https://git-scm.com/download/win"
    Write-ColorOutput "  - WSL (Windows Subsystem for Linux): wsl --install"
    Write-ColorOutput ""
    exit 1
}

Write-ColorOutput ""
Write-ColorOutput "Starting consolidation..." -Color Yellow
Write-ColorOutput ""

# Convert Windows path to Unix path for bash
$UnixScriptPath = $BashScript -replace '\\', '/' -replace '^([A-Za-z]):', '/$1'

if ($DryRun) {
    Write-ColorOutput "DRY RUN MODE: Would execute bash script" -Color Yellow
    Write-ColorOutput "Script: $UnixScriptPath" -Color Gray
    exit 0
}

# Execute bash script
try {
    if ($BashPath -eq "wsl") {
        wsl bash $UnixScriptPath
    }
    else {
        & $BashPath $UnixScriptPath
    }

    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput ""
        Write-ColorOutput "╔════════════════════════════════════════════════════════════╗" -Color Green
        Write-ColorOutput "║             Consolidation Complete! ✓                      ║" -Color Green
        Write-ColorOutput "╚════════════════════════════════════════════════════════════╝" -Color Green
        Write-ColorOutput ""
        Write-ColorOutput "📊 Next Steps:" -Color Cyan
        Write-ColorOutput "  1. Review: infra\analysis\CONSOLIDATION-REPORT.md"
        Write-ColorOutput "  2. Check missing services: infra\analysis\missing-from-bootstrap.txt"
        Write-ColorOutput "  3. Create consolidated: infra\docker-compose.yml"
        Write-ColorOutput ""
    }
    else {
        Write-ColorOutput "✗ Script failed with exit code: $LASTEXITCODE" -Color Red
        exit $LASTEXITCODE
    }
}
catch {
    Write-ColorOutput "✗ Error executing bash script: $_" -Color Red
    exit 1
}
