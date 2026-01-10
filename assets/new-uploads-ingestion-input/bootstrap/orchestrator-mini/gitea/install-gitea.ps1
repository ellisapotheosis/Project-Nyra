<#
.SYNOPSIS
    Gitea installation script for Project-Nyra

.DESCRIPTION
    Installs Gitea with Docker Compose
    Configures PostgreSQL database
    Sets up reverse proxy with Traefik
    Configures SSH and webhooks
#>

[CmdletBinding()]
param(
    [string]$GiteaDomain = 'git.nyra.local',
    [int]$HTTPPort = 3000,
    [int]$SSHPort = 2222,
    [string]$DataPath = 'C:\nyra\gitea'
)

$ErrorActionPreference = 'Stop'

function Write-GiteaLog {
    param(
        [string]$Message,
        [ValidateSet('Info', 'Success', 'Warning', 'Error')]
        [string]$Level = 'Info'
    )

    $colors = @{
        Info = 'Cyan'
        Success = 'Green'
        Warning = 'Yellow'
        Error = 'Red'
    }

    $timestamp = Get-Date -Format 'HH:mm:ss'
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
    Write-Host "[$Level] " -NoNewline -ForegroundColor $colors[$Level]
    Write-Host $Message
}

function New-GiteaDirectories {
    Write-GiteaLog "Creating Gitea directories..." -Level Info

    $directories = @(
        "$DataPath\data",
        "$DataPath\config",
        "$DataPath\postgres"
    )

    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            $null = New-Item -ItemType Directory -Path $dir -Force
            Write-GiteaLog "Created: $dir" -Level Success
        }
    }
}

function New-GiteaDockerCompose {
    Write-GiteaLog "Creating Docker Compose configuration..." -Level Info

    $composeContent = @"
version: '3.8'

services:
  gitea:
    image: gitea/gitea:latest
    container_name: nyra-gitea
    restart: unless-stopped
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=postgres
      - GITEA__database__HOST=gitea-db:5432
      - GITEA__database__NAME=gitea
      - GITEA__database__USER=gitea
      - GITEA__database__PASSWD=gitea_password_change_me
      - GITEA__server__DOMAIN=$GiteaDomain
      - GITEA__server__HTTP_PORT=$HTTPPort
      - GITEA__server__ROOT_URL=http://$GiteaDomain:$HTTPPort/
      - GITEA__server__SSH_PORT=$SSHPort
      - GITEA__server__SSH_DOMAIN=$GiteaDomain
      - GITEA__security__INSTALL_LOCK=false
      - GITEA__service__DISABLE_REGISTRATION=false
      - GITEA__service__REQUIRE_SIGNIN_VIEW=false
      - GITEA__webhook__ALLOWED_HOST_LIST=*
      - GITEA__actions__ENABLED=true
    volumes:
      - ${DataPath}\data:/data
      - ${DataPath}\config:/etc/gitea
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "${HTTPPort}:${HTTPPort}"
      - "${SSHPort}:22"
    depends_on:
      - gitea-db
    networks:
      - nyra-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.gitea.rule=Host(\`$GiteaDomain\`)"
      - "traefik.http.routers.gitea.entrypoints=web"
      - "traefik.http.services.gitea.loadbalancer.server.port=$HTTPPort"

  gitea-db:
    image: postgres:16-alpine
    container_name: nyra-gitea-db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=gitea
      - POSTGRES_PASSWORD=gitea_password_change_me
      - POSTGRES_DB=gitea
    volumes:
      - ${DataPath}\postgres:/var/lib/postgresql/data
    networks:
      - nyra-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gitea"]
      interval: 10s
      timeout: 5s
      retries: 5

  gitea-runner:
    image: gitea/act_runner:latest
    container_name: nyra-gitea-runner
    restart: unless-stopped
    environment:
      - GITEA_INSTANCE_URL=http://gitea:$HTTPPort
      - GITEA_RUNNER_REGISTRATION_TOKEN=\${GITEA_RUNNER_TOKEN:-}
    volumes:
      - ${DataPath}\runner:/data
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - gitea
    networks:
      - nyra-network

networks:
  nyra-network:
    external: true
"@

    $composePath = "$DataPath\docker-compose.yml"
    Set-Content -Path $composePath -Value $composeContent -Force
    Write-GiteaLog "Docker Compose created: $composePath" -Level Success
}

function New-GiteaAppIni {
    Write-GiteaLog "Creating Gitea app.ini configuration..." -Level Info

    $appIniContent = @"
[server]
APP_NAME = Project-Nyra Git
PROTOCOL = http
DOMAIN = $GiteaDomain
HTTP_PORT = $HTTPPort
ROOT_URL = http://$GiteaDomain:$HTTPPort/
DISABLE_SSH = false
SSH_PORT = $SSHPort
LFS_START_SERVER = true

[database]
DB_TYPE = postgres
HOST = gitea-db:5432
NAME = gitea
USER = gitea
PASSWD = gitea_password_change_me

[repository]
ROOT = /data/git/repositories
DEFAULT_BRANCH = main
ENABLE_PUSH_CREATE_USER = true
ENABLE_PUSH_CREATE_ORG = true

[security]
INSTALL_LOCK = false
SECRET_KEY =
INTERNAL_TOKEN =

[service]
DISABLE_REGISTRATION = false
REQUIRE_SIGNIN_VIEW = false
REGISTER_EMAIL_CONFIRM = false
ENABLE_NOTIFY_MAIL = false
DEFAULT_KEEP_EMAIL_PRIVATE = true
DEFAULT_ALLOW_CREATE_ORGANIZATION = true

[webhook]
ALLOWED_HOST_LIST = *

[actions]
ENABLED = true
DEFAULT_ACTIONS_URL = https://github.com

[log]
MODE = console, file
LEVEL = Info

[oauth2]
ENABLE = true

[api]
ENABLE_SWAGGER = true
"@

    $appIniPath = "$DataPath\config\app.ini"
    Set-Content -Path $appIniPath -Value $appIniContent -Force
    Write-GiteaLog "app.ini created: $appIniPath" -Level Success
}

function Start-GiteaServices {
    Write-GiteaLog "Starting Gitea services..." -Level Info

    # Create network if it doesn't exist
    $networkExists = docker network ls --filter name=nyra-network --format "{{.Name}}" | Where-Object { $_ -eq 'nyra-network' }

    if (-not $networkExists) {
        Write-GiteaLog "Creating Docker network: nyra-network" -Level Info
        docker network create nyra-network
    }

    # Start services
    Push-Location $DataPath

    docker-compose up -d

    if ($LASTEXITCODE -eq 0) {
        Write-GiteaLog "Gitea services started successfully" -Level Success
    } else {
        throw "Failed to start Gitea services"
    }

    Pop-Location
}

function Test-GiteaHealth {
    Write-GiteaLog "Waiting for Gitea to be ready..." -Level Info

    $maxAttempts = 30
    $attempt = 0
    $giteaUrl = "http://localhost:$HTTPPort"

    while ($attempt -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri $giteaUrl -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop

            if ($response.StatusCode -eq 200) {
                Write-GiteaLog "Gitea is ready!" -Level Success
                return $true
            }
        } catch {
            $attempt++
            Write-GiteaLog "Waiting for Gitea... ($attempt/$maxAttempts)" -Level Info
            Start-Sleep -Seconds 5
        }
    }

    Write-GiteaLog "Gitea did not become ready in time" -Level Warning
    return $false
}

function New-GiteaAdminUser {
    Write-GiteaLog "Creating admin user..." -Level Info

    $adminUsername = 'admin'
    $adminPassword = 'Admin@Nyra2024'
    $adminEmail = 'admin@nyra.local'

    # Wait for Gitea to be fully ready
    Start-Sleep -Seconds 10

    try {
        # Create admin user using Gitea CLI
        docker exec nyra-gitea gitea admin user create `
            --username $adminUsername `
            --password $adminPassword `
            --email $adminEmail `
            --admin `
            --must-change-password=false

        if ($LASTEXITCODE -eq 0) {
            Write-GiteaLog "Admin user created successfully" -Level Success
            Write-GiteaLog "  Username: $adminUsername" -Level Info
            Write-GiteaLog "  Password: $adminPassword" -Level Info
            Write-GiteaLog "  Email: $adminEmail" -Level Info
        }
    } catch {
        Write-GiteaLog "Admin user may already exist or creation failed: $_" -Level Warning
    }
}

function New-GiteaOrganization {
    Write-GiteaLog "Creating Project-Nyra organization..." -Level Info

    try {
        # This would require API call after initial setup
        Write-GiteaLog "Organization creation requires manual setup after first login" -Level Info
        Write-GiteaLog "Visit: http://$GiteaDomain:$HTTPPort" -Level Info
    } catch {
        Write-GiteaLog "Organization creation skipped: $_" -Level Warning
    }
}

function Show-GiteaInfo {
    Write-GiteaLog "Gitea Installation Complete!" -Level Success
    Write-GiteaLog "" -Level Info
    Write-GiteaLog "Access Information:" -Level Info
    Write-GiteaLog "  Web UI: http://$GiteaDomain:$HTTPPort" -Level Info
    Write-GiteaLog "  SSH: ssh://git@$GiteaDomain:$SSHPort" -Level Info
    Write-GiteaLog "  Data Path: $DataPath" -Level Info
    Write-GiteaLog "" -Level Info
    Write-GiteaLog "Admin Credentials:" -Level Info
    Write-GiteaLog "  Username: admin" -Level Info
    Write-GiteaLog "  Password: Admin@Nyra2024" -Level Info
    Write-GiteaLog "" -Level Info
    Write-GiteaLog "Management Commands:" -Level Info
    Write-GiteaLog "  Stop: docker-compose -f $DataPath\docker-compose.yml down" -Level Info
    Write-GiteaLog "  Start: docker-compose -f $DataPath\docker-compose.yml up -d" -Level Info
    Write-GiteaLog "  Logs: docker logs -f nyra-gitea" -Level Info
    Write-GiteaLog "  CLI: docker exec -it nyra-gitea gitea" -Level Info
}

# Main execution
try {
    Write-GiteaLog "Project-Nyra Gitea Installation" -Level Info

    # Create directories
    New-GiteaDirectories

    # Create Docker Compose configuration
    New-GiteaDockerCompose

    # Create app.ini
    New-GiteaAppIni

    # Start services
    Start-GiteaServices

    # Test health
    $healthy = Test-GiteaHealth

    if ($healthy) {
        # Create admin user
        New-GiteaAdminUser

        # Create organization
        New-GiteaOrganization
    }

    # Show info
    Show-GiteaInfo

} catch {
    Write-GiteaLog "Gitea installation failed: $_" -Level Error
    Write-GiteaLog "Check logs: docker logs nyra-gitea" -Level Info
    exit 1
}
