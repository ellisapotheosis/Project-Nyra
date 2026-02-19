# Orchestrator Mini Configuration

## Overview
Configuration and setup files for the Mac Mini orchestrator node - the central coordination hub for the Project Nyra distributed infrastructure.

## Specifications
- **Device**: Mac Mini (Apple Silicon M2/M3 or Intel)
- **Role**: Orchestration, coordination, monitoring, lightweight inference
- **Responsibilities**:
  - Task distribution to worker nodes
  - System monitoring and health checks
  - API gateway and routing
  - Database management
  - Configuration management
  - Logging and metrics aggregation

## Directory Structure

### `/configs`
Orchestration and coordination configurations:
- Kubernetes/Docker Swarm configs
- Load balancer settings
- API gateway configuration
- Service discovery
- Database connection strings
- Monitoring and alerting rules

### `/scripts`
Management and automation scripts:
- `bootstrap-orchestrator.ps1/.sh` - Complete orchestrator setup automation
- `configure-static-ip.ps1/.sh` - Network configuration for PC1
- `health-check-all.ps1/.sh` - System-wide health monitoring
- `backup-daily.ps1/.sh` - Automated backup procedures
- `setup-*.sh` - Various setup utilities (Claude Desktop, Cloudflare Tunnel, Tailscale)

### `/docker`
Container orchestration:
- Orchestrator service Dockerfiles
- Docker Compose for control plane
- Network configuration
- Service mesh setup
- Volume management

### `/setup`
Initial setup and prerequisites:
- `distributed-setup/` - Distributed system setup scripts
  - `01-gitea-setup.sh` - Git server configuration
  - `02-cloudflared-setup.sh` - Cloudflare tunnel setup
  - `03-tailscale-setup.sh` - VPN network configuration
  - `04-claude-flow-distributed.sh` - Claude Flow distributed deployment
- `setup-cloudflare-tunnel.ps1` - Cloudflare tunnel management

## Quick Start

```bash
# Navigate to orchestrator-mini directory
cd bootstrap/orchestrator-mini

# Configure static IP for PC1 (10.0.0.1)
cd scripts
./configure-static-ip.ps1 -PCRole PC1  # Windows
# or
./configure-static-ip.sh PC1  # Linux/macOS

# Run orchestrator bootstrap
./bootstrap-orchestrator.ps1  # Windows
# or
./bootstrap-orchestrator.sh  # Linux/macOS

# Start orchestration services
cd ../docker
docker-compose up -d
```

## Core Services

### Control Plane
- **API Gateway**: Routes requests to worker nodes
- **Task Queue**: Redis/RabbitMQ for job distribution
- **Scheduler**: Assigns tasks based on worker capabilities
- **Monitor**: Collects metrics from all nodes

### Data Layer
- **PostgreSQL**: Primary database for system state
- **Redis**: Cache and message broker
- **TimescaleDB**: Time-series metrics storage

### Observability
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Loki**: Log aggregation
- **Alertmanager**: Alert routing

## Worker Node Management

### Register Worker
```bash
# Add new worker node
./scripts/register-worker.sh --name worker-rtx5090 --ip 192.168.1.10 --gpu rtx5090

# Verify registration
./scripts/list-workers.sh
```

### Health Monitoring
```bash
# Check all workers
./scripts/health-check.sh

# View worker status
curl http://localhost:8080/api/workers/status
```

## Task Distribution

### Submit Job
```bash
# Submit AI workload
curl -X POST http://localhost:8080/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "type": "training",
    "model": "llama-2-7b",
    "gpu_requirement": "24gb",
    "priority": "high"
  }'
```

### Monitor Jobs
```bash
# List active jobs
./scripts/list-jobs.sh --status running

# View job logs
./scripts/job-logs.sh --job-id abc123
```

## Dashboard Access

```bash
# Grafana Dashboard
open http://localhost:3000

# Orchestrator API
open http://localhost:8080/docs

# Worker Status UI
open http://localhost:8080/workers
```

## Security

### SSL/TLS Setup
```bash
# Generate certificates
./scripts/generate-certs.sh

# Apply to services
./scripts/apply-tls.sh
```

### Access Control
- API keys for worker authentication
- Role-based access control (RBAC)
- Network policies for inter-service communication

## Backup and Recovery

```bash
# Backup system state
./scripts/backup.sh --full

# Restore from backup
./scripts/restore.sh --backup-id 20260115-1830
```

## Monitoring

```bash
# System health
./scripts/system-status.sh

# Resource utilization
docker stats

# View logs
docker-compose logs -f orchestrator
```

## Troubleshooting

### Worker Not Responding
```bash
# Ping worker
./scripts/ping-worker.sh --name worker-rtx5090

# Restart worker connection
./scripts/reconnect-worker.sh --name worker-rtx5090
```

### High Load
```bash
# Check queue depth
./scripts/queue-status.sh

# Redistribute tasks
./scripts/rebalance-tasks.sh
```

## Related Documentation
- [Main Bootstrap Guide](../README.md)
- [Distributed Architecture](../../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md)
- [Orchestrator Setup Guide](../docs/ORCHESTRATOR-SETUP.md)
- [API Documentation](../../docs/api/ORCHESTRATOR-API.md)
