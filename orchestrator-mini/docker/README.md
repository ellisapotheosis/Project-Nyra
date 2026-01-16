# Orchestrator Mini - Intel NUC 12 Pro

Central orchestrator for the distributed Claude Flow swarm architecture.

## Hardware Specifications

- **Model**: Intel NUC 12 Pro
- **CPU**: Intel i7-1260P (12 cores, 16 threads)
- **RAM**: 64GB DDR4
- **Storage**: 2TB NVMe SSD
- **Network**: 10.0.0.1 (Static IP recommended)
- **Role**: Orchestrator & Monitoring Hub

## Services Deployed

### Core Services
- **Claude Flow Orchestrator** (port 3010) - Central coordination hub
- **Nexus Router** (port 6000) - Multi-provider LLM gateway
- **AgentDB** (port 8080) - HNSW vector database (150x-12,500x faster)
- **RuVector** (port 8888) - Memory optimization with SONA/MoE/Flash Attention

### Memory Systems
- **Letta (MemGPT)** (port 8283) - Stateful conversation memory
- **Mem0** (port 4321) - Universal memory layer
- **Qdrant** (ports 6333, 6334) - Vector database
- **PostgreSQL** - Letta database backend

### Infrastructure
- **Infisical** (port 8080) - Secrets management
- **Redis** (port 6380) - Caching and message broker
- **Traefik** (ports 80, 443, 8080) - Reverse proxy and load balancer

### Monitoring & Observability
- **Prometheus** (port 9090) - Metrics collection
- **Grafana** (port 3000) - Dashboards and visualization
- **Loki** (port 3100) - Log aggregation
- **Promtail** - Log shipper
- **Node Exporter** (port 9100) - System metrics
- **cAdvisor** (port 8081) - Container metrics

### Management
- **Portainer** (ports 9000, 9443) - Container management UI
- **Watchtower** - Automatic container updates

## Prerequisites

1. Docker Engine 24.0+ with Compose V2
2. Git
3. Network configuration with static IP
4. Sufficient disk space (minimum 500GB free)

## Installation

### 1. Clone Repository

```bash
cd C:\Dev\Projects\Repos\Project-Nyra
```

### 2. Configure Environment

```bash
cd orchestrator-mini/docker
cp .env.example .env
```

Edit `.env` and fill in all required values:
- API keys for LLM providers (Anthropic, OpenRouter, Google, OpenAI)
- Database passwords
- Infisical configuration
- Grafana credentials

### 3. Create Required Directories

```bash
mkdir -p ../monitoring
mkdir -p ../traefik/dynamic
```

### 4. Configure Monitoring

Create `../monitoring/prometheus.yml`:
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'claude-flow-orchestrator'
    static_configs:
      - targets: ['claude-flow:3010']

  - job_name: 'node-exporter-orchestrator'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'worker-rtx3060'
    static_configs:
      - targets: ['172.20.0.63:9100']
      - targets: ['172.20.0.64:9400']

  - job_name: 'worker-rtx5090'
    static_configs:
      - targets: ['172.20.0.80:9100']
      - targets: ['172.20.0.81:9400']

  - job_name: 'worker-rtx3090ti'
    static_configs:
      - targets: ['172.20.0.97:9100']
      - targets: ['172.20.0.98:9400']
```

Create `../monitoring/alert-rules.yml`:
```yaml
groups:
  - name: claude_flow
    interval: 30s
    rules:
      - alert: ClaudeFlowDown
        expr: up{job="claude-flow-orchestrator"} == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Claude Flow Orchestrator is down"

      - alert: HighMemoryUsage
        expr: (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 < 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Memory usage above 90%"
```

### 5. Start Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 6. Verify Services

Wait 2-3 minutes for all services to start, then verify:

```bash
# Health checks
curl http://localhost:3010/health  # Claude Flow
curl http://localhost:6000/health  # Nexus Router
curl http://localhost:8080/health  # AgentDB
curl http://localhost:8888/health  # RuVector
```

## Access URLs

Once deployed, access services via Traefik:

- **Traefik Dashboard**: http://traefik.nyra.local (or http://10.0.0.1:8080)
- **Claude Flow**: http://claude-flow.nyra.local (or http://10.0.0.1:3010)
- **Grafana**: http://grafana.nyra.local (or http://10.0.0.1:3000)
- **Prometheus**: http://prometheus.nyra.local (or http://10.0.0.1:9090)
- **Portainer**: http://portainer.nyra.local (or http://10.0.0.1:9000)
- **AgentDB**: http://agentdb.nyra.local (or http://10.0.0.1:8080)
- **Letta**: http://letta.nyra.local (or http://10.0.0.1:8283)
- **Mem0**: http://mem0.nyra.local (or http://10.0.0.1:4321)

## DNS Configuration

Add to `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
10.0.0.1 traefik.nyra.local
10.0.0.1 claude-flow.nyra.local
10.0.0.1 grafana.nyra.local
10.0.0.1 prometheus.nyra.local
10.0.0.1 portainer.nyra.local
10.0.0.1 agentdb.nyra.local
10.0.0.1 ruvector.nyra.local
10.0.0.1 letta.nyra.local
10.0.0.1 mem0.nyra.local
10.0.0.1 infisical.nyra.local
```

## Network Architecture

The orchestrator creates the `nyra-network` bridge network (172.20.0.0/16) that all workers join:

- Orchestrator: 172.20.0.1
- Core Services: 172.20.0.10-20
- Infrastructure: 172.20.0.30-40
- Workers: 172.20.0.50+ (configured in worker compose files)

## Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f claude-flow
docker-compose logs -f prometheus
```

### Restart Services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart claude-flow
```

### Update Services

```bash
# Pull latest images
docker-compose pull

# Restart with new images
docker-compose up -d
```

### Backup

Important data volumes:
- `claude-flow-data` - Agent state and memory
- `agentdb-data` - Vector database
- `prometheus-data` - Metrics history
- `grafana-data` - Dashboards and settings

```bash
# Backup volumes
docker run --rm -v claude-flow-data:/data -v $(pwd):/backup alpine tar czf /backup/claude-flow-backup.tar.gz /data
```

## Troubleshooting

### Services Won't Start

1. Check Docker daemon is running
2. Verify `.env` file is configured
3. Check port conflicts: `netstat -tulpn | grep LISTEN`
4. Review logs: `docker-compose logs`

### Network Issues

1. Verify network exists: `docker network ls | grep nyra-network`
2. Check IP conflicts in your LAN
3. Ensure static IP is configured correctly
4. Test connectivity between services: `docker-compose exec claude-flow ping agentdb`

### High Resource Usage

1. Monitor with Grafana dashboards
2. Adjust resource limits in docker-compose.yml
3. Scale down concurrent tasks in environment variables
4. Review Prometheus metrics for bottlenecks

## Security Notes

1. Change all default passwords in `.env`
2. Use strong secrets for JWT and encryption keys
3. Configure firewall to restrict access to necessary ports
4. Enable TLS in Traefik for production
5. Regularly update containers with Watchtower or manual pulls
6. Review Infisical for proper secrets management

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review Grafana dashboards for system health
- Consult main project documentation
- Check worker nodes are properly connected

## Next Steps

After orchestrator is running:
1. Deploy worker nodes (RTX 3060, RTX 5090, RTX 3090 Ti)
2. Verify swarm connectivity in Grafana
3. Test distributed task execution
4. Configure alerting in Prometheus
5. Set up backup automation
