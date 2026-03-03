# RuVector Intelligence System

High-performance neural pattern matching with SONA, MoE, HNSW, EWC++, Flash Attention, and LoRA.

## Architecture

### Components

1. **SONA** (Self-Optimizing Neural Architecture)
   - Adaptation time: <0.05ms
   - Learning rate: 0.001
   - Mode: balanced (fast/balanced/quality)

2. **MoE** (Mixture of Experts)
   - Expert count: 12
   - Top-K routing: 3 experts per query
   - Load balancing: enabled
   - Specialization: adaptive

3. **HNSW** (Hierarchical Navigable Small World)
   - M: 32 (connections per element)
   - EF: 400 (search accuracy)
   - Space: cosine similarity
   - Speedup: 150x-12,500x vs linear scan

4. **EWC++** (Elastic Weight Consolidation)
   - Lambda: 0.5 (regularization strength)
   - Consolidation interval: 100 steps
   - Prevents catastrophic forgetting

5. **Flash Attention**
   - Block size: 64
   - Target speedup: 2.49x-7.47x
   - Memory efficient: true

6. **LoRA** (Low-Rank Adaptation)
   - Rank: 8
   - Alpha: 16
   - Dropout: 0.1

### 4-Step Intelligence Pipeline

```
1. RETRIEVE → 2. JUDGE → 3. DISTILL → 4. CONSOLIDATE
   (HNSW)      (Verdict)     (LoRA)        (EWC++)
```

## API Endpoints

### Health & Monitoring

- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

### Intelligence Pipeline

- `POST /retrieve` - Pattern retrieval (STEP 1)
  ```json
  {
    "query": "authentication patterns",
    "k": 5,
    "min_similarity": 0.7
  }
  ```

- `POST /judge` - Verdict judgment (STEP 2)
  ```json
  {
    "trajectory_id": "traj-123",
    "task": "Implement login",
    "output": "JWT auth implementation",
    "success": true,
    "reward": 0.95
  }
  ```

- `POST /distill` - Knowledge distillation (STEP 3)
  ```json
  {
    "patterns": [...],
    "epochs": 5
  }
  ```

- `POST /consolidate` - Memory consolidation (STEP 4)
  ```json
  {
    "consolidation_type": "ewc"
  }
  ```

### Utilities

- `POST /search` - Direct HNSW search
- `POST /embed` - Generate embeddings

## Configuration

Environment variables (see `docker-compose.ruvector.yml`):

```bash
# Core
RUVECTOR_PORT=7000

# SONA
SONA_ENABLED=true
SONA_ADAPTATION_TIME=0.05

# MoE
MOE_EXPERT_COUNT=12
MOE_TOP_K=3

# HNSW
HNSW_M=32
HNSW_EF=400

# EWC++
EWC_LAMBDA=0.5

# Flash Attention
FLASH_ATTENTION_ENABLED=true

# LoRA
LORA_RANK=8
LORA_ALPHA=16
```

## Usage

### Docker Compose

```bash
# Start RuVector service
docker compose -f docker-compose.ruvector.yml up -d

# View logs
docker compose -f docker-compose.ruvector.yml logs -f ruvector

# Check health
curl http://localhost:7000/health

# View metrics
curl http://localhost:7000/metrics
```

### Integration with Claude Flow

RuVector integrates with Claude Flow via the `.claude-flow/neural/` volume mount:

```yaml
volumes:
  - ../../.claude-flow/neural:/data/neural
```

Patterns are automatically synced between:
- Claude Flow hooks system
- RuVector intelligence system
- AgentDB memory backend

## Performance Metrics

| Component | Metric | Target |
|-----------|--------|--------|
| SONA | Adaptation time | <0.05ms |
| HNSW | Search speedup | 150x-12,500x |
| Flash Attention | Speedup | 2.49x-7.47x |
| Memory | Reduction | 50-75% |

## Development

### Build

```bash
cd infra/docker/services/ruvector
docker build -t nyra/ruvector:latest .
```

### Test

```bash
# Run tests (when implemented)
docker exec nyra-ruvector pytest /app/tests
```

## Monitoring

Prometheus metrics exposed at `/metrics`:

- `ruvector_requests_total` - Total requests by endpoint
- `ruvector_request_duration_seconds` - Request duration histogram
- `ruvector_patterns_stored_total` - Total patterns stored
- `ruvector_patterns_retrieved_total` - Total patterns retrieved
- `ruvector_verdict_judgments_total` - Total verdicts by type
- `ruvector_memory_consolidations_total` - Total consolidations
- `ruvector_active_experts` - Number of active experts
- `ruvector_sona_adaptation_seconds` - SONA adaptation time
- `ruvector_hnsw_search_seconds` - HNSW search time

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   MCP Server (Port 7000)            │
│                      FastAPI                        │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼────┐   ┌────▼────┐   ┌───▼────┐
   │  SONA   │   │   MoE   │   │  HNSW  │
   │ <0.05ms │   │ 12 exp. │   │ 150x   │
   └────┬────┘   └────┬────┘   └───┬────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
   ┌────▼────┐               ┌──────▼─────┐
   │  EWC++  │               │   LoRA     │
   │ Lambda  │               │  Rank 8    │
   └────┬────┘               └──────┬─────┘
        │                           │
        └───────────┬───────────────┘
                    │
              ┌─────▼──────┐
              │  AgentDB   │
              │   Storage  │
              └────────────┘
```

## Security

- Non-root user (UID 1000)
- Read-only filesystem (where possible)
- Resource limits enforced
- Health checks enabled
- Secrets via environment variables

## License

Proprietary - Project Nyra
