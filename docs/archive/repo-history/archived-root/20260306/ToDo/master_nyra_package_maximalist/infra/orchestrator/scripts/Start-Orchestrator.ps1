param(
  [Parameter(Mandatory=$false)]
  [string]$Root = "C:\Dev\nyra-router"
)

$ErrorActionPreference = "Stop"
Set-Location $Root

if (!(Test-Path ".env")) {
  throw "Missing .env. Copy .env.example to .env and fill values."
}

Write-Host "Starting LiteLLM + Redis..."
docker compose up -d

Write-Host "OK. LiteLLM should be on http://localhost:4000"
Write-Host "Health: http://localhost:4000/health"
Write-Host ("Models: curl http://localhost:4000/v1/models -H `"Authorization: Bearer {0}`"" -f $env:LITELLM_MASTER_KEY)
