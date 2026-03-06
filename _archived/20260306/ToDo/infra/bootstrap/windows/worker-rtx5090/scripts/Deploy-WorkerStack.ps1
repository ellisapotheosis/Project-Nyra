#requires -RunAsAdministrator
param(
  [Parameter(Mandatory=$true)][string]$Root
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$DockerDir = Join-Path $Root "docker"
$ComposeFile = Join-Path $DockerDir "docker-compose.worker-rtx5090.yml"

Write-Host "=== Deploy prep + GPU validation ===" -ForegroundColor Cyan

if (-not (Test-Path $ComposeFile)) { throw "Compose file missing: $ComposeFile" }

# Check Docker CLI
try {
  docker version | Out-Null
} catch {
  Write-Host "❌ Docker CLI not available. Launch Docker Desktop, ensure it's running, then re-run." -ForegroundColor Red
  throw
}

# Validate GPU inside Docker (this requires WSL2 + NVIDIA driver + Docker Desktop GPU support)
Write-Host "-> Testing GPU access in Docker (nvidia/cuda nvidia-smi)"
try {
  docker run --rm --gpus all nvidia/cuda:12.4.1-base-ubuntu22.04 nvidia-smi | Out-Host
  Write-Host "✓ GPU visible to Docker containers" -ForegroundColor Green
} catch {
  Write-Host "⚠️ GPU test failed. Common fixes:" -ForegroundColor Yellow
  Write-Host "  - Update NVIDIA Windows driver (WSL support)"
  Write-Host "  - Docker Desktop: Settings > General: Use WSL 2 based engine"
  Write-Host "  - Docker Desktop: Settings > Resources > WSL Integration: enable Ubuntu-24.04"
  Write-Host "  - Reboot"
}

# Prepare compose file name expected by docker compose (optional convenience)
Write-Host "-> Ensuring docker-compose.yml exists (copying worker compose)"
$defaultCompose = Join-Path $DockerDir "docker-compose.yml"
Copy-Item -Force $ComposeFile $defaultCompose

# Sanity: show ports
Write-Host "Ports:"
Write-Host "  Ollama: http://localhost:11437"
Write-Host "  vLLM:   http://localhost:8003 (profile vllm)"
Write-Host "  GPU metrics: http://localhost:9400/metrics (profile gpu-metrics)"
Write-Host "  Windows Exporter: http://localhost:9182/metrics"

Write-Host "✓ Deploy prep finished."
