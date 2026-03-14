# Distributed AI Infrastructure Deployment Script
# Project Nyra - Deploy local LLM infrastructure across worker PCs

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("orchestrator", "worker1", "worker2", "worker3", "all")]
    [string]$Component = "all",

    [Parameter(Mandatory=$false)]
    [switch]$SkipModelDownload,

    [Parameter(Mandatory=$false)]
    [switch]$DryRun,

    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Color output functions
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Warning { Write-ColorOutput Yellow $args }
function Write-Error { Write-ColorOutput Red $args }
function Write-Info { Write-ColorOutput Cyan $args }

. "$PSScriptRoot\lib\InfisicalToken.ps1"
$ProjectNyraInfisicalProjectId = Get-NyraInfisicalProjectId

# Main deployment function
function Deploy-DistributedAI {
    Write-Info "🚀 Starting Nyra Distributed AI Infrastructure Deployment"
    Write-Info "Component: $Component"

    # Validate environment
    Test-Environment

    # Load secrets
    Load-Secrets

    # Deploy components based on selection
    switch ($Component) {
        "orchestrator" { Deploy-Orchestrator }
        "worker1" { Deploy-Worker1 }
        "worker2" { Deploy-Worker2 }
        "worker3" { Deploy-Worker3 }
        "all" {
            Deploy-Orchestrator
            Deploy-AllWorkers
        }
    }

    # Post-deployment validation
    Test-Deployment

    Write-Success "✅ Deployment completed successfully!"
}

function Test-Environment {
    Write-Info "🔍 Validating environment..."

    # Check Docker
    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed or not in PATH"
        exit 1
    }

    # Check Docker Compose
    if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose is not installed or not in PATH"
        exit 1
    }

    # Check NVIDIA Docker runtime (for GPU workers)
    if ($Component -match "worker" -or $Component -eq "all") {
        $dockerInfo = docker info 2>$null
        if ($dockerInfo -notmatch "nvidia") {
            Write-Warning "NVIDIA Docker runtime not detected. GPU acceleration may not work."
        }
    }

    # Check required directories
    $requiredDirs = @("config", "scripts", "docs")
    foreach ($dir in $requiredDirs) {
        if (!(Test-Path $dir)) {
            Write-Error "Required directory missing: $dir"
            exit 1
        }
    }

    Write-Success "Environment validation passed"
}

function Load-Secrets {
    Write-Info "🔐 Loading secrets from Infisical..."

    if (Get-Command infisical -ErrorAction SilentlyContinue) {
        try {
            Assert-NyraInfisicalToken
            Write-Success "INFISICAL_TOKEN is available"
        } catch {
            Write-Error $_.Exception.Message
            exit 1
        }
    } else {
        Write-Warning "Infisical CLI not found. Ensure environment variables are set manually."
    }
}

function Deploy-Orchestrator {
    Write-Info "🎯 Deploying Orchestrator Node..."

    # Create orchestrator network
    Write-Info "Creating orchestrator network..."
    if ($DryRun) {
        Write-Info "[DRY RUN] Would create Docker network: nyra-orchestrator"
    } else {
        docker network create nyra-orchestrator 2>$null
    }

    # Create required directories
    $orchestratorDirs = @(
        "/app/models",
        "/app/data",
        "/app/logs",
        "/app/config"
    )

    foreach ($dir in $orchestratorDirs) {
        if ($DryRun) {
            Write-Info "[DRY RUN] Would create directory: $dir"
        } else {
            New-Item -Path $dir -ItemType Directory -Force | Out-Null
        }
    }

    # Deploy orchestrator services
    if ($DryRun) {
        Write-Info "[DRY RUN] Would run: docker-compose -f config/docker-compose.orchestrator.yml up -d"
    } else {
        Write-Info "Starting orchestrator services..."
        if (Get-Command infisical -ErrorAction SilentlyContinue) {
            & infisical run --projectId=$ProjectNyraInfisicalProjectId --env=development -- docker-compose -f config/docker-compose.orchestrator.yml up -d
        } else {
            docker-compose -f config/docker-compose.orchestrator.yml up -d
        }

        if ($LASTEXITCODE -eq 0) {
            Write-Success "Orchestrator deployed successfully"
        } else {
            Write-Error "Orchestrator deployment failed"
            exit 1
        }
    }

    # Wait for services to be ready
    if (!$DryRun) {
        Write-Info "Waiting for orchestrator services to be ready..."
        Wait-ForService "http://localhost:8000/health" "API Gateway" 120
        Wait-ForService "http://localhost:9090/-/healthy" "Prometheus" 60
        Wait-ForService "http://localhost:3000/api/health" "Grafana" 60
    }
}

function Deploy-Worker1 {
    Write-Info "💻 Deploying Worker 1 (RTX 3060 - Code Specialist)..."

    # Create worker directories
    $worker1Dirs = @(
        "/app/models/worker1",
        "/app/data/worker1",
        "/app/logs/worker1"
    )

    foreach ($dir in $worker1Dirs) {
        if ($DryRun) {
            Write-Info "[DRY RUN] Would create directory: $dir"
        } else {
            New-Item -Path $dir -ItemType Directory -Force | Out-Null
        }
    }

    # Download models if not skipped
    if (!$SkipModelDownload -and !$DryRun) {
        Download-Worker1Models
    }

    # Deploy worker 1
    if ($DryRun) {
        Write-Info "[DRY RUN] Would run: docker-compose -f config/docker-compose.worker1.yml up -d"
    } else {
        Write-Info "Starting Worker 1 services..."
        if (Get-Command infisical -ErrorAction SilentlyContinue) {
            & infisical run --projectId=$ProjectNyraInfisicalProjectId --env=development -- docker-compose -f config/docker-compose.worker1.yml up -d
        } else {
            docker-compose -f config/docker-compose.worker1.yml up -d
        }

        if ($LASTEXITCODE -eq 0) {
            Write-Success "Worker 1 deployed successfully"
        } else {
            Write-Error "Worker 1 deployment failed"
        }
    }

    if (!$DryRun) {
        Wait-ForService "http://localhost:8001/health" "Worker 1 Health Check" 180
        Wait-ForService "http://localhost:4001/health" "Worker 1 LiteLLM" 120
    }
}

function Deploy-Worker2 {
    Write-Info "🚀 Deploying Worker 2 (RTX 5090 - Reasoning Specialist)..."

    # Create worker directories
    $worker2Dirs = @(
        "/app/models/worker2",
        "/app/data/worker2",
        "/app/logs/worker2"
    )

    foreach ($dir in $worker2Dirs) {
        if ($DryRun) {
            Write-Info "[DRY RUN] Would create directory: $dir"
        } else {
            New-Item -Path $dir -ItemType Directory -Force | Out-Null
        }
    }

    # Download models if not skipped
    if (!$SkipModelDownload -and !$DryRun) {
        Download-Worker2Models
    }

    # Deploy worker 2
    if ($DryRun) {
        Write-Info "[DRY RUN] Would run: docker-compose -f config/docker-compose.worker2.yml up -d"
    } else {
        Write-Info "Starting Worker 2 services..."
        if (Get-Command infisical -ErrorAction SilentlyContinue) {
            & infisical run --projectId=$ProjectNyraInfisicalProjectId --env=development -- docker-compose -f config/docker-compose.worker2.yml up -d
        } else {
            docker-compose -f config/docker-compose.worker2.yml up -d
        }

        if ($LASTEXITCODE -eq 0) {
            Write-Success "Worker 2 deployed successfully"
        } else {
            Write-Error "Worker 2 deployment failed"
        }
    }

    if (!$DryRun) {
        Wait-ForService "http://localhost:8002/health" "Worker 2 Health Check" 300
        Wait-ForService "http://localhost:4002/health" "Worker 2 LiteLLM" 180
    }
}

function Deploy-Worker3 {
    Write-Info "🔬 Deploying Worker 3 (RTX 3090Ti - Research Specialist)..."

    # Create worker directories
    $worker3Dirs = @(
        "/app/models/worker3",
        "/app/data/worker3",
        "/app/logs/worker3"
    )

    foreach ($dir in $worker3Dirs) {
        if ($DryRun) {
            Write-Info "[DRY RUN] Would create directory: $dir"
        } else {
            New-Item -Path $dir -ItemType Directory -Force | Out-Null
        }
    }

    # Download models if not skipped
    if (!$SkipModelDownload -and !$DryRun) {
        Download-Worker3Models
    }

    # Deploy worker 3
    if ($DryRun) {
        Write-Info "[DRY RUN] Would run: docker-compose -f config/docker-compose.worker3.yml up -d"
    } else {
        Write-Info "Starting Worker 3 services..."
        if (Get-Command infisical -ErrorAction SilentlyContinue) {
            & infisical run --projectId=$ProjectNyraInfisicalProjectId --env=development -- docker-compose -f config/docker-compose.worker3.yml up -d
        } else {
            docker-compose -f config/docker-compose.worker3.yml up -d
        }

        if ($LASTEXITCODE -eq 0) {
            Write-Success "Worker 3 deployed successfully"
        } else {
            Write-Error "Worker 3 deployment failed"
        }
    }

    if (!$DryRun) {
        Wait-ForService "http://localhost:8003/health" "Worker 3 Health Check" 300
        Wait-ForService "http://localhost:4003/health" "Worker 3 LiteLLM" 180
    }
}

function Deploy-AllWorkers {
    Write-Info "🌐 Deploying all worker nodes..."
    Deploy-Worker1
    Deploy-Worker2
    Deploy-Worker3
}

function Download-Worker1Models {
    Write-Info "📥 Downloading Worker 1 models (RTX 3060)..."

    $worker1Models = @(
        "llama-3.1-8b-instruct",
        "code-llama-7b-instruct",
        "mistral-7b-instruct-v0.3"
    )

    foreach ($model in $worker1Models) {
        Write-Info "Downloading $model..."
        docker run --rm -v "/app/models/worker1:/app/models" ollama/ollama ollama pull $model
    }
}

function Download-Worker2Models {
    Write-Info "📥 Downloading Worker 2 models (RTX 5090)..."

    Write-Info "Downloading large models for Worker 2. This may take several hours..."

    $worker2Models = @(
        "huggingface.co/meta-llama/Llama-3.1-70B-Instruct",
        "huggingface.co/mistralai/Mixtral-8x22B-Instruct-v0.1",
        "huggingface.co/Qwen/Qwen2.5-72B-Instruct"
    )

    foreach ($model in $worker2Models) {
        Write-Info "Pre-downloading $model weights..."
        # Use huggingface-hub to pre-download models
        python -c "from huggingface_hub import snapshot_download; snapshot_download('$model', cache_dir='/app/models/worker2')"
    }
}

function Download-Worker3Models {
    Write-Info "📥 Downloading Worker 3 models (RTX 3090Ti)..."

    $worker3Models = @(
        "huggingface.co/meta-llama/Llama-3.1-33B-Instruct",
        "huggingface.co/Qwen/Qwen2.5-32B-Instruct",
        "huggingface.co/01-ai/Yi-34B-Chat"
    )

    foreach ($model in $worker3Models) {
        Write-Info "Pre-downloading $model weights..."
        python -c "from huggingface_hub import snapshot_download; snapshot_download('$model', cache_dir='/app/models/worker3')"
    }
}

function Wait-ForService {
    param(
        [string]$Url,
        [string]$ServiceName,
        [int]$TimeoutSeconds = 120
    )

    Write-Info "Waiting for $ServiceName to be ready..."
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    do {
        try {
            $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5 -ErrorAction Stop
            Write-Success "$ServiceName is ready!"
            return
        } catch {
            Start-Sleep -Seconds 5
        }
    } while ($stopwatch.Elapsed.TotalSeconds -lt $TimeoutSeconds)

    Write-Warning "$ServiceName is not responding after $TimeoutSeconds seconds"
}

function Test-Deployment {
    Write-Info "🧪 Running deployment validation tests..."

    if ($DryRun) {
        Write-Info "[DRY RUN] Would run deployment validation tests"
        return
    }

    # Test orchestrator
    Test-OrchestratorHealth

    # Test workers based on deployment
    if ($Component -eq "all" -or $Component -eq "worker1") {
        Test-WorkerHealth "worker1" "http://localhost:8001"
    }
    if ($Component -eq "all" -or $Component -eq "worker2") {
        Test-WorkerHealth "worker2" "http://localhost:8002"
    }
    if ($Component -eq "all" -or $Component -eq "worker3") {
        Test-WorkerHealth "worker3" "http://localhost:8003"
    }

    # Test unified API gateway
    if ($Component -eq "all" -or $Component -eq "orchestrator") {
        Test-UnifiedAPIGateway
    }
}

function Test-OrchestratorHealth {
    Write-Info "Testing orchestrator health..."

    try {
        $gatewayHealth = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 10
        Write-Success "API Gateway: $($gatewayHealth.status)"
    } catch {
        Write-Warning "API Gateway health check failed: $_"
    }

    try {
        $prometheusHealth = Invoke-RestMethod -Uri "http://localhost:9090/-/healthy" -Method Get -TimeoutSec 10
        Write-Success "Prometheus: OK"
    } catch {
        Write-Warning "Prometheus health check failed: $_"
    }
}

function Test-WorkerHealth {
    param([string]$WorkerId, [string]$BaseUrl)

    Write-Info "Testing $WorkerId health..."

    try {
        $workerHealth = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get -TimeoutSec 15
        Write-Success "${WorkerId}: $($workerHealth.status)"
    } catch {
        Write-Warning "$WorkerId health check failed: $_"
    }
}

function Test-UnifiedAPIGateway {
    Write-Info "Testing unified API gateway with sample requests..."

    $testRequests = @(
        @{
            model = "code"
            prompt = "Write a simple Python function to add two numbers"
            max_tokens = 100
        },
        @{
            model = "reasoning"
            prompt = "Explain the concept of machine learning in simple terms"
            max_tokens = 150
        }
    )

    foreach ($request in $testRequests) {
        try {
            $body = $request | ConvertTo-Json
            Write-Info "Testing model: $($request.model)"

            $response = Invoke-RestMethod -Uri "http://localhost:8000/v1/completions" `
                -Method Post `
                -Headers @{"Authorization" = "Bearer $env:LITELLM_MASTER_KEY"} `
                -ContentType "application/json" `
                -Body $body `
                -TimeoutSec 30

            Write-Success "Model $($request.model) responded successfully"
        } catch {
            Write-Warning "Model $($request.model) test failed: $_"
        }
    }
}

# Main execution
try {
    if ($Verbose) {
        $VerbosePreference = 'Continue'
    }

    Deploy-DistributedAI

} catch {
    Write-Error "Deployment failed: $_"
    exit 1
}
