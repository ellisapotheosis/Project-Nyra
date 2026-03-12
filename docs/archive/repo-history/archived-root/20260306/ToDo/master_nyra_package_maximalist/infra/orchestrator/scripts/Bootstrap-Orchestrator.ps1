param(
  [Parameter(Mandatory=$false)]
  [string]$Root = "C:\Dev\nyra-router"
)

$ErrorActionPreference = "Stop"

Write-Host "== Nyra Router Bootstrap =="

if (!(Test-Path $Root)) { New-Item -ItemType Directory -Path $Root | Out-Null }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$orchDir   = Split-Path -Parent $scriptDir

Copy-Item -Path (Join-Path $orchDir "*") -Destination $Root -Recurse -Force

$envExample = Join-Path $Root ".env.example"
$envFile    = Join-Path $Root ".env"
if (!(Test-Path $envFile)) {
  Copy-Item $envExample $envFile -Force
  Write-Host "Created $envFile from .env.example (fill in secrets!)"
}

Write-Host "Bootstrap complete -> $Root"
Write-Host "Next: edit .env then run Start-Orchestrator.ps1"
