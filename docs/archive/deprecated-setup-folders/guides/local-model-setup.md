# Local Model Setup Guide

Complete guide for running local LLMs (Ollama, vLLM) with Project Nyra to reduce API costs and enable offline operation.

## Table of Contents

- [Overview](#overview)
- [Hardware Requirements](#hardware-requirements)
- [Ollama Setup](#ollama-setup)
- [vLLM Setup](#vllm-setup)
- [Model Selection](#model-selection)
- [Integration with Nyra](#integration-with-nyra)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

---

## Overview

Running local LLMs enables:

- **Cost Savings**: No API fees for Claude/GPT usage
- **Privacy**: Data never leaves your infrastructure
- **Offline Operation**: Works without internet
- **Customization**: Fine-tune models for mortgage domain
- **Low Latency**: Local inference faster than API calls

**Trade-offs**:
- Requires GPU hardware ($1,500-$5,000)
- Lower quality than Claude Opus/GPT-4
- More maintenance overhead
- Limited context windows

**Recommended Approach**: Hybrid model
- Use local models for high-volume, simple tasks
- Use cloud APIs (Claude, Gemini) for complex reasoning
- Use Nexus Router for intelligent routing

---

## Hardware Requirements

### Minimum Requirements (Development)

```
CPU: 8-core (Intel i7 / AMD Ryzen 7)
RAM: 32 GB
GPU: NVIDIA RTX 3060 (12 GB VRAM)
Storage: 500 GB NVMe SSD
OS: Ubuntu 22.04 LTS / Windows 11 + WSL2
```

**Models Supported**: 7B-13B parameter models
**Performance**: 10-20 tokens/second

### Recommended Requirements (Production)

```
CPU: 16-core (Intel Xeon / AMD EPYC)
RAM: 64 GB
GPU: NVIDIA RTX 4090 (24 GB VRAM) x2
Storage: 1 TB NVMe SSD (NVMe RAID 0)
OS: Ubuntu 22.04 LTS
```

**Models Supported**: 13B-70B parameter models
**Performance**: 50-100 tokens/second

### Enterprise Setup (3 GPU Workers)

```
Orchestrator Mini PC:
  - CPU: Intel NUC 13 Extreme
  - RAM: 64 GB
  - Storage: 2 TB NVMe
  - GPU: None (orchestration only)

Worker 1 (Primary):
  - GPU: NVIDIA RTX 4090 (24 GB) x2
  - RAM: 128 GB
  - Storage: 2 TB NVMe

Worker 2 (Secondary):
  - GPU: NVIDIA RTX 4080 (16 GB) x2
  - RAM: 64 GB
  - Storage: 1 TB NVMe

Worker 3 (Embeddings):
  - GPU: NVIDIA RTX 3090 (24 GB)
  - RAM: 64 GB
  - Storage: 1 TB NVMe
```

---

## Ollama Setup

### Installation

**Linux / WSL2**:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Docker** (Recommended for Nyra):
```yaml
# Already included in docker-compose.dev.yml
ollama:
  image: ollama/ollama:latest
  container_name: nyra-ollama
  restart: unless-stopped
  ports:
    - "11434:11434"
  volumes:
    - ollama_data:/root/.ollama
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: all
            capabilities: [gpu]
  networks:
    - nyra-network
```

### Download Models

```bash
# Connect to Ollama container
docker exec -it nyra-ollama bash

# Download recommended models
ollama pull llama3:8b-instruct-q8_0    # General purpose
ollama pull mistral:7b-instruct-v0.2    # Fast, good reasoning
ollama pull codellama:13b               # Code generation
ollama pull phi3:medium                 # Small, efficient
ollama pull nomic-embed-text:latest     # Embeddings

# Verify models
ollama list
```

### Test Ollama

```bash
# Test completion
curl http://localhost:11434/api/generate -d '{
  "model": "llama3:8b-instruct-q8_0",
  "prompt": "What is a mortgage?",
  "stream": false
}'

# Test embeddings
curl http://localhost:11434/api/embeddings -d '{
  "model": "nomic-embed-text",
  "prompt": "mortgage loan application"
}'
```

---

## vLLM Setup

vLLM provides faster inference with PagedAttention and continuous batching.

### Installation via Docker

```yaml
vllm:
  image: vllm/vllm-openai:latest
  container_name: nyra-vllm
  restart: unless-stopped
  ports:
    - "8000:8000"
  environment:
    - MODEL_NAME=mistralai/Mistral-7B-Instruct-v0.2
    - TENSOR_PARALLEL_SIZE=1
    - GPU_MEMORY_UTILIZATION=0.9
    - MAX_MODEL_LEN=8192
  volumes:
    - vllm_cache:/root/.cache/huggingface
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
  networks:
    - nyra-network
```

### Start vLLM Server

```bash
docker-compose -f infra/docker-compose.dev.yml up -d vllm

# Verify startup
docker logs nyra-vllm -f
```

### Test vLLM

```bash
# OpenAI-compatible API
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistralai/Mistral-7B-Instruct-v0.2",
    "messages": [
      {"role": "system", "content": "You are a mortgage assistant."},
      {"role": "user", "content": "What is APR?"}
    ],
    "max_tokens": 512,
    "temperature": 0.7
  }'
```

---

## Model Selection

### General Purpose Models

| Model | Size | VRAM | Speed | Quality | Use Case |
|-------|------|------|-------|---------|----------|
| **Llama 3 8B Instruct** | 8B | 10 GB | Fast | High | General chat, summaries |
| **Mistral 7B Instruct v0.2** | 7B | 9 GB | Very Fast | High | Quick responses, classification |
| **Phi-3 Medium** | 14B | 14 GB | Medium | Medium | Resource-constrained |
| **Gemma 7B Instruct** | 7B | 9 GB | Fast | Medium | Alternative to Mistral |

### Specialized Models

| Model | Size | VRAM | Use Case |
|-------|------|------|----------|
| **CodeLlama 13B** | 13B | 16 GB | Code generation, SQL queries |
| **Llama 3 70B Instruct** | 70B | 48 GB | Complex reasoning, compliance |
| **nomic-embed-text** | 138M | 1 GB | Vector embeddings for RAG |
| **all-MiniLM-L6-v2** | 80M | 1 GB | Lightweight embeddings |

### Model Recommendations by Task

**Quote Generation**:
- Primary: Mistral 7B Instruct
- Fallback: Llama 3 8B

**Compliance Validation**:
- Primary: Llama 3 70B (or Claude Opus via API)
- Fallback: Llama 3 8B

**Email Generation**:
- Primary: Mistral 7B Instruct
- Fallback: Phi-3 Medium

**Document Summarization**:
- Primary: Llama 3 8B
- Fallback: Mistral 7B

**Vector Embeddings**:
- Primary: nomic-embed-text
- Fallback: all-MiniLM-L6-v2

---

## Integration with Nyra

### Configure Environment Variables

Add to `.env`:

```bash
# Local LLM Configuration
OLLAMA_BASE_URL=http://ollama:11434
VLLM_BASE_URL=http://vllm:8000
LOCAL_LLM_ENABLED=true

# Model Selection
LOCAL_LLM_GENERAL_MODEL=llama3:8b-instruct-q8_0
LOCAL_LLM_CODE_MODEL=codellama:13b
LOCAL_LLM_EMBED_MODEL=nomic-embed-text

# Nexus Router Configuration (Intelligent Routing)
NEXUS_USE_LOCAL_FOR_SIMPLE=true          # Use local for simple tasks
NEXUS_SIMPLE_TOKEN_THRESHOLD=500         # <500 tokens = local
NEXUS_LOCAL_QUALITY_THRESHOLD=0.85       # Quality score threshold
NEXUS_FALLBACK_TO_CLOUD=true             # Fallback to Claude if local fails
```

### Update Nexus Router Config

Edit `infra/nexus-router/config.yaml`:

```yaml
llm_backends:
  - name: ollama
    type: ollama
    base_url: http://ollama:11434
    models:
      - llama3:8b-instruct-q8_0
      - mistral:7b-instruct-v0.2
    priority: 2
    cost_per_1k_tokens: 0.0
    max_tokens: 8192

  - name: vllm
    type: openai  # vLLM is OpenAI-compatible
    base_url: http://vllm:8000/v1
    api_key: "not-needed"
    models:
      - mistralai/Mistral-7B-Instruct-v0.2
    priority: 2
    cost_per_1k_tokens: 0.0
    max_tokens: 8192

  - name: anthropic
    type: anthropic
    api_key: ${ANTHROPIC_API_KEY}
    models:
      - claude-sonnet-4
      - claude-opus-4
    priority: 1  # Higher priority for complex tasks
    cost_per_1k_tokens: 0.015

routing_rules:
  - condition: "tokens < 500 AND complexity == 'simple'"
    backend: ollama
    model: llama3:8b-instruct-q8_0

  - condition: "task_type == 'code_generation'"
    backend: ollama
    model: codellama:13b

  - condition: "task_type == 'compliance'"
    backend: anthropic
    model: claude-sonnet-4

  - condition: "complexity == 'complex'"
    backend: anthropic
    model: claude-opus-4
```

### Use Local Models in Services

**Quote Engine** (services/quote-engine/app/main.py):

```python
import httpx

async def generate_quote_description(borrower_data: dict) -> str:
    """Generate quote description using local LLM"""

    prompt = f"""Generate a personalized mortgage quote description for:
    - Borrower: {borrower_data['first_name']} {borrower_data['last_name']}
    - Loan Amount: ${borrower_data['loan_amount']:,.0f}
    - Property Value: ${borrower_data['property_value']:,.0f}

    Keep it friendly and professional. 2-3 sentences max.
    """

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://ollama:11434/api/generate",
            json={
                "model": "llama3:8b-instruct-q8_0",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "max_tokens": 200
                }
            },
            timeout=30.0
        )

        result = response.json()
        return result['response']
```

**Mem0 REST API** (services/mem0-rest-api/app/main.py):

Uses Ollama for embeddings (already configured in code):

```python
config = {
    "embedder": {
        "provider": "ollama",
        "config": {
            "model": "nomic-embed-text:latest",
            "ollama_base_url": "http://ollama:11434"
        }
    }
}
```

---

## Performance Optimization

### GPU Memory Management

**Ollama**:
```bash
# Set GPU memory fraction
docker exec nyra-ollama ollama run llama3:8b-instruct-q8_0 \
  --gpu-memory-fraction 0.8
```

**vLLM**:
```bash
# Environment variable
GPU_MEMORY_UTILIZATION=0.9  # Use 90% of VRAM
```

### Quantization

Use quantized models for better performance:

```bash
# Q8_0 = 8-bit quantization (recommended)
ollama pull llama3:8b-instruct-q8_0

# Q4_K_M = 4-bit (faster, lower quality)
ollama pull llama3:8b-instruct-q4_k_m

# Q2_K = 2-bit (very fast, much lower quality)
ollama pull llama3:8b-instruct-q2_k
```

**Quality vs Speed**:
- Q8: 95% original quality, 2x faster
- Q4: 85% original quality, 4x faster
- Q2: 70% original quality, 8x faster

### Multi-GPU Setup

**vLLM with Tensor Parallelism**:

```yaml
environment:
  - TENSOR_PARALLEL_SIZE=2  # Spread model across 2 GPUs
```

**Ollama Multi-GPU**:

Currently, Ollama doesn't support multi-GPU. Use multiple Ollama instances on different GPUs and load balance via Nexus Router.

### Batch Processing

```python
# Batch inference with vLLM
async def batch_generate(prompts: List[str]) -> List[str]:
    async with httpx.AsyncClient() as client:
        tasks = [
            client.post(
                "http://vllm:8000/v1/chat/completions",
                json={"model": "mistralai/Mistral-7B-Instruct-v0.2", "messages": [{"role": "user", "content": p}]}
            )
            for p in prompts
        ]
        responses = await asyncio.gather(*tasks)
        return [r.json()['choices'][0]['message']['content'] for r in responses]
```

---

## Troubleshooting

### Error: `CUDA out of memory`

**Cause**: Model too large for GPU VRAM

**Solutions**:
1. Use smaller quantization (Q4 instead of Q8)
2. Use smaller model (7B instead of 13B)
3. Reduce `gpu-memory-fraction` to 0.7
4. Close other GPU applications

### Error: `Could not load model`

**Cause**: Model not downloaded or corrupted

**Solution**:
```bash
docker exec -it nyra-ollama bash
ollama list
ollama pull <model-name>
```

### Slow Inference Speed

**Causes & Solutions**:

1. **CPU bottleneck**: Upgrade to faster CPU
2. **Disk I/O**: Move models to NVMe SSD
3. **Quantization**: Use Q4/Q2 models
4. **Context length**: Reduce `max_model_len` in vLLM

### Model Quality Issues

**Solutions**:

1. Use higher quantization (Q8 > Q4 > Q2)
2. Use larger model (13B > 7B)
3. Improve prompt engineering
4. Fallback to cloud API for complex tasks

### Multi-PC GPU Network Issues

**Magic Packet Wake-on-LAN**:

```bash
# Wake GPU worker from orchestrator
wakeonlan AA:BB:CC:DD:EE:FF  # Worker MAC address
```

**Cloudflare Tunnel Setup**:

```bash
# On GPU worker
cloudflared tunnel create nyra-gpu-worker-1
cloudflared tunnel route dns nyra-gpu-worker-1 gpu1.nyra.internal
cloudflared tunnel run --token <token>

# On orchestrator
curl http://gpu1.nyra.internal:11434/api/generate -d '{...}'
```

---

## Cost Analysis

### Cloud API Costs (Monthly)

**Scenario**: 10,000 queries/month, avg 1,000 tokens each

- Claude Sonnet 4: 10M tokens × $0.015/1K = $150/month
- GPT-4: 10M tokens × $0.03/1K = $300/month
- Gemini Pro: 10M tokens × $0.002/1K = $20/month

**Annual**: $1,800 - $3,600

### Local Model Costs (One-Time)

- GPU: RTX 4090 × 2 = $3,600
- Workstation: CPU+RAM+Storage = $2,000
- Electricity: ~$30/month = $360/year

**Total First Year**: $5,960
**Break-even**: 16-33 months

**Recommendation**: Start with hybrid approach (local + cloud), expand local capacity as usage grows.

---

## Resources

- [Ollama Documentation](https://ollama.com/docs)
- [vLLM Documentation](https://docs.vllm.ai/)
- [Hugging Face Model Hub](https://huggingface.co/models)
- [LLM Leaderboards](https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard)
- [Model Quantization Guide](https://huggingface.co/docs/transformers/quantization)

---

**Generated**: 2026-01-13
**Maintained by**: Project Nyra Development Team
