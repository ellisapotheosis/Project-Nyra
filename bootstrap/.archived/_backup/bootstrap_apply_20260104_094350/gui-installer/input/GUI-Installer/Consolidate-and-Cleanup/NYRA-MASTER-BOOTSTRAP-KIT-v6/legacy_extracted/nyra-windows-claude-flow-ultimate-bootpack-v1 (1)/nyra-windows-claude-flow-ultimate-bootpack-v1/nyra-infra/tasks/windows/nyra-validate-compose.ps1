param([string]$ComposeFile)
$envFile = "nyra-infra\.env"
if (-not (Test-Path $ComposeFile)) { Write-Error "Compose file not found: $ComposeFile"; exit 2 }
docker compose -f $ComposeFile config --env-file $envFile | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Error "Compose validation failed: $ComposeFile"; exit 2 }
Write-Output "Compose OK: $ComposeFile"
