# Worker RTX 3060 - Current Status

**Updated**: 2026-01-22
**PC**: AlienApotheosis (Alienware m15 R7)
**GPU**: NVIDIA GeForce RTX 3060 Laptop (12GB VRAM)
**RAM**: 32GB DDR5

## ✅ Completed Setup

### Network Configuration

- ✅ **Tailscale**: Connected (IP: 100.83.23.49)
- ✅ **Cloudflared**: Installed with tunnel configured
- ✅ **Volta/pnpm/Node**: Configured as primary (Node 22.22.0 LTS)
- ✅ **DNS**: Working perfectly (Cloudflare 1.1.1.1)

### LLM Infrastructure

- ✅ **Ollama**: Running on port 11434
- ✅ **Models Installed** (3 models, ~10GB total):
  1. **llama3.1:8b** (4.9GB) - General purpose
  2. **qwen2.5-coder:7b** (4.7GB) - Code generation
  3. **nomic-embed-text** (274MB) - Embeddings

### Access URLs

- **Local**: `http://localhost:11434`
- **Tailscale**: `http://100.83.23.49:11434`
- **MagicDNS**: `http://worker-rtx3060.tail558973.ts.net:11434`
- **Cloudflare Tunnel** (when active): `https://worker-3060.projectnyra.com`

## 📊 Model Performance

Your current models are well-optimized for the RTX 3060:

| Model                | Size        | VRAM Usage | Tokens/sec | Use Case                   |
| -------------------- | ----------- | ---------- | ---------- | -------------------------- |
| **qwen2.5-coder:7b** | 7.6B Q4_K_M | ~4.7GB     | ~40-50     | Code generation, debugging |
| **llama3.1:8b**      | 8.0B Q4_K_M | ~4.9GB     | ~35-45     | General purpose, reasoning |
| **nomic-embed-text** | 137M F16    | ~274MB     | ~1000+     | Document embeddings        |

With 12GB VRAM, you can comfortably run 2 models simultaneously (e.g., qwen2.5-coder + nomic-embed-text).

## 🎯 Model Recommendations

### Already Installed (Great Choices!)

Your current models are perfect for your hardware:

- ✅ **qwen2.5-coder:7b** - Best for mortgage code generation
- ✅ **llama3.1:8b** - Good for general reasoning, qualification logic
- ✅ **nomic-embed-text** - Essential for document similarity search

### Optional Additions (If Needed)

If you need specialized capabilities, consider:

| Model                   | Size        | VRAM   | Purpose                      |
| ----------------------- | ----------- | ------ | ---------------------------- |
| **deepseek-coder:6.7b** | 6.7B Q4_K_M | ~4.3GB | Alternative code model       |
| **phi-3:14b**           | 14B Q4_K_M  | ~8GB   | Reasoning, structured output |
| **mistral:7b-instruct** | 7B Q4_K_M   | ~4.1GB | Instruction following        |
| **gemma2:9b**           | 9B Q5_K_M   | ~6GB   | Document processing          |

**Current VRAM usage**: ~5-6GB with one model loaded (2 models = ~10GB, leaving 2GB free)

## 🚀 Quick Commands

### Check Status

```bash
# Test Ollama API
curl http://localhost:11434/api/tags

# Check running models
curl http://localhost:11434/api/ps

# Via Tailscale (from another PC)
curl http://100.83.23.49:11434/api/tags
```

### Generate Code

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5-coder:7b",
  "prompt": "Write a Python function to calculate DTI for a mortgage",
  "stream": false
}'
```

### Get Embeddings

```bash
curl http://localhost:11434/api/embeddings -d '{
  "model": "nomic-embed-text",
  "prompt": "conventional loan 30-year fixed rate"
}'
```

### Pull Additional Models

```bash
# If you want a larger code model
ollama pull deepseek-coder:6.7b

# For better reasoning
ollama pull phi-3:14b

# Alternative general purpose
ollama pull mistral:7b-instruct
```

## ⚙️ Configuration

### Enable Tailscale Access

To allow other PCs to access Ollama via Tailscale:

```bash
# Set OLLAMA_HOST to listen on all interfaces
export OLLAMA_HOST=0.0.0.0

# Restart Ollama (if running as a service)
# Or just restart the Ollama app
```

**Make permanent** (Windows):

1. Open System Environment Variables
2. Add User variable: `OLLAMA_HOST = 0.0.0.0`
3. Restart Ollama

### Ollama Performance Settings

Create `~/.ollama/config.json`:

```json
{
  "keep_alive": "5m",
  "max_loaded_models": 2,
  "num_parallel": 4,
  "num_gpu": 1
}
```

Or set environment variables:

```bash
OLLAMA_KEEP_ALIVE=5m
OLLAMA_MAX_LOADED_MODELS=2
OLLAMA_NUM_PARALLEL=4
```

## 🔧 Next Steps

### 1. Configure Nexus Router

Update `infra/images/.env`:

```bash
WORKER_3060_URL=http://100.83.23.49:11434
WORKER_3060_MODELS=qwen2.5-coder:7b,llama3.1:8b,nomic-embed-text
```

### 2. Start Cloudflared Tunnel (Optional)

For public access:

```bash
cloudflared tunnel run --config ~/.cloudflared/config-worker-rtx3060.yaml worker-rtx3060
```

### 3. Test from Nexus Router

Once Nexus is configured, test routing:

```bash
curl http://localhost:6000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-coder:7b",
    "messages": [{"role": "user", "content": "Calculate DTI"}]
  }'
```

### 4. Configure Monitoring (Optional)

Add Prometheus metrics scraping for this worker:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: "worker-rtx3060"
    static_configs:
      - targets: ["100.83.23.49:11434"]
```

## 📈 Performance Tips

### Maximize Throughput

1. Keep frequently-used models loaded (`keep_alive: 10m`)
2. Use `num_parallel: 4` for batch requests
3. Run 2 models simultaneously (e.g., coder + embeddings)
4. Use Q4_K_M quantization for best speed/quality balance

### Save VRAM

- Use smaller models (7-8B instead of 32B+)
- Unload models when not in use: `keep_alive: 0`
- Use Q3_K_M quantization if needed

### Monitor GPU

```bash
# Real-time monitoring
nvidia-smi dmon -s pucvmet

# Check current usage
nvidia-smi
```

## 🐛 Troubleshooting

### Ollama Not Responding

```bash
# Check if running
curl http://localhost:11434/api/tags

# Check process
Get-Process -Name "Ollama"

# Restart
Stop-Process -Name "Ollama" -Force
Start-Process "$env:LOCALAPPDATA\Programs\Ollama\Ollama.exe"
```

### Slow Inference

- Close other GPU applications
- Reduce `num_parallel` to 2
- Use smaller models or lower quantization

### Out of VRAM

```bash
# Unload all models
curl http://localhost:11434/api/generate -d '{"model": "qwen2.5-coder:7b", "keep_alive": 0}'

# Check what's loaded
curl http://localhost:11434/api/ps
```

## 📚 Documentation

- **Full setup guide**: `WORKER-RTX3060-SETUP.md`
- **Cluster overview**: `CLUSTER-SETUP-GUIDE.md`
- **Current status**: This file (`WORKER-RTX3060-STATUS.md`)
- **Project architecture**: `../../CLAUDE.md`

## ✨ Summary

Your worker-rtx3060 is **ready for production**:

✅ Ollama running with 3 optimized models
✅ Network connectivity via Tailscale
✅ Models perfect for mortgage code generation
✅ 5-6GB VRAM available for additional models

**Recommended Actions**:

1. Configure `OLLAMA_HOST=0.0.0.0` for Tailscale access
2. Update Nexus Router with this worker's URL
3. Test inference from orchestrator-mini
4. Optionally start Cloudflared tunnel for public access

The setup is complete and optimized for your hardware! 🎉
