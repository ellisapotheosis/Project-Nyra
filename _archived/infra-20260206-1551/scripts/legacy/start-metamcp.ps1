$ErrorActionPreference = 'Stop'
Push-Location (Join-Path $PSScriptRoot '..\compose')
& (Join-Path $PSScriptRoot 'infisical-export.ps1') dev
docker compose -f compose.metatool.yml up -d
Start-Process http://localhost:12008
Pop-Location
