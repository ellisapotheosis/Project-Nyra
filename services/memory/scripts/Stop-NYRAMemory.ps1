#!/usr/bin/env pwsh
<#
.SYNOPSIS
    🧠 NYRA Memory Stack Stop Script
    
.DESCRIPTION
    Stops the NYRA Memory Stack services gracefully, with options for
    data preservation or complete cleanup.
    
.PARAMETER RemoveData
    Remove all persistent data volumes (destructive operation)
    
.PARAMETER RemoveImages
    Also remove Docker images after stopping containers
    
.PARAMETER Force
    Force stop containers without graceful shutdown
    
.EXAMPLE
    .\Stop-NYRAMemory.ps1
    .\Stop-NYRAMemory.ps1 -RemoveData
    .\Stop-NYRAMemory.ps1 -Force -RemoveImages
#>

[CmdletBinding()]
param(
    [switch]$RemoveData,
    [switch]$RemoveImages,
    [switch]$Force,
    [switch]$Verbose
)

# Script configuration
$ScriptRoot = $PSScriptRoot
$ProjectRoot = Split-Path -Path $ScriptRoot -Parent
$DeploymentPath = Join-Path $ProjectRoot "deployment"
$MemoryCompose = Join-Path $DeploymentPath "docker-compose.memory.yml"
$ModelCompose = Join-Path $DeploymentPath "docker-compose.model.yml"

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

function Stop-Services {
    param([string]$ComposeFile, [string]$ServiceType)
    
    if (-not (Test-Path $ComposeFile)) {
        Write-MemoryLog "$ServiceType compose file not found: $ComposeFile" "WARN"
        return $true
    }
    
    Write-MemoryLog "Stopping $ServiceType services..." "INFO"
    
    try {
        $composeArgs = @("compose", "-f", $ComposeFile, "down")
        
        if ($RemoveData) {
            $composeArgs += "-v"
            Write-MemoryLog "Will remove data volumes for $ServiceType" "WARN"
        }
        
        if ($Force) {
            # Add timeout for force stop
            $composeArgs += "--timeout", "5"
        }
        
        & docker @composeArgs
        Write-MemoryLog "$ServiceType services stopped successfully" "SUCCESS"
        return $true
    }
    catch {
        Write-MemoryLog "Failed to stop $ServiceType services: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Remove-NYRAImages {
    if (-not $RemoveImages) {
        return
    }
    
    Write-MemoryLog "Removing NYRA container images..." "INFO"
    
    $nyraImages = @(
        "ghcr.io/getzep/graphiti-mcp:latest",
        "ghcr.io/qdrant/mcp-server-qdrant:latest", 
        "ghcr.io/mem0ai/openmemory:latest",
        "ghcr.io/metatool-ai/metamcp:latest",
        "vllm/vllm-openai:latest",
        "qdrant/qdrant:latest",
        "neo4j:5-community"
    )
    
    foreach ($image in $nyraImages) {
        try {
            $exists = docker images -q $image
            if ($exists) {
                docker rmi $image
                Write-MemoryLog "Removed image: $image" "SUCCESS"
            }
        }
        catch {
            Write-MemoryLog "Could not remove image $image" "WARN"
        }
    }
}

function Show-CleanupSummary {
    Write-MemoryLog "NYRA Memory Stack Cleanup Summary:" "INFO"
    
    # Check for remaining containers
    try {
        $nyraContainers = docker ps -a --filter "name=nyra-*" --format "{{.Names}}: {{.Status}}"
        if ($nyraContainers) {
            Write-Host "`n🐳 Remaining NYRA containers:" -ForegroundColor Yellow
            $nyraContainers | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        } else {
            Write-Host "`n✅ All NYRA containers removed" -ForegroundColor Green
        }
    }
    catch {
        Write-MemoryLog "Could not check container status" "WARN"
    }
    
    # Check for remaining volumes
    if ($RemoveData) {
        try {
            $nyraVolumes = docker volume ls --filter "name=nyra" --format "{{.Name}}"
            if ($nyraVolumes) {
                Write-Host "`n💾 Remaining NYRA volumes:" -ForegroundColor Yellow
                $nyraVolumes | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
            } else {
                Write-Host "`n✅ All NYRA data volumes removed" -ForegroundColor Green
            }
        }
        catch {
            Write-MemoryLog "Could not check volume status" "WARN"
        }
    }
    
    # Check for remaining images
    if ($RemoveImages) {
        try {
            $nyraImages = docker images --filter "reference=*nyra*" --filter "reference=*qdrant*" --filter "reference=*graphiti*" --filter "reference=*openmemory*" --filter "reference=*metamcp*" --format "{{.Repository}}:{{.Tag}}"
            if ($nyraImages) {
                Write-Host "`n📦 Remaining NYRA images:" -ForegroundColor Yellow
                $nyraImages | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
            } else {
                Write-Host "`n✅ All NYRA images removed" -ForegroundColor Green
            }
        }
        catch {
            Write-MemoryLog "Could not check image status" "WARN"
        }
    }
}

# Main execution
Write-MemoryLog "Stopping NYRA Memory Stack..." "INFO"

if ($RemoveData) {
    Write-Host "`n⚠️  WARNING: This will permanently delete all memory data!" -ForegroundColor Red
    Write-Host "   - Vector embeddings in Qdrant" -ForegroundColor Yellow
    Write-Host "   - Knowledge graph data in Neo4j" -ForegroundColor Yellow
    Write-Host "   - OpenMemory conversation data" -ForegroundColor Yellow
    Write-Host "   - MetaMCP configuration database" -ForegroundColor Yellow
    
    $confirmation = Read-Host "`nAre you sure you want to continue? (yes/no)"
    if ($confirmation.ToLower() -ne "yes") {
        Write-MemoryLog "Operation cancelled by user" "INFO"
        exit 0
    }
}

# Stop model services first (if they exist)
$modelStopped = Stop-Services $ModelCompose "Model"

# Stop memory services
$memoryStopped = Stop-Services $MemoryCompose "Memory"

# Remove images if requested
Remove-NYRAImages

# Show cleanup summary
Show-CleanupSummary

if ($memoryStopped -and $modelStopped) {
    Write-MemoryLog "NYRA Memory Stack stopped successfully! 🧠" "SUCCESS"
} else {
    Write-MemoryLog "Some services may not have stopped cleanly" "WARN"
    exit 1
}