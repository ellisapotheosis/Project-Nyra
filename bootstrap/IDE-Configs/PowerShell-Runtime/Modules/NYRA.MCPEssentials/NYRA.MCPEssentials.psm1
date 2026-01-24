# NYRA MCP Essentials PowerShell Module
# Quick commands for managing essential MCP servers

$script:MCPBasePath = "C:\Dev\Tools\MCP-Ecosystem"

function Start-AllMCPServers {
    [CmdletBinding()]
    param([switch]$Essential)
    
    Write-Host "`n🚀 Starting MCP servers..." -ForegroundColor Cyan
    
    # Start Infisical first (secrets provider)
    Write-Host "  1/7 Infisical MCP..." -NoNewline
    Push-Location "$script:MCPBasePath\Infisical"
    docker-compose up -d 2>&1 | Out-Null
    Pop-Location
    Write-Host " ✓" -ForegroundColor Green
    
    Start-Sleep -Seconds 2
    
    # Start GitHub MCP
    Write-Host "  2/7 GitHub MCP..." -NoNewline
    Push-Location "$script:MCPBasePath\GithubMCP"
    docker-compose up -d 2>&1 | Out-Null
    Pop-Location
    Write-Host " ✓" -ForegroundColor Green
    
    # Start FileSystem MCP
    Write-Host "  3/7 FileSystem MCP..." -NoNewline
    Push-Location "$script:MCPBasePath\FileSystemMCP"
    docker-compose up -d 2>&1 | Out-Null
    Pop-Location
    Write-Host " ✓" -ForegroundColor Green
    
    Write-Host "`n✅ Essential MCP servers started!" -ForegroundColor Green
    Get-MCPStatus
}

function Stop-AllMCPServers {
    Write-Host "`n🛑 Stopping MCP servers..." -ForegroundColor Yellow
    
    $paths = @(
        "$script:MCPBasePath\Infisical",
        "$script:MCPBasePath\GithubMCP",
        "$script:MCPBasePath\FileSystemMCP"
    )
    
    foreach ($path in $paths) {
        if (Test-Path $path) {
            Push-Location $path
            docker-compose down 2>&1 | Out-Null
            Pop-Location
        }
    }
    
    Write-Host "✓ All MCP servers stopped" -ForegroundColor Green
}

function Get-MCPStatus {
    Write-Host "`n📊 MCP Server Status:" -ForegroundColor Cyan
    
    $containers = docker ps --filter "name=mcp" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    if ($containers) {
        $containers | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    } else {
        Write-Host "  No MCP servers running" -ForegroundColor Gray
    }
}

function Get-InfisicalSecrets {
    param([string]$Path = "/")
    docker exec infisical-mcp-server infisical secrets list --path="$Path" 2>&1
}

function Invoke-MCPHealthCheck {
    Write-Host "`n🔍 Running MCP health check..." -ForegroundColor Cyan
    
    $health = @{
        infisical = Test-NetConnection -ComputerName localhost -Port 3001 -WarningAction SilentlyContinue | Select-Object -ExpandProperty TcpTestSucceeded
        github = Test-NetConnection -ComputerName localhost -Port 8001 -WarningAction SilentlyContinue | Select-Object -ExpandProperty TcpTestSucceeded
        filesystem = Test-NetConnection -ComputerName localhost -Port 8000 -WarningAction SilentlyContinue | Select-Object -ExpandProperty TcpTestSucceeded
    }
    
    foreach ($server in $health.GetEnumerator()) {
        $status = if ($server.Value) { "✓" } else { "✗" }
        $color = if ($server.Value) { "Green" } else { "Red" }
        Write-Host "  $status $($server.Key)" -ForegroundColor $color
    }
}

# Aliases
Set-Alias -Name mcp-start -Value Start-AllMCPServers
Set-Alias -Name mcp-stop -Value Stop-AllMCPServers
Set-Alias -Name mcp-status -Value Get-MCPStatus
Set-Alias -Name mcp-health -Value Invoke-MCPHealthCheck

Export-ModuleMember -Function * -Alias *
