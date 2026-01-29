# Quick Start Script for Project Nyra with Redis
# This script starts all orchestration services including Redis

Write-Host "🚀 Starting Project Nyra Orchestration Stack with Redis" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "📋 Checking Docker status..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Navigate to docker compose directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\infra\docker"

Write-Host ""
Write-Host "📦 Starting services..." -ForegroundColor Yellow
Write-Host "   - Redis (with password authentication)" -ForegroundColor Gray
Write-Host "   - PostgreSQL" -ForegroundColor Gray
Write-Host "   - FalkorDB" -ForegroundColor Gray
Write-Host "   - Qdrant" -ForegroundColor Gray
Write-Host "   - Claude Flow (using Redis DB 1)" -ForegroundColor Gray
Write-Host "   - Archon OS (using Redis DB 2)" -ForegroundColor Gray
Write-Host "   - Nexus Router (using Redis DB 0)" -ForegroundColor Gray
Write-Host "   - Letta" -ForegroundColor Gray
Write-Host ""

# Start the services
docker-compose -f docker-compose.orchestration.yml up -d

# Wait a bit for services to start
Write-Host ""
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check Redis status
Write-Host ""
Write-Host "🔍 Checking Redis connection..." -ForegroundColor Yellow
$redisStatus = docker exec nyra-redis redis-cli -a cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s ping 2>$null

if ($redisStatus -eq "PONG") {
    Write-Host "✅ Redis is connected and responding" -ForegroundColor Green
} else {
    Write-Host "⚠️  Redis is not responding yet (may still be starting)" -ForegroundColor Yellow
}

# Check Nexus Router logs for Redis connection
Write-Host ""
Write-Host "🔍 Checking Nexus Router..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$nexusLogs = docker logs nyra-nexus-router --tail 20 2>$null | Select-String -Pattern "Redis"

if ($nexusLogs -match "Redis connected") {
    Write-Host "✅ Nexus Router connected to Redis (DB 0)" -ForegroundColor Green
} elseif ($nexusLogs -match "Redis unavailable") {
    Write-Host "⚠️  Nexus Router running without Redis (graceful degradation)" -ForegroundColor Yellow
    Write-Host "   This is OK, but you may want to check Redis status" -ForegroundColor Gray
} else {
    Write-Host "ℹ️  Nexus Router is starting..." -ForegroundColor Cyan
}

# Show service status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose -f docker-compose.orchestration.yml ps

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Service Endpoints:" -ForegroundColor Cyan
Write-Host "   - Nexus Router:     http://localhost:8000" -ForegroundColor White
Write-Host "   - Nexus Dashboard:  http://localhost:3005" -ForegroundColor White
Write-Host "   - Claude Flow:      http://localhost:9000" -ForegroundColor White
Write-Host "   - Archon OS:        http://localhost:9001" -ForegroundColor White
Write-Host "   - Letta:            http://localhost:8283" -ForegroundColor White
Write-Host "   - Redis:            localhost:6379 (password protected)" -ForegroundColor White
Write-Host "   - PostgreSQL:       localhost:5432" -ForegroundColor White
Write-Host "   - Qdrant:           http://localhost:6333" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Redis Database Allocation:" -ForegroundColor Cyan
Write-Host "   - DB 0: Nexus Router (cache, metrics, rate limits)" -ForegroundColor White
Write-Host "   - DB 1: Claude Flow (sessions, memory, patterns)" -ForegroundColor White
Write-Host "   - DB 2: Archon OS (task coordination)" -ForegroundColor White
Write-Host ""
Write-Host "📝 Useful Commands:" -ForegroundColor Cyan
Write-Host "   View logs:          docker-compose -f docker-compose.orchestration.yml logs -f" -ForegroundColor Gray
Write-Host "   View specific logs: docker logs nyra-nexus-router -f" -ForegroundColor Gray
Write-Host "   Stop services:      docker-compose -f docker-compose.orchestration.yml down" -ForegroundColor Gray
Write-Host "   Restart service:    docker-compose -f docker-compose.orchestration.yml restart nexus-router" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 Test Redis Connection:" -ForegroundColor Cyan
Write-Host "   docker exec -it nyra-redis redis-cli -a cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s" -ForegroundColor Gray
Write-Host "   Then run: SELECT 0; KEYS nexus:*" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Setup Summary:    REDIS-SETUP-COMPLETE.md" -ForegroundColor Gray
Write-Host "   - Detailed Guide:   services/nexus-router/REDIS-SETUP.md" -ForegroundColor Gray
Write-Host "   - Quick Reference:  services/nexus-router/QUICK-REDIS-SETUP.md" -ForegroundColor Gray
Write-Host ""

# Return to original directory
Set-Location $scriptPath

Write-Host "✨ Ready to go! Check the endpoints above to verify everything is working." -ForegroundColor Green
Write-Host ""
