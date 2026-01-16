# Worker RTX 5090 - High-Performance Development Laptop

Large model inference, neural training, and heavy compute tasks.

## Hardware Specifications

- **GPU**: NVIDIA RTX 5090 24GB
- **RAM**: 64GB DDR5
- **Storage**: 2TB+ NVMe SSD
- **Network**: 10.0.0.2 (Static IP recommended)
- **Role**: High-Performance AI/ML Worker

## Services Deployed

### Core Services
- **Claude Flow Worker** (port 3012) - Worker node agent
- **Ollama** (port 11435) - Local LLM inference (RTX 5090 optimized)
- **vLLM** (port 8001) - High-performance LLM inference server
- **llama.cpp** (port 8002) - Efficient LLM inference
- **Open WebUI** (port 3003) - Universal LLM interface

### Image Generation
- **Automatic1111** (port 7860) - Stable Diffusion WebUI
- **ComfyUI** (port 8188) - Advanced SD workflows
- **SwarmUI** (port 7801) - Modern SD interface

### Development
- **Jupyter Lab** (port 8889) - GPU-accelerated notebooks

### Infrastructure
- **Redis** (port 6381) - High-performance caching

### Monitoring
- **Node Exporter** (port 9101) - System metrics
- **NVIDIA GPU Exporter** (port 9401) - GPU metrics

## Prerequisites

1. Docker Engine 24.0+ with Compose V2
2. NVIDIA Container Toolkit
3. NVIDIA Driver 560+ (for RTX 5090)
4. Git
5. Network connectivity to orchestrator (10.0.0.1)
6. Sufficient disk space (minimum 1TB free for models)

## NVIDIA Container Toolkit Installation

See worker-rtx3060 documentation for detailed installation steps.

Quick verification:
```bash
nvidia-smi
docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 nvidia-smi
```

## Installation

### 1. Verify GPU

```bash
# Check RTX 5090 is detected
nvidia-smi

# Should show RTX 5090 24GB
```

### 2. Configure Environment

```bash
cd C:\Dev\Projects\Repos\Project-Nyra\worker-rtx5090\docker
cp .env.example .env
```

Edit `.env` with your API keys and configuration.

### 3. Ensure Orchestrator Network Exists

```bash
docker network ls | grep nyra-network
```

### 4. Start Services

```bash
# Start all services (may take 10-15 minutes for first start)
docker-compose up -d

# Monitor startup
docker-compose logs -f
```

### 5. Verify GPU Access

```bash
# Check GPU in all services
docker-compose exec claude-flow-worker nvidia-smi
docker-compose exec ollama-rtx5090 nvidia-smi
docker-compose exec vllm-rtx5090 nvidia-smi
```

### 6. Pull Large Models

```bash
# Ollama - larger models for RTX 5090
docker-compose exec ollama-rtx5090 ollama pull llama2:70b
docker-compose exec ollama-rtx5090 ollama pull codellama:34b
docker-compose exec ollama-rtx5090 ollama pull mixtral:8x7b

# vLLM automatically pulls Mistral-7B on first start
# For other models, update docker-compose.yml

# Stable Diffusion models
# Download SDXL, SD 1.5, etc. to volumes
```

## Access URLs

- **Claude Flow Worker**: http://worker-rtx5090.nyra.local:3012
- **Open WebUI**: http://ai-rtx5090.nyra.local:3003
- **Automatic1111**: http://sd-rtx5090.nyra.local:7860
- **ComfyUI**: http://comfy-rtx5090.nyra.local:8188
- **SwarmUI**: http://swarm-rtx5090.nyra.local:7801
- **Jupyter Lab**: http://jupyter-rtx5090.nyra.local:8889
- **Ollama API**: http://ollama-rtx5090.nyra.local:11435
- **vLLM API**: http://vllm-rtx5090.nyra.local:8001
- **llama.cpp API**: http://llama-rtx5090.nyra.local:8002

## DNS Configuration

```
10.0.0.2 worker-rtx5090.nyra.local
10.0.0.2 ai-rtx5090.nyra.local
10.0.0.2 sd-rtx5090.nyra.local
10.0.0.2 comfy-rtx5090.nyra.local
10.0.0.2 swarm-rtx5090.nyra.local
10.0.0.2 jupyter-rtx5090.nyra.local
10.0.0.2 ollama-rtx5090.nyra.local
10.0.0.2 vllm-rtx5090.nyra.local
10.0.0.2 llama-rtx5090.nyra.local
```

## Network Configuration

- Worker IP: 172.20.0.70
- Ollama: 172.20.0.71
- vLLM: 172.20.0.72
- llama.cpp: 172.20.0.73
- Services: 172.20.0.74-81

## GPU Optimization

### RTX 5090 Specifications
- **VRAM**: 24GB GDDR7
- **CUDA Cores**: 21,760
- **Tensor Cores**: 512 (5th gen)
- **Compute Capability**: 9.0
- **Power Limit**: 450W
- **Memory Bandwidth**: 1,792 GB/s

### Capabilities
This is the most powerful consumer GPU. Capable of:
- Running 70B models (with quantization)
- Multiple 7B-13B models simultaneously
- SDXL image generation at 4K
- Video generation
- Fine-tuning up to 13B models
- Real-time inference for production workloads

### Recommended Models
- **Large Text**: Llama 2 70B, Mixtral 8x7B, CodeLlama 34B
- **Medium Text**: Mistral 7B, Llama 2 13B (full precision)
- **Code**: CodeLlama 34B, DeepSeek Coder 33B
- **Images**: SDXL, SD 1.5, ControlNet, LoRA models
- **Video**: Stable Video Diffusion

### Performance Tips
1. Use full precision models when possible (24GB VRAM)
2. Enable tensor cores for maximum performance
3. Batch size 32 for optimal throughput
4. Use vLLM for production inference (highest throughput)
5. Use Ollama for development/testing (easier to use)
6. Monitor power usage (450W TDP)

## LLM Inference Comparison

### Ollama (Port 11435)
- **Best For**: Development, testing, model switching
- **Pros**: Easy to use, quick model switching, good API
- **Cons**: Lower throughput than vLLM
- **Use When**: Prototyping, exploring models

### vLLM (Port 8001)
- **Best For**: Production inference, high throughput
- **Pros**: Fastest inference, PagedAttention, continuous batching
- **Cons**: Model changes require restart
- **Use When**: Serving APIs, production workloads

### llama.cpp (Port 8002)
- **Best For**: GGUF models, edge deployment
- **Pros**: Efficient, quantization support, portable
- **Cons**: Slower than vLLM, fewer features
- **Use When**: Resource-constrained, GGUF models

## Image Generation Optimization

### Automatic1111
- Full-featured SD WebUI
- Best for: General use, extensions, testing
- VRAM usage: 6-12GB depending on model

### ComfyUI
- Node-based workflow system
- Best for: Complex workflows, automation
- VRAM usage: 6-12GB

### SwarmUI
- Modern, streamlined interface
- Best for: Production use, batch generation
- VRAM usage: 6-10GB

### Tips
1. Use SDXL for best quality
2. Enable xformers for speed
3. Use VAE tiling for large images
4. Offload to RAM when switching models
5. Use LoRA models for fine-tuning

## Training Workloads

RTX 5090 can handle:
- Fine-tuning 7B models: Full precision
- Fine-tuning 13B models: QLoRA/LoRA
- Fine-tuning 30B models: QLoRA (4-bit)
- Image model training: SDXL fine-tuning, LoRA training

Use Jupyter Lab for training:
```python
# Example: Fine-tune with 4-bit quantization
from transformers import AutoModelForCausalLM, TrainingArguments
from peft import LoraConfig, get_peft_model

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    load_in_4bit=True,
    device_map="auto"
)

# Configure LoRA
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.1
)

model = get_peft_model(model, lora_config)
```

## Maintenance

### Monitor GPU

```bash
# Real-time GPU monitoring
watch -n 1 nvidia-smi

# Check temperature and power
nvidia-smi -q -d TEMPERATURE,POWER

# GPU metrics in Grafana (orchestrator)
# Port 9401 exposes detailed metrics
```

### Manage Models

```bash
# Ollama models
docker-compose exec ollama-rtx5090 ollama list
docker-compose exec ollama-rtx5090 ollama rm old-model

# SD models (Automatic1111)
# Located in: swarmui-models, comfyui-models, automatic1111-models volumes

# Check disk usage
docker system df -v
```

### Optimize Performance

```bash
# Set GPU power limit (if needed)
nvidia-smi -pl 400  # Set to 400W

# Set persistence mode
nvidia-smi -pm 1

# Monitor thermals
nvidia-smi dmon -s pucvmet
```

## Troubleshooting

### Out of Memory

Even with 24GB, you can hit OOM:
1. Reduce batch size
2. Use quantized models (Q4/Q8)
3. Enable CPU offloading
4. Close unused services
5. Use gradient checkpointing for training

### Slow Inference

1. Check GPU utilization: `nvidia-smi`
2. Verify full GPU offloading (`-ngl 99`)
3. Use vLLM for production (highest throughput)
4. Enable Flash Attention in vLLM
5. Check thermal throttling

### Model Loading Failures

1. Check VRAM availability
2. Verify model format compatibility
3. Review container logs
4. Try quantized version
5. Ensure sufficient disk space

## Performance Benchmarks

Expected performance (varies by model):

- **Mistral 7B**: 80-100 tokens/s
- **Llama 2 13B**: 50-70 tokens/s
- **Llama 2 70B (Q4)**: 15-25 tokens/s
- **SDXL 1024x1024**: 2-3 seconds/image
- **SD 1.5 512x512**: 0.5-1 second/image

## Security

1. Restrict API access to local network
2. Use authentication for web UIs
3. Keep NVIDIA drivers updated
4. Monitor GPU temperature
5. Use VPN for remote access
6. Regular security updates

## Support

- Monitor via Grafana on orchestrator
- Check GPU metrics at port 9401
- Review logs: `docker-compose logs -f`
- GPU issues: Check nvidia-smi output
