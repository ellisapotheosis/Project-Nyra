# Project Nyra - Worker Bootstrap Script (PC2/3/4)
# Automated setup for GPU worker nodes

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("worker-2", "worker-3", "worker-4")]
    [string]$WorkerRole,

    [string]$StaticIP,
    [string]$TailscaleAuthKey = "",
    [switch]$SkipDocker = $false,
    [switch]$SkipTailscale = $false,
    [switch]$SkipGPU = $false
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# Map worker roles to IPs and GPU models
$workerConfig = @{
    "worker-2" = @{IP="10.0.0.2"; GPU="RTX 3060 12GB"; Services="TwentyCRM, n8n, Dify"}
    "worker-3" = @{IP="10.0.0.3"; GPU="RTX 5090 32GB"; Services="Ollama, Neo4j, FalkorDB"}
    "worker-4" = @{IP="10.0.0.4"; GPU="RTX 3090 Ti 24GB"; Services="Prometheus, Grafana, Loki"}
}

$config = $workerConfig[$WorkerRole]
if (-not $StaticIP) { $StaticIP = $config.IP }

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Project Nyra Worker Setup" -ForegroundColor Cyan
Write-Host "  Role: $WorkerRole" -ForegroundColor Cyan
Write-Host "  GPU: $($config.GPU)" -ForegroundColor Cyan
Write-Host "  Services: $($config.Services)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Function to log with timestamp
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# Check administrator privileges
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Administrator)) {
    Write-Log "This script requires administrator privileges. Please run as administrator." "ERROR"
    exit 1
}

# Step 1: Configure Static IP
Write-Log "Configuring static IP: $StaticIP" "INFO"
try {
    $adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1
    if ($adapter) {
        New-NetIPAddress -InterfaceAlias $adapter.Name -IPAddress $StaticIP -PrefixLength 24 -DefaultGateway "10.0.0.1" -ErrorAction SilentlyContinue
        Set-DnsClientServerAddress -InterfaceAlias $adapter.Name -ServerAddresses ("1.1.1.1", "8.8.8.8")
        Write-Log "Static IP configured successfully" "SUCCESS"
    }
} catch {
    Write-Log "Failed to configure static IP: $_" "WARNING"
}

# Step 2: Install Docker
if (-not $SkipDocker) {
    Write-Log "Checking Docker installation..." "INFO"
    $dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue

    if (-not $dockerInstalled) {
        Write-Log "Installing Docker Desktop..." "INFO"
        $dockerUrl = "https://desktop.docker.com/win/stable/Docker%20Desktop%20Installer.exe"
        $dockerInstaller = "$env:TEMP\DockerInstaller.exe"

        Invoke-WebRequest -Uri $dockerUrl -OutFile $dockerInstaller
        Start-Process -FilePath $dockerInstaller -ArgumentList "install --quiet" -Wait
        Write-Log "Docker installed. Please restart your computer and re-run this script." "WARNING"
        exit 0
    } else {
        Write-Log "Docker already installed" "SUCCESS"
    }

    # Start Docker service
    Start-Service docker -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 10
}

# Step 3: Install NVIDIA Container Toolkit (for GPU workers)
if (-not $SkipGPU -and $WorkerRole -in @("worker-2", "worker-3", "worker-4")) {
    Write-Log "Checking GPU and NVIDIA drivers..." "INFO"

    $gpuDetected = nvidia-smi 2>$null
    if ($gpuDetected) {
        Write-Log "GPU detected successfully" "SUCCESS"

        # Install NVIDIA Container Toolkit
        Write-Log "Installing NVIDIA Container Toolkit..." "INFO"
        docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
        Write-Log "NVIDIA Container Toolkit configured" "SUCCESS"
    } else {
        Write-Log "GPU not detected. Install NVIDIA drivers from: https://www.nvidia.com/Download/index.aspx" "ERROR"
        Write-Log "After driver installation, restart and re-run this script" "WARNING"
        exit 1
    }
}

# Step 4: Install Tailscale
if (-not $SkipTailscale) {
    Write-Log "Checking Tailscale installation..." "INFO"
    $tailscaleInstalled = Get-Command tailscale -ErrorAction SilentlyContinue

    if (-not $tailscaleInstalled) {
        Write-Log "Installing Tailscale..." "INFO"
        $tailscaleUrl = "https://pkgs.tailscale.com/stable/tailscale-setup-latest.exe"
        $tailscaleInstaller = "$env:TEMP\TailscaleInstaller.exe"

        Invoke-WebRequest -Uri $tailscaleUrl -OutFile $tailscaleInstaller
        Start-Process -FilePath $tailscaleInstaller -ArgumentList "/quiet" -Wait
        Write-Log "Tailscale installed" "SUCCESS"
    } else {
        Write-Log "Tailscale already installed" "SUCCESS"
    }

    if ($TailscaleAuthKey) {
        Write-Log "Connecting to Tailscale network..." "INFO"
        tailscale up --authkey=$TailscaleAuthKey --accept-routes
        Write-Log "Tailscale connected" "SUCCESS"
    }
}

# Step 5: Clone Repository
Write-Log "Cloning Project Nyra repository..." "INFO"
$repoPath = "C:\Dev\Projects\Repos\Project-Nyra"
if (-not (Test-Path $repoPath)) {
    git clone https://github.com/yourusername/Project-Nyra.git $repoPath
    Write-Log "Repository cloned to $repoPath" "SUCCESS"
} else {
    Write-Log "Repository already exists, pulling latest changes..." "INFO"
    Push-Location $repoPath
    git pull origin main
    Pop-Location
    Write-Log "Repository updated" "SUCCESS"
}

# Step 6: Configure Environment Variables
Write-Log "Configuring environment variables..." "INFO"
$envFile = Join-Path $repoPath ".env"
if (-not (Test-Path $envFile)) {
    Copy-Item (Join-Path $repoPath "master-.env.example") $envFile
    Write-Log "Created .env file from template" "SUCCESS"
} else {
    Write-Log ".env file already exists" "SUCCESS"
}

# Step 7: Deploy Worker Services
Write-Log "Deploying $WorkerRole services..." "INFO"
Push-Location (Join-Path $repoPath "infra")

Write-Log "Pulling Docker images for $WorkerRole..." "INFO"
docker compose -f docker-compose.worker.yml --profile $WorkerRole pull

Write-Log "Starting services..." "INFO"
docker compose -f docker-compose.worker.yml --profile $WorkerRole up -d

Pop-Location

# Wait for services to start
Write-Log "Waiting for services to initialize..." "INFO"
Start-Sleep -Seconds 30

# Step 8: Worker-Specific Configuration
switch ($WorkerRole) {
    "worker-3" {
        # Pull Ollama models for LLM inference
        Write-Log "Pulling Ollama models (this may take 10-15 minutes)..." "INFO"
        docker exec ollama ollama pull llama3.1:latest
        docker exec ollama ollama pull mistral:latest
        docker exec ollama ollama pull codellama:latest
        Write-Log "Ollama models installed" "SUCCESS"
    }
    "worker-4" {
        # Configure Grafana datasources
        Write-Log "Configuring Grafana dashboards..." "INFO"
        Write-Log "Access Grafana at http://$StaticIP:3005 (default: admin/admin)" "INFO"
    }
}

# Step 9: Health Checks
Write-Log "Running health checks for $WorkerRole..." "INFO"

$serviceChecks = @{
    "worker-2" = @(
        @{Name="TwentyCRM"; URL="http://localhost:3000/health"},
        @{Name="n8n"; URL="http://localhost:5678/healthz"},
        @{Name="Dify"; URL="http://localhost:3001/health"},
        @{Name="Redis"; URL="http://localhost:6379"}
    )
    "worker-3" = @(
        @{Name="Ollama"; URL="http://localhost:11434"},
        @{Name="Neo4j"; URL="http://localhost:7474"},
        @{Name="FalkorDB"; URL="http://localhost:6379"}
    )
    "worker-4" = @(
        @{Name="Prometheus"; URL="http://localhost:9090/-/healthy"},
        @{Name="Grafana"; URL="http://localhost:3005/api/health"},
        @{Name="Loki"; URL="http://localhost:3100/ready"}
    )
}

$checks = $serviceChecks[$WorkerRole]
$allHealthy = $true

foreach ($check in $checks) {
    try {
        $response = Invoke-WebRequest -Uri $check.URL -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Log "$($check.Name): HEALTHY" "SUCCESS"
        } else {
            Write-Log "$($check.Name): UNHEALTHY (Status: $($response.StatusCode))" "WARNING"
            $allHealthy = $false
        }
    } catch {
        Write-Log "$($check.Name): UNREACHABLE" "ERROR"
        $allHealthy = $false
    }
}

# Step 10: Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Bootstrap Complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

if ($allHealthy) {
    Write-Log "All $WorkerRole services are healthy!" "SUCCESS"
} else {
    Write-Log "Some services are unhealthy. Check logs with: docker compose logs [service-name]" "WARNING"
}

Write-Host ""
Write-Host "Worker Role: $WorkerRole" -ForegroundColor Yellow
Write-Host "Static IP: $StaticIP" -ForegroundColor Yellow
Write-Host "Services: $($config.Services)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Verify connectivity to orchestrator: ping 10.0.0.1" -ForegroundColor White
Write-Host "2. Run full health check: .\scripts\health-check-all.ps1" -ForegroundColor White
Write-Host "3. Access monitoring at http://10.0.0.4:3005 (if worker-4 is running)" -ForegroundColor White
Write-Host ""
