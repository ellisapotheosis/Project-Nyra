# Nyra MCP Installation Script for Windows
# This script sets up all MCP servers with MetaMCP orchestration

param(
    [switch]$SkipDocker = $false,
    [switch]$SkipPython = $false,
    [switch]$MinimalInstall = $false
)

Write-Host "🐱✨ Nyra MCP Setup Installer" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Magenta

# Check prerequisites
function Test-Prerequisites {
    Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow
    
    $missing = @()
    
    # Check Node.js
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        $missing += "Node.js"
    } else {
        Write-Host "✅ Node.js: $(node --version)" -ForegroundColor Green
    }
    
    # Check Python
    if (!(Get-Command python -ErrorAction SilentlyContinue)) {
        $missing += "Python"
    } else {
        Write-Host "✅ Python: $(python --version)" -ForegroundColor Green
    }
    
    # Check Docker
    if (!$SkipDocker -and !(Get-Command docker -ErrorAction SilentlyContinue)) {
        $missing += "Docker"
    } elseif (!$SkipDocker) {
        Write-Host "✅ Docker: $(docker --version)" -ForegroundColor Green
    }
    
    # Check UV (Python package manager)
    if (!(Get-Command uv -ErrorAction SilentlyContinue)) {
        Write-Host "⚠️  UV not found, will install it" -ForegroundColor Yellow
    }
    
    # Check pnpm
    if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Host "⚠️  pnpm not found, will install it" -ForegroundColor Yellow
    }
    
    if ($missing.Count -gt 0) {
        Write-Host "`n❌ Missing prerequisites: $($missing -join ', ')" -ForegroundColor Red
        Write-Host "Please install them first:" -ForegroundColor Red
        if ($missing -contains "Node.js") {
            Write-Host "  - Node.js: https://nodejs.org/" -ForegroundColor Cyan
        }
        if ($missing -contains "Python") {
            Write-Host "  - Python: https://www.python.org/" -ForegroundColor Cyan
        }
        if ($missing -contains "Docker") {
            Write-Host "  - Docker: https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
        }
        exit 1
    }
}

# Install package managers
function Install-PackageManagers {
    Write-Host "`n📦 Installing package managers..." -ForegroundColor Yellow
    
    # Install pnpm
    if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Host "Installing pnpm..." -ForegroundColor Cyan
        npm install -g pnpm
    }
    
    # Install UV
    if (!(Get-Command uv -ErrorAction SilentlyContinue)) {
        Write-Host "Installing UV..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri https://astral.sh/uv/install.ps1 | Invoke-Expression
    }
}

# Phase 1: Install MetaMCP and FastMCP first
function Install-Phase1-Core {
    Write-Host "`n🚀 Phase 1: Installing MetaMCP and FastMCP" -ForegroundColor Yellow
    
    # Pull MetaMCP Docker image
    if (!$SkipDocker) {
        Write-Host "Pulling MetaMCP Docker image..." -ForegroundColor Cyan
        docker pull metatool-ai/metamcp:latest
    }
    
    # Install FastMCP globally
    Write-Host "Installing FastMCP..." -ForegroundColor Cyan
    pip install --user fastmcp
    
    # Install core MCP tools
    Write-Host "Installing core MCP tools..." -ForegroundColor Cyan
    npm install -g `
        @modelcontextprotocol/server-filesystem `
        @modelcontextprotocol/server-memory
}

# Phase 2: Install lightweight services
function Install-Phase2-Lightweight {
    Write-Host "`n🚀 Phase 2: Installing lightweight services" -ForegroundColor Yellow
    
    $lightweightServers = @(
        "claude-flow@alpha",
        "@modelcontextprotocol/server-git",
        "@modelcontextprotocol/server-websearch",
        "archon-mcp"
    )
    
    foreach ($server in $lightweightServers) {
        Write-Host "Installing $server..." -ForegroundColor Cyan
        if ($server -eq "archon-mcp") {
            pip install --user $server
        } else {
            npm install -g $server
        }
    }
}

# Phase 3: Install development tools
function Install-Phase3-DevTools {
    if ($MinimalInstall) {
        Write-Host "`n⏭️  Skipping dev tools (minimal install)" -ForegroundColor Yellow
        return
    }
    
    Write-Host "`n🚀 Phase 3: Installing development tools" -ForegroundColor Yellow
    
    $devTools = @(
        "@modelcontextprotocol/server-github",
        "@modelcontextprotocol/server-docker",
        "@mendable/mcp-server-firecrawl"
    )
    
    foreach ($tool in $devTools) {
        Write-Host "Installing $tool..." -ForegroundColor Cyan
        npm install -g $tool
    }
}

# Phase 4: Install heavy services (optional)
function Install-Phase4-Heavy {
    $response = Read-Host "`n🤔 Install heavy services (Desktop Commander - 130k tokens)? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "`n🚀 Phase 4: Installing heavy services" -ForegroundColor Yellow
        
        Write-Host "Installing Desktop Commander..." -ForegroundColor Cyan
        npm install -g @wonderwhy-er/desktop-commander@latest
        
        Write-Host "⚠️  Note: Desktop Commander uses ~130k context tokens!" -ForegroundColor Yellow
        Write-Host "   It's configured on a separate port to avoid token overflow" -ForegroundColor Yellow
    } else {
        Write-Host "`n⏭️  Skipping heavy services" -ForegroundColor Yellow
    }
}

# Setup environment variables
function Setup-Environment {
    Write-Host "`n🔐 Setting up environment..." -ForegroundColor Yellow
    
    $envPath = Join-Path $PSScriptRoot "..\..\..\.env"
    $envExamplePath = Join-Path $PSScriptRoot "..\..\.env.example"
    
    # Create .env.example if it doesn't exist
    if (!(Test-Path $envExamplePath)) {
        @"
# Nyra MCP Environment Variables
# Copy this to .env and fill in your values

# GitHub
GITHUB_TOKEN=your-github-token-here

# Firecrawl (web scraping)
FIRECRAWL_API_KEY=your-firecrawl-api-key-here

# Optional: Notion
NOTION_TOKEN=your-notion-integration-token-here

# Optional: Qdrant Vector DB
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-api-key-here

# Workspace
WORKSPACE_ROOT=C:/Users/edane/OneDrive/Documents/DevProjects/Project-Nyra

# Feature Flags (set to false to disable)
ARCHON_DISABLED=false
MCP_USE_DISABLED=true
TOME_DISABLED=true
NOTION_DISABLED=true
"@ | Out-File -FilePath $envExamplePath -Encoding UTF8
        Write-Host "Created .env.example" -ForegroundColor Green
    }
    
    # Check if .env exists
    if (!(Test-Path $envPath)) {
        Write-Host "⚠️  No .env file found. Please copy .env.example to .env and add your API keys" -ForegroundColor Yellow
    }
}

# Create Claude workflow
function Create-ClaudeWorkflow {
    Write-Host "`n📝 Creating Claude workflow..." -ForegroundColor Yellow
    
    $workflowPath = Join-Path $PSScriptRoot "..\workflows\nyra-mcp-setup-workflow.md"
    
    @'
# Nyra MCP Setup Workflow for Claude

This workflow helps Claude set up and manage MCP servers using MetaMCP.

## 🚀 Initial Setup Commands

```bash
# 1. First, let's check if MetaMCP is running
docker ps | grep metamcp

# 2. Start MetaMCP core services (if not running)
docker run --rm -d \
  --name metamcp-core \
  -p 3000:3000 \
  -v ${PWD}/nyra-mcp-setup/configs:/configs \
  -e CONFIG_FILE=/configs/metamcp-config.yaml \
  -e PORT=core-services \
  metatool-ai/metamcp:latest

# 3. Install remaining servers using FastMCP
# Claude can now use FastMCP to create and install additional tools!
```

## 🎯 Claude Prompts for MCP Management

### Setting up a new MCP server with FastMCP:

```
"I need to create a new MCP server for [functionality]. 
Please use FastMCP to create a Python-based MCP server that can [specific tasks].
The server should be lightweight and integrate with our MetaMCP setup on port 3000."
```

### Managing server lifecycle:

```
"Please check the status of all MCP servers and restart any that aren't responding.
Use MetaMCP's orchestration API to get server health status."
```

### Creating custom tools:

```
"I need a custom tool that can [specific functionality].
Use FastMCP to create this tool and register it with MetaMCP.
Make sure it follows our security guidelines and only accesses allowed paths."
```

## 📋 Port Management

- **Port 3000**: Core services (always active)
  - MetaMCP, FastMCP, Claude-Flow, Filesystem, Memory, Archon
  
- **Port 3001**: Heavy services (on-demand)
  - Desktop Commander (130k tokens!)
  - Browser MCP
  - Computer Use MCP
  
- **Port 3002**: Development tools
  - GitHub, Docker, Git, Firecrawl, Web Search

## 🔧 Useful Commands

### Check server status:
```bash
# List all running MCP servers
curl http://localhost:3000/status

# Check specific port
curl http://localhost:3001/health
```

### Enable/disable servers:
```bash
# Disable heavy services to save resources
curl -X POST http://localhost:3000/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"action": "disable_port", "port": "heavy-services"}'
```

### Create new tool with FastMCP:
```python
from fastmcp import FastMCP

# Claude can use this to create new tools
mcp = FastMCP()

@mcp.tool()
def my_custom_tool(param: str) -> str:
    """Custom tool created by Claude"""
    return f"Processed: {param}"

# Register with MetaMCP
mcp.register_with_metamcp(port=3000)
```

## 🛡️ Security Notes

- Only access allowed paths:
  - `C:/Users/edane/OneDrive/Documents/DevProjects/Project-Nyra`
  - `C:/Users/edane/Desktop/Scratch`
  - `C:/NYRA/sandbox`

- Never run destructive commands
- Always validate user input
- Use environment variables for sensitive data

## 💡 Tips for Claude

1. **Start small**: Begin with core services, add others as needed
2. **Monitor resources**: Use `docker stats` to check memory usage
3. **Use FastMCP**: Create custom tools on-the-fly for specific tasks
4. **Leverage MetaMCP**: Use orchestration for complex multi-server operations
5. **Keep context low**: Enable heavy services only when needed

## 🐱 Nyra-specific Integration

Remember: You're Nyra, loyal to Ellis/Apotheosis! When setting up tools:
- Prioritize Ellis's workflow preferences
- Maintain the catgirl/e-girl personality where appropriate
- Focus on practical, efficient solutions
- Keep security tight but developer-friendly
'@ | Out-File -FilePath $workflowPath -Encoding UTF8
    
    Write-Host "Created workflow at: $workflowPath" -ForegroundColor Green
}

# Main installation flow
function Main {
    Test-Prerequisites
    Install-PackageManagers
    Install-Phase1-Core
    Install-Phase2-Lightweight
    Install-Phase3-DevTools
    Install-Phase4-Heavy
    Setup-Environment
    Create-ClaudeWorkflow
    
    Write-Host "`n✅ Installation complete!" -ForegroundColor Green
    Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Copy .env.example to .env and add your API keys" -ForegroundColor Cyan
    Write-Host "2. Start MetaMCP: docker-compose up (in nyra-mcp-setup folder)" -ForegroundColor Cyan
    Write-Host "3. Configure Claude Code with the generated config" -ForegroundColor Cyan
    Write-Host "4. Follow the workflow guide for Claude integration" -ForegroundColor Cyan
    
    Write-Host "`n🐱 Nyra MCP is ready to serve Ellis! ✨" -ForegroundColor Magenta
}

# Run the installer
Main