# Project Nyra - PC2 Health Check

$services = @(
    @{ Name = "Ollama"; Url = "http://localhost:11434/api/tags" },
    @{ Name = "Ruvector Leader"; Url = "http://localhost:6370/health" },
    @{ Name = "Letta"; Url = "http://localhost:8283/v1/health" },
    @{ Name = "Mem0"; Url = "http://localhost:4321/health" },
    @{ Name = "Dify Web"; Url = "http://localhost:3001" },
    @{ Name = "Dify API"; Url = "http://localhost:5001/health" }
)

Write-Host "PC2 Health Check" -ForegroundColor Cyan
Write-Host ""

$healthy = 0
foreach ($svc in $services) {
    try {
        $response = Invoke-WebRequest -Uri $svc.Url -TimeoutSec 5 -UseBasicParsing
        Write-Host "[✓] $($svc.Name)" -ForegroundColor Green
        $healthy++
    } catch {
        Write-Host "[✗] $($svc.Name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Status: $healthy / $($services.Count) healthy" -ForegroundColor $(if ($healthy -eq $services.Count) { "Green" } else { "Yellow" })
