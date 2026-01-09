# ============================================================================
# Start Orchestration Stack with Infisical Secret Injection
# ============================================================================
# This script starts the Phase 3 orchestration stack (Claude Flow, Archon OS,
# databases) with secrets injected from Infisical.
#
# Usage:
#   .\start-orchestration.ps1
#   .\start-orchestration.ps1 -Environment staging
#   .\start-orchestration.ps1 -Down  # Stop services
#   .\start-orchestration.ps1 -Logs  # View logs
# ============================================================================

[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev",

    [Parameter()]
    [switch]$Down,

    [Parameter()]
    [switch]$Logs,

    [Parameter()]
    [switch]$Build,

    [Parameter()]
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# Configuration
$INFISICAL_PROJECT_ID = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
$INFISICAL_PATH = "/shared"
$COMPOSE_FILE = "docker-compose.orchestration.yml"

Write-Host "🚀 Project Nyra - Orchestration Stack" -ForegroundColor Cyan
Write-Host "=" * 70

# Check if Infisical CLI is installed
Write-Host "`n📋 Checking dependencies..." -ForegroundColor Yellow
try {
    $infisicalVersion = infisical --version 2>&1
    Write-Host "✓ Infisical CLI installed: $infisicalVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Infisical CLI not found!" -ForegroundColor Red
    Write-Host "`nInstall Infisical CLI:" -ForegroundColor Yellow
    Write-Host "  scoop install infisical" -ForegroundColor White
    Write-Host "  OR visit: https://infisical.com/docs/cli/overview" -ForegroundColor White
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running!" -ForegroundColor Red
    Write-Host "  Please start Docker Desktop and try again." -ForegroundColor White
    exit 1
}

# Handle different modes
if ($Down) {
    Write-Host "`n🛑 Stopping orchestration stack..." -ForegroundColor Yellow
    docker compose -f $COMPOSE_FILE down
    Write-Host "✓ Stack stopped" -ForegroundColor Green
    exit 0
}

if ($Logs) {
    Write-Host "`n📜 Showing logs..." -ForegroundColor Yellow
    docker compose -f $COMPOSE_FILE logs -f
    exit 0
}

# Start services with Infisical injection
Write-Host "`n🔐 Injecting secrets from Infisical..." -ForegroundColor Yellow
Write-Host "   Project ID: $INFISICAL_PROJECT_ID" -ForegroundColor Gray
Write-Host "   Environment: $Environment" -ForegroundColor Gray
Write-Host "   Path: $INFISICAL_PATH" -ForegroundColor Gray

$composeCommand = "docker compose -f $COMPOSE_FILE up -d"
if ($Build) {
    $composeCommand = "docker compose -f $COMPOSE_FILE up -d --build"
}

Write-Host "`n🚀 Starting services..." -ForegroundColor Yellow

# Use Infisical to inject secrets and run Docker Compose
$infisicalCommand = @"
infisical run --projectId="$INFISICAL_PROJECT_ID" --env="$Environment" --path="$INFISICAL_PATH" -- $composeCommand
"@

if ($Verbose) {
    Write-Host "`n[DEBUG] Running command:" -ForegroundColor Gray
    Write-Host $infisicalCommand -ForegroundColor Gray
}

Invoke-Expression $infisicalCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Orchestration stack started successfully!" -ForegroundColor Green
    Write-Host "`n📊 Services:" -ForegroundColor Cyan
    Write-Host "   • PostgreSQL:    localhost:5432" -ForegroundColor White
    Write-Host "   • Redis:         localhost:6379" -ForegroundColor White
    Write-Host "   • FalkorDB:      localhost:6380" -ForegroundColor White
    Write-Host "   • Qdrant:        localhost:6333" -ForegroundColor White
    Write-Host "   • Claude Flow:   localhost:9000" -ForegroundColor White
    Write-Host "   • Archon OS:     localhost:9001" -ForegroundColor White
    Write-Host "   • Nexus Router:  localhost:8000" -ForegroundColor White
    Write-Host "   • Letta:         localhost:8283" -ForegroundColor White

    Write-Host "`n📝 Useful commands:" -ForegroundColor Cyan
    Write-Host "   View logs:       .\start-orchestration.ps1 -Logs" -ForegroundColor White
    Write-Host "   Stop services:   .\start-orchestration.ps1 -Down" -ForegroundColor White
    Write-Host "   Check status:    docker compose -f $COMPOSE_FILE ps" -ForegroundColor White
} else {
    Write-Host "`n❌ Failed to start orchestration stack" -ForegroundColor Red
    Write-Host "   Check the error message above for details" -ForegroundColor Yellow
    exit 1
}
