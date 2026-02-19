# Agentic-Flow Deployment Guide

## Quick Deployment

### 1. Environment Setup

```bash
cd infra/docker/services/agentic-flow

# Copy and configure environment
cp .env.example .env
nano .env
```

### 2. Build & Deploy

```bash
# Build the Docker image
docker compose -f docker-compose.agentic-flow.yml build

# Start the service
docker compose -f docker-compose.agentic-flow.yml up -d
```

### 3. Verify Deployment

```bash
# Check service status
docker ps | grep agentic-flow

# View logs
docker logs -f nyra-agentic-flow

# Test health endpoint
curl http://localhost:8080/health
```

### 4. With Infisical (Production)

```bash
# Deploy with secret injection
infisical run --projectId="pbcskpxyqtysbxjvecfo" \
  --env="dev" --path="/shared" -- \
  docker compose -f docker-compose.agentic-flow.yml up -d
```

## Integration with Existing Stack

### Add to Main Orchestration

```yaml
# In docker-compose.orchestration.yml
include:
  - path: ./services/agentic-flow/docker-compose.agentic-flow.yml
```

### Start Full Stack

```bash
cd infra/docker

# Start everything
docker compose -f docker-compose.orchestration.yml up -d

# Verify all services
docker ps
```

## Monitoring

### Prometheus Scraping

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'agentic-flow'
    static_configs:
      - targets: ['agentic-flow:9091']
```

### Grafana Dashboard

Import dashboard: `monitoring/grafana-agentic-flow.json`

## Troubleshooting

### Service won't start

```bash
# Check dependencies
docker ps | grep -E "postgres|redis|qdrant"

# Check logs
docker logs nyra-agentic-flow

# Rebuild
docker compose -f docker-compose.agentic-flow.yml build --no-cache
```

### Can't connect to databases

```bash
# Test PostgreSQL
docker exec nyra-postgres pg_isready

# Test Redis
docker exec nyra-redis redis-cli ping

# Test network
docker network inspect nyra-network
```

## Maintenance

### Update Service

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker compose -f docker-compose.agentic-flow.yml up -d --build
```

### Backup Data

```bash
# Backup AgentDB
docker cp nyra-agentic-flow:/app/data/agentdb ./backup/agentdb-$(date +%Y%m%d)

# Backup logs
docker cp nyra-agentic-flow:/app/data/logs ./backup/logs-$(date +%Y%m%d)
```

### Clean Up

```bash
# Stop and remove
docker compose -f docker-compose.agentic-flow.yml down

# Remove volumes (WARNING: deletes data)
docker compose -f docker-compose.agentic-flow.yml down -v
```
