# Nyra Distributed AI Infrastructure Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Nyra distributed AI infrastructure across your orchestrator and worker nodes.

## Prerequisites

### Hardware Requirements

**Orchestrator Node (Minisforum UH680)**
- Ryzen 7 6800H processor
- 16GB DDR5 RAM
- 1TB SSD storage
- Network connectivity to all worker nodes

**Worker Nodes**
- **Worker 1**: Alienware M15R7 with RTX 3060 (6GB VRAM)
- **Worker 2**: Alienware Area-51 with RTX 5090 (32GB VRAM)
- **Worker 3**: Desktop PC with RTX 3090Ti (24GB VRAM)

### Software Requirements

**All Nodes**
- Docker Engine 24.0+
- Docker Compose 2.20+
- NVIDIA Container Toolkit (for GPU workers)
- PowerShell 7.0+ (Windows) or Bash (Linux)

**Orchestrator Only**
- Infisical CLI (for secrets management)
- Cloudflare Tunnel client
- Python 3.9+ (for model downloads)

## Network Configuration

### IP Address Assignment

```
Orchestrator: 192.168.1.100
Worker 1:     192.168.1.101
Worker 2:     192.168.1.102
Worker 3:     192.168.1.103
```

### DNS Configuration

Update your local DNS or hosts file:

```
192.168.1.100  orchestrator.nyra.local
192.168.1.101  worker1.nyra.local
192.168.1.102  worker2.nyra.local
192.168.1.103  worker3.nyra.local
```

### Firewall Rules

**Orchestrator**
- Inbound: 8000 (API Gateway), 3000 (Grafana), 9090 (Prometheus)
- Outbound: 8001-8003 (Worker APIs), 4001-4003 (Worker LiteLLM)

**Workers**
- Inbound: 8001-8003 (Health), 4001-4003 (LiteLLM), 9001-9003 (Metrics)
- Outbound: 8000 (Orchestrator API)

## Environment Setup

### 1. Secrets Management

**Install and configure Infisical:**

```powershell
# Install Infisical CLI
winget install infisical

# Login to Infisical
infisical login

# Set up project secrets
infisical secrets set LITELLM_MASTER_KEY "your-master-key"
infisical secrets set ANTHROPIC_API_KEY "your-anthropic-key"
infisical secrets set OPENAI_API_KEY "your-openai-key"
infisical secrets set GOOGLE_API_KEY "your-google-key"
infisical secrets set POSTGRES_PASSWORD "secure-postgres-password"
infisical secrets set GRAFANA_ADMIN_PASSWORD "secure-grafana-password"
```

### 2. MAC Address Configuration

**Set Wake-on-LAN MAC addresses:**

```powershell
# PowerShell environment variables
$env:WORKER1_MAC_ADDRESS = "AA:BB:CC:DD:EE:01"  # Worker 1 MAC
$env:WORKER2_MAC_ADDRESS = "AA:BB:CC:DD:EE:02"  # Worker 2 MAC
$env:WORKER3_MAC_ADDRESS = "AA:BB:CC:DD:EE:03"  # Worker 3 MAC
```

### 3. Cloudflare Tunnel Setup

**Create tunnels for secure communication:**

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Create tunnels
cloudflared tunnel create nyra-orchestrator-tunnel
cloudflared tunnel create nyra-worker1-tunnel
cloudflared tunnel create nyra-worker2-tunnel
cloudflared tunnel create nyra-worker3-tunnel

# Configure DNS records
cloudflared tunnel route dns nyra-orchestrator-tunnel api.nyra.ratehunter.net
cloudflared tunnel route dns nyra-worker1-tunnel worker1.nyra.ratehunter.net
cloudflared tunnel route dns nyra-worker2-tunnel worker2.nyra.ratehunter.net
cloudflared tunnel route dns nyra-worker3-tunnel worker3.nyra.ratehunter.net
```

## Deployment Process

### Phase 1: Orchestrator Deployment

**1. Deploy orchestrator services:**

```powershell
# Navigate to project directory
cd c:\Dev\devprojects\personal-projects\project-nyra

# Deploy orchestrator
.\scripts\deploy-distributed-ai.ps1 -Component orchestrator -Verbose
```

**2. Verify orchestrator health:**

```powershell
# Check service status
docker-compose -f config/docker-compose.orchestrator.yml ps

# Test API Gateway
curl http://localhost:8000/health

# Access Grafana Dashboard
# http://localhost:3000 (admin/your-password)
```

### Phase 2: Worker Deployment

**1. Deploy all workers:**

```powershell
# Deploy all workers (will wake them if needed)
.\scripts\wake-on-lan.ps1 -Action deploy -Target all -TimeoutMinutes 15
```

**2. Deploy individual workers:**

```powershell
# Worker 1 (RTX 3060 - Code Specialist)
.\scripts\deploy-distributed-ai.ps1 -Component worker1 -Verbose

# Worker 2 (RTX 5090 - Reasoning Specialist)
.\scripts\deploy-distributed-ai.ps1 -Component worker2 -Verbose

# Worker 3 (RTX 3090Ti - Research Specialist)
.\scripts\deploy-distributed-ai.ps1 -Component worker3 -Verbose
```

### Phase 3: Model Downloads

**Models will be automatically downloaded during deployment. To manually download:**

**Worker 1 Models (RTX 3060):**
```bash
docker exec nyra-worker1-ollama ollama pull llama-3.1-8b-instruct
docker exec nyra-worker1-ollama ollama pull code-llama-7b-instruct
docker exec nyra-worker1-ollama ollama pull mistral-7b-instruct-v0.3
```

**Worker 2 Models (RTX 5090):**
```bash
# Large models - use HuggingFace Hub
python -c "from huggingface_hub import snapshot_download; snapshot_download('meta-llama/Llama-3.1-70B-Instruct', cache_dir='/app/models/worker2')"
```

**Worker 3 Models (RTX 3090Ti):**
```bash
python -c "from huggingface_hub import snapshot_download; snapshot_download('meta-llama/Llama-3.1-33B-Instruct', cache_dir='/app/models/worker3')"
```

## Validation and Testing

### 1. Health Check All Services

```powershell
# Check all worker status
.\scripts\wake-on-lan.ps1 -Action status -Target all

# Manual health checks
curl http://orchestrator.nyra.local:8000/health
curl http://worker1.nyra.local:4001/health
curl http://worker2.nyra.local:4002/health
curl http://worker3.nyra.local:4003/health
```

### 2. API Gateway Testing

```powershell
# Test unified API with different model routing
$headers = @{"Authorization" = "Bearer $env:LITELLM_MASTER_KEY"}

# Test code model (should route to Worker 1)
Invoke-RestMethod -Uri "http://localhost:8000/v1/chat/completions" -Method Post -Headers $headers -Body '{
  "model": "code",
  "messages": [{"role": "user", "content": "Write a Python function to reverse a string"}],
  "max_tokens": 100
}' -ContentType "application/json"

# Test reasoning model (should route to Worker 2)
Invoke-RestMethod -Uri "http://localhost:8000/v1/chat/completions" -Method Post -Headers $headers -Body '{
  "model": "reasoning",
  "messages": [{"role": "user", "content": "Explain quantum computing in simple terms"}],
  "max_tokens": 200
}' -ContentType "application/json"

# Test research model (should route to Worker 3)
Invoke-RestMethod -Uri "http://localhost:8000/v1/chat/completions" -Method Post -Headers $headers -Body '{
  "model": "research",
  "messages": [{"role": "user", "content": "Summarize the latest developments in AI"}],
  "max_tokens": 300
}' -ContentType "application/json"
```

### 3. Performance Monitoring

**Access monitoring dashboards:**

- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **LiteLLM Admin**: http://localhost:4000

**Key metrics to monitor:**

- GPU utilization across workers
- Response times by model
- Request routing distribution
- Error rates and failures
- Memory usage per worker

## Troubleshooting

### Common Issues

**1. Worker not responding after WOL:**
```powershell
# Check network connectivity
Test-Connection worker1.nyra.local

# Manually wake worker
.\scripts\wake-on-lan.ps1 -Action wake -Target worker1 -TimeoutMinutes 20
```

**2. Model loading failures:**
```bash
# Check GPU memory
nvidia-smi

# Restart model service
docker-compose -f config/docker-compose.worker1.yml restart ollama
```

**3. API Gateway routing issues:**
```powershell
# Check LiteLLM logs
docker logs nyra-api-gateway

# Verify worker health
curl http://worker1.nyra.local:4001/health
```

**4. Cloudflared tunnel problems:**
```bash
# Check tunnel status
cloudflared tunnel info nyra-orchestrator-tunnel

# Restart tunnel
docker-compose restart cloudflared
```

### Performance Tuning

**1. GPU Memory Optimization:**
- Adjust `gpu_memory_utilization` in worker configs
- Enable model quantization for larger models
- Configure model rotation for memory efficiency

**2. Request Routing Optimization:**
- Monitor routing patterns in Grafana
- Adjust routing rules based on actual usage
- Configure load balancing thresholds

**3. Caching Optimization:**
- Monitor Redis cache hit rates
- Adjust cache TTL values
- Enable response caching for common queries

## Maintenance

### Regular Tasks

**Daily:**
- Check worker status and GPU health
- Monitor error rates and response times
- Review request routing patterns

**Weekly:**
- Update model weights if available
- Review and rotate API keys
- Check disk space and logs

**Monthly:**
- Update Docker images
- Review and optimize configurations
- Test disaster recovery procedures

### Scaling Considerations

**Adding Workers:**
1. Configure new worker in orchestrator config
2. Create Docker Compose file for new worker
3. Update Prometheus monitoring
4. Configure Cloudflare tunnel
5. Add to Wake-on-LAN script

**Model Updates:**
1. Test new models in staging environment
2. Download models during off-peak hours
3. Update LiteLLM configuration
4. Monitor performance after deployment

## Security Best Practices

1. **API Key Management**: Rotate keys monthly
2. **Network Security**: Use Cloudflared tunnels for all external access
3. **Container Security**: Keep Docker images updated
4. **Access Control**: Implement IP whitelisting
5. **Monitoring**: Set up alerts for suspicious activity

## Backup and Recovery

**Configuration Backup:**
```bash
# Backup all configs
tar -czf nyra-config-backup-$(date +%Y%m%d).tar.gz config/ scripts/ docs/
```

**Model Weights Backup:**
```bash
# Backup model weights (large files)
rsync -av /app/models/ backup-server:/nyra-models/
```

**Database Backup:**
```bash
# Backup LiteLLM database
docker exec nyra-postgres pg_dump -U litellm litellm > litellm-backup-$(date +%Y%m%d).sql
```

This completes the comprehensive deployment guide for the Nyra distributed AI infrastructure. The system provides intelligent model routing, automatic scaling, and comprehensive monitoring across your GPU cluster.