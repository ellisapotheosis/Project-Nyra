# ============================================================================
# Start UI Services with Infisical Secret Injection
# ============================================================================
# This script starts the UI stack (Open-WebUI, LobeChat) with secrets
# injected from Infisical.
#
# Usage:
#   .\start-ui.ps1
#   .\start-ui.ps1 -Down  # Stop services
# ============================================================================

[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev",

    [Parameter()]
    [switch]$Down,

    [Parameter()]
    [switch]$Logs
)

$ErrorActionPreference = "Stop"

# Configuration
$INFISICAL_PROJECT_ID = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
$INFISICAL_PATH = "/shared"
$COMPOSE_FILE = "docker-compose.ui.yml"

Write-Host "🎨 Project Nyra - UI Services" -ForegroundColor Cyan
Write-Host "=" * 70

if ($Down) {
    docker compose -f $COMPOSE_FILE down
    Write-Host "✓ UI services stopped" -ForegroundColor Green
    exit 0
}

if ($Logs) {
    docker compose -f $COMPOSE_FILE logs -f
    exit 0
}

Write-Host "`n🔐 Injecting secrets from Infisical..." -ForegroundColor Yellow
Write-Host "`n🚀 Starting UI services..." -ForegroundColor Yellow

infisical run --projectId="$INFISICAL_PROJECT_ID" --env="$Environment" --path="$INFISICAL_PATH" -- docker compose -f $COMPOSE_FILE up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ UI services started successfully!" -ForegroundColor Green
    Write-Host "`n📊 Services:" -ForegroundColor Cyan
    Write-Host "   • Open-WebUI:    http://localhost:3333" -ForegroundColor White
    Write-Host "   • LobeChat:      http://localhost:3334" -ForegroundColor White
} else {
    Write-Host "`n❌ Failed to start UI services" -ForegroundColor Red
    exit 1
}
