Param()

$ErrorActionPreference = "Stop"

Write-Host "Nyra Stack: local dev startup" -ForegroundColor Cyan

if (!(Test-Path ".\.env")) {
  Copy-Item ".\.env.example" ".\.env"
  Write-Host "Created .env from .env.example. Fill keys before using outbound comms / LLM providers." -ForegroundColor Yellow
}

docker compose -f docker-compose.yml -f docker-compose.services.yml up -d --build

Write-Host ""
Write-Host "Up. Open:" -ForegroundColor Green
Write-Host "  Twenty CRM:            http://localhost:3000"
Write-Host "  Nyra Orchestrator API: http://localhost:8010/docs"
Write-Host "  Nexus Router:          http://localhost:6000"
Write-Host "  Grafana:               http://localhost:3005 (admin/admin)"
Write-Host "  Open WebUI:            http://localhost:8080"
