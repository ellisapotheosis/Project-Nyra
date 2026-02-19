# Sequential Pull to identify issues
Write-Host "⬇️ Pulling images individually to isolate issues..." -ForegroundColor Cyan

$services = @("nyra-nexus", "nyra-litellm", "nyra-archon", "nyra-twenty", "nyra-n8n", "nyra-activepieces", "nyra-falkordb", "nyra-letta", "nyra-redis")
foreach ($svc in $services) {
    Write-Host "  Pulling $svc..." -NoNewline
    docker compose `
        -f infra/docker/orchestrator/docker-compose.nexus.yml `
        -f infra/docker/orchestrator/docker-compose.core.yml `
        -f infra/docker/orchestrator/docker-compose.memory.yml `
        -f infra/docker/orchestrator/docker-compose.workflows.yml `
        -f infra/docker/orchestrator/docker-compose.twenty.yml `
        pull $svc 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host " OK" -ForegroundColor Green }
    else { Write-Host " FAILED (Check auth/network)" -ForegroundColor Red }
}

Write-Host "🚀 Starting Stack..." -ForegroundColor Cyan
docker compose `
    -f infra/docker/orchestrator/docker-compose.nexus.yml `
    -f infra/docker/orchestrator/docker-compose.core.yml `
    -f infra/docker/orchestrator/docker-compose.memory.yml `
    -f infra/docker/orchestrator/docker-compose.workflows.yml `
    -f infra/docker/orchestrator/docker-compose.twenty.yml `
    up -d --remove-orphans

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Stack deployed successfully!" -ForegroundColor Green
    Write-Host "Run 'bash infra/scripts/health-check-all.sh' to verify." -ForegroundColor Yellow
} else {
    Write-Host "❌ Deployment failed." -ForegroundColor Red
}
