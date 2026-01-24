# Worker RTX 5090 - Quick Start Guide

Get your RTX 5090 worker up and running in 30 minutes (excluding model downloads).

---

## 🚀 5-Minute Setup

### Prerequisites Check
```powershell
# Run as Administrator
nvidia-smi  # Should show RTX 5090 48GB
docker info  # Docker should be running
```

### Automated Setup
```powershell
# Navigate to worker directory
cd C:\Dev\Projects\Repos\Project-Nyra\infra\workers\worker-5090

# Run setup script (as Administrator)
.\setup-worker-5090.ps1

# Or skip model downloads for now
.\setup-worker-5090.ps1 -SkipModels
```

**That's it!** The script will:
1. Install/verify Docker Desktop
2. Check NVIDIA drivers (RTX 5090)
3. Setup Infisical secrets
4. Configure Tailscale networking
5. Install and configure Ollama
6. Pull models (DeepSeek-R1 236B, Qwen 2.5 72B) - 2-4 hours
7. Setup Docker Compose stack
8. Configure health monitoring

---

## 🎯 Manual Quick Setup (If Script Fails)

### Step 1: Install Ollama (2 minutes)
```powershell
# Download and run installer
Invoke-WebRequest -Uri "https://ollama.com/download/OllamaSetup.exe" -OutFile "$env:TEMP\OllamaSetup.exe"
Start-Process "$env:TEMP\OllamaSetup.exe" -Wait

# Configure for network access
[System.Environment]::SetEnvironmentVariable('OLLAMA_HOST', '0.0.0.0:11434', 'User')

# Start Ollama
Start-Process "$env:LOCALAPPDATA\Programs\Ollama\Ollama.exe"
```

### Step 2: Pull Models (2-4 hours)
```bash
# DeepSeek-R1 236B (primary - ~130GB)
ollama pull deepseek-r1:236b-instruct-q4_K_M

# Qwen 2.5 72B (secondary - ~48GB)
ollama pull qwen2.5:72b-instruct-q5_K_M
```

### Step 3: Test Ollama (30 seconds)
```bash
# Check models
curl http://localhost:11434/api/tags

# Test inference
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1:236b-instruct-q4_K_M",
  "prompt": "Hello",
  "stream": false
}'
```

### Step 4: Setup Environment (2 minutes)
```powershell
# Copy environment template
cp .env.worker-5090.template .env

# Edit with your values
notepad .env

# Required values:
#   LITELLM_MASTER_KEY
#   NEXUS_ADMIN_TOKEN
#   ORCHESTRATOR_URL
#   MACHINE_IP_TAILSCALE
```

### Step 5: Start Docker Stack (5 minutes)
```bash
# Start all services
docker compose -f docker-compose.worker-5090.yml up -d

# Check status
docker compose -f docker-compose.worker-5090.yml ps

# Should see 6 services running:
#   - ollama
#   - litellm
#   - model-manager
#   - perf-monitor
#   - health-check
#   - log-shipper
```

---

## ✅ Validation (2 minutes)

```powershell
# Run validation script
.\validate-setup.ps1

# Expected output:
# ✓ NVIDIA driver installed
# ✓ RTX 5090 detected
# ✓ Sufficient VRAM (48GB)
# ✓ Ollama running
# ✓ Models: DeepSeek-R1 236B, Qwen 2.5 72B
# ✓ Docker services: 6/6 healthy
# ✓ Tailscale connected

# All critical checks passed!
```

---

## 🔧 Quick Tests

### Test Ollama Directly
```bash
curl http://localhost:11434/api/tags
```

### Test LiteLLM Proxy
```bash
curl http://localhost:4000/health
```

### Test via Tailscale (from another machine)
```bash
# Get Tailscale IP
tailscale ip -4

# Test from orchestrator
curl http://YOUR_TAILSCALE_IP:11434/api/tags
curl http://worker-5090.tail-net.ts.net:11434/api/tags
```

### Test Complex Reasoning
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1:236b-instruct-q4_K_M",
  "prompt": "Calculate the debt-to-income ratio for a borrower with $8,000 monthly income and $2,500 in monthly debts. Determine if they qualify for a conventional mortgage.",
  "stream": false
}'
```

---

## 📊 Monitoring

### Start Health Monitor
```powershell
# Run in foreground
.\health-monitor.ps1

# Or run in background
Start-Job -FilePath .\health-monitor.ps1 -Name "Worker5090"
```

### Check GPU Usage
```bash
# Real-time monitoring
nvidia-smi dmon

# Continuous updates every 2s
watch -n 2 nvidia-smi
```

### View Service Logs
```bash
# All services
docker compose -f docker-compose.worker-5090.yml logs -f

# Specific service
docker compose -f docker-compose.worker-5090.yml logs -f ollama
```

### Access Metrics
```bash
# Prometheus metrics
curl http://localhost:9090/metrics

# Health status
curl http://localhost:8081/health
```

---

## 🚨 Troubleshooting

### Ollama Not Starting?
```bash
# Check logs
Get-Content "$env:LOCALAPPDATA\Ollama\logs\server.log" -Tail 50

# Restart
Stop-Process -Name "Ollama" -Force
Start-Process "$env:LOCALAPPDATA\Programs\Ollama\Ollama.exe"
```

### GPU Not Detected?
```bash
# Verify driver
nvidia-smi

# Update driver from: https://www.nvidia.com/Download/index.aspx
```

### Docker Services Not Starting?
```bash
# Check Docker daemon
docker info

# View errors
docker compose -f docker-compose.worker-5090.yml logs --tail=50

# Restart services
docker compose -f docker-compose.worker-5090.yml restart
```

### Out of VRAM?
```bash
# Unload models
curl http://localhost:11434/api/generate -d '{"model": "deepseek-r1:236b-instruct-q4_K_M", "keep_alive": 0}'

# Check VRAM usage
nvidia-smi --query-gpu=memory.used,memory.free --format=csv
```

---

## 🔗 Next Steps

1. **Register with Nexus Router**
   ```bash
   # Update Nexus configuration with worker URL
   WORKER_5090_URL=http://worker-5090.tail-net.ts.net:11434
   ```

2. **Setup Cloudflared Tunnel (Optional)**
   ```bash
   # Edit cloudflared-config.yml with your credentials
   cloudflared tunnel run --config cloudflared-config.yml worker-5090
   ```

3. **Configure Continuous Monitoring**
   ```bash
   # Add to Prometheus scrape targets
   # Add to Grafana dashboards
   ```

4. **Test Complex Workloads**
   ```bash
   # Run mortgage calculation tests
   # Run compliance validation tests
   # Run multi-agent coordination tests
   ```

---

## 📚 Documentation

- **Full Setup Guide**: `README.md`
- **Configuration**: `worker-5090-config.yaml`
- **Validation**: `.\validate-setup.ps1`
- **Health Monitoring**: `.\health-monitor.ps1`
- **Cluster Setup**: `infra/cluster-setup/CLUSTER-SETUP-GUIDE.md`
- **Project Docs**: `CLAUDE.md`

---

## 🆘 Need Help?

1. Run `.\validate-setup.ps1` for diagnostics
2. Check `health-monitor.log` for issues
3. Review Docker logs: `docker compose logs -f`
4. Check GPU health: `nvidia-smi`
5. See troubleshooting in `README.md`

---

**Estimated Setup Time**: 30 minutes + 2-4 hours for model downloads

**Status Indicators**:
- ✅ Ready for production when all validation checks pass
- ⚠️ Warnings are acceptable (Tailscale, Cloudflared optional)
- ❌ Failed checks must be fixed before use

---

**Last Updated**: 2026-01-22
