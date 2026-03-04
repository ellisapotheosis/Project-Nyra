param(
  [string]$EnvFile = ".env.stack",
  [string]$ComposeFile = "infra/docker-compose.yml",
  [string]$CheckMatrix = "scripts/health-checks.csv"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host "[FAIL] docker command not found"
  exit 1
}

if (-not (Test-Path $CheckMatrix)) {
  Write-Host "[FAIL] check matrix not found: $CheckMatrix"
  exit 1
}

$portMap = @{}

if (Test-Path $EnvFile) {
  Get-Content -Path $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    $parts = $line -split "=", 2
    if ($parts.Count -ne 2) { return }
    $key = $parts[0].Trim()
    $value = $parts[1].Trim()
    if ($value.Contains("#")) { $value = ($value -split "#", 2)[0].Trim() }
    $value = $value.Trim("`\"'")
    if (-not [string]::IsNullOrWhiteSpace($key)) { $portMap[$key] = $value }
  }

  try {
    docker compose --env-file $EnvFile -f $ComposeFile ps | Out-Null
  }
  catch {
    Write-Host "[WARN] docker compose ps failed with env file ($EnvFile); continuing HTTP probes"
  }
}
else {
  Write-Host "[WARN] env file not found: $EnvFile (probing using shell/default ports)"
  try {
    docker compose -f $ComposeFile ps | Out-Null
  }
  catch {
    Write-Host "[WARN] docker compose ps failed without env file; continuing HTTP probes"
  }
}

$rows = Import-Csv -Path $CheckMatrix

"{0,-20} {1,-8} {2}" -f "SERVICE", "RESULT", "URL"
"{0,-20} {1,-8} {2}" -f "-------", "------", "---"

$failed = $false

foreach ($row in $rows) {
  $port = $null
  if ($portMap.ContainsKey($row.port_env) -and -not [string]::IsNullOrWhiteSpace($portMap[$row.port_env])) {
    $port = $portMap[$row.port_env]
  }
  elseif (-not [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($row.port_env))) {
    $port = [Environment]::GetEnvironmentVariable($row.port_env)
  }
  else {
    $port = $row.default_port
  }

  $url = "http://localhost:$port$($row.path)"
  try {
    Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 8 | Out-Null
    "{0,-20} {1,-8} {2}" -f $row.service, "PASS", $url
  }
  catch {
    "{0,-20} {1,-8} {2}" -f $row.service, "FAIL", $url
    $failed = $true
  }
}

if ($failed) { exit 1 }
