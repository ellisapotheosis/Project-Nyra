# RuVector Intelligence System - Quick Reference Card

## 🚀 Quick Start (3 Commands)

```bash
# 1. Create network
docker network create nyra-network 2>/dev/null || true

# 2. Start RuVector
cd infra && docker compose -f docker-compose/docker-compose.ruvector.yml up -d

# 3. Verify health
curl http://localhost:7000/health | jq '.'
```

## 📋 Common Commands

### Service Management

```bash
# Start
docker compose -f docker-compose/docker-compose.ruvector.yml up -d

# Stop
docker compose -f docker-compose/docker-compose.ruvector.yml down

# Restart
docker compose -f docker-compose/docker-compose.ruvector.yml restart ruvector

# Logs (follow)
docker compose -f docker-compose/docker-compose.ruvector.yml logs -f ruvector

# Logs (last 100 lines)
docker compose -f docker-compose/docker-compose.ruvector.yml logs --tail=100 ruvector

# Status
docker compose -f docker-compose/docker-compose.ruvector.yml ps

# Shell access
docker exec -it nyra-ruvector /bin/bash
```

### Testing

```bash
# Health check
curl http://localhost:7000/health

# Run integration tests
cd infra/docker/services/ruvector && ./test-ruvector.sh

# Metrics
curl http://localhost:7000/metrics

# Stats
docker stats nyra-ruvector
```

## 🔧 API Examples

### 1. Retrieve Patterns

```bash
curl -X POST http://localhost:7000/retrieve \
  -H "Content-Type: application/json" \
  -d '{"query": "authentication patterns", "k": 5, "min_similarity": 0.7}'
```

### 2. Judge Trajectory

```bash
curl -X POST http://localhost:7000/judge \
  -H "Content-Type: application/json" \
  -d '{
    "trajectory_id": "traj-001",
    "task": "Implement JWT auth",
    "output": "Complete JWT implementation",
    "success": true,
    "reward": 0.95
  }'
```

### 3. Generate Embeddings

```bash
curl -X POST http://localhost:7000/embed \
  -H "Content-Type: application/json" \
  -d '{"texts": ["OAuth2 flow", "JWT tokens"], "normalize": true}'
```

### 4. Search Patterns

```bash
curl -X POST http://localhost:7000/search \
  -H "Content-Type: application/json" \
  -d '{"query_embedding": [0.1, 0.2, ...], "k": 10}'
```

### 5. Consolidate Memory

```bash
curl -X POST http://localhost:7000/consolidate \
  -H "Content-Type: application/json" \
  -d '{"consolidation_type": "ewc"}'
```

## 🎯 Configuration Quick Tweaks

### Change Port

```bash
# In .env or docker-compose override
RUVECTOR_PORT=7001
```

### Tune HNSW Performance

```bash
# Higher recall (slower)
HNSW_M=64
HNSW_EF=800

# Faster search (lower recall)
HNSW_M=16
HNSW_EF=200
```

### Adjust Resources

```yaml
# In docker-compose.ruvector.yml
deploy:
  resources:
    limits:
      cpus: '4.0'    # Increase for more performance
      memory: 8G     # Increase for larger patterns
```

## 📊 Key Metrics

| Metric | Target | Command |
|--------|--------|---------|
| Health | "healthy" | `curl http://localhost:7000/health` |
| SONA adaptation | <0.05ms | Check `/metrics` - `ruvector_sona_adaptation_seconds` |
| HNSW search | <1ms | Check `/metrics` - `ruvector_hnsw_search_seconds` |
| Pattern retrieval | <10ms | Check API response `retrieval_time_ms` |
| Memory usage | <4GB | `docker stats nyra-ruvector` |

## 🔍 Troubleshooting One-Liners

```bash
# Check if container is running
docker ps | grep ruvector

# Check if port is open
nc -zv localhost 7000

# Check last 50 errors
docker logs nyra-ruvector 2>&1 | grep -i error | tail -50

# Check neural data files
ls -lh .claude-flow/neural/

# Check container resource usage
docker stats --no-stream nyra-ruvector

# Restart if unhealthy
docker restart nyra-ruvector && sleep 5 && curl http://localhost:7000/health
```

## 🧠 Intelligence Pipeline Quick Reference

| Step | Endpoint | Purpose | Time |
|------|----------|---------|------|
| 1. RETRIEVE | `/retrieve` | HNSW pattern search | ~8ms |
| 2. JUDGE | `/judge` | Verdict evaluation | ~35ms |
| 3. DISTILL | `/distill` | LoRA knowledge extraction | ~100ms |
| 4. CONSOLIDATE | `/consolidate` | EWC++ memory consolidation | ~75ms |

## 📁 File Locations

```bash
# Service code
infra/docker/services/ruvector/

# Configuration
infra/docker/services/ruvector/.env
infra/docker/services/ruvector/config/ruvector.yml

# Docker Compose
infra/docker-compose/docker-compose.ruvector.yml

# Claude Flow neural data (shared)
.claude-flow/neural/patterns.json
.claude-flow/neural/hnsw_index.bin

# Logs
docker logs nyra-ruvector

# Volumes
docker volume inspect nyra_ruvector_agentdb
docker volume inspect nyra_ruvector_cache
```

## 🚨 Emergency Commands

```bash
# Force restart
docker compose -f docker-compose/docker-compose.ruvector.yml restart --force ruvector

# Rebuild from scratch
docker compose -f docker-compose/docker-compose.ruvector.yml build --no-cache ruvector
docker compose -f docker-compose/docker-compose.ruvector.yml up -d --force-recreate ruvector

# Remove volumes and reset
docker compose -f docker-compose/docker-compose.ruvector.yml down -v
docker compose -f docker-compose/docker-compose.ruvector.yml up -d

# Check disk space
docker system df
docker system prune -a  # Warning: removes unused images
```

## 🔗 Integration Points

### Claude Flow Hooks

```javascript
// Use in .claude-flow/hooks/intelligence.js
const RUVECTOR_URL = 'http://localhost:7000';

async function retrievePatterns(query) {
  const res = await fetch(`${RUVECTOR_URL}/retrieve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, k: 5, min_similarity: 0.7 })
  });
  return res.json();
}
```

### Prometheus Scraping

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'ruvector'
    static_configs:
      - targets: ['ruvector:7000']
    metrics_path: '/metrics'
```

### AgentDB Connection

```python
# In Python code
import httpx

async def search_patterns(query: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'http://ruvector:7000/retrieve',
            json={'query': query, 'k': 5, 'min_similarity': 0.7}
        )
        return response.json()
```

## 📖 Documentation Links

- **Setup**: `SETUP-SUMMARY.md`
- **Deployment**: `DEPLOYMENT.md`
- **API Docs**: `README.md`
- **Claude Integration**: `CLAUDE.md`
- **This Reference**: `QUICK-REFERENCE.md`

## 🎯 Performance Tuning Presets

### Fast (Low Latency)

```bash
HNSW_M=16
HNSW_EF=200
MOE_EXPERT_COUNT=6
MOE_TOP_K=2
```

### Balanced (Default)

```bash
HNSW_M=32
HNSW_EF=400
MOE_EXPERT_COUNT=12
MOE_TOP_K=3
```

### Accurate (High Recall)

```bash
HNSW_M=64
HNSW_EF=800
MOE_EXPERT_COUNT=24
MOE_TOP_K=5
```

---

**Quick Help**: `docker logs nyra-ruvector | grep ERROR`
**Quick Restart**: `docker restart nyra-ruvector`
**Quick Test**: `curl http://localhost:7000/health`
