<#
.SYNOPSIS
    Unified bootstrap script for Project Nyra 4-PC cluster

.DESCRIPTION
    Auto-detects PC role (orchestrator vs worker) and bootstraps the appropriate
    services. Supports Minisforum UH680 (orchestrator) and 3 worker PCs with GPUs.

.PARAMETER PCRole
    Override auto-detection. Valid values: "orchestrator", "worker-3060", "worker-3090ti", "worker-5090"

.PARAMETER SkipDocker
    Skip Docker service deployment

.PARAMETER SkipMCP
    Skip MCP server deployment

.PARAMETER SkipNexus
    Skip Nexus Router deployment

.PARAMETER Verify
    Only run verification checks, don't deploy

.EXAMPLE
    .\bootstrap.ps1
    Auto-detect PC role and bootstrap

.EXAMPLE
    .\bootstrap.ps1 -PCRole orchestrator
    Force bootstrap as orchestrator

.EXAMPLE
    .\bootstrap.ps1 -Verify
    Run verification checks only
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("orchestrator", "worker-3060", "worker-3090ti", "worker-5090")]
    [string]$PCRole,

    [switch]$SkipDocker,
    [switch]$SkipMCP,
    [switch]$SkipNexus,
    [switch]$Verify
)

# ===================================================================
# Configuration
# ===================================================================
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InfraDir = Join-Path $ScriptDir "infra"
$ConfigsDir = Join-Path $InfraDir "configs"

# PC Profiles
$PCProfiles = @{
    "orchestrator" = @{
        GPU = "None"
        Role = "Orchestration & Coordination"
        Hostname = "MINISFORUM-UH680"
        Services = @("docker", "nexus", "mcp", "redis", "postgres")
        EnvFile = Join-Path $ConfigsDir "orchestrator\.env.orchestrator"
    }
    "worker-3060" = @{
        GPU = "RTX 3060"
        Role = "Development Worker"
        Hostname = "AWM15R7"
        Services = @("docker", "ollama")
        EnvFile = Join-Path $ConfigsDir "workers\.env.worker-3060"
    }
    "worker-3090ti" = @{
        GPU = "RTX 3090Ti"
        Role = "High-Performance Worker"
        Hostname = "DESKTOP-3090TI"
        Services = @("docker", "ollama", "vllm")
        EnvFile = Join-Path $ConfigsDir "workers\.env.worker-3090ti"
    }
    "worker-5090" = @{
        GPU = "RTX 5090"
        Role = "Flagship Worker"
        Hostname = "AREA51-RTX5090"
        Services = @("docker", "ollama", "vllm")
        EnvFile = Join-Path $ConfigsDir "workers\.env.worker-5090"
    }
}

# ===================================================================
# Functions
# ===================================================================

function Write-Header {
    param([string]$Message)
    Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Test-CommandExists {
    param([string]$Command)
    return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Detect-PCRole {
    $computerName = $env:COMPUTERNAME

    foreach ($role in $PCProfiles.Keys) {
        if ($computerName -like "*$($PCProfiles[$role].Hostname)*") {
            return $role
        }
    }

    # Fallback: check for GPU
    try {
        $gpu = Get-WmiObject Win32_VideoController | Select-Object -First 1 -ExpandProperty Name
        if ($gpu -match "3060") { return "worker-3060" }
        if ($gpu -match "3090") { return "worker-3090ti" }
        if ($gpu -match "5090") { return "worker-5090" }
    }
    catch {
        Write-Warning "Could not detect GPU"
    }

    Write-Warning "Could not auto-detect PC role. Defaulting to orchestrator."
    return "orchestrator"
}

function Test-Prerequisites {
    param([string]$Role)

    Write-Header "Prerequisites Check"

    $required = @("docker", "node", "pnpm")
    $optional = @("git", "infisical", "make")

    foreach ($cmd in $required) {
        if (Test-CommandExists $cmd) {
            Write-Success "$cmd is installed"
        }
        else {
            Write-Error "$cmd is required but not installed"
            return $false
        }
    }

    foreach ($cmd in $optional) {
        if (Test-CommandExists $cmd) {
            Write-Success "$cmd is installed"
        }
        else {
            Write-Warning "$cmd is not installed (optional)"
        }
    }

    # Check Docker daemon
    try {
        docker ps > $null 2>&1
        Write-Success "Docker daemon is running"
    }
    catch {
        Write-Error "Docker daemon is not running. Please start Docker Desktop."
        return $false
    }

    return $true
}

function Setup-Environment {
    param([hashtable]$Profile)

    Write-Header "Environment Setup"

    # Check if env file exists
    if (Test-Path $Profile.EnvFile) {
        Write-Success "Environment file found: $($Profile.EnvFile)"

        # Create symlink in root
        $envLink = Join-Path $ScriptDir ".env"
        if (Test-Path $envLink) {
            Remove-Item $envLink -Force
        }

        try {
            New-Item -ItemType SymbolicLink -Path $envLink -Target $Profile.EnvFile -Force | Out-Null
            Write-Success "Created .env symlink"
        }
        catch {
            Write-Warning "Could not create symlink (requires admin). Copying file instead..."
            Copy-Item $Profile.EnvFile $envLink -Force
            Write-Success "Copied .env file"
        }
    }
    else {
        Write-Error "Environment file not found: $($Profile.EnvFile)"
        Write-Info "Please create it from the template in infra/configs/"
        return $false
    }

    return $true
}

function Deploy-DockerServices {
    param([hashtable]$Profile)

    if ($SkipDocker) {
        Write-Info "Skipping Docker services deployment"
        return $true
    }

    Write-Header "Docker Services Deployment"

    $dockerComposeFile = Join-Path $InfraDir "docker\docker-compose.yml"

    if (-not (Test-Path $dockerComposeFile)) {
        Write-Warning "Docker compose file not found: $dockerComposeFile"
        return $false
    }

    Write-Info "Starting Docker services..."
    try {
        docker-compose -f $dockerComposeFile up -d
        Write-Success "Docker services started"
        return $true
    }
    catch {
        Write-Error "Failed to start Docker services: $_"
        return $false
    }
}

function Deploy-MCPServers {
    param([hashtable]$Profile)

    if ($SkipMCP) {
        Write-Info "Skipping MCP servers deployment"
        return $true
    }

    Write-Header "MCP Servers Deployment"

    $mcpScript = Join-Path $ScriptDir "scripts\mcp\manage-mcp-servers.ps1"

    if (-not (Test-Path $mcpScript)) {
        Write-Warning "MCP management script not found: $mcpScript"
        return $false
    }

    Write-Info "Starting MCP servers..."
    try {
        & $mcpScript -Action start
        Write-Success "MCP servers started"
        return $true
    }
    catch {
        Write-Error "Failed to start MCP servers: $_"
        return $false
    }
}

function Deploy-NexusRouter {
    param([hashtable]$Profile)

    if ($SkipNexus) {
        Write-Info "Skipping Nexus Router deployment"
        return $true
    }

    # Only deploy on orchestrator
    if ($Profile.Role -ne "Orchestration & Coordination") {
        Write-Info "Nexus Router only deployed on orchestrator"
        return $true
    }

    Write-Header "Nexus Router Deployment"

    $nexusDir = Join-Path $InfraDir "docker\services\nexus-router"
    $nexusCompose = Join-Path $nexusDir "docker-compose.yml"

    if (-not (Test-Path $nexusCompose)) {
        Write-Warning "Nexus Router compose file not found: $nexusCompose"
        return $false
    }

    Write-Info "Starting Nexus Router + Redis..."
    try {
        Push-Location $nexusDir
        docker-compose up -d
        Pop-Location
        Write-Success "Nexus Router started on http://localhost:6000"
        return $true
    }
    catch {
        Pop-Location
        Write-Error "Failed to start Nexus Router: $_"
        return $false
    }
}

function Verify-Deployment {
    param([hashtable]$Profile)

    Write-Header "Deployment Verification"

    $allGood = $true

    # Check Docker services
    Write-Info "Checking Docker services..."
    $containers = docker ps --filter "name=nyra-" --format "{{.Names}}"
    if ($containers) {
        Write-Success "Docker services running: $($containers.Count) containers"
    }
    else {
        Write-Warning "No Docker services running"
        $allGood = $false
    }

    # Check Nexus Router (orchestrator only)
    if ($Profile.Role -eq "Orchestration & Coordination") {
        Write-Info "Checking Nexus Router..."
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:6000/health" -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "Nexus Router is healthy"
            }
        }
        catch {
            Write-Warning "Nexus Router not responding"
            $allGood = $false
        }
    }

    # Check .env
    $envPath = Join-Path $ScriptDir ".env"
    if (Test-Path $envPath) {
        Write-Success ".env file configured"
    }
    else {
        Write-Warning ".env file not found"
        $allGood = $false
    }

    if ($allGood) {
        Write-Success "`nAll verification checks passed! ✨"
    }
    else {
        Write-Warning "`nSome verification checks failed. Review the output above."
    }

    return $allGood
}

# ===================================================================
# Main Execution
# ===================================================================

Write-Header "Project Nyra Bootstrap"

# Detect or use specified PC role
if (-not $PCRole) {
    $PCRole = Detect-PCRole
    Write-Info "Auto-detected PC role: $PCRole"
}
else {
    Write-Info "Using specified PC role: $PCRole"
}

$profile = $PCProfiles[$PCRole]

Write-Info "Computer: $env:COMPUTERNAME"
Write-Info "Role: $($profile.Role)"
Write-Info "GPU: $($profile.GPU)"
Write-Info "Services: $($profile.Services -join ', ')"
Write-Host ""

# Run prerequisites check
if (-not (Test-Prerequisites -Role $PCRole)) {
    Write-Error "Prerequisites check failed. Please install missing dependencies."
    exit 1
}

# If verify-only mode, run verification and exit
if ($Verify) {
    Verify-Deployment -Profile $profile
    exit 0
}

# Setup environment
if (-not (Setup-Environment -Profile $profile)) {
    Write-Error "Environment setup failed"
    exit 1
}

# Deploy services based on PC role
$deploymentSuccess = $true

# Docker services
if (-not (Deploy-DockerServices -Profile $profile)) {
    $deploymentSuccess = $false
}

# MCP servers (orchestrator only)
if ($profile.Role -eq "Orchestration & Coordination") {
    if (-not (Deploy-MCPServers -Profile $profile)) {
        $deploymentSuccess = $false
    }
}

# Nexus Router (orchestrator only)
if ($profile.Role -eq "Orchestration & Coordination") {
    if (-not (Deploy-NexusRouter -Profile $profile)) {
        $deploymentSuccess = $false
    }
}

# Verify deployment
Start-Sleep -Seconds 10
Verify-Deployment -Profile $profile

# Final summary
Write-Header "Bootstrap Complete"

if ($deploymentSuccess) {
    Write-Success "Bootstrap completed successfully!"
    Write-Info ""
    Write-Info "Next steps:"

    if ($profile.Role -eq "Orchestration & Coordination") {
        Write-Info "  • Access Nexus Router: http://localhost:6000"
        Write-Info "  • View MCP servers: .\scripts\mcp\manage-mcp-servers.ps1 -Action status"
        Write-Info "  • Check infrastructure: make infra-status"
    }
    else {
        Write-Info "  • Configure connection to orchestrator"
        Write-Info "  • Start local LLM services (Ollama/vLLM)"
        Write-Info "  • Test GPU availability"
    }

    Write-Info "  • View logs: docker-compose logs -f"
    Write-Info "  • Full status: make infra-status"
}
else {
    Write-Warning "Bootstrap completed with warnings. Review the output above."
}

Write-Host ""
Write-Info "For help: Get-Help .\bootstrap.ps1 -Detailed"
