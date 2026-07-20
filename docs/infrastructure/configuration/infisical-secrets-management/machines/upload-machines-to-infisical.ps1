# Upload Machine-Specific Variables to Infisical
# This script uploads machine-specific .env files to /hosts/<pc-name> paths
# Run this AFTER you've migrated shared variables to /shared

param(
    [switch]$DryRun,
    [switch]$Verbose,
    [string]$Env = "dev"
)

$ErrorActionPreference = "Continue"
$ProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
$Token = $env:INFISICAL_ACCESS_TOKEN

if (-not $Token) {
    Write-Host "❌ INFISICAL_ACCESS_TOKEN not set. Please set it first." -ForegroundColor Red
    exit 1
}

# Machine configurations
$machines = @(
    @{
        Name = "orchestrator"
        File = "orchestrator-mini.env"
        Path = "/hosts/orchestrator"
    },
    @{
        Name = "worker-rtx3060"
        File = "worker-rtx3060.env"
        Path = "/hosts/worker-rtx3060"
    },
    @{
        Name = "worker-rtx5090"
        File = "worker-rtx5090.env"
        Path = "/hosts/worker-rtx5090"
    },
    @{
        Name = "worker-rtx3090ti"
        File = "worker-rtx3090ti.env"
        Path = "/hosts/worker-rtx3090ti"
    }
)

Write-Host "`n🖥️  Uploading Machine-Specific Variables to Infisical" -ForegroundColor Cyan
Write-Host "===================================================`n" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No uploads will be made`n" -ForegroundColor Yellow
}

$totalCount = 0
$successCount = 0
$failCount = 0
$skippedCount = 0

foreach ($machine in $machines) {
    $envFile = $machine.File
    $machinePath = $machine.Path
    $machineName = $machine.Name

    if (-not (Test-Path $envFile)) {
        Write-Host "⚠️  File not found: $envFile - Skipping $machineName" -ForegroundColor Yellow
        continue
    }

    Write-Host "`n📁 Uploading $machineName ($envFile)" -ForegroundColor Yellow
    Write-Host "   Target: $machinePath" -ForegroundColor Gray

    # Parse .env file
    $envContent = Get-Content $envFile -Raw
    $lines = $envContent -split "`n"
    $variables = @()

    foreach ($line in $lines) {
        $line = $line.Trim()
        # Skip comments and empty lines
        if ($line -and -not $line.StartsWith('#') -and $line -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
            $key = $matches[1]
            $value = $matches[2]
            $variables += @{
                Key = $key
                Value = $value
            }
        }
    }

    Write-Host "   Found $($variables.Count) variables" -ForegroundColor Gray

    foreach ($var in $variables) {
        $totalCount++
        $key = $var.Key
        $value = $var.Value

        # Skip TO_BE_COLLECTED / TO_BE_SET placeholders in dry run
        if ($DryRun -and ($value -match "^TO_BE_")) {
            Write-Host "   ⊘ $key (placeholder, skipped in dry run)" -ForegroundColor DarkGray
            $skippedCount++
            continue
        }

        Write-Host "   Setting $key..." -NoNewline

        if ($DryRun) {
            Write-Host " [DRY RUN]" -ForegroundColor Cyan
            $successCount++
        } else {
            try {
                $result = infisical secrets set "$key" "$value" `
                    --path="$machinePath" `
                    --env="$Env" `
                    --projectId="$ProjectId" `
                    --token="$Token" `
                    --silent 2>&1

                if ($LASTEXITCODE -eq 0) {
                    Write-Host " ✓" -ForegroundColor Green
                    $successCount++
                } else {
                    Write-Host " ✗" -ForegroundColor Red
                    if ($Verbose) {
                        Write-Host "      Error: $result" -ForegroundColor Red
                    }
                    $failCount++
                }
            } catch {
                Write-Host " ✗" -ForegroundColor Red
                if ($Verbose) {
                    Write-Host "      Error: $_" -ForegroundColor Red
                }
                $failCount++
            }
        }
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Machine Upload Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total:    $totalCount" -ForegroundColor White
Write-Host "Success:  $successCount" -ForegroundColor Green
Write-Host "Failed:   $failCount" -ForegroundColor Red
Write-Host "Skipped:  $skippedCount" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

if ($failCount -gt 0) {
    Write-Host "⚠️  Some secrets failed to upload. Run with -Verbose for details." -ForegroundColor Yellow
}

# Next steps
if (-not $DryRun) {
    Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Collect actual values for TO_BE_COLLECTED/TO_BE_SET placeholders" -ForegroundColor White
    Write-Host "  2. Re-run this script to update placeholders" -ForegroundColor White
    Write-Host "  3. Generate combined .env files: .\generate-combined-env.ps1" -ForegroundColor White
    Write-Host "  4. Deploy to each PC`n" -ForegroundColor White
}

exit 0
