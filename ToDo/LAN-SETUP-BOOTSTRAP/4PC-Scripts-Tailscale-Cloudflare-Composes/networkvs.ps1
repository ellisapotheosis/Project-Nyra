Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NETWORK INFO FOR: $env:COMPUTERNAME" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Get all network adapters
Write-Host "`n--- NETWORK ADAPTERS ---" -ForegroundColor Yellow
Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | ForEach-Object {
    $adapter = $_
    $ipConfig = Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue
    
    Write-Host "`nAdapter: $($adapter.Name)" -ForegroundColor Green
    Write-Host "  MAC Address: $($adapter.MacAddress)"
    Write-Host "  Link Speed: $($adapter.LinkSpeed)"
    if ($ipConfig) {
        Write-Host "  IPv4 Address: $($ipConfig.IPAddress)"
    }
}

# Get Tailscale IP (if installed)
Write-Host "`n--- TAILSCALE ---" -ForegroundColor Yellow
$tailscaleStatus = tailscale status 2>$null
if ($LASTEXITCODE -eq 0) {
    $tailscaleIP = tailscale ip -4 2>$null
    Write-Host "Tailscale IP: $tailscaleIP" -ForegroundColor Green
    Write-Host "`nTailscale Network Status:"
    tailscale status
} else {
    Write-Host "Tailscale not running or not installed" -ForegroundColor Red
}

# Get public IP
Write-Host "`n--- PUBLIC IP ---" -ForegroundColor Yellow
try {
    $publicIP = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing -TimeoutSec 5).Content
    Write-Host "Public IP: $publicIP" -ForegroundColor Green
} catch {
    Write-Host "Could not determine public IP" -ForegroundColor Red
}

# Get hostname
Write-Host "`n--- HOSTNAME ---" -ForegroundColor Yellow
Write-Host "Hostname: $env:COMPUTERNAME"
Write-Host "FQDN: $([System.Net.Dns]::GetHostEntry($env:COMPUTERNAME).HostName)"

# Check if Docker is running
Write-Host "`n--- DOCKER STATUS ---" -ForegroundColor Yellow
$dockerStatus = docker info 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Docker: Running" -ForegroundColor Green
} else {
    Write-Host "Docker: Not running or not installed" -ForegroundColor Red
}

# GPU Info (if NVIDIA)
Write-Host "`n--- GPU INFO ---" -ForegroundColor Yellow
$gpuInfo = nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "NVIDIA GPU(s):" -ForegroundColor Green
    Write-Host $gpuInfo
} else {
    Write-Host "No NVIDIA GPU detected or nvidia-smi not available" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Copy this output and save it!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan