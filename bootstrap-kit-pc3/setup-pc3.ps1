# Project Nyra - PC3 GPU Worker 2 Setup Script

$ErrorActionPreference = "Stop"

Write-Host "Project Nyra - PC3 GPU Worker 2 Setup" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".env.pc3")) {
    Copy-Item ".env.pc3.example" ".env.pc3"
    Write-Host "✓ Created .env.pc3" -ForegroundColor Green
    notepad.exe ".env.pc3"
    Read-Host "Press Enter after saving"
}

New-Item -ItemType Directory -Path "configs/postgres" -Force | Out-Null

Write-Host "Starting services..." -ForegroundColor Yellow
docker compose -f docker-compose.pc3.yml --env-file .env.pc3 up -d

Start-Sleep -Seconds 30

Write-Host ""
Write-Host "✓ PC3 setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  Ruvector Follower: http://localhost:6370" -ForegroundColor White
Write-Host "  PostgreSQL:        localhost:5432" -ForegroundColor White
Write-Host "  TwentyCRM:         http://localhost:3000" -ForegroundColor White
Write-Host "  Neo4j Browser:     http://localhost:7474" -ForegroundColor White
Write-Host "  FalkorDB:          localhost:6379" -ForegroundColor White
Write-Host "  Qdrant:            http://localhost:6333" -ForegroundColor White
