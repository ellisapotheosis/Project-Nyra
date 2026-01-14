#!/usr/bin/env pwsh
#Requires -Version 7.0

<#
.SYNOPSIS
    Inspect Project Nyra services on PC1 (Orchestrator)

.DESCRIPTION
    Provides detailed inspection of service status, logs, resource usage,
    and network connectivity for all orchestrator services.

.PARAMETER Service
    Specific service name to inspect (optional)

.PARAMETER Logs
    Show recent logs for service(s)

.PARAMETER LogLines
    Number of log lines to show (default: 50)

.PARAMETER Follow
    Follow log output (tail -f mode)

.PARAMETER Network
    Show network connectivity information

.PARAMETER Resources
    Show detailed resource usage

.PARAMETER All
    Show all information (status, logs, network, resources)

.EXAMPLE
    .\inspect.ps1
    Show status of all services

.EXAMPLE
    .\inspect.ps1 -Service postgres -Logs
    Show PostgreSQL service logs

.EXAMPLE
    .\inspect.ps1 -Service dify-api -Follow
    Follow Dify API logs in real-time

.EXAMPLE
    .\inspect.ps1 -All
    Show comprehensive inspection of all services

.NOTES
    PC: PC1 (Orchestrator)
    Role: Service inspection and diagnostics
    Author: Project Nyra Team
#>

param(
    [string]$Service,
    [switch]$Logs,
    [int]$LogLines = 50,
    [switch]$Follow,
    [switch]$Network,
    [switch]$Resources,
    [switch]$All
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path (Split-Path $ScriptDir -Parent) -Parent
$ComposeFile = Join-Path $ProjectRoot "infra\docker-compose.dev.yml"

# Color functions
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Failure { param($Message) Write-Host $Message -ForegroundColor Red }
function Write-Header { param($Message) Write-Host "`n====== $Message ======" -ForegroundColor Magenta }

# Check if Docker is running
function Test-DockerRunning {
    try {
        docker info | Out-Null
        return $true
    } catch {
        Write-Failure "❌ Docker is not running. Please start Docker Desktop."
        exit 1
    }
}

# Get container name with nyra prefix
function Get-ContainerName {
    param([string]$ServiceName)

    if ($ServiceName) {
        $containers = docker ps -a --filter "name=nyra-$ServiceName" --format "{{.Names}}"
        if ($containers) {
            return $containers[0]
        }
        return "nyra-$ServiceName"
    }
    return $null
}

# Show service status
function Show-ServiceStatus {
    param([string]$ServiceName)

    Write-Header "Service Status"

    Set-Location "$ProjectRoot\infra"

    if ($ServiceName) {
        Write-Info "📊 Status for: $ServiceName"
        docker-compose -f docker-compose.dev.yml ps $ServiceName --format "table {{.Name}}\t{{.State}}\t{{.Status}}\t{{.Ports}}"

        # Show detailed container info
        $containerName = Get-ContainerName -ServiceName $ServiceName
        $containerInfo = docker inspect $containerName 2>$null | ConvertFrom-Json

        if ($containerInfo) {
            Write-Info "`n📋 Container Details:"
            Write-Info "  ID: $($containerInfo.Id.Substring(0,12))"
            Write-Info "  Created: $($containerInfo.Created)"
            Write-Info "  State: $($containerInfo.State.Status)"
            if ($containerInfo.State.Status -eq "running") {
                Write-Info "  Started: $($containerInfo.State.StartedAt)"
                Write-Info "  Uptime: $((Get-Date) - [DateTime]$containerInfo.State.StartedAt | Select-Object -ExpandProperty TotalHours | ForEach-Object { "{0:N2}h" -f $_ })"
            }
            Write-Info "  RestartCount: $($containerInfo.RestartCount)"
        }
    } else {
        Write-Info "📊 All Services Status:"
        docker-compose -f docker-compose.dev.yml ps --format "table {{.Name}}\t{{.State}}\t{{.Status}}\t{{.Ports}}"
    }
}

# Show service logs
function Show-ServiceLogs {
    param(
        [string]$ServiceName,
        [int]$Lines,
        [bool]$FollowMode
    )

    Write-Header "Service Logs"

    Set-Location "$ProjectRoot\infra"

    if ($FollowMode) {
        if ($ServiceName) {
            Write-Info "📜 Following logs for: $ServiceName (Ctrl+C to stop)"
            docker-compose -f docker-compose.dev.yml logs -f --tail=$Lines $ServiceName
        } else {
            Write-Info "📜 Following logs for all services (Ctrl+C to stop)"
            docker-compose -f docker-compose.dev.yml logs -f --tail=$Lines
        }
    } else {
        if ($ServiceName) {
            Write-Info "📜 Recent logs for: $ServiceName (last $Lines lines)"
            docker-compose -f docker-compose.dev.yml logs --tail=$Lines $ServiceName
        } else {
            Write-Info "📜 Recent logs for all services (last $Lines lines per service)"
            docker-compose -f docker-compose.dev.yml logs --tail=$Lines
        }
    }
}

# Show network information
function Show-NetworkInfo {
    param([string]$ServiceName)

    Write-Header "Network Information"

    # Show Docker networks
    Write-Info "🌐 Docker Networks:"
    docker network ls --filter "name=nyra" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"

    # Show network details
    Write-Info "`n🔍 Network Details (nyra-network):"
    $networkInfo = docker network inspect nyra-network 2>$null | ConvertFrom-Json

    if ($networkInfo) {
        Write-Info "  Driver: $($networkInfo.Driver)"
        Write-Info "  Subnet: $($networkInfo.IPAM.Config[0].Subnet)"
        Write-Info "  Gateway: $($networkInfo.IPAM.Config[0].Gateway)"
        Write-Info "  Connected Containers: $($networkInfo.Containers.Count)"
    }

    # Show container network details
    if ($ServiceName) {
        $containerName = Get-ContainerName -ServiceName $ServiceName
        $containerInfo = docker inspect $containerName 2>$null | ConvertFrom-Json

        if ($containerInfo) {
            Write-Info "`n🔌 $ServiceName Network Config:"
            $networkSettings = $containerInfo.NetworkSettings.Networks.'nyra-network'
            if ($networkSettings) {
                Write-Info "  IP Address: $($networkSettings.IPAddress)"
                Write-Info "  Gateway: $($networkSettings.Gateway)"
                Write-Info "  MAC Address: $($networkSettings.MacAddress)"
            }
        }
    } else {
        Write-Info "`n🔌 All Container IP Addresses:"
        $containers = docker ps --filter "network=nyra-network" --format "{{.Names}}"
        foreach ($container in $containers) {
            $info = docker inspect $container 2>$null | ConvertFrom-Json
            $ip = $info.NetworkSettings.Networks.'nyra-network'.IPAddress
            Write-Info "  $container → $ip"
        }
    }
}

# Show resource usage
function Show-ResourceUsage {
    param([string]$ServiceName)

    Write-Header "Resource Usage"

    if ($ServiceName) {
        $containerName = Get-ContainerName -ServiceName $ServiceName
        Write-Info "📊 Resources for: $ServiceName"
        docker stats $containerName --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
    } else {
        Write-Info "📊 Resources for all services:"
        docker stats --no-stream --filter "name=nyra-" --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
    }
}

# Show volume information
function Show-VolumeInfo {
    param([string]$ServiceName)

    Write-Header "Volume Information"

    Write-Info "💾 Docker Volumes:"
    docker volume ls --filter "name=nyra" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"

    if ($ServiceName) {
        $containerName = Get-ContainerName -ServiceName $ServiceName
        $containerInfo = docker inspect $containerName 2>$null | ConvertFrom-Json

        if ($containerInfo) {
            Write-Info "`n📂 $ServiceName Volume Mounts:"
            foreach ($mount in $containerInfo.Mounts) {
                Write-Info "  $($mount.Type): $($mount.Source) → $($mount.Destination)"
                if ($mount.Type -eq "volume") {
                    $volumeInfo = docker volume inspect $mount.Name 2>$null | ConvertFrom-Json
                    if ($volumeInfo) {
                        $size = (Get-ChildItem -Path $volumeInfo.Mountpoint -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
                        Write-Info "    Size: $([math]::Round($size, 2)) MB"
                    }
                }
            }
        }
    }
}

# Show port mappings
function Show-PortMappings {
    param([string]$ServiceName)

    Write-Header "Port Mappings"

    if ($ServiceName) {
        $containerName = Get-ContainerName -ServiceName $ServiceName
        Write-Info "🔌 Ports for: $ServiceName"
        docker port $containerName 2>$null
    } else {
        Write-Info "🔌 All Port Mappings:"
        $containers = docker ps --filter "name=nyra-" --format "{{.Names}}"
        foreach ($container in $containers) {
            $ports = docker port $container 2>$null
            if ($ports) {
                Write-Info "`n$container:"
                $ports | ForEach-Object { Write-Info "  $_" }
            }
        }
    }
}

# Main execution
Write-Header "Project Nyra - PC1 Service Inspector"

Test-DockerRunning

# If -All flag is set, show everything
if ($All) {
    Show-ServiceStatus -ServiceName $Service
    Show-ResourceUsage -ServiceName $Service
    Show-NetworkInfo -ServiceName $Service
    Show-VolumeInfo -ServiceName $Service
    Show-PortMappings -ServiceName $Service
    if (-not $Follow) {
        Show-ServiceLogs -ServiceName $Service -Lines $LogLines -FollowMode $false
    }
    exit 0
}

# Show individual sections based on flags
$anyFlagSet = $Logs -or $Network -or $Resources

if (-not $anyFlagSet) {
    # Default: show status only
    Show-ServiceStatus -ServiceName $Service
} else {
    # Show status first
    Show-ServiceStatus -ServiceName $Service

    if ($Resources) {
        Show-ResourceUsage -ServiceName $Service
    }

    if ($Network) {
        Show-NetworkInfo -ServiceName $Service
    }

    if ($Logs) {
        Show-ServiceLogs -ServiceName $Service -Lines $LogLines -FollowMode $Follow
    }
}

Write-Success "`n✅ Inspection complete"
