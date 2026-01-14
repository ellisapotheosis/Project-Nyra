# Project Nyra - PC4 Health Check

$services = @(
    @{ Name = "Ruvector Follower 2"; Url = "http://localhost:6370/health" },
    @{ Name = "n8n"; Url = "http://localhost:5678/healthz" },
    @{ Name = "Activepieces"; Url = "http://localhost:3400/api/health" },
    @{ Name = "Quote Engine"; Url = "http://localhost:8001/health" },
    @{ Name = "Campaign Engine"; Url = "http://localhost:8002/health" },
    @{ Name = "Orchestrator"; Url = "http://localhost:8010/health" }
)

Write-Host "PC4 Health Check" -ForegroundColor Cyan
Write-Host ""

$healthy = 0
foreach ($svc in $services) {
    try {
        Invoke-WebRequest -Uri $svc.Url -TimeoutSec 5 -UseBasicParsing | Out-Null
        Write-Host "[✓] $($svc.Name)" -ForegroundColor Green
        $healthy++
    } catch {
        Write-Host "[✗] $($svc.Name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Status: $healthy / $($services.Count) healthy" -ForegroundColor $(if ($healthy -eq $services.Count) { "Green" } else { "Yellow" })
