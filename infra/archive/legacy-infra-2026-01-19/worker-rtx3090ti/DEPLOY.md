# PC4 (RTX 3090 Ti) - Deployment Guide

**Role**: Secondary/Backup LLM Worker
**Hardware**: RTX 3090 Ti 24GB VRAM
**Primary Service**: vLLM + LMCache
**Updated**: 2026-01-18

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Hardware Specifications](#hardware-specifications)
3. [Prerequisites](#prerequisites)
4. [CUDA Setup](#cuda-setup)
5. [vLLM Installation](#vllm-installation)
6. [LMCache Coordination](#lmcache-coordination)
7. [Model Recommendations](#model-recommendations)
8. [Load Balancing](#load-balancing)
9. [Failover Configuration](#failover-configuration)
10. [Performance Monitoring](#performance-monitoring)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

PC4 serves as the **secondary/backup LLM inference worker**:
- **RTX 3090 Ti 24GB VRAM** - High-performance Ampere GPU
- **vLLM + LMCache** - Production-grade inference with cache optimization
- **Failover role** - Automatic takeover when PC3 (RTX 5090) is unavailable
- **Load balancing** - Share workload with PC3 during high traffic

### Role in Architecture
```
User Request → PC1 (Nexus Router) → Load Balancing Strategy
                                    ├─→ PC3 (RTX 5090) [Primary]
                                    └─→ PC4 (RTX 3090 Ti) [Secondary/Failover]
```

### Why RTX 3090 Ti?

| Aspect | Advantage |
|--------|-----------|
| **24GB VRAM** | Runs 70B models with quantization (AWQ/GPTQ) |
| **Proven architecture** | Ampere (GA102) - mature, stable drivers |
| **High bandwidth** | 1008 GB/s memory bandwidth |
| **Cost-effective** | Best price/performance for backup inference |
| **Low power** | 450W TDP vs 575W (RTX 5090) |

### Performance Targets
- **Throughput**: 1500+ tokens/sec (Llama 3.1 70B AWQ)
- **Latency**: <80ms TTFT (Time To First Token)
- **Concurrent requests**: 30-40 with batching
- **Uptime**: 99.9% (HA with PC3)
- **Failover time**: <30s

---

## 🖥️ Hardware Specifications

### RTX 3090 Ti Specifications
| Component | Specification | Notes |
|-----------|---------------|-------|
| **Architecture** | Ampere (GA102) | Samsung 8nm |
| **CUDA Cores** | 10,752 | 3x RTX 3060 |
| **Tensor Cores** | 336 (Gen 3) | TF32/FP16 support |
| **VRAM** | 24GB GDDR6X | 384-bit bus |
| **Memory Bandwidth** | 1008 GB/s | Micron GDDR6X |
| **TDP** | 450W | Requires 2x 8-pin |
| **PCIe** | Gen 4 x16 | 32 GB/s bandwidth |
| **Compute Capability** | SM 8.6 | Same as RTX 3060/3070 |

### System Requirements
- **CPU**: 6+ cores, 3.0GHz+ (Ryzen 5/Intel i5 minimum)
- **RAM**: 32GB+ DDR4 (64GB recommended)
- **Storage**: 512GB+ NVMe SSD (for models and cache)
- **PSU**: 850W+ 80+ Gold (450W GPU + 400W system overhead)
- **Cooling**: High-performance air cooling (3-slot)

### VRAM Capacity Planning
```
Total VRAM: 24GB
- Driver/OS overhead: ~1GB
- vLLM overhead: ~1.5GB
- LMCache overhead: ~1GB
- Available for models: ~20GB

Model capacity:
- Llama 3.1 70B (FP16): 28GB ✗ (too large)
- Llama 3.1 70B (AWQ 4-bit): 14GB ✓
- CodeLlama 34B (FP16): 17GB ✓
- Mixtral 8x7B (FP16): 22GB ✗ (use GPTQ)
- Mixtral 8x7B (GPTQ): 11GB ✓
```

**Key takeaway**: PC4 must use **quantized models (AWQ/GPTQ)** for 70B class, or **native FP16 for <34B models**.

---

## ✅ Prerequisites

### 1. Operating System
```bash
# Ubuntu 22.04 LTS (Recommended)
cat /etc/os-release

# Full system update
sudo apt update && sudo apt full-upgrade -y

# Essential packages
sudo apt install -y \
    build-essential \
    cmake \
    git \
    curl \
    wget \
    htop \
    nvtop \
    python3.11 \
    python3.11-venv \
    python3-pip
```

### 2. NVIDIA Driver
```bash
# Check current driver
nvidia-smi

# Install production driver (535+)
sudo apt install nvidia-driver-535

# Reboot
sudo reboot

# Verify driver
nvidia-smi
# Should show Driver Version 535+ and CUDA 12.2+
```

Expected output:
```
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 535.129.03             Driver Version: 535.129.03   CUDA Version: 12.2      |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA GeForce RTX 3090 Ti     On  |   00000000:01:00.0 Off |                  N/A |
|  0%   42C    P8             35W /  450W |     800MiB /  24564MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+
```

### 3. CUDA Toolkit 12.2
```bash
# Download CUDA 12.2
wget https://developer.download.nvidia.com/compute/cuda/12.2.0/local_installers/cuda_12.2.0_535.54.03_linux.run

# Install toolkit only
sudo sh cuda_12.2.0_535.54.03_linux.run --silent --toolkit

# Set environment
cat >> ~/.bashrc << 'EOF'
export PATH=/usr/local/cuda-12.2/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/cuda-12.2/lib64:$LD_LIBRARY_PATH
export CUDA_HOME=/usr/local/cuda-12.2
EOF
source ~/.bashrc

# Verify
nvcc --version
```

### 4. Docker + NVIDIA Container Toolkit
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt update
sudo apt install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# Test
docker run --rm --gpus all nvidia/cuda:12.2.0-base-ubuntu22.04 nvidia-smi
```

---

## 🚀 vLLM Installation

### Docker Deployment (Recommended)

Create directory structure:
```bash
mkdir -p ~/vllm-data/{models,cache,logs}
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  vllm:
    image: vllm/vllm-openai:latest
    container_name: vllm-rtx3090ti
    restart: unless-stopped
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - CUDA_VISIBLE_DEVICES=0

      # Model configuration (AWQ quantized for 24GB)
      - MODEL_NAME=TheBloke/Llama-2-70B-Chat-AWQ
      - QUANTIZATION=awq
      - TENSOR_PARALLEL_SIZE=1
      - GPU_MEMORY_UTILIZATION=0.92
      - MAX_MODEL_LEN=16384  # Reduced from 32K for stability

      # Performance tuning (optimized for 24GB)
      - ENABLE_CHUNKED_PREFILL=true
      - ENABLE_PREFIX_CACHING=true
      - DISABLE_SLIDING_WINDOW=false

      # LMCache integration (shared with PC3)
      - LMCACHE_ENABLED=true
      - LMCACHE_HOST=192.168.1.13  # PC3 LMCache server
      - LMCACHE_PORT=65432

      # API configuration
      - SERVED_MODEL_NAME=llama-3.1-70b-instruct
      - API_KEY=${VLLM_API_KEY}

    volumes:
      - ~/vllm-data/models:/models
      - ~/vllm-data/cache:/cache
      - ~/vllm-data/logs:/logs
    ports:
      - "8000:8000"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    command: >
      --host 0.0.0.0
      --port 8000
      --model /models/Llama-2-70B-Chat-AWQ
      --quantization awq
      --tensor-parallel-size 1
      --gpu-memory-utilization 0.92
      --max-model-len 16384
      --trust-remote-code
      --enable-chunked-prefill
      --enable-prefix-caching
      --api-key ${VLLM_API_KEY}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 120s

networks:
  default:
    name: vllm-network
```

Create `.env` file:
```bash
VLLM_API_KEY=sk-nyra-3090ti-$(openssl rand -hex 16)
HF_TOKEN=hf_your_token_here
```

Download models:
```bash
# Install HF CLI
pip install huggingface-hub

# Login
huggingface-cli login

# Download AWQ quantized Llama 3.1 70B
huggingface-cli download TheBloke/Llama-2-70B-Chat-AWQ \
    --local-dir ~/vllm-data/models/Llama-2-70B-Chat-AWQ \
    --local-dir-use-symlinks False

# Alternative: CodeLlama 34B (native FP16)
huggingface-cli download codellama/CodeLlama-34b-Instruct-hf \
    --local-dir ~/vllm-data/models/CodeLlama-34b-Instruct-hf
```

Start vLLM:
```bash
docker compose up -d

# Monitor startup
docker logs -f vllm-rtx3090ti
```

---

## 🔗 LMCache Coordination

PC4 **shares the LMCache server** running on PC3 (RTX 5090). This provides:
- **Cross-GPU cache hits** - Requests cached by PC3 benefit PC4
- **Reduced memory overhead** - No duplicate cache storage
- **Faster failover** - PC4 has immediate access to PC3's cache

### LMCache Connection

PC4 connects to PC3's LMCache server:
```bash
# In docker-compose.yml
LMCACHE_ENABLED=true
LMCACHE_HOST=192.168.1.13  # PC3 IP
LMCACHE_PORT=65432
```

### Verify Cache Sharing
```bash
# Send request to PC4
curl http://192.168.1.14:8000/v1/completions \
  -H "Authorization: Bearer ${VLLM_API_KEY}" \
  -d '{
    "model": "llama-3.1-70b-instruct",
    "prompt": "Once upon a time",
    "max_tokens": 50
  }'

# Check if cache hit occurred on PC3
curl http://192.168.1.13:65432/stats | jq '.cache_hit_rate'
```

### Fallback: Local LMCache (Optional)

If PC3 is offline, PC4 can run its own LMCache:

```yaml
services:
  lmcache-local:
    image: lmcache/lmcache-server:latest
    container_name: lmcache-rtx3090ti
    restart: unless-stopped
    ports:
      - "65433:65432"  # Different port
    volumes:
      - ~/vllm-data/cache:/cache
    environment:
      - LMCACHE_STORAGE_BACKEND=disk
      - LMCACHE_CACHE_PATH=/cache
      - LMCACHE_MAX_SIZE=50GB  # Smaller than PC3
```

Update vLLM to use local cache:
```bash
LMCACHE_HOST=lmcache-local
```

---

## 📦 Model Recommendations

### Tier 1: Optimal for 24GB (Quantized 70B)

| Model | VRAM | Tokens/sec | Use Case |
|-------|------|------------|----------|
| **Llama 3.1 70B AWQ** | 14GB | 1800+ | General purpose (BEST) |
| **Llama 3.1 70B GPTQ** | 15GB | 1600+ | Alternative quantization |
| **Mixtral 8x7B GPTQ** | 11GB | 2200+ | MoE, faster inference |
| **CodeLlama 34B FP16** | 17GB | 2500+ | Code generation |
| **DeepSeek Coder 33B FP16** | 16GB | 2600+ | Code completion |

### Tier 2: Smaller Models (Native FP16)

| Model | VRAM | Tokens/sec | Use Case |
|-------|------|------------|----------|
| **Llama 3.1 13B FP16** | 7GB | 5000+ | Fast general purpose |
| **Mistral 7B FP16** | 4.5GB | 6000+ | Lightweight inference |
| **CodeLlama 13B FP16** | 7GB | 5500+ | Fast code generation |

### Download Models

**Primary model (AWQ)**:
```bash
huggingface-cli download TheBloke/Llama-2-70B-Chat-AWQ \
    --local-dir ~/vllm-data/models/Llama-2-70B-Chat-AWQ
```

**Code-specific (FP16)**:
```bash
huggingface-cli download codellama/CodeLlama-34b-Instruct-hf \
    --local-dir ~/vllm-data/models/CodeLlama-34b-Instruct-hf
```

**Lightweight (FP16)**:
```bash
huggingface-cli download mistralai/Mistral-7B-Instruct-v0.2 \
    --local-dir ~/vllm-data/models/Mistral-7B-Instruct-v0.2
```

---

## ⚖️ Load Balancing

PC4 shares workload with PC3 using Nexus Router's intelligent load balancing.

### Nexus Router Configuration (PC1)

```yaml
workers:
  pc3:
    url: http://192.168.1.13:8000
    models:
      - llama-3.1-70b-instruct
      - mixtral-8x7b-instruct
    priority: 1
    max_concurrent: 50
    weight: 0.7  # 70% of traffic (faster GPU)

  pc4:
    url: http://192.168.1.14:8000
    models:
      - llama-3.1-70b-instruct
      - codellama-34b-instruct
    priority: 2
    max_concurrent: 30
    weight: 0.3  # 30% of traffic

routing:
  strategy: weighted_round_robin
  health_check_interval: 10s
  sticky_sessions: true  # Same user → same worker
  adaptive_weights: true  # Adjust based on latency
```

### Load Balancing Strategies

#### Strategy 1: Weighted Round-Robin (Default)
- **PC3**: 70% of requests (higher weight)
- **PC4**: 30% of requests

#### Strategy 2: Latency-Based
- Route to worker with lowest current latency
- Automatically shifts load if PC3 is saturated

#### Strategy 3: Model-Based
- **PC3**: Large reasoning tasks (Llama 70B)
- **PC4**: Code-specific tasks (CodeLlama 34B)

#### Strategy 4: Failover-Only
- **PC3**: 100% of traffic
- **PC4**: Only when PC3 is offline or overloaded

### Test Load Balancing

Send concurrent requests to Nexus Router:
```bash
# Install hey (HTTP load generator)
go install github.com/rakyll/hey@latest

# Load test Nexus Router (PC1)
hey -n 100 -c 10 \
  -m POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${NEXUS_API_KEY}" \
  -d '{"model":"llama-3.1-70b-instruct","prompt":"Hello","max_tokens":50}' \
  http://192.168.1.10:3300/v1/completions

# Check distribution
curl http://192.168.1.10:3300/stats | jq '.worker_request_counts'
```

Expected distribution:
```json
{
  "worker_request_counts": {
    "pc3": 70,
    "pc4": 30
  }
}
```

---

## 🔄 Failover Configuration

PC4 automatically takes over when PC3 is unavailable.

### Automatic Failover

Nexus Router detects PC3 failure and routes 100% traffic to PC4:
```
PC3 Health Check → FAILED (3 consecutive checks)
    ↓
Nexus Router marks PC3 as OFFLINE
    ↓
All requests route to PC4 (100%)
    ↓
PC3 recovers → Health check passes
    ↓
Nexus Router marks PC3 as ONLINE
    ↓
Resume normal load balancing (70/30)
```

### Failover SLA
- **Detection time**: 30s (3 failed checks @ 10s interval)
- **Failover time**: <5s (immediate routing)
- **Total downtime**: ~35s

### Monitoring Failover Events

Create `~/scripts/failover-monitor.sh`:
```bash
#!/bin/bash

LOGFILE="/var/log/nyra-failover.log"

while true; do
    PC3_STATUS=$(curl -sf http://192.168.1.13:8000/health && echo "UP" || echo "DOWN")
    PC4_STATUS=$(curl -sf http://192.168.1.14:8000/health && echo "UP" || echo "DOWN")

    if [ "$PC3_STATUS" == "DOWN" ] && [ "$PC4_STATUS" == "UP" ]; then
        echo "$(date) - FAILOVER: PC3 DOWN, PC4 serving all traffic" | tee -a $LOGFILE
        # Alert via webhook
        curl -X POST https://hooks.slack.com/... \
            -d '{"text":"🚨 Failover: PC3 is DOWN, PC4 is now serving all traffic"}'
    elif [ "$PC3_STATUS" == "UP" ] && [ "$PC4_STATUS" == "UP" ]; then
        echo "$(date) - HEALTHY: Both PC3 and PC4 are online" | tee -a $LOGFILE
    fi

    sleep 30
done
```

### Manual Failover Test

**Test 1: Stop PC3, verify PC4 takes over**:
```bash
# On PC3
docker stop vllm-rtx5090

# Wait 30s

# Test request via Nexus Router
curl http://192.168.1.10:3300/v1/completions \
  -H "Authorization: Bearer ${NEXUS_API_KEY}" \
  -d '{"model":"llama-3.1-70b-instruct","prompt":"Test failover","max_tokens":20}'

# Should succeed (routed to PC4)

# Check routing
curl http://192.168.1.10:3300/stats | jq '.active_workers'
# Should show only "pc4"

# Restart PC3
docker start vllm-rtx5090
```

---

## ⚡ Performance Optimization

### 1. GPU Optimization

**Enable Persistence Mode**:
```bash
sudo nvidia-smi -pm 1
```

**Lock GPU Clocks**:
```bash
# RTX 3090 Ti max boost: 1860 MHz
sudo nvidia-smi -lgc 1860
```

**Optimize Power/Performance**:
```bash
# Full power (450W)
sudo nvidia-smi -pl 450

# OR reduce to 400W (saves power, <3% perf loss)
sudo nvidia-smi -pl 400
```

### 2. vLLM Tuning (24GB VRAM)

**GPU Memory Utilization**:
```bash
# Aggressive (for max throughput)
GPU_MEMORY_UTILIZATION=0.92

# Conservative (for stability)
GPU_MEMORY_UTILIZATION=0.88
```

**Context Length**:
```bash
# AWQ models work best with shorter context
MAX_MODEL_LEN=16384  # 16K tokens

# Can push to 32K if not memory-constrained
MAX_MODEL_LEN=32768
```

**Batch Size**:
```bash
# AWQ models can handle larger batches
MAX_NUM_SEQS=64  # vs 32 for FP16
```

### 3. AWQ Quantization Benefits

**Memory savings**:
- FP16 70B: ~140GB (doesn't fit)
- AWQ 4-bit 70B: ~35GB → **14GB in VRAM** (fits!)

**Performance**:
- **2-3x throughput** vs FP16 (smaller memory footprint = more batching)
- **Minimal quality loss** (<2% vs FP16)

### 4. System Tuning

**Increase file descriptors**:
```bash
echo "* soft nofile 1000000" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 1000000" | sudo tee -a /etc/security/limits.conf
```

**CPU governor**:
```bash
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

---

## 📊 Performance Monitoring

### Real-time GPU Monitoring
```bash
# nvtop
nvtop

# nvidia-smi continuous
watch -n 1 nvidia-smi

# GPU utilization detailed
nvidia-smi dmon -s muct
```

### vLLM Metrics
```bash
# Prometheus metrics
curl http://localhost:8000/metrics

# Key metrics
curl http://localhost:8000/metrics | grep -E "vllm:num_requests|vllm:time_to_first_token"
```

### Comparative Metrics (PC3 vs PC4)

| Metric | PC3 (RTX 5090) | PC4 (RTX 3090 Ti) | Ratio |
|--------|----------------|-------------------|-------|
| **Tokens/sec** | 2500 | 1800 | 1.4x |
| **TTFT (ms)** | 30 | 50 | 1.7x |
| **Max batch** | 64 | 48 | 1.3x |
| **VRAM** | 32GB | 24GB | 1.3x |
| **Power** | 575W | 450W | 1.3x |

**Takeaway**: PC3 is ~40% faster but uses ~25% more power.

---

## 🔧 Troubleshooting

### Issue 1: AWQ Model Not Loading

**Symptoms**:
```
ValueError: Quantization method 'awq' is not supported
```

**Solution**:
```bash
# Ensure vLLM has AWQ support
pip install vllm[awq]

# OR rebuild Docker image
docker compose build --no-cache vllm
```

### Issue 2: Out of Memory with 70B Model

**Symptoms**:
```
CUDA OOM: Tried to allocate 18.00 GiB
```

**Solutions**:
1. **Lower GPU memory utilization**:
   ```bash
   GPU_MEMORY_UTILIZATION=0.85  # From 0.92
   ```

2. **Reduce context length**:
   ```bash
   MAX_MODEL_LEN=8192  # From 16384
   ```

3. **Use even more aggressive quantization**:
   ```bash
   # Try GPTQ instead of AWQ
   huggingface-cli download TheBloke/Llama-2-70B-Chat-GPTQ
   ```

### Issue 3: Slow Inference (< 1000 tokens/sec)

**Debug**:
```bash
# Check GPU utilization
nvidia-smi dmon -s u
# Should be 85%+

# Check batch size
docker logs vllm-rtx3090ti | grep "batch_size"

# Benchmark
curl http://localhost:8000/v1/completions \
  -H "Authorization: Bearer ${VLLM_API_KEY}" \
  -d '{"model":"llama-3.1-70b-instruct","prompt":"Test","max_tokens":100}' \
  -w "\nTime: %{time_total}s\n"
```

**Solutions**:
1. **Enable prefix caching**:
   ```bash
   ENABLE_PREFIX_CACHING=true
   ```

2. **Verify AWQ kernels loaded**:
   ```bash
   docker logs vllm-rtx3090ti | grep -i "awq"
   ```

### Issue 4: LMCache Connection Failed

**Symptoms**:
```
Failed to connect to LMCache at 192.168.1.13:65432
```

**Debug**:
```bash
# Test connectivity to PC3
ping 192.168.1.13

# Test LMCache port
nc -zv 192.168.1.13 65432

# Check PC3 LMCache status
curl http://192.168.1.13:65432/health
```

**Solution**: Fall back to local LMCache (see [LMCache Coordination](#lmcache-coordination)).

---

## 📝 Maintenance Checklist

### Daily
- [ ] Check GPU temperature (< 80°C)
- [ ] Verify vLLM health: `curl http://localhost:8000/health`
- [ ] Check failover readiness: Test PC3 connectivity

### Weekly
- [ ] Update vLLM: `docker compose pull && docker compose up -d`
- [ ] Review error logs: `docker logs vllm-rtx3090ti | grep -i error`
- [ ] Test manual failover (stop PC3, verify routing)
- [ ] Check cache hit rate: `curl http://192.168.1.13:65432/stats`

### Monthly
- [ ] Update NVIDIA driver
- [ ] Benchmark performance: Compare with PC3
- [ ] Audit model storage
- [ ] Review load balancing weights

---

## 📚 Additional Resources

- **vLLM AWQ Support**: https://docs.vllm.ai/en/latest/quantization/awq.html
- **Nexus Router Documentation**: `../../services/nexus-router/README.md`
- **Project Nyra Architecture**: `../../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md`

---

**Document Version**: 1.0
**Last Updated**: 2026-01-18
**Maintained By**: Project Nyra Infrastructure Team
