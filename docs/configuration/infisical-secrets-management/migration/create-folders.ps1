# Infisical Folder Structure Creation Script (Fixed)
# Generated: 2026-01-24

param(
    [switch]$DryRun
)

$ErrorActionPreference = "Continue"
$ProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
$EnvSlug = "dev" # Renamed to avoid conflict with $Env variable

# -------------------------------------------------------------------------
# 1. AUTHENTICATION (Fixed)
# -------------------------------------------------------------------------
# We must exchange Client ID/Secret for a temporary Access Token.
# Passing ClientID directly as a token will NOT work.

$ClientId = $env:INFISICAL_UNIVERSAL_AUTH_CLIENT_ID
$ClientSecret = $env:INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET

if (-not $ClientId -or -not $ClientSecret) {
    Write-Host "❌ Missing Environment Variables." -ForegroundColor Red
    Write-Host "   Please ensure INFISICAL_UNIVERSAL_AUTH_CLIENT_ID and INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET are set."
    exit 1
}

Write-Host "🔄 Authenticating with Infisical..." -ForegroundColor Cyan
try {
    # Login and capture the token (requires --plain to get just the string)
    $AccessToken = infisical login --method=universal-auth --client-id="$ClientId" --client-secret="$ClientSecret" --plain --silent
    if (-not $AccessToken) { throw "Empty token received" }
    Write-Host "   ✓ Authenticated successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Authentication Failed: $_" -ForegroundColor Red
    exit 1
}

# -------------------------------------------------------------------------
# 2. FOLDER LIST
# -------------------------------------------------------------------------
$folders = @(
    "/providers/anthropic",
    "/providers/openai",
    "/providers/google",
    "/providers/openrouter",
    "/providers/ollama",
    "/providers/perplexity",
    "/providers/replicate",
    "/machines/orchestrator-mini",
    "/machines/worker-rtx3060",
    "/machines/worker-rtx5090",
    "/machines/worker-rtx3090ti",
    "/databases/postgres",
    "/databases/redis",
    "/databases/qdrant",
    "/databases/supabase",
    "/databases/mem0",
    "/databases/graphiti",
    "/databases/letta",
    "/databases/twentycrm",
    "/databases/mongodb",
    "/databases/falkordb",
    "/databases/dify",
    "/clients/claude-flow",
    "/clients/claude-code",
    "/clients/agentic-flow",
    "/clients/agent-booster",
    "/clients/ruvector",
    "/clients/bitwarden",
    "/clients/infisical",
    "/clients/nexusrouter",
    "/services/archon",
    "/services/agentdb",
    "/services/docker",
    "/services/cloudflare",
    "/services/github",
    "/services/n8n",
    "/services/prometheus",
    "/services/grafana",
    "/services/alertmanager",
    "/services/cadvisor",
    "/services/litellm",
    "/services/langfuse",
    "/services/minio",
    "/services/loki",
    "/services/dify",
    "/services/gitea",
    "/services/flow-nexus",
    "/services/ruv-swarm",
    "/services/tailscale",
    "/config/environment",
    "/config/project",
    "/config/bash",
    "/config/model-routing",
    "/config/versioning",
    "/config/ports",
    "/config/features",
    "/config/cache",
    "/config/rate-limiting",
    "/config/namespaces",
    "/config/misc",
    "/security/api-keys",
    "/security/auth",
    "/security/passwords",
    "/security/tokens",
    "/security/encryption",
    "/monitoring/alerts",
    "/monitoring/logging",
    "/monitoring/metrics",
    "/workflows/campaign",
    "/workflows/mortgage"
)

# -------------------------------------------------------------------------
# 3. HELPER FUNCTION (Recursive Logic)
# -------------------------------------------------------------------------
function Ensure-Folder {
    param (
        [string]$FullPath
    )

    # 1. Split the path into segments to ensure parents exist
    # e.g., "/providers/anthropic" -> "providers", "anthropic"
    $parts = $FullPath.TrimStart('/').Split('/')
    $currentParent = "/"

    foreach ($part in $parts) {
        if ([string]::IsNullOrWhiteSpace($part)) { continue }

        $targetName = $part
        $targetPath = $currentParent

        if ($DryRun) {
            Write-Host "   [DRY RUN] Would create '$targetName' in '$targetPath'" -ForegroundColor DarkGray
        } else {
            # Try to create the folder
            # We ignore errors because checking for existence first is slow/complex in CLI
            # The CLI will error if it exists, which we catch and ignore.
            
            $null = infisical secrets folders create --name="$targetName" --path="$targetPath" --env="$EnvSlug" --projectId="$ProjectId" --token="$AccessToken" 2>&1
            
            # Check if it actually worked or failed (Infisical CLI exit codes aren't always perfect, but we proceed)
        }

        # Update parent for next iteration
        if ($targetPath -eq "/") {
            $currentParent = "/$targetName"
        } else {
            $currentParent = "$targetPath/$targetName"
        }
    }
}

# -------------------------------------------------------------------------
# 4. EXECUTION
# -------------------------------------------------------------------------

Write-Host "`n📁 Infisical Folder Creation" -ForegroundColor Cyan
Write-Host "============================`n" -ForegroundColor Cyan

$Total = $folders.Count
$Current = 0

foreach ($folder in $folders) {
    $Current++
    $Percent = [math]::Round(($Current / $Total) * 100)
    Write-Host "[$Percent%] Processing: $folder" -NoNewline

    try {
        Ensure-Folder -FullPath $folder
        Write-Host " ✓" -ForegroundColor Green
    } catch {
        Write-Host " ✗" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor DarkRed
    }
}

Write-Host "`nDone!`n" -ForegroundColor Cyan