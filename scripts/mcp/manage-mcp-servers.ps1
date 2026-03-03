<#
.SYNOPSIS
    Unified MCP Server Management Script for Project Nyra
    
.DESCRIPTION
    Comprehensive script to start, stop, monitor, and debug all MCP servers
    Supports both Docker-based and standalone MCP servers
    
.PARAMETER Action
    Action to perform: start, stop, restart, status, logs, health
    
.PARAMETER Server
    Specific server to manage (optional, defaults to all)
    
.PARAMETER Environment
    Environment to use: dev, prod (default: dev)
    
.EXAMPLE
    .\manage-mcp-servers.ps1 -Action start
    .\manage-mcp-servers.ps1 -Action status
    .\manage-mcp-servers.ps1 -Action stop -Server bitwarden-mcp
    .\manage-mcp-servers.ps1 -Action logs -Server claude-flow
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'logs', 'health', 'list')]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [string]$Server = 'all',
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'prod')]
    [string]$Environment = 'dev'
)

$ErrorActionPreference = 'Continue'
$RepoRoot = "C:\Dev\Projects\Repos\Project-Nyra"

# Define all MCP servers with their locations and types
$MCPServers = @{
    # Docker-based MCP servers in infra/
    'bitwarden-mcp' = @{
        Type = 'docker'
        Path = "$RepoRoot\infra\bitwarden-mcp"
        Container = 'nyra-bitwarden-mcp'
        Port = 8050
        HealthCheck = '/health'
    }
    'docker-mcp' = @{
        Type = 'docker'
        Path = "$RepoRoot\infra\docker-mcp"
        Container = 'nyra-docker-mcp'
        Port = 8052
        HealthCheck = '/health'
    }
    'dockerhub-mcp' = @{
        Type = 'docker'
        Path = "$RepoRoot\infra\dockerhub-mcp"
        Container = 'nyra-dockerhub-mcp'
        Port = 8053
        HealthCheck = '/health'
    }
    'git-mcp' = @{
        Type = 'docker'
        Path = "$RepoRoot\infra\git-mcp"
        Container = 'nyra-git-mcp'
        Port = 8054
        HealthCheck = '/health'
    }
    'infisical-mcp' = @{
        Type = 'docker'
        Path = "$RepoRoot\infra\infisical-mcp"
        Container = 'nyra-infisical-mcp'
        Port = 8055
        HealthCheck = '/health'
    }
    'sequential-thinking-mcp' = @{
        Type = 'docker'
        Path = "$RepoRoot\infra\sequential-thinking-mcp"
        Container = 'nyra-sequential-thinking-mcp'
        Port = 8056
        HealthCheck = '/health'
    }
    
    # NPX-based MCP servers
    'claude-flow' = @{
        Type = 'npx'
        Command = 'npx'
        Args = @('@claude-flow/cli@latest', 'mcp', 'start')
        Env = @{
            'CLAUDE_FLOW_MODE' = 'v3'
            'CLAUDE_FLOW_HOOKS_ENABLED' = 'true'
            'CLAUDE_FLOW_TOPOLOGY' = 'hierarchical-mesh'
            'CLAUDE_FLOW_MAX_AGENTS' = '15'
            'CLAUDE_FLOW_MEMORY_BACKEND' = 'hybrid'
        }
        Port = 8051
    }
    
    # Service-based MCP servers (lightweight, CLAUDE.md only)
    'gemini-mcp' = @{
        Type = 'service'
        Path = "$RepoRoot\services\gemini-mcp"
        Status = 'documented-only'
    }
    'github-mcp' = @{
        Type = 'service'
        Path = "$RepoRoot\services\github-mcp"
        Status = 'documented-only'
    }
    'mem0-mcp' = @{
        Type = 'service'
        Path = "$RepoRoot\services\mem0-mcp"
        Status = 'documented-only'
    }
    'serena-mcp' = @{
        Type = 'service'
        Path = "$RepoRoot\services\serena-mcp"
        Status = 'documented-only'
    }
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = 'White'
    )
    Write-Host $Message -ForegroundColor $Color
}

function Get-DockerContainerStatus {
    param([string]$ContainerName)
    
    try {
        $status = docker ps -a --filter "name=$ContainerName" --format "{{.Status}}" 2>$null
        if ($status -match "Up") { return "running" }
        elseif ($status) { return "stopped" }
        else { return "not-found" }
    }
    catch {
        return "error"
    }
}

function Start-MCPServer {
    param([string]$ServerName, [hashtable]$ServerConfig)
    
    Write-ColorOutput "`n🚀 Starting $ServerName..." -Color Cyan
    
    switch ($ServerConfig.Type) {
        'docker' {
            $status = Get-DockerContainerStatus $ServerConfig.Container
            if ($status -eq "running") {
                Write-ColorOutput "  ✅ Already running" -Color Green
                return
            }
            
            if (Test-Path "$($ServerConfig.Path)\docker-compose.yml") {
                Push-Location $ServerConfig.Path
                docker-compose up -d 2>&1 | Out-Null
                Pop-Location
            }
            elseif (Test-Path "$($ServerConfig.Path)\Dockerfile") {
                Write-ColorOutput "  ℹ️  No docker-compose.yml, building and running manually..." -Color Yellow
                Push-Location $ServerConfig.Path
                docker build -t $ServerConfig.Container . 2>&1 | Out-Null
                docker run -d --name $ServerConfig.Container -p "$($ServerConfig.Port):$($ServerConfig.Port)" $ServerConfig.Container 2>&1 | Out-Null
                Pop-Location
            }
            
            Start-Sleep -Seconds 2
            $newStatus = Get-DockerContainerStatus $ServerConfig.Container
            if ($newStatus -eq "running") {
                Write-ColorOutput "  ✅ Started successfully (Port: $($ServerConfig.Port))" -Color Green
            } else {
                Write-ColorOutput "  ❌ Failed to start" -Color Red
            }
        }
        'npx' {
            Write-ColorOutput "  ℹ️  NPX-based server - managed by .mcp.json" -Color Yellow
            Write-ColorOutput "  Run: npx @claude-flow/cli@latest mcp start" -Color Gray
        }
        'service' {
            Write-ColorOutput "  ℹ️  Service type - documentation only (see $($ServerConfig.Path)\CLAUDE.md)" -Color Yellow
        }
    }
}

function Stop-MCPServer {
    param([string]$ServerName, [hashtable]$ServerConfig)
    
    Write-ColorOutput "`n🛑 Stopping $ServerName..." -Color Cyan
    
    switch ($ServerConfig.Type) {
        'docker' {
            $status = Get-DockerContainerStatus $ServerConfig.Container
            if ($status -eq "not-found") {
                Write-ColorOutput "  ℹ️  Not running" -Color Gray
                return
            }
            
            docker stop $ServerConfig.Container 2>&1 | Out-Null
            Write-ColorOutput "  ✅ Stopped" -Color Green
        }
        'npx' {
            Write-ColorOutput "  ℹ️  NPX-based server - managed by .mcp.json" -Color Yellow
            Write-ColorOutput "  Run: npx @claude-flow/cli@latest mcp stop" -Color Gray
        }
        'service' {
            Write-ColorOutput "  ℹ️  Service type - no action needed" -Color Yellow
        }
    }
}

function Get-MCPServerStatus {
    param([string]$ServerName, [hashtable]$ServerConfig)
    
    $statusObj = [PSCustomObject]@{
        Name = $ServerName
        Type = $ServerConfig.Type
        Status = 'unknown'
        Port = $ServerConfig.Port
        Container = $ServerConfig.Container
    }
    
    switch ($ServerConfig.Type) {
        'docker' {
            $containerStatus = Get-DockerContainerStatus $ServerConfig.Container
            $statusObj.Status = $containerStatus
            
            if ($containerStatus -eq "running" -and $ServerConfig.Port) {
                # Check if port is listening
                $portCheck = Test-NetConnection -ComputerName localhost -Port $ServerConfig.Port -WarningAction SilentlyContinue -InformationLevel Quiet
                if (-not $portCheck) {
                    $statusObj.Status = "unhealthy"
                }
            }
        }
        'npx' {
            $statusObj.Status = "managed-by-mcp-json"
        }
        'service' {
            $statusObj.Status = "documented-only"
        }
    }
    
    return $statusObj
}

function Show-MCPServerLogs {
    param([string]$ServerName, [hashtable]$ServerConfig)
    
    Write-ColorOutput "`n📋 Logs for $ServerName..." -Color Cyan
    
    switch ($ServerConfig.Type) {
        'docker' {
            docker logs --tail 50 $ServerConfig.Container 2>&1
        }
        'npx' {
            Write-ColorOutput "  ℹ️  Check Claude Flow logs in .claude-flow/" -Color Yellow
        }
        'service' {
            Write-ColorOutput "  ℹ️  No logs available (service type)" -Color Yellow
        }
    }
}

function Test-MCPServerHealth {
    param([string]$ServerName, [hashtable]$ServerConfig)
    
    Write-ColorOutput "`n🏥 Health check for $ServerName..." -Color Cyan
    
    if ($ServerConfig.Type -eq 'docker' -and $ServerConfig.Port) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$($ServerConfig.Port)$($ServerConfig.HealthCheck)" -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-ColorOutput "  ✅ Healthy (HTTP 200)" -Color Green
            } else {
                Write-ColorOutput "  ⚠️  Unexpected status: $($response.StatusCode)" -Color Yellow
            }
        }
        catch {
            Write-ColorOutput "  ❌ Unhealthy or not responding" -Color Red
        }
    }
    else {
        Write-ColorOutput "  ℹ️  Health check not applicable for this server type" -Color Yellow
    }
}

function Show-MCPServerList {
    Write-ColorOutput "`n📊 MCP Server Inventory" -Color Cyan
    Write-ColorOutput "=" * 80 -Color Gray
    
    $MCPServers.GetEnumerator() | Sort-Object Name | ForEach-Object {
        $name = $_.Key
        $config = $_.Value
        
        Write-ColorOutput "`n🔹 $name" -Color White
        Write-ColorOutput "   Type: $($config.Type)" -Color Gray
        Write-ColorOutput "   Location: $($config.Path)" -Color Gray
        
        if ($config.Port) {
            Write-ColorOutput "   Port: $($config.Port)" -Color Gray
        }
        
        if ($config.Container) {
            Write-ColorOutput "   Container: $($config.Container)" -Color Gray
        }
        
        if ($config.Status) {
            Write-ColorOutput "   Status: $($config.Status)" -Color Gray
        }
    }
    
    Write-ColorOutput "`n" -Color White
    Write-ColorOutput "Total: $($MCPServers.Count) MCP servers" -Color Cyan
    Write-ColorOutput "  - Docker-based: $(($MCPServers.Values | Where-Object {$_.Type -eq 'docker'}).Count)" -Color Gray
    Write-ColorOutput "  - NPX-based: $(($MCPServers.Values | Where-Object {$_.Type -eq 'npx'}).Count)" -Color Gray
    Write-ColorOutput "  - Service (docs only): $(($MCPServers.Values | Where-Object {$_.Type -eq 'service'}).Count)" -Color Gray
}

# Main execution logic
Write-ColorOutput "`n╔════════════════════════════════════════════════════════════╗" -Color Cyan
Write-ColorOutput "║        Project Nyra - MCP Server Management Tool          ║" -Color Cyan
Write-ColorOutput "╚════════════════════════════════════════════════════════════╝`n" -Color Cyan

switch ($Action) {
    'list' {
        Show-MCPServerList
    }
    'start' {
        if ($Server -eq 'all') {
            foreach ($s in $MCPServers.GetEnumerator() | Where-Object {$_.Value.Type -eq 'docker'}) {
                Start-MCPServer -ServerName $s.Key -ServerConfig $s.Value
            }
        }
        elseif ($MCPServers.ContainsKey($Server)) {
            Start-MCPServer -ServerName $Server -ServerConfig $MCPServers[$Server]
        }
        else {
            Write-ColorOutput "❌ Unknown server: $Server" -Color Red
            Write-ColorOutput "Available servers: $($MCPServers.Keys -join ', ')" -Color Gray
        }
    }
    'stop' {
        if ($Server -eq 'all') {
            foreach ($s in $MCPServers.GetEnumerator() | Where-Object {$_.Value.Type -eq 'docker'}) {
                Stop-MCPServer -ServerName $s.Key -ServerConfig $s.Value
            }
        }
        elseif ($MCPServers.ContainsKey($Server)) {
            Stop-MCPServer -ServerName $Server -ServerConfig $MCPServers[$Server]
        }
        else {
            Write-ColorOutput "❌ Unknown server: $Server" -Color Red
        }
    }
    'restart' {
        if ($MCPServers.ContainsKey($Server)) {
            Stop-MCPServer -ServerName $Server -ServerConfig $MCPServers[$Server]
            Start-Sleep -Seconds 2
            Start-MCPServer -ServerName $Server -ServerConfig $MCPServers[$Server]
        }
        elseif ($Server -eq 'all') {
            Write-ColorOutput "⚠️  Restarting all servers..." -Color Yellow
            foreach ($s in $MCPServers.GetEnumerator() | Where-Object {$_.Value.Type -eq 'docker'}) {
                Stop-MCPServer -ServerName $s.Key -ServerConfig $s.Value
            }
            Start-Sleep -Seconds 3
            foreach ($s in $MCPServers.GetEnumerator() | Where-Object {$_.Value.Type -eq 'docker'}) {
                Start-MCPServer -ServerName $s.Key -ServerConfig $s.Value
            }
        }
    }
    'status' {
        Write-ColorOutput "`n📊 MCP Server Status Report" -Color Cyan
        Write-ColorOutput "=" * 80 -Color Gray
        
        $statusTable = @()
        foreach ($s in $MCPServers.GetEnumerator() | Sort-Object Name) {
            $status = Get-MCPServerStatus -ServerName $s.Key -ServerConfig $s.Value
            $statusTable += $status
        }
        
        $statusTable | Format-Table -Property Name, Type, Status, Port, Container -AutoSize
    }
    'logs' {
        if ($Server -eq 'all') {
            foreach ($s in $MCPServers.GetEnumerator() | Where-Object {$_.Value.Type -eq 'docker'}) {
                Show-MCPServerLogs -ServerName $s.Key -ServerConfig $s.Value
            }
        }
        elseif ($MCPServers.ContainsKey($Server)) {
            Show-MCPServerLogs -ServerName $Server -ServerConfig $MCPServers[$Server]
        }
        else {
            Write-ColorOutput "❌ Unknown server: $Server" -Color Red
        }
    }
    'health' {
        if ($Server -eq 'all') {
            foreach ($s in $MCPServers.GetEnumerator() | Where-Object {$_.Value.Type -eq 'docker'}) {
                Test-MCPServerHealth -ServerName $s.Key -ServerConfig $s.Value
            }
        }
        elseif ($MCPServers.ContainsKey($Server)) {
            Test-MCPServerHealth -ServerName $Server -ServerConfig $MCPServers[$Server]
        }
        else {
            Write-ColorOutput "❌ Unknown server: $Server" -Color Red
        }
    }
}

Write-ColorOutput "`n✅ Operation complete!`n" -Color Green
