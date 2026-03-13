# PC3 (RTX 5090) - Deployment Guide

**Role**: Primary Production LLM Worker
**Hardware**: RTX 5090 32GB VRAM
**Primary Service**: vLLM + LMCache
**Updated**: 2026-01-18

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Hardware Specifications](#hardware-specifications)
3. [Prerequisites](#prerequisites)
4. [CUDA Setup](#cuda-setup)
5. [vLLM Installation](#vllm-installation)
6. [LMCache Setup](#lmcache-setup)
7. [Model Recommendations](#model-recommendations)
8. [Performance Optimization](#performance-optimization)
9. [High Availability](#high-availability)
10. [Monitoring](#monitoring)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

PC3 serves as the **primary production LLM inference worker**:
- **RTX 5090 32GB VRAM** - Flagship GPU for large model inference
- **vLLM** - High-performance inference engine with PagedAttention
- **LMCache** - KV cache optimization for faster inference
- **Production workloads** - Primary inference endpoint for all large models
- **HA primary** - Automatic failover to PC4 if unavailable

### Why vLLM + LMCache?

| Feature | Benefit |
|---------|---------|
| **PagedAttention** | 24x higher throughput than HuggingFace |
| **Continuous batching** | Optimal GPU utilization |
| **Tensor parallelism** | Split 70B+ models across GPUs (future) |
| **LMCache** | 3-10x faster inference with KV cache reuse |
| **OpenAI API compatible** | Drop-in replacement for cloud APIs |

### Performance Targets
- **Throughput**: 2000+ tokens/second (Llama 3.1 70B)
- **Latency**: <50ms TTFT (Time To First Token)
- **Concurrent requests**: 50+ with batching
- **Uptime**: 99.9% (HA with PC4)

---

## 🖥️ Hardware Specifications

### RTX 5090 Specifications
| Component | Specification | Notes |
|-----------|---------------|-------|
| **Architecture** | Blackwell (5nm) | Next-gen AI architecture |
| **CUDA Cores** | 21,760 | 6x RTX 3060 |
| **Tensor Cores** | 680 (Gen 5) | FP4/FP8 support |
| **VRAM** | 32GB GDDR7 | 512-bit bus |
| **Memory Bandwidth** | 1.792 TB/s | 3.5x RTX 4090 |
| **TDP** | 575W | Requires 3x 8-pin or 2x 12VHPWR |
| **PCIe** | Gen 5 x16 | 128 GB/s bandwidth |
| **NVLink** | 4th Gen (optional) | 900 GB/s for multi-GPU |

### System Requirements
- **CPU**: 8+ cores, 3.5GHz+ (Ryzen 7/Intel i7 minimum)
- **RAM**: 64GB+ DDR5 (128GB recommended)
- **Storage**: 1TB+ NVMe SSD (for models and cache)
- **PSU**: 1200W+ 80+ Platinum (850W GPU + 350W system overhead)
- **Cooling**: High-performance air or AIO liquid cooling

### VRAM Capacity Planning
```
Total VRAM: 32GB
- Driver/OS overhead: ~1GB
- vLLM overhead: ~2GB
- LMCache overhead: ~1GB
- Available for models: ~28GB

Model capacity:
- Llama 3.1 70B (FP16): 28GB ✓ (fits!)
- Llama 3.1 70B (AWQ 4-bit): 14GB ✓ (2x throughput)
- Mixtral 8x22B (FP16): 44GB ✗ (use AWQ/GPTQ)
- DeepSeek Coder 33B (FP16): 16GB ✓
```

---

## ✅ Prerequisites

### 1. Operating System
```bash
# Ubuntu 22.04 LTS (Recommended for stability)
# OR Ubuntu 24.04 LTS (Latest features)
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
    python3-pip \
    ninja-build \
    ccache
```

### 2. NVIDIA Driver (Latest Production)
```bash
# Check current driver
nvidia-smi

# Install latest production driver (550+)
sudo apt install nvidia-driver-550
# OR use NVIDIA's official installer for cutting-edge support
wget https://us.download.nvidia.com/XFree86/Linux-x86_64/550.54.14/NVIDIA-Linux-x86_64-550.54.14.run
sudo sh NVIDIA-Linux-x86_64-550.54.14.run

# Reboot
sudo reboot

# Verify driver and CUDA capability
nvidia-smi
# Should show CUDA 12.4+ and SM 9.0 (Blackwell)
```

Expected output:
```
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 550.54.14              Driver Version: 550.54.14      CUDA Version: 12.4     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA GeForce RTX 5090        On  |   00000000:01:00.0  On |                  N/A |
|  0%   45C    P8             35W /  575W |    1200MiB /  32768MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+
```

### 3. CUDA Toolkit 12.4+
```bash
# Download CUDA 12.4
wget https://developer.download.nvidia.com/compute/cuda/12.4.0/local_installers/cuda_12.4.0_550.54.14_linux.run

# Install (toolkit only, driver already installed)
sudo sh cuda_12.4.0_550.54.14_linux.run --silent --toolkit --no-opengl-libs

# Set environment variables
cat >> ~/.bashrc << 'EOF'
export PATH=/usr/local/cuda-12.4/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/cuda-12.4/lib64:$LD_LIBRARY_PATH
export CUDA_HOME=/usr/local/cuda-12.4
EOF
source ~/.bashrc

# Verify CUDA
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

# Configure Docker
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# Test GPU in Docker
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi
```

---

## 🚀 vLLM Installation

### Method 1: Docker (Recommended for Production)

Create directory structure:
```bash
mkdir -p ~/vllm-data/{models,cache}
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  vllm:
    image: vllm/vllm-openai:latest
    container_name: vllm-rtx5090
    restart: unless-stopped
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - CUDA_VISIBLE_DEVICES=0

      # Model configuration
      - MODEL_NAME=meta-llama/Meta-Llama-3.1-70B-Instruct
      - TENSOR_PARALLEL_SIZE=1
      - GPU_MEMORY_UTILIZATION=0.95
      - MAX_MODEL_LEN=32768

      # Performance tuning
      - ENABLE_CHUNKED_PREFILL=true
      - ENABLE_PREFIX_CACHING=true
      - DISABLE_SLIDING_WINDOW=false
      - DISABLE_CUSTOM_ALL_REDUCE=true

      # LMCache integration
      - LMCACHE_ENABLED=true
      - LMCACHE_HOST=lmcache
      - LMCACHE_PORT=65432

      # API configuration
      - SERVED_MODEL_NAME=llama-3.1-70b-instruct
      - API_KEY=${VLLM_API_KEY}

    volumes:
      - ~/vllm-data/models:/models
      - ~/vllm-data/cache:/cache
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
      --model /models/Meta-Llama-3.1-70B-Instruct
      --tensor-parallel-size 1
      --gpu-memory-utilization 0.95
      --max-model-len 32768
      --trust-remote-code
      --enable-chunked-prefill
      --enable-prefix-caching
      --api-key ${VLLM_API_KEY}

  lmcache:
    image: lmcache/lmcache-server:latest
    container_name: lmcache-rtx5090
    restart: unless-stopped
    ports:
      - "65432:65432"
    volumes:
      - ~/vllm-data/cache:/cache
    environment:
      - LMCACHE_STORAGE_BACKEND=disk
      - LMCACHE_CACHE_PATH=/cache
      - LMCACHE_MAX_SIZE=100GB

networks:
  default:
    name: vllm-network
```

Create `.env` file:
```bash
VLLM_API_KEY=sk-nyra-5090-$(openssl rand -hex 16)
HF_TOKEN=hf_your_token_here
```

Download models:
```bash
# Install Hugging Face CLI
pip install huggingface-hub

# Login to HF (for gated models like Llama)
huggingface-cli login

# Download Llama 3.1 70B
huggingface-cli download meta-llama/Meta-Llama-3.1-70B-Instruct \
    --local-dir ~/vllm-data/models/Meta-Llama-3.1-70B-Instruct \
    --local-dir-use-symlinks False

# Download alternative models
huggingface-cli download mistralai/Mixtral-8x7B-Instruct-v0.1 \
    --local-dir ~/vllm-data/models/Mixtral-8x7B-Instruct-v0.1
```

Start vLLM:
```bash
docker compose up -d

# Check logs
docker logs -f vllm-rtx5090
```

### Method 2: Native Installation (Advanced)
```bash
# Create virtual environment
python3.11 -m venv ~/vllm-env
source ~/vllm-env/bin/activate

# Install vLLM with CUDA 12.4
pip install vllm==0.3.2

# Install LMCache
pip install lmcache

# Start vLLM server
vllm serve meta-llama/Meta-Llama-3.1-70B-Instruct \
    --host 0.0.0.0 \
    --port 8000 \
    --tensor-parallel-size 1 \
    --gpu-memory-utilization 0.95 \
    --max-model-len 32768 \
    --enable-chunked-prefill \
    --enable-prefix-caching \
    --api-key ${VLLM_API_KEY}
```

---

## 🚀 LMCache Setup

LMCache dramatically improves inference speed by caching KV (key-value) pairs across requests.

### Benefits
- **3-10x faster inference** for repeated prefixes
- **Reduced GPU memory pressure** by offloading cache
- **Better batching** with shared context
- **Cross-request optimization** (same prompt = instant response)

### Configuration

Create `lmcache-config.yaml`:
```yaml
storage:
  backend: disk  # or redis for distributed
  path: /cache
  max_size: 100GB
  eviction_policy: lru

cache:
  chunk_size: 256  # tokens per cache chunk
  prefix_match_threshold: 0.8
  enable_compression: true

performance:
  num_workers: 4
  batch_size: 32
  prefetch: true
```

### Start LMCache Server
```bash
# Via Docker (already in docker-compose.yml)
docker compose up -d lmcache

# OR native
lmcache-server --config lmcache-config.yaml --port 65432
```

### Verify LMCache Integration
```bash
# Test cache hit rate
curl http://localhost:8000/v1/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${VLLM_API_KEY}" \
  -d '{
    "model": "llama-3.1-70b-instruct",
    "prompt": "Once upon a time",
    "max_tokens": 100
  }'

# Check cache stats
curl http://localhost:65432/stats
```

---

## 📦 Model Recommendations

### Tier 1: Optimal for 32GB (70B FP16)
Full precision models that fit comfortably:

| Model | VRAM | Tokens/sec | Use Case |
|-------|------|------------|----------|
| **Llama 3.1 70B Instruct** | 28GB | 2000+ | General purpose, reasoning |
| **Llama 3.1 70B Base** | 28GB | 2200+ | Fine-tuning base |
| **DeepSeek Coder 33B** | 16GB | 3500+ | Code generation |
| **Mixtral 8x7B** | 22GB | 2800+ | MoE, efficient |

### Tier 2: Quantized Large Models (100B+ AWQ/GPTQ)
Quantized to fit in 32GB with minimal quality loss:

| Model | Original | Quantized | VRAM | Tokens/sec |
|-------|----------|-----------|------|------------|
| **Llama 3.1 70B AWQ** | 70B | 4-bit | 14GB | 4000+ |
| **Mixtral 8x22B GPTQ** | 176B | 4-bit | 28GB | 1800+ |
| **Qwen2 72B AWQ** | 72B | 4-bit | 15GB | 3800+ |

### Tier 3: Experimental (Multi-GPU Future)
Requires tensor parallelism across 2x RTX 5090:

| Model | VRAM (TP=2) | Tokens/sec | Notes |
|-------|-------------|------------|-------|
| **Llama 3.1 405B AWQ** | 52GB | 800+ | Needs 2x RTX 5090 |
| **Falcon 180B** | 60GB | 600+ | Research only |

### Download and Serve Models
```bash
# Llama 3.1 70B (Primary)
huggingface-cli download meta-llama/Meta-Llama-3.1-70B-Instruct \
    --local-dir ~/vllm-data/models/Meta-Llama-3.1-70B-Instruct

# Mixtral 8x7B (Alternative)
huggingface-cli download mistralai/Mixtral-8x7B-Instruct-v0.1 \
    --local-dir ~/vllm-data/models/Mixtral-8x7B-Instruct-v0.1

# DeepSeek Coder (Code-specific)
huggingface-cli download deepseek-ai/deepseek-coder-33b-instruct \
    --local-dir ~/vllm-data/models/deepseek-coder-33b-instruct
```

### Switch Models (Dynamic)
```bash
# Update MODEL_NAME in .env
echo "MODEL_NAME=mistralai/Mixtral-8x7B-Instruct-v0.1" >> .env

# Restart vLLM
docker compose restart vllm
```

---

## ⚡ Performance Optimization

### 1. GPU Optimization

**Enable Persistence Mode**:
```bash
sudo nvidia-smi -pm 1
```

**Lock GPU Clocks** (max performance):
```bash
# Get max clocks
nvidia-smi -q -d CLOCK | grep "Max Clocks"

# Lock to max boost (example: 2750 MHz)
sudo nvidia-smi -lgc 2750
```

**Set Power Limit** (optional, for cooling):
```bash
# Default 575W, can reduce to 500W with <5% perf loss
sudo nvidia-smi -pl 500
```

### 2. vLLM Tuning

**Optimize GPU Memory Utilization**:
```bash
# Edit docker-compose.yml
GPU_MEMORY_UTILIZATION=0.95  # 95% for max throughput
# OR 0.90 for safety margin
```

**Enable Prefix Caching** (huge speedup for repeated prompts):
```bash
ENABLE_PREFIX_CACHING=true
```

**Chunked Prefill** (better batching):
```bash
ENABLE_CHUNKED_PREFILL=true
```

**Adjust Context Length** (trade-off memory vs. context):
```bash
# Full context
MAX_MODEL_LEN=32768  # Llama 3.1 70B native

# Reduced for more throughput
MAX_MODEL_LEN=16384
```

### 3. Tensor Parallelism (Future Multi-GPU)

For 2x RTX 5090:
```bash
TENSOR_PARALLEL_SIZE=2
```

### 4. Kernel Optimizations

**Flash Attention 2**:
```bash
pip install flash-attn --no-build-isolation

# vLLM automatically uses FlashAttention 2 if available
```

**Custom Kernels**:
```bash
# Compile vLLM with custom CUDA kernels
pip install vllm --no-build-isolation --force-reinstall \
    --extra-index-url https://download.pytorch.org/whl/cu124
```

### 5. System Tuning

**Increase File Descriptors**:
```bash
echo "* soft nofile 1000000" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 1000000" | sudo tee -a /etc/security/limits.conf
```

**Disable CPU Governor** (max performance):
```bash
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

**NUMA Optimization**:
```bash
# Check NUMA nodes
numactl --hardware

# Pin vLLM to closest NUMA node to GPU
numactl --cpunodebind=0 --membind=0 vllm serve ...
```

---

## 🔄 High Availability

PC3 is the **primary** inference worker with automatic failover to PC4 (RTX 3090 Ti).

### Nexus Router Configuration (PC1)

Nexus Router on PC1 handles automatic failover:

```yaml
workers:
  pc3:
    url: http://192.168.1.13:8000
    models:
      - llama-3.1-70b-instruct
      - mixtral-8x7b-instruct
    priority: 1  # Primary
    health_check_interval: 10s
    timeout: 30s

  pc4:
    url: http://192.168.1.14:8000
    models:
      - llama-3.1-70b-instruct
      - codellama-34b-instruct
    priority: 2  # Fallback
    health_check_interval: 10s
    timeout: 30s

routing:
  strategy: priority_failover
  health_threshold: 3  # 3 failed checks = offline
  retry_backoff: exponential
  max_retries: 3
```

### Health Endpoint
vLLM provides health checks:
```bash
# Health check
curl http://192.168.1.13:8000/health

# Metrics
curl http://192.168.1.13:8000/metrics
```

### Monitoring Script
Create `~/scripts/ha-monitor.sh`:
```bash
#!/bin/bash

PRIMARY="http://192.168.1.13:8000/health"
SECONDARY="http://192.168.1.14:8000/health"

while true; do
    if curl -sf $PRIMARY > /dev/null; then
        echo "$(date) - PC3 (Primary) is healthy"
    else
        echo "$(date) - PC3 DOWN! Nexus Router will failover to PC4"
        # Alert via webhook (optional)
        curl -X POST https://hooks.slack.com/... -d '{"text":"PC3 is down!"}'
    fi
    sleep 30
done
```

Run as systemd service:
```ini
[Unit]
Description=HA Monitor for vLLM Primary
After=network.target

[Service]
ExecStart=/home/user/scripts/ha-monitor.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 📊 Monitoring

### Real-time GPU Monitoring
```bash
# nvtop (interactive)
nvtop

# nvidia-smi continuous
watch -n 1 nvidia-smi

# GPU utilization stats
nvidia-smi dmon -s mu
```

### vLLM Metrics (Prometheus)
vLLM exposes Prometheus metrics:
```bash
curl http://localhost:8000/metrics
```

**Key metrics**:
- `vllm:num_requests_running` - Active requests
- `vllm:num_requests_waiting` - Queued requests
- `vllm:gpu_cache_usage_perc` - KV cache usage
- `vllm:time_to_first_token_seconds` - TTFT latency
- `vllm:time_per_output_token_seconds` - Token generation speed

### LMCache Metrics
```bash
curl http://localhost:65432/stats
```

**Key metrics**:
- `cache_hit_rate` - % of requests served from cache
- `cache_size_bytes` - Current cache size
- `avg_speedup` - Average speedup from cache hits

### Dashboard Integration (Grafana on PC1)
Grafana dashboard shows:
- GPU utilization, temperature, power
- vLLM throughput (tokens/sec)
- Request latency (p50, p95, p99)
- Cache hit rate
- Failover events

---

## 🔧 Troubleshooting

### Issue 1: Out of Memory (OOM)

**Symptoms**:
```
CUDA out of memory. Tried to allocate 2.00 GiB
```

**Solutions**:

1. **Reduce GPU memory utilization**:
   ```bash
   GPU_MEMORY_UTILIZATION=0.85  # Lower from 0.95
   ```

2. **Reduce context length**:
   ```bash
   MAX_MODEL_LEN=16384  # Lower from 32768
   ```

3. **Use quantized model**:
   ```bash
   # Switch to AWQ 4-bit
   huggingface-cli download TheBloke/Llama-2-70B-Chat-AWQ
   ```

### Issue 2: Slow Inference

**Symptoms**: <1000 tokens/sec on Llama 70B

**Debug**:
```bash
# Check GPU utilization
nvidia-smi dmon -s mu
# Should be 95%+

# Check vLLM logs
docker logs vllm-rtx5090 | grep -i "performance\|throughput"

# Test with simple request
time curl http://localhost:8000/v1/completions \
  -H "Authorization: Bearer ${VLLM_API_KEY}" \
  -d '{"model":"llama-3.1-70b-instruct","prompt":"Hi","max_tokens":100}'
```

**Solutions**:

1. **Enable optimizations**:
   ```bash
   ENABLE_CHUNKED_PREFILL=true
   ENABLE_PREFIX_CACHING=true
   ```

2. **Check GPU clocks**:
   ```bash
   nvidia-smi -q -d CLOCK
   # Ensure not throttled
   ```

3. **Disable CPU fallback**:
   ```bash
   # Ensure all layers on GPU
   docker logs vllm-rtx5090 | grep -i "cpu"
   ```

### Issue 3: vLLM Won't Start

**Check logs**:
```bash
docker logs vllm-rtx5090 --tail 100
```

**Common issues**:

1. **Model not found**:
   ```bash
   # Verify model path
   ls ~/vllm-data/models/Meta-Llama-3.1-70B-Instruct
   ```

2. **CUDA version mismatch**:
   ```bash
   # Reinstall matching CUDA
   pip install vllm --force-reinstall --no-cache-dir
   ```

3. **Insufficient VRAM**:
   ```bash
   # Check available VRAM
   nvidia-smi --query-gpu=memory.free --format=csv,noheader
   ```

### Issue 4: LMCache Not Working

**Verify LMCache is running**:
```bash
docker ps | grep lmcache

# Check cache stats
curl http://localhost:65432/stats
```

**Test cache hit**:
```bash
# Send same request twice
curl http://localhost:8000/v1/completions \
  -H "Authorization: Bearer ${VLLM_API_KEY}" \
  -d '{"model":"llama-3.1-70b-instruct","prompt":"Tell me about AI","max_tokens":50}' \
  -w "\nTime: %{time_total}s\n"

# Second request should be faster
curl http://localhost:8000/v1/completions \
  -H "Authorization: Bearer ${VLLM_API_KEY}" \
  -d '{"model":"llama-3.1-70b-instruct","prompt":"Tell me about AI","max_tokens":50}' \
  -w "\nTime: %{time_total}s\n"
```

---

## 📝 Maintenance Checklist

### Daily
- [ ] Check GPU temperature (< 85°C under load)
- [ ] Verify vLLM health: `curl http://localhost:8000/health`
- [ ] Check request metrics: `curl http://localhost:8000/metrics`
- [ ] Monitor cache hit rate

### Weekly
- [ ] Update vLLM: `docker compose pull && docker compose up -d`
- [ ] Clear old LMCache entries: `curl -X POST http://localhost:65432/clear-old`
- [ ] Review error logs: `docker logs vllm-rtx5090 | grep -i error`
- [ ] Test failover: Stop PC3, verify PC4 takes over

### Monthly
- [ ] Update NVIDIA driver
- [ ] Update system packages: `sudo apt update && sudo apt upgrade`
- [ ] Benchmark performance: `python benchmark_vllm.py`
- [ ] Audit model storage: `du -sh ~/vllm-data/models/*`

---

## 🚀 Performance Benchmarks

### Expected Performance (Llama 3.1 70B FP16)

| Metric | Value | Notes |
|--------|-------|-------|
| **Throughput** | 2000-2500 tokens/sec | Batch size 32 |
| **TTFT** | 30-50ms | Time to first token |
| **Latency (p50)** | 100-150ms | Per request |
| **Latency (p95)** | 200-300ms | Per request |
| **Max concurrent** | 50+ requests | With batching |
| **GPU utilization** | 95%+ | Under load |

### Benchmark Script
```bash
# Install benchmark tool
pip install vllm-benchmark

# Run throughput test
vllm-benchmark \
    --model llama-3.1-70b-instruct \
    --input-len 1024 \
    --output-len 128 \
    --num-requests 100 \
    --request-rate 10
```

---

## 📚 Additional Resources

- **vLLM Documentation**: https://docs.vllm.ai/
- **LMCache GitHub**: https://github.com/LMCache/LMCache
- **NVIDIA RTX 5090 Specs**: https://www.nvidia.com/rtx-5090
- **Nexus Router Integration**: `../../services/nexus-router/README.md`

---

**Document Version**: 1.0
**Last Updated**: 2026-01-18
**Maintained By**: Project Nyra Infrastructure Team
