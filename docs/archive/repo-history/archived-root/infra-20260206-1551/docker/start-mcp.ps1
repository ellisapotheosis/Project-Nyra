# ============================================================================
# Start MCP Servers with Infisical Secret Injection
# ============================================================================
# This script starts the MCP server stack (Gemini Assistant, Serena, Mem0)
# with secrets injected from Infisical.
#
# Usage:
#   .\start-mcp.ps1
#   .\start-mcp.ps1 -Environment staging
#   .\start-mcp.ps1 -Down  # Stop services
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
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# Configuration
$INFISICAL_PROJECT_ID = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
$INFISICAL_PATH = "/shared"
$COMPOSE_FILE = "docker-compose.mcp.yml"

Write-Host "🤖 Project Nyra - MCP Servers" -ForegroundColor Cyan
Write-Host "=" * 70

# Check dependencies
if ($Down) {
    docker compose -f $COMPOSE_FILE down
    Write-Host "✓ MCP servers stopped" -ForegroundColor Green
    exit 0
}

if ($Logs) {
    docker compose -f $COMPOSE_FILE logs -f
    exit 0
}

Write-Host "`n🔐 Injecting secrets from Infisical..." -ForegroundColor Yellow
Write-Host "`n🚀 Starting MCP servers..." -ForegroundColor Yellow

infisical run --projectId="$INFISICAL_PROJECT_ID" --env="$Environment" --path="$INFISICAL_PATH" -- docker compose -f $COMPOSE_FILE up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ MCP servers started successfully!" -ForegroundColor Green
    Write-Host "`n📊 Services:" -ForegroundColor Cyan
    Write-Host "   • Gemini MCP:    localhost:8085" -ForegroundColor White
    Write-Host "   • Serena MCP:    localhost:8086" -ForegroundColor White
    Write-Host "   • Mem0:          localhost:8080" -ForegroundColor White
} else {
    Write-Host "`n❌ Failed to start MCP servers" -ForegroundColor Red
    exit 1
}
