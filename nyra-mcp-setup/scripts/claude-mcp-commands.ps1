# Claude MCP Commands - Helper script for Claude to manage MCP servers
# This script provides easy-to-use functions that Claude can call

# Enable verbose output for Claude
$VerbosePreference = "Continue"

# Function to check MCP status
function Get-MCPStatus {
    Write-Host "🔍 Checking MCP Server Status..." -ForegroundColor Cyan
    
    # Check Docker containers
    Write-Host "`nDocker Containers:" -ForegroundColor Yellow
    docker ps --filter "name=nyra-metamcp" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Check core services health
    Write-Host "`nCore Services (Port 3000):" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
        Write-Host "✅ MetaMCP Core is healthy" -ForegroundColor Green
        $response.servers | ForEach-Object {
            Write-Host "  - $($_.name): $($_.status)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ MetaMCP Core is not responding" -ForegroundColor Red
    }
}

# Function to start specific MCP port
function Start-MCPPort {
    param(
        [ValidateSet("core", "heavy", "dev", "optional")]
        [string]$Port = "core"
    )
    
    Write-Host "🚀 Starting MCP $Port services..." -ForegroundColor Cyan
    
    switch ($Port) {
        "core" {
            docker-compose -f "$PSScriptRoot\..\docker-compose.yml" up -d metamcp-core
        }
        "heavy" {
            Write-Host "⚠️  Warning: Heavy services use ~130k context tokens!" -ForegroundColor Yellow
            docker-compose -f "$PSScriptRoot\..\docker-compose.yml" --profile heavy up -d
        }
        "dev" {
            docker-compose -f "$PSScriptRoot\..\docker-compose.yml" up -d metamcp-dev
        }
        "optional" {
            docker-compose -f "$PSScriptRoot\..\docker-compose.yml" --profile optional up -d
        }
    }
}

# Function to stop specific MCP port
function Stop-MCPPort {
    param(
        [ValidateSet("core", "heavy", "dev", "optional", "all")]
        [string]$Port = "all"
    )
    
    Write-Host "🛑 Stopping MCP $Port services..." -ForegroundColor Cyan
    
    if ($Port -eq "all") {
        docker-compose -f "$PSScriptRoot\..\docker-compose.yml" down
    } else {
        $containerName = "nyra-metamcp-$Port"
        docker stop $containerName
    }
}

# Function to create a FastMCP tool
function New-FastMCPTool {
    param(
        [string]$ToolName,
        [string]$Description,
        [string]$Code
    )
    
    Write-Host "🔧 Creating FastMCP tool: $ToolName" -ForegroundColor Cyan
    
    $pythonCode = @"
from fastmcp import FastMCP

mcp = FastMCP("$ToolName")

@mcp.tool()
def $($ToolName.ToLower())_tool(input: str) -> str:
    '''$Description'''
    $Code
    
# Register with MetaMCP
if __name__ == "__main__":
    import requests
    
    # Register tool with MetaMCP
    response = requests.post(
        "http://localhost:3000/register",
        json={
            "name": "$ToolName",
            "type": "fastmcp",
            "port": 3000
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Tool {ToolName} registered with MetaMCP")
    else:
        print(f"❌ Failed to register tool: {response.text}")
    
    # Start the MCP server
    mcp.serve()
"@

    # Save the tool
    $toolPath = "$PSScriptRoot\..\tools\$ToolName.py"
    New-Item -Path (Split-Path $toolPath -Parent) -ItemType Directory -Force | Out-Null
    $pythonCode | Out-File -FilePath $toolPath -Encoding UTF8
    
    Write-Host "✅ Tool created at: $toolPath" -ForegroundColor Green
    Write-Host "To start it: python $toolPath" -ForegroundColor Yellow
}

# Function to enable Desktop Commander (with warning)
function Enable-DesktopCommander {
    Write-Host "⚠️  ENABLING DESKTOP COMMANDER" -ForegroundColor Yellow
    Write-Host "This will use approximately 130,000 context tokens!" -ForegroundColor Red
    Write-Host "Only use when absolutely necessary!" -ForegroundColor Red
    
    $confirm = Read-Host "Are you sure? (yes/no)"
    if ($confirm -eq "yes") {
        Start-MCPPort -Port "heavy"
        Write-Host "Desktop Commander is now available on port 3001" -ForegroundColor Green
        Write-Host "Remember to disable it when done: Stop-MCPPort -Port heavy" -ForegroundColor Yellow
    }
}

# Function to check resource usage
function Get-MCPResourceUsage {
    Write-Host "📊 MCP Resource Usage" -ForegroundColor Cyan
    
    docker stats --no-stream --filter "name=nyra-metamcp"
}

# Function to view logs
function Get-MCPLogs {
    param(
        [ValidateSet("core", "heavy", "dev", "optional")]
        [string]$Port = "core",
        [int]$Lines = 50
    )
    
    $containerName = "nyra-metamcp-$Port"
    docker logs --tail $Lines $containerName
}

# Export functions for Claude to use
Export-ModuleMember -Function @(
    'Get-MCPStatus',
    'Start-MCPPort',
    'Stop-MCPPort',
    'New-FastMCPTool',
    'Enable-DesktopCommander',
    'Get-MCPResourceUsage',
    'Get-MCPLogs'
)

# Help message for Claude
Write-Host @"
🐱 Nyra MCP Command Module Loaded! ✨

Available commands:
- Get-MCPStatus          : Check status of all MCP servers
- Start-MCPPort -Port    : Start specific port (core/heavy/dev/optional)
- Stop-MCPPort -Port     : Stop specific port or all
- New-FastMCPTool        : Create a new Python MCP tool
- Enable-DesktopCommander: Enable heavy services (use sparingly!)
- Get-MCPResourceUsage   : Check Docker resource usage
- Get-MCPLogs -Port      : View logs for specific port

Example usage:
  Get-MCPStatus
  Start-MCPPort -Port dev
  New-FastMCPTool -ToolName "WebAnalyzer" -Description "Analyzes websites" -Code "return analyze_website(input)"
"@ -ForegroundColor Magenta