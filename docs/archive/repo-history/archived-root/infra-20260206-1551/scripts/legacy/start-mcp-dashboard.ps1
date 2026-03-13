Param(
  [Parameter()] [string]$ManagerPortEnv = $env:MANAGER_PORT,
  [int]$ManagerPort
)
$ErrorActionPreference = 'Stop'
if (-not $PSBoundParameters.ContainsKey('ManagerPort')) {
  $parsed = 0
  if ([int]::TryParse($ManagerPortEnv, [ref]$parsed)) {
    $ManagerPort = $parsed
  } else {
    Write-Warning "MANAGER_PORT is not a valid integer (value=[$ManagerPortEnv]); defaulting to 3001"
    $ManagerPort = 3001
  }
}
$uri = "http://localhost:$ManagerPort/health"
for ($i=0; $i -lt 30; $i++) {
  try { $r = Invoke-WebRequest -UseBasicParsing -Uri $uri -TimeoutSec 2; if ($r.StatusCode -eq 200) { break } } catch { Start-Sleep -Seconds 1 }
}
if ($i -ge 30) { Write-Warning "Casistack manager not healthy on $uri yet." } else { Write-Host "Casistack manager healthy on $uri" }
Start-Process "http://localhost:$ManagerPort"
