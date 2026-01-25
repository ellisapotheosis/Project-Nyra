# =============================================================================
# ORCHESTRATOR MINI PC - Quick Start Script
# =============================================================================
# Automated setup for the orchestrator node
# Run as Administrator in PowerShell
# =============================================================================

param(
    [switch]$SkipSoftwareInstall = $false,
    [switch]$SkipTailscale = $false,
    [switch]$SkipCloudflare = $false
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Project Nyra - Orchestrator Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: Please run as Administrator!" -ForegroundColor Red
    exit 1
}

# =============================================================================
# 1. INSTALL BASE SOFTWARE
# =============================================================================

if (-not $SkipSoftwareInstall) {
    Write-Host "[1/7] Installing base software..." -ForegroundColor Green

    # Install Scoop
    if (-not (Get-Command scoop -ErrorAction SilentlyContinue)) {
        Write-Host "Installing Scoop package manager..."
        Invoke-RestMethod get.scoop.sh | Invoke-Expression
    }

    # Install tools
    Write-Host "Installing Git, Docker, Docker Compose..."
    scoop install git docker docker-compose

    # Install Tailscale
    if (-not (Get-Command tailscale -ErrorAction SilentlyContinue)) {
        Write-Host "Installing Tailscale..."
        winget install Tailscale.Tailscale --silent --accept-package-agreements
    }

    # Install Cloudflared
    if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
        Write-Host "Installing Cloudflared..."
        winget install Cloudflare.cloudflared --silent --accept-package-agreements
    }

    Write-Host "✓ Base software installed" -ForegroundColor Green
}

# =============================================================================
# 2. CONFIGURE DOCKER
# =============================================================================

Write-Host "[2/7] Configuring Docker..." -ForegroundColor Green

# Enable WSL2
wsl --install --no-launch
wsl --set-default-version 2

Write-Host "✓ Docker configured (restart may be required)" -ForegroundColor Green

# =============================================================================
# 3. SETUP PROJECT DIRECTORY
# =============================================================================

Write-Host "[3/7] Setting up project directory..." -ForegroundColor Green

$ProjectRoot = "C:\Dev\Projects\Repos\Project-Nyra"
$OrchestratorDir = "$ProjectRoot\infra\docker\claude-flow\orchestrator"

if (-not (Test-Path $OrchestratorDir)) {
    Write-Host "ERROR: Project directory not found: $OrchestratorDir" -ForegroundColor Red
    exit 1
}

Set-Location $OrchestratorDir

# Copy environment template if .env doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..."
    Copy-Item ".env.template" ".env"
    Write-Host "IMPORTANT: Please edit .env file with your actual values!" -ForegroundColor Yellow
    notepad .env
    Read-Host "Press Enter when you've finished editing .env"
} else {
    Write-Host ".env file already exists" -ForegroundColor Yellow
}

Write-Host "✓ Project directory configured" -ForegroundColor Green

# =============================================================================
# 4. SETUP TAILSCALE
# =============================================================================

if (-not $SkipTailscale) {
    Write-Host "[4/7] Setting up Tailscale..." -ForegroundColor Green

    # Start Tailscale
    tailscale up

    # Set hostname
    tailscale set --hostname orchestrator-mini

    Write-Host "✓ Tailscale configured" -ForegroundColor Green
    Write-Host "Your Tailscale hostname: orchestrator-mini.tail-net.ts.net" -ForegroundColor Cyan
}

# =============================================================================
# 5. SETUP CLOUDFLARE TUNNEL
# =============================================================================

if (-not $SkipCloudflare) {
    Write-Host "[5/7] Setting up Cloudflare Tunnel..." -ForegroundColor Green

    # Authenticate
    Write-Host "Opening browser for Cloudflare authentication..."
    cloudflared tunnel login

    # Create tunnel
    Write-Host "Creating Cloudflare tunnel..."
    $TunnelOutput = cloudflared tunnel create nyra-mortgage-platform
    Write-Host $TunnelOutput

    # Extract tunnel ID (you may need to edit config manually)
    Write-Host "IMPORTANT: Note your Tunnel ID and update .cloudflared/config.yml" -ForegroundColor Yellow

    # Create DNS records
    Write-Host "Creating DNS records..."
    cloudflared tunnel route dns nyra-mortgage-platform ratehunter.net
    cloudflared tunnel route dns nyra-mortgage-platform app.ratehunter.net
    cloudflared tunnel route dns nyra-mortgage-platform crm.ratehunter.net
    cloudflared tunnel route dns nyra-mortgage-platform api.ratehunter.net
    cloudflared tunnel route dns nyra-mortgage-platform metrics.ratehunter.net

    # Install as service
    Write-Host "Installing Cloudflare tunnel as Windows service..."
    cloudflared service install

    Write-Host "✓ Cloudflare tunnel configured" -ForegroundColor Green
}

# =============================================================================
# 6. INITIALIZE DATABASES
# =============================================================================

Write-Host "[6/7] Initializing databases..." -ForegroundColor Green

# Make init script executable in WSL
wsl chmod +x ./init-multiple-databases.sh

# Start PostgreSQL first
Write-Host "Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL to be healthy
Write-Host "Waiting for PostgreSQL to initialize..."
$timeout = 60
$elapsed = 0
while ($elapsed -lt $timeout) {
    $health = docker inspect --format='{{.State.Health.Status}}' nyra-postgres 2>$null
    if ($health -eq "healthy") {
        Write-Host "✓ PostgreSQL is healthy" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 2
    $elapsed += 2
    Write-Host "." -NoNewline
}
Write-Host ""

if ($elapsed -ge $timeout) {
    Write-Host "WARNING: PostgreSQL health check timeout" -ForegroundColor Yellow
}

# Verify databases
Write-Host "Verifying databases..."
docker exec nyra-postgres psql -U nyra_admin -d postgres -c "\l"

Write-Host "✓ Databases initialized" -ForegroundColor Green

# =============================================================================
# 7. DEPLOY ALL SERVICES
# =============================================================================

Write-Host "[7/7] Deploying all services..." -ForegroundColor Green

# Pull all images
Write-Host "Pulling Docker images..."
docker-compose pull

# Start all services
Write-Host "Starting all services..."
docker-compose up -d

# Wait for services to be healthy
Write-Host "Waiting for services to start..."
Start-Sleep -Seconds 30

# Check service status
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host "✓ All services deployed" -ForegroundColor Green

# =============================================================================
# COMPLETION
# =============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Orchestrator Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎉 Next Steps:" -ForegroundColor Green
Write-Host "1. Verify services are healthy: docker-compose ps" -ForegroundColor White
Write-Host "2. Access Grafana: http://localhost:3005" -ForegroundColor White
Write-Host "3. Access Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "4. Test Nexus Router: curl http://localhost:6000/health" -ForegroundColor White
Write-Host "5. Setup GPU workers (run quick-start scripts on each worker PC)" -ForegroundColor White
Write-Host "6. Deploy TwentyCRM: See TWENTYCRM-SETUP.md" -ForegroundColor White
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "- Deployment Guide: DEPLOYMENT-GUIDE.md" -ForegroundColor White
Write-Host "- TwentyCRM Setup: TWENTYCRM-SETUP.md" -ForegroundColor White
Write-Host "- Config Summary: docs/claude-flow-v3-config-summary.md" -ForegroundColor White
Write-Host ""

Write-Host "🔗 Tailscale Hostname: orchestrator-mini.tail-net.ts.net" -ForegroundColor Cyan
Write-Host ""

# Prompt to view logs
$ViewLogs = Read-Host "Would you like to view service logs? (y/n)"
if ($ViewLogs -eq "y") {
    docker-compose logs -f
}
