param([string]$ComposeFile)
$envFile = "infra\.env"
if (-not (Test-Path $ComposeFile)) { Write-Error "Compose file not found: $ComposeFile"; exit 2 }
# Compose config validation; exit 2 => blocks in PreTool/PreEdit contexts
docker compose -f $ComposeFile config --env-file $envFile | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Error "Compose validation failed: $ComposeFile"; exit 2 }
Write-Output "Compose OK: $ComposeFile"
