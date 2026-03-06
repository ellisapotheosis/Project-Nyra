#requires -RunAsAdministrator
<#
Project Nyra — RTX5090 Worker Bootstrap (Windows 11)
Entrypoint: run this as Administrator.

Default install/work directory: C:\Dev\Nyra\bootstrap\worker-rtx5090
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Scripts = Join-Path $Root "scripts"
$DockerDir = Join-Path $Root "docker"

Write-Host ""
Write-Host "=== Nyra RTX5090 Worker Bootstrap ===" -ForegroundColor Cyan
Write-Host "Root: $Root"
Write-Host ""

& (Join-Path $Scripts "Install-Prereqs.ps1") -Root $Root
& (Join-Path $Scripts "Configure-WSL.ps1") -Root $Root
& (Join-Path $Scripts "Deploy-WorkerStack.ps1") -Root $Root

Write-Host ""
Write-Host "✅ Bootstrap complete." -ForegroundColor Green
Write-Host "Next:" -ForegroundColor Yellow
Write-Host "  cd `"$DockerDir`""
Write-Host "  docker compose up -d"
Write-Host "  (optional) docker compose --profile vllm up -d"
Write-Host "  (optional) docker compose --profile gpu-metrics up -d"
Write-Host ""
