# Nyra Docker/WSL Migration Script
# Migrates the current Windows development environment to containerized WSL2

param(
    [switch]$DryRun = $false,
    [switch]$SkipBackup = $false,
    [switch]$Force = $false,
    [string]$BackupPath = "C:\Nyra-Backups\$(Get-Date -Format 'yyyy-MM-dd-HH-mm-ss')"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Nyra Docker/WSL Migration Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

# Check if WSL is installed
try {
    $wslVersion = wsl --version
    Write-Host "✅ WSL installed: $($wslVersion[0])" -ForegroundColor Green
} catch {
    Write-Error "❌ WSL is not installed. Please install WSL2 first."
    exit 1
}

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Error "❌ Docker is not installed. Please install Docker Desktop first."
    exit 1
}

# Check if Docker Desktop is using WSL2 backend
$dockerInfo = docker info --format json | ConvertFrom-Json
if ($dockerInfo.OSType -ne "linux") {
    Write-Warning "⚠️  Docker Desktop may not be using WSL2 backend. Consider enabling it for better performance."
}

# Function to create backup
function New-ProjectBackup {
    param([string]$Path)

    if ($SkipBackup) {
        Write-Host "⏩ Skipping backup as requested" -ForegroundColor Yellow
        return
    }

    Write-Host "💾 Creating backup at: $Path" -ForegroundColor Yellow

    if (-not $DryRun) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null

        # Backup current project
        Write-Host "   Backing up project files..."
        Copy-Item -Path "." -Destination "$Path\project-nyra" -Recurse -Force -Exclude @(".git", "node_modules", "__pycache__", ".venv")

        # Backup git history
        Write-Host "   Backing up git history..."
        git bundle create "$Path\project-nyra.bundle" --all

        # Backup current environment
        Write-Host "   Backing up environment info..."
        @{
            NodeVersion = node --version
            NpmVersion = npm --version
            VoltaVersion = volta --version
            DockerVersion = docker --version
            WSLVersion = wsl --version
            WindowsVersion = [System.Environment]::OSVersion.VersionString
            BackupDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            ProjectPath = $PWD.Path
        } | ConvertTo-Json -Depth 3 | Set-Content "$Path\environment-info.json"

        # Create restoration script
        @"
# Restoration Script for Nyra Project
# Created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# To restore the Windows environment:
# 1. Copy project-nyra folder to desired location
# 2. Restore git repository: git clone project-nyra.bundle project-nyra-restored
# 3. Install Node.js and dependencies as per environment-info.json
# 4. Run: npm install (or volta pin if using Volta)

Write-Host "Project restored. Check environment-info.json for original configuration details."
"@ | Set-Content "$Path\RESTORE_INSTRUCTIONS.ps1"

        Write-Host "✅ Backup completed at: $Path" -ForegroundColor Green
    } else {
        Write-Host "   [DRY RUN] Would create backup at: $Path" -ForegroundColor Magenta
    }
}

# Function to setup WSL Ubuntu distribution
function Initialize-WSLUbuntu {
    Write-Host "🐧 Setting up WSL Ubuntu environment..." -ForegroundColor Yellow

    if ($DryRun) {
        Write-Host "   [DRY RUN] Would install Ubuntu-22.04 distribution" -ForegroundColor Magenta
        return
    }

    # Check if Ubuntu is already installed
    $wslDistros = wsl --list --quiet
    if ($wslDistros -contains "Ubuntu-22.04") {
        Write-Host "   Ubuntu-22.04 already installed" -ForegroundColor Green
    } else {
        Write-Host "   Installing Ubuntu-22.04..."
        wsl --install -d Ubuntu-22.04
        Write-Host "   Ubuntu-22.04 installed. Please complete the initial setup." -ForegroundColor Green
    }

    # Configure WSL settings
    $wslConfigPath = "$env:USERPROFILE\.wslconfig"
    if (-not (Test-Path $wslConfigPath)) {
        Write-Host "   Creating .wslconfig..."
        @"
[wsl2]
memory=8GB
processors=4
swap=2GB
localhostForwarding=true
kernelCommandLine=vsyscall=emulate
debugConsole=true

[experimental]
sparseVhd=true
autoMemoryReclaim=gradual
"@ | Set-Content $wslConfigPath
        Write-Host "   .wslconfig created" -ForegroundColor Green
    }
}

# Function to build Docker containers
function Build-DockerContainers {
    Write-Host "🐳 Building Docker containers..." -ForegroundColor Yellow

    if ($DryRun) {
        Write-Host "   [DRY RUN] Would build containers with docker-compose build" -ForegroundColor Magenta
        return
    }

    # Ensure development Docker Compose file exists
    if (-not (Test-Path "docker-compose.dev.yml")) {
        Write-Error "❌ docker-compose.dev.yml not found. Please ensure migration files are in place."
        exit 1
    }

    # Build containers
    docker-compose -f docker-compose.dev.yml build
    Write-Host "✅ Docker containers built successfully" -ForegroundColor Green
}

# Function to migrate project structure
function Update-ProjectStructure {
    Write-Host "📁 Updating project structure..." -ForegroundColor Yellow

    if ($DryRun) {
        Write-Host "   [DRY RUN] Would create Docker infrastructure directories" -ForegroundColor Magenta
        return
    }

    # Create Docker infrastructure directories
    $dirs = @(
        "infra/docker/dev",
        "infra/docker/metamcp",
        "infra/docker/claude-flow",
        "infra/docker/archon",
        "infra/docker/infisical",
        "infra/docker/nyra",
        "infra/sql/init",
        "configs/claude-flow",
        "configs/archon",
        "configs/infisical",
        "configs/falkordb",
        "configs/chromadb"
    )

    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "   Created: $dir" -ForegroundColor Green
        }
    }

    # Create placeholder Dockerfiles
    $dockerfiles = @(
        "infra/docker/metamcp/Dockerfile.gateway",
        "infra/docker/claude-flow/Dockerfile.claude-flow",
        "infra/docker/archon/Dockerfile.archon",
        "infra/docker/infisical/Dockerfile.sync",
        "infra/docker/nyra/Dockerfile.orchestrator",
        "infra/docker/nyra/Dockerfile.webui"
    )

    foreach ($dockerfile in $dockerfiles) {
        if (-not (Test-Path $dockerfile)) {
            "# Placeholder Dockerfile for $($dockerfile.Split('/')[-1])" | Set-Content $dockerfile
            Write-Host "   Created placeholder: $dockerfile" -ForegroundColor Green
        }
    }
}

# Function to test migration
function Test-Migration {
    Write-Host "🧪 Testing migration..." -ForegroundColor Yellow

    if ($DryRUN) {
        Write-Host "   [DRY RUN] Would test container startup" -ForegroundColor Magenta
        return
    }

    try {
        # Test container startup
        Write-Host "   Starting containers for testing..."
        docker-compose -f docker-compose.dev.yml up -d --build

        # Wait for services
        Start-Sleep -Seconds 30

        # Check container health
        $containers = docker-compose -f docker-compose.dev.yml ps -q
        $healthy = $true

        foreach ($container in $containers) {
            $status = docker inspect $container --format '{{.State.Health.Status}}'
            if ($status -eq "unhealthy") {
                Write-Warning "   Container $container is unhealthy"
                $healthy = $false
            }
        }

        if ($healthy) {
            Write-Host "✅ Migration test successful" -ForegroundColor Green
        } else {
            Write-Warning "⚠️  Some containers are unhealthy. Check logs with: docker-compose logs"
        }

        # Stop test containers
        docker-compose -f docker-compose.dev.yml down

    } catch {
        Write-Error "❌ Migration test failed: $($_.Exception.Message)"
        docker-compose -f docker-compose.dev.yml down
    }
}

# Function to create VS Code configuration
function New-VSCodeConfiguration {
    Write-Host "⚙️ Creating VS Code configuration..." -ForegroundColor Yellow

    if ($DryRun) {
        Write-Host "   [DRY RUN] Would create .vscode configuration" -ForegroundColor Magenta
        return
    }

    $vscodeDir = ".vscode"
    if (-not (Test-Path $vscodeDir)) {
        New-Item -ItemType Directory -Path $vscodeDir -Force | Out-Null
    }

    # VS Code settings for WSL development
    @{
        "terminal.integrated.defaultProfile.windows" = "WSL"
        "remote.WSL.fileWatcher.polling" = $true
        "files.watcherExclude" = @{
            "**/node_modules/**" = $true
            "**/.git/objects/**" = $true
            "**/.git/subtree-cache/**" = $true
            "**/dist/**" = $true
        }
        "docker.dockerodeOptions" = @{
            "socketPath" = "/var/run/docker.sock"
        }
    } | ConvertTo-Json -Depth 3 | Set-Content "$vscodeDir/settings.json"

    Write-Host "   VS Code settings created" -ForegroundColor Green
}

# Main migration flow
try {
    Write-Host ""
    Write-Host "📋 Migration Plan:" -ForegroundColor Cyan
    Write-Host "1. Create backup of current environment"
    Write-Host "2. Setup WSL Ubuntu distribution"
    Write-Host "3. Update project structure for containers"
    Write-Host "4. Build Docker containers"
    Write-Host "5. Test migration"
    Write-Host "6. Create VS Code configuration"
    Write-Host ""

    if (-not $Force) {
        $confirmation = Read-Host "Do you want to proceed? (y/N)"
        if ($confirmation -notmatch "^[Yy]") {
            Write-Host "Migration cancelled by user." -ForegroundColor Yellow
            exit 0
        }
    }

    # Execute migration steps
    New-ProjectBackup -Path $BackupPath
    Initialize-WSLUbuntu
    Update-ProjectStructure
    Build-DockerContainers
    Test-Migration
    New-VSCodeConfiguration

    Write-Host ""
    Write-Host "🎉 Migration completed successfully!" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📚 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Open project in VS Code with Remote-WSL extension"
    Write-Host "2. Use 'Dev Containers: Rebuild and Reopen in Container' command"
    Write-Host "3. Configure secrets: infisical login"
    Write-Host "4. Start services: docker-compose -f docker-compose.dev.yml up -d"
    Write-Host "5. Access Nyra UI at: http://localhost:3000"
    Write-Host ""
    Write-Host "📁 Backup Location: $BackupPath" -ForegroundColor Yellow
    Write-Host ""

} catch {
    Write-Error "❌ Migration failed: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "🔄 Rollback Options:" -ForegroundColor Yellow
    Write-Host "1. Restore from backup: $BackupPath"
    Write-Host "2. Check Docker logs: docker-compose logs"
    Write-Host "3. Reset containers: docker-compose down && docker system prune"
    exit 1
}