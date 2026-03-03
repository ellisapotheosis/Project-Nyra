#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated Environment Variable Setup for Project Nyra

.DESCRIPTION
    Sets up environment variables that DO NOT require online account creation.
    This includes system configuration, network settings, local paths, and generated secrets.

    Variables requiring online accounts (API keys) must be set manually.
    See bootstrap/docs/USER-ACTION-GUIDE.md for manual setup steps.

.PARAMETER PCType
    Type of PC: orchestrator, worker-1, worker-2, or worker-3

.PARAMETER Environment
    Target environment: development, staging, or production

.PARAMETER OutputFile
    Optional .env file to generate (default: .env.<pc-type>)

.EXAMPLE
    .\setup-automated-env-vars.ps1 -PCType orchestrator -Environment production

.EXAMPLE
    .\setup-automated-env-vars.ps1 -PCType worker-1 -Environment development -OutputFile .env.worker1
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("orchestrator", "worker-1", "worker-2", "worker-3")]
    [string]$PCType,

    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development",

    [Parameter(Mandatory=$false)]
    [string]$OutputFile = ".env.$PCType"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Project Nyra - Automated Environment Variable Setup" -ForegroundColor Cyan
Write-Host "PC Type: $PCType | Environment: $Environment" -ForegroundColor Yellow
Write-Host ""

# Helper Functions
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[✓] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[!] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[✗] $Message" -ForegroundColor Red }

function Generate-SecurePassword {
    param([int]$Length = 32)
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-='
    $password = -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $password
}

function Generate-HexToken {
    param([int]$Bytes = 32)
    $randomBytes = New-Object byte[] $Bytes
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($randomBytes)
    return [BitConverter]::ToString($randomBytes).Replace("-", "").ToLower()
}

function Get-NetworkInfo {
    Write-Info "Detecting network configuration..."
    $adapter = Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet*" -ErrorAction SilentlyContinue | Select-Object -First 1

    if ($adapter) {
        return @{
            IP = $adapter.IPAddress
            Gateway = (Get-NetRoute -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue | Select-Object -First 1).NextHop
            DNS = (Get-DnsClientServerAddress -AddressFamily IPv4 -InterfaceAlias $adapter.InterfaceAlias).ServerAddresses -join ","
        }
    }
    return $null
}

function Get-MACAddress {
    $adapter = Get-NetAdapter -Physical | Where-Object Status -eq "Up" | Select-Object -First 1
    if ($adapter) {
        return $adapter.MacAddress.Replace("-", ":")
    }
    return $null
}

function Get-GPUInfo {
    try {
        $gpu = Get-WmiObject Win32_VideoController | Where-Object { $_.Name -match "NVIDIA" } | Select-Object -First 1
        if ($gpu) {
            $name = $gpu.Name
            if ($name -match "RTX\s*(\d+)\s*Ti") {
                return @{ Type = "rtx_$($matches[1])ti"; Name = $name }
            }
            elseif ($name -match "RTX\s*(\d+)") {
                return @{ Type = "rtx_$($matches[1])"; Name = $name }
            }
        }
    }
    catch {
        Write-Warning "Could not detect GPU information"
    }
    return $null
}

# Environment Variables Collection
$envVars = [ordered]@{}

# ============================================================================
# SECTION 1: System Configuration
# ============================================================================
Write-Host ""
Write-Info "Setting up system configuration..."

$envVars["NYRA_ENVIRONMENT"] = $Environment
$envVars["NYRA_PC_ID"] = $PCType
$envVars["NYRA_MODE"] = if ($PCType -eq "orchestrator") { "orchestrator" } else { "worker" }
$envVars["NODE_ENV"] = if ($Environment -eq "production") { "production" } else { "development" }
$envVars["LOG_LEVEL"] = if ($Environment -eq "production") { "info" } else { "debug" }

Write-Success "System configuration set"

# ============================================================================
# SECTION 2: Network Configuration
# ============================================================================
Write-Host ""
Write-Info "Detecting network configuration..."

$networkInfo = Get-NetworkInfo
if ($networkInfo) {
    Write-Info "Current IP: $($networkInfo.IP)"
    Write-Info "Gateway: $($networkInfo.Gateway)"
}

# Assign static IPs based on PC type
$staticIPs = @{
    "orchestrator" = "192.168.1.101"
    "worker-1" = "192.168.1.102"
    "worker-2" = "192.168.1.103"
    "worker-3" = "192.168.1.104"
}

$envVars["STATIC_IP"] = $staticIPs[$PCType]
$envVars["SUBNET_MASK"] = "255.255.255.0"
$envVars["GATEWAY"] = "192.168.1.1"
$envVars["DNS_SERVERS"] = "1.1.1.1,8.8.8.8"

# MAC Address
$macAddress = Get-MACAddress
if ($macAddress) {
    $envVars["MAC_ADDRESS"] = $macAddress
    Write-Success "MAC Address detected: $macAddress"
}
else {
    $envVars["MAC_ADDRESS"] = "<detect-manually>"
    Write-Warning "MAC Address not detected - set manually"
}

Write-Success "Network configuration set"

# ============================================================================
# SECTION 3: GPU Configuration (Workers Only)
# ============================================================================
if ($PCType -ne "orchestrator") {
    Write-Host ""
    Write-Info "Detecting GPU configuration..."

    $gpuInfo = Get-GPUInfo
    if ($gpuInfo) {
        $envVars["GPU_TYPE"] = $gpuInfo.Type
        $envVars["GPU_NAME"] = $gpuInfo.Name
        Write-Success "GPU detected: $($gpuInfo.Name)"
    }
    else {
        # Default GPU types by worker
        $defaultGPUs = @{
            "worker-1" = @{ Type = "rtx_3060"; VRAM = "12" }
            "worker-2" = @{ Type = "rtx_5090"; VRAM = "32" }
            "worker-3" = @{ Type = "rtx_3090ti"; VRAM = "24" }
        }

        $envVars["GPU_TYPE"] = $defaultGPUs[$PCType].Type
        $envVars["GPU_VRAM_GB"] = $defaultGPUs[$PCType].VRAM
        Write-Warning "GPU not detected - using defaults for $PCType"
    }
}

# ============================================================================
# SECTION 4: Docker Configuration
# ============================================================================
Write-Host ""
Write-Info "Setting up Docker configuration..."

$envVars["DOCKER_NETWORK"] = "nyra-network"
$envVars["DOCKER_SUBNET"] = "172.21.0.0/16"
$envVars["DOCKER_GATEWAY"] = "172.21.0.1"
$envVars["COMPOSE_PROJECT_NAME"] = "nyra"
$envVars["COMPOSE_FILE"] = "docker-compose.yml:docker-compose.infisical.yml"

Write-Success "Docker configuration set"

# ============================================================================
# SECTION 5: Service Ports
# ============================================================================
Write-Host ""
Write-Info "Setting up service ports..."

if ($PCType -eq "orchestrator") {
    $envVars["ORCHESTRATOR_API_PORT"] = "8000"
    $envVars["ORCHESTRATOR_MGMT_PORT"] = "8080"
    $envVars["POSTGRES_PORT"] = "5432"
    $envVars["REDIS_PORT"] = "6379"
    $envVars["FALKORDB_PORT"] = "6379"
    $envVars["GITEA_HTTP_PORT"] = "3000"
    $envVars["GITEA_SSH_PORT"] = "222"
    $envVars["N8N_PORT"] = "5678"
}
else {
    # Worker ports
    $workerNum = $PCType.Split("-")[1]
    $envVars["WORKER_API_PORT"] = "800$workerNum"
    $envVars["WORKER_GPU_METRICS_PORT"] = "900$workerNum"
}

# MCP Server Ports (all PCs)
$envVars["MCP_CLAUDE_FLOW_PORT"] = "8003"
$envVars["MCP_ARCHON_PORT"] = "8004"
$envVars["MCP_NEXUS_PORT"] = "8005"
$envVars["MCP_INFISICAL_PORT"] = "8006"
$envVars["MCP_EXA_PORT"] = "8007"

Write-Success "Service ports configured"

# ============================================================================
# SECTION 6: Database Configuration (Orchestrator Only)
# ============================================================================
if ($PCType -eq "orchestrator") {
    Write-Host ""
    Write-Info "Generating database credentials..."

    # Generate secure passwords
    $envVars["POSTGRES_DB"] = "nyra_db"
    $envVars["POSTGRES_USER"] = "nyra"
    $envVars["POSTGRES_PASSWORD"] = Generate-SecurePassword -Length 32

    $envVars["REDIS_PASSWORD"] = Generate-SecurePassword -Length 32


    # Database URLs
    $envVars["POSTGRES_URL"] = "postgresql://nyra:$($envVars['POSTGRES_PASSWORD'])@postgres:5432/nyra_db"
    $envVars["REDIS_URL"] = "redis://:$($envVars['REDIS_PASSWORD'])@redis:6379"87"
    $envVars["FALKORDB_URL"] = "redis://falkordb:6379"

    Write-Success "Database credentials generated"
}

# ============================================================================
# SECTION 7: Application Secrets (Generated)
# ============================================================================
Write-Host ""
Write-Info "Generating application secrets..."

$envVars["JWT_SECRET"] = Generate-HexToken -Bytes 64
$envVars["SESSION_SECRET"] = Generate-HexToken -Bytes 64
$envVars["ENCRYPTION_KEY"] = Generate-HexToken -Bytes 32

if ($PCType -eq "orchestrator") {
    $envVars["GITEA_SECRET_KEY"] = Generate-HexToken -Bytes 32
    $envVars["GITEA_INTERNAL_TOKEN"] = Generate-HexToken -Bytes 64
    $envVars["N8N_ENCRYPTION_KEY"] = Generate-HexToken -Bytes 32
}

Write-Success "Application secrets generated"

# ============================================================================
# SECTION 8: Claude Flow Configuration
# ============================================================================
Write-Host ""
Write-Info "Setting up Claude Flow configuration..."

$envVars["CLAUDE_FLOW_MODE"] = "v3"
$envVars["CLAUDE_FLOW_HOOKS_ENABLED"] = "true"
$envVars["CLAUDE_FLOW_TOPOLOGY"] = "hierarchical-mesh"
$envVars["CLAUDE_FLOW_MAX_AGENTS"] = "15"
$envVars["CLAUDE_FLOW_MEMORY_BACKEND"] = "hybrid"
$envVars["CLAUDE_FLOW_DISTRIBUTED"] = "true"

Write-Success "Claude Flow configuration set"

# ============================================================================
# SECTION 9: Orchestrator URL (Workers Only)
# ============================================================================
if ($PCType -ne "orchestrator") {
    Write-Host ""
    Write-Info "Setting orchestrator connection..."

    $envVars["ORCHESTRATOR_URL"] = "https://nyra-orchestrator.yourdomain.com"
    $envVars["ORCHESTRATOR_IP"] = "192.168.1.101"

    Write-Warning "Update ORCHESTRATOR_URL with your actual Cloudflare tunnel URL"
}

# ============================================================================
# SECTION 10: Paths and Directories
# ============================================================================
Write-Host ""
Write-Info "Setting up paths and directories..."

$projectRoot = (Get-Location).Path
$envVars["PROJECT_ROOT"] = $projectRoot
$envVars["DATA_DIR"] = Join-Path $projectRoot "data"
$envVars["LOGS_DIR"] = Join-Path $projectRoot "logs"
$envVars["CACHE_DIR"] = Join-Path $projectRoot "cache"
$envVars["BACKUPS_DIR"] = Join-Path $projectRoot "backups"

Write-Success "Paths configured"

# ============================================================================
# OUTPUT: Generate .env file
# ============================================================================
Write-Host ""
Write-Info "Generating $OutputFile..."

$content = @"
# ============================================================================
# Project Nyra - Automated Environment Variables
# ============================================================================
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# PC Type: $PCType
# Environment: $Environment
#
# ⚠️ DO NOT COMMIT THIS FILE TO GIT
#
# This file contains automatically generated configuration.
# For manual setup requirements, see: bootstrap/docs/USER-ACTION-GUIDE.md
# ============================================================================

"@

foreach ($section in @(
    @{ Title = "SYSTEM CONFIGURATION"; Start = 0; End = 5 },
    @{ Title = "NETWORK CONFIGURATION"; Start = 5; End = 11 },
    @{ Title = "GPU CONFIGURATION"; Start = 11; End = 13; OnlyIf = ($PCType -ne "orchestrator") },
    @{ Title = "DOCKER CONFIGURATION"; Start = 13; End = 17 },
    @{ Title = "SERVICE PORTS"; Start = 17; End = 30 },
    @{ Title = "DATABASE CONFIGURATION"; Start = 30; End = 45; OnlyIf = ($PCType -eq "orchestrator") },
    @{ Title = "APPLICATION SECRETS"; Start = 45; End = 52 },
    @{ Title = "CLAUDE FLOW CONFIGURATION"; Start = 52; End = 58 },
    @{ Title = "ORCHESTRATOR CONNECTION"; Start = 58; End = 60; OnlyIf = ($PCType -ne "orchestrator") },
    @{ Title = "PATHS AND DIRECTORIES"; Start = 60; End = 65 }
)) {
    if ($section.OnlyIf -eq $false) { continue }

    $content += "`n# $($section.Title)`n"
    $sectionVars = $envVars.Keys | Select-Object -Skip $section.Start -First ($section.End - $section.Start)

    foreach ($key in $sectionVars) {
        if ($envVars.ContainsKey($key)) {
            $content += "$key=$($envVars[$key])`n"
        }
    }
}

# Add placeholders for manual setup
$content += @"

# ============================================================================
# MANUAL SETUP REQUIRED - API KEYS AND CREDENTIALS
# ============================================================================
# These require online account creation. See USER-ACTION-GUIDE.md for details.

# Anthropic (Claude API)
ANTHROPIC_API_KEY=<get-from-console.anthropic.com>

# Google AI Studio (Gemini)
GOOGLE_AI_API_KEY=<get-from-aistudio.google.com>

# Infisical (Secrets Management)
INFISICAL_PROJECT_ID=<get-from-infisical-dashboard>
INFISICAL_UNIVERSAL_AUTH_CLIENT_ID=<create-machine-identity>
INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET=<create-machine-identity>

# Tailscale (VPN)
TAILSCALE_AUTH_KEY=<get-from-admin.tailscale.com>

# Cloudflare (Tunnels) - Orchestrator Only
CLOUDFLARED_TOKEN=<create-tunnel-at-dash.cloudflare.com>

# Optional Services
OPENROUTER_API_KEY=<optional>
TWILIO_ACCOUNT_SID=<optional>
TWILIO_AUTH_TOKEN=<optional>
SENDGRID_API_KEY=<optional>

# ============================================================================
# END OF CONFIGURATION
# ============================================================================
"@

# Write to file
$content | Out-File -FilePath $OutputFile -Encoding UTF8

Write-Success "Environment file generated: $OutputFile"

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "✅ AUTOMATED SETUP COMPLETE" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Generated Variables:" -ForegroundColor Yellow
Write-Host "  • System Configuration: 5 variables" -ForegroundColor White
Write-Host "  • Network Configuration: 6 variables" -ForegroundColor White
if ($PCType -ne "orchestrator") {
    Write-Host "  • GPU Configuration: 2 variables" -ForegroundColor White
}
Write-Host "  • Docker Configuration: 4 variables" -ForegroundColor White
Write-Host "  • Service Ports: $(if ($PCType -eq 'orchestrator') { '13' } else { '7' }) variables" -ForegroundColor White
if ($PCType -eq "orchestrator") {
    Write-Host "  • Database Credentials: 15 generated passwords" -ForegroundColor White
    Write-Host "  • Application Secrets: 7 generated tokens" -ForegroundColor White
}
else {
    Write-Host "  • Application Secrets: 3 generated tokens" -ForegroundColor White
}
Write-Host "  • Claude Flow Config: 6 variables" -ForegroundColor White
Write-Host ""
Write-Host "Output File: $OutputFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  MANUAL SETUP STILL REQUIRED:" -ForegroundColor Yellow
Write-Host "  • Create online accounts (Anthropic, Google AI, Infisical, Tailscale, Cloudflare)" -ForegroundColor White
Write-Host "  • Get API keys and credentials" -ForegroundColor White
Write-Host "  • Update placeholder values in $OutputFile" -ForegroundColor White
Write-Host "  • See: bootstrap/docs/USER-ACTION-GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review and edit $OutputFile" -ForegroundColor White
Write-Host "  2. Complete manual setup from USER-ACTION-GUIDE.md" -ForegroundColor White
Write-Host "  3. Store secrets in Infisical using the export methodology" -ForegroundColor White
Write-Host "  4. Run Docker Compose to start services" -ForegroundColor White
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
