[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('local-dev', 'docker-dev', 'staging', 'production')]
    [string]$Environment = 'local-dev',
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('memory', 'development', 'security', 'archon', 'full')]
    [string[]]$Profiles = @('memory'),
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipSecrets,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipHealthCheck,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Project NYRA Ecosystem Orchestrator
# Integrates Bootstrap v2.1 secrets management with unified MetaMCP configuration
# Generated: 2025-10-17T15:25:00Z

$ErrorActionPreference = "Stop"

# Colors for output
$ColorSuccess = "Green"
$ColorWarning = "Yellow" 
$ColorError = "Red"
$ColorInfo = "Cyan"

function Write-Status {
    param([string]$Message, [string]$Color = "White")
    Write-Host "🚀 [NYRA] $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Status $Message $ColorSuccess
}

function Write-Warning {
    param([string]$Message)
    Write-Status $Message $ColorWarning
}

function Write-Error {
    param([string]$Message)
    Write-Status $Message $ColorError
}

function Write-Info {
    param([string]$Message)
    Write-Status $Message $ColorInfo
}

Write-Info "Project NYRA Ecosystem Orchestrator v2.0"
Write-Info "Environment: $Environment | Profiles: $($Profiles -join ', ')"
Write-Host ""

# Check prerequisites
Write-Status "Checking prerequisites..."

# Verify Docker is running
try {
    $dockerInfo = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Success "Docker is running"
} catch {
    Write-Error "Docker is required but not running. Please start Docker Desktop."
    exit 1
}

# Verify required directories exist
$requiredDirs = @(
    "config-consolidated\metamcp",
    "config-consolidated\environments", 
    "infra\docker"
)

foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) {
        Write-Error "Required directory missing: $dir"
        exit 1
    }
}

Write-Success "All prerequisites met"

# Import Bootstrap v2.1 Secret Management
Write-Status "Loading Bootstrap v2.1 secret management..."

try {
    $secretVaultPath = "config-consolidated\environments\scripts\secret-vault.psm1"
    if (Test-Path $secretVaultPath) {
        Import-Module $secretVaultPath -Force
        Write-Success "Secret vault module loaded"
    } else {
        Write-Warning "Secret vault module not found - secrets will not be available"
    }
} catch {
    Write-Warning "Failed to load secret vault: $($_.Exception.Message)"
}

# Secret resolution function (from Bootstrap v2.1)
function Get-SecretValue {
    param([string]$Name)
    
    # Try Credential Manager first
    try {
        if (Get-Command Get-StoredCredential -ErrorAction SilentlyContinue) {
            $cred = Get-StoredCredential -Target $Name -ErrorAction SilentlyContinue
            if ($cred) {
                $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($cred.Password)
                try {
                    $value = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
                    Write-Verbose "Secret '$Name' resolved from Credential Manager"
                    return $value
                }
                finally {
                    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
                }
            }
        }
    } catch {
        Write-Verbose "Credential Manager lookup failed for '$Name': $($_.Exception.Message)"
    }
    
    # Try DPAPI Vault
    try {
        if (Get-Command Get-SecretVaultValue -ErrorAction SilentlyContinue) {
            $value = Get-SecretVaultValue -Name $Name
            if ($value) {
                Write-Verbose "Secret '$Name' resolved from DPAPI Vault"
                return $value
            }
        }
    } catch {
        Write-Verbose "DPAPI Vault lookup failed for '$Name': $($_.Exception.Message)"
    }
    
    # Try environment variable
    $envValue = [Environment]::GetEnvironmentVariable($Name)
    if ($envValue) {
        Write-Verbose "Secret '$Name' resolved from environment variable"
        return $envValue
    }
    
    Write-Verbose "Secret '$Name' not found in any source"
    return $null
}

# Setup environment variables
Write-Status "Setting up environment configuration..."

# Base environment variables
$envVars = @{
    'NYRA_ENVIRONMENT' = $Environment
    'NYRA_PROFILES' = ($Profiles -join ',')
    'COMPOSE_PROJECT_NAME' = 'nyra'
    'COMPOSE_FILE' = 'infra\docker\docker-compose.yml'
}

# Load secrets if not skipped
if (-not $SkipSecrets) {
    Write-Status "Loading secrets..."
    
    $secretNames = @(
        'GITHUB_TOKEN',
        'INFISICAL_PROJECT_ID', 
        'INFISICAL_UNIVERSAL_AUTH_CLIENT_ID',
        'INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET',
        'ANTHROPIC_API_KEY',
        'OPENAI_API_KEY',
        'NOTION_TOKEN'
    )
    
    foreach ($secretName in $secretNames) {
        $secretValue = Get-SecretValue $secretName
        if ($secretValue) {
            $envVars[$secretName] = $secretValue
            Write-Success "Loaded secret: $secretName"
        } else {
            Write-Warning "Secret not found: $secretName"
        }
    }
} else {
    Write-Warning "Skipping secret loading"
}

# Set environment variables
foreach ($key in $envVars.Keys) {
    [Environment]::SetEnvironmentVariable($key, $envVars[$key], 'Process')
}

# Build Docker Compose command
Write-Status "Building Docker Compose configuration..."

$composeArgs = @('up', '-d')

# Add profiles
foreach ($profile in $Profiles) {
    $composeArgs += '--profile'
    $composeArgs += $profile
}

# Add environment-specific override if exists
$overrideFile = "config-consolidated\environments\$Environment\docker-compose.override.yml"
if (Test-Path $overrideFile) {
    $composeArgs = @('-f', 'infra\docker\docker-compose.yml', '-f', $overrideFile) + $composeArgs
    Write-Success "Using environment override: $overrideFile"
}

Write-Info "Docker Compose command: docker-compose $($composeArgs -join ' ')"

# Start services
Write-Status "Starting Project NYRA services..."
Write-Host ""

try {
    Set-Location "." # Ensure we're in the right directory
    
    # Start services
    & docker-compose @composeArgs
    
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose failed with exit code $LASTEXITCODE"
    }
    
    Write-Success "Services started successfully!"
    
} catch {
    Write-Error "Failed to start services: $($_.Exception.Message)"
    exit 1
}

# Health check
if (-not $SkipHealthCheck) {
    Write-Status "Performing health checks..."
    Start-Sleep -Seconds 10
    
    $services = docker-compose ps --services --filter "status=running"
    $healthyServices = @()
    $unhealthyServices = @()
    
    foreach ($service in $services) {
        try {
            $status = docker-compose ps $service --format "table {{.Health}}" | Select-Object -Skip 1
            if ($status -like "*healthy*" -or $status -like "*up*") {
                $healthyServices += $service
                Write-Success "✓ $service - healthy"
            } else {
                $unhealthyServices += $service
                Write-Warning "⚠ $service - $status"
            }
        } catch {
            $unhealthyServices += $service
            Write-Warning "⚠ $service - could not check health"
        }
    }
    
    Write-Host ""
    Write-Info "Health Check Summary:"
    Write-Success "Healthy services: $($healthyServices.Count)"
    if ($unhealthyServices.Count -gt 0) {
        Write-Warning "Services needing attention: $($unhealthyServices.Count)"
        Write-Warning "Unhealthy: $($unhealthyServices -join ', ')"
    }
}

# Service URLs
Write-Host ""
Write-Info "🌟 Project NYRA Services Ready!"
Write-Info "📊 Service URLs:"
Write-Host "  🔧 MetaMCP Proxy:     http://localhost:12008" -ForegroundColor Cyan
Write-Host "  🧠 Vector Memory:     http://localhost:8066" -ForegroundColor Cyan
Write-Host "  📊 Knowledge Graph:   http://localhost:8000" -ForegroundColor Cyan
Write-Host "  💾 Memory Bus:        http://localhost:8765/mcp/nyra/sse/nyra" -ForegroundColor Cyan

if ($Profiles -contains 'development' -or $Profiles -contains 'full') {
    Write-Host "  🐙 GitHub MCP:        http://localhost:3876" -ForegroundColor Yellow
}

if ($Profiles -contains 'security' -or $Profiles -contains 'full') {
    Write-Host "  🔐 Infisical MCP:     http://localhost:3877" -ForegroundColor Yellow
}

if ($Profiles -contains 'archon' -or $Profiles -contains 'full') {
    Write-Host "  🎭 Archon:            http://localhost:4000" -ForegroundColor Yellow
}

Write-Host "  💼 NYRA CRM:          http://localhost:3000" -ForegroundColor Green
Write-Host "  🏠 Mortgage Services: http://localhost:3001" -ForegroundColor Green
Write-Host "  🎤 Voice Service:     http://localhost:8080" -ForegroundColor Green

Write-Host ""
Write-Success "🚀 Project NYRA Ecosystem is running!"
Write-Info "Use 'docker-compose logs -f' to view service logs"
Write-Info "Use 'docker-compose down' to stop all services"
Write-Host ""

# Show next steps
Write-Info "🎯 Next Steps:"
Write-Host "  1. Test MetaMCP channels: http://localhost:12008/metamcp/nyra-core/sse" -ForegroundColor White
Write-Host "  2. Configure Claude Desktop to use MetaMCP endpoints" -ForegroundColor White
Write-Host "  3. Run Infisical MCP: .\config-consolidated\environments\scripts\run-infisical-mcp.ps1" -ForegroundColor White
Write-Host ""