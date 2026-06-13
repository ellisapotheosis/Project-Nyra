# Project Nyra Infrastructure Reference

**Last Updated**: 2026-05-19  
**Status**: Architecture defined, validation tooling created

## Overview

Project Nyra uses a distributed 4-node hybrid architecture with split brain (CPU/cloud routing) and split muscle (GPU inference). This document describes the infrastructure topology, deployment patterns, and validation procedures.

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                   Project Nyra Cluster                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │  ORCHESTRATOR (Control Plane)              [LAN]         │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ Nexus Router          (port 7000)                 │ │  │
│  │  │ LiteLLM               (port 8000)                 │ │  │
│  │  │ Prometheus            (port 9090)                 │ │  │
│  │  │ Grafana               (port 3003)                 │ │  │
│  │  │ Loki                  (port 3100)                 │ │  │
│  │  │ Portainer             (port 9000)                 │ │  │
│  │  │ n8n                   (port 5678)                 │ │  │
│  │  │ OpenClaw Gateway      (port 8001)                 │ │  │
│  │  │ Cloudflared Tunnel    (port 7001)                 │ │  │
│  │  │ Syncthing             (port 22000, 21027)         │ │  │
│  │  │ Open WebUI            (port 8080)                 │ │  │
│  │  │ Mem0                  (port 8002)                 │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  Hostname: orchestrator                                 │  │
│  │  Function: Control plane, routing, monitoring, tasks    │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GPU WORKER 1 (vLLM)               [LAN]                │  │
│  │  RTX 5090 (48GB VRAM)                                  │  │
│  │  Models:                                               │  │
│  │  - DeepSeek-R1 236B (complex reasoning)                │  │
│  │  - Qwen 2.5 72B (general purpose)                      │  │
│  │  Endpoints: vLLM (port 8000)                           │  │
│  │  Hostname: worker-rtx5090                              │  │
│  │  Syncthing: syncs ~/project-nyra                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GPU WORKER 2 (vLLM)               [LAN]                │  │
│  │  RTX 3090 Ti (24GB VRAM)                               │  │
│  │  Models:                                               │  │
│  │  - Llama 3.1 70B (reasoning)                           │  │
│  │  - Mistral 123B (vision/text)                          │  │
│  │  Endpoints: vLLM (port 8000)                           │  │
│  │  Hostname: worker-rtx3090ti                            │  │
│  │  Syncthing: syncs ~/project-nyra                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GPU WORKER 3 (Ollama + Embeddings)    [LAN]            │  │
│  │  RTX 3060 (12GB VRAM)                                  │  │
│  │  Models:                                               │  │
│  │  - CodeLlama 34B (code generation)                     │  │
│  │  - Qwen 32B (document processing)                      │  │
│  │  Endpoints: Ollama (port 11434)                        │  │
│  │  Hostname: worker-rtx3060                              │  │
│  │  Syncthing: syncs ~/project-nyra                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    Cloudflare Tunnel
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   ORACLE VPS (Cloud)            [WAN]           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ TwentyCRM             (port 3000)  [System of Record]   │  │
│  │ Gitea                 (port 3001)  [Local Mirror]       │  │
│  │ Activepieces          (port 3002)  [Light Automation]   │  │
│  │ Qdrant                (port 6333)  [Vector DB]          │  │
│  │ FalkorDB              (port 7474)  [Graph DB]           │  │
│  │ Mem0                  (port 8003)  [Persistent Memory]  │  │
│  │ Quote API             (port 8004)  [Calculation]        │  │
│  │ Campaign Engine       (port 8005)  [Workflow Tasks]     │  │
│  │ Cloudflared Tunnel    (port 7002)  [Ingress]           │  │
│  │ Sentry                (external)   [Error Capture]      │  │
│  │ Langfuse              (external)   [LLM Observability]  │  │
│  │                                                          │  │
│  │ Hostname: oracle-vps                                    │  │
│  │ Function: System of record, persistence, auth, APIs     │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Node Specifications

### Orchestrator (LAN Control Plane)

| Property           | Value                                                      |
| ------------------ | ---------------------------------------------------------- |
| **Hostname**       | `orchestrator`                                             |
| **Network**        | Tailscale + LAN (192.168.x.x)                              |
| **Docker Compose** | `infra/docker-compose.yml`                                 |
| **Role**           | Control plane, message routing, monitoring                 |
| **Key Services**   | Nexus Router, LiteLLM, Prometheus, Grafana, n8n, Portainer |
| **SSH Port**       | Standard (22)                                              |

### GPU Workers (LAN Inference)

All workers are in the same LAN as orchestrator and use **Syncthing** to keep `~/project-nyra` synchronized.

#### Worker 1: RTX 5090 (Complex Reasoning)

| Property                | Value                                    |
| ----------------------- | ---------------------------------------- |
| **Hostname**            | `worker-rtx5090`                         |
| **GPU**                 | NVIDIA RTX 5090 (48GB VRAM)              |
| **Inference Framework** | vLLM (OpenAI-compatible API)             |
| **Port**                | 8000                                     |
| **Primary Models**      | DeepSeek-R1 236B, Qwen 2.5 72B           |
| **SSH**                 | `ssh worker-rtx5090`                     |
| **Health Check**        | `curl http://worker-rtx5090:8000/health` |

#### Worker 2: RTX 3090 Ti (General Purpose)

| Property                | Value                                      |
| ----------------------- | ------------------------------------------ |
| **Hostname**            | `worker-rtx3090ti`                         |
| **GPU**                 | NVIDIA RTX 3090 Ti (24GB VRAM)             |
| **Inference Framework** | vLLM (OpenAI-compatible API)               |
| **Port**                | 8000                                       |
| **Primary Models**      | Llama 3.1 70B, Mistral 123B                |
| **SSH**                 | `ssh worker-rtx3090ti`                     |
| **Health Check**        | `curl http://worker-rtx3090ti:8000/health` |

#### Worker 3: RTX 3060 (Document & Code)

| Property                | Value                                       |
| ----------------------- | ------------------------------------------- |
| **Hostname**            | `worker-rtx3060`                            |
| **GPU**                 | NVIDIA RTX 3060 (12GB VRAM)                 |
| **Inference Framework** | Ollama (LLaMA.cpp compatible)               |
| **Port**                | 11434                                       |
| **Primary Models**      | CodeLlama 34B, Qwen 32B                     |
| **SSH**                 | `ssh worker-rtx3060`                        |
| **Health Check**        | `curl http://worker-rtx3060:11434/api/tags` |

### Oracle VPS (Cloud System of Record)

| Property           | Value                                         |
| ------------------ | --------------------------------------------- |
| **Hostname**       | `oracle-vps`                                  |
| **Network**        | WAN (accessed via Cloudflare Tunnel)          |
| **Docker Compose** | Remote docker-compose on Oracle               |
| **Role**           | System of record, auth, persistence           |
| **Key Services**   | TwentyCRM, Gitea, Qdrant, FalkorDB, Quote API |
| **SSH**            | `ssh oracle-vps`                              |

## Network Architecture

### Connectivity Model

```
┌──────────────┐
│ Orchestrator │────────┐
└──────────────┘        │
       ↕                 ├─→ Cloudflare Tunnel ──→ Oracle VPS
   Tailscale            │                             │
       ↕                │                             ↓
   Workers              ├─→ Gitea Mirror    ←────── TwentyCRM
                        │                      (Sync: Daily)
                        │
                        └─→ n8n Internal ←───────── Activepieces
```

### Tailscale Network

- **Network**: 100.64.0.0/10 (internal Tailscale addresses)
- **Members**: orchestrator, worker-rtx5090, worker-rtx3090ti, worker-rtx3060, oracle-vps
- **Purpose**: Secure mesh networking across LAN and WAN
- **Check Status**: `tailscale status`

### Cloudflare Tunnel

- **Tunnel Hosts**: orchestrator → Cloudflare, oracle-vps → Cloudflare
- **Purpose**: Public ingress routing (DNS → tunnel → services)
- **Domains**: `projectnyra.com`, `ratehunter.net`
- **Check Status**: See `docs/DOMAIN_ROUTING_MATRIX.md`

## Service Ports and Health Checks

### Orchestrator Local Ports

| Service              | Port | Protocol | Health Check                              |
| -------------------- | ---- | -------- | ----------------------------------------- |
| **Nexus Router**     | 7000 | HTTP     | `curl -s http://localhost:7000/health`    |
| **LiteLLM**          | 8000 | HTTP     | `curl -s http://localhost:8000/health`    |
| **Prometheus**       | 9090 | HTTP     | `curl -s http://localhost:9090/-/healthy` |
| **Grafana**          | 3003 | HTTP     | `curl -s http://localhost:3003`           |
| **Loki**             | 3100 | HTTP     | `curl -s http://localhost:3100/ready`     |
| **Portainer**        | 9000 | HTTPS    | Browser: `https://localhost:9000`         |
| **n8n**              | 5678 | HTTP     | Browser: `http://localhost:5678`          |
| **OpenClaw Gateway** | 8001 | HTTP     | `curl -s http://localhost:8001/health`    |
| **Open WebUI**       | 8080 | HTTP     | Browser: `http://localhost:8080`          |
| **Mem0**             | 8002 | HTTP     | `curl -s http://localhost:8002/health`    |

### Oracle VPS Remote Ports

| Service             | Port | Protocol | Health Check                                    |
| ------------------- | ---- | -------- | ----------------------------------------------- |
| **TwentyCRM**       | 3000 | HTTP     | `curl -s http://oracle-vps:3000/api/health`     |
| **Gitea**           | 3001 | HTTP     | `curl -s http://oracle-vps:3001/api/v1/version` |
| **Activepieces**    | 3002 | HTTP     | `curl -s http://oracle-vps:3002/api/health`     |
| **Qdrant**          | 6333 | HTTP     | `curl -s http://oracle-vps:6333/health`         |
| **FalkorDB**        | 7474 | HTTP     | `curl -s http://oracle-vps:7474`                |
| **Mem0**            | 8003 | HTTP     | `curl -s http://oracle-vps:8003/health`         |
| **Quote API**       | 8004 | HTTP     | `curl -s http://oracle-vps:8004/health`         |
| **Campaign Engine** | 8005 | HTTP     | `curl -s http://oracle-vps:8005/health`         |

## Deployment Procedures

### Starting the Orchestrator

```bash
# Start all orchestrator services
cd infra
docker compose up -d

# Verify services started
./scripts/health-check.sh
```

### Syncthing Verification

All workers should have `~/project-nyra` in sync via Syncthing:

```bash
# On each worker, verify sync status
ssh worker-rtx5090 'syncthing -paths | grep project-nyra'
ssh worker-rtx3090ti 'syncthing -paths | grep project-nyra'
ssh worker-rtx3060 'syncthing -paths | grep project-nyra'
```

### Worker Model Loading

vLLM and Ollama load models on startup:

```bash
# Check vLLM model status
curl -s http://worker-rtx5090:8000/v1/models | jq '.data'

# Check Ollama model status
curl -s http://worker-rtx3060:11434/api/tags | jq '.models'
```

### Oracle VPS Deployment

Oracle VPS runs independently:

```bash
# SSH to Oracle and check compose
ssh oracle-vps 'cd /opt/nyra && docker compose ps'

# Restart a service
ssh oracle-vps 'cd /opt/nyra && docker compose restart twenty-crm'
```

## Infrastructure Validation

### Quick Health Check

Run the automated health checker:

```bash
# From project root
./infra/scripts/health-check.sh
```

This script validates:

- ✓ Docker daemon and Compose
- ✓ Service health endpoints (HTTP)
- ✓ GPU worker SSH connectivity
- ✓ Oracle VPS connectivity
- ✓ Tailscale network status
- ✓ Git submodules
- ✓ Disk space and resources

### Manual Verification Checklist

**Orchestrator Services:**

```bash
# Verify Nexus Router is routing
docker logs nyra-nexus-router | tail -20

# Check LiteLLM endpoints
curl -s http://localhost:8000/models

# Verify Prometheus scraping
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets | length'
```

**Workers:**

```bash
# Test vLLM on worker-rtx5090
curl -X POST http://worker-rtx5090:8000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "deepseek-r1", "prompt": "Say hello", "max_tokens": 10}'

# Test Ollama on worker-rtx3060
curl -X POST http://worker-rtx3060:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "codeqwen", "prompt": "def hello(): ", "stream": false}'
```

**Oracle VPS:**

```bash
# Check TwentyCRM API
curl -s http://oracle-vps:3000/api/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ getContacts { id name } }"}'

# Check Gitea mirrors
curl -s http://oracle-vps:3001/api/v1/repos
```

## Scaling and Maintenance

### Adding a New GPU Worker

1. **Hardware Setup**: Install RTX card, OS, Docker, Syncthing
2. **Network**: Add hostname to DNS/hosts, enable Tailscale
3. **Syncthing**: Configure folder sync to `~/project-nyra`
4. **Inference Framework**: Install vLLM or Ollama
5. **Models**: Download inference models
6. **Portainer**: Register worker in Portainer fleet
7. **Monitoring**: Add scrape target to Prometheus

### Disaster Recovery

**Orchestrator Failure:**

- Workers continue running locally
- n8n automation pauses (needs orchestrator routing)
- Use Portainer to restart services on workers

**Oracle VPS Failure:**

- Gitea mirror is stale (manual sync required)
- TwentyCRM is unavailable (data loss if no backup)
- Tunnel fails (external users cannot reach system)

**Full Cluster Recovery:**

- See `docs/DISASTER_RECOVERY.md` (TBD)

## Environment Variables

Critical environment variables for cluster operation:

```bash
# GPU Worker Configuration
VLLM_HOST=0.0.0.0
VLLM_PORT=8000
TORCH_HOME=/mnt/models  # Model cache location

# Orchestrator Configuration
NEXUS_ROUTER_LOG_LEVEL=info
LITELLLM_LOG_LEVEL=info
PROMETHEUS_RETENTION=15d

# Oracle VPS Configuration
TWENTY_API_URL=http://localhost:3000
GITEA_MIRROR_SYNC_INTERVAL=24h
QDRANT_API_KEY=${QDRANT_API_KEY}  # From Infisical

# Shared Configuration
TAILSCALE_AUTHKEY=${TAILSCALE_AUTHKEY}  # From Infisical
CLOUDFLARE_TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}  # From Infisical
```

## Observability

### Prometheus Scrape Targets

```yaml
orchestrator:9090        # Prometheus self
nexus-router:7000        # Nexus metrics
litelllm:8000            # LiteLLM metrics
loki:3100                # Loki (logs)
worker-rtx5090:9100      # Node exporter
worker-rtx3090ti:9100    # Node exporter
worker-rtx3060:9100      # Node exporter
```

### Grafana Dashboards

- **System Overview**: CPU, memory, disk across all nodes
- **Model Performance**: vLLM/Ollama inference metrics
- **Service Health**: uptime and error rates
- **Network**: Tailscale and Cloudflare tunnel metrics

### Logs

- **Prometheus**: 15 days retention
- **Loki**: 7 days retention
- **Docker**: Per-service logs in `docker logs <container>`

---

## References

- [Cloudflare Tunnel Discovery](cloudflare-tunnel-discovery-runtime.md)
- [Domain Routing Matrix](DOMAIN_ROUTING_MATRIX.md)
- [Portainer Fleet Setup](PORTAINER_FLEET.md)
- [Service Registry](../infra/service-registry.yaml)

## Support

For infrastructure issues:

1. Run `./infra/scripts/health-check.sh` to diagnose
2. Check specific service logs: `docker logs <service>`
3. SSH to worker for local debugging
4. Consult Grafana dashboards for trends
