# Project Nyra - PC Information Collector
# Run this script on each of the 4 PCs to gather network configuration

Write-Host "=== Project Nyra PC Information Collector ===" -ForegroundColor Cyan
Write-Host ""

# Basic System Info
$hostname = $env:COMPUTERNAME
$user = $env:USERNAME
Write-Host "Hostname: $hostname" -ForegroundColor Green
Write-Host "User: $user" -ForegroundColor Green

# Get PC Model
try {
    $computerInfo = Get-WmiObject Win32_ComputerSystem
    Write-Host "Manufacturer: $($computerInfo.Manufacturer)" -ForegroundColor Green
    Write-Host "Model: $($computerInfo.Model)" -ForegroundColor Green
} catch {
    Write-Host "Could not retrieve computer model" -ForegroundColor Yellow
}

# Get GPU Info
Write-Host "`nGPU Information:" -ForegroundColor Cyan
try {
    $gpus = Get-WmiObject Win32_VideoController
    foreach ($gpu in $gpus) {
        $vramGB = [math]::Round($gpu.AdapterRAM / 1GB, 2)
        Write-Host "  - $($gpu.Name) ($vramGB GB VRAM)" -ForegroundColor Green
    }
} catch {
    Write-Host "Could not retrieve GPU information" -ForegroundColor Yellow
}

# Network Interfaces
Write-Host "`nNetwork Interfaces:" -ForegroundColor Cyan
$adapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne '127.0.0.1' }
foreach ($adapter in $adapters) {
    $adapterName = (Get-NetAdapter -InterfaceIndex $adapter.InterfaceIndex).Name
    $mac = (Get-NetAdapter -InterfaceIndex $adapter.InterfaceIndex).MacAddress
    Write-Host "  Interface: $adapterName" -ForegroundColor Green
    Write-Host "    IP: $($adapter.IPAddress)" -ForegroundColor White
    Write-Host "    MAC: $mac" -ForegroundColor White
}

# Tailscale Status
Write-Host "`nTailscale Status:" -ForegroundColor Cyan
try {
    $tailscaleIP = & tailscale ip -4 2>$null
    if ($tailscaleIP) {
        Write-Host "  Tailscale IP: $tailscaleIP" -ForegroundColor Green
        $tailscaleStatus = & tailscale status 2>$null
        Write-Host "  Status: Connected" -ForegroundColor Green
    } else {
        Write-Host "  Status: Not connected" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Status: Tailscale not installed" -ForegroundColor Red
}

# Cloudflared Status
Write-Host "`nCloudflared Status:" -ForegroundColor Cyan
try {
    $cloudflaredVersion = & cloudflared --version 2>$null
    if ($cloudflaredVersion) {
        Write-Host "  Installed: $cloudflaredVersion" -ForegroundColor Green
        $tunnels = & cloudflared tunnel list 2>$null
        if ($tunnels) {
            Write-Host "  Tunnels configured" -ForegroundColor Green
        }
    } else {
        Write-Host "  Status: Not installed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Status: Cloudflared not installed" -ForegroundColor Red
}

# Ollama Status
Write-Host "`nOllama Status:" -ForegroundColor Cyan
try {
    $ollamaResponse = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "  Status: Running on port 11434" -ForegroundColor Green
    $models = ($ollamaResponse.Content | ConvertFrom-Json).models
    Write-Host "  Models installed: $($models.Count)" -ForegroundColor Green
} catch {
    Write-Host "  Status: Not running on port 11434" -ForegroundColor Yellow
}

Write-Host "`n=== Please save this output and share with the orchestrator ===" -ForegroundColor Cyan
Write-Host ""

# Save to file
$outputFile = ".\PC-INFO-$hostname-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
$output = @"
=== Project Nyra PC Information ===
Generated: $(Get-Date)

Hostname: $hostname
User: $user
Manufacturer: $($computerInfo.Manufacturer)
Model: $($computerInfo.Model)

Network Interfaces:
$($adapters | ForEach-Object {
    $adapterName = (Get-NetAdapter -InterfaceIndex $_.InterfaceIndex).Name
    $mac = (Get-NetAdapter -InterfaceIndex $_.InterfaceIndex).MacAddress
    "  $adapterName - IP: $($_.IPAddress) - MAC: $mac"
} | Out-String)

Tailscale IP: $(try { & tailscale ip -4 2>$null } catch { "Not connected" })
"@

$output | Out-File -FilePath $outputFile -Encoding UTF8
Write-Host "Information saved to: $outputFile" -ForegroundColor Green
