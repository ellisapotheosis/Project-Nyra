#Requires -Version 7.0
<#
.SYNOPSIS
    Cloudflare Tunnel Setup for Orchestrator Mini (PC1 - 10.0.0.1)
.DESCRIPTION
    Automated setup script for Cloudflare Tunnel on the orchestrator mini PC.
    Installs cloudflared, creates tunnel, configures Docker Compose integration,
    and sets up systemd service in WSL for auto-start.
.PARAMETER CloudflareToken
    Cloudflare API token with Cloudflare Tunnel permissions (optional, will prompt if not provided)
.PARAMETER TunnelName
    Name for the Cloudflare tunnel (default: nyra-orchestrator)
.PARAMETER SkipDocker
    Skip Docker Compose configuration
.PARAMETER SkipSystemd
    Skip systemd service creation
.EXAMPLE
    .\setup-cloudflare-tunnel.ps1
.EXAMPLE
    .\setup-cloudflare-tunnel.ps1 -TunnelName "my-tunnel" -SkipSystemd
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$CloudflareToken,

    [Parameter(Mandatory=$false)]
    [string]$TunnelName = "nyra-orchestrator",

    [Parameter(Mandatory=$false)]
    [switch]$SkipDocker,

    [Parameter(Mandatory=$false)]
    [switch]$SkipSystemd
)

# Color output functions
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White",
        [switch]$NoNewline
    )
    Write-Host $Message -ForegroundColor $Color -NoNewline:$NoNewline
}

function Write-Success { Write-ColorOutput "✓ $args" -Color Green }
function Write-Error { Write-ColorOutput "✗ $args" -Color Red }
function Write-Warning { Write-ColorOutput "⚠ $args" -Color Yellow }
function Write-Info { Write-ColorOutput "ℹ $args" -Color Cyan }
function Write-Step { Write-ColorOutput "→ $args" -Color Magenta }

# Progress bar
function Show-Progress {
    param(
        [int]$Current,
        [int]$Total,
        [string]$Activity
    )
    $percent = [math]::Round(($Current / $Total) * 100)
    Write-Progress -Activity $Activity -Status "$percent% Complete" -PercentComplete $percent
}

# Error handling
$ErrorActionPreference = "Stop"
$script:ErrorsOccurred = $false

function Handle-Error {
    param([string]$Message, [bool]$Fatal = $true)
    Write-Error $Message
    $script:ErrorsOccurred = $true
    if ($Fatal) {
        Write-ColorOutput "`n❌ Setup failed. Please review errors above and try again." -Color Red
        exit 1
    }
}

# Configuration
$PC_NAME = "orchestrator-mini"
$PC_ROLE = "controller"
$PC_IP = "10.0.0.1"
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$BASE_DIR = Split-Path -Parent (Split-Path -Parent $SCRIPT_DIR)
$DOCKER_DIR = Join-Path $SCRIPT_DIR ".." "docker"
$CONFIGS_DIR = Join-Path $SCRIPT_DIR ".." "configs"
$CREDENTIALS_FILE = Join-Path $CONFIGS_DIR "cloudflare-tunnel-credentials.json"
$TUNNEL_CONFIG_FILE = Join-Path $CONFIGS_DIR "cloudflare-tunnel-config.yml"

# Banner
Clear-Host
Write-ColorOutput @"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     🌐 Cloudflare Tunnel Setup - Orchestrator Mini           ║
║                                                                ║
║     PC: $PC_NAME (PC1)                                        ║
║     Role: $PC_ROLE                                            ║
║     IP: $PC_IP                                                ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

"@ -Color Cyan

# Step 1: Check prerequisites
Write-Step "Step 1/8: Checking prerequisites..."
Show-Progress -Current 1 -Total 8 -Activity "Checking prerequisites"

try {
    # Check PowerShell version
    if ($PSVersionTable.PSVersion.Major -lt 7) {
        Handle-Error "PowerShell 7+ required. Current version: $($PSVersionTable.PSVersion)"
    }
    Write-Success "PowerShell version: $($PSVersionTable.PSVersion)"

    # Check Docker
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Docker not found. Please install Docker Desktop."
    }
    Write-Success "Docker: $dockerVersion"

    # Check WSL
    $wslVersion = wsl --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "WSL not detected. Systemd service creation will be skipped."
        $SkipSystemd = $true
    } else {
        Write-Success "WSL detected"
    }

    # Create directories
    @($CONFIGS_DIR, $DOCKER_DIR) | ForEach-Object {
        if (-not (Test-Path $_)) {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
            Write-Success "Created directory: $_"
        }
    }
} catch {
    Handle-Error "Prerequisites check failed: $_"
}

# Step 2: Install cloudflared
Write-Step "`nStep 2/8: Installing cloudflared CLI..."
Show-Progress -Current 2 -Total 8 -Activity "Installing cloudflared"

try {
    # Check if cloudflared is already installed
    $cloudflaredPath = Get-Command cloudflared -ErrorAction SilentlyContinue

    if ($cloudflaredPath) {
        $version = cloudflared --version 2>$null
        Write-Success "cloudflared already installed: $version"
    } else {
        Write-Info "Downloading cloudflared..."

        # Download cloudflared for Windows
        $downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
        $installPath = Join-Path $env:ProgramFiles "cloudflared"
        $exePath = Join-Path $installPath "cloudflared.exe"

        if (-not (Test-Path $installPath)) {
            New-Item -ItemType Directory -Path $installPath -Force | Out-Null
        }

        Invoke-WebRequest -Uri $downloadUrl -OutFile $exePath -UseBasicParsing

        # Add to PATH
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
        if ($currentPath -notlike "*$installPath*") {
            [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$installPath", "Machine")
            $env:PATH = "$env:PATH;$installPath"
        }

        Write-Success "cloudflared installed successfully"
    }
} catch {
    Handle-Error "Failed to install cloudflared: $_"
}

# Step 3: Get Cloudflare API token
Write-Step "`nStep 3/8: Cloudflare authentication..."
Show-Progress -Current 3 -Total 8 -Activity "Authenticating with Cloudflare"

if (-not $CloudflareToken) {
    Write-Info "You need a Cloudflare API token with Cloudflare Tunnel permissions."
    Write-Info "Create one at: https://dash.cloudflare.com/profile/api-tokens"
    Write-Info "Required permissions: Account > Cloudflare Tunnel > Edit"
    Write-Host ""

    $CloudflareToken = Read-Host "Enter your Cloudflare API token" -AsSecureString
    $CloudflareToken = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($CloudflareToken)
    )
}

if ([string]::IsNullOrWhiteSpace($CloudflareToken)) {
    Handle-Error "Cloudflare API token is required"
}

# Set token as environment variable
$env:CLOUDFLARE_API_TOKEN = $CloudflareToken
Write-Success "Cloudflare API token configured"

# Step 4: Create Cloudflare tunnel
Write-Step "`nStep 4/8: Creating Cloudflare tunnel..."
Show-Progress -Current 4 -Total 8 -Activity "Creating tunnel"

try {
    # Check if tunnel already exists
    Write-Info "Checking for existing tunnel: $TunnelName"
    $existingTunnel = cloudflared tunnel list --output json 2>$null | ConvertFrom-Json |
        Where-Object { $_.name -eq $TunnelName } | Select-Object -First 1

    if ($existingTunnel) {
        Write-Warning "Tunnel '$TunnelName' already exists (ID: $($existingTunnel.id))"
        $tunnelId = $existingTunnel.id

        $response = Read-Host "Do you want to use the existing tunnel? (Y/n)"
        if ($response -match '^[Nn]') {
            $newName = Read-Host "Enter a new tunnel name"
            $TunnelName = $newName
            $tunnelId = $null
        }
    }

    if (-not $tunnelId) {
        Write-Info "Creating new tunnel: $TunnelName"
        $output = cloudflared tunnel create $TunnelName 2>&1

        if ($LASTEXITCODE -ne 0) {
            Handle-Error "Failed to create tunnel: $output"
        }

        # Extract tunnel ID from output
        $tunnelId = ($output | Select-String -Pattern "([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})").Matches.Value
        Write-Success "Tunnel created successfully (ID: $tunnelId)"
    }
} catch {
    Handle-Error "Failed to create tunnel: $_"
}

# Step 5: Store credentials securely
Write-Step "`nStep 5/8: Storing tunnel credentials..."
Show-Progress -Current 5 -Total 8 -Activity "Storing credentials"

try {
    # Get credentials file from cloudflared home
    $cfHome = Join-Path $env:USERPROFILE ".cloudflared"
    $sourceCreds = Join-Path $cfHome "$tunnelId.json"

    if (Test-Path $sourceCreds) {
        Copy-Item $sourceCreds $CREDENTIALS_FILE -Force

        # Set restrictive permissions
        $acl = Get-Acl $CREDENTIALS_FILE
        $acl.SetAccessRuleProtection($true, $false)
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
            $env:USERNAME, "FullControl", "Allow"
        )
        $acl.AddAccessRule($rule)
        Set-Acl $CREDENTIALS_FILE $acl

        Write-Success "Credentials stored securely at: $CREDENTIALS_FILE"
    } else {
        Handle-Error "Credentials file not found: $sourceCreds"
    }
} catch {
    Handle-Error "Failed to store credentials: $_"
}

# Step 6: Configure tunnel
Write-Step "`nStep 6/8: Configuring tunnel routes..."
Show-Progress -Current 6 -Total 8 -Activity "Configuring tunnel"

try {
    # Create tunnel configuration
    $tunnelConfig = @"
tunnel: $tunnelId
credentials-file: /etc/cloudflared/credentials.json

ingress:
  # Main orchestrator services
  - hostname: orchestrator.nyra.local
    service: http://localhost:3000

  # Admin dashboard
  - hostname: admin.nyra.local
    service: http://localhost:3001

  # API endpoints
  - hostname: api.nyra.local
    service: http://localhost:8000

  # Monitoring
  - hostname: monitoring.nyra.local
    service: http://localhost:9090

  # Portainer
  - hostname: portainer.nyra.local
    service: http://localhost:9000

  # Catch-all rule (must be last)
  - service: http_status:404
"@

    Set-Content -Path $TUNNEL_CONFIG_FILE -Value $tunnelConfig -Force
    Write-Success "Tunnel configuration created: $TUNNEL_CONFIG_FILE"

    # Display configuration
    Write-Info "Configured routes:"
    @(
        "  • orchestrator.nyra.local → http://localhost:3000",
        "  • admin.nyra.local → http://localhost:3001",
        "  • api.nyra.local → http://localhost:8000",
        "  • monitoring.nyra.local → http://localhost:9090",
        "  • portainer.nyra.local → http://localhost:9000"
    ) | ForEach-Object { Write-ColorOutput $_ -Color Gray }
} catch {
    Handle-Error "Failed to create tunnel configuration: $_"
}

# Step 7: Configure Docker Compose
if (-not $SkipDocker) {
    Write-Step "`nStep 7/8: Configuring Docker Compose..."
    Show-Progress -Current 7 -Total 8 -Activity "Configuring Docker Compose"

    try {
        $dockerComposePath = Join-Path $DOCKER_DIR "docker-compose.cloudflared.yml"
        $dockerComposeContent = @"
version: '3.8'

services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared-orchestrator
    restart: unless-stopped
    command: tunnel --config /etc/cloudflared/config.yml run
    volumes:
      - ${TUNNEL_CONFIG_FILE}:/etc/cloudflared/config.yml:ro
      - ${CREDENTIALS_FILE}:/etc/cloudflared/credentials.json:ro
    networks:
      - nyra-network
    environment:
      - TUNNEL_NAME=$TunnelName
      - TUNNEL_ID=$tunnelId
    healthcheck:
      test: ["CMD", "cloudflared", "tunnel", "info", "$tunnelId"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  nyra-network:
    external: true
"@

        Set-Content -Path $dockerComposePath -Value $dockerComposeContent -Force
        Write-Success "Docker Compose configuration created: $dockerComposePath"

        # Create .env file for Docker Compose
        $envPath = Join-Path $DOCKER_DIR ".env.cloudflared"
        $envContent = @"
TUNNEL_NAME=$TunnelName
TUNNEL_ID=$tunnelId
TUNNEL_CONFIG=$TUNNEL_CONFIG_FILE
CREDENTIALS_FILE=$CREDENTIALS_FILE
"@
        Set-Content -Path $envPath -Value $envContent -Force
        Write-Success "Environment file created: $envPath"

        # Test Docker Compose configuration
        Write-Info "Testing Docker Compose configuration..."
        docker-compose -f $dockerComposePath config > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker Compose configuration is valid"
        } else {
            Write-Warning "Docker Compose configuration validation failed (non-fatal)"
        }
    } catch {
        Handle-Error "Failed to configure Docker Compose: $_" -Fatal $false
    }
} else {
    Write-Warning "Skipping Docker Compose configuration (--SkipDocker flag)"
}

# Step 8: Create systemd service (WSL)
if (-not $SkipSystemd -and (Get-Command wsl -ErrorAction SilentlyContinue)) {
    Write-Step "`nStep 8/8: Creating systemd service in WSL..."
    Show-Progress -Current 8 -Total 8 -Activity "Creating systemd service"

    try {
        # Convert Windows paths to WSL paths
        $wslConfigPath = wsl wslpath -a $TUNNEL_CONFIG_FILE
        $wslCredsPath = wsl wslpath -a $CREDENTIALS_FILE

        $systemdService = @"
[Unit]
Description=Cloudflare Tunnel - Orchestrator Mini
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel --config $wslConfigPath run
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
"@

        # Create service file in WSL
        $servicePath = "/etc/systemd/system/cloudflared-orchestrator.service"
        $systemdService | wsl -u root tee $servicePath > $null

        # Enable and start service
        Write-Info "Enabling systemd service..."
        wsl -u root systemctl daemon-reload
        wsl -u root systemctl enable cloudflared-orchestrator.service

        Write-Success "Systemd service created and enabled"
        Write-Info "Start the service with: wsl -u root systemctl start cloudflared-orchestrator"
    } catch {
        Handle-Error "Failed to create systemd service: $_" -Fatal $false
    }
} else {
    if ($SkipSystemd) {
        Write-Warning "Skipping systemd service creation (--SkipSystemd flag)"
    } else {
        Write-Warning "Skipping systemd service creation (WSL not available)"
    }
}

# Final validation
Write-Step "`nValidating setup..."

try {
    Write-Info "Testing tunnel connectivity..."
    $tunnelInfo = cloudflared tunnel info $tunnelId 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Tunnel is accessible"
    } else {
        Write-Warning "Could not verify tunnel connectivity"
    }

    # Display tunnel details
    Write-Info "`nTunnel Details:"
    Write-ColorOutput "  Name: $TunnelName" -Color Gray
    Write-ColorOutput "  ID: $tunnelId" -Color Gray
    Write-ColorOutput "  Credentials: $CREDENTIALS_FILE" -Color Gray
    Write-ColorOutput "  Configuration: $TUNNEL_CONFIG_FILE" -Color Gray

} catch {
    Write-Warning "Validation completed with warnings"
}

# Summary
Write-Host ""
Write-ColorOutput "╔════════════════════════════════════════════════════════════════╗" -Color Green
Write-ColorOutput "║                                                                ║" -Color Green
Write-ColorOutput "║                  ✓ Setup Completed Successfully                ║" -Color Green
Write-ColorOutput "║                                                                ║" -Color Green
Write-ColorOutput "╚════════════════════════════════════════════════════════════════╝" -Color Green
Write-Host ""

Write-Info "Next Steps:"
Write-ColorOutput "  1. Configure DNS records in Cloudflare dashboard" -Color Gray
Write-ColorOutput "  2. Start the tunnel:" -Color Gray
Write-ColorOutput "     docker-compose -f $dockerComposePath up -d" -Color Yellow
Write-ColorOutput "  3. View logs:" -Color Gray
Write-ColorOutput "     docker logs -f cloudflared-orchestrator" -Color Yellow
Write-ColorOutput "  4. Verify routes:" -Color Gray
Write-ColorOutput "     cloudflared tunnel route dns $TunnelName orchestrator.nyra.local" -Color Yellow

Write-Host ""
Write-Info "Documentation: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/"
Write-Host ""

if ($script:ErrorsOccurred) {
    Write-Warning "Setup completed with errors. Please review the output above."
    exit 1
}

exit 0
