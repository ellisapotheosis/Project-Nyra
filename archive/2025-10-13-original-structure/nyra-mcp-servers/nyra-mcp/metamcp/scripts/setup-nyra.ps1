# MetaMCP Setup Script for Project Nyra (PowerShell)
# This script sets up MetaMCP as the central MCP aggregator

param(
    [switch]$SkipDocker,
    [switch]$Force
)

Write-Host "🚀 Setting up MetaMCP for Project Nyra..." -ForegroundColor Cyan

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check prerequisites
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        if ($majorVersion -lt 18) {
            Write-Error "Node.js version 18+ required. Current version: $nodeVersion"
            exit 1
        }
        Write-Success "Node.js $nodeVersion ✓"
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    }
    
    # Check pnpm
    try {
        $pnpmVersion = pnpm --version
        Write-Success "pnpm $pnpmVersion ✓"
    }
    catch {
        Write-Warning "pnpm not found. Installing pnpm..."
        npm install -g pnpm
        Write-Success "pnpm installed"
    }
    
    # Check Docker (if not skipped)
    if (-not $SkipDocker) {
        try {
            $dockerVersion = docker --version
            Write-Success "Docker available ✓"
        }
        catch {
            Write-Warning "Docker not found. Use -SkipDocker to skip PostgreSQL setup."
            Write-Warning "You will need to provide your own PostgreSQL instance."
        }
    }
}

# Setup PostgreSQL database
function Setup-Database {
    if ($SkipDocker) {
        Write-Warning "Skipping Docker PostgreSQL setup. Ensure you have PostgreSQL running on port 5433."
        return
    }
    
    Write-Status "Setting up PostgreSQL database for MetaMCP..."
    
    # Check if container already exists
    $existingContainer = docker ps -a --filter "name=nyra-metamcp-postgres" --format "{{.Names}}"
    if ($existingContainer -eq "nyra-metamcp-postgres") {
        Write-Warning "PostgreSQL container already exists. Restarting..."
        docker stop nyra-metamcp-postgres | Out-Null
        docker rm nyra-metamcp-postgres | Out-Null
    }
    
    # Start PostgreSQL container
    Write-Status "Starting PostgreSQL container..."
    $dockerResult = docker run -d `
        --name nyra-metamcp-postgres `
        -e POSTGRES_USER=nyra_metamcp `
        -e POSTGRES_PASSWORD=nyra_m3t4mcp_2024 `
        -e POSTGRES_DB=nyra_metamcp_db `
        -p 5433:5432 `
        postgres:15
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "PostgreSQL container started on port 5433"
    }
    else {
        Write-Error "Failed to start PostgreSQL container"
        exit 1
    }
    
    # Wait for PostgreSQL to be ready
    Write-Status "Waiting for PostgreSQL to be ready..."
    Start-Sleep -Seconds 10
    
    # Test connection
    $testResult = docker exec nyra-metamcp-postgres pg_isready -U nyra_metamcp
    if ($LASTEXITCODE -eq 0) {
        Write-Success "PostgreSQL is ready"
    }
    else {
        Write-Error "PostgreSQL failed to start properly"
        exit 1
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Status "Installing MetaMCP dependencies..."
    
    if (-not (Test-Path "pnpm-lock.yaml")) {
        Write-Error "pnpm-lock.yaml not found. Are you in the MetaMCP directory?"
        exit 1
    }
    
    pnpm install
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependencies installed successfully"
    }
    else {
        Write-Error "Failed to install dependencies"
        exit 1
    }
}

# Setup environment configuration
function Setup-Environment {
    Write-Status "Setting up environment configuration..."
    
    # Copy Project Nyra environment configuration
    if (Test-Path ".env.nyra") {
        Copy-Item ".env.nyra" ".env.local"
        Write-Success "Project Nyra environment configuration copied to .env.local"
    }
    else {
        Write-Error ".env.nyra file not found"
        exit 1
    }
    
    # Check if Infisical is available for secrets
    try {
        $infisicalVersion = infisical --version
        Write-Status "Infisical found. Attempting to load secrets..."
        
        # Try to load Flow Nexus secrets
        try {
            $flowNexusToken = infisical secrets get FLOW_NEXUS_TOKEN --env=prod --plain
            $flowNexusUrl = infisical secrets get FLOW_NEXUS_URL --env=prod --plain
            
            if ($flowNexusToken -and $flowNexusUrl) {
                Add-Content -Path ".env.local" -Value ""
                Add-Content -Path ".env.local" -Value "# Flow Nexus configuration from Infisical"
                Add-Content -Path ".env.local" -Value "FLOW_NEXUS_TOKEN=$flowNexusToken"
                Add-Content -Path ".env.local" -Value "FLOW_NEXUS_URL=$flowNexusUrl"
                Write-Success "Flow Nexus secrets loaded from Infisical"
            }
        }
        catch {
            Write-Warning "Could not load Flow Nexus secrets from Infisical"
        }
        
        # Try to load other optional secrets
        try {
            $notionToken = infisical secrets get NOTION_TOKEN --env=prod --plain
            if ($notionToken) {
                Add-Content -Path ".env.local" -Value "NOTION_TOKEN=$notionToken"
                Write-Success "Notion token loaded from Infisical"
            }
        }
        catch {
            # Notion token is optional
        }
    }
    catch {
        Write-Warning "Infisical not found. Manual environment configuration required."
        Write-Warning "Please set FLOW_NEXUS_TOKEN and FLOW_NEXUS_URL in .env.local"
    }
}

# Run database migrations
function Invoke-Migrations {
    Write-Status "Running database migrations..."
    
    # Wait a bit more for PostgreSQL to be fully ready
    Start-Sleep -Seconds 5
    
    # Check if migrations command exists
    try {
        pnpm run db:migrate 2>$null
        Write-Success "Database migrations completed"
    }
    catch {
        try {
            pnpm run migrate 2>$null
            Write-Success "Database migrations completed"
        }
        catch {
            Write-Warning "No migration command found. Database setup may be required manually."
        }
    }
}

# Create startup script
function New-StartupScript {
    Write-Status "Creating Project Nyra startup script..."
    
    $startupScript = @'
# Project Nyra MetaMCP Startup Script (PowerShell)

Write-Host "🚀 Starting MetaMCP for Project Nyra..." -ForegroundColor Cyan

# Check if PostgreSQL container is running
$postgresRunning = docker ps --filter "name=nyra-metamcp-postgres" --format "{{.Names}}"
if (-not $postgresRunning) {
    Write-Host "Starting PostgreSQL container..." -ForegroundColor Yellow
    docker start nyra-metamcp-postgres
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to start PostgreSQL. Run setup script first." -ForegroundColor Red
        exit 1
    }
    Start-Sleep -Seconds 5
}

# Load environment variables from Infisical if available
try {
    Write-Host "Loading secrets from Infisical..." -ForegroundColor Blue
    $env:FLOW_NEXUS_TOKEN = infisical secrets get FLOW_NEXUS_TOKEN --env=prod --plain
    $env:FLOW_NEXUS_URL = infisical secrets get FLOW_NEXUS_URL --env=prod --plain
    $env:NOTION_TOKEN = infisical secrets get NOTION_TOKEN --env=prod --plain
    Write-Host "Secrets loaded successfully" -ForegroundColor Green
}
catch {
    Write-Host "Could not load secrets from Infisical" -ForegroundColor Yellow
}

# Start MetaMCP development server
Write-Host "Starting MetaMCP development server..." -ForegroundColor Blue
pnpm run dev
'@
    
    $startupScript | Out-File -FilePath "start-nyra-metamcp.ps1" -Encoding UTF8
    Write-Success "Startup script created: start-nyra-metamcp.ps1"
}

# Create Project Nyra MCP configuration
function New-McpConfig {
    Write-Status "Creating Project Nyra MCP server configuration..."
    
    $mcpConfig = @'
{
  "servers": [
    {
      "name": "Desktop Commander",
      "namespace": "dc",
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@wonderwhy-er/desktop-commander@latest"],
      "description": "File operations, process management, system commands",
      "capabilities": ["file_operations", "process_management", "system_commands"],
      "priority": 1,
      "enabled": true
    },
    {
      "name": "rUv Swarm", 
      "namespace": "ruv",
      "type": "stdio",
      "command": "npx",
      "args": ["ruv-swarm@latest", "mcp", "start"],
      "description": "Neural coordination, swarm management, memory operations",
      "capabilities": ["neural_coordination", "swarm_management", "memory_operations"],
      "priority": 2,
      "enabled": true
    },
    {
      "name": "Flow Nexus",
      "namespace": "fn", 
      "type": "stdio",
      "command": "npx",
      "args": ["flow-nexus@latest", "mcp", "start"],
      "description": "Cloud execution, GitHub integration, neural training",
      "capabilities": ["cloud_execution", "github_integration", "neural_training"],
      "environment": {
        "FLOW_NEXUS_TOKEN": "${FLOW_NEXUS_TOKEN}",
        "FLOW_NEXUS_URL": "${FLOW_NEXUS_URL}"
      },
      "priority": 3,
      "enabled": true
    },
    {
      "name": "Claude Flow",
      "namespace": "cf",
      "type": "stdio", 
      "command": "npx",
      "args": ["claude-flow@alpha", "mcp", "start"],
      "description": "Agent spawning, workflow coordination, SPARC integration",
      "capabilities": ["agent_spawning", "workflow_coordination", "sparc_integration"],
      "priority": 4,
      "enabled": true,
      "notes": "May have connection issues - fallback available"
    }
  ],
  "middleware": [
    {
      "name": "Authentication",
      "type": "auth",
      "config": {
        "method": "api-key",
        "keys": ["nyra-dev-key-2024"]
      },
      "enabled": true
    },
    {
      "name": "Logging",
      "type": "logging", 
      "config": {
        "level": "info",
        "format": "json",
        "includeRequestBody": false,
        "includeResponseBody": false
      },
      "enabled": true
    },
    {
      "name": "Request Router",
      "type": "router",
      "config": {
        "rules": [
          {
            "pattern": "github_*",
            "target": "flow-nexus",
            "description": "Route GitHub operations to Flow Nexus"
          },
          {
            "pattern": "mcp__flow-nexus__*",
            "target": "flow-nexus", 
            "description": "Route Flow Nexus tools"
          },
          {
            "pattern": "mcp__desktop-commander__*",
            "target": "desktop-commander",
            "description": "Route Desktop Commander tools"
          },
          {
            "pattern": "mcp__ruv-swarm__*", 
            "target": "ruv-swarm",
            "description": "Route rUv Swarm tools"
          },
          {
            "pattern": "sparc_*",
            "target": "claude-flow",
            "description": "Route SPARC operations to Claude Flow"
          }
        ]
      },
      "enabled": true
    }
  ],
  "global_config": {
    "request_timeout": 30000,
    "max_concurrent_requests": 100,
    "enable_metrics": true,
    "enable_health_checks": true
  }
}
'@
    
    $mcpConfig | Out-File -FilePath "nyra-mcp-servers.json" -Encoding UTF8
    Write-Success "Project Nyra MCP configuration created: nyra-mcp-servers.json"
}

# Main setup function
function Invoke-Main {
    Write-Status "Starting MetaMCP setup for Project Nyra..."
    
    Test-Prerequisites
    Setup-Database
    Install-Dependencies
    Setup-Environment
    Invoke-Migrations
    New-StartupScript
    New-McpConfig
    
    Write-Success "✅ MetaMCP setup completed successfully!"
    Write-Host ""
    Write-Host "🎯 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run: .\start-nyra-metamcp.ps1"
    Write-Host "  2. Open: http://localhost:12008"
    Write-Host "  3. Import MCP servers from: nyra-mcp-servers.json"
    Write-Host "  4. Test integration with your existing Project Nyra stack"
    Write-Host ""
    Write-Host "📚 Documentation: PROJECT_NYRA_SETUP.md"
    Write-Host ""
}

# Run main setup
Invoke-Main