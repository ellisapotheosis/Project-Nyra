# 📋 Project Nyra: Complete Port Mapping Reference

## Master Port & Service Registry

This document is the single source of truth for all ports, services, Tailscale IPs, DNS names, and Cloudflare routes across your 4-PC distributed infrastructure.

---

## 🏗️ Architecture Overview

```
ratehunter.net (Cloudflare DNS)
├── orchestrator.ratehunter.net → Tailscale: 100.64.0.1
│   ├── Nexus Router   (6000)
│   ├── Archon         (4000)
│   ├── Infisical      (8080)
│   ├── Gitea          (3001)
│   └── ...
├── worker-3060.ratehunter.net → Tailscale: 100.64.0.11
│   └── Ollama         (11434)
├── worker-3090.ratehunter.net → Tailscale: 100.64.0.12
│   ├── VLLM           (8000)
│   └── LMCache        (6379)
└── worker-5090.ratehunter.net → Tailscale: 100.64.0.10
    ├── VLLM           (8000)
    └── LMCache        (6379)
```

---

## 🖥️ ORCHESTRATOR (Minisforum UH680 - Ryzen 7 6800H)

### Core Tailscale Configuration
| Property | Value |
|----------|-------|
| **Tailscale Name** | orchestrator-mini |
| **Static Tailscale IP** | 100.64.0.1 |
| **Tailscale Hostname** | orchestrator-mini.tail-net.ts.net |
| **External DNS** | orchestrator.ratehunter.net |
| **Host OS** | Windows/Linux |

### Services & Ports

| Service | Container Port | Host Port | Tailscale Access | External (Cloudflare) | Purpose |
|---------|---|---|---|---|---|
| **Nexus Router** | 6000 | 6000 | 100.64.0.1:6000 | nexus-router.ratehunter.net | Unified MCP + LLM gateway |
| **Archon** API | 4000 | 4000 | 100.64.0.1:4000 | archon.ratehunter.net | Knowledge hub & MCP server |
| **Archon** UI | 3737 | 3737 | 100.64.0.1:3737 | ui.archon.ratehunter.net | Web interface |
| **Archon** MCP | 8051 | 8051 | 100.64.0.1:8051 | mcp.archon.ratehunter.net | MCP server interface |
| **Infisical** | 8080 | 8080 | 100.64.0.1:8080 | infisical.ratehunter.net | Secrets management |
| **PostgreSQL** (Archon DB) | 5432 | 5432 | Private | N/A | Database for Archon |
| **PostgreSQL** (Gitea DB) | 5433 | 5433 | Private | N/A | Database for Gitea |
| **Gitea** Web | 3000 | 3001 | 100.64.0.1:3001 | gitea.ratehunter.net | Git server UI |
| **Gitea** SSH | 22 | 2222 | 100.64.0.1:2222 | N/A | Git SSH access |
| **FalkorDB** | 6379 | 6379 | 100.64.0.1:6379 | falkordb.ratehunter.net | Graph database |
| **Redis** | 6380 | 6380 | 100.64.0.1:6380 | redis.ratehunter.net | Cache & broker |
| **Prometheus** | 9090 | 9090 | 100.64.0.1:9090 | prometheus.ratehunter.net | Metrics collection |
| **Grafana** | 3000 | 3000 | 100.64.0.1:3000 | grafana.ratehunter.net | Metrics visualization |
| **Loki** | 3100 | 3100 | 100.64.0.1:3100 | loki.ratehunter.net | Log aggregation |
| **n8n** | 5678 | 5678 | 100.64.0.1:5678 | workflows.ratehunter.net | Automation engine |
| **Dify** | 3001 | 3002 | 100.64.0.1:3002 | dify.ratehunter.net | LLM workflow builder |

### Environment Variables (Infisical Paths)
```
/shared/orchestrator/
├── NEXUS_ROUTER_PORT=6000
├── ARCHON_API_PORT=4000
├── ARCHON_UI_PORT=3737
├── ARCHON_MCP_PORT=8051
├── INFISICAL_PORT=8080
├── GITEA_HTTP_PORT=3001
├── GITEA_SSH_PORT=2222
├── FALKORDB_PORT=6379
├── REDIS_PORT=6380
├── PROMETHEUS_PORT=9090
├── GRAFANA_PORT=3000
├── LOKI_PORT=3100
├── N8N_PORT=5678
└── DIFY_PORT=3002
```

---

## 👷 WORKER-RTX3060 (Alienware M15R7 Laptop - 12GB VRAM)

### Core Tailscale Configuration
| Property | Value |
|----------|-------|
| **Tailscale Name** | worker-rtx3060 |
| **Static Tailscale IP** | 100.64.0.11 |
| **Tailscale Hostname** | worker-rtx3060.tail-net.ts.net |
| **External DNS** | worker-3060.ratehunter.net |
| **Host OS** | Windows |
| **GPU** | RTX 3060 (12GB VRAM) |

### Services & Ports

| Service | Container Port | Host Port | Tailscale Access | Purpose | GPU Memory |
|---------|---|---|---|---|---|
| **Ollama** | 11434 | 11434 | 100.64.0.11:11434 | LLM inference server | Shared 12GB |
| **Node Exporter** | 9100 | 9100 | 100.64.0.11:9100 | System metrics | ~64MB |
| **DCGM Exporter** | 9400 | 9400 | 100.64.0.11:9400 | GPU metrics | ~128MB |

### Recommended Models (12GB VRAM Limit)
```
- llama3.2:3b (quantized) - 2GB
- phi3:mini (quantized) - 1.5GB
- nomic-embed-text - 0.5GB
- qwen2.5:7b-q4_K_M (quantized) - 6GB
- mistral:7b-q4 (quantized) - 6GB
```

### Environment Variables (Infisical Paths)
```
/machines/worker-rtx3060/
├── OLLAMA_HOST=0.0.0.0:11434
├── OLLAMA_NUM_PARALLEL=2
├── OLLAMA_MAX_LOADED_MODELS=3
├── OLLAMA_PRIMARY_MODEL=qwen2.5:7b-q4_K_M
├── OLLAMA_SECONDARY_MODEL=mistral:7b-q4
├── OLLAMA_TERTIARY_MODEL=llama3.2:3b
├── EMBEDDINGS_MODEL=nomic-embed-text
├── WORKER_ID=worker-3060
├── WORKER_TIER=1
├── GPU_TYPE=RTX3060
├── GPU_VRAM_GB=12
├── MAX_CONCURRENT_REQUESTS=2
├── ORCHESTRATOR_API_KEY=<api-key>
└── TAILSCALE_HOSTNAME=worker-rtx3060.tail-net.ts.net
```

---

## 👷 WORKER-RTX3090Ti (Desktop, Intel i7-12700 - 24GB VRAM)

### Core Tailscale Configuration
| Property | Value |
|----------|-------|
| **Tailscale Name** | worker-rtx3090ti |
| **Static Tailscale IP** | 100.64.0.12 |
| **Tailscale Hostname** | worker-rtx3090ti.tail-net.ts.net |
| **External DNS** | worker-3090.ratehunter.net |
| **Host OS** | Windows |
| **GPU** | RTX 3090 Ti (24GB VRAM) |

### Services & Ports

| Service | Container Port | Host Port | Tailscale Access | Purpose | GPU Memory |
|---------|---|---|---|---|---|
| **VLLM** | 8000 | 8000 | 100.64.0.12:8000 | Fast LLM inference | 18GB+ |
| **LMCache** | 6379 | 6379 | 100.64.0.12:6379 | KV-cache storage | 4-5GB |
| **Ollama** (optional) | 11434 | 11434 | 100.64.0.12:11434 | Alternative inference | Varies |
| **Node Exporter** | 9100 | 9100 | 100.64.0.12:9100 | System metrics | ~64MB |
| **DCGM Exporter** | 9400 | 9400 | 100.64.0.12:9400 | GPU metrics | ~128MB |

### Recommended Models (24GB VRAM with LMCache)
```
- Meta-Llama-3.1-70B-Instruct (fp16) - 140GB (requires quantization)
- Meta-Llama-3.1-70B-Q4 (quantized) - 38GB (fits with LMCache)
- Qwen2.5-32B-Instruct (Q4) - 18GB
- Mixtral-8x7B-Instruct-v0.1 (Q4) - 24GB
```

### Environment Variables (Infisical Paths)
```
/machines/worker-rtx3090ti/
├── VLLM_HOST=0.0.0.0:8000
├── VLLM_MODEL=meta-llama/Llama-3.1-70B-Instruct
├── VLLM_TENSOR_PARALLEL=1
├── VLLM_MAX_MODEL_LEN=16384
├── VLLM_GPU_MEMORY_UTILIZATION=0.85
├── LMCACHE_HOST=0.0.0.0:6379
├── LMCACHE_MAX_SIZE=5GB
├── LMCACHE_TTL=3600
├── OLLAMA_CUDA_VISIBLE_DEVICES=0
├── WORKER_ID=worker-3090ti
├── WORKER_TIER=2
├── GPU_TYPE=RTX3090Ti
├── GPU_VRAM_GB=24
├── MAX_CONCURRENT_REQUESTS=4
├── ORCHESTRATOR_API_KEY=<api-key>
└── TAILSCALE_HOSTNAME=worker-rtx3090ti.tail-net.ts.net
```

---

## 👷 WORKER-RTX5090 (Alienware Area-51 Laptop - 32GB VRAM)

### Core Tailscale Configuration
| Property | Value |
|----------|-------|
| **Tailscale Name** | worker-rtx5090 |
| **Static Tailscale IP** | 100.64.0.10 |
| **Tailscale Hostname** | worker-rtx5090.tail-net.ts.net |
| **External DNS** | worker-5090.ratehunter.net |
| **Host OS** | Windows |
| **GPU** | RTX 5090 (32GB VRAM) |

### Services & Ports

| Service | Container Port | Host Port | Tailscale Access | Purpose | GPU Memory |
|---------|---|---|---|---|---|
| **VLLM** | 8000 | 8000 | 100.64.0.10:8000 | Heavy model inference | 24GB+ |
| **LMCache** | 6379 | 6379 | 100.64.0.10:6379 | KV-cache storage | 6-8GB |
| **Ollama** (optional) | 11434 | 11434 | 100.64.0.10:11434 | Alternative inference | Varies |
| **Node Exporter** | 9100 | 9100 | 100.64.0.10:9100 | System metrics | ~64MB |
| **DCGM Exporter** | 9400 | 9400 | 100.64.0.10:9400 | GPU metrics | ~128MB |

### Recommended Models (32GB VRAM with LMCache)
```
- Meta-Llama-3.1-70B-Instruct-Q4 (quantized) - 38GB (needs optimization)
- Meta-Llama-3.1-405B-Instruct-Q2 (ultra-quantized) - 90GB (requires 2x GPU or clever batching)
- Qwen2.5-72B-Instruct (Q4) - 42GB (careful batching)
- Yi-1.5-34B-Chat (Q4) - 20GB
- Mixtral-8x22B-Instruct (Q4) - 88GB (2x GPU or ultra-quant)
```

### Environment Variables (Infisical Paths)
```
/machines/worker-rtx5090/
├── VLLM_HOST=0.0.0.0:8000
├── VLLM_MODEL=meta-llama/Llama-3.1-70B-Instruct-Q4
├── VLLM_TENSOR_PARALLEL=1
├── VLLM_MAX_MODEL_LEN=32768
├── VLLM_GPU_MEMORY_UTILIZATION=0.90
├── VLLM_ENABLE_CHUNKED_PREFILL=true
├── LMCACHE_HOST=0.0.0.0:6379
├── LMCACHE_MAX_SIZE=8GB
├── LMCACHE_TTL=3600
├── OLLAMA_CUDA_VISIBLE_DEVICES=0
├── WORKER_ID=worker-5090
├── WORKER_TIER=3
├── GPU_TYPE=RTX5090
├── GPU_VRAM_GB=32
├── MAX_CONCURRENT_REQUESTS=6
├── ORCHESTRATOR_API_KEY=<api-key>
└── TAILSCALE_HOSTNAME=worker-rtx5090.tail-net.ts.net
```

---

## 🌐 Cloudflare Tunnel Routes & DNS Mapping

### Primary Domain: ratehunter.net
Managed through Cloudflare Zero Trust, all routes point to orchestrator Tailscale IP or worker IPs via tunnel.

| DNS Record | Type | Target | Tunnel Destination | Purpose |
|---|---|---|---|---|
| orchestrator.ratehunter.net | CNAME | Tunnel | 100.64.0.1:12008 (MetaMCP) | Main control plane |
| worker-3060.ratehunter.net | CNAME | Tunnel | 100.64.0.11:11434 (Ollama) | Worker inference |
| worker-3090.ratehunter.net | CNAME | Tunnel | 100.64.0.12:8000 (VLLM) | Worker inference |
| worker-5090.ratehunter.net | CNAME | Tunnel | 100.64.0.10:8000 (VLLM) | Worker inference |
| gitea.ratehunter.net | CNAME | Tunnel | 100.64.0.1:3001 (Gitea) | Git server |
| archon.ratehunter.net | CNAME | Tunnel | 100.64.0.1:4000 (Archon) | Knowledge hub |
| metamcp.ratehunter.net | CNAME | Tunnel | 100.64.0.1:12008 (MetaMCP) | MCP proxy |
| infisical.ratehunter.net | CNAME | Tunnel | 100.64.0.1:8080 (Infisical) | Secrets |
| grafana.ratehunter.net | CNAME | Tunnel | 100.64.0.1:3000 (Grafana) | Metrics UI |

### Tunnel Configuration Template
```json
{
  "tunnel_id": "your-tunnel-id",
  "account_tag": "your-account-id",
  "routes": [
    {
      "pattern": "orchestrator.ratehunter.net",
      "service": "http://100.64.0.1:12008"
    },
    {
      "pattern": "worker-3060.ratehunter.net",
      "service": "http://100.64.0.11:11434"
    },
    {
      "pattern": "worker-3090.ratehunter.net",
      "service": "http://100.64.0.12:8000"
    },
    {
      "pattern": "worker-5090.ratehunter.net",
      "service": "http://100.64.0.10:8000"
    },
    {
      "pattern": "gitea.ratehunter.net",
      "service": "http://100.64.0.1:3001"
    }
  ]
}
```

---

## 🔐 Port Allocation Strategy

### Reserved Ranges
- **3000-3999**: Web UIs (Grafana 3000, Gitea 3000, Dify 3002, Archon 3737)
- **4000-4999**: APIs (Archon 4000)
- **5000-5999**: App services (n8n 5678)
- **6000-6999**: Databases (Qdrant 6333, FalkorDB/Redis 6379-6380)
- **8000-8999**: Inference & APIs (VLLM 8000, Zep 8000, Infisical 8080)
- **9000-9999**: Monitoring (Prometheus 9090, Node Exporter 9100, DCGM 9400)
- **11000-11999**: Ollama (11434)
- **12000-12999**: System services (MetaMCP 12008)

### Adding New Services
1. Choose port from reserved range
2. Add to relevant docker-compose.yml
3. Update PORT-MAPPING-REFERENCE.md (this file)
4. Create Infisical path entry: `/machines/{pc}/SERVICE_PORT`
5. Create Cloudflare route if external access needed
6. Update Tailscale ACL if specific network rules needed

---

## 📊 Summary Table

| PC | Tailscale IP | Primary Service | Container Port | GPU |
|---|---|---|---|---|
| Orchestrator | 100.64.0.1 | MetaMCP | 12008 | CPU only |
| Worker-3060 | 100.64.0.11 | Ollama | 11434 | RTX 3060 (12GB) |
| Worker-3090Ti | 100.64.0.12 | VLLM | 8000 | RTX 3090 Ti (24GB) |
| Worker-5090 | 100.64.0.10 | VLLM | 8000 | RTX 5090 (32GB) |

---

## 🔍 Health Check Endpoints

Use these to verify services are running:

```bash
# Orchestrator health checks
curl http://100.64.0.1:6000/health            # Nexus Router
curl http://100.64.0.1:4000/api/health        # Archon
curl http://100.64.0.1:3001/api/v1/repos      # Gitea

# Worker health checks
curl http://100.64.0.11:11434/api/tags        # Ollama (3060)
curl http://100.64.0.12:8000/v1/models        # VLLM (3090Ti)
curl http://100.64.0.10:8000/v1/models        # VLLM (5090)
```

---

## 💾 Infisical Integration

All port numbers and service secrets are stored in Infisical under these paths:

```
/shared/
├── ports/
│   ├── METAMCP_PORT=12008
│   ├── ARCHON_PORT=4000
│   ├── OLLAMA_PORT=11434
│   ├── VLLM_PORT=8000
│   └── ...

/machines/orchestrator/
├── SERVICE_ENDPOINTS
├── INTERNAL_PORTS
└── SECRETS

/machines/worker-rtx3060/
├── OLLAMA_CONFIG
├── WORKER_AUTH
└── TAILSCALE_INFO
```

**Script to update Infisical** (example):
```bash
infisical secrets set \
  --path /machines/worker-rtx3060 \
  OLLAMA_PORT=11434 \
  WORKER_ID=worker-3060
```

---

## 🚀 Quick Port Lookup

Need to find a port? Use this table:

| Want to access... | Go to... | Port |
|---|---|---|
| Nexus Router | 100.64.0.1 | 6000 |
| Archon API | 100.64.0.1 | 4000 |
| Gitea UI | 100.64.0.1 | 3001 |
| Ollama (3060) | 100.64.0.11 | 11434 |
| VLLM (3090Ti) | 100.64.0.12 | 8000 |
| VLLM (5090) | 100.64.0.10 | 8000 |

---

**Last Updated**: 2026-02-10  
**Version**: 1.0  
**Managed By**: Infisical + Cloudflare Zero Trust
