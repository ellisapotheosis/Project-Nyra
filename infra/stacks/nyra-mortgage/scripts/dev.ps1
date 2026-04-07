Param()

$ErrorActionPreference = "Stop"

Write-Host "Nyra Stack: local dev startup" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$StackDir = Resolve-Path (Join-Path $ScriptDir "..")
Set-Location $StackDir

if (!(Test-Path ".\.env")) {
  Copy-Item ".\.env.example" ".\.env"
  Write-Host "Created .env from .env.example. Fill keys and worker hosts before distributed routing." -ForegroundColor Yellow
}

bash ./scripts/mesh-preflight.sh

docker compose -f docker-compose.yml -f docker-compose.services.yml -f docker-compose.addons.yml config | Out-Null
docker compose -f docker-compose.yml -f docker-compose.services.yml -f docker-compose.addons.yml up -d --build

Write-Host ""
Write-Host "Up. Open:" -ForegroundColor Green
Write-Host "  Twenty CRM:            http://localhost:3000"
Write-Host "  Nyra Orchestrator API: http://localhost:8010/docs"
Write-Host "  Nexus Router:          http://localhost:6000"
Write-Host "  LiteLLM:               http://localhost:4000"
Write-Host "  Grafana:               http://localhost:3005 (admin/admin)"
Write-Host "  Open WebUI:            http://localhost:8080"
