<#
.SYNOPSIS
    Complete Claude-Flow Bootstrapper - Comprehensive initialization for multi-agent mortgage assistant
    
.DESCRIPTION
    One-stop setup for Claude-Flow with all orchestrators, MCP servers, agents, and infrastructure
    Supports distributed 4-PC setup via Tailscale + local orchestration via Cloudflare tunnels
    
.PARAMETER Environment
    Target:  development, staging, production
    
. PARAMETER Mode
    Setup mode: full, minimal, agents-only, mcp-only
    
. PARAMETER DeploymentTarget
    Where to deploy: local, docker, koyeb, hybrid
#>

param(
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment = 'development',
    
    [ValidateSet('full', 'minimal', 'agents-only', 'mcp-only')]
    [string]$Mode = 'full',
    
    [ValidateSet('local', 'docker', 'koyeb', 'hybrid')]
    [string]$DeploymentTarget = 'hybrid'
)

$ErrorActionPreference = "Stop"
$VerbosePreference = "Continue"

Write-Host "
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║     🚀 CLAUDE-FLOW COMPREHENSIVE BOOTSTRAPPER v2.0.0                      ║
║                                                                            ║
║     RateHunter Multi-Agent Mortgage Assistant Initialization              ║
║     Distributed 4-PC + Cloud Infrastructure Setup                         ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  Environment: $Environment"
Write-Host "  Mode:  $Mode"
Write-Host "  Deployment:  $DeploymentTarget"

# ===========================
# PHASE 1: PREREQUISITE CHECKS
# ===========================

function Test-Prerequisites {
    Write-Host "`n🔍 PHASE 1: Checking Prerequisites..." -ForegroundColor Cyan
    
    $missingTools = @()
    
    # Check Node.js
    try {
        $nodeVersion = (node --version).TrimStart('v')
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        $missingTools += "Node.js 20+"
    }
    
    # Check npm
    try {
        $npmVersion = (npm --version)
        Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    } catch {
        $missingTools += "npm 9+"
    }
    
    # Check Git
    try {
        git --version | Out-Null
        Write-Host "✅ Git: installed" -ForegroundColor Green
    } catch {
        $missingTools += "Git"
    }
    
    # Check Docker (if docker deployment)
    if ($DeploymentTarget -match "docker|hybrid") {
        try {
            docker --version | Out-Null
            Write-Host "✅ Docker: installed" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Docker:  not found (required for docker deployment)" -ForegroundColor Yellow
        }
    }
    
    # Check Tailscale (if hybrid/distributed)
    if ($DeploymentTarget -match "hybrid|koyeb") {
        try {
            tailscale status | Out-Null
            Write-Host "✅ Tailscale: connected" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Tailscale: not found (required for distributed setup)" -ForegroundColor Yellow
        }
    }
    
    if ($missingTools.Count -gt 0) {
        Write-Host "`n❌ Missing prerequisites:" -ForegroundColor Red
        $missingTools | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
        throw "Cannot proceed without prerequisites"
    }
    
    Write-Host "✅ All prerequisites met!" -ForegroundColor Green
}

# ===========================
# PHASE 2: DIRECTORY STRUCTURE
# ===========================

function Initialize-DirectoryStructure {
    Write-Host "`n📁 PHASE 2: Setting up Directory Structure..." -ForegroundColor Cyan
    
    $baseDir = Get-Location
    $structure = @(
        "claude-flow-workspace",
        "claude-flow-workspace/orchestrators",
        "claude-flow-workspace/mcp-servers",
        "claude-flow-workspace/agents",
        "claude-flow-workspace/configs",
        "claude-flow-workspace/infrastructure",
        "claude-flow-workspace/docker",
        "claude-flow-workspace/kubernetes",
        "claude-flow-workspace/scripts",
        "claude-flow-workspace/logs",
        "claude-flow-workspace/data",
        "claude-flow-workspace/plugins",
        "claude-flow-workspace/monitors",
        "claude-flow-workspace/templates"
    )
    
    foreach ($dir in $structure) {
        $fullPath = Join-Path $baseDir $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-Host "✅ Created:  $dir" -ForegroundColor Green
        }
    }
    
    return $baseDir
}

# ===========================
# PHASE 3: CLAUDE-FLOW INSTALLATION
# ===========================

function Install-ClaudeFlow {
    param([string]$WorkspaceDir)
    
    Write-Host "`n📦 PHASE 3: Installing Claude-Flow..." -ForegroundColor Cyan
    
    # Install main Claude-Flow
    Write-Host "Installing claude-flow@alpha..." -ForegroundColor Yellow
    npm install -g claude-flow@alpha
    
    # Install supporting tools
    Write-Host "Installing supporting CLIs..." -ForegroundColor Yellow
    npm install -g `
        ruvnet-roo `
        ruvnet-sparc2 `
        ruv-nexus-flow `
        @anthropic-ai/claude-code `
        langchain `
        flowise `
        letta
    
    # Verify installations
    Write-Host "Verifying installations..." -ForegroundColor Yellow
    npx claude-flow@alpha --version
    
    Write-Host "✅ Claude-Flow installed successfully" -ForegroundColor Green
}

# ===========================
# PHASE 4: ORCHESTRATOR SETUP
# ===========================

function Setup-Orchestrators {
    param([string]$WorkspaceDir)
    
    Write-Host "`n🎯 PHASE 4: Setting up Orchestrators..." -ForegroundColor Cyan
    
    # Initialize Archon MCP
    Write-Host "Setting up Archon MCP Orchestrator..." -ForegroundColor Yellow
    
    $archonConfig = @{
        name = "archon-orchestrator"
        type = "archon-mcp"
        role = "primary-orchestrator"
        enabled = $true
        config = @{
            maxAgents = 20
            strategy = "hierarchical"
            routing = "intelligent"
            memory = "persistent"
        }
    } | ConvertTo-Json
    
    Set-Content -Path "$WorkspaceDir/orchestrators/archon-config.json" -Value $archonConfig
    Write-Host "✅ Archon MCP configured" -ForegroundColor Green
    
    # Initialize Claude-Flow SPARC
    Write-Host "Setting up Claude-Flow SPARC Orchestrator..." -ForegroundColor Yellow
    npx claude-flow@alpha init --sparc --enhanced --verify --force
    
    Write-Host "✅ SPARC Orchestrator initialized" -ForegroundColor Green
}

# ===========================
# PHASE 5: MCP SERVERS SETUP
# ===========================

function Setup-MCPServers {
    param([string]$WorkspaceDir)
    
    Write-Host "`n🔌 PHASE 5: Setting up MCP Servers..." -ForegroundColor Cyan
    
    $mcpServers = @(
        @{
            name = "metamcp-aggregator"
            type = "mcp-server"
            port = 12008
            role = "aggregator"
        },
        @{
            name = "archon-mcp-server"
            type = "mcp-server"
            port = 12009
            role = "orchestration"
        },
        @{
            name = "infisical-mcp"
            type = "mcp-server"
            port = 12010
            role = "secrets"
        },
        @{
            name = "smart-tree-mcp"
            type = "mcp-server"
            port = 12011
            role = "analysis"
        },
        @{
            name = "codanna-mcp"
            type = "mcp-server"
            port = 12012
            role = "code-review"
        }
    )
    
    foreach ($server in $mcpServers) {
        Write-Host "Configuring $($server.name) on port $($server.port)..." -ForegroundColor Yellow
        
        $config = $server | ConvertTo-Json
        $filename = "$($server.name)-config.json"
        Set-Content -Path "$WorkspaceDir/mcp-servers/$filename" -Value $config
        
        Write-Host "✅ $($server.name) configured" -ForegroundColor Green
    }
}

# ===========================
# PHASE 6: AGENT SETUP
# ===========================

function Setup-Agents {
    param([string]$WorkspaceDir)
    
    Write-Host "`n👥 PHASE 6: Setting up Agents..." -ForegroundColor Cyan
    
    # Define 15+ agents for RateHunter
    $agents = @(
        @{ name = "lead-intake-agent"; role = "lead-processing"; model = "claude-opus-4" },
        @{ name = "qualification-agent"; role = "lead-analysis"; model = "claude-3. 5-sonnet" },
        @{ name = "quote-generator-agent"; role = "pricing"; model = "claude-3.5-sonnet" },
        @{ name = "documentation-agent"; role = "document-management"; model = "claude-opus-4" },
        @{ name = "compliance-checker-agent"; role = "regulatory"; model = "claude-opus-4" },
        @{ name = "email-composer-agent"; role = "communication"; model = "claude-3.5-haiku" },
        @{ name = "sms-handler-agent"; role = "messaging"; model = "claude-3.5-haiku" },
        @{ name = "voice-assistant-agent"; role = "voice-interaction"; model = "claude-opus-4" },
        @{ name = "scheduler-agent"; role = "task-orchestration"; model = "claude-3.5-sonnet" },
        @{ name = "analytics-agent"; role = "reporting"; model = "claude-3.5-sonnet" },
        @{ name = "rate-hunter-agent"; role = "market-analysis"; model = "claude-opus-4" },
        @{ name = "underwriting-agent"; role = "risk-assessment"; model = "claude-opus-4" },
        @{ name = "closing-coordinator-agent"; role = "process-management"; model = "claude-3.5-sonnet" },
        @{ name = "crm-sync-agent"; role = "data-integration"; model = "claude-3.5-haiku" },
        @{ name = "audit-logger-agent"; role = "compliance-logging"; model = "claude-3.5-haiku" }
    )
    
    foreach ($agent in $agents) {
        Write-Host "Setting up $($agent.name)..." -ForegroundColor Yellow
        
        $config = @{
            name = $agent. name
            role = $agent.role
            model = $agent.model
            enabled = $true
            capabilities = @()
        } | ConvertTo-Json
        
        $filename = "$($agent.name)-config.json"
        Set-Content -Path "$WorkspaceDir/agents/$filename" -Value $config
        
        Write-Host "✅ $($agent. name) configured" -ForegroundColor Green
    }
    
    Write-Host "`n✅ All 15 agents configured successfully!" -ForegroundColor Cyan
}

# ===========================
# PHASE 7: INFISICAL INTEGRATION
# ===========================

function Setup-Infisical {
    param([string]$WorkspaceDir)
    
    Write-Host "`n🔐 PHASE 7: Setting up Infisical Integration..." -ForegroundColor Cyan
    
    $infisicalConfig = @{
        name = "infisical-secrets-management"
        enabled = $true
        mcp_server = @{
            enabled = $true
            port = 12010
        }
        agent = @{
            enabled = $true
            mode = "sidecar"
        }
        sidecar = @{
            enabled = $true
            image = "infisical/infisical-sidecar:latest"
        }
    } | ConvertTo-Json
    
    Set-Content -Path "$WorkspaceDir/configs/infisical-config.json" -Value $infisicalConfig
    
    Write-Host "✅ Infisical integration configured" -ForegroundColor Green
}

# ===========================
# PHASE 8: DOCKER SETUP (if selected)
# ===========================

function Setup-Docker {
    param([string]$WorkspaceDir)
    
    Write-Host "`n🐳 PHASE 8: Setting up Docker Environment..." -ForegroundColor Cyan
    
    # Create docker-compose files
    $dockerCompose = @"
version: '3.8'

services:
  # Orchestrators
  archon-orchestrator: 
    image: archon-ai/archon-mcp:latest
    ports:
      - "12009:12009"
    environment: 
      - MAX_AGENTS=20
      - MODE=hierarchical
    networks:
      - ratehunter

  # Claude-Flow
  claude-flow: 
    image: ruvnet/claude-flow:v2-alpha
    ports:
      - "3000:3000"
      - "8080:8080"
    environment:
      - NODE_ENV=$Environment
      - CLAUDE_API_KEY=\${CLAUDE_API_KEY}
    networks:
      - ratehunter

  # MCP Aggregator (MetaMCP)
  metamcp:
    image: metatool-ai/metamcp:latest
    ports:
      - "12008:12008"
    networks:
      - ratehunter

  # Infisical
  infisical-sidecar:
    image: infisical/infisical-sidecar:latest
    ports: 
      - "12010:12010"
    networks:
      - ratehunter

  # Monitoring
  prometheus:
    image:  prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes: 
      - ./configs/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - ratehunter

  grafana:
    image:  grafana/grafana:latest
    ports:
      - "3001:3000"
    networks:
      - ratehunter

networks:
  ratehunter: 
    driver: bridge
"@
    
    Set-Content -Path "$WorkspaceDir/docker/docker-compose.yml" -Value $dockerCompose
    Write-Host "✅ Docker Compose configured" -ForegroundColor Green
}

# ===========================
# PHASE 9: KUBERNETES SETUP (if selected)
# ===========================

function Setup-Kubernetes {
    param([string]$WorkspaceDir)
    
    Write-Host "`n☸️  PHASE 9: Setting up Kubernetes Configuration..." -ForegroundColor Cyan
    
    # Create namespace
    kubectl create namespace claude-flow --dry-run=client -o yaml | kubectl apply -f -
    
    Write-Host "✅ Kubernetes namespace configured" -ForegroundColor Green
}

# ===========================
# PHASE 10: INFRASTRUCTURE SETUP
# ===========================

function Setup-Infrastructure {
    param([string]$WorkspaceDir)
    
    Write-Host "`n🏗️  PHASE 10: Setting up Infrastructure Configuration..." -ForegroundColor Cyan
    
    # Tailscale configuration
    $tailscaleConfig = @{
        enabled = $true
        nodes = @(
            @{ name = "orchestrator-mini"; type = "orchestrator" },
            @{ name = "worker-rtx3090ti"; type = "worker" },
            @{ name = "worker-rtx3060"; type = "worker" },
            @{ name = "worker-rtx5090"; type = "worker" }
        )
    } | ConvertTo-Json
    
    Set-Content -Path "$WorkspaceDir/infrastructure/tailscale-config.json" -Value $tailscaleConfig
    
    # Cloudflare configuration
    $cloudflareConfig = @{
        domain = "ratehunter.net"
        subdomains = @(
            @{ name = "api"; target = "koyeb-instance" },
            @{ name = "ui"; target = "open-webui" },
            @{ name = "chat"; target = "lobechat" },
            @{ name = "dify"; target = "dify-instance" },
            @{ name = "metrics"; target = "grafana" },
            @{ name = "orchestrator"; target = "local-orchestrator" }
        )
    } | ConvertTo-Json
    
    Set-Content -Path "$WorkspaceDir/infrastructure/cloudflare-config. json" -Value $cloudflareConfig
    
    Write-Host "✅ Infrastructure configuration complete" -ForegroundColor Green
}

# ===========================
# PHASE 11: CONFIGURATION TEMPLATES
# ===========================

function Setup-ConfigurationTemplates {
    param([string]$WorkspaceDir)
    
    Write-Host "`n📋 PHASE 11: Setting up Configuration Templates..." -ForegroundColor Cyan
    
    # Claude-Flow config
    $claudeFlowConfig = @{
        environment = $Environment
        orchestrators = @{
            archon = @{ enabled = $true }
            sparc = @{ enabled = $true }
        }
        agents = @{
            count = 15
            models = @("claude-opus-4", "claude-3.5-sonnet", "claude-3.5-haiku")
        }
    } | ConvertTo-Json
    
    Set-Content -Path "$WorkspaceDir/templates/claude-flow-config-template.json" -Value $claudeFlowConfig
    
    Write-Host "✅ Configuration templates created" -ForegroundColor Green
}

# ===========================
# EXECUTION
# ===========================

function Main {
    try {
        Test-Prerequisites
        $workspaceDir = Initialize-DirectoryStructure
        
        if ($Mode -in @("full", "mcp-only") -or $DeploymentTarget -in @("docker", "hybrid")) {
            Install-ClaudeFlow -WorkspaceDir $workspaceDir
        }
        
        if ($Mode -in @("full", "agents-only")) {
            Setup-Orchestrators -WorkspaceDir $workspaceDir
            Setup-MCPServers -WorkspaceDir $workspaceDir
            Setup-Agents -WorkspaceDir $workspaceDir
            Setup-Infisical -WorkspaceDir $workspaceDir
        }
        
        if ($DeploymentTarget -in @("docker", "hybrid")) {
            Setup-Docker -WorkspaceDir $workspaceDir
        }
        
        if ($DeploymentTarget -eq "koyeb") {
            Setup-Kubernetes -WorkspaceDir $workspaceDir
        }
        
        Setup-Infrastructure -WorkspaceDir $workspaceDir
        Setup-ConfigurationTemplates -WorkspaceDir $workspaceDir
        
        Write-Host "`n
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║     ✅ CLAUDE-FLOW BOOTSTRAPPING COMPLETE!                                 ║
║                                                                            ║
║     Next Steps:                                                           ║
║     1. Review configurations in:  $workspaceDir                            ║
║     2. Set environment variables in: . env                                ║
║     3. Start services: docker-compose up -d                              ║
║     4. Access UI:  http://localhost:3000                                  ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan
        
    } catch {
        Write-Host "`n❌ Bootstrapping failed:  $_" -ForegroundColor Red
        exit 1
    }
}

Main