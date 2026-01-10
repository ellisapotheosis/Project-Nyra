# Quick Start Guide - GPU Workers Setup

Get your GPU workers running in 5 minutes!

## 🎯 Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Ubuntu 20.04+ or compatible Linux distribution
- [ ] NVIDIA GPU (RTX 3060, 3090, or 5090)
- [ ] NVIDIA drivers installed (version 535+)
- [ ] Root/sudo access
- [ ] At least 100GB free disk space
- [ ] Internet connection for downloading models

## 🚀 Single Worker Setup (5 Minutes)

### Step 1: Choose Your GPU Script

Pick the script matching your GPU:

```bash
cd bootstrap/gpu-workers

# For RTX 5090 (48GB VRAM)
sudo ./setup-rtx5090-worker.sh

# For RTX 3090 (24GB VRAM)
sudo ./setup-rtx3090-worker.sh

# For RTX 3060 (12GB VRAM)
sudo ./setup-rtx3060-worker.sh
```

### Step 2: Wait for Installation

The script will:
1. Install dependencies (2 min)
2. Download and install Ollama (1 min)
3. Pull optimized models (2-10 min depending on internet speed)
4. Configure services
5. Run health checks

### Step 3: Test Your Worker

```bash
# Check if Ollama is running
systemctl status ollama

# Test the API
curl http://localhost:11434/api/tags

# Try generating text
ollama run deepseek-r1:236b-q4_K_M "Hello, how are you?"
```

### Step 4: Configure Claude Code

```bash
# Add to your shell profile (~/.bashrc or ~/.zshrc)
export ANTHROPIC_BASE_URL=http://localhost:11434
export ANTHROPIC_MODEL=ollama/deepseek-r1:236b-q4_K_M

# Reload shell
source ~/.bashrc

# Test with Claude Code
claude "Write a Python hello world"
```

**Done!** Your GPU worker is ready.

---

## 🌐 Multi-Worker Setup (15 Minutes)

### Scenario: 3 GPUs on Same Machine

```bash
cd bootstrap/gpu-workers

# Option 1: Sequential (recommended for first-time setup)
sudo ./setup-all-workers.sh

# Option 2: Parallel (faster but needs more resources)
sudo ./setup-all-workers.sh --parallel --setup-lb
```

This will:
- Set up all 3 workers on different ports
- Configure nginx load balancer
- Create monitoring dashboard
- Run comprehensive health checks

**Access:**
- RTX 5090: `http://localhost:11434`
- RTX 3090: `http://localhost:11435`
- RTX 3060: `http://localhost:11436`
- Load Balancer: `http://localhost:8000`

### Scenario: Multiple Machines on LAN

#### On Controller Machine:

```bash
cd bootstrap/gpu-workers

# 1. Create hosts file
cat > hosts.txt <<EOF
rtx5090-worker:192.168.1.100:username
rtx3090-worker:192.168.1.101:username
rtx3060-worker:192.168.1.102:username
EOF

# 2. Set up SSH keys (if not already done)
ssh-keygen -t ed25519 -f ~/.ssh/gpu_workers
ssh-copy-id -i ~/.ssh/gpu_workers.pub username@192.168.1.100
ssh-copy-id -i ~/.ssh/gpu_workers.pub username@192.168.1.101
ssh-copy-id -i ~/.ssh/gpu_workers.pub username@192.168.1.102

# 3. Deploy to all workers
./setup-all-workers.sh --hosts-file hosts.txt
```

#### Test Remote Access:

```bash
# Test each worker
curl http://192.168.1.100:11434/api/tags
curl http://192.168.1.101:11434/api/tags
curl http://192.168.1.102:11434/api/tags

# Configure Claude Code to use remote worker
export ANTHROPIC_BASE_URL=http://192.168.1.100:11434
claude "Test remote worker"
```

---

## 🔒 Optional: Tailscale Setup (Recommended)

Tailscale provides secure remote access without opening firewall ports.

### Step 1: Get Auth Key

1. Go to https://login.tailscale.com/admin/settings/keys
2. Click "Generate auth key"
3. Enable "Ephemeral" and "Pre-authorized"
4. Copy the key (starts with `tskey-auth-`)

### Step 2: Set Environment Variable

```bash
export TAILSCALE_AUTH_KEY="tskey-auth-k..."
```

### Step 3: Run Setup

The worker scripts will automatically configure Tailscale:

```bash
sudo ./setup-rtx5090-worker.sh
# Tailscale will be configured automatically
```

### Step 4: Access via Tailscale

```bash
# Get worker's Tailscale IP
tailscale status

# Use Tailscale IP with Claude Code
export ANTHROPIC_BASE_URL=http://100.64.1.100:11434
claude "Remote access test"
```

**Benefits:**
- Secure encrypted tunnel
- No firewall configuration needed
- Access from anywhere
- Automatic IP discovery

---

## 🎨 Optional: LiteLLM Proxy Setup

LiteLLM provides unified API, fallback, and load balancing.

### Enable During Setup

```bash
# LiteLLM is automatically installed
# Set OpenRouter key for fallback
export OPENROUTER_API_KEY="sk-or-v1-..."

sudo ./setup-rtx5090-worker.sh
```

### Configure Claude Code

```bash
# Use LiteLLM proxy instead of direct Ollama
export ANTHROPIC_BASE_URL=http://localhost:4000
export ANTHROPIC_AUTH_TOKEN=sk-litellm-master-key
export ANTHROPIC_MODEL=deepseek-r1-236b

# Test with fallback
claude "This will use local model or fall back to OpenRouter"
```

**LiteLLM Features:**
- Automatic fallback to OpenRouter if local model fails
- Request routing and load balancing
- Usage tracking and analytics
- Multi-tenant support

---

## 📊 Monitoring Your Workers

### GPU Monitoring Dashboard

```bash
# Real-time GPU stats
gpu-monitor
```

### Cluster Dashboard (Multi-Worker)

```bash
# View all workers at once
workers-dashboard
```

### Service Status

```bash
# Check Ollama
systemctl status ollama

# Check LiteLLM (if enabled)
systemctl status litellm

# Check health endpoint
systemctl status health-server
```

### Logs

```bash
# Ollama logs
journalctl -u ollama -f

# LiteLLM logs
journalctl -u litellm -f

# All GPU-related logs
journalctl -u ollama -u litellm -u health-server -f
```

---

## 🐛 Common Issues & Fixes

### Issue: "nvidia-smi: command not found"

**Fix:** Install NVIDIA drivers first

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nvidia-driver-535

# Reboot required
sudo reboot
```

### Issue: "Out of memory" errors

**Fix:** Reduce parallel requests or use smaller models

```bash
sudo systemctl edit ollama
```

Add:
```ini
[Service]
Environment="OLLAMA_MAX_LOADED_MODELS=1"
Environment="OLLAMA_NUM_PARALLEL=1"
```

```bash
sudo systemctl restart ollama
```

### Issue: Models download very slowly

**Fix:** Download models manually in the background

```bash
# Start download in background
nohup ollama pull deepseek-r1:236b-q4_K_M > /tmp/ollama-pull.log 2>&1 &

# Check progress
tail -f /tmp/ollama-pull.log
```

### Issue: "Connection refused" on port 11434

**Fix:** Check if Ollama is running and firewall allows it

```bash
# Check service
systemctl status ollama

# Check port
sudo netstat -tulpn | grep 11434

# Allow in firewall
sudo ufw allow 11434/tcp
```

### Issue: Claude Code not connecting

**Fix:** Verify environment variables and test connection

```bash
# Check variables
echo $ANTHROPIC_BASE_URL
echo $ANTHROPIC_MODEL

# Test connection
curl $ANTHROPIC_BASE_URL/api/tags

# Test with simple request
ollama run deepseek-r1:236b-q4_K_M "test"
```

---

## 🎓 Next Steps

### Learn More

- Read full [README.md](README.md) for comprehensive documentation
- Review individual worker scripts for customization options
- Check [4PCLAN guide](../../../docs/4PCLAN-Using-Claude-Code-with-Open-Models.md)
- Explore [LiteLLM integration](../../../docs/litellm-integration.md)

### Advanced Configuration

- Set up Prometheus monitoring
- Configure automatic backups
- Implement custom routing rules
- Deploy on Kubernetes

### Join the Community

- Share your setup and configurations
- Report issues and contribute improvements
- Help others with troubleshooting

---

## 📋 Setup Validation Checklist

After setup, verify these items:

- [ ] Ollama service is running: `systemctl status ollama`
- [ ] Models are downloaded: `ollama list`
- [ ] API is accessible: `curl http://localhost:11434/api/tags`
- [ ] Health check passes: `curl http://localhost:8080/health`
- [ ] GPU is detected: `nvidia-smi`
- [ ] Claude Code connects: `claude "test"`

If all checks pass, your GPU worker is production-ready!

---

**Estimated Total Time:**
- Single worker: 5-15 minutes (depending on internet speed)
- Multi-worker local: 15-30 minutes
- Multi-worker remote: 20-40 minutes (plus SSH setup time)

**Questions?** Check the [README.md](README.md) or open an issue.
