#!/usr/bin/env pwsh

<#
.SYNOPSIS
Upload worker secrets to Infisical

.DESCRIPTION
Uploads all worker-specific secrets (GPU configs, LLM inference settings)
to /worker-* paths in Infisical. Each worker PC has access only to its own secrets.

.PARAMETER Environment
Target environment (development, staging, production)

.EXAMPLE
.\upload-worker-secrets.ps1 -Environment development
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"

Write-Host "`n🔐 Uploading Worker Secrets to Infisical" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

$totalSuccess = 0
$totalFailed = 0

# Helper function to upload secrets
function Upload-Secrets {
    param(
        [hashtable]$Secrets,
        [string]$Path,
        [string]$Category
    )

    Write-Host "📦 Uploading $Category..." -ForegroundColor Yellow

    $success = 0
    $failed = 0

    foreach ($key in $Secrets.Keys) {
        $value = $Secrets[$key]

        if ([string]::IsNullOrWhiteSpace($value)) {
            Write-Host "   ⚠️  Skipping $key (not set)" -ForegroundColor DarkYellow
            continue
        }

        try {
            infisical secrets set $key $value --path $Path --env $Environment | Out-Null
            Write-Host "   ✅ $key" -ForegroundColor Green
            $success++
        }
        catch {
            Write-Host "   ❌ $key : $_" -ForegroundColor Red
            $failed++
        }
    }

    Write-Host "   📊 $Category : $success success, $failed failed`n" -ForegroundColor Cyan

    return @{Success = $success; Failed = $failed}
}

# Helper function to generate API key if not set
function Get-OrGenerateApiKey {
    param([string]$EnvVar)

    $value = [Environment]::GetEnvironmentVariable($EnvVar)
    if ([string]::IsNullOrWhiteSpace($value)) {
        # Generate new API key
        $bytes = New-Object byte[] 32
        [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
        $value = [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
        Write-Host "   🔑 Generated new API key for $EnvVar" -ForegroundColor Cyan
    }
    return $value
}

# ==========================================
# Worker 2: RTX 3060 (Ollama)
# ==========================================
Write-Host "`n🖥️  Worker 2: RTX 3060 (Ollama)" -ForegroundColor Magenta
Write-Host "================================`n" -ForegroundColor Magenta

$worker2Ollama = @{
    "OLLAMA_HOST" = "0.0.0.0:11434"
    "OLLAMA_PORT" = "11434"
    "OLLAMA_ORIGINS" = "*"
    "OLLAMA_NUM_PARALLEL" = "2"
    "OLLAMA_MAX_LOADED_MODELS" = "2"
}
$result = Upload-Secrets -Secrets $worker2Ollama -Path "/worker-rtx3060/ollama" -Category "Ollama Config"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

$worker2Config = @{
    "NYRA_PC_ID" = "worker-rtx3060"
    "NYRA_GPU_TYPE" = "rtx_3060"
    "NYRA_WORKER_ID" = "2"
    "ORCHESTRATOR_URL" = "http://orchestrator:8000"
    "CUDA_VISIBLE_DEVICES" = "0"
}
$result = Upload-Secrets -Secrets $worker2Config -Path "/worker-rtx3060/worker-config" -Category "Worker Config"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

$worker2Cloudflare = @{
    "CLOUDFLARED_TOKEN_WORKER_RTX3060" = $env:CLOUDFLARED_TOKEN_WORKER_2
    "CLOUDFLARE_TUNNEL_NAME_WORKER_2" = "nyra-worker-rtx3060"
}
$result = Upload-Secrets -Secrets $worker2Cloudflare -Path "/worker-rtx3060/cloudflare" -Category "Cloudflare Tunnel"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# ==========================================
# Worker 3: RTX 5090 (vLLM + LMCache)
# ==========================================
Write-Host "`n🖥️  Worker 3: RTX 5090 (vLLM + LMCache)" -ForegroundColor Magenta
Write-Host "======================================`n" -ForegroundColor Magenta

$worker3VLLM = @{
    "VLLM_API_KEY" = Get-OrGenerateApiKey "VLLM_API_KEY_WORKER_3"
    "VLLM_HOST" = "0.0.0.0"
    "VLLM_PORT" = "8000"
    "VLLM_TENSOR_PARALLEL" = "1"
    "VLLM_GPU_MEMORY_UTILIZATION" = "0.95"
    "VLLM_MAX_MODEL_LEN" = "32768"
}
$result = Upload-Secrets -Secrets $worker3VLLM -Path "/worker-rtx5090/vllm" -Category "vLLM Config"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

$worker3LMCache = @{
    "LMCACHE_CONFIG" = "/app/config/lmcache.yaml"
    "LMCACHE_CACHE_SIZE_GB" = "16"
    "LMCACHE_BACKEND" = "redis"
    "LMCACHE_REDIS_URL" = "redis://orchestrator:6380"
}
$result = Upload-Secrets -Secrets $worker3LMCache -Path "/worker-rtx5090/lmcache" -Category "LMCache Config"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

$worker3Config = @{
    "NYRA_PC_ID" = "worker-rtx5090"
    "NYRA_GPU_TYPE" = "rtx_5090"
    "NYRA_WORKER_ID" = "3"
    "ORCHESTRATOR_URL" = "http://orchestrator:8000"
    "CUDA_VISIBLE_DEVICES" = "0"
}
$result = Upload-Secrets -Secrets $worker3Config -Path "/worker-rtx5090/worker-config" -Category "Worker Config"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

$worker3Cloudflare = @{
    "CLOUDFLARED_TOKEN_WORKER_RTX5090" = $env:CLOUDFLARED_TOKEN_WORKER_3
    "CLOUDFLARE_TUNNEL_NAME_WORKER_3" = "nyra-worker-rtx5090"
}
$result = Upload-Secrets -Secrets $worker3Cloudflare -Path "/worker-rtx5090/cloudflare" -Category "Cloudflare Tunnel"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# ==========================================
# Worker 4: RTX 3090 Ti (vLLM + LMCache)
# ==========================================
Write-Host "`n🖥️  Worker 4: RTX 3090 Ti (vLLM + LMCache)" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

$worker4VLLM = @{
    "VLLM_API_KEY" = Get-OrGenerateApiKey "VLLM_API_KEY_WORKER_4"
    "VLLM_HOST" = "0.0.0.0"
    "VLLM_PORT" = "8000"
    "VLLM_TENSOR_PARALLEL" = "1"
    "VLLM_GPU_MEMORY_UTILIZATION" = "0.95"
    "VLLM_MAX_MODEL_LEN" = "32768"
}
$result = Upload-Secrets -Secrets $worker4VLLM -Path "/worker-rtx3090ti/vllm" -Category "vLLM Config"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

$worker4LMCache = @{
    "LMCACHE_CONFIG" = "/app/config/lmcache.yaml"
    "LMCACHE_CACHE_SIZE_GB" = "16"
    "LMCACHE_BACKEND" = "redis"
    "LMCACHE_REDIS_URL" = "redis://orchestrator:6380"
}
$result = Upload-Secrets -Secrets $worker4LMCache -Path "/worker-rtx3090ti/lmcache" -Category "LMCache Config"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

$worker4Config = @{
    "NYRA_PC_ID" = "worker-rtx3090ti"
    "NYRA_GPU_TYPE" = "rtx_3090ti"
    "NYRA_WORKER_ID" = "4"
    "ORCHESTRATOR_URL" = "http://orchestrator:8000"
    "CUDA_VISIBLE_DEVICES" = "0"
}
$result = Upload-Secrets -Secrets $worker4Config -Path "/worker-rtx3090ti/worker-config" -Category "Worker Config"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

$worker4Cloudflare = @{
    "CLOUDFLARED_TOKEN_WORKER_RTX3090TI" = $env:CLOUDFLARED_TOKEN_WORKER_4
    "CLOUDFLARE_TUNNEL_NAME_WORKER_4" = "nyra-worker-rtx3090ti"
}
$result = Upload-Secrets -Secrets $worker4Cloudflare -Path "/worker-rtx3090ti/cloudflare" -Category "Cloudflare Tunnel"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

Write-Host "`n=========================================`n" -ForegroundColor Cyan
Write-Host "📊 Total Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Total Success: $totalSuccess" -ForegroundColor Green
Write-Host "   ❌ Total Failed: $totalFailed" -ForegroundColor Red
Write-Host "`n🎉 Worker secrets upload complete!`n" -ForegroundColor Green

if ($totalFailed -gt 0) {
    exit 1
}
