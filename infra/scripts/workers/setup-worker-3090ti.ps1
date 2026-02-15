# ============================================================================
# Project Nyra - Worker RTX 3090 Ti Setup Script
# GPU: NVIDIA RTX 3090 Ti (24GB VRAM)
# Specialization: Monitoring, Observability, Log Aggregation
# ============================================================================
#
# This script sets up the RTX 3090 Ti worker node with:
#   - NVIDIA Container Toolkit
#   - Prometheus (long-term metrics storage)
#   - Grafana (visualization dashboards)
#   - Loki (log aggregation)
#   - Alertmanager (alert routing)
#   - Infisical secrets sync
#
# Usage:
#   .\setup-worker-3090ti.ps1 -Install         # Full installation
#   .\setup-worker-3090ti.ps1 -Start           # Start services
#   .\setup-worker-3090ti.ps1 -Status          # Check status
#   .\setup-worker-3090ti.ps1 -SyncSecrets     # Sync from Infisical
#
# ============================================================================

[CmdletBinding()]
param(
    [Parameter()]
    [switch]$Install,

    [Parameter()]
    [switch]$Start,

    [Parameter()]
    [switch]$Status,

    [Parameter()]
    [switch]$Stop,

    [Parameter()]
    [switch]$SyncSecrets,

    [Parameter()]
    [string]$OrchestratorIP = "orchestrator.tail-net.ts.net",

    [Parameter()]
    [string]$InfisicalToken = $env:INFISICAL_TOKEN
)

$ErrorActionPreference = "Stop"
$WorkerID = "worker-3090ti"
$GPU = "RTX 3090 Ti"
$VRAM = "24GB"

# Color helpers
function Write-Phase { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Step { param($msg) Write-Host "  -> $msg" -ForegroundColor Gray }
function Write-Success { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "  [ERROR] $msg" -ForegroundColor Red }

# Banner
Write-Host @"

╔══════════════════════════════════════════════════════════════════════════════╗
║                    PROJECT NYRA - WORKER RTX 3090 Ti SETUP                   ║
║                                                                              ║
║    GPU: NVIDIA RTX 3090 Ti (24GB VRAM)                                      ║
║    Role: Monitoring, Observability, Log Aggregation                          ║
║    Services: Prometheus, Grafana, Loki, Alertmanager                         ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

# Infisical configuration
$InfisicalConfig = @{
    ProjectID = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
    Environment = "dev"
    SecretPath = "/workers/$WorkerID"
}

# ============================================================================
# INSTALLATION
# ============================================================================
if ($Install) {
    Write-Phase "Installing Worker RTX 3090 Ti Prerequisites"

    # Check NVIDIA GPU
    Write-Step "Checking NVIDIA GPU..."
    $nvidiaSmi = nvidia-smi --query-gpu=name,memory.total --format=csv,noheader 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "GPU detected: $nvidiaSmi"
    }
    else {
        Write-Warning "NVIDIA GPU not detected (not required for monitoring workload)"
    }

    # Check Docker
    Write-Step "Checking Docker..."
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker: $dockerVersion"
    }
    else {
        Write-Error "Docker not found. Please install Docker Desktop."
        exit 1
    }

    # Install Infisical CLI
    Write-Step "Installing Infisical CLI..."
    $infisicalInstalled = Get-Command infisical -ErrorAction SilentlyContinue
    if (-not $infisicalInstalled) {
        winget install Infisical.Infisical -e --silent
        Write-Success "Infisical CLI installed"
    }
    else {
        Write-Success "Infisical CLI already installed"
    }

    # Create directories
    Write-Step "Creating directories..."
    $dirs = @(
        "C:\nyra\$WorkerID\data\prometheus",
        "C:\nyra\$WorkerID\data\grafana",
        "C:\nyra\$WorkerID\data\loki",
        "C:\nyra\$WorkerID\data\alertmanager",
        "C:\nyra\$WorkerID\logs",
        "C:\nyra\$WorkerID\config",
        "C:\nyra\$WorkerID\secrets"
    )
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    Write-Success "Directories created"

    # Create worker configuration
    Write-Step "Creating worker configuration..."
    $workerConfig = @"
# Worker RTX 3090 Ti Configuration
worker_id: $WorkerID
gpu_type: rtx_3090ti
vram_gb: 24
specialization: monitoring

orchestrator:
  url: http://$($OrchestratorIP):8080
  health_report_interval: 30

prometheus:
  retention_time: 90d
  scrape_interval: 15s
  external_labels:
    cluster: nyra
    worker: $WorkerID

grafana:
  admin_user: admin
  server_root_url: http://localhost:3006
  plugins:
    - redis-datasource
    - prometheus
    - grafana-piechart-panel

loki:
  retention_period: 30d
  chunk_encoding: snappy

alertmanager:
  slack_webhook: ''  # Configure in Infisical
  pagerduty_key: ''  # Configure in Infisical

scrape_targets:
  - job: orchestrator
    url: http://$($OrchestratorIP):9090
  - job: worker-5090
    url: http://worker-5090.tail-net.ts.net:9002
  - job: worker-3060
    url: http://worker-3060.tail-net.ts.net:9001
"@
    $workerConfig | Out-File -FilePath "C:\nyra\$WorkerID\config\worker-config.yaml" -Encoding UTF8
    Write-Success "Configuration created"

    # Create Prometheus configuration
    Write-Step "Creating Prometheus configuration..."
    $prometheusConfig = @"
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'nyra'
    worker: '$WorkerID'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'orchestrator'
    static_configs:
      - targets: ['$($OrchestratorIP):9090']

  - job_name: 'worker-5090'
    static_configs:
      - targets: ['worker-5090.tail-net.ts.net:9002']

  - job_name: 'worker-3060'
    static_configs:
      - targets: ['worker-3060.tail-net.ts.net:9001']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
"@
    $prometheusConfig | Out-File -FilePath "C:\nyra\$WorkerID\config\prometheus.yml" -Encoding UTF8
    Write-Success "Prometheus configuration created"

    Write-Phase "Installation Complete"
    Write-Host "  Next steps:" -ForegroundColor Yellow
    Write-Host "    1. Run: .\setup-worker-3090ti.ps1 -SyncSecrets" -ForegroundColor White
    Write-Host "    2. Run: .\setup-worker-3090ti.ps1 -Start" -ForegroundColor White
}

# ============================================================================
# SYNC SECRETS FROM INFISICAL
# ============================================================================
if ($SyncSecrets) {
    Write-Phase "Syncing Secrets from Infisical"

    if (-not $InfisicalToken) {
        Write-Error "INFISICAL_TOKEN not set. Set environment variable or use -InfisicalToken"
        exit 1
    }

    Write-Step "Authenticating with Infisical..."
    $env:INFISICAL_TOKEN = $InfisicalToken

    Write-Step "Fetching secrets for $WorkerID..."
    $secrets = infisical export --projectId $InfisicalConfig.ProjectID `
        --env $InfisicalConfig.Environment `
        --path $InfisicalConfig.SecretPath `
        --format dotenv 2>&1

    if ($LASTEXITCODE -eq 0) {
        $secrets | Out-File -FilePath "C:\nyra\$WorkerID\secrets\.env" -Encoding UTF8
        Write-Success "Secrets synced to C:\nyra\$WorkerID\secrets\.env"
    }
    else {
        Write-Warning "Failed to sync secrets from Infisical. Using defaults."

        $defaultEnv = @"
# Worker RTX 3090 Ti Environment (Default)
WORKER_ID=$WorkerID
GPU_TYPE=rtx_3090ti
VRAM_GB=24

# Orchestrator Connection
ORCHESTRATOR_URL=http://$($OrchestratorIP):8080
LAN_IP=$OrchestratorIP

# Grafana Configuration
GRAFANA_USER=admin
GRAFANA_PASSWORD=changeme

# Alert Configuration (update with real values)
SLACK_WEBHOOK_URL=
PAGERDUTY_SERVICE_KEY=
ALERT_EMAIL=ops@example.com
"@
        $defaultEnv | Out-File -FilePath "C:\nyra\$WorkerID\secrets\.env" -Encoding UTF8
        Write-Warning "Created default .env file - update with real secrets"
    }
}

# ============================================================================
# START SERVICES
# ============================================================================
if ($Start) {
    Write-Phase "Starting Worker RTX 3090 Ti Services"

    $composeFile = Join-Path $PSScriptRoot "..\..\docker\workers\docker-compose.worker-rtx3090ti.yml"

    if (-not (Test-Path $composeFile)) {
        Write-Error "Compose file not found: $composeFile"
        exit 1
    }

    # Load environment
    $envFile = "C:\nyra\$WorkerID\secrets\.env"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^([^#=]+)=(.*)$') {
                $env:($matches[1]) = $matches[2]
            }
        }
    }

    Write-Step "Starting Docker services..."
    docker compose -f $composeFile up -d

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services started"

        Write-Host "`n  Service Ports:" -ForegroundColor Yellow
        Write-Host "    Prometheus:     http://localhost:9091" -ForegroundColor White
        Write-Host "    Grafana:        http://localhost:3006" -ForegroundColor White
        Write-Host "    Loki:           http://localhost:3101" -ForegroundColor White
        Write-Host "    Alertmanager:   http://localhost:9094" -ForegroundColor White
        Write-Host "    Node Exporter:  http://localhost:9100" -ForegroundColor White
        Write-Host "    cAdvisor:       http://localhost:8083" -ForegroundColor White
        Write-Host "    Health:         http://localhost:8093" -ForegroundColor White
    }
    else {
        Write-Error "Failed to start services"
        exit 1
    }
}

# ============================================================================
# STATUS CHECK
# ============================================================================
if ($Status) {
    Write-Phase "Worker RTX 3090 Ti Status"

    # Docker containers
    Write-Host "`n  Docker Containers:" -ForegroundColor Yellow
    docker ps --filter "name=nyra-worker-rtx3090ti" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    # Health check
    Write-Host "`n  Health Checks:" -ForegroundColor Yellow
    $services = @(
        @{ Name = "Prometheus"; URL = "http://localhost:9091/-/healthy" }
        @{ Name = "Grafana"; URL = "http://localhost:3006/api/health" }
        @{ Name = "Loki"; URL = "http://localhost:3101/ready" }
        @{ Name = "Alertmanager"; URL = "http://localhost:9094/-/healthy" }
        @{ Name = "Health Service"; URL = "http://localhost:8093/health" }
    )

    foreach ($svc in $services) {
        try {
            $response = Invoke-WebRequest -Uri $svc.URL -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Success "$($svc.Name)"
            }
        }
        catch {
            Write-Error "$($svc.Name) - NOT RESPONDING"
        }
    }

    # Prometheus targets
    Write-Host "`n  Prometheus Targets:" -ForegroundColor Yellow
    try {
        $targets = Invoke-RestMethod -Uri "http://localhost:9091/api/v1/targets" -ErrorAction Stop
        $targets.data.activeTargets | ForEach-Object {
            $status = if ($_.health -eq "up") { "[OK]" } else { "[DOWN]" }
            Write-Host "    $status $($_.labels.job) - $($_.scrapeUrl)" -ForegroundColor $(if ($_.health -eq "up") { "Green" } else { "Red" })
        }
    }
    catch {
        Write-Warning "Could not fetch Prometheus targets"
    }
}

# ============================================================================
# STOP SERVICES
# ============================================================================
if ($Stop) {
    Write-Phase "Stopping Worker RTX 3090 Ti Services"

    $composeFile = Join-Path $PSScriptRoot "..\..\docker\workers\docker-compose.worker-rtx3090ti.yml"

    if (Test-Path $composeFile) {
        docker compose -f $composeFile down
        Write-Success "Services stopped"
    }
}

# Default help
if (-not ($Install -or $Start -or $Status -or $Stop -or $SyncSecrets)) {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\setup-worker-3090ti.ps1 -Install       # Full installation" -ForegroundColor White
    Write-Host "  .\setup-worker-3090ti.ps1 -SyncSecrets   # Sync secrets from Infisical" -ForegroundColor White
    Write-Host "  .\setup-worker-3090ti.ps1 -Start         # Start services" -ForegroundColor White
    Write-Host "  .\setup-worker-3090ti.ps1 -Status        # Check status" -ForegroundColor White
    Write-Host "  .\setup-worker-3090ti.ps1 -Stop          # Stop services" -ForegroundColor White
}
