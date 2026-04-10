# 4-PC Distributed Claude Flow Deployment Guide

Complete Docker Compose deployment for distributed Claude Flow swarm across 4 PCs.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Orchestrator Mini (10.0.0.1)                │
│  Intel NUC 12 Pro - i7-1260P, 64GB RAM                         │
│  ├─ Claude Flow Orchestrator (hierarchical-mesh topology)      │
│  ├─ Nexus Router (multi-provider LLM gateway)                  │
│  ├─ Memory Systems (ruvector, RuVector, Letta, Mem0, Qdrant)   │
│  ├─ Infrastructure (Infisical, Redis, Traefik)                 │
│  └─ Monitoring (Prometheus, Grafana, Loki)                     │
└─────────────────────────────────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼─────────┐  ┌────────▼────────┐  ┌─────────▼────────┐
│ Worker RTX 3060 │  │ Worker RTX 5090 │  │ Worker RTX 3090Ti│
│   (10.0.0.3)    │  │   (10.0.0.2)    │  │   (10.0.0.4)     │
│ 12GB GPU        │  │ 24GB GPU        │  │ 24GB GPU         │
│ 32GB RAM        │  │ 64GB RAM        │  │ 64GB RAM         │
│                 │  │                 │  │                  │
│ ├─ Claude Flow  │  │ ├─ Claude Flow  │  │ ├─ Claude Flow   │
│ ├─ Ollama       │  │ ├─ Ollama       │  │ ├─ Ollama        │
│ ├─ Code Server  │  │ ├─ vLLM         │  │ ├─ SwarmUI       │
│ ├─ Jupyter      │  │ ├─ llama.cpp    │  │ ├─ ComfyUI       │
│ ├─ n8n          │  │ ├─ Auto1111     │  │ ├─ n8n           │
│ └─ TwentyCRM    │  │ ├─ ComfyUI      │  │ └─ Jupyter       │
│                 │  │ ├─ SwarmUI      │  │                  │
│ Medium Tasks    │  │ └─ Jupyter      │  │ Training/Heavy   │
└─────────────────┘  │                 │  └──────────────────┘
                     │ Large Models/   │
                     │ Image Gen       │
                     └─────────────────┘
```

## Network Architecture

### Network: `nyra-network` (172.20.0.0/16)

| PC | LAN IP | Docker Subnet | Services |
|----|--------|---------------|----------|
| Orchestrator | 10.0.0.1 | 172.20.0.5-40 | Core, Memory, Monitoring |
| RTX 3060 | 10.0.0.3 | 172.20.0.53-64 | Dev Tools, Medium GPU |
| RTX 5090 | 10.0.0.2 | 172.20.0.70-81 | Large Models, Image Gen |
| RTX 3090 Ti | 10.0.0.4 | 172.20.0.90-98 | Training, Heavy Compute |

## Port Allocation

### Orchestrator Mini (10.0.0.1)
- 80, 443 - Traefik (HTTP/HTTPS)
- 3000 - Grafana
- 3010 - Claude Flow Orchestrator
- 4321 - Mem0
- 6000 - Nexus Router
- 6333, 6334 - Qdrant
- 6380 - Redis
- 8003 - Claude Flow MCP
- 8080 - ruvector/Infisical/Traefik Dashboard
- 8081 - cAdvisor
- 8283 - Letta
- 8888 - RuVector
- 9000, 9443 - Portainer
- 9090 - Prometheus
- 9100 - Node Exporter
- 3100 - Loki

### Worker RTX 3060 (10.0.0.3)
- 3000 - TwentyCRM
- 3002 - Open WebUI
- 3011 - Claude Flow Worker
- 5678 - n8n
- 6379 - Redis
- 8004 - Claude Flow MCP
- 8443 - Code Server
- 8888 - Jupyter
- 9100 - Node Exporter
- 9400 - NVIDIA GPU Exporter
- 11434 - Ollama

### Worker RTX 5090 (10.0.0.2)
- 3003 - Open WebUI
- 3012 - Claude Flow Worker
- 6381 - Redis
- 7801 - SwarmUI
- 7860 - Automatic1111
- 8001 - vLLM
- 8002 - llama.cpp
- 8005 - Claude Flow MCP
- 8188 - ComfyUI
- 8889 - Jupyter
- 9101 - Node Exporter
- 9401 - NVIDIA GPU Exporter
- 11435 - Ollama

### Worker RTX 3090 Ti (10.0.0.4)
- 3004 - Open WebUI
- 3013 - Claude Flow Worker
- 5679 - n8n
- 7802 - SwarmUI
- 8006 - Claude Flow MCP
- 8189 - ComfyUI
- 8890 - Jupyter
- 9102 - Node Exporter
- 9402 - NVIDIA GPU Exporter
- 11436 - Ollama

## Deployment Order

### 1. Orchestrator First (REQUIRED)

The orchestrator MUST be deployed first as it:
- Creates the `nyra-network` Docker network
- Provides core memory systems (ruvector, RuVector)
- Sets up monitoring infrastructure
- Runs the LLM gateway (Nexus Router)

```bash
cd C:\Dev\Projects\Repos\Project-Nyra\orchestrator-mini\docker
cp .env.example .env
# Edit .env with your API keys and passwords
docker-compose up -d
```

Wait 5 minutes for all services to start, then verify:
```bash
curl http://localhost:3010/health  # Claude Flow
curl http://localhost:6000/health  # Nexus Router
curl http://localhost:8080/health  # ruvector
```

### 2. Workers (Any Order)

Once orchestrator is running, deploy workers in any order:

#### RTX 3060 (Development)
```bash
cd C:\Dev\Projects\Repos\Project-Nyra\worker-rtx3060\docker
cp .env.example .env
docker-compose up -d
```

#### RTX 5090 (High-Performance)
```bash
cd C:\Dev\Projects\Repos\Project-Nyra\worker-rtx5090\docker
cp .env.example .env
docker-compose up -d
```

#### RTX 3090 Ti (AI/ML)
```bash
cd C:\Dev\Projects\Repos\Project-Nyra\worker-rtx3090ti\docker
cp .env.example .env
docker-compose up -d
```

## Configuration Files

Each PC has its own configuration in:
```
config/archon-os/
├── orchestrator/
│   └── archon-os.config.json
├── worker-laptop-1/        # RTX 5090
│   └── archon-os.config.json
└── worker-laptop-2/        # RTX 3060
    └── archon-os.config.json
```

Worker-rtx3090ti uses the same pattern as existing workers.

## Environment Variables

### Required for All PCs
```bash
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENROUTER_API_KEY=sk-or-xxxxx  # Optional fallback
GOOGLE_API_KEY=xxxxx            # Optional fallback
OPENAI_API_KEY=sk-xxxxx         # For Mem0
```

### Orchestrator-Specific
```bash
LETTA_PG_PASSWORD=secure_password
REDIS_PASSWORD=secure_password
INFISICAL_ENCRYPTION_KEY=generate_with_openssl
INFISICAL_JWT_SECRET=generate_with_openssl
INFISICAL_PROJECT_ID=your_project_id
QDRANT_API_KEY=random_key
GRAFANA_USER=admin
GRAFANA_PASSWORD=secure_password
```

### Worker-Specific
```bash
# RTX 3060
N8N_PG_PASSWORD=secure_password
TWENTYCRM_PG_PASSWORD=secure_password
TWENTYCRM_JWT_SECRET=generate_random
CODESERVER_PASSWORD=secure_password

# All Workers
REDIS_PASSWORD=secure_password
WEBUI_SECRET_KEY=generate_random
```

## DNS Configuration

Add to `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
# Orchestrator
10.0.0.1 traefik.nyra.local
10.0.0.1 archon-os.nyra.local
10.0.0.1 grafana.nyra.local
10.0.0.1 prometheus.nyra.local
10.0.0.1 portainer.nyra.local
10.0.0.1 ruvector.nyra.local
10.0.0.1 ruvector.nyra.local
10.0.0.1 nexus.nyra.local
10.0.0.1 letta.nyra.local
10.0.0.1 mem0.nyra.local
10.0.0.1 qdrant.nyra.local
10.0.0.1 infisical.nyra.local
10.0.0.1 loki.nyra.local

# Worker RTX 3060
10.0.0.3 worker-rtx3060.nyra.local
10.0.0.3 ai-rtx3060.nyra.local
10.0.0.3 code.nyra.local
10.0.0.3 jupyter-rtx3060.nyra.local
10.0.0.3 n8n-rtx3060.nyra.local
10.0.0.3 crm-rtx3060.nyra.local
10.0.0.3 ollama-rtx3060.nyra.local

# Worker RTX 5090
10.0.0.2 worker-rtx5090.nyra.local
10.0.0.2 ai-rtx5090.nyra.local
10.0.0.2 sd-rtx5090.nyra.local
10.0.0.2 comfy-rtx5090.nyra.local
10.0.0.2 swarm-rtx5090.nyra.local
10.0.0.2 jupyter-rtx5090.nyra.local
10.0.0.2 ollama-rtx5090.nyra.local
10.0.0.2 vllm-rtx5090.nyra.local
10.0.0.2 llama-rtx5090.nyra.local

# Worker RTX 3090 Ti
10.0.0.4 worker-rtx3090ti.nyra.local
10.0.0.4 ai-rtx3090ti.nyra.local
10.0.0.4 swarm-rtx3090ti.nyra.local
10.0.0.4 comfy-rtx3090ti.nyra.local
10.0.0.4 n8n-rtx3090ti.nyra.local
10.0.0.4 jupyter-rtx3090ti.nyra.local
10.0.0.4 ollama-rtx3090ti.nyra.local
```

## Verification

### 1. Check Orchestrator

```bash
# All services running
docker ps | grep orchestrator

# Health checks
curl http://10.0.0.1:3010/health  # Claude Flow
curl http://10.0.0.1:6000/health  # Nexus Router
curl http://10.0.0.1:8080/health  # ruvector

# View logs
docker logs orchestrator-archon-os -f
```

### 2. Check Workers

```bash
# RTX 3060
curl http://10.0.0.3:3011/health
docker ps | grep rtx3060

# RTX 5090
curl http://10.0.0.2:3012/health
docker ps | grep rtx5090

# RTX 3090 Ti
curl http://10.0.0.4:3013/health
docker ps | grep rtx3090ti
```

### 3. Verify Network Connectivity

```bash
# From orchestrator to workers
docker exec orchestrator-archon-os ping 172.20.0.53  # RTX 3060
docker exec orchestrator-archon-os ping 172.20.0.70  # RTX 5090
docker exec orchestrator-archon-os ping 172.20.0.90  # RTX 3090 Ti

# From workers to orchestrator
docker exec worker-archon-os-rtx3060 ping 172.20.0.10
```

### 4. Check Swarm Status

Access Grafana: http://grafana.nyra.local (10.0.0.1:3000)
- View all node metrics
- Check GPU utilization
- Monitor task distribution

## Task Distribution

The orchestrator intelligently routes tasks based on:

### RTX 3060 (10.0.0.3) - Development
- Code generation
- Medium model inference (7B-13B)
- Development testing
- Data processing
- CRM operations
- Workflow automation

### RTX 5090 (10.0.0.2) - High-Performance
- Large model inference (70B)
- Multiple concurrent models
- SDXL image generation
- 4K image processing
- Video generation
- Production inference workloads

### RTX 3090 Ti (10.0.0.4) - Training/Heavy
- Model fine-tuning
- Large batch inference
- Image generation pipelines
- Video processing
- Research workloads
- Long-running computations

## Monitoring

### Grafana Dashboards (http://grafana.nyra.local)

Create dashboards for:
1. **Swarm Overview**: All nodes, task distribution
2. **GPU Metrics**: Utilization, memory, temperature, power
3. **Memory Systems**: ruvector, RuVector, Letta, Mem0 performance
4. **LLM Gateway**: Nexus Router throughput and latency
5. **Container Health**: All services across all nodes

### Prometheus Metrics

All nodes export metrics to Prometheus (10.0.0.1:9090):
- Node Exporter: System metrics (CPU, RAM, disk, network)
- GPU Exporter: NVIDIA GPU metrics (utilization, VRAM, temp)
- Claude Flow: Swarm coordination metrics
- Container metrics: cAdvisor on orchestrator

### Log Aggregation

All logs flow to Loki (10.0.0.1:3100):
- Claude Flow orchestration logs
- Worker execution logs
- Container logs via Promtail
- System logs

## Maintenance

### Update All Services

```bash
# On each PC
cd <pc-directory>/docker
docker-compose pull
docker-compose up -d
```

### Backup Critical Data

```bash
# On orchestrator
docker run --rm -v archon-os-data:/data -v $(pwd):/backup alpine tar czf /backup/orchestrator-backup.tar.gz /data

# On workers (models are large, backup selectively)
docker run --rm -v ollama-models:/data -v $(pwd):/backup alpine tar czf /backup/models-backup.tar.gz /data
```

### Restart Services

```bash
# Single service
docker-compose restart archon-os

# All services
docker-compose restart
```

### View Logs

```bash
# Follow logs
docker-compose logs -f archon-os

# Last 100 lines
docker-compose logs --tail=100 archon-os
```

## Troubleshooting

### Network Issues

1. **Workers can't reach orchestrator**:
   - Check firewall rules on orchestrator
   - Verify network: `docker network inspect nyra-network`
   - Test connectivity: `ping 10.0.0.1`

2. **Services can't communicate**:
   - Ensure all containers are on `nyra-network`
   - Check DNS resolution: `docker exec <container> nslookup <service>`
   - Review Traefik logs: `docker logs orchestrator-traefik`

### GPU Issues

1. **GPU not detected**:
   - Run `nvidia-smi` on host
   - Verify nvidia-container-toolkit: `docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 nvidia-smi`
   - Check container logs: `docker logs <container>`

2. **OOM errors**:
   - Use smaller or quantized models
   - Reduce batch size
   - Monitor with `nvidia-smi`

### Performance Issues

1. **Slow inference**:
   - Check GPU utilization in Grafana
   - Verify full GPU offloading
   - Review container resource limits
   - Check network latency

2. **High latency**:
   - Monitor Nexus Router metrics
   - Check Prometheus for bottlenecks
   - Review task queue in Claude Flow
   - Verify no thermal throttling

## Security Checklist

- [ ] Change all default passwords in .env files
- [ ] Generate secure secrets for JWT, encryption keys
- [ ] Configure firewall rules on all PCs
- [ ] Enable TLS in Traefik for production
- [ ] Set up VPN for remote access
- [ ] Configure Infisical for secrets management
- [ ] Enable authentication on all web UIs
- [ ] Regular security updates via Watchtower
- [ ] Review container permissions
- [ ] Monitor access logs in Loki

## Performance Optimization

### Orchestrator
- Allocate sufficient RAM for memory systems
- Use SSD for ruvector and RuVector data
- Configure Redis with appropriate maxmemory
- Tune Prometheus retention based on disk space

### Workers
- Set appropriate GPU power limits
- Configure batch sizes based on VRAM
- Use quantized models when possible
- Enable persistence mode: `nvidia-smi -pm 1`
- Monitor thermals and adjust fan curves

## Cost Optimization

### Power Consumption
- Orchestrator: ~50-80W
- RTX 3060: 170W max
- RTX 5090: 450W max
- RTX 3090 Ti: 450W max
- Total: ~1,120W at full load

### Efficiency Tips
1. Use GPU power limits during idle
2. Configure Watchtower to update during off-hours
3. Scale down unused services
4. Use cheaper LLM providers via Nexus Router
5. Cache frequent requests in Redis

## Next Steps

1. **Configure Monitoring**: Set up Grafana dashboards
2. **Test Distribution**: Run sample tasks across all nodes
3. **Optimize Models**: Download and test models on each GPU
4. **Set Up Workflows**: Create n8n automation pipelines
5. **Configure Alerts**: Set up Prometheus alerting rules
6. **Document Workflows**: Create runbooks for common tasks
7. **Train Team**: Share access URLs and credentials
8. **Backup Strategy**: Implement automated backups
9. **Disaster Recovery**: Document recovery procedures
10. **Performance Tuning**: Profile and optimize based on usage

## Support Resources

- **Main Documentation**: `/docs` directory
- **Component READMEs**: Each PC's `/docker/README.md`
- **Claude Flow Wiki**: https://github.com/ruvnet/archon-os
- **Grafana Dashboards**: Import from Grafana.com
- **Prometheus Alerts**: `/orchestrator-mini/monitoring/alert-rules.yml`

## Quick Reference

```bash
# Start all (run on each PC)
docker-compose up -d

# Stop all
docker-compose down

# View status
docker-compose ps

# View logs
docker-compose logs -f

# Restart service
docker-compose restart <service>

# Update images
docker-compose pull && docker-compose up -d

# Check GPU
nvidia-smi

# Network status
docker network inspect nyra-network

# Health checks
curl http://localhost:<port>/health
```
