# Infisical Folder Structure Creation Script
# Generated: 2026-01-22
# Creates all necessary folders for organized secret management

param(
    [switch]$DryRun
)

$ErrorActionPreference = "Continue"
$ProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
$Env = "dev"
$Token = $env:INFISICAL_ACCESS_TOKEN

if (-not $Token) {
    Write-Host "❌ INFISICAL_ACCESS_TOKEN not set. Please set it first." -ForegroundColor Red
    exit 1
}

# All folders to create
$folders = @(
    # Providers
    "/providers/anthropic",
    "/providers/openai",
    "/providers/google",
    "/providers/openrouter",
    "/providers/ollama",
    "/providers/perplexity",
    "/providers/replicate",

    # Machines (GPU Workers)
    "/machines/orchestrator-mini",
    "/machines/worker-rtx3060",
    "/machines/worker-rtx5090",
    "/machines/worker-rtx3090ti",

    # Databases
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

    # Clients
    "/clients/claude-flow",
    "/clients/claude-code",
    "/clients/agentic-flow",
    "/clients/agent-booster",
    "/clients/ruvector",
    "/clients/bitwarden",
    "/clients/infisical",
    "/clients/nexusrouter",

    # Services
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

    # Config
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

    # Security
    "/security/api-keys",
    "/security/auth",
    "/security/passwords",
    "/security/tokens",
    "/security/encryption",

    # Monitoring
    "/monitoring/alerts",
    "/monitoring/logging",
    "/monitoring/metrics",

    # Workflows
    "/workflows/campaign",
    "/workflows/mortgage"
)

Write-Host "`n📁 Infisical Folder Creation" -ForegroundColor Cyan
Write-Host "============================`n" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No folders will be created`n" -ForegroundColor Yellow
}

Write-Host "Creating $($folders.Count) folders..`n" -ForegroundColor Gray

$successCount = 0
$failCount = 0
$skippedCount = 0

foreach ($folder in $folders) {
    Write-Host "Creating $folder..." -NoNewline

    if ($DryRun) {
        Write-Host " [DRY RUN]" -ForegroundColor Cyan
        $successCount++
        continue
    }

    try {
        # Check if folder already exists
        $checkResult = infisical secrets folders get --path="$folder" --env="$Env" --projectId="$ProjectId" --token="$Token" --silent 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host " ⊘ (already exists)" -ForegroundColor DarkGray
            $skippedCount++
            continue
        }

        # Create the folder
        $result = infisical secrets folders create "$folder" --env="$Env" --projectId="$ProjectId" --token="$Token" --silent 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✓" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " ✗" -ForegroundColor Red
            Write-Host "    Error: $result" -ForegroundColor DarkRed
            $failCount++
        }
    } catch {
        Write-Host " ✗" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor DarkRed
        $failCount++
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Folder Creation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total:    $($folders.Count)" -ForegroundColor White
Write-Host "Created:  $successCount" -ForegroundColor Green
Write-Host "Skipped:  $skippedCount" -ForegroundColor Yellow
Write-Host "Failed:   $failCount" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Cyan

if ($failCount -gt 0) {
    Write-Host "⚠️  Some folders failed to create." -ForegroundColor Yellow
    Write-Host "    This may be due to parent folders not existing or permission issues.`n" -ForegroundColor Yellow
}

exit 0
