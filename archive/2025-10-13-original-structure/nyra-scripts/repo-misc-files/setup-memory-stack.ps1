# Nyra Memory Stack Setup Script (PowerShell)
Write-Host "🐱✨ Setting up Nyra Memory Stack..." -ForegroundColor Cyan

# Check if Docker is running
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green

# Start Docker services
Write-Host "`n📦 Starting memory services with Docker Compose..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\nyra-infrastructure\docker"
docker-compose up -d

# Wait for services to be healthy
Write-Host "`n⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
Write-Host "`n🏥 Checking service health..." -ForegroundColor Yellow
$services = @("nyra-qdrant", "nyra-zep", "nyra-falkordb", "nyra-redis")
foreach ($service in $services) {
    $status = docker ps --filter "name=$service" --format "{{.Status}}"
    if ($status -like "*healthy*" -or $status -like "*Up*") {
        Write-Host "✅ $service is running" -ForegroundColor Green
    } else {
        Write-Host "❌ $service is not healthy: $status" -ForegroundColor Red
    }
}

# Setup Python MCP servers
Write-Host "`n🐍 Setting up Python MCP servers..." -ForegroundColor Yellow

# Mem0 MCP
$mem0Path = "$PSScriptRoot\nyra-mcp-servers\local\mem0-mcp"
Write-Host "`nSetting up Mem0 MCP..." -ForegroundColor Cyan
Set-Location $mem0Path
if (-not (Test-Path "venv")) {
    python -m venv venv
}
& ".\venv\Scripts\Activate.ps1"
pip install mem0-mcp
deactivate

# Archon MCP
$archonPath = "$PSScriptRoot\nyra-mcp-servers\local\archon-mcp"
Write-Host "`nSetting up Archon MCP..." -ForegroundColor Cyan
Set-Location $archonPath
if (-not (Test-Path "venv")) {
    python -m venv venv
}
& ".\venv\Scripts\Activate.ps1"
pip install archon-mcp
deactivate

# Create .env file if it doesn't exist
$envPath = "$PSScriptRoot\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "`n📝 Creating .env file..." -ForegroundColor Yellow
    @"
# Nyra Memory Stack Environment Variables
OPENAI_API_KEY=your-openai-api-key
GITHUB_PERSONAL_ACCESS_TOKEN=your-github-token
MEM0_API_KEY=your-mem0-api-key

# Service URLs
QDRANT_URL=http://localhost:6333
ZEP_API_URL=http://localhost:8000
FALKORDB_URL=redis://localhost:6379
"@ | Set-Content $envPath
    Write-Host "✅ Created .env file - Please update with your API keys!" -ForegroundColor Yellow
}

Write-Host "`n🎉 Nyra Memory Stack setup complete!" -ForegroundColor Green
Write-Host "`nServices running at:" -ForegroundColor Cyan
Write-Host "  - Qdrant: http://localhost:6333" -ForegroundColor White
Write-Host "  - Zep: http://localhost:8000" -ForegroundColor White
Write-Host "  - FalkorDB: redis://localhost:6379" -ForegroundColor White
Write-Host "  - Redis Cache: redis://localhost:6380" -ForegroundColor White

Write-Host "`n⚠️  Next steps:" -ForegroundColor Yellow
Write-Host "1. Update .env file with your API keys" -ForegroundColor White
Write-Host "2. Copy mcp-config-template.json to %APPDATA%\Claude\config.json" -ForegroundColor White
Write-Host "3. Install Node.js MCP servers (qdrant-mcp, zep-mcp)" -ForegroundColor White
Write-Host "4. Restart Claude Desktop to load MCP servers" -ForegroundColor White

Set-Location $PSScriptRoot