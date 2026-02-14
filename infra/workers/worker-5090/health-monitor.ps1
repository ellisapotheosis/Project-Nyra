# Worker RTX 5090 Health Monitor
# Monitors GPU, Ollama, Docker services, and reports to orchestrator
# Usage: .\health-monitor.ps1 [-Interval <seconds>] [-LogFile <path>]

param(
    [int]$Interval = 30,
    [string]$LogFile = "health-monitor.log",
    [string]$OrchestratorUrl = $env:ORCHESTRATOR_URL,
    [switch]$Silent
)

$ErrorActionPreference = "Continue"

# Colors
$ColorInfo = "Cyan"
$ColorSuccess = "Green"
$ColorWarning = "Yellow"
$ColorError = "Red"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"

    # Write to file
    Add-Content -Path $LogFile -Value $logMessage

    # Write to console if not silent
    if (-not $Silent) {
        $color = switch ($Level) {
            "INFO" { $ColorInfo }
            "SUCCESS" { $ColorSuccess }
            "WARNING" { $ColorWarning }
            "ERROR" { $ColorError }
            default { "White" }
        }
        Write-Host $logMessage -ForegroundColor $color
    }
}

function Get-GPUStatus {
    try {
        $gpuInfo = nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,utilization.memory,memory.used,memory.total,power.draw --format=csv,noheader,nounits 2>$null

        if ($LASTEXITCODE -eq 0) {
            $parts = $gpuInfo -split ','

            return @{
                healthy = $true
                name = $parts[0].Trim()
                temperature = [int]$parts[1].Trim()
                gpu_utilization = [int]$parts[2].Trim()
                memory_utilization = [int]$parts[3].Trim()
                memory_used_mb = [int]$parts[4].Trim()
                memory_total_mb = [int]$parts[5].Trim()
                power_draw = [float]$parts[6].Trim()
            }
        } else {
            return @{ healthy = $false; error = "nvidia-smi failed" }
        }
    } catch {
        return @{ healthy = $false; error = $_.Exception.Message }
    }
}

function Get-OllamaStatus {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        $models = ($response.Content | ConvertFrom-Json).models

        # Get running models
        $psResponse = Invoke-WebRequest -Uri "http://localhost:11434/api/ps" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        $runningModels = ($psResponse.Content | ConvertFrom-Json).models

        return @{
            healthy = $true
            port = 11434
            models_available = $models.Count
            models_loaded = $runningModels.Count
            models = $models.name -join ","
        }
    } catch {
        return @{ healthy = $false; error = $_.Exception.Message }
    }
}

function Get-DockerServicesStatus {
    try {
        $composeFile = "docker-compose.worker-5090.yml"

        if (-not (Test-Path $composeFile)) {
            return @{ healthy = $false; error = "Compose file not found" }
        }

        $services = docker compose -f $composeFile ps --format json | ConvertFrom-Json

        $serviceStatus = @{}
        $healthyCount = 0
        $totalCount = 0

        foreach ($service in $services) {
            $totalCount++
            $isHealthy = $service.State -eq "running"

            if ($isHealthy) { $healthyCount++ }

            $serviceStatus[$service.Service] = @{
                healthy = $isHealthy
                state = $service.State
                status = $service.Status
            }
        }

        return @{
            healthy = ($healthyCount -eq $totalCount)
            total = $totalCount
            healthy_count = $healthyCount
            services = $serviceStatus
        }
    } catch {
        return @{ healthy = $false; error = $_.Exception.Message }
    }
}

function Get-SystemStatus {
    $cpu = Get-WmiObject Win32_Processor | Measure-Object -Property LoadPercentage -Average | Select-Object -ExpandProperty Average
    $memory = Get-WmiObject Win32_OperatingSystem
    $memoryUsedGB = [math]::Round(($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / 1MB, 2)
    $memoryTotalGB = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)
    $memoryPercent = [math]::Round(($memoryUsedGB / $memoryTotalGB) * 100, 2)

    $disk = Get-PSDrive -Name C
    $diskFreeGB = [math]::Round($disk.Free / 1GB, 2)
    $diskUsedGB = [math]::Round($disk.Used / 1GB, 2)
    $diskTotalGB = $diskFreeGB + $diskUsedGB
    $diskPercent = [math]::Round(($diskUsedGB / $diskTotalGB) * 100, 2)

    return @{
        cpu_usage = $cpu
        memory_used_gb = $memoryUsedGB
        memory_total_gb = $memoryTotalGB
        memory_percent = $memoryPercent
        disk_free_gb = $diskFreeGB
        disk_used_gb = $diskUsedGB
        disk_total_gb = $diskTotalGB
        disk_percent = $diskPercent
    }
}

function Send-StatusToOrchestrator {
    param($Status)

    if ([string]::IsNullOrEmpty($OrchestratorUrl)) {
        return
    }

    try {
        $body = $Status | ConvertTo-Json -Depth 10
        $response = Invoke-WebRequest -Uri "$OrchestratorUrl/api/worker/status" `
            -Method Post `
            -Body $body `
            -ContentType "application/json" `
            -TimeoutSec 10 `
            -UseBasicParsing `
            -ErrorAction Stop

        Write-Log "Status sent to orchestrator successfully" "SUCCESS"
    } catch {
        Write-Log "Failed to send status to orchestrator: $($_.Exception.Message)" "WARNING"
    }
}

# Main monitoring loop
Write-Log "Starting Worker RTX 5090 Health Monitor" "INFO"
Write-Log "Check interval: $Interval seconds" "INFO"
Write-Log "Log file: $LogFile" "INFO"

if (-not [string]::IsNullOrEmpty($OrchestratorUrl)) {
    Write-Log "Orchestrator URL: $OrchestratorUrl" "INFO"
}

Write-Log "Press Ctrl+C to stop" "INFO"
Write-Host ""

$iteration = 0

while ($true) {
    $iteration++

    Write-Log "=== Health Check #$iteration ===" "INFO"

    # Collect all status information
    $status = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        worker_id = "worker-5090"
        iteration = $iteration
    }

    # GPU Status
    Write-Log "Checking GPU status..." "INFO"
    $gpuStatus = Get-GPUStatus
    $status.gpu = $gpuStatus

    if ($gpuStatus.healthy) {
        Write-Log "✓ GPU: $($gpuStatus.name) - Temp: $($gpuStatus.temperature)°C, VRAM: $($gpuStatus.memory_used_mb)MB / $($gpuStatus.memory_total_mb)MB" "SUCCESS"

        # Check temperature thresholds
        if ($gpuStatus.temperature -gt 85) {
            Write-Log "⚠ GPU temperature critical: $($gpuStatus.temperature)°C" "ERROR"
        } elseif ($gpuStatus.temperature -gt 80) {
            Write-Log "⚠ GPU temperature warning: $($gpuStatus.temperature)°C" "WARNING"
        }

        # Check VRAM usage
        $vramPercent = [math]::Round(($gpuStatus.memory_used_mb / $gpuStatus.memory_total_mb) * 100, 2)
        if ($vramPercent -gt 95) {
            Write-Log "⚠ VRAM usage critical: $vramPercent%" "ERROR"
        } elseif ($vramPercent -gt 85) {
            Write-Log "⚠ VRAM usage warning: $vramPercent%" "WARNING"
        }
    } else {
        Write-Log "❌ GPU status check failed: $($gpuStatus.error)" "ERROR"
    }

    # Ollama Status
    Write-Log "Checking Ollama status..." "INFO"
    $ollamaStatus = Get-OllamaStatus
    $status.ollama = $ollamaStatus

    if ($ollamaStatus.healthy) {
        Write-Log "✓ Ollama: $($ollamaStatus.models_available) models available, $($ollamaStatus.models_loaded) loaded" "SUCCESS"
    } else {
        Write-Log "❌ Ollama status check failed: $($ollamaStatus.error)" "ERROR"
    }

    # Docker Services Status
    Write-Log "Checking Docker services..." "INFO"
    $dockerStatus = Get-DockerServicesStatus
    $status.docker = $dockerStatus

    if ($dockerStatus.healthy) {
        Write-Log "✓ Docker: All $($dockerStatus.total) services healthy" "SUCCESS"
    } else {
        Write-Log "⚠ Docker: $($dockerStatus.healthy_count)/$($dockerStatus.total) services healthy" "WARNING"

        foreach ($service in $dockerStatus.services.Keys) {
            $svc = $dockerStatus.services[$service]
            if (-not $svc.healthy) {
                Write-Log "  ❌ $service: $($svc.state) - $($svc.status)" "ERROR"
            }
        }
    }

    # System Status
    Write-Log "Checking system resources..." "INFO"
    $systemStatus = Get-SystemStatus
    $status.system = $systemStatus

    Write-Log "System: CPU $($systemStatus.cpu_usage)%, RAM $($systemStatus.memory_used_gb)GB/$($systemStatus.memory_total_gb)GB ($($systemStatus.memory_percent)%), Disk $($systemStatus.disk_used_gb)GB/$($systemStatus.disk_total_gb)GB ($($systemStatus.disk_percent)%)" "INFO"

    # Check system resource thresholds
    if ($systemStatus.memory_percent -gt 90) {
        Write-Log "⚠ Memory usage critical: $($systemStatus.memory_percent)%" "ERROR"
    } elseif ($systemStatus.memory_percent -gt 80) {
        Write-Log "⚠ Memory usage warning: $($systemStatus.memory_percent)%" "WARNING"
    }

    if ($systemStatus.disk_percent -gt 90) {
        Write-Log "⚠ Disk usage critical: $($systemStatus.disk_percent)%" "ERROR"
    } elseif ($systemStatus.disk_percent -gt 80) {
        Write-Log "⚠ Disk usage warning: $($systemStatus.disk_percent)%" "WARNING"
    }

    # Overall health
    $overallHealthy = $gpuStatus.healthy -and $ollamaStatus.healthy -and $dockerStatus.healthy
    $status.overall_healthy = $overallHealthy

    if ($overallHealthy) {
        Write-Log "=== Overall Status: HEALTHY ===" "SUCCESS"
    } else {
        Write-Log "=== Overall Status: UNHEALTHY ===" "ERROR"
    }

    # Send status to orchestrator
    if (-not [string]::IsNullOrEmpty($OrchestratorUrl)) {
        Send-StatusToOrchestrator -Status $status
    }

    Write-Host ""

    # Wait for next interval
    Start-Sleep -Seconds $Interval
}
