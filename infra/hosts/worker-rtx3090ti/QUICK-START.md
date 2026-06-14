# Worker-3090 Quick Start Guide

**5-Minute Setup for RTX 3090 Ti GPU Worker**

## Prerequisites Checklist

- [ ] Windows 10/11 (64-bit)
- [ ] RTX 3090 Ti GPU installed
- [ ] 32GB+ RAM
- [ ] 500GB+ free disk space
- [ ] Administrator access
- [ ] Internet connection

## Step 1: Install Chocolatey (2 minutes)

Open PowerShell as Administrator:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

## Step 2: Configure Infisical (1 minute)

```powershell
# Install Infisical CLI
choco install infisical -y

# Login
infisical login

# Set token (get from: https://app.infisical.com/project/<PROJECT_ID>/settings/tokens)
$env:INFISICAL_TOKEN = "YOUR_TOKEN_HERE"

# Test connection
infisical secrets list --projectId="<PROJECT_ID>" --env="dev" --path="/worker-3090"
```

## Step 3: Run Setup Script (30-60 minutes)

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\workers\worker-3090

# Full automated setup
.\setup-worker-3090.ps1

# Or with options:
.\setup-worker-3090.ps1 -SkipDrivers  # If NVIDIA drivers already installed
.\setup-worker-3090.ps1 -SkipModels   # To skip model downloads (do later)
.\setup-worker-3090.ps1 -DryRun       # Preview what will be executed
```

The script will:
- ✅ Check system requirements
- ✅ Install Docker Desktop
- ✅ Install NVIDIA drivers + CUDA 12.4
- ✅ Install Ollama
- ✅ Download Llama 3.1 70B + Mistral Large 123B (~110GB)
- ✅ Configure Tailscale VPN
- ✅ Setup Infisical secret management
- ✅ Start Docker Compose stack
- ✅ Run health checks

## Step 4: Verify Installation (1 minute)

```powershell
# Run health check
.\health-check.ps1

# Test Ollama
ollama list
ollama run llama3.1:70b "Hello, world!"

# Check Docker services
docker-compose ps

# Test API
curl http://localhost:11434/api/tags
```

## Step 5: Register with Nexus Router (1 minute)

```powershell
# Get Nexus URL
$nexusUrl = $env:NEXUS_ROUTER_URL

# Register worker
curl -X POST "$nexusUrl/api/workers/register" `
  -H "Content-Type: application/json" `
  -d '{
    "worker_id": "worker-3090",
    "worker_type": "gpu",
    "gpu_model": "RTX-3090-Ti",
    "vram": "24GB",
    "endpoints": ["http://worker-3090.tail-net.ts.net:11434"],
    "models": ["llama3.1:70b", "mistral-large:123b"],
    "capabilities": ["quote-generation", "document-extraction", "conversation"]
  }'

# Verify registration
curl "$nexusUrl/api/workers/worker-3090"
```

## Common Issues

### Issue: Docker not starting

```powershell
# Restart Docker Desktop
Restart-Service docker

# Or manually:
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Issue: Ollama not responding

```powershell
# Restart Ollama
Stop-Process -Name ollama -Force
Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden
Start-Sleep -Seconds 5
ollama list
```

### Issue: GPU not detected

```powershell
# Check GPU
nvidia-smi

# Update drivers
# Download from: https://www.nvidia.com/Download/index.aspx

# Test GPU in Docker
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi
```

### Issue: Models not downloading

```powershell
# Check disk space
Get-PSDrive C

# Manually pull models
ollama pull llama3.1:70b
ollama pull mistral-large:123b

# Check Ollama logs
Get-Content "$env:LOCALAPPDATA\Ollama\logs\server.log" -Tail 50
```

## What's Next?

1. **Monitor Performance**: Access Grafana at http://grafana:3005
2. **View Logs**: Check Loki at http://loki:3100
3. **Test Inference**: Run test prompts through Ollama
4. **Integration**: Connect to Nexus Router for production traffic
5. **Automation**: Set up scheduled health checks via Task Scheduler

## Support

- **Documentation**: See README.md in this directory
- **Project CLAUDE.md**: C:\Dev\Projects\Repos\Project-Nyra\CLAUDE.md
- **Health Checks**: Run `.\health-check.ps1` anytime
- **Logs**: Check `.\logs\` directory

## Quick Commands Reference

```powershell
# Health check
.\health-check.ps1

# Detailed health check
.\health-check.ps1 -Detailed

# JSON output (for monitoring)
.\health-check.ps1 -Json

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart Ollama
docker-compose restart ollama

# Test Ollama
ollama run llama3.1:70b "Test prompt"

# Check GPU
nvidia-smi

# Check Tailscale
tailscale status
```

## Resource Usage

Expected resource consumption:

| Resource | Usage |
|----------|-------|
| Disk | ~110GB (models) + ~20GB (system) |
| RAM | ~16-24GB during inference |
| VRAM | ~24GB (full model loaded) |
| Network | ~100GB download (initial setup) |
| CPU | Moderate during inference |

## Time Estimates

- **Initial Setup**: 30-60 minutes (depends on download speed)
- **Model Downloads**: 30-45 minutes (Llama 3.1 70B + Mistral Large 123B)
- **Daily Startup**: ~2-3 minutes
- **First Inference**: ~30 seconds (model loading)
- **Subsequent Inferences**: 15-20 tokens/sec (Llama 3.1 70B)

---

**Last Updated**: 2026-01-22
**Version**: 1.0.0
