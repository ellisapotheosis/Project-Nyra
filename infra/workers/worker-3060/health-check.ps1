<#
.SYNOPSIS
    Health check script for Worker-3060
.DESCRIPTION
    Checks health of all services and GPU status
#>

$ErrorActionPreference = "SilentlyContinue"

# Colors
function Write-Status {
    param($Service, $Status, $Message)
    $ServicePadded = $Service.PadRight(25)
    $color = if ($Status -eq "HEALTHY") { "Green" } elseif ($Status -eq "WARN") { "Yellow" } else { "Red" }
    Write-Host "  $ServicePadded " -NoNewline
    Write-Host "[$Status]" -ForegroundColor $color -NoNewline
    if ($Message) { Write-Host " - $Message" -ForegroundColor Gray } else { Write-Host "" }
}

Write-Host @"

╔════════════════════════════════════════════════════════════╗
║           Worker-3060 Health Check Report                 ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# ============================================================================
# 1. GPU Check
# ============================================================================
Write-Host "GPU Status:" -ForegroundColor Yellow
$gpuCheck = nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,utilization.memory,memory.used,memory.total --format=csv,noheader 2>&1
if ($LASTEXITCODE -eq 0) {
    $gpuInfo = $gpuCheck -split ','
    Write-Status "NVIDIA GPU" "HEALTHY" "Detected"
    Write-Host "    Name: $($gpuInfo[0].Trim())"
    Write-Host "    Temperature: $($gpuInfo[1].Trim())°C"
    Write-Host "    GPU Utilization: $($gpuInfo[2].Trim())"
    Write-Host "    Memory Utilization: $($gpuInfo[3].Trim())"
    Write-Host "    Memory Used: $($gpuInfo[4].Trim()) / $($gpuInfo[5].Trim())"
} else {
    Write-Status "NVIDIA GPU" "UNHEALTHY" "nvidia-smi failed"
}

# ============================================================================
# 2. Docker Services Check
# ============================================================================
Write-Host "`nDocker Services:" -ForegroundColor Yellow

$services = @(
    @{ Name = "ollama"; Port = 11434; HealthPath = "/api/version" }
    @{ Name = "onnx-runtime"; Port = 8001; HealthPath = "/v2/health/ready" }
    @{ Name = "embedding-service"; Port = 8080; HealthPath = "/health" }
    @{ Name = "health-monitor"; Port = 9090; HealthPath = "/health" }
    @{ Name = "redis"; Port = 6379; HealthPath = $null }
)

foreach ($service in $services) {
    $containerName = "worker-3060-$($service.Name)"

    # Check container status
    $containerStatus = docker inspect -f '{{.State.Status}}' $containerName 2>&1

    if ($LASTEXITCODE -eq 0 -and $containerStatus -eq "running") {
        # Check health endpoint
        if ($service.HealthPath) {
            $healthCheck = curl -s -o $null -w "%{http_code}" "http://localhost:$($service.Port)$($service.HealthPath)" 2>&1
            if ($healthCheck -eq "200") {
                Write-Status $service.Name "HEALTHY" "Port $($service.Port)"
            } else {
                Write-Status $service.Name "WARN" "Health check failed (HTTP $healthCheck)"
            }
        } else {
            # Redis - check with redis-cli
            if ($service.Name -eq "redis") {
                $redisPing = docker exec $containerName redis-cli ping 2>&1
                if ($redisPing -eq "PONG") {
                    Write-Status $service.Name "HEALTHY" "Port $($service.Port)"
                } else {
                    Write-Status $service.Name "UNHEALTHY" "Redis not responding"
                }
            } else {
                Write-Status $service.Name "HEALTHY" "Running"
            }
        }
    } else {
        Write-Status $service.Name "UNHEALTHY" "Container not running"
    }
}

# ============================================================================
# 3. Ollama Models Check
# ============================================================================
Write-Host "`nOllama Models:" -ForegroundColor Yellow

$expectedModels = @("codellama:34b", "qwen2:32b", "gemma2:27b")
$ollamaList = curl -s http://localhost:11434/api/tags 2>&1

if ($LASTEXITCODE -eq 0) {
    $modelJson = $ollamaList | ConvertFrom-Json
    $installedModels = $modelJson.models.name

    foreach ($model in $expectedModels) {
        if ($installedModels -contains $model) {
            Write-Status $model "INSTALLED" ""
        } else {
            Write-Status $model "MISSING" "Run: ollama pull $model"
        }
    }
} else {
    Write-Status "Ollama API" "UNHEALTHY" "Cannot connect to Ollama"
}

# ============================================================================
# 4. Network Check
# ============================================================================
Write-Host "`nNetwork Status:" -ForegroundColor Yellow

# Tailscale
$tailscaleStatus = tailscale status 2>&1
if ($tailscaleStatus -notlike "*Logged out*" -and $LASTEXITCODE -eq 0) {
    $tsIP = ($tailscaleStatus | Select-String "100\.\d+\.\d+\.\d+").Matches.Value
    Write-Status "Tailscale VPN" "CONNECTED" "IP: $tsIP"
} else {
    Write-Status "Tailscale VPN" "DISCONNECTED" "Run: tailscale up"
}

# Cloudflared
$cloudflaredStatus = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($cloudflaredStatus) {
    Write-Status "Cloudflare Tunnel" "RUNNING" "PID: $($cloudflaredStatus.Id)"
} else {
    Write-Status "Cloudflare Tunnel" "STOPPED" "Run: cloudflared tunnel run worker-3060"
}

# Internet connectivity
$internetCheck = Test-Connection -ComputerName 8.8.8.8 -Count 1 -Quiet
if ($internetCheck) {
    Write-Status "Internet" "CONNECTED" ""
} else {
    Write-Status "Internet" "DISCONNECTED" "Check network connection"
}

# ============================================================================
# 5. System Resources
# ============================================================================
Write-Host "`nSystem Resources:" -ForegroundColor Yellow

$RAM = Get-CimInstance Win32_OperatingSystem
$RAMUsedPercent = [math]::Round(($RAM.TotalVisibleMemorySize - $RAM.FreePhysicalMemory) / $RAM.TotalVisibleMemorySize * 100, 1)
$RAMUsedGB = [math]::Round(($RAM.TotalVisibleMemorySize - $RAM.FreePhysicalMemory) / 1MB, 2)
$RAMTotalGB = [math]::Round($RAM.TotalVisibleMemorySize / 1MB, 2)

$CPU = Get-CimInstance Win32_Processor
$CPUUsage = (Get-Counter '\Processor(_Total)\% Processor Time' -SampleInterval 1 -MaxSamples 1).CounterSamples.CookedValue
$CPUUsageRounded = [math]::Round($CPUUsage, 1)

$Disk = Get-PSDrive C
$DiskUsedPercent = [math]::Round((1 - ($Disk.Free / ($Disk.Used + $Disk.Free))) * 100, 1)
$DiskFreeGB = [math]::Round($Disk.Free / 1GB, 2)

Write-Host "  CPU Usage: $CPUUsageRounded%"
Write-Host "  RAM Usage: $RAMUsedGB GB / $RAMTotalGB GB ($RAMUsedPercent%)"
Write-Host "  Disk Free: $DiskFreeGB GB ($DiskUsedPercent% used)"

if ($RAMUsedPercent -gt 90) {
    Write-Host "  [WARN] High memory usage" -ForegroundColor Yellow
}
if ($CPUUsageRounded -gt 90) {
    Write-Host "  [WARN] High CPU usage" -ForegroundColor Yellow
}
if ($DiskFreeGB -lt 50) {
    Write-Host "  [WARN] Low disk space" -ForegroundColor Yellow
}

# ============================================================================
# 6. Docker Stats
# ============================================================================
Write-Host "`nDocker Container Stats:" -ForegroundColor Yellow

docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | ForEach-Object {
    if ($_ -like "*worker-3060*") {
        Write-Host "  $_" -ForegroundColor Gray
    }
}

# ============================================================================
# 7. Recent Logs (Errors)
# ============================================================================
Write-Host "`nRecent Errors (last 10):" -ForegroundColor Yellow

$errorLogs = docker-compose -f docker-compose.worker-3060.yml logs --tail=100 2>&1 | Select-String -Pattern "error|Error|ERROR|exception|Exception|EXCEPTION" | Select-Object -Last 10

if ($errorLogs) {
    $errorLogs | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Red
    }
} else {
    Write-Host "  No recent errors found" -ForegroundColor Green
}

# ============================================================================
# 8. Recommendations
# ============================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗"
Write-Host "║                    Recommendations                         ║"
Write-Host "╚════════════════════════════════════════════════════════════╝`n"

$recommendations = @()

# Check if all services are healthy
$unhealthyServices = docker ps -a --filter "name=worker-3060" --filter "status=exited" --format "{{.Names}}"
if ($unhealthyServices) {
    $recommendations += "Restart unhealthy services: docker-compose -f docker-compose.worker-3060.yml up -d"
}

# Check GPU temperature
$gpuTemp = nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader 2>&1
if ($gpuTemp -gt 80) {
    $recommendations += "GPU temperature is high ($gpuTemp°C). Check cooling."
}

# Check model installation
if ($installedModels.Count -lt $expectedModels.Count) {
    $recommendations += "Pull missing models: ollama pull <model-name>"
}

# Check Tailscale
if ($tailscaleStatus -like "*Logged out*") {
    $recommendations += "Connect to Tailscale: tailscale up"
}

# Check disk space
if ($DiskFreeGB -lt 50) {
    $recommendations += "Free up disk space (less than 50GB available)"
}

# Check RAM usage
if ($RAMUsedPercent -gt 90) {
    $recommendations += "High memory usage. Consider restarting services."
}

if ($recommendations.Count -eq 0) {
    Write-Host "  All systems operational! No recommendations." -ForegroundColor Green
} else {
    foreach ($rec in $recommendations) {
        Write-Host "  - $rec" -ForegroundColor Yellow
    }
}

# ============================================================================
# 9. Quick Actions
# ============================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗"
Write-Host "║                      Quick Actions                         ║"
Write-Host "╚════════════════════════════════════════════════════════════╝`n"

Write-Host "  Restart all services:" -ForegroundColor Cyan
Write-Host "    docker-compose -f docker-compose.worker-3060.yml restart"
Write-Host ""
Write-Host "  View logs:" -ForegroundColor Cyan
Write-Host "    docker-compose -f docker-compose.worker-3060.yml logs -f [service-name]"
Write-Host ""
Write-Host "  Test Ollama:" -ForegroundColor Cyan
Write-Host "    curl http://localhost:11434/api/generate -d '{`"model`":`"codellama:34b`",`"prompt`":`"Hello`"}'"
Write-Host ""
Write-Host "  Monitor GPU:" -ForegroundColor Cyan
Write-Host "    nvidia-smi -l 1"
Write-Host ""

Write-Host "`nHealth check completed.`n" -ForegroundColor Green
