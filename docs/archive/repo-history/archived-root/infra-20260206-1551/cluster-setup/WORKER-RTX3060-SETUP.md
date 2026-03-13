# Worker RTX 3060 (AlienApotheosis) - Setup Guide

**PC**: Alienware m15 R7
**GPU**: NVIDIA GeForce RTX 3060 Laptop (12GB VRAM)
**RAM**: 32GB DDR5
**Hostname**: AlienApotheosis
**Tailscale IP**: 100.83.23.49

## Hardware Specifications

- **GPU VRAM**: 12GB GDDR6
- **System RAM**: 32GB DDR5 (available for model offloading)
- **Specialization**: Code generation, document processing, embeddings
- **Role**: Tertiary GPU worker in 4-PC cluster

## Recommended Models (12GB VRAM)

Based on CLAUDE.md specifications for worker-rtx3060:

| Model | Size | Quantization | VRAM Usage | Use Case |
|-------|------|--------------|------------|----------|
| **CodeLlama 34B** | 34B | Q4_K_M | ~10GB | Code generation, debugging |
| **Qwen 2.5 32B** | 32B | Q4_K_M | ~9GB | General purpose, reasoning |
| **DeepSeek-Coder 33B** | 33B | Q4_K_M | ~9.5GB | Code understanding, refactoring |
| **Gemma 2 27B** | 27B | Q5_K_M | ~8GB | Document processing, embeddings |

**Note**: With 32GB system RAM, you can also run larger models with CPU offloading, but inference will be slower.

## Setup Option 1: Native Ollama (Recommended for Quick Start)

### Step 1: Start Ollama Service

Ollama is already installed at: `C:\Users\edane\AppData\Local\Programs\Ollama\`

```powershell
# Start Ollama app (opens system tray)
Start-Process "$env:LOCALAPPDATA\Programs\Ollama\Ollama.exe"

# Or use the installed command
ollama serve
```

### Step 2: Pull Models

Pull recommended models one at a time (each takes 5-15 minutes):

```bash
# CodeLlama 34B (primary code generation)
ollama pull codellama:34b-instruct-q4_K_M

# Qwen 2.5 32B (general purpose)
ollama pull qwen2.5:32b-instruct-q4_K_M

# DeepSeek-Coder 33B (code understanding)
ollama pull deepseek-coder:33b-instruct-q4_K_M

# Gemma 2 27B (document processing)
ollama pull gemma2:27b-instruct-q5_K_M
```

### Step 3: Test Models

```bash
# Test CodeLlama
curl http://localhost:11434/api/generate -d '{
  "model": "codellama:34b-instruct-q4_K_M",
  "prompt": "Write a Python function to calculate Fibonacci numbers",
  "stream": false
}'

# List all installed models
curl http://localhost:11434/api/tags
```

### Step 4: Configure for Tailscale Access

Ollama binds to localhost by default. To access via Tailscale:

```powershell
# Set environment variable (persist across reboots)
[System.Environment]::SetEnvironmentVariable('OLLAMA_HOST', '0.0.0.0', 'User')

# Restart Ollama for changes to take effect
Stop-Process -Name "Ollama" -Force
Start-Process "$env:LOCALAPPDATA\Programs\Ollama\Ollama.exe"
```

### Step 5: Test via Tailscale

From another PC in the Tailscale network:

```bash
# From orchestrator-mini or another worker
curl http://100.83.23.49:11434/api/tags
curl http://worker-rtx3060.tail558973.ts.net:11434/api/tags
```

## Setup Option 2: Docker Compose (Production Setup)

### Step 1: Start Docker Desktop

```powershell
# Start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait for Docker to be ready (~30 seconds)
Start-Sleep -Seconds 30

# Verify Docker is running
docker info
```

### Step 2: Fix Configuration

The VRAM has been corrected from 6GB to 12GB in the compose file.

### Step 3: Start Worker Stack

```bash
cd /c/Dev/Projects/Repos/Project-Nyra/infra/docker

# Start worker services
docker compose -f workers/docker-compose.worker-rtx3060.yml up -d

# Check status
docker compose -f workers/docker-compose.worker-rtx3060.yml ps

# View logs
docker compose -f workers/docker-compose.worker-rtx3060.yml logs -f ollama
```

### Step 4: Pull Models (Inside Docker)

```bash
# Enter Ollama container
docker exec -it nyra-worker-rtx3060-ollama bash

# Inside container, pull models
ollama pull codellama:34b-instruct-q4_K_M
ollama pull qwen2.5:32b-instruct-q4_K_M
ollama pull deepseek-coder:33b-instruct-q4_K_M
ollama pull gemma2:27b-instruct-q5_K_M

# Exit container
exit
```

### Step 5: Test Docker Setup

```bash
# Test Ollama API
curl http://localhost:11434/api/tags

# Test LiteLLM proxy
curl http://localhost:4001/health

# Test model manager
curl http://localhost:8081/health
```

## Performance Optimization

### GPU Settings

```bash
# Check GPU usage
nvidia-smi

# Monitor GPU while running inference
watch -n 1 nvidia-smi
```

### Ollama Configuration

Create `~/.ollama/config.json` (or set environment variables):

```json
{
  "keep_alive": "5m",
  "max_loaded_models": 2,
  "num_parallel": 4,
  "num_gpu": 1
}
```

Or via environment variables:

```powershell
[System.Environment]::SetEnvironmentVariable('OLLAMA_KEEP_ALIVE', '5m', 'User')
[System.Environment]::SetEnvironmentVariable('OLLAMA_MAX_LOADED_MODELS', '2', 'User')
[System.Environment]::SetEnvironmentVariable('OLLAMA_NUM_PARALLEL', '4', 'User')
[System.Environment]::SetEnvironmentVariable('OLLAMA_NUM_GPU', '1', 'User')
```

### Model Layering Strategy

With 12GB VRAM, you can keep 1 large model loaded at a time:

1. **Hot**: CodeLlama 34B (most frequently used for mortgage code)
2. **Warm**: Qwen 2.5 32B (general reasoning, qualification logic)
3. **Cold**: DeepSeek-Coder 33B, Gemma 2 27B (pull as needed)

## Integration with Nexus Router

Update Nexus Router environment variables in `infra/docker/.env`:

```bash
# Worker RTX 3060 Configuration
WORKER_3060_URL=http://100.83.23.49:11434  # or worker-rtx3060.tail558973.ts.net:11434
WORKER_3060_MODELS=codellama:34b-instruct-q4_K_M,qwen2.5:32b-instruct-q4_K_M,deepseek-coder:33b-instruct-q4_K_M,gemma2:27b-instruct-q5_K_M
```

Or if using Docker:
```bash
WORKER_3060_URL=http://ollama:11434  # Internal Docker network
```

## Cloudflared Tunnel Configuration

To expose Ollama via Cloudflare Tunnel, create `~/.cloudflared/config-worker-rtx3060.yaml`:

```yaml
tunnel: worker-rtx3060
credentials-file: ~/.cloudflared/33d0dc8b-4a1f-4f31-b482-5309171ffdf8.json

ingress:
  - hostname: worker-3060.ratehunter.net
    service: http://localhost:11434
    originRequest:
      noTLSVerify: false
      connectTimeout: 30s

  - service: http_status:404
```

Start the tunnel:

```bash
cloudflared tunnel run --config ~/.cloudflared/config-worker-rtx3060.yaml worker-rtx3060
```

## Troubleshooting

### Ollama Not Starting

```bash
# Check if process is running
Get-Process | Where-Object {$_.ProcessName -like '*ollama*'}

# Check logs
Get-Content "$env:LOCALAPPDATA\Ollama\logs\server.log" -Tail 50

# Kill stuck processes
Stop-Process -Name "Ollama" -Force
```

### GPU Not Detected

```bash
# Verify NVIDIA driver
nvidia-smi

# Check CUDA installation
nvcc --version

# Verify Ollama sees GPU
ollama list  # Should show models with GPU offload capability
```

### Out of VRAM

```bash
# Unload all models
curl http://localhost:11434/api/generate -d '{"model": "codellama:34b-instruct-q4_K_M", "keep_alive": 0}'

# Use smaller quantization (Q3 instead of Q4)
ollama pull codellama:34b-instruct-q3_K_M
```

### Slow Inference

- Use Q4_0 or Q3_K_M quantization for faster inference
- Reduce `num_parallel` to 2
- Increase `keep_alive` to 10m to avoid reloading
- Close other GPU-intensive applications

## Monitoring

### GPU Metrics

```bash
# Real-time GPU monitoring
nvidia-smi dmon -s pucvmet

# Log GPU usage to file
nvidia-smi --query-gpu=timestamp,name,temperature.gpu,utilization.gpu,utilization.memory,memory.used,memory.free --format=csv -l 5 > gpu-metrics.csv
```

### Ollama Metrics

```bash
# Check loaded models
curl http://localhost:11434/api/ps

# Get model info
curl http://localhost:11434/api/show -d '{"name": "codellama:34b-instruct-q4_K_M"}'
```

## Next Steps

1. **Start Ollama** (Option 1 or Option 2)
2. **Pull recommended models** (CodeLlama, Qwen, DeepSeek, Gemma)
3. **Test inference** locally and via Tailscale
4. **Configure Nexus Router** to route requests to this worker
5. **Set up Cloudflared tunnel** for public access (optional)
6. **Configure monitoring** in Prometheus/Grafana

## Reference

- **Ollama docs**: https://github.com/ollama/ollama/blob/main/docs/
- **Model library**: https://ollama.com/library
- **Quantization guide**: https://github.com/ggerganov/llama.cpp/blob/master/examples/quantize/README.md
- **Cluster setup**: `infra/cluster-setup/CLUSTER-SETUP-GUIDE.md`
- **Project architecture**: `CLAUDE.md`
