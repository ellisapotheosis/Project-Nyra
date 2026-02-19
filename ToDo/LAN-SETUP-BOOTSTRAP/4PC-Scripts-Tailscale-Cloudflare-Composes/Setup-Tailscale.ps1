<#
.SYNOPSIS
    Setup Tailscale VPN for Project Nyra cluster
.DESCRIPTION
    Automated Tailscale installation and configuration for 4-PC mesh network.
    Supports auth key authentication or interactive login.
.PARAMETER Hostname
    Hostname for this machine in Tailscale network (e.g., orchestrator-mini, worker-rtx3060)
.PARAMETER AuthKey
    Tailscale auth key for automated join (use Infisical for secure storage)
.PARAMETER SkipInstall
    Skip installation if Tailscale is already installed
.EXAMPLE
    .\Setup-Tailscale.ps1 -Hostname "orchestrator-mini"
.EXAMPLE
    .\Setup-Tailscale.ps1 -Hostname "worker-rtx3060" -AuthKey "tskey-auth-xxxxx"
.EXAMPLE
    .\Setup-Tailscale.ps1 -Hostname "worker-rtx3090ti" -AuthKey $env:TAILSCALE_AUTH_KEY
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Hostname = "",
    
    [Parameter(Mandatory=$false)]
    [string]$AuthKey = "",
    
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

# Color output functions
function Write-Status($message) {
    Write-Host "[NYRA/Tailscale] $message" -ForegroundColor Cyan
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

# Check if Tailscale is installed
function Test-TailscaleInstalled {
    $tailscale = Get-Command tailscale -ErrorAction SilentlyContinue
    return $null -ne $tailscale
}

# Install Tailscale via winget
function Install-Tailscale {
    Write-Status "Installing Tailscale via winget..."
    
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if (-not $winget) {
        Write-Failure "winget not found. Please install 'App Installer' from Microsoft Store."
        return $false
    }
    
    try {
        $result = winget install --id Tailscale.Tailscale -e --accept-source-agreements --accept-package-agreements --silent
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Tailscale installed successfully"
            
            # Refresh PATH to include Tailscale
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            return $true
        } else {
            Write-Failure "Tailscale installation failed"
            return $false
        }
    } catch {
        Write-Failure "Error installing Tailscale: $_"
        return $false
    }
}

# Join Tailscale network
function Join-TailscaleNetwork {
    param(
        [string]$Hostname,
        [string]$AuthKey
    )
    
    Write-Status "Joining Tailscale network..."
    
    $upArgs = @("up")
    
    # Add auth key if provided
    if ($AuthKey -ne "") {
        Write-Warning "Using auth key. NOTE: Auth keys can appear in shell history."
        Write-Warning "Consider using Infisical or environment variables for secure storage."
        $upArgs += "--auth-key"
        $upArgs += $AuthKey
    }
    
    # Add hostname if provided
    if ($Hostname -ne "") {
        Write-Status "Setting hostname to: $Hostname"
        $upArgs += "--hostname"
        $upArgs += $Hostname
    }
    
    try {
        if ($AuthKey -eq "") {
            Write-Status "No auth key provided. Running interactive login..."
            Write-Status "A browser window will open for authentication."
        }
        
        $result = & tailscale @upArgs
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Successfully joined Tailscale network"
            return $true
        } else {
            Write-Failure "Failed to join Tailscale network"
            Write-Host "Output: $result"
            return $false
        }
    } catch {
        Write-Failure "Error joining Tailscale: $_"
        return $false
    }
}

# Get Tailscale status
function Get-TailscaleStatus {
    Write-Status "Tailscale network status:"
    Write-Host ""
    
    try {
        & tailscale status
        Write-Host ""
        
        $ip = & tailscale ip -4 2>$null
        if ($ip) {
            Write-Success "Tailscale IPv4: $ip"
        }
        
        return $true
    } catch {
        Write-Failure "Error getting Tailscale status: $_"
        return $false
    }
}

# Main setup process
function Setup-Tailscale {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Project Nyra - Tailscale Setup" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Check if already installed
    $isInstalled = Test-TailscaleInstalled
    
    if ($isInstalled) {
        Write-Success "Tailscale is already installed"
    } else {
        if ($SkipInstall) {
            Write-Failure "Tailscale not installed and -SkipInstall specified"
            return $false
        }
        
        $installed = Install-Tailscale
        if (-not $installed) {
            return $false
        }
        
        # Verify installation
        Start-Sleep -Seconds 2
        if (-not (Test-TailscaleInstalled)) {
            Write-Failure "Tailscale installation verification failed"
            Write-Warning "You may need to restart your terminal or computer"
            return $false
        }
    }
    
    Write-Host ""
    
    # Join network
    $joined = Join-TailscaleNetwork -Hostname $Hostname -AuthKey $AuthKey
    if (-not $joined) {
        return $false
    }
    
    Write-Host ""
    
    # Show status
    Get-TailscaleStatus
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Tailscale Setup Complete" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Success "Tailscale is configured and connected"
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Verify connectivity: tailscale ping <other-machine>" -ForegroundColor Gray
    Write-Host "  2. Check status: tailscale status" -ForegroundColor Gray
    Write-Host "  3. View IP: tailscale ip" -ForegroundColor Gray
    Write-Host ""
    
    return $true
}

# Run setup
try {
    $success = Setup-Tailscale
    
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
