# ============================================================================
# Worker-3090 Health Check Script
# ============================================================================
# Comprehensive health check for GPU Worker-3090
# Run manually or via Task Scheduler for continuous monitoring

param(
    [switch]$Json,
    [switch]$Detailed,
    [switch]$Alert
)

$ErrorActionPreference = "SilentlyContinue"

# Load environment variables
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

$OLLAMA_PORT = $env:OLLAMA_PORT -or "11434"
$WORKER_ID = $env:WORKER_ID -or "worker-3090"

# ============================================================================
# Health Check Results
# ============================================================================
$results = @{
    timestamp = Get-Date -Format "o"
    worker_id = $WORKER_ID
    overall_status = "healthy"
    checks = @{}
}

function Add-Check {
    param($name, $status, $message, $details = @{})
    $results.checks[$name] = @{
        status = $status
        message = $message
        details = $details
    }
    if ($status -eq "unhealthy" -or $status -eq "degraded") {
        $results.overall_status = $status
    }
}

# ============================================================================
# Check 1: Ollama API
# ============================================================================
try {
    $response = Invoke-RestMethod -Uri "http://localhost:${OLLAMA_PORT}/api/tags" -Method Get -TimeoutSec 10
    $modelCount = $response.models.Count
    $models = $response.models | ForEach-Object { $_.name }

    if ($modelCount -gt 0) {
        Add-Check "ollama_api" "healthy" "Ollama API responding with $modelCount models" @{
            model_count = $modelCount
            models = $models
            endpoint = "http://localhost:${OLLAMA_PORT}"
        }
    } else {
        Add-Check "ollama_api" "degraded" "Ollama API responding but no models loaded" @{
            model_count = 0
            endpoint = "http://localhost:${OLLAMA_PORT}"
        }
    }
} catch {
    Add-Check "ollama_api" "unhealthy" "Ollama API not responding: $($_.Exception.Message)" @{
        error = $_.Exception.Message
        endpoint = "http://localhost:${OLLAMA_PORT}"
    }
}

# ============================================================================
# Check 2: GPU Status
# ============================================================================
$nvidiaSmi = "C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"
if (Test-Path $nvidiaSmi) {
    try {
        $gpuInfo = & $nvidiaSmi --query-gpu=name,temperature.gpu,utilization.gpu,memory.used,memory.total,driver_version --format=csv,noheader,nounits
        $gpuData = $gpuInfo -split ','

        $temp = [int]$gpuData[1]
        $utilization = [int]$gpuData[2]
        $memUsed = [int]$gpuData[3]
        $memTotal = [int]$gpuData[4]

        $status = "healthy"
        $message = "GPU operational"

        if ($temp -gt 85) {
            $status = "degraded"
            $message = "GPU temperature high: ${temp}°C"
        }
        if ($temp -gt 95) {
            $status = "unhealthy"
            $message = "GPU temperature critical: ${temp}°C"
        }

        Add-Check "gpu" $status $message @{
            name = $gpuData[0].Trim()
            temperature = "${temp}°C"
            utilization = "${utilization}%"
            memory_used = "${memUsed}MB"
            memory_total = "${memTotal}MB"
            memory_percent = [math]::Round(($memUsed / $memTotal) * 100, 1)
            driver_version = $gpuData[5].Trim()
        }
    } catch {
        Add-Check "gpu" "unhealthy" "Failed to query GPU: $($_.Exception.Message)" @{
            error = $_.Exception.Message
        }
    }
} else {
    Add-Check "gpu" "unhealthy" "nvidia-smi not found" @{
        path = $nvidiaSmi
    }
}

# ============================================================================
# Check 3: Docker Containers
# ============================================================================
try {
    $containers = docker ps --format "{{.Names}}:{{.Status}}" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $containerList = @()
        $unhealthyContainers = @()

        $containers | ForEach-Object {
            if ($_ -match '^([^:]+):(.+)$') {
                $name = $matches[1]
                $status = $matches[2]
                $containerList += @{ name = $name; status = $status }

                if ($status -notmatch '(Up|healthy)') {
                    $unhealthyContainers += $name
                }
            }
        }

        $status = if ($unhealthyContainers.Count -gt 0) { "degraded" } else { "healthy" }
        $message = "$($containerList.Count) containers running"
        if ($unhealthyContainers.Count -gt 0) {
            $message += ", $($unhealthyContainers.Count) unhealthy"
        }

        Add-Check "docker" $status $message @{
            total = $containerList.Count
            containers = $containerList
            unhealthy = $unhealthyContainers
        }
    } else {
        Add-Check "docker" "unhealthy" "Docker daemon not responding" @{
            error = $containers -join "`n"
        }
    }
} catch {
    Add-Check "docker" "unhealthy" "Failed to query Docker: $($_.Exception.Message)" @{
        error = $_.Exception.Message
    }
}

# ============================================================================
# Check 4: Tailscale VPN
# ============================================================================
try {
    $tailscaleStatus = tailscale status --json 2>&1 | ConvertFrom-Json
    if ($LASTEXITCODE -eq 0) {
        $tailscaleIP = $tailscaleStatus.Self.TailscaleIPs[0]
        Add-Check "tailscale" "healthy" "Connected to Tailscale VPN" @{
            ip = $tailscaleIP
            hostname = $tailscaleStatus.Self.HostName
            online = $tailscaleStatus.Self.Online
        }
    } else {
        Add-Check "tailscale" "degraded" "Tailscale not connected" @{
            error = $tailscaleStatus
        }
    }
} catch {
    Add-Check "tailscale" "degraded" "Tailscale status unavailable: $($_.Exception.Message)" @{
        error = $_.Exception.Message
    }
}

# ============================================================================
# Check 5: System Resources
# ============================================================================
try {
    # CPU
    $cpu = Get-CimInstance Win32_Processor
    $cpuUsage = $cpu.LoadPercentage

    # RAM
    $os = Get-CimInstance Win32_OperatingSystem
    $totalRAM = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
    $freeRAM = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
    $usedRAM = $totalRAM - $freeRAM
    $ramPercent = [math]::Round(($usedRAM / $totalRAM) * 100, 1)

    # Disk
    $disk = Get-PSDrive C
    $totalDisk = [math]::Round(($disk.Used + $disk.Free) / 1GB, 2)
    $freeDisk = [math]::Round($disk.Free / 1GB, 2)
    $usedDisk = [math]::Round($disk.Used / 1GB, 2)
    $diskPercent = [math]::Round(($usedDisk / $totalDisk) * 100, 1)

    $status = "healthy"
    $message = "System resources normal"

    if ($ramPercent -gt 90 -or $diskPercent -gt 90) {
        $status = "degraded"
        $message = "High resource usage"
    }
    if ($ramPercent -gt 95 -or $diskPercent -gt 95) {
        $status = "unhealthy"
        $message = "Critical resource usage"
    }

    Add-Check "resources" $status $message @{
        cpu = @{
            usage_percent = $cpuUsage
            cores = $cpu.NumberOfCores
            threads = $cpu.NumberOfLogicalProcessors
        }
        ram = @{
            total_gb = $totalRAM
            used_gb = $usedRAM
            free_gb = $freeRAM
            usage_percent = $ramPercent
        }
        disk = @{
            total_gb = $totalDisk
            used_gb = $usedDisk
            free_gb = $freeDisk
            usage_percent = $diskPercent
        }
    }
} catch {
    Add-Check "resources" "unhealthy" "Failed to query system resources: $($_.Exception.Message)" @{
        error = $_.Exception.Message
    }
}

# ============================================================================
# Check 6: Network Connectivity
# ============================================================================
try {
    $nexusUrl = $env:NEXUS_ROUTER_URL
    if ($nexusUrl) {
        $nexusTest = Invoke-WebRequest -Uri "$nexusUrl/health" -Method Get -TimeoutSec 5 -UseBasicParsing
        if ($nexusTest.StatusCode -eq 200) {
            Add-Check "nexus" "healthy" "Connected to Nexus Router" @{
                url = $nexusUrl
                status_code = $nexusTest.StatusCode
            }
        } else {
            Add-Check "nexus" "degraded" "Nexus Router responded with status $($nexusTest.StatusCode)" @{
                url = $nexusUrl
                status_code = $nexusTest.StatusCode
            }
        }
    } else {
        Add-Check "nexus" "degraded" "NEXUS_ROUTER_URL not configured" @{}
    }
} catch {
    Add-Check "nexus" "degraded" "Cannot reach Nexus Router: $($_.Exception.Message)" @{
        url = $nexusUrl
        error = $_.Exception.Message
    }
}

# ============================================================================
# Check 7: Log Files
# ============================================================================
try {
    $logPath = ".\logs"
    if (Test-Path $logPath) {
        $logFiles = Get-ChildItem -Path $logPath -Recurse -File | Measure-Object -Property Length -Sum
        $totalSize = [math]::Round($logFiles.Sum / 1MB, 2)

        $status = if ($totalSize -gt 1000) { "degraded" } else { "healthy" }
        $message = if ($totalSize -gt 1000) { "Log files exceed 1GB" } else { "Log files normal" }

        Add-Check "logs" $status $message @{
            total_files = $logFiles.Count
            total_size_mb = $totalSize
            path = (Resolve-Path $logPath).Path
        }
    } else {
        Add-Check "logs" "degraded" "Log directory not found" @{
            path = $logPath
        }
    }
} catch {
    Add-Check "logs" "degraded" "Failed to check log files: $($_.Exception.Message)" @{
        error = $_.Exception.Message
    }
}

# ============================================================================
# Output Results
# ============================================================================
if ($Json) {
    # JSON output for programmatic consumption
    $results | ConvertTo-Json -Depth 10
} else {
    # Human-readable output
    $statusColors = @{
        "healthy" = "Green"
        "degraded" = "Yellow"
        "unhealthy" = "Red"
    }

    Write-Host "`n=== Worker-3090 Health Check ===" -ForegroundColor Cyan
    Write-Host "Timestamp: $($results.timestamp)"
    Write-Host "Worker ID: $($results.worker_id)"
    Write-Host "Overall Status: $($results.overall_status)" -ForegroundColor $statusColors[$results.overall_status]
    Write-Host ""

    foreach ($check in $results.checks.GetEnumerator() | Sort-Object Name) {
        $name = $check.Key
        $data = $check.Value
        $color = $statusColors[$data.status]

        Write-Host "[$($data.status.ToUpper())] $name" -ForegroundColor $color
        Write-Host "  $($data.message)"

        if ($Detailed -and $data.details) {
            $data.details.GetEnumerator() | ForEach-Object {
                if ($_.Value -is [array]) {
                    Write-Host "  - $($_.Key): $($_.Value.Count) items"
                    if ($_.Key -eq "models") {
                        $_.Value | ForEach-Object { Write-Host "    * $_" }
                    }
                } elseif ($_.Value -is [hashtable]) {
                    Write-Host "  - $($_.Key):"
                    $_.Value.GetEnumerator() | ForEach-Object {
                        Write-Host "    * $($_.Key): $($_.Value)"
                    }
                } else {
                    Write-Host "  - $($_.Key): $($_.Value)"
                }
            }
        }
        Write-Host ""
    }
}

# ============================================================================
# Alert (optional)
# ============================================================================
if ($Alert -and $results.overall_status -ne "healthy") {
    Write-Host "ALERT: Worker-3090 is $($results.overall_status)!" -ForegroundColor Red

    # You can add alerting integrations here:
    # - Send email via SMTP
    # - Post to Slack/Discord
    # - Create PagerDuty incident
    # - Send SMS via Twilio
    # - Post to webhook

    # Example: Log to Windows Event Log
    Write-EventLog -LogName Application -Source "Project-Nyra" -EventId 1001 -EntryType Warning -Message "Worker-3090 health check failed: $($results.overall_status)"
}

# Exit with appropriate code
exit $(if ($results.overall_status -eq "healthy") { 0 } elseif ($results.overall_status -eq "degraded") { 1 } else { 2 })
