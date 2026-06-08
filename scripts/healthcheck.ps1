param(
  [string]$HostName = $env:HOST
)

if (-not $HostName) {
  $HostName = "local"
}

if ($HostName -eq "local") {
  bash scripts/health-check.sh
  exit $LASTEXITCODE
}

docker --context $HostName ps

