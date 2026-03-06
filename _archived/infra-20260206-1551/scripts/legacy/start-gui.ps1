$ErrorActionPreference = 'Stop'
Push-Location (Join-Path $PSScriptRoot '..\compose')
try { docker network create nyra | Out-Null } catch {}
& (Join-Path $PSScriptRoot 'infisical-export.ps1') dev
docker compose -f compose.management.yml up -d
Start-Process http://localhost:9000
Start-Process http://localhost:9999
Pop-Location
