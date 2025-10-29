# NYRA Infrastructure Teardown Script
# PowerShell script to stop and remove all NYRA infrastructure services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NYRA INFRASTRUCTURE TEARDOWN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Cannot teardown services." -ForegroundColor Red
    exit 1
}

# Function to stop a compose stack
function Stop-ComposeStack {
    param(
        [string]$Name,
        [string]$ComposeFile,
        [string]$Description
    )

    Write-Host ""
    Write-Host "Stopping $Description..." -ForegroundColor Yellow

    if (Test-Path $ComposeFile) {
        docker-compose -f $ComposeFile down
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $Name stopped successfully" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to stop $Name" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "! Compose file not found: $ComposeFile (skipping)" -ForegroundColor Yellow
    }
    return $true
}

# Ask for confirmation
Write-Host "This will stop and remove all NYRA infrastructure containers." -ForegroundColor Yellow
Write-Host "Data volumes will be preserved unless you run with -RemoveVolumes flag." -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Continue? (y/N)"

if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "Teardown cancelled." -ForegroundColor Yellow
    exit 0
}

$success = $true

# Stop all infrastructure stacks in reverse order
Write-Host ""
Write-Host "Stopping services..." -ForegroundColor Cyan

# 1. General MCP Servers
$success = $success -and (Stop-ComposeStack `
    -Name "MCP Servers" `
    -ComposeFile "nyra-infra\compose\general-mcp.compose.yml" `
    -Description "General MCP Servers")

# 2. Orchestration Stack
$success = $success -and (Stop-ComposeStack `
    -Name "Orchestration Stack" `
    -ComposeFile "nyra-infra\compose\orchestration.compose.yml" `
    -Description "Orchestration Stack")

# 3. UI Stack
$success = $success -and (Stop-ComposeStack `
    -Name "UI Stack" `
    -ComposeFile "nyra-infra\compose\ui.compose.yml" `
    -Description "UI Stack")

# 4. Security Stack
$success = $success -and (Stop-ComposeStack `
    -Name "Security Stack" `
    -ComposeFile "nyra-infra\compose\security.compose.yml" `
    -Description "Security Stack")

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($success) {
    Write-Host "✓ All services stopped successfully!" -ForegroundColor Green
    Write-Host ""

    # Show container status
    Write-Host "Remaining NYRA containers:" -ForegroundColor Cyan
    docker ps -a --filter "name=nyra-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    Write-Host ""
    Write-Host "Data Volumes Status:" -ForegroundColor Cyan
    docker volume ls --filter "name=nyra" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"

    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  To remove volumes (DELETES ALL DATA):" -ForegroundColor Gray
    Write-Host "    docker-compose -f nyra-infra\compose\security.compose.yml down -v" -ForegroundColor Gray
    Write-Host "    docker-compose -f nyra-infra\compose\ui.compose.yml down -v" -ForegroundColor Gray
    Write-Host "    docker-compose -f nyra-infra\compose\orchestration.compose.yml down -v" -ForegroundColor Gray
    Write-Host "    docker-compose -f nyra-infra\compose\general-mcp.compose.yml down -v" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  To remove Docker network:" -ForegroundColor Gray
    Write-Host "    docker network rm nyra-network" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  To restart infrastructure:" -ForegroundColor Gray
    Write-Host "    .\launch-infrastructure.ps1" -ForegroundColor Gray
} else {
    Write-Host "✗ Some services failed to stop. Check logs above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Force stop all NYRA containers:" -ForegroundColor Yellow
    Write-Host "  docker ps -a --filter 'name=nyra-' -q | ForEach-Object { docker stop $_ }" -ForegroundColor Gray
    Write-Host "  docker ps -a --filter 'name=nyra-' -q | ForEach-Object { docker rm $_ }" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
