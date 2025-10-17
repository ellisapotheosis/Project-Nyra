# NYRA MCP Server Manager
# Centralized management for Infisical, GithubMCP, and FileSystemMCP servers
param(
    [ValidateSet('status','start','stop','restart','logs','build','config','clean')]
    [string]$Action = 'status',
    
    [ValidateSet('all','infisical','github','filesystem')]
    [string]$Target = 'all',
    
    [switch]$UseInfisical = $false,
    [string]$InfisicalEnv = 'dev',
    [string]$InfisicalProject = '8374cea9-e5e8-4050-bda4-b91f25ab30ef'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Determine root path from environment or use default
$root = if ($env:NYRA_MCP_SERVERS_PATH) { 
    $env:NYRA_MCP_SERVERS_PATH 
} else { 
    'C:\Dev\Tools\MCP-Servers' 
}

Write-Host "NYRA MCP Server Manager" -ForegroundColor Cyan
Write-Host "Root: $root" -ForegroundColor Gray

# Server definitions
$servers = @{
    metamcp = @{
        Name = "MetaMCP Orchestrator"
        Path = Join-Path $root 'MetaMCP'
        HasCompose = $true
        Port = 12008
        Description = "MCP proxy aggregator and orchestrator"
        Primary = $true
    }
    infisical = @{
        Name = "Infisical MCP"
        Path = Join-Path $root 'Infisical'
        HasCompose = $false
        StartScript = 'run-infisical-mcp.ps1'
        Port = $null
        Description = "Secrets management MCP server"
    }
    github = @{
        Name = "GitHub MCP" 
        Path = Join-Path $root 'GithubMCP'
        HasCompose = $true
        Port = 8001
        NgrokPort = 4041
        Description = "GitHub repositories and Git operations MCP server"
    }
    filesystem = @{
        Name = "FileSystem MCP"
        Path = Join-Path $root 'FileSystemMCP'  
        HasCompose = $true
        Port = 8000
        NgrokPort = 4040
        Description = "File system operations MCP server"
    }
    docker = @{
        Name = "Docker MCP"
        Path = Join-Path $root 'DockerMCP'
        HasCompose = $false
        Port = $null
        Description = "Docker container and image management"
    }
    dockerhub = @{
        Name = "Docker Hub MCP"
        Path = Join-Path $root 'DockerHubMCP'
        HasCompose = $false
        Port = $null
        Description = "Docker Hub operations and image search"
    }
    bitwarden = @{
        Name = "Bitwarden MCP"
        Path = Join-Path $root 'BitwardenMCP'
        HasCompose = $false
        Port = $null
        Description = "Password management and vault operations"
    }
    kilocode = @{
        Name = "Kilo Code MCP"
        Path = Join-Path $root 'KiloCodeMCP'
        HasCompose = $false
        Port = $null
        Description = "Internationalization and development tools"
    }
    claudeflow = @{
        Name = "Claude Flow MCP"
        Path = Join-Path $root 'ClaudeFlowMCP'
        HasCompose = $false
        Port = $null
        Description = "AI orchestration and swarm intelligence"
    }
    gemini = @{
        Name = "Gemini CLI MCP"
        Path = Join-Path $root 'GeminiCLI'
        HasCompose = $false
        Port = $null
        Description = "Google Gemini AI integration and tools"
    }
}

function Write-ServerInfo($serverKey, $server) {
    Write-Host "[$($serverKey.ToUpper())] $($server.Name)" -ForegroundColor Yellow
    Write-Host "  Path: $($server.Path)" -ForegroundColor Gray
    Write-Host "  $($server.Description)" -ForegroundColor Gray
    if ($server.Port) { Write-Host "  Port: $($server.Port)" -ForegroundColor Gray }
    if ($server.NgrokPort) { Write-Host "  Ngrok: $($server.NgrokPort)" -ForegroundColor Gray }
}

function Invoke-Compose($path, $args) {
    if (-not (Test-Path (Join-Path $path 'docker-compose.yml'))) {
        throw "No docker-compose.yml found in $path"
    }
    
    Push-Location $path
    try {
        if ($UseInfisical -and (Get-Command infisical -ErrorAction SilentlyContinue)) {
            $cmd = @('infisical', 'run', "--env=$InfisicalEnv", "--projectId=$InfisicalProject", '--', 'docker', 'compose') + $args
            Write-Host ">> $($cmd -join ' ')" -ForegroundColor DarkGray
            & $cmd[0] $cmd[1..($cmd.Length-1)]
        } else {
            $cmd = @('docker', 'compose') + $args  
            Write-Host ">> $($cmd -join ' ')" -ForegroundColor DarkGray
            & $cmd[0] $cmd[1..($cmd.Length-1)]
        }
    } finally {
        Pop-Location
    }
}

function Start-InfisicalMcp($server) {
    $scriptPath = Join-Path $server.Path $server.StartScript
    if (Test-Path $scriptPath) {
        Push-Location $server.Path
        try {
            Write-Host "Starting Infisical MCP..." -ForegroundColor Green
            & $scriptPath
        } finally {
            Pop-Location
        }
    } else {
        Write-Warning "Start script not found: $scriptPath"
    }
}

function Get-ServerList($targetFilter) {
    if ($targetFilter -eq 'all') {
        return $servers.Keys
    } else {
        return @($targetFilter)
    }
}

function Show-Status() {
    Write-Host "`n=== MCP SERVER STATUS ===" -ForegroundColor Cyan
    
    # Show Docker containers
    Write-Host "`nDocker Containers:" -ForegroundColor Yellow
    try {
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Where-Object { $_ -match "mcp|ngrok" }
    } catch {
        Write-Host "No Docker containers or Docker not running" -ForegroundColor Red
    }
    
    # Show individual server info
    Write-Host "`nConfigured Servers:" -ForegroundColor Yellow
    foreach ($key in $servers.Keys) {
        $server = $servers[$key]
        $exists = Test-Path $server.Path
        $status = if ($exists) { "EXISTS" } else { "MISSING" }
        $color = if ($exists) { "Green" } else { "Red" }
        
        Write-Host "  [$($key.ToUpper())] $($server.Name) - " -NoNewline
        Write-Host $status -ForegroundColor $color
        Write-Host "    Path: $($server.Path)" -ForegroundColor Gray
    }
    
    # Show network status
    Write-Host "`nDocker Networks:" -ForegroundColor Yellow
    try {
        docker network ls | Where-Object { $_ -match "mcp" }
    } catch {
        Write-Host "No MCP networks found" -ForegroundColor Gray
    }
}

# Main action switch
Write-Host "Action: $Action, Target: $Target" -ForegroundColor Gray

switch ($Action) {
    'status' {
        Show-Status
    }
    
    'start' {
        $targetServers = Get-ServerList $Target
        foreach ($serverKey in $targetServers) {
            $server = $servers[$serverKey]
            Write-Host "`nStarting $($server.Name)..." -ForegroundColor Green
            
            if (-not (Test-Path $server.Path)) {
                Write-Warning "Server path not found: $($server.Path)"
                continue
            }
            
            if ($server.HasCompose) {
                try {
                    Invoke-Compose $server.Path @('up', '-d', '--remove-orphans')
                    Write-Host "$($server.Name) started successfully!" -ForegroundColor Green
                } catch {
                    Write-Error "Failed to start $($server.Name): $_"
                }
            } else {
                Start-InfisicalMcp $server
            }
        }
    }
    
    'stop' {
        $targetServers = Get-ServerList $Target
        foreach ($serverKey in $targetServers) {
            $server = $servers[$serverKey]
            Write-Host "`nStopping $($server.Name)..." -ForegroundColor Yellow
            
            if (-not (Test-Path $server.Path)) {
                Write-Warning "Server path not found: $($server.Path)"
                continue
            }
            
            if ($server.HasCompose) {
                try {
                    Invoke-Compose $server.Path @('down', '--remove-orphans')
                    Write-Host "$($server.Name) stopped successfully!" -ForegroundColor Green
                } catch {
                    Write-Warning "Failed to stop $($server.Name): $_"
                }
            } else {
                Write-Host "Infisical MCP: Stop any running Node.js processes manually" -ForegroundColor Yellow
            }
        }
    }
    
    'restart' {
        Write-Host "Restarting servers..." -ForegroundColor Cyan
        & $PSCommandPath -Action stop -Target $Target -UseInfisical:$UseInfisical
        Start-Sleep -Seconds 2
        & $PSCommandPath -Action start -Target $Target -UseInfisical:$UseInfisical
    }
    
    'build' {
        $targetServers = Get-ServerList $Target
        foreach ($serverKey in $targetServers) {
            $server = $servers[$serverKey]
            if ($server.HasCompose) {
                Write-Host "`nBuilding $($server.Name)..." -ForegroundColor Cyan
                try {
                    Invoke-Compose $server.Path @('build', '--pull')
                    Write-Host "$($server.Name) built successfully!" -ForegroundColor Green
                } catch {
                    Write-Error "Failed to build $($server.Name): $_"
                }
            }
        }
    }
    
    'logs' {
        $targetServers = Get-ServerList $Target
        if ($targetServers.Count -eq 1) {
            $serverKey = $targetServers[0]
            $server = $servers[$serverKey]
            if ($server.HasCompose) {
                Write-Host "Showing logs for $($server.Name)..." -ForegroundColor Cyan
                Invoke-Compose $server.Path @('logs', '-f', '--tail', '100')
            }
        } else {
            Write-Host "Logs command requires a specific target (not 'all')" -ForegroundColor Yellow
        }
    }
    
    'config' {
        $targetServers = Get-ServerList $Target
        foreach ($serverKey in $targetServers) {
            $server = $servers[$serverKey]
            if ($server.HasCompose) {
                Write-Host "`n=== $($server.Name) Configuration ===" -ForegroundColor Cyan
                try {
                    Push-Location $server.Path
                    docker compose config
                } catch {
                    Write-Warning "Failed to show config for $($server.Name): $_"
                } finally {
                    Pop-Location
                }
            }
        }
    }
    
    'clean' {
        Write-Host "Cleaning up Docker resources..." -ForegroundColor Yellow
        docker system prune -f
        docker volume prune -f
        docker network prune -f
    }
    
    default {
        Write-Host "Unknown action: $Action" -ForegroundColor Red
        Write-Host "Available actions: status, start, stop, restart, logs, build, config, clean" -ForegroundColor Yellow
    }
}

Write-Host "`nDone." -ForegroundColor Green