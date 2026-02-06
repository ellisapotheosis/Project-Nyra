#!/usr/bin/env pwsh
# ==============================================================================
# ARCHON OS QUICK START SCRIPT
# ==============================================================================

Write-Host "🤖 Starting Archon OS..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file. Please edit it and set secure passwords!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Required changes:" -ForegroundColor Yellow
    Write-Host "  - POSTGRES_PASSWORD" -ForegroundColor White
    Write-Host "  - JWT_SECRET (32+ characters)" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter after editing .env to continue"
}

# Check if Docker is running
Write-Host "🐳 Checking Docker..." -ForegroundColor Cyan
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Start containers
Write-Host ""
Write-Host "🚀 Starting all containers..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Archon OS is starting!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Services will be available at:" -ForegroundColor Cyan
    Write-Host "  - Archon UI:     http://localhost:3737" -ForegroundColor White
    Write-Host "  - Archon Server: http://localhost:8181" -ForegroundColor White
    Write-Host "  - Archon MCP:    http://localhost:8051" -ForegroundColor White
    Write-Host "  - PostgreSQL:    localhost:5433" -ForegroundColor White
    Write-Host ""
    Write-Host "⏳ Wait 2-3 minutes for all health checks to pass..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Cyan
    Write-Host "  - View logs:    docker-compose logs -f" -ForegroundColor White
    Write-Host "  - Check status: docker-compose ps" -ForegroundColor White
    Write-Host "  - Stop:         docker-compose down" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Failed to start containers. Check logs with:" -ForegroundColor Red
    Write-Host "   docker-compose logs" -ForegroundColor White
}
