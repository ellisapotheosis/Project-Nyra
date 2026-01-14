# Project-Nyra Environment Switcher
# Intelligently switches between development (linked packages) and production (npm/docker)

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("development", "production")]
    [string]$Environment,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "🔄 Switching Project-Nyra environment to: $Environment" -ForegroundColor Cyan

$projectRoot = "C:\Dev\Projects\Repos\Project-Nyra"
$currentEnv = $env:NODE_ENV ?? "production"

# Check current environment
if ($currentEnv -eq $Environment -and !$Force) {
    Write-Host "⚠️ Already in $Environment environment" -ForegroundColor Yellow
    Write-Host "Use -Force to switch anyway" -ForegroundColor Gray
    exit 0
}

Set-Location $projectRoot

Write-Host "`n📊 Current Environment: $currentEnv" -ForegroundColor Gray
Write-Host "🎯 Target Environment: $Environment" -ForegroundColor Gray

# Environment switching logic
switch ($Environment) {
    "development" {
        Write-Host "`n🔧 Switching to Development Environment..." -ForegroundColor Magenta

        # Set environment variables
        $env:NODE_ENV = "development"
        $env:NYRA_DEV_MODE = "true"

        # Check if packages are already linked
        $devLinksPath = "$projectRoot\config\development-links.json"
        if (Test-Path $devLinksPath) {
            Write-Host "   ✅ Development packages already linked" -ForegroundColor Green
        }
        else {
            Write-Host "   🔗 Linking development packages..." -ForegroundColor Yellow
            & "$projectRoot\scripts\link-dev-packages.ps1"
        }

        Write-Host "`n✅ Development environment active!" -ForegroundColor Green
        Write-Host "`n🎯 Development Features:" -ForegroundColor Yellow
        Write-Host "   • Live Code Editing: Edit submodules/claude-flow or submodules/archon" -ForegroundColor White
        Write-Host "   • Hot Reloading: Changes reflect immediately" -ForegroundColor White
        Write-Host "   • Local MCP Servers: Using your forked code directly" -ForegroundColor White
        Write-Host "`n💡 Folder Structure:" -ForegroundColor Cyan
        Write-Host "   • Development Code: $projectRoot\submodules\" -ForegroundColor Gray
        Write-Host "   • Live claude-flow: submodules\claude-flow\" -ForegroundColor Gray
        Write-Host "   • Live archon: submodules\archon\" -ForegroundColor Gray
    }

    "production" {
        Write-Host "`n🏭 Switching to Production Environment..." -ForegroundColor Magenta

        # Set environment variables
        $env:NODE_ENV = "production"
        $env:NYRA_DEV_MODE = $null

        # Restore production MCP configuration
        if (Test-Path "$projectRoot\.mcp.json.backup") {
            Copy-Item "$projectRoot\.mcp.json.backup" "$projectRoot\.mcp.json" -Force
            Write-Host "   ✅ Production MCP config restored" -ForegroundColor Green
        }

        # Clean up development files
        $devLinksPath = "$projectRoot\config\development-links.json"
        if (Test-Path $devLinksPath) {
            Remove-Item $devLinksPath -Force
            Write-Host "   ✅ Development links config removed" -ForegroundColor Green
        }

        Write-Host "`n✅ Production environment active!" -ForegroundColor Green
        Write-Host "`n🎯 Production Features:" -ForegroundColor Yellow
        Write-Host "   • Stable Packages: Using published npm packages" -ForegroundColor White
        Write-Host "   • Docker Containers: Containerized services" -ForegroundColor White
        Write-Host "   • Production MCP: Using claude-flow@alpha from npm" -ForegroundColor White
        Write-Host "`n💡 Production Structure:" -ForegroundColor Cyan
        Write-Host "   • npm packages: claude-flow@alpha, ruv-swarm@latest" -ForegroundColor Gray
        Write-Host "   • Docker services: Via docker-compose files" -ForegroundColor Gray
        Write-Host "   • Stable deployment: No development dependencies" -ForegroundColor Gray
    }
}

# Create environment indicator file
$envIndicator = @{
    "environment" = $Environment
    "switched_at" = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    "previous_environment" = $currentEnv
    "node_env" = $env:NODE_ENV
    "dev_mode" = $env:NYRA_DEV_MODE
    "project_root" = $projectRoot
} | ConvertTo-Json -Depth 2

$envIndicator | Out-File -FilePath "$projectRoot\.nyra-environment" -Encoding UTF8

Write-Host "`n📋 Environment Status:" -ForegroundColor Cyan
Write-Host "   Environment: $Environment" -ForegroundColor White
Write-Host "   NODE_ENV: $($env:NODE_ENV)" -ForegroundColor White
Write-Host "   Dev Mode: $($env:NYRA_DEV_MODE ?? 'false')" -ForegroundColor White
Write-Host "   Project: Project-Nyra" -ForegroundColor White

# Environment-specific next steps
Write-Host "`n🚀 What's Next:" -ForegroundColor Magenta
if ($Environment -eq "development") {
    Write-Host "1. Edit code in: .\submodules\claude-flow\ or .\submodules\archon\" -ForegroundColor White
    Write-Host "2. Changes appear instantly in running MCP servers" -ForegroundColor White
    Write-Host "3. Test: nyra-claude.ps1 flow --version (uses your local code)" -ForegroundColor White
    Write-Host "4. Commit/push changes to your forks when ready" -ForegroundColor White
}
else {
    Write-Host "1. Use stable: nyra-claude.ps1 flow --version (uses npm packages)" -ForegroundColor White
    Write-Host "2. Start production: .\scripts\start-nyra-docker-infrastructure.ps1" -ForegroundColor White
    Write-Host "3. Deploy: docker-compose up for containerized services" -ForegroundColor White
    Write-Host "4. Switch back to dev: .\scripts\switch-environment.ps1 -Environment development" -ForegroundColor White
}

Write-Host "`n🔄 To switch back:" -ForegroundColor Gray
$oppositeEnv = if ($Environment -eq "development") { "production" } else { "development" }
Write-Host "   .\scripts\switch-environment.ps1 -Environment $oppositeEnv" -ForegroundColor Gray