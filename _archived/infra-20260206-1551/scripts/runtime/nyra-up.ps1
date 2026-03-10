param()
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent)
if (!(Test-Path docker\.env)) { Copy-Item docker\.env.example docker\.env }
docker compose --env-file docker\.env -f docker\docker-compose.nyra.yml up -d
Write-Host "[OK] Services starting."
