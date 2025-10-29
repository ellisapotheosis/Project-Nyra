# Ensures network and probes gateway once up
docker network inspect nyra-network 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { docker network create nyra-network | Out-Null }
docker compose -f infra\compose\compose.metamcp.yml --env-file infra\.env up -d metamcp
Start-Sleep -Seconds 3
try {
  $url = (Get-Content infra\.env | Where-Object {$_ -match "^APP_URL="}) -replace "APP_URL=",""
  if (-not $url) { $url = "http://localhost:12008" }
  Invoke-WebRequest -UseBasicParsing -Uri $url -Headers @{"Authorization"="Bearer test"} -TimeoutSec 10 | Out-Null
  Write-Output "Probe OK: $url"
} catch { Write-Warning "Probe failed: $($_.Exception.Message)" }
