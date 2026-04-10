# NYRA Nexus Router Startup Script
# Starts all 22+ MCP servers and the nexus router for comprehensive tool access

param(
    [switch]$Force,
    [switch]$Verbose,
    [string]$ConfigPath = "./config/nyra-nexus-router.json"
)

$ErrorActionPreference = "Continue"

Write-Host "🚀 Starting NYRA Nexus Router with 22+ MCP Servers..." -ForegroundColor Cyan

# Environment setup
$env:NYRA_DEV_ROOTS = "C:\Dev\Projects\Repos\Project-Nyra"
$env:NYRA_REPO_ROOT = "C:\Dev\Projects\Repos\Project-Nyra"
$env:NYRA_TIMEZONE = "America/New_York"

Write-Host "📋 Environment Configuration:" -ForegroundColor Yellow
Write-Host "   NYRA_DEV_ROOTS: $env:NYRA_DEV_ROOTS"
Write-Host "   NYRA_REPO_ROOT: $env:NYRA_REPO_ROOT"
Write-Host "   Config: $ConfigPath"

# Check if ports are available
$requiredPorts = @(12010, 7400, 7401, 7402, 7403, 7404, 7405, 7406, 7407, 7408, 8051, 8797, 12008)
Write-Host "🔍 Checking required ports..." -ForegroundColor Green

foreach ($port in $requiredPorts) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet
    if ($connection -and !$Force) {
        Write-Warning "Port $port is already in use. Use -Force to kill existing processes."
        $existingProcess = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($existingProcess) {
            $processId = $existingProcess.OwningProcess
            Write-Host "   Process using port $port`: PID $processId"
        }
    }
    elseif ($connection -and $Force) {
        Write-Host "   Killing existing process on port $port..." -ForegroundColor Red
        $existingProcess = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($existingProcess) {
            Stop-Process -Id $existingProcess.OwningProcess -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
    }
}

# Start core infrastructure servers first (these are required by other servers)
Write-Host "🏗️ Starting Core Infrastructure Servers..." -ForegroundColor Magenta

# Start MetaMCP router (serves as a local gateway)
Write-Host "   Starting MetaMCP router on port 12008..." -ForegroundColor Green
Start-Process -FilePath "npx" -ArgumentList @("meta-mcp", "--port", "12008", "--config", "config/metamcp.config.json") -NoNewWindow -PassThru

Start-Sleep -Seconds 3

# Start the localhost servers (ports 7400-7408)
Write-Host "🌐 Starting Localhost MCP Servers..." -ForegroundColor Magenta

$serverCommands = @(
    @{ Port = 7400; Name = "meta"; Command = "npx flow-nexus@latest server --name meta --port 7400" },
    @{ Port = 7401; Name = "flow-nexus"; Command = "npx flow-nexus@latest mcp start --port 7401" },
    @{ Port = 7402; Name = "roo"; Command = "npx roo-mcp --port 7402" },
    @{ Port = 7403; Name = "sparc"; Command = "npx sparc-mcp --port 7403" },
    @{ Port = 7404; Name = "sparc2"; Command = "npx sparc2-mcp --port 7404" },
    @{ Port = 7405; Name = "zep"; Command = "npx zep-mcp --port 7405" },
    @{ Port = 7406; Name = "qdrant"; Command = "npx qdrant-mcp --port 7406" },
    @{ Port = 7407; Name = "letta"; Command = "npx letta-mcp --port 7407" },
    @{ Port = 7408; Name = "memtensor"; Command = "npx memtensor-mcp --port 7408" }
)

foreach ($server in $serverCommands) {
    Write-Host "   Starting $($server.Name) on port $($server.Port)..." -ForegroundColor Green
    $args = $server.Command -split " " | Select-Object -Skip 1
    Start-Process -FilePath "npx" -ArgumentList $args -NoNewWindow -PassThru
    Start-Sleep -Seconds 1
}

# Start specialized servers
Write-Host "🔧 Starting Specialized MCP Servers..." -ForegroundColor Magenta

# Archon MCP
Write-Host "   Starting Archon MCP on port 8051..." -ForegroundColor Green
Start-Process -FilePath "npx" -ArgumentList @("archon-mcp", "--port", "8051") -NoNewWindow -PassThru

# letta with specific configuration
Write-Host "   Starting letta MCP on port 8797..." -ForegroundColor Green
Start-Process -FilePath "uvx" -ArgumentList @("getzep-letta-mcp", "--host", "0.0.0.0", "--port", "8797") -NoNewWindow -PassThru

Start-Sleep -Seconds 5

# Verify server availability
Write-Host "🔍 Verifying server availability..." -ForegroundColor Yellow
$serverHealth = @()

foreach ($port in $requiredPorts) {
    $isRunning = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
    $serverHealth += @{
        Port = $port
        Status = if ($isRunning) { "✅ Running" } else { "❌ Down" }
        Running = $isRunning
    }

    if ($Verbose) {
        Write-Host "   Port $port`: $($serverHealth[-1].Status)" -ForegroundColor $(if ($isRunning) { "Green" } else { "Red" })
    }
}

$runningServers = ($serverHealth | Where-Object { $_.Running }).Count
$totalServers = $serverHealth.Count

Write-Host "📊 Server Status: $runningServers/$totalServers servers running" -ForegroundColor $(if ($runningServers -eq $totalServers) { "Green" } else { "Yellow" })

# Start the main NYRA Nexus Router
Write-Host "🎯 Starting NYRA Nexus Router..." -ForegroundColor Cyan

if (Test-Path $ConfigPath) {
    Write-Host "   Using config: $ConfigPath" -ForegroundColor Green

    # Start the nexus router
    $routerProcess = Start-Process -FilePath "npx" -ArgumentList @(
        "flow-nexus@latest",
        "router",
        "--config", $ConfigPath,
        "--port", "12010",
        "--fuzzy-search",
        "--load-balancing"
    ) -NoNewWindow -PassThru

    Write-Host "   Nexus router started with PID: $($routerProcess.Id)" -ForegroundColor Green

    # Wait for router to initialize
    Start-Sleep -Seconds 10

    # Test router endpoint
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:12010/nyra/complete/health" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "✅ Nexus router is healthy and responding" -ForegroundColor Green
    }
    catch {
        Write-Warning "Nexus router may still be starting up. Check http://localhost:12010/nyra/complete"
    }
}
else {
    Write-Error "Configuration file not found: $ConfigPath"
    exit 1
}

# Display summary
Write-Host "`n🎉 NYRA Nexus Router Setup Complete!" -ForegroundColor Green
Write-Host "📡 Router endpoint: http://localhost:12010/nyra/complete" -ForegroundColor Cyan
Write-Host "🔑 API Key: sk_nyra_nexus_complete_2025" -ForegroundColor Yellow
Write-Host "🔍 Fuzzy search enabled for 22+ MCP servers" -ForegroundColor Magenta

# Display available endpoints
Write-Host "`n🛠️ Available Endpoints:" -ForegroundColor Yellow
Write-Host "   • Complete Suite: http://localhost:12010/nyra/complete" -ForegroundColor White
Write-Host "   • Core Tools: http://localhost:12010/nyra/core" -ForegroundColor White
Write-Host "   • Health Check: http://localhost:12010/nyra/complete/health" -ForegroundColor White
Write-Host "   • Tool Search: http://localhost:12010/nyra/complete/search?q={query}" -ForegroundColor White

# Display server counts by category
Write-Host "`n📊 Server Categories:" -ForegroundColor Yellow
Write-Host "   • Core Development: 6 servers (filesystem, git, github, docker, shell, etc.)" -ForegroundColor White
Write-Host "   • AI Orchestration: 7 servers (archon-os, ruv-swarm, flow-nexus, roo, sparc, etc.)" -ForegroundColor White
Write-Host "   • Security & Secrets: 2 servers (bitwarden, infisical)" -ForegroundColor White
Write-Host "   • Memory & Knowledge: 5 servers (qdrant, letta, mem0, zep, memtensor)" -ForegroundColor White
Write-Host "   • Web Automation: 3 servers (browser-use, puppeteer, fetch)" -ForegroundColor White
Write-Host "   • Development Tools: 4 servers (codanna, repo-docs, kilo-code, inception)" -ForegroundColor White
Write-Host "   • Gateway Routers: 2 servers (metamcp, archon)" -ForegroundColor White

Write-Host "`n✨ Fuzzy Tool Search Examples:" -ForegroundColor Magenta
Write-Host "   • Search 'git': Returns git, github, repositories" -ForegroundColor White
Write-Host "   • Search 'docker': Returns docker, docker-hub, containers" -ForegroundColor White
Write-Host "   • Search 'memory': Returns qdrant, letta, mem0, zep" -ForegroundColor White
Write-Host "   • Search 'ai': Returns archon-os, gemini, sparc, orchestration" -ForegroundColor White

Write-Host "`n🔄 To stop all servers: Stop-Process -Name node -Force" -ForegroundColor Red
Write-Host "💡 Logs are available in the individual server processes" -ForegroundColor Gray