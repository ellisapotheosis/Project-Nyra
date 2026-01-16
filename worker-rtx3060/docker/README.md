# Worker RTX 3060 - Development & Testing Workstation

Medium GPU workloads for code generation, development, and testing.

## Hardware Specifications

- **GPU**: NVIDIA RTX 3060 12GB
- **RAM**: 32GB DDR4/DDR5
- **Storage**: 1TB+ NVMe SSD
- **Network**: 10.0.0.3 (Static IP recommended)
- **Role**: Development Worker

## Services Deployed

### Core Services
- **Claude Flow Worker** (port 3011) - Worker node agent
- **Ollama** (port 11434) - Local LLM inference (RTX 3060 optimized)
- **Open WebUI** (port 3002) - Ollama web interface

### Development Tools
- **Code Server** (port 8443) - VS Code in browser
- **Jupyter Lab** (port 8888) - Data science notebooks with GPU support

### Workflow Automation
- **n8n** (port 5678) - Workflow automation
- **PostgreSQL** - n8n database backend

### CRM System
- **TwentyCRM** (port 3000) - Modern CRM system
- **PostgreSQL** - TwentyCRM database backend

### Infrastructure
- **Redis** (port 6379) - Caching and pub/sub

### Monitoring
- **Node Exporter** (port 9100) - System metrics
- **NVIDIA GPU Exporter** (port 9400) - GPU metrics

## Prerequisites

1. Docker Engine 24.0+ with Compose V2
2. NVIDIA Container Toolkit
3. NVIDIA Driver 525.60.13+ (for CUDA 12.0+)
4. Git
5. Network connectivity to orchestrator (10.0.0.1)
6. Sufficient disk space (minimum 500GB free)

## NVIDIA Container Toolkit Installation

### Ubuntu/Debian

```bash
# Add NVIDIA package repositories
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

# Install nvidia-container-toolkit
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

# Configure Docker
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# Test
docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 nvidia-smi
```

### Windows (WSL2)

```powershell
# Install NVIDIA Driver on Windows host (525.60.13+)
# Then in WSL2 Ubuntu:
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

## Installation

### 1. Verify Prerequisites

```bash
# Check NVIDIA driver
nvidia-smi

# Check Docker GPU support
docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 nvidia-smi
```

### 2. Configure Environment

```bash
cd C:\Dev\Projects\Repos\Project-Nyra\worker-rtx3060\docker
cp .env.example .env
```

Edit `.env` and fill in required values:
- API keys (same as orchestrator)
- Database passwords
- Service credentials

### 3. Ensure Orchestrator Network Exists

The orchestrator must be running first to create the `nyra-network`:

```bash
# Check if network exists
docker network ls | grep nyra-network

# If not, start orchestrator first or create manually:
docker network create nyra-network --subnet 172.20.0.0/16
```

### 4. Start Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 5. Verify GPU Access

```bash
# Check Claude Flow Worker has GPU access
docker-compose exec claude-flow-worker nvidia-smi

# Check Ollama has GPU access
docker-compose exec ollama-rtx3060 nvidia-smi

# Check Jupyter has GPU access
docker-compose exec jupyter-rtx3060 nvidia-smi
```

### 6. Pull Initial LLM Models

```bash
# Ollama - pull models
docker-compose exec ollama-rtx3060 ollama pull mistral:7b
docker-compose exec ollama-rtx3060 ollama pull codellama:7b
docker-compose exec ollama-rtx3060 ollama pull llama2:13b

# List models
docker-compose exec ollama-rtx3060 ollama list
```

## Access URLs

- **Claude Flow Worker**: http://worker-rtx3060.nyra.local:3011
- **Open WebUI**: http://ai-rtx3060.nyra.local:3002
- **Code Server**: http://code.nyra.local:8443
- **Jupyter Lab**: http://jupyter-rtx3060.nyra.local:8888
- **n8n**: http://n8n-rtx3060.nyra.local:5678
- **TwentyCRM**: http://crm-rtx3060.nyra.local:3000
- **Ollama API**: http://ollama-rtx3060.nyra.local:11434

## DNS Configuration

Add to your hosts file:

```
10.0.0.3 worker-rtx3060.nyra.local
10.0.0.3 ai-rtx3060.nyra.local
10.0.0.3 code.nyra.local
10.0.0.3 jupyter-rtx3060.nyra.local
10.0.0.3 n8n-rtx3060.nyra.local
10.0.0.3 crm-rtx3060.nyra.local
10.0.0.3 ollama-rtx3060.nyra.local
```

## Network Configuration

This worker connects to the existing `nyra-network`:
- Worker IP: 172.20.0.53
- Ollama: 172.20.0.54
- Services: 172.20.0.55-64

Ensure network connectivity to orchestrator (172.20.0.10).

## GPU Optimization

### RTX 3060 Specifications
- **VRAM**: 12GB
- **CUDA Cores**: 3584
- **Tensor Cores**: 112
- **Compute Capability**: 8.6
- **Power Limit**: 170W

### Recommended Models
- **Text Generation**: Mistral 7B, CodeLlama 7B, Llama 2 13B (with quantization)
- **Code**: CodeLlama 7B, DeepSeek Coder 6.7B
- **Chat**: Mistral 7B Instruct, Llama 2 13B Chat

### Performance Tips
1. Use quantized models (Q4_K_M or Q5_K_M)
2. Enable GPU layers: `-ngl 99` for Ollama
3. Batch size 16 for optimal throughput
4. Monitor VRAM with `nvidia-smi`

## Maintenance

### Monitor GPU Usage

```bash
# Real-time monitoring
watch -n 1 nvidia-smi

# Check GPU metrics in Prometheus/Grafana
# GPU exporter exposes metrics on port 9400
```

### Update Models

```bash
# Update Ollama models
docker-compose exec ollama-rtx3060 ollama pull mistral:7b

# Clear old models
docker-compose exec ollama-rtx3060 ollama rm <old-model>
```

### Backup

Important volumes:
- `ollama-models` - Downloaded LLM models
- `jupyter-data` - Notebooks and datasets
- `n8n-data` - Workflows
- `twentycrm-data` - CRM data

```bash
# Backup volumes
docker run --rm -v ollama-models:/data -v $(pwd):/backup alpine tar czf /backup/ollama-models-backup.tar.gz /data
```

## Troubleshooting

### GPU Not Detected

1. Check NVIDIA driver: `nvidia-smi`
2. Verify nvidia-container-toolkit: `docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 nvidia-smi`
3. Check container logs: `docker-compose logs ollama-rtx3060`
4. Restart Docker: `sudo systemctl restart docker`

### Out of Memory (OOM)

1. Use smaller models or quantized versions
2. Reduce batch size in environment variables
3. Close unused services
4. Monitor with `nvidia-smi`

### Slow Inference

1. Check GPU utilization: `nvidia-smi`
2. Ensure `-ngl 99` for full GPU offloading
3. Use faster quantization (Q4_K_M)
4. Reduce context length
5. Check thermal throttling

### Network Connectivity Issues

1. Verify orchestrator is running
2. Check network: `docker network inspect nyra-network`
3. Test connectivity: `docker-compose exec claude-flow-worker ping 172.20.0.10`
4. Review firewall rules

## Security Notes

1. Change all default passwords
2. Restrict access to Code Server
3. Configure n8n authentication
4. Review CRM access controls
5. Use VPN for remote access
6. Keep NVIDIA drivers updated

## Performance Monitoring

Monitor in Grafana (on orchestrator):
- GPU utilization and memory
- Inference latency
- Container resource usage
- Network throughput
- Task completion rates

## Next Steps

1. Configure code generation workflows in n8n
2. Set up development projects in Code Server
3. Train custom models in Jupyter
4. Configure CRM integrations
5. Test distributed task execution with orchestrator
