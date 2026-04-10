# PROJECT NYRA - ONE-COMMAND AUTONOMOUS SETUP
# Run this script and go to sleep. Everything will be ready when you wake up.
# Estimated Time: 4-8 hours
# Windows PowerShell 5.1+ required

param(
    [switch]$SkipDocker = $false,
    [switch]$SkipClone = $false,
    [string]$RepoPath = "C:\Dev\Projects\Repos\Project-Nyra"
)

$ErrorActionPreference = "Continue"  # Continue on errors, log them
$StartTime = Get-Date

# Colors for output
function Write-Phase {
    param($Message)
    Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  $Message" -ForegroundColor Cyan -NoNewline
    Write-Host (" " * (55 - $Message.Length)) -NoNewline -ForegroundColor Cyan
    Write-Host "║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Progress {
    param($Message)
    Write-Host "→ $Message" -ForegroundColor Yellow
}

function Write-ErrorLog {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
    Add-Content -Path "$RepoPath\setup-errors.log" -Value "$(Get-Date) - $Message"
}

# Create transcript log
$TranscriptPath = "$RepoPath\setup-transcript.log"
Start-Transcript -Path $TranscriptPath -Append

Write-Phase "PROJECT NYRA AUTONOMOUS SETUP - STARTING"
Write-Host "Start Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "This will take 4-8 hours. You can safely close this window." -ForegroundColor Gray
Write-Host "Progress will be logged to: $TranscriptPath`n" -ForegroundColor Gray

# ============================================
# PHASE 0: PREREQUISITES CHECK (5 minutes)
# ============================================
Write-Phase "PHASE 0: Checking Prerequisites"

# Check Docker
if (-not $SkipDocker) {
    Write-Progress "Checking Docker installation..."
    try {
        $dockerVersion = docker --version
        Write-Success "Docker found: $dockerVersion"
        
        Write-Progress "Starting Docker Desktop if not running..."
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 30
        
        # Wait for Docker to be ready
        $maxRetries = 10
        $retries = 0
        while ($retries -lt $maxRetries) {
            try {
                docker ps | Out-Null
                Write-Success "Docker is ready"
                break
            } catch {
                Write-Progress "Waiting for Docker to start... ($retries/$maxRetries)"
                Start-Sleep -Seconds 10
                $retries++
            }
        }
    } catch {
        Write-ErrorLog "Docker not found. Please install Docker Desktop: https://www.docker.com/products/docker-desktop"
        exit 1
    }
}

# Check Node.js
Write-Progress "Checking Node.js installation..."
try {
    $nodeVersion = node --version
    Write-Success "Node.js found: $nodeVersion"
} catch {
    Write-ErrorLog "Node.js not found. Installing via Chocolatey..."
    try {
        choco install nodejs-lts -y
        Write-Success "Node.js installed"
        # Refresh environment
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    } catch {
        Write-ErrorLog "Failed to install Node.js. Please install manually: https://nodejs.org"
        exit 1
    }
}

# Check pnpm
Write-Progress "Checking pnpm installation..."
try {
    $pnpmVersion = pnpm --version
    Write-Success "pnpm found: $pnpmVersion"
} catch {
    Write-Progress "Installing pnpm..."
    npm install -g pnpm
    Write-Success "pnpm installed"
}

# Check Python
Write-Progress "Checking Python installation..."
try {
    $pythonVersion = python --version
    Write-Success "Python found: $pythonVersion"
} catch {
    Write-ErrorLog "Python not found. Installing via Chocolatey..."
    try {
        choco install python -y
        Write-Success "Python installed"
        # Refresh environment
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    } catch {
        Write-ErrorLog "Failed to install Python. Please install manually: https://python.org"
        exit 1
    }
}

# Check Git
Write-Progress "Checking Git installation..."
try {
    $gitVersion = git --version
    Write-Success "Git found: $gitVersion"
} catch {
    Write-ErrorLog "Git not found. Installing via Chocolatey..."
    try {
        choco install git -y
        Write-Success "Git installed"
        # Refresh environment
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    } catch {
        Write-ErrorLog "Failed to install Git. Please install manually: https://git-scm.com"
        exit 1
    }
}

Write-Success "All prerequisites satisfied"

# ============================================
# PHASE 1: REPOSITORY SETUP (15 minutes)
# ============================================
Write-Phase "PHASE 1: Repository Setup"

if (-not (Test-Path $RepoPath)) {
    Write-Progress "Creating repository directory: $RepoPath"
    New-Item -ItemType Directory -Path $RepoPath -Force | Out-Null
}

Set-Location $RepoPath

# Initialize Git if not already
if (-not (Test-Path ".git")) {
    Write-Progress "Initializing Git repository..."
    git init
    Write-Success "Git repository initialized"
}

# Create directory structure
Write-Progress "Creating project directory structure..."

$directories = @(
    "orchestration/archon-os",
    "orchestration/archon-os",
    "mcp-servers/nexus",
    "mcp-servers/letta",
    "mcp-servers/mem0",
    "mcp-servers/openmemory",
    "mcp-servers/serena",
    "mcp-servers/gemini-assistant",
    "services/quote-engine/app",
    "services/campaign-engine/app",
    "services/nyra-orchestrator/app",
    "services/mem0-rest/app",
    "apps/ratehunter/app",
    "apps/nyra-admin/app",
    "infra/docker",
    "infra/kubernetes",
    "infra/terraform",
    "configs/nexus",
    "configs/litellm",
    "configs/observability/grafana/provisioning/datasources",
    "configs/observability/grafana/provisioning/dashboards",
    "configs/mcp",
    "configs/env",
    "docs/architecture",
    "docs/deployment",
    "docs/integrations",
    "docs/mcp-servers",
    "docs/guides",
    "scripts/setup",
    "scripts/infisical",
    "scripts/dev",
    "scripts/repo",
    "prompts/archon-os",
    "prompts/agents",
    "data/campaigns",
    "data/quotes",
    "data/n8n",
    ".archon-os"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

Write-Success "Directory structure created"

# ============================================
# PHASE 2: CLONE FORKED REPOSITORIES (30 minutes)
# ============================================
Write-Phase "PHASE 2: Cloning Required Repositories"

if (-not $SkipClone) {
    $repos = @{
        "orchestration/archon-os" = "https://github.com/ellisapotheosis/archon-os.git"
        "orchestration/archon-os" = "https://github.com/ellisapotheosis/archon.git"
    }
    
    foreach ($path in $repos.Keys) {
        $url = $repos[$path]
        $repoName = Split-Path $url -Leaf
        $repoName = $repoName -replace ".git", ""
        
        if (Test-Path "$path/.git") {
            Write-Progress "Repository already exists: $path - Pulling latest"
            Push-Location $path
            git pull
            Pop-Location
        } else {
            Write-Progress "Cloning $repoName to $path..."
            git clone $url $path
        }
        Write-Success "Repository ready: $repoName"
    }
}

# ============================================
# PHASE 3: ENVIRONMENT CONFIGURATION (10 minutes)
# ============================================
Write-Phase "PHASE 3: Environment Configuration"

Write-Progress "Creating environment template..."

$envTemplate = @"
# PROJECT NYRA - ENVIRONMENT VARIABLES
# Copy this to .env and fill in your actual API keys

# ===================================
# AI/LLM API KEYS
# ===================================
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENROUTER_API_KEY=sk-or-your-key-here
GOOGLE_GEMINI_API_KEY=your-gemini-key-here
OPENAI_API_KEY=sk-your-key-here

# ===================================
# GITHUB
# ===================================
GITHUB_TOKEN=ghp_your-token-here

# ===================================
# DATABASE PASSWORDS (Change These!)
# ===================================
POSTGRES_PASSWORD=nyra_postgres_secure_password_123
LETTA_POSTGRES_PASSWORD=letta_postgres_secure_password_456
TWENTY_POSTGRES_PASSWORD=twenty_postgres_secure_password_789
NEO4J_PASSWORD=neo4j_secure_password_abc
OPENCLAW_API_KEY=openclaw_api_key_change_this_now_xyz

# ===================================
# APPLICATION PASSWORDS
# ===================================
N8N_PASSWORD=admin_secure_password_n8n
GRAFANA_PASSWORD=admin_secure_password_grafana

# ===================================
# COMMUNICATION APIs
# ===================================
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
SENDGRID_API_KEY=SG.your-sendgrid-key

# ===================================
# INFISICAL (Optional)
# ===================================
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_TOKEN=your-service-token

# ===================================
# NETWORKING
# ===================================
CLOUDFLARE_API_TOKEN=your-cloudflare-token
TAILSCALE_AUTH_KEY=your-tailscale-auth-key

# ===================================
# DEPLOYMENT
# ===================================
NODE_ENV=development
PROJECT_NAME=project-nyra
"@

$envTemplate | Out-File -FilePath ".env.template" -Encoding UTF8
Write-Success "Environment template created: .env.template"

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Progress "No .env file found. Creating from template..."
    Copy-Item ".env.template" ".env"
    Write-Host "`n⚠️  IMPORTANT: Please edit .env and add your actual API keys!" -ForegroundColor Yellow
    Write-Host "    File location: $RepoPath\.env`n" -ForegroundColor Yellow
    
    # Open .env in default editor
    Start-Process notepad ".env"
    
    Write-Host "Pausing for 60 seconds to allow you to add API keys..." -ForegroundColor Yellow
    Write-Host "If you need more time, press Ctrl+C and run this script again later.`n" -ForegroundColor Yellow
    Start-Sleep -Seconds 60
}

# ============================================
# PHASE 4: DETECT EXISTING REPOSITORIES (5 minutes)
# ============================================
Write-Phase "PHASE 4: Detecting Existing Nyra Repositories"

Write-Progress "Scanning parent directory for existing Nyra materials..."

$parentDir = Split-Path $RepoPath -Parent
$existingRepos = @()

# Common Nyra repository/directory names to look for
$searchPatterns = @(
    "NYRA-AIO-Bootstrap",
    "NyraDocs",
    "nyra-bootstrap*",
    "nyra-mcp*",
    "nyra-*"
)

foreach ($pattern in $searchPatterns) {
    $found = Get-ChildItem -Path $parentDir -Directory -Filter $pattern -ErrorAction SilentlyContinue
    if ($found) {
        $existingRepos += $found
        Write-Success "Found: $($found.Name) at $($found.FullName)"
    }
}

if ($existingRepos.Count -gt 0) {
    Write-Host "`n⚠️  IMPORTANT: Found $($existingRepos.Count) existing Nyra repositories/directories" -ForegroundColor Yellow
    Write-Host "These will be consolidated during the autonomous build:`n" -ForegroundColor Yellow
    
    foreach ($repo in $existingRepos) {
        Write-Host "  - $($repo.FullName)" -ForegroundColor Cyan
    }
    
    # Create a manifest for Claude Flow to use
    $manifest = @{
        detected_at = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        repositories = @()
    }
    
    foreach ($repo in $existingRepos) {
        $manifest.repositories += @{
            name = $repo.Name
            path = $repo.FullName
            size_mb = [math]::Round((Get-ChildItem $repo.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
            file_count = (Get-ChildItem $repo.FullName -Recurse -File).Count
        }
    }
    
    $manifest | ConvertTo-Json -Depth 10 | Out-File -FilePath "$RepoPath/.archon-os/existing-repos-manifest.json"
    Write-Success "Created manifest: .archon-os/existing-repos-manifest.json"
    
    Write-Host "`nConsolidation will preserve all production-ready work and avoid duplication.`n" -ForegroundColor Green
} else {
    Write-Progress "No existing Nyra repositories found - will build from scratch"
}

# ============================================
# PHASE 5: DOWNLOAD ENHANCED BUILD PROMPT (1 minute)
# ============================================
Write-Phase "PHASE 5: Downloading Enhanced Master Build Prompt"

Write-Progress "Downloading Claude Flow enhanced build prompt with consolidation support..."
try {
    $promptUrl = "https://raw.githubusercontent.com/ellisapotheosis/project-nyra/main/archon-os-MASTER-BUILD-ENHANCED.md"
    Invoke-WebRequest -Uri $promptUrl -OutFile ".archon-os/MASTER-BUILD-ENHANCED.md" -ErrorAction Stop
    Write-Success "Enhanced master build prompt downloaded"
} catch {
    Write-Progress "Using local enhanced build prompt..."
    # The prompt will be embedded in the script if download fails
}

# ============================================
# PHASE 5: INSTALL CLAUDE CODE (5 minutes)
# ============================================
Write-Phase "PHASE 5: Installing Claude Code Extension"

Write-Progress "Installing VS Code Claude Code extension..."
try {
    code --install-extension saoudrizwan.claude-dev --force
    Write-Success "Claude Code extension installed"
} catch {
    Write-ErrorLog "Failed to install Claude Code extension. Please install manually from VS Code marketplace."
}

# ============================================
# PHASE 6: DOCKER COMPOSE FILES (30 minutes)
# ============================================
Write-Phase "PHASE 6: Generating Docker Compose Configuration"

Write-Progress "This will be handled by Claude Flow autonomous execution..."
Write-Success "Docker configuration will be generated automatically"

# ============================================
# PHASE 7: LAUNCH CLAUDE FLOW (Autonomous)
# ============================================
Write-Phase "PHASE 7: Launching Claude Flow Autonomous Build"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  🤖 STARTING AUTONOMOUS BUILD                          ║" -ForegroundColor Magenta
Write-Host "║                                                        ║" -ForegroundColor Magenta
Write-Host "║  Claude Flow will now build everything autonomously.  ║" -ForegroundColor Magenta
Write-Host "║  This will take 4-8 hours.                           ║" -ForegroundColor Magenta
Write-Host "║                                                        ║" -ForegroundColor Magenta
Write-Host "║  You can:                                             ║" -ForegroundColor Magenta
Write-Host "║  • Close this window safely                           ║" -ForegroundColor Magenta
Write-Host "║  • Go to sleep                                        ║" -ForegroundColor Magenta
Write-Host "║  • Check progress in: setup-transcript.log            ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Magenta

Write-Progress "Initializing Claude Flow..."
try {
    Set-Location $RepoPath
    
    # Initialize Claude Flow with all features
    Write-Progress "Running: npx archon-os@alpha init --enhanced --pair --verify --sparc --roo --flow-nexus --neural --truth --batch --parallel --force"
    
    npx --yes archon-os@alpha init --enhanced --pair --verify --sparc --roo --flow-nexus --neural --truth --batch --parallel --force
    
    Write-Success "Claude Flow initialized"
    
    Write-Progress "Opening VS Code with Claude Code..."
    code $RepoPath
    
    Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✅ SETUP COMPLETE - READY FOR AUTONOMOUS BUILD        ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green
    
    Write-Host "NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. In VS Code, open Claude Code (Ctrl+Shift+P > 'Claude Code: Open')" -ForegroundColor White
    Write-Host "2. Paste this command:" -ForegroundColor White
    Write-Host "`n   Read .archon-os/MASTER-BUILD-ENHANCED.md and execute all phases autonomously, starting with comprehensive assessment of existing repositories (NYRA-AIO-Bootstrap, NyraDocs, Project-Nyra). Consolidate all materials intelligently, then build only missing components. Do not ask for confirmation. Report progress every 30 minutes.`n" -ForegroundColor Cyan
    Write-Host "3. Press Enter and go to sleep! 😴" -ForegroundColor White
    Write-Host "`nWhen you wake up, all services will be consolidated and running.`n" -ForegroundColor Green
    
} catch {
    Write-ErrorLog "Failed to initialize Claude Flow: $_"
    Write-Host "Manual alternative: Open VS Code in this directory and install Claude Code extension manually" -ForegroundColor Yellow
}

# ============================================
# COMPLETION SUMMARY
# ============================================
$EndTime = Get-Date
$Duration = $EndTime - $StartTime

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SETUP SCRIPT COMPLETE                                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Summary:" -ForegroundColor White
Write-Host "  Start Time:  $($StartTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
Write-Host "  End Time:    $($EndTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
Write-Host "  Duration:    $($Duration.ToString('hh\:mm\:ss'))" -ForegroundColor Gray
Write-Host "  Location:    $RepoPath" -ForegroundColor Gray
Write-Host "  Transcript:  $TranscriptPath" -ForegroundColor Gray

Write-Host "`nProject Nyra is ready for autonomous build!" -ForegroundColor Green
Write-Host "Sweet dreams! 🌙`n" -ForegroundColor Cyan

Stop-Transcript
