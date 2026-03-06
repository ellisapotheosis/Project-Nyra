# PC-Specific Environment Configuration Templates

This directory contains environment configuration templates for the 4-PC distributed stack architecture. Each template is tailored to the specific hardware capabilities and role of each PC in the system.

## Overview

The 4-PC stack consists of:

| PC | Role | Hardware | IP Address | Services |
|----|------|----------|------------|----------|
| **PC1** | Orchestrator | Multi-core CPU, 32GB+ RAM | 192.168.1.100 | Databases, MCP servers, monitoring, core applications |
| **PC2** | Light GPU Inference | RTX 3060, 12GB VRAM, 16GB RAM | 192.168.1.101 | Ollama (lightweight models), LiteLLM proxy, GPU monitoring |
| **PC3** | Flagship Heavy Operations | RTX 5090, 32GB VRAM, 48GB RAM | 192.168.1.102 | Ollama (large models), vLLM, fine-tuning, memory service |
| **PC4** | Heavy Inference | RTX 3090, 24GB VRAM, 32GB RAM | 192.168.1.103 | Ollama (large models), vLLM, load balancing, inference |

## Template Files

### 1. `pc1-orchestrator.env.template`

Central orchestrator that runs all core infrastructure services.

**Key Services:**
- PostgreSQL (main database)
- Redis (cache & sessions)
- Neo4j (graph database)
- Qdrant (vector database)
- MongoDB (document storage)
- TwentyCRM (CRM application)
- n8n (workflow automation)
- Dify (LLM application platform)
- Prometheus (metrics)
- Grafana (dashboards)
- Loki (log aggregation)
- Jaeger (distributed tracing)

**MCP Servers (coordination hub):**
- MCP Nexus Router (port 3000)
- LiteLLM Proxy (port 8000)
- Claude Flow CLI (port 3100)
- Ollama MCP Proxy (port 3200)
- Bitwarden MCP (port 3300)
- Git MCP (port 3400)
- Docker MCP (port 3500)

### 2. `pc2-rtx3060.env.template`

Lightweight GPU inference node optimized for smaller models.

**Key Features:**
- Ollama with 12GB VRAM optimization
- Lightweight models: llama3.1:8b, codellama:13b, mistral:7b, deepseek-coder:6.7b
- LiteLLM proxy for model routing
- GPU monitoring and metrics
- Fallback capabilities for load balancing

### 3. `pc3-rtx5090.env.template`

Flagship GPU node for heavy operations, large model serving, and fine-tuning.

**Key Features:**
- Ollama with 32GB VRAM optimization
- Large models: llama3.1:70b, qwen2.5:72b, mixtral:8x22b, codellama:70b
- vLLM for fast inference
- Fine-tuning service with LoRA support
- Memory service for heavy operations
- Distributed processing coordination
- Advanced GPU optimization and monitoring

### 4. `pc4-rtx3090.env.template`

High-performance inference node for large model serving.

**Key Features:**
- Ollama with 24GB VRAM optimization
- Large models: llama3.1:70b, qwen2.5:32b, codellama:34b, mixtral:8x7b
- vLLM for fast inference
- Local load balancing
- Fallback to PC2 and PC3 for high load scenarios
- Advanced health checking and failover

## Setup Instructions

### Step 1: Initialize Each PC

For each PC in the stack, copy the appropriate template and customize it:

```bash
# On PC1 (Orchestrator)
cp pc1-orchestrator.env.template /path/to/project/.env.pc1
# Edit .env.pc1 and replace all "change_me_*" values

# On PC2 (RTX 3060)
cp pc2-rtx3060.env.template /path/to/project/.env.pc2
# Edit .env.pc2 and replace all "change_me_*" values

# On PC3 (RTX 5090)
cp pc3-rtx5090.env.template /path/to/project/.env.pc3
# Edit .env.pc3 and replace all "change_me_*" values

# On PC4 (RTX 3090)
cp pc4-rtx3090.env.template /path/to/project/.env.pc4
# Edit .env.pc4 and replace all "change_me_*" values
```

### Step 2: Configure Required Secrets

Replace these placeholder values in each .env file:

```bash
# Cloudflared tunnel token (get from Cloudflare dashboard)
CLOUDFLARED_TUNNEL_TOKEN=your_tunnel_token_here_change_me

# Database passwords (generate secure passwords)
POSTGRES_PASSWORD=change_me_postgres_password
REDIS_PASSWORD=change_me_redis_password
NEO4J_AUTH=neo4j/change_me_neo4j_password
MONGODB_PASSWORD=change_me_mongodb_password

# API Keys and Secrets (generate using openssl or similar)
API_SECRET_KEY=change_me_api_secret_key
ENCRYPTION_KEY=change_me_encryption_key
HMAC_SECRET=change_me_hmac_secret

# OAuth/OIDC Credentials
OAUTH_CLIENT_SECRET=change_me_oauth_secret

# PC-Specific API Keys
API_KEY_PC2=change_me_pc2_api_key
API_KEY_PC3=change_me_pc3_api_key
API_KEY_PC4=change_me_pc4_api_key

# Tailscale auth keys (get from Tailscale admin panel)
TAILSCALE_AUTHKEY=tskey-auth-XXXXX-XXXXX-change-me
```

### Step 3: Network Configuration

Ensure static IPs are set for each PC:

- **PC1**: 192.168.1.100
- **PC2**: 192.168.1.101
- **PC3**: 192.168.1.102
- **PC4**: 192.168.1.103

Set these via your router's DHCP reservation or directly on each PC:

```bash
# Linux/Mac
sudo ip addr add 192.168.1.XXX/24 dev eth0

# Windows
netsh interface ip set address "Ethernet" static 192.168.1.XXX 255.255.255.0 192.168.1.1
```

### Step 4: Load Environment Files

In your Docker Compose or application startup:

```bash
# Load PC1 orchestrator environment
export $(cat .env.pc1 | xargs)

# Or source specific values
source .env.pc1

# Or pass to docker-compose
docker-compose --env-file .env.pc1 up -d
```

### Step 5: Verify Configuration

After deployment, verify each PC is properly configured:

```bash
# Test database connectivity (PC1)
psql -h 192.168.1.100 -U postgres -d nyra_production -c "SELECT version();"

# Test Ollama on PC2
curl http://192.168.1.101:11434/api/tags

# Test vLLM on PC3 and PC4
curl http://192.168.1.102:8001/v1/models

# Test service discovery
curl http://192.168.1.100:8500/v1/catalog/services
```

## Environment Variables Reference

### Common Variables (All PCs)

```bash
PC_NAME              # Unique identifier for this PC
PC_ROLE              # Role in the system (orchestrator, gpu-inference-light, etc.)
STATIC_IP            # Static IP address for this PC
TAILSCALE_AUTHKEY    # Tailscale authentication key
CLOUDFLARED_TUNNEL_TOKEN  # Cloudflare tunnel token
SERVICE_REGISTRY_URL # Consul registry URL
ORCHESTRATOR_HOST    # IP of PC1 orchestrator
ORCHESTRATOR_PORT    # Port of MCP Nexus Router (3000)
```

### GPU-Specific Variables (PC2, PC3, PC4)

```bash
OLLAMA_HOST               # Ollama server address:port
OLLAMA_MODELS_DIR         # Directory for model storage
OLLAMA_GPU_MEMORY_FRACTION # GPU memory usage (0-1)
OLLAMA_MODELS             # Comma-separated list of models
OLLAMA_OPTIMIZATION_LEVEL # 0-3 optimization level

VLLM_PORT                 # vLLM server port
VLLM_GPU_MEMORY_UTILIZATION # GPU memory usage for vLLM
VLLM_MODELS              # Models to serve via vLLM
VLLM_ENABLE_PREFIX_CACHING # Enable prompt caching
```

### Database Variables (PC1 Only)

```bash
POSTGRES_HOST       # PostgreSQL server
POSTGRES_PORT       # PostgreSQL port (5432)
POSTGRES_PASSWORD   # PostgreSQL password

REDIS_HOST          # Redis server
REDIS_PASSWORD      # Redis password

NEO4J_HOST          # Neo4j server
NEO4J_BOLT_PORT     # Neo4j bolt port (7687)
NEO4J_AUTH          # Neo4j authentication

QDRANT_HOST         # Qdrant server
QDRANT_API_KEY      # Qdrant API key

MONGODB_HOST        # MongoDB server
MONGODB_PASSWORD    # MongoDB password
```

### Application Variables (PC1 Only)

```bash
TWENTYCRM_DATABASE_URL    # TwentyCRM database connection
N8N_DATABASE_URL          # n8n database connection
DIFY_DATABASE_URL         # Dify database connection
```

## Model Allocation by PC

### PC2 (RTX 3060 - 12GB VRAM)
- `llama3.1:8b` - 8 billion parameters
- `codellama:13b` - 13 billion parameters (code-specialized)
- `mistral:7b` - 7 billion parameters (lightweight)
- `deepseek-coder:6.7b` - 6.7 billion parameters (code-optimized)

### PC3 (RTX 5090 - 32GB VRAM) - Flagship
- `llama3.1:70b` - 70 billion parameters
- `qwen2.5:72b` - 72 billion parameters (state-of-the-art)
- `mixtral:8x22b` - Mixture of Experts (high performance)
- `codellama:70b` - 70 billion parameters (code-specialized)

### PC4 (RTX 3090 - 24GB VRAM)
- `llama3.1:70b` - 70 billion parameters
- `qwen2.5:32b` - 32 billion parameters (balanced)
- `codellama:34b` - 34 billion parameters (code-specialized)
- `mixtral:8x7b` - Mixture of Experts (efficient)

## Port Assignments

### PC1 (Orchestrator)
- 3000: MCP Nexus Router
- 3001: TwentyCRM
- 3100: Claude Flow MCP
- 3200: Ollama Proxy MCP
- 3300: Bitwarden MCP
- 3400: Git MCP
- 3500: Docker MCP
- 5001: Dify
- 5678: n8n
- 6331-6334: Qdrant
- 6831: Jaeger Agent
- 7474: Neo4j HTTP
- 7687: Neo4j Bolt
- 8000: LiteLLM Proxy
- 8500: Consul HTTP
- 9090: Prometheus
- 9445-9447: GPU Exporters
- 16686: Jaeger Query
- 27017: MongoDB
- 6379: Redis
- 5432: PostgreSQL
- 3100: Loki
- 3000: Grafana

### PC2 (RTX 3060)
- 8000: LiteLLM Proxy
- 8501: Consul Client
- 9445: GPU Exporter
- 11434: Ollama

### PC3 (RTX 5090)
- 8000: LiteLLM Proxy
- 8001: vLLM
- 8002: Fine-tuning Service
- 8080: Memory Service
- 8502: Consul Client
- 9446: GPU Exporter
- 6001: Profiling
- 6006: Tensorboard
- 11434: Ollama

### PC4 (RTX 3090)
- 8000: LiteLLM Proxy
- 8001: vLLM
- 8003: Local Load Balancer
- 8503: Consul Client
- 9447: GPU Exporter
- 6002: Profiling
- 11434: Ollama

## Troubleshooting

### Service Discovery Issues

If services can't discover each other:

```bash
# Check Consul status
curl http://192.168.1.100:8500/v1/status/leader

# List registered services
curl http://192.168.1.100:8500/v1/catalog/services

# Check PC2 registration
curl http://192.168.1.100:8500/v1/catalog/node/pc2-rtx3060
```

### GPU Memory Issues

If models fail to load due to memory:

1. Reduce `OLLAMA_MAX_LOADED_MODELS` on PC2
2. Enable quantization: `ENABLE_QUANTIZATION=true`
3. Use Q4_K_M format: `QUANTIZATION_FORMAT=Q4_K_M`
4. Increase swap space on PC2 and PC4
5. Distribute models: move 70b models from PC2 to PC3/PC4

### Network Connectivity

If PCs can't communicate:

```bash
# Test connectivity from PC2 to PC1
ping 192.168.1.100

# Test service ports
nc -zv 192.168.1.100 3000
nc -zv 192.168.1.101 11434
```

### Model Loading Failures

If models fail to download or load:

1. Check disk space: `df -h /data/ollama`
2. Check network: `curl https://ollama.ai/api/tags`
3. Increase timeout: `OLLAMA_LOAD_TIMEOUT=600`
4. Check GPU: `nvidia-smi`

## Security Best Practices

1. **Change all default passwords** before deployment
2. **Generate strong API keys** using: `openssl rand -base64 32`
3. **Use Tailscale** for encrypted P2P networking
4. **Enable TLS** on all services: `SSL_ENABLED=true`
5. **Restrict firewall rules** to only needed ports
6. **Use Infisical** or similar to manage secrets in production
7. **Rotate credentials** regularly
8. **Monitor logs** for suspicious activity
9. **Keep models and Docker images updated**
10. **Use network segmentation** if possible

## Performance Optimization

### For PC2 (RTX 3060)
- Keep only 2 models loaded at a time
- Use smaller quantized models (Q4_K_M)
- Enable aggressive memory cleanup

### For PC3 (RTX 5090)
- Keep 3 models loaded for flexibility
- Use vLLM for fast serving
- Enable batching and prefetching
- Use fine-tuning for model customization

### For PC4 (RTX 3090)
- Keep 2-3 models loaded
- Enable local load balancing
- Use speculative decoding for faster inference
- Configure fallback to PC2 and PC3 for overflow

## Monitoring and Logging

### Check Logs

```bash
# PC1 orchestrator logs
docker logs -f <container_name>

# PC2, PC3, PC4 GPU monitoring
nvidia-smi -l 1  # Update every second

# Check Prometheus metrics
curl http://192.168.1.100:9090/api/v1/query?query=gpu_memory_used_percent

# View Grafana dashboards
http://192.168.1.100:3000
```

### Key Metrics to Monitor

- GPU utilization and memory usage
- Model loading time
- Inference latency per model
- Queue depth and request throughput
- Temperature and power consumption
- Database query performance
- Cache hit rates

## Support and Updates

For issues or updates related to these templates:

1. Check the main project README at `/infra/README.md`
2. Review environment variable reference at `/infra/ENV-VARIABLES-REFERENCE.md`
3. Check CLAUDE.md for Claude Flow configuration
4. Review Docker Compose files in `/infra/docker/`

---

**Last Updated**: 2026-01-22
**Template Version**: 1.0
