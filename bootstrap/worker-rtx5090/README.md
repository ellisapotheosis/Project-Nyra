# Worker RTX 5090 Configuration

## Overview
Configuration and setup files for the RTX 5090 worker node - the flagship GPU for high-performance AI workloads in Project Nyra.

## Specifications
- **GPU**: NVIDIA GeForce RTX 5090
- **VRAM**: 32GB GDDR7
- **Role**: Heavy AI/ML workloads, large model training, high-throughput inference
- **Compute Capability**: 9.0+

## Directory Structure

### `/configs`
Configuration files optimized for RTX 5090 capabilities:
- Advanced GPU memory management
- Multi-GPU coordination (if applicable)
- High-performance CUDA settings
- Tensor Core optimization
- Environment variables

### `/scripts`
Advanced deployment and management scripts:
- `bootstrap-worker.ps1/.sh` - Complete worker setup automation for PC3
- `configure-static-ip.ps1/.sh` - Network configuration for PC3 (10.0.0.3)
- `health-check-all.ps1/.sh` - System-wide health monitoring
- `backup-daily.ps1/.sh` - Automated backup procedures
- `setup-cloudflare-tunnel.sh` - Cloudflare tunnel management

### `/docker`
Docker configurations for maximum performance:
- Multi-stage builds optimized for RTX 5090
- GPU passthrough configurations
- High-bandwidth networking
- Optimized volume mounts

### `/setup`
Professional setup and installation:
- `distributed-setup/` - Distributed system setup scripts
  - `01-gitea-setup.sh` - Git server configuration
  - `02-cloudflared-setup.sh` - Cloudflare tunnel setup
  - `03-tailscale-setup.sh` - VPN network configuration
  - `04-claude-flow-distributed.sh` - Claude Flow distributed deployment
- `setup-cloudflare-tunnel.ps1` - Cloudflare tunnel management
- Driver installation and CUDA toolkit setup (run bootstrap-worker for automated setup)

## Quick Start

```bash
# Navigate to worker-rtx5090 directory
cd bootstrap/worker-rtx5090

# Configure static IP for PC3 (10.0.0.3)
cd scripts
./configure-static-ip.ps1 -PCRole PC3  # Windows
# or
./configure-static-ip.sh PC3  # Linux

# Run worker bootstrap
./bootstrap-worker.ps1 -WorkerRole worker-3  # Windows
# or
./bootstrap-worker.sh worker-3  # Linux

# Start worker services
cd ../docker
docker-compose up -d
```

## Performance Capabilities
The RTX 5090 is designed for:
- Large Language Model (LLM) training
- Real-time multi-model inference
- High-resolution image/video processing
- Complex neural network architectures
- Maximum throughput workloads

## Advanced Tuning
```bash
# Enable maximum performance mode
nvidia-smi -pm 1

# Set power limit (adjust as needed)
nvidia-smi -pl 450

# Monitor advanced metrics
nvidia-smi dmon -s pucvmet
```

## Monitoring Dashboard
Access real-time metrics:
```bash
# GPU utilization and memory
nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv -l 1

# Container performance
docker stats worker-rtx5090

# Detailed profiling
nsys profile --stats=true [command]
```

## Related Documentation
- [Main Bootstrap Guide](../README.md)
- [Distributed Architecture](../../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md)
- [High-Performance Setup Guide](../docs/RTX5090-OPTIMIZATION.md)
