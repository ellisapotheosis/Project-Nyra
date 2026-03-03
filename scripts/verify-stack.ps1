param(
  [string]$EnvFile = "infra/.env.example",
  [string]$ComposeFile = "infra/docker-compose.yml"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host "[FAIL] docker command not found"
  exit 1
}

$checks = @(
  @{ Name = "nexus-router"; Port = $env:NEXUS_ROUTER_PORT; Path = "/health" },
  @{ Name = "litellm"; Port = $env:LITELLM_PORT; Path = "/health" },
  @{ Name = "n8n"; Port = $env:N8N_PORT; Path = "/" },
  @{ Name = "activepieces"; Port = $env:ACTIVEPIECES_PORT; Path = "/" },
  @{ Name = "twentycrm"; Port = $env:TWENTYCRM_PORT; Path = "/" },
  @{ Name = "archon-os"; Port = $env:ARCHON_OS_PORT; Path = "/" },
  @{ Name = "openwebui"; Port = $env:OPENWEBUI_PORT; Path = "/" },
  @{ Name = "grafana"; Port = $env:GRAFANA_PORT; Path = "/api/health" },
  @{ Name = "prometheus"; Port = $env:PROMETHEUS_PORT; Path = "/-/healthy" }
)

$defaults = @{
  "NEXUS_ROUTER_PORT" = "7000"
  "LITELLM_PORT" = "4000"
  "N8N_PORT" = "5678"
  "ACTIVEPIECES_PORT" = "8082"
  "TWENTYCRM_PORT" = "3000"
  "ARCHON_OS_PORT" = "9001"
  "OPENWEBUI_PORT" = "8088"
  "GRAFANA_PORT" = "3003"
  "PROMETHEUS_PORT" = "9090"
}

if (Test-Path $EnvFile) {
  # Override default ports with values from the env file, if present
  Get-Content -Path $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) {
      return
    }

    $parts = $line -split "=", 2
    if ($parts.Count -ne 2) {
      return
    }

    $key = $parts[0].Trim()
    $value = $parts[1].Trim().Trim("'`"")

    if ($defaults.ContainsKey($key) -and -not [string]::IsNullOrWhiteSpace($value)) {
      $defaults[$key] = $value
    }
  }
}

docker compose --env-file $EnvFile -f $ComposeFile ps | Out-Null

"{0,-20} {1,-8} {2}" -f "SERVICE", "RESULT", "URL"
"{0,-20} {1,-8} {2}" -f "-------", "------", "---"

$failed = $false

foreach ($check in $checks) {
  if ([string]::IsNullOrWhiteSpace($check.Port)) {
    switch ($check.Name) {
      "nexus-router" { $check.Port = $defaults.NEXUS_ROUTER_PORT }
      "litellm" { $check.Port = $defaults.LITELLM_PORT }
      "n8n" { $check.Port = $defaults.N8N_PORT }
      "activepieces" { $check.Port = $defaults.ACTIVEPIECES_PORT }
      "twentycrm" { $check.Port = $defaults.TWENTYCRM_PORT }
      "archon-os" { $check.Port = $defaults.ARCHON_OS_PORT }
      "openwebui" { $check.Port = $defaults.OPENWEBUI_PORT }
      "grafana" { $check.Port = $defaults.GRAFANA_PORT }
      "prometheus" { $check.Port = $defaults.PROMETHEUS_PORT }
    }
  }

  $url = "http://localhost:$($check.Port)$($check.Path)"
  try {
    Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 8 | Out-Null
    "{0,-20} {1,-8} {2}" -f $check.Name, "PASS", $url
  }
  catch {
    "{0,-20} {1,-8} {2}" -f $check.Name, "FAIL", $url
    $failed = $true
  }
}

if ($failed) { exit 1 }
