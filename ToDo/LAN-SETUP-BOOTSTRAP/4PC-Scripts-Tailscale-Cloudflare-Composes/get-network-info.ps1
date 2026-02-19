# ============================================
# Project Nyra - Network Info Collection Script
# Run this on EACH of your 4 PCs
# Save output to share with Claude
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NETWORK INFO FOR: $env:COMPUTERNAME" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Get all network adapters
Write-Host "`n--- NETWORK ADAPTERS ---" -ForegroundColor Yellow
Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | ForEach-Object {
    $adapter = $_
    $ipConfig = Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue
    
    Write-Host "`nAdapter: $($adapter.Name)" -ForegroundColor Green
    Write-Host "  Type: $($adapter.InterfaceDescription)"
    Write-Host "  MAC Address: $($adapter.MacAddress)"
    Write-Host "  Link Speed: $($adapter.LinkSpeed)"
    if ($ipConfig) {
        Write-Host "  IPv4 Address: $($ipConfig.IPAddress)"
        Write-Host "  Prefix Length: $($ipConfig.PrefixLength)"
    }
}

# Get default gateway
Write-Host "`n--- DEFAULT GATEWAY ---" -ForegroundColor Yellow
$gateway = Get-NetRoute -DestinationPrefix "0.0.0.0/0" | Select-Object -First 1
if ($gateway) {
    Write-Host "Gateway: $($gateway.NextHop)" -ForegroundColor Green
}

# Get Tailscale IP (if installed)
Write-Host "`n--- TAILSCALE ---" -ForegroundColor Yellow
try {
    $tailscaleIP = & tailscale ip -4 2>$null
    if ($LASTEXITCODE -eq 0 -and $tailscaleIP) {
        Write-Host "Tailscale IPv4: $tailscaleIP" -ForegroundColor Green
        
        Write-Host "`nTailscale Network Status:"
        & tailscale status 2>$null
    } else {
        Write-Host "Tailscale not running" -ForegroundColor Red
        Write-Host "Run: tailscale up" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Tailscale not installed" -ForegroundColor Red
    Write-Host "Install from: https://tailscale.com/download" -ForegroundColor Yellow
}

# Get public IP
Write-Host "`n--- PUBLIC IP ---" -ForegroundColor Yellow
try {
    $publicIP = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing -TimeoutSec 5).Content
    Write-Host "Public IP: $publicIP" -ForegroundColor Green
} catch {
    Write-Host "Could not determine public IP (offline?)" -ForegroundColor Red
}

# Get hostname
Write-Host "`n--- HOSTNAME ---" -ForegroundColor Yellow
Write-Host "Hostname: $env:COMPUTERNAME"
try {
    Write-Host "FQDN: $([System.Net.Dns]::GetHostEntry($env:COMPUTERNAME).HostName)"
} catch {
    Write-Host "FQDN: (could not resolve)"
}

# Check if Docker is running
Write-Host "`n--- DOCKER STATUS ---" -ForegroundColor Yellow
try {
    $dockerVersion = & docker version --format '{{.Server.Version}}' 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Docker: Running (v$dockerVersion)" -ForegroundColor Green
        
        # List running containers
        $containers = & docker ps --format "{{.Names}}" 2>$null
        if ($containers) {
            Write-Host "Running containers:" -ForegroundColor Green
            $containers | ForEach-Object { Write-Host "  - $_" }
        }
    } else {
        Write-Host "Docker: Not running" -ForegroundColor Red
    }
} catch {
    Write-Host "Docker: Not installed" -ForegroundColor Red
}

# GPU Info (if NVIDIA)
Write-Host "`n--- GPU INFO ---" -ForegroundColor Yellow
try {
    $gpuInfo = & nvidia-smi --query-gpu=index,name,memory.total,memory.free,driver_version --format=csv,noheader 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "NVIDIA GPU(s) detected:" -ForegroundColor Green
        $gpuInfo -split "`n" | ForEach-Object {
            $parts = $_ -split ", "
            Write-Host "  GPU $($parts[0]): $($parts[1])"
            Write-Host "    Total VRAM: $($parts[2])"
            Write-Host "    Free VRAM: $($parts[3])"
            Write-Host "    Driver: $($parts[4])"
        }
    } else {
        Write-Host "No NVIDIA GPU or nvidia-smi unavailable" -ForegroundColor Yellow
    }
} catch {
    Write-Host "nvidia-smi not found" -ForegroundColor Red
}

# Check cloudflared
Write-Host "`n--- CLOUDFLARED ---" -ForegroundColor Yellow
try {
    $cfVersion = & cloudflared --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Cloudflared: $cfVersion" -ForegroundColor Green
        
        # Check for tunnels
        $tunnels = & cloudflared tunnel list 2>$null
        if ($tunnels) {
            Write-Host "Configured tunnels:"
            $tunnels | Select-Object -Skip 1 | ForEach-Object { Write-Host "  $_" }
        }
    } else {
        Write-Host "Cloudflared: Not configured" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Cloudflared: Not installed" -ForegroundColor Red
    Write-Host "Install: winget install Cloudflare.cloudflared" -ForegroundColor Yellow
}

# Check WSL (if relevant)
Write-Host "`n--- WSL STATUS ---" -ForegroundColor Yellow
try {
    $wslList = & wsl --list --verbose 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "WSL Distributions:" -ForegroundColor Green
        $wslList | Where-Object { $_ -match '\S' } | ForEach-Object { Write-Host "  $_" }
    }
} catch {
    Write-Host "WSL: Not available" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SUMMARY FOR ENV FILE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host @"

# Add these to your .env file:
# HOSTNAME_$(($env:COMPUTERNAME).ToUpper())=$env:COMPUTERNAME
"@

try {
    $tsIP = & tailscale ip -4 2>$null
    if ($tsIP) {
        Write-Host "# TAILSCALE_IP_$(($env:COMPUTERNAME).ToUpper())=$tsIP"
    }
} catch {}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Copy ALL output above and paste to Claude!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Option to save to file
$saveToFile = Read-Host "`nSave output to file? (y/n)"
if ($saveToFile -eq 'y') {
    $filename = "network-info-$env:COMPUTERNAME-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
    $PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
    
    # Re-run and capture
    & $PSCommandPath *>&1 | Out-File -FilePath $filename
    Write-Host "Saved to: $filename" -ForegroundColor Green
}
