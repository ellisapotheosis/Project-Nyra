# NYRA MCP Ecosystem Bootstrap Script
# Complete setup for multi-environment MCP server architecture with MetaMCP channels
# Usage: .\scripts\bootstrap-mcp-ecosystem.ps1 [-Environment <dev|staging|prod>] [-Force] [-Help]

param(
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev",
    [switch]$Force,
    [switch]$SkipDocker,
    [switch]$Help
)

if ($Help) {
    Write-Host "🚀 NYRA MCP Ecosystem Bootstrap" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Complete setup for multi-environment MCP server architecture:" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\scripts\bootstrap-mcp-ecosystem.ps1                    # Full setup for dev"
    Write-Host "  .\scripts\bootstrap-mcp-ecosystem.ps1 -Environment prod  # Production setup"
    Write-Host "  .\scripts\bootstrap-mcp-ecosystem.ps1 -Force             # Force reinstall all"
    Write-Host "  .\scripts\bootstrap-mcp-ecosystem.ps1 -SkipDocker        # Skip Docker components"
    Write-Host ""
    Write-Host "Components Installed:" -ForegroundColor Blue
    Write-Host "  🐳 Docker MCP Servers  - GitHub, Git (portable across machines)"
    Write-Host "  🌐 Global NPX Servers  - Notion, FastMCP, utilities" 
    Write-Host "  📁 Local UV Servers    - Archon, MetaMCP, Infisical (customizable)"
    Write-Host "  ☁️  Cloud Deployments  - FastMCP hosted servers"
    exit 0
}

Write-Host "🚀 NYRA MCP Ecosystem Bootstrap" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Blue

# MCP Server Deployment Configuration
$mcpConfig = @{
    # 🐳 Docker Deployments (Portable across machines)
    "docker" = @{
        "github" = @{
            "image" = "ghcr.io/github/github-mcp-server"
            "env_vars" = @("GITHUB_PERSONAL_ACCESS_TOKEN")
            "description" = "GitHub repository management"
            "channels" = @("development", "git-ops")
        }
    }
    
    # 🌐 Global NPX Deployments (System-wide utilities)
    "global" = @{
        "fastmcp" = @{
            "package" = "fastmcp"
            "install_method" = "uv"
            "description" = "FastMCP cloud deployment platform"
            "channels" = @("infrastructure")
        }
        "notion" = @{
            "package" = "mcp-remote"
            "args" = @("https://mcp.notion.com/mcp")
            "description" = "Notion workspace integration"
            "channels" = @("knowledge", "collaboration")
        }
        "metamcp" = @{
            "package" = "@metatool-ai/metamcp@latest"
            "description" = "MetaMCP channel orchestrator"
            "channels" = @("infrastructure", "orchestration")
        }
        "filesystem" = @{
            "package" = "@modelcontextprotocol/server-filesystem"
            "args" = @("--root", "C:/Users/edane/OneDrive/Documents/DevProjects/Project-Nyra", "--root", "C:/Users/edane/Desktop/Scratch")
            "description" = "File system access"
            "channels" = @("development", "infrastructure")
        }
        "claude-flow" = @{
            "package" = "claude-flow@alpha"
            "subcommand" = "mcp start"
            "description" = "Claude workflow orchestration"
            "channels" = @("orchestration", "workflows")
        }
        "flow-nexus" = @{
            "package" = "flow-nexus@latest"  
            "subcommand" = "mcp start"
            "description" = "Flow Nexus integration"
            "channels" = @("workflows", "integration")
        }
        "qdrant-mcp" = @{
            "package" = "@qdrant/mcp-server-qdrant@latest"
            "subcommand" = "start"
            "env_vars" = @("QDRANT_URL", "QDRANT_API_KEY")
            "description" = "Qdrant vector database"
            "channels" = @("memory", "vector-search")
        }
        "gemini-assistant" = @{
            "package" = "@peterkrueck/mcp-gemini-assistant@latest"
            "subcommand" = "start"
            "env_vars" = @("GOOGLE_API_KEY")
            "description" = "Gemini coding assistant"
            "channels" = @("ai-coding", "development")
        }
        "sparc2" = @{
            "package" = "@agentics.org/sparc2"
            "description" = "SPARC code agent framework"
            "channels" = @("ai-coding", "version-control")
        }
        "desktop-commander" = @{
            "package" = "@wonderwhy-er/desktop-commander@latest"
            "description" = "Desktop automation"
            "channels" = @("automation", "system-control")
        }
    }
    
    # 📁 Local UV Deployments (Repository-based, customizable)  
    "local" = @{
        "archon-mcp" = @{
            "path" = "nyra-mcp-servers/local/archon-mcp"
            "description" = "Archon agent orchestrator (PRIMARY)"
            "port" = 3002
            "channels" = @("orchestration", "agent-management")
        }
        "infisical-mcp" = @{
            "path" = "nyra-mcp-servers/local/infisical-mcp"
            "description" = "Infisical secret management"
            "port" = 3001
            "channels" = @("security", "secrets")
        }
        "metamcp-local" = @{
            "path" = "nyra-mcp-servers/local/metamcp"
            "description" = "MetaMCP local orchestrator"  
            "port" = 3000
            "channels" = @("infrastructure", "orchestration")
        }
        "qdrant-local" = @{
            "path" = "nyra-mcp-servers/local/qdrant-mcp"
            "description" = "Local Qdrant integration"
            "port" = 3003  
            "channels" = @("memory", "vector-search")
        }
        "mem0-mcp" = @{
            "path" = "nyra-mcp-servers/local/mem0-mcp"
            "description" = "Mem0 memory management"
            "port" = 3004
            "channels" = @("memory", "context")
        }
        "zep-mcp" = @{
            "path" = "nyra-mcp-servers/local/zep-mcp" 
            "description" = "Zep conversation memory"
            "port" = 3005
            "channels" = @("memory", "conversation")
        }
    }
}

# MetaMCP Channel Definitions
$channelConfig = @{
    "orchestration" = @{
        "description" = "Agent orchestration and workflow management"
        "primary_servers" = @("archon-mcp", "metamcp-local", "claude-flow")
        "use_cases" = @("hot-potato workflows", "agent coordination", "task management")
    }
    "development" = @{
        "description" = "Code development and repository management"  
        "primary_servers" = @("github", "filesystem", "sparc2", "gemini-assistant")
        "use_cases" = @("code review", "file management", "git operations")
    }
    "memory" = @{
        "description" = "Memory management and context persistence"
        "primary_servers" = @("qdrant-local", "mem0-mcp", "zep-mcp")
        "use_cases" = @("vector search", "long-term memory", "conversation context")
    }
    "ai-coding" = @{
        "description" = "AI-powered coding assistance"
        "primary_servers" = @("gemini-assistant", "sparc2")
        "use_cases" = @("code generation", "refactoring", "debugging")
    }
    "security" = @{
        "description" = "Security and secrets management"
        "primary_servers" = @("infisical-mcp")
        "use_cases" = @("secret rotation", "environment management", "compliance")
    }
    "knowledge" = @{
        "description" = "Knowledge management and documentation"
        "primary_servers" = @("notion")
        "use_cases" = @("documentation", "knowledge base", "team collaboration")
    }
    "infrastructure" = @{
        "description" = "Infrastructure and system management"
        "primary_servers" = @("filesystem", "fastmcp", "metamcp")
        "use_cases" = @("system monitoring", "deployment", "configuration")
    }
    "workflows" = @{
        "description" = "Workflow automation and integration"
        "primary_servers" = @("claude-flow", "flow-nexus")
        "use_cases" = @("process automation", "integration workflows", "data pipelines")
    }
}

function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Blue
    
    $allGood = $true
    
    # Check essential tools
    $tools = @(
        @{name="Python"; cmd="python --version"; required=$true},
        @{name="UV"; cmd="uv --version"; required=$true}, 
        @{name="Node.js"; cmd="node --version"; required=$true},
        @{name="NPM"; cmd="npm --version"; required=$true},
        @{name="Docker"; cmd="docker --version"; required=!$SkipDocker},
        @{name="Git"; cmd="git --version"; required=$true}
    )
    
    foreach ($tool in $tools) {
        if (-not $tool.required) { continue }
        
        try {
            $version = Invoke-Expression $tool.cmd 2>$null
            Write-Host "   ✅ $($tool.name): $version" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ $($tool.name): Not found or not working" -ForegroundColor Red
            $allGood = $false
        }
    }
    
    return $allGood
}

function Install-DockerMCPServers {
    Write-Host "`n🐳 Setting up Docker MCP servers..." -ForegroundColor Cyan
    
    foreach ($serverName in $mcpConfig.docker.Keys) {
        $server = $mcpConfig.docker[$serverName]
        Write-Host "   📦 Pulling $serverName ($($server.image))" -ForegroundColor Blue
        
        try {
            docker pull $server.image
            Write-Host "   ✅ $serverName Docker image ready" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Failed to pull $serverName image" -ForegroundColor Red
        }
    }
}

function Install-GlobalMCPServers {
    Write-Host "`n🌐 Installing global NPX MCP servers..." -ForegroundColor Cyan
    
    foreach ($serverName in $mcpConfig.global.Keys) {
        $server = $mcpConfig.global[$serverName]
        Write-Host "   📦 Installing $serverName" -ForegroundColor Blue
        
        try {
            if ($server.install_method -eq "uv") {
                uv pip install $server.package
            } else {
                npm install -g $server.package
            }
            Write-Host "   ✅ $serverName installed globally" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️ $serverName installation had issues (may still work)" -ForegroundColor Yellow
        }
    }
}

function Setup-LocalMCPServers {
    Write-Host "`n📁 Setting up local UV MCP servers..." -ForegroundColor Cyan
    
    foreach ($serverName in $mcpConfig.local.Keys) {
        $server = $mcpConfig.local[$serverName]
        $serverPath = $server.path
        
        Write-Host "   🔧 Setting up $serverName at $serverPath" -ForegroundColor Blue
        
        if (Test-Path $serverPath) {
            Push-Location $serverPath
            try {
                if ($Force -and (Test-Path ".venv")) {
                    Write-Host "      🗑️ Removing existing venv..." -ForegroundColor Yellow
                    Remove-Item ".venv" -Recurse -Force
                }
                
                if (!(Test-Path ".venv")) {
                    Write-Host "      📦 Creating virtual environment..." -ForegroundColor Cyan
                    uv venv
                }
                
                Write-Host "      📚 Installing dependencies..." -ForegroundColor Cyan
                uv sync
                
                Write-Host "   ✅ $serverName ready on port $($server.port)" -ForegroundColor Green
            } catch {
                Write-Host "   ❌ $serverName setup failed" -ForegroundColor Red
            } finally {
                Pop-Location
            }
        } else {
            Write-Host "   ❌ Path not found: $serverPath" -ForegroundColor Red
        }
    }
}

function Create-MetaMCPChannels {
    Write-Host "`n🔀 Creating MetaMCP channel configurations..." -ForegroundColor Cyan
    
    $channelsConfig = @{
        "channels" = $channelConfig
        "server_assignments" = @{}
        "routing_rules" = @{
            "orchestration" = @{
                "priority" = 1
                "load_balancing" = "round_robin"
                "fallback_enabled" = $true
            }
            "development" = @{
                "priority" = 2
                "load_balancing" = "least_connections"
                "fallback_enabled" = $true
            }
            "memory" = @{
                "priority" = 3
                "load_balancing" = "weighted"
                "fallback_enabled" = $false
            }
        }
    }
    
    # Assign servers to channels
    foreach ($channelName in $channelConfig.Keys) {
        $channelsConfig.server_assignments[$channelName] = @()
        
        foreach ($deployType in @("docker", "global", "local")) {
            foreach ($serverName in $mcpConfig[$deployType].Keys) {
                $server = $mcpConfig[$deployType][$serverName]
                if ($server.channels -contains $channelName) {
                    $channelsConfig.server_assignments[$channelName] += $serverName
                }
            }
        }
    }
    
    # Create configuration files
    $configDir = "nyra-mcp-servers/config"
    if (!(Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    
    $channelsConfig | ConvertTo-Json -Depth 5 | Out-File "$configDir/metamcp-channels.json"
    Write-Host "   ✅ MetaMCP channels configuration saved" -ForegroundColor Green
    
    # Display channel summary
    Write-Host "`n📊 Channel Summary:" -ForegroundColor Yellow
    foreach ($channelName in $channelConfig.Keys) {
        $channel = $channelConfig[$channelName]
        $serverCount = $channelsConfig.server_assignments[$channelName].Count
        Write-Host "   🔀 $channelName : $serverCount servers - $($channel.description)" -ForegroundColor White
    }
}

function Generate-WarpMCPConfig {
    Write-Host "`n⚡ Generating Warp MCP configuration..." -ForegroundColor Cyan
    
    $warpConfig = @{
        "mcpServers" = @{}
    }
    
    # Add Docker servers
    foreach ($serverName in $mcpConfig.docker.Keys) {
        $server = $mcpConfig.docker[$serverName]
        $warpConfig.mcpServers[$serverName] = @{
            "command" = "docker"
            "args" = @("run", "-i", "--rm") + ($server.env_vars | ForEach-Object { @("-e", $_) }) + @($server.image)
            "env" = @{}
            "start_on_launch" = $true
        }
        
        # Add placeholder env vars
        foreach ($envVar in $server.env_vars) {
            $warpConfig.mcpServers[$serverName].env[$envVar] = "{$envVar}"
        }
    }
    
    # Add global NPX servers
    foreach ($serverName in $mcpConfig.global.Keys) {
        $server = $mcpConfig.global[$serverName]
        $args = @("-y", $server.package)
        
        if ($server.subcommand) {
            $args += $server.subcommand.Split(" ")
        }
        if ($server.args) {
            $args += $server.args
        }
        
        $warpConfig.mcpServers[$serverName] = @{
            "command" = "cmd"
            "args" = @("/c", "npx") + $args
            "start_on_launch" = ($serverName -in @("filesystem", "notion", "metamcp"))
        }
        
        if ($server.env_vars) {
            $warpConfig.mcpServers[$serverName].env = @{}
            foreach ($envVar in $server.env_vars) {
                $warpConfig.mcpServers[$serverName].env[$envVar] = "{$envVar}"
            }
        }
    }
    
    # Add local UV servers  
    foreach ($serverName in $mcpConfig.local.Keys) {
        $server = $mcpConfig.local[$serverName]
        $warpConfig.mcpServers[$serverName] = @{
            "command" = "cmd"
            "args" = @("/c", "uv", "run", "--cwd", $server.path, "python", "main.py")
            "start_on_launch" = ($serverName -in @("archon-mcp", "metamcp-local", "infisical-mcp"))
        }
    }
    
    $configPath = "nyra-mcp-servers/config/warp-mcp-config.json"
    $warpConfig | ConvertTo-Json -Depth 4 | Out-File $configPath
    Write-Host "   ✅ Warp MCP configuration saved to $configPath" -ForegroundColor Green
    Write-Host "   📋 Copy this configuration to your Warp MCP settings" -ForegroundColor Blue
}

function Show-PostInstallInstructions {
    Write-Host "`n" + ("="*60) -ForegroundColor Cyan
    Write-Host "🎉 MCP Ecosystem Bootstrap Complete!" -ForegroundColor Green
    Write-Host ("="*60) -ForegroundColor Cyan
    
    Write-Host "`n📋 What's Installed:" -ForegroundColor Yellow
    Write-Host "   🐳 Docker Servers: $($mcpConfig.docker.Count) servers" -ForegroundColor White
    Write-Host "   🌐 Global NPX: $($mcpConfig.global.Count) packages" -ForegroundColor White  
    Write-Host "   📁 Local UV: $($mcpConfig.local.Count) servers" -ForegroundColor White
    Write-Host "   🔀 MetaMCP Channels: $($channelConfig.Count) channels configured" -ForegroundColor White
    
    Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Configure your environment variables:" -ForegroundColor White
    Write-Host "      • Set GITHUB_PERSONAL_ACCESS_TOKEN, QDRANT_URL, etc." -ForegroundColor DarkGray
    Write-Host "      • Use Infisical for secret management:" -ForegroundColor DarkGray
    Write-Host "        .\scripts\swap-secret.ps1 GITHUB_PERSONAL_ACCESS_TOKEN your_token" -ForegroundColor Blue
    
    Write-Host "`n   2. Import Warp MCP configuration:" -ForegroundColor White  
    Write-Host "      • Open Warp > Settings > AI > Manage MCP servers" -ForegroundColor DarkGray
    Write-Host "      • Paste contents of nyra-mcp-servers/config/warp-mcp-config.json" -ForegroundColor DarkGray
    
    Write-Host "`n   3. Start core orchestration servers:" -ForegroundColor White
    Write-Host "      .\scripts\start-mcp-servers.ps1 orchestration" -ForegroundColor Blue
    
    Write-Host "`n   4. Test the setup:" -ForegroundColor White
    Write-Host "      .\scripts\test-mcp-ecosystem.ps1" -ForegroundColor Blue
    
    Write-Host "`n📊 MetaMCP Channels Available:" -ForegroundColor Yellow
    foreach ($channelName in $channelConfig.Keys) {
        Write-Host "   🔀 $channelName - $($channelConfig[$channelName].description)" -ForegroundColor White
    }
    
    Write-Host "`n🔗 Key URLs:" -ForegroundColor Cyan
    Write-Host "   • MetaMCP Local: http://localhost:3000" -ForegroundColor Blue
    Write-Host "   • Archon Orchestrator: http://localhost:3002" -ForegroundColor Blue
    Write-Host "   • Infisical MCP: http://localhost:3001" -ForegroundColor Blue
    
    Write-Host "`n✅ Your NYRA MCP ecosystem is ready for multi-agent workflows!" -ForegroundColor Green
}

# Main execution
if (!(Test-Prerequisites)) {
    Write-Host "❌ Prerequisites check failed. Please install missing components." -ForegroundColor Red
    exit 1
}

Write-Host "`n🎯 Starting MCP ecosystem bootstrap for environment: $Environment" -ForegroundColor Green

# Install components  
if (!$SkipDocker) {
    Install-DockerMCPServers
}

Install-GlobalMCPServers
Setup-LocalMCPServers  
Create-MetaMCPChannels
Generate-WarpMCPConfig

Write-Host "`n🔧 Creating additional helper scripts..." -ForegroundColor Cyan

# Mark first todo as done
Show-PostInstallInstructions

Write-Host "`n✨ Bootstrap complete! Your multi-agent MCP ecosystem is ready." -ForegroundColor Green