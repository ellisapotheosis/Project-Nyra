# Generate Machine-Specific Environment Variables
# Collects system info and creates .env.machine file for Infisical upload

param(
    [string]$OutputDir = ".",
    [switch]$Verbose
)

Write-Host "=== Project Nyra - Machine Environment Generator ===" -ForegroundColor Cyan
Write-Host ""

# Initialize machine info object
$machineInfo = @{}

# 1. Basic System Info
Write-Host "Collecting system information..." -ForegroundColor Yellow
$machineInfo.hostname = $env:COMPUTERNAME
$machineInfo.username = $env:USERNAME
$machineInfo.timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "  Hostname: $($machineInfo.hostname)" -ForegroundColor Green

# 2. Determine Machine Role
Write-Host "`nDetermining machine role..." -ForegroundColor Yellow

# Get GPU info to determine role
try {
    $gpus = Get-WmiObject Win32_VideoController | Where-Object { $_.Name -like "*NVIDIA*" -or $_.Name -like "*AMD*" }

    if ($gpus) {
        $primaryGpu = $gpus[0]
        $gpuName = $primaryGpu.Name
        $vramBytes = $primaryGpu.AdapterRAM
        $vramGB = [math]::Round($vramBytes / 1GB)

        Write-Host "  GPU: $gpuName" -ForegroundColor Green
        Write-Host "  VRAM: $vramGB GB" -ForegroundColor Green

        $machineInfo.gpu_name = $gpuName
        $machineInfo.gpu_vram_gb = $vramGB

        # Determine GPU type and role
        if ($gpuName -like "*5090*") {
            $machineInfo.role = "worker-5090"
            $machineInfo.gpu_type = "rtx_5090"
            $machineInfo.specialization = "reasoning"
        } elseif ($gpuName -like "*3090*") {
            $machineInfo.role = "worker-3090"
            $machineInfo.gpu_type = "rtx_3090ti"
            $machineInfo.specialization = "general"
        } elseif ($gpuName -like "*3060*") {
            $machineInfo.role = "worker-rtx3060"
            $machineInfo.gpu_type = "rtx_3060"
            $machineInfo.specialization = "code"
        } else {
            $machineInfo.role = "worker-gpu"
            $machineInfo.gpu_type = "unknown"
            $machineInfo.specialization = "general"
        }
    } else {
        # No dedicated GPU - likely orchestrator
        $machineInfo.role = "orchestrator-mini"
        $machineInfo.gpu_type = "integrated"
        $machineInfo.specialization = "orchestration"
        $machineInfo.gpu_name = "Integrated Graphics"
        $machineInfo.gpu_vram_gb = 0

        Write-Host "  No dedicated GPU detected - Orchestrator role" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Warning: Could not detect GPU" -ForegroundColor Yellow
    $machineInfo.role = "unknown"
    $machineInfo.gpu_type = "unknown"
}

Write-Host "  Role: $($machineInfo.role)" -ForegroundColor Green

# 3. Network Interfaces
Write-Host "`nCollecting network information..." -ForegroundColor Yellow

$adapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne '127.0.0.1' }
$machineInfo.interfaces = @()

foreach ($adapter in $adapters) {
    $adapterObj = Get-NetAdapter -InterfaceIndex $adapter.InterfaceIndex
    $interfaceInfo = @{
        name = $adapterObj.Name
        ip = $adapter.IPAddress
        mac = $adapterObj.MacAddress
        status = $adapterObj.Status
    }

    Write-Host "  $($interfaceInfo.name):" -ForegroundColor Green
    Write-Host "    IP:  $($interfaceInfo.ip)" -ForegroundColor White
    Write-Host "    MAC: $($interfaceInfo.mac)" -ForegroundColor White

    $machineInfo.interfaces += $interfaceInfo

    # Store primary interfaces
    if ($interfaceInfo.name -like "*Ethernet*" -and $interfaceInfo.status -eq "Up") {
        $machineInfo.ip_ethernet = $interfaceInfo.ip
        $machineInfo.mac_ethernet = $interfaceInfo.mac
    } elseif ($interfaceInfo.name -like "*Wi-Fi*" -and $interfaceInfo.status -eq "Up") {
        $machineInfo.ip_wifi = $interfaceInfo.ip
        $machineInfo.mac_wifi = $interfaceInfo.mac
    }
}

# 4. Tailscale Info
Write-Host "`nChecking Tailscale..." -ForegroundColor Yellow

try {
    $tailscaleIP = & tailscale ip -4 2>$null
    if ($tailscaleIP) {
        $machineInfo.ip_tailscale = $tailscaleIP.Trim()
        Write-Host "  Tailscale IP: $($machineInfo.ip_tailscale)" -ForegroundColor Green

        # Get tailnet domain
        $tailscaleStatus = & tailscale status --json 2>$null | ConvertFrom-Json
        if ($tailscaleStatus -and $tailscaleStatus.MagicDNSSuffix) {
            $machineInfo.tailscale_domain = $tailscaleStatus.MagicDNSSuffix
            $machineInfo.tailscale_fqdn = "$($machineInfo.hostname.ToLower()).$($machineInfo.tailscale_domain)"
            Write-Host "  MagicDNS: $($machineInfo.tailscale_fqdn)" -ForegroundColor Green
        }
    } else {
        Write-Host "  Tailscale not connected" -ForegroundColor Yellow
        $machineInfo.ip_tailscale = "not-connected"
    }
} catch {
    Write-Host "  Tailscale not installed" -ForegroundColor Yellow
    $machineInfo.ip_tailscale = "not-installed"
}

# 5. Ollama Info
Write-Host "`nChecking Ollama..." -ForegroundColor Yellow

try {
    $ollamaResponse = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    $ollamaData = $ollamaResponse.Content | ConvertFrom-Json

    $machineInfo.ollama_installed = $true
    $machineInfo.ollama_port = 11434
    $machineInfo.ollama_models = @()

    foreach ($model in $ollamaData.models) {
        $machineInfo.ollama_models += $model.name
    }

    Write-Host "  Ollama: Running on port 11434" -ForegroundColor Green
    Write-Host "  Models: $($machineInfo.ollama_models.Count) installed" -ForegroundColor Green

    if ($Verbose) {
        foreach ($model in $machineInfo.ollama_models) {
            Write-Host "    - $model" -ForegroundColor White
        }
    }
} catch {
    Write-Host "  Ollama: Not running" -ForegroundColor Yellow
    $machineInfo.ollama_installed = $false
    $machineInfo.ollama_port = 11434
    $machineInfo.ollama_models = @()
}

# 6. Generate .env.machine file
Write-Host "`nGenerating .env.machine file..." -ForegroundColor Yellow

$envContent = @"
# Machine-Specific Environment Variables
# Generated: $($machineInfo.timestamp)
# Machine: $($machineInfo.hostname)
# Role: $($machineInfo.role)
#
# Upload to Infisical:
#   infisical secrets set --path="/machines/$($machineInfo.role)" --env="prod" --file=.env.machine

# ==========================================
# Basic Machine Info
# ==========================================
MACHINE_HOSTNAME=$($machineInfo.hostname)
MACHINE_ROLE=$($machineInfo.role)
MACHINE_USERNAME=$($machineInfo.username)

# ==========================================
# Network Configuration
# ==========================================
MACHINE_IP_ETHERNET=$($machineInfo.ip_ethernet ?? 'not-connected')
MACHINE_IP_WIFI=$($machineInfo.ip_wifi ?? 'not-applicable')
MACHINE_IP_TAILSCALE=$($machineInfo.ip_tailscale ?? 'not-connected')
MACHINE_MAC_ETHERNET=$($machineInfo.mac_ethernet ?? 'not-connected')
MACHINE_MAC_WIFI=$($machineInfo.mac_wifi ?? 'not-applicable')
"@

# Add Tailscale info if available
if ($machineInfo.tailscale_domain) {
    $envContent += @"

MACHINE_TAILSCALE_DOMAIN=$($machineInfo.tailscale_domain)
MACHINE_TAILSCALE_FQDN=$($machineInfo.tailscale_fqdn)
"@
}

# Add GPU info if worker
if ($machineInfo.role -ne "orchestrator-mini") {
    $envContent += @"


# ==========================================
# GPU Configuration
# ==========================================
MACHINE_GPU_TYPE=$($machineInfo.gpu_type)
MACHINE_GPU_VRAM_GB=$($machineInfo.gpu_vram_gb)
MACHINE_GPU_NAME=$($machineInfo.gpu_name)
"@
}

# Add Ollama info
$envContent += @"


# ==========================================
# Ollama Configuration
# ==========================================
OLLAMA_HOST=0.0.0.0
OLLAMA_PORT=$($machineInfo.ollama_port)
"@

if ($machineInfo.ollama_models.Count -gt 0) {
    $modelsString = $machineInfo.ollama_models -join ','
    $envContent += "`nOLLAMA_MODELS=$modelsString"
}

# Add worker-specific Nexus Router variables
if ($machineInfo.role -ne "orchestrator-mini" -and $machineInfo.ip_tailscale -ne "not-connected") {
    $workerIdUpper = $machineInfo.role.Replace('worker-', '').Replace('rtx', '').ToUpper()
    $envContent += @"


# ==========================================
# Nexus Router Integration
# ==========================================
WORKER_SPECIALIZATION=$($machineInfo.specialization)
WORKER_${workerIdUpper}_URL=http://$($machineInfo.ip_tailscale):$($machineInfo.ollama_port)
WORKER_${workerIdUpper}_SPECIALIZATION=$($machineInfo.specialization)
"@

    if ($machineInfo.ollama_models.Count -gt 0) {
        $envContent += "`nWORKER_${workerIdUpper}_MODELS=$modelsString"
    }
}

# Write .env.machine file
$envFilePath = Join-Path $OutputDir ".env.machine"
$envContent | Out-File -FilePath $envFilePath -Encoding UTF8 -Force

Write-Host "  Created: $envFilePath" -ForegroundColor Green

# 7. Save machine-info.json for reference
$jsonFilePath = Join-Path $OutputDir "machine-info.json"
$machineInfo | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonFilePath -Encoding UTF8 -Force

Write-Host "  Created: $jsonFilePath" -ForegroundColor Green

# 8. Display summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Machine Configuration:" -ForegroundColor Yellow
Write-Host "  Hostname:      $($machineInfo.hostname)" -ForegroundColor White
Write-Host "  Role:          $($machineInfo.role)" -ForegroundColor White
Write-Host "  Tailscale IP:  $($machineInfo.ip_tailscale)" -ForegroundColor White

if ($machineInfo.role -ne "orchestrator-mini") {
    Write-Host "  GPU:           $($machineInfo.gpu_name)" -ForegroundColor White
    Write-Host "  VRAM:          $($machineInfo.gpu_vram_gb) GB" -ForegroundColor White
}

if ($machineInfo.ollama_models.Count -gt 0) {
    Write-Host "  Ollama Models: $($machineInfo.ollama_models.Count)" -ForegroundColor White
}

Write-Host ""
Write-Host "Files Generated:" -ForegroundColor Yellow
Write-Host "  .env.machine       - Upload to Infisical" -ForegroundColor White
Write-Host "  machine-info.json  - Reference data" -ForegroundColor White

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review .env.machine file" -ForegroundColor White
Write-Host "  2. Upload to Infisical:" -ForegroundColor White
Write-Host "     infisical secrets set --path='/machines/$($machineInfo.role)' --env='prod' --file=.env.machine" -ForegroundColor Cyan
Write-Host "  3. Test pull:" -ForegroundColor White
Write-Host "     infisical secrets get --path='/machines/$($machineInfo.role)' --env='prod'" -ForegroundColor Cyan
Write-Host ""
