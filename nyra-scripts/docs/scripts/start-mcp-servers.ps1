# NYRA MCP Server Management
# Start/stop MCP servers by channel or individually  
# Usage: .\scripts\start-mcp-servers.ps1 [Channel|ServerName] [-Stop] [-Status]

param(
    [string]$Target = "orchestration",
    [switch]$Stop,
    [switch]$Status,
    [switch]$All,
    [switch]$Help
)

if ($Help) {
    Write-Host "🎛️ NYRA MCP Server Management" -ForegroundColor Cyan
    Write-Host "=============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Start/stop MCP servers by channel or individually:" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\scripts\start-mcp-servers.ps1 orchestration    # Start orchestration channel"
    Write-Host "  .\scripts\start-mcp-servers.ps1 -All             # Start all servers"  
    Write-Host "  .\scripts\start-mcp-servers.ps1 archon-mcp       # Start specific server"
    Write-Host "  .\scripts\start-mcp-servers.ps1 -Status          # Show status of all servers"
    Write-Host "  .\scripts\start-mcp-servers.ps1 memory -Stop     # Stop memory channel"
    Write-Host ""
    Write-Host "Available Channels:" -ForegroundColor Blue
    Write-Host "  • orchestration  - Agent orchestration and workflow management"
    Write-Host "  • development    - Code development and repository management"  
    Write-Host "  • memory         - Memory management and context persistence"
    Write-Host "  • ai-coding      - AI-powered coding assistance"
    Write-Host "  • security       - Security and secrets management"
    Write-Host "  • knowledge      - Knowledge management and documentation"
    Write-Host "  • infrastructure - Infrastructure and system management"
    Write-Host "  • workflows      - Workflow automation and integration"
    exit 0
}

Write-Host "🎛️ NYRA MCP Server Management" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Load channel configuration
$configPath = "nyra-mcp-servers/config/metamcp-channels.json"
if (!(Test-Path $configPath)) {
    Write-Host "❌ Channel configuration not found. Run bootstrap first:" -ForegroundColor Red
    Write-Host "   .\scripts\bootstrap-mcp-ecosystem.ps1" -ForegroundColor Blue
    exit 1
}

$channelsConfig = Get-Content $configPath | ConvertFrom-Json

# Server definitions for process management
$serverPorts = @{
    "archon-mcp" = 3002
    "infisical-mcp" = 3001  
    "metamcp-local" = 3000
    "qdrant-local" = 3003
    "mem0-mcp" = 3004
    "zep-mcp" = 3005
}

function Get-ServerStatus($serverName) {
    if ($serverPorts.ContainsKey($serverName)) {
        $port = $serverPorts[$serverName]
        try {
            $connection = Test-NetConnection -ComputerName "localhost" -Port $port -WarningAction SilentlyContinue
            if ($connection.TcpTestSucceeded) {
                return "🟢 Running"
            }
        } catch {}
    }
    
    # Check if process is running by name
    $process = Get-Process | Where-Object { $_.ProcessName -like "*$serverName*" -or $_.MainWindowTitle -like "*$serverName*" }
    if ($process) {
        return "🟡 Process Running"
    }
    
    return "🔴 Stopped"
}

function Start-LocalMCPServer($serverName) {
    $serverPath = switch ($serverName) {
        "archon-mcp" { "nyra-mcp-servers/local/archon-mcp" }
        "infisical-mcp" { "nyra-mcp-servers/local/infisical-mcp" }
        "metamcp-local" { "nyra-mcp-servers/local/metamcp" }
        "qdrant-local" { "nyra-mcp-servers/local/qdrant-mcp" }
        "mem0-mcp" { "nyra-mcp-servers/local/mem0-mcp" }
        "zep-mcp" { "nyra-mcp-servers/local/zep-mcp" }
        default { $null }
    }
    
    if (!$serverPath -or !(Test-Path $serverPath)) {
        Write-Host "   ❌ Server path not found: $serverPath" -ForegroundColor Red
        return $false
    }
    
    Write-Host "   🚀 Starting $serverName..." -ForegroundColor Cyan
    
    try {
        $process = Start-Process -FilePath "cmd" -ArgumentList "/c", "cd", "/d", $serverPath, "&&", "uv", "run", "python", "main.py" -PassThru -WindowStyle Minimized
        Start-Sleep 2
        
        $status = Get-ServerStatus $serverName
        Write-Host "   $status $serverName" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "   ❌ Failed to start $serverName : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Stop-LocalMCPServer($serverName) {
    Write-Host "   🛑 Stopping $serverName..." -ForegroundColor Yellow
    
    # Try to stop by port first
    if ($serverPorts.ContainsKey($serverName)) {
        $port = $serverPorts[$serverName]
        $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object {
            Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        }
        
        foreach ($process in $processes) {
            try {
                Stop-Process -Id $process.Id -Force
                Write-Host "   ✅ Stopped $serverName (PID: $($process.Id))" -ForegroundColor Green
                return $true
            } catch {
                Write-Host "   ⚠️ Could not stop process $($process.Id)" -ForegroundColor Yellow
            }
        }
    }
    
    # Fallback: try to find by name
    $processes = Get-Process | Where-Object { $_.ProcessName -like "*$serverName*" -or $_.MainWindowTitle -like "*$serverName*" }
    foreach ($process in $processes) {
        try {
            Stop-Process -Id $process.Id -Force
            Write-Host "   ✅ Stopped $serverName process" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "   ⚠️ Could not stop $serverName process" -ForegroundColor Yellow
        }
    }
    
    Write-Host "   ℹ️ $serverName was not running" -ForegroundColor Blue
    return $false
}

function Show-AllServersStatus {
    Write-Host "`n📊 MCP Server Status Report:" -ForegroundColor Yellow
    Write-Host ("="*50) -ForegroundColor Gray
    
    foreach ($channelName in $channelsConfig.server_assignments.PSObject.Properties.Name) {
        Write-Host "`n🔀 $channelName Channel:" -ForegroundColor Cyan
        $servers = $channelsConfig.server_assignments.$channelName
        
        foreach ($serverName in $servers) {
            $status = Get-ServerStatus $serverName
            $port = if ($serverPorts.ContainsKey($serverName)) { ":$($serverPorts[$serverName])" } else { "" }
            Write-Host "   $status $serverName$port" -ForegroundColor White
        }
    }
}

function Manage-Channel($channelName, $stopMode = $false) {
    if (!$channelsConfig.server_assignments.$channelName) {
        Write-Host "❌ Unknown channel: $channelName" -ForegroundColor Red
        Write-Host "Available channels: $($channelsConfig.server_assignments.PSObject.Properties.Name -join ', ')" -ForegroundColor Yellow
        return
    }
    
    $servers = $channelsConfig.server_assignments.$channelName
    $action = if ($stopMode) { "Stopping" } else { "Starting" }
    
    Write-Host "`n🔀 $action $channelName channel ($($servers.Count) servers)..." -ForegroundColor Blue
    
    $successCount = 0
    foreach ($serverName in $servers) {
        if ($stopMode) {
            if (Stop-LocalMCPServer $serverName) { $successCount++ }
        } else {
            if (Start-LocalMCPServer $serverName) { $successCount++ }
        }
    }
    
    Write-Host "`n📊 $action Results: $successCount/$($servers.Count) successful" -ForegroundColor $(if ($successCount -eq $servers.Count) { "Green" } else { "Yellow" })
}

# Main execution logic
if ($Status) {
    Show-AllServersStatus
}
elseif ($All) {
    if ($Stop) {
        Write-Host "🛑 Stopping all MCP servers..." -ForegroundColor Yellow
        foreach ($channelName in $channelsConfig.server_assignments.PSObject.Properties.Name) {
            Manage-Channel $channelName $true
        }
    } else {
        Write-Host "🚀 Starting all MCP servers..." -ForegroundColor Green
        foreach ($channelName in $channelsConfig.server_assignments.PSObject.Properties.Name) {
            Manage-Channel $channelName $false
        }
    }
}
elseif ($channelsConfig.server_assignments.$Target) {
    # Target is a channel
    Manage-Channel $Target $Stop
}
elseif ($serverPorts.ContainsKey($Target)) {
    # Target is a specific server
    if ($Stop) {
        Stop-LocalMCPServer $Target
    } else {
        Start-LocalMCPServer $Target
    }
}
else {
    Write-Host "❌ Unknown target: $Target" -ForegroundColor Red
    Write-Host "Available channels: $($channelsConfig.server_assignments.PSObject.Properties.Name -join ', ')" -ForegroundColor Yellow
    Write-Host "Available servers: $($serverPorts.Keys -join ', ')" -ForegroundColor Yellow
    Write-Host "Use -Help for more information" -ForegroundColor Blue
}

Write-Host "`n✅ MCP server management complete!" -ForegroundColor Green