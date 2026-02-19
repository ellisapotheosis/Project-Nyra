<#
.SYNOPSIS
    Setup Cloudflare Tunnel for Project Nyra cluster
.DESCRIPTION
    Consolidated script to setup Cloudflare tunnels for orchestrator or worker PCs.
    Supports multiple service routing and automated DNS configuration.
    
    Consolidates functionality from:
    - distributed-setup/02-cloudflared-setup.sh
    - cloudflared/setup-orchestrator-tunnel.sh
    - cloudflared/setup-worker-tunnel.sh
.PARAMETER Role
    PC role: orchestrator, worker-rtx3060, worker-rtx3090ti, worker-rtx5090
.PARAMETER Domain
    Your domain name (e.g., nyra.yourdomain.com)
.PARAMETER TunnelName
    Custom tunnel name (default: nyra-<role>)
.PARAMETER SkipInstall
    Skip cloudflared installation if already installed
.PARAMETER SkipDNS
    Skip DNS routing configuration
.EXAMPLE
    .\Setup-CloudflareTunnel.ps1 -Role orchestrator -Domain nyra.example.com
.EXAMPLE
    .\Setup-CloudflareTunnel.ps1 -Role worker-rtx3060 -Domain nyra.example.com -TunnelName nyra-worker-1
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("orchestrator", "worker-rtx3060", "worker-rtx3090ti", "worker-rtx5090")]
    [string]$Role,
    
    [Parameter(Mandatory=$true)]
    [string]$Domain,
    
    [Parameter(Mandatory=$false)]
    [string]$TunnelName = "",
    
    [switch]$SkipInstall,
    [switch]$SkipDNS
)

$ErrorActionPreference = "Stop"

# Set default tunnel name if not provided
if ([string]::IsNullOrEmpty($TunnelName)) {
    $TunnelName = "nyra-$Role"
}

# Configuration paths
$CloudflaredDir = "$env:USERPROFILE\.cloudflared"
$ConfigPath = "$CloudflaredDir\config.yml"

# Service port mappings by role
$ServiceMappings = @{
    orchestrator = @{
        "api" = "http://localhost:3000"
        "quote-api" = "http://localhost:8001"
        "admin-api" = "http://localhost:8002"
        "grafana" = "http://localhost:3003"
        "prometheus" = "http://localhost:9090"
        "loki" = "http://localhost:3100"
        "jaeger" = "http://localhost:16686"
        "secrets" = "http://localhost:8080"
        "nexus" = "http://localhost:8888"
        "claude-flow" = "http://localhost:8081"
        "pgadmin" = "http://localhost:5050"
        "redis" = "http://localhost:8082"
        "ratehunter" = "http://localhost:3001"
        "admin" = "http://localhost:3002"
        "crm" = "http://localhost:3004"
        "mcp" = "http://localhost:8090"
    }
    "worker-rtx3060" = @{
        "ollama" = "http://localhost:11434"
        "worker-api" = "http://localhost:8000"
    }
    "worker-rtx3090ti" = @{
        "ollama" = "http://localhost:11434"
        "worker-api" = "http://localhost:8000"
    }
    "worker-rtx5090" = @{
        "ollama" = "http://localhost:11434"
        "worker-api" = "http://localhost:8000"
    }
}

# Color output functions
function Write-Status($message) {
    Write-Host "[Cloudflare] $message" -ForegroundColor Cyan
}

function Write-Success($message) {
    Write-Host "[✓] $message" -ForegroundColor Green
}

function Write-Failure($message) {
    Write-Host "[✗] $message" -ForegroundColor Red
}

function Write-Warning($message) {
    Write-Host "[!] $message" -ForegroundColor Yellow
}

# Check if cloudflared is installed
function Test-CloudflaredInstalled {
    $cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
    return $null -ne $cloudflared
}

# Install cloudflared
function Install-Cloudflared {
    Write-Status "Installing cloudflared via winget..."
    
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if (-not $winget) {
        Write-Failure "winget not found. Please install 'App Installer' from Microsoft Store."
        return $false
    }
    
    try {
        $result = winget install --id Cloudflare.cloudflared -e --accept-source-agreements --accept-package-agreements --silent
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "cloudflared installed successfully"
            
            # Refresh PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            return $true
        } else {
            Write-Failure "cloudflared installation failed"
            return $false
        }
    } catch {
        Write-Failure "Error installing cloudflared: $_"
        return $false
    }
}

# Authenticate with Cloudflare
function Invoke-CloudflareAuth {
    Write-Status "Authenticating with Cloudflare..."
    Write-Warning "A browser window will open. Please log in to your Cloudflare account."
    Write-Host ""
    Read-Host "Press Enter to continue"
    
    try {
        & cloudflared tunnel login
        
        if (Test-Path "$CloudflaredDir\cert.pem") {
            Write-Success "Authentication successful"
            return $true
        } else {
            Write-Failure "Authentication failed. cert.pem not found."
            return $false
        }
    } catch {
        Write-Failure "Error during authentication: $_"
        return $false
    }
}

# Create tunnel
function New-CloudflareTunnel {
    param([string]$Name)
    
    Write-Status "Creating tunnel: $Name"
    
    try {
        # Check if tunnel exists
        $existingTunnels = & cloudflared tunnel list 2>&1 | Out-String
        
        if ($existingTunnels -match $Name) {
            Write-Warning "Tunnel '$Name' already exists"
            $tunnelId = ($existingTunnels -split "`n" | Where-Object { $_ -match $Name } | Select-Object -First 1) -split '\s+' | Select-Object -First 1
            return $tunnelId
        }
        
        # Create new tunnel
        & cloudflared tunnel create $Name
        
        if ($LASTEXITCODE -eq 0) {
            $tunnels = & cloudflared tunnel list
            $tunnelId = ($tunnels -split "`n" | Where-Object { $_ -match $Name } | Select-Object -First 1) -split '\s+' | Select-Object -First 1
            Write-Success "Tunnel created: $tunnelId"
            return $tunnelId
        } else {
            Write-Failure "Failed to create tunnel"
            return $null
        }
    } catch {
        Write-Failure "Error creating tunnel: $_"
        return $null
    }
}

# Generate config file
function New-TunnelConfig {
    param(
        [string]$TunnelId,
        [string]$TunnelName,
        [string]$Role,
        [string]$Domain
    )
    
    Write-Status "Generating tunnel configuration..."
    
    # Find credentials file
    $credsFile = Get-ChildItem -Path $CloudflaredDir -Filter "$TunnelId.json" -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if (-not $credsFile) {
        Write-Failure "Tunnel credentials not found"
        return $false
    }
    
    $credsPath = $credsFile.FullName
    
    # Get service mappings for this role
    $services = $ServiceMappings[$Role]
    
    # Build ingress rules
    $ingressRules = @()
    foreach ($service in $services.Keys) {
        $hostname = "$service.$Domain"
        $serviceUrl = $services[$service]
        
        $ingressRules += @"
  - hostname: $hostname
    service: $serviceUrl
"@
    }
    
    # Create config content
    $configContent = @"
tunnel: $TunnelId
credentials-file: $credsPath

# Metrics endpoint
metrics: 127.0.0.1:2000

# Ingress rules for $Role
ingress:
$($ingressRules -join "`n")

  # Catch-all rule (required)
  - service: http_status:404
"@
    
    try {
        $configContent | Out-File -FilePath $ConfigPath -Encoding UTF8
        Write-Success "Configuration created: $ConfigPath"
        return $true
    } catch {
        Write-Failure "Error creating config file: $_"
        return $false
    }
}

# Route DNS
function Set-TunnelDNS {
    param(
        [string]$TunnelName,
        [string]$Role,
        [string]$Domain
    )
    
    Write-Status "Configuring DNS routes..."
    
    $services = $ServiceMappings[$Role]
    $successCount = 0
    $failCount = 0
    
    foreach ($service in $services.Keys) {
        $hostname = "$service.$Domain"
        Write-Status "Routing: $hostname"
        
        try {
            & cloudflared tunnel route dns $TunnelName $hostname 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                $successCount++
            } else {
                Write-Warning "Failed to route $hostname (may already exist)"
                $failCount++
            }
        } catch {
            Write-Warning "Error routing $hostname : $_"
            $failCount++
        }
    }
    
    Write-Success "DNS routing complete: $successCount successful, $failCount skipped"
    return $true
}

# Install as Windows service
function Install-CloudflaredService {
    param(
        [string]$TunnelName,
        [string]$ConfigPath
    )
    
    Write-Status "Installing cloudflared as Windows service..."
    
    try {
        & cloudflared service install
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Service installed"
            
            # Start service
            Start-Service cloudflared
            Start-Sleep -Seconds 3
            
            $service = Get-Service cloudflared -ErrorAction SilentlyContinue
            if ($service -and $service.Status -eq 'Running') {
                Write-Success "Service is running"
                return $true
            } else {
                Write-Warning "Service installed but not running. Start manually: Start-Service cloudflared"
                return $true
            }
        } else {
            Write-Failure "Service installation failed"
            return $false
        }
    } catch {
        Write-Failure "Error installing service: $_"
        return $false
    }
}

# Main setup function
function Setup-CloudflareTunnel {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Project Nyra - Cloudflare Tunnel Setup" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Configuration:" -ForegroundColor Yellow
    Write-Host "  - Role: $Role" -ForegroundColor Gray
    Write-Host "  - Domain: $Domain" -ForegroundColor Gray
    Write-Host "  - Tunnel Name: $TunnelName" -ForegroundColor Gray
    Write-Host ""
    
    # Step 1: Install cloudflared
    if (-not $SkipInstall) {
        $isInstalled = Test-CloudflaredInstalled
        
        if (-not $isInstalled) {
            $installed = Install-Cloudflared
            if (-not $installed) {
                return $false
            }
            
            Start-Sleep -Seconds 2
            if (-not (Test-CloudflaredInstalled)) {
                Write-Failure "Installation verification failed"
                return $false
            }
        } else {
            Write-Success "cloudflared is already installed"
        }
    }
    
    Write-Host ""
    
    # Step 2: Authenticate
    if (-not (Test-Path "$CloudflaredDir\cert.pem")) {
        $authed = Invoke-CloudflareAuth
        if (-not $authed) {
            return $false
        }
    } else {
        Write-Success "Already authenticated"
    }
    
    Write-Host ""
    
    # Step 3: Create tunnel
    $tunnelId = New-CloudflareTunnel -Name $TunnelName
    if (-not $tunnelId) {
        return $false
    }
    
    Write-Host ""
    
    # Step 4: Generate config
    $configCreated = New-TunnelConfig -TunnelId $tunnelId -TunnelName $TunnelName -Role $Role -Domain $Domain
    if (-not $configCreated) {
        return $false
    }
    
    Write-Host ""
    
    # Step 5: Route DNS
    if (-not $SkipDNS) {
        $dnsRouted = Set-TunnelDNS -TunnelName $TunnelName -Role $Role -Domain $Domain
        if (-not $dnsRouted) {
            Write-Warning "DNS routing failed but continuing..."
        }
    } else {
        Write-Status "Skipping DNS routing (per user request)"
    }
    
    Write-Host ""
    
    # Step 6: Install service
    $serviceInstalled = Install-CloudflaredService -TunnelName $TunnelName -ConfigPath $ConfigPath
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Setup Complete!" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Tunnel Information:" -ForegroundColor Yellow
    Write-Host "  - Tunnel ID: $tunnelId" -ForegroundColor Gray
    Write-Host "  - Tunnel Name: $TunnelName" -ForegroundColor Gray
    Write-Host "  - Config: $ConfigPath" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Service URLs:" -ForegroundColor Yellow
    $services = $ServiceMappings[$Role]
    foreach ($service in $services.Keys) {
        Write-Host "  - https://$service.$Domain" -ForegroundColor Gray
    }
    Write-Host ""
    
    Write-Host "Useful Commands:" -ForegroundColor Yellow
    Write-Host "  - Status: Get-Service cloudflared | Select-Object Status,Name" -ForegroundColor Gray
    Write-Host "  - Restart: Restart-Service cloudflared" -ForegroundColor Gray
    Write-Host "  - Logs: Get-EventLog -LogName Application -Source cloudflared" -ForegroundColor Gray
    Write-Host "  - List tunnels: cloudflared tunnel list" -ForegroundColor Gray
    Write-Host "  - Tunnel info: cloudflared tunnel info $TunnelName" -ForegroundColor Gray
    Write-Host "  - Metrics: http://localhost:2000/metrics" -ForegroundColor Gray
    Write-Host ""
    
    Write-Warning "IMPORTANT: Configure Cloudflare Access before exposing admin services!"
    Write-Host ""
    
    return $true
}

# Run setup
try {
    $success = Setup-CloudflareTunnel
    
    if ($success) {
        exit 0
    } else {
        exit 1
    }
} catch {
    Write-Failure "Unexpected error: $_"
    Write-Host $_.ScriptStackTrace
    exit 1
}
