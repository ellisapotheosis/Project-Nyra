# Archon Deployment Script for Project Nyra
# Automated deployment with validation and health checks

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'prod', 'agents')]
    [string]$Profile = 'dev',

    [Parameter(Mandatory=$false)]
    [switch]$SkipValidation,

    [Parameter(Mandatory=$false)]
    [switch]$Clean,

    [Parameter(Mandatory=$false)]
    [switch]$Rebuild
)

Write-Host "🚀 Archon Deployment Script" -ForegroundColor Cyan
Write-Host "============================`n" -ForegroundColor Cyan

# Navigate to infra/docker directory
$infraPath = Join-Path $PSScriptRoot "..\infra\docker"
Set-Location $infraPath

# Validation Phase
if (-not $SkipValidation) {
    Write-Host "📋 Validation Phase" -ForegroundColor Yellow
    Write-Host "-------------------`n" -ForegroundColor Yellow

    # Check .env file
    if (-not (Test-Path ".env")) {
        Write-Host "❌ ERROR: .env file not found!" -ForegroundColor Red
        Write-Host "   Copy archon-integration.env.example to .env and configure" -ForegroundColor Yellow
        Write-Host "   Example: cp archon-integration.env.example .env" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ .env file found" -ForegroundColor Green

    # Check Supabase configuration
    $envContent = Get-Content ".env" -Raw
    if ($envContent -notmatch "SUPABASE_URL=https://.+\.supabase\.co" -or
        $envContent -match "SUPABASE_URL=https://your-project\.supabase\.co") {
        Write-Host "❌ ERROR: SUPABASE_URL not configured!" -ForegroundColor Red
        Write-Host "   Edit .env and add your Supabase project URL" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Supabase URL configured" -ForegroundColor Green

    if ($envContent -match "SUPABASE_SERVICE_KEY=(eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.\.\.|\s*$)") {
        Write-Host "❌ ERROR: SUPABASE_SERVICE_KEY not configured!" -ForegroundColor Red
        Write-Host "   Edit .env and add your Supabase service_role key" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Supabase service key configured" -ForegroundColor Green

    # Check at least one AI provider
    $hasProvider = $false
    if ($envContent -match "OPENAI_API_KEY=sk-.+") { $hasProvider = $true }
    if ($envContent -match "ANTHROPIC_API_KEY=sk-ant-.+") { $hasProvider = $true }
    if ($envContent -match "GOOGLE_API_KEY=AIzaSy.+") { $hasProvider = $true }
    if ($envContent -match "OLLAMA_BASE_URL=http://.+") { $hasProvider = $true }

    if (-not $hasProvider) {
        Write-Host "⚠️  WARNING: No AI provider API key configured!" -ForegroundColor Yellow
        Write-Host "   Configure at least one: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY, or OLLAMA_BASE_URL" -ForegroundColor Yellow
        Write-Host "   You can configure this later in the Archon UI (Settings page)" -ForegroundColor Gray
    } else {
        Write-Host "✅ AI provider configured" -ForegroundColor Green
    }

    # Check Docker
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERROR: Docker not found!" -ForegroundColor Red
        Write-Host "   Install Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Docker installed: $dockerVersion" -ForegroundColor Green

    # Check networks
    Write-Host "`n📡 Checking Docker networks..." -ForegroundColor Yellow
    $networks = docker network ls --format "{{.Name}}" 2>$null

    if ($networks -notcontains "nyra-mcp") {
        Write-Host "⚠️  Creating nyra-mcp network..." -ForegroundColor Yellow
        docker network create nyra-mcp
    } else {
        Write-Host "✅ nyra-mcp network exists" -ForegroundColor Green
    }

    if ($networks -notcontains "nyra-core") {
        Write-Host "⚠️  Creating nyra-core network..." -ForegroundColor Yellow
        docker network create nyra-core
    } else {
        Write-Host "✅ nyra-core network exists" -ForegroundColor Green
    }

    Write-Host "`n✅ Validation complete`n" -ForegroundColor Green
}

# Clean Phase (optional)
if ($Clean) {
    Write-Host "🧹 Cleaning existing Archon containers..." -ForegroundColor Yellow
    docker-compose -f docker-compose.archon.yml down -v
    Write-Host "✅ Cleanup complete`n" -ForegroundColor Green
}

# Build Phase
Write-Host "🔨 Build Phase" -ForegroundColor Yellow
Write-Host "--------------`n" -ForegroundColor Yellow

$buildArgs = @("-f", "docker-compose.archon.yml", "up", "-d")
if ($Rebuild) {
    $buildArgs = @("-f", "docker-compose.archon.yml", "up", "-d", "--build", "--force-recreate")
}

if ($Profile -eq 'agents') {
    $buildArgs = @("--profile", "agents") + $buildArgs
}

Write-Host "🐳 Starting Docker services..." -ForegroundColor Cyan
& docker-compose $buildArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ ERROR: Docker Compose failed!" -ForegroundColor Red
    Write-Host "   Check logs: docker-compose -f docker-compose.archon.yml logs" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Services started`n" -ForegroundColor Green

# Wait for services
Write-Host "⏳ Waiting for services to initialize (60 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 60

# Health Check Phase
Write-Host "`n🔍 Health Check Phase" -ForegroundColor Yellow
Write-Host "---------------------`n" -ForegroundColor Yellow

function Test-ServiceHealth {
    param(
        [string]$Name,
        [string]$Url,
        [int]$Retries = 3
    )

    Write-Host "  Checking $Name..." -ForegroundColor Gray
    $attempt = 0
    $success = $false

    while ($attempt -lt $Retries -and -not $success) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "  ✅ $Name: HEALTHY" -ForegroundColor Green
                $success = $true
            }
        } catch {
            $attempt++
            if ($attempt -lt $Retries) {
                Write-Host "  ⏳ $Name: Retrying ($attempt/$Retries)..." -ForegroundColor Yellow
                Start-Sleep -Seconds 5
            }
        }
    }

    if (-not $success) {
        Write-Host "  ❌ $Name: NOT RESPONDING" -ForegroundColor Red
        Write-Host "     Check logs: docker-compose -f docker-compose.archon.yml logs $($Name.ToLower() -replace ' ', '-')" -ForegroundColor Yellow
    }

    return $success
}

$allHealthy = $true
$allHealthy = (Test-ServiceHealth -Name "Archon Server" -Url "http://localhost:8181/health") -and $allHealthy
$allHealthy = (Test-ServiceHealth -Name "Archon MCP" -Url "http://localhost:8051/health") -and $allHealthy
$allHealthy = (Test-ServiceHealth -Name "Archon UI" -Url "http://localhost:3737") -and $allHealthy

if ($Profile -eq 'agents') {
    $allHealthy = (Test-ServiceHealth -Name "Archon Agents" -Url "http://localhost:8052/health") -and $allHealthy
}

# Summary Phase
Write-Host "`n" + "="*60 -ForegroundColor Cyan
if ($allHealthy) {
    Write-Host "🎉 Archon Deployment Complete!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Archon Deployment Partial Success" -ForegroundColor Yellow
    Write-Host "   Some services failed health checks - review logs above" -ForegroundColor Yellow
}
Write-Host "="*60 + "`n" -ForegroundColor Cyan

# Access Information
Write-Host "📊 Access Points:" -ForegroundColor Cyan
Write-Host "  • Archon UI:     http://localhost:3737" -ForegroundColor White
Write-Host "  • API Server:    http://localhost:8181" -ForegroundColor White
Write-Host "  • MCP Server:    http://localhost:8051" -ForegroundColor White
Write-Host "  • API Docs:      http://localhost:8181/docs" -ForegroundColor White
if ($Profile -eq 'agents') {
    Write-Host "  • Agents API:    http://localhost:8052" -ForegroundColor White
}
Write-Host ""

# Nexus Router Integration
Write-Host "🔗 Nexus Router Integration:" -ForegroundColor Cyan
Write-Host "  • Nexus Gateway: http://localhost:6000" -ForegroundColor White
Write-Host "  • MCP Proxy:     http://localhost:6000/mcp/archon" -ForegroundColor White
Write-Host ""

# Next Steps
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Open http://localhost:3737 in your browser" -ForegroundColor White
Write-Host "  2. Complete the onboarding wizard" -ForegroundColor White
Write-Host "  3. Configure AI provider API keys (if not in .env)" -ForegroundColor White
Write-Host "  4. Start crawling documentation!" -ForegroundColor White
Write-Host ""

# Useful Commands
Write-Host "💡 Useful Commands:" -ForegroundColor Cyan
Write-Host "  • View logs:     docker-compose -f docker-compose.archon.yml logs -f" -ForegroundColor White
Write-Host "  • Stop services: docker-compose -f docker-compose.archon.yml down" -ForegroundColor White
Write-Host "  • Restart:       docker-compose -f docker-compose.archon.yml restart" -ForegroundColor White
Write-Host "  • With agents:   docker-compose --profile agents -f docker-compose.archon.yml up -d" -ForegroundColor White
Write-Host ""

# Documentation
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  • Setup Guide:   ARCHON-COMPLETE-SETUP-GUIDE.md" -ForegroundColor White
Write-Host "  • Technical:     docs/archon-os-technical-analysis.md" -ForegroundColor White
Write-Host "  • Deployment:    docs/architecture/ARCHON-OS-ANALYSIS.md" -ForegroundColor White
Write-Host ""
