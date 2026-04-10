# NYRA MCP Ecosystem Connector
# Connects Docker, global NPX, and local UV MCP servers into unified ecosystem
# Handles service discovery, health checks, and cross-server communication

param(
    [switch]$StartAll,
    [switch]$ShowUrls,
    [switch]$TestConnections,
    [string]$Environment = "dev"
)

Write-Host "🔗 NYRA MCP Ecosystem Connector" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Configuration
$dockerServers = @{
    "metamcp" = @{
        "container" = "metamcp"
        "port" = 12008
        "url" = "http://localhost:12008"
        "api_url" = "http://localhost:12008/api"
        "description" = "Docker MetaMCP - Channel orchestration and management"
    }
    "github-mcp" = @{
        "container" = "github-mcp"
        "port" = 3876
        "url" = "http://localhost:3876"
        "description" = "Docker GitHub MCP Server"
    }
}

$localServers = @{
    "archon-mcp" = @{
        "port" = 3002
        "url" = "http://localhost:3002"
        "path" = "nyra-mcp-servers/local/archon-mcp"
        "description" = "Local Archon MCP - Primary orchestrator"
    }
    "infisical-mcp" = @{
        "port" = 3001
        "url" = "http://localhost:3001"
        "path" = "nyra-mcp-servers/local/infisical-mcp"
        "description" = "Local Infisical MCP - Secrets management"
    }
    "metamcp-local" = @{
        "port" = 3000
        "url" = "http://localhost:3000"
        "path" = "nyra-mcp-servers/local/metamcp"
        "description" = "Local MetaMCP - Channel management"
    }
    "qdrant-local" = @{
        "port" = 3003
        "url" = "http://localhost:3003"
        "path" = "nyra-mcp-servers/local/qdrant-mcp"
        "description" = "Local Qdrant MCP - Vector storage"
    }
    "mem0-mcp" = @{
        "port" = 3004
        "url" = "http://localhost:3004"
        "path" = "nyra-mcp-servers/local/mem0-mcp"
        "description" = "Local Mem0 MCP - Memory management"
    }
    "zep-mcp" = @{
        "port" = 3005
        "url" = "http://localhost:3005"
        "path" = "nyra-mcp-servers/local/zep-mcp"
        "description" = "Local Zep MCP - Conversation memory"
    }
}

$globalServers = @{
    "fastmcp" = @{
        "command" = "fastmcp"
        "description" = "Global FastMCP - Rapid MCP server development"
    }
    "filesystem" = @{
        "command" = "filesystem"
        "description" = "Global Filesystem MCP"
    }
    "notion" = @{
        "command" = "notion"
        "description" = "Global Notion MCP"
    }
    "archon-os" = @{
        "command" = "archon-os"
        "description" = "Global Claude Flow MCP"
    }
    "flow-nexus" = @{
        "command" = "flow-nexus"
        "description" = "Global Flow Nexus MCP"
    }
    "desktop-commander" = @{
        "command" = "desktop-commander"
        "description" = "Global Desktop Commander MCP"
    }
}

function Test-Port($hostname, $port) {
    try {
        $connection = Test-NetConnection -ComputerName $hostname -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet
        return $connection.TcpTestSucceeded
    } catch {
        return $false
    }
}

function Test-DockerContainer($containerName) {
    try {
        $result = docker ps --filter "name=$containerName" --format "{{.Status}}" 2>$null
        return $result -like "*Up*"
    } catch {
        return $false
    }
}

function Start-LocalMCPServer($serverName, $serverInfo) {
    Write-Host "   🚀 Starting $serverName..." -ForegroundColor Cyan
    
    $serverPath = $serverInfo.path
    if (!(Test-Path $serverPath)) {
        Write-Host "   ❌ Server path not found: $serverPath" -ForegroundColor Red
        return $false
    }
    
    try {
        $process = Start-Process -FilePath "cmd" -ArgumentList "/c", "cd", "/d", $serverPath, "&&", "uv", "run", "python", "main.py" -PassThru -WindowStyle Minimized
        Start-Sleep 3
        
        if (Test-Port "localhost" $serverInfo.port) {
            Write-Host "   ✅ $serverName running at $($serverInfo.url)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   ⚠️ $serverName started but port $($serverInfo.port) not responsive" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "   ❌ Failed to start $serverName : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Show-AllServices {
    Write-Host "`n🌐 NYRA MCP Ecosystem Service Map" -ForegroundColor Yellow
    Write-Host ("="*60) -ForegroundColor Gray
    
    Write-Host "`n🐳 Docker Services:" -ForegroundColor Blue
    foreach ($serverName in $dockerServers.Keys) {
        $server = $dockerServers[$serverName]
        $status = if (Test-DockerContainer $server.container) { "🟢 Running" } else { "🔴 Stopped" }
        Write-Host "   $status $serverName - $($server.url)" -ForegroundColor White
        Write-Host "      💡 $($server.description)" -ForegroundColor Gray
    }
    
    Write-Host "`n📁 Local UV Services:" -ForegroundColor Blue  
    foreach ($serverName in $localServers.Keys) {
        $server = $localServers[$serverName]
        $status = if (Test-Port "localhost" $server.port) { "🟢 Running" } else { "🔴 Stopped" }
        Write-Host "   $status $serverName - $($server.url)" -ForegroundColor White
        Write-Host "      💡 $($server.description)" -ForegroundColor Gray
    }
    
    Write-Host "`n🌍 Global NPX Services:" -ForegroundColor Blue
    foreach ($serverName in $globalServers.Keys) {
        $server = $globalServers[$serverName]
        $available = try { Get-Command $server.command -ErrorAction SilentlyContinue } catch { $null }
        $status = if ($available) { "🟢 Available" } else { "🔴 Not Found" }
        Write-Host "   $status $serverName - $($server.command)" -ForegroundColor White
        Write-Host "      💡 $($server.description)" -ForegroundColor Gray
    }
}

function Test-AllConnections {
    Write-Host "`n🔍 Testing MCP Ecosystem Connections..." -ForegroundColor Yellow
    Write-Host ("="*50) -ForegroundColor Gray
    
    $results = @{
        "docker" = @{}
        "local" = @{}  
        "global" = @{}
    }
    
    # Test Docker services
    Write-Host "`n🐳 Testing Docker Services:" -ForegroundColor Blue
    foreach ($serverName in $dockerServers.Keys) {
        $server = $dockerServers[$serverName]
        $dockerRunning = Test-DockerContainer $server.container
        $portOpen = Test-Port "localhost" $server.port
        
        $results.docker[$serverName] = @{
            "docker_running" = $dockerRunning
            "port_accessible" = $portOpen
            "overall" = $dockerRunning -and $portOpen
        }
        
        if ($results.docker[$serverName].overall) {
            Write-Host "   ✅ $serverName - Fully operational" -ForegroundColor Green
            
            # Test API endpoint if available
            if ($server.api_url) {
                try {
                    $response = Invoke-WebRequest -Uri "$($server.api_url)/health" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
                    if ($response.StatusCode -eq 200) {
                        Write-Host "      🌐 API endpoint responsive" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "      ⚠️ API endpoint may not be ready" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "   ❌ $serverName - Issues detected" -ForegroundColor Red
            if (!$dockerRunning) { Write-Host "      🐳 Container not running" -ForegroundColor Red }
            if (!$portOpen) { Write-Host "      🔌 Port $($server.port) not accessible" -ForegroundColor Red }
        }
    }
    
    # Test Local services  
    Write-Host "`n📁 Testing Local Services:" -ForegroundColor Blue
    foreach ($serverName in $localServers.Keys) {
        $server = $localServers[$serverName]
        $portOpen = Test-Port "localhost" $server.port
        $pathExists = Test-Path $server.path
        
        $results.local[$serverName] = @{
            "path_exists" = $pathExists
            "port_accessible" = $portOpen
            "overall" = $pathExists -and $portOpen
        }
        
        if ($results.local[$serverName].overall) {
            Write-Host "   ✅ $serverName - Fully operational at $($server.url)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $serverName - Issues detected" -ForegroundColor Red  
            if (!$pathExists) { Write-Host "      📁 Path not found: $($server.path)" -ForegroundColor Red }
            if (!$portOpen) { Write-Host "      🔌 Port $($server.port) not accessible" -ForegroundColor Red }
        }
    }
    
    # Test Global services
    Write-Host "`n🌍 Testing Global Services:" -ForegroundColor Blue
    foreach ($serverName in $globalServers.Keys) {
        $server = $globalServers[$serverName]
        $commandExists = try { Get-Command $server.command -ErrorAction SilentlyContinue } catch { $null }
        
        $results.global[$serverName] = @{
            "command_available" = [bool]$commandExists
            "overall" = [bool]$commandExists
        }
        
        if ($results.global[$serverName].overall) {
            Write-Host "   ✅ $serverName - Command available: $($server.command)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $serverName - Command not found: $($server.command)" -ForegroundColor Red
        }
    }
    
    # Summary
    $dockerSuccess = ($results.docker.Values | Where-Object { $_.overall }).Count
    $localSuccess = ($results.local.Values | Where-Object { $_.overall }).Count  
    $globalSuccess = ($results.global.Values | Where-Object { $_.overall }).Count
    
    Write-Host "`n📊 Connection Test Summary:" -ForegroundColor Yellow
    Write-Host "   🐳 Docker: $dockerSuccess/$($dockerServers.Count) operational" -ForegroundColor $(if ($dockerSuccess -eq $dockerServers.Count) { "Green" } else { "Yellow" })
    Write-Host "   📁 Local: $localSuccess/$($localServers.Count) operational" -ForegroundColor $(if ($localSuccess -eq $localServers.Count) { "Green" } else { "Yellow" })
    Write-Host "   🌍 Global: $globalSuccess/$($globalServers.Count) available" -ForegroundColor $(if ($globalSuccess -eq $globalServers.Count) { "Green" } else { "Yellow" })
}

function Start-CoreEcosystem {
    Write-Host "`n🚀 Starting Core MCP Ecosystem..." -ForegroundColor Green
    Write-Host ("="*40) -ForegroundColor Gray
    
    # Start Docker services
    Write-Host "`n🐳 Starting Docker Services:" -ForegroundColor Blue
    foreach ($serverName in $dockerServers.Keys) {
        $server = $dockerServers[$serverName]
        if (!(Test-DockerContainer $server.container)) {
            Write-Host "   🚀 Starting Docker container: $($server.container)" -ForegroundColor Cyan
            try {
                docker start $server.container | Out-Null
                Start-Sleep 3
                if (Test-DockerContainer $server.container) {
                    Write-Host "   ✅ $serverName container started" -ForegroundColor Green
                } else {
                    Write-Host "   ❌ Failed to start $serverName container" -ForegroundColor Red
                }
            } catch {
                Write-Host "   ❌ Error starting $serverName : $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "   ✅ $serverName already running" -ForegroundColor Green
        }
    }
    
    # Start key local services
    Write-Host "`n📁 Starting Core Local Services:" -ForegroundColor Blue
    $coreServices = @("archon-mcp", "metamcp-local", "infisical-mcp")
    
    foreach ($serviceName in $coreServices) {
        if ($localServers.ContainsKey($serviceName)) {
            $server = $localServers[$serviceName]
            if (!(Test-Port "localhost" $server.port)) {
                Start-LocalMCPServer $serviceName $server
            } else {
                Write-Host "   ✅ $serviceName already running at $($server.url)" -ForegroundColor Green
            }
        }
    }
}

# Main execution
if ($ShowUrls) {
    Show-AllServices
}
elseif ($TestConnections) {
    Test-AllConnections
}
elseif ($StartAll) {
    Start-CoreEcosystem
    Start-Sleep 2
    Test-AllConnections
}
else {
    Show-AllServices
    Write-Host "`n🔗 Connection Options:" -ForegroundColor Yellow
    Write-Host "   • Use -StartAll to start core ecosystem" -ForegroundColor White
    Write-Host "   • Use -TestConnections to test all services" -ForegroundColor White
    Write-Host "   • Use -ShowUrls to see service map" -ForegroundColor White
    
    Write-Host "`n🎯 Quick Access URLs:" -ForegroundColor Cyan
    Write-Host "   🐳 Docker MetaMCP: http://localhost:12008" -ForegroundColor Blue
    Write-Host "   📁 Local Archon: http://localhost:3002" -ForegroundColor Blue  
    Write-Host "   📁 Local MetaMCP: http://localhost:3000" -ForegroundColor Blue
    Write-Host "   🔐 Infisical MCP: http://localhost:3001" -ForegroundColor Blue
    Write-Host "   🧠 Memory Services: localhost:3004 (Mem0), localhost:3005 (Zep)" -ForegroundColor Blue
    
    Write-Host "`n⚡ FastMCP Access:" -ForegroundColor Cyan
    Write-Host "   • Command: fastmcp --help" -ForegroundColor White
    Write-Host "   • Start server: fastmcp serve" -ForegroundColor White
    Write-Host "   • Web UI: Check fastmcp documentation for web interface" -ForegroundColor White
}

Write-Host "`n✅ MCP ecosystem connector complete!" -ForegroundColor Green