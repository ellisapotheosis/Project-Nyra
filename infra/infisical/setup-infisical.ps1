# ============================================================================
# Infisical Setup Helper - Project Nyra
# ============================================================================
# This script helps you set up Infisical for Phase 3 orchestration by:
#   1. Checking Infisical CLI installation
#   2. Logging in to Infisical
#   3. Creating credential files for Infisical Agent
#   4. Testing the configuration
#
# Usage:
#   .\setup-infisical.ps1
#   .\setup-infisical.ps1 -SkipLogin  # If already logged in
# ============================================================================

[CmdletBinding()]
param(
    [Parameter()]
    [switch]$SkipLogin,

    [Parameter()]
    [switch]$TestOnly
)

$ErrorActionPreference = "Stop"

Write-Host @"
╔══════════════════════════════════════════════════════════════════╗
║              INFISICAL SETUP HELPER - PROJECT NYRA              ║
╚══════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Step 1: Check Infisical CLI installation
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 1: Checking Infisical CLI Installation" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $infisicalVersion = infisical --version 2>&1
    Write-Host "✓ Infisical CLI is installed: $infisicalVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Infisical CLI not found!" -ForegroundColor Red
    Write-Host "`nPlease install Infisical CLI first:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Option 1: Using Scoop (Recommended for Windows)" -ForegroundColor Cyan
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

# Step 2: Login to Infisical (if not skipped)
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

# Step 3: Set up Machine Identity credentials
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 3: Setting up Machine Identity Credentials" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`nTo use Infisical Agent, you need a Machine Identity with Universal Auth." -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 How to create a Machine Identity:" -ForegroundColor Yellow
Write-Host "  1. Go to: https://app.infisical.com/org/your-org/settings/identities" -ForegroundColor White
Write-Host "  2. Click 'Create Identity'" -ForegroundColor White
Write-Host "  3. Name it: 'Project-Nyra-Orchestration'" -ForegroundColor White
Write-Host "  4. Select 'Universal Auth' as the authentication method" -ForegroundColor White
Write-Host "  5. Grant it access to project: '8374cea9-e5e8-4050-bda4-b91f25ab30ef'" -ForegroundColor White
Write-Host "  6. Copy the Client ID and Client Secret" -ForegroundColor White
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

# Step 4: Test the configuration
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 4: Testing Configuration" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n🔍 Testing secret retrieval from Infisical..." -ForegroundColor Cyan

$projectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
$testCommand = @"
infisical run --projectId="$projectId" --env="dev" --path="/shared" -- echo "Successfully retrieved secrets from Infisical!"
"@

Write-Host "Running: $testCommand" -ForegroundColor Gray

try {
    Invoke-Expression $testCommand
    Write-Host "`n✅ Configuration test successful!" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Configuration test failed!" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  - Machine Identity has access to the project" -ForegroundColor White
    Write-Host "  - Client ID and Client Secret are correct" -ForegroundColor White
    Write-Host "  - Project ID is correct: $projectId" -ForegroundColor White
    exit 1
}

# Summary
Write-Host "`n" + ("=" * 70) -ForegroundColor Green
Write-Host "✅ INFISICAL SETUP COMPLETE!" -ForegroundColor Green
Write-Host ("=" * 70) -ForegroundColor Green

Write-Host "`n📋 What's configured:" -ForegroundColor Cyan
Write-Host "   ✓ Infisical CLI installed and logged in" -ForegroundColor White
Write-Host "   ✓ Machine Identity credentials saved" -ForegroundColor White
Write-Host "   ✓ Connection to Infisical verified" -ForegroundColor White

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Upload your secrets to Infisical" -ForegroundColor White
Write-Host "      cd ../docker" -ForegroundColor Gray
Write-Host "      infisical secrets set POSTGRES_PASSWORD=<value> --env=dev --path=/shared" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Start the orchestration stack" -ForegroundColor White
Write-Host "      cd ../docker" -ForegroundColor Gray
Write-Host "      .\start-all.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. (Optional) Run Infisical Agent for auto-sync" -ForegroundColor White
Write-Host "      cd ../infisical" -ForegroundColor Gray
Write-Host "      infisical agent --config agent-config.yaml" -ForegroundColor Gray
Write-Host ""
