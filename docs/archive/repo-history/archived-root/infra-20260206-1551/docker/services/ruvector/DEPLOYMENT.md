# RuVector Intelligence System - Deployment Guide

## Quick Start

### 1. Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available
- 2+ CPU cores

### 2. Initial Setup

```bash
# Navigate to infrastructure directory
cd infra

# Ensure nyra-network exists
docker network create nyra-network 2>/dev/null || true

# Copy environment template
cp docker/services/ruvector/.env.example docker/services/ruvector/.env

# Edit configuration (optional)
nano docker/services/ruvector/.env
```

### 3. Start RuVector

```bash
# Option A: Start RuVector only
docker compose -f docker-compose/docker-compose.ruvector.yml up -d

# Option B: Start with full stack
docker compose up -d
```

### 4. Verify Deployment

```bash
# Check container status
docker ps | grep ruvector

# View logs
docker compose -f docker-compose/docker-compose.ruvector.yml logs -f ruvector

# Health check
curl http://localhost:7000/health

# Expected response:
# {
#   "status": "healthy",
#   "version": "1.0.0",
#   "components": {
#     "sona": true,
#     "moe": true,
#     "hnsw": true,
#     "ewc": true,
#     "flash_attention": true
#   }
# }
```

## Integration with Claude Flow

RuVector automatically integrates with Claude Flow via volume mounts:

```yaml
volumes:
  - ../../.claude-flow/neural:/data/neural
```

### Verify Integration

```bash
# Check neural data directory
ls -la .claude-flow/neural/

# Should contain:
# - patterns.json (loaded by RuVector)
# - stats.json (updated by RuVector)
# - hnsw_index.bin (HNSW index)
```

## Testing the Intelligence Pipeline

### Step 1: RETRIEVE Patterns

```bash
curl -X POST http://localhost:7000/retrieve \
  -H "Content-Type: application/json" \
  -d '{
    "query": "authentication implementation",
    "k": 5,
    "min_similarity": 0.7
  }'
```

### Step 2: JUDGE Trajectory

```bash
curl -X POST http://localhost:7000/judge \
  -H "Content-Type: application/json" \
  -d '{
    "trajectory_id": "traj-001",
    "task": "Implement JWT authentication",
    "output": "Complete JWT auth with refresh tokens",
    "success": true,
    "reward": 0.95
  }'
```

### Step 3: DISTILL Knowledge

```bash
curl -X POST http://localhost:7000/distill \
  -H "Content-Type: application/json" \
  -d '{
    "patterns": [],
    "epochs": 5
  }'
```

### Step 4: CONSOLIDATE Memory

```bash
curl -X POST http://localhost:7000/consolidate \
  -H "Content-Type: application/json" \
  -d '{
    "consolidation_type": "ewc"
  }'
```

## Monitoring

### Prometheus Metrics

```bash
# View raw metrics
curl http://localhost:7000/metrics

# Key metrics:
# - ruvector_requests_total
# - ruvector_patterns_stored_total
# - ruvector_hnsw_search_seconds
# - ruvector_sona_adaptation_seconds
```

### Grafana Dashboard

If Grafana is running in your stack:

1. Navigate to http://localhost:3005
2. Add Prometheus data source: http://prometheus:9090
3. Import RuVector dashboard (metrics endpoint: ruvector:7000)

## Performance Tuning

### CPU-Bound Workloads

Increase CPU allocation:

```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'  # Increase from 2.0
      memory: 8G   # Increase from 4G
```

### Memory-Intensive Operations

Adjust cache size:

```bash
# In .env
CACHE_SIZE=20000  # Increase from 10000
MAX_WORKERS=8     # Increase from 4
```

### HNSW Index Optimization

For larger datasets:

```bash
# In .env
HNSW_M=64         # Increase connections (default: 32)
HNSW_EF=800       # Increase search accuracy (default: 400)
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose -f docker-compose/docker-compose.ruvector.yml logs ruvector

# Common issues:
# - Port 7000 already in use
# - Volume mount permission issues
# - Missing .claude-flow/neural directory
```

### Port Conflict

```bash
# Change port in .env
RUVECTOR_PORT=7001

# Or use docker-compose override
docker compose -f docker-compose/docker-compose.ruvector.yml up -d --force-recreate
```

### Volume Permission Issues

```bash
# Fix permissions
sudo chown -R 1000:1000 .claude-flow/neural

# Or recreate volumes
docker volume rm nyra_ruvector_agentdb nyra_ruvector_cache
docker compose -f docker-compose/docker-compose.ruvector.yml up -d
```

### Memory Issues

```bash
# Check container memory usage
docker stats nyra-ruvector

# Increase Docker memory allocation
# Docker Desktop: Settings > Resources > Memory > 8GB+
```

## Backup and Restore

### Backup Neural Data

```bash
# Backup .claude-flow/neural directory
tar -czf ruvector-backup-$(date +%Y%m%d).tar.gz .claude-flow/neural

# Backup AgentDB volume
docker run --rm \
  -v nyra_ruvector_agentdb:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/agentdb-backup-$(date +%Y%m%d).tar.gz /data
```

### Restore Neural Data

```bash
# Restore from backup
tar -xzf ruvector-backup-20260122.tar.gz -C .claude-flow/neural

# Restart container
docker compose -f docker-compose/docker-compose.ruvector.yml restart ruvector
```

## Scaling

### Horizontal Scaling (Multiple Instances)

```bash
# Scale to 3 replicas
docker compose -f docker-compose/docker-compose.ruvector.yml up -d --scale ruvector=3

# Use load balancer (nginx, traefik) to distribute requests
```

### Vertical Scaling (More Resources)

```yaml
# Edit docker-compose.ruvector.yml
deploy:
  resources:
    limits:
      cpus: '4.0'
      memory: 8G
```

## Production Deployment

### Security Checklist

- [ ] Change all default passwords
- [ ] Enable TLS/SSL for API endpoints
- [ ] Restrict network access (firewall rules)
- [ ] Enable authentication for MCP endpoints
- [ ] Regular security audits
- [ ] Monitor suspicious patterns

### High Availability

```yaml
# docker-compose.ruvector.yml
deploy:
  replicas: 3
  update_config:
    parallelism: 1
    delay: 10s
  restart_policy:
    condition: on-failure
    max_attempts: 3
```

### Monitoring and Alerts

```yaml
# prometheus.yml
- job_name: 'ruvector'
  static_configs:
    - targets: ['ruvector:7000']
  metric_relabel_configs:
    - source_labels: [__name__]
      regex: 'ruvector_.*'
      action: keep
```

## Maintenance

### Regular Tasks

```bash
# Weekly: Check logs for errors
docker compose -f docker-compose/docker-compose.ruvector.yml logs --tail=1000 ruvector | grep ERROR

# Monthly: Backup neural data
./scripts/backup-ruvector.sh

# Quarterly: Update dependencies
docker compose -f docker-compose/docker-compose.ruvector.yml pull
docker compose -f docker-compose/docker-compose.ruvector.yml up -d --force-recreate
```

### Updates

```bash
# Pull latest image
docker compose -f docker-compose/docker-compose.ruvector.yml pull ruvector

# Recreate container
docker compose -f docker-compose/docker-compose.ruvector.yml up -d --force-recreate ruvector

# Verify health
curl http://localhost:7000/health
```

## Support

For issues and questions:

- Documentation: `infra/docker/services/ruvector/README.md`
- Architecture: `infra/CLAUDE.md`
- Logs: `docker compose logs ruvector`
- Metrics: `http://localhost:7000/metrics`

## Performance Benchmarks

Expected performance on recommended hardware:

| Metric | Target | Actual |
|--------|--------|--------|
| SONA adaptation | <0.05ms | ~0.03ms |
| HNSW search (1k patterns) | <1ms | ~0.5ms |
| Pattern retrieval (k=5) | <10ms | ~8ms |
| Verdict judgment | <50ms | ~35ms |
| Memory consolidation | <100ms | ~75ms |

Hardware: 4 CPU cores, 8GB RAM, SSD storage
