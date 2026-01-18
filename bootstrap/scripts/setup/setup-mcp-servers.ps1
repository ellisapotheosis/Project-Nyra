# NYRA MCP Servers Setup Script - Initialize all MCP servers with UV
# Usage: .\scripts\setup-mcp-servers.ps1 [ServerName] [-Force] [-Help]

param(
    [string]$ServerName = "all",
    [switch]$Force,
    [switch]$Help
)

if ($Help) {
    Write-Host "🔧 NYRA MCP Servers Setup" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Initialize MCP servers with UV virtual environments:" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\scripts\setup-mcp-servers.ps1                    # Setup all servers"
    Write-Host "  .\scripts\setup-mcp-servers.ps1 metamcp           # Setup specific server"  
    Write-Host "  .\scripts\setup-mcp-servers.ps1 -Force            # Force reinstall all"
    Write-Host ""
    Write-Host "Available Servers:" -ForegroundColor Blue
    Write-Host "  • metamcp     - MetaMCP orchestrator"
    Write-Host "  • infisical   - Infisical secret management"
    Write-Host "  • archon      - Archon agent orchestration"
    Write-Host "  • qdrant      - Qdrant vector database"
    Write-Host "  • mem0        - Mem0 memory management" 
    Write-Host "  • zep         - Zep conversation history"
    exit 0
}

Write-Host "🔧 NYRA MCP Servers Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Define MCP servers configuration
$servers = @{
    "metamcp" = @{
        "path" = "nyra-mcp-servers/local/metamcp"
        "port" = 3000
        "description" = "MetaMCP orchestrator for routing and service discovery"
    }
    "infisical" = @{
        "path" = "nyra-mcp-servers/local/infisical-mcp" 
        "port" = 3001
        "description" = "Infisical secret management with multi-environment support"
    }
    "archon" = @{
        "path" = "nyra-mcp-servers/local/archon-mcp"
        "port" = 3002
        "description" = "Archon agent orchestration and workflow management"
    }
    "qdrant" = @{
        "path" = "nyra-mcp-servers/local/qdrant-mcp"
        "port" = 3003
        "description" = "Qdrant vector database integration"
    }
    "mem0" = @{
        "path" = "nyra-mcp-servers/local/mem0-mcp"
        "port" = 3004  
        "description" = "Mem0 memory management and persistence"
    }
    "zep" = @{
        "path" = "nyra-mcp-servers/local/zep-mcp"
        "port" = 3005
        "description" = "Zep conversation history and context"
    }
}

function Setup-MCPServer {
    param(
        [string]$Name,
        [hashtable]$Config
    )
    
    Write-Host "`n🔧 Setting up $Name MCP server..." -ForegroundColor Green
    Write-Host "   Path: $($Config.path)" -ForegroundColor DarkGray
    Write-Host "   Port: $($Config.port)" -ForegroundColor DarkGray
    Write-Host "   Description: $($Config.description)" -ForegroundColor DarkGray
    
    $serverPath = $Config.path
    
    # Check if directory exists
    if (!(Test-Path $serverPath)) {
        Write-Host "   ❌ Directory not found: $serverPath" -ForegroundColor Red
        return $false
    }
    
    # Check if pyproject.toml exists
    $pyprojectPath = Join-Path $serverPath "pyproject.toml"
    if (!(Test-Path $pyprojectPath)) {
        Write-Host "   ❌ pyproject.toml not found in $serverPath" -ForegroundColor Red
        return $false
    }
    
    # Change to server directory
    Push-Location $serverPath
    
    try {
        # Check if .venv already exists
        if ((Test-Path ".venv") -and !$Force) {
            Write-Host "   ✅ Virtual environment already exists (use -Force to recreate)" -ForegroundColor Yellow
        } else {
            if ($Force -and (Test-Path ".venv")) {
                Write-Host "   🗑️  Removing existing virtual environment..." -ForegroundColor Yellow
                Remove-Item ".venv" -Recurse -Force
            }
            
            Write-Host "   📦 Creating virtual environment with UV..." -ForegroundColor Cyan
            uv venv
            
            if ($LASTEXITCODE -ne 0) {
                Write-Host "   ❌ Failed to create virtual environment" -ForegroundColor Red
                return $false
            }
        }
        
        Write-Host "   📚 Installing dependencies..." -ForegroundColor Cyan
        uv sync
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ❌ Failed to install dependencies" -ForegroundColor Red
            return $false
        }
        
        Write-Host "   ✅ $Name server setup complete!" -ForegroundColor Green
        return $true
        
    } catch {
        Write-Host "   ❌ Error setting up $Name : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    } finally {
        Pop-Location
    }
}

function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Blue
    
    # Check UV
    try {
        $uvVersion = uv --version 2>$null
        Write-Host "   ✅ UV: $uvVersion" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ UV not found - please install UV package manager" -ForegroundColor Red
        return $false
    }
    
    # Check Python
    try {
        $pythonVersion = python --version 2>$null
        Write-Host "   ✅ Python: $pythonVersion" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Python not found - please install Python 3.11+" -ForegroundColor Red
        return $false
    }
    
    # Check if we're in the right directory
    if (!(Test-Path "nyra-mcp-servers")) {
        Write-Host "   ❌ nyra-mcp-servers directory not found - run from project root" -ForegroundColor Red
        return $false
    }
    
    Write-Host "   ✅ All prerequisites satisfied" -ForegroundColor Green
    return $true
}

function Show-Summary {
    param([hashtable]$Results)
    
    Write-Host "`n" + ("="*60) -ForegroundColor Cyan
    Write-Host "🎉 MCP Servers Setup Summary" -ForegroundColor Green
    Write-Host ("="*60) -ForegroundColor Cyan
    
    $successful = 0
    $failed = 0
    
    foreach ($server in $Results.Keys) {
        $status = if ($Results[$server]) { "✅ SUCCESS" } else { "❌ FAILED" }
        $color = if ($Results[$server]) { "Green" } else { "Red" }
        
        Write-Host "   $server : $status" -ForegroundColor $color
        
        if ($Results[$server]) { $successful++ } else { $failed++ }
    }
    
    Write-Host "`n📊 Results:" -ForegroundColor Yellow
    Write-Host "   Successful: $successful" -ForegroundColor Green
    Write-Host "   Failed: $failed" -ForegroundColor Red
    Write-Host "   Total: $($successful + $failed)" -ForegroundColor Blue
    
    if ($successful -gt 0) {
        Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
        Write-Host "   • Test the servers: .\scripts\test-mcp-servers.ps1" -ForegroundColor White
        Write-Host "   • Start the servers: .\scripts\start-mcp-servers.ps1" -ForegroundColor White
        Write-Host "   • View server status: .\scripts\mcp-status.ps1" -ForegroundColor White
    }
    
    if ($failed -gt 0) {
        Write-Host "`n🔧 Troubleshooting:" -ForegroundColor Yellow
        Write-Host "   • Check error messages above" -ForegroundColor White
        Write-Host "   • Verify UV and Python versions" -ForegroundColor White
        Write-Host "   • Try running with -Force flag" -ForegroundColor White
    }
}

# Main execution
if (!(Test-Prerequisites)) {
    exit 1
}

$results = @{}

if ($ServerName -eq "all") {
    Write-Host "🔄 Setting up all MCP servers..." -ForegroundColor Blue
    
    foreach ($serverName in $servers.Keys) {
        $results[$serverName] = Setup-MCPServer -Name $serverName -Config $servers[$serverName]
    }
} elseif ($servers.ContainsKey($ServerName)) {
    Write-Host "🔄 Setting up $ServerName MCP server..." -ForegroundColor Blue
    $results[$ServerName] = Setup-MCPServer -Name $ServerName -Config $servers[$ServerName]
} else {
    Write-Host "❌ Unknown server: $ServerName" -ForegroundColor Red
    Write-Host "Available servers: $($servers.Keys -join ', ')" -ForegroundColor Yellow
    exit 1
}

Show-Summary -Results $results

Write-Host "`n✅ MCP setup process complete!" -ForegroundColor Green