# Project Nyra - PC3 Health Check

$services = @(
    @{ Name = "Ruvector Follower 1"; Url = "http://localhost:6370/health" },
    @{ Name = "PostgreSQL"; Container = "nyra-postgres-pc3" },
    @{ Name = "TwentyCRM"; Url = "http://localhost:3000/healthz" },
    @{ Name = "Neo4j"; Url = "http://localhost:7474" },
    @{ Name = "FalkorDB"; Container = "nyra-falkordb-pc3" },
    @{ Name = "Qdrant"; Url = "http://localhost:6333/health" }
)

Write-Host "PC3 Health Check" -ForegroundColor Cyan
Write-Host ""

$healthy = 0
foreach ($svc in $services) {
    if ($svc.Url) {
        try {
            Invoke-WebRequest -Uri $svc.Url -TimeoutSec 5 -UseBasicParsing | Out-Null
            Write-Host "[✓] $($svc.Name)" -ForegroundColor Green
            $healthy++
        } catch {
            Write-Host "[✗] $($svc.Name)" -ForegroundColor Red
        }
    } else {
        $status = docker inspect -f '{{.State.Running}}' $svc.Container 2>$null
        if ($status -eq "true") {
            Write-Host "[✓] $($svc.Name)" -ForegroundColor Green
            $healthy++
        } else {
            Write-Host "[✗] $($svc.Name)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Status: $healthy / $($services.Count) healthy" -ForegroundColor $(if ($healthy -eq $services.Count) { "Green" } else { "Yellow" })
