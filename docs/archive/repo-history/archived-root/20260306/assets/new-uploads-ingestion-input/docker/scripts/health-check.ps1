# PowerShell Script: Health Check All Services
# Description: Comprehensive health check for orchestrator and worker services

param(
    [switch]$Orchestrator,
    [switch]$Worker,
    [switch]$All,
    [switch]$Verbose,
    [switch]$Json
)

$ErrorActionPreference = "Stop"

# Color output functions
function Write-Success { if (-not $Json) { Write-Host $args -ForegroundColor Green } }
function Write-Error { if (-not $Json) { Write-Host $args -ForegroundColor Red } }
function Write-Info { if (-not $Json) { Write-Host $args -ForegroundColor Cyan } }
function Write-Warning { if (-not $Json) { Write-Host $args -ForegroundColor Yellow } }

# Health check results
$script:healthResults = @{
    timestamp = Get-Date -Format "o"
    orchestrator = @{}
    worker = @{}
    overall = $true
}

# Check HTTP endpoint
function Test-HttpEndpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$TimeoutSeconds = 5
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSeconds -ErrorAction Stop
        $healthy = $response.StatusCode -eq 200

        if ($Verbose) {
            Write-Info "  $Name - Status: $($response.StatusCode) - Response time: $($response.Headers['X-Response-Time'])"
        }

        return @{
            healthy = $healthy
            status = $response.StatusCode
            message = "OK"
        }
    } catch {
        if ($Verbose) {
            Write-Warning "  $Name - FAILED: $_"
        }

        return @{
            healthy = $false
            status = 0
            message = $_.Exception.Message
        }
    }
}

# Check Docker container
function Test-Container {
    param(
        [string]$Name
    )

    try {
        $status = docker inspect --format='{{.State.Status}}' $Name 2>&1
        $health = docker inspect --format='{{.State.Health.Status}}' $Name 2>&1

        if ($status -eq "running") {
            if ($health -eq "healthy" -or $health -eq "<nil>") {
                return @{
                    healthy = $true
                    status = "running"
                    health = if ($health -eq "<nil>") { "no-check" } else { $health }
                    message = "OK"
                }
            } else {
                return @{
                    healthy = $false
                    status = "running"
                    health = $health
                    message = "Unhealthy"
                }
            }
        } else {
            return @{
                healthy = $false
                status = $status
                health = "n/a"
                message = "Not running"
            }
        }
    } catch {
        return @{
            healthy = $false
            status = "not-found"
            health = "n/a"
            message = "Container not found"
        }
    }
}

# Check PostgreSQL
function Test-PostgreSQL {
    param([string]$ContainerName)

    Write-Info "Checking PostgreSQL..."

    $containerCheck = Test-Container -Name $ContainerName
    $result = @{
        container = $containerCheck
        databases = @{}
    }

    if ($containerCheck.healthy) {
        try {
            $databases = docker exec $ContainerName psql -U admin -lqt | Select-String -Pattern "^\s*\w+" | ForEach-Object { $_.Line.Trim().Split('|')[0].Trim() }
            foreach ($db in $databases) {
                $result.databases[$db] = "exists"
            }
            Write-Success "  ✓ PostgreSQL is healthy ($($databases.Count) databases)"
        } catch {
            Write-Warning "  ⚠ PostgreSQL running but query failed"
        }
    } else {
        Write-Error "  ✗ PostgreSQL is not healthy"
        $script:healthResults.overall = $false
    }

    return $result
}

# Check Redis
function Test-Redis {
    param([string]$ContainerName)

    Write-Info "Checking Redis..."

    $containerCheck = Test-Container -Name $ContainerName
    $result = @{
        container = $containerCheck
        info = @{}
    }

    if ($containerCheck.healthy) {
        try {
            $info = docker exec $ContainerName redis-cli INFO stats | Out-String
            $result.info = @{
                connected = $true
                stats = $info
            }
            Write-Success "  ✓ Redis is healthy"
        } catch {
            Write-Warning "  ⚠ Redis running but command failed"
        }
    } else {
        Write-Error "  ✗ Redis is not healthy"
        $script:healthResults.overall = $false
    }

    return $result
}

# Check Ollama
function Test-Ollama {
    Write-Info "Checking Ollama..."

    $apiCheck = Test-HttpEndpoint -Name "Ollama API" -Url "http://localhost:11434/api/tags"
    $result = @{
        api = $apiCheck
        models = @()
    }

    if ($apiCheck.healthy) {
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags"
            $result.models = $response.models | ForEach-Object { $_.name }
            Write-Success "  ✓ Ollama is healthy ($($result.models.Count) models)"
        } catch {
            Write-Warning "  ⚠ Ollama API issue"
        }
    } else {
        Write-Error "  ✗ Ollama is not healthy"
        $script:healthResults.overall = $false
    }

    return $result
}

# Check GPU
function Test-GPU {
    Write-Info "Checking GPU..."

    try {
        $gpuInfo = nvidia-smi --query-gpu=index,name,temperature.gpu,utilization.gpu,memory.used,memory.total --format=csv,noheader 2>&1

        if ($LASTEXITCODE -eq 0) {
            $gpus = @()
            $gpuInfo -split "`n" | ForEach-Object {
                if ($_.Trim()) {
                    $parts = $_ -split ","
                    $gpus += @{
                        index = $parts[0].Trim()
                        name = $parts[1].Trim()
                        temperature = $parts[2].Trim()
                        utilization = $parts[3].Trim()
                        memory_used = $parts[4].Trim()
                        memory_total = $parts[5].Trim()
                    }
                }
            }

            Write-Success "  ✓ GPU detected ($($gpus.Count) device(s))"

            return @{
                available = $true
                devices = $gpus
            }
        } else {
            Write-Warning "  ⚠ GPU not available"
            return @{
                available = $false
                message = "nvidia-smi failed"
            }
        }
    } catch {
        Write-Warning "  ⚠ GPU check failed: $_"
        return @{
            available = $false
            message = $_.Exception.Message
        }
    }
}

# Check orchestrator services
function Test-OrchestratorServices {
    Write-Info "`n=== Checking Orchestrator Services ==="

    $services = @{
        postgres = Test-PostgreSQL -ContainerName "orchestrator-postgres"
        redis = Test-Redis -ContainerName "orchestrator-redis"
        minio = Test-HttpEndpoint -Name "MinIO" -Url "http://localhost:9000/minio/health/live"
        open_webui = Test-HttpEndpoint -Name "Open-WebUI" -Url "http://localhost:3000/health"
        lobechat = Test-HttpEndpoint -Name "LobeChat" -Url "http://localhost:3210/api/health"
        grafana = Test-HttpEndpoint -Name "Grafana" -Url "http://localhost:3001/api/health"
        prometheus = Test-HttpEndpoint -Name "Prometheus" -Url "http://localhost:9090/-/healthy"
        nginx = Test-HttpEndpoint -Name "Nginx" -Url "http://localhost/health"
    }

    $script:healthResults.orchestrator = $services

    $healthyCount = ($services.Values | Where-Object { $_.healthy -or $_.container.healthy }).Count
    $totalCount = $services.Count

    Write-Info "`nOrchestrator: $healthyCount/$totalCount services healthy"

    return $services
}

# Check worker services
function Test-WorkerServices {
    Write-Info "`n=== Checking Worker Services ==="

    $services = @{
        gpu = Test-GPU
        ollama = Test-Ollama
        redis = Test-Redis -ContainerName "worker-redis"
        prometheus = Test-HttpEndpoint -Name "Prometheus" -Url "http://localhost:9090/-/healthy"
        nvidia_exporter = Test-HttpEndpoint -Name "NVIDIA Exporter" -Url "http://localhost:9835/metrics"
    }

    $script:healthResults.worker = $services

    $healthyCount = ($services.Values | Where-Object { $_.healthy -or $_.available }).Count
    $totalCount = $services.Count

    Write-Info "`nWorker: $healthyCount/$totalCount services healthy"

    return $services
}

# Generate report
function Show-Report {
    if ($Json) {
        $script:healthResults | ConvertTo-Json -Depth 10
    } else {
        Write-Info "`n=== Health Check Summary ==="

        if ($script:healthResults.overall) {
            Write-Success "✓ All services are healthy"
        } else {
            Write-Warning "⚠ Some services are not healthy"
        }

        Write-Info "`nFor detailed JSON output, use -Json parameter"
    }
}

# Main execution
function Main {
    Write-Info "=== Docker Infrastructure Health Check ==="
    Write-Info "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

    if ($All -or (-not $Orchestrator -and -not $Worker)) {
        Test-OrchestratorServices
        Test-WorkerServices
    } else {
        if ($Orchestrator) {
            Test-OrchestratorServices
        }
        if ($Worker) {
            Test-WorkerServices
        }
    }

    Show-Report
}

# Run main function
try {
    Main
} catch {
    Write-Error "Health check error: $_"
    exit 1
}
