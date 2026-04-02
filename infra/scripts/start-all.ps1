# ============================================================================
# Project Nyra - Master Infrastructure Startup Script
# Queen Coordinator: 15-Agent Swarm Orchestration
# ============================================================================
#
# This script starts the complete Project Nyra infrastructure stack:
#   - Phase 1: Core Infrastructure (PostgreSQL, Redis, Neo4j, Qdrant, FalkorDB)
#   - Phase 2: Infisical Agent (Secrets Management)
#   - Phase 3: Nexus Router (LLM Gateway)
#   - Phase 4: MCP Servers (AgentDB, RuVector, Letta, Mem0)
#   - Phase 5: Claude Flow @alpha (Multi-Agent Orchestration)
#   - Phase 6: Open-WebUI (Port 8088)
#   - Phase 7: Applications (TwentyCRM, n8n, OpenClaw UI)
#   - Phase 8: Health Validation
#
# Usage:
#   .\start-all.ps1                    # Start all services
#   .\start-all.ps1 -Environment dev   # Specify environment
#   .\start-all.ps1 -Status            # Check service status
#   .\start-all.ps1 -Down              # Stop all services
#   .\start-all.ps1 -Workers           # Include worker nodes
#   .\start-all.ps1 -SkipInfisical     # Skip Infisical (use .env)
#
# ============================================================================

[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev",

    [Parameter()]
    [switch]$Down,

    [Parameter()]
    [switch]$Status,

    [Parameter()]
    [switch]$Build,

    [Parameter()]
    [switch]$Workers,

    [Parameter()]
    [switch]$SkipInfisical,

    [Parameter()]
    [switch]$Validate,

    [Parameter()]
    [switch]$Dashboard
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InfraDir = Split-Path -Parent $ScriptDir
$DockerDir = Join-Path $InfraDir "docker"
$ProjectRoot = Split-Path -Parent $InfraDir

# Color output helpers
function Write-Phase { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Step { param($msg) Write-Host "  -> $msg" -ForegroundColor Gray }
function Write-Success { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "  [ERROR] $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "  [INFO] $msg" -ForegroundColor White }

# Banner
Write-Host @"

╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║    ███╗   ██╗██╗   ██╗██████╗  █████╗     ██████╗ ██████╗  ██████╗          ║
║    ████╗  ██║╚██╗ ██╔╝██╔══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔═══██╗         ║
║    ██╔██╗ ██║ ╚████╔╝ ██████╔╝███████║    ██████╔╝██████╔╝██║   ██║         ║
║    ██║╚██╗██║  ╚██╔╝  ██╔══██╗██╔══██║    ██╔═══╝ ██╔══██╗██║   ██║         ║
║    ██║ ╚████║   ██║   ██║  ██║██║  ██║    ██║     ██║  ██║╚██████╔╝         ║
║    ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝          ║
║                                                                              ║
║              Queen Coordinator - 15-Agent Swarm Infrastructure               ║
║                           Claude Flow V3 Alpha                               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

# Configuration
$Services = @{
    Core = @{
        ComposeFile = "base/docker-compose.core.yml"
        Description = "Core Databases (PostgreSQL, Redis, Qdrant, FalkorDB, Neo4j)"
        HealthChecks = @(
            @{ Name = "PostgreSQL"; URL = $null; Port = 5432; Type = "tcp" }
            @{ Name = "Redis"; URL = $null; Port = 6379; Type = "tcp" }
            @{ Name = "Qdrant"; URL = "http://localhost:6333/health"; Port = 6333; Type = "http" }
        )
    }
    MCP = @{
        ComposeFile = "base/docker-compose.mcp.yml"
        Description = "MCP Servers (Nexus, LiteLLM, AgentDB, RuVector, Letta, Mem0, Infisical)"
        HealthChecks = @(
            @{ Name = "Nexus Router"; URL = "http://localhost:6000/health"; Port = 6000; Type = "http" }
            @{ Name = "LiteLLM"; URL = "http://localhost:4000/health"; Port = 4000; Type = "http" }
            @{ Name = "AgentDB"; URL = "http://localhost:8080/health"; Port = 8080; Type = "http" }
            @{ Name = "RuVector"; URL = "http://localhost:8888/health"; Port = 8888; Type = "http" }
            @{ Name = "Letta"; URL = "http://localhost:8283/health"; Port = 8283; Type = "http" }
            @{ Name = "Mem0"; URL = "http://localhost:4321/health"; Port = 4321; Type = "http" }
        )
    }
    Apps = @{
        ComposeFile = "apps/docker-compose.apps.yml"
        Description = "Applications (TwentyCRM, n8n, Open-WebUI, Claude Flow)"
        HealthChecks = @(
            @{ Name = "Open-WebUI"; URL = "http://localhost:8088/health"; Port = 8088; Type = "http" }
            @{ Name = "Claude Flow Alpha"; URL = "http://localhost:3010/health"; Port = 3010; Type = "http" }
            @{ Name = "TwentyCRM"; URL = "http://localhost:3000/health"; Port = 3000; Type = "http" }
            @{ Name = "n8n"; URL = "http://localhost:5678/healthz"; Port = 5678; Type = "http" }
        )
    }
    Orchestrator = @{
        ComposeFile = "orchestrator/docker-compose.orchestrator.yml"
        Description = "Monitoring (Prometheus, Grafana, Loki, Alertmanager)"
        HealthChecks = @(
            @{ Name = "Prometheus"; URL = "http://localhost:9090/-/healthy"; Port = 9090; Type = "http" }
            @{ Name = "Grafana"; URL = "http://localhost:3005/api/health"; Port = 3005; Type = "http" }
            @{ Name = "Loki"; URL = "http://localhost:3100/ready"; Port = 3100; Type = "http" }
        )
    }
}

$WorkerConfigs = @{
    "RTX5090" = @{
        ComposeFile = "workers/docker-compose.worker-rtx5090.yml"
        Description = "Worker RTX 5090 (High-performance inference, vLLM, graphs)"
        GPU = "RTX 5090"
        VRAM = "48GB"
        Specialization = "DeepSeek-R1 236B, Qwen 72B, Neo4j, FalkorDB"
    }
    "RTX3090Ti" = @{
        ComposeFile = "workers/docker-compose.worker-rtx3090ti.yml"
        Description = "Worker RTX 3090 Ti (Monitoring, observability)"
        GPU = "RTX 3090 Ti"
        VRAM = "24GB"
        Specialization = "Prometheus, Grafana, Loki, Alertmanager"
    }
    "RTX3060" = @{
        ComposeFile = "workers/docker-compose.worker-rtx3060.yml"
        Description = "Worker RTX 3060 (Code generation, CRM, workflows)"
        GPU = "RTX 3060"
        VRAM = "12GB"
        Specialization = "CodeLlama 34B, Qwen 32B, LiteLLM"
    }
}

# Health check function
function Test-ServiceHealth {
    param(
        [string]$Name,
        [string]$URL,
        [int]$Port,
        [string]$Type = "http",
        [int]$TimeoutSeconds = 10,
        [int]$MaxRetries = 3
    )

    for ($i = 1; $i -le $MaxRetries; $i++) {
        try {
            if ($Type -eq "http" -and $URL) {
                $response = Invoke-WebRequest -Uri $URL -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
                if ($response.StatusCode -eq 200) {
                    return $true
                }
            }
            elseif ($Type -eq "tcp") {
                $tcpClient = New-Object System.Net.Sockets.TcpClient
                $connect = $tcpClient.BeginConnect("localhost", $Port, $null, $null)
                $wait = $connect.AsyncWaitHandle.WaitOne($TimeoutSeconds * 1000, $false)
                if ($wait -and $tcpClient.Connected) {
                    $tcpClient.Close()
                    return $true
                }
                $tcpClient.Close()
            }
        }
        catch {
            if ($i -lt $MaxRetries) {
                Start-Sleep -Seconds 2
            }
        }
    }
    return $false
}

# Status check
if ($Status) {
    Write-Phase "Service Status Check"

    foreach ($key in $Services.Keys) {
        $service = $Services[$key]
        Write-Host "`n  $($service.Description):" -ForegroundColor Yellow

        foreach ($check in $service.HealthChecks) {
            $healthy = Test-ServiceHealth -Name $check.Name -URL $check.URL -Port $check.Port -Type $check.Type -MaxRetries 1
            if ($healthy) {
                Write-Success "$($check.Name) (port $($check.Port))"
            }
            else {
                Write-Error "$($check.Name) (port $($check.Port)) - NOT RESPONDING"
            }
        }
    }

    # Docker container status
    Write-Host "`n  Docker Containers:" -ForegroundColor Yellow
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=nyra-"

    exit 0
}

# Shutdown
if ($Down) {
    Write-Phase "Stopping All Services"

    $composeFiles = @(
        "apps/docker-compose.apps.yml",
        "orchestrator/docker-compose.orchestrator.yml",
        "base/docker-compose.mcp.yml",
        "base/docker-compose.core.yml"
    )

    if ($Workers) {
        $composeFiles = @(
            "workers/docker-compose.worker-rtx3060.yml",
            "workers/docker-compose.worker-rtx3090ti.yml",
            "workers/docker-compose.worker-rtx5090.yml"
        ) + $composeFiles
    }

    foreach ($file in $composeFiles) {
        $fullPath = Join-Path $DockerDir $file
        if (Test-Path $fullPath) {
            Write-Step "Stopping $(Split-Path $file -Leaf)..."
            docker compose -f $fullPath down 2>&1 | Out-Null
        }
    }

    Write-Success "All services stopped"
    exit 0
}

# Dashboard mode
if ($Dashboard) {
    Write-Phase "Opening Dashboard URLs"

    $dashboards = @{
        "Open-WebUI (Dev Chat)" = "http://localhost:3333"
        "Grafana (Metrics)" = "http://localhost:3005"
        "Prometheus (Monitoring)" = "http://localhost:9090"
        "n8n (Workflows)" = "http://localhost:5678"
        "TwentyCRM" = "http://localhost:3000"
    }

    foreach ($name in $dashboards.Keys) {
        Write-Info "$name : $($dashboards[$name])"
        Start-Process $dashboards[$name]
        Start-Sleep -Milliseconds 500
    }

    exit 0
}

# Main startup sequence
Write-Host "Environment: $Environment" -ForegroundColor Gray
Write-Host "Infrastructure Dir: $InfraDir" -ForegroundColor Gray
Write-Host "Docker Dir: $DockerDir" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# PHASE 1: Start Infisical Agent (Secrets Management)
# ============================================================================
if (-not $SkipInfisical) {
    Write-Phase "PHASE 1: Infisical Agent (Secrets Management)"

    $infisicalDir = Join-Path $InfraDir "infisical"
    $clientIdFile = Join-Path $infisicalDir "secrets/infisical-client-id"
    $clientSecretFile = Join-Path $infisicalDir "secrets/infisical-client-secret"

    if ((Test-Path $clientIdFile) -and (Test-Path $clientSecretFile)) {
        Write-Step "Starting Infisical agent..."

        # Check if infisical agent is running
        $infisicalProcess = Get-Process -Name "infisical" -ErrorAction SilentlyContinue
        if (-not $infisicalProcess) {
            Write-Step "Rendering secrets from Infisical..."
            Push-Location $infisicalDir
            try {
                # Run infisical agent in background
                $agentConfig = Join-Path $infisicalDir "agent-config.yaml"
                if (Test-Path $agentConfig) {
                    Start-Process -FilePath "infisical" -ArgumentList "agent", "--config", $agentConfig -WindowStyle Hidden -PassThru | Out-Null
                    Start-Sleep -Seconds 3
                    Write-Success "Infisical agent started"
                }
                else {
                    Write-Warning "Infisical agent config not found, using .env files"
                }
            }
            finally {
                Pop-Location
            }
        }
        else {
            Write-Success "Infisical agent already running"
        }
    }
    else {
        Write-Warning "Infisical credentials not configured, using .env files"
    }
}
else {
    Write-Phase "PHASE 1: Skipping Infisical (using .env files)"
}

# ============================================================================
# PHASE 2: Core Infrastructure (Databases)
# ============================================================================
Write-Phase "PHASE 2: Core Infrastructure (PostgreSQL, Redis, Neo4j, Qdrant, FalkorDB)"

$coreCompose = Join-Path $DockerDir "base/docker-compose.core.yml"
if (Test-Path $coreCompose) {
    Write-Step "Starting core databases..."

    $buildFlag = if ($Build) { "--build" } else { "" }
    docker compose -f $coreCompose up -d $buildFlag

    Write-Step "Waiting for databases to be healthy..."

    # Wait for PostgreSQL
    for ($i = 0; $i -lt 30; $i++) {
        $pgReady = docker exec nyra-postgres pg_isready -U postgres 2>&1
        if ($pgReady -match "accepting connections") {
            Write-Success "PostgreSQL ready"
            break
        }
        Start-Sleep -Seconds 2
    }

    # Wait for Redis
    for ($i = 0; $i -lt 15; $i++) {
        $redisReady = docker exec nyra-redis redis-cli ping 2>&1
        if ($redisReady -eq "PONG") {
            Write-Success "Redis ready"
            break
        }
        Start-Sleep -Seconds 1
    }
}
else {
    Write-Error "Core compose file not found: $coreCompose"
    exit 1
}

# ============================================================================
# PHASE 3: MCP Servers (Nexus, AgentDB, RuVector, Letta, Mem0)
# ============================================================================
Write-Phase "PHASE 3: MCP Servers (Nexus Router, AgentDB, RuVector, Letta, Mem0)"

$mcpCompose = Join-Path $DockerDir "base/docker-compose.mcp.yml"
if (Test-Path $mcpCompose) {
    Write-Step "Starting MCP servers..."

    $buildFlag = if ($Build) { "--build" } else { "" }
    docker compose -f $mcpCompose up -d $buildFlag

    Write-Step "Waiting for Nexus Router..."
    for ($i = 0; $i -lt 30; $i++) {
        if (Test-ServiceHealth -Name "Nexus" -URL "http://localhost:6000/health" -Port 6000 -MaxRetries 1) {
            Write-Success "Nexus Router ready"
            break
        }
        Start-Sleep -Seconds 2
    }

    Write-Step "Waiting for AgentDB..."
    for ($i = 0; $i -lt 20; $i++) {
        if (Test-ServiceHealth -Name "AgentDB" -URL "http://localhost:8080/health" -Port 8080 -MaxRetries 1) {
            Write-Success "AgentDB ready"
            break
        }
        Start-Sleep -Seconds 2
    }

    Write-Step "Waiting for RuVector..."
    for ($i = 0; $i -lt 20; $i++) {
        if (Test-ServiceHealth -Name "RuVector" -URL "http://localhost:8888/health" -Port 8888 -MaxRetries 1) {
            Write-Success "RuVector ready"
            break
        }
        Start-Sleep -Seconds 2
    }
}
else {
    Write-Error "MCP compose file not found: $mcpCompose"
}

# ============================================================================
# PHASE 4: Claude Flow @alpha (Multi-Agent Orchestration)
# ============================================================================
Write-Phase "PHASE 4: Claude Flow @alpha (Multi-Agent Orchestration)"

$appsCompose = Join-Path $DockerDir "apps/docker-compose.apps.yml"
if (Test-Path $appsCompose) {
    Write-Step "Starting Claude Flow @alpha with init --docker..."

    # First initialize Claude Flow if needed
    Write-Step "Initializing Claude Flow configuration..."
    docker compose -f $appsCompose run --rm claude-flow-alpha sh -c "npx @claude-flow/cli@latest init --docker --force 2>/dev/null || true" 2>&1 | Out-Null

    Write-Step "Starting application services..."
    $buildFlag = if ($Build) { "--build" } else { "" }
    docker compose -f $appsCompose up -d $buildFlag

    Write-Step "Waiting for Claude Flow @alpha..."
    for ($i = 0; $i -lt 40; $i++) {
        if (Test-ServiceHealth -Name "Claude Flow" -URL "http://localhost:3010/health" -Port 3010 -MaxRetries 1) {
            Write-Success "Claude Flow @alpha ready"
            break
        }
        Start-Sleep -Seconds 3
    }
}
else {
    Write-Error "Apps compose file not found: $appsCompose"
}

# ============================================================================
# PHASE 5: Open-WebUI (Port 8088)
# ============================================================================
Write-Phase "PHASE 5: Open-WebUI (Development Chat Interface)"

Write-Step "Starting Open-WebUI service..."
$stackCompose = Join-Path $InfraDir "docker-compose.yml"
if (Test-Path $stackCompose) {
    docker compose -f $stackCompose --profile apps up -d openwebui

    Write-Step "Waiting for Open-WebUI..."
    for ($i = 0; $i -lt 30; $i++) {
        if (Test-ServiceHealth -Name "Open-WebUI" -URL "http://localhost:8088/health" -Port 8088 -MaxRetries 1) {
            Write-Success "Open-WebUI ready on port 8088"
            break
        }
        Start-Sleep -Seconds 2
    }
}
else {
    Write-Error "Stack compose file not found: $stackCompose"
}

# ============================================================================
# PHASE 6: Orchestrator (Monitoring Stack)
# ============================================================================
Write-Phase "PHASE 6: Orchestrator (Prometheus, Grafana, Loki)"

$orchCompose = Join-Path $DockerDir "orchestrator/docker-compose.orchestrator.yml"
if (Test-Path $orchCompose) {
    Write-Step "Starting monitoring stack..."
    docker compose -f $orchCompose up -d

    Write-Step "Waiting for Grafana..."
    for ($i = 0; $i -lt 20; $i++) {
        if (Test-ServiceHealth -Name "Grafana" -URL "http://localhost:3005/api/health" -Port 3005 -MaxRetries 1) {
            Write-Success "Grafana ready"
            break
        }
        Start-Sleep -Seconds 2
    }
}
else {
    Write-Warning "Orchestrator compose file not found, skipping monitoring"
}

# ============================================================================
# PHASE 7: Worker Nodes (Optional)
# ============================================================================
if ($Workers) {
    Write-Phase "PHASE 7: Worker Nodes (GPU Inference)"

    foreach ($workerKey in $WorkerConfigs.Keys) {
        $worker = $WorkerConfigs[$workerKey]
        $workerCompose = Join-Path $DockerDir $worker.ComposeFile

        if (Test-Path $workerCompose) {
            Write-Step "Starting $($worker.Description)..."
            docker compose -f $workerCompose up -d
            Write-Success "$workerKey worker started"
        }
        else {
            Write-Warning "Worker compose not found: $workerKey"
        }
    }
}

# ============================================================================
# PHASE 8: Health Validation
# ============================================================================
Write-Phase "PHASE 8: Health Validation"

$allHealthy = $true
$healthResults = @()

foreach ($key in $Services.Keys) {
    $service = $Services[$key]
    foreach ($check in $service.HealthChecks) {
        $healthy = Test-ServiceHealth -Name $check.Name -URL $check.URL -Port $check.Port -Type $check.Type -MaxRetries 2
        $healthResults += @{
            Name = $check.Name
            Port = $check.Port
            Healthy = $healthy
        }
        if (-not $healthy) {
            $allHealthy = $false
        }
    }
}

# Display health summary
Write-Host "`n  Health Summary:" -ForegroundColor Yellow
foreach ($result in $healthResults) {
    if ($result.Healthy) {
        Write-Success "$($result.Name) (port $($result.Port))"
    }
    else {
        Write-Error "$($result.Name) (port $($result.Port)) - UNHEALTHY"
    }
}

# ============================================================================
# Summary
# ============================================================================
Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Green
if ($allHealthy) {
    Write-Host "  PROJECT NYRA INFRASTRUCTURE STARTED SUCCESSFULLY!" -ForegroundColor Green
}
else {
    Write-Host "  PROJECT NYRA STARTED WITH WARNINGS (Some services may be unhealthy)" -ForegroundColor Yellow
}
Write-Host ("=" * 80) -ForegroundColor Green

Write-Host @"

  Service URLs:
  ---------------------------------------------------------------------
  Core Infrastructure:
    PostgreSQL:       localhost:5432
    Redis:            localhost:6379
    Qdrant:           localhost:6333
    FalkorDB:         localhost:6380
    Neo4j:            localhost:7474 / :7687

  AI/ML Stack:
    Nexus Router:     http://localhost:6000  (LLM Gateway)
    LiteLLM:          http://localhost:4000  (Model Proxy)
    AgentDB:          http://localhost:8080  (HNSW Vector DB)
    RuVector:         http://localhost:8888  (Memory Optimization)

  Memory Services:
    Letta (MemGPT):   http://localhost:8283  (Stateful Memory)
    Mem0:             http://localhost:4321  (Universal Memory)
    OpenMemory MCP:   http://localhost:8081  (MCP Interface)

  Orchestration:
    Claude Flow:      http://localhost:3010  (Multi-Agent Swarm)
    Infisical:        http://localhost:8082  (Secrets Management)

  Applications:
    Open-WebUI:       http://localhost:8088  (Dev Chat - NOT BORROWER)
    TwentyCRM:        http://localhost:3000  (CRM System)
    n8n:              http://localhost:5678  (Workflow Automation)

  Monitoring:
    Grafana:          http://localhost:3005  (Dashboards)
    Prometheus:       http://localhost:9090  (Metrics)
    Loki:             http://localhost:3100  (Logs)
    Alertmanager:     http://localhost:9093  (Alerts)

  Quick Commands:
  ---------------------------------------------------------------------
    Check status:     .\start-all.ps1 -Status
    View logs:        docker logs -f nyra-<service>
    Stop all:         .\start-all.ps1 -Down
    Open dashboards:  .\start-all.ps1 -Dashboard
    Include workers:  .\start-all.ps1 -Workers
    Rebuild:          .\start-all.ps1 -Build

  Worker Nodes (separate machines):
  ---------------------------------------------------------------------
    RTX 5090:         infra\scripts\workers\setup-worker-5090.ps1
    RTX 3090 Ti:      infra\scripts\workers\setup-worker-3090ti.ps1
    RTX 3060:         infra\scripts\workers\setup-worker-3060.ps1

"@ -ForegroundColor White

# Final status
if ($allHealthy) {
    Write-Host "  Queen Coordinator: All 15 agents ready for swarm orchestration!" -ForegroundColor Cyan
}
else {
    Write-Host "  Queen Coordinator: Some services need attention. Run with -Status for details." -ForegroundColor Yellow
}

Write-Host ""
