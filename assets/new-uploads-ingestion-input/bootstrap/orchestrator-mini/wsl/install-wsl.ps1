#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Install and configure WSL for Project-Nyra orchestrator-mini PC
.DESCRIPTION
    Comprehensive WSL installation script that:
    - Checks Windows version and prerequisites
    - Enables WSL and Virtual Machine Platform features
    - Installs Ubuntu 22.04 LTS
    - Configures systemd and default user
    - Applies resource limits and networking
.NOTES
    Author: Project-Nyra Team
    Version: 1.0.0
#>

# Error handling
$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# Configuration
$WSL_DISTRO = "Ubuntu-22.04"
$WSL_USER = "nyra"
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$LOG_FILE = "$SCRIPT_DIR\install-wsl.log"

# Logging function
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    Add-Content -Path $LOG_FILE -Value $logMessage
}

# Check Windows version
function Test-WindowsVersion {
    Write-Log "Checking Windows version..."
    $os = Get-CimInstance Win32_OperatingSystem
    $version = [System.Version]$os.Version

    # WSL 2 requires Windows 10 version 1903 or higher, or Windows 11
    if ($version.Major -lt 10 -or ($version.Major -eq 10 -and $version.Build -lt 18362)) {
        Write-Log "ERROR: Windows 10 version 1903 (build 18362) or higher is required" "ERROR"
        exit 1
    }

    Write-Log "Windows version: $($os.Caption) (Build $($version.Build))"
    return $true
}

# Check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Enable Windows features
function Enable-WSLFeatures {
    Write-Log "Enabling WSL and Virtual Machine Platform features..."

    try {
        # Check if features are already enabled
        $wslFeature = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
        $vmFeature = Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform

        $needsReboot = $false

        if ($wslFeature.State -ne "Enabled") {
            Write-Log "Enabling Windows Subsystem for Linux..."
            Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -NoRestart
            $needsReboot = $true
        } else {
            Write-Log "WSL feature already enabled"
        }

        if ($vmFeature.State -ne "Enabled") {
            Write-Log "Enabling Virtual Machine Platform..."
            Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart
            $needsReboot = $true
        } else {
            Write-Log "Virtual Machine Platform already enabled"
        }

        if ($needsReboot) {
            Write-Log "Features enabled. REBOOT REQUIRED!" "WARN"
            Write-Log "After reboot, run this script again to continue installation"
            $response = Read-Host "Reboot now? (Y/N)"
            if ($response -eq "Y" -or $response -eq "y") {
                Restart-Computer -Force
            }
            exit 0
        }

        return $true
    } catch {
        Write-Log "Failed to enable features: $_" "ERROR"
        return $false
    }
}

# Update WSL kernel
function Update-WSLKernel {
    Write-Log "Updating WSL kernel..."

    try {
        # Download and install WSL kernel update
        $kernelUrl = "https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi"
        $kernelPath = "$env:TEMP\wsl_update_x64.msi"

        if (!(Test-Path $kernelPath)) {
            Write-Log "Downloading WSL kernel update..."
            Invoke-WebRequest -Uri $kernelUrl -OutFile $kernelPath -UseBasicParsing
        }

        Write-Log "Installing WSL kernel update..."
        Start-Process msiexec.exe -Wait -ArgumentList "/i `"$kernelPath`" /quiet /norestart"

        # Set WSL 2 as default
        wsl --set-default-version 2

        Write-Log "WSL kernel updated successfully"
        return $true
    } catch {
        Write-Log "Failed to update WSL kernel: $_" "ERROR"
        return $false
    }
}

# Install Ubuntu distribution
function Install-Ubuntu {
    Write-Log "Installing Ubuntu 22.04 LTS..."

    try {
        # Check if already installed
        $existing = wsl --list --quiet | Where-Object { $_ -match $WSL_DISTRO }
        if ($existing) {
            Write-Log "Ubuntu 22.04 already installed"
            $response = Read-Host "Reinstall? This will DELETE existing installation! (yes/no)"
            if ($response -eq "yes") {
                Write-Log "Unregistering existing installation..."
                wsl --unregister $WSL_DISTRO
            } else {
                Write-Log "Skipping installation"
                return $true
            }
        }

        # Install from Microsoft Store or download
        Write-Log "Installing from Microsoft Store..."
        wsl --install -d Ubuntu-22.04

        Write-Log "Waiting for Ubuntu installation to complete..."
        Start-Sleep -Seconds 5

        # Wait for WSL to be ready
        $maxAttempts = 30
        $attempt = 0
        while ($attempt -lt $maxAttempts) {
            try {
                $distros = wsl --list --quiet
                if ($distros -match "Ubuntu-22.04") {
                    Write-Log "Ubuntu installation completed"
                    return $true
                }
            } catch {}

            Start-Sleep -Seconds 2
            $attempt++
        }

        Write-Log "Ubuntu installation timed out" "ERROR"
        return $false
    } catch {
        Write-Log "Failed to install Ubuntu: $_" "ERROR"
        return $false
    }
}

# Configure WSL distribution
function Configure-WSL {
    Write-Log "Configuring WSL distribution..."

    try {
        # Copy .wslconfig to user profile
        $wslConfigSource = "$SCRIPT_DIR\.wslconfig"
        $wslConfigDest = "$env:USERPROFILE\.wslconfig"

        if (Test-Path $wslConfigSource) {
            Write-Log "Copying .wslconfig to $wslConfigDest"
            Copy-Item -Path $wslConfigSource -Destination $wslConfigDest -Force
        } else {
            Write-Log ".wslconfig not found, creating default configuration"
            $defaultConfig = @"
[wsl2]
memory=16GB
processors=8
swap=8GB
localhostForwarding=true

[experimental]
autoMemoryReclaim=gradual
networkingMode=mirrored
dnsTunneling=true
firewall=true
"@
            Set-Content -Path $wslConfigDest -Value $defaultConfig
        }

        # Restart WSL to apply configuration
        Write-Log "Restarting WSL to apply configuration..."
        wsl --shutdown
        Start-Sleep -Seconds 5

        return $true
    } catch {
        Write-Log "Failed to configure WSL: $_" "ERROR"
        return $false
    }
}

# Create default user
function New-WSLUser {
    Write-Log "Creating default user '$WSL_USER'..."

    try {
        # Check if user exists
        $userCheck = wsl -d $WSL_DISTRO -u root -- bash -c "id -u $WSL_USER 2>/dev/null"
        if ($LASTEXITCODE -eq 0) {
            Write-Log "User '$WSL_USER' already exists"
            return $true
        }

        Write-Log "Creating user with sudo privileges..."
        wsl -d $WSL_DISTRO -u root -- bash -c "useradd -m -s /bin/bash -G sudo $WSL_USER"

        Write-Log "Setting password for user..."
        Write-Host "Enter password for WSL user '$WSL_USER':"
        wsl -d $WSL_DISTRO -u root -- bash -c "passwd $WSL_USER"

        # Set as default user
        Write-Log "Setting default user..."
        wsl -d $WSL_DISTRO -u root -- bash -c "echo '[user]' > /etc/wsl.conf"
        wsl -d $WSL_DISTRO -u root -- bash -c "echo 'default=$WSL_USER' >> /etc/wsl.conf"

        # Enable systemd
        Write-Log "Enabling systemd..."
        wsl -d $WSL_DISTRO -u root -- bash -c "echo '[boot]' >> /etc/wsl.conf"
        wsl -d $WSL_DISTRO -u root -- bash -c "echo 'systemd=true' >> /etc/wsl.conf"

        # Restart WSL
        Write-Log "Restarting WSL..."
        wsl --shutdown
        Start-Sleep -Seconds 5

        return $true
    } catch {
        Write-Log "Failed to create user: $_" "ERROR"
        return $false
    }
}

# Run Ubuntu setup script
function Invoke-UbuntuSetup {
    Write-Log "Running Ubuntu setup script..."

    try {
        $setupScript = "$SCRIPT_DIR\setup-ubuntu.sh"
        if (!(Test-Path $setupScript)) {
            Write-Log "setup-ubuntu.sh not found at $setupScript" "ERROR"
            return $false
        }

        # Copy script to WSL
        $wslScriptPath = "/tmp/setup-ubuntu.sh"
        Write-Log "Copying setup script to WSL..."
        wsl -d $WSL_DISTRO -- bash -c "cat > $wslScriptPath" < $setupScript
        wsl -d $WSL_DISTRO -- chmod +x $wslScriptPath

        # Execute setup script
        Write-Log "Executing Ubuntu setup (this may take 15-30 minutes)..."
        wsl -d $WSL_DISTRO -- bash -c "sudo $wslScriptPath 2>&1 | tee /tmp/setup-ubuntu.log"

        if ($LASTEXITCODE -eq 0) {
            Write-Log "Ubuntu setup completed successfully"
            return $true
        } else {
            Write-Log "Ubuntu setup failed with exit code $LASTEXITCODE" "ERROR"
            Write-Log "Check /tmp/setup-ubuntu.log in WSL for details"
            return $false
        }
    } catch {
        Write-Log "Failed to run Ubuntu setup: $_" "ERROR"
        return $false
    }
}

# Verify installation
function Test-WSLInstallation {
    Write-Log "Verifying WSL installation..."

    try {
        # Check WSL version
        $wslVersion = wsl --status
        Write-Log "WSL Status:"
        $wslVersion | ForEach-Object { Write-Log $_ }

        # Check Ubuntu is running
        $distros = wsl --list --verbose
        Write-Log "Installed distributions:"
        $distros | ForEach-Object { Write-Log $_ }

        # Test basic commands
        Write-Log "Testing basic WSL commands..."
        $result = wsl -d $WSL_DISTRO -- bash -c "echo 'WSL is working'; uname -a"
        Write-Log "Test result: $result"

        # Check installed tools
        Write-Log "Checking installed tools..."
        $tools = @("docker", "node", "python3", "git", "gh", "infisical")
        foreach ($tool in $tools) {
            $version = wsl -d $WSL_DISTRO -- bash -c "which $tool && $tool --version 2>&1 | head -1"
            if ($LASTEXITCODE -eq 0) {
                Write-Log "  ✓ $tool : $version"
            } else {
                Write-Log "  ✗ $tool : not found" "WARN"
            }
        }

        return $true
    } catch {
        Write-Log "Verification failed: $_" "ERROR"
        return $false
    }
}

# Main installation flow
function Main {
    Write-Log "========================================="
    Write-Log "WSL Installation for Project-Nyra"
    Write-Log "========================================="

    # Check prerequisites
    if (!(Test-Administrator)) {
        Write-Log "ERROR: This script must be run as Administrator" "ERROR"
        Write-Log "Right-click PowerShell and select 'Run as Administrator'"
        exit 1
    }

    if (!(Test-WindowsVersion)) {
        exit 1
    }

    # Installation steps
    $steps = @(
        @{ Name = "Enable WSL Features"; Function = { Enable-WSLFeatures } },
        @{ Name = "Update WSL Kernel"; Function = { Update-WSLKernel } },
        @{ Name = "Install Ubuntu 22.04"; Function = { Install-Ubuntu } },
        @{ Name = "Configure WSL"; Function = { Configure-WSL } },
        @{ Name = "Create Default User"; Function = { New-WSLUser } },
        @{ Name = "Run Ubuntu Setup"; Function = { Invoke-UbuntuSetup } },
        @{ Name = "Verify Installation"; Function = { Test-WSLInstallation } }
    )

    $totalSteps = $steps.Count
    $currentStep = 0

    foreach ($step in $steps) {
        $currentStep++
        Write-Log ""
        Write-Log "Step $currentStep/$totalSteps : $($step.Name)"
        Write-Progress -Activity "WSL Installation" -Status $step.Name -PercentComplete (($currentStep / $totalSteps) * 100)

        $result = & $step.Function
        if (!$result) {
            Write-Log "Installation failed at step: $($step.Name)" "ERROR"
            Write-Log "Check log file: $LOG_FILE"
            exit 1
        }
    }

    Write-Progress -Activity "WSL Installation" -Completed

    Write-Log ""
    Write-Log "========================================="
    Write-Log "WSL Installation Complete!"
    Write-Log "========================================="
    Write-Log ""
    Write-Log "Next steps:"
    Write-Log "1. Open new WSL terminal: wsl -d $WSL_DISTRO"
    Write-Log "2. Run Project-Nyra installation: ./install-nyra.sh"
    Write-Log "3. Start services: ./services/start-all.sh"
    Write-Log ""
    Write-Log "Access WSL from Windows Explorer: \\wsl$\$WSL_DISTRO"
    Write-Log "Log file: $LOG_FILE"
}

# Run main function
Main
