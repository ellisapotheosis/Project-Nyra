# NYRA Warp MCP Configuration Import Helper
# Assists with importing MCP server configuration into Warp
# Provides both automated and manual configuration options

param(
    [switch]$ShowConfig,
    [switch]$SaveClipboard,
    [switch]$OpenWarpSettings,
    [switch]$GenerateNew,
    [switch]$Help
)

if ($Help) {
    Write-Host "🎛️ NYRA Warp MCP Configuration Import Helper" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This script helps you configure Warp to use your NYRA MCP servers." -ForegroundColor Green
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -ShowConfig     Show the current MCP configuration" -ForegroundColor White
    Write-Host "  -SaveClipboard  Copy configuration to clipboard for easy pasting" -ForegroundColor White
    Write-Host "  -OpenWarpSettings  Try to open Warp settings (if supported)" -ForegroundColor White
    Write-Host "  -GenerateNew    Regenerate the configuration file" -ForegroundColor White
    Write-Host ""
    Write-Host "Manual Steps:" -ForegroundColor Yellow
    Write-Host "  1. Run: .\scripts\import-warp-mcp-config.ps1 -SaveClipboard" -ForegroundColor Blue
    Write-Host "  2. Open Warp > Settings > AI > Manage MCP servers" -ForegroundColor Blue
    Write-Host "  3. Paste the configuration and save" -ForegroundColor Blue
    Write-Host ""
    exit 0
}

Write-Host "🎛️ NYRA Warp MCP Configuration Import" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$configPath = "nyra-mcp-servers/config/warp-mcp-config.json"

# Check if config exists
if (-not (Test-Path $configPath)) {
    Write-Host "❌ Warp MCP config not found. Generating new configuration..." -ForegroundColor Red
    $GenerateNew = $true
}

if ($GenerateNew) {
    Write-Host "🔧 Generating new Warp MCP configuration..." -ForegroundColor Blue
    
    # Create comprehensive Warp MCP configuration
    $warpConfig = @{
        "mcpServers" = @{
            # Core Orchestration Servers (stdio - spawned by Warp)
            "archon-mcp" = @{
                "command" = "uv"
                "args" = @("run", "python", "main.py")
                "cwd" = "C:\Users\edane\OneDrive\Documents\DevProjects\Project-Nyra\nyra-mcp-servers\local\archon-mcp"
                "env" = @{
                    "NYRA_ENVIRONMENT" = "dev"
                    "MCP_SERVER_NAME" = "archon-mcp"
                }
            }
            "metamcp-local" = @{
                "command" = "uv"
                "args" = @("run", "python", "main.py")
                "cwd" = "C:\Users\edane\OneDrive\Documents\DevProjects\Project-Nyra\nyra-mcp-servers\local\metamcp"
                "env" = @{
                    "NYRA_ENVIRONMENT" = "dev"
                    "MCP_SERVER_NAME" = "metamcp-local"
                }
            }
            
            # Security & Secrets Management
            "infisical-mcp" = @{
                "command" = "uv"
                "args" = @("run", "python", "main.py")
                "cwd" = "C:\Users\edane\OneDrive\Documents\DevProjects\Project-Nyra\nyra-mcp-servers\local\infisical-mcp"
                "env" = @{
                    "NYRA_ENVIRONMENT" = "dev"
                    "MCP_SERVER_NAME" = "infisical-mcp"
                }
            }
            
            # Memory & Vector Storage
            "qdrant-local" = @{
                "command" = "uv"
                "args" = @("run", "python", "main.py")
                "cwd" = "C:\Users\edane\OneDrive\Documents\DevProjects\Project-Nyra\nyra-mcp-servers\local\qdrant-mcp"
                "env" = @{
                    "NYRA_ENVIRONMENT" = "dev"
                    "MCP_SERVER_NAME" = "qdrant-local"
                }
            }
            "mem0-mcp" = @{
                "command" = "uv"
                "args" = @("run", "python", "main.py")
                "cwd" = "C:\Users\edane\OneDrive\Documents\DevProjects\Project-Nyra\nyra-mcp-servers\local\mem0-mcp"
                "env" = @{
                    "NYRA_ENVIRONMENT" = "dev"
                    "MCP_SERVER_NAME" = "mem0-mcp"
                }
            }
            "zep-mcp" = @{
                "command" = "uv"
                "args" = @("run", "python", "main.py")
                "cwd" = "C:\Users\edane\OneDrive\Documents\DevProjects\Project-Nyra\nyra-mcp-servers\local\zep-mcp"
                "env" = @{
                    "NYRA_ENVIRONMENT" = "dev"
                    "MCP_SERVER_NAME" = "zep-mcp"
                }
            }
            
            # Global NPM MCP Servers (assuming they're now in PATH)
            "filesystem" = @{
                "command" = "npx"
                "args" = @("@modelcontextprotocol/server-filesystem")
                "env" = @{}
            }
            "notion" = @{
                "command" = "npx"
                "args" = @("@eyelidlessness/notion-api-mcp-server")
                "env" = @{
                    "NOTION_TOKEN" = "`${NOTION_TOKEN}"
                }
            }
            "claude-flow" = @{
                "command" = "npx"
                "args" = @("claude-flow")
                "env" = @{}
            }
            "flow-nexus" = @{
                "command" = "npx"  
                "args" = @("flow-nexus")
                "env" = @{}
            }
            "desktop-commander" = @{
                "command" = "npx"
                "args" = @("desktop-commander")
                "env" = @{}
            }
            
            # FastMCP (assuming UV installation is preferred)
            "fastmcp" = @{
                "command" = "uvx"
                "args" = @("fastmcp", "serve")
                "env" = @{}
            }
        }
    }
    
    # Ensure config directory exists
    $configDir = Split-Path $configPath -Parent
    if (!(Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    
    # Save configuration
    $warpConfig | ConvertTo-Json -Depth 10 | Set-Content -Path $configPath -Encoding UTF8
    Write-Host "✅ Generated new Warp MCP configuration at: $configPath" -ForegroundColor Green
}

# Show current configuration
if ($ShowConfig -or $SaveClipboard) {
    Write-Host "`n📄 Current Warp MCP Configuration:" -ForegroundColor Yellow
    Write-Host ("="*60) -ForegroundColor Gray
    
    try {
        $config = Get-Content $configPath -Raw
        Write-Host $config -ForegroundColor White
        
        if ($SaveClipboard) {
            try {
                Set-Clipboard -Value $config
                Write-Host "`n✅ Configuration copied to clipboard!" -ForegroundColor Green
                Write-Host "📋 Now paste it in Warp > Settings > AI > Manage MCP servers" -ForegroundColor Cyan
            } catch {
                Write-Host "`n⚠️ Could not copy to clipboard. Manual copy required." -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "❌ Error reading configuration: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($OpenWarpSettings) {
    Write-Host "`n🚀 Attempting to open Warp..." -ForegroundColor Blue
    try {
        # Try to open Warp (may not work on all systems)
        Start-Process "warp://" -ErrorAction SilentlyContinue
        Write-Host "✅ Warp should now be opening. Navigate to Settings > AI > Manage MCP servers" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Could not automatically open Warp. Please open manually." -ForegroundColor Yellow
    }
}

# Show instructions if no specific action was taken
if (-not ($ShowConfig -or $SaveClipboard -or $OpenWarpSettings -or $GenerateNew)) {
    Write-Host "`n📋 Manual Configuration Instructions:" -ForegroundColor Yellow
    Write-Host ("="*50) -ForegroundColor Gray
    Write-Host ""
    Write-Host "1. Copy the configuration:" -ForegroundColor Blue
    Write-Host "   .\scripts\import-warp-mcp-config.ps1 -SaveClipboard" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Open Warp settings:" -ForegroundColor Blue  
    Write-Host "   • Open Warp application" -ForegroundColor Gray
    Write-Host "   • Go to Settings (Cmd/Ctrl + ,)" -ForegroundColor Gray
    Write-Host "   • Navigate to AI section" -ForegroundColor Gray
    Write-Host "   • Click 'Manage MCP servers'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Import configuration:" -ForegroundColor Blue
    Write-Host "   • Paste the copied JSON configuration" -ForegroundColor Gray
    Write-Host "   • Click Save/Apply" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Test the setup:" -ForegroundColor Blue
    Write-Host "   • Restart Warp if needed" -ForegroundColor Gray
    Write-Host "   • Try using MCP tools in Warp's AI assistant" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "🎯 Quick Actions:" -ForegroundColor Cyan
    Write-Host "   • View config: .\scripts\import-warp-mcp-config.ps1 -ShowConfig" -ForegroundColor White
    Write-Host "   • Copy config: .\scripts\import-warp-mcp-config.ps1 -SaveClipboard" -ForegroundColor White
    Write-Host "   • Regenerate:  .\scripts\import-warp-mcp-config.ps1 -GenerateNew" -ForegroundColor White
    
    Write-Host "`n🔍 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   • Ensure all paths are correct for your system" -ForegroundColor Gray
    Write-Host "   • Check that UV and NPX are available in your PATH" -ForegroundColor Gray
    Write-Host "   • Verify environment variables are set correctly" -ForegroundColor Gray
    Write-Host "   • Run: mcp-status to check server status" -ForegroundColor Gray
}

Write-Host "`n✅ Warp MCP configuration helper complete!" -ForegroundColor Green