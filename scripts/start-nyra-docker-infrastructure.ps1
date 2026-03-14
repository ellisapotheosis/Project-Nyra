# NYRA Docker Infrastructure Startup
# Properly starts dockerized MCP servers and development environment

param(
    [switch]$Force,
    [switch]$Verbose,
    [switch]$ProductionOnly,
    [string]$Profile = "all" # Options: orchestrator, client, all
)

$ErrorActionPreference = "Continue"

Write-Host "🐳 Starting NYRA Docker Infrastructure..." -ForegroundColor Cyan

$repoRoot = "C:\Dev\Projects\Repos\Project-Nyra"
Set-Location $repoRoot
. "$PSScriptRoot\lib\InfisicalToken.ps1"
$projectId = Get-NyraInfisicalProjectId

# Load environment variables via Infisical
Write-Host "🔐 Loading environment secrets..." -ForegroundColor Yellow
if (Get-Command infisical -ErrorAction SilentlyContinue) {
    Assert-NyraInfisicalToken
    & infisical run --projectId=$projectId --env=development -- echo "Secrets loaded" | Out-Null
}
else {
    Write-Warning "Infisical not found. Install with: winget install infisical.cli"
}

# Kill existing processes if Force is specified
if ($Force) {
    Write-Host "🔥 Stopping existing Docker containers..." -ForegroundColor Red
    docker-compose -f docker/orchestrator/docker-compose.yml down --remove-orphans
    docker-compose -f docker/client/docker-compose.yml down --remove-orphans
}

# Start orchestrator services (MCP servers on orchestrator PC)
if ($Profile -eq "orchestrator" -or $Profile -eq "all") {
    Write-Host "`n🏗️ Starting Orchestrator Services..." -ForegroundColor Magenta

    if (!(Test-Path "docker/orchestrator/docker-compose.yml")) {
        Write-Error "Orchestrator docker-compose.yml not found!"
        exit 1
    }

    Write-Host "   Starting core MCP servers..." -ForegroundColor Green
    docker-compose -f docker/orchestrator/docker-compose.yml up -d

    # Wait for services to start
    Start-Sleep -Seconds 10

    # Check orchestrator service health
    $orchestratorServices = @(
        @{ Name = "MetaMCP Router"; Port = 12008; Url = "http://localhost:12008" },
        @{ Name = "Claude-Flow Dev"; Port = 7403; Url = "http://localhost:7403" },
        @{ Name = "RuVector MCP"; Port = 7406; Url = "http://localhost:7406" },
        @{ Name = "AgentDB MCP"; Port = 7407; Url = "http://localhost:7407" },
        @{ Name = "Graphiti MCP"; Port = 8797; Url = "http://localhost:8797" },
        @{ Name = "Flow Nexus"; Port = 7401; Url = "http://localhost:7401" },
        @{ Name = "Filesystem MCP"; Port = 7400; Url = "http://localhost:7400" },
        @{ Name = "GitHub MCP"; Port = 7402; Url = "http://localhost:7402" }
    )

    Write-Host "   Checking orchestrator service health..." -ForegroundColor Cyan
    foreach ($service in $orchestratorServices) {
        $isRunning = Test-NetConnection -ComputerName localhost -Port $service.Port -InformationLevel Quiet -WarningAction SilentlyContinue
        $status = if ($isRunning) { "✅ Running" } else { "❌ Down" }

        if ($Verbose) {
            Write-Host "     $($service.Name): $status" -ForegroundColor $(if ($isRunning) { "Green" } else { "Red" })
        }
    }
}

# Start client services (UI and GPU-intensive services)
if ($Profile -eq "client" -or $Profile -eq "all") {
    Write-Host "`n🖥️ Starting Client Services..." -ForegroundColor Magenta

    if (!(Test-Path "docker/client/docker-compose.yml")) {
        Write-Error "Client docker-compose.yml not found!"
        exit 1
    }

    Write-Host "   Starting Archon OS and UI services..." -ForegroundColor Green
    docker-compose -f docker/client/docker-compose.yml up -d

    # Wait for services to start
    Start-Sleep -Seconds 15

    # Check client service health
    $clientServices = @(
        @{ Name = "Archon Frontend"; Port = 8051; Url = "http://localhost:8051" },
        @{ Name = "Archon Backend"; Port = 8080; Url = "http://localhost:8080" },
        @{ Name = "Open WebUI"; Port = 3000; Url = "http://localhost:3000" },
        @{ Name = "Serena MCP"; Port = 8092; Url = "http://localhost:8092" },
        @{ Name = "Gemini Assistant"; Port = 8093; Url = "http://localhost:8093" },
        @{ Name = "Transformers Service"; Port = 8090; Url = "http://localhost:8090" },
        @{ Name = "ONNX Runtime"; Port = 8091; Url = "http://localhost:8091" }
    )

    Write-Host "   Checking client service health..." -ForegroundColor Cyan
    foreach ($service in $clientServices) {
        $isRunning = Test-NetConnection -ComputerName localhost -Port $service.Port -InformationLevel Quiet -WarningAction SilentlyContinue
        $status = if ($isRunning) { "✅ Running" } else { "❌ Down" }

        if ($Verbose) {
            Write-Host "     $($service.Name): $status" -ForegroundColor $(if ($isRunning) { "Green" } else { "Red" })
        }
    }
}

# Start development services if not production-only
if (!$ProductionOnly) {
    Write-Host "`n🛠️ Starting Development Services..." -ForegroundColor Cyan

    # Initialize Claude-Flow memory if development containers are running
    $claudeFlowRunning = Test-NetConnection -ComputerName localhost -Port 7403 -InformationLevel Quiet -WarningAction SilentlyContinue

    if ($claudeFlowRunning) {
        Write-Host "   Initializing Claude-Flow memory systems..." -ForegroundColor Green

        try {
            # Use docker exec to run commands inside the claude-flow container
            docker exec nyra-claude-flow-dev npx claude-flow@alpha memory init --reasoningbank --agentdb --ruvector
            docker exec nyra-claude-flow-dev npx claude-flow@alpha agent memory init --reasoningbank
            Write-Host "   ✅ Claude-Flow memory initialized" -ForegroundColor Green
        }
        catch {
            Write-Warning "Failed to initialize Claude-Flow memory: $($_.Exception.Message)"
        }
    }
    else {
        Write-Warning "Claude-Flow container not running - skipping memory initialization"
    }
}

# Display comprehensive status
Write-Host "`n📊 NYRA Infrastructure Status:" -ForegroundColor Cyan

$runningContainers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Where-Object { $_ -like "nyra-*" }

if ($runningContainers) {
    Write-Host "🐳 Running Containers:" -ForegroundColor Green
    $runningContainers | ForEach-Object {
        Write-Host "   $_" -ForegroundColor Gray
    }
}
else {
    Write-Host "❌ No NYRA containers running" -ForegroundColor Red
}

# Final configuration summary
Write-Host "`n🎯 Access Points:" -ForegroundColor Yellow
Write-Host "   • Archon OS UI: http://localhost:8051" -ForegroundColor White
Write-Host "   • Open WebUI: http://localhost:3000" -ForegroundColor White
Write-Host "   • Claude-Flow Dev: http://localhost:7403" -ForegroundColor White
Write-Host "   • MetaMCP Router: http://localhost:12008" -ForegroundColor White

Write-Host "`n🔧 Claude Code Configuration:" -ForegroundColor Yellow
Write-Host "   • Primary MCP: Use docker endpoints above" -ForegroundColor White
Write-Host "   • No nexus router needed - use direct docker endpoints" -ForegroundColor White
Write-Host "   • Secrets: Use nyra-claude.ps1 wrapper" -ForegroundColor White

Write-Host "`n🚀 Next Steps:" -ForegroundColor Magenta
Write-Host "1. Use: nyra-claude.ps1 flow memory store key value" -ForegroundColor White
Write-Host "2. Configure Claude Code to use docker endpoints" -ForegroundColor White
Write-Host "3. Access Archon UI for dual orchestration" -ForegroundColor White
Write-Host "4. Use /claude-flow commands for automation" -ForegroundColor White

Write-Host "`n💡 Troubleshooting:" -ForegroundColor Gray
Write-Host "• View logs: docker-compose logs [service_name]" -ForegroundColor Gray
Write-Host "• Restart service: docker-compose restart [service_name]" -ForegroundColor Gray
Write-Host "• Stop all: docker-compose down" -ForegroundColor Gray
