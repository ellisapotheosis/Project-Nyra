<#
.SYNOPSIS
    Install Project Nyra prerequisites using winget
.DESCRIPTION
    Automated installation of core tools required for Project Nyra 4-PC cluster:
    - Git, Node.js LTS, Docker Desktop
    - Cloudflare cloudflared, Tailscale
    - PowerShell 7 (optional)
.PARAMETER SkipDocker
    Skip Docker Desktop installation (if already installed)
.PARAMETER SkipNodeJS
    Skip Node.js installation (if already installed)
.PARAMETER Silent
    Run in silent mode with minimal output
.EXAMPLE
    .\Install-Prerequisites.ps1
.EXAMPLE
    .\Install-Prerequisites.ps1 -SkipDocker -Silent
#>

param(
    [switch]$SkipDocker,
    [switch]$SkipNodeJS,
    [switch]$Silent
)

$ErrorActionPreference = "Continue"

# Color output functions
function Write-Status($message) {
    if (-not $Silent) {
        Write-Host "[NYRA] $message" -ForegroundColor Cyan
    }
}

function Write-Success($message) {
    if (-not $Silent) {
        Write-Host "[✓] $message" -ForegroundColor Green
    }
}

function Write-Failure($message) {
    Write-Host "[✗] $message" -ForegroundColor Red
}

function Write-Warning($message) {
    if (-not $Silent) {
        Write-Host "[!] $message" -ForegroundColor Yellow
    }
}

# Check if winget is available
function Test-Winget {
    Write-Status "Checking for winget..."
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if (-not $winget) {
        Write-Failure "winget not found. Please install 'App Installer' from Microsoft Store."
        Write-Host "URL: ms-windows-store://pdp/?ProductId=9NBLGGH4NNS1"
        return $false
    }
    Write-Success "winget found"
    return $true
}

# Check if a package is already installed
function Test-Package($packageId) {
    $result = winget list --id $packageId --exact 2>$null
    return $LASTEXITCODE -eq 0
}

# Install a package with winget
function Install-Package {
    param(
        [string]$PackageId,
        [string]$Name,
        [switch]$Optional
    )
    
    Write-Status "Installing $Name..."
    
    # Check if already installed
    if (Test-Package $PackageId) {
        Write-Success "$Name is already installed"
        return $true
    }
    
    # Install the package
    $installArgs = @(
        "install",
        "--id", $PackageId,
        "-e",
        "--silent",
        "--accept-package-agreements",
        "--accept-source-agreements"
    )
    
    $result = & winget @installArgs 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "$Name installed successfully"
        return $true
    } else {
        if ($Optional) {
            Write-Warning "$Name installation failed (optional)"
            return $true
        } else {
            Write-Failure "$Name installation failed"
            if (-not $Silent) {
                Write-Host "Error output: $result"
            }
            return $false
        }
    }
}

# Main installation process
function Install-Prerequisites {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Project Nyra - Prerequisites Installer" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Check winget availability
    if (-not (Test-Winget)) {
        return $false
    }
    
    $packages = @(
        @{ Id = "Git.Git"; Name = "Git"; Optional = $false; Skip = $false },
        @{ Id = "OpenJS.NodeJS.LTS"; Name = "Node.js LTS"; Optional = $false; Skip = $SkipNodeJS },
        @{ Id = "Docker.DockerDesktop"; Name = "Docker Desktop"; Optional = $false; Skip = $SkipDocker },
        @{ Id = "Cloudflare.cloudflared"; Name = "Cloudflare cloudflared"; Optional = $false; Skip = $false },
        @{ Id = "Tailscale.Tailscale"; Name = "Tailscale"; Optional = $false; Skip = $false },
        @{ Id = "Microsoft.PowerShell"; Name = "PowerShell 7"; Optional = $true; Skip = $false }
    )
    
    $totalPackages = ($packages | Where-Object { -not $_.Skip }).Count
    $currentPackage = 0
    $failed = @()
    
    foreach ($package in $packages) {
        if ($package.Skip) {
            Write-Status "Skipping $($package.Name) (per user request)"
            continue
        }
        
        $currentPackage++
        Write-Status "[$currentPackage/$totalPackages] Processing $($package.Name)..."
        
        $success = Install-Package -PackageId $package.Id -Name $package.Name -Optional:$package.Optional
        
        if (-not $success -and -not $package.Optional) {
            $failed += $package.Name
        }
        
        Write-Host ""
    }
    
    # Summary
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Installation Summary" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    if ($failed.Count -eq 0) {
        Write-Success "All prerequisites installed successfully!"
    } else {
        Write-Failure "Some installations failed:"
        foreach ($name in $failed) {
            Write-Host "  - $name" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Warning "IMPORTANT: Reboot may be required for Docker Desktop and WSL2"
    Write-Host ""
    
    return ($failed.Count -eq 0)
}

# Run installation
$success = Install-Prerequisites

# Return exit code
if ($success) {
    exit 0
} else {
    exit 1
}
