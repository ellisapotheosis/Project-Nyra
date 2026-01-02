# Environment Setup Script for Project Nyra
# Retrieves secrets from Infisical and sets environment variables

Write-Host "🔐 Setting up Project Nyra environment variables..." -ForegroundColor Cyan

try {
    # Check if Infisical is available
    if (-not (Get-Command infisical -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Infisical CLI not found. Please install Infisical first." -ForegroundColor Red
        Write-Host "   Visit: https://infisical.com/docs/cli/overview" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "✅ Infisical CLI found" -ForegroundColor Green

    # Set Flow Nexus environment variables
    Write-Host "🔌 Setting up Flow Nexus MCP server..." -ForegroundColor Yellow
    $env:FLOW_NEXUS_TOKEN = (infisical secrets get FLOW_NEXUS_TOKEN --env=prod --plain)
    $env:FLOW_NEXUS_URL   = (infisical secrets get FLOW_NEXUS_URL   --env=prod --plain)
    
    if ($env:FLOW_NEXUS_TOKEN -and $env:FLOW_NEXUS_URL) {
        Write-Host "  ✅ Flow Nexus credentials configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Flow Nexus credentials missing or incomplete" -ForegroundColor Yellow
    }

    # Set Notion integration token
    Write-Host "📝 Setting up Notion integration..." -ForegroundColor Yellow
    $env:NOTION_TOKEN = (infisical secrets get NOTION_TOKEN --env=prod --plain)
    
    if ($env:NOTION_TOKEN) {
        Write-Host "  ✅ Notion token configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Notion token missing" -ForegroundColor Yellow
    }

    # Additional MCP server environment variables
    Write-Host "🤖 Setting up additional MCP servers..." -ForegroundColor Yellow
    
    # Desktop Commander (if token needed)
    try {
        $env:DESKTOP_COMMANDER_CONFIG = (infisical secrets get DESKTOP_COMMANDER_CONFIG --env=prod --plain)
        if ($env:DESKTOP_COMMANDER_CONFIG) {
            Write-Host "  ✅ Desktop Commander config set" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ℹ️ Desktop Commander config not found (may not be required)" -ForegroundColor Gray
    }

    # rUv Swarm (if credentials needed)
    try {
        $env:RUV_SWARM_TOKEN = (infisical secrets get RUV_SWARM_TOKEN --env=prod --plain)
        if ($env:RUV_SWARM_TOKEN) {
            Write-Host "  ✅ rUv Swarm token set" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ℹ️ rUv Swarm token not found (may not be required)" -ForegroundColor Gray
    }

    # Claude Flow (if additional config needed)
    try {
        $env:CLAUDE_FLOW_CONFIG = (infisical secrets get CLAUDE_FLOW_CONFIG --env=prod --plain)
        if ($env:CLAUDE_FLOW_CONFIG) {
            Write-Host "  ✅ Claude Flow config set" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ℹ️ Claude Flow config not found (using defaults)" -ForegroundColor Gray
    }

    # GitHub integration (if needed for advanced features)
    try {
        $env:GITHUB_TOKEN = (infisical secrets get GITHUB_TOKEN --env=prod --plain)
        if ($env:GITHUB_TOKEN) {
            Write-Host "  ✅ GitHub token configured" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ℹ️ GitHub token not found (using Flow Nexus GitHub integration)" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "🎉 Environment setup completed!" -ForegroundColor Green
    Write-Host ""
    
    # Display status summary
    Write-Host "📊 Environment Status:" -ForegroundColor Cyan
    Write-Host "  Flow Nexus Token: $(if ($env:FLOW_NEXUS_TOKEN) { '✅ Set' } else { '❌ Missing' })" -ForegroundColor $(if ($env:FLOW_NEXUS_TOKEN) { 'Green' } else { 'Red' })
    Write-Host "  Flow Nexus URL:   $(if ($env:FLOW_NEXUS_URL) { '✅ Set' } else { '❌ Missing' })" -ForegroundColor $(if ($env:FLOW_NEXUS_URL) { 'Green' } else { 'Red' })
    Write-Host "  Notion Token:     $(if ($env:NOTION_TOKEN) { '✅ Set' } else { '❌ Missing' })" -ForegroundColor $(if ($env:NOTION_TOKEN) { 'Green' } else { 'Red' })
    
    Write-Host ""
    Write-Host "🚀 Ready to run:" -ForegroundColor Yellow
    Write-Host "   • npm run archon:start" -ForegroundColor White
    Write-Host "   • npm run github:test" -ForegroundColor White
    Write-Host "   • node scripts/github-mcp-test.js" -ForegroundColor White
    
} catch {
    Write-Host "❌ Environment setup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Check your Infisical configuration and try again." -ForegroundColor Yellow
    exit 1
}

# Export variables to session
Write-Host ""
Write-Host "💡 Environment variables are set for this PowerShell session." -ForegroundColor Blue
Write-Host "   To persist across sessions, add to your PowerShell profile or use a .env file." -ForegroundColor Blue