param(
  [Parameter(Mandatory=$false)][string]$EnvName = "dev",
  [Parameter(Mandatory=$false)][string]$ComposeFile = "infra\docker\docker-compose.dev.yml"
)

$repoRoot = Resolve-Path "."
$envFile = Join-Path $repoRoot ".env.infisical.generated"

# 1) Export secrets to env file
& .\scripts\infisical\export_env_from_infisical.ps1 -EnvName $EnvName -OutFile $envFile

# 2) Start compose using generated env
Write-Host "Starting docker compose with env-file: $envFile" -ForegroundColor Cyan
docker compose --env-file $envFile -f $ComposeFile up -d
