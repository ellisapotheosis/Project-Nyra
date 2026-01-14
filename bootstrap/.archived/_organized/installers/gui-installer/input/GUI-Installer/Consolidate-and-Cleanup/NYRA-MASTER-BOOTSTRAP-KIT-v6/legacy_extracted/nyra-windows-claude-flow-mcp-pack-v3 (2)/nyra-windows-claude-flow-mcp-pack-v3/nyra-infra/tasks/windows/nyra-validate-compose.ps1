param([string]$ComposeFile)
$envFile="nyra-infra\.env"
docker compose -f $ComposeFile config --env-file $envFile | Out-Null
if($LASTEXITCODE -ne 0){Write-Error "Compose failed";exit 2}
Write-Output "Compose OK"
