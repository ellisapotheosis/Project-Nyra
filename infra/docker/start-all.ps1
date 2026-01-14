# ============================================================================
# Start ALL Phase 3 Services with Infisical Secret Injection
# ============================================================================
# This script starts the complete Phase 3 stack:
#   - Orchestration (Claude Flow, Archon OS, databases)
#   - MCP Servers (Gemini, Serena, Mem0)
#   - UI Services (Open-WebUI, LobeChat)
#
# Usage:
#   .\start-all.ps1
#   .\start-all.ps1 -Environment staging
#   .\start-all.ps1 -Down  # Stop all services
#   .\start-all.ps1 -Status  # Check status
# ============================================================================

[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev",

    [Parameter()]
    [switch]$Down,

    [Parameter()]
    [switch]$Status,

    [Parameter()]
    [switch]$Build
)

$ErrorActionPreference = "Stop"

Write-Host @"
╔══════════════════════════════════════════════════════════════════╗
║          PROJECT NYRA - PHASE 3 ORCHESTRATION STACK             ║
║                  Ultra-Fast-Start Deployment                     ║
╚══════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Handle status check
if ($Status) {
    Write-Host "`n📊 Checking service status..." -ForegroundColor Yellow
    Write-Host "`n=== Orchestration Stack ===" -ForegroundColor Cyan
    docker compose -f docker-compose.orchestration.yml ps
    Write-Host "`n=== MCP Servers ===" -ForegroundColor Cyan
    docker compose -f docker-compose.mcp.yml ps
    Write-Host "`n=== UI Services ===" -ForegroundColor Cyan
    docker compose -f docker-compose.ui.yml ps
    exit 0
}

# Handle shutdown
if ($Down) {
    Write-Host "`n🛑 Stopping all Phase 3 services..." -ForegroundColor Yellow
    Write-Host "`n   Stopping UI services..." -ForegroundColor Gray
    docker compose -f docker-compose.ui.yml down 2>&1 | Out-Null
    Write-Host "   Stopping MCP servers..." -ForegroundColor Gray
    docker compose -f docker-compose.mcp.yml down 2>&1 | Out-Null
    Write-Host "   Stopping orchestration stack..." -ForegroundColor Gray
    docker compose -f docker-compose.orchestration.yml down 2>&1 | Out-Null
    Write-Host "`n✅ All services stopped" -ForegroundColor Green
    exit 0
}

# Start all services
Write-Host "`n🚀 Starting Phase 3 Orchestration Stack" -ForegroundColor Yellow
Write-Host "   Environment: $Environment" -ForegroundColor Gray
Write-Host ""

# Step 1: Orchestration (databases must start first)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 1/3: Starting Orchestration Stack" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

& ".\start-orchestration.ps1" -Environment $Environment -Build:$Build
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Failed to start orchestration stack" -ForegroundColor Red
    exit 1
}

Write-Host "`n⏳ Waiting for databases to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 2: MCP Servers
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 2/3: Starting MCP Servers" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

& ".\start-mcp.ps1" -Environment $Environment
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️  Warning: MCP servers failed to start" -ForegroundColor Yellow
}

# Step 3: UI Services
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 3/3: Starting UI Services" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

& ".\start-ui.ps1" -Environment $Environment
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️  Warning: UI services failed to start" -ForegroundColor Yellow
}

# Summary
Write-Host "`n" + ("=" * 70) -ForegroundColor Green
Write-Host "✅ PHASE 3 ORCHESTRATION STACK DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ("=" * 70) -ForegroundColor Green

Write-Host "`n📋 Service URLs:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  🗄️  Databases:" -ForegroundColor Yellow
Write-Host "     PostgreSQL:        localhost:5432" -ForegroundColor White
Write-Host "     Redis:             localhost:6379" -ForegroundColor White
Write-Host "     FalkorDB:          localhost:6380" -ForegroundColor White
Write-Host "     Qdrant:            localhost:6333" -ForegroundColor White
Write-Host ""
Write-Host "  🤖 Orchestration:" -ForegroundColor Yellow
Write-Host "     Claude Flow:       http://localhost:9000" -ForegroundColor White
Write-Host "     Archon OS:         http://localhost:9001" -ForegroundColor White
Write-Host "     Nexus Router:      http://localhost:8000" -ForegroundColor White
Write-Host "     Letta:             http://localhost:8283" -ForegroundColor White
Write-Host ""
Write-Host "  🔌 MCP Servers:" -ForegroundColor Yellow
Write-Host "     Gemini MCP:        localhost:8085" -ForegroundColor White
Write-Host "     Serena MCP:        localhost:8086" -ForegroundColor White
Write-Host "     Mem0:              http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "  🎨 User Interfaces:" -ForegroundColor Yellow
Write-Host "     Open-WebUI:        http://localhost:3333" -ForegroundColor White
Write-Host "     LobeChat:          http://localhost:3334" -ForegroundColor White
Write-Host ""

Write-Host "📝 Quick Commands:" -ForegroundColor Cyan
Write-Host "   Check status:       .\start-all.ps1 -Status" -ForegroundColor White
Write-Host "   View logs:          docker compose -f docker-compose.orchestration.yml logs -f" -ForegroundColor White
Write-Host "   Stop all services:  .\start-all.ps1 -Down" -ForegroundColor White
Write-Host ""
