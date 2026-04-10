# PC4 Worker Setup Guide - RTX 3060

**Target Hardware**: Gaming/Workstation PC with NVIDIA RTX 3060 12GB
**Role**: Code Generation Worker
**Version**: 4.0.0
**Last Updated**: January 15, 2026

---

## 📋 Table of Contents

1. [Hardware Requirements](#-hardware-requirements)
2. [Pre-Installation Checklist](#-pre-installation-checklist)
3. [Network Configuration](#-network-configuration)
4. [GUI Installer Setup](#-gui-installer-setup)
5. [GPU Configuration](#-gpu-configuration)
6. [Ollama Model Installation](#-ollama-model-installation)
7. [Post-Installation Verification](#-post-installation-verification)
8. [Troubleshooting](#-troubleshooting)

---

## 💻 Hardware Requirements

### Minimum Specifications

```yaml
CPU: Intel Core i5/i7 or AMD Ryzen 5/7 (8+ cores recommended)
RAM: 32GB DDR4
GPU: NVIDIA RTX 3060 12GB VRAM (required)
Storage: 1TB NVMe SSD (minimum 500GB free)
Network: Gigabit Ethernet (recommended) or Wi-Fi 6
OS: Windows 11 Pro (build 22000+)
```

### Verified Compatible Hardware

```yaml
GPUs:
  - NVIDIA RTX 3060 12GB (recommended)
  - NVIDIA RTX 3060 Ti 8GB (limited models)
  - NVIDIA RTX 3070 8GB (alternative)

Motherboards:
  - Any PCIe 3.0/4.0 x16 slot
  - Recommended: PCIe 4.0 for better bandwidth
```

### Storage Requirements

```
Operating System:     50GB
Docker Images:        50GB
Ollama Models:        300GB (varies by models)
Model Cache:          50GB
Logs:                 10GB
Temp/Scratch:         40GB
Total Recommended:    500GB+
```

### Power Requirements

```yaml
RTX 3060 TDP: 170W
Recommended PSU: 650W+ (80+ Bronze minimum)
Power Connectors: 1x 8-pin PCIe
```

---

## ✅ Pre-Installation Checklist

### Step 1: NVIDIA Driver Installation

```powershell
# Option 1: NVIDIA GeForce Experience (Recommended)
winget install Nvidia.GeForceExperience

# Open GeForce Experience → Drivers → Download Latest

# Option 2: Manual download
# Visit: https://www.nvidia.com/Download/index.aspx
# Product: GeForce RTX 3060
# OS: Windows 11 64-bit
# Download and install Game Ready Driver

# Verify installation
nvidia-smi

# Expected output:
# +-----------------------------------------------------------------------------+
# | NVIDIA-SMI 550.90       Driver Version: 550.90       CUDA Version: 12.4    |
# |-------------------------------+----------------------+----------------------+
# | GPU  Name            TCC/WDDM | Bus-Id        Disp.A | Volatile Uncorr. ECC |
# | Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
# |===============================+======================+======================|
# |   0  NVIDIA GeForce ... WDDM  | 00000000:01:00.0  On |                  N/A |
# | 30%   35C    P8     8W / 170W |    450MiB / 12288MiB |      0%      Default |
# +-------------------------------+----------------------+----------------------+
```

### Step 2: Install Prerequisites

```powershell
# Git for Windows
winget install Git.Git

# Node.js 20 LTS
winget install OpenJS.NodeJS.LTS

# Python 3.11+
winget install Python.Python.3.11

# Docker Desktop
winget install Docker.DockerDesktop

# NVIDIA Container Toolkit (installed after Docker)
# This will be handled by the GUI installer

# Tailscale VPN
winget install Tailscale.Tailscale

# Verify installations
git --version
node --version
python --version
docker --version
nvidia-smi
```

### Step 3: Docker Desktop Configuration

```powershell
# Start Docker Desktop
# Wait for initialization (1-2 minutes)

# Verify Docker
docker run hello-world

# Configure Docker for GPU
# Docker Desktop → Settings → Resources
# Memory: 48GB (leave 16GB for host + GPU)
# CPUs: 14 (leave 2 for host)
# Disk: 1TB
```

---

## 🌐 Network Configuration

### Static IP Configuration

**Option 1: GUI Method**

1. Open **Settings** → **Network & Internet** → **Ethernet** (or Wi-Fi)
2. Click on your network adapter
3. Click **Edit** next to IP assignment
4. Select **Manual** and enable **IPv4**
5. Enter:
   ```
   IP address:     192.168.1.104
   Subnet mask:    255.255.255.0
   Gateway:        192.168.1.1
   Preferred DNS:  8.8.8.8
   Alternate DNS:  8.8.4.4
   ```
6. Click **Save**

**Option 2: PowerShell Method**

```powershell
# Find your network adapter name
Get-NetAdapter

# Set static IP (replace "Ethernet" with your adapter name)
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.1.104 -PrefixLength 24 -DefaultGateway 192.168.1.1

# Set DNS servers
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("8.8.8.8","8.8.4.4")

# Verify configuration
Get-NetIPAddress -InterfaceAlias "Ethernet"
```

### Tailscale VPN Setup

```powershell
# Start Tailscale
tailscale up

# Follow browser authentication prompt

# Verify connection
tailscale status

# Expected: See PC1 (orchestrator) and other workers
# Ping orchestrator
tailscale ping 10.0.0.1
```

### Firewall Configuration

```powershell
# Run as Administrator

# Allow Ollama
New-NetFirewallRule -DisplayName "Ollama API" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 11436 `
    -Action Allow

# Allow Node Exporter (Prometheus monitoring)
New-NetFirewallRule -DisplayName "Node Exporter" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 9100 `
    -Action Allow

# Allow Docker
New-NetFirewallRule -DisplayName "Docker Desktop" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 2375,2376 `
    -Action Allow
```

---

## 🖥️ GUI Installer Setup

### Launch Installer

```powershell
# Navigate to installer directory
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\installer

# Install dependencies
npm install

# Start GUI installer
npm run dev
```

### Installation Wizard Walkthrough

#### Phase 1: PC Selection

1. **Hardware Detection**:
   ```
   Detected Hardware:
   ├── CPU: AMD Ryzen 7 5800X (8 cores, 16 threads)
   ├── RAM: 32GB DDR4
   ├── Storage: 1TB NVMe SSD (750GB free)
   ├── GPU: NVIDIA GeForce RTX 3060 (12GB VRAM)
   └── Network: Gigabit Ethernet

   Suggested Role: Worker (PC4)
   Reason: NVIDIA RTX 3060 detected - optimized for code generation
   ```

2. **Select Role**: Choose **PC4 - Worker (RTX 3060)**
3. Click **Continue**

#### Phase 2: Environment Selection

1. **Choose Environment**: Development (recommended for first setup)
2. Click **Continue**

#### Phase 3: Component Selection

**Required Components** (auto-selected):
- ✅ Claude Code
- ✅ Docker Desktop
- ✅ NVIDIA Container Toolkit

**Optional Components**:
- ✅ Claude Desktop
- ✅ Claude Flow

Click **Continue to MCP Configuration**

#### Phase 4: MCP Server Configuration

**Select MCP Servers** (optional for workers):
- ☐ Most MCP servers run on PC1
- ✅ filesystem (for local file operations)

Click **Continue**

#### Phase 5: Docker Setup

1. **Verify Docker Installation**
   - Status: ✅ Installed
   - Version: 24.0.x
   - GPU Support: ✅ NVIDIA Container Toolkit detected

2. **GPU Configuration**
   - GPU Detected: NVIDIA RTX 3060 12GB
   - CUDA Version: 12.4
   - Driver Version: 550.90

Click **Continue**

#### Phase 6: Configuration Editor

**Edit Environment Variables**:

```bash
# .env.pc4
PC_NUMBER=4
PC_ROLE=worker
PC_IP=10.0.0.4
PC_GPU=rtx3060
PC_HOSTNAME=pc4-worker-3060

# Ollama Configuration
OLLAMA_HOST=0.0.0.0
OLLAMA_PORT=11436
OLLAMA_ORIGINS=*
OLLAMA_NUM_PARALLEL=2
OLLAMA_MAX_LOADED_MODELS=2

# GPU Configuration
CUDA_VISIBLE_DEVICES=0
NVIDIA_VISIBLE_DEVICES=all

# Monitoring
NODE_EXPORTER_PORT=9100
```

Click **Save and Continue**

#### Phase 7: Service Deployment

Watch real-time deployment progress:

```
[1/2] Pulling ollama/ollama...       ████████████ 100%
[2/2] Pulling prometheus/node-exp... ████████████ 100%
[3/2] Starting services...           ████████████ 100%
[4/2] GPU verification...            ████████████ 100%
[5/2] Deployment complete!           ████████████ 100%
```

#### Phase 8: Health Check

```
✅ Ollama - Healthy (11436)
✅ Node Exporter - Healthy (9100)
✅ GPU Available - NVIDIA RTX 3060 12GB
```

Click **Continue to Model Installation**

---

## 🎮 GPU Configuration

### NVIDIA Container Toolkit Installation

**Automated Installation** (via GUI installer):
```powershell
# Installer runs these commands:

# Add NVIDIA package repository
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

# Install NVIDIA Container Toolkit
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

# Restart Docker
sudo systemctl restart docker

# Verify GPU access
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi
```

### Docker GPU Configuration

**daemon.json**:
```json
{
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime",
      "runtimeArgs": []
    }
  },
  "default-runtime": "nvidia"
}
```

### GPU Verification

```powershell
# Test GPU access from Docker
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi

# Expected output: Same as host nvidia-smi

# Verify Ollama GPU access
docker exec nyra-ollama-pc4 nvidia-smi

# Check GPU memory
nvidia-smi --query-gpu=memory.total,memory.used,memory.free --format=csv
```

---

## 🤖 Ollama Model Installation

### Recommended Models for RTX 3060 (12GB VRAM)

**Tier 1: Fast Code Generation** (fits in 12GB):
```bash
# DeepSeek Coder 6.7B - Fast, high-quality code generation
docker exec nyra-ollama-pc4 ollama pull deepseek-coder:6.7b

# CodeLlama 13B - Balanced performance
docker exec nyra-ollama-pc4 ollama pull codellama:13b

# StarCoder 7B - Code completion
docker exec nyra-ollama-pc4 ollama pull starcoder:7b
```

**Tier 2: Quantized Larger Models** (with quantization):
```bash
# DeepSeek Coder V2 16B (4-bit quantization)
docker exec nyra-ollama-pc4 ollama pull deepseek-coder-v2:16b-lite-instruct-q4_K_M

# Phi-3 14B (optimized for 12GB)
docker exec nyra-ollama-pc4 ollama pull phi-3:14b-medium-4k-instruct-q4_K_M

# CodeGemma 7B
docker exec nyra-ollama-pc4 ollama pull codegemma:7b
```

**NOT Recommended** (requires >12GB VRAM):
```bash
# These will NOT fit on RTX 3060 12GB:
# ❌ deepseek-coder:33b
# ❌ codellama:34b
# ❌ mixtral:8x7b
# ❌ llama3.3:70b
```

### Model Installation Guide

**Install via Docker**:
```powershell
# Method 1: Interactive
docker exec -it nyra-ollama-pc4 ollama pull deepseek-coder:6.7b

# Method 2: Background
docker exec nyra-ollama-pc4 ollama pull deepseek-coder:6.7b &

# Method 3: Multiple models
$models = @(
    "deepseek-coder:6.7b",
    "codellama:13b",
    "starcoder:7b"
)

foreach ($model in $models) {
    Write-Host "Pulling $model..."
    docker exec nyra-ollama-pc4 ollama pull $model
}
```

**Monitor Download Progress**:
```powershell
# Watch Docker logs
docker compose logs -f ollama

# Check model list
docker exec nyra-ollama-pc4 ollama list

# Expected output:
# NAME                       ID            SIZE    MODIFIED
# deepseek-coder:6.7b        abc123def     3.8GB   2 minutes ago
# codellama:13b              def456ghi     7.3GB   5 minutes ago
# starcoder:7b               ghi789jkl     4.1GB   8 minutes ago
```

### Model Testing

```powershell
# Test model inference
docker exec nyra-ollama-pc4 ollama run deepseek-coder:6.7b "Write a Python function to calculate fibonacci numbers"

# Test API endpoint
curl http://localhost:11436/api/generate `
  -H "Content-Type: application/json" `
  -d '{
    "model": "deepseek-coder:6.7b",
    "prompt": "Write a hello world program in Python",
    "stream": false
  }'

# Benchmark performance
Measure-Command {
    docker exec nyra-ollama-pc4 ollama run deepseek-coder:6.7b "Write a sorting algorithm"
}
```

### Model Configuration

**Optimize for RTX 3060**:

```bash
# .env.pc4
OLLAMA_NUM_PARALLEL=2        # Max 2 concurrent requests (12GB VRAM)
OLLAMA_MAX_LOADED_MODELS=2   # Keep 2 models in memory
OLLAMA_CONTEXT_LENGTH=4096   # Context window
OLLAMA_NUM_GPU=1             # Use all available GPU
```

**Model-Specific Settings**:

```yaml
deepseek-coder:6.7b:
  VRAM: ~4GB
  Context: 16K tokens
  Speed: ~40 tokens/sec
  Use Cases: Fast code generation, bug fixes

codellama:13b:
  VRAM: ~8GB
  Context: 16K tokens
  Speed: ~25 tokens/sec
  Use Cases: Complex code, refactoring

starcoder:7b:
  VRAM: ~5GB
  Context: 8K tokens
  Speed: ~35 tokens/sec
  Use Cases: Code completion, snippets
```

---

## ✔️ Post-Installation Verification

### Service Health Checks

```powershell
# Check all services
docker ps

# Expected: ollama and node-exporter running

# Check Ollama logs
docker compose logs ollama

# Check GPU utilization
nvidia-smi dmon -s u -c 1
```

### Network Connectivity Tests

```powershell
# Test Ollama API
Test-NetConnection -ComputerName localhost -Port 11436

# Test from orchestrator (PC1)
# On PC1:
Test-NetConnection -ComputerName 10.0.0.4 -Port 11436

# Test Tailscale connectivity
tailscale ping 10.0.0.1
```

### API Endpoint Tests

```powershell
# Ollama health check
curl http://localhost:11436/api/tags

# List models
curl http://localhost:11436/api/tags | ConvertFrom-Json | Select-Object -ExpandProperty models

# Generate text
$body = @{
    model = "deepseek-coder:6.7b"
    prompt = "def fibonacci(n):"
    stream = $false
} | ConvertTo-Json

curl http://localhost:11436/api/generate `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Performance Benchmarks

```powershell
# Tokens per second
$prompt = "Write a comprehensive Python class for a REST API client"

$result = Measure-Command {
    docker exec nyra-ollama-pc4 ollama run deepseek-coder:6.7b $prompt
}

Write-Host "Generation time: $($result.TotalSeconds) seconds"

# GPU memory usage during inference
nvidia-smi --query-gpu=memory.used,utilization.gpu --format=csv -l 1

# Expected during generation:
# memory.used [MiB], utilization.gpu [%]
# 4200 MiB, 95%
```

---

## 🔧 Troubleshooting

### GPU Issues

**Issue**: nvidia-smi not found

```powershell
# Reinstall NVIDIA drivers
winget install Nvidia.GeForceExperience

# Or download manually:
# https://www.nvidia.com/Download/index.aspx

# Restart computer
shutdown /r /t 0
```

**Issue**: Docker can't access GPU

```powershell
# Verify Docker GPU support
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi

# If error "could not select device driver":
# 1. Restart Docker Desktop
# 2. Check NVIDIA Container Toolkit installation
# 3. Verify daemon.json configuration

# Reinstall NVIDIA Container Toolkit
# Via WSL:
wsl -d Ubuntu
sudo apt-get purge nvidia-container-toolkit
sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

**Issue**: Out of VRAM errors

```powershell
# Check current VRAM usage
nvidia-smi --query-gpu=memory.used,memory.total --format=csv

# Solutions:
# 1. Use smaller models (6.7B instead of 13B)
# 2. Reduce OLLAMA_NUM_PARALLEL to 1
# 3. Reduce context length
# 4. Use quantized models (Q4_K_M instead of Q8)

# Clear GPU memory
docker restart nyra-ollama-pc4
```

### Ollama Issues

**Issue**: Ollama won't start

```powershell
# Check Docker logs
docker compose logs ollama

# Common causes:
# 1. GPU not accessible → Reinstall NVIDIA Container Toolkit
# 2. Port conflict → Change OLLAMA_PORT in .env
# 3. Model corruption → Remove and re-pull models

# Restart Ollama
docker compose restart ollama
```

**Issue**: Slow model inference

```powershell
# Check GPU utilization
nvidia-smi dmon -s u -c 10

# If GPU utilization < 80%:
# 1. Check thermal throttling (nvidia-smi)
# 2. Verify PCIe bandwidth (GPU-Z)
# 3. Close other GPU applications
# 4. Update NVIDIA drivers

# Optimize Ollama settings
# Edit .env.pc4:
OLLAMA_NUM_PARALLEL=1
OLLAMA_CONTEXT_LENGTH=2048
```

**Issue**: Models won't download

```powershell
# Check internet connection
Test-NetConnection google.com

# Check disk space
Get-PSDrive C | Select-Object Used,Free

# Manual model download
docker exec nyra-ollama-pc4 ollama pull deepseek-coder:6.7b --verbose

# If persistent failure:
# 1. Check Docker disk space quota
# 2. Clear Docker cache: docker system prune -a
# 3. Restart Docker Desktop
```

### Network Issues

**Issue**: Can't reach Ollama from PC1

```powershell
# On PC4, verify Ollama is listening
netstat -ano | findstr :11436

# Check firewall
Get-NetFirewallRule -DisplayName "Ollama API"

# Re-add firewall rule
New-NetFirewallRule -DisplayName "Ollama API" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 11436 `
    -Action Allow

# Test from PC1
# On PC1:
curl http://10.0.0.4:11436/api/tags
```

### Performance Issues

**Issue**: High CPU usage

```powershell
# Ollama defaults to CPU when GPU unavailable
# Verify GPU is being used
docker exec nyra-ollama-pc4 nvidia-smi

# Check Ollama logs for GPU initialization
docker compose logs ollama | Select-String "GPU"

# Expected: "Initializing CUDA device 0"
```

**Issue**: High temperature

```powershell
# Monitor GPU temperature
nvidia-smi dmon -s t -c 30

# If temp > 80°C:
# 1. Check case airflow
# 2. Clean GPU fans
# 3. Increase fan speed (MSI Afterburner)
# 4. Reduce power limit slightly

# Thermal throttling check
nvidia-smi --query-gpu=clocks.current.graphics,clocks.max.graphics --format=csv
```

---

## 📚 Additional Resources

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture overview
- **[SETUP-ORCHESTRATOR.md](SETUP-ORCHESTRATOR.md)** - PC1 setup guide
- **[INSTALLER-GUIDE.md](INSTALLER-GUIDE.md)** - GUI installer detailed guide
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Comprehensive troubleshooting
- **[Ollama Documentation](https://github.com/ollama/ollama/blob/main/docs/README.md)** - Ollama reference
- **[NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html)** - GPU Docker support

---

## 🎉 Next Steps

1. **Verify GPU worker is accessible from PC1**:
   ```powershell
   # On PC1:
   curl http://10.0.0.4:11436/api/tags
   ```

2. **Test distributed inference**:
   ```powershell
   # On PC1:
   npx @claude-flow/cli@latest swarm init --topology hierarchical
   npx @claude-flow/cli@latest agent spawn -t coder --name pc4-coder
   ```

3. **Monitor performance**:
   - Access Grafana: http://10.0.0.1:3000
   - View GPU metrics dashboard
   - Check inference latency

4. **Optimize models**:
   - Pull additional models based on workload
   - Tune OLLAMA_NUM_PARALLEL for concurrent requests
   - Monitor VRAM usage and adjust

---

**Completed**: ✅
**PC4 (RTX 3060 Worker) is now ready for code generation tasks!**
