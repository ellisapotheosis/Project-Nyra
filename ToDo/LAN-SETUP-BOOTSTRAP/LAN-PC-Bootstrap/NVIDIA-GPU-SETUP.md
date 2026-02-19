# NVIDIA GPU Setup for Project Nyra Workers

## Overview

This guide covers installing NVIDIA drivers, CUDA toolkit, and Docker GPU support on your three GPU worker PCs:
- **Worker-3060**: Alienware M15R7 (RTX 3060, 12GB VRAM)
- **Worker-3090Ti**: Desktop (RTX 3090 Ti, 24GB VRAM)
- **Worker-5090**: Alienware Area-51 (RTX 5090, 32GB VRAM)

---

## 0. Prerequisites

All PCs should have:
- ✅ Windows 11 with PowerShell 7+
- ✅ Docker Desktop installed
- ✅ Administrator access

---

## 1. Install NVIDIA GPU Drivers

### 1.1 Check Current Driver Status

```powershell
# Check if GPU is detected
nvidia-smi

# If not found, drivers are not installed
```

### 1.2 Install NVIDIA Drivers (Windows)

**Option A: Automated (Recommended)**

```powershell
# Open PowerShell as Administrator and run:

# Download latest driver installer
$DriverUrl = "https://www.nvidia.com/Download/driverDetails.aspx/YOUR_GPU_MODEL"
# Visit https://www.nvidia.com/Download/driverDetails.aspx to get your exact driver download link

# For RTX 3060 (12-bit Encoding Support)
# https://www.nvidia.com/Download/driverDetails.aspx/192845

# For RTX 3090 Ti
# https://www.nvidia.com/Download/driverDetails.aspx/208790

# For RTX 5090
# https://www.nvidia.com/Download/driverDetails.aspx/226843

# Download and run silently
$InstallerPath = "$env:TEMP\nvidia-driver.exe"
Invoke-WebRequest -Uri $DriverUrl -OutFile $InstallerPath
& $InstallerPath -s -noreboot  # Silent install, no reboot

# Reboot when ready
Restart-Computer
```

**Option B: Manual**

1. Visit [NVIDIA Driver Downloads](https://www.nvidia.com/Download/driverDetails.aspx)
2. Select your GPU model and OS (Windows 11, 64-bit)
3. Download installer
4. Run installer with admin privileges
5. Reboot when prompted

### 1.3 Verify Driver Installation

```powershell
# After reboot, verify drivers are installed
nvidia-smi

# Should show output like:
# +---------------------------------------------------------------------------------------+
# | NVIDIA-SMI 560.06                 Driver Version: 560.06       CUDA Version: 12.4     |
# |-----------------------+----------------------+----------------------+
# | GPU  Name                 Persistence-M| Bus-Id          Disp.A | Volatile Uncorr. ECC |
# | Fan  Temp   Perf          Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
# |===+======================+==============+======================+
# |   0  NVIDIA RTX 3060          Off  | 00:1F.0              On |                  N/A |
# |  0%   35C    P0              50W / 320W |   1024MiB / 12288MiB |      0%      Default |
# |===+======================+==============+======================+
```

---

## 2. Install NVIDIA CUDA Toolkit (Optional but Recommended)

The CUDA toolkit provides development libraries and utilities. Docker GPU support works without it, but it's useful for diagnostics.

### 2.1 Download CUDA Toolkit

Visit [NVIDIA CUDA Download](https://developer.nvidia.com/cuda-downloads) and select:
- Operating System: Windows
- Architecture: x86_64
- Version: Windows 11
- Installer Type: exe (local)

### 2.2 Install CUDA

```powershell
# Download the installer (example for CUDA 12.4)
$CudaUrl = "https://developer.download.nvidia.com/compute/cuda/12.4.1/local_installers/cuda_12.4.1_560.94_windows.exe"
$InstallerPath = "$env:TEMP\cuda-installer.exe"
Invoke-WebRequest -Uri $CudaUrl -OutFile $InstallerPath

# Run installer
& $InstallerPath

# Follow GUI installer (choose default options)
# Reboot when prompted
```

### 2.3 Verify CUDA Installation

```powershell
# After reboot
nvcc --version

# Should show: Cuda compilation tools, release 12.4, V12.4.1
```

---

## 3. Install Docker GPU Runtime

### 3.1 Install NVIDIA Container Toolkit

The NVIDIA Container Toolkit enables Docker to access GPUs.

```powershell
# Open PowerShell as Administrator

# Download NVIDIA Container Toolkit for Windows
$DownloadUrl = "https://github.com/NVIDIA/nvidia-container-toolkit/releases/download/v1.15.0/nvidia-container-toolkit-1.15.0-1.x86_64.rpm"

# For Windows, use the WSL2 or native approach:
# Option A: Using NVIDIA's official Windows package

$installerUrl = "https://github.com/NVIDIA/nvidia-docker/releases/download/v2.14.0/nvidia-docker2_2.14.0-1_all.deb"

# But for native Windows + Docker Desktop, follow Docker's built-in support
# Docker Desktop 4.3+ has native GPU support
```

### 3.2 Configure Docker Desktop for GPU Access

**Method 1: Docker Desktop GUI (Easiest)**

1. Open **Docker Desktop**
2. Go to **Settings** → **Resources** → **GPU**
3. Enable GPU support (toggle if available)
4. Click **Apply & Restart**

**Method 2: Manual Configuration via config file**

Edit `%USERPROFILE%\.docker\config.json`:

```json
{
  "gpu-request": "all",
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime",
      "runtimeArgs": []
    }
  }
}
```

### 3.3 Verify Docker GPU Access

```powershell
# Test GPU access through Docker
docker run --rm --gpus all nvidia/cuda:12.4.1-runtime-windows-ltsc2022 nvidia-smi

# Should output GPU information from within the container
```

---

## 4. Install NVIDIA Docker Compose Support

### 4.1 Enable GPU in Docker Compose

Update your docker-compose files to use GPU runtime:

```yaml
version: '3.8'

services:
  my-gpu-service:
    image: nvidia/cuda:12.4.1-runtime-ubuntu22.04
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - NVIDIA_DRIVER_CAPABILITIES=compute,utility
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

### 4.2 Test Docker Compose with GPU

```powershell
# Create test docker-compose.yml
$testCompose = @"
version: '3.8'
services:
  gpu-test:
    image: nvidia/cuda:12.4.1-runtime-windows-ltsc2022
    command: nvidia-smi
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
"@

$testCompose | Out-File -Path "docker-compose-gpu-test.yml" -Encoding UTF8

# Run test
docker-compose -f docker-compose-gpu-test.yml up --rm

# Should show GPU info from container
```

---

## 5. Setup for Project Nyra Workers

### 5.1 Worker-3060 (RTX 3060 - Ollama)

After driver installation, Ollama will automatically detect and use the GPU:

```powershell
# Verify Ollama sees the GPU
docker exec worker-3060-ollama nvidia-smi

# Check Ollama is using GPU
curl http://localhost:11434/api/tags
# Response will show model is loaded on GPU
```

**Environment variables for .env.worker-3060**:

```bash
# GPU Detection (auto-detected)
CUDA_VISIBLE_DEVICES=0

# Ollama GPU settings
OLLAMA_GPU_LAYERS=20
OLLAMA_NUM_PARALLEL=2
```

### 5.2 Worker-3090Ti (RTX 3090 Ti - VLLM)

VLLM requires GPU support:

```powershell
# Verify GPU access
docker exec worker-3090ti-vllm nvidia-smi

# Check VLLM sees GPU
curl http://localhost:8000/v1/models
```

**Environment variables for .env.worker-3090ti**:

```bash
# GPU Configuration
CUDA_VISIBLE_DEVICES=0
VLLM_GPU_MEMORY_FRACTION=0.85

# For distributed tensor parallelism (if using multiple GPUs)
# VLLM_TENSOR_PARALLEL_SIZE=1
```

### 5.3 Worker-5090 (RTX 5090 - VLLM)

Same as 3090Ti, but optimized for 32GB VRAM:

```powershell
# Verify GPU access
docker exec worker-5090-vllm nvidia-smi

# Check VLLM sees GPU
curl http://localhost:8000/v1/models
```

**Environment variables for .env.worker-5090**:

```bash
# GPU Configuration
CUDA_VISIBLE_DEVICES=0
VLLM_GPU_MEMORY_FRACTION=0.90

# Chunked prefill for larger models
VLLM_ENABLE_CHUNKED_PREFILL=true
```

---

## 6. Troubleshooting

### Problem: `nvidia-smi` not found

**Solution**:
```powershell
# Check if drivers are installed
Get-WindowsOptionalFeature -Online -FeatureName "*nvidia*"

# Reinstall drivers
# 1. Download latest from nvidia.com
# 2. Run installer as Administrator
# 3. Reboot
```

### Problem: Docker can't access GPU

```powershell
# Check Docker Desktop GPU support
docker run --rm --gpus all nvidia/cuda:12.4.1-runtime-windows-ltsc2022 nvidia-smi

# If fails:
# 1. Ensure Docker Desktop is running
# 2. Go to Settings → Resources → GPU and enable
# 3. Restart Docker Desktop
```

### Problem: "GPUs not found" in container

```powershell
# Verify host GPU is accessible
nvidia-smi

# Check Docker can see GPU
docker run --rm --gpus all nvidia/cuda:12.4.1-runtime-windows-ltsc2022 nvidia-smi

# If both work but docker-compose fails, check docker-compose.yml syntax
# Verify `deploy.resources.reservations.devices` section
```

### Problem: Out of GPU memory errors

```powershell
# Check GPU memory usage
nvidia-smi

# For Ollama (3060), reduce parallel requests:
# OLLAMA_NUM_PARALLEL=1

# For VLLM, reduce GPU memory fraction:
# VLLM_GPU_MEMORY_FRACTION=0.75
```

### Problem: CUDA/cuDNN version mismatch

```powershell
# Check CUDA version
nvcc --version

# Check driver supports this CUDA version
nvidia-smi

# Update Docker image to matching CUDA version
# e.g., nvidia/cuda:12.4.1-runtime-ubuntu22.04
```

---

## 7. Verification Checklist

Before running Project Nyra on workers:

- [ ] `nvidia-smi` shows GPU detected on host
- [ ] `docker run --rm --gpus all nvidia/cuda:12.4.1-runtime-windows-ltsc2022 nvidia-smi` works
- [ ] Docker Desktop has GPU enabled in Settings
- [ ] docker-compose.yml includes GPU resource declarations
- [ ] Container can access GPU: `docker exec <container> nvidia-smi`
- [ ] Ollama (3060): GPU layers loaded
- [ ] VLLM (3090Ti, 5090): Model loads and responds

---

## 8. Performance Tuning

### Ollama (Worker-3060)

```bash
# Adjust model loading parallelism
OLLAMA_NUM_PARALLEL=2          # Default, safe for 12GB
OLLAMA_NUM_PARALLEL=1          # If OOM errors
OLLAMA_KEEP_ALIVE=24h          # Keep models in VRAM

# GPU layers (how much of model runs on GPU)
OLLAMA_GPU_LAYERS=25           # All layers on GPU (faster)
OLLAMA_GPU_LAYERS=10           # Partial (more stable)
```

### VLLM (Worker-3090Ti / 5090)

```bash
# Memory utilization
VLLM_GPU_MEMORY_FRACTION=0.85   # 3090Ti (24GB) - use 20GB
VLLM_GPU_MEMORY_FRACTION=0.90   # 5090 (32GB) - use 28GB

# Batch processing
VLLM_MAX_MODEL_LEN=16384        # 3090Ti (24GB limit)
VLLM_MAX_MODEL_LEN=32768        # 5090 (32GB+)

# Prefill optimization
VLLM_ENABLE_CHUNKED_PREFILL=true  # Better for 5090

# Tensor parallelism (if using multiple GPUs)
VLLM_TENSOR_PARALLEL_SIZE=1     # Single GPU mode
```

---

## 9. Final Integration

Once GPU setup is complete, run the bootstrap deployment:

```powershell
# On each worker PC, after GPU verification:

cd "C:\Users\edane\OneDrive\LANShare\LAN-PC-Bootstrap"

# Create .env file with GPU settings
# (See BOOTSTRAP-QUICK-START.md for templates)

# Start worker services
cd docker-composes
docker-compose -f worker-rtx3060-complete.yml up -d   # or your worker type

# Verify GPU is used
docker logs -f worker-3060-ollama    # or worker-3090ti-vllm, etc.
```

---

## Reference Links

- [NVIDIA Driver Downloads](https://www.nvidia.com/Download/driverDetails.aspx)
- [CUDA Toolkit](https://developer.nvidia.com/cuda-downloads)
- [Docker GPU Support](https://docs.docker.com/compose/gpu-support/)
- [NVIDIA Container Toolkit](https://github.com/NVIDIA/nvidia-container-toolkit)
- [Ollama GPU Setup](https://github.com/ollama/ollama/blob/main/docs/gpu.md)
- [vLLM GPU Setup](https://docs.vllm.ai/en/latest/getting_started/installation.html)

---

**Status**: ✅ Complete GPU Setup Guide  
**Last Updated**: 2026-02-14  
**Tested On**: Windows 11, Docker Desktop 4.3+, NVIDIA Drivers 560+
