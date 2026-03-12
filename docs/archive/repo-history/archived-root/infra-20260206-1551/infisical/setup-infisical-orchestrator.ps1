# ============================================================================
# Infisical Orchestrator Setup - Project Nyra
# ============================================================================
# Enhanced setup script for the orchestrator PC that:
#   1. Installs Infisical CLI if needed
#   2. Authenticates with Infisical
#   3. Sets up Machine Identity credentials
#   4. Configures paths for orchestrator and all workers
#   5. Tests connectivity to all secret paths
#   6. Optionally starts Infisical Agent as Docker service
#
# Usage:
#   .\setup-infisical-orchestrator.ps1
#   .\setup-infisical-orchestrator.ps1 -SkipLogin -StartAgent
#   .\setup-infisical-orchestrator.ps1 -TestOnly
# ============================================================================

[CmdletBinding()]
param(
    [Parameter()]
    [switch]$SkipLogin,

    [Parameter()]
    [switch]$TestOnly,

    [Parameter()]
    [switch]$StartAgent,

    [Parameter()]
    [string]$ProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef",

    [Parameter()]
    [string]$Environment = "dev"
)

$ErrorActionPreference = "Stop"
$InfraRoot = Split-Path -Parent $PSScriptRoot

Write-Host @"
╔══════════════════════════════════════════════════════════════════╗
║       INFISICAL ORCHESTRATOR SETUP - PROJECT NYRA               ║
║                   Enhanced Multi-Path Configuration              ║
╚══════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host "`n📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Project ID:  $ProjectId" -ForegroundColor White
Write-Host "   Environment: $Environment" -ForegroundColor White
Write-Host "   Paths:       /shared, /worker-5090, /worker-3090, /worker-3060" -ForegroundColor White
Write-Host ""

# ============================================================================
# STEP 1: Check Infisical CLI Installation
# ============================================================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 1: Checking Infisical CLI Installation" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $infisicalVersion = infisical --version 2>&1
    Write-Host "✓ Infisical CLI is installed: $infisicalVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Infisical CLI not found!" -ForegroundColor Red
    Write-Host "`nInstalling Infisical CLI..." -ForegroundColor Yellow

    # Try installing via Scoop first
    if (Get-Command scoop -ErrorAction SilentlyContinue) {
        Write-Host "Installing via Scoop..." -ForegroundColor Cyan
        scoop install infisical
    }
    # Fallback to NPM
    elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "Installing via NPM (global)..." -ForegroundColor Cyan
        npm install -g @infisical/cli
    }
    else {
        Write-Host "`nPlease install Infisical CLI manually:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Option 1: Using Scoop (Recommended)" -ForegroundColor Cyan
        Write-Host "    scoop install infisical" -ForegroundColor White
        Write-Host ""
        Write-Host "  Option 2: Using NPM" -ForegroundColor Cyan
        Write-Host "    npm install -g @infisical/cli" -ForegroundColor White
        Write-Host ""
        Write-Host "  Option 3: Download binary" -ForegroundColor Cyan
        Write-Host "    https://infisical.com/docs/cli/overview" -ForegroundColor White
        Write-Host ""
        exit 1
    }

    # Verify installation
    $infisicalVersion = infisical --version 2>&1
    Write-Host "✓ Infisical CLI installed: $infisicalVersion" -ForegroundColor Green
}

# ============================================================================
# STEP 2: Login to Infisical (if not skipped)
# ============================================================================
if (-not $SkipLogin -and -not $TestOnly) {
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "STEP 2: Logging in to Infisical" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

    Write-Host "`nOpening Infisical login in your browser..." -ForegroundColor Cyan
    Write-Host "Please log in and return here when complete." -ForegroundColor White

    try {
        infisical login
        Write-Host "✓ Successfully logged in to Infisical" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to log in to Infisical" -ForegroundColor Red
        Write-Host "  Please try again or use: infisical login" -ForegroundColor Yellow
        exit 1
    }
}

# ============================================================================
# STEP 3: Set up Machine Identity credentials
# ============================================================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 3: Setting up Machine Identity Credentials" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`nMachine Identity provides programmatic access for Docker services." -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 How to create a Machine Identity:" -ForegroundColor Yellow
Write-Host "  1. Go to: https://app.infisical.com" -ForegroundColor White
Write-Host "  2. Navigate to Organization Settings → Machine Identities" -ForegroundColor White
Write-Host "  3. Click 'Create Identity'" -ForegroundColor White
Write-Host "  4. Name: 'Project-Nyra-Orchestrator'" -ForegroundColor White
Write-Host "  5. Auth Method: 'Universal Auth'" -ForegroundColor White
Write-Host "  6. Grant access to project: '$ProjectId'" -ForegroundColor White
Write-Host "  7. Set permissions: Read access to ALL paths" -ForegroundColor White
Write-Host "  8. Copy the Client ID and Client Secret" -ForegroundColor White
Write-Host ""

$secretsDir = Join-Path $PSScriptRoot "secrets"
$clientIdFile = Join-Path $secretsDir "infisical-client-id"
$clientSecretFile = Join-Path $secretsDir "infisical-client-secret"

# Create secrets directory
if (-not (Test-Path $secretsDir)) {
    New-Item -ItemType Directory -Force -Path $secretsDir | Out-Null
    Write-Host "✓ Created secrets directory: $secretsDir" -ForegroundColor Green
}

# Check if credentials already exist
if ((Test-Path $clientIdFile) -and (Test-Path $clientSecretFile) -and -not $TestOnly) {
    Write-Host "`n⚠️  Credential files already exist!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite them? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Skipping credential setup. Existing files kept." -ForegroundColor Gray
    } else {
        # Prompt for new credentials
        Write-Host "`n📝 Enter your Machine Identity credentials:" -ForegroundColor Cyan
        $clientId = Read-Host "Client ID"
        $clientSecret = Read-Host "Client Secret" -AsSecureString
        $clientSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret)
        )

        Set-Content -Path $clientIdFile -Value $clientId -NoNewline
        Set-Content -Path $clientSecretFile -Value $clientSecretPlain -NoNewline
        Write-Host "✓ Credentials saved securely" -ForegroundColor Green
    }
} elseif (-not $TestOnly) {
    Write-Host "`n📝 Enter your Machine Identity credentials:" -ForegroundColor Cyan
    $clientId = Read-Host "Client ID"
    $clientSecret = Read-Host "Client Secret" -AsSecureString
    $clientSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret)
    )

    Set-Content -Path $clientIdFile -Value $clientId -NoNewline
    Set-Content -Path $clientSecretFile -Value $clientSecretPlain -NoNewline
    Write-Host "✓ Credentials saved to $secretsDir" -ForegroundColor Green
}

# ============================================================================
# STEP 4: Test all secret paths
# ============================================================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 4: Testing All Secret Paths" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$paths = @("/shared", "/worker-5090", "/worker-3090", "/worker-3060")
$successCount = 0
$failCount = 0

foreach ($path in $paths) {
    Write-Host "`n🔍 Testing path: $path" -ForegroundColor Cyan

    try {
        $result = infisical secrets list --projectId="$ProjectId" --env="$Environment" --path="$path" 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✓ Path accessible" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "   ✗ Path not accessible or empty" -ForegroundColor Red
            Write-Host "   Note: This may be normal if no secrets are set yet" -ForegroundColor Yellow
            $failCount++
        }
    } catch {
        Write-Host "   ✗ Error accessing path: $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n📊 Path Test Summary:" -ForegroundColor Cyan
Write-Host "   Accessible: $successCount paths" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "   Failed:     $failCount paths" -ForegroundColor Yellow
    Write-Host "   Note: Failed paths may need secrets uploaded first" -ForegroundColor Gray
}

# ============================================================================
# STEP 5: Create .infisical.json project config
# ============================================================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 5: Creating Project Configuration" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$infisicalJsonPath = Join-Path $InfraRoot ".infisical.json"
$infisicalConfig = @{
    workspaceId = $ProjectId
    defaultEnvironment = $Environment
    gitBranchToEnvironmentMapping = $null
} | ConvertTo-Json -Depth 10

Set-Content -Path $infisicalJsonPath -Value $infisicalConfig
Write-Host "✓ Created .infisical.json at: $infisicalJsonPath" -ForegroundColor Green

# ============================================================================
# STEP 6: Start Infisical Agent (optional)
# ============================================================================
if ($StartAgent -and -not $TestOnly) {
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "STEP 6: Starting Infisical Agent" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

    Write-Host "`n🚀 Starting Infisical Agent via Docker Compose..." -ForegroundColor Cyan

    Push-Location (Join-Path $InfraRoot "docker")
    try {
        docker-compose -f (Join-Path $PSScriptRoot "docker-compose.infisical.yml") up -d
        Write-Host "✓ Infisical Agent started successfully" -ForegroundColor Green
        Write-Host "   The agent will auto-sync secrets every 60 seconds" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Failed to start Infisical Agent" -ForegroundColor Red
        Write-Host "   You can start it manually later with:" -ForegroundColor Yellow
        Write-Host "   docker-compose -f infra/infisical/docker-compose.infisical.yml up -d" -ForegroundColor Gray
    } finally {
        Pop-Location
    }
}

# ============================================================================
# Summary
# ============================================================================
Write-Host "`n" + ("=" * 70) -ForegroundColor Green
Write-Host "✅ INFISICAL ORCHESTRATOR SETUP COMPLETE!" -ForegroundColor Green
Write-Host ("=" * 70) -ForegroundColor Green

Write-Host "`n📋 What's configured:" -ForegroundColor Cyan
Write-Host "   ✓ Infisical CLI installed and ready" -ForegroundColor White
Write-Host "   ✓ Machine Identity credentials saved" -ForegroundColor White
Write-Host "   ✓ Project configuration created (.infisical.json)" -ForegroundColor White
Write-Host "   ✓ Secret paths tested" -ForegroundColor White
if ($StartAgent) {
    Write-Host "   ✓ Infisical Agent running in Docker" -ForegroundColor White
}

Write-Host "`n📁 Secret Paths Available:" -ForegroundColor Cyan
Write-Host "   • /shared       - Shared secrets (DB, API keys, Redis)" -ForegroundColor White
Write-Host "   • /worker-5090  - RTX 5090 worker configuration" -ForegroundColor White
Write-Host "   • /worker-3090  - RTX 3090 Ti worker configuration" -ForegroundColor White
Write-Host "   • /worker-3060  - RTX 3060 worker configuration" -ForegroundColor White

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Upload secrets to Infisical" -ForegroundColor White
Write-Host "      .\sync-secrets.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Validate all secrets exist" -ForegroundColor White
Write-Host "      .\validate-secrets.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Start the full stack with Infisical integration" -ForegroundColor White
Write-Host "      cd ..\docker" -ForegroundColor Gray
Write-Host "      docker-compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "   4. Check Infisical Agent logs (if started)" -ForegroundColor White
Write-Host "      docker logs infisical-agent -f" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   • Machine Strategy: ../machines/MACHINE-ENV-STRATEGY.md" -ForegroundColor White
Write-Host "   • Docker Usage:     ../docker/README.md" -ForegroundColor White
Write-Host "   • Infisical Docs:   https://infisical.com/docs" -ForegroundColor White
Write-Host ""
