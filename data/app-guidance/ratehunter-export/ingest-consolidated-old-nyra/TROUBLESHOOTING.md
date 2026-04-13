# Project Nyra Bootstrap Troubleshooting Guide

**Version**: 4.0.0
**Last Updated**: January 15, 2026
**Purpose**: Comprehensive troubleshooting guide for Project Nyra bootstrap issues

---

## 📋 Table of Contents

1. [Quick Diagnostics](#-quick-diagnostics)
2. [Installation Issues](#-installation-issues)
3. [Docker Issues](#-docker-issues)
4. [GPU Issues](#-gpu-issues)
5. [Network Issues](#-network-issues)
6. [Service-Specific Issues](#-service-specific-issues)
7. [Performance Issues](#-performance-issues)
8. [Data Recovery](#-data-recovery)
9. [Common Error Messages](#-common-error-messages)

---

## 🔍 Quick Diagnostics

### Health Check Script

Run this PowerShell script to diagnose common issues:

```powershell
# bootstrap-health-check.ps1
Write-Host "Project Nyra Bootstrap Health Check" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Windows version
$osInfo = Get-CimInstance Win32_OperatingSystem
Write-Host "OS: $($osInfo.Caption) Build $($osInfo.BuildNumber)" -ForegroundColor $(if ($osInfo.BuildNumber -ge 22000) { "Green" } else { "Red" })

# 2. Check prerequisites
$checks = @(
    @{ Name = "Git"; Command = "git"; MinVersion = "2.40" },
    @{ Name = "Node.js"; Command = "node"; MinVersion = "20.0" },
    @{ Name = "npm"; Command = "npm"; MinVersion = "9.0" },
    @{ Name = "Docker"; Command = "docker"; MinVersion = "24.0" },
    @{ Name = "Python"; Command = "python"; MinVersion = "3.11" }
)

foreach ($check in $checks) {
    try {
        $version = & $check.Command --version 2>&1 | Out-String
        $installed = $true
    } catch {
        $installed = $false
    }

    $status = if ($installed) { "✓" } else { "✗" }
    $color = if ($installed) { "Green" } else { "Red" }
    Write-Host "$status $($check.Name)" -ForegroundColor $color
}

# 3. Check Docker status
Write-Host "`nDocker Status:" -ForegroundColor Cyan
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker is running" -ForegroundColor Green
        docker compose version
    } else {
        Write-Host "✗ Docker is not running" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Docker is not installed" -ForegroundColor Red
}

# 4. Check GPU (if applicable)
Write-Host "`nGPU Status:" -ForegroundColor Cyan
try {
    nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader
    Write-Host "✓ NVIDIA GPU detected" -ForegroundColor Green
} catch {
    Write-Host "○ No NVIDIA GPU detected (OK for orchestrator)" -ForegroundColor Yellow
}

# 5. Check network
Write-Host "`nNetwork Status:" -ForegroundColor Cyan
$adapter = Get-NetAdapter | Where-Object Status -eq "Up" | Select-Object -First 1
if ($adapter) {
    $ip = Get-NetIPAddress -InterfaceAlias $adapter.Name -AddressFamily IPv4 | Select-Object -ExpandProperty IPAddress
    Write-Host "✓ Network adapter: $($adapter.Name)" -ForegroundColor Green
    Write-Host "  IP: $ip" -ForegroundColor Gray
} else {
    Write-Host "✗ No active network adapter" -ForegroundColor Red
}

# 6. Check disk space
Write-Host "`nDisk Space:" -ForegroundColor Cyan
$drive = Get-PSDrive C
$freeGB = [math]::Round($drive.Free / 1GB, 2)
$color = if ($freeGB -gt 100) { "Green" } elseif ($freeGB -gt 50) { "Yellow" } else { "Red" }
Write-Host "Free space: $freeGB GB" -ForegroundColor $color

# 7. Check running services
Write-Host "`nDocker Services:" -ForegroundColor Cyan
try {
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
} catch {
    Write-Host "No services running" -ForegroundColor Yellow
}

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "Health check complete" -ForegroundColor Cyan
```

---

## 🔧 Installation Issues

### Issue: GUI Installer Won't Start

**Symptoms**:
- `npm run dev` fails
- Browser doesn't open
- Port 5173 already in use

**Solutions**:

```powershell
# 1. Clear npm cache
npm cache clean --force

# 2. Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install

# 3. Check if port 5173 is in use
netstat -ano | findstr :5173

# If port is in use, kill the process:
$processId = (netstat -ano | findstr :5173 | ForEach-Object { $_.Split()[-1] }) | Select-Object -First 1
taskkill /PID $processId /F

# 4. Start with verbose logging
npm run dev -- --verbose

# 5. Try alternative port
npm run dev -- --port 5174
```

### Issue: Installation Hangs at "Pulling Images"

**Symptoms**:
- Docker image download stuck at 0%
- No progress for >10 minutes
- Network timeout errors

**Solutions**:

```powershell
# 1. Check internet connection
Test-NetConnection google.com

# 2. Check Docker Hub connectivity
Test-NetConnection hub.docker.com -Port 443

# 3. Restart Docker Desktop
Restart-Service docker

# 4. Check disk space
Get-PSDrive C | Select-Object Used,Free
# Need at least 50GB free

# 5. Clear Docker cache
docker system prune -a --volumes

# 6. Change Docker mirror (if in restricted region)
# Docker Desktop → Settings → Docker Engine
# Add:
{
  "registry-mirrors": ["https://mirror.gcr.io"]
}

# 7. Manual image pull
docker pull postgres:15
docker pull redis:7-alpine
docker pull qdrant/qdrant:latest

# 8. Check firewall/antivirus
# Temporarily disable and retry
```

### Issue: Permission Denied Errors

**Symptoms**:
- "Access denied" when writing configuration
- "Admin privileges required"
- Cannot create directories

**Solutions**:

```powershell
# 1. Run PowerShell as Administrator
Start-Process powershell -Verb RunAs

# 2. Grant permissions to bootstrap directory
$bootstrapPath = "C:\Dev\Projects\Repos\Project-Nyra\bootstrap"
icacls $bootstrapPath /grant ${env:USERNAME}:F /t

# 3. Check UAC settings
# Control Panel → User Accounts → Change User Account Control
# Set to "Notify only when apps try to make changes"

# 4. Run installer with elevated privileges
Start-Process npm -ArgumentList "run", "dev" -Verb RunAs
```

### Issue: Configuration Not Saving

**Symptoms**:
- .env file changes don't persist
- Settings reset after restart
- "Configuration saved" message but no file created

**Solutions**:

```powershell
# 1. Check write permissions
$configPath = "$env:APPDATA\nyra-bootstrap-gui"
Test-Path $configPath

# If not exists, create it:
New-Item -ItemType Directory -Path $configPath -Force

# 2. Grant full control
icacls $configPath /grant ${env:USERNAME}:F /t

# 3. Check disk space
Get-PSDrive C | Select-Object Free

# 4. Verify configuration file location
dir "$env:APPDATA\nyra-bootstrap-gui\*.json"

# 5. Manual configuration save
$config = @{
    pcId = "pc1"
    pcRole = "orchestrator"
    environment = "development"
} | ConvertTo-Json

Set-Content -Path "$env:APPDATA\nyra-bootstrap-gui\bootstrap-config.json" -Value $config

# 6. Check antivirus exceptions
# Add exception for:
# - C:\Dev\Projects\Repos\Project-Nyra\bootstrap\
# - %APPDATA%\nyra-bootstrap-gui\
```

---

## 🐳 Docker Issues

### Issue: Docker Desktop Won't Start

**Symptoms**:
- "Docker Desktop starting..." forever
- "WSL 2 installation is incomplete"
- "Hardware assisted virtualization is not available"

**Solutions**:

```powershell
# 1. Check WSL 2 is installed
wsl --list --verbose

# If not installed:
wsl --install
wsl --set-default-version 2

# 2. Enable required Windows features
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# 3. Enable virtualization in BIOS
# Restart → Enter BIOS → Enable:
# - Intel VT-x / AMD-V
# - Intel VT-d / AMD IOMMU

# 4. Check Hyper-V is enabled
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V
# Should show: State = Enabled

# If not enabled:
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

# 5. Reset Docker Desktop
& "C:\Program Files\Docker\Docker\Docker Desktop.exe" --reset-to-factory-defaults

# 6. Reinstall Docker Desktop
winget uninstall Docker.DockerDesktop
winget install Docker.DockerDesktop

# 7. Check Windows version
# Docker Desktop requires Windows 11 Pro build 22000+
winver
```

### Issue: Containers Keep Restarting

**Symptoms**:
- Container status shows "Restarting"
- "Exited (137)" or "Exited (1)"
- Services unhealthy

**Solutions**:

```powershell
# 1. Check container logs
docker compose logs <service-name>

# 2. Check Docker resources
# Docker Desktop → Settings → Resources
# Ensure:
# - Memory: 16GB+ (orchestrator) or 48GB+ (workers)
# - CPUs: 6+ cores
# - Disk: 500GB+

# 3. Check for port conflicts
netstat -ano | findstr :<port>

# If port in use:
# Option A: Kill process
taskkill /PID <pid> /F

# Option B: Change port in .env
# Edit .env file:
POSTGRES_PORT=5433  # Instead of 5432

# 4. Check memory limits
docker stats

# If memory > 90%, increase Docker memory:
# Docker Desktop → Settings → Resources → Memory: 20GB

# 5. Check container health
docker inspect <container-name> | Select-String "Health"

# 6. Restart single service
docker compose restart <service-name>

# 7. Nuclear option: restart all
docker compose down
docker compose up -d
```

### Issue: "no space left on device"

**Symptoms**:
- Cannot pull images
- Cannot create containers
- "no space left on device" error

**Solutions**:

```powershell
# 1. Check Docker disk usage
docker system df

# 2. Remove unused data
docker system prune -a --volumes

# Aggressive cleanup:
docker container prune -f
docker image prune -a -f
docker volume prune -f
docker network prune -f

# 3. Check host disk space
Get-PSDrive C | Select-Object Used,Free

# 4. Increase Docker disk limit
# Docker Desktop → Settings → Resources → Disk image size: 1TB

# 5. Move Docker data directory
# Docker Desktop → Settings → Resources → Advanced
# Docker Desktop → Settings → Docker Engine:
{
  "data-root": "D:\\docker-data"
}

# 6. Clean WSL disk space
wsl --shutdown
Optimize-VHD -Path "$env:LOCALAPPDATA\Docker\wsl\data\ext4.vhdx" -Mode Full

# 7. Check for large log files
docker ps -q | ForEach-Object {
    docker inspect $_ | Select-String "LogPath"
}

# Truncate logs:
docker compose down
Remove-Item "C:\ProgramData\Docker\containers\*\*-json.log"
docker compose up -d
```

---

## 🎮 GPU Issues

### Issue: nvidia-smi Command Not Found

**Symptoms**:
- "nvidia-smi is not recognized"
- No GPU detected
- Docker can't access GPU

**Solutions**:

```powershell
# 1. Verify GPU is installed
Get-PnpDevice -Class Display

# 2. Install/Update NVIDIA drivers
# Option A: GeForce Experience
winget install Nvidia.GeForceExperience

# Option B: Manual download
# Visit: https://www.nvidia.com/Download/index.aspx

# 3. Add NVIDIA to PATH
$nvidiaSmiPath = "C:\Program Files\NVIDIA Corporation\NVSMI"
$env:Path += ";$nvidiaSmiPath"
[Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)

# 4. Restart computer
shutdown /r /t 0

# 5. Verify installation
nvidia-smi

# 6. Check driver version
nvidia-smi --query-gpu=driver_version --format=csv,noheader
# Required: 535.0+
```

### Issue: Docker Container Can't Access GPU

**Symptoms**:
- "could not select device driver"
- "CUDA error: no CUDA-capable device"
- nvidia-smi works on host but not in container

**Solutions**:

```powershell
# 1. Verify NVIDIA Container Toolkit is installed
wsl -d Ubuntu
dpkg -l | grep nvidia-container-toolkit

# If not installed:
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker

# 2. Configure Docker daemon
# Edit: C:\ProgramData\Docker\config\daemon.json
{
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime",
      "runtimeArgs": []
    }
  },
  "default-runtime": "nvidia"
}

# Restart Docker
Restart-Service docker

# 3. Test GPU access
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi

# 4. Check Docker Compose GPU configuration
# In docker-compose.yml:
services:
  ollama:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

# 5. Verify GPU is visible to Docker
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi

# 6. Check WSL integration
# Docker Desktop → Settings → Resources → WSL Integration
# Enable Ubuntu distribution
```

### Issue: CUDA Out of Memory

**Symptoms**:
- "CUDA error: out of memory"
- "RuntimeError: CUDA out of memory"
- Model won't load

**Solutions**:

```powershell
# 1. Check VRAM usage
nvidia-smi --query-gpu=memory.used,memory.total --format=csv

# 2. Clear GPU memory
docker restart <container-name>

# 3. Use smaller/quantized models
# RTX 3060 12GB:
docker exec ollama ollama pull deepseek-coder:6.7b  # Instead of 13b

# RTX 4090 24GB:
docker exec ollama ollama pull deepseek-r1:70b-q4_K_M  # Instead of Q8

# 4. Reduce concurrent requests
# Edit .env:
OLLAMA_NUM_PARALLEL=1  # Instead of 4
OLLAMA_MAX_LOADED_MODELS=1  # Instead of 3

# 5. Reduce context length
OLLAMA_CONTEXT_LENGTH=4096  # Instead of 16384

# 6. Kill other GPU processes
nvidia-smi
# Note PIDs, then:
taskkill /PID <pid> /F

# 7. Monitor VRAM in real-time
nvidia-smi dmon -s m -c 10
```

### Issue: Low GPU Utilization

**Symptoms**:
- GPU utilization < 50% during inference
- Slow model generation
- CPU bottleneck

**Solutions**:

```powershell
# 1. Verify GPU is being used
docker exec <container> nvidia-smi

# 2. Enable all GPU layers
# Edit .env:
OLLAMA_NUM_GPU=1
OLLAMA_GPU_LAYERS=-1

# 3. Check PCIe bandwidth
nvidia-smi --query-gpu=pcie.link.gen.current,pcie.link.width.current --format=csv

# Expected: Gen4/Gen5, x16 lanes
# If not:
# - Check GPU is in correct PCIe slot
# - Update motherboard BIOS
# - Verify PCIe settings in BIOS

# 4. Enable persistence mode
nvidia-smi -pm 1

# 5. Check thermal throttling
nvidia-smi --query-gpu=temperature.gpu,clocks_throttle_reasons.active --format=csv

# If throttling:
# - Improve cooling
# - Reduce power limit: nvidia-smi -pl 400

# 6. Optimize Ollama settings
OLLAMA_FLASH_ATTENTION=true
OLLAMA_BATCH_SIZE=512

# 7. Check for CPU bottleneck
Get-Counter '\Processor(_Total)\% Processor Time'

# If CPU > 90%:
# - Upgrade CPU
# - Close background applications
```

---

## 🌐 Network Issues

### Issue: Static IP Won't Persist

**Symptoms**:
- IP reverts to DHCP after restart
- Network connectivity lost
- "Duplicate IP address" warning

**Solutions**:

```powershell
# 1. Verify DHCP is disabled
Get-NetIPAddress -InterfaceAlias "Ethernet" -AddressFamily IPv4

# 2. Remove DHCP configuration
Remove-NetIPAddress -InterfaceAlias "Ethernet" -AddressFamily IPv4 -Confirm:$false
Remove-NetRoute -InterfaceAlias "Ethernet" -Confirm:$false

# 3. Set static IP again
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.1.101 -PrefixLength 24 -DefaultGateway 192.168.1.1
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("8.8.8.8","8.8.4.4")

# 4. Disable IPv6 (if causing issues)
Disable-NetAdapterBinding -Name "Ethernet" -ComponentID ms_tcpip6

# 5. Check for conflicting IP
Test-NetConnection -ComputerName 192.168.1.101

# If another device responds, change IP:
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.1.105 -PrefixLength 24 -DefaultGateway 192.168.1.1

# 6. Make persistent via registry
# HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces\{interface-guid}
# Set EnableDHCP = 0
```

### Issue: Can't Reach Services from Other PCs

**Symptoms**:
- Connection timeout
- "No route to host"
- Firewall blocking

**Solutions**:

```powershell
# 1. Test local connectivity
Test-NetConnection -ComputerName localhost -Port 5432

# 2. Test from another PC
# On remote PC:
Test-NetConnection -ComputerName 192.168.1.101 -Port 5432

# 3. Check firewall rules
Get-NetFirewallRule -DisplayName "PostgreSQL"

# If not exists, create:
New-NetFirewallRule -DisplayName "PostgreSQL" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 5432 `
    -Action Allow

# 4. Check service is listening
netstat -ano | findstr :5432

# Should show: 0.0.0.0:5432 (listening on all interfaces)

# If shows 127.0.0.1:5432:
# Edit docker-compose.yml:
ports:
  - "0.0.0.0:5432:5432"  # Bind to all interfaces

# 5. Temporarily disable Windows Firewall (for testing)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Test connection, then re-enable:
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

# 6. Check router/switch
# Verify all PCs are on same subnet
# Ping between PCs:
ping 192.168.1.102

# 7. Check Tailscale connectivity
tailscale status
tailscale ping 10.0.0.2
```

### Issue: Tailscale Won't Connect

**Symptoms**:
- "Failed to connect to coordination server"
- Authentication loop
- Can't see other devices

**Solutions**:

```powershell
# 1. Check Tailscale service
Get-Service Tailscale

# If not running:
Start-Service Tailscale

# 2. Re-authenticate
tailscale logout
tailscale up

# 3. Check firewall
New-NetFirewallRule -DisplayName "Tailscale" `
    -Direction Inbound `
    -Protocol UDP `
    -LocalPort 41641 `
    -Action Allow

# 4. Verify internet connectivity
Test-NetConnection login.tailscale.com -Port 443

# 5. Check for proxy/VPN conflicts
# Disable other VPNs temporarily

# 6. Reset Tailscale
tailscale down
tailscale up --reset

# 7. Check Tailscale logs
# %ProgramData%\Tailscale\tailscaled.log

# 8. Reinstall Tailscale
winget uninstall Tailscale.Tailscale
winget install Tailscale.Tailscale
tailscale up
```

---

## 🔧 Service-Specific Issues

### PostgreSQL Issues

**Issue: "password authentication failed"**

```powershell
# 1. Check environment variables
docker exec nyra-postgres env | findstr POSTGRES

# 2. Reset password
docker exec nyra-postgres psql -U postgres -c "ALTER USER nyra_admin PASSWORD 'new_password';"

# Update .env file:
POSTGRES_PASSWORD=new_password

# Restart service
docker compose restart postgres

# 3. Verify connection
docker exec nyra-postgres psql -U nyra_admin -d nyra -c "SELECT version();"
```

**Issue: "too many connections"**

```powershell
# 1. Check current connections
docker exec nyra-postgres psql -U nyra_admin -d nyra -c "SELECT count(*) FROM pg_stat_activity;"

# 2. Increase max connections
docker exec nyra-postgres psql -U postgres -c "ALTER SYSTEM SET max_connections = 200;"

# Restart PostgreSQL
docker compose restart postgres

# 3. Close idle connections
docker exec nyra-postgres psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';"
```

### Redis Issues

**Issue: "Connection refused"**

```powershell
# 1. Check Redis is running
docker ps | findstr redis

# 2. Check logs
docker compose logs redis

# 3. Test connection
docker exec nyra-redis redis-cli ping
# Expected: PONG

# 4. Check port
docker exec nyra-redis redis-cli -p 6379 INFO server

# 5. Restart Redis
docker compose restart redis
```

**Issue: "OOM command not allowed"**

```powershell
# 1. Check memory usage
docker exec nyra-redis redis-cli INFO memory

# 2. Increase memory limit
# Edit docker-compose.yml:
services:
  redis:
    deploy:
      resources:
        limits:
          memory: 4G  # Instead of 2G

# 3. Clear cache
docker exec nyra-redis redis-cli FLUSHALL

# 4. Enable eviction policy
docker exec nyra-redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### Qdrant Issues

**Issue: "collection not found"**

```powershell
# 1. List collections
curl http://localhost:6333/collections

# 2. Create collection
$body = @{
    vectors = @{
        size = 384
        distance = "Cosine"
    }
} | ConvertTo-Json

curl http://localhost:6333/collections/test `
    -Method PUT `
    -ContentType "application/json" `
    -Body $body

# 3. Verify creation
curl http://localhost:6333/collections/test
```

### Ollama Issues

**Issue: "model not found"**

```powershell
# 1. List installed models
docker exec nyra-ollama-pc2 ollama list

# 2. Pull model
docker exec nyra-ollama-pc2 ollama pull deepseek-coder:6.7b

# 3. Verify model
docker exec nyra-ollama-pc2 ollama show deepseek-coder:6.7b

# 4. Check disk space
docker exec nyra-ollama-pc2 df -h

# 5. Clear model cache
docker exec nyra-ollama-pc2 rm -rf /root/.ollama/models/blobs/*
```

---

## ⚡ Performance Issues

### Issue: High CPU Usage

**Solutions**:

```powershell
# 1. Identify culprit
docker stats --no-stream

# 2. Check host CPU
Get-Counter '\Processor(_Total)\% Processor Time'

# 3. Limit container CPU
# Edit docker-compose.yml:
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2.0'

# 4. Close unnecessary services
docker compose stop <service-name>

# 5. Check for runaway processes
docker exec <container> top

# 6. Optimize queries (PostgreSQL)
docker exec nyra-postgres psql -U nyra_admin -d nyra -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

### Issue: High Memory Usage

**Solutions**:

```powershell
# 1. Check memory usage
docker stats

# 2. Increase Docker memory
# Docker Desktop → Settings → Resources → Memory: 24GB

# 3. Set memory limits per service
# Edit docker-compose.yml:
services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G

# 4. Restart services
docker compose restart

# 5. Check for memory leaks
docker stats --format "table {{.Name}}\t{{.MemUsage}}" --no-stream

# Monitor over time:
while ($true) { docker stats --no-stream; Start-Sleep 60 }
```

### Issue: Slow Disk I/O

**Solutions**:

```powershell
# 1. Check disk usage
docker system df

# 2. Use faster disk for Docker
# Move Docker data to NVMe SSD:
# Docker Desktop → Settings → Resources → Advanced
# Set data-root to SSD location

# 3. Optimize PostgreSQL
docker exec nyra-postgres psql -U postgres -c "ALTER SYSTEM SET shared_buffers = '4GB';"
docker exec nyra-postgres psql -U postgres -c "ALTER SYSTEM SET effective_cache_size = '12GB';"
docker compose restart postgres

# 4. Use tmpfs for temporary data
# Edit docker-compose.yml:
services:
  redis:
    tmpfs:
      - /tmp

# 5. Check disk health
wmic diskdrive get status
# Should show: OK
```

---

## 💾 Data Recovery

### Backup Configuration

```powershell
# Create backup
$backupDir = "C:\Backups\Nyra\$(Get-Date -Format 'yyyy-MM-dd_HH-mm')"
New-Item -ItemType Directory -Path $backupDir

# Backup .env files
Copy-Item .env.* $backupDir

# Backup docker-compose.yml
Copy-Item docker-compose.yml $backupDir

# Backup Docker volumes
docker run --rm -v nyra_postgres-data:/data -v ${backupDir}:/backup ubuntu tar czf /backup/postgres-data.tar.gz /data
```

### Restore Configuration

```powershell
# Stop services
docker compose down

# Restore volumes
$backupDir = "C:\Backups\Nyra\2026-01-15_10-00"
docker run --rm -v nyra_postgres-data:/data -v ${backupDir}:/backup ubuntu tar xzf /backup/postgres-data.tar.gz -C /

# Restore configuration
Copy-Item $backupDir\.env.* .
Copy-Item $backupDir\docker-compose.yml .

# Start services
docker compose up -d
```

### Disaster Recovery

```powershell
# 1. Save current state
docker compose down
docker commit <container-name> backup-image

# 2. Export volumes
docker volume ls | ForEach-Object {
    $volume = $_.Name
    docker run --rm -v ${volume}:/data -v C:\Backups:/backup ubuntu tar czf /backup/${volume}.tar.gz /data
}

# 3. Reinstall from scratch
docker system prune -a --volumes

# 4. Restore volumes
Get-ChildItem C:\Backups\*.tar.gz | ForEach-Object {
    $volume = $_.BaseName
    docker volume create $volume
    docker run --rm -v ${volume}:/data -v C:\Backups:/backup ubuntu tar xzf /backup/$($_.Name) -C /
}

# 5. Restart services
docker compose up -d
```

---

## ❌ Common Error Messages

### "Error response from daemon: conflict: unable to remove repository reference"

```powershell
docker image rm -f <image-name>
```

### "Error starting userland proxy: listen tcp 0.0.0.0:5432: bind: Only one usage of each socket address"

```powershell
# Port is in use
netstat -ano | findstr :5432
taskkill /PID <pid> /F

# Or change port in .env:
POSTGRES_PORT=5433
```

### "Driver failed programming external connectivity on endpoint"

```powershell
# Restart Docker
Restart-Service docker

# Or restart computer
shutdown /r /t 0
```

### "toomanyrequests: You have reached your pull rate limit"

```powershell
# Login to Docker Hub
docker login

# Or use mirror:
# Docker Desktop → Settings → Docker Engine
{
  "registry-mirrors": ["https://mirror.gcr.io"]
}
```

---

## 📚 Additional Resources

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[SETUP-ORCHESTRATOR.md](SETUP-ORCHESTRATOR.md)** - PC1 setup
- **[SETUP-WORKER-RTX4090.md](SETUP-WORKER-RTX4090.md)** - PC2/3 setup
- **[SETUP-WORKER-RTX3060.md](SETUP-WORKER-RTX3060.md)** - PC4 setup
- **[INSTALLER-GUIDE.md](INSTALLER-GUIDE.md)** - GUI installer guide
- **[Docker Documentation](https://docs.docker.com/reference/)** - Docker reference
- **[NVIDIA Documentation](https://docs.nvidia.com/)** - GPU troubleshooting

---

## 🆘 Getting Help

If issues persist:

1. **Run diagnostics**: `bootstrap-health-check.ps1`
2. **Collect logs**:
   ```powershell
   docker compose logs > docker-logs.txt
   docker info > docker-info.txt
   nvidia-smi > gpu-info.txt
   ```
3. **Open GitHub issue**: Include logs and system info
4. **Discord/Community**: Join Project Nyra community

---

**Last Updated**: January 15, 2026
