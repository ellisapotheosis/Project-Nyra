# PowerShell Script: Start Orchestrator Services
# Description: Starts all orchestrator services with health checks

param(
    [switch]$Force,
    [switch]$Build,
    [switch]$Logs,
    [string]$Profile = "default"
)

$ErrorActionPreference = "Stop"

# Configuration
$ORCHESTRATOR_DIR = "$PSScriptRoot\..\orchestrator"
$ENV_FILE = "$ORCHESTRATOR_DIR\.env"
$COMPOSE_FILE = "$ORCHESTRATOR_DIR\docker-compose.yml"
$SERVICES = @(
    "postgres",
    "redis",
    "minio",
    "infisical-mongo",
    "infisical",
    "prometheus",
    "grafana",
    "open-webui",
    "lobechat",
    "nginx"
)

# Color output functions
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."

    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed or not in PATH"
        exit 1
    }

    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose is not installed or not in PATH"
        exit 1
    }

    if (-not (Test-Path $ENV_FILE)) {
        Write-Warning ".env file not found. Creating from template..."
        Copy-Item "$ORCHESTRATOR_DIR\.env.example" $ENV_FILE -ErrorAction Stop
        Write-Warning "Please edit $ENV_FILE with your configuration"
        exit 1
    }

    Write-Success "Prerequisites check passed"
}

# Check if services are running
function Test-ServicesRunning {
    $running = docker-compose -f $COMPOSE_FILE ps -q 2>$null
    return $running.Count -gt 0
}

# Stop existing services
function Stop-Services {
    if (Test-ServicesRunning) {
        Write-Info "Stopping existing services..."
        docker-compose -f $COMPOSE_FILE down
        Write-Success "Services stopped"
    }
}

# Pull latest images
function Update-Images {
    Write-Info "Pulling latest images..."
    docker-compose -f $COMPOSE_FILE pull
    Write-Success "Images updated"
}

# Build custom images
function Build-Images {
    Write-Info "Building custom images..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    Write-Success "Images built"
}

# Start services
function Start-Services {
    Write-Info "Starting orchestrator services..."

    if ($Build) {
        docker-compose -f $COMPOSE_FILE up -d --build
    } else {
        docker-compose -f $COMPOSE_FILE up -d
    }

    Write-Success "Services started"
}

# Wait for service to be healthy
function Wait-ForService {
    param(
        [string]$ServiceName,
        [int]$TimeoutSeconds = 120
    )

    Write-Info "Waiting for $ServiceName to be healthy..."
    $elapsed = 0
    $interval = 5

    while ($elapsed -lt $TimeoutSeconds) {
        $health = docker inspect --format='{{.State.Health.Status}}' "orchestrator-$ServiceName" 2>$null

        if ($health -eq "healthy") {
            Write-Success "$ServiceName is healthy"
            return $true
        }

        if ($health -eq "unhealthy") {
            Write-Error "$ServiceName is unhealthy"
            return $false
        }

        Start-Sleep -Seconds $interval
        $elapsed += $interval
        Write-Host "." -NoNewline
    }

    Write-Warning "$ServiceName health check timeout"
    return $false
}

# Check all services health
function Test-ServicesHealth {
    Write-Info "Checking services health..."
    $allHealthy = $true

    foreach ($service in $SERVICES) {
        $containerName = "orchestrator-$service"
        $status = docker inspect --format='{{.State.Status}}' $containerName 2>$null

        if ($status -ne "running") {
            Write-Error "$service is not running (status: $status)"
            $allHealthy = $false
            continue
        }

        # Check if service has health check
        $hasHealthCheck = docker inspect --format='{{.State.Health}}' $containerName 2>$null
        if ($hasHealthCheck -ne "<nil>") {
            if (-not (Wait-ForService -ServiceName $service -TimeoutSeconds 60)) {
                $allHealthy = $false
            }
        } else {
            Write-Success "$service is running (no health check)"
        }
    }

    return $allHealthy
}

# Display services status
function Show-ServicesStatus {
    Write-Info "`nServices Status:"
    docker-compose -f $COMPOSE_FILE ps

    Write-Info "`nService URLs:"
    Write-Host "  Open-WebUI:     http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  LobeChat:       http://localhost:3210" -ForegroundColor Cyan
    Write-Host "  Grafana:        http://localhost:3001" -ForegroundColor Cyan
    Write-Host "  Prometheus:     http://localhost:9090" -ForegroundColor Cyan
    Write-Host "  MinIO Console:  http://localhost:9001" -ForegroundColor Cyan
    Write-Host "  Infisical:      http://localhost:8080" -ForegroundColor Cyan
    Write-Host "  Nginx:          http://localhost" -ForegroundColor Cyan
}

# Show logs
function Show-Logs {
    Write-Info "Showing logs (Ctrl+C to exit)..."
    docker-compose -f $COMPOSE_FILE logs -f
}

# Main execution
function Main {
    Write-Info "=== Orchestrator Services Manager ==="
    Write-Info "Starting orchestrator services..."

    Test-Prerequisites

    if ($Force) {
        Stop-Services
    }

    if ($Build) {
        Build-Images
    }

    Start-Services

    Start-Sleep -Seconds 5

    if (Test-ServicesHealth) {
        Write-Success "`n✓ All services are healthy and running!"
    } else {
        Write-Warning "`n⚠ Some services may not be healthy. Check logs for details."
    }

    Show-ServicesStatus

    if ($Logs) {
        Show-Logs
    } else {
        Write-Info "`nTo view logs, run: docker-compose -f $COMPOSE_FILE logs -f"
        Write-Info "To stop services, run: docker-compose -f $COMPOSE_FILE down"
    }
}

# Run main function
try {
    Main
} catch {
    Write-Error "Error: $_"
    exit 1
}
