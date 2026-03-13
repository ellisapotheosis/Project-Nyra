# ============================================================================
# Validate Secrets in Infisical - Project Nyra
# ============================================================================
# This script verifies that all required secrets exist in Infisical across
# all paths. It checks for missing secrets, placeholder values, and validates
# the complete configuration.
#
# Usage:
#   .\validate-secrets.ps1
#   .\validate-secrets.ps1 -Verbose       # Show all secret names
#   .\validate-secrets.ps1 -PathsOnly shared  # Validate specific path only
# ============================================================================

[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet("all", "shared", "worker-5090", "worker-3090", "worker-3060")]
    [string]$PathsOnly = "all",

    [Parameter()]
    [string]$ProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef",

    [Parameter()]
    [string]$Environment = "dev"
)

$ErrorActionPreference = "Stop"

Write-Host @"
╔══════════════════════════════════════════════════════════════════╗
║        VALIDATE INFISICAL SECRETS - PROJECT NYRA                ║
╚══════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host "`n📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Project ID:  $ProjectId" -ForegroundColor White
Write-Host "   Environment: $Environment" -ForegroundColor White
Write-Host "   Scope:       $PathsOnly" -ForegroundColor White
Write-Host ""

# ============================================================================
# Required Secrets Definitions
# ============================================================================

$requiredSecrets = @{
    "/shared" = @(
        # Database
        "POSTGRES_HOST", "POSTGRES_PORT", "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB",
        "DATABASE_URL",

        # Redis
        "REDIS_HOST", "REDIS_PORT", "REDIS_PASSWORD", "REDIS_URL",
        "NEXUS_REDIS_URL", "CLAUDE_FLOW_REDIS_URL", "ARCHON_REDIS_URL",

        # AI Providers
        "ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY",
        "OPENROUTER_API_KEY", "OPENROUTER_BASE_URL",

        # Services
        "NEXUS_ROUTER_PORT", "NEXUS_JWT_SECRET", "NEXUS_ADMIN_TOKEN",
        "CLAUDE_FLOW_PORT", "ARCHON_PORT",

        # General
        "NODE_ENV", "LOG_LEVEL"
    )

    "/worker-5090" = @(
        "MACHINE_HOSTNAME", "MACHINE_ROLE", "MACHINE_GPU_TYPE",
        "MACHINE_IP_TAILSCALE", "OLLAMA_HOST", "OLLAMA_PORT",
        "WORKER_5090_URL", "WORKER_SPECIALIZATION"
    )

    "/worker-3090" = @(
        "MACHINE_HOSTNAME", "MACHINE_ROLE", "MACHINE_GPU_TYPE",
        "MACHINE_IP_TAILSCALE", "OLLAMA_HOST", "OLLAMA_PORT",
        "WORKER_3090_URL", "WORKER_SPECIALIZATION"
    )

    "/worker-3060" = @(
        "MACHINE_HOSTNAME", "MACHINE_ROLE", "MACHINE_GPU_TYPE",
        "MACHINE_IP_TAILSCALE", "OLLAMA_HOST", "OLLAMA_PORT",
        "WORKER_3060_URL", "WORKER_SPECIALIZATION"
    )
}

# Placeholder patterns to detect
$placeholderPatterns = @(
    "CHANGE_ME",
    "TODO",
    "FIXME",
    "<.*>",
    "your-.*-here"
)

# ============================================================================
# Helper Functions
# ============================================================================

function Test-SecretPath {
    param(
        [string]$Path,
        [string[]]$RequiredKeys
    )

    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "Validating: $Path" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

    try {
        # Fetch all secrets from path
        $secrets = @{}
        $rawOutput = infisical secrets list --projectId="$ProjectId" --env="$Environment" --path="$Path" --format=json 2>&1

        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Failed to fetch secrets from path: $Path" -ForegroundColor Red
            Write-Host "  Error: $rawOutput" -ForegroundColor Red
            return @{
                Path = $Path
                Total = 0
                Present = 0
                Missing = $RequiredKeys.Count
                Placeholders = 0
                Issues = @("Failed to fetch secrets")
            }
        }

        # Parse JSON output
        $secretsList = $rawOutput | ConvertFrom-Json
        foreach ($secret in $secretsList) {
            $secrets[$secret.secretKey] = $secret.secretValue
        }

        Write-Host "`n📦 Found $($secrets.Count) total secrets in path" -ForegroundColor Cyan
        if ($VerbosePreference -eq 'Continue') {
            Write-Host "   Secrets: $($secrets.Keys -join ', ')" -ForegroundColor Gray
        }

        # Validate required secrets
        $present = 0
        $missing = 0
        $placeholders = 0
        $issues = @()

        Write-Host "`n🔍 Checking required secrets:" -ForegroundColor Cyan

        foreach ($key in $RequiredKeys) {
            if ($secrets.ContainsKey($key)) {
                $value = $secrets[$key]

                # Check for placeholder values
                $isPlaceholder = $false
                foreach ($pattern in $placeholderPatterns) {
                    if ($value -match $pattern) {
                        $isPlaceholder = $true
                        break
                    }
                }

                if ($isPlaceholder) {
                    Write-Host "   ⚠️  $key (placeholder value detected)" -ForegroundColor Yellow
                    $placeholders++
                    $issues += "$key has placeholder value"
                } elseif ([string]::IsNullOrWhiteSpace($value)) {
                    Write-Host "   ⚠️  $key (empty value)" -ForegroundColor Yellow
                    $placeholders++
                    $issues += "$key is empty"
                } else {
                    Write-Host "   ✓ $key" -ForegroundColor Green
                    $present++
                }
            } else {
                Write-Host "   ✗ $key (missing)" -ForegroundColor Red
                $missing++
                $issues += "$key is missing"
            }
        }

        # Summary for this path
        Write-Host "`n📊 Path Summary:" -ForegroundColor Cyan
        Write-Host "   Required:     $($RequiredKeys.Count) secrets" -ForegroundColor White
        Write-Host "   Present:      $present secrets" -ForegroundColor $(if ($present -eq $RequiredKeys.Count) { "Green" } else { "Yellow" })
        if ($missing -gt 0) {
            Write-Host "   Missing:      $missing secrets" -ForegroundColor Red
        }
        if ($placeholders -gt 0) {
            Write-Host "   Placeholders: $placeholders secrets" -ForegroundColor Yellow
        }

        return @{
            Path = $Path
            Total = $secrets.Count
            Present = $present
            Missing = $missing
            Placeholders = $placeholders
            Issues = $issues
        }

    } catch {
        Write-Host "✗ Error validating path: $_" -ForegroundColor Red
        return @{
            Path = $Path
            Total = 0
            Present = 0
            Missing = $RequiredKeys.Count
            Placeholders = 0
            Issues = @("Exception: $_")
        }
    }
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Pre-flight Checks" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Check Infisical CLI
try {
    $version = infisical --version 2>&1
    Write-Host "✓ Infisical CLI: $version" -ForegroundColor Green
} catch {
    Write-Host "✗ Infisical CLI not found" -ForegroundColor Red
    Write-Host "  Run: .\setup-infisical-orchestrator.ps1" -ForegroundColor Yellow
    exit 1
}

# Check authentication
try {
    $result = infisical secrets list --projectId="$ProjectId" --env="$Environment" --path="/shared" --format=json 2>&1
    Write-Host "✓ Infisical authentication valid" -ForegroundColor Green
} catch {
    Write-Host "✗ Infisical authentication failed" -ForegroundColor Red
    Write-Host "  Run: infisical login" -ForegroundColor Yellow
    exit 1
}

# ============================================================================
# Validate Secrets
# ============================================================================

$results = @()

# Validate each path
if ($PathsOnly -eq "all") {
    foreach ($path in $requiredSecrets.Keys) {
        $result = Test-SecretPath -Path $path -RequiredKeys $requiredSecrets[$path]
        $results += $result
    }
} else {
    $path = "/$PathsOnly"
    if ($requiredSecrets.ContainsKey($path)) {
        $result = Test-SecretPath -Path $path -RequiredKeys $requiredSecrets[$path]
        $results += $result
    }
}

# ============================================================================
# Overall Summary
# ============================================================================

Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host "📊 OVERALL VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan

$totalPresent = ($results | Measure-Object -Property Present -Sum).Sum
$totalMissing = ($results | Measure-Object -Property Missing -Sum).Sum
$totalPlaceholders = ($results | Measure-Object -Property Placeholders -Sum).Sum
$allIssues = $results | ForEach-Object { $_.Issues } | Where-Object { $_ }

Write-Host "`n✅ Valid Secrets:  $totalPresent" -ForegroundColor Green
if ($totalMissing -gt 0) {
    Write-Host "❌ Missing:        $totalMissing" -ForegroundColor Red
}
if ($totalPlaceholders -gt 0) {
    Write-Host "⚠️  Placeholders:  $totalPlaceholders" -ForegroundColor Yellow
}

# List all issues
if ($allIssues.Count -gt 0) {
    Write-Host "`n⚠️  Issues Found:" -ForegroundColor Yellow
    foreach ($issue in $allIssues) {
        Write-Host "   • $issue" -ForegroundColor White
    }
}

# Final status
Write-Host ""
if ($totalMissing -eq 0 -and $totalPlaceholders -eq 0) {
    Write-Host "✅ ALL SECRETS VALIDATED SUCCESSFULLY!" -ForegroundColor Green
    exit 0
} elseif ($totalMissing -gt 0) {
    Write-Host "❌ VALIDATION FAILED - Missing required secrets" -ForegroundColor Red
    Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Upload missing secrets" -ForegroundColor White
    Write-Host "      .\sync-secrets.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Manually set secrets in Infisical Dashboard" -ForegroundColor White
    Write-Host "      https://app.infisical.com" -ForegroundColor Gray
    Write-Host ""
    exit 1
} else {
    Write-Host "⚠️  VALIDATION WARNING - Some secrets have placeholder values" -ForegroundColor Yellow
    Write-Host "`n💡 Replace placeholder values before production deployment" -ForegroundColor Cyan
    exit 0
}
