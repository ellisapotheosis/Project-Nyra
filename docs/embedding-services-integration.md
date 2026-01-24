# Embedding Services Integration Guide

Complete guide for integrating ONNX Runtime and Xenova/Transformers embedding services with Project Nyra.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Integration Patterns](#integration-patterns)
6. [Performance Optimization](#performance-optimization)
7. [Troubleshooting](#troubleshooting)

## Architecture Overview

### System Design

```
┌────────────────────────────────────────────────────────────────┐
│                     Orchestrator PC (PC1)                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │            Claude Flow V3 Orchestration                 │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  Embedding Router (claude-flow.config.json)      │   │  │
│  │  │  - Priority: xenova -> onnx (fallback)           │   │  │
│  │  │  - Cache: 10,000 embeddings, 1hr TTL            │   │  │
│  │  └──────────────┬──────────────┬────────────────────┘   │  │
│  └─────────────────┼──────────────┼────────────────────────┘  │
│                    │              │                           │
│         ┌──────────▼──────┐  ┌───▼──────────────┐            │
│         │  Xenova/Tfmrs   │  │  ONNX Runtime    │            │
│         │  (Port 8002)    │  │  (Port 8001)     │            │
│         │  WASM SIMD      │  │  GPU (CUDA 12)   │            │
│         │  384d vectors   │  │  Quantization    │            │
│         └────────┬────────┘  └────────┬─────────┘            │
│                  │                    │                       │
│                  └──────────┬─────────┘                       │
│                             │                                 │
│                    ┌────────▼─────────┐                       │
│                    │     AgentDB      │                       │
│                    │  Vector Storage  │                       │
│                    │  HNSW Indexing   │                       │
│                    │  150x Faster     │                       │
│                    └──────────────────┘                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│             GPU Workers (PC2, PC3, PC4)                        │
├────────────────────────────────────────────────────────────────┤
│  - Handle full LLM inference via Ollama                        │
│  - DeepSeek-R1, Llama, Mistral, CodeLlama models              │
│  - No embedding services (orchestrator handles embeddings)     │
└────────────────────────────────────────────────────────────────┘
```

### Service Responsibilities

| Service | Purpose | Port | GPU Required |
|---------|---------|------|--------------|
| **Xenova/Transformers** | Fast embeddings, multilingual support | 8002 | No (WASM SIMD) |
| **ONNX Runtime** | High-performance inference, custom models | 8001 | Yes (CUDA 12+) |
| **AgentDB** | Vector storage with HNSW indexing | - | No |
| **Claude Flow** | Embedding routing, caching, fallback | 8003 | No |

## Prerequisites

### Hardware Requirements

**Orchestrator PC (PC1)**:
- CPU: 4+ cores (Intel/AMD)
- RAM: 16+ GB
- GPU: NVIDIA with CUDA 12+ support (for ONNX)
  - Recommended: RTX 3060+, 4GB+ VRAM
- Disk: 20+ GB free space
- OS: Linux, Windows with Docker Desktop, macOS (limited GPU support)

### Software Requirements

```bash
# Docker and Docker Compose
docker --version  # >= 24.0
docker-compose --version  # >= 2.20

# NVIDIA Container Toolkit (for ONNX GPU)
nvidia-smi  # Verify CUDA drivers
docker run --rm --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi

# Node.js (for Xenova development/testing)
node --version  # >= 20.0

# Python (for ONNX development/testing)
python3 --version  # >= 3.11
```

## Installation

### Step 1: Navigate to Services Directory

```bash
cd infra/docker/services
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.embeddings.example .env.embeddings

# Edit configuration
nano .env.embeddings
```

Key settings to customize:
```bash
# ONNX Runtime
ONNX_BATCH_SIZE=8          # Higher = more throughput, more VRAM
ONNX_QUANTIZATION=fp16     # fp16 (balanced), int8 (fast), fp32 (quality)

# Xenova/Transformers
XENOVA_MODEL=Xenova/all-MiniLM-L6-v2  # See available models below
XENOVA_BATCH_SIZE=32       # Higher = more throughput

# Logging
LOG_LEVEL=info             # debug, info, warn, error
```

### Step 3: Start Services

```bash
# Start both embedding services
docker-compose -f docker-compose.embeddings.yml up -d

# Verify startup
docker-compose -f docker-compose.embeddings.yml ps

# Check logs
docker-compose -f docker-compose.embeddings.yml logs -f
```

**Expected output:**
```
nyra-onnx-runtime         | INFO: Application startup complete
nyra-xenova-embeddings    | INFO: Xenova embedding service started
nyra-xenova-embeddings    | INFO: Model loaded successfully
```

### Step 4: Verify Health

```bash
# ONNX Runtime
curl http://localhost:8001/health

# Xenova/Transformers
curl http://localhost:8002/health
```

**Success response:**
```json
{
  "status": "healthy",
  "device": "cuda",
  "gpu_available": true,
  "model": "Xenova/all-MiniLM-L6-v2",
  "pipeline_ready": true
}
```

## Configuration

### Claude Flow Integration

Embedding services are automatically integrated via `claude-flow.config.json`:

```json
{
  "embeddings": {
    "enabled": true,
    "provider": "xenova",
    "backends": {
      "onnx": {
        "enabled": true,
        "url": "http://onnx-runtime:8001",
        "batchSize": 8,
        "quantization": "fp16"
      },
      "xenova": {
        "enabled": true,
        "url": "http://xenova-embeddings:8002",
        "model": "Xenova/all-MiniLM-L6-v2",
        "dimensions": 384,
        "batchSize": 32
      }
    },
    "fallback": {
      "enabled": true,
      "order": ["xenova", "onnx"]
    },
    "cache": {
      "enabled": true,
      "ttl": 3600,
      "maxSize": 10000
    }
  }
}
```

### Available Models

#### Xenova/Transformers Models

| Model | Dimensions | Speed | Languages | Use Case |
|-------|------------|-------|-----------|----------|
| `Xenova/all-MiniLM-L6-v2` | 384 | Fast | English | General-purpose |
| `Xenova/multilingual-e5-small` | 384 | Medium | 100+ | Multilingual docs |
| `Xenova/bge-small-en-v1.5` | 384 | Medium | English | High-quality search |

Change model:
```bash
# Edit .env.embeddings
XENOVA_MODEL=Xenova/bge-small-en-v1.5

# Restart service
docker-compose -f docker-compose.embeddings.yml restart xenova-embeddings
```

#### ONNX Custom Models

Place `.onnx` models in: `../../.claude-flow/models/`

Supported formats:
- Standard ONNX (.onnx)
- Quantized models (INT8, FP16)
- Custom embedding models

## Integration Patterns

### Pattern 1: Direct API Usage

#### Xenova/Transformers

```typescript
// TypeScript/JavaScript
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await fetch('http://localhost:8002/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      texts: texts,
      normalize: true
    })
  });

  const data = await response.json();
  return data.embeddings;
}

// Usage
const embeddings = await generateEmbeddings([
  'Mortgage application for $350,000',
  'Borrower credit score: 750',
  'Property value: $500,000'
]);
```

#### Python

```python
import requests

def generate_embeddings(texts: list[str]) -> list[list[float]]:
    response = requests.post('http://localhost:8002/embed', json={
        'texts': texts,
        'normalize': True
    })
    return response.json()['embeddings']

# Usage
embeddings = generate_embeddings([
    'Mortgage application for $350,000',
    'Borrower credit score: 750'
])
```

### Pattern 2: AgentDB Integration

```typescript
import { AgentDB } from '@ruvnet/agentdb';

class MortgageDocumentStore {
  private db: AgentDB;
  private collection: string = 'mortgage-documents';

  constructor() {
    this.db = new AgentDB({
      backend: 'hybrid',
      hnsw: {
        enabled: true,
        efConstruction: 200,
        M: 16
      }
    });
  }

  async indexDocument(text: string, metadata: any): Promise<void> {
    // Generate embedding
    const response = await fetch('http://xenova-embeddings:8002/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts: [text],
        normalize: true
      })
    });

    const { embeddings } = await response.json();

    // Store in AgentDB with HNSW indexing
    await this.db.collection(this.collection).insert({
      vector: embeddings[0],
      metadata: {
        ...metadata,
        indexed_at: Date.now()
      }
    });
  }

  async searchSimilar(query: string, k: number = 5): Promise<any[]> {
    // Generate query embedding
    const response = await fetch('http://xenova-embeddings:8002/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts: [query],
        normalize: true
      })
    });

    const { embeddings } = await response.json();

    // Search with HNSW (150x faster than brute force)
    return await this.db.collection(this.collection).search({
      vector: embeddings[0],
      k: k,
      metric: 'cosine'
    });
  }
}

// Usage
const store = new MortgageDocumentStore();

// Index mortgage documents
await store.indexDocument(
  'Conventional loan application for $350,000 at 6.5% APR',
  {
    borrower_id: 'B12345',
    loan_type: 'conventional',
    amount: 350000,
    rate: 6.5
  }
);

// Search similar applications
const similar = await store.searchSimilar(
  'Looking for conventional loan around $350k',
  5
);
```

### Pattern 3: Claude Flow Automatic Routing

```typescript
// No direct API calls needed - Claude Flow handles routing
import { ClaudeFlow } from '@claude-flow/sdk';

const cf = new ClaudeFlow({
  config: './configs/claude-flow/orchestrator/claude-flow.config.json'
});

// Embeddings are automatically generated and cached
const results = await cf.memory.search({
  query: 'Find mortgage applications with high DTI ratio',
  namespace: 'mortgage-patterns',
  k: 10
});

// Claude Flow:
// 1. Generates embedding using Xenova (primary)
// 2. Falls back to ONNX if Xenova unavailable
// 3. Caches result for 1 hour (10,000 entry cache)
// 4. Searches AgentDB with HNSW indexing
```

## Performance Optimization

### Xenova/Transformers Optimization

#### Batch Processing

```typescript
// DON'T: Process one at a time
for (const text of texts) {
  const embedding = await generateEmbedding(text);  // Slow!
}

// DO: Batch process
const embeddings = await generateEmbeddings(texts);  // Fast!
```

**Performance improvement**: 5-10x faster for batches of 10+

#### Model Selection

| Use Case | Model | Reason |
|----------|-------|--------|
| High throughput | `all-MiniLM-L6-v2` | Fastest, good quality |
| Multilingual | `multilingual-e5-small` | 100+ languages |
| Best quality | `bge-small-en-v1.5` | Highest accuracy |

#### WASM SIMD Verification

```bash
# Verify WASM SIMD is enabled
docker exec nyra-xenova-embeddings node -e "
const { env } = require('@xenova/transformers');
console.log('WASM SIMD:', env.backends.wasm.simd);
"
```

### ONNX Runtime Optimization

#### Quantization Strategy

| Mode | Speed | Quality | VRAM |
|------|-------|---------|------|
| INT8 | Fastest (2x) | 95% | Lowest |
| FP16 | Fast (1.5x) | 99% | Medium |
| FP32 | Baseline | 100% | Highest |

```bash
# Edit .env.embeddings
ONNX_QUANTIZATION=int8  # For maximum speed
ONNX_QUANTIZATION=fp16  # For balanced (recommended)
ONNX_QUANTIZATION=fp32  # For maximum quality
```

#### Batch Size Tuning

```bash
# Find optimal batch size for your GPU
for BATCH in 4 8 16 32; do
  ONNX_BATCH_SIZE=$BATCH docker-compose restart onnx-runtime
  # Run benchmark
  pytest tests/infra/embeddings/test_onnx_service.py::TestONNXPerformance -v
done
```

**Guidelines**:
- RTX 3060 (12GB): Batch size 8-16
- RTX 3090 (24GB): Batch size 16-32
- RTX 5090 (48GB): Batch size 32-64

### Caching Strategy

Claude Flow includes automatic caching:

```json
"cache": {
  "enabled": true,
  "ttl": 3600,        // 1 hour cache
  "maxSize": 10000    // 10,000 embeddings
}
```

**Cache hit rate target**: >80% for repeated queries

## Troubleshooting

### ONNX Runtime Issues

#### GPU Not Detected

```bash
# Check NVIDIA Docker runtime
docker run --rm --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi

# If fails, install NVIDIA Container Toolkit
# Ubuntu/Debian
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

#### Out of Memory Errors

```bash
# Reduce batch size
ONNX_BATCH_SIZE=4 docker-compose restart onnx-runtime

# Use INT8 quantization
ONNX_QUANTIZATION=int8 docker-compose restart onnx-runtime

# Check GPU memory usage
docker exec nyra-onnx-runtime nvidia-smi
```

### Xenova/Transformers Issues

#### Model Download Timeout

```bash
# Xenova downloads models on first startup (60-120 seconds)
# Check download progress
docker logs -f nyra-xenova-embeddings

# Manual pre-download (optional)
docker exec nyra-xenova-embeddings node -e "
const { pipeline } = require('@xenova/transformers');
pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2').then(() =>
  console.log('Model downloaded successfully')
);
"
```

#### Slow Performance

```bash
# Verify WASM SIMD is enabled
docker logs nyra-xenova-embeddings | grep "WASM SIMD"

# Increase batch size
XENOVA_BATCH_SIZE=64 docker-compose restart xenova-embeddings

# Use faster model
XENOVA_MODEL=Xenova/all-MiniLM-L6-v2 docker-compose restart xenova-embeddings
```

### General Issues

#### Services Not Starting

```bash
# Check Docker daemon
sudo systemctl status docker

# Check resource availability
docker system df

# View service logs
docker-compose -f docker-compose.embeddings.yml logs

# Recreate services
docker-compose -f docker-compose.embeddings.yml down
docker-compose -f docker-compose.embeddings.yml up -d --force-recreate
```

#### Network Connectivity Issues

```bash
# Verify networks exist
docker network ls | grep nyra

# Create networks if missing
docker network create nyra-orchestrator
docker network create nyra-core

# Test connectivity
docker exec nyra-xenova-embeddings ping onnx-runtime -c 3
docker exec nyra-onnx-runtime ping xenova-embeddings -c 3
```

## Testing

Run the comprehensive test suite:

```bash
cd tests/infra/embeddings

# Install dependencies
pip install -r requirements.txt

# Run all tests
pytest -v

# Run specific tests
pytest test_xenova_service.py::TestXenovaPerformance -v
pytest test_onnx_service.py::TestONNXServiceHealth -v
```

See [tests/infra/embeddings/README.md](../tests/infra/embeddings/README.md) for detailed testing documentation.

## Best Practices

1. **Use Xenova as primary**: Faster startup, no GPU required, good quality
2. **ONNX for custom models**: Use when you have specialized .onnx models
3. **Batch when possible**: 5-10x performance improvement for batches of 10+
4. **Monitor cache hit rate**: Target >80% for repeated queries
5. **Use appropriate quantization**: FP16 is balanced for most use cases
6. **Pre-download models**: Run services once before production to cache models
7. **Test with real data**: Benchmark with your actual mortgage documents
8. **Monitor resource usage**: Use Prometheus/Grafana for production monitoring

## Next Steps

1. Deploy services to orchestrator PC
2. Integrate with AgentDB vector storage
3. Configure Claude Flow automatic routing
4. Run test suite to verify functionality
5. Monitor performance metrics
6. Optimize based on actual workload

## Support

- **Documentation**: [services/README.md](../infra/docker/services/README.md)
- **Tests**: [tests/infra/embeddings/README.md](../tests/infra/embeddings/README.md)
- **Configuration**: [claude-flow.config.json](../configs/claude-flow/orchestrator/claude-flow.config.json)
- **Issues**: Project Nyra GitHub repository
