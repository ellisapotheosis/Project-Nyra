# Upload Machine-Specific Environment Variables to Infisical
# Usage: .\upload-to-infisical.ps1 [-MachineRole <role>] [-EnvFile <path>]

param(
    [string]$MachineRole = "",
    [string]$EnvFile = ".env.machine",
    [string]$InfisicalEnv = "prod",
    [string]$ProjectId = "pbcskpxyqtysbxjvecfo"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Upload to Infisical ===" -ForegroundColor Cyan
Write-Host ""

# Check if infisical CLI is installed
if (-not (Get-Command infisical -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Infisical CLI not found" -ForegroundColor Red
    Write-Host "Install: https://infisical.com/docs/cli/overview"
    exit 1
}

# Check if .env.machine exists
if (-not (Test-Path $EnvFile)) {
    Write-Host "Error: $EnvFile not found" -ForegroundColor Red
    Write-Host "Run: .\generate-machine-env.ps1 first"
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
        Write-Host "Usage: .\upload-to-infisical.ps1 -MachineRole <role> [-EnvFile <path>]"
        Write-Host "Example: .\upload-to-infisical.ps1 -MachineRole worker-rtx3060"
        exit 1
    }
}

$InfisicalPath = "/machines/$MachineRole"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Project ID:  $ProjectId"
Write-Host "  Environment: $InfisicalEnv"
Write-Host "  Path:        $InfisicalPath"
Write-Host "  File:        $EnvFile"
Write-Host ""

# Count variables
$content = Get-Content $EnvFile
$variables = $content | Where-Object { $_ -match "^[A-Z]" }
$varCount = $variables.Count

Write-Host "Found $varCount variables to upload" -ForegroundColor Cyan
Write-Host ""

# Ask for confirmation
$confirmation = Read-Host "Upload to Infisical? (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "Cancelled"
    exit 0
}

# Upload to Infisical
Write-Host "Uploading..." -ForegroundColor Yellow
$uploadCount = 0
$errorCount = 0

foreach ($line in $content) {
    # Skip comments and empty lines
    if ($line -match "^[[:space:]]*#" -or [string]::IsNullOrWhiteSpace($line)) {
        continue
    }

    # Parse KEY=VALUE
    if ($line -match "^([A-Z_][A-Z0-9_]*)=(.*)$") {
        $key = $Matches[1]
        $value = $Matches[2]

        try {
            # Upload to Infisical
            $result = infisical secrets set $key $value `
                --projectId="$ProjectId" `
                --env="$InfisicalEnv" `
                --path="$InfisicalPath" 2>&1

            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✓ $key" -ForegroundColor Green
                $uploadCount++
            }
            else {
                Write-Host "  ✗ $key - Failed" -ForegroundColor Red
                $errorCount++
            }
        }
        catch {
            Write-Host "  ✗ $key - Error: $_" -ForegroundColor Red
            $errorCount++
        }
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "  Uploaded: $uploadCount variables" -ForegroundColor Green

if ($errorCount -gt 0) {
    Write-Host "  Errors:   $errorCount variables" -ForegroundColor Red
}

Write-Host ""
Write-Host "Next Steps:"
Write-Host "  1. Verify in Infisical Dashboard: https://app.infisical.com"
Write-Host "  2. Test pull:"
Write-Host "     .\download-from-infisical.ps1 -MachineRole $MachineRole"
Write-Host ""
