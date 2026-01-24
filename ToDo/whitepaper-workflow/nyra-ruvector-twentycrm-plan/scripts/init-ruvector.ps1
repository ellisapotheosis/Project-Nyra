param(
  [Parameter(Mandatory=$false)][string]$PostgresPassword = $env:POSTGRES_PASSWORD
)

if (-not $PostgresPassword) {
  Write-Host "Set POSTGRES_PASSWORD env var or pass -PostgresPassword" -ForegroundColor Yellow
  exit 1
}

# Usage: $env:POSTGRES_PASSWORD="..."; .\scripts\init-ruvector.ps1

docker exec -e PGPASSWORD="$PostgresPassword" -it postgres `
  psql -U postgres -d nyra_ai -c "CREATE EXTENSION IF NOT EXISTS ruvector;"
