$ErrorActionPreference = 'Stop'
Push-Location (Join-Path $PSScriptRoot '..\compose')
& (Join-Path $PSScriptRoot 'infisical-export.ps1') dev
docker compose -f compose.nyra-stack.yml up -d --build
$port = if ($env:MANAGER_PORT) { $env:MANAGER_PORT } else { '3001' }
Start-Process "http://localhost:$port"
Pop-Location
