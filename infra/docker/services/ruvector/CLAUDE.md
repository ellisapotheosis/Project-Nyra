# RuVector Intelligence System - Claude Code Configuration

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**CLI coordinates, Task tool agents do the actual work!**

---

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster | <1ms | $0 | Simple transforms |
| **2** | Haiku | ~500ms | $0.0002 | Pattern queries, simple ML |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Complex neural architecture |

---

## 🛡️ ANTI-DRIFT CONFIG (Intelligence Mesh Topology)

```bash
# Intelligence system coordination (mesh topology for parallel ML)
npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 6 --strategy specialized
```

**Why Mesh for RuVector:**
- Parallel pattern retrieval
- Concurrent expert routing (MoE)
- Distributed HNSW search
- Asynchronous consolidation

---

## 🧠 RuVector Intelligence System

**Profile**: ruvector-intelligence
**Type**: Neural Pattern Matching System
**Architecture**: Microservice (Python 3.11 + FastAPI)
**Port**: 7000 (MCP Server)

### 🎯 System Overview

High-performance neural pattern matching with:
- **SONA**: Self-Optimizing Neural Architecture (<0.05ms adaptation)
- **MoE**: Mixture of Experts (12 experts, top-3 routing)
- **HNSW**: 150x-12,500x faster pattern search
- **EWC++**: Elastic Weight Consolidation (prevent forgetting)
- **Flash Attention**: 2.49x-7.47x speedup
- **LoRA**: Low-rank adaptation for fine-tuning

### 🔄 4-Step Intelligence Pipeline

```
1. RETRIEVE → 2. JUDGE → 3. DISTILL → 4. CONSOLIDATE
   (HNSW)      (Verdict)     (LoRA)        (EWC++)
```

---

## 🏗️ Architecture

### Tech Stack
- **Framework**: FastAPI + Uvicorn
- **ML Libraries**: PyTorch, Sentence-Transformers, HNSWlib
- **Vector Search**: HNSW (Hierarchical Navigable Small World)
- **Embeddings**: all-MiniLM-L6-v2 (384 dimensions)
- **Monitoring**: Prometheus, Structlog

### Directory Structure

```
infra/docker/services/ruvector/
├── Dockerfile                  # Multi-stage build
├── requirements.txt            # Python dependencies
├── .dockerignore
├── .env.example
├── README.md
├── DEPLOYMENT.md
├── CLAUDE.md                   # This file
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI MCP server
│   ├── config.py               # Configuration settings
│   └── intelligence.py         # Core intelligence system
└── config/
    └── ruvector.yml            # YAML configuration
```

---

## 📋 Development Commands

```bash
# Build container
cd infra/docker/services/ruvector
docker build -t nyra/ruvector:latest .

# Start service
docker compose -f ../../docker-compose/docker-compose.ruvector.yml up -d

# View logs
docker compose -f ../../docker-compose/docker-compose.ruvector.yml logs -f ruvector

# Health check
curl http://localhost:7000/health

# Metrics
curl http://localhost:7000/metrics

# Stop service
docker compose -f ../../docker-compose/docker-compose.ruvector.yml down
```

---

## 🧠 Claude Flow Integration

### Intelligence Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `ml-developer` | Neural architecture design, model optimization | Building new ML features |
| `performance-engineer` | HNSW tuning, inference optimization | Performance bottlenecks |
| `data-scientist` | Pattern analysis, expert routing | Understanding intelligence behavior |
| `system-architect` | Scaling, distributed search | Architecture decisions |
| `security-architect` | Model security, adversarial robustness | Security concerns |

### Recommended Workflows

- Neural architecture optimization
- Pattern retrieval performance tuning
- Expert routing strategy refinement
- Memory consolidation scheduling
- Vector index optimization
- Embedding model upgrades

---

## 🛠️ Tech Stack Specific Guidelines

### FastAPI Best Practices

1. **Async/Await**: All endpoints are async for non-blocking I/O
2. **Pydantic Models**: Strong typing for request/response validation
3. **Lifespan Events**: Proper initialization and cleanup
4. **Structured Logging**: JSON logs for observability

### HNSW Index Management

```python
# Initialize HNSW
self.hnsw_index = hnswlib.Index(space='cosine', dim=384)
self.hnsw_index.init_index(
    max_elements=100000,
    ef_construction=400,
    M=32
)
self.hnsw_index.set_ef(400)

# Add items
self.hnsw_index.add_items(embeddings, ids)

# Search
labels, distances = self.hnsw_index.knn_query(query_embedding, k=5)
```

### Performance Tuning

| Parameter | Default | Tuning |
|-----------|---------|--------|
| `HNSW_M` | 32 | Increase for recall, decrease for speed |
| `HNSW_EF` | 400 | Higher = better recall, slower search |
| `MOE_EXPERT_COUNT` | 12 | More experts = more specialization |
| `MOE_TOP_K` | 3 | More active experts = higher compute |

---

## 🔄 Intelligence Pipeline Usage

### 1. RETRIEVE Patterns

```bash
# Search for similar patterns
curl -X POST http://localhost:7000/retrieve \
  -H "Content-Type: application/json" \
  -d '{
    "query": "authentication implementation",
    "k": 5,
    "min_similarity": 0.7
  }'
```

**Response:**
```json
{
  "patterns": [
    {
      "task": "JWT authentication",
      "output": "Token-based auth implementation",
      "similarity": 0.92,
      "reward": 0.95
    }
  ],
  "retrieval_time_ms": 8.5,
  "expert_activations": {
    "expert_3": 0.87,
    "expert_7": 0.65,
    "expert_11": 0.53
  }
}
```

### 2. JUDGE Trajectory

```bash
# Evaluate and store trajectory
curl -X POST http://localhost:7000/judge \
  -H "Content-Type: application/json" \
  -d '{
    "trajectory_id": "traj-001",
    "task": "Implement OAuth2 flow",
    "output": "Complete OAuth2 with PKCE",
    "success": true,
    "reward": 0.95
  }'
```

**Response:**
```json
{
  "verdict": "excellent",
  "confidence": 0.95,
  "critique": "Outstanding performance with high reward",
  "judgment_time_ms": 35.2
}
```

### 3. DISTILL Knowledge

```bash
# Extract key learnings via LoRA
curl -X POST http://localhost:7000/distill \
  -H "Content-Type: application/json" \
  -d '{
    "patterns": [...],
    "epochs": 5
  }'
```

### 4. CONSOLIDATE Memory

```bash
# Prevent catastrophic forgetting via EWC++
curl -X POST http://localhost:7000/consolidate \
  -H "Content-Type: application/json" \
  -d '{
    "consolidation_type": "ewc"
  }'
```

---

## 📊 Monitoring

### Prometheus Metrics

Key metrics exposed at `/metrics`:

```
# Request metrics
ruvector_requests_total{endpoint="/retrieve"} 1234
ruvector_request_duration_seconds{endpoint="/retrieve"} 0.008

# Pattern metrics
ruvector_patterns_stored_total 5678
ruvector_patterns_retrieved_total 12345

# Intelligence metrics
ruvector_verdict_judgments_total{verdict="excellent"} 234
ruvector_hnsw_search_seconds 0.0005
ruvector_sona_adaptation_seconds 0.00003

# Expert metrics
ruvector_active_experts 12
```

### Grafana Dashboards

Recommended visualizations:
- Request rate and latency (histogram)
- HNSW search time distribution
- Expert activation heatmap
- Pattern storage growth
- Verdict distribution (pie chart)
- Memory consolidation frequency

---

## 🚀 RuVector Workflows

### Spawning Intelligence Agents

```bash
# Initialize coordination
npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 6 --strategy specialized

# Spawn parallel ML agents
Task({
  prompt: "Analyze HNSW index performance and suggest optimizations",
  subagent_type: "performance-engineer",
  description: "HNSW optimization"
})

Task({
  prompt: "Review MoE expert routing patterns and load balancing",
  subagent_type: "ml-developer",
  description: "MoE analysis"
})

Task({
  prompt: "Evaluate pattern retrieval accuracy and false positive rate",
  subagent_type: "data-scientist",
  description: "Pattern analysis"
})

Task({
  prompt: "Design distributed HNSW architecture for horizontal scaling",
  subagent_type: "system-architect",
  description: "Scaling strategy"
})
```

### Common Intelligence Tasks

| Task | Agents | Memory Pattern |
|------|--------|----------------|
| HNSW tuning | performance-engineer, ml-developer | `ruvector-hnsw` |
| MoE optimization | ml-developer, data-scientist | `ruvector-moe` |
| Pattern analysis | data-scientist, reviewer | `ruvector-patterns` |
| Scaling design | system-architect, performance-engineer | `ruvector-scaling` |
| Model upgrade | ml-developer, tester | `ruvector-model` |

---

## 🔐 Security

### Container Security
- Non-root user (UID 1000)
- Read-only filesystem (where applicable)
- No privileged mode
- Resource limits enforced

### Data Security
- Patterns stored in encrypted volumes (if enabled)
- No sensitive data in logs
- API authentication (if configured)

### Best Practices
- Regular dependency updates
- Security scanning with Trivy
- Audit logs for all operations
- Rate limiting on endpoints

---

## 🐛 Troubleshooting

### Common Issues

1. **Port 7000 Already in Use**
   ```bash
   # Change port in .env
   RUVECTOR_PORT=7001
   ```

2. **HNSW Index Not Loading**
   ```bash
   # Check .claude-flow/neural directory
   ls -la .claude-flow/neural/
   # Look for hnsw_index.bin
   ```

3. **High Memory Usage**
   ```bash
   # Reduce cache size
   CACHE_SIZE=5000
   # Reduce HNSW parameters
   HNSW_M=16
   HNSW_EF=200
   ```

4. **Slow Pattern Retrieval**
   ```bash
   # Increase HNSW EF for better recall
   HNSW_EF=800
   # Or reduce K for fewer results
   k=3
   ```

---

## 📚 Resources

### Documentation
- `README.md` - System overview and API reference
- `DEPLOYMENT.md` - Deployment and operations guide
- `requirements.txt` - Python dependencies
- `config/ruvector.yml` - Configuration reference

### Code
- `app/main.py` - FastAPI MCP server
- `app/intelligence.py` - Core intelligence system
- `app/config.py` - Configuration management

### Integration
- Volume mount: `../../.claude-flow/neural:/data/neural`
- Network: `nyra-network`
- AgentDB: `/data/agentdb` volume

---

## 📝 Notes

- Auto-generated by Project Nyra Infrastructure System
- For manual customization, edit this file directly
- Integration with claude-flow.config.json neural section
- Last updated: 2026-01-22

---

**RuVector = SONA + MoE + HNSW + EWC++ + Flash Attention + LoRA**
**Intelligence Pipeline = RETRIEVE → JUDGE → DISTILL → CONSOLIDATE**
