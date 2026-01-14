# GPU Workers Bootstrap Scripts

Comprehensive bootstrap scripts for setting up Ollama GPU workers across a LAN with Claude Code integration.

## 📋 Overview

These scripts automate the deployment of GPU workers optimized for different NVIDIA GPUs:

- **RTX 5090** (48GB VRAM): Large models like DeepSeek-R1 236B, Qwen2.5 72B
- **RTX 3090** (24GB VRAM): Mid-size models like Llama 3.1 70B, Mistral Large 123B
- **RTX 3060** (12GB VRAM): Efficient models like CodeLlama 34B, Qwen2.5 32B

Each worker includes:
- Ollama installation and configuration
- Optimized model downloads for VRAM size
- Tailscale networking for secure remote access
- LiteLLM proxy with OpenRouter fallback
- Systemd service management
- Health check endpoints
- GPU monitoring tools

## 🚀 Quick Start

### Local Single Worker Setup

```bash
# RTX 5090 Worker
sudo ./setup-rtx5090-worker.sh

# RTX 3090 Worker
sudo ./setup-rtx3090-worker.sh

# RTX 3060 Worker
sudo ./setup-rtx3060-worker.sh
```

### All Workers (Same Machine)

```bash
# Sequential setup (recommended)
sudo ./setup-all-workers.sh

# Parallel setup (faster but more resource intensive)
sudo ./setup-all-workers.sh --parallel
```

### Remote Workers Setup

```bash
# Create hosts file
cat > hosts.txt <<EOF
rtx5090-worker:192.168.1.100:username
rtx3090-worker:192.168.1.101:username
rtx3060-worker:192.168.1.102:username
EOF

# Deploy to remote workers
./setup-all-workers.sh --hosts-file hosts.txt
```

## 📦 Prerequisites

### System Requirements

- **OS**: Ubuntu 20.04+, Debian 11+, RHEL 8+, or compatible Linux
- **GPU**: NVIDIA GPU with CUDA support
- **NVIDIA Drivers**: Version 535+ recommended
- **RAM**: 32GB+ recommended (64GB+ for RTX 5090)
- **Storage**: 500GB+ SSD for models
- **Network**: 1Gbps+ LAN or Tailscale VPN

### Software Dependencies

Automatically installed by scripts:
- curl, wget, git, jq
- Python 3.8+
- Docker & Docker Compose
- NVIDIA Container Toolkit (if using Docker)

### API Keys (Optional)

Set these environment variables before running:

```bash
# For OpenRouter fallback
export OPENROUTER_API_KEY="sk-or-v1-..."

# For Tailscale networking
export TAILSCALE_AUTH_KEY="tskey-auth-..."
```

## 🔧 Configuration Options

### Individual Worker Scripts

All worker scripts support these options:

```bash
--skip-ollama       # Skip Ollama installation
--skip-models       # Skip model downloads
--skip-tailscale    # Skip Tailscale setup
--skip-litellm      # Skip LiteLLM proxy setup
--worker-name NAME  # Custom worker name
--help              # Show help message
```

Example:
```bash
sudo ./setup-rtx5090-worker.sh \
  --skip-models \
  --worker-name my-gpu-01 \
  --skip-tailscale
```

### Orchestrator Script

```bash
--parallel          # Setup workers in parallel
--skip-tests        # Skip health checks
--hosts-file FILE   # Remote deployment
--setup-lb          # Configure nginx load balancer
--help              # Show help message
```

## 🏗️ Architecture

### Single Worker Architecture

```
┌─────────────────────────────────────────────┐
│           GPU Worker Node                   │
│                                             │
│  ┌─────────────┐    ┌─────────────────┐    │
│  │   Ollama    │◄───┤  LiteLLM Proxy  │    │
│  │  (11434)    │    │     (4000)      │    │
│  └──────┬──────┘    └────────┬────────┘    │
│         │                     │             │
│    ┌────▼────┐           ┌───▼───┐         │
│    │  Models │           │ Redis │         │
│    │  (GPU)  │           │ Cache │         │
│    └─────────┘           └───────┘         │
│                                             │
│  ┌─────────────┐    ┌─────────────────┐    │
│  │  Tailscale  │    │  Health Check   │    │
│  │  Network    │    │     (8080)      │    │
│  └─────────────┘    └─────────────────┘    │
└─────────────────────────────────────────────┘
```

### Multi-Worker Cluster Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│                  nginx (Port 8000)                       │
│                   Least Connections                      │
└────────────┬────────────┬────────────┬───────────────────┘
             │            │            │
    ┌────────▼────┐  ┌────▼────┐  ┌───▼──────┐
    │  RTX 5090   │  │ RTX 3090│  │ RTX 3060 │
    │   (11434)   │  │ (11435) │  │  (11436) │
    │  Weight: 3  │  │Weight: 2│  │ Weight: 1│
    └─────────────┘  └─────────┘  └──────────┘
         48GB            24GB          12GB
```

## 📊 Model Selection Guide

### RTX 5090 (48GB VRAM)

**Primary Models:**
- `deepseek-r1:236b-q4_K_M` - Advanced reasoning (Q4 quantization)
- `qwen2.5:72b-instruct-q8_0` - High-quality coding (Q8 quantization)

**Use Cases:** Complex reasoning, large-scale code generation, research

### RTX 3090 (24GB VRAM)

**Primary Models:**
- `llama3.1:70b-instruct-q4_K_M` - General purpose reasoning
- `mistral-large:123b-instruct-2407-q4_K_M` - High-capacity model

**Use Cases:** General development, code review, documentation

### RTX 3060 (12GB VRAM)

**Primary Models:**
- `codellama:34b-instruct-q8_0` - Fast code completion
- `qwen2.5:32b-instruct-q8_0` - Efficient coding tasks

**Use Cases:** Fast iteration, code completion, quick queries

## 🌐 Network Configuration

### Tailscale Setup (Recommended)

1. Create auth key at https://login.tailscale.com/admin/settings/keys
2. Set environment variable:
   ```bash
   export TAILSCALE_AUTH_KEY="tskey-auth-k..."
   ```
3. Run setup script (Tailscale will be configured automatically)

### Direct LAN Access

Workers listen on all interfaces by default:
- Local: `http://localhost:11434`
- LAN: `http://<worker-ip>:11434`

### Load Balancer

The orchestrator script can set up nginx load balancer:

```bash
sudo ./setup-all-workers.sh --setup-lb
```

Access via: `http://localhost:8000`

## 🔍 Health Checks & Monitoring

### Health Check Endpoints

Each worker exposes:
- Ollama API: `http://worker:11434/api/tags`
- Health endpoint: `http://worker:8080/health`

Example:
```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "healthy",
  "worker": "rtx5090-worker",
  "models": [
    "deepseek-r1:236b-q4_K_M",
    "qwen2.5:72b-instruct-q8_0"
  ]
}
```

### GPU Monitoring

```bash
# Real-time GPU monitoring
gpu-monitor

# Check Ollama status
systemctl status ollama

# View logs
journalctl -u ollama -f
```

### Cluster Dashboard

```bash
# View all workers status
workers-dashboard
```

Output:
```
╔═══════════════════════════════════════════════════════════════╗
║           GPU Workers Cluster Dashboard                       ║
╚═══════════════════════════════════════════════════════════════╝

┌─ RTX 5090 Worker (48GB) ────────────────────────────────┐
│ Status: ONLINE ✓                                        │
│ Models: 2                                               │
└─────────────────────────────────────────────────────────┘

┌─ RTX 3090 Worker (24GB) ────────────────────────────────┐
│ Status: ONLINE ✓                                        │
│ Models: 2                                               │
└─────────────────────────────────────────────────────────┘

┌─ RTX 3060 Worker (12GB) ────────────────────────────────┐
│ Status: ONLINE ✓                                        │
│ Models: 2                                               │
└─────────────────────────────────────────────────────────┘
```

## 🔌 Claude Code Integration

### Option 1: Direct Worker Connection

```bash
# Connect to specific worker
export ANTHROPIC_BASE_URL=http://localhost:11434
export ANTHROPIC_MODEL=ollama/deepseek-r1:236b-q4_K_M

# Test
claude "Write a Python function to sort a list"
```

### Option 2: LiteLLM Proxy (Recommended)

```bash
# Use LiteLLM for automatic fallback
export ANTHROPIC_BASE_URL=http://localhost:4000
export ANTHROPIC_AUTH_TOKEN=sk-litellm-master-key
export ANTHROPIC_MODEL=deepseek-r1-236b

# Test
claude "Explain quantum computing"
```

### Option 3: Load Balancer

```bash
# Distribute load across all workers
export ANTHROPIC_BASE_URL=http://localhost:8000
export ANTHROPIC_MODEL=ollama/deepseek-r1:236b-q4_K_M

# Requests automatically routed to best worker
claude "Generate a REST API"
```

### Option 4: Tailscale Remote Access

```bash
# Access worker over Tailscale
export ANTHROPIC_BASE_URL=http://100.64.1.100:11434
export ANTHROPIC_MODEL=ollama/qwen2.5:72b-instruct-q8_0

claude "Review this code: $(cat main.py)"
```

## 🐛 Troubleshooting

### Ollama Won't Start

```bash
# Check service status
systemctl status ollama

# View logs
journalctl -u ollama -n 100 --no-pager

# Restart service
sudo systemctl restart ollama
```

### Out of Memory Errors

```bash
# Check GPU memory
nvidia-smi

# Reduce parallel models
sudo systemctl edit ollama
```

Add:
```ini
[Service]
Environment="OLLAMA_MAX_LOADED_MODELS=1"
```

### Models Not Loading

```bash
# List available models
ollama list

# Pull model manually
ollama pull deepseek-r1:236b-q4_K_M

# Test model
ollama run deepseek-r1:236b-q4_K_M "Hello"
```

### Network Issues

```bash
# Check ports
sudo netstat -tulpn | grep -E '(11434|4000|8080)'

# Test connectivity
curl http://localhost:11434/api/tags

# Check firewall
sudo ufw status
sudo ufw allow 11434/tcp
```

### LiteLLM Proxy Issues

```bash
# Check LiteLLM status
systemctl status litellm

# View logs
journalctl -u litellm -f

# Test endpoint
curl http://localhost:4000/health \
  -H "Authorization: Bearer sk-litellm-master-key"
```

## 🔒 Security Considerations

### Production Recommendations

1. **Change Default Keys**
   ```bash
   # Edit /etc/litellm/config.yaml
   master_key: "your-secure-random-key"
   ```

2. **Enable Firewall**
   ```bash
   sudo ufw enable
   sudo ufw allow from 192.168.1.0/24 to any port 11434
   sudo ufw allow from 192.168.1.0/24 to any port 4000
   ```

3. **Use Tailscale ACLs**
   Configure access control at https://login.tailscale.com/admin/acls

4. **Enable HTTPS**
   ```bash
   # Use nginx with SSL
   sudo apt-get install certbot
   sudo certbot --nginx
   ```

5. **Restrict API Access**
   ```yaml
   # /etc/litellm/config.yaml
   general_settings:
     allowed_ips: ["192.168.1.0/24", "100.64.0.0/10"]
   ```

## 📈 Performance Tuning

### Optimize for Throughput

```bash
# Edit /etc/systemd/system/ollama.service.d/environment.conf
Environment="OLLAMA_NUM_PARALLEL=4"
Environment="OLLAMA_MAX_LOADED_MODELS=2"
```

### Optimize for Latency

```bash
Environment="OLLAMA_NUM_PARALLEL=1"
Environment="OLLAMA_MAX_LOADED_MODELS=1"
Environment="OLLAMA_FLASH_ATTENTION=1"
```

### Memory Management

```bash
# Limit context size
Environment="OLLAMA_MAX_CONTEXT=4096"

# Enable quantization
# (Use Q4 models for 4-bit quantization)
```

## 🗂️ File Structure

```
bootstrap/gpu-workers/
├── README.md                        # This file
├── setup-rtx5090-worker.sh          # RTX 5090 setup script
├── setup-rtx3090-worker.sh          # RTX 3090 setup script
├── setup-rtx3060-worker.sh          # RTX 3060 setup script
├── setup-all-workers.sh             # Orchestrator script
├── hosts.example.txt                # Example hosts file
└── .env.example                     # Example environment variables
```

## 📚 Additional Resources

- [Ollama Documentation](https://github.com/ollama/ollama)
- [LiteLLM Proxy Guide](https://docs.litellm.ai/docs/proxy/quick_start)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Tailscale Setup Guide](https://tailscale.com/kb/1017/install/)
- [OpenRouter API](https://openrouter.ai/docs)

## 🤝 Contributing

Improvements welcome! Areas for contribution:
- Support for AMD GPUs (ROCm)
- Windows/macOS support
- Kubernetes deployment manifests
- Prometheus metrics exporter
- Auto-scaling based on load
- Model recommendation engine

## 📝 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues:
1. Check logs: `journalctl -u ollama -f`
2. Review health checks: `curl http://localhost:8080/health`
3. Run diagnostics: `gpu-monitor`
4. Search existing issues or create new one

---

**Last Updated**: 2026-01-10
**Version**: 1.0.0
**Tested On**: Ubuntu 22.04, NVIDIA Driver 550.90.07, CUDA 12.4
