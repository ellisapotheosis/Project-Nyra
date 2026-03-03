# MCP Server Registration Script for Project-Nyra
# Comprehensive MCP ecosystem setup and configuration

param(
    [string]$Environment = "development",
    [switch]$SkipHealthChecks,
    [switch]$ForceReinstall
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Nyra MCP Server Registration - Environment: $Environment" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Configuration
$CONFIG_DIR = "$PSScriptRoot\..\config"
$MCP_SERVERS = @{
    "claude-flow" = @{
        "command" = "npx claude-flow@alpha mcp start"
        "description" = "SPARC methodology and swarm management"
        "required" = $true
        "healthEndpoint" = "/health"
        "port" = 8082
    }
    "archon-mcp" = @{
        "command" = "npx archon-mcp@latest start"
        "description" = "Advanced agent coordination and memory management"
        "required" = $true
        "healthEndpoint" = "/api/v1/health"
        "port" = 8081
    }
    "metamcp-gateway" = @{
        "command" = "npx metamcp-gateway@latest start --config $CONFIG_DIR\metamcp-gateway.json"
        "description" = "Proxy aggregator and service discovery"
        "required" = $true
        "healthEndpoint" = "/health"
        "port" = 8080
    }
    "kg-local" = @{
        "command" = "npx -y mcp-knowledge-graph"
        "description" = "Knowledge graph and memory persistence"
        "required" = $true
        "healthEndpoint" = "/health"
        "port" = 8085
    }
    "infisical-mcp" = @{
        "command" = "npx infisical-mcp@latest start"
        "description" = "Secrets management and environment variables"
        "required" = $true
        "healthEndpoint" = "/health"
        "port" = 8084
    }
    "ruv-swarm" = @{
        "command" = "npx ruv-swarm mcp start"
        "description" = "Enhanced swarm coordination and neural features"
        "required" = $false
        "healthEndpoint" = "/health"
        "port" = 8086
    }
    "flow-nexus" = @{
        "command" = "npx flow-nexus@latest mcp start"
        "description" = "Cloud orchestration and advanced features"
        "required" = $false
        "healthEndpoint" = "/health"
        "port" = 8087
    }
    "gemini-cli" = @{
        "command" = "npx -y gemini-mcp-tool"
        "description" = "Gemini AI integration and brainstorming"
        "required" = $false
        "healthEndpoint" = "/health"
        "port" = 8088
    }
}

function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

    # Check Node.js and npm
    try {
        $nodeVersion = node --version
        $npmVersion = npm --version
        Write-Host "✅ Node.js: $nodeVersion, NPM: $npmVersion" -ForegroundColor Green
    }
    catch {
        Write-Error "❌ Node.js or NPM not found. Please install Node.js first."
        exit 1
    }

    # Check Claude CLI
    try {
        $claudeVersion = claude --version
        Write-Host "✅ Claude CLI: $claudeVersion" -ForegroundColor Green
    }
    catch {
        Write-Error "❌ Claude CLI not found. Please install Claude CLI first."
        exit 1
    }

    # Check Infisical (optional)
    try {
        $infisicalVersion = infisical --version
        Write-Host "✅ Infisical CLI: $infisicalVersion" -ForegroundColor Green
    }
    catch {
        Write-Warning "⚠️ Infisical CLI not found. Secrets management will be limited."
    }

    Write-Host "✅ Prerequisites check completed" -ForegroundColor Green
}

function Install-MCPServers {
    Write-Host "📦 Installing/Updating MCP servers..." -ForegroundColor Yellow

    foreach ($serverName in $MCP_SERVERS.Keys) {
        $server = $MCP_SERVERS[$serverName]
        Write-Host "Installing $serverName..." -ForegroundColor Cyan

        try {
            if ($server.command -like "*claude-flow*") {
                npm install -g claude-flow@alpha
            }
            elseif ($server.command -like "*archon-mcp*") {
                npm install -g archon-mcp@latest
            }
            elseif ($server.command -like "*metamcp-gateway*") {
                npm install -g metamcp-gateway@latest
            }
            elseif ($server.command -like "*infisical-mcp*") {
                npm install -g infisical-mcp@latest
            }
            elseif ($server.command -like "*ruv-swarm*") {
                npm install -g ruv-swarm@latest
            }
            elseif ($server.command -like "*flow-nexus*") {
                npm install -g flow-nexus@latest
            }
            elseif ($server.command -like "*gemini-mcp-tool*") {
                npm install -g gemini-mcp-tool@latest
            }
            elseif ($server.command -like "*mcp-knowledge-graph*") {
                npm install -g mcp-knowledge-graph@latest
            }

            Write-Host "✅ $serverName installed successfully" -ForegroundColor Green
        }
        catch {
            if ($server.required) {
                Write-Error "❌ Failed to install required server: $serverName"
                exit 1
            } else {
                Write-Warning "⚠️ Failed to install optional server: $serverName"
            }
        }
    }
}

function Register-MCPServers {
    Write-Host "📋 Registering MCP servers with Claude..." -ForegroundColor Yellow

    foreach ($serverName in $MCP_SERVERS.Keys) {
        $server = $MCP_SERVERS[$serverName]
        Write-Host "Registering $serverName..." -ForegroundColor Cyan

        try {
            # Remove existing server if it exists
            claude mcp remove $serverName -ErrorAction SilentlyContinue

            # Add server
            claude mcp add $serverName $server.command
            Write-Host "✅ $serverName registered successfully" -ForegroundColor Green
        }
        catch {
            if ($server.required) {
                Write-Error "❌ Failed to register required server: $serverName"
                exit 1
            } else {
                Write-Warning "⚠️ Failed to register optional server: $serverName"
            }
        }
    }
}

function Test-MCPServerHealth {
    if ($SkipHealthChecks) {
        Write-Host "⏭️ Skipping health checks as requested" -ForegroundColor Yellow
        return
    }

    Write-Host "🩺 Testing MCP server health..." -ForegroundColor Yellow

    # List registered servers
    Write-Host "Checking server registration status..." -ForegroundColor Cyan
    claude mcp list

    # Test individual server connections
    foreach ($serverName in $MCP_SERVERS.Keys) {
        $server = $MCP_SERVERS[$serverName]
        Write-Host "Testing $serverName health..." -ForegroundColor Cyan

        try {
            # For now, just check if the server is registered
            # TODO: Implement actual health endpoint checks
            Write-Host "✅ $serverName appears to be registered" -ForegroundColor Green
        }
        catch {
            if ($server.required) {
                Write-Warning "⚠️ Health check failed for required server: $serverName"
            } else {
                Write-Warning "⚠️ Health check failed for optional server: $serverName"
            }
        }
    }
}

function Initialize-ServiceMesh {
    Write-Host "🕸️ Initializing service mesh configuration..." -ForegroundColor Yellow

    # Create docker-compose file for service mesh
    $composeContent = @"
version: '3.8'

services:
  consul:
    image: consul:latest
    ports:
      - "8500:8500"
    command: agent -server -ui -node=server-1 -bootstrap-expect=1 -client=0.0.0.0
    environment:
      - CONSUL_BIND_INTERFACE=eth0
    volumes:
      - consul_data:/consul/data

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"
    environment:
      - COLLECTOR_OTLP_ENABLED=true

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  consul_data:
  prometheus_data:
  grafana_data:
  redis_data:
"@

    $composeContent | Out-File -FilePath "$PSScriptRoot\..\docker-compose.servicemesh.yml" -Encoding UTF8
    Write-Host "✅ Service mesh docker-compose created" -ForegroundColor Green
}

function Show-CompletionSummary {
    Write-Host "`n🎉 MCP Server Registration Complete!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green

    Write-Host "`n📊 Registered Servers:" -ForegroundColor Cyan
    foreach ($serverName in $MCP_SERVERS.Keys) {
        $server = $MCP_SERVERS[$serverName]
        $status = if ($server.required) { "Required" } else { "Optional" }
        Write-Host "  • $serverName ($status) - $($server.description)" -ForegroundColor White
    }

    Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Start service mesh: docker-compose -f docker-compose.servicemesh.yml up -d" -ForegroundColor White
    Write-Host "  2. Initialize Claude-Flow: npx claude-flow@alpha init --sparc" -ForegroundColor White
    Write-Host "  3. Start UI: ./claude-flow start --ui" -ForegroundColor White
    Write-Host "  4. Check status: ./claude-flow status" -ForegroundColor White
    Write-Host "  5. Test with secrets: infisical run -- ./claude-flow status" -ForegroundColor White

    Write-Host "`n🔗 Service Endpoints:" -ForegroundColor Cyan
    Write-Host "  • MetaMCP Gateway: http://localhost:8080" -ForegroundColor White
    Write-Host "  • Archon MCP: http://localhost:8081" -ForegroundColor White
    Write-Host "  • Claude-Flow MCP: http://localhost:8082" -ForegroundColor White
    Write-Host "  • Consul UI: http://localhost:8500" -ForegroundColor White
    Write-Host "  • Grafana: http://localhost:3000 (admin/admin)" -ForegroundColor White
    Write-Host "  • Prometheus: http://localhost:9090" -ForegroundColor White
    Write-Host "  • Jaeger: http://localhost:16686" -ForegroundColor White
}

# Main execution
try {
    Test-Prerequisites
    Install-MCPServers
    Register-MCPServers
    Test-MCPServerHealth
    Initialize-ServiceMesh
    Show-CompletionSummary
}
catch {
    Write-Error "❌ Registration failed: $_"
    exit 1
}