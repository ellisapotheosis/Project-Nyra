# ============================================================================
# Sync Secrets to Infisical - Project Nyra
# ============================================================================
# This script pushes ALL local secrets to Infisical across all paths:
#   • /shared - Shared secrets from .env.shared.template
#   • /worker-{5090,3090,3060} - Worker-specific secrets (if available)
#
# Usage:
#   .\sync-secrets.ps1                    # Interactive mode
#   .\sync-secrets.ps1 -AutoConfirm       # Skip confirmations
#   .\sync-secrets.ps1 -PathsOnly shared  # Only sync specific path
#   .\sync-secrets.ps1 -DryRun            # Preview without uploading
# ============================================================================

[CmdletBinding()]
param(
    [Parameter()]
    [switch]$AutoConfirm,

    [Parameter()]
    [switch]$DryRun,

    [Parameter()]
    [ValidateSet("all", "shared", "worker-5090", "worker-3090", "worker-3060")]
    [string]$PathsOnly = "all",

    [Parameter()]
    [string]$ProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef",

    [Parameter()]
    [string]$Environment = "dev"
)

$ErrorActionPreference = "Stop"
$InfraRoot = Split-Path -Parent $PSScriptRoot

Write-Host @"
╔══════════════════════════════════════════════════════════════════╗
║           SYNC SECRETS TO INFISICAL - PROJECT NYRA              ║
╚══════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "`n⚠️  DRY RUN MODE - No secrets will be uploaded" -ForegroundColor Yellow
}

Write-Host "`n📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Project ID:  $ProjectId" -ForegroundColor White
Write-Host "   Environment: $Environment" -ForegroundColor White
Write-Host "   Scope:       $PathsOnly" -ForegroundColor White
Write-Host ""

# ============================================================================
# Helper Functions
# ============================================================================

function Upload-EnvFile {
    param(
        [string]$FilePath,
        [string]$InfisicalPath,
        [string]$Description
    )

    if (-not (Test-Path $FilePath)) {
        Write-Host "⚠️  File not found: $FilePath" -ForegroundColor Yellow
        Write-Host "   Skipping $Description" -ForegroundColor Gray
        return @{ Uploaded = 0; Skipped = 0; Errors = 0 }
    }

    Write-Host "`n📤 Uploading: $Description" -ForegroundColor Cyan
    Write-Host "   Source: $FilePath" -ForegroundColor Gray
    Write-Host "   Destination: $InfisicalPath" -ForegroundColor Gray
    Write-Host ""

    $content = Get-Content $FilePath
    $uploaded = 0
    $skipped = 0
    $errors = 0

    foreach ($line in $content) {
        # Skip comments and empty lines
        if ($line -match "^[[:space:]]*#" -or [string]::IsNullOrWhiteSpace($line)) {
            continue
        }

        # Skip section headers
        if ($line -match "^[[:space:]]*={3,}" -or $line -match "^[[:space:]]*-{3,}") {
            continue
        }

        # Parse KEY=VALUE
        if ($line -match "^([A-Z_][A-Z0-9_]*)=(.*)$") {
            $key = $Matches[1]
            $value = $Matches[2]

            # Skip placeholder values
            if ($value -match "CHANGE_ME|TODO|FIXME|<.*>|your-.*-here") {
                Write-Host "   ⊘ $key (placeholder value skipped)" -ForegroundColor DarkGray
                $skipped++
                continue
            }

            # Skip empty values
            if ([string]::IsNullOrWhiteSpace($value)) {
                Write-Host "   ⊘ $key (empty value skipped)" -ForegroundColor DarkGray
                $skipped++
                continue
            }

            if ($DryRun) {
                Write-Host "   [DRY RUN] $key" -ForegroundColor Blue
                $uploaded++
            } else {
                try {
                    $result = infisical secrets set $key $value `
                        --projectId="$ProjectId" `
                        --env="$Environment" `
                        --path="$InfisicalPath" 2>&1

                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "   ✓ $key" -ForegroundColor Green
                        $uploaded++
                    } else {
                        Write-Host "   ✗ $key - Failed" -ForegroundColor Red
                        $errors++
                    }
                } catch {
                    Write-Host "   ✗ $key - Error: $_" -ForegroundColor Red
                    $errors++
                }
            }
        }
    }

    return @{
        Uploaded = $uploaded
        Skipped = $skipped
        Errors = $errors
    }
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Pre-flight Checks" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Check Infisical CLI
try {
    $version = infisical --version 2>&1
    Write-Host "✓ Infisical CLI: $version" -ForegroundColor Green
} catch {
    Write-Host "✗ Infisical CLI not found" -ForegroundColor Red
    Write-Host "  Run: .\setup-infisical-orchestrator.ps1" -ForegroundColor Yellow
    exit 1
}

# Check authentication
try {
    $result = infisical secrets list --projectId="$ProjectId" --env="$Environment" --path="/shared" 2>&1
    Write-Host "✓ Infisical authentication valid" -ForegroundColor Green
} catch {
    Write-Host "✗ Infisical authentication failed" -ForegroundColor Red
    Write-Host "  Run: infisical login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# ============================================================================
# Upload Secrets
# ============================================================================

$totalStats = @{
    Uploaded = 0
    Skipped = 0
    Errors = 0
}

# /shared - Orchestrator secrets
if ($PathsOnly -eq "all" -or $PathsOnly -eq "shared") {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "Uploading Shared Secrets (/shared)" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

    $sharedEnvPath = Join-Path $InfraRoot "machines\.env.shared.template"
    $stats = Upload-EnvFile -FilePath $sharedEnvPath -InfisicalPath "/shared" -Description "Shared Configuration (DB, APIs, Redis)"

    $totalStats.Uploaded += $stats.Uploaded
    $totalStats.Skipped += $stats.Skipped
    $totalStats.Errors += $stats.Errors
}

# /worker-5090 - RTX 5090 worker
if ($PathsOnly -eq "all" -or $PathsOnly -eq "worker-5090") {
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "Uploading Worker 5090 Secrets (/worker-5090)" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

    $worker5090EnvPath = Join-Path $InfraRoot "machines\.env.worker-5090"
    $stats = Upload-EnvFile -FilePath $worker5090EnvPath -InfisicalPath "/worker-5090" -Description "RTX 5090 Worker Configuration"

    $totalStats.Uploaded += $stats.Uploaded
    $totalStats.Skipped += $stats.Skipped
    $totalStats.Errors += $stats.Errors
}

# /worker-3090 - RTX 3090 Ti worker
if ($PathsOnly -eq "all" -or $PathsOnly -eq "worker-3090") {
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "Uploading Worker 3090 Secrets (/worker-3090)" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

    $worker3090EnvPath = Join-Path $InfraRoot "machines\.env.worker-3090"
    $stats = Upload-EnvFile -FilePath $worker3090EnvPath -InfisicalPath "/worker-3090" -Description "RTX 3090 Ti Worker Configuration"

    $totalStats.Uploaded += $stats.Uploaded
    $totalStats.Skipped += $stats.Skipped
    $totalStats.Errors += $stats.Errors
}

# /worker-3060 - RTX 3060 worker
if ($PathsOnly -eq "all" -or $PathsOnly -eq "worker-3060") {
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "Uploading Worker 3060 Secrets (/worker-3060)" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

    $worker3060EnvPath = Join-Path $InfraRoot "machines\.env.worker-3060"

    # Check if file exists, if not use machine-specific .env.machine
    if (-not (Test-Path $worker3060EnvPath)) {
        $worker3060EnvPath = Join-Path $InfraRoot "machines\.env.machine"
    }

    $stats = Upload-EnvFile -FilePath $worker3060EnvPath -InfisicalPath "/worker-3060" -Description "RTX 3060 Worker Configuration"

    $totalStats.Uploaded += $stats.Uploaded
    $totalStats.Skipped += $stats.Skipped
    $totalStats.Errors += $stats.Errors
}

# ============================================================================
# Summary
# ============================================================================
Write-Host "`n" + ("=" * 70) -ForegroundColor $(if ($DryRun) { "Blue" } else { "Green" })
if ($DryRun) {
    Write-Host "📊 DRY RUN COMPLETE - No secrets were uploaded" -ForegroundColor Blue
} else {
    Write-Host "✅ SECRET SYNC COMPLETE!" -ForegroundColor Green
}
Write-Host ("=" * 70) -ForegroundColor $(if ($DryRun) { "Blue" } else { "Green" })

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "   Uploaded: $($totalStats.Uploaded) secrets" -ForegroundColor Green
if ($totalStats.Skipped -gt 0) {
    Write-Host "   Skipped:  $($totalStats.Skipped) secrets (placeholders/empty)" -ForegroundColor Yellow
}
if ($totalStats.Errors -gt 0) {
    Write-Host "   Errors:   $($totalStats.Errors) secrets" -ForegroundColor Red
}

if (-not $DryRun) {
    Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Validate all secrets uploaded correctly" -ForegroundColor White
    Write-Host "      .\validate-secrets.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. View secrets in Infisical Dashboard" -ForegroundColor White
    Write-Host "      https://app.infisical.com" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Start Docker stack with Infisical integration" -ForegroundColor White
    Write-Host "      cd ..\docker" -ForegroundColor Gray
    Write-Host "      docker-compose up -d" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "`n💡 Tip: Run without -DryRun to actually upload secrets" -ForegroundColor Cyan
}
