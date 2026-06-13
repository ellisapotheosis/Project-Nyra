# Project Nyra - Comprehensive Health Check Script
# Validates all services across 4-PC cluster

param(
    [switch]$Verbose = $false,
    [switch]$ExportReport = $false,
    [string]$ReportPath = ".\health-report.json"
)

$ErrorActionPreference = "Continue"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Project Nyra Health Check" -ForegroundColor Cyan
Write-Host "  Checking all 22 services..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Service definitions with PC assignment
$services = @(
    # PC1 - Orchestrator (10.0.0.1)
    @{PC="PC1"; Name="Nexus Router"; URL="http://10.0.0.1:6000/health"; Required=$true},
    @{PC="PC1"; Name="Letta (MemGPT)"; URL="http://10.0.0.1:8283/health"; Required=$true},
    @{PC="PC1"; Name="Mem0"; URL="http://10.0.0.1:4321/health"; Required=$true},
    @{PC="PC1"; Name="Claude Flow"; URL="http://10.0.0.1:3010/health"; Required=$true},
    @{PC="PC1"; Name="ruvector"; URL="http://10.0.0.1:8080/health"; Required=$true},
    @{PC="PC1"; Name="RuVector"; URL="http://10.0.0.1:8888/health"; Required=$false},
    @{PC="PC1"; Name="Redis (Orchestrator)"; URL="http://10.0.0.1:6380"; Required=$true},
    @{PC="PC1"; Name="Qdrant"; URL="http://10.0.0.1:6333/healthz"; Required=$false},

    # PC2 - Worker 2 (10.0.0.2)
    @{PC="PC2"; Name="TwentyCRM"; URL="http://10.0.0.2:3000/health"; Required=$true},
    @{PC="PC2"; Name="n8n"; URL="http://10.0.0.2:5678/healthz"; Required=$true},
    @{PC="PC2"; Name="Redis (Worker)"; URL="http://10.0.0.2:6379"; Required=$true},

    # PC3 - Worker 3 (10.0.0.3)
    @{PC="PC3"; Name="Ollama"; URL="http://10.0.0.3:11434"; Required=$true},
    @{PC="PC3"; Name="Neo4j"; URL="http://10.0.0.3:7474"; Required=$false},
    @{PC="PC3"; Name="FalkorDB"; URL="http://10.0.0.3:6379"; Required=$false},

    # PC4 - Worker 4 (10.0.0.4)
    @{PC="PC4"; Name="Prometheus"; URL="http://10.0.0.4:9090/-/healthy"; Required=$true},
    @{PC="PC4"; Name="Grafana"; URL="http://10.0.0.4:3005/api/health"; Required=$true},
    @{PC="PC4"; Name="Loki"; URL="http://10.0.0.4:3100/ready"; Required=$true},
    @{PC="PC4"; Name="Promtail"; URL="http://10.0.0.4:9080/ready"; Required=$false},
    @{PC="PC4"; Name="Alertmanager"; URL="http://10.0.0.4:9093/-/healthy"; Required=$false}
)

# Results tracking
$results = @()
$healthyCount = 0
$unhealthyCount = 0
$unreachableCount = 0

# Test each service
foreach ($service in $services) {
    $result = @{
        PC = $service.PC
        Name = $service.Name
        URL = $service.URL
        Required = $service.Required
        Status = "UNKNOWN"
        StatusCode = $null
        ResponseTime = $null
        Error = $null
        Timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    }

    Write-Host "Testing $($service.Name) ($($service.PC))... " -NoNewline

    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $service.URL -Method GET -TimeoutSec 5 -ErrorAction Stop
        $stopwatch.Stop()

        $result.StatusCode = $response.StatusCode
        $result.ResponseTime = $stopwatch.ElapsedMilliseconds

        if ($response.StatusCode -eq 200) {
            $result.Status = "HEALTHY"
            Write-Host "✓ HEALTHY" -ForegroundColor Green -NoNewline
            Write-Host " ($($result.ResponseTime)ms)" -ForegroundColor Gray
            $healthyCount++
        } else {
            $result.Status = "UNHEALTHY"
            Write-Host "⚠ UNHEALTHY (Status: $($response.StatusCode))" -ForegroundColor Yellow
            $unhealthyCount++
        }
    } catch {
        $result.Status = "UNREACHABLE"
        $result.Error = $_.Exception.Message

        if ($service.Required) {
            Write-Host "✗ UNREACHABLE" -ForegroundColor Red
        } else {
            Write-Host "⚠ UNREACHABLE (optional)" -ForegroundColor Yellow
        }

        if ($Verbose) {
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
        }

        $unreachableCount++
    }

    $results += $result
}

# Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Health Check Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$totalServices = $services.Count
$healthPercent = [math]::Round(($healthyCount / $totalServices) * 100, 2)

Write-Host "Total Services:   $totalServices" -ForegroundColor White
Write-Host "Healthy:          $healthyCount" -ForegroundColor Green
Write-Host "Unhealthy:        $unhealthyCount" -ForegroundColor Yellow
Write-Host "Unreachable:      $unreachableCount" -ForegroundColor Red
Write-Host "Health Score:     $healthPercent%" -ForegroundColor $(if ($healthPercent -ge 90) { "Green" } elseif ($healthPercent -ge 70) { "Yellow" } else { "Red" })
Write-Host ""

# Check required services
$requiredServices = $results | Where-Object { $_.Required -eq $true }
$requiredHealthy = ($requiredServices | Where-Object { $_.Status -eq "HEALTHY" }).Count
$requiredTotal = $requiredServices.Count

if ($requiredHealthy -eq $requiredTotal) {
    Write-Host "✓ All required services are healthy!" -ForegroundColor Green
    $exitCode = 0
} else {
    Write-Host "✗ Some required services are unhealthy!" -ForegroundColor Red
    Write-Host "  Required: $requiredHealthy / $requiredTotal healthy" -ForegroundColor Yellow
    $exitCode = 1

    # List unhealthy required services
    $unhealthyRequired = $requiredServices | Where-Object { $_.Status -ne "HEALTHY" }
    Write-Host ""
    Write-Host "Unhealthy Required Services:" -ForegroundColor Red
    foreach ($svc in $unhealthyRequired) {
        Write-Host "  - $($svc.Name) ($($svc.PC)): $($svc.Status)" -ForegroundColor Red
    }
}

# Per-PC breakdown
Write-Host ""
Write-Host "Per-PC Status:" -ForegroundColor Cyan
$pcGroups = $results | Group-Object -Property PC | Sort-Object Name
foreach ($group in $pcGroups) {
    $pcHealthy = ($group.Group | Where-Object { $_.Status -eq "HEALTHY" }).Count
    $pcTotal = $group.Group.Count
    $pcPercent = [math]::Round(($pcHealthy / $pcTotal) * 100, 2)

    $statusColor = if ($pcPercent -ge 90) { "Green" } elseif ($pcPercent -ge 70) { "Yellow" } else { "Red" }
    Write-Host "  $($group.Name): $pcHealthy/$pcTotal healthy ($pcPercent%)" -ForegroundColor $statusColor
}

# Export report if requested
if ($ExportReport) {
    Write-Host ""
    Write-Host "Exporting health report to: $ReportPath" -ForegroundColor Cyan

    $report = @{
        Timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        Summary = @{
            TotalServices = $totalServices
            Healthy = $healthyCount
            Unhealthy = $unhealthyCount
            Unreachable = $unreachableCount
            HealthPercent = $healthPercent
            RequiredHealthy = $requiredHealthy
            RequiredTotal = $requiredTotal
        }
        Services = $results
    }

    $report | ConvertTo-Json -Depth 10 | Out-File -FilePath $ReportPath -Encoding UTF8
    Write-Host "Report exported successfully" -ForegroundColor Green
}

# Recommendations
Write-Host ""
Write-Host "Recommendations:" -ForegroundColor Yellow

if ($unreachableCount -gt 0) {
    Write-Host "  1. Check network connectivity between PCs (ping 10.0.0.1-4)" -ForegroundColor White
    Write-Host "  2. Verify Docker containers are running: docker ps" -ForegroundColor White
    Write-Host "  3. Check service logs: docker compose logs [service-name]" -ForegroundColor White
}

if ($unhealthyCount -gt 0) {
    Write-Host "  1. Restart unhealthy services: docker compose restart [service-name]" -ForegroundColor White
    Write-Host "  2. Check service configuration and environment variables" -ForegroundColor White
    Write-Host "  3. Review logs for errors" -ForegroundColor White
}

Write-Host ""
Write-Host "Troubleshooting Guide: .\docs\MASTER-TROUBLESHOOTING.md" -ForegroundColor Cyan
Write-Host ""

exit $exitCode
