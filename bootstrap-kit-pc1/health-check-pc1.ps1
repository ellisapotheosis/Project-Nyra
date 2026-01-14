# Project Nyra - PC1 Health Check Script
# Validates all orchestrator services are running correctly

param(
    [switch]$Verbose = $false,
    [switch]$Json = $false
)

$ErrorActionPreference = "Continue"

# ============================================================================
# CONFIGURATION
# ============================================================================

$services = @(
    @{
        Name = "Nexus Router"
        Url = "http://localhost:8000/health"
        Container = "nyra-nexus-pc1"
        Critical = $true
    },
    @{
        Name = "Nexus Admin"
        Url = "http://localhost:4001"
        Container = "nyra-nexus-pc1"
        Critical = $true
    },
    @{
        Name = "Claude Flow"
        Url = "http://localhost:9000/health"
        Container = "nyra-claude-flow-pc1"
        Critical = $true
    },
    @{
        Name = "Claude Flow UI"
        Url = "http://localhost:9001"
        Container = "nyra-claude-flow-pc1"
        Critical = $false
    },
    @{
        Name = "Archon OS"
        Url = "http://localhost:9002/health"
        Container = "nyra-archon-os-pc1"
        Critical = $true
    },
    @{
        Name = "Archon OS UI"
        Url = "http://localhost:9003"
        Container = "nyra-archon-os-pc1"
        Critical = $false
    },
    @{
        Name = "Prometheus"
        Url = "http://localhost:9090/-/healthy"
        Container = "nyra-prometheus-pc1"
        Critical = $true
    },
    @{
        Name = "Grafana"
        Url = "http://localhost:3005/api/health"
        Container = "nyra-grafana-pc1"
        Critical = $true
    },
    @{
        Name = "Loki"
        Url = "http://localhost:3100/ready"
        Container = "nyra-loki-pc1"
        Critical = $true
    },
    @{
        Name = "AlertManager"
        Url = "http://localhost:9093/-/healthy"
        Container = "nyra-alertmanager-pc1"
        Critical = $false
    },
    @{
        Name = "Node Exporter"
        Url = "http://localhost:9100/metrics"
        Container = "nyra-node-exporter-pc1"
        Critical = $false
    }
)

# ============================================================================
# FUNCTIONS
# ============================================================================

function Test-ServiceHealth {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 5
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSeconds -UseBasicParsing
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            ResponseTime = $response.Headers["X-Response-Time"]
        }
    } catch {
        return @{
            Success = $false
            StatusCode = $_.Exception.Response.StatusCode.value__
            Error = $_.Exception.Message
        }
    }
}

function Get-ContainerStatus {
    param([string]$ContainerName)

    try {
        $inspect = docker inspect $ContainerName | ConvertFrom-Json
        return @{
            Running = $inspect[0].State.Running
            Status = $inspect[0].State.Status
            Health = $inspect[0].State.Health.Status
            StartedAt = $inspect[0].State.StartedAt
        }
    } catch {
        return @{
            Running = $false
            Status = "not found"
            Error = $_.Exception.Message
        }
    }
}

function Format-Status {
    param(
        [bool]$Success,
        [bool]$Critical
    )

    if ($Success) {
        return "[✓]", "Green"
    } elseif ($Critical) {
        return "[✗]", "Red"
    } else {
        return "[!]", "Yellow"
    }
}

# ============================================================================
# MAIN HEALTH CHECK
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Project Nyra - PC1 Health Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$results = @()
$totalServices = $services.Count
$healthyServices = 0
$criticalFailures = 0

foreach ($service in $services) {
    Write-Host "Checking $($service.Name)..." -NoNewline

    # Check container status
    $containerStatus = Get-ContainerStatus -ContainerName $service.Container

    if (-not $containerStatus.Running) {
        $status, $color = Format-Status -Success $false -Critical $service.Critical
        Write-Host " $status Container not running" -ForegroundColor $color

        if ($service.Critical) {
            $criticalFailures++
        }

        $results += @{
            Service = $service.Name
            Healthy = $false
            ContainerRunning = $false
            Reason = "Container not running"
            Critical = $service.Critical
        }

        if ($Verbose) {
            Write-Host "  Status: $($containerStatus.Status)" -ForegroundColor Gray
        }

        continue
    }

    # Check HTTP endpoint
    $healthCheck = Test-ServiceHealth -Url $service.Url

    if ($healthCheck.Success) {
        $status, $color = Format-Status -Success $true -Critical $service.Critical
        Write-Host " $status Healthy" -ForegroundColor $color
        $healthyServices++

        $results += @{
            Service = $service.Name
            Healthy = $true
            ContainerRunning = $true
            StatusCode = $healthCheck.StatusCode
            ResponseTime = $healthCheck.ResponseTime
            Critical = $service.Critical
        }

        if ($Verbose) {
            Write-Host "  URL: $($service.Url)" -ForegroundColor Gray
            Write-Host "  Status Code: $($healthCheck.StatusCode)" -ForegroundColor Gray
            Write-Host "  Container: $($service.Container)" -ForegroundColor Gray
        }
    } else {
        $status, $color = Format-Status -Success $false -Critical $service.Critical
        Write-Host " $status Unhealthy" -ForegroundColor $color

        if ($service.Critical) {
            $criticalFailures++
        }

        $results += @{
            Service = $service.Name
            Healthy = $false
            ContainerRunning = $true
            StatusCode = $healthCheck.StatusCode
            Error = $healthCheck.Error
            Critical = $service.Critical
        }

        if ($Verbose) {
            Write-Host "  URL: $($service.Url)" -ForegroundColor Gray
            Write-Host "  Error: $($healthCheck.Error)" -ForegroundColor Gray
        }
    }
}

# ============================================================================
# SUMMARY
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$healthPercent = [math]::Round(($healthyServices / $totalServices) * 100, 1)

Write-Host "Total Services:      $totalServices" -ForegroundColor White
Write-Host "Healthy:             $healthyServices" -ForegroundColor Green
Write-Host "Unhealthy:           $($totalServices - $healthyServices)" -ForegroundColor $(if ($totalServices -eq $healthyServices) { "Green" } else { "Yellow" })
Write-Host "Critical Failures:   $criticalFailures" -ForegroundColor $(if ($criticalFailures -eq 0) { "Green" } else { "Red" })
Write-Host "Health Percentage:   $healthPercent%" -ForegroundColor $(
    if ($healthPercent -eq 100) { "Green" }
    elseif ($healthPercent -ge 80) { "Yellow" }
    else { "Red" }
)

Write-Host ""

# Check for critical failures
if ($criticalFailures -gt 0) {
    Write-Host "⚠️  CRITICAL FAILURES DETECTED" -ForegroundColor Red
    Write-Host ""
    Write-Host "The following critical services are not healthy:" -ForegroundColor Yellow
    foreach ($result in $results) {
        if ($result.Critical -and -not $result.Healthy) {
            Write-Host "  - $($result.Service)" -ForegroundColor Red
        }
    }
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check logs: docker compose -f docker-compose.pc1.yml logs" -ForegroundColor White
    Write-Host "  2. Restart services: docker compose -f docker-compose.pc1.yml restart" -ForegroundColor White
    Write-Host "  3. Check .env.pc1 for missing API keys" -ForegroundColor White
    Write-Host ""
    exit 1
}

if ($healthyServices -eq $totalServices) {
    Write-Host "✓ All services are healthy!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some non-critical services are unhealthy" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# JSON OUTPUT (Optional)
# ============================================================================

if ($Json) {
    $output = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        TotalServices = $totalServices
        HealthyServices = $healthyServices
        UnhealthyServices = $totalServices - $healthyServices
        CriticalFailures = $criticalFailures
        HealthPercent = $healthPercent
        Services = $results
    }

    $output | ConvertTo-Json -Depth 10
}

# Exit with appropriate code
if ($criticalFailures -gt 0) {
    exit 1
} else {
    exit 0
}
