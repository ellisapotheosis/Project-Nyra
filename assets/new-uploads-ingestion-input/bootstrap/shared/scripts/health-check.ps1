<#
.SYNOPSIS
    Comprehensive health check system for Project-Nyra

.DESCRIPTION
    Monitors and reports health status of:
    - All 4 PCs in the cluster
    - Docker services
    - Network connectivity
    - Resource usage
    - Service endpoints
#>

[CmdletBinding()]
param(
    [switch]$Continuous,

    [int]$IntervalSeconds = 60,

    [switch]$SendAlerts,

    [string]$WebhookUrl = '',

    [string]$ReportPath = 'C:\nyra\health-reports'
)

$ErrorActionPreference = 'Continue'

# Health check configuration
$script:HealthConfig = @{
    Timestamp = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
    Cluster = @{
        PCs = @(
            @{
                Name = 'Orchestrator-Mini'
                IP = '192.168.1.10'
                Hostname = 'orchestrator-mini'
                Role = 'orchestrator'
                Critical = $true
            },
            @{
                Name = 'Worker-RTX3090Ti'
                IP = '192.168.1.11'
                Hostname = 'worker-rtx3090ti'
                Role = 'worker'
                Critical = $true
            },
            @{
                Name = 'Worker-RTX3060'
                IP = '192.168.1.12'
                Hostname = 'worker-rtx3060'
                Role = 'worker'
                Critical = $false
            },
            @{
                Name = 'Worker-RTX5090'
                IP = '192.168.1.13'
                Hostname = 'worker-rtx5090'
                Role = 'worker'
                Critical = $false
            }
        )
    }
    Thresholds = @{
        CPU = 85
        Memory = 90
        Disk = 85
        GPUTemp = 85
        NetworkLatency = 100
    }
}

$script:HealthStatus = @{
    Overall = 'Unknown'
    PCs = @()
    Services = @()
    Alerts = @()
}

function Write-HealthLog {
    param(
        [string]$Message,
        [ValidateSet('Info', 'Success', 'Warning', 'Error')]
        [string]$Level = 'Info'
    )

    $colors = @{
        Info = 'Cyan'
        Success = 'Green'
        Warning = 'Yellow'
        Error = 'Red'
    }

    $timestamp = Get-Date -Format 'HH:mm:ss'
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
    Write-Host "[$Level] " -NoNewline -ForegroundColor $colors[$Level]
    Write-Host $Message
}

function Test-PCHealth {
    param($PC)

    Write-HealthLog "Checking $($PC.Name)..." -Level Info

    $pcHealth = @{
        Name = $PC.Name
        IP = $PC.IP
        Role = $PC.Role
        Critical = $PC.Critical
        Status = 'Unknown'
        Checks = @{}
        Issues = @()
    }

    # Test connectivity
    $ping = Test-Connection -ComputerName $PC.IP -Count 2 -Quiet -ErrorAction SilentlyContinue

    $pcHealth.Checks.Connectivity = $ping

    if (-not $ping) {
        $pcHealth.Status = 'Down'
        $pcHealth.Issues += 'PC is not reachable'

        if ($PC.Critical) {
            $script:HealthStatus.Alerts += @{
                Severity = 'Critical'
                PC = $PC.Name
                Message = 'Critical PC is down'
            }
        }

        Write-HealthLog "$($PC.Name): DOWN" -Level Error
        return $pcHealth
    }

    # Test DNS resolution
    $dns = Resolve-DnsName -Name $PC.Hostname -ErrorAction SilentlyContinue
    $pcHealth.Checks.DNS = $dns -ne $null

    # Check response time
    $responseTime = (Test-Connection -ComputerName $PC.IP -Count 4 | Measure-Object -Property ResponseTime -Average).Average
    $pcHealth.Checks.ResponseTime = [math]::Round($responseTime, 2)

    if ($responseTime -gt $script:HealthConfig.Thresholds.NetworkLatency) {
        $pcHealth.Issues += "High latency: $($pcHealth.Checks.ResponseTime)ms"
        $script:HealthStatus.Alerts += @{
            Severity = 'Warning'
            PC = $PC.Name
            Message = "High network latency: $($pcHealth.Checks.ResponseTime)ms"
        }
    }

    # All checks passed
    if ($pcHealth.Issues.Count -eq 0) {
        $pcHealth.Status = 'Healthy'
        Write-HealthLog "$($PC.Name): HEALTHY ($($pcHealth.Checks.ResponseTime)ms)" -Level Success
    } else {
        $pcHealth.Status = 'Warning'
        Write-HealthLog "$($PC.Name): WARNING - $($pcHealth.Issues -join ', ')" -Level Warning
    }

    return $pcHealth
}

function Test-DockerServices {
    Write-HealthLog "Checking Docker services..." -Level Info

    $services = docker ps --format "{{.Names}}|{{.Status}}|{{.Ports}}" | ConvertFrom-Csv -Delimiter '|' -Header Name, Status, Ports

    foreach ($service in $services) {
        $serviceHealth = @{
            Name = $service.Name
            Status = 'Unknown'
            Uptime = ''
            Issues = @()
        }

        # Check if service is running
        if ($service.Status -match 'Up') {
            $serviceHealth.Status = 'Running'

            # Extract uptime
            if ($service.Status -match 'Up (.+)') {
                $serviceHealth.Uptime = $matches[1]
            }

            # Check if service is restarting frequently
            $restarts = docker inspect $service.Name --format '{{.RestartCount}}' 2>$null
            if ($restarts -gt 5) {
                $serviceHealth.Issues += "High restart count: $restarts"
                $serviceHealth.Status = 'Unstable'

                $script:HealthStatus.Alerts += @{
                    Severity = 'Warning'
                    Service = $service.Name
                    Message = "Service has restarted $restarts times"
                }
            }
        } else {
            $serviceHealth.Status = 'Stopped'
            $serviceHealth.Issues += 'Service is not running'

            $script:HealthStatus.Alerts += @{
                Severity = 'Critical'
                Service = $service.Name
                Message = 'Service is stopped'
            }
        }

        $script:HealthStatus.Services += $serviceHealth

        if ($serviceHealth.Status -eq 'Running') {
            Write-HealthLog "$($service.Name): RUNNING ($($serviceHealth.Uptime))" -Level Success
        } else {
            Write-HealthLog "$($service.Name): $($serviceHealth.Status)" -Level Error
        }
    }
}

function Test-ServiceEndpoints {
    Write-HealthLog "Checking service endpoints..." -Level Info

    $endpoints = @(
        @{ Name = 'Gitea'; URL = 'http://orchestrator-mini:3000' },
        @{ Name = 'Grafana'; URL = 'http://orchestrator-mini:3001' },
        @{ Name = 'Prometheus'; URL = 'http://orchestrator-mini:9090' },
        @{ Name = 'Traefik'; URL = 'http://orchestrator-mini:8080' },
        @{ Name = 'Ollama-3090Ti'; URL = 'http://worker-rtx3090ti:11434' },
        @{ Name = 'n8n'; URL = 'http://worker-rtx3090ti:5678' }
    )

    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-WebRequest -Uri $endpoint.URL -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop

            if ($response.StatusCode -eq 200) {
                Write-HealthLog "$($endpoint.Name): OK (HTTP $($response.StatusCode))" -Level Success
            } else {
                Write-HealthLog "$($endpoint.Name): WARNING (HTTP $($response.StatusCode))" -Level Warning
            }
        } catch {
            Write-HealthLog "$($endpoint.Name): FAILED - $($_.Exception.Message)" -Level Error

            $script:HealthStatus.Alerts += @{
                Severity = 'Critical'
                Service = $endpoint.Name
                Message = "Endpoint not responding: $($endpoint.URL)"
            }
        }
    }
}

function Get-ResourceUsage {
    Write-HealthLog "Checking resource usage..." -Level Info

    # CPU Usage
    $cpuUsage = Get-Counter '\Processor(_Total)\% Processor Time' -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty CounterSamples |
        Select-Object -ExpandProperty CookedValue

    if ($cpuUsage -gt $script:HealthConfig.Thresholds.CPU) {
        Write-HealthLog "CPU usage high: $([math]::Round($cpuUsage, 2))%" -Level Warning
        $script:HealthStatus.Alerts += @{
            Severity = 'Warning'
            Resource = 'CPU'
            Message = "CPU usage is $([math]::Round($cpuUsage, 2))%"
        }
    } else {
        Write-HealthLog "CPU usage: $([math]::Round($cpuUsage, 2))%" -Level Info
    }

    # Memory Usage
    $memory = Get-CimInstance Win32_OperatingSystem
    $memoryUsage = (($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / $memory.TotalVisibleMemorySize) * 100

    if ($memoryUsage -gt $script:HealthConfig.Thresholds.Memory) {
        Write-HealthLog "Memory usage high: $([math]::Round($memoryUsage, 2))%" -Level Warning
        $script:HealthStatus.Alerts += @{
            Severity = 'Warning'
            Resource = 'Memory'
            Message = "Memory usage is $([math]::Round($memoryUsage, 2))%"
        }
    } else {
        Write-HealthLog "Memory usage: $([math]::Round($memoryUsage, 2))%" -Level Info
    }

    # Disk Usage
    $disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"
    foreach ($disk in $disks) {
        $diskUsage = (($disk.Size - $disk.FreeSpace) / $disk.Size) * 100

        if ($diskUsage -gt $script:HealthConfig.Thresholds.Disk) {
            Write-HealthLog "Disk $($disk.DeviceID) usage high: $([math]::Round($diskUsage, 2))%" -Level Warning
            $script:HealthStatus.Alerts += @{
                Severity = 'Warning'
                Resource = "Disk $($disk.DeviceID)"
                Message = "Disk usage is $([math]::Round($diskUsage, 2))%"
            }
        } else {
            Write-HealthLog "Disk $($disk.DeviceID) usage: $([math]::Round($diskUsage, 2))%" -Level Info
        }
    }
}

function Send-HealthAlert {
    param($Alert)

    if (-not $SendAlerts -or [string]::IsNullOrEmpty($WebhookUrl)) {
        return
    }

    Write-HealthLog "Sending alert: $($Alert.Message)" -Level Info

    $payload = @{
        text = "[$($Alert.Severity)] $($Alert.Message)"
        timestamp = $script:HealthConfig.Timestamp
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $payload -ContentType 'application/json'
        Write-HealthLog "Alert sent successfully" -Level Success
    } catch {
        Write-HealthLog "Failed to send alert: $_" -Level Error
    }
}

function New-HealthReport {
    Write-HealthLog "Generating health report..." -Level Info

    $null = New-Item -ItemType Directory -Path $ReportPath -Force -ErrorAction SilentlyContinue

    $reportFile = Join-Path $ReportPath "health-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"

    $script:HealthStatus | ConvertTo-Json -Depth 10 | Set-Content -Path $reportFile

    Write-HealthLog "Report saved: $reportFile" -Level Success
}

function Show-HealthSummary {
    Write-HealthLog "" -Level Info
    Write-HealthLog "===== HEALTH CHECK SUMMARY =====" -Level Success
    Write-HealthLog "Timestamp: $($script:HealthConfig.Timestamp)" -Level Info
    Write-HealthLog "Overall Status: $($script:HealthStatus.Overall)" -Level Info
    Write-HealthLog "" -Level Info

    # PC Summary
    Write-HealthLog "PC Status:" -Level Info
    foreach ($pc in $script:HealthStatus.PCs) {
        $status = $pc.Status
        $level = switch ($status) {
            'Healthy' { 'Success' }
            'Down' { 'Error' }
            default { 'Warning' }
        }
        Write-HealthLog "  $($pc.Name): $status" -Level $level
    }

    # Alerts
    if ($script:HealthStatus.Alerts.Count -gt 0) {
        Write-HealthLog "" -Level Info
        Write-HealthLog "Active Alerts: $($script:HealthStatus.Alerts.Count)" -Level Warning
        foreach ($alert in $script:HealthStatus.Alerts) {
            Write-HealthLog "  [$($alert.Severity)] $($alert.Message)" -Level Warning
        }
    }

    Write-HealthLog "================================" -Level Success
}

function Start-ContinuousMonitoring {
    Write-HealthLog "Starting continuous monitoring (interval: ${IntervalSeconds}s)" -Level Info
    Write-HealthLog "Press Ctrl+C to stop" -Level Info

    while ($true) {
        Invoke-HealthCheck

        Start-Sleep -Seconds $IntervalSeconds
    }
}

function Invoke-HealthCheck {
    $script:HealthStatus.PCs = @()
    $script:HealthStatus.Services = @()
    $script:HealthStatus.Alerts = @()

    # Check all PCs
    foreach ($pc in $script:HealthConfig.Cluster.PCs) {
        $pcHealth = Test-PCHealth -PC $pc
        $script:HealthStatus.PCs += $pcHealth
    }

    # Check Docker services
    Test-DockerServices

    # Check service endpoints
    Test-ServiceEndpoints

    # Check resource usage
    Get-ResourceUsage

    # Determine overall status
    $criticalIssues = $script:HealthStatus.Alerts | Where-Object { $_.Severity -eq 'Critical' }
    $warnings = $script:HealthStatus.Alerts | Where-Object { $_.Severity -eq 'Warning' }

    if ($criticalIssues.Count -gt 0) {
        $script:HealthStatus.Overall = 'Critical'
    } elseif ($warnings.Count -gt 0) {
        $script:HealthStatus.Overall = 'Warning'
    } else {
        $script:HealthStatus.Overall = 'Healthy'
    }

    # Send alerts
    foreach ($alert in $script:HealthStatus.Alerts) {
        Send-HealthAlert -Alert $alert
    }

    # Generate report
    New-HealthReport

    # Show summary
    Show-HealthSummary
}

# Main execution
try {
    Write-HealthLog "Project-Nyra Health Check System" -Level Info

    if ($Continuous) {
        Start-ContinuousMonitoring
    } else {
        Invoke-HealthCheck
    }

} catch {
    Write-HealthLog "Health check failed: $_" -Level Error
    exit 1
}
