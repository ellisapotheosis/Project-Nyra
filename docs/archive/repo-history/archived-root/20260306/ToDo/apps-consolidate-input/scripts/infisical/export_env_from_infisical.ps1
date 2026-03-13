param(
  [Parameter(Mandatory=$true)][string]$EnvName = "dev",
  [Parameter(Mandatory=$false)][string]$OutFile = ".env.infisical.generated",
  [Parameter(Mandatory=$false)][string[]]$Paths = @(
    "/base",
    "/router",
    "/providers/anthropic",
    "/providers/openrouter",
    "/github",
    "/databases/postgres",
    "/databases/redis",
    "/clients/claude-flow",
    "/clients/archon-os",
    "/clients/serena",
    "/clients/dify",
    "/clients/activepieces",
    "/clients/n8n",
    "/clients/mem0",
    "/clients/letta"
  )
)

# Requires: Infisical CLI installed + authenticated (machine identity or interactive login).
# Docs: infisical export, infisical run (see /docs/infisical).

Write-Host "Generating $OutFile from Infisical paths..." -ForegroundColor Cyan

# Start clean
if (Test-Path $OutFile) { Remove-Item $OutFile -Force }

foreach ($p in $Paths) {
  Write-Host "Exporting path: $p" -ForegroundColor Gray
  # Export dotenv to stdout then append
  $tmp = [System.IO.Path]::GetTempFileName()
  # Use dotenv-export so Windows PowerShell can `.` source it if desired
  infisical export --env=$EnvName --path=$p --format=dotenv-export --output-file=$tmp | Out-Null
  Get-Content $tmp | Add-Content $OutFile
  Add-Content $OutFile "`n"
  Remove-Item $tmp -Force
}

Write-Host "Done: $OutFile" -ForegroundColor Green
