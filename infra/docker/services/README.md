# Embedding Services - ONNX Runtime & Xenova/Transformers

Local inference acceleration and embedding generation services for Project Nyra orchestrator PC.

## Overview

Two complementary services for optimal embedding generation:

1. **ONNX Runtime** (Port 8001) - GPU-accelerated model inference
   - CUDA 12+ with NVIDIA GPU support
   - Model quantization (INT8, FP16, FP32)
   - Dynamic batching for throughput
   - Shared model cache with Claude Flow

2. **Xenova/Transformers** (Port 8002) - WASM SIMD embeddings
   - JavaScript/TypeScript native embeddings
   - WASM SIMD acceleration (2-3x speedup)
   - No GPU required
   - Multiple pre-configured models

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Orchestrator PC (PC1)                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │  ONNX Runtime    │      │     Xenova       │   │
│  │  (GPU-based)     │      │  (WASM SIMD)     │   │
│  │   Port 8001      │      │   Port 8002      │   │
│  └────────┬─────────┘      └────────┬─────────┘   │
│           │                         │             │
│           └─────────┬───────────────┘             │
│                     │                             │
│            ┌────────▼────────┐                    │
│            │    AgentDB      │                    │
│            │ Vector Storage  │                    │
│            └─────────────────┘                    │
│                                                    │
└────────────────────────────────────────────────────┘

GPU Workers (PC2, PC3, PC4)
- Handle full LLM inference via Ollama
- No embedding services needed
```

## Quick Start

### 1. Configuration

```bash
# Copy environment template
cp .env.embeddings.example .env.embeddings

# Edit configuration
nano .env.embeddings
```

Key settings:
- `ONNX_QUANTIZATION`: fp16 (recommended), int8 (faster), fp32 (highest quality)
- `XENOVA_MODEL`: Choose embedding model
- `ONNX_BATCH_SIZE`: 8 (default), increase for throughput
- `XENOVA_BATCH_SIZE`: 32 (default)

### 2. Start Services

```bash
# Start both services
docker-compose -f docker-compose.embeddings.yml up -d

# Check status
docker-compose -f docker-compose.embeddings.yml ps

# View logs
docker-compose -f docker-compose.embeddings.yml logs -f
```

### 3. Verify Health

```bash
# ONNX Runtime health
curl http://localhost:8001/health

# Xenova health
curl http://localhost:8002/health
```

Expected responses:
```json
// ONNX
{
  "status": "healthy",
  "device": "cuda",
  "providers": ["CUDAExecutionProvider", "CPUExecutionProvider"],
  "gpu_available": true
}

// Xenova
{
  "status": "healthy",
  "model": "Xenova/all-MiniLM-L6-v2",
  "pipeline_ready": true,
  "wasm_simd": true
}
```

## Usage Examples

### ONNX Runtime Inference

```bash
# List available models
curl http://localhost:8001/models

# Run inference
curl -X POST http://localhost:8001/infer \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "my-model",
    "inputs": {
      "input": [[1.0, 2.0, 3.0]]
    },
    "quantization": "fp16"
  }'

# Unload model from memory
curl -X DELETE http://localhost:8001/models/my-model
```

### Xenova Embeddings

```bash
# Generate single embedding
curl -X POST http://localhost:8002/embed \
  -H "Content-Type: application/json" \
  -d '{
    "texts": ["Hello, world!"],
    "normalize": true
  }'

# Batch embeddings
curl -X POST http://localhost:8002/embed \
  -H "Content-Type: application/json" \
  -d '{
    "texts": [
      "First document",
      "Second document",
      "Third document"
    ],
    "normalize": true
  }'

# List available models
curl http://localhost:8002/models
```

### Integration with Claude Flow

```javascript
// claude-flow.config.json already configured
const config = require('./configs/claude-flow/orchestrator/claude-flow.config.json');

// Embeddings are auto-routed based on config
// Priority: xenova -> onnx (fallback)
```

### Integration with AgentDB

```typescript
import { AgentDB } from '@ruvnet/agentdb';

// Generate embedding with Xenova
const response = await fetch('http://localhost:8002/embed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    texts: ['Mortgage application for $350,000'],
    normalize: true
  })
});

const { embeddings } = await response.json();

// Store in AgentDB
const db = new AgentDB();
await db.collection('mortgage-docs').insert({
  vector: embeddings[0],
  metadata: {
    type: 'application',
    amount: 350000,
    timestamp: Date.now()
  }
});

// Search similar documents
const results = await db.collection('mortgage-docs').search({
  vector: embeddings[0],
  k: 5,
  metric: 'cosine'
});
```

## Available Models

### Xenova/Transformers

| Model | Dimensions | Speed | Use Case |
|-------|------------|-------|----------|
| `all-MiniLM-L6-v2` | 384 | Fast | General-purpose semantic search |
| `multilingual-e5-small` | 384 | Medium | Multilingual embeddings (100+ languages) |
| `bge-small-en-v1.5` | 384 | Medium | High-quality English embeddings |

Change model:
```bash
# Edit .env.embeddings
XENOVA_MODEL=Xenova/bge-small-en-v1.5

# Restart service
docker-compose -f docker-compose.embeddings.yml restart xenova-embeddings
```

### ONNX Runtime

ONNX accepts any `.onnx` format model. Place models in:
```
../../.claude-flow/models/your-model.onnx
```

Models are shared with Claude Flow for efficient caching.

## Performance Benchmarks

### ONNX Runtime (RTX 5090)

| Operation | Latency | Throughput |
|-----------|---------|------------|
| Single inference (FP16) | < 100ms | 10 req/s |
| Batch-8 inference (FP16) | < 200ms | 40 req/s |
| Single inference (INT8) | < 50ms | 20 req/s |

### Xenova/Transformers (WASM SIMD)

| Operation | Latency | Throughput |
|-----------|---------|------------|
| Single embedding | < 500ms | 2 req/s |
| Batch-10 embeddings | < 2000ms | 5 req/s |
| Batch-50 embeddings | < 5000ms | 10 req/s |

## Resource Requirements

### ONNX Runtime

- **CPU**: 2-4 cores
- **Memory**: 4-8 GB
- **GPU**: NVIDIA GPU with CUDA 12+ (required)
- **VRAM**: 4-10 GB depending on models
- **Disk**: 10 GB for model cache

### Xenova/Transformers

- **CPU**: 1-2 cores
- **Memory**: 2-4 GB
- **GPU**: Not required (WASM SIMD)
- **Disk**: 2 GB for model cache

## Monitoring

### Health Checks

Services include automatic health checks:
- **ONNX**: Every 30s, 60s start period
- **Xenova**: Every 30s, 90s start period (model download)

### Logs

```bash
# Real-time logs
docker logs -f nyra-onnx-runtime
docker logs -f nyra-xenova-embeddings

# Last 100 lines
docker logs --tail 100 nyra-onnx-runtime
```

### Metrics

Both services expose metrics compatible with Prometheus:
- Request latency
- Throughput (requests/second)
- Error rates
- Model cache hit rates
- Memory usage

Add to Prometheus scrape config:
```yaml
scrape_configs:
  - job_name: 'onnx-runtime'
    static_configs:
      - targets: ['onnx-runtime:8001']

  - job_name: 'xenova-embeddings'
    static_configs:
      - targets: ['xenova-embeddings:8002']
```

## Troubleshooting

### ONNX Runtime

**GPU not detected:**
```bash
# Check NVIDIA Docker runtime
docker run --rm --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi

# Verify GPU access in container
docker exec nyra-onnx-runtime nvidia-smi
```

**Model not found:**
```bash
# Check model cache
ls -la ../../.claude-flow/models/

# Copy model to cache
cp /path/to/model.onnx ../../.claude-flow/models/
```

**Performance issues:**
- Reduce batch size: `ONNX_BATCH_SIZE=4`
- Use INT8 quantization: `ONNX_QUANTIZATION=int8`
- Check GPU utilization: `nvidia-smi dmon`

### Xenova/Transformers

**Model download timeout:**
```bash
# First startup may take 90-120 seconds
# Check download progress
docker logs -f nyra-xenova-embeddings

# Manual model download (if needed)
docker exec nyra-xenova-embeddings \
  node -e "require('@xenova/transformers').pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')"
```

**Memory issues:**
- Reduce batch size: `XENOVA_BATCH_SIZE=16`
- Use smaller model: `XENOVA_MODEL=Xenova/all-MiniLM-L6-v2`

**WASM SIMD not working:**
```bash
# Check Node.js version (requires 20+)
docker exec nyra-xenova-embeddings node --version

# Verify WASM support
docker exec nyra-xenova-embeddings \
  node -e "console.log(WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0])))"
```

## Testing

Comprehensive test suite available:

```bash
cd ../../../tests/infra/embeddings

# Install dependencies
pip install -r requirements.txt

# Run all tests
pytest -v

# Run specific service tests
pytest test_onnx_service.py -v
pytest test_xenova_service.py -v
```

See [tests/infra/embeddings/README.md](../../../tests/infra/embeddings/README.md) for details.

## Security

### Best Practices

1. **Network isolation**: Services run on `nyra-orchestrator` network only
2. **No external exposure**: Ports 8001/8002 not publicly accessible
3. **Model validation**: Verify model checksums before loading
4. **Resource limits**: CPU/memory limits enforced via Docker

### Sensitive Data

- Models may contain proprietary information
- Embeddings can leak semantic information
- Use encryption for model cache if required:

```bash
# Encrypt model cache volume
docker volume create --driver local \
  --opt type=tmpfs \
  --opt device=tmpfs \
  --opt o=size=10g,encrypted \
  xenova-models-secure
```

## Maintenance

### Updating Services

```bash
# Pull latest images
docker-compose -f docker-compose.embeddings.yml pull

# Restart with new images
docker-compose -f docker-compose.embeddings.yml up -d
```

### Clearing Cache

```bash
# Stop services
docker-compose -f docker-compose.embeddings.yml down

# Remove cache volumes
docker volume rm infra_onnx-cache
docker volume rm infra_xenova-cache

# Restart services (will re-download models)
docker-compose -f docker-compose.embeddings.yml up -d
```

### Backup Models

```bash
# Backup ONNX models
tar -czf onnx-models-backup.tar.gz ../../.claude-flow/models/

# Backup Xenova cache
docker run --rm \
  -v infra_xenova-models:/source:ro \
  -v $(pwd):/backup \
  alpine tar -czf /backup/xenova-models-backup.tar.gz -C /source .
```

## Integration with Nyra Services

### LendingTree Rate Comparison

```typescript
// Generate embeddings for rate comparison
const rateDescriptions = lenders.map(l =>
  `${l.name} offers ${l.rate}% APR for ${l.loanType}`
);

const embeddings = await fetch('http://xenova-embeddings:8002/embed', {
  method: 'POST',
  body: JSON.stringify({ texts: rateDescriptions, normalize: true })
}).then(r => r.json());

// Find most similar rates to user preference
const userPreference = "Best 30-year fixed rate under 6%";
const userEmbedding = await generateEmbedding(userPreference);

const similarities = embeddings.embeddings.map(emb =>
  cosineSimilarity(userEmbedding, emb)
);
```

### Document Processing

```typescript
// Process mortgage documents
const documents = await extractTextFromPDFs(borrower.documents);

const embeddings = await fetch('http://xenova-embeddings:8002/embed', {
  method: 'POST',
  body: JSON.stringify({ texts: documents, normalize: true })
}).then(r => r.json());

// Store in AgentDB for semantic search
await agentdb.bulkInsert('mortgage-docs', embeddings.embeddings, {
  borrowerId: borrower.id,
  documentTypes: ['paystub', 'w2', 'bank_statement']
});
```

## Support

- **Documentation**: This README and test suite documentation
- **Logs**: Check Docker logs for detailed error messages
- **Issues**: Report issues in Project Nyra repository
- **Performance**: Monitor with Prometheus/Grafana dashboards

## References

- [ONNX Runtime Documentation](https://onnxruntime.ai/docs/)
- [Xenova/Transformers Documentation](https://huggingface.co/docs/transformers.js)
- [AgentDB Integration Guide](../../../services/ruvector-search/CLAUDE.md)
- [Claude Flow V3 Configuration](../../../CLAUDE.md)
