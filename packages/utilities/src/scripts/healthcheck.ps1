# scripts/healthcheck.ps1 - Windows/PowerShell Health Check

Write-Host "🔍 Checking Project Nyra Infrastructure Health (PowerShell)..." -ForegroundColor Cyan

# Check Docker
$dockerCheck = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running." -ForegroundColor Red
    exit 1
}

# Check Tailscale
$tsCheck = tailscale status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Tailscale is not running or not authenticated." -ForegroundColor Yellow
}

# Check Services
$services = @("postgres", "redis", "litellm", "nexus")
foreach ($service in $services) {
    $ps = docker ps --filter "name=$service" --format "{{.Names}}"
    if ($ps) {
        Write-Host "✅ $service is UP" -ForegroundColor Green
    } else {
        Write-Host "❌ $service is DOWN" -ForegroundColor Red
    }
}

Write-Host "🎉 Health check complete." -ForegroundColor Green
