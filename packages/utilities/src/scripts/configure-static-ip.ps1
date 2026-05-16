# Project Nyra - Static IP Configuration Script
# Configure static IP addresses for 4-PC cluster

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("PC1", "PC2", "PC3", "PC4")]
    [string]$PCRole,

    [switch]$AutoDetect = $false,
    [string]$InterfaceName = "",
    [switch]$SetDNS = $true
)

$ErrorActionPreference = "Stop"

# IP assignments
$ipConfig = @{
    "PC1" = @{IP="10.0.0.1"; Description="Orchestrator (Mac Mini)"}
    "PC2" = @{IP="10.0.0.2"; Description="Worker-2 (Alienware M15R7, RTX 3060)"}
    "PC3" = @{IP="10.0.0.3"; Description="Worker-3 (Alienware Area-51, RTX 5090)"}
    "PC4" = @{IP="10.0.0.4"; Description="Worker-4 (Desktop, RTX 3090 Ti)"}
}

$config = $ipConfig[$PCRole]
$staticIP = $config.IP
$gateway = "10.0.0.1"
$subnet = "255.255.255.0"
$dns1 = "1.1.1.1"
$dns2 = "8.8.8.8"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Static IP Configuration" -ForegroundColor Cyan
Write-Host "  PC: $PCRole" -ForegroundColor Cyan
Write-Host "  IP: $staticIP" -ForegroundColor Cyan
Write-Host "  Description: $($config.Description)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Function to check admin privileges
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Administrator)) {
    Write-Host "ERROR: This script requires administrator privileges." -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    exit 1
}

# Auto-detect active network adapter
if ($AutoDetect -or -not $InterfaceName) {
    Write-Host "Auto-detecting active network adapter..." -ForegroundColor Yellow
    $adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up" -and $_.PhysicalMediaType -eq "802.3"} | Select-Object -First 1

    if ($adapter) {
        $InterfaceName = $adapter.Name
        Write-Host "✓ Detected adapter: $InterfaceName" -ForegroundColor Green
    } else {
        Write-Host "✗ No active Ethernet adapter found!" -ForegroundColor Red
        Write-Host "Available adapters:" -ForegroundColor Yellow
        Get-NetAdapter | Format-Table Name, Status, InterfaceDescription
        exit 1
    }
} else {
    # Validate specified interface
    $adapter = Get-NetAdapter -Name $InterfaceName -ErrorAction SilentlyContinue
    if (-not $adapter) {
        Write-Host "✗ Network adapter '$InterfaceName' not found!" -ForegroundColor Red
        Write-Host "Available adapters:" -ForegroundColor Yellow
        Get-NetAdapter | Format-Table Name, Status, InterfaceDescription
        exit 1
    }
}

Write-Host ""
Write-Host "Configuring network adapter: $InterfaceName" -ForegroundColor Cyan
Write-Host ""

# Remove existing IP configuration
Write-Host "1. Removing existing IP configuration..." -ForegroundColor Yellow
try {
    Remove-NetIPAddress -InterfaceAlias $InterfaceName -Confirm:$false -ErrorAction SilentlyContinue
    Remove-NetRoute -InterfaceAlias $InterfaceName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "   ✓ Cleared existing configuration" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Warning: Could not clear existing config (may not exist)" -ForegroundColor Yellow
}

# Set static IP address
Write-Host "2. Setting static IP: $staticIP" -ForegroundColor Yellow
try {
    New-NetIPAddress -InterfaceAlias $InterfaceName `
                     -IPAddress $staticIP `
                     -PrefixLength 24 `
                     -DefaultGateway $gateway `
                     -ErrorAction Stop | Out-Null
    Write-Host "   ✓ Static IP configured" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed to set static IP: $_" -ForegroundColor Red
    exit 1
}

# Set DNS servers
if ($SetDNS) {
    Write-Host "3. Setting DNS servers: $dns1, $dns2" -ForegroundColor Yellow
    try {
        Set-DnsClientServerAddress -InterfaceAlias $InterfaceName `
                                   -ServerAddresses ($dns1, $dns2) `
                                   -ErrorAction Stop
        Write-Host "   ✓ DNS servers configured" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ Failed to set DNS: $_" -ForegroundColor Red
    }
}

# Verify configuration
Write-Host ""
Write-Host "4. Verifying configuration..." -ForegroundColor Yellow

$ipAddress = Get-NetIPAddress -InterfaceAlias $InterfaceName -AddressFamily IPv4 -ErrorAction SilentlyContinue
if ($ipAddress -and $ipAddress.IPAddress -eq $staticIP) {
    Write-Host "   ✓ IP Address: $($ipAddress.IPAddress)" -ForegroundColor Green
} else {
    Write-Host "   ✗ IP verification failed!" -ForegroundColor Red
}

$route = Get-NetRoute -InterfaceAlias $InterfaceName -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue
if ($route) {
    Write-Host "   ✓ Gateway: $($route.NextHop)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Gateway not configured!" -ForegroundColor Red
}

if ($SetDNS) {
    $dnsServers = Get-DnsClientServerAddress -InterfaceAlias $InterfaceName -AddressFamily IPv4 -ErrorAction SilentlyContinue
    if ($dnsServers) {
        Write-Host "   ✓ DNS Servers: $($dnsServers.ServerAddresses -join ', ')" -ForegroundColor Green
    }
}

# Test connectivity
Write-Host ""
Write-Host "5. Testing network connectivity..." -ForegroundColor Yellow

# Test gateway
Write-Host "   Testing gateway ($gateway)... " -NoNewline
if (Test-Connection -ComputerName $gateway -Count 2 -Quiet) {
    Write-Host "✓ Reachable" -ForegroundColor Green
} else {
    Write-Host "✗ Unreachable" -ForegroundColor Red
}

# Test DNS
Write-Host "   Testing DNS (google.com)... " -NoNewline
if (Test-Connection -ComputerName "google.com" -Count 2 -Quiet) {
    Write-Host "✓ Working" -ForegroundColor Green
} else {
    Write-Host "✗ Not working" -ForegroundColor Red
}

# Test other PCs in cluster
Write-Host ""
Write-Host "6. Testing connectivity to other cluster PCs..." -ForegroundColor Yellow

foreach ($pc in $ipConfig.Keys) {
    if ($pc -ne $PCRole) {
        $testIP = $ipConfig[$pc].IP
        Write-Host "   $pc ($testIP)... " -NoNewline
        if (Test-Connection -ComputerName $testIP -Count 1 -Quiet) {
            Write-Host "✓ Reachable" -ForegroundColor Green
        } else {
            Write-Host "⚠ Not reachable (may not be configured yet)" -ForegroundColor Yellow
        }
    }
}

# Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Configuration Complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Network Configuration:" -ForegroundColor White
Write-Host "  PC Role:       $PCRole ($($config.Description))" -ForegroundColor White
Write-Host "  Interface:     $InterfaceName" -ForegroundColor White
Write-Host "  IP Address:    $staticIP" -ForegroundColor White
Write-Host "  Subnet Mask:   $subnet" -ForegroundColor White
Write-Host "  Gateway:       $gateway" -ForegroundColor White
Write-Host "  DNS Servers:   $dns1, $dns2" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Configure other PCs in the cluster" -ForegroundColor White
Write-Host "  2. Run bootstrap script: .\scripts\bootstrap-$(if($PCRole -eq 'PC1'){'orchestrator'}else{'worker'}).ps1" -ForegroundColor White
Write-Host "  3. Test connectivity: ping 10.0.0.1" -ForegroundColor White
Write-Host ""
