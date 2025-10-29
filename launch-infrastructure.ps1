# NYRA Infrastructure Launch Script
# PowerShell script to start all NYRA infrastructure services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NYRA INFRASTRUCTURE LAUNCH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Create Docker network if it doesn't exist
Write-Host ""
Write-Host "Creating Docker network..." -ForegroundColor Yellow
docker network create nyra-network 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Network 'nyra-network' created" -ForegroundColor Green
} else {
    Write-Host "✓ Network 'nyra-network' already exists" -ForegroundColor Green
}

# Function to start a compose stack
function Start-ComposeStack {
    param(
        [string]$Name,
        [string]$ComposeFile,
        [string]$Description
    )

    Write-Host ""
    Write-Host "Starting $Description..." -ForegroundColor Yellow

    if (Test-Path $ComposeFile) {
        docker-compose -f $ComposeFile up -d
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $Name started successfully" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to start $Name" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "✗ Compose file not found: $ComposeFile" -ForegroundColor Red
        return $false
    }
    return $true
}

# Start all infrastructure stacks in order
$success = $true

# 1. Security Stack (Database, Bitwarden, Infisical)
$success = $success -and (Start-ComposeStack `
    -Name "Security Stack" `
    -ComposeFile "nyra-infra\compose\security.compose.yml" `
    -Description "Security Stack (Postgres, Bitwarden, Infisical)")

# Wait for database to be ready
Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 2. UI Stack (Open-WebUI, Ollama)
$success = $success -and (Start-ComposeStack `
    -Name "UI Stack" `
    -ComposeFile "nyra-infra\compose\ui.compose.yml" `
    -Description "UI Stack (Open-WebUI, Ollama)")

# 3. Orchestration Stack (MetaMCP, Archon)
$success = $success -and (Start-ComposeStack `
    -Name "Orchestration Stack" `
    -ComposeFile "nyra-infra\compose\orchestration.compose.yml" `
    -Description "Orchestration Stack (MetaMCP, Archon MCP, Archon UI)")

# 4. General MCP Servers
$success = $success -and (Start-ComposeStack `
    -Name "MCP Servers" `
    -ComposeFile "nyra-infra\compose\general-mcp.compose.yml" `
    -Description "General MCP Servers (GitHub, Docker, Filesystem, Memory, Notion)")

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INFRASTRUCTURE STATUS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($success) {
    Write-Host "✓ All services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access Points:" -ForegroundColor Cyan
    Write-Host "  Security:" -ForegroundColor White
    Write-Host "    - Bitwarden:  http://localhost:8081" -ForegroundColor Gray
    Write-Host "    - Infisical:  http://localhost:8080" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  User Interface:" -ForegroundColor White
    Write-Host "    - Open-WebUI: http://localhost:3002" -ForegroundColor Gray
    Write-Host "    - Archon UI:  http://localhost:3005" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Orchestration:" -ForegroundColor White
    Write-Host "    - MetaMCP:    http://localhost:3000" -ForegroundColor Gray
    Write-Host "    - Archon MCP: http://localhost:3003" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  MCP Servers:" -ForegroundColor White
    Write-Host "    - GitHub:     http://localhost:3010" -ForegroundColor Gray
    Write-Host "    - Docker:     http://localhost:3011" -ForegroundColor Gray
    Write-Host "    - Filesystem: http://localhost:3012" -ForegroundColor Gray
    Write-Host "    - Memory:     http://localhost:3013" -ForegroundColor Gray
    Write-Host "    - Notion:     http://localhost:3014" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Backend Services:" -ForegroundColor White
    Write-Host "    - PostgreSQL: localhost:5432" -ForegroundColor Gray
    Write-Host "    - Ollama:     http://localhost:11434" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Configure secrets in Infisical: http://localhost:8080" -ForegroundColor Gray
    Write-Host "  2. Set up passwords in Bitwarden: http://localhost:8081" -ForegroundColor Gray
    Write-Host "  3. Pull Ollama models: docker exec nyra-ollama ollama pull llama2" -ForegroundColor Gray
    Write-Host "  4. Access Open-WebUI: http://localhost:3002" -ForegroundColor Gray
    Write-Host "  5. Configure MCP servers: .\configure-mcp-servers.ps1" -ForegroundColor Gray
} else {
    Write-Host "✗ Some services failed to start. Check logs above." -ForegroundColor Red
    Write-Host ""
    Write-Host "View logs with:" -ForegroundColor Yellow
    Write-Host "  docker-compose -f nyra-infra\compose\security.compose.yml logs" -ForegroundColor Gray
    Write-Host "  docker-compose -f nyra-infra\compose\ui.compose.yml logs" -ForegroundColor Gray
    Write-Host "  docker-compose -f nyra-infra\compose\orchestration.compose.yml logs" -ForegroundColor Gray
    Write-Host "  docker-compose -f nyra-infra\compose\general-mcp.compose.yml logs" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
