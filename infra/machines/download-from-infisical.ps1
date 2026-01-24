# Download and Merge Environment Variables from Infisical
# Downloads from both /shared and /machines/<role> paths
# Usage: .\download-from-infisical.ps1 [-MachineRole <role>] [-OutputFile <path>]

param(
    [string]$MachineRole = "",
    [string]$OutputFile = ".env",
    [string]$InfisicalEnv = "prod",
    [string]$ProjectId = "pbcskpxyqtysbxjvecfo"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Download from Infisical ===" -ForegroundColor Cyan
Write-Host ""

# Check if infisical CLI is installed
if (-not (Get-Command infisical -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Infisical CLI not found" -ForegroundColor Red
    Write-Host "Install: https://infisical.com/docs/cli/overview"
    exit 1
}

# Auto-detect machine role if not provided
if ([string]::IsNullOrEmpty($MachineRole)) {
    if (Test-Path "machine-info.json") {
        $machineInfo = Get-Content "machine-info.json" | ConvertFrom-Json
        $MachineRole = $machineInfo.role
        Write-Host "Auto-detected role: $MachineRole" -ForegroundColor Yellow
    }
    else {
        Write-Host "Error: Machine role not specified and machine-info.json not found" -ForegroundColor Red
        Write-Host "Usage: .\download-from-infisical.ps1 -MachineRole <role> [-OutputFile <path>]"
        Write-Host "Example: .\download-from-infisical.ps1 -MachineRole worker-rtx3060"
        exit 1
    }
}

$SharedPath = "/shared"
$MachinePath = "/machines/$MachineRole"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Project ID:  $ProjectId"
Write-Host "  Environment: $InfisicalEnv"
Write-Host "  Shared Path: $SharedPath"
Write-Host "  Machine Path: $MachinePath"
Write-Host "  Output File: $OutputFile"
Write-Host ""

# Backup existing .env if it exists
if (Test-Path $OutputFile) {
    $backupFile = "$OutputFile.backup"
    Copy-Item $OutputFile $backupFile -Force
    Write-Host "Backed up existing $OutputFile to $backupFile" -ForegroundColor Yellow
}

# Download shared variables
Write-Host "Downloading shared variables..." -ForegroundColor Yellow

try {
    $sharedVars = infisical secrets get `
        --projectId="$ProjectId" `
        --env="$InfisicalEnv" `
        --path="$SharedPath" `
        --format=dotenv 2>&1

    if ($LASTEXITCODE -eq 0) {
        # Create header
        $header = @"
# Project Nyra - Environment Variables
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Machine: $MachineRole
#
# This file is a merged view of:
#   - /shared (shared variables across all machines)
#   - /machines/$MachineRole (machine-specific variables)

# ==========================================
# SHARED VARIABLES
# ==========================================

"@

        $header | Out-File -FilePath $OutputFile -Encoding ASCII
        $sharedVars | Out-File -FilePath $OutputFile -Encoding ASCII -Append
        
        $sharedCount = ($sharedVars -split "`n" | Where-Object { $_ -match "^[A-Z]" }).Count
        Write-Host "  ✓ Downloaded $sharedCount shared variables" -ForegroundColor Green
    }
    else {
        Write-Host "  ✗ Failed to download shared variables" -ForegroundColor Red
        Write-Host "  Error: $sharedVars"
        exit 1
    }
}
catch {
    Write-Host "  ✗ Error downloading shared variables: $_" -ForegroundColor Red
    exit 1
}

# Download machine-specific variables
Write-Host "Downloading machine-specific variables..." -ForegroundColor Yellow

try {
    $machineVars = infisical secrets get `
        --projectId="$ProjectId" `
        --env="$InfisicalEnv" `
        --path="$MachinePath" `
        --format=dotenv 2>&1

    if ($LASTEXITCODE -eq 0) {
        # Add header for machine-specific section
        $machineHeader = @"

# ==========================================
# MACHINE-SPECIFIC VARIABLES ($MachineRole)
# ==========================================

"@

        $machineHeader | Out-File -FilePath $OutputFile -Encoding ASCII -Append
        $machineVars | Out-File -FilePath $OutputFile -Encoding ASCII -Append
        
        $machineCount = ($machineVars -split "`n" | Where-Object { $_ -match "^[A-Z]" }).Count
        Write-Host "  ✓ Downloaded $machineCount machine-specific variables" -ForegroundColor Green
    }
    else {
        Write-Host "  ✗ Failed to download machine variables" -ForegroundColor Red
        Write-Host "  Error: $machineVars"
        Write-Host ""
        Write-Host "Note: If machine path doesn't exist yet, upload with:" -ForegroundColor Yellow
        Write-Host "  .\upload-to-infisical.ps1 -MachineRole $MachineRole"
        exit 1
    }
}
catch {
    Write-Host "  ✗ Error downloading machine variables: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "  Downloaded: $($sharedCount + $machineCount) total variables" -ForegroundColor Green
Write-Host "  Output:     $OutputFile" -ForegroundColor Green

Write-Host ""
Write-Host "Usage:"
Write-Host "  # Use with docker-compose"
Write-Host "  docker-compose --env-file $OutputFile up"
Write-Host ""
Write-Host "  # Or run directly with Infisical (recommended)"
Write-Host "  infisical run --projectId='$ProjectId' --env='$InfisicalEnv' \"
Write-Host "    --path='$SharedPath' --path='$MachinePath' -- \"
Write-Host "    docker-compose up"
Write-Host ""
