# Worker RTX 3090 Ti - AI/ML Workstation

Specialized for model training, large inference, and image generation.

## Hardware Specifications

- **GPU**: NVIDIA RTX 3090 Ti 24GB
- **RAM**: 64GB DDR4
- **Storage**: 2TB NVMe SSD
- **Network**: 10.0.0.4 (Static IP recommended)
- **Role**: AI/ML Training & Inference Worker

## Services Deployed

### Core Services
- **Claude Flow Worker** (port 3013) - Worker node agent
- **Ollama** (port 11436) - Local LLM inference
- **Open WebUI** (port 3004) - Ollama web interface

### Image Generation
- **SwarmUI** (port 7802) - Stable Diffusion interface
- **ComfyUI** (port 8189) - Advanced SD workflows

### Workflow Automation
- **n8n** (port 5679) - Workflow automation

### Development
- **Jupyter Lab** (port 8890) - GPU-accelerated notebooks

### Monitoring
- **Node Exporter** (port 9102) - System metrics
- **NVIDIA GPU Exporter** (port 9402) - GPU metrics

## Prerequisites

1. Docker Engine 24.0+ with Compose V2
2. NVIDIA Container Toolkit
3. NVIDIA Driver 525.60.13+ (for CUDA 12.0+)
4. Git
5. Network connectivity to orchestrator (10.0.0.1)
6. Sufficient disk space (minimum 1TB free)

## Installation

### 1. Verify GPU

```bash
nvidia-smi
# Should show RTX 3090 Ti 24GB
```

### 2. Install NVIDIA Container Toolkit

See worker-rtx3060 documentation for detailed steps.

### 3. Configure Environment

```bash
cd C:\Dev\Projects\Repos\Project-Nyra\worker-rtx3090ti\docker
cp .env.example .env
```

### 4. Start Services

```bash
docker-compose up -d
docker-compose logs -f
```

### 5. Verify GPU Access

```bash
docker-compose exec claude-flow-worker nvidia-smi
docker-compose exec ollama-rtx3090ti nvidia-smi
```

### 6. Pull Models

```bash
# Ollama - large models
docker-compose exec ollama-rtx3090ti ollama pull llama2:70b
docker-compose exec ollama-rtx3090ti ollama pull mixtral:8x7b
docker-compose exec ollama-rtx3090ti ollama pull codellama:34b

# Stable Diffusion models
# Download to swarmui-models and comfyui-models volumes
```

## Access URLs

- **Claude Flow Worker**: http://worker-rtx3090ti.nyra.local:3013
- **Open WebUI**: http://ai-rtx3090ti.nyra.local:3004
- **SwarmUI**: http://swarm-rtx3090ti.nyra.local:7802
- **ComfyUI**: http://comfy-rtx3090ti.nyra.local:8189
- **n8n**: http://n8n-rtx3090ti.nyra.local:5679
- **Jupyter**: http://jupyter-rtx3090ti.nyra.local:8890
- **Ollama**: http://ollama-rtx3090ti.nyra.local:11436

## DNS Configuration

```
10.0.0.4 worker-rtx3090ti.nyra.local
10.0.0.4 ai-rtx3090ti.nyra.local
10.0.0.4 swarm-rtx3090ti.nyra.local
10.0.0.4 comfy-rtx3090ti.nyra.local
10.0.0.4 n8n-rtx3090ti.nyra.local
10.0.0.4 jupyter-rtx3090ti.nyra.local
10.0.0.4 ollama-rtx3090ti.nyra.local
```

## Network Configuration

- Worker IP: 172.20.0.90
- Ollama: 172.20.0.91
- Services: 172.20.0.92-98

## GPU Optimization

### RTX 3090 Ti Specifications
- **VRAM**: 24GB GDDR6X
- **CUDA Cores**: 10,752
- **Tensor Cores**: 336 (3rd gen)
- **Compute Capability**: 8.6
- **Power Limit**: 450W
- **Memory Bandwidth**: 1,008 GB/s

### Capabilities
- Running 70B models (with quantization)
- Multiple 7B-13B models simultaneously
- SDXL image generation
- Model fine-tuning up to 13B (full precision)
- High-resolution image generation

### Recommended Models
- **Large Text**: Llama 2 70B (Q4), Mixtral 8x7B, CodeLlama 34B
- **Medium Text**: Llama 2 13B, Mistral 7B (full precision)
- **Images**: SDXL, SD 1.5, ControlNet
- **Code**: CodeLlama 34B, DeepSeek Coder 33B

### Performance Tips
1. Use Q4/Q5 quantization for 70B models
2. Full precision for 13B and smaller
3. Batch size 32 for training
4. Monitor VRAM with nvidia-smi
5. Enable xformers for SD

## Training Workloads

Ideal for:
- **LLM Fine-tuning**: 7B (full), 13B (QLoRA), 30B+ (4-bit QLoRA)
- **Image Models**: SDXL LoRA, DreamBooth
- **Research**: Prototyping, experimentation

Jupyter Lab Example:
```python
import torch
from transformers import AutoModelForCausalLM
from peft import LoraConfig, get_peft_model

# Load model with 4-bit quantization
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    load_in_4bit=True,
    device_map="auto",
    torch_dtype=torch.float16
)

# LoRA configuration
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.1,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)
print(f"Trainable params: {model.print_trainable_parameters()}")
```

## Image Generation

### SwarmUI
- Modern SD interface
- Best for production generation
- Easy model management

### ComfyUI
- Node-based workflows
- Best for complex pipelines
- Advanced control

### Recommended Settings
- **Resolution**: Up to 2048x2048 (SDXL)
- **Batch Size**: 1-4 depending on model
- **Steps**: 20-50 for quality
- **Sampler**: DPM++ 2M Karras
- **CFG Scale**: 7-9

## Workflow Automation

Use n8n to automate:
- Model training pipelines
- Image generation workflows
- Data preprocessing
- Model evaluation
- Results aggregation

Example: Automated fine-tuning pipeline
1. Trigger: New dataset upload
2. Preprocess: Clean and format data
3. Train: Launch training job in Jupyter
4. Evaluate: Run evaluation metrics
5. Deploy: Push model to Ollama
6. Notify: Send completion alert

## Maintenance

### Monitor GPU

```bash
# Real-time monitoring
watch -n 1 nvidia-smi

# Temperature and power
nvidia-smi -q -d TEMPERATURE,POWER

# Detailed monitoring in Grafana
# Metrics exposed on port 9402
```

### Manage Storage

```bash
# Check disk usage
docker system df -v

# Clean up unused images
docker system prune -a

# Backup models
docker run --rm -v ollama-models:/data -v $(pwd):/backup alpine tar czf /backup/models.tar.gz /data
```

### Optimize Performance

```bash
# Set GPU power limit
nvidia-smi -pl 400  # 400W

# Enable persistence mode
nvidia-smi -pm 1

# Monitor performance
nvidia-smi dmon -s pucvmet -c 100
```

## Troubleshooting

### OOM Errors
1. Use quantized models (Q4/Q5)
2. Reduce batch size
3. Enable gradient checkpointing
4. Use CPU offloading
5. Close unused services

### Slow Training
1. Check GPU utilization: `nvidia-smi`
2. Verify data loading isn't bottleneck
3. Use mixed precision (fp16)
4. Increase batch size if possible
5. Profile with PyTorch profiler

### Image Generation Issues
1. Check model files are downloaded
2. Verify VRAM availability
3. Reduce resolution/batch size
4. Clear VAE cache
5. Update to latest version

### Network Problems
1. Verify orchestrator connectivity
2. Check Docker network: `docker network inspect nyra-network`
3. Test ping: `docker-compose exec claude-flow-worker ping 172.20.0.10`
4. Review firewall rules

## Performance Benchmarks

Expected performance:

### LLM Inference
- **Mistral 7B**: 70-90 tokens/s
- **Llama 2 13B**: 40-60 tokens/s
- **Llama 2 70B (Q4)**: 12-20 tokens/s
- **Mixtral 8x7B**: 30-45 tokens/s

### Image Generation
- **SDXL 1024x1024**: 2-4 seconds
- **SD 1.5 512x512**: 0.5-1 second
- **SDXL 2048x2048**: 8-12 seconds

### Training
- **7B fine-tuning**: 2-3 hours (LoRA)
- **13B fine-tuning**: 6-8 hours (QLoRA)
- **SDXL LoRA**: 1-2 hours

## Security

1. Secure Jupyter Lab with password
2. Configure n8n authentication
3. Restrict API access
4. Monitor GPU usage for anomalies
5. Keep drivers updated
6. Use VPN for remote access

## Integration

This worker specializes in:
- Heavy compute tasks from orchestrator
- Model training requests
- Batch image generation
- Long-running inference jobs

Connect to swarm:
- Automatic registration with orchestrator
- Task routing via Claude Flow
- Metrics reporting to Prometheus
- Log aggregation to Loki

## Support

- Grafana dashboards on orchestrator
- GPU metrics: port 9402
- Logs: `docker-compose logs -f`
- Status: `docker-compose ps`

## Next Steps

1. Configure training pipelines in Jupyter
2. Set up automation workflows in n8n
3. Download SD models for generation
4. Test distributed tasks from orchestrator
5. Set up monitoring dashboards
