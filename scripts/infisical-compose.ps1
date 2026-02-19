# Infisical Docker Compose Wrapper (PowerShell)
# Usage: .\scripts\infisical-compose.ps1 -Command "up -d" -ComposeFile "infra/docker-compose/docker-compose.archon.yml"
# Example: .\scripts\infisical-compose.ps1 -Command "up -d" -ComposeFile "infra/docker-compose/docker-compose.archon.yml"

param(
    [Parameter(Mandatory=$true)]
    [string]$Command,

    [Parameter(Mandatory=$false)]
    [string]$ComposeFile = "docker-compose.yml",

    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef",

    [Parameter(Mandatory=$false)]
    [string]$Environment = "dev",

    [Parameter(Mandatory=$false)]
    [string]$Path = "/shared"
)

Write-Host "🔐 Running Docker Compose with Infisical secrets..." -ForegroundColor Blue
Write-Host "Project ID: $ProjectId" -ForegroundColor Yellow
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Path: $Path" -ForegroundColor Yellow
Write-Host "Compose File: $ComposeFile" -ForegroundColor Yellow
Write-Host ""

# Build the infisical command
$infisicalCmd = "infisical run --projectId=`"$ProjectId`" --env=`"$Environment`" --path=`"$Path`" -- docker-compose -f `"$ComposeFile`" $Command"

Write-Host "Executing: $infisicalCmd" -ForegroundColor Cyan
Write-Host ""

# Execute the command
Invoke-Expression $infisicalCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Command completed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Command failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
