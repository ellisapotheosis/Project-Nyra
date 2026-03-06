# PowerShell script for starting embedding services on Windows
# Usage: .\start-embeddings.ps1 [-Rebuild] [-SkipHealthCheck] [-Verbose]

param(
    [switch]$Rebuild,
    [switch]$SkipHealthCheck,
    [switch]$Verbose
)

# Configuration
$EnvFile = ".env.embeddings"
$ComposeFile = "docker-compose.embeddings.yml"
$WaitTime = 90

# Helper functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."

    # Check Docker
    try {
        docker --version | Out-Null
    } catch {
        Write-Error-Custom "Docker is not installed or not in PATH"
        exit 1
    }

    # Check Docker Compose
    try {
        docker compose version | Out-Null
    } catch {
        Write-Error-Custom "Docker Compose is not available"
        exit 1
    }

    # Check NVIDIA GPU (for ONNX)
    try {
        nvidia-smi | Out-Null
        $gpuName = nvidia-smi --query-gpu=name --format=csv,noheader
        Write-Info "NVIDIA GPU detected: $gpuName"
    } catch {
        Write-Warn "NVIDIA GPU not detected. ONNX Runtime will fail."
        Write-Warn "Xenova/Transformers will still work (CPU-based)."
    }

    # Check NVIDIA Container Toolkit
    try {
        docker run --rm --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi 2>&1 | Out-Null
        Write-Info "NVIDIA Container Toolkit is configured"
    } catch {
        Write-Warn "NVIDIA Container Toolkit not configured properly"
        Write-Warn "ONNX Runtime GPU acceleration will not work"
    }
}

# Check environment file
function Test-Environment {
    if (-not (Test-Path $EnvFile)) {
        Write-Warn "Environment file not found: $EnvFile"

        if (Test-Path ".env.embeddings.example") {
            Write-Info "Copying from .env.embeddings.example..."
            Copy-Item ".env.embeddings.example" $EnvFile
            Write-Info "Created $EnvFile - please review and customize"
        } else {
            Write-Error-Custom "No environment template found"
            exit 1
        }
    }
}

# Start services
function Start-EmbeddingServices {
    Write-Info "Starting embedding services..."

    if ($Rebuild) {
        Write-Info "Rebuilding images..."
        docker compose -f $ComposeFile build --no-cache
    }

    if ($Verbose) {
        docker compose -f $ComposeFile up -d
    } else {
        docker compose -f $ComposeFile up -d 2>&1 | Out-Null
    }

    Write-Info "Services started successfully"
}

# Wait for services
function Wait-ForServices {
    if ($SkipHealthCheck) {
        Write-Info "Skipping health checks"
        return
    }

    Write-Info "Waiting for services to initialize ($WaitTime seconds)..."
    Write-Info "Note: First startup may take longer due to model downloads"

    Start-Sleep -Seconds $WaitTime

    # Check ONNX Runtime health
    Write-Info "Checking ONNX Runtime health..."
    try {
        $onnxHealth = Invoke-RestMethod -Uri "http://localhost:8001/health" -TimeoutSec 5
        Write-Info "✓ ONNX Runtime is healthy"
        Write-Info "  Device: $($onnxHealth.device)"
    } catch {
        Write-Warn "✗ ONNX Runtime health check failed"
    }

    # Check Xenova health
    Write-Info "Checking Xenova/Transformers health..."
    try {
        $xenovaHealth = Invoke-RestMethod -Uri "http://localhost:8002/health" -TimeoutSec 5
        Write-Info "✓ Xenova/Transformers is healthy"
        Write-Info "  Model: $($xenovaHealth.model)"
    } catch {
        Write-Warn "✗ Xenova/Transformers health check failed"
        Write-Warn "  This may be normal during initial model download"
        Write-Warn "  Check logs: docker logs nyra-xenova-embeddings"
    }
}

# Show status
function Show-Status {
    Write-Info "Service status:"
    docker compose -f $ComposeFile ps

    Write-Host ""
    Write-Info "Service URLs:"
    Write-Host "  ONNX Runtime:         http://localhost:8001"
    Write-Host "  Xenova/Transformers:  http://localhost:8002"

    Write-Host ""
    Write-Info "View logs:"
    Write-Host "  All services:         docker compose -f $ComposeFile logs -f"
    Write-Host "  ONNX Runtime:         docker logs -f nyra-onnx-runtime"
    Write-Host "  Xenova/Transformers:  docker logs -f nyra-xenova-embeddings"

    Write-Host ""
    Write-Info "Stop services:"
    Write-Host "  docker compose -f $ComposeFile down"
}

# Main execution
Write-Info "Project Nyra - Embedding Services Startup"
Write-Host ""

Test-Prerequisites
Test-Environment
Start-EmbeddingServices
Wait-ForServices
Show-Status

Write-Host ""
Write-Info "Embedding services are ready!"
