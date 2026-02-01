$ErrorActionPreference="Stop"
$RootDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location (Join-Path $RootDir "infra")
docker compose --env-file .env -f docker-compose.dev.yml up -d --build
Write-Host "[Nyra] Dev stack up. See infra\README.md for URLs."
