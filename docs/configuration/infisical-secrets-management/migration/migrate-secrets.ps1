# Infisical Secrets Migration Script
# Generated: 2026-01-22
# This script organizes 397 secrets from /shared into structured paths

param(
    [switch]$DryRun,
    [switch]$Verbose,
    [string]$EnvFile = "..\\.env"
)

$ErrorActionPreference = "Continue"
$ProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
$Env = "dev"
$Token = $env:INFISICAL_ACCESS_TOKEN

if (-not $Token) {
    Write-Host "❌ INFISICAL_ACCESS_TOKEN not set. Please set it first." -ForegroundColor Red
    exit 1
}

# Path categorization rules
$PathRules = @{
    # Providers
    '/providers/anthropic' = @('ANTHROPIC_')
    '/providers/openai' = @('OPENAI_', 'OPENMEMORY_')
    '/providers/google' = @('GEMINI_', 'GOOGLE_', 'VERTEXAI_')
    '/providers/openrouter' = @('OPENROUTER_')
    '/providers/ollama' = @('OLLAMA_')

    # Machines (GPU workers)
    '/machines/worker-rtx3060' = @('WORKER_3060_')
    '/machines/worker-rtx5090' = @('WORKER_5090_')
    '/machines/worker-rtx3090ti' = @('WORKER_3090_')
    '/machines/orchestrator-mini' = @('CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR', 'NYRA_ORCHESTRATOR_')

    # Databases
    '/databases/postgres' = @('POSTGRES_', 'PG_', 'DATABASE_URL', 'PGADMIN_')
    '/databases/redis' = @('REDIS_')
    '/databases/qdrant' = @('QDRANT_')
    '/databases/supabase' = @('SUPABASE_')
    '/databases/mem0' = @('MEM0_')
    '/databases/graphiti' = @('GRAPHITI_', 'NEO4J_')
    '/databases/letta' = @('LETTA_')
    '/databases/twentycrm' = @('TWENTY_')
    '/databases/mongodb' = @('MONGO_')
    '/databases/falkordb' = @('FALKORDB_')
    '/databases/dify' = @('DIFY_DB_', 'DIFY_POSTGRES_', 'DIFY_ENCRYPTION_', 'DIFY_SECRET_', 'DIFY_SANDBOX_')

    # Clients
    '/clients/claude-flow' = @('CLAUDE_FLOW_')
    '/clients/claude-code' = @('CLAUDE_CODE_', 'CLAUDE_AUTO_', 'CLAUDE_BASH_', 'CLAUDE_ESCALATE_', 'CLAUDE_METRICS_')
    '/clients/agentic-flow' = @('AGENTIC_FLOW_')
    '/clients/agent-booster' = @('AGENT_BOOSTER_')
    '/clients/bitwarden' = @('BITWARDEN_', 'BW_')
    '/clients/infisical' = @('INFISICAL_')
    '/clients/nexusrouter' = @('NEXUS_')

    # Services
    '/services/archon' = @('ARCHON_')
    '/services/agentdb' = @('AGENTDB_')
    '/services/docker' = @('DOCKER_', 'COMPOSE_', 'HUB_', 'DOCKHERHUB_')
    '/services/cloudflare' = @('CF_', 'CLOUDFLARE_')
    '/services/github' = @('GH_', 'GITHUB_', 'GIT_AUTHOR_')
    '/services/n8n' = @('N8N_')
    '/services/prometheus' = @('PROMETHEUS_')
    '/services/grafana' = @('GRAFANA_')
    '/services/alertmanager' = @('ALERTMANAGER_')
    '/services/cadvisor' = @('CADVISOR_')
    '/services/litellm' = @('LITELLM_')
    '/services/langfuse' = @('LANGFUSE_')
    '/services/minio' = @('MINIO_')
    '/services/loki' = @('LOKI_')
    '/services/dify' = @('DIFY_API_', 'DIFY_WEB_', 'DIFY_SANDBOX_PORT')
    '/services/gitea' = @('GITEA_')
    '/services/flow-nexus' = @('FLOW_NEXUS_')
    '/services/ruv-swarm' = @('RUV_SWARM_')

    # Config
    '/config/environment' = @('NODE_ENV', 'PYTHON_ENV', 'PROJECT_ENV', 'DEBUG', 'LOG_LEVEL', 'ENVIRONMENT', 'TZ', 'REGION', 'HOST')
    '/config/project' = @('PROJECT_NAME', 'COMPOSE_PROJECT_NAME', 'NYRA_REPO_ROOT', 'NYRA_STACK_NAME')
    '/config/bash' = @('BASH_')
    '/config/model-routing' = @('MODEL_ROUTING_')
    '/config/versioning' = @('NODE_VERSION', 'PYTHON_VERSION', 'VOLTA_VERSION', 'COMPLETION_MODEL', 'CLAUDE_MODEL')

    # Security
    '/security/api-keys' = @('_API_KEY$', '_KEY$', 'API_KEY', 'EXA_API_KEY', 'COMPOSIO_API_KEY')
    '/security/auth' = @('AUTH_', 'JWT_', 'SESSION_', 'IDENTITY_PROVIDER_', 'AUTOAPPROVE')
    '/security/passwords' = @('_PASSWORD$', 'PASSWORD')
    '/security/tokens' = @('_TOKEN$', 'TOKEN', '_PAT$', 'PAT')

    # Monitoring
    '/monitoring/alerts' = @('MONITORING_ALERT_')
    '/monitoring/logging' = @('LOG_RETENTION_')
    '/monitoring/metrics' = @('METRICS_RETENTION_')

    # Workflows
    '/workflows/campaign' = @('CAMPAIGN_')

    # Other
    '/config/ports' = @('_PORT$', 'PORT')
    '/config/features' = @('_ENABLED$', 'ENABLE_', 'AUTO_', 'USE_', 'DISABLE_')
    '/config/cache' = @('CACHE_', 'MEMORY_CACHE_')
    '/config/rate-limiting' = @('RATE_LIMIT_')
    '/config/namespaces' = @('NAMESPACE_')
    '/config/misc' = @('CONNECTION_POOL_SIZE', 'CORS_ALLOWED_ORIGINS', 'DEFAULT_TIMEOUT', 'DESKTOP_COMMANDER_', 'REASONINGBANK_', 'SWARM_TOPOLOGY', 'VITE_', 'WEBUI_', 'CREATE_GH_RELEASE', 'SLACK_WEBHOOK_URL', 'ONNX_', 'QUOTE_API_PORT', 'AGENT_WORK_ORDERS_PORT')
}

Write-Host "`n🔐 Infisical Secrets Migration" -ForegroundColor Cyan
Write-Host "==============================`n" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made`n" -ForegroundColor Yellow
}

# Parse .env file
Write-Host "📂 Reading $EnvFile..." -ForegroundColor Gray
if (-not (Test-Path $EnvFile)) {
    Write-Host "❌ File not found: $EnvFile" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $EnvFile -Raw
$lines = $envContent -split "`n"
$variables = @()

foreach ($line in $lines) {
    $line = $line.Trim()
    if ($line -and -not $line.StartsWith('#') -and $line -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
        $key = $matches[1]
        $value = $matches[2] -replace "^['\"]|['\"]$", "" # Remove quotes
        $variables += @{
            Key = $key
            Value = $value
        }
    }
}

Write-Host "✓ Parsed $($variables.Count) variables`n" -ForegroundColor Green

# Categorize variables
Write-Host "🗂️  Categorizing variables..." -ForegroundColor Gray
$categorized = @{}
$uncategorized = @()

foreach ($var in $variables) {
    $assigned = $false

    foreach ($pathEntry in $PathRules.GetEnumerator()) {
        $targetPath = $pathEntry.Key
        $prefixes = $pathEntry.Value

        foreach ($prefix in $prefixes) {
            $matched = $false

            if ($prefix -match '\$$') {
                # Regex pattern (ends with $)
                if ($var.Key -match $prefix) {
                    $matched = $true
                }
            } else {
                # Simple prefix match
                if ($var.Key.StartsWith($prefix) -or $var.Key -eq $prefix) {
                    $matched = $true
                }
            }

            if ($matched) {
                if (-not $categorized.ContainsKey($targetPath)) {
                    $categorized[$targetPath] = @()
                }
                $categorized[$targetPath] += $var
                $assigned = $true
                break
            }
        }

        if ($assigned) { break }
    }

    if (-not $assigned) {
        $uncategorized += $var
    }
}

Write-Host "✓ Categorized: $($variables.Count - $uncategorized.Count)" -ForegroundColor Green
Write-Host "⚠ Uncategorized: $($uncategorized.Count)`n" -ForegroundColor Yellow

# Display summary
Write-Host "📊 Migration Summary" -ForegroundColor Cyan
Write-Host "====================`n" -ForegroundColor Cyan

$sortedPaths = $categorized.Keys | Sort-Object
foreach ($path in $sortedPaths) {
    $count = $categorized[$path].Count
    Write-Host "  $path ($count vars)" -ForegroundColor White
}

if ($uncategorized.Count -gt 0) {
    Write-Host "`n⚠️  Uncategorized Variables:" -ForegroundColor Yellow
    foreach ($var in $uncategorized) {
        Write-Host "    - $($var.Key)" -ForegroundColor DarkYellow
    }
}

Write-Host ""

# Ask for confirmation
if (-not $DryRun) {
    $response = Read-Host "Proceed with migration? (yes/no)"
    if ($response -ne 'yes') {
        Write-Host "❌ Migration canceled" -ForegroundColor Red
        exit 0
    }
}

# Execute migration
$totalCount = 0
$successCount = 0
$failCount = 0
$skippedCount = 0

foreach ($pathEntry in $categorized.GetEnumerator()) {
    $targetPath = $pathEntry.Key
    $vars = $pathEntry.Value

    Write-Host "`n📁 Migrating to $targetPath ($($vars.Count) variables)..." -ForegroundColor Yellow

    foreach ($var in $vars) {
        $totalCount++
        $key = $var.Key
        $value = $var.Value

        # Skip empty values
        if ([string]::IsNullOrWhiteSpace($value)) {
            Write-Host "  ⊘ $key (empty value, skipped)" -ForegroundColor DarkGray
            $skippedCount++
            continue
        }

        Write-Host "  Setting $key..." -NoNewline

        if ($DryRun) {
            Write-Host " [DRY RUN]" -ForegroundColor Cyan
            $successCount++
        } else {
            try {
                # Escape special characters for command line
                $escapedValue = $value -replace '"', '\"'

                # Run infisical secrets set
                $result = infisical secrets set "$key" "$value" `
                    --path="$targetPath" `
                    --env="$Env" `
                    --projectId="$ProjectId" `
                    --token="$Token" `
                    --silent 2>&1

                if ($LASTEXITCODE -eq 0) {
                    Write-Host " ✓" -ForegroundColor Green
                    $successCount++
                } else {
                    Write-Host " ✗" -ForegroundColor Red
                    if ($Verbose) {
                        Write-Host "    Error: $result" -ForegroundColor Red
                    }
                    $failCount++
                }
            } catch {
                Write-Host " ✗" -ForegroundColor Red
                if ($Verbose) {
                    Write-Host "    Error: $_" -ForegroundColor Red
                }
                $failCount++
            }
        }
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Migration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total:    $totalCount" -ForegroundColor White
Write-Host "Success:  $successCount" -ForegroundColor Green
Write-Host "Failed:   $failCount" -ForegroundColor Red
Write-Host "Skipped:  $skippedCount" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

if ($failCount -gt 0) {
    Write-Host "⚠️  Some secrets failed to migrate. Run with -Verbose for details." -ForegroundColor Yellow
}

if ($uncategorized.Count -gt 0) {
    Write-Host "⚠️  $($uncategorized.Count) variables were not categorized and remain in /shared" -ForegroundColor Yellow
}

# Next steps
if (-not $DryRun) {
    Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Review failed migrations (if any)" -ForegroundColor White
    Write-Host "  2. Handle uncategorized variables" -ForegroundColor White
    Write-Host "  3. Set up imports in /shared" -ForegroundColor White
    Write-Host "  4. Generate per-machine configs" -ForegroundColor White
    Write-Host "  5. Validate service access to secrets`n" -ForegroundColor White
}

exit 0
