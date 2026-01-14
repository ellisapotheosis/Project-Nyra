# Project Nyra - PC4 GPU Worker 3 Setup Script

$ErrorActionPreference = "Stop"

Write-Host "Project Nyra - PC4 GPU Worker 3 Setup" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".env.pc4")) {
    Copy-Item ".env.pc4.example" ".env.pc4"
    Write-Host "✓ Created .env.pc4" -ForegroundColor Green
    notepad.exe ".env.pc4"
    Read-Host "Press Enter after saving"
}

New-Item -ItemType Directory -Path "configs/n8n/workflows","configs/activepieces","configs/orchestrator" -Force | Out-Null

Write-Host "Starting services..." -ForegroundColor Yellow
docker compose -f docker-compose.pc4.yml --env-file .env.pc4 up -d

Start-Sleep -Seconds 30

Write-Host ""
Write-Host "✓ PC4 setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  Ruvector Follower: http://localhost:6370" -ForegroundColor White
Write-Host "  n8n:               http://localhost:5678" -ForegroundColor White
Write-Host "  Activepieces:      http://localhost:3400" -ForegroundColor White
Write-Host "  Quote Engine:      http://localhost:8001/docs" -ForegroundColor White
Write-Host "  Campaign Engine:   http://localhost:8002/docs" -ForegroundColor White
Write-Host "  Orchestrator:      http://localhost:8010/docs" -ForegroundColor White
