# PowerShell Script: Start Worker Services
# Description: Starts GPU worker services with NVIDIA runtime

param(
    [switch]$Force,
    [switch]$Build,
    [switch]$Logs,
    [switch]$EnableVLLM,
    [int]$WorkerID = 1
)

$ErrorActionPreference = "Stop"

# Configuration
$WORKER_DIR = "$PSScriptRoot\..\worker"
$ENV_FILE = "$WORKER_DIR\.env"
$COMPOSE_FILE = "$WORKER_DIR\docker-compose.yml"

# Color output functions
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."

    # Check Docker
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed or not in PATH"
        exit 1
    }

    # Check NVIDIA Docker runtime
    $dockerInfo = docker info 2>&1 | Out-String
    if ($dockerInfo -notmatch "nvidia") {
        Write-Warning "NVIDIA Container Runtime may not be installed"
        Write-Warning "GPU passthrough might not work correctly"
    }

    # Check NVIDIA GPU
    try {
        $nvidiaSmi = nvidia-smi 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "NVIDIA GPU detected"
            nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv
        }
    } catch {
        Write-Error "NVIDIA GPU or drivers not detected"
        Write-Warning "Worker services require NVIDIA GPU with proper drivers"
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue -ne "y") {
            exit 1
        }
    }

    if (-not (Test-Path $ENV_FILE)) {
        Write-Warning ".env file not found. Creating from template..."
        Copy-Item "$WORKER_DIR\.env.example" $ENV_FILE -ErrorAction Stop
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
        if ($EnableVLLM) {
            docker-compose -f $COMPOSE_FILE --profile vllm down
        } else {
            docker-compose -f $COMPOSE_FILE down
        }
        Write-Success "Services stopped"
    }
}

# Pull Ollama models
function Install-OllamaModels {
    Write-Info "Pulling recommended Ollama models..."

    $models = @(
        "llama2:latest",
        "mistral:latest",
        "codellama:7b"
    )

    foreach ($model in $models) {
        Write-Info "Pulling $model..."
        docker exec worker-ollama ollama pull $model 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✓ $model pulled successfully"
        } else {
            Write-Warning "Failed to pull $model"
        }
    }
}

# Start services
function Start-Services {
    Write-Info "Starting worker services..."

    $env:WORKER_ID = $WorkerID

    if ($EnableVLLM) {
        Write-Info "Starting with vLLM profile..."
        if ($Build) {
            docker-compose -f $COMPOSE_FILE --profile vllm up -d --build
        } else {
            docker-compose -f $COMPOSE_FILE --profile vllm up -d
        }
    } else {
        if ($Build) {
            docker-compose -f $COMPOSE_FILE up -d --build
        } else {
            docker-compose -f $COMPOSE_FILE up -d
        }
    }

    Write-Success "Services started"
}

# Wait for Ollama to be ready
function Wait-ForOllama {
    Write-Info "Waiting for Ollama to be ready..."
    $maxAttempts = 30
    $attempt = 0

    while ($attempt -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Success "Ollama is ready"
                return $true
            }
        } catch {
            # Continue waiting
        }

        Start-Sleep -Seconds 2
        $attempt++
        Write-Host "." -NoNewline
    }

    Write-Warning "Ollama startup timeout"
    return $false
}

# Check GPU utilization
function Show-GPUStatus {
    Write-Info "`nGPU Status:"
    try {
        nvidia-smi --query-gpu=index,name,temperature.gpu,utilization.gpu,utilization.memory,memory.used,memory.total --format=csv
    } catch {
        Write-Warning "Could not retrieve GPU status"
    }
}

# Display services status
function Show-ServicesStatus {
    Write-Info "`nServices Status:"
    docker-compose -f $COMPOSE_FILE ps

    Write-Info "`nService URLs:"
    Write-Host "  Ollama API:        http://localhost:11434" -ForegroundColor Cyan
    Write-Host "  Prometheus:        http://localhost:9090" -ForegroundColor Cyan
    Write-Host "  Grafana:           http://localhost:3001" -ForegroundColor Cyan
    Write-Host "  NVIDIA Metrics:    http://localhost:9835/metrics" -ForegroundColor Cyan

    if ($EnableVLLM) {
        Write-Host "  vLLM API:          http://localhost:8000" -ForegroundColor Cyan
    }

    Show-GPUStatus
}

# Test Ollama
function Test-Ollama {
    Write-Info "`nTesting Ollama..."

    try {
        $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get
        $modelCount = $response.models.Count

        if ($modelCount -gt 0) {
            Write-Success "Ollama is working! $modelCount model(s) available:"
            foreach ($model in $response.models) {
                Write-Host "  - $($model.name)" -ForegroundColor Cyan
            }
        } else {
            Write-Warning "Ollama is running but no models are installed"
            $install = Read-Host "Install recommended models? (Y/n)"
            if ($install -ne "n") {
                Install-OllamaModels
            }
        }
    } catch {
        Write-Error "Failed to connect to Ollama: $_"
    }
}

# Show logs
function Show-Logs {
    Write-Info "Showing logs (Ctrl+C to exit)..."
    docker-compose -f $COMPOSE_FILE logs -f
}

# Main execution
function Main {
    Write-Info "=== GPU Worker Services Manager ==="
    Write-Info "Worker ID: $WorkerID"

    Test-Prerequisites

    if ($Force) {
        Stop-Services
    }

    Start-Services

    Start-Sleep -Seconds 5

    if (Wait-ForOllama) {
        Write-Success "`n✓ Worker services are running!"
        Test-Ollama
    } else {
        Write-Warning "`n⚠ Ollama may not be ready. Check logs for details."
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
