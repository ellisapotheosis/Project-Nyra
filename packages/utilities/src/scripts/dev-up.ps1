# scripts/dev-up.ps1

Write-Host "🚀 Starting Project Nyra Foundation Stack (PowerShell)..." -ForegroundColor Cyan

# Start core services
docker compose -f infra/hosts/orchestrator/docker-compose.yml up -d

Write-Host "✅ Stack is coming up. Run '.\scripts\healthcheck.ps1' in a moment to verify." -ForegroundColor Green
