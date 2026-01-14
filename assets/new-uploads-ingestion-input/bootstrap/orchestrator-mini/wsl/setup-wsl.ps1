<#
.SYNOPSIS
    WSL2 setup script for Project-Nyra orchestrator

.DESCRIPTION
    Installs and configures WSL2 with Ubuntu 24.04 LTS
    Configures Docker Desktop integration
    Sets up networking and resource limits
#>

[CmdletBinding()]
param(
    [string]$Distribution = 'Ubuntu-24.04',
    [string]$WSLUsername = 'nyra',
    [int]$MemoryGB = 16,
    [int]$ProcessorCount = 8
)

$ErrorActionPreference = 'Stop'

function Write-WSLLog {
    param(
        [string]$Message,
        [ValidateSet('Info', 'Success', 'Warning', 'Error')]
        [string]$Level = 'Info'
    )

    $colors = @{
        Info = 'Cyan'
        Success = 'Green'
        Warning = 'Yellow'
        Error = 'Red'
    }

    $timestamp = Get-Date -Format 'HH:mm:ss'
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
    Write-Host "[$Level] " -NoNewline -ForegroundColor $colors[$Level]
    Write-Host $Message
}

function Test-WSLInstalled {
    try {
        $wslVersion = wsl --version 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Install-WSL {
    Write-WSLLog "Installing WSL2..." -Level Info

    # Enable WSL feature
    Write-WSLLog "Enabling Windows Subsystem for Linux feature..." -Level Info
    dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

    # Enable Virtual Machine Platform
    Write-WSLLog "Enabling Virtual Machine Platform..." -Level Info
    dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

    # Install WSL
    Write-WSLLog "Installing WSL..." -Level Info
    wsl --install --no-distribution

    Write-WSLLog "WSL2 installed. Reboot may be required." -Level Success
}

function Set-WSL2AsDefault {
    Write-WSLLog "Setting WSL2 as default version..." -Level Info
    wsl --set-default-version 2

    if ($LASTEXITCODE -eq 0) {
        Write-WSLLog "WSL2 set as default" -Level Success
    } else {
        throw "Failed to set WSL2 as default"
    }
}

function Install-Distribution {
    Write-WSLLog "Installing $Distribution..." -Level Info

    # Check if already installed
    $installed = wsl --list --quiet | Where-Object { $_ -match $Distribution }

    if ($installed) {
        Write-WSLLog "$Distribution is already installed" -Level Warning
        return
    }

    # Install distribution
    wsl --install -d $Distribution

    if ($LASTEXITCODE -eq 0) {
        Write-WSLLog "$Distribution installed successfully" -Level Success
    } else {
        throw "Failed to install $Distribution"
    }
}

function New-WSLConfiguration {
    Write-WSLLog "Creating WSL configuration..." -Level Info

    # Create .wslconfig in user profile
    $wslConfigPath = "$env:USERPROFILE\.wslconfig"

    $wslConfig = @"
[wsl2]
memory=${MemoryGB}GB
processors=$ProcessorCount
localhostForwarding=true
networkingMode=mirrored

[experimental]
sparseVhd=true
autoMemoryReclaim=gradual
"@

    Set-Content -Path $wslConfigPath -Value $wslConfig -Force
    Write-WSLLog "WSL configuration created: $wslConfigPath" -Level Success

    # Display configuration
    Write-WSLLog "WSL Configuration:" -Level Info
    Write-WSLLog "  Memory: ${MemoryGB}GB" -Level Info
    Write-WSLLog "  Processors: $ProcessorCount" -Level Info
    Write-WSLLog "  Networking: Mirrored mode" -Level Info
}

function Initialize-WSLUser {
    Write-WSLLog "Initializing WSL user: $WSLUsername" -Level Info

    # Create user in WSL
    $createUserScript = @"
#!/bin/bash
sudo useradd -m -s /bin/bash $WSLUsername
echo '$WSLUsername:nyra2024' | sudo chpasswd
sudo usermod -aG sudo,docker $WSLUsername
echo '$WSLUsername ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/$WSLUsername
"@

    $tempScript = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempScript -Value $createUserScript

    wsl -d $Distribution -u root bash $tempScript

    Remove-Item $tempScript

    Write-WSLLog "User $WSLUsername created" -Level Success
}

function Install-WSLPackages {
    Write-WSLLog "Installing essential packages..." -Level Info

    $installScript = @"
#!/bin/bash
set -e

# Update package lists
sudo apt update

# Install essentials
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker service
sudo service docker start

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install -y python3 python3-pip python3-venv

echo "Package installation complete"
"@

    $tempScript = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempScript -Value $installScript

    wsl -d $Distribution -u root bash $tempScript

    Remove-Item $tempScript

    Write-WSLLog "Packages installed successfully" -Level Success
}

function Set-WSLNetworking {
    Write-WSLLog "Configuring WSL networking..." -Level Info

    # Configure DNS
    $dnsScript = @"
#!/bin/bash
sudo rm /etc/resolv.conf
sudo bash -c 'echo nameserver 8.8.8.8 > /etc/resolv.conf'
sudo bash -c 'echo nameserver 8.8.4.4 >> /etc/resolv.conf'
sudo chattr +i /etc/resolv.conf
"@

    $tempScript = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempScript -Value $dnsScript

    wsl -d $Distribution -u root bash $tempScript

    Remove-Item $tempScript

    Write-WSLLog "WSL networking configured" -Level Success
}

function Test-WSLSetup {
    Write-WSLLog "Testing WSL setup..." -Level Info

    # Test Docker
    $dockerTest = wsl -d $Distribution -u $WSLUsername docker --version
    if ($LASTEXITCODE -eq 0) {
        Write-WSLLog "Docker test: PASSED" -Level Success
    } else {
        Write-WSLLog "Docker test: FAILED" -Level Error
    }

    # Test Node.js
    $nodeTest = wsl -d $Distribution -u $WSLUsername node --version
    if ($LASTEXITCODE -eq 0) {
        Write-WSLLog "Node.js test: PASSED" -Level Success
    } else {
        Write-WSLLog "Node.js test: FAILED" -Level Error
    }

    # Test Python
    $pythonTest = wsl -d $Distribution -u $WSLUsername python3 --version
    if ($LASTEXITCODE -eq 0) {
        Write-WSLLog "Python test: PASSED" -Level Success
    } else {
        Write-WSLLog "Python test: FAILED" -Level Error
    }
}

function Show-WSLInfo {
    Write-WSLLog "WSL Setup Complete!" -Level Success
    Write-WSLLog "" -Level Info
    Write-WSLLog "Quick Start Commands:" -Level Info
    Write-WSLLog "  Enter WSL: wsl -d $Distribution -u $WSLUsername" -Level Info
    Write-WSLLog "  Check status: wsl --status" -Level Info
    Write-WSLLog "  List distros: wsl --list --verbose" -Level Info
    Write-WSLLog "  Shutdown: wsl --shutdown" -Level Info
    Write-WSLLog "" -Level Info
    Write-WSLLog "Configuration:" -Level Info
    Write-WSLLog "  Distribution: $Distribution" -Level Info
    Write-WSLLog "  Username: $WSLUsername" -Level Info
    Write-WSLLog "  Memory: ${MemoryGB}GB" -Level Info
    Write-WSLLog "  Processors: $ProcessorCount" -Level Info
}

# Main execution
try {
    Write-WSLLog "Project-Nyra WSL2 Setup" -Level Info

    # Check if WSL is installed
    if (-not (Test-WSLInstalled)) {
        Install-WSL
        Write-WSLLog "Please reboot and run this script again" -Level Warning
        exit 0
    }

    # Set WSL2 as default
    Set-WSL2AsDefault

    # Install distribution
    Install-Distribution

    # Create WSL configuration
    New-WSLConfiguration

    # Restart WSL to apply configuration
    Write-WSLLog "Restarting WSL..." -Level Info
    wsl --shutdown
    Start-Sleep -Seconds 3

    # Initialize user
    Initialize-WSLUser

    # Install packages
    Install-WSLPackages

    # Configure networking
    Set-WSLNetworking

    # Test setup
    Test-WSLSetup

    # Show info
    Show-WSLInfo

} catch {
    Write-WSLLog "WSL setup failed: $_" -Level Error
    exit 1
}
