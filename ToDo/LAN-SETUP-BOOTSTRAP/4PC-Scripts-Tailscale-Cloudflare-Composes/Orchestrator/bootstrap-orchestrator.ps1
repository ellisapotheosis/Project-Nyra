# NYRA Orchestrator PC Bootstrap
# PC: MinisForum UH680 (Ryzen 7 6800H, 16GB DDR5, 1TB SSD)
# Role: Main orchestrator - runs all Docker containers, MCP servers, MetaMCP

Write-Host "🚀 NYRA Orchestrator PC Bootstrap" -ForegroundColor Cyan

# 1. Install Docker Desktop
Write-Host "
1. Docker Desktop..." -ForegroundColor Yellow
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "  Please install Docker Desktop manually"
    Write-Host "  Download: https://www.docker.com/products/docker-desktop"
} else {
    Write-Host "  ✅ Docker installed" -ForegroundColor Green
}

# 2. Install Node.js (LTS)
Write-Host "
2. Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    winget install OpenJS.NodeJS.LTS -e
} else {
    Write-Host "  ✅ Node.js installed: $(node --version)" -ForegroundColor Green
}

# 3. Clone Project-Nyra
Write-Host "
3. Project-Nyra Repository..." -ForegroundColor Yellow
$repoPath = "C:\Dev\Projects\Repos\Project-Nyra"
if (-not (Test-Path $repoPath)) {
    New-Item -ItemType Directory -Path "C:\Dev\Projects\Repos" -Force | Out-Null
    git clone https://github.com/YourOrg/Project-Nyra.git $repoPath
} else {
    Write-Host "  ✅ Repository exists" -ForegroundColor Green
}

# 4. Setup Cloudflare Tunnel
Write-Host "
4. Cloudflare Tunnel..." -ForegroundColor Yellow
Write-Host "  Run: cloudflared tunnel login"
Write-Host "  Then: cloudflared tunnel create nyra-orchestrator"

# 5. Start Docker Compose
Write-Host "
5. Starting Docker Services..." -ForegroundColor Yellow
Push-Location $repoPath
docker compose -f infra/docker-compose.yml up -d
Pop-Location

Write-Host "
✅ Orchestrator Bootstrap Complete!" -ForegroundColor Green
