# ==============================================================================
# Gitea Local Git Server Setup Script (PowerShell)
# ==============================================================================
# This script configures Gitea for local network use on the orchestrator PC
#
# Prerequisites:
#   - Docker and Docker Compose installed
#   - Infisical CLI configured (optional)
#   - Network access to PostgreSQL
#
# Usage:
#   .\setup-gitea.ps1 [-SkipInfisical] [-AdminUser "admin"] [-AdminPassword "pass"]
#
# ==============================================================================

[CmdletBinding()]
param(
    [switch]$SkipInfisical,
    [string]$AdminUser = "",
    [string]$AdminPassword = "",
    [string]$GiteaDomain = "localhost"
)

# Script directories
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$DockerDir = Join-Path $ScriptDir "..\docker"
$ConfigDir = Join-Path $ScriptDir "..\configs\gitea"

# ==============================================================================
# Functions
# ==============================================================================

function Write-InfoLog {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-SuccessLog {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-WarningLog {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-ErrorLog {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-Prerequisites {
    Write-InfoLog "Checking prerequisites..."

    # Check Docker
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-ErrorLog "Docker is not installed"
        exit 1
    }

    # Check Docker Compose
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        $dockerComposePlugin = docker compose version 2>$null
        if (-not $dockerComposePlugin) {
            Write-ErrorLog "Docker Compose is not installed"
            exit 1
        }
    }

    # Check Infisical (if not skipped)
    if (-not $SkipInfisical) {
        if (-not (Get-Command infisical -ErrorAction SilentlyContinue)) {
            Write-WarningLog "Infisical CLI not found, will use default credentials"
            $script:SkipInfisical = $true
        }
    }

    Write-SuccessLog "Prerequisites check passed"
}

function New-RandomPassword {
    param([int]$Length = 32)

    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    $password = -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $password
}

function Set-Credentials {
    Write-InfoLog "Setting up credentials..."

    $dbUser = "gitea"
    $dbPassword = "gitea_password"
    $dbName = "gitea"
    $secretKey = ""
    $internalToken = ""

    if (-not $SkipInfisical) {
        Write-InfoLog "Fetching credentials from Infisical..."

        try {
            if ([string]::IsNullOrEmpty($script:AdminUser)) {
                $script:AdminUser = (infisical secrets get GITEA_ADMIN_USER --silent 2>$null) -replace "`n|`r", ""
                if ([string]::IsNullOrEmpty($script:AdminUser)) { $script:AdminUser = "admin" }
            }

            if ([string]::IsNullOrEmpty($script:AdminPassword)) {
                $script:AdminPassword = (infisical secrets get GITEA_ADMIN_PASSWORD --silent 2>$null) -replace "`n|`r", ""
            }

            $dbUser = (infisical secrets get GITEA_DB_USER --silent 2>$null) -replace "`n|`r", ""
            if ([string]::IsNullOrEmpty($dbUser)) { $dbUser = "gitea" }

            $dbPassword = (infisical secrets get GITEA_DB_PASSWORD --silent 2>$null) -replace "`n|`r", ""
            if ([string]::IsNullOrEmpty($dbPassword)) { $dbPassword = "gitea_password" }

            $dbName = (infisical secrets get GITEA_DB_NAME --silent 2>$null) -replace "`n|`r", ""
            if ([string]::IsNullOrEmpty($dbName)) { $dbName = "gitea" }

            $secretKey = (infisical secrets get GITEA_SECRET_KEY --silent 2>$null) -replace "`n|`r", ""
            $internalToken = (infisical secrets get GITEA_INTERNAL_TOKEN --silent 2>$null) -replace "`n|`r", ""
        }
        catch {
            Write-WarningLog "Failed to fetch from Infisical: $_"
        }
    }

    # Generate defaults if not from Infisical
    if ([string]::IsNullOrEmpty($script:AdminUser)) {
        $script:AdminUser = "admin"
    }

    if ([string]::IsNullOrEmpty($script:AdminPassword)) {
        Write-WarningLog "No admin password provided, generating random password..."
        $script:AdminPassword = New-RandomPassword -Length 32
        Write-InfoLog "Generated admin password: $($script:AdminPassword)"
    }

    if ([string]::IsNullOrEmpty($secretKey)) {
        $secretKey = New-RandomPassword -Length 32
    }

    if ([string]::IsNullOrEmpty($internalToken)) {
        $internalToken = New-RandomPassword -Length 64
    }

    # Create or update .env file
    $envFile = Join-Path $DockerDir ".env.gitea"
    Write-InfoLog "Creating environment file: $envFile"

    $envContent = @"
# Gitea Configuration
# Generated on $(Get-Date)

# Database
GITEA_DB_USER=$dbUser
GITEA_DB_PASSWORD=$dbPassword
GITEA_DB_NAME=$dbName

# Admin Account
GITEA_ADMIN_USER=$($script:AdminUser)
GITEA_ADMIN_PASSWORD=$($script:AdminPassword)
GITEA_ADMIN_EMAIL=admin@localhost

# Security Keys
GITEA_SECRET_KEY=$secretKey
GITEA_INTERNAL_TOKEN=$internalToken

# Server Configuration
GITEA_DOMAIN=$GiteaDomain
GITEA_LOG_LEVEL=Info
"@

    $envContent | Out-File -FilePath $envFile -Encoding UTF8 -Force

    Write-SuccessLog "Credentials configured"
}

function New-ConfigDirectory {
    Write-InfoLog "Setting up configuration directory..."

    if (-not (Test-Path $ConfigDir)) {
        New-Item -ItemType Directory -Path $ConfigDir -Force | Out-Null
    }

    $appIniPath = Join-Path $ConfigDir "app.ini"
    if (-not (Test-Path $appIniPath)) {
        Write-InfoLog "Creating app.ini template..."

        $appIniContent = @'
; Gitea Configuration Template
; This file is a template - actual configuration is managed via environment variables
; in docker-compose.yml

APP_NAME = Project Nyra - Local Git Server
RUN_MODE = prod
RUN_USER = git

[repository]
ROOT = /data/git/repositories
DEFAULT_BRANCH = main
DEFAULT_PRIVATE = private
ENABLE_PUSH_CREATE_USER = true
ENABLE_PUSH_CREATE_ORG = true

[repository.local]
LOCAL_COPY_PATH = /tmp/gitea/local-repo

[repository.upload]
ENABLED = true
FILE_MAX_SIZE = 100
MAX_FILES = 10

[server]
PROTOCOL = http
DOMAIN = localhost
HTTP_PORT = 3000
ROOT_URL = http://localhost:3001/
DISABLE_SSH = false
SSH_PORT = 2222
START_SSH_SERVER = true
LFS_START_SERVER = true
OFFLINE_MODE = false

[database]
DB_TYPE = postgres
HOST = gitea-db:5432
NAME = gitea
USER = gitea
SCHEMA = public
SSL_MODE = disable
LOG_SQL = false

[security]
INSTALL_LOCK = true
MIN_PASSWORD_LENGTH = 8
PASSWORD_COMPLEXITY = lower,upper,digit
PASSWORD_HASH_ALGO = pbkdf2

[service]
DISABLE_REGISTRATION = true
REQUIRE_SIGNIN_VIEW = false
REGISTER_EMAIL_CONFIRM = false
ENABLE_NOTIFY_MAIL = false
DEFAULT_KEEP_EMAIL_PRIVATE = true
DEFAULT_ALLOW_CREATE_ORGANIZATION = true
NO_REPLY_ADDRESS = noreply@localhost

[webhook]
ALLOWED_HOST_LIST = *
SKIP_TLS_VERIFY = false

[mailer]
ENABLED = false

[cache]
ENABLED = true
ADAPTER = memory

[session]
PROVIDER = file
PROVIDER_CONFIG = /data/gitea/sessions

[log]
MODE = console
LEVEL = Info

[git]
MAX_GIT_DIFF_LINES = 10000
MAX_GIT_DIFF_LINE_CHARACTERS = 5000
MAX_GIT_DIFF_FILES = 100
DISABLE_DIFF_HIGHLIGHT = false

[api]
ENABLE_SWAGGER = true
MAX_RESPONSE_ITEMS = 50

[oauth2]
ENABLE = true
'@

        $appIniContent | Out-File -FilePath $appIniPath -Encoding UTF8 -Force
    }

    Write-SuccessLog "Configuration directory setup complete"
}

function Start-GiteaServices {
    Write-InfoLog "Starting Gitea services..."

    Push-Location $DockerDir

    try {
        # Load environment variables
        Get-Content ".env.gitea" | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.+)$") {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
            }
        }

        # Start services
        if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
            docker-compose up -d gitea-db gitea
        }
        else {
            docker compose up -d gitea-db gitea
        }

        Write-SuccessLog "Gitea services started"
    }
    finally {
        Pop-Location
    }
}

function Wait-ForGitea {
    Write-InfoLog "Waiting for Gitea to be ready..."

    $maxAttempts = 60
    $attempt = 0

    while ($attempt -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001/api/healthz" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host ""
                Write-SuccessLog "Gitea is ready"
                return $true
            }
        }
        catch {
            # Service not ready yet
        }

        $attempt++
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }

    Write-Host ""
    Write-ErrorLog "Gitea failed to start within expected time"
    return $false
}

function New-InitialRepositories {
    Write-InfoLog "Creating initial repositories..."

    Start-Sleep -Seconds 5

    $apiUrl = "http://localhost:3001/api/v1"
    $credentials = "$($script:AdminUser):$($script:AdminPassword)"
    $encodedCredentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($credentials))

    Write-InfoLog "Creating Project-Nyra repository..."

    $repoData = @{
        name = "Project-Nyra"
        description = "Project Nyra - AI-Powered Mortgage Platform"
        private = $false
        auto_init = $true
        default_branch = "main"
        gitignores = "Node,Python"
        license = "MIT"
        readme = "Default"
    } | ConvertTo-Json

    try {
        $headers = @{
            "Authorization" = "Basic $encodedCredentials"
            "Content-Type" = "application/json"
        }

        Invoke-RestMethod -Uri "$apiUrl/user/repos" -Method Post -Headers $headers -Body $repoData -ErrorAction Stop | Out-Null
        Write-SuccessLog "Repository created successfully"
    }
    catch {
        Write-WarningLog "Repository might already exist or creation failed: $_"
    }

    Write-SuccessLog "Initial repositories created"
}

function Set-SSHConfiguration {
    Write-InfoLog "Configuring SSH access..."

    $sshDir = Join-Path $env:USERPROFILE ".ssh"
    if (-not (Test-Path $sshDir)) {
        New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
    }

    Write-InfoLog "SSH configuration instructions:"
    Write-Host ""
    Write-Host "To use SSH with Gitea:" -ForegroundColor Cyan
    Write-Host "1. Generate SSH key (if you don't have one):"
    Write-Host "   ssh-keygen -t ed25519 -C 'your_email@example.com'"
    Write-Host ""
    Write-Host "2. Add your public key to Gitea:"
    Write-Host "   - Go to http://localhost:3001"
    Write-Host "   - Login with admin credentials"
    Write-Host "   - Go to Settings -> SSH/GPG Keys"
    Write-Host "   - Add your public key (~/.ssh/id_ed25519.pub)"
    Write-Host ""
    Write-Host "3. Clone repositories using SSH:"
    Write-Host "   git clone ssh://git@${GiteaDomain}:2222/admin/Project-Nyra.git"
    Write-Host ""

    Write-SuccessLog "SSH configuration complete"
}

function New-GitHooks {
    Write-InfoLog "Setting up Git hooks..."

    $hooksDir = Join-Path $ConfigDir "hooks"
    if (-not (Test-Path $hooksDir)) {
        New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
    }

    # Create pre-receive hook template
    $preReceiveContent = @'
#!/bin/bash
# Pre-receive hook for Gitea
# This hook is called before refs are updated

while read oldrev newrev refname; do
    # Add your validation logic here
    echo "Validating push to ${refname}..."

    # Example: Check commit message format
    # Example: Run linters
    # Example: Validate file types
done

exit 0
'@

    $preReceiveContent | Out-File -FilePath (Join-Path $hooksDir "pre-receive.sample") -Encoding UTF8 -Force

    # Create post-receive hook template
    $postReceiveContent = @'
#!/bin/bash
# Post-receive hook for Gitea
# This hook is called after refs are updated

while read oldrev newrev refname; do
    # Add your automation logic here
    echo "Processing push to ${refname}..."

    # Example: Trigger CI/CD pipeline
    # Example: Send notifications
    # Example: Update documentation
done

exit 0
'@

    $postReceiveContent | Out-File -FilePath (Join-Path $hooksDir "post-receive.sample") -Encoding UTF8 -Force

    Write-SuccessLog "Git hooks templates created"
}

function Set-BackupStrategy {
    Write-InfoLog "Configuring backup strategy..."

    $backupDir = Join-Path $ScriptDir "..\backups\gitea"
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }

    # Create backup script
    $backupScriptContent = @'
# Gitea Backup Script (PowerShell)

$BackupDir = Split-Path -Parent $MyInvocation.MyCommand.Path | Join-Path -ChildPath "..\backups\gitea"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "gitea_backup_$Timestamp.tar.gz"

Write-Host "Starting Gitea backup..."

# Backup Gitea data
docker exec orchestrator-gitea /bin/bash -c "cd /data && tar czf /tmp/gitea_backup.tar.gz ."
docker cp orchestrator-gitea:/tmp/gitea_backup.tar.gz $BackupFile
docker exec orchestrator-gitea rm /tmp/gitea_backup.tar.gz

# Backup database
docker exec orchestrator-gitea-db pg_dump -U gitea gitea | Out-File -FilePath "$BackupDir\gitea_db_$Timestamp.sql" -Encoding UTF8

# Compress database backup
Compress-Archive -Path "$BackupDir\gitea_db_$Timestamp.sql" -DestinationPath "$BackupDir\gitea_db_$Timestamp.sql.zip"
Remove-Item "$BackupDir\gitea_db_$Timestamp.sql"

# Keep only last 7 backups
Get-ChildItem $BackupDir -Filter "gitea_backup_*.tar.gz" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 7 | Remove-Item
Get-ChildItem $BackupDir -Filter "gitea_db_*.sql.zip" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 7 | Remove-Item

Write-Host "Backup completed: $BackupFile"
'@

    $backupScriptPath = Join-Path $ScriptDir "backup-gitea.ps1"
    $backupScriptContent | Out-File -FilePath $backupScriptPath -Encoding UTF8 -Force

    Write-InfoLog "Backup scripts created:"
    Write-Host "  - Backup: $backupScriptPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To setup automated backups, create a scheduled task:" -ForegroundColor Cyan
    Write-Host "  schtasks /create /tn 'Gitea Backup' /tr 'powershell.exe -File $backupScriptPath' /sc daily /st 02:00"
    Write-Host ""

    Write-SuccessLog "Backup strategy configured"
}

function Show-Summary {
    Write-SuccessLog "Gitea setup complete!"
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "Gitea Local Git Server - Setup Summary" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Access Information:"
    Write-Host "  Web UI:     http://localhost:3001" -ForegroundColor Yellow
    Write-Host "  SSH:        ssh://git@${GiteaDomain}:2222" -ForegroundColor Yellow
    Write-Host "  API:        http://localhost:3001/api/v1" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Admin Credentials:"
    Write-Host "  Username:   $($script:AdminUser)" -ForegroundColor Green
    Write-Host "  Password:   $($script:AdminPassword)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Initial Repository:"
    Write-Host "  Project-Nyra: http://localhost:3001/admin/Project-Nyra"
    Write-Host ""
    Write-Host "Configuration:"
    Write-Host "  Docker Compose: $DockerDir\docker-compose.yml"
    Write-Host "  Environment:    $DockerDir\.env.gitea"
    Write-Host "  Config Dir:     $ConfigDir"
    Write-Host ""
    Write-Host "Next Steps:"
    Write-Host "  1. Login to web UI and change admin password"
    Write-Host "  2. Add SSH keys for team members"
    Write-Host "  3. Configure webhooks for CI/CD"
    Write-Host "  4. Setup automated backups"
    Write-Host "  5. Configure Cloudflare tunnel for external access"
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
}

# ==============================================================================
# Main Execution
# ==============================================================================

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Gitea Local Git Server Setup" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Test-Prerequisites
Set-Credentials
New-ConfigDirectory
Start-GiteaServices

if (Wait-ForGitea) {
    New-InitialRepositories
    Set-SSHConfiguration
    New-GitHooks
    Set-BackupStrategy
    Show-Summary
}
else {
    Write-ErrorLog "Setup failed - Gitea did not start properly"
    exit 1
}
