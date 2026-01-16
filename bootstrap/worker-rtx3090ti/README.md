# Worker RTX 3090 Ti Configuration

## Overview
Configuration and setup files for the RTX 3090 Ti worker node - a high-performance GPU for demanding AI/ML workloads in Project Nyra.

## Specifications
- **GPU**: NVIDIA GeForce RTX 3090 Ti
- **VRAM**: 24GB GDDR6X
- **Role**: Advanced AI training, multi-model inference, production workloads
- **Compute Capability**: 8.6
- **TDP**: 450W

## Directory Structure

### `/configs`
Configuration files tuned for RTX 3090 Ti:
- GPU memory optimization for 24GB VRAM
- CUDA configuration for Ampere architecture
- Docker resource allocation
- Cooling and thermal management
- Environment variables

### `/scripts`
Deployment and operational scripts:
- `bootstrap-worker.ps1/.sh` - Complete worker setup automation for PC4
- `configure-static-ip.ps1/.sh` - Network configuration for PC4 (10.0.0.4)
- `health-check-all.ps1/.sh` - System-wide health monitoring
- `backup-daily.ps1/.sh` - Automated backup procedures
- `setup-cloudflare-tunnel.sh` - Cloudflare tunnel management

### `/docker`
Docker configurations:
- Dockerfiles with CUDA 11.x+ support
- Docker Compose for multi-container setups
- GPU passthrough and isolation
- Network optimization

### `/setup`
Installation and configuration:
- `distributed-setup/` - Distributed system setup scripts
  - `01-gitea-setup.sh` - Git server configuration
  - `02-cloudflared-setup.sh` - Cloudflare tunnel setup
  - `03-tailscale-setup.sh` - VPN network configuration
  - `04-claude-flow-distributed.sh` - Claude Flow distributed deployment
- `setup-cloudflare-tunnel.ps1` - Cloudflare tunnel management
- Driver installation and CUDA toolkit setup (run bootstrap-worker for automated setup)

## Quick Start

```bash
# Navigate to worker-rtx3090ti directory
cd bootstrap/worker-rtx3090ti

# Configure static IP for PC4 (10.0.0.4)
cd scripts
./configure-static-ip.ps1 -PCRole PC4  # Windows
# or
./configure-static-ip.sh PC4  # Linux

# Run worker bootstrap
./bootstrap-worker.ps1 -WorkerRole worker-4  # Windows
# or
./bootstrap-worker.sh worker-4  # Linux

# Verify GPU detection
nvidia-smi

# Start worker services
cd ../docker
docker-compose up -d
```

## Performance Profile
The RTX 3090 Ti excels at:
- Medium to large model training
- Multi-stream inference
- Real-time AI processing
- High-bandwidth data pipelines
- Parallel batch processing

## Thermal Management
Due to high TDP, monitor temperatures:
```bash
# Monitor temperature and throttling
nvidia-smi -q -d TEMPERATURE,POWER,CLOCK

# Set fan curve (if needed)
nvidia-settings -a "[gpu:0]/GPUFanControlState=1"
nvidia-settings -a "[fan:0]/GPUTargetFanSpeed=70"
```

## Monitoring

### Basic Monitoring
```bash
# Real-time GPU stats
watch -n 1 nvidia-smi

# Container resource usage
docker stats worker-rtx3090ti
```

### Advanced Metrics
```bash
# Detailed profiling
nvidia-smi dmon -s pucvmet -c 100

# Memory bandwidth utilization
nvidia-smi --query-gpu=utilization.memory --format=csv -l 1
```

## Power Optimization
```bash
# Enable persistence mode
nvidia-smi -pm 1

# Set optimal power limit (adjust based on cooling)
nvidia-smi -pl 400  # 400W for balanced performance
```

## Related Documentation
- [Main Bootstrap Guide](../README.md)
- [Distributed Architecture](../../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md)
- [Worker Configuration Guide](../docs/WORKER-SETUP.md)
- [Thermal Management Best Practices](../docs/THERMAL-MANAGEMENT.md)
