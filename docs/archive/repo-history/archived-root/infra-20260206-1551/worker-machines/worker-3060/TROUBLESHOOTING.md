# Worker-3060 Troubleshooting Guide

Common issues and solutions for Worker-3060 setup.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Docker Issues](#docker-issues)
3. [GPU Issues](#gpu-issues)
4. [Ollama Issues](#ollama-issues)
5. [Network Issues](#network-issues)
6. [Performance Issues](#performance-issues)
7. [Service Issues](#service-issues)

---

## Installation Issues

### Setup script fails with "Access Denied"

**Problem**: PowerShell script execution policy blocks the setup.

**Solution**:
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force

# Run setup again
.\setup-worker-3060.ps1
```

### Chocolatey installation fails

**Problem**: Network or proxy issues prevent Chocolatey download.

**Solution**:
```powershell
# Configure proxy (if needed)
$env:chocolateyProxyLocation = 'http://proxy.domain.com:8080'

# Manual install
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Insufficient disk space

**Problem**: Less than 100GB free space for models.

**Solution**:
```powershell
# Check disk space
Get-PSDrive C

# Move Docker data to another drive
# In Docker Desktop: Settings > Resources > Advanced > Disk image location

# Clean up Windows
cleanmgr /d C:
```

---

## Docker Issues

### Docker Desktop not starting

**Problem**: Docker Desktop won't start after installation.

**Solution**:
```powershell
# Check WSL2 is installed
wsl --list --verbose

# Install/update WSL2
wsl --install
wsl --update

# Enable Hyper-V
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

# Restart computer
Restart-Computer
```

### Docker not seeing GPU

**Problem**: `docker run --gpus all` fails with "could not select device driver".

**Solution**:
```powershell
# 1. Update Docker Desktop to latest version
choco upgrade docker-desktop -y

# 2. Enable GPU support in Docker Desktop
# Open Docker Desktop > Settings > Resources > WSL Integration
# Enable "Use the WSL 2 based engine"

# 3. Install nvidia-docker2 in WSL2
wsl -d docker-desktop
apk add nvidia-container-toolkit

# 4. Test GPU access
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi
```

### Container fails to start

**Problem**: Docker containers exit immediately.

**Solution**:
```powershell
# Check logs
docker-compose -f docker-compose.worker-3060.yml logs [service-name]

# Check for port conflicts
netstat -ano | findstr "11434"

# Kill process using port
taskkill /PID [PID] /F

# Restart Docker Desktop
Restart-Service docker

# Recreate containers
docker-compose -f docker-compose.worker-3060.yml down
docker-compose -f docker-compose.worker-3060.yml up -d --force-recreate
```

---

## GPU Issues

### nvidia-smi command not found

**Problem**: NVIDIA drivers not installed or not in PATH.

**Solution**:
```powershell
# Check if driver is installed
Get-WmiObject Win32_VideoController | Where-Object { $_.Name -like "*NVIDIA*" }

# Reinstall driver
choco install nvidia-display-driver --force -y

# Add to PATH
$nvidiaSmiPath = "C:\Program Files\NVIDIA Corporation\NVSMI"
$env:Path += ";$nvidiaSmiPath"
[System.Environment]::SetEnvironmentVariable("Path", $env:Path, "Machine")
```

### CUDA version mismatch

**Problem**: Ollama or ONNX Runtime complains about CUDA version.

**Solution**:
```powershell
# Check installed CUDA version
nvcc --version

# Uninstall old CUDA
choco uninstall cuda

# Install CUDA 12.4
choco install cuda --version=12.4.0 -y

# Set environment variables
$env:CUDA_PATH = "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.4"
[System.Environment]::SetEnvironmentVariable("CUDA_PATH", $env:CUDA_PATH, "Machine")
```

### GPU temperature too high

**Problem**: GPU running at 85°C+ under load.

**Solution**:
```powershell
# Check temperature
nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader

# Solutions:
# 1. Clean GPU fans and heatsink
# 2. Improve case airflow
# 3. Reduce GPU load with power limit:
nvidia-smi -pl 150  # Set 150W power limit

# 4. Reduce model concurrency
# Edit docker-compose.worker-3060.yml:
# OLLAMA_NUM_PARALLEL=1
# OLLAMA_MAX_LOADED_MODELS=1
```

### Out of VRAM errors

**Problem**: "CUDA out of memory" errors.

**Solution**:
```powershell
# Check VRAM usage
nvidia-smi

# Reduce loaded models
docker exec worker-3060-ollama curl http://localhost:11434/api/tags

# Only use one model at a time
# Edit .env:
# OLLAMA_MAX_LOADED_MODELS=1

# Use smaller batch sizes
# Edit docker-compose.worker-3060.yml:
# EMBEDDING_BATCH_SIZE=16

# Clear GPU memory
docker-compose -f docker-compose.worker-3060.yml restart ollama
```

---

## Ollama Issues

### Ollama not starting

**Problem**: Ollama service won't start.

**Solution**:
```powershell
# Kill existing Ollama processes
Get-Process ollama | Stop-Process -Force

# Check if port is in use
netstat -ano | findstr "11434"

# Start Ollama manually
ollama serve

# Check logs
Get-Content "C:\Users\$env:USERNAME\.ollama\logs\server.log" -Tail 50
```

### Models not pulling

**Problem**: `ollama pull` hangs or fails.

**Solution**:
```powershell
# Check internet connection
Test-NetConnection -ComputerName registry.ollama.ai -Port 443

# Check disk space
Get-PSDrive C

# Configure proxy (if needed)
$env:HTTPS_PROXY = "http://proxy.domain.com:8080"
$env:NO_PROXY = "localhost,127.0.0.1"

# Pull with verbose output
ollama pull codellama:34b --verbose

# Alternative: Download model files manually
# https://ollama.ai/library/codellama
```

### Slow inference speed

**Problem**: Ollama generating text at <5 tokens/sec.

**Solution**:
```powershell
# Check GPU utilization
nvidia-smi -l 1

# If GPU utilization is low:
# 1. Reduce concurrent requests
docker-compose exec worker-3060-ollama sh -c "export OLLAMA_NUM_PARALLEL=1"

# 2. Check CPU usage (should be low)
# If CPU is high, GPU isn't being used:
# - Verify CUDA is working
# - Restart Ollama service

# 3. Use smaller models
# gemma2:27b is faster than codellama:34b for general tasks

# 4. Reduce context window
curl http://localhost:11434/api/generate -d '{
  "model": "codellama:34b",
  "prompt": "Hello",
  "options": {
    "num_ctx": 4096
  }
}'
```

### Model not found error

**Problem**: API returns "model not found".

**Solution**:
```powershell
# List installed models
ollama list

# Pull missing model
ollama pull codellama:34b

# If model exists but API fails:
# Restart Ollama
docker-compose -f docker-compose.worker-3060.yml restart ollama

# Wait 30 seconds for model to load
Start-Sleep -Seconds 30

# Test again
curl http://localhost:11434/api/generate -d '{"model":"codellama:34b","prompt":"test"}'
```

---

## Network Issues

### Tailscale not connecting

**Problem**: Cannot connect to Tailscale network.

**Solution**:
```powershell
# Check Tailscale status
tailscale status

# Login to Tailscale
tailscale login

# Set machine name
tailscale up --hostname=worker-3060

# Check firewall
New-NetFirewallRule -DisplayName "Tailscale" -Direction Inbound -Program "C:\Program Files\Tailscale\tailscaled.exe" -Action Allow

# Restart Tailscale
Restart-Service Tailscale
```

### Cannot access services from other machines

**Problem**: Services work locally but not via Tailscale.

**Solution**:
```powershell
# Check if services are bound to 0.0.0.0 (not 127.0.0.1)
netstat -ano | findstr "11434"

# Edit docker-compose.worker-3060.yml
# Ensure OLLAMA_HOST=0.0.0.0:11434 (not localhost)

# Add firewall rules
New-NetFirewallRule -DisplayName "Ollama" -Direction Inbound -LocalPort 11434 -Protocol TCP -Action Allow

# Restart services
docker-compose -f docker-compose.worker-3060.yml restart
```

### Cloudflare tunnel not working

**Problem**: Public URL not accessible.

**Solution**:
```powershell
# Check tunnel status
cloudflared tunnel list

# Check tunnel is running
Get-Process cloudflared

# Start tunnel
cloudflared tunnel run worker-3060

# Check logs
cloudflared tunnel logs worker-3060

# Verify DNS records in Cloudflare dashboard
```

---

## Performance Issues

### High CPU usage

**Problem**: CPU at 100% constantly.

**Solution**:
```powershell
# Check which process is using CPU
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10

# If Docker is high:
# 1. Reduce Docker resource limits
# Docker Desktop > Settings > Resources > Advanced
# Set CPUs to 8 (or leave 2-4 for Windows)

# 2. Check for runaway containers
docker stats

# 3. Restart high CPU containers
docker-compose -f docker-compose.worker-3060.yml restart [service]
```

### High memory usage

**Problem**: System running out of RAM.

**Solution**:
```powershell
# Check memory usage
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10

# Reduce Docker memory limit
# Docker Desktop > Settings > Resources > Advanced
# Set Memory to 8GB (RTX 3060 has 12GB VRAM, less RAM needed)

# Reduce Redis cache size
docker exec worker-3060-redis redis-cli CONFIG SET maxmemory 1gb

# Only load one Ollama model at a time
# Edit .env: OLLAMA_MAX_LOADED_MODELS=1
```

### High latency

**Problem**: Requests taking >5 seconds.

**Solution**:
```powershell
# Check service latency
curl http://localhost:9090/services

# If Ollama is slow:
# 1. Check GPU utilization (should be 90%+)
nvidia-smi

# 2. Reduce prompt length
# 3. Use smaller model
# 4. Reduce context window

# If embedding service is slow:
# 1. Increase batch size
# Edit .env: EMBEDDING_BATCH_SIZE=64

# 2. Check Redis cache hit rate
docker exec worker-3060-redis redis-cli INFO stats | findstr "keyspace_hits"
```

---

## Service Issues

### Embedding service crashing

**Problem**: Embedding service restarts repeatedly.

**Solution**:
```powershell
# Check logs
docker-compose -f docker-compose.worker-3060.yml logs embedding-service

# Common causes:
# 1. Out of memory
# Reduce batch size in .env: EMBEDDING_BATCH_SIZE=16

# 2. Model download failed
# Clear cache and restart:
docker-compose -f docker-compose.worker-3060.yml down
Remove-Item -Path ".\embedding-service\cache" -Recurse -Force
docker-compose -f docker-compose.worker-3060.yml up -d

# 3. Node.js memory limit
# Edit docker-compose.worker-3060.yml:
# command: node --max-old-space-size=4096 server.js
```

### Redis connection refused

**Problem**: Services can't connect to Redis.

**Solution**:
```powershell
# Check Redis is running
docker ps | findstr redis

# Check Redis logs
docker logs worker-3060-redis

# Test connection
docker exec worker-3060-redis redis-cli ping

# If "Connection refused":
# 1. Check network
docker network ls
docker network inspect worker-3060_worker-network

# 2. Restart Redis
docker-compose -f docker-compose.worker-3060.yml restart redis
```

### Health checks failing

**Problem**: All health checks return unhealthy.

**Solution**:
```powershell
# Run health check script
.\health-check.ps1

# Check each service manually:

# Ollama
curl http://localhost:11434/api/version

# ONNX
curl http://localhost:8001/v2/health/ready

# Embeddings
curl http://localhost:8080/health

# Health Monitor
curl http://localhost:9090/health

# If all fail:
# Restart all services
docker-compose -f docker-compose.worker-3060.yml restart
```

---

## Getting Help

If issues persist:

1. **Check logs**: `docker-compose logs -f [service]`
2. **Run diagnostics**: `.\health-check.ps1` and `.\test.ps1`
3. **Check GPU**: `nvidia-smi`
4. **View system resources**: Task Manager > Performance
5. **Search issues**: https://github.com/ollama/ollama/issues
6. **Project Nyra support**: devops@nyra-platform.com

## Useful Commands

```powershell
# Full restart
docker-compose -f docker-compose.worker-3060.yml down
docker-compose -f docker-compose.worker-3060.yml up -d --force-recreate

# Clear all Docker data (CAUTION: Deletes everything!)
docker system prune -a --volumes

# Reinstall Ollama models
ollama rm codellama:34b
ollama pull codellama:34b

# Reset Tailscale
tailscale logout
tailscale login

# View all logs
Get-Content setup.log
docker-compose -f docker-compose.worker-3060.yml logs --tail=100

# System info
systeminfo
nvidia-smi
docker info
ollama version
```
