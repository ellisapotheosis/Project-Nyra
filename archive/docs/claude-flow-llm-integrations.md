# Claude Flow + Local LLM Integration Architecture

**Document Version**: 1.0
**Created**: 2026-01-13
**Status**: Architecture Design
**Related Documents**:
- `4PC-DEPLOYMENT-GUIDE.md`
- `docs/architecture/n8n-mortgage-drip-workflow-spec.md`
- `bootstrap/gpu-workers/README.md`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Integration Patterns](#integration-patterns)
4. [GPU Worker Configuration](#gpu-worker-configuration)
5. [Service Integration Details](#service-integration-details)
6. [Implementation Guide](#implementation-guide)
7. [Monitoring and Health Checks](#monitoring-and-health-checks)
8. [Appendix](#appendix)

---

## Executive Summary

This document defines the integration architecture for Project Nyra's distributed LLM infrastructure, combining claude-flow orchestration with local GPU-powered LLMs (via Ollama) and cloud fallback providers (via LiteLLM/OpenRouter).

### Key Integration Points

1. **Nexus Router**: Unified gateway for MCP + LLM routing (port 8000)
2. **LiteLLM Proxy**: OpenAI-compatible endpoint with multi-model routing (port 4000)
3. **Ollama**: Local LLM inference on GPU workers (port 11434)
4. **Claude Flow**: MCP orchestration and swarm coordination (port 9000)

### Architecture Principles

- **Single Gateway Pattern**: All LLM calls route through Nexus → LiteLLM → Ollama/OpenRouter
- **Graceful Fallback**: Local Ollama models with automatic OpenRouter fallback
- **Distributed GPU**: 3 GPU workers (PC2/3/4) with different VRAM capacities
- **Mesh Networking**: Tailscale VPN for inter-PC communication
- **Health-First Design**: Comprehensive health checks and monitoring

---

## Architecture Overview

### High-Level Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                     PROJECT NYRA LLM STACK                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐       ┌──────────────┐                      │
│  │  Claude Flow │◄──────┤ Nexus Router │                      │
│  │   (MCP)      │       │  (Gateway)   │                      │
│  │   :9000      │       │    :8000     │                      │
│  └──────────────┘       └──────┬───────┘                      │
│                                 │                               │
│                    ┌────────────┴────────────┐                 │
│                    │                         │                 │
│            ┌───────▼────────┐        ┌──────▼──────┐          │
│            │   Anthropic    │        │  LiteLLM    │          │
│            │  Claude Opus   │        │   Proxy     │          │
│            │  (Direct API)  │        │   :4000     │          │
│            └────────────────┘        └──────┬──────┘          │
│                                              │                  │
│                          ┌───────────────────┼──────────────┐  │
│                          │                   │              │  │
│                   ┌──────▼──────┐    ┌──────▼──────┐  ┌───▼─────┐
│                   │   PC2       │    │   PC3       │  │  PC4    │
│                   │  Ollama     │    │  Ollama     │  │ Ollama  │
│                   │ (RTX 3060)  │    │(RTX 3090Ti) │  │(RTX5090)│
│                   │ :11434      │    │ :11434      │  │ :11434  │
│                   │             │    │             │  │         │
│                   │ codellama   │    │ llama3.1    │  │qwen2.5  │
│                   │ qwen2.5     │    │ deepseek    │  │codellama│
│                   └─────────────┘    └─────────────┘  └─────────┘
│                                                                 │
│                   ┌──────────────────────────┐                 │
│                   │   OpenRouter Fallback    │                 │
│                   │   (Cloud Provider)       │                 │
│                   └──────────────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Network Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    NETWORK LAYERS                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Layer 1: Local LAN (10.0.0.0/24)                           │
│  ┌───────────┬───────────┬───────────┬───────────┐          │
│  │   PC1     │   PC2     │   PC3     │   PC4     │          │
│  │ 10.0.0.1  │ 10.0.0.2  │ 10.0.0.3  │ 10.0.0.4  │          │
│  └───────────┴───────────┴───────────┴───────────┘          │
│                                                               │
│  Layer 2: Docker Bridge (172.28.0.0/16)                     │
│  ┌───────────────────────────────────────────────┐          │
│  │  nyra-network (cross-container communication) │          │
│  └───────────────────────────────────────────────┘          │
│                                                               │
│  Layer 3: Tailscale Mesh VPN (100.x.x.x)                    │
│  ┌──────────────────────────────────────┐                   │
│  │  Zero-config encrypted mesh network  │                   │
│  │  MagicDNS: worker-1.nyra.ts.net      │                   │
│  └──────────────────────────────────────┘                   │
│                                                               │
│  Layer 4: Cloudflare Tunnel                                 │
│  ┌──────────────────────────────────────┐                   │
│  │  Public access via secure tunnels    │                   │
│  │  orchestrator-mini.ratehunter.net     │                   │
│  └──────────────────────────────────────┘                   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Integration Patterns

### Pattern 1: Direct Nexus → Anthropic (Claude Opus)

**Use Case**: High-accuracy tasks, complex reasoning, production workloads

```yaml
# nexus.toml
[llm.providers.anthropic]
api_key = "{{ env.ANTHROPIC_API_KEY }}"
```

**Client Configuration** (Dify, n8n, Activepieces):
```bash
# Anthropic endpoint via Nexus
ANTHROPIC_BASE_URL=http://nexus:8000/llm/anthropic
ANTHROPIC_API_KEY=<your-key>
```

**Pros**:
- Highest quality responses
- Built-in vision and tool use
- No local GPU required

**Cons**:
- API costs per token
- Network latency
- Rate limits

---

### Pattern 2: Nexus → LiteLLM → Ollama (Local GPU)

**Use Case**: Cost-sensitive workflows, high-volume inference, development/testing

```yaml
# nexus.toml
[llm.providers.openai_via_litellm]
base_url = "http://litellm:4000/v1"
api_key = "dummy"
```

```yaml
# litellm/config.yaml (PC2 - RTX 3060 Worker)
model_list:
  # Local Ollama models
  - model_name: codellama-34b
    litellm_params:
      model: ollama/codellama:34b-instruct-q8_0
      api_base: http://worker-rtx3060:11434

  - model_name: qwen2.5-32b
    litellm_params:
      model: ollama/qwen2.5:32b-instruct-q8_0
      api_base: http://worker-rtx3060:11434

router_settings:
  routing_strategy: simple-shuffle
  num_retries: 2
  timeout: 300
```

**Client Configuration**:
```bash
# OpenAI-compatible endpoint via Nexus → LiteLLM
OPENAI_BASE_URL=http://nexus:8000/llm/openai/v1
OPENAI_API_KEY=sk-litellm-master-key
```

**Pros**:
- Zero API costs (electricity only)
- Low latency (<500ms local network)
- Full data privacy
- Unlimited requests

**Cons**:
- Lower quality than Claude Opus
- Limited by GPU VRAM
- Requires GPU maintenance

---

### Pattern 3: Hybrid (Local + Cloud Fallback)

**Use Case**: Production reliability with cost optimization

```yaml
# litellm/config.yaml
model_list:
  # Primary: Local Ollama
  - model_name: codellama-34b
    litellm_params:
      model: ollama/codellama:34b-instruct-q8_0
      api_base: http://worker-rtx3060:11434

  # Fallback: OpenRouter
  - model_name: codellama-fallback
    litellm_params:
      model: openrouter/meta-llama/codellama-34b-instruct
      api_key: ${OPENROUTER_API_KEY}

router_settings:
  routing_strategy: least-loaded  # Try local first
  fallbacks:
    - ["codellama-34b", "codellama-fallback"]
  num_retries: 2
```

**Behavior**:
1. Try local Ollama model
2. If GPU unavailable/overloaded → retry OpenRouter
3. Log all fallback events for cost tracking

---

## GPU Worker Configuration

### PC2: RTX 3060 Worker (12GB VRAM)

**Hostname**: `worker-rtx3060.ratehunter.net` / `10.0.0.2`

**Models**:
- `codellama:34b-instruct-q8_0` (Primary coding model, ~10GB VRAM)
- `qwen2.5:32b-instruct-q8_0` (Secondary model, ~9GB VRAM)

**Ollama Configuration**:
```bash
# /etc/systemd/system/ollama.service.d/environment.conf
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"
Environment="OLLAMA_NUM_PARALLEL=1"           # Single model at a time
Environment="OLLAMA_MAX_LOADED_MODELS=1"      # 12GB VRAM limit
Environment="OLLAMA_FLASH_ATTENTION=1"        # Enable FlashAttention
Environment="CUDA_VISIBLE_DEVICES=0"
```

**Services**:
- Ollama: `http://10.0.0.2:11434`
- LiteLLM: `http://10.0.0.2:4000`
- Health Check: `http://10.0.0.2:8080/health`
- Ruvector Leader: `http://10.0.0.2:6370`

**Bootstrap Script**:
```bash
sudo ./bootstrap/gpu-workers/setup-rtx3060-worker.sh \
  --worker-name rtx3060-worker \
  --tailscale-auth-key $TAILSCALE_AUTH_KEY \
  --openrouter-api-key $OPENROUTER_API_KEY
```

---

### PC3: RTX 3090 Ti Worker (24GB VRAM)

**Hostname**: `worker-rtx3090ti.ratehunter.net` / `10.0.0.3`

**Models**:
- `llama3.1:70b-instruct-q8_0` (Large model, ~20GB VRAM)
- `deepseek-coder:33b-instruct-q8_0` (Coding specialist, ~12GB VRAM)
- `mistral:7b-instruct-v0.2` (Fast inference, ~4GB VRAM)

**Ollama Configuration**:
```bash
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_NUM_PARALLEL=2"           # Can run 2 models
Environment="OLLAMA_MAX_LOADED_MODELS=2"      # 24GB VRAM allows multiple
Environment="OLLAMA_FLASH_ATTENTION=1"
```

**Services**:
- Ollama: `http://10.0.0.3:11434`
- PostgreSQL: `http://10.0.0.3:5432`
- TwentyCRM: `http://10.0.0.3:3000`
- Neo4j: `http://10.0.0.3:7474`
- Ruvector Follower 1: `http://10.0.0.3:6370`

---

### PC4: RTX 5090 Worker (32GB VRAM)

**Hostname**: `worker-rtx5090.ratehunter.net` / `10.0.0.4`

**Models**:
- `qwen2.5-coder:32b-instruct-q8_0` (Primary, ~28GB VRAM)
- `codellama:70b-instruct-q4_0` (Large quantized, ~18GB VRAM)
- `phi-3:medium` (Fast inference, ~7GB VRAM)

**Ollama Configuration**:
```bash
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_NUM_PARALLEL=3"           # Can run 3 models
Environment="OLLAMA_MAX_LOADED_MODELS=3"      # 32GB VRAM = multiple models
Environment="OLLAMA_FLASH_ATTENTION=1"
Environment="OLLAMA_GPU_MEMORY_FRACTION=0.95" # Use 95% of VRAM
```

**Services**:
- Ollama: `http://10.0.0.4:11434`
- n8n: `http://10.0.0.4:5678`
- Activepieces: `http://10.0.0.4:3400`
- Ruvector Follower 2: `http://10.0.0.4:6370`

---

## Service Integration Details

### 1. Dify Integration

**Architecture**: Dify → Nexus → LiteLLM → Ollama

**Configuration** (`infra/docker-compose.dev.yml`):
```yaml
dify-api:
  image: langgenius/dify-api:latest
  environment:
    # Use Nexus as unified gateway
    - OPENAI_API_BASE=http://nexus:8000/llm/openai/v1
    - OPENAI_API_KEY=sk-litellm-master-key

    # Anthropic fallback (direct via Nexus)
    - ANTHROPIC_API_BASE=http://nexus:8000/llm/anthropic
    - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}

    # MCP tools via Nexus
    - MCP_ENDPOINT=http://nexus:8000/mcp
```

**Model Selection in Dify UI**:
- **Fast/Cheap**: `codellama-34b` (local PC2)
- **Balanced**: `qwen2.5-32b` (local PC2/PC4)
- **Highest Quality**: `claude-opus-4-5` (Anthropic direct)

**Knowledge Base RAG**:
```yaml
# Use local embeddings via Qdrant
- VECTOR_STORE=qdrant
- QDRANT_URL=http://qdrant:6333
- EMBEDDING_MODEL=all-MiniLM-L6-v2  # 384-dim, fast
```

---

### 2. n8n Workflow Integration

**Architecture**: n8n → HTTP Request → LiteLLM → Ollama

**n8n Credential Configuration**:

**Option A: OpenAI-Compatible (via LiteLLM)**
```json
{
  "name": "Local Ollama via LiteLLM",
  "type": "openai",
  "data": {
    "apiKey": "sk-litellm-master-key",
    "baseURL": "http://litellm:4000/v1"
  }
}
```

**Option B: Direct Ollama (Custom HTTP)**
```json
{
  "name": "Direct Ollama PC2",
  "type": "httpRequest",
  "data": {
    "url": "http://worker-rtx3060:11434/api/generate",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "model": "codellama:34b-instruct-q8_0",
      "prompt": "{{ $json.prompt }}",
      "stream": false
    }
  }
}
```

**n8n Workflow Node Example**:
```json
{
  "name": "Generate Lead Response",
  "type": "n8n-nodes-base.openAi",
  "parameters": {
    "resource": "text",
    "operation": "completion",
    "model": "codellama-34b",
    "prompt": "=Generate a friendly mortgage follow-up for {{ $json.leadName }}",
    "temperature": 0.7,
    "maxTokens": 150
  },
  "credentials": {
    "openAiApi": "Local Ollama via LiteLLM"
  }
}
```

**Mortgage Drip Campaign Integration**:
- Node 1: Trigger (Webhook from TwentyCRM)
- Node 2: LLM Generate Response (Ollama via LiteLLM)
- Node 3: Compliance Check (local rule engine)
- Node 4: Deliver via Activepieces (SMS/Email)

Reference: `docs/architecture/n8n-mortgage-drip-workflow-spec.md`

---

### 3. Activepieces MCP Integration

**Architecture**: Activepieces → MCP Tool Call → Nexus → LiteLLM

**MCP Tool Registration** (`nexus.toml`):
```toml
[mcp.servers.activepieces]
url = "http://activepieces:3400/mcp"
tools = [
  "send_sms",
  "send_email",
  "make_call",
  "log_activity"
]
```

**Activepieces Flow with LLM**:
```yaml
# Trigger: New lead in TwentyCRM
trigger:
  type: twentycrm_webhook
  event: lead.created

# Step 1: Generate personalized message
steps:
  - name: generate_message
    type: llm_completion
    config:
      provider: nexus
      endpoint: http://nexus:8000/llm/openai/v1
      model: qwen2.5-32b
      prompt: "Create a personalized intro for {{ trigger.lead.name }}"

  # Step 2: Send via SMS
  - name: send_sms
    type: twilio_sms
    config:
      to: "{{ trigger.lead.phone }}"
      body: "{{ steps.generate_message.output }}"
```

**Claude Flow Agent Integration**:
```bash
# Call Activepieces MCP tool from claude-flow agent
mcp__claude-flow__mcp_call \
  --server="activepieces" \
  --tool="send_sms" \
  --params='{"to": "+1234567890", "body": "Hello from claude-flow"}'
```

---

### 4. Claude Flow Swarm Coordination

**Architecture**: Claude Flow uses local Ollama for agent reasoning

**Swarm Memory Manager** (`.claude/agents/v3/swarm-memory-manager.md`):
```yaml
---
name: swarm-memory-manager
type: coordinator
capabilities:
  - distributed_memory_sync
  - crdt_replication
  - namespace_coordination
---

# MCP Tools
mcp__claude-flow__memory_usage --action="store|retrieve"
mcp__claude-flow__swarm_init --topology="hierarchical"
mcp__claude-flow__agent_spawn --type="researcher"
```

**Agent LLM Configuration**:
```bash
# Use local Ollama for agent reasoning (cost-effective)
export CLAUDE_FLOW_LLM_PROVIDER=litellm
export CLAUDE_FLOW_LLM_BASE_URL=http://litellm:4000/v1
export CLAUDE_FLOW_LLM_MODEL=codellama-34b
export CLAUDE_FLOW_LLM_API_KEY=sk-litellm-master-key

# Fallback to Anthropic for critical tasks
export ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
```

**Swarm Initialization with Local LLMs**:
```javascript
// Initialize swarm with local LLM backend
const swarm = await mcp__claude_flow__swarm_init({
  topology: "hierarchical",
  maxAgents: 10,
  llm_config: {
    provider: "litellm",
    base_url: "http://litellm:4000/v1",
    models: {
      reasoning: "codellama-34b",      // Fast local
      planning: "qwen2.5-32b",         // Local PC4
      critical: "claude-opus-4-5"      // Anthropic fallback
    }
  }
});
```

---

## Implementation Guide

### Step 1: Bootstrap GPU Workers

**PC2 (RTX 3060)**:
```bash
# SSH into PC2
ssh admin@10.0.0.2

# Run bootstrap script
cd /path/to/Project-Nyra
sudo ./bootstrap/gpu-workers/setup-rtx3060-worker.sh \
  --worker-name rtx3060-worker \
  --tailscale-auth-key $TAILSCALE_AUTH_KEY \
  --openrouter-api-key $OPENROUTER_API_KEY

# Verify installation
ollama list
systemctl status ollama
systemctl status litellm
curl http://localhost:11434/api/tags
```

**PC3 (RTX 3090 Ti)**:
```bash
ssh admin@10.0.0.3
sudo ./bootstrap/gpu-workers/setup-rtx3090-worker.sh \
  --worker-name rtx3090-worker
```

**PC4 (RTX 5090)**:
```bash
ssh admin@10.0.0.4
sudo ./bootstrap/gpu-workers/setup-rtx5090-worker.sh \
  --worker-name rtx5090-worker
```

---

### Step 2: Configure Nexus Router

**File**: `bootstrap-kit-pc1/configs/nexus/nexus.toml`

```toml
[server]
address = "0.0.0.0:8000"

[mcp]
enabled = true
path = "/mcp"

[llm]
enabled = true

[llm.protocols.openai]
enabled = true
path = "/llm/openai/v1"

[llm.protocols.anthropic]
enabled = true
path = "/llm/anthropic"

# Anthropic direct
[llm.providers.anthropic]
api_key = "{{ env.ANTHROPIC_API_KEY }}"

# LiteLLM proxy (Ollama + OpenRouter)
[llm.providers.openai_via_litellm]
base_url = "http://litellm:4000/v1"
api_key = "sk-litellm-master-key"
```

---

### Step 3: Configure LiteLLM Proxy

**File**: `bootstrap/infrastructure/configs/litellm/config.yaml`

```yaml
model_list:
  # PC2: RTX 3060 (12GB VRAM)
  - model_name: codellama-34b
    litellm_params:
      model: ollama/codellama:34b-instruct-q8_0
      api_base: http://10.0.0.2:11434

  - model_name: qwen2.5-32b-pc2
    litellm_params:
      model: ollama/qwen2.5:32b-instruct-q8_0
      api_base: http://10.0.0.2:11434

  # PC3: RTX 3090 Ti (24GB VRAM)
  - model_name: llama3.1-70b
    litellm_params:
      model: ollama/llama3.1:70b-instruct-q8_0
      api_base: http://10.0.0.3:11434

  - model_name: deepseek-coder-33b
    litellm_params:
      model: ollama/deepseek-coder:33b-instruct-q8_0
      api_base: http://10.0.0.3:11434

  # PC4: RTX 5090 (32GB VRAM)
  - model_name: qwen2.5-coder-32b
    litellm_params:
      model: ollama/qwen2.5-coder:32b-instruct-q8_0
      api_base: http://10.0.0.4:11434

  # OpenRouter Fallbacks
  - model_name: codellama-fallback
    litellm_params:
      model: openrouter/meta-llama/codellama-34b-instruct
      api_key: ${OPENROUTER_API_KEY}

  - model_name: qwen-fallback
    litellm_params:
      model: openrouter/qwen/qwen-2.5-coder-32b-instruct
      api_key: ${OPENROUTER_API_KEY}

router_settings:
  routing_strategy: least-loaded
  fallbacks:
    - ["codellama-34b", "codellama-fallback"]
    - ["qwen2.5-32b-pc2", "qwen-fallback"]
    - ["llama3.1-70b", "openrouter/meta-llama/llama-3.1-70b-instruct"]
  num_retries: 2
  timeout: 300
  retry_after: 10

general_settings:
  master_key: ${LITELLM_MASTER_KEY:-sk-litellm-master-key}
  database_url: postgresql://postgres:postgres@postgres:5432/litellm
  drop_params: true
  max_parallel_requests: 50
```

---

### Step 4: Deploy Services

**PC1 (Orchestrator)**:
```bash
cd Project-Nyra/bootstrap-kit-pc1
cp .env.pc1.example .env.pc1

# Edit .env.pc1 with your keys
nano .env.pc1

# Start services
docker-compose -f docker-compose.pc1.yml up -d

# Verify
docker-compose ps
curl http://localhost:8000/health
```

**Test End-to-End**:
```bash
# Test Nexus → LiteLLM → Ollama
curl -X POST http://localhost:8000/llm/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-litellm-master-key" \
  -d '{
    "model": "codellama-34b",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Test Anthropic direct
curl -X POST http://localhost:8000/llm/anthropic/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_ANTHROPIC_KEY" \
  -d '{
    "model": "claude-opus-4-5",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## Monitoring and Health Checks

### Health Check Endpoints

| Service | Endpoint | Expected Response |
|---------|----------|-------------------|
| Ollama PC2 | `http://10.0.0.2:11434/api/tags` | `{"models": [...]}` |
| Ollama PC3 | `http://10.0.0.3:11434/api/tags` | `{"models": [...]}` |
| Ollama PC4 | `http://10.0.0.4:11434/api/tags` | `{"models": [...]}` |
| LiteLLM | `http://10.0.0.2:4000/health` | `{"status": "healthy"}` |
| Nexus | `http://10.0.0.1:8000/health` | `200 OK` |
| GPU Health PC2 | `http://10.0.0.2:8080/health` | `{"status": "healthy"}` |

### Prometheus Metrics

**File**: `infra/monitoring/prometheus.yml`

```yaml
scrape_configs:
  # Ollama metrics (if available)
  - job_name: 'ollama-pc2'
    static_configs:
      - targets: ['10.0.0.2:11434']

  - job_name: 'ollama-pc3'
    static_configs:
      - targets: ['10.0.0.3:11434']

  - job_name: 'ollama-pc4'
    static_configs:
      - targets: ['10.0.0.4:11434']

  # LiteLLM metrics
  - job_name: 'litellm'
    static_configs:
      - targets: ['10.0.0.2:4000']
    metrics_path: '/metrics'

  # GPU metrics via NVIDIA DCGM Exporter
  - job_name: 'dcgm-pc2'
    static_configs:
      - targets: ['10.0.0.2:9400']
```

### Grafana Dashboard

**GPU Worker Dashboard**:
- GPU Utilization (%)
- VRAM Usage (GB)
- Temperature (°C)
- Requests per Second
- Average Inference Time (ms)
- Model Load Count
- Fallback Rate (%)

---

## Appendix

### A. Model Sizing Guide

| Model | Quantization | VRAM | Inference Speed | Use Case |
|-------|--------------|------|-----------------|----------|
| `codellama:7b` | Q8_0 | 4GB | ~100 tokens/s | Fast coding |
| `codellama:34b` | Q8_0 | 10GB | ~30 tokens/s | Production coding |
| `qwen2.5:32b` | Q8_0 | 9GB | ~35 tokens/s | General purpose |
| `llama3.1:70b` | Q8_0 | 20GB | ~15 tokens/s | High accuracy |
| `deepseek-coder:33b` | Q8_0 | 12GB | ~30 tokens/s | Code completion |

### B. Troubleshooting

**Problem**: Ollama not responding

```bash
# Check service status
systemctl status ollama

# Check logs
journalctl -u ollama -f

# Restart service
systemctl restart ollama

# Test GPU
nvidia-smi
```

**Problem**: LiteLLM routing errors

```bash
# Check LiteLLM logs
docker logs nyra-litellm -f

# Test direct Ollama
curl http://10.0.0.2:11434/api/generate \
  -d '{"model": "codellama:34b-instruct-q8_0", "prompt": "Hello"}'

# Check LiteLLM config
docker exec nyra-litellm cat /app/config.yaml
```

**Problem**: High latency on local LLMs

```bash
# Check GPU utilization
nvidia-smi

# Monitor in real-time
watch -n 1 nvidia-smi

# Check Ollama parallelism
cat /etc/systemd/system/ollama.service.d/environment.conf

# Reduce parallel models if VRAM constrained
Environment="OLLAMA_MAX_LOADED_MODELS=1"
```

### C. Cost Optimization

**Estimated Monthly Costs**:

| Scenario | Cost |
|----------|------|
| 100% Local Ollama | ~$50 (electricity) |
| 50% Local / 50% OpenRouter | ~$150 |
| 100% Anthropic Claude | ~$500-1000 |

**Optimization Strategies**:
1. Use local models for high-volume, low-stakes tasks (lead scoring, message generation)
2. Reserve Anthropic for complex reasoning (compliance decisions, contract analysis)
3. Monitor LiteLLM fallback rate (<10% target)
4. Cache frequent prompts in Qdrant/PostgreSQL

### D. Security Considerations

**Network Security**:
- Ollama listens on `0.0.0.0` for local network access
- Use Tailscale ACLs to restrict which services can access GPU workers
- Firewall rules: block external access to ports 11434, 4000

**API Key Management**:
```bash
# Store in Infisical
infisical secrets set ANTHROPIC_API_KEY sk-ant-xxx
infisical secrets set OPENROUTER_API_KEY sk-or-xxx
infisical secrets set LITELLM_MASTER_KEY sk-litellm-xxx

# Inject via Docker secrets
docker-compose --env-file <(infisical export) up -d
```

**Model Security**:
- Verify Ollama model checksums after download
- Use signed containers for LiteLLM
- Regular security updates via systemd timers

---

## References

- [Ollama Documentation](https://github.com/ollama/ollama)
- [LiteLLM Proxy Guide](https://docs.litellm.ai/docs/proxy/quick_start)
- [Nexus Router MCP Spec](https://github.com/ruvnet/nexus)
- [Claude Flow GitHub](https://github.com/ruvnet/claude-flow)
- Project Nyra: `4PC-DEPLOYMENT-GUIDE.md`
- Project Nyra: `bootstrap/gpu-workers/README.md`

---

**Document Maintenance**:
- Last Updated: 2026-01-13
- Next Review: 2026-02-13
- Owner: Project Nyra Infrastructure Team
