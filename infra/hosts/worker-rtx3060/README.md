# Worker-3060 - GPU Worker Setup

**RTX 3060 (12GB VRAM) - Document Processing & Embeddings**

## Overview

Worker-3060 is a GPU-accelerated worker node in the Project Nyra infrastructure optimized for:
- Document OCR and processing
- Embedding generation (Xenova/transformers)
- Code analysis (CodeLlama 34B)
- Text classification and extraction
- Lightweight inference tasks

## Hardware Specifications

| Component | Specification |
|-----------|---------------|
| GPU | NVIDIA RTX 3060 |
| VRAM | 12GB GDDR6 |
| CUDA Version | 12.4 |
| Primary Model | CodeLlama 34B |
| Secondary Model | Qwen 2 32B |
| Tertiary Model | Gemma 2 27B |

## Quick Start

### 1. Run Setup Script

```powershell
# Run as Administrator
.\setup-worker-3060.ps1
```

This installs:
- Docker Desktop with GPU support
- NVIDIA drivers and CUDA 12.4
- Ollama with 3 models
- Infisical CLI for secrets
- Tailscale VPN
- Cloudflared tunnel
- Health monitoring

### 2. Authenticate Services

```powershell
# Infisical
infisical login

# Tailscale
tailscale up

# Cloudflared (optional)
cloudflared tunnel login
cloudflared tunnel create worker-3060
```

### 3. Pull Secrets and Start Services

```powershell
# Pull environment variables from Infisical
infisical run --env=dev -- docker-compose -f docker-compose.worker-3060.yml up -d

# Or manually with .env file
docker-compose -f docker-compose.worker-3060.yml up -d
```

### 4. Verify Health

```powershell
# Run health check
.\health-check.ps1

# Check Docker services
docker-compose -f docker-compose.worker-3060.yml ps

# View logs
docker-compose -f docker-compose.worker-3060.yml logs -f
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│               Worker-3060 (RTX 3060 12GB)           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Ollama (Port 11434)                         │  │
│  │  - CodeLlama 34B (Primary)                   │  │
│  │  - Qwen 2 32B (Secondary)                    │  │
│  │  - Gemma 2 27B (Tertiary)                    │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  ONNX Runtime (Port 8001-8002)               │  │
│  │  - GPU-accelerated inference                 │  │
│  │  - Model serving                             │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Embedding Service (Port 8080)               │  │
│  │  - Xenova/transformers                       │  │
│  │  - Batch processing                          │  │
│  │  - Semantic embeddings                       │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Health Monitor (Port 9090)                  │  │
│  │  - Service health checks                     │  │
│  │  - Prometheus metrics                        │  │
│  │  - GPU monitoring                            │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Redis Cache (Port 6379)                     │  │
│  │  - Inference caching                         │  │
│  │  - 2GB LRU cache                             │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
          │                              │
          │ Tailscale VPN                │ Cloudflare Tunnel
          ▼                              ▼
   worker-3060.tail-net.ts.net    worker-3060.yourdomain.com
```

## Services

### Ollama (Primary LLM Service)

**Port**: 11434
**URL**: http://localhost:11434
**Models**:
- `codellama:34b` - Code analysis, document structure parsing
- `qwen2:32b` - General text processing, classification
- `gemma2:27b` - Embeddings, lightweight inference

**Usage**:
```bash
# Generate text
curl http://localhost:11434/api/generate -d '{
  "model": "codellama:34b",
  "prompt": "Analyze this mortgage document structure"
}'

# List models
curl http://localhost:11434/api/tags

# Model info
curl http://localhost:11434/api/show -d '{"name": "codellama:34b"}'
```

### ONNX Runtime (GPU Inference)

**Port**: 8001 (HTTP), 8002 (gRPC)
**URL**: http://localhost:8001

**Usage**:
```bash
# Health check
curl http://localhost:8001/v2/health/ready

# Model list
curl http://localhost:8001/v2/models

# Inference
curl -X POST http://localhost:8001/v2/models/{model_name}/infer \
  -H "Content-Type: application/json" \
  -d @input.json
```

### Embedding Service (Xenova)

**Port**: 8080
**URL**: http://localhost:8080
**Model**: Xenova/all-MiniLM-L6-v2

**Usage**:
```bash
# Health check
curl http://localhost:8080/health

# Generate embeddings
curl -X POST http://localhost:8080/embed \
  -H "Content-Type: application/json" \
  -d '{
    "texts": ["mortgage document", "income verification"],
    "batch_size": 32
  }'

# Batch processing
curl -X POST http://localhost:8080/embed/batch \
  -H "Content-Type: application/json" \
  -d '{
    "texts": [...],
    "model": "all-MiniLM-L6-v2"
  }'
```

### Health Monitor

**Port**: 9090
**URL**: http://localhost:9090

**Endpoints**:
- `/health` - Overall health status
- `/metrics` - Prometheus metrics
- `/services` - Service availability
- `/gpu` - GPU utilization

**Usage**:
```bash
# Overall health
curl http://localhost:9090/health

# Prometheus metrics
curl http://localhost:9090/metrics

# Service status
curl http://localhost:9090/services
```

### Redis Cache

**Port**: 6379
**Max Memory**: 2GB (LRU eviction)

**Usage**:
```bash
# Connect
redis-cli -h localhost -p 6379

# Stats
redis-cli info stats

# Memory usage
redis-cli info memory
```

## Model Information

### CodeLlama 34B (Primary)

**Size**: ~19GB
**Context**: 16K tokens
**Use Cases**:
- Code analysis and generation
- Document structure parsing
- OCR post-processing
- Technical document understanding

**Performance**:
- Inference speed: ~15 tokens/sec
- Memory usage: ~11GB VRAM
- Batch size: 1-2

### Qwen 2 32B (Secondary)

**Size**: ~18GB
**Context**: 32K tokens
**Use Cases**:
- Document classification
- Information extraction
- Text summarization
- General NLP tasks

**Performance**:
- Inference speed: ~18 tokens/sec
- Memory usage: ~10GB VRAM
- Batch size: 1-2

### Gemma 2 27B (Tertiary)

**Size**: ~16GB
**Context**: 8K tokens
**Use Cases**:
- Lightweight inference
- Embedding generation
- Quick classification
- Fallback model

**Performance**:
- Inference speed: ~20 tokens/sec
- Memory usage: ~9GB VRAM
- Batch size: 1-2

## Networking

### Tailscale VPN

**Hostname**: `worker-3060.tail-net.ts.net`
**Network**: Private mesh VPN

**Setup**:
```powershell
tailscale up
tailscale status
```

### Cloudflare Tunnel

**Tunnel Name**: worker-3060
**Public URL**: https://worker-3060.yourdomain.com

**Setup**:
```powershell
# Create tunnel
cloudflared tunnel create worker-3060

# Configure DNS
cloudflared tunnel route dns worker-3060 worker-3060.yourdomain.com

# Run tunnel
cloudflared tunnel run worker-3060
```

### Firewall Rules

```powershell
# Allow Ollama
New-NetFirewallRule -DisplayName "Ollama" -Direction Inbound -LocalPort 11434 -Protocol TCP -Action Allow

# Allow ONNX Runtime
New-NetFirewallRule -DisplayName "ONNX Runtime" -Direction Inbound -LocalPort 8001,8002 -Protocol TCP -Action Allow

# Allow Embedding Service
New-NetFirewallRule -DisplayName "Embeddings" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow

# Allow Health Monitor
New-NetFirewallRule -DisplayName "Health Monitor" -Direction Inbound -LocalPort 9090 -Protocol TCP -Action Allow
```

## Monitoring

### Prometheus Metrics

Exposed on port 9090 by health-monitor service.

**Key Metrics**:
- `worker_ollama_requests_total` - Total Ollama requests
- `worker_ollama_latency_seconds` - Request latency
- `worker_gpu_utilization` - GPU usage %
- `worker_gpu_memory_used_bytes` - VRAM usage
- `worker_redis_cache_hits` - Cache hit rate

### Grafana Dashboard

Import dashboard from: `./grafana-dashboard.json`

**Panels**:
- GPU utilization over time
- Model inference latency
- Request rate per model
- Cache hit rate
- Error rate

### Logs

```powershell
# View all service logs
docker-compose -f docker-compose.worker-3060.yml logs -f

# Specific service
docker-compose -f docker-compose.worker-3060.yml logs -f ollama

# GPU monitoring
nvidia-smi -l 1

# Docker stats
docker stats
```

## Maintenance

### Update Models

```bash
# Pull latest model versions
ollama pull codellama:34b
ollama pull qwen2:32b
ollama pull gemma2:27b

# Remove old models
ollama rm codellama:34b-old
```

### Update Services

```powershell
# Pull latest images
docker-compose -f docker-compose.worker-3060.yml pull

# Recreate containers
docker-compose -f docker-compose.worker-3060.yml up -d --force-recreate
```

### Backup

```powershell
# Backup Ollama models
docker volume inspect worker-3060-ollama-data
xcopy "\\wsl$\docker-desktop-data\data\docker\volumes\worker-3060-ollama-data" "C:\Backups\worker-3060\ollama" /E /I

# Backup Redis data
docker exec worker-3060-redis redis-cli BGSAVE
```

### Performance Tuning

**Ollama**:
```powershell
# Increase parallel requests (if memory allows)
$env:OLLAMA_NUM_PARALLEL = "3"

# Adjust max loaded models
$env:OLLAMA_MAX_LOADED_MODELS = "2"
```

**Redis**:
```powershell
# Increase cache size
docker-compose -f docker-compose.worker-3060.yml exec redis \
  redis-cli CONFIG SET maxmemory 4gb
```

## Troubleshooting

### Ollama not starting

```powershell
# Check CUDA installation
nvidia-smi

# Check Ollama logs
docker-compose -f docker-compose.worker-3060.yml logs ollama

# Restart Ollama
docker-compose -f docker-compose.worker-3060.yml restart ollama
```

### GPU not detected

```powershell
# Check NVIDIA driver
nvidia-smi

# Check Docker GPU support
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi

# Update Docker Desktop to latest version
```

### High memory usage

```powershell
# Check VRAM usage
nvidia-smi

# Reduce loaded models
docker-compose -f docker-compose.worker-3060.yml exec ollama \
  curl http://localhost:11434/api/tags

# Unload specific model
# (Ollama will auto-unload after 5 minutes of inactivity)
```

### Slow inference

```powershell
# Check GPU utilization
nvidia-smi

# Check for thermal throttling
nvidia-smi -q -d TEMPERATURE

# Reduce batch size
# Edit docker-compose.worker-3060.yml and set BATCH_SIZE=16
```

## Security

### API Authentication

Add authentication to Ollama (via reverse proxy):

```yaml
# nginx.conf
server {
  listen 11434;
  location / {
    auth_basic "Ollama API";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://localhost:11434;
  }
}
```

### Network Security

```powershell
# Restrict to Tailscale network only
New-NetFirewallRule -DisplayName "Ollama Tailscale" `
  -Direction Inbound -LocalPort 11434 -Protocol TCP `
  -RemoteAddress 100.64.0.0/10 -Action Allow

# Block all other connections
New-NetFirewallRule -DisplayName "Ollama Block" `
  -Direction Inbound -LocalPort 11434 -Protocol TCP `
  -Action Block
```

### Secret Management

All secrets stored in Infisical:

```powershell
# Login to Infisical
infisical login

# View secrets
infisical secrets --env=dev --path=/worker-3060

# Update secret
infisical secrets set WORKER_API_KEY "new-key" --env=dev --path=/worker-3060
```

## Integration with Nyra

### Nexus Router Configuration

Worker-3060 is registered in Nexus Router for automatic load balancing.

**Router Config** (`nexus-router.yml`):
```yaml
workers:
  - name: worker-3060
    url: http://worker-3060.tail-net.ts.net:11434
    type: ollama
    models:
      - codellama:34b
      - qwen2:32b
      - gemma2:27b
    max_concurrent: 2
    priority: medium
    health_check: /api/version
```

### Document Processing Pipeline

```javascript
// Send document to Worker-3060
const response = await fetch('http://worker-3060.tail-net.ts.net:11434/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'codellama:34b',
    prompt: `Extract information from this mortgage document: ${documentText}`,
    stream: false
  })
});
```

### Embedding Generation

```javascript
// Generate embeddings via Worker-3060
const embeddings = await fetch('http://worker-3060.tail-net.ts.net:8080/embed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    texts: documents,
    batch_size: 32
  })
});
```

## Performance Benchmarks

| Task | Model | Tokens/sec | Latency (p95) | Memory |
|------|-------|------------|---------------|--------|
| Code Analysis | CodeLlama 34B | 15 | 3.2s | 11GB |
| Document Classification | Qwen 2 32B | 18 | 2.8s | 10GB |
| Text Generation | Gemma 2 27B | 20 | 2.5s | 9GB |
| Embeddings (batch=32) | Xenova | - | 250ms | 2GB |
| ONNX Inference | Custom | - | 150ms | 3GB |

## Support

**Issues**: https://github.com/your-org/project-nyra/issues
**Docs**: `../../../ToDo/whitepaper-workflow/`
**Contact**: devops@nyra-platform.com

## License

Proprietary - Project Nyra Internal Use Only
