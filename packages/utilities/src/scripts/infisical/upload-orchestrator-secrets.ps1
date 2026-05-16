#!/usr/bin/env pwsh

<#
.SYNOPSIS
Upload orchestrator secrets to Infisical

.DESCRIPTION
Uploads all orchestrator-specific secrets (databases, services, admin credentials)
to /orchestrator/* paths in Infisical. Only PC1 has access to these secrets.

.PARAMETER Environment
Target environment (development, staging, production)

.EXAMPLE
.\upload-orchestrator-secrets.ps1 -Environment development
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\..\lib\InfisicalToken.ps1"
$projectId = Get-NyraInfisicalProjectId
Assert-NyraInfisicalToken

Write-Host "`n🔐 Uploading Orchestrator Secrets to Infisical" -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

$totalSuccess = 0
$totalFailed = 0

# Helper function to upload secrets
function Upload-Secrets {
    param(
        [hashtable]$Secrets,
        [string]$Path,
        [string]$Category
    )

    Write-Host "📦 Uploading $Category..." -ForegroundColor Yellow

    $success = 0
    $failed = 0

    foreach ($key in $Secrets.Keys) {
        $value = $Secrets[$key]

        if ([string]::IsNullOrWhiteSpace($value)) {
            Write-Host "   ⚠️  Skipping $key (not set)" -ForegroundColor DarkYellow
            continue
        }

        try {
            Set-NyraInfisicalSecret -Name $key -Value $value -Environment $Environment -Path $Path -ProjectId $projectId | Out-Null
            Write-Host "   ✅ $key" -ForegroundColor Green
            $success++
        }
        catch {
            Write-Host "   ❌ $key : $_" -ForegroundColor Red
            $failed++
        }
    }

    Write-Host "   📊 $Category : $success success, $failed failed`n" -ForegroundColor Cyan

    return @{Success = $success; Failed = $failed}
}

# Database Secrets
$dbSecrets = @{
    "POSTGRES_USER" = "postgres"
    "POSTGRES_PASSWORD" = $env:POSTGRES_PASSWORD
    "POSTGRES_PORT" = "5432"
    "REDIS_PASSWORD" = $env:REDIS_PASSWORD
    "REDIS_PORT" = "6380"
    "FALKORDB_PASSWORD" = $env:FALKORDB_PASSWORD
}
$result = Upload-Secrets -Secrets $dbSecrets -Path "/orchestrator/database" -Category "Database"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# Nexus Router
$nexusSecrets = @{
    "NEXUS_ROUTER_PORT" = "7000"
    "NEXUS_URL" = "http://localhost:7000"
    "NEXUS_JWT_SECRET" = $env:NEXUS_JWT_SECRET
    "NEXUS_ADMIN_TOKEN" = $env:NEXUS_ADMIN_TOKEN
}
$result = Upload-Secrets -Secrets $nexusSecrets -Path "/orchestrator/nexus" -Category "Nexus Router"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# n8n
$n8nSecrets = @{
    "PORT_N8N" = "5678"
    "N8N_URL" = "http://localhost:5678"
    "N8N_BASIC_AUTH_USER" = "admin"
    "N8N_BASIC_AUTH_PASSWORD" = $env:N8N_BASIC_AUTH_PASSWORD
    "N8N_ENCRYPTION_KEY" = $env:N8N_ENCRYPTION_KEY
    "N8N_HOST" = "localhost"
}
$result = Upload-Secrets -Secrets $n8nSecrets -Path "/orchestrator/n8n" -Category "n8n Workflow"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# Activepieces
$activepiecesSecrets = @{
    "PORT_ACTIVEPIECES" = "3002"
    "ACTIVEPIECES_API_KEY" = $env:ACTIVEPIECES_API_KEY
    "AP_ENCRYPTION_KEY" = $env:AP_ENCRYPTION_KEY
    "AP_JWT_SECRET" = $env:AP_JWT_SECRET
}
$result = Upload-Secrets -Secrets $activepiecesSecrets -Path "/orchestrator/activepieces" -Category "Activepieces"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# TwentyCRM
$twentySecrets = @{
    "PORT_TWENTYCRM" = "3010"
    "TWENTY_CRM_URL" = "http://localhost:3010"
    "TWENTY_ACCESS_TOKEN_SECRET" = $env:TWENTY_ACCESS_TOKEN_SECRET
    "TWENTY_LOGIN_TOKEN_SECRET" = $env:TWENTY_LOGIN_TOKEN_SECRET
    "TWENTY_REFRESH_TOKEN_SECRET" = $env:TWENTY_REFRESH_TOKEN_SECRET
    "TWENTY_FILE_TOKEN_SECRET" = $env:TWENTY_FILE_TOKEN_SECRET
}
$result = Upload-Secrets -Secrets $twentySecrets -Path "/orchestrator/twentycrm" -Category "TwentyCRM"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# Letta Memory Server
$lettaSecrets = @{
    "PORT_LETTA" = "8283"
    "LETTA_URL" = "http://localhost:8283"
    "LETTA_API_KEY" = $env:LETTA_API_KEY
    "LETTA_SERVER_PASS" = $env:LETTA_SERVER_PASS
}
$result = Upload-Secrets -Secrets $lettaSecrets -Path "/orchestrator/letta" -Category "Letta Memory"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# Mem0
$mem0Secrets = @{
    "MEM0_API_KEY" = $env:MEM0_API_KEY
    "MEM0_PORT" = "8081"
    "MEM0_URL" = "http://localhost:4321"
    "MEM0_DEFAULT_USER_ID" = "default"
    "MEM0_BASE_URL" = "https://api.mem0.ai"
}
$result = Upload-Secrets -Secrets $mem0Secrets -Path "/orchestrator/mem0" -Category "Mem0 Vector Memory"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# letta
$lettaSecrets = @{
    "letta_API_KEY" = $env:letta_API_KEY
    "letta_TEMPORAL_TRACKING" = "true"
    "letta_RELATIONSHIP_INFERENCE" = "true"
}
$result = Upload-Secrets -Secrets $lettaSecrets -Path "/orchestrator/letta" -Category "letta Graph Memory"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# LiteLLM (Legacy)
$litellmSecrets = @{
    "PORT_LITELLM" = "4000"
    "LITELLM_MASTER_KEY" = $env:LITELLM_MASTER_KEY
}
$result = Upload-Secrets -Secrets $litellmSecrets -Path "/orchestrator/litellm" -Category "LiteLLM Proxy"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# Monitoring
$monitoringSecrets = @{
    "PROMETHEUS_PORT" = "9090"
    "PROMETHEUS_RETENTION" = "15d"
    "GRAFANA_PORT" = "3000"
    "GRAFANA_ADMIN_USER" = "admin"
    "GRAFANA_ADMIN_PASSWORD" = $env:GRAFANA_ADMIN_PASSWORD
}
$result = Upload-Secrets -Secrets $monitoringSecrets -Path "/orchestrator/monitoring" -Category "Monitoring"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# Communication (Twilio + Email)
$commSecrets = @{
    "TWILIO_ACCOUNT_SID" = $env:TWILIO_ACCOUNT_SID
    "TWILIO_AUTH_TOKEN" = $env:TWILIO_AUTH_TOKEN
    "TWILIO_PHONE_NUMBER" = $env:TWILIO_PHONE_NUMBER
    "SMTP_HOST" = "smtp.gmail.com"
    "SMTP_PORT" = "587"
    "SMTP_USER" = $env:SMTP_USER
    "SMTP_PASSWORD" = $env:SMTP_PASSWORD
    "SMTP_FROM_EMAIL" = $env:SMTP_FROM_EMAIL
    "SMTP_FROM_NAME" = "RateHunter Team"
}
$result = Upload-Secrets -Secrets $commSecrets -Path "/orchestrator/communication" -Category "Communication"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# Business Services
$businessSecrets = @{
    "QUOTE_ENGINE_PORT" = "8001"
    "QUOTE_ENGINE_URL" = "http://localhost:8001"
    "QUOTE_ENGINE_HOST" = "0.0.0.0"
    "CAMPAIGN_ENGINE_PORT" = "8002"
    "CAMPAIGN_ENGINE_URL" = "http://localhost:8002"
    "CAMPAIGN_ENGINE_HOST" = "0.0.0.0"
    "NYRA_ORCHESTRATOR_PORT" = "8003"
    "ORCHESTRATOR_URL" = "http://localhost:8010"
    "NYRA_ORCHESTRATOR_HOST" = "0.0.0.0"
    "LOG_LEVEL" = "INFO"
}
$result = Upload-Secrets -Secrets $businessSecrets -Path "/orchestrator/business-services" -Category "Business Services"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# MCP Servers
$mcpSecrets = @{
    "MCP_VSCODE_PORT" = "8081"
    "MCP_TWENTYCRM_PORT" = "8082"
    "MCP_FILESYSTEM_PORT" = "8084"
    "MCP_GITHUB_PORT" = "8085"
    "MCP_BRAVE_SEARCH_PORT" = "8086"
    "MCP_BITWARDEN_PORT" = "8087"
    "MCP_GITLAB_PORT" = "8088"
    "MCP_GOOGLE_MAPS_PORT" = "8089"
    "MCP_SENTRY_PORT" = "8090"
    "MCP_SLACK_PORT" = "8091"
    "MCP_POSTGRES_PORT" = "8092"
}
$result = Upload-Secrets -Secrets $mcpSecrets -Path "/orchestrator/mcp-servers" -Category "MCP Servers"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# Bitwarden
$bitwardenSecrets = @{
    "BITWARDEN_CLIENT_ID" = $env:BITWARDEN_CLIENT_ID
    "BITWARDEN_CLIENT_SECRET" = $env:BITWARDEN_CLIENT_SECRET
    "BITWARDEN_PASSWORD" = $env:BITWARDEN_PASSWORD
    "BW_SESSION" = $env:BW_SESSION
}
$result = Upload-Secrets -Secrets $bitwardenSecrets -Path "/orchestrator/bitwarden" -Category "Bitwarden Vault"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

# Cloudflare Tunnels
$cloudflareSecrets = @{
    "CLOUDFLARED_TUNNEL_TOKEN" = $env:CLOUDFLARED_TUNNEL_TOKEN
    "CLOUDFLARED_TUNNEL_NAME" = "nyra-tunnel"
}
$result = Upload-Secrets -Secrets $cloudflareSecrets -Path "/orchestrator/cloudflare" -Category "Cloudflare Tunnels"
$totalSuccess += $result.Success
$totalFailed += $result.Failed

Write-Host "`n===============================================`n" -ForegroundColor Cyan
Write-Host "📊 Total Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Total Success: $totalSuccess" -ForegroundColor Green
Write-Host "   ❌ Total Failed: $totalFailed" -ForegroundColor Red
Write-Host "`n🎉 Orchestrator secrets upload complete!`n" -ForegroundColor Green

if ($totalFailed -gt 0) {
    exit 1
}
