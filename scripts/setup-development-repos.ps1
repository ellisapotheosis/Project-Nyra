# NYRA Development Repository Setup
# Clones forked repos and sets up submodules for development

param(
    [switch]$Force,
    [switch]$ProductionOnly
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 Setting up NYRA development repositories..." -ForegroundColor Cyan

$repoRoot = "C:\Dev\Projects\Repos\Project-Nyra"
$submodulesDir = "$repoRoot\submodules"

# Create submodules directory
if (!(Test-Path $submodulesDir)) {
    New-Item -ItemType Directory -Path $submodulesDir -Force
    Write-Host "📁 Created submodules directory" -ForegroundColor Green
}

Set-Location $repoRoot

# Development repositories to clone
$devRepos = @(
    @{
        Name = "claude-flow"
        Url = "https://github.com/ellisapotheosis/claude-flow.git"
        Path = "$submodulesDir\claude-flow"
        Branch = "main"
        Development = $true
    },
    @{
        Name = "archon"
        Url = "https://github.com/ellisapotheosis/archon.git"
        Path = "$submodulesDir\archon"
        Branch = "main"
        Development = $true
    },
    @{
        Name = "serena-mcp"
        Url = "https://github.com/ruvnet/serena-mcp.git"
        Path = "$submodulesDir\serena-mcp"
        Branch = "main"
        Development = $false
    }
)

foreach ($repo in $devRepos) {
    Write-Host "`n📦 Processing $($repo.Name)..." -ForegroundColor Yellow

    if (Test-Path $repo.Path) {
        if ($Force) {
            Write-Host "   Removing existing directory..." -ForegroundColor Red
            Remove-Item -Path $repo.Path -Recurse -Force
        }
        else {
            Write-Host "   Directory exists, skipping. Use -Force to overwrite." -ForegroundColor Gray
            continue
        }
    }

    if ($ProductionOnly -and $repo.Development) {
        Write-Host "   Skipping development repo (production mode)" -ForegroundColor Gray
        continue
    }

    Write-Host "   Cloning $($repo.Url)..." -ForegroundColor Green
    git clone $repo.Url $repo.Path

    if (Test-Path $repo.Path) {
        Set-Location $repo.Path
        git checkout $repo.Branch

        if ($repo.Development) {
            Write-Host "   Setting up development branch..." -ForegroundColor Cyan
            git checkout -b "nyra-development"
            git push -u origin nyra-development
        }

        # Add as git submodule
        Set-Location $repoRoot
        $relativePath = $repo.Path.Replace("$repoRoot\", "").Replace("\", "/")

        try {
            git submodule add $repo.Url $relativePath
            Write-Host "   ✅ Added as git submodule" -ForegroundColor Green
        }
        catch {
            Write-Host "   ⚠️  Submodule may already exist" -ForegroundColor Yellow
        }
    }
}

# Initialize submodules
Write-Host "`n🔄 Initializing git submodules..." -ForegroundColor Cyan
git submodule init
git submodule update --remote

# Install development dependencies
if (!$ProductionOnly) {
    Write-Host "`n📦 Installing development dependencies..." -ForegroundColor Cyan

    # Claude-Flow development setup
    if (Test-Path "$submodulesDir\claude-flow") {
        Write-Host "   Setting up Claude-Flow development environment..." -ForegroundColor Green
        Set-Location "$submodulesDir\claude-flow"

        if (Test-Path "package.json") {
            npm install
            npm run build
        }

        # Initialize claude-flow memory and databases
        Write-Host "   Initializing Claude-Flow memory systems..." -ForegroundColor Cyan
        npx claude-flow@alpha memory init --reasoningbank --agentdb --ruvector
        npx claude-flow@alpha agent memory init --reasoningbank
    }

    # Archon development setup
    if (Test-Path "$submodulesDir\archon") {
        Write-Host "   Setting up Archon development environment..." -ForegroundColor Green
        Set-Location "$submodulesDir\archon"

        # Install frontend dependencies
        if (Test-Path "frontend\package.json") {
            Set-Location "frontend"
            npm install
            Set-Location ".."
        }

        # Install backend dependencies
        if (Test-Path "backend\package.json") {
            Set-Location "backend"
            npm install
            Set-Location ".."
        }

        # Install database dependencies
        if (Test-Path "database\package.json") {
            Set-Location "database"
            npm install
            Set-Location ".."
        }
    }
}

# Create development configuration
Set-Location $repoRoot

$devConfig = @{
    "development_mode" = $true
    "repositories" = @{
        "claude_flow" = @{
            "path" = "./submodules/claude-flow"
            "mode" = "development"
            "branch" = "nyra-development"
            "mcp_port" = 7403
        }
        "archon" = @{
            "path" = "./submodules/archon"
            "mode" = "development"
            "branch" = "nyra-development"
            "frontend_port" = 8051
            "backend_port" = 8080
        }
    }
    "integration" = @{
        "dual_orchestrator" = $true
        "claude_flow_primary" = $true
        "archon_secondary" = $true
        "sync_enabled" = $true
    }
} | ConvertTo-Json -Depth 4

$devConfig | Out-File -FilePath "$repoRoot\config\development.json" -Encoding UTF8

Write-Host "`n✅ Development repository setup complete!" -ForegroundColor Green
Write-Host "📁 Submodules location: $submodulesDir" -ForegroundColor Yellow
Write-Host "⚙️  Configuration: $repoRoot\config\development.json" -ForegroundColor Yellow

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run: docker-compose -f docker/orchestrator/docker-compose.yml up -d" -ForegroundColor White
Write-Host "2. Run: docker-compose -f docker/client/docker-compose.yml up -d" -ForegroundColor White
Write-Host "3. Use: nyra-claude.ps1 flow memory store key value" -ForegroundColor White
Write-Host "4. Access Archon UI: http://localhost:8051" -ForegroundColor White
Write-Host "5. Access Claude-Flow: http://localhost:7403" -ForegroundColor White