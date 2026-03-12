param(
  [Parameter(Mandatory=$false)]
  [string]$Root = "C:\Dev\nyra-router"
)

$ErrorActionPreference = "Stop"
Set-Location $Root

Write-Host "Stopping LiteLLM + Redis..."
docker compose down
Write-Host "Done."
