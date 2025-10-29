#!/usr/bin/env pwsh
<#
.SYNOPSIS
Connect NYRA project with NYRA-AIO-Bootstrap MCP ecosystem
#>

param([switch]$Start)

Write-Host "🔗 NYRA MCP Integration" -ForegroundColor Magenta

if ($Start) {
    # Start NYRA-specific MCP servers
    Write-Host "🚀 Starting NYRA MCP servers..." -ForegroundColor Cyan
    
    # Import Docker AI for MCP management
    Import-Module "C:\Dev\NYRA-AIO-Bootstrap\modules\Docker.AI\Docker.AI.psm1" -Force
    
    # Start Docker AI stack for NYRA development
    Start-DockerAIStack -WithMCP
    
    # Start NYRA development services
    docker-compose -f "docker-compose.yml" up -d
    
    Write-Host "✅ NYRA MCP ecosystem started" -ForegroundColor Green
    Write-Host "🏠 NYRA UI: http://localhost:3000" -ForegroundColor Blue
    Write-Host "🤖 MCP Status: docker-ai" -ForegroundColor Cyan
} else {
    # Show status
    Write-Host "📊 NYRA MCP Status:" -ForegroundColor Cyan
    docker-ai
}
