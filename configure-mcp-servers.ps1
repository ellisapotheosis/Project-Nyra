# NYRA MCP Server Configuration Script
# PowerShell script to configure MCP servers for Claude Code

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURE MCP SERVERS FOR CLAUDE CODE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create .mcp-servers.json configuration file
$mcpConfig = @{
    mcpServers = @{
        "claude-flow" = @{
            command = "npx"
            args = @("claude-flow@alpha", "mcp", "start")
            description = "Claude Flow orchestration and coordination"
        }
        "ruv-swarm" = @{
            command = "npx"
            args = @("ruv-swarm", "mcp", "start")
            description = "Ruv Swarm multi-agent coordination"
        }
        "flow-nexus" = @{
            command = "npx"
            args = @("flow-nexus@latest", "mcp", "start")
            description = "Flow Nexus cloud orchestration features"
        }
        "archon" = @{
            url = "http://localhost:3003"
            description = "Archon MCP task orchestration"
        }
        "metamcp" = @{
            url = "http://localhost:3000"
            description = "MetaMCP gateway and router"
        }
        "infisical" = @{
            url = "http://localhost:8080/api/mcp"
            description = "Infisical secrets management"
        }
        "github" = @{
            url = "http://localhost:3010"
            description = "GitHub operations and repository management"
        }
        "docker" = @{
            url = "http://localhost:3011"
            description = "Docker container and image management"
        }
        "filesystem" = @{
            url = "http://localhost:3012"
            description = "Filesystem operations and management"
        }
        "memory" = @{
            url = "http://localhost:3013"
            description = "Persistent memory and knowledge graph"
        }
        "notion" = @{
            url = "http://localhost:3014"
            description = "Notion API integration"
        }
    }
}

# Convert to JSON and save
$jsonContent = $mcpConfig | ConvertTo-Json -Depth 10
$jsonContent | Out-File -FilePath ".mcp-servers.json" -Encoding utf8

Write-Host "✓ Created .mcp-servers.json configuration file" -ForegroundColor Green
Write-Host ""

# Display configuration summary
Write-Host "MCP Server Configuration Summary:" -ForegroundColor Cyan
Write-Host ""
Write-Host "NPX-based Servers (auto-start with Claude Code):" -ForegroundColor Yellow
Write-Host "  - claude-flow: Claude Flow orchestration" -ForegroundColor Gray
Write-Host "  - ruv-swarm: Multi-agent coordination" -ForegroundColor Gray
Write-Host "  - flow-nexus: Cloud orchestration features" -ForegroundColor Gray
Write-Host ""
Write-Host "HTTP-based Servers (require infrastructure to be running):" -ForegroundColor Yellow
Write-Host "  - archon (port 3003): Task orchestration" -ForegroundColor Gray
Write-Host "  - metamcp (port 3000): Gateway and router" -ForegroundColor Gray
Write-Host "  - infisical (port 8080): Secrets management" -ForegroundColor Gray
Write-Host "  - github (port 3010): GitHub operations" -ForegroundColor Gray
Write-Host "  - docker (port 3011): Docker management" -ForegroundColor Gray
Write-Host "  - filesystem (port 3012): File operations" -ForegroundColor Gray
Write-Host "  - memory (port 3013): Persistent memory" -ForegroundColor Gray
Write-Host "  - notion (port 3014): Notion integration" -ForegroundColor Gray
Write-Host ""

# Manual Claude Code setup instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MANUAL CLAUDE CODE SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To manually add MCP servers to Claude Code, run:" -ForegroundColor Yellow
Write-Host ""
Write-Host "NPX Servers:" -ForegroundColor Cyan
Write-Host "  claude mcp add claude-flow npx claude-flow@alpha mcp start" -ForegroundColor Gray
Write-Host "  claude mcp add ruv-swarm npx ruv-swarm mcp start" -ForegroundColor Gray
Write-Host "  claude mcp add flow-nexus npx flow-nexus@latest mcp start" -ForegroundColor Gray
Write-Host ""
Write-Host "HTTP Servers (start infrastructure first with .\launch-infrastructure.ps1):" -ForegroundColor Cyan
Write-Host "  claude mcp add archon http://localhost:3003" -ForegroundColor Gray
Write-Host "  claude mcp add metamcp http://localhost:3000" -ForegroundColor Gray
Write-Host "  claude mcp add github http://localhost:3010" -ForegroundColor Gray
Write-Host ""

# Check if infrastructure is running
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INFRASTRUCTURE STATUS CHECK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    $containers = docker ps --filter "name=nyra-" --format "{{.Names}}" 2>$null
    if ($containers) {
        Write-Host "✓ Infrastructure is running:" -ForegroundColor Green
        $containers | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
        Write-Host ""
        Write-Host "You can now use HTTP-based MCP servers!" -ForegroundColor Green
    } else {
        Write-Host "! Infrastructure is not running" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Start infrastructure first:" -ForegroundColor Yellow
        Write-Host "  .\launch-infrastructure.ps1" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Then re-run this script to verify MCP server availability." -ForegroundColor Yellow
    }
} catch {
    Write-Host "! Could not check Docker status" -ForegroundColor Yellow
    Write-Host "Make sure Docker Desktop is running." -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuration complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
