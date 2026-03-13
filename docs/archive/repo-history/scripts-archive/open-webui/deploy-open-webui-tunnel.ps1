# ============================================================================
# Deploy Open WebUI with Cloudflare Tunnel - RateHunter.net
# ============================================================================
# This script automates the complete deployment of Open WebUI on ratehunter.net
# via Cloudflare tunnel.
#
# Usage:
#   .\deploy-open-webui-tunnel.ps1
#   .\deploy-open-webui-tunnel.ps1 -SkipOpenWebUI  # Only configure tunnel
#   .\deploy-open-webui-tunnel.ps1 -Subdomain "openwebui"  # Use different subdomain
# ============================================================================

[CmdletBinding()]
param(
    [Parameter()]
    [string]$Subdomain = "chat",

    [Parameter()]
    [string]$Domain = "ratehunter.net",

    [Parameter()]
    [string]$TunnelName = "nyra-orchestrator",

    [Parameter()]
    [switch]$SkipOpenWebUI,

    [Parameter()]
    [switch]$SkipDNS,

    [Parameter()]
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# Configuration
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$REPO_ROOT = (Get-Item $SCRIPT_DIR).Parent.Parent.FullName
$DOCKER_DIR = Join-Path $REPO_ROOT "infra\docker"
$CLOUDFLARED_CONFIG = Join-Path $REPO_ROOT "bootstrap\orchestrator-mini\docker\configs\cloudflared\config.yml"
$FULL_HOSTNAME = "$Subdomain.$Domain"

# Colors
function Write-Header { param($Text) Write-Host "`n$Text" -ForegroundColor Cyan; Write-Host ("=" * 70) -ForegroundColor Cyan }
function Write-Success { param($Text) Write-Host "✓ $Text" -ForegroundColor Green }
function Write-Info { param($Text) Write-Host "ℹ $Text" -ForegroundColor Blue }
function Write-Warning { param($Text) Write-Host "⚠ $Text" -ForegroundColor Yellow }
function Write-Error { param($Text) Write-Host "✗ $Text" -ForegroundColor Red }

Write-Header "Open WebUI Cloudflare Tunnel Deployment"
Write-Info "Target: https://$FULL_HOSTNAME"
Write-Info "Tunnel: $TunnelName"

if ($DryRun) {
    Write-Warning "DRY RUN MODE - No changes will be made"
}

# ============================================================================
# Step 1: Pre-flight Checks
# ============================================================================
Write-Header "Step 1: Pre-flight Checks"

# Check Docker is running
Write-Info "Checking Docker..."
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker is not running"
    }
    Write-Success "Docker is running"
} catch {
    Write-Error "Docker is not running. Please start Docker Desktop."
    exit 1
}

# Check cloudflared is installed
Write-Info "Checking cloudflared..."
try {
    $cloudflaredVersion = cloudflared --version 2>&1
    Write-Success "cloudflared installed: $cloudflaredVersion"
} catch {
    Write-Error "cloudflared is not installed. Install from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/"
    exit 1
}

# Check tunnel exists
Write-Info "Checking tunnel '$TunnelName'..."
$tunnelList = cloudflared tunnel list 2>&1 | Select-String -Pattern $TunnelName
if (-not $tunnelList) {
    Write-Error "Tunnel '$TunnelName' not found. Create it first with: cloudflared tunnel create $TunnelName"
    exit 1
}
Write-Success "Tunnel '$TunnelName' found"

# Check Infisical authentication
Write-Info "Checking Infisical authentication..."
try {
    $infisicalStatus = infisical login status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Infisical not authenticated. Run: infisical login"
        Write-Info "Continuing without Infisical (using local .env)..."
    } else {
        Write-Success "Infisical authenticated"
    }
} catch {
    Write-Warning "Infisical not installed or not authenticated"
    Write-Info "Continuing without Infisical (using local .env)..."
}

# ============================================================================
# Step 2: Start Open WebUI (Optional)
# ============================================================================
if (-not $SkipOpenWebUI) {
    Write-Header "Step 2: Starting Open WebUI"

    if (-not $DryRun) {
        Write-Info "Navigating to Docker directory..."
        Push-Location $DOCKER_DIR

        try {
            Write-Info "Starting Open WebUI with Infisical secrets..."
            & .\start-ui.ps1

            if ($LASTEXITCODE -ne 0) {
                throw "Failed to start Open WebUI"
            }

            Write-Success "Open WebUI started successfully"

            # Verify container is running
            Write-Info "Verifying container..."
            Start-Sleep -Seconds 5
            $container = docker ps --filter "name=nyra-open-webui" --format "{{.Names}}"

            if ($container -eq "nyra-open-webui") {
                Write-Success "Container 'nyra-open-webui' is running"

                # Test health endpoint
                Write-Info "Testing health endpoint..."
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:3333/health" -UseBasicParsing -TimeoutSec 10
                    if ($response.StatusCode -eq 200) {
                        Write-Success "Health check passed"
                    }
                } catch {
                    Write-Warning "Health check failed, but container is running. It may still be initializing..."
                }
            } else {
                throw "Container 'nyra-open-webui' is not running"
            }
        } finally {
            Pop-Location
        }
    } else {
        Write-Info "[DRY RUN] Would start Open WebUI container"
    }
} else {
    Write-Header "Step 2: Skipping Open WebUI Start"
    Write-Info "Assuming Open WebUI is already running..."

    # Verify container is running
    $container = docker ps --filter "name=nyra-open-webui" --format "{{.Names}}"
    if ($container -ne "nyra-open-webui") {
        Write-Error "Open WebUI container is not running. Remove -SkipOpenWebUI flag or start it manually."
        exit 1
    }
    Write-Success "Open WebUI container is running"
}

# ============================================================================
# Step 3: Verify Cloudflared Configuration
# ============================================================================
Write-Header "Step 3: Verifying Cloudflared Configuration"

Write-Info "Checking cloudflared config: $CLOUDFLARED_CONFIG"

if (Test-Path $CLOUDFLARED_CONFIG) {
    Write-Success "Config file exists"

    # Check if Open WebUI rule exists
    $configContent = Get-Content $CLOUDFLARED_CONFIG -Raw
    if ($configContent -match "chat\.ratehunter\.net") {
        Write-Success "Open WebUI ingress rule found in config"
    } else {
        Write-Warning "Open WebUI ingress rule NOT found in config"
        Write-Info "The configuration has already been updated in the repository."
        Write-Info "If using a custom config location, manually add this rule before the catch-all:"
        Write-Host ""
        Write-Host "  # Open WebUI - AI Chat Interface" -ForegroundColor Gray
        Write-Host "  - hostname: $FULL_HOSTNAME" -ForegroundColor Gray
        Write-Host "    service: http://nyra-open-webui:3333" -ForegroundColor Gray
        Write-Host "    originRequest:" -ForegroundColor Gray
        Write-Host "      noTLSVerify: true" -ForegroundColor Gray
        Write-Host "      connectTimeout: 30s" -ForegroundColor Gray
        Write-Host "      keepAliveTimeout: 90s" -ForegroundColor Gray
        Write-Host "      httpHostHeader: $FULL_HOSTNAME" -ForegroundColor Gray
        Write-Host ""
    }
} else {
    Write-Warning "Config file not found at: $CLOUDFLARED_CONFIG"
    Write-Info "This is OK if you're using TUNNEL_TOKEN environment variable."
}

# ============================================================================
# Step 4: Restart Cloudflared
# ============================================================================
Write-Header "Step 4: Restarting Cloudflared"

if (-not $DryRun) {
    # Try Docker container restart first
    Write-Info "Attempting to restart cloudflared Docker container..."
    $cloudflaredContainer = docker ps -a --filter "name=cloudflared" --format "{{.Names}}"

    if ($cloudflaredContainer) {
        Write-Info "Found cloudflared container: $cloudflaredContainer"
        docker restart $cloudflaredContainer

        if ($LASTEXITCODE -eq 0) {
            Write-Success "Cloudflared container restarted"
            Start-Sleep -Seconds 5

            # Check logs
            Write-Info "Checking cloudflared logs..."
            $logs = docker logs $cloudflaredContainer --tail 20 2>&1

            if ($logs -match "Registered tunnel connection") {
                Write-Success "Tunnel connection registered"
            } else {
                Write-Warning "Could not verify tunnel connection in logs"
            }

            if ($logs -match $FULL_HOSTNAME) {
                Write-Success "Open WebUI route found in logs"
            } else {
                Write-Warning "Open WebUI route not found in logs (may need manual config update)"
            }
        } else {
            Write-Error "Failed to restart cloudflared container"
        }
    } else {
        Write-Warning "No cloudflared Docker container found"
        Write-Info "If running as systemd service, restart with: sudo systemctl restart cloudflared"
        Write-Info "If running manually, restart the cloudflared process"
    }
} else {
    Write-Info "[DRY RUN] Would restart cloudflared service"
}

# ============================================================================
# Step 5: Route DNS
# ============================================================================
if (-not $SkipDNS) {
    Write-Header "Step 5: Routing DNS"

    if (-not $DryRun) {
        Write-Info "Creating DNS route for $FULL_HOSTNAME..."

        # Check if route already exists
        $existingRoute = cloudflared tunnel route ip show $TunnelName 2>&1 | Select-String -Pattern $FULL_HOSTNAME

        if ($existingRoute) {
            Write-Warning "DNS route for $FULL_HOSTNAME already exists"
        } else {
            cloudflared tunnel route dns $TunnelName $FULL_HOSTNAME

            if ($LASTEXITCODE -eq 0) {
                Write-Success "DNS route created successfully"
            } else {
                Write-Error "Failed to create DNS route"
                Write-Info "You may need to create it manually in Cloudflare dashboard"
            }
        }

        # Verify DNS propagation
        Write-Info "Verifying DNS resolution (this may take 1-5 minutes)..."
        Start-Sleep -Seconds 10

        try {
            $dnsResult = Resolve-DnsName -Name $FULL_HOSTNAME -ErrorAction SilentlyContinue
            if ($dnsResult) {
                Write-Success "DNS resolution successful: $($dnsResult.IPAddress -join ', ')"
            } else {
                Write-Warning "DNS not yet resolved. Wait a few minutes and try: nslookup $FULL_HOSTNAME"
            }
        } catch {
            Write-Warning "DNS resolution check failed. Manual verification required."
        }
    } else {
        Write-Info "[DRY RUN] Would create DNS route: cloudflared tunnel route dns $TunnelName $FULL_HOSTNAME"
    }
} else {
    Write-Header "Step 5: Skipping DNS Routing"
    Write-Info "DNS routing skipped (use -SkipDNS flag to skip)"
}

# ============================================================================
# Step 6: Final Verification
# ============================================================================
Write-Header "Step 6: Final Verification"

if (-not $DryRun) {
    Write-Info "Testing external access to https://$FULL_HOSTNAME (this may fail if DNS not propagated)..."
    Start-Sleep -Seconds 5

    try {
        $response = Invoke-WebRequest -Uri "https://$FULL_HOSTNAME" -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop

        if ($response.StatusCode -eq 200) {
            Write-Success "External access successful! Open WebUI is accessible at https://$FULL_HOSTNAME"
        } elseif ($response.StatusCode -eq 302 -or $response.StatusCode -eq 401) {
            Write-Success "Cloudflare Access is working (received auth redirect). Open WebUI is properly configured!"
        } else {
            Write-Warning "Received status code $($response.StatusCode). This may be normal during initial setup."
        }
    } catch {
        Write-Warning "Could not verify external access yet. This is normal if DNS hasn't propagated."
        Write-Info "Wait 5-10 minutes and try accessing: https://$FULL_HOSTNAME"
        Write-Info "Error: $($_.Exception.Message)"
    }
} else {
    Write-Info "[DRY RUN] Would test external access"
}

# ============================================================================
# Deployment Summary
# ============================================================================
Write-Header "Deployment Summary"

Write-Host ""
Write-Success "Open WebUI Deployment Complete!"
Write-Host ""
Write-Info "Configuration:"
Write-Host "  URL:              https://$FULL_HOSTNAME" -ForegroundColor White
Write-Host "  Container:        nyra-open-webui" -ForegroundColor White
Write-Host "  Local Port:       3333" -ForegroundColor White
Write-Host "  Tunnel:           $TunnelName" -ForegroundColor White
Write-Host ""

Write-Info "Next Steps:"
Write-Host "  1. Wait 2-5 minutes for DNS propagation" -ForegroundColor White
Write-Host "  2. Navigate to: https://$FULL_HOSTNAME" -ForegroundColor White
Write-Host "  3. Configure Cloudflare Access policy (if not already done)" -ForegroundColor White
Write-Host "     → https://one.dash.cloudflare.com/" -ForegroundColor White
Write-Host "  4. Create admin account (first user becomes admin)" -ForegroundColor White
Write-Host "  5. Configure LLM models via Nexus Router" -ForegroundColor White
Write-Host ""

Write-Info "Verification Commands:"
Write-Host "  Test local:       curl http://localhost:3333/health" -ForegroundColor Gray
Write-Host "  Test external:    curl https://$FULL_HOSTNAME" -ForegroundColor Gray
Write-Host "  Container logs:   docker logs nyra-open-webui -f" -ForegroundColor Gray
Write-Host "  Tunnel logs:      docker logs cloudflared-orchestrator -f" -ForegroundColor Gray
Write-Host ""

Write-Info "Documentation:"
Write-Host "  Setup Guide:      docs/deployment/OPEN-WEBUI-CLOUDFLARE-TUNNEL-SETUP.md" -ForegroundColor Gray
Write-Host "  Deployment Plan:  docs/deployment/OPEN-WEBUI-DEPLOYMENT-PLAN.md" -ForegroundColor Gray
Write-Host ""

Write-Warning "IMPORTANT: Configure Cloudflare Access before using in production!"
Write-Host "  See: docs/deployment/OPEN-WEBUI-CLOUDFLARE-TUNNEL-SETUP.md (Step 5)" -ForegroundColor Yellow
Write-Host ""

# Save deployment info
$deploymentInfo = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Hostname = $FULL_HOSTNAME
    TunnelName = $TunnelName
    ContainerName = "nyra-open-webui"
    LocalPort = 3333
    Status = "Deployed"
} | ConvertTo-Json

$deploymentInfoPath = Join-Path $REPO_ROOT "docs\deployment\open-webui-deployment-info.json"
$deploymentInfo | Out-File -FilePath $deploymentInfoPath -Encoding UTF8
Write-Info "Deployment info saved to: $deploymentInfoPath"

Write-Success "All done! 🎉"
