# Setup script for Nyra local development

# Parameters
param(
    [switch]$Force = $false
)

# Create directories
Write-Host "Creating directory structure..." -ForegroundColor Cyan
$directories = @(
    "infra/mcp-servers/infisical-mcp",
    "infra/mcp-servers/bitwarden-mcp"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
        Write-Host "  Created $dir" -ForegroundColor Green
    }
}

# Setup environment files
if (-not (Test-Path "infra/.env") -or $Force) {
    Write-Host "Creating environment files..." -ForegroundColor Cyan
    Copy-Item "infra/.env.example" "infra/.env" -Force
    Write-Host "  Created infra/.env - Please edit this file with your API keys" -ForegroundColor Yellow
}

if (-not (Test-Path "infra/.env.local") -or $Force) {
    Copy-Item "infra/.env.local.example" "infra/.env.local" -Force
    Write-Host "  Created infra/.env.local - Please update with your local paths" -ForegroundColor Yellow
}

# Create the network
$networkExists = docker network inspect nyra-network 2>$null
if (-not $networkExists) {
    Write-Host "Creating Docker network 'nyra-network'..." -ForegroundColor Cyan
    docker network create nyra-network
    Write-Host "  Network created" -ForegroundColor Green
}

# Final instructions
Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Edit 'infra/.env' to add your API keys and credentials" -ForegroundColor White
Write-Host "2. Start the services with: ./infra/tasks/up.ps1 -All" -ForegroundColor White
Write-Host "3. Or start specific components: ./infra/tasks/up.ps1 -MetaMCP -Orchestration" -ForegroundColor White
Write-Host "`nTo view logs: ./infra/tasks/logs.ps1 -Follow" -ForegroundColor White
Write-Host "To shut down: ./infra/tasks/down.ps1 -All" -ForegroundColor White