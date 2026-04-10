# PC2/PC3 Worker Setup Guide - RTX 4090

**Target Hardware**: High-end workstation with NVIDIA RTX 4090 24GB
**Roles**: PC2 (Reasoning Worker), PC3 (Analysis Worker)
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
CPU: Intel Core i9 or AMD Ryzen 9 (12+ cores recommended)
RAM: 64GB DDR4/DDR5
GPU: NVIDIA RTX 4090 24GB VRAM (required)
Storage: 2TB NVMe SSD (PCIe 4.0 recommended)
Network: Gigabit Ethernet (2.5GbE or 10GbE recommended)
PSU: 1000W+ (80+ Gold minimum)
OS: Windows 11 Pro (build 22000+)
```

### Verified Compatible Hardware

```yaml
GPUs:
  - NVIDIA RTX 4090 24GB (recommended)
  - NVIDIA RTX 4090 Ti 48GB (if available)
  - NVIDIA RTX A6000 48GB (workstation alternative)

Motherboards:
  - PCIe 4.0/5.0 x16 slot required
  - Recommended: PCIe 5.0 for maximum bandwidth

CPUs (Recommended):
  - Intel: Core i9-13900K, i9-14900K
  - AMD: Ryzen 9 7950X, Ryzen 9 7950X3D
```

### Storage Requirements

```
Operating System:     50GB
Docker Images:        100GB
Ollama Models:        800GB (70B+ models)
Model Cache:          100GB
Logs:                 20GB
Temp/Scratch:         50GB
Total Recommended:    1.2TB+
```

### Power Requirements

```yaml
RTX 4090 TDP: 450W
System TDP: 300-400W
Recommended PSU: 1000W-1200W (80+ Gold minimum)
Power Connectors: 1x 12VHPWR (16-pin) or 3x 8-pin PCIe
```

---

## ✅ Pre-Installation Checklist

### Step 1: NVIDIA Driver Installation

```powershell
# Option 1: NVIDIA GeForce Experience (for GeForce cards)
winget install Nvidia.GeForceExperience

# Open GeForce Experience → Drivers → Download Latest
# Recommended: Studio Driver (more stable than Game Ready)

# Option 2: Manual download (for workstation cards)
# Visit: https://www.nvidia.com/Download/index.aspx
# Product: GeForce RTX 4090 (or RTX A6000)
# OS: Windows 11 64-bit
# Download Type: Studio Driver
# Download and install

# Verify installation
nvidia-smi

# Expected output:
# +-----------------------------------------------------------------------------+
# | NVIDIA-SMI 551.23       Driver Version: 551.23       CUDA Version: 12.4    |
# |-------------------------------+----------------------+----------------------+
# | GPU  Name            TCC/WDDM | Bus-Id        Disp.A | Volatile Uncorr. ECC |
# | Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
# |===============================+======================+======================|
# |   0  NVIDIA GeForce ... WDDM  | 00000000:01:00.0  On |                  Off |
# | 30%   32C    P8    25W / 450W |   1024MiB / 24564MiB |      0%      Default |
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
git --version           # 2.40+
node --version          # v20.x.x
python --version        # 3.11+
docker --version        # 24.0+
nvidia-smi              # Should show GPU info
```

### Step 3: Docker Desktop Configuration

```powershell
# Start Docker Desktop
# Wait for initialization (1-2 minutes)

# Verify Docker
docker run hello-world

# Configure Docker for high-end GPU workload
# Docker Desktop → Settings → Resources:
# Memory: 48GB (leave 16GB for host + GPU processes)
# CPUs: 14 (leave 2-4 for host)
# Disk: 1.5TB
# Swap: 4GB

# Apply and Restart Docker
```

---

## 🌐 Network Configuration

### Static IP Configuration

**PC2 Configuration**:

```powershell
# Find your network adapter name
Get-NetAdapter

# Set static IP for PC2
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.1.102 -PrefixLength 24 -DefaultGateway 192.168.1.1

# Set DNS servers
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("8.8.8.8","8.8.4.4")

# Verify configuration
Get-NetIPAddress -InterfaceAlias "Ethernet"
```

**PC3 Configuration**:

```powershell
# Set static IP for PC3
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.1.103 -PrefixLength 24 -DefaultGateway 192.168.1.1

# Set DNS servers
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("8.8.8.8","8.8.4.4")
```

### Tailscale VPN Setup

```powershell
# Start Tailscale
tailscale up

# Follow browser authentication prompt

# Verify connection
tailscale status

# Expected: See PC1 (orchestrator) and other workers

# Test connectivity
tailscale ping 10.0.0.1  # Ping PC1 (orchestrator)
tailscale ping 10.0.0.4  # Ping PC4 (RTX 3060 worker)
```

### Firewall Configuration

```powershell
# Run as Administrator

# Allow Ollama
New-NetFirewallRule -DisplayName "Ollama API" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 11434,11435 `
    -Action Allow

# Allow vLLM (if using)
New-NetFirewallRule -DisplayName "vLLM API" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 8001,8002 `
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

**PC2 Example**:
```
Detected Hardware:
├── CPU: AMD Ryzen 9 7950X (16 cores, 32 threads)
├── RAM: 64GB DDR5
├── Storage: 2TB NVMe PCIe 4.0 SSD (1.8TB free)
├── GPU: NVIDIA GeForce RTX 4090 (24GB VRAM)
└── Network: 2.5GbE

Suggested Role: Worker (PC2) - Reasoning
Reason: RTX 4090 24GB detected - optimized for complex reasoning tasks
```

**Select Role**:
- For PC2: Choose **PC2 - Worker (RTX 4090) - Reasoning**
- For PC3: Choose **PC3 - Worker (RTX 4090) - Analysis**

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
- ✅ Claude Flow (for local swarm testing)

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
   - GPU Detected: NVIDIA RTX 4090 24GB
   - CUDA Version: 12.4
   - Driver Version: 551.23

Click **Continue**

#### Phase 6: Configuration Editor

**Edit Environment Variables (PC2 Example)**:

```bash
# .env.pc2
PC_NUMBER=2
PC_ROLE=worker
PC_IP=10.0.0.2
PC_GPU=rtx4090
PC_HOSTNAME=pc2-worker-4090
PC_WORKLOAD=reasoning

# Ollama Configuration
OLLAMA_HOST=0.0.0.0
OLLAMA_PORT=11434
OLLAMA_ORIGINS=*
OLLAMA_NUM_PARALLEL=4
OLLAMA_MAX_LOADED_MODELS=3

# GPU Configuration
CUDA_VISIBLE_DEVICES=0
NVIDIA_VISIBLE_DEVICES=all
CUDA_MEMORY_POOL_SIZE=20GB

# vLLM (Optional)
VLLM_PORT=8001
VLLM_GPU_MEMORY_UTILIZATION=0.9

# Monitoring
NODE_EXPORTER_PORT=9100
```

**For PC3**, change:
```bash
PC_NUMBER=3
PC_IP=10.0.0.3
PC_WORKLOAD=analysis
OLLAMA_PORT=11435
VLLM_PORT=8002
```

Click **Save and Continue**

#### Phase 7: Service Deployment

Watch real-time deployment progress:

```
[1/3] Pulling ollama/ollama:latest...      ████████████ 100%
[2/3] Pulling vllm/vllm-openai:latest...   ████████████ 100%
[3/3] Pulling prometheus/node-exporter...  ████████████ 100%
[4/3] Starting services...                 ████████████ 100%
[5/3] GPU verification...                  ████████████ 100%
[6/3] Deployment complete!                 ████████████ 100%
```

#### Phase 8: Health Check

```
✅ Ollama - Healthy (11434/11435)
✅ vLLM - Healthy (8001/8002)
✅ Node Exporter - Healthy (9100)
✅ GPU Available - NVIDIA RTX 4090 24GB
✅ VRAM Available - 24GB / 24GB
```

Click **Continue to Model Installation**

---

## 🎮 GPU Configuration

### NVIDIA Container Toolkit Installation

**Automated Installation** (via GUI installer):
```powershell
# The installer configures:
# 1. NVIDIA package repository
# 2. NVIDIA Container Toolkit
# 3. Docker runtime configuration
# 4. GPU access verification

# Manual verification:
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
  "default-runtime": "nvidia",
  "experimental": true,
  "features": {
    "buildkit": true
  },
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "5"
  }
}
```

### GPU Verification

```powershell
# Test GPU access from Docker
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi

# Expected output: Same as host nvidia-smi, showing RTX 4090

# Verify Ollama GPU access
docker exec nyra-ollama-pc2 nvidia-smi

# Check GPU memory
nvidia-smi --query-gpu=memory.total,memory.used,memory.free --format=csv

# Expected:
# memory.total [MiB], memory.used [MiB], memory.free [MiB]
# 24564 MiB, 1024 MiB, 23540 MiB
```

### Performance Optimization

```powershell
# Enable persistence mode (reduces latency)
nvidia-smi -pm 1

# Set power limit (optional, for stability)
nvidia-smi -pl 400  # 400W instead of 450W (reduces heat)

# Monitor GPU clocks
nvidia-smi --query-gpu=clocks.current.graphics,clocks.max.graphics --format=csv -l 1
```

---

## 🤖 Ollama Model Installation

### Recommended Models for RTX 4090 (24GB VRAM)

**PC2 - Reasoning Workload**:

```bash
# Tier 1: Large Language Models (70B parameter class)
# DeepSeek R1 70B - Advanced reasoning (quantized)
docker exec nyra-ollama-pc2 ollama pull deepseek-r1:70b-q4_K_M

# Llama 3.3 70B - Large context reasoning
docker exec nyra-ollama-pc2 ollama pull llama3.3:70b-instruct-q4_K_M

# Mixtral 8x7B - Mixture of Experts
docker exec nyra-ollama-pc2 ollama pull mixtral:8x7b-instruct-v0.1-q5_K_M
```

**PC3 - Analysis Workload**:

```bash
# Tier 1: Code Analysis Models
# CodeLlama 34B - Deep code analysis
docker exec nyra-ollama-pc3 ollama pull codellama:34b-instruct-q5_K_M

# DeepSeek Coder V2 16B - Code understanding
docker exec nyra-ollama-pc3 ollama pull deepseek-coder-v2:16b-instruct-q5_K_M

# Qwen2.5-Coder 32B - Multi-language analysis
docker exec nyra-ollama-pc3 ollama pull qwen2.5-coder:32b-instruct-q4_K_M
```

### Advanced Model Configurations

**High-Quality Models** (full precision, requires careful memory management):

```bash
# PC2 - For maximum reasoning quality
# DeepSeek R1 70B (Q8 quantization) - 38GB VRAM (requires offloading)
docker exec nyra-ollama-pc2 ollama pull deepseek-r1:70b-q8_0

# Llama 3.3 70B (Q6 quantization) - 28GB VRAM (fits with minimal overhead)
docker exec nyra-ollama-pc2 ollama pull llama3.3:70b-instruct-q6_K
```

**Balanced Models** (good quality, fits comfortably):

```bash
# PC2 - Balanced reasoning
docker exec nyra-ollama-pc2 ollama pull deepseek-r1:70b-q5_K_M    # ~25GB
docker exec nyra-ollama-pc2 ollama pull llama3.3:70b-instruct-q4_K_M  # ~20GB
docker exec nyra-ollama-pc2 ollama pull mixtral:8x22b-q4_K_M     # ~23GB

# PC3 - Balanced analysis
docker exec nyra-ollama-pc3 ollama pull codellama:34b-q5_K_M     # ~22GB
docker exec nyra-ollama-pc3 ollama pull deepseek-coder-v2:236b-q2_K  # ~24GB (aggressive quantization)
```

### Model Installation Workflow

**Batch Installation Script**:

```powershell
# install-models-pc2.ps1
$models = @(
    "deepseek-r1:70b-q4_K_M",
    "llama3.3:70b-instruct-q4_K_M",
    "mixtral:8x7b-instruct-v0.1-q5_K_M"
)

foreach ($model in $models) {
    Write-Host "Pulling $model..." -ForegroundColor Cyan
    $start = Get-Date

    docker exec nyra-ollama-pc2 ollama pull $model

    $duration = (Get-Date) - $start
    Write-Host "✓ $model installed in $($duration.TotalMinutes.ToString('F2')) minutes" -ForegroundColor Green
    Write-Host ""
}

Write-Host "All models installed successfully!" -ForegroundColor Green
```

**Monitor Download Progress**:

```powershell
# Watch Docker logs in real-time
docker compose logs -f ollama

# Check disk space
Get-PSDrive C | Select-Object Used,Free

# Check model list
docker exec nyra-ollama-pc2 ollama list

# Expected output:
# NAME                               ID            SIZE    MODIFIED
# deepseek-r1:70b-q4_K_M            abc123def     36GB    2 minutes ago
# llama3.3:70b-instruct-q4_K_M      def456ghi     40GB    10 minutes ago
# mixtral:8x7b-instruct-v0.1-q5_K_M ghi789jkl     26GB    18 minutes ago
```

### Model Testing and Benchmarking

```powershell
# Test model inference
$prompt = @"
You are a senior software architect. Analyze the following code architecture:

```
class UserService {
  constructor(db, cache, logger) {
    this.db = db;
    this.cache = cache;
    this.logger = logger;
  }

  async getUser(id) {
    const cached = await this.cache.get(`user:${id}`);
    if (cached) return cached;

    const user = await this.db.users.findById(id);
    await this.cache.set(`user:${id}`, user, 3600);
    return user;
  }
}
```

Provide a detailed architecture review covering: design patterns, scalability, error handling, and potential improvements.
"@

# Run benchmark
$result = Measure-Command {
    docker exec nyra-ollama-pc2 ollama run deepseek-r1:70b-q4_K_M $prompt
}

Write-Host "Generation time: $($result.TotalSeconds.ToString('F2')) seconds"

# Benchmark tokens per second
$response = docker exec nyra-ollama-pc2 ollama run deepseek-r1:70b-q4_K_M $prompt --verbose

# Check GPU utilization during inference
nvidia-smi dmon -s u -c 10
```

### Model Configuration Tuning

**Optimize for RTX 4090**:

```bash
# .env.pc2
OLLAMA_NUM_PARALLEL=4        # Can handle 4 concurrent requests
OLLAMA_MAX_LOADED_MODELS=3   # Keep 3 models in memory (8GB each)
OLLAMA_CONTEXT_LENGTH=16384  # Large context window
OLLAMA_NUM_GPU=1             # Use all available GPU
OLLAMA_GPU_LAYERS=-1         # Offload all layers to GPU

# For 70B models with Q4 quantization
OLLAMA_ROPE_SCALING=linear
OLLAMA_FLASH_ATTENTION=true
```

**Model-Specific Settings**:

```yaml
deepseek-r1:70b-q4_K_M:
  VRAM: ~22GB
  Context: 128K tokens
  Speed: ~15 tokens/sec
  Use Cases: Complex reasoning, multi-step planning, architecture design
  Batch Size: 1 (for large contexts)

llama3.3:70b-instruct-q4_K_M:
  VRAM: ~20GB
  Context: 128K tokens
  Speed: ~18 tokens/sec
  Use Cases: Long document analysis, code review
  Batch Size: 2

mixtral:8x7b-instruct-v0.1-q5_K_M:
  VRAM: ~16GB
  Context: 32K tokens
  Speed: ~30 tokens/sec
  Use Cases: Fast reasoning, multi-task handling
  Batch Size: 3

codellama:34b-q5_K_M:
  VRAM: ~22GB
  Context: 100K tokens
  Speed: ~20 tokens/sec
  Use Cases: Code analysis, repository understanding
  Batch Size: 1
```

---

## ✔️ Post-Installation Verification

### Service Health Checks

```powershell
# Check all services
docker ps

# Expected: ollama, vllm (optional), node-exporter running

# Check Ollama logs
docker compose logs ollama

# Check GPU utilization
nvidia-smi dmon -s u -c 5

# Check VRAM usage
nvidia-smi --query-gpu=memory.used,memory.total,utilization.gpu --format=csv -l 1
```

### Network Connectivity Tests

```powershell
# Test Ollama API locally
Test-NetConnection -ComputerName localhost -Port 11434

# Test from orchestrator (PC1)
# On PC1:
Test-NetConnection -ComputerName 10.0.0.2 -Port 11434  # PC2
Test-NetConnection -ComputerName 10.0.0.3 -Port 11435  # PC3

# Test Tailscale connectivity
tailscale ping 10.0.0.1  # Ping orchestrator
```

### API Endpoint Tests

```powershell
# Ollama health check
curl http://localhost:11434/api/tags

# List models
$models = curl http://localhost:11434/api/tags | ConvertFrom-Json
$models.models | Select-Object name, size, modified_at | Format-Table

# Test generation
$body = @{
    model = "deepseek-r1:70b-q4_K_M"
    prompt = "Explain the SOLID principles in software engineering"
    stream = $false
    options = @{
        temperature = 0.7
        num_ctx = 8192
    }
} | ConvertTo-Json

$response = curl http://localhost:11434/api/generate `
    -Method Post `
    -ContentType "application/json" `
    -Body $body | ConvertFrom-Json

Write-Host $response.response
```

### Performance Benchmarks

```powershell
# Comprehensive benchmark script
$benchmarks = @(
    @{
        Name = "Short prompt"
        Prompt = "Write a Python function to reverse a string"
        ExpectedTime = 5
    },
    @{
        Name = "Medium prompt"
        Prompt = "Design a RESTful API for a task management system with authentication, CRUD operations, and real-time updates"
        ExpectedTime = 30
    },
    @{
        Name = "Long prompt"
        Prompt = @"
You are a senior software architect reviewing a microservices architecture. Analyze the following system:

System Components:
1. API Gateway (Kong)
2. User Service (Node.js + MongoDB)
3. Order Service (Go + PostgreSQL)
4. Payment Service (Python + Redis)
5. Notification Service (Node.js + RabbitMQ)

Current Issues:
- High latency on order creation (2-3 seconds)
- Payment service crashes under load
- Inconsistent data between services
- Difficult to trace errors across services

Provide:
1. Root cause analysis
2. Architecture improvements
3. Implementation plan
4. Migration strategy
"@
        ExpectedTime = 60
    }
)

foreach ($bench in $benchmarks) {
    Write-Host "`nRunning benchmark: $($bench.Name)" -ForegroundColor Cyan

    $start = Get-Date
    $nvidiaBefore = nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits

    docker exec nyra-ollama-pc2 ollama run deepseek-r1:70b-q4_K_M $bench.Prompt

    $duration = ((Get-Date) - $start).TotalSeconds
    $nvidiaAfter = nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits

    Write-Host "✓ Completed in $($duration.ToString('F2'))s (expected: ~$($bench.ExpectedTime)s)" -ForegroundColor Green
    Write-Host "  VRAM: $nvidiaBefore MB → $nvidiaAfter MB" -ForegroundColor Yellow

    if ($duration -gt ($bench.ExpectedTime * 1.5)) {
        Write-Host "  ⚠ Performance warning: Took longer than expected" -ForegroundColor Red
    }
}

# Tokens per second calculation
Write-Host "`n Calculating tokens/sec..." -ForegroundColor Cyan
$testPrompt = "Write a comprehensive explanation of" * 100  # ~100 tokens

$result = Measure-Command {
    $output = docker exec nyra-ollama-pc2 ollama run deepseek-r1:70b-q4_K_M $testPrompt
}

$estimatedTokens = ($output -split '\s+').Count
$tokensPerSec = $estimatedTokens / $result.TotalSeconds

Write-Host "Estimated throughput: $($tokensPerSec.ToString('F2')) tokens/sec" -ForegroundColor Green
Write-Host "Expected: 15-20 tokens/sec for 70B Q4 models" -ForegroundColor Yellow
```

---

## 🔧 Troubleshooting

### GPU Issues

**Issue**: nvidia-smi shows low GPU utilization during inference

```powershell
# Check if model is using GPU
docker exec nyra-ollama-pc2 nvidia-smi

# Verify GPU layers are offloaded
docker exec nyra-ollama-pc2 ollama show deepseek-r1:70b-q4_K_M --verbose

# Should show: "num_gpu: -1" (all layers on GPU)

# If not, set in environment:
$env:OLLAMA_NUM_GPU = "1"
$env:OLLAMA_GPU_LAYERS = "-1"

# Restart Ollama
docker compose restart ollama
```

**Issue**: CUDA out of memory errors

```powershell
# Check current VRAM usage
nvidia-smi --query-gpu=memory.used,memory.total --format=csv

# Solutions:
# 1. Use more aggressive quantization (Q4 instead of Q5/Q6/Q8)
docker exec nyra-ollama-pc2 ollama pull deepseek-r1:70b-q4_K_M

# 2. Reduce concurrent requests
# Edit .env.pc2:
OLLAMA_NUM_PARALLEL=2

# 3. Reduce context length
# Edit .env.pc2:
OLLAMA_CONTEXT_LENGTH=8192

# 4. Clear GPU memory
docker restart nyra-ollama-pc2
```

**Issue**: Thermal throttling (GPU temp > 85°C)

```powershell
# Monitor temperature
nvidia-smi dmon -s t -c 30

# Check thermal throttling
nvidia-smi --query-gpu=clocks_throttle_reasons.active --format=csv

# Solutions:
# 1. Improve case airflow
# 2. Increase fan speed
nvidia-smi -i 0 -pl 400  # Reduce power limit to 400W

# 3. Check thermal paste and GPU cooler mounting
# 4. Reduce ambient temperature
```

### Ollama Issues

**Issue**: Slow inference (< 10 tokens/sec for 70B models)

```powershell
# Diagnose performance
Write-Host "System Check:" -ForegroundColor Cyan

# 1. GPU utilization
nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader
# Expected: >90% during inference

# 2. PCIe bandwidth
nvidia-smi --query-gpu=pcie.link.gen.current,pcie.link.width.current --format=csv
# Expected: Gen4 or Gen5, x16 lanes

# 3. CPU bottleneck
Get-Counter '\Processor(_Total)\% Processor Time'

# 4. Memory bandwidth
# Check RAM speed: wmic memorychip get speed
# Expected: DDR4-3200+ or DDR5-4800+

# Optimizations:
# 1. Enable Flash Attention
$env:OLLAMA_FLASH_ATTENTION = "true"

# 2. Increase batch size (if processing multiple requests)
$env:OLLAMA_BATCH_SIZE = "512"

# 3. Use optimized CUDA kernels
$env:OLLAMA_CUDA_OPTIMIZE = "true"

# Restart Ollama
docker compose restart ollama
```

**Issue**: Models won't load ("failed to allocate memory")

```powershell
# Check available VRAM
nvidia-smi --query-gpu=memory.free --format=csv,noheader

# If < 20GB free:
# 1. Close other GPU applications
# 2. Restart Docker
docker restart

# 3. Clear Ollama cache
docker exec nyra-ollama-pc2 rm -rf /root/.ollama/models/blobs/*

# 4. Use smaller models or more aggressive quantization
docker exec nyra-ollama-pc2 ollama pull deepseek-r1:70b-q2_K  # More aggressive
```

### Network Issues

**Issue**: Can't reach Ollama from orchestrator (PC1)

```powershell
# On PC2, verify Ollama is listening on all interfaces
docker exec nyra-ollama-pc2 netstat -tuln | findstr 11434

# Should show: 0.0.0.0:11434

# Check firewall
Get-NetFirewallRule -DisplayName "Ollama API"

# Re-add firewall rule if missing
New-NetFirewallRule -DisplayName "Ollama API" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 11434 `
    -Action Allow

# Test from PC1
# On PC1:
curl http://10.0.0.2:11434/api/tags

# If still failing, check Tailscale
tailscale status
tailscale ping 10.0.0.2
```

### Performance Optimization

**Issue**: Inconsistent performance across requests

```powershell
# Enable GPU persistence mode
nvidia-smi -pm 1

# Set consistent GPU clocks
nvidia-smi -lgc 2100,2100  # Lock GPU clock at 2100 MHz

# Disable power management
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c  # High Performance

# Optimize Docker
# Edit daemon.json:
{
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ],
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}

# Restart Docker
Restart-Service docker
```

---

## 📚 Additional Resources

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture overview
- **[SETUP-ORCHESTRATOR.md](SETUP-ORCHESTRATOR.md)** - PC1 setup guide
- **[SETUP-WORKER-RTX3060.md](SETUP-WORKER-RTX3060.md)** - PC4 setup guide
- **[INSTALLER-GUIDE.md](INSTALLER-GUIDE.md)** - GUI installer detailed guide
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Comprehensive troubleshooting
- **[Ollama Documentation](https://github.com/ollama/ollama)** - Ollama reference
- **[vLLM Documentation](https://docs.vllm.ai/)** - vLLM high-performance inference
- **[NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/)** - GPU Docker support

---

## 🎉 Next Steps

1. **Verify GPU worker is accessible from PC1**:
   ```powershell
   # On PC1:
   curl http://10.0.0.2:11434/api/tags  # PC2
   curl http://10.0.0.3:11435/api/tags  # PC3
   ```

2. **Test distributed reasoning**:
   ```powershell
   # On PC1:
   npx @claude-flow/cli@latest swarm init --topology hierarchical
   npx @claude-flow/cli@latest agent spawn -t researcher --name pc2-researcher
   npx @claude-flow/cli@latest agent spawn -t analyst --name pc3-analyst
   ```

3. **Monitor GPU performance**:
   - Access Grafana: http://10.0.0.1:3000
   - View GPU metrics dashboard
   - Monitor VRAM usage, temperature, utilization

4. **Benchmark and optimize**:
   - Run comprehensive benchmarks
   - Tune OLLAMA_NUM_PARALLEL based on workload
   - Monitor tokens/sec and adjust model quantization

---

**Completed**: ✅
**PC2/PC3 (RTX 4090 Workers) are now ready for high-performance AI workloads!**
