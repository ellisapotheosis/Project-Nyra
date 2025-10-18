#!/usr/bin/env pwsh
<#
.SYNOPSIS
    🧠 NYRA Memory Stack Startup Script
    
.DESCRIPTION
    Starts the complete NYRA Memory Stack including:
    - Qdrant (vector store) with MCP connector
    - Neo4j (graph database) with Graphiti MCP
    - OpenMemory (dev memory bus)
    - MetaMCP (orchestration layer)
    - Optional: vLLM (local model server)
    
.PARAMETER WithModels
    Include local vLLM model server for on-premises inference
    
.PARAMETER Recreate
    Recreate all containers (equivalent to docker-compose up --force-recreate)
    
.PARAMETER ShowLogs
    Display container logs after startup
    
.EXAMPLE
    .\Start-NYRAMemory.ps1
    .\Start-NYRAMemory.ps1 -WithModels
    .\Start-NYRAMemory.ps1 -Recreate -ShowLogs
#>

[CmdletBinding()]
param(
    [switch]$WithModels,
    [switch]$Recreate,
    [switch]$ShowLogs,
    [switch]$Verbose
)

# Script configuration
$ScriptRoot = $PSScriptRoot
$ProjectRoot = Split-Path -Path $ScriptRoot -Parent
$DeploymentPath = Join-Path $ProjectRoot "deployment"
$MemoryCompose = Join-Path $DeploymentPath "docker-compose.memory.yml"
$ModelCompose = Join-Path $DeploymentPath "docker-compose.model.yml"
$EnvFile = Join-Path $ProjectRoot ".env"

function Write-MemoryLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        "INFO" { "Cyan" }
        default { "White" }
    }
    Write-Host "🧠 [$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-Prerequisites {
    Write-MemoryLog "Checking prerequisites..." "INFO"
    
    # Check Docker
    try {
        $dockerVersion = docker --version
        Write-MemoryLog "Docker found: $dockerVersion" "SUCCESS"
    }
    catch {
        Write-MemoryLog "Docker is not installed or not in PATH" "ERROR"
        return $false
    }
    
    # Check Docker Compose
    try {
        $composeVersion = docker compose version
        Write-MemoryLog "Docker Compose found: $composeVersion" "SUCCESS"
    }
    catch {
        Write-MemoryLog "Docker Compose is not available" "ERROR"
        return $false
    }
    
    # Check if Docker daemon is running
    try {
        docker ps | Out-Null
        Write-MemoryLog "Docker daemon is running" "SUCCESS"
    }
    catch {
        Write-MemoryLog "Docker daemon is not running. Please start Docker Desktop." "ERROR"
        return $false
    }
    
    return $true
}

function Test-EnvironmentFile {
    Write-MemoryLog "Checking environment configuration..." "INFO"
    
    if (-not (Test-Path $EnvFile)) {
        $envExample = Join-Path $ProjectRoot ".env.example"
        if (Test-Path $envExample) {
            Write-MemoryLog "Creating .env from .env.example..." "INFO"
            Copy-Item $envExample $EnvFile
            Write-MemoryLog "Please edit .env file with your API keys before continuing" "WARN"
            
            # Open .env file for editing
            if (Get-Command code -ErrorAction SilentlyContinue) {
                code $EnvFile
            }
            elseif (Get-Command notepad -ErrorAction SilentlyContinue) {
                notepad $EnvFile
            }
            
            return $false
        }
        else {
            Write-MemoryLog ".env file not found and no .env.example available" "ERROR"
            return $false
        }
    }
    
    # Validate required environment variables
    $envContent = Get-Content $EnvFile
    $requiredVars = @("OPENAI_API_KEY", "NEO4J_PASSWORD")
    $missingVars = @()
    
    foreach ($var in $requiredVars) {
        $found = $envContent | Where-Object { $_ -match "^$var=" -and $_ -notmatch "=\s*$" }
        if (-not $found) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-MemoryLog "Missing required environment variables: $($missingVars -join ', ')" "ERROR"
        Write-MemoryLog "Please edit .env file and set these values" "ERROR"
        return $false
    }
    
    Write-MemoryLog "Environment configuration is valid" "SUCCESS"
    return $true
}

function Start-MemoryServices {
    Write-MemoryLog "Starting NYRA Memory Stack services..." "INFO"
    
    $composeArgs = @("compose", "-f", $MemoryCompose, "up", "-d")
    if ($Recreate) {
        $composeArgs += "--force-recreate"
    }
    
    try {
        & docker @composeArgs
        Write-MemoryLog "Memory services started successfully" "SUCCESS"
        return $true
    }
    catch {
        Write-MemoryLog "Failed to start memory services: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Start-ModelServices {
    if (-not $WithModels) {
        return $true
    }
    
    Write-MemoryLog "Starting local model services (vLLM)..." "INFO"
    
    $composeArgs = @("compose", "-f", $ModelCompose, "up", "-d")
    if ($Recreate) {
        $composeArgs += "--force-recreate"
    }
    
    try {
        & docker @composeArgs
        Write-MemoryLog "Model services started successfully" "SUCCESS"
        return $true
    }
    catch {
        Write-MemoryLog "Failed to start model services: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Wait-ForServices {
    Write-MemoryLog "Waiting for services to initialize..." "INFO"
    
    $services = @{
        "Qdrant" = "http://localhost:6333/collections"
        "Neo4j" = "http://localhost:7474"
        "MetaMCP" = "http://localhost:12008"
        "OpenMemory" = "http://localhost:3000"
    }
    
    if ($WithModels) {
        $services["vLLM"] = "http://localhost:8000/v1/models"
    }
    
    Start-Sleep -Seconds 5  # Initial wait for containers to start
    
    foreach ($service in $services.Keys) {
        $url = $services[$service]
        $maxAttempts = 30
        $attempt = 0
        $ready = $false
        
        Write-MemoryLog "Checking $service availability..." "INFO"
        
        while (-not $ready -and $attempt -lt $maxAttempts) {
            try {
                $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
                if ($response.StatusCode -lt 400) {
                    $ready = $true
                    Write-MemoryLog "$service is ready" "SUCCESS"
                }
            }
            catch {
                # Service not ready yet
            }
            
            if (-not $ready) {
                $attempt++
                Start-Sleep -Seconds 2
                if ($attempt % 10 -eq 0) {
                    Write-MemoryLog "Still waiting for $service... ($attempt/$maxAttempts)" "WARN"
                }
            }
        }
        
        if (-not $ready) {
            Write-MemoryLog "$service failed to become ready within timeout" "ERROR"
        }
    }
}

function Show-ServiceStatus {
    Write-MemoryLog "NYRA Memory Stack Status:" "INFO"
    Write-Host "`n" + "🧠" * 60 -ForegroundColor Purple
    Write-Host "    NYRA Memory Stack - Service Endpoints" -ForegroundColor Purple
    Write-Host "🧠" * 60 -ForegroundColor Purple
    
    $endpoints = @(
        @{ Name = "Qdrant Vector Store"; URL = "http://localhost:6333"; Description = "Vector database dashboard" }
        @{ Name = "Neo4j Graph Database"; URL = "http://localhost:7474"; Description = "Graph database browser" }
        @{ Name = "Graphiti MCP (SSE)"; URL = "http://localhost:7459/sse"; Description = "Knowledge graph MCP endpoint" }
        @{ Name = "OpenMemory UI"; URL = "http://localhost:3000"; Description = "Memory management interface" }
        @{ Name = "OpenMemory API"; URL = "http://localhost:8765/docs"; Description = "Memory API documentation" }
        @{ Name = "MetaMCP Dashboard"; URL = "http://localhost:12008"; Description = "Memory orchestration UI" }
    )
    
    if ($WithModels) {
        $endpoints += @{ Name = "vLLM API"; URL = "http://localhost:8000/v1/"; Description = "Local model inference" }
    }
    
    foreach ($endpoint in $endpoints) {
        Write-Host "`n🔗 $($endpoint.Name)" -ForegroundColor Cyan
        Write-Host "   URL: $($endpoint.URL)" -ForegroundColor White
        Write-Host "   $($endpoint.Description)" -ForegroundColor Gray
    }
    
    Write-Host "`n📋 Client Configuration:" -ForegroundColor Yellow
    Write-Host "   MCP Endpoint: http://localhost:12008/metamcp/nyra-core/sse" -ForegroundColor White
    Write-Host "   API Key: nyra-local-key" -ForegroundColor White
    
    Write-Host "`n🎯 Quick Commands:" -ForegroundColor Yellow
    Write-Host "   View Logs:    docker logs nyra-graphiti-mcp" -ForegroundColor Gray
    Write-Host "   Stop Stack:   docker compose -f deployment/docker-compose.memory.yml down" -ForegroundColor Gray
    Write-Host "   Reset Data:   docker compose -f deployment/docker-compose.memory.yml down -v" -ForegroundColor Gray
}

function Show-ContainerLogs {
    if (-not $ShowLogs) {
        return
    }
    
    Write-MemoryLog "Displaying recent container logs..." "INFO"
    
    $containers = @("nyra-graphiti-mcp", "nyra-qdrant-mcp", "nyra-openmemory", "nyra-metamcp")
    
    foreach ($container in $containers) {
        Write-Host "`n" + "="*50 -ForegroundColor Gray
        Write-Host "📋 Logs for $container" -ForegroundColor Cyan
        Write-Host "="*50 -ForegroundColor Gray
        
        try {
            docker logs --tail 10 $container
        }
        catch {
            Write-MemoryLog "Could not retrieve logs for $container" "WARN"
        }
    }
}

# Main execution
Write-MemoryLog "Starting NYRA Memory Stack..." "INFO"

if (-not (Test-Prerequisites)) {
    Write-MemoryLog "Prerequisites not met. Exiting." "ERROR"
    exit 1
}

if (-not (Test-EnvironmentFile)) {
    Write-MemoryLog "Environment configuration incomplete. Exiting." "ERROR"
    exit 1
}

if (-not (Start-MemoryServices)) {
    Write-MemoryLog "Failed to start memory services. Exiting." "ERROR"
    exit 1
}

if (-not (Start-ModelServices)) {
    Write-MemoryLog "Failed to start model services. Exiting." "ERROR"
    exit 1
}

Wait-ForServices
Show-ServiceStatus
Show-ContainerLogs

Write-MemoryLog "NYRA Memory Stack is ready! 🧠" "SUCCESS"