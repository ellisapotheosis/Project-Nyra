#requires -Version 7.0

<#
.SYNOPSIS
    Install WarpProfile for optimized Warp terminal experience
.DESCRIPTION
    One-command installation and setup for WarpProfile PowerShell module
.EXAMPLE
    .\Install-WarpProfile.ps1
#>

[CmdletBinding()]
param(
    [switch]$Force,
    [switch]$SkipThemes,
    [switch]$Quiet
)

function Write-InstallLog {
    param([string]$Message, [string]$Level = 'INFO')
    if (-not $Quiet) {
        switch ($Level) {
            'ERROR' { Write-Host "❌ $Message" -ForegroundColor Red }
            'WARN'  { Write-Host "⚠️  $Message" -ForegroundColor Yellow }
            'SUCCESS' { Write-Host "✅ $Message" -ForegroundColor Green }
            default { Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
        }
    }
}

function Test-Prerequisites {
    Write-InstallLog "Checking prerequisites..."
    
    # Check PowerShell version
    if ($PSVersionTable.PSVersion.Major -lt 7) {
        Write-InstallLog "PowerShell 7+ required, found $($PSVersionTable.PSVersion)" -Level 'ERROR'
        return $false
    }
    
    # Check if in Warp
    $isWarp = ($env:TERM_PROGRAM -eq 'WarpTerminal') -or ($env:WARP_IS_LOCAL_SHELL_SESSION -eq 'true')
    if (-not $isWarp -and -not $Force) {
        Write-InstallLog "Not running in Warp terminal. Use -Force to install anyway." -Level 'WARN'
        return $false
    }
    
    Write-InstallLog "Prerequisites check passed" -Level 'SUCCESS'
    return $true
}

function Install-WarpProfileModule {
    Write-InstallLog "Installing WarpProfile module..."
    
    $modulePath = "$env:USERPROFILE\Documents\PowerShell\Modules\WarpProfile"
    $configPath = "$env:USERPROFILE\.config\warp-powershell"
    
    # Create directories
    @($modulePath, $configPath, "$configPath\themes") | ForEach-Object {
        if (-not (Test-Path $_)) {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
            Write-InstallLog "Created directory: $_"
        }
    }
    
    # Check if module already exists
    if (Test-Path "$modulePath\WarpProfile.psm1") {
        if ($Force) {
            Write-InstallLog "Overwriting existing module..." -Level 'WARN'
        } else {
            Write-InstallLog "Module already exists. Use -Force to overwrite." -Level 'WARN'
            return $false
        }
    }
    
    return $true
}

function Test-WarpProfileInstallation {
    Write-InstallLog "Testing WarpProfile installation..."
    
    try {
        # Try to import the module
        if (Get-Module -ListAvailable -Name WarpProfile -ErrorAction SilentlyContinue) {
            Import-Module WarpProfile -Force -ErrorAction Stop
            
            # Test core functions
            $functions = @('Use-Starship', 'Use-OhMyPosh', 'Use-NativePrompt', 'Test-WarpProfile')
            foreach ($func in $functions) {
                if (-not (Get-Command $func -ErrorAction SilentlyContinue)) {
                    throw "Function $func not available"
                }
            }
            
            # Test configuration paths
            $configPath = "$env:USERPROFILE\.config\warp-powershell"
            if (-not (Test-Path $configPath)) {
                throw "Configuration directory not found: $configPath"
            }
            
            Write-InstallLog "WarpProfile installation test passed" -Level 'SUCCESS'
            return $true
        } else {
            throw "WarpProfile module not found in module path"
        }
    }
    catch {
        Write-InstallLog "Installation test failed: $($_.Exception.Message)" -Level 'ERROR'
        return $false
    }
}

function Show-InstallationSummary {
    Write-InstallLog "`n📋 WarpProfile Installation Summary:" -Level 'SUCCESS'
    Write-Host "   Module Path: $env:USERPROFILE\Documents\PowerShell\Modules\WarpProfile" -ForegroundColor Gray
    Write-Host "   Config Path: $env:USERPROFILE\.config\warp-powershell" -ForegroundColor Gray
    Write-Host "   Themes Path: $env:USERPROFILE\.config\warp-powershell\themes" -ForegroundColor Gray
    
    Write-InstallLog "`n🚀 Quick Start:" -Level 'SUCCESS'
    Write-Host "   1. Restart your Warp terminal" -ForegroundColor White
    Write-Host "   2. Run: Get-WarpPrompt" -ForegroundColor White
    Write-Host "   3. Try: Use-Starship or Use-OhMyPosh" -ForegroundColor White
    Write-Host "   4. Test: Test-WarpProfile" -ForegroundColor White
    
    Write-InstallLog "`n⚡ Available Commands:" -Level 'SUCCESS'
    Write-Host "   Use-Starship      - Switch to Starship prompt" -ForegroundColor White
    Write-Host "   Use-OhMyPosh      - Switch to Oh My Posh prompt" -ForegroundColor White  
    Write-Host "   Use-NativePrompt  - Switch to native PowerShell prompt" -ForegroundColor White
    Write-Host "   Switch-Prompt     - Toggle between Starship and Oh My Posh" -ForegroundColor White
    Write-Host "   Get-WarpPrompt    - Show prompt info and available commands" -ForegroundColor White
    Write-Host "   Test-WarpProfile  - Run diagnostics" -ForegroundColor White
    Write-Host ""
}

# Main installation flow
try {
    if (-not $Quiet) {
        Write-Host "`n⚡ WarpProfile Installer" -ForegroundColor Magenta
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    }
    
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        exit 1
    }
    
    # Install module
    if (-not (Install-WarpProfileModule)) {
        exit 1
    }
    
    Write-InstallLog "WarpProfile module files should already exist from the main setup."
    Write-InstallLog "If they don't exist, please run the main WarpProfile setup first."
    
    # Test installation
    Start-Sleep -Seconds 1
    if (-not (Test-WarpProfileInstallation)) {
        Write-InstallLog "Installation test failed. Please check the module files exist." -Level 'ERROR'
        exit 1
    }
    
    # Show summary
    if (-not $Quiet) {
        Show-InstallationSummary
    }
    
    Write-InstallLog "WarpProfile installation completed successfully!" -Level 'SUCCESS'
}
catch {
    Write-InstallLog "Installation failed: $($_.Exception.Message)" -Level 'ERROR'
    exit 1
}