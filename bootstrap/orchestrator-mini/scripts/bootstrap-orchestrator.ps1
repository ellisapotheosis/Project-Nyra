# Project Nyra - Orchestrator Bootstrap Script (PC1)
# Automated setup for Mac Mini orchestrator node

param(
    [string]$StaticIP = "10.0.0.1",
    [string]$TailscaleAuthKey = "",
    [switch]$SkipDocker = $false,
    [switch]$SkipTailscale = $false
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Project Nyra Orchestrator Setup" -ForegroundColor Cyan
Write-Host "  PC1: Mac Mini (No GPU)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

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
    Write-Log "Starting Docker service..." "INFO"
    Start-Service docker -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 10
}

# Step 3: Install Tailscale
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

    # Connect to Tailscale
    if ($TailscaleAuthKey) {
        Write-Log "Connecting to Tailscale network..." "INFO"
        tailscale up --authkey=$TailscaleAuthKey --accept-routes
        Write-Log "Tailscale connected" "SUCCESS"
    }
}

# Step 4: Clone Repository
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

# Step 5: Configure Environment Variables
Write-Log "Configuring environment variables..." "INFO"
$envFile = Join-Path $repoPath ".env"
if (-not (Test-Path $envFile)) {
    Copy-Item (Join-Path $repoPath "master-.env.example") $envFile
    Write-Log "Created .env file from template. IMPORTANT: Edit $envFile with your API keys!" "WARNING"
} else {
    Write-Log ".env file already exists" "SUCCESS"
}

# Step 6: Deploy Orchestrator Services
Write-Log "Deploying orchestrator services..." "INFO"
Push-Location (Join-Path $repoPath "infra")

Write-Log "Pulling Docker images..." "INFO"
docker compose -f docker-compose.orchestrator.yml pull

Write-Log "Starting services..." "INFO"
docker compose -f docker-compose.orchestrator.yml up -d

Pop-Location

# Wait for services to start
Write-Log "Waiting for services to initialize..." "INFO"
Start-Sleep -Seconds 30

# Step 7: Health Checks
Write-Log "Running health checks..." "INFO"
$services = @(
    @{Name="Nexus Router"; URL="http://localhost:6000/health"},
    @{Name="Letta"; URL="http://localhost:8283/health"},
    @{Name="Mem0"; URL="http://localhost:4321/health"},
    @{Name="Claude Flow"; URL="http://localhost:3010/health"},
    @{Name="AgentDB"; URL="http://localhost:8080/health"},
    @{Name="Redis"; URL="http://localhost:6380"}
)

$allHealthy = $true
foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Log "$($service.Name): HEALTHY" "SUCCESS"
        } else {
            Write-Log "$($service.Name): UNHEALTHY (Status: $($response.StatusCode))" "WARNING"
            $allHealthy = $false
        }
    } catch {
        Write-Log "$($service.Name): UNREACHABLE" "ERROR"
        $allHealthy = $false
    }
}

# Step 8: Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Bootstrap Complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

if ($allHealthy) {
    Write-Log "All services are healthy and running!" "SUCCESS"
} else {
    Write-Log "Some services are unhealthy. Check logs with: docker compose logs [service-name]" "WARNING"
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file with your API keys: $envFile" -ForegroundColor White
Write-Host "2. Restart services: docker compose -f infra/docker-compose.orchestrator.yml restart" -ForegroundColor White
Write-Host "3. Bootstrap worker nodes (PC2, PC3, PC4)" -ForegroundColor White
Write-Host "4. Access services:" -ForegroundColor White
Write-Host "   - Nexus Router: http://10.0.0.1:6000" -ForegroundColor White
Write-Host "   - Letta: http://10.0.0.1:8283" -ForegroundColor White
Write-Host "   - Grafana: http://10.0.0.4:3005 (after PC4 bootstrap)" -ForegroundColor White
Write-Host ""
