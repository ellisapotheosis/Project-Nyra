# PC2 (RTX 3060) - Deployment Guide

**Role**: Development & Light Inference Worker
**Hardware**: RTX 3060 12GB VRAM
**Primary Service**: Ollama (Development)
**Updated**: 2026-01-18

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Hardware Specifications](#hardware-specifications)
3. [Prerequisites](#prerequisites)
4. [CUDA Setup](#cuda-setup)
5. [Ollama Installation](#ollama-installation)
6. [Model Recommendations](#model-recommendations)
7. [Wake-on-LAN Setup](#wake-on-lan-setup)
8. [Performance Optimization](#performance-optimization)
9. [Development Workflow](#development-workflow)
10. [Health Checks](#health-checks)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

PC2 serves as the **development and light inference worker**:
- **RTX 3060 12GB VRAM** - Limited VRAM for smaller models
- **Ollama only** - NOT vLLM (insufficient VRAM for production workloads)
- **Development focus** - Testing, prototyping, lightweight inference
- **Power management** - Wake-on-LAN for on-demand usage

### Why Ollama Instead of vLLM?

| Aspect | Ollama | vLLM |
|--------|--------|------|
| **Memory overhead** | Lower (~2GB) | Higher (~4-6GB) |
| **Model support** | Quantized models (GGUF) | Full precision models |
| **VRAM requirement** | Works with 8GB+ | Needs 16GB+ |
| **Performance** | Good for dev | Best for production |
| **Use case** | Development, testing | Production serving |

With only 12GB VRAM, Ollama provides better flexibility for running multiple smaller models or larger quantized models for development purposes.

---

## 🖥️ Hardware Specifications

### Current Hardware
| Component | Specification | Notes |
|-----------|---------------|-------|
| **GPU** | NVIDIA RTX 3060 12GB | Ampere architecture |
| **CUDA Cores** | 3584 | SM 8.6 |
| **Memory** | 12GB GDDR6 | 192-bit bus |
| **TDP** | 170W | Standard power |
| **PCIe** | Gen 4 x16 | Full bandwidth |

### System Requirements
- **CPU**: 6+ cores (Intel/AMD)
- **RAM**: 16GB+ (32GB recommended)
- **Storage**: 256GB+ SSD (for models)
- **PSU**: 550W+ (RTX 3060 needs 170W)

### VRAM Capacity Guidelines
```
Available VRAM: ~12GB
- OS/Driver overhead: ~1GB
- Ollama overhead: ~1.5GB
- Available for models: ~9.5GB
```

---

## ✅ Prerequisites

### 1. Operating System
```bash
# Ubuntu 22.04 LTS (Recommended)
# OR Ubuntu 24.04 LTS
cat /etc/os-release

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y build-essential curl git wget htop nvtop
```

### 2. NVIDIA Driver Installation
```bash
# Check current driver
nvidia-smi

# Install recommended driver (535+ for CUDA 12)
sudo apt install nvidia-driver-535
# OR latest
sudo ubuntu-drivers autoinstall

# Reboot
sudo reboot

# Verify after reboot
nvidia-smi
```

Expected output:
```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.xx       Driver Version: 535.xx       CUDA Version: 12.2   |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  NVIDIA GeForce RTX 3060  Off  | 00000000:01:00.0 On  |                  N/A |
|  0%   42C    P8    15W / 170W |    500MiB / 12288MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
```

### 3. Docker + NVIDIA Container Toolkit
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt update
sudo apt install -y nvidia-container-toolkit

# Configure Docker to use NVIDIA runtime
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# Test GPU in Docker
docker run --rm --gpus all nvidia/cuda:12.2.0-base-ubuntu22.04 nvidia-smi
```

---

## 🔧 CUDA Setup

### CUDA 12.x Installation
```bash
# Download CUDA Toolkit 12.2
wget https://developer.download.nvidia.com/compute/cuda/12.2.0/local_installers/cuda_12.2.0_535.54.03_linux.run

# Install (only toolkit, driver already installed)
sudo sh cuda_12.2.0_535.54.03_linux.run --silent --toolkit

# Add to PATH
echo 'export PATH=/usr/local/cuda-12.2/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda-12.2/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc

# Verify CUDA
nvcc --version
```

### CUDA Optimization for 12GB VRAM

Create `/etc/modprobe.d/nvidia.conf`:
```
# Enable persistence mode
options nvidia NVreg_EnableGpuFirmware=1

# Optimize memory allocation
options nvidia NVreg_PreserveVideoMemoryAllocations=1
```

Update initramfs:
```bash
sudo update-initramfs -u
sudo reboot
```

### Set GPU to Performance Mode
```bash
# Persistence mode (survives reboot)
sudo nvidia-smi -pm 1

# Set power limit (optional, for cooling)
sudo nvidia-smi -pl 150  # Reduce to 150W from 170W default

# Lock GPU clocks for consistent performance
sudo nvidia-smi -lgc 1777  # RTX 3060 max boost clock
```

---

## 🐳 Ollama Installation

### Method 1: Docker (Recommended)
```bash
# Create Ollama directory
mkdir -p ~/ollama-data

# Run Ollama in Docker
docker run -d \
  --name ollama \
  --gpus all \
  --restart unless-stopped \
  -v ~/ollama-data:/root/.ollama \
  -p 11434:11434 \
  -e OLLAMA_HOST=0.0.0.0:11434 \
  -e OLLAMA_ORIGINS='*' \
  -e OLLAMA_NUM_PARALLEL=2 \
  -e OLLAMA_MAX_LOADED_MODELS=2 \
  ollama/ollama:latest

# Verify Ollama is running
docker logs ollama
curl http://localhost:11434/api/tags
```

### Method 2: Native Installation
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
sudo systemctl start ollama
sudo systemctl enable ollama

# Check status
sudo systemctl status ollama
```

### Configure Ollama for 12GB VRAM

Edit Ollama service (if native install):
```bash
sudo nano /etc/systemd/system/ollama.service
```

Add environment variables:
```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"
Environment="OLLAMA_NUM_PARALLEL=2"
Environment="OLLAMA_MAX_LOADED_MODELS=2"
Environment="OLLAMA_DEBUG=false"
Environment="CUDA_VISIBLE_DEVICES=0"
```

Reload and restart:
```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

---

## 📦 Model Recommendations

### Tier 1: Optimal for 12GB (7B-13B)
These models fit comfortably with full context:

| Model | VRAM Usage | Context | Use Case |
|-------|------------|---------|----------|
| **llama3.1:8b** | ~5GB | 128K | General purpose, coding |
| **mistral:7b-instruct** | ~4.5GB | 32K | Fast inference, chat |
| **phi3:medium** | ~4GB | 128K | Efficient, good reasoning |
| **codellama:7b** | ~4.5GB | 16K | Code generation |
| **deepseek-coder:6.7b** | ~4GB | 16K | Code completion |

### Tier 2: Works with Reduced Context (13B-34B Quantized)
Requires context window reduction:

| Model | VRAM Usage | Context | Notes |
|-------|------------|---------|-------|
| **llama3.1:13b-q4_0** | ~8GB | 32K | Good quality, quantized |
| **mixtral:8x7b-q4_0** | ~10GB | 16K | MoE, needs careful tuning |
| **codellama:13b-q4_0** | ~8GB | 16K | Better code understanding |

### Tier 3: Edge Cases (Requires Optimization)
Only for testing, not production:

| Model | VRAM Usage | Context | Notes |
|-------|------------|---------|-------|
| **llama3.1:70b-q2_K** | ~11GB | 8K | Extremely quantized, quality loss |

### Download Models
```bash
# Essential models for development
docker exec ollama ollama pull llama3.1:8b
docker exec ollama ollama pull mistral:7b-instruct
docker exec ollama ollama pull phi3:medium
docker exec ollama ollama pull codellama:7b
docker exec ollama ollama pull deepseek-coder:6.7b

# List downloaded models
docker exec ollama ollama list
```

### Model Management Script
Create `~/scripts/ollama-models.sh`:
```bash
#!/bin/bash

case "$1" in
    list)
        docker exec ollama ollama list
        ;;
    pull)
        docker exec ollama ollama pull "$2"
        ;;
    remove)
        docker exec ollama ollama rm "$2"
        ;;
    vram)
        nvidia-smi --query-gpu=memory.used,memory.total --format=csv,noheader
        ;;
    *)
        echo "Usage: $0 {list|pull|remove|vram} [model-name]"
        exit 1
        ;;
esac
```

Make executable:
```bash
chmod +x ~/scripts/ollama-models.sh
```

---

## 🌐 Wake-on-LAN Setup

PC2 is designed for on-demand usage. Enable Wake-on-LAN to power on remotely when needed.

### 1. BIOS Configuration
1. Enter BIOS/UEFI (usually Del, F2, or F12 during boot)
2. Enable **Wake-on-LAN** or **Power On By PCI-E Device**
3. Enable **ERP Ready** or **ErP Support** (some boards)
4. Set **After Power Loss** to "Power On" or "Last State"
5. Save and exit

### 2. Network Interface Configuration
```bash
# Identify network interface
ip link show

# Typical output: eth0, enp3s0, etc.
IFACE="enp3s0"  # Replace with your interface

# Enable Wake-on-LAN
sudo ethtool -s $IFACE wol g

# Verify WOL is enabled
sudo ethtool $IFACE | grep Wake-on
# Should show: Wake-on: g
```

### 3. Make WOL Persistent
Create systemd service `/etc/systemd/system/wol.service`:
```ini
[Unit]
Description=Enable Wake-on-LAN
After=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/sbin/ethtool -s enp3s0 wol g
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

Enable service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable wol.service
sudo systemctl start wol.service
```

### 4. Get MAC Address
```bash
# Get MAC address for WOL
ip link show enp3s0 | grep link/ether

# Example output: link/ether 00:11:22:33:44:55
MAC_ADDRESS="00:11:22:33:44:55"  # Save this
```

### 5. Wake PC2 from PC1 (Orchestrator)
On PC1, install `wakeonlan`:
```bash
sudo apt install wakeonlan
```

Create wake script on PC1:
```bash
#!/bin/bash
# Wake PC2 (RTX 3060 Worker)
wakeonlan 00:11:22:33:44:55

# Wait for PC to boot
echo "Waking PC2..."
sleep 30

# Test connectivity
if ping -c 1 192.168.1.12 > /dev/null 2>&1; then
    echo "PC2 is online"
else
    echo "PC2 failed to wake"
    exit 1
fi
```

### 6. Auto-Sleep Configuration (Optional)
To save power, configure PC2 to sleep after idle:

Edit `/etc/systemd/sleep.conf`:
```ini
[Sleep]
AllowSuspend=yes
AllowHibernation=no
SuspendState=mem
```

Create idle detection script:
```bash
#!/bin/bash
# Suspend after 30 minutes of GPU idle

IDLE_TIME=1800  # 30 minutes
GPU_UTIL=$(nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits)

if [ "$GPU_UTIL" -lt 5 ]; then
    # GPU idle, increment counter
    IDLE_FILE="/tmp/gpu_idle_count"
    if [ -f $IDLE_FILE ]; then
        COUNT=$(cat $IDLE_FILE)
        COUNT=$((COUNT + 60))
    else
        COUNT=60
    fi
    echo $COUNT > $IDLE_FILE

    if [ $COUNT -ge $IDLE_TIME ]; then
        logger "GPU idle for 30 minutes, suspending"
        rm $IDLE_FILE
        systemctl suspend
    fi
else
    # GPU active, reset counter
    rm -f /tmp/gpu_idle_count
fi
```

Add to crontab (run every minute):
```bash
crontab -e
# Add: * * * * * /usr/local/bin/gpu-auto-suspend.sh
```

---

## ⚡ Performance Optimization

### 1. VRAM Optimization

**Context Window Tuning**:
```bash
# When running models, reduce context if VRAM limited
docker exec ollama ollama run llama3.1:8b --ctx-size 4096

# For API calls, set num_ctx parameter
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Hello",
  "options": {
    "num_ctx": 4096,
    "num_gpu": 99
  }
}'
```

**Model Quantization**: Use Q4_0 or Q5_0 quantized models for better VRAM efficiency.

### 2. Concurrent Model Loading
Ollama on PC2 can load 2 models simultaneously:

```bash
# Configure in environment
OLLAMA_MAX_LOADED_MODELS=2
OLLAMA_NUM_PARALLEL=2
```

**Example workload**:
- Model 1: `llama3.1:8b` (~5GB) - Primary inference
- Model 2: `codellama:7b` (~4.5GB) - Code completion
- Total: ~9.5GB (fits in 12GB with overhead)

### 3. GPU Memory Cleanup
If VRAM gets fragmented:

```bash
# Restart Ollama to clear VRAM
docker restart ollama

# OR force CUDA cache clear
sudo nvidia-smi --gpu-reset

# Monitor VRAM usage
watch -n 1 nvidia-smi
```

### 4. Networking Optimization
Ensure low-latency connection to PC1 (Orchestrator):

```bash
# Set MTU for jumbo frames (if supported by switch)
sudo ip link set enp3s0 mtu 9000

# Disable power management on NIC
sudo ethtool -s enp3s0 wol g
sudo ethtool --set-eee enp3s0 eee off
```

---

## 🔬 Development Workflow

### Typical Development Scenarios

#### Scenario 1: Quick Model Testing
```bash
# Interactive chat
docker exec -it ollama ollama run llama3.1:8b

# Test specific prompt
docker exec ollama ollama run llama3.1:8b "Write a Python function to reverse a string"
```

#### Scenario 2: API Integration Testing
```bash
# Test API endpoint
curl http://192.168.1.12:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Explain Docker in one sentence",
  "stream": false
}'
```

#### Scenario 3: Code Completion
```bash
# Start code completion model
docker exec -it ollama ollama run codellama:7b --ctx-size 8192

# Send code context for completion
# (integrate with IDE via Ollama extension)
```

### Integration with Nexus Router (PC1)
PC2 registers with Nexus Router for automatic routing:

```bash
# Nexus Router discovers PC2 via health check
curl http://192.168.1.10:3300/workers
# Returns:
# {
#   "pc2": {
#     "url": "http://192.168.1.12:11434",
#     "models": ["llama3.1:8b", "mistral:7b-instruct", "codellama:7b"],
#     "status": "online",
#     "vram": "12GB",
#     "utilization": 45
#   }
# }
```

---

## 🏥 Health Checks

### Health Check Script
Create `~/scripts/healthcheck.sh`:
```bash
#!/bin/bash

echo "=== PC2 (RTX 3060) Health Check ==="
echo "Timestamp: $(date)"
echo ""

# GPU Status
echo "GPU Status:"
nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,utilization.memory,memory.used,memory.total --format=csv,noheader

# Ollama Status
if docker ps | grep -q ollama; then
    echo -e "\nOllama: Running"
    docker exec ollama ollama list
else
    echo -e "\nOllama: Not running"
fi

# VRAM Usage
echo -e "\nVRAM Usage:"
nvidia-smi --query-gpu=memory.used,memory.total --format=csv,noheader

# Network connectivity to PC1
echo -e "\nConnectivity to PC1 (Orchestrator):"
if ping -c 1 192.168.1.10 > /dev/null 2>&1; then
    echo "✓ PC1 reachable"
else
    echo "✗ PC1 unreachable"
fi

# Ollama API test
echo -e "\nOllama API:"
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✓ API responding"
else
    echo "✗ API not responding"
fi
```

Run health check:
```bash
chmod +x ~/scripts/healthcheck.sh
./scripts/healthcheck.sh
```

---

## 🔧 Troubleshooting

### Issue 1: Out of Memory (OOM) Errors

**Symptoms**:
```
CUDA error: out of memory
```

**Solutions**:
1. **Reduce context window**:
   ```bash
   docker exec ollama ollama run llama3.1:8b --ctx-size 2048
   ```

2. **Use smaller model**:
   ```bash
   docker exec ollama ollama pull mistral:7b-instruct
   ```

3. **Restart Ollama to clear VRAM**:
   ```bash
   docker restart ollama
   ```

### Issue 2: Slow Inference

**Symptoms**: Tokens/second below 20

**Solutions**:
1. **Check GPU utilization**:
   ```bash
   nvidia-smi dmon -s u
   ```

2. **Ensure GPU clocks are not throttled**:
   ```bash
   sudo nvidia-smi -pm 1
   sudo nvidia-smi -lgc 1777
   ```

3. **Verify no CPU fallback**:
   ```bash
   docker logs ollama | grep -i cuda
   ```

### Issue 3: Ollama Won't Start

**Check Docker logs**:
```bash
docker logs ollama --tail 50
```

**Common fixes**:
```bash
# Restart Docker
sudo systemctl restart docker

# Remove and recreate container
docker rm -f ollama
docker run -d --name ollama --gpus all ... ollama/ollama:latest
```

### Issue 4: Wake-on-LAN Not Working

**Debug steps**:
1. **Verify WOL enabled**:
   ```bash
   sudo ethtool enp3s0 | grep Wake-on
   ```

2. **Check BIOS settings** (must support WOL)

3. **Test from another PC**:
   ```bash
   wakeonlan -i 192.168.1.255 00:11:22:33:44:55
   ```

---

## 📊 Monitoring

### Real-time GPU Monitoring
```bash
# Install nvtop
sudo apt install nvtop

# Run interactive monitor
nvtop
```

### Log Ollama Metrics
```bash
# Watch Ollama logs
docker logs -f ollama

# Monitor requests
watch -n 1 'curl -s http://localhost:11434/api/tags | jq'
```

---

## 📝 Maintenance Checklist

### Daily
- [ ] Check GPU temperature (< 80°C)
- [ ] Verify Ollama is running
- [ ] Test API endpoint

### Weekly
- [ ] Update Ollama: `docker pull ollama/ollama:latest && docker restart ollama`
- [ ] Clean unused models: `docker exec ollama ollama list`
- [ ] Check NVIDIA driver updates

### Monthly
- [ ] Update system: `sudo apt update && sudo apt upgrade`
- [ ] Verify Wake-on-LAN
- [ ] Review model usage and optimize

---

## 📚 Additional Resources

- **Ollama Documentation**: https://ollama.com/docs
- **NVIDIA CUDA Toolkit**: https://developer.nvidia.com/cuda-toolkit
- **Project Nyra Architecture**: `../../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md`

---

**Document Version**: 1.0
**Last Updated**: 2026-01-18
**Maintained By**: Project Nyra Infrastructure Team
