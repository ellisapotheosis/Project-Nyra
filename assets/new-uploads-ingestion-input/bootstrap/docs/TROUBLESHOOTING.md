# Project-Nyra Troubleshooting Guide

Comprehensive troubleshooting guide for common issues in the Project-Nyra cluster.

## Table of Contents

- [Network Issues](#network-issues)
- [Docker Problems](#docker-problems)
- [WSL Issues](#wsl-issues)
- [Service Problems](#service-problems)
- [GPU Issues](#gpu-issues)
- [Performance Problems](#performance-problems)
- [Backup and Recovery](#backup-and-recovery)

## Network Issues

### PC Not Reachable

**Symptoms:**
- Cannot ping PC
- DNS resolution fails
- Services unreachable

**Diagnosis:**
```powershell
# Test connectivity
Test-Connection -ComputerName worker-rtx3090ti
Test-Connection -ComputerName 192.168.1.11

# Check DNS resolution
Resolve-DnsName worker-rtx3090ti

# View hosts file
Get-Content C:\Windows\System32\drivers\etc\hosts
```

**Solutions:**

1. **Check physical connectivity:**
   - Verify network cables
   - Check switch/router status
   - Ensure PCs are powered on

2. **Verify IP configuration:**
   ```powershell
   Get-NetIPAddress
   Get-NetIPConfiguration
   ```

3. **Update hosts file:**
   ```powershell
   # Run bootstrap network stage
   .\scripts\bootstrap-all.ps1 -Stage network
   ```

4. **Check Windows Firewall:**
   ```powershell
   Get-NetFirewallProfile
   Get-NetFirewallRule -Enabled True | Where-Object {$_.DisplayName -match "Docker"}
   ```

### High Network Latency

**Symptoms:**
- Slow response times
- Timeouts
- Prometheus alerts

**Diagnosis:**
```powershell
# Measure latency
Test-Connection -ComputerName 192.168.1.11 -Count 10 | Measure-Object -Property ResponseTime -Average

# Check network adapter status
Get-NetAdapter
Get-NetAdapterStatistics
```

**Solutions:**

1. **Check for network congestion:**
   ```powershell
   Get-NetAdapterStatistics | Select-Object Name, ReceivedBytes, SentBytes
   ```

2. **Disable power management on network adapter:**
   - Open Device Manager
   - Network adapters → Properties → Power Management
   - Uncheck "Allow the computer to turn off this device"

3. **Update network drivers**

### DNS Resolution Fails

**Symptoms:**
- Can ping by IP but not hostname
- Services fail to connect

**Diagnosis:**
```powershell
# Test DNS
Resolve-DnsName worker-rtx3090ti
nslookup worker-rtx3090ti

# Check DNS servers
Get-DnsClientServerAddress
```

**Solutions:**

1. **Flush DNS cache:**
   ```powershell
   Clear-DnsClientCache
   ipconfig /flushdns
   ```

2. **Re-run network bootstrap:**
   ```powershell
   .\scripts\bootstrap-all.ps1 -Stage network
   ```

3. **Manually add hosts entries:**
   ```powershell
   Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "192.168.1.11`tworker-rtx3090ti"
   ```

## Docker Problems

### Docker Service Won't Start

**Symptoms:**
- Docker Desktop shows error
- `docker ps` fails
- Services won't start

**Diagnosis:**
```powershell
# Check Docker service
Get-Service com.docker.service
docker version
docker info
```

**Solutions:**

1. **Restart Docker Desktop:**
   ```powershell
   Restart-Service com.docker.service
   # Or restart from GUI
   ```

2. **Check WSL backend:**
   ```powershell
   wsl --status
   wsl --list --verbose
   ```

3. **Reset Docker to factory defaults:**
   - Docker Desktop → Troubleshoot → Reset to factory defaults

4. **Reinstall Docker Desktop:**
   - Uninstall Docker Desktop
   - Restart PC
   - Install latest version

### Container Won't Start

**Symptoms:**
- Container shows "Exited" status
- Services unreachable
- Error messages in logs

**Diagnosis:**
```powershell
# Check container status
docker ps -a

# View logs
docker logs container-name

# Inspect container
docker inspect container-name
```

**Solutions:**

1. **Check logs for errors:**
   ```powershell
   docker logs --tail 100 container-name
   ```

2. **Verify port conflicts:**
   ```powershell
   netstat -ano | findstr :3000
   ```

3. **Check resource limits:**
   ```powershell
   docker stats container-name
   ```

4. **Recreate container:**
   ```powershell
   cd orchestrator-mini\docker
   docker-compose down
   docker-compose up -d
   ```

5. **Check Docker network:**
   ```powershell
   docker network ls
   docker network inspect nyra-network
   ```

### High Container Restart Count

**Symptoms:**
- Container keeps restarting
- Prometheus alerts
- Services intermittently unavailable

**Diagnosis:**
```powershell
# Check restart count
docker inspect container-name --format '{{.RestartCount}}'

# View recent logs
docker logs --tail 200 container-name
```

**Solutions:**

1. **Identify crash cause:**
   ```powershell
   docker logs --tail 500 container-name | Select-String "error|fatal|crash"
   ```

2. **Check resource constraints:**
   ```powershell
   docker stats container-name
   ```

3. **Increase memory limits:**
   Edit docker-compose.yml:
   ```yaml
   services:
     service-name:
       deploy:
         resources:
           limits:
             memory: 4G
   ```

4. **Check dependencies:**
   Ensure dependent services are running:
   ```powershell
   docker-compose ps
   ```

## WSL Issues

### WSL Won't Start

**Symptoms:**
- `wsl` command fails
- Docker backend error
- "WSL 2 not enabled" message

**Diagnosis:**
```powershell
# Check WSL status
wsl --status
wsl --list --verbose

# Check Windows features
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform
```

**Solutions:**

1. **Restart WSL:**
   ```powershell
   wsl --shutdown
   wsl --list
   ```

2. **Enable required features:**
   ```powershell
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   Restart-Computer
   ```

3. **Reinstall WSL:**
   ```powershell
   wsl --unregister Ubuntu-24.04
   .\orchestrator-mini\wsl\setup-wsl.ps1
   ```

4. **Update WSL:**
   ```powershell
   wsl --update
   ```

### WSL High Memory Usage

**Symptoms:**
- Windows running slow
- High memory usage in Task Manager
- WSL using more memory than configured

**Diagnosis:**
```powershell
# Check WSL memory
wsl --list --verbose
Get-Process vmmem | Select-Object WorkingSet64
```

**Solutions:**

1. **Update .wslconfig:**
   ```powershell
   # Edit %USERPROFILE%\.wslconfig
   [wsl2]
   memory=16GB
   processors=8
   ```

2. **Restart WSL:**
   ```powershell
   wsl --shutdown
   ```

3. **Enable memory reclaim:**
   Add to .wslconfig:
   ```
   [experimental]
   autoMemoryReclaim=gradual
   ```

### WSL Disk Space Issues

**Symptoms:**
- "No space left on device"
- WSL performance degraded
- Docker build fails

**Diagnosis:**
```powershell
# Check disk usage in WSL
wsl df -h

# Check virtual disk size
Get-ChildItem "$env:LOCALAPPDATA\Packages\*Ubuntu*\LocalState\*.vhdx" | Select-Object Name, Length
```

**Solutions:**

1. **Compact WSL disk:**
   ```powershell
   wsl --shutdown

   # Run in PowerShell
   Optimize-VHD -Path "$env:LOCALAPPDATA\Packages\CanonicalGroupLimited.Ubuntu22.04LTS_79rhkp1fndgsc\LocalState\ext4.vhdx" -Mode Full
   ```

2. **Clean Docker:**
   ```powershell
   wsl docker system prune -a --volumes
   ```

3. **Clean package cache:**
   ```powershell
   wsl sudo apt-get clean
   wsl sudo apt-get autoclean
   ```

## Service Problems

### Gitea Not Accessible

**Symptoms:**
- Cannot access http://orchestrator-mini:3000
- Connection timeout
- 502 Bad Gateway

**Diagnosis:**
```powershell
# Check Gitea container
docker ps | findstr gitea
docker logs nyra-gitea

# Test port
Test-NetConnection -ComputerName localhost -Port 3000
```

**Solutions:**

1. **Restart Gitea:**
   ```powershell
   cd orchestrator-mini\gitea
   docker-compose restart gitea
   ```

2. **Check database:**
   ```powershell
   docker logs nyra-gitea-db
   docker exec nyra-gitea-db pg_isready -U gitea
   ```

3. **Verify configuration:**
   ```powershell
   docker exec nyra-gitea cat /etc/gitea/app.ini
   ```

4. **Reinstall Gitea:**
   ```powershell
   cd orchestrator-mini\gitea
   docker-compose down
   .\install-gitea.ps1
   ```

### Grafana Login Issues

**Symptoms:**
- Cannot login
- Forgot password
- Account locked

**Solutions:**

1. **Reset admin password:**
   ```powershell
   docker exec nyra-grafana grafana-cli admin reset-admin-password admin
   ```

2. **Create new admin:**
   ```powershell
   docker exec nyra-grafana grafana-cli admin create-user --name admin2 --password admin2 --admin
   ```

3. **Check Grafana logs:**
   ```powershell
   docker logs nyra-grafana
   ```

### Prometheus Not Scraping Metrics

**Symptoms:**
- Missing metrics in Grafana
- Targets showing "DOWN" in Prometheus
- Alert rules not firing

**Diagnosis:**
```powershell
# Check Prometheus targets
Start-Process "http://orchestrator-mini:9090/targets"

# Check Prometheus config
docker exec nyra-prometheus cat /etc/prometheus/prometheus.yml
```

**Solutions:**

1. **Verify target connectivity:**
   ```powershell
   Test-NetConnection -ComputerName 192.168.1.11 -Port 9100
   ```

2. **Reload Prometheus config:**
   ```powershell
   docker exec nyra-prometheus promtool check config /etc/prometheus/prometheus.yml
   docker restart nyra-prometheus
   ```

3. **Check exporter services:**
   ```powershell
   docker ps | findstr exporter
   ```

### Ollama Not Responding

**Symptoms:**
- Model loading fails
- Inference timeout
- Cannot connect to Ollama

**Diagnosis:**
```powershell
# Check Ollama status
docker logs worker-ollama-3090ti

# Test endpoint
Invoke-WebRequest -Uri "http://worker-rtx3090ti:11434"
```

**Solutions:**

1. **Restart Ollama:**
   ```powershell
   docker restart worker-ollama-3090ti
   ```

2. **Check GPU access:**
   ```powershell
   docker exec worker-ollama-3090ti nvidia-smi
   ```

3. **Verify models:**
   ```powershell
   docker exec worker-ollama-3090ti ollama list
   ```

4. **Check resources:**
   ```powershell
   docker stats worker-ollama-3090ti
   ```

## GPU Issues

### GPU Not Detected

**Symptoms:**
- nvidia-smi fails
- Containers cannot access GPU
- CUDA errors

**Diagnosis:**
```powershell
# Check NVIDIA drivers
nvidia-smi

# Check Docker GPU support
docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi
```

**Solutions:**

1. **Update NVIDIA drivers:**
   - Download latest drivers from NVIDIA website
   - Install and restart

2. **Install NVIDIA Container Toolkit:**
   ```powershell
   # In WSL
   wsl
   distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
   curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
   curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
     sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
     sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
   sudo apt-get update
   sudo apt-get install -y nvidia-container-toolkit
   sudo systemctl restart docker
   ```

3. **Verify Docker GPU runtime:**
   ```powershell
   docker info | findstr "Runtimes"
   ```

### GPU Temperature Too High

**Symptoms:**
- Prometheus alerts
- GPU throttling
- Performance degradation

**Diagnosis:**
```powershell
# Check GPU temperature
nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader
```

**Solutions:**

1. **Improve cooling:**
   - Clean dust from GPU fans
   - Improve case airflow
   - Increase fan speed

2. **Reduce workload:**
   ```powershell
   # Stop unnecessary GPU containers
   docker stop container-name
   ```

3. **Set power limit:**
   ```powershell
   nvidia-smi -pl 300  # Set to 300W (adjust for your GPU)
   ```

### Out of GPU Memory

**Symptoms:**
- CUDA out of memory errors
- Model loading fails
- Container crashes

**Diagnosis:**
```powershell
# Check GPU memory usage
nvidia-smi --query-gpu=memory.used,memory.total --format=csv,noheader
```

**Solutions:**

1. **Stop unused containers:**
   ```powershell
   docker ps --filter "status=running"
   docker stop container-name
   ```

2. **Use smaller models:**
   - Load quantized models (4-bit, 8-bit)
   - Use smaller variants

3. **Adjust batch size:**
   - Reduce inference batch size
   - Use gradient checkpointing for training

## Performance Problems

### High CPU Usage

**Symptoms:**
- System slow/unresponsive
- Prometheus alerts
- Fan noise

**Diagnosis:**
```powershell
# Check CPU usage
Get-Counter '\Processor(_Total)\% Processor Time'

# Top processes
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10
```

**Solutions:**

1. **Identify resource-hungry containers:**
   ```powershell
   docker stats --no-stream
   ```

2. **Set CPU limits:**
   Edit docker-compose.yml:
   ```yaml
   services:
     service-name:
       deploy:
         resources:
           limits:
             cpus: '4.0'
   ```

3. **Optimize services:**
   - Reduce concurrent workers
   - Adjust process counts

### High Memory Usage

**Symptoms:**
- System slow
- Swapping/paging
- Out of memory errors

**Diagnosis:**
```powershell
# Check memory usage
Get-Counter '\Memory\% Committed Bytes In Use'

# Check Docker memory
docker stats --no-stream
```

**Solutions:**

1. **Set memory limits:**
   ```yaml
   services:
     service-name:
       deploy:
         resources:
           limits:
             memory: 4G
   ```

2. **Enable memory swapping:**
   ```yaml
   services:
     service-name:
       mem_swappiness: 60
   ```

3. **Restart memory-hungry services:**
   ```powershell
   docker restart container-name
   ```

### Disk I/O Bottleneck

**Symptoms:**
- Slow response times
- High disk queue length
- Container performance issues

**Diagnosis:**
```powershell
# Check disk performance
Get-Counter '\PhysicalDisk(_Total)\Avg. Disk Queue Length'
Get-Counter '\PhysicalDisk(_Total)\% Disk Time'
```

**Solutions:**

1. **Move Docker data to SSD:**
   - Docker Desktop → Settings → Resources → Advanced
   - Change disk image location

2. **Clean up unused data:**
   ```powershell
   docker system prune -a --volumes
   ```

3. **Use tmpfs for temporary data:**
   ```yaml
   services:
     service-name:
       tmpfs:
         - /tmp
   ```

## Backup and Recovery

### Backup Fails

**Symptoms:**
- Backup script errors
- Incomplete backups
- Permission denied

**Diagnosis:**
```powershell
# Check backup logs
Get-Content C:\nyra\backups\logs\backup-*.log

# Test backup path
Test-Path C:\nyra\backups
```

**Solutions:**

1. **Run as administrator:**
   ```powershell
   # Right-click PowerShell → Run as Administrator
   .\shared\scripts\backup-system.ps1
   ```

2. **Check disk space:**
   ```powershell
   Get-PSDrive C
   ```

3. **Verify permissions:**
   ```powershell
   Get-Acl C:\nyra\backups
   ```

### Restore from Backup

**Steps:**

1. **Locate backup archive:**
   ```powershell
   Get-ChildItem C:\nyra\backups\full
   ```

2. **Extract archive:**
   ```powershell
   Expand-Archive -Path backup-file.zip -DestinationPath C:\temp\restore
   ```

3. **Stop services:**
   ```powershell
   docker-compose down
   ```

4. **Restore volumes:**
   ```powershell
   # Restore each volume
   docker volume create volume-name
   docker run --rm -v volume-name:/target -v C:\temp\restore\volumes:/source alpine sh -c "cd /target && tar xzf /source/volume-name.tar.gz"
   ```

5. **Restore configurations:**
   ```powershell
   Copy-Item -Path C:\temp\restore\configs\* -Destination bootstrap\ -Recurse -Force
   ```

6. **Start services:**
   ```powershell
   docker-compose up -d
   ```

7. **Validate:**
   ```powershell
   .\scripts\validate-bootstrap.ps1
   ```

## Getting Help

If you're still experiencing issues:

1. **Check logs:**
   - Docker: `docker logs container-name`
   - Bootstrap: `bootstrap\logs\`
   - Windows Event Viewer

2. **Run diagnostics:**
   ```powershell
   .\scripts\validate-bootstrap.ps1 -DetailedReport
   .\shared\scripts\health-check.ps1 -DetailedReport
   ```

3. **Collect system information:**
   ```powershell
   Get-ComputerInfo > system-info.txt
   docker info > docker-info.txt
   wsl --status > wsl-info.txt
   ```

4. **Create issue** in Gitea with:
   - Problem description
   - Error messages
   - Steps to reproduce
   - System information
   - Relevant logs
