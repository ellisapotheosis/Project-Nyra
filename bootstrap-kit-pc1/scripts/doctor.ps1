#!/usr/bin/env pwsh
#Requires -Version 7.0

<#
.SYNOPSIS
    Health check all Project Nyra services on PC1 (Orchestrator)

.DESCRIPTION
    Performs comprehensive health checks on all orchestrator services including
    databases, caches, monitoring, and application services. Generates a health
    report with actionable recommendations.

.PARAMETER Service
    Specific service to check (optional, checks all if not specified)

.PARAMETER Verbose
    Show detailed health check output

.PARAMETER Quick
    Run only critical health checks (skip deep diagnostics)

.EXAMPLE
    .\doctor.ps1
    Run health checks on all services

.EXAMPLE
    .\doctor.ps1 -Service postgres
    Check only PostgreSQL health

.EXAMPLE
    .\doctor.ps1 -Verbose
    Run health checks with detailed output

.NOTES
    PC: PC1 (Orchestrator)
    Role: Service health diagnostics
    Author: Project Nyra Team
#>

param(
    [string]$Service,
    [switch]$Verbose,
    [switch]$Quick
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path (Split-Path $ScriptDir -Parent) -Parent
$ComposeFile = Join-Path $ProjectRoot "infra\docker-compose.dev.yml"

# Color functions
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Failure { param($Message) Write-Host $Message -ForegroundColor Red }
function Write-Header { param($Message) Write-Host "`n====== $Message ======" -ForegroundColor Magenta }

# Health check result tracking
$script:healthResults = @()
$script:totalChecks = 0
$script:passedChecks = 0
$script:failedChecks = 0
$script:warningChecks = 0

# Add health check result
function Add-HealthResult {
    param(
        [string]$Category,
        [string]$Check,
        [ValidateSet("PASS", "FAIL", "WARN")]
        [string]$Status,
        [string]$Message,
        [string]$Recommendation = ""
    )

    $script:totalChecks++

    switch ($Status) {
        "PASS" { $script:passedChecks++; $icon = "✅" }
        "FAIL" { $script:failedChecks++; $icon = "❌" }
        "WARN" { $script:warningChecks++; $icon = "⚠️" }
    }

    $result = @{
        Category = $Category
        Check = $Check
        Status = $Status
        Message = $Message
        Recommendation = $Recommendation
        Icon = $icon
    }

    $script:healthResults += $result

    if ($Verbose) {
        $color = switch ($Status) {
            "PASS" { "Green" }
            "FAIL" { "Red" }
            "WARN" { "Yellow" }
        }
        Write-Host "$icon $Category - $Check`: $Message" -ForegroundColor $color
    }
}

# Check if Docker is running
function Test-DockerRunning {
    try {
        docker info | Out-Null
        Add-HealthResult -Category "Docker" -Check "Docker Daemon" -Status "PASS" -Message "Docker is running"
        return $true
    } catch {
        Add-HealthResult -Category "Docker" -Check "Docker Daemon" -Status "FAIL" -Message "Docker is not running" -Recommendation "Start Docker Desktop"
        return $false
    }
}

# Check Docker Compose file exists
function Test-ComposeFile {
    if (Test-Path $ComposeFile) {
        Add-HealthResult -Category "Configuration" -Check "Compose File" -Status "PASS" -Message "docker-compose.dev.yml found"
        return $true
    } else {
        Add-HealthResult -Category "Configuration" -Check "Compose File" -Status "FAIL" -Message "docker-compose.dev.yml not found" -Recommendation "Verify project structure"
        return $false
    }
}

# Check container status
function Test-ContainerStatus {
    param([string]$ServiceName, [string]$ContainerName)

    $container = docker ps --filter "name=$ContainerName" --format "{{.Names}}\t{{.Status}}" 2>$null

    if ($container) {
        $status = $container.Split("`t")[1]
        if ($status -match "Up") {
            Add-HealthResult -Category "Containers" -Check "$ServiceName Status" -Status "PASS" -Message "Running ($status)"
            return $true
        } else {
            Add-HealthResult -Category "Containers" -Check "$ServiceName Status" -Status "WARN" -Message "Unhealthy ($status)" -Recommendation "Check service logs"
            return $false
        }
    } else {
        Add-HealthResult -Category "Containers" -Check "$ServiceName Status" -Status "FAIL" -Message "Container not running" -Recommendation "Start with './up.ps1'"
        return $false
    }
}

# Check database connectivity
function Test-DatabaseConnectivity {
    Write-Info "🔍 Testing database connectivity..." if $Verbose

    # PostgreSQL
    $pgTest = docker exec nyra-postgres pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) {
        Add-HealthResult -Category "Databases" -Check "PostgreSQL" -Status "PASS" -Message "Accepting connections"
    } else {
        Add-HealthResult -Category "Databases" -Check "PostgreSQL" -Status "FAIL" -Message "Not accepting connections" -Recommendation "Check PostgreSQL logs"
    }

    # Redis
    $redisTest = docker exec nyra-redis redis-cli ping 2>$null
    if ($redisTest -eq "PONG") {
        Add-HealthResult -Category "Databases" -Check "Redis" -Status "PASS" -Message "Responding to PING"
    } else {
        Add-HealthResult -Category "Databases" -Check "Redis" -Status "FAIL" -Message "Not responding" -Recommendation "Check Redis logs"
    }

    # FalkorDB (if not Quick mode)
    if (-not $Quick) {
        $falkorTest = docker exec nyra-falkordb redis-cli ping 2>$null
        if ($falkorTest -eq "PONG") {
            Add-HealthResult -Category "Databases" -Check "FalkorDB" -Status "PASS" -Message "Responding to PING"
        } else {
            Add-HealthResult -Category "Databases" -Check "FalkorDB" -Status "WARN" -Message "Not responding" -Recommendation "Check FalkorDB logs"
        }
    }

    # Qdrant
    try {
        $qdrantHealth = Invoke-RestMethod -Uri "http://localhost:6333/healthz" -Method Get -TimeoutSec 5 -ErrorAction Stop
        Add-HealthResult -Category "Databases" -Check "Qdrant" -Status "PASS" -Message "Health endpoint responding"
    } catch {
        Add-HealthResult -Category "Databases" -Check "Qdrant" -Status "WARN" -Message "Health endpoint not responding" -Recommendation "Check Qdrant logs"
    }
}

# Check service health endpoints
function Test-ServiceHealthEndpoints {
    Write-Info "🔍 Testing service health endpoints..." if $Verbose

    # Grafana
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Add-HealthResult -Category "Services" -Check "Grafana" -Status "PASS" -Message "Health endpoint OK"
        }
    } catch {
        Add-HealthResult -Category "Services" -Check "Grafana" -Status "WARN" -Message "Health endpoint not responding" -Recommendation "Check Grafana logs"
    }

    # Prometheus
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9090/-/healthy" -Method Get -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Add-HealthResult -Category "Services" -Check "Prometheus" -Status "PASS" -Message "Health endpoint OK"
        }
    } catch {
        Add-HealthResult -Category "Services" -Check "Prometheus" -Status "WARN" -Message "Health endpoint not responding" -Recommendation "Check Prometheus logs"
    }

    # LiteLLM
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Add-HealthResult -Category "Services" -Check "LiteLLM" -Status "PASS" -Message "Health endpoint OK"
        }
    } catch {
        Add-HealthResult -Category "Services" -Check "LiteLLM" -Status "WARN" -Message "Health endpoint not responding" -Recommendation "Check LiteLLM logs"
    }

    # Letta
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8283/v1/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Add-HealthResult -Category "Services" -Check "Letta" -Status "PASS" -Message "Health endpoint OK"
        }
    } catch {
        Add-HealthResult -Category "Services" -Check "Letta" -Status "WARN" -Message "Health endpoint not responding" -Recommendation "Check Letta logs"
    }
}

# Check network connectivity
function Test-NetworkConnectivity {
    Write-Info "🔍 Testing network connectivity..." if $Verbose

    # Check nyra-network exists
    $network = docker network ls --filter "name=nyra-network" --format "{{.Name}}" 2>$null
    if ($network -eq "nyra-network") {
        Add-HealthResult -Category "Network" -Check "Docker Network" -Status "PASS" -Message "nyra-network exists"

        # Check connected containers
        $networkInfo = docker network inspect nyra-network 2>$null | ConvertFrom-Json
        $containerCount = $networkInfo.Containers.Count
        if ($containerCount -gt 0) {
            Add-HealthResult -Category "Network" -Check "Network Connectivity" -Status "PASS" -Message "$containerCount containers connected"
        } else {
            Add-HealthResult -Category "Network" -Check "Network Connectivity" -Status "WARN" -Message "No containers connected" -Recommendation "Start services with './up.ps1'"
        }
    } else {
        Add-HealthResult -Category "Network" -Check "Docker Network" -Status "FAIL" -Message "nyra-network not found" -Recommendation "Run './up.ps1' to create network"
    }
}

# Check port availability
function Test-PortAvailability {
    Write-Info "🔍 Testing port availability..." if $Verbose

    $ports = @(
        @{Port=5432; Service="PostgreSQL"},
        @{Port=6380; Service="Redis"},
        @{Port=6379; Service="FalkorDB"},
        @{Port=6333; Service="Qdrant"},
        @{Port=3000; Service="Grafana"},
        @{Port=9090; Service="Prometheus"},
        @{Port=4000; Service="LiteLLM"},
        @{Port=5678; Service="n8n"},
        @{Port=8283; Service="Letta"}
    )

    foreach ($item in $ports) {
        try {
            $connection = Test-NetConnection -ComputerName localhost -Port $item.Port -WarningAction SilentlyContinue -ErrorAction Stop
            if ($connection.TcpTestSucceeded) {
                Add-HealthResult -Category "Ports" -Check "$($item.Service) Port $($item.Port)" -Status "PASS" -Message "Port is open"
            } else {
                Add-HealthResult -Category "Ports" -Check "$($item.Service) Port $($item.Port)" -Status "WARN" -Message "Port not responding" -Recommendation "Check if service is running"
            }
        } catch {
            Add-HealthResult -Category "Ports" -Check "$($item.Service) Port $($item.Port)" -Status "WARN" -Message "Port check failed" -Recommendation "Verify service is running"
        }
    }
}

# Check disk space for volumes
function Test-DiskSpace {
    Write-Info "🔍 Testing disk space..." if $Verbose

    $volumes = docker volume ls --filter "name=nyra" --format "{{.Name}}" 2>$null

    if ($volumes) {
        foreach ($volume in $volumes) {
            $volumeInfo = docker volume inspect $volume 2>$null | ConvertFrom-Json
            if ($volumeInfo) {
                $mountPoint = $volumeInfo.Mountpoint
                try {
                    $drive = (Get-Item $mountPoint).PSDrive
                    $freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
                    $usedSpaceGB = [math]::Round($drive.Used / 1GB, 2)
                    $percentFree = [math]::Round(($drive.Free / ($drive.Free + $drive.Used)) * 100, 2)

                    if ($percentFree -lt 10) {
                        Add-HealthResult -Category "Storage" -Check "$volume Space" -Status "FAIL" -Message "Only ${percentFree}% free (${freeSpaceGB}GB)" -Recommendation "Free up disk space immediately"
                    } elseif ($percentFree -lt 20) {
                        Add-HealthResult -Category "Storage" -Check "$volume Space" -Status "WARN" -Message "${percentFree}% free (${freeSpaceGB}GB)" -Recommendation "Consider freeing up disk space"
                    } else {
                        Add-HealthResult -Category "Storage" -Check "$volume Space" -Status "PASS" -Message "${percentFree}% free (${freeSpaceGB}GB)"
                    }
                } catch {
                    Add-HealthResult -Category "Storage" -Check "$volume Space" -Status "WARN" -Message "Unable to check disk space" -Recommendation "Check volume manually"
                }
            }
        }
    } else {
        Add-HealthResult -Category "Storage" -Check "Docker Volumes" -Status "WARN" -Message "No volumes found" -Recommendation "Run './up.ps1' to create volumes"
    }
}

# Check resource usage
function Test-ResourceUsage {
    Write-Info "🔍 Testing resource usage..." if $Verbose

    $containers = docker ps --filter "name=nyra-" --format "{{.Names}}" 2>$null

    if ($containers) {
        foreach ($container in $containers) {
            $stats = docker stats $container --no-stream --format "{{.CPUPerc}}\t{{.MemPerc}}" 2>$null
            if ($stats) {
                $cpuPercent = [double]($stats.Split("`t")[0] -replace '%', '')
                $memPercent = [double]($stats.Split("`t")[1] -replace '%', '')

                # Check CPU usage
                if ($cpuPercent -gt 80) {
                    Add-HealthResult -Category "Resources" -Check "$container CPU" -Status "WARN" -Message "${cpuPercent}% CPU usage" -Recommendation "Investigate high CPU usage"
                } elseif ($cpuPercent -gt 50) {
                    Add-HealthResult -Category "Resources" -Check "$container CPU" -Status "PASS" -Message "${cpuPercent}% CPU usage (elevated)"
                } else {
                    if ($Verbose) {
                        Add-HealthResult -Category "Resources" -Check "$container CPU" -Status "PASS" -Message "${cpuPercent}% CPU usage"
                    }
                }

                # Check memory usage
                if ($memPercent -gt 90) {
                    Add-HealthResult -Category "Resources" -Check "$container Memory" -Status "WARN" -Message "${memPercent}% memory usage" -Recommendation "Consider increasing memory limit"
                } elseif ($memPercent -gt 70) {
                    Add-HealthResult -Category "Resources" -Check "$container Memory" -Status "PASS" -Message "${memPercent}% memory usage (elevated)"
                } else {
                    if ($Verbose) {
                        Add-HealthResult -Category "Resources" -Check "$container Memory" -Status "PASS" -Message "${memPercent}% memory usage"
                    }
                }
            }
        }
    }
}

# Generate health report
function Show-HealthReport {
    Write-Header "Health Check Summary"

    # Overall health score
    $healthScore = if ($script:totalChecks -gt 0) {
        [math]::Round(($script:passedChecks / $script:totalChecks) * 100, 2)
    } else {
        0
    }

    Write-Info "📊 Overall Health Score: ${healthScore}%"
    Write-Success "✅ Passed: $script:passedChecks"
    Write-Warning "⚠️  Warnings: $script:warningChecks"
    Write-Failure "❌ Failed: $script:failedChecks"

    # Detailed results by category
    $categories = $script:healthResults | Group-Object -Property Category

    foreach ($category in $categories) {
        Write-Header "$($category.Name) Results"

        foreach ($result in $category.Group) {
            $color = switch ($result.Status) {
                "PASS" { "Green" }
                "FAIL" { "Red" }
                "WARN" { "Yellow" }
            }

            Write-Host "$($result.Icon) $($result.Check): $($result.Message)" -ForegroundColor $color

            if ($result.Recommendation -and ($result.Status -eq "FAIL" -or $result.Status -eq "WARN")) {
                Write-Host "   💡 Recommendation: $($result.Recommendation)" -ForegroundColor Cyan
            }
        }
    }

    # Critical issues
    $criticalIssues = $script:healthResults | Where-Object { $_.Status -eq "FAIL" }
    if ($criticalIssues.Count -gt 0) {
        Write-Header "⚠️  Critical Issues Requiring Attention"
        foreach ($issue in $criticalIssues) {
            Write-Failure "❌ $($issue.Category) - $($issue.Check): $($issue.Message)"
            if ($issue.Recommendation) {
                Write-Info "   💡 $($issue.Recommendation)"
            }
        }
    }

    # Warnings
    $warnings = $script:healthResults | Where-Object { $_.Status -eq "WARN" }
    if ($warnings.Count -gt 0) {
        Write-Header "⚠️  Warnings"
        foreach ($warning in $warnings) {
            Write-Warning "⚠️  $($warning.Category) - $($warning.Check): $($warning.Message)"
            if ($warning.Recommendation) {
                Write-Info "   💡 $($warning.Recommendation)"
            }
        }
    }

    # Overall status
    Write-Header "Final Status"
    if ($healthScore -ge 90) {
        Write-Success "✅ System is healthy!"
    } elseif ($healthScore -ge 70) {
        Write-Warning "⚠️  System has some issues that should be addressed"
    } else {
        Write-Failure "❌ System has critical issues requiring immediate attention"
    }
}

# Main execution
Write-Header "Project Nyra - PC1 Health Check"
Write-Info "Running comprehensive health diagnostics..."

# Run health checks
Test-DockerRunning
Test-ComposeFile

if ($Service) {
    Write-Info "🔍 Checking specific service: $Service"
    Test-ContainerStatus -ServiceName $Service -ContainerName "nyra-$Service"
} else {
    Write-Info "🔍 Checking all services..."

    # Core infrastructure
    Test-ContainerStatus -ServiceName "postgres" -ContainerName "nyra-postgres"
    Test-ContainerStatus -ServiceName "redis" -ContainerName "nyra-redis"
    Test-ContainerStatus -ServiceName "qdrant" -ContainerName "nyra-qdrant"

    if (-not $Quick) {
        Test-ContainerStatus -ServiceName "falkordb" -ContainerName "nyra-falkordb"
        Test-ContainerStatus -ServiceName "litellm" -ContainerName "nyra-litellm"
        Test-ContainerStatus -ServiceName "dify-api" -ContainerName "nyra-dify-api"
        Test-ContainerStatus -ServiceName "dify-web" -ContainerName "nyra-dify-web"
        Test-ContainerStatus -ServiceName "n8n" -ContainerName "nyra-n8n"
        Test-ContainerStatus -ServiceName "activepieces" -ContainerName "nyra-activepieces"
        Test-ContainerStatus -ServiceName "twentycrm" -ContainerName "nyra-twentycrm"
        Test-ContainerStatus -ServiceName "letta" -ContainerName "nyra-letta"
        Test-ContainerStatus -ServiceName "grafana" -ContainerName "nyra-grafana"
        Test-ContainerStatus -ServiceName "prometheus" -ContainerName "nyra-prometheus"
    }
}

# Connectivity and health checks
Test-NetworkConnectivity
Test-DatabaseConnectivity

if (-not $Quick) {
    Test-ServiceHealthEndpoints
    Test-PortAvailability
    Test-DiskSpace
    Test-ResourceUsage
}

# Generate report
Show-HealthReport

Write-Success "`n✅ Health check complete!"
