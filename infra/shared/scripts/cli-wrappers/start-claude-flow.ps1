<#
.SYNOPSIS
Claude-flow Startup Script for NYRA Development Environment
#>

# Import the Apotheosis.Claude module
try {
    Import-Module Apotheosis.Claude -Force
    Write-Host "🤖 Apotheosis.Claude module loaded successfully" -ForegroundColor Green
} catch {
    Write-Error "Failed to load Apotheosis.Claude module: $($_.Exception.Message)"
    exit 1
}

# Start all claude-flow MCP servers
Write-Host "🚀 Starting NYRA claude-flow ecosystem..." -ForegroundColor Cyan
Start-ClaudeFlow -ServerName 'all' -UseWrappers

# Show status
Start-Sleep -Seconds 5
Get-ClaudeStatus

Write-Host "✅ Claude-flow startup complete!" -ForegroundColor Green
Write-Host "Use 'claude-status' to check server health" -ForegroundColor Gray
