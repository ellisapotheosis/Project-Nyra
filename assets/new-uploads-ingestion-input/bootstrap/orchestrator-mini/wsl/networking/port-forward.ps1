#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Configure port forwarding from Windows to WSL
.DESCRIPTION
    Sets up port forwarding rules so WSL services are accessible from Windows network
.NOTES
    Must be run as Administrator
#>

$ErrorActionPreference = "Stop"

# Configuration
$WSL_DISTRO = "Ubuntu-22.04"
$PORTS = @(
    3000,  # Main application
    3001,  # Grafana
    3020,  # Gitea
    5432,  # PostgreSQL
    6379,  # Redis
    8080,  # Nginx
    9090,  # Prometheus
    9100   # Node Exporter
)

Write-Host "=========================================="
Write-Host "  Port Forwarding: Windows -> WSL"
Write-Host "=========================================="
Write-Host ""

# Get WSL IP address
Write-Host "[INFO] Getting WSL IP address..."
$wslIp = wsl -d $WSL_DISTRO -- hostname -I | ForEach-Object { $_.Trim().Split(" ")[0] }

if ([string]::IsNullOrEmpty($wslIp)) {
    Write-Host "[ERROR] Could not determine WSL IP address" -ForegroundColor Red
    Write-Host "Make sure WSL is running: wsl -d $WSL_DISTRO" -ForegroundColor Yellow
    exit 1
}

Write-Host "[SUCCESS] WSL IP: $wslIp" -ForegroundColor Green

# Remove existing port forwarding rules
Write-Host ""
Write-Host "[INFO] Removing existing port forwarding rules..."
netsh interface portproxy reset | Out-Null

# Add new port forwarding rules
Write-Host "[INFO] Adding port forwarding rules..."
foreach ($port in $PORTS) {
    try {
        netsh interface portproxy add v4tov4 `
            listenaddress=0.0.0.0 `
            listenport=$port `
            connectaddress=$wslIp `
            connectport=$port | Out-Null

        Write-Host "  [+] Port $port -> $wslIp:$port" -ForegroundColor Green
    } catch {
        Write-Host "  [!] Failed to forward port $port" -ForegroundColor Yellow
    }
}

# Configure Windows Firewall
Write-Host ""
Write-Host "[INFO] Configuring Windows Firewall..."

$ruleName = "WSL-ProjectNyra"

# Remove existing rule
netsh advfirewall firewall delete rule name="$ruleName" | Out-Null

# Add new rule
foreach ($port in $PORTS) {
    try {
        New-NetFirewallRule `
            -DisplayName "$ruleName-$port" `
            -Direction Inbound `
            -LocalPort $port `
            -Protocol TCP `
            -Action Allow `
            -ErrorAction SilentlyContinue | Out-Null

        Write-Host "  [+] Firewall rule added for port $port" -ForegroundColor Green
    } catch {
        Write-Host "  [!] Firewall rule already exists for port $port" -ForegroundColor Yellow
    }
}

# Display current configuration
Write-Host ""
Write-Host "=========================================="
Write-Host "  Port Forwarding Configuration"
Write-Host "=========================================="
netsh interface portproxy show all

Write-Host ""
Write-Host "[SUCCESS] Port forwarding configured!" -ForegroundColor Green
Write-Host ""
Write-Host "Services are now accessible from:"
Write-Host "  - This computer: http://localhost:<port>"
Write-Host "  - Local network: http://<windows-ip>:<port>"
Write-Host ""
Write-Host "To remove port forwarding:"
Write-Host "  netsh interface portproxy reset"
Write-Host ""
Write-Host "To show current rules:"
Write-Host "  netsh interface portproxy show all"
