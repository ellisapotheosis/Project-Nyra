# Tailscale Setup Script for Orchestrator Mini (PowerShell)
# Project Nyra - Distributed 4PC Architecture
#
# This script configures Tailscale on the orchestrator node with:
# - Exit node capability
# - Subnet routing for 10.0.0.0/24
# - MagicDNS
# - ACL configuration
#

#Requires -RunAsAdministrator

[CmdletBinding()]
param(
    [switch]$SkipInstall,
    [switch]$SkipInfisical,
    [string]$AuthKey
)

# Script configuration
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$TailscaleConfigDir = Join-Path $ProjectRoot "bootstrap\configs\tailscale"
$LogFile = Join-Path $ProjectRoot "logs\tailscale-setup.log"
$NodeType = "orchestrator"
$NodeName = if ($env:COMPUTERNAME) { $env:COMPUTERNAME } else { "orchestrator-mini" }

# Ensure log directory exists
$LogDir = Split-Path -Parent $LogFile
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# Logging function
function Write-Log {
    param(
        [string]$Level,
        [string]$Message
    )
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $LogMessage

    switch ($Level) {
        "ERROR" { Write-Host $LogMessage -ForegroundColor Red }
        "WARN" { Write-Host $LogMessage -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $LogMessage -ForegroundColor Green }
        "INFO" { Write-Host $LogMessage -ForegroundColor Cyan }
        default { Write-Host $LogMessage }
    }
}

# Print header
function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "================================" -ForegroundColor Blue
    Write-Host $Title -ForegroundColor Blue
    Write-Host "================================" -ForegroundColor Blue
    Write-Host ""
}

# Check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Administrator)) {
    Write-Log "ERROR" "This script must be run as Administrator"
    exit 1
}

# Detect network information
function Get-NetworkInfo {
    Write-Header "Detecting Network Information"

    try {
        # Get primary network adapter
        $adapter = Get-NetAdapter | Where-Object { $_.Status -eq "Up" -and $_.InterfaceType -eq 6 } | Select-Object -First 1

        if (-not $adapter) {
            throw "No active network adapter found"
        }

        Write-Log "INFO" "Primary adapter: $($adapter.Name)"

        # Get IP address
        $ipConfig = Get-NetIPAddress -InterfaceIndex $adapter.InterfaceIndex -AddressFamily IPv4 | Select-Object -First 1
        $ipAddress = $ipConfig.IPAddress
        Write-Log "INFO" "IP address: $ipAddress"

        # Get MAC address
        $macAddress = $adapter.MacAddress
        Write-Log "INFO" "MAC address: $macAddress"

        return @{
            InterfaceName = $adapter.Name
            InterfaceIndex = $adapter.InterfaceIndex
            IPAddress = $ipAddress
            MacAddress = $macAddress
        }
    }
    catch {
        Write-Log "ERROR" "Failed to detect network information: $_"
        throw
    }
}

$NetworkInfo = Get-NetworkInfo

# Check if Infisical CLI is available
function Test-InfisicalCLI {
    try {
        $null = Get-Command infisical -ErrorAction Stop
        return $true
    }
    catch {
        Write-Log "WARN" "Infisical CLI not found. Install from: https://infisical.com/docs/cli/overview"
        return $false
    }
}

# Retrieve auth key
function Get-TailscaleAuthKey {
    Write-Header "Retrieving Tailscale Auth Key"

    # If provided as parameter
    if ($AuthKey) {
        Write-Log "INFO" "Using auth key from parameter"
        return $AuthKey
    }

    # Try Infisical if available and not skipped
    if (-not $SkipInfisical -and (Test-InfisicalCLI)) {
        Write-Log "INFO" "Attempting to retrieve auth key from Infisical..."
        try {
            $key = infisical secrets get TAILSCALE_AUTH_KEY_ORCHESTRATOR `
                --env prod `
                --path /project-nyra/tailscale `
                --silent 2>$null

            if ($key) {
                Write-Log "SUCCESS" "Auth key retrieved from Infisical"
                return $key.Trim()
            }
        }
        catch {
            Write-Log "WARN" "Failed to retrieve from Infisical: $_"
        }
    }

    # Try environment variable
    if ($env:TAILSCALE_AUTH_KEY) {
        Write-Log "INFO" "Using auth key from TAILSCALE_AUTH_KEY environment variable"
        return $env:TAILSCALE_AUTH_KEY
    }

    # Try .env file
    $envFile = Join-Path $ProjectRoot ".env"
    if (Test-Path $envFile) {
        $envContent = Get-Content $envFile
        $keyLine = $envContent | Where-Object { $_ -match "^TAILSCALE_AUTH_KEY=" }
        if ($keyLine) {
            $key = ($keyLine -split "=", 2)[1].Trim('"').Trim("'")
            if ($key) {
                Write-Log "INFO" "Using auth key from .env file"
                return $key
            }
        }
    }

    Write-Log "ERROR" "No auth key found. Please provide via -AuthKey parameter, TAILSCALE_AUTH_KEY env var, or Infisical"
    throw "Auth key not found"
}

# Check if Tailscale is installed
function Test-TailscaleInstalled {
    try {
        $null = Get-Command tailscale -ErrorAction Stop
        $version = tailscale version 2>$null | Select-Object -First 1
        Write-Log "INFO" "Tailscale already installed: $version"
        return $true
    }
    catch {
        return $false
    }
}

# Install Tailscale
function Install-Tailscale {
    if ($SkipInstall -or (Test-TailscaleInstalled)) {
        return
    }

    Write-Header "Installing Tailscale"

    try {
        # Download Tailscale installer
        $installerUrl = "https://pkgs.tailscale.com/stable/tailscale-setup-latest.exe"
        $installerPath = Join-Path $env:TEMP "tailscale-setup.exe"

        Write-Log "INFO" "Downloading Tailscale installer..."
        Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing

        Write-Log "INFO" "Installing Tailscale..."
        Start-Process -FilePath $installerPath -ArgumentList "/quiet" -Wait

        # Wait for service to start
        Start-Sleep -Seconds 5

        # Verify installation
        if (Test-TailscaleInstalled) {
            Write-Log "SUCCESS" "Tailscale installed successfully"
        }
        else {
            throw "Tailscale installation verification failed"
        }

        # Clean up installer
        Remove-Item $installerPath -ErrorAction SilentlyContinue
    }
    catch {
        Write-Log "ERROR" "Failed to install Tailscale: $_"
        throw
    }
}

# Configure Tailscale
function Set-TailscaleConfiguration {
    Write-Header "Configuring Tailscale"

    try {
        $authKey = Get-TailscaleAuthKey

        # Check if already connected
        $status = tailscale status 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "WARN" "Tailscale is already connected"
            $response = Read-Host "Do you want to reconfigure? (y/N)"
            if ($response -ne "y" -and $response -ne "Y") {
                Write-Log "INFO" "Skipping configuration"
                return
            }
            tailscale down 2>$null
        }

        Write-Log "INFO" "Starting Tailscale with orchestrator configuration..."

        # Configure Tailscale with orchestrator-specific settings
        $arguments = @(
            "up",
            "--authkey=$authKey",
            "--hostname=$NodeName-tailscale",
            "--advertise-exit-node",
            "--advertise-routes=10.0.0.0/24",
            "--accept-routes",
            "--accept-dns",
            "--ssh",
            "--shields-up=false"
        )

        $process = Start-Process -FilePath "tailscale" -ArgumentList $arguments -Wait -PassThru -NoNewWindow

        if ($process.ExitCode -eq 0) {
            Write-Log "SUCCESS" "Tailscale configured successfully"
        }
        else {
            throw "Tailscale configuration failed with exit code $($process.ExitCode)"
        }
    }
    catch {
        Write-Log "ERROR" "Failed to configure Tailscale: $_"
        throw
    }
}

# Enable exit node instructions
function Show-ExitNodeInstructions {
    Write-Header "Enabling Exit Node"

    Write-Log "INFO" "Exit node advertised. Approval required in Tailscale admin console:"
    Write-Host "https://login.tailscale.com/admin/machines" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Steps to approve:" -ForegroundColor Yellow
    Write-Host "1. Find the machine: $NodeName-tailscale"
    Write-Host "2. Click on the machine"
    Write-Host "3. Go to 'Edit route settings'"
    Write-Host "4. Enable 'Use as exit node'"
    Write-Host "5. Approve subnet routes: 10.0.0.0/24"
    Write-Host ""
    Write-Log "WARN" "Please approve the exit node and subnet routes before continuing"
}

# Verify Tailscale status
function Get-TailscaleStatus {
    Write-Header "Verifying Tailscale Status"

    try {
        $status = tailscale status 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Tailscale is not running"
        }

        Write-Host $status

        # Get Tailscale IP addresses
        $ipv4 = tailscale ip -4 2>$null
        $ipv6 = tailscale ip -6 2>$null

        Write-Log "SUCCESS" "Tailscale IPv4: $ipv4"
        Write-Log "INFO" "Tailscale IPv6: $ipv6"

        return @{
            IPv4 = $ipv4
            IPv6 = $ipv6
        }
    }
    catch {
        Write-Log "ERROR" "Failed to verify Tailscale status: $_"
        throw
    }
}

# Store node information
function Save-NodeInfo {
    param(
        [hashtable]$TailscaleInfo
    )

    Write-Header "Storing Node Information"

    # Try to store in Infisical
    if (-not $SkipInfisical -and (Test-InfisicalCLI)) {
        Write-Log "INFO" "Storing node info in Infisical..."
        try {
            infisical secrets set "TAILSCALE_NODE_$($NodeType.ToUpper())_IP" $TailscaleInfo.IPv4 `
                --env prod --path /project-nyra/tailscale 2>$null
            infisical secrets set "TAILSCALE_NODE_$($NodeType.ToUpper())_IP6" $TailscaleInfo.IPv6 `
                --env prod --path /project-nyra/tailscale 2>$null
            infisical secrets set "TAILSCALE_NODE_$($NodeType.ToUpper())_MAC" $NetworkInfo.MacAddress `
                --env prod --path /project-nyra/tailscale 2>$null
            infisical secrets set "TAILSCALE_NODE_$($NodeType.ToUpper())_NAME" $NodeName `
                --env prod --path /project-nyra/tailscale 2>$null

            Write-Log "SUCCESS" "Node information stored in Infisical"
        }
        catch {
            Write-Log "WARN" "Failed to store in Infisical: $_"
        }
    }

    # Store in local JSON file
    $dataDir = Join-Path $ProjectRoot "data"
    if (-not (Test-Path $dataDir)) {
        New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    }

    $nodeInfo = @{
        node_type = $NodeType
        node_name = $NodeName
        tailscale_ip = $TailscaleInfo.IPv4
        tailscale_ip6 = $TailscaleInfo.IPv6
        mac_address = $NetworkInfo.MacAddress
        primary_interface = $NetworkInfo.InterfaceName
        local_ip = $NetworkInfo.IPAddress
        exit_node = $true
        subnet_routes = @("10.0.0.0/24")
        updated_at = Get-Date -Format "o"
    }

    $infoFile = Join-Path $dataDir "tailscale-node-info.json"
    $nodeInfo | ConvertTo-Json -Depth 10 | Out-File -FilePath $infoFile -Encoding utf8

    Write-Log "SUCCESS" "Node information saved to $infoFile"
}

# Configure Windows Firewall
function Set-FirewallRules {
    Write-Header "Configuring Windows Firewall"

    try {
        # Check if firewall rule already exists
        $existingRule = Get-NetFirewallRule -DisplayName "Tailscale" -ErrorAction SilentlyContinue

        if ($existingRule) {
            Write-Log "INFO" "Firewall rule already exists"
        }
        else {
            New-NetFirewallRule -DisplayName "Tailscale" `
                -Direction Inbound `
                -Protocol UDP `
                -LocalPort 41641 `
                -Action Allow `
                -Profile Any | Out-Null

            Write-Log "SUCCESS" "Firewall rule created"
        }
    }
    catch {
        Write-Log "WARN" "Failed to configure firewall: $_"
    }
}

# Ensure Tailscale service is running
function Start-TailscaleService {
    Write-Header "Ensuring Tailscale Service"

    try {
        $service = Get-Service -Name "Tailscale" -ErrorAction SilentlyContinue

        if ($service) {
            if ($service.Status -ne "Running") {
                Start-Service -Name "Tailscale"
                Write-Log "SUCCESS" "Tailscale service started"
            }

            if ($service.StartType -ne "Automatic") {
                Set-Service -Name "Tailscale" -StartupType Automatic
                Write-Log "SUCCESS" "Tailscale service set to automatic"
            }
        }
        else {
            Write-Log "WARN" "Tailscale service not found"
        }
    }
    catch {
        Write-Log "WARN" "Failed to configure service: $_"
    }
}

# Print summary
function Show-Summary {
    Write-Header "Setup Complete"

    Write-Host ""
    Write-Log "SUCCESS" "Tailscale setup completed successfully!"
    Write-Host ""
    Write-Log "INFO" "Node Type: $NodeType (Exit Node + Subnet Router)"
    Write-Log "INFO" "Node Name: $NodeName-tailscale"
    Write-Log "INFO" "Subnet Routes: 10.0.0.0/24"
    Write-Log "INFO" "Exit Node: Enabled (requires admin approval)"
    Write-Host ""
    Write-Log "INFO" "Next Steps:"
    Write-Host "1. Approve exit node in Tailscale admin console"
    Write-Host "2. Approve subnet routes in Tailscale admin console"
    Write-Host "3. Configure ACLs using: $TailscaleConfigDir\tailscale-acls.json"
    Write-Host "4. Test connectivity with: tailscale ping <node-name>"
    Write-Host ""
    Write-Log "INFO" "For status: tailscale status"
    Write-Log "INFO" "For logs: Get-EventLog -LogName Application -Source Tailscale"
    Write-Host ""
}

# Main execution
function Main {
    Write-Header "Tailscale Setup - Orchestrator Mini"

    try {
        # Install and configure
        Install-Tailscale
        Set-TailscaleConfiguration
        Show-ExitNodeInstructions
        $tailscaleInfo = Get-TailscaleStatus
        Save-NodeInfo -TailscaleInfo $tailscaleInfo
        Set-FirewallRules
        Start-TailscaleService

        # Finish
        Show-Summary

        Write-Log "INFO" "Tailscale setup completed successfully"
    }
    catch {
        Write-Log "ERROR" "Setup failed: $_"
        exit 1
    }
}

# Run main function
Main
