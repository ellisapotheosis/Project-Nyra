# Worker RTX 3060 Configuration

## Overview
Configuration and setup files for the RTX 3060 worker node in the Project Nyra distributed infrastructure.

## Specifications
- **GPU**: NVIDIA GeForce RTX 3060
- **VRAM**: 12GB GDDR6
- **Role**: AI/ML workload processing, model training, inference tasks
- **Compute Capability**: 8.6

## Directory Structure

### `/configs`
Configuration files specific to RTX 3060 hardware optimization:
- GPU memory allocation settings
- CUDA configuration
- Docker container resource limits
- Environment variables

### `/scripts`
Deployment and management scripts:
- `bootstrap-worker.ps1/.sh` - Complete worker setup automation for PC2
- `configure-static-ip.ps1/.sh` - Network configuration for PC2 (10.0.0.2)
- `health-check-all.ps1/.sh` - System-wide health monitoring
- `backup-daily.ps1/.sh` - Automated backup procedures
- `setup-cloudflare-tunnel.sh` - Cloudflare tunnel management

### `/docker`
Docker configurations:
- Dockerfiles optimized for RTX 3060
- Docker Compose configurations
- Volume mounts and networking

### `/setup`
Initial setup and installation files:
- `distributed-setup/` - Distributed system setup scripts
  - `01-gitea-setup.sh` - Git server configuration
  - `02-cloudflared-setup.sh` - Cloudflare tunnel setup
  - `03-tailscale-setup.sh` - VPN network configuration
  - `04-claude-flow-distributed.sh` - Claude Flow distributed deployment
- `setup-cloudflare-tunnel.ps1` - Cloudflare tunnel management
- Driver installation and CUDA toolkit setup (run bootstrap-worker for automated setup)

## Quick Start

```bash
# Navigate to worker-rtx3060 directory
cd bootstrap/worker-rtx3060

# Configure static IP for PC2 (10.0.0.2)
cd scripts
./configure-static-ip.ps1 -PCRole PC2  # Windows
# or
./configure-static-ip.sh PC2  # Linux

# Run worker bootstrap
./bootstrap-worker.ps1 -WorkerRole worker-2  # Windows
# or
./bootstrap-worker.sh worker-2  # Linux

# Start worker services
cd ../docker
docker-compose up -d
```

## Performance Tuning
The RTX 3060 is optimized for:
- Batch inference workloads
- Model training with moderate datasets
- Real-time AI processing
- Cost-effective parallel processing

## Monitoring
Monitor worker performance:
```bash
# Check GPU utilization
nvidia-smi

# View container logs
docker logs worker-rtx3060

# Check resource usage
docker stats worker-rtx3060
```

## Related Documentation
- [Main Bootstrap Guide](../README.md)
- [Distributed Architecture](../../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md)
- [Worker Configuration Guide](../docs/WORKER-SETUP.md)
