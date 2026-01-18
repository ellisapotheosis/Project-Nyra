# Docker Configuration Consolidation Validation Script (PowerShell)
# Wraps the bash validation script for Windows users

param(
    [switch]$Help
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BashScript = Join-Path $ScriptDir "validate-consolidation.sh"
$RepoRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Show-Help {
    Write-ColorOutput ""
    Write-ColorOutput "╔════════════════════════════════════════════════════════════╗" -Color Cyan
    Write-ColorOutput "║     Docker Consolidation Validation (PowerShell)          ║" -Color Cyan
    Write-ColorOutput "╚════════════════════════════════════════════════════════════╝" -Color Cyan
    Write-ColorOutput ""
    Write-ColorOutput "This script validates the safety and integrity of the Docker" -Color White
    Write-ColorOutput "configuration consolidation process." -Color White
    Write-ColorOutput ""
    Write-ColorOutput "Usage:" -Color Yellow
    Write-ColorOutput "  .\validate-consolidation.ps1           # Run validation"
    Write-ColorOutput "  .\validate-consolidation.ps1 -Help     # Show this help"
    Write-ColorOutput ""
    Write-ColorOutput "What it checks:" -Color Yellow
    Write-ColorOutput "  1. Critical files exist"
    Write-ColorOutput "  2. Archive integrity"
    Write-ColorOutput "  3. Potential secrets in archives"
    Write-ColorOutput "  4. .gitignore configuration"
    Write-ColorOutput "  5. Git status and snapshot tags"
    Write-ColorOutput "  6. Docker Compose syntax"
    Write-ColorOutput "  7. Docker daemon status"
    Write-ColorOutput "  8. Broken symlinks"
    Write-ColorOutput "  9. Analysis directory"
    Write-ColorOutput "  10. Disk space"
    Write-ColorOutput "  11. Security validation"
    Write-ColorOutput "  12. Backup verification"
    Write-ColorOutput ""
    Write-ColorOutput "Exit codes:" -Color Yellow
    Write-ColorOutput "  0 - All checks passed"
    Write-ColorOutput "  1 - Critical errors found"
    Write-ColorOutput ""
    Write-ColorOutput "For detailed checklist, see:" -Color Cyan
    Write-ColorOutput "  docs\operations\CLEANUP-SAFETY-CHECKLIST.md"
    Write-ColorOutput ""
    exit 0
}

if ($Help) {
    Show-Help
}

Write-ColorOutput ""
Write-ColorOutput "╔════════════════════════════════════════════════════════════╗" -Color Cyan
Write-ColorOutput "║     Docker Consolidation Validation (PowerShell)          ║" -Color Cyan
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
    Write-ColorOutput ""
    Write-ColorOutput "✗ Error: Bash not found!" -Color Red
    Write-ColorOutput ""
    Write-ColorOutput "This script requires bash (Git Bash or WSL)." -Color Yellow
    Write-ColorOutput ""
    Write-ColorOutput "Please install one of:" -Color Yellow
    Write-ColorOutput "  - Git for Windows (includes Git Bash): https://git-scm.com/download/win"
    Write-ColorOutput "  - WSL (Windows Subsystem for Linux): wsl --install"
    Write-ColorOutput ""
    Write-ColorOutput "Alternatively, run manual checks:" -Color Yellow
    Write-ColorOutput "  1. Verify critical files exist in bootstrap/docker/"
    Write-ColorOutput "  2. Check Docker daemon: docker info"
    Write-ColorOutput "  3. Validate compose syntax: docker-compose config"
    Write-ColorOutput "  4. Check .gitignore includes _archive/ and _backup/"
    Write-ColorOutput ""
    exit 1
}

Write-ColorOutput ""
Write-ColorOutput "Starting validation..." -Color Yellow
Write-ColorOutput ""

# Convert Windows path to Unix path for bash
$UnixScriptPath = $BashScript -replace '\\', '/' -replace '^([A-Za-z]):', '/$1'

# Execute bash script
try {
    if ($BashPath -eq "wsl") {
        wsl bash $UnixScriptPath
    }
    else {
        & $BashPath $UnixScriptPath
    }

    $ExitCode = $LASTEXITCODE

    if ($ExitCode -eq 0) {
        Write-ColorOutput ""
        Write-ColorOutput "╔════════════════════════════════════════════════════════════╗" -Color Green
        Write-ColorOutput "║             Validation Passed! ✓                           ║" -Color Green
        Write-ColorOutput "╚════════════════════════════════════════════════════════════╝" -Color Green
        Write-ColorOutput ""
        Write-ColorOutput "Safe to proceed with consolidation." -Color Green
        Write-ColorOutput ""
        Write-ColorOutput "Next steps:" -Color Cyan
        Write-ColorOutput "  1. Create Git snapshot: git tag -a cleanup-pre-consolidation-`$(Get-Date -Format yyyyMMdd) -m 'Pre-consolidation snapshot'"
        Write-ColorOutput "  2. Run consolidation: .\infra\scripts\consolidate-docker-configs.ps1"
        Write-ColorOutput "  3. Review analysis: cat infra\analysis\CONSOLIDATION-REPORT.md"
        Write-ColorOutput ""
    }
    elseif ($ExitCode -eq 1) {
        Write-ColorOutput ""
        Write-ColorOutput "╔════════════════════════════════════════════════════════════╗" -Color Red
        Write-ColorOutput "║             Validation Failed! ✗                           ║" -Color Red
        Write-ColorOutput "╚════════════════════════════════════════════════════════════╝" -Color Red
        Write-ColorOutput ""
        Write-ColorOutput "Critical issues found. Review errors above." -Color Red
        Write-ColorOutput ""
        Write-ColorOutput "Recommended actions:" -Color Yellow
        Write-ColorOutput "  1. Fix critical errors shown above"
        Write-ColorOutput "  2. Consult docs\operations\CLEANUP-SAFETY-CHECKLIST.md"
        Write-ColorOutput "  3. Re-run this validation script"
        Write-ColorOutput ""
    }

    exit $ExitCode
}
catch {
    Write-ColorOutput ""
    Write-ColorOutput "✗ Error executing validation script: $_" -Color Red
    Write-ColorOutput ""
    exit 1
}
