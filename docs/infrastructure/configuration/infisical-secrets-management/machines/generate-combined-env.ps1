# Generate Combined .env Files for Each Machine
# This script downloads secrets from /shared and /machines/<pc-name>
# and merges them into a single .env file for each PC

param(
    [string]$MachineRole,  # Optional: Generate for specific machine only
    [switch]$OutputToFiles  # Output to files instead of just displaying
)

$ErrorActionPreference = "Continue"
$ProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
$Env = "dev"
$Token = $env:INFISICAL_ACCESS_TOKEN

if (-not $Token) {
    Write-Host "❌ INFISICAL_ACCESS_TOKEN not set. Please set it first." -ForegroundColor Red
    exit 1
}

# Machine configurations
$machines = @(
    @{
        Name = "orchestrator-mini"
        Role = "orchestrator"
        Path = "/machines/orchestrator-mini"
        OutputFile = "combined\orchestrator-mini.env"
    },
    @{
        Name = "worker-rtx3060"
        Role = "worker"
        Path = "/machines/worker-rtx3060"
        OutputFile = "combined\worker-rtx3060.env"
    },
    @{
        Name = "worker-rtx5090"
        Role = "worker"
        Path = "/machines/worker-rtx5090"
        OutputFile = "combined\worker-rtx5090.env"
    },
    @{
        Name = "worker-rtx3090ti"
        Role = "worker"
        Path = "/machines/worker-rtx3090ti"
        OutputFile = "combined\worker-rtx3090ti.env"
    }
)

Write-Host "`n🔗 Generating Combined .env Files" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

# Create output directory
if ($OutputToFiles) {
    if (-not (Test-Path "combined")) {
        New-Item -ItemType Directory -Path "combined" | Out-Null
    }
}

# Filter machines if specific role requested
if ($MachineRole) {
    $machines = $machines | Where-Object { $_.Path -like "*$MachineRole*" }
    if ($machines.Count -eq 0) {
        Write-Host "❌ No machine found matching: $MachineRole" -ForegroundColor Red
        exit 1
    }
}

foreach ($machine in $machines) {
    $machineName = $machine.Name
    $machinePath = $machine.Path
    $outputFile = $machine.OutputFile

    Write-Host "📦 Generating: $machineName" -ForegroundColor Yellow

    # Step 1: Export shared variables
    Write-Host "   1. Fetching /shared variables..." -NoNewline
    try {
        $sharedVars = infisical export `
            --path="/shared" `
            --env="$Env" `
            --projectId="$ProjectId" `
            --token="$Token" `
            --format=dotenv `
            --silent 2>&1

        if ($LASTEXITCODE -ne 0) {
            Write-Host " ✗" -ForegroundColor Red
            Write-Host "      Error: $sharedVars" -ForegroundColor Red
            continue
        }
        Write-Host " ✓ ($($sharedVars -split "`n" | Where-Object { $_ -and -not $_.StartsWith('#') } | Measure-Object).Count variables)" -ForegroundColor Green
    } catch {
        Write-Host " ✗" -ForegroundColor Red
        Write-Host "      Error: $_" -ForegroundColor Red
        continue
    }

    # Step 2: Export machine-specific variables
    Write-Host "   2. Fetching $machinePath variables..." -NoNewline
    try {
        $machineVars = infisical export `
            --path="$machinePath" `
            --env="$Env" `
            --projectId="$ProjectId" `
            --token="$Token" `
            --format=dotenv `
            --silent 2>&1

        if ($LASTEXITCODE -ne 0) {
            Write-Host " ✗" -ForegroundColor Red
            Write-Host "      Error: $machineVars" -ForegroundColor Red
            continue
        }
        Write-Host " ✓ ($($machineVars -split "`n" | Where-Object { $_ -and -not $_.StartsWith('#') } | Measure-Object).Count variables)" -ForegroundColor Green
    } catch {
        Write-Host " ✗" -ForegroundColor Red
        Write-Host "      Error: $_" -ForegroundColor Red
        continue
    }

    # Step 3: Merge (machine-specific overrides shared)
    Write-Host "   3. Merging..." -NoNewline
    $combinedContent = @"
# ==============================================================================
# COMBINED ENVIRONMENT VARIABLES: $machineName
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ==============================================================================
# This file combines:
#   1. /shared - Shared project variables (API keys, database, etc.)
#   2. $machinePath - Machine-specific overrides
# ==============================================================================

# ==============================================================================
# SHARED VARIABLES (from /shared)
# ==============================================================================

$sharedVars

# ==============================================================================
# MACHINE-SPECIFIC VARIABLES (from $machinePath)
# ==============================================================================
# These override shared variables if there are conflicts

$machineVars

# ==============================================================================
# END OF COMBINED ENVIRONMENT VARIABLES
# ==============================================================================
"@

    Write-Host " ✓" -ForegroundColor Green

    # Step 4: Output
    if ($OutputToFiles) {
        Write-Host "   4. Writing to $outputFile..." -NoNewline
        try {
            $combinedContent | Out-File -FilePath $outputFile -Encoding UTF8 -Force
            Write-Host " ✓" -ForegroundColor Green
        } catch {
            Write-Host " ✗" -ForegroundColor Red
            Write-Host "      Error: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "   4. Preview (first 10 lines):" -ForegroundColor Gray
        $previewLines = ($combinedContent -split "`n")[0..9]
        foreach ($line in $previewLines) {
            Write-Host "      $line" -ForegroundColor DarkGray
        }
        Write-Host "      ..." -ForegroundColor DarkGray
    }

    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Generation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

if ($OutputToFiles) {
    Write-Host "✅ Combined .env files saved to combined/ directory`n" -ForegroundColor Green
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Review the generated files in combined/" -ForegroundColor White
    Write-Host "  2. Copy to each PC:" -ForegroundColor White
    Write-Host "     - orchestrator-mini: combined/orchestrator-mini.env -> .env" -ForegroundColor White
    Write-Host "     - worker-rtx3060:   combined/worker-rtx3060.env -> .env" -ForegroundColor White
    Write-Host "     - worker-rtx5090:   combined/worker-rtx5090.env -> .env" -ForegroundColor White
    Write-Host "     - worker-rtx3090ti: combined/worker-rtx3090ti.env -> .env" -ForegroundColor White
    Write-Host "  3. Test services on each PC`n" -ForegroundColor White
} else {
    Write-Host "💡 Tip: Add -OutputToFiles to save to combined/ directory`n" -ForegroundColor Cyan
}

exit 0
