#!/usr/bin/env pwsh

<#
.SYNOPSIS
Master script to upload all secrets to Infisical

.DESCRIPTION
Uploads all Project Nyra secrets to Infisical in the correct hierarchy:
- /shared - Shared across all PCs
- /orchestrator/* - PC1 only
- /worker-rtx5090/* - PC3 only
- /worker-rtx3090ti/* - PC4 only

.PARAMETER Environment
Target environment (development, staging, production)

.PARAMETER DryRun
Preview what would be uploaded without actually uploading

.EXAMPLE
.\upload-all-secrets.ps1 -Environment development

.EXAMPLE
.\upload-all-secrets.ps1 -Environment production -DryRun
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development",

    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
. "$PSScriptRoot\..\lib\InfisicalToken.ps1"
$projectId = Get-NyraInfisicalProjectId

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warn { Write-Host $args -ForegroundColor Yellow }
function Write-Err { Write-Host $args -ForegroundColor Red }

Write-Info "`n========================================="
Write-Info "Project Nyra - Infisical Secrets Upload"
Write-Info "========================================="
Write-Info "Environment: $Environment"
Write-Info "Dry Run: $DryRun"
Write-Info "=========================================`n"

# Check Infisical CLI is installed
try {
    $version = infisical --version 2>&1
    Write-Success "✅ Infisical CLI installed: $version"
} catch {
    Write-Err "❌ Infisical CLI not found. Install with: npm install -g @infisical/cli"
    exit 1
}

try {
    Assert-NyraInfisicalToken
    Write-Success "✅ INFISICAL_TOKEN available"
} catch {
    Write-Err "❌ $($_.Exception.Message)"
    exit 1
}

Write-Success "✅ Using Infisical project id: $projectId"

# Load current .env file
$envPath = Join-Path $ScriptDir "..\..\..\.env"
if (Test-Path $envPath) {
    Write-Info "`n📄 Loading .env file from: $envPath"
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$' -and -not $_.StartsWith('#')) {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            if (-not [string]::IsNullOrWhiteSpace($value)) {
                [Environment]::SetEnvironmentVariable($key, $value, "Process")
            }
        }
    }
    Write-Success "✅ Environment variables loaded from .env"
} else {
    Write-Warn "⚠️  No .env file found at: $envPath"
    Write-Warn "   Using system environment variables only."
}

# Execute sub-scripts
$scripts = @(
    @{Name = "upload-shared-secrets.ps1"; Description = "Shared Secrets (All PCs)"},
    @{Name = "upload-orchestrator-secrets.ps1"; Description = "Orchestrator Secrets (PC1)"},
    @{Name = "upload-worker-secrets.ps1"; Description = "Worker Secrets (PC2, PC3, PC4)"}
)

$totalStartTime = Get-Date

foreach ($script in $scripts) {
    $scriptPath = Join-Path $ScriptDir $script.Name

    if (-not (Test-Path $scriptPath)) {
        Write-Warn "⚠️  Script not found: $($script.Name)"
        continue
    }

    Write-Info "`n"
    Write-Info "▶️  Running: $($script.Description)"
    Write-Info "   Script: $($script.Name)"
    Write-Info "   Environment: $Environment"

    if ($DryRun) {
        Write-Warn "   [DRY RUN] Would execute: $scriptPath"
        continue
    }

    try {
        $startTime = Get-Date
        & $scriptPath -Environment $Environment
        $duration = (Get-Date) - $startTime
        Write-Success "   ✅ Completed in $([math]::Round($duration.TotalSeconds, 2))s"
    }
    catch {
        Write-Err "   ❌ Script failed: $_"
        exit 1
    }
}

$totalDuration = (Get-Date) - $totalStartTime

Write-Info "`n========================================="
Write-Success "✅ Secrets upload complete!"
Write-Info "========================================="
Write-Info "Total time: $([math]::Round($totalDuration.TotalSeconds, 2))s"
Write-Info "`nNext steps:"
Write-Info "1. Verify secrets in Infisical dashboard"
Write-Info "2. Set INFISICAL_TOKEN in each PC's environment:"
Write-Info "   PC1: Set-Content .env.orchestrator 'INFISICAL_TOKEN=<token>'"
Write-Info " PC2: Set-Content .env. 'INFISICAL_TOKEN=<token>'"
Write-Info "   PC3: Set-Content .env.worker-rtx5090 'INFISICAL_TOKEN=<token>'"
Write-Info "   PC4: Set-Content .env.worker-rtx3090ti 'INFISICAL_TOKEN=<token>'"
Write-Info "3. Test secret retrieval:"
Write-Info "   infisical secrets --projectId $projectId --path /shared --env $Environment"
Write-Info "4. Update docker-compose.yml to use Infisical:"
Write-Info "   infisical run --projectId=$projectId --env=$Environment --path=/shared --path=/orchestrator -- docker-compose up -d"
Write-Info "5. Document any missing secrets that need to be added manually"
Write-Info "=========================================`n"

if ($DryRun) {
    Write-Warn "This was a DRY RUN. No secrets were actually uploaded."
    Write-Warn "Run without -DryRun to perform the actual upload.`n"
}
