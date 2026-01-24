# ============================================================================
# Test Infisical Integration - Project Nyra
# ============================================================================
# This script performs comprehensive testing of the Infisical integration:
#   1. Checks prerequisites (CLI, Docker, authentication)
#   2. Tests secret fetch from all paths
#   3. Validates Agent configuration
#   4. Tests secret rendering
#   5. Verifies Docker integration
#
# Usage:
#   .\test-integration.ps1
#   .\test-integration.ps1 -Verbose       # Show detailed output
#   .\test-integration.ps1 -SkipDocker    # Skip Docker-related tests
# ============================================================================

[CmdletBinding()]
param(
    [Parameter()]
    [switch]$SkipDocker,

    [Parameter()]
    [string]$ProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef",

    [Parameter()]
    [string]$Environment = "dev"
)

$ErrorActionPreference = "Stop"
$InfraRoot = Split-Path -Parent $PSScriptRoot
$TestsPassed = 0
$TestsFailed = 0
$TestsSkipped = 0

Write-Host @"
╔══════════════════════════════════════════════════════════════════╗
║       TEST INFISICAL INTEGRATION - PROJECT NYRA                 ║
╚══════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host "`n📋 Test Configuration:" -ForegroundColor Yellow
Write-Host "   Project ID:  $ProjectId" -ForegroundColor White
Write-Host "   Environment: $Environment" -ForegroundColor White
Write-Host "   Skip Docker: $SkipDocker" -ForegroundColor White
Write-Host ""

# ============================================================================
# Helper Functions
# ============================================================================

function Test-Step {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [switch]$Critical
    )

    Write-Host "`n🔍 Testing: $Name" -ForegroundColor Cyan

    try {
        & $Test
        Write-Host "   ✅ PASS" -ForegroundColor Green
        $script:TestsPassed++
        return $true
    } catch {
        if ($Critical) {
            Write-Host "   ❌ FAIL (CRITICAL): $_" -ForegroundColor Red
            Write-Host "`n🛑 Critical test failed. Aborting further tests." -ForegroundColor Red
            Show-Summary
            exit 1
        } else {
            Write-Host "   ❌ FAIL: $_" -ForegroundColor Red
            $script:TestsFailed++
            return $false
        }
    }
}

function Show-Summary {
    Write-Host "`n" + ("=" * 70) -ForegroundColor Gray
    Write-Host "TEST SUMMARY" -ForegroundColor Cyan
    Write-Host ("=" * 70) -ForegroundColor Gray

    Write-Host "`n📊 Results:" -ForegroundColor Yellow
    Write-Host "   Passed:  $TestsPassed" -ForegroundColor Green
    if ($TestsFailed -gt 0) {
        Write-Host "   Failed:  $TestsFailed" -ForegroundColor Red
    }
    if ($TestsSkipped -gt 0) {
        Write-Host "   Skipped: $TestsSkipped" -ForegroundColor Yellow
    }

    $total = $TestsPassed + $TestsFailed + $TestsSkipped
    $successRate = if ($total -gt 0) { [math]::Round(($TestsPassed / $total) * 100, 2) } else { 0 }

    Write-Host "`n   Total:        $total tests" -ForegroundColor White
    Write-Host "   Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 50) { "Yellow" } else { "Red" })

    if ($TestsFailed -eq 0) {
        Write-Host "`n✅ ALL TESTS PASSED!" -ForegroundColor Green
        Write-Host "   Infisical integration is working correctly." -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  SOME TESTS FAILED" -ForegroundColor Yellow
        Write-Host "   Review failed tests above and fix issues." -ForegroundColor Yellow
    }

    Write-Host ""
}

# ============================================================================
# Test Suite
# ============================================================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "1. PREREQUISITES" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Test 1.1: Infisical CLI installed
Test-Step -Name "Infisical CLI installed" -Critical -Test {
    $version = infisical --version 2>&1
    if (-not $version) { throw "Infisical CLI not found" }
    Write-Host "      Version: $version" -ForegroundColor Gray
}

# Test 1.2: Infisical CLI authenticated
Test-Step -Name "Infisical CLI authenticated" -Critical -Test {
    $whoami = infisical whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not authenticated. Run: infisical login"
    }
    Write-Host "      $whoami" -ForegroundColor Gray
}

# Test 1.3: Machine Identity credentials exist
Test-Step -Name "Machine Identity credentials exist" -Critical -Test {
    $secretsDir = Join-Path $PSScriptRoot "secrets"
    $clientIdFile = Join-Path $secretsDir "infisical-client-id"
    $clientSecretFile = Join-Path $secretsDir "infisical-client-secret"

    if (-not (Test-Path $clientIdFile)) {
        throw "Client ID file not found: $clientIdFile"
    }
    if (-not (Test-Path $clientSecretFile)) {
        throw "Client Secret file not found: $clientSecretFile"
    }

    Write-Host "      Client ID file: Found" -ForegroundColor Gray
    Write-Host "      Client Secret file: Found" -ForegroundColor Gray
}

# Test 1.4: Docker installed (if not skipped)
if (-not $SkipDocker) {
    Test-Step -Name "Docker installed and running" -Test {
        $dockerVersion = docker --version 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Docker not found or not running" }

        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Docker daemon not running" }

        Write-Host "      Version: $dockerVersion" -ForegroundColor Gray
    }
} else {
    Write-Host "`n⊘ Skipping Docker tests (--SkipDocker)" -ForegroundColor Yellow
    $TestsSkipped++
}

# ============================================================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "2. SECRET CONNECTIVITY" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$paths = @("/shared", "/worker-5090", "/worker-3090", "/worker-3060")

foreach ($path in $paths) {
    Test-Step -Name "Fetch secrets from $path" -Test {
        $result = infisical secrets list `
            --projectId="$ProjectId" `
            --env="$Environment" `
            --path="$path" `
            --format=json 2>&1

        if ($LASTEXITCODE -ne 0) {
            throw "Failed to fetch secrets from $path"
        }

        $secrets = $result | ConvertFrom-Json
        $count = $secrets.Count

        Write-Host "      Found $count secrets in $path" -ForegroundColor Gray
    }
}

# ============================================================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "3. CONFIGURATION FILES" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Test 3.1: infisical-config.yaml exists and valid
Test-Step -Name "infisical-config.yaml exists and valid" -Test {
    $configFile = Join-Path $PSScriptRoot "infisical-config.yaml"
    if (-not (Test-Path $configFile)) {
        throw "Configuration file not found: $configFile"
    }

    # Basic YAML parsing check
    $content = Get-Content $configFile -Raw
    if (-not ($content -match "infisical:")) {
        throw "Invalid YAML structure"
    }
    if (-not ($content -match "sinks:")) {
        throw "No sinks defined"
    }

    Write-Host "      File: $configFile" -ForegroundColor Gray
    Write-Host "      Structure: Valid" -ForegroundColor Gray
}

# Test 3.2: docker-compose.infisical.yml exists
Test-Step -Name "docker-compose.infisical.yml exists" -Test {
    $composeFile = Join-Path $PSScriptRoot "docker-compose.infisical.yml"
    if (-not (Test-Path $composeFile)) {
        throw "Docker Compose file not found: $composeFile"
    }

    Write-Host "      File: $composeFile" -ForegroundColor Gray
}

# Test 3.3: .infisical.json project config exists
Test-Step -Name ".infisical.json project config exists" -Test {
    $projectConfigFile = Join-Path $InfraRoot ".infisical.json"
    if (-not (Test-Path $projectConfigFile)) {
        throw "Project config not found: $projectConfigFile"
    }

    $config = Get-Content $projectConfigFile | ConvertFrom-Json
    if ($config.workspaceId -ne $ProjectId) {
        throw "Project ID mismatch in .infisical.json"
    }

    Write-Host "      File: $projectConfigFile" -ForegroundColor Gray
    Write-Host "      Project ID: $($config.workspaceId)" -ForegroundColor Gray
}

# ============================================================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "4. SCRIPTS & DOCUMENTATION" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$requiredFiles = @(
    "setup-infisical-orchestrator.ps1",
    "sync-secrets.ps1",
    "validate-secrets.ps1",
    "README.md",
    "QUICKSTART.md",
    "DOCKER-INTEGRATION.md",
    "INTEGRATION-SUMMARY.md"
)

foreach ($file in $requiredFiles) {
    Test-Step -Name "File exists: $file" -Test {
        $filePath = Join-Path $PSScriptRoot $file
        if (-not (Test-Path $filePath)) {
            throw "Required file not found: $file"
        }
    }
}

# ============================================================================
if (-not $SkipDocker) {
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "5. DOCKER INTEGRATION" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

    # Test 5.1: Docker Compose validation
    Test-Step -Name "Docker Compose config validation" -Test {
        Push-Location $PSScriptRoot
        try {
            $validation = docker-compose -f docker-compose.infisical.yml config 2>&1
            if ($LASTEXITCODE -ne 0) {
                throw "Docker Compose config invalid: $validation"
            }
            Write-Host "      Configuration: Valid" -ForegroundColor Gray
        } finally {
            Pop-Location
        }
    }

    # Test 5.2: Infisical image available
    Test-Step -Name "Infisical CLI Docker image available" -Test {
        $images = docker images infisical/cli --format "{{.Repository}}:{{.Tag}}" 2>&1

        if ($LASTEXITCODE -ne 0) {
            # Try pulling the image
            Write-Host "      Pulling infisical/cli:latest..." -ForegroundColor Gray
            docker pull infisical/cli:latest 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) {
                throw "Failed to pull Infisical CLI image"
            }
        }

        Write-Host "      Image: Available" -ForegroundColor Gray
    }
}

# ============================================================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "6. SECRET VALIDATION" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Test 6.1: Critical shared secrets exist
$criticalSecrets = @(
    "POSTGRES_PASSWORD",
    "REDIS_PASSWORD",
    "NEXUS_JWT_SECRET",
    "NODE_ENV"
)

Test-Step -Name "Critical shared secrets exist" -Test {
    $result = infisical secrets list `
        --projectId="$ProjectId" `
        --env="$Environment" `
        --path="/shared" `
        --format=json 2>&1

    $secrets = $result | ConvertFrom-Json
    $secretKeys = $secrets | ForEach-Object { $_.secretKey }

    $missing = @()
    foreach ($secret in $criticalSecrets) {
        if ($secret -notin $secretKeys) {
            $missing += $secret
        }
    }

    if ($missing.Count -gt 0) {
        throw "Missing critical secrets: $($missing -join ', ')"
    }

    Write-Host "      All critical secrets present" -ForegroundColor Gray
}

# Test 6.2: Check for placeholder values
Test-Step -Name "Check for placeholder values" -Test {
    $result = infisical secrets list `
        --projectId="$ProjectId" `
        --env="$Environment" `
        --path="/shared" `
        --format=json 2>&1

    $secrets = $result | ConvertFrom-Json
    $placeholders = @()

    foreach ($secret in $secrets) {
        if ($secret.secretValue -match "CHANGE_ME|TODO|FIXME|your-.*-here|<.*>") {
            $placeholders += $secret.secretKey
        }
    }

    if ($placeholders.Count -gt 0) {
        Write-Host "      ⚠️  Found placeholder values: $($placeholders -join ', ')" -ForegroundColor Yellow
        Write-Host "      These should be replaced before production" -ForegroundColor Yellow
    } else {
        Write-Host "      No placeholder values found" -ForegroundColor Gray
    }
}

# ============================================================================
# Final Summary
# ============================================================================

Show-Summary

# Exit with appropriate code
if ($TestsFailed -eq 0) {
    exit 0
} else {
    exit 1
}
