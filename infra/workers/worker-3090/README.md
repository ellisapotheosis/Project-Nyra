# GPU Worker-3090 Setup Guide

**RTX 3090 Ti (24GB VRAM) - General Purpose LLM Worker**

## Overview

Worker-3090 is a GPU-accelerated worker node for Project Nyra's distributed LLM infrastructure. It runs Ollama with large language models for general-purpose tasks including quote generation, document extraction, and conversation handling.

### Hardware Specifications

- **GPU**: NVIDIA RTX 3090 Ti
- **VRAM**: 24GB GDDR6X
- **Purpose**: General purpose inference
- **Primary Model**: Llama 3.1 70B (~40GB disk)
- **Secondary Model**: Mistral Large 123B (~70GB disk)
- **Port**: 11434 (Ollama API)

### System Requirements

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 32GB+ recommended
- **Disk**: 500GB+ free space (for models)
- **Network**: Gigabit Ethernet or faster
- **GPU Driver**: NVIDIA 535.xx or later
- **CUDA**: 12.4 or later

## Quick Start

### 1. Run Setup Script

Open PowerShell as Administrator:

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\workers\worker-3090

# Full setup (installs everything)
.\setup-worker-3090.ps1

# Skip driver installation (if already installed)
.\setup-worker-3090.ps1 -SkipDrivers

# Skip model download (pull models later)
.\setup-worker-3090.ps1 -SkipModels

# Dry run (see what would be executed)
.\setup-worker-3090.ps1 -DryRun
```

### 2. Configure Infisical Authentication

Before running the setup script, authenticate with Infisical:

```powershell
# Install Infisical CLI
choco install infisical -y

# Login to Infisical
infisical login

# Create machine identity token at:
# https://app.infisical.com/project/8374cea9-e5e8-4050-bda4-b91f25ab30ef/settings/tokens

# Set token as environment variable
$env:INFISICAL_TOKEN = "your-token-here"

# Verify connection
infisical secrets list --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/worker-3090"
```

### 3. Verify Installation

```powershell
# Run health check
.\health-check.ps1

# Test Ollama
ollama run llama3.1:70b "Explain mortgage DTI calculation"

# Check Docker containers
docker-compose ps

# View logs
docker-compose logs -f ollama
```

## Architecture

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `ollama` | 11434 | Ollama LLM server with GPU passthrough |
| `health-monitor` | - | Periodic health checks and metrics |
| `promtail` | - | Log shipper to Loki |
| `node-exporter` | 9100 | System metrics for Prometheus |
| `nvidia-gpu-exporter` | 9835 | GPU metrics for Prometheus |

### Network Configuration

- **Tailscale VPN**: Private mesh network (worker-3090.tail-net.ts.net)
- **Cloudflared Tunnel**: Secure external access
- **Ollama API**: `http://localhost:11434` (local) or `http://worker-3090.tail-net.ts.net:11434` (VPN)

### Model Configuration

#### Primary Model: Llama 3.1 70B

- **Size**: ~40GB disk, ~48GB VRAM (quantized to 24GB)
- **Use Cases**: Quote generation, document summarization, borrower Q&A
- **Context**: 128K tokens
- **Performance**: ~15-20 tokens/sec on RTX 3090 Ti

#### Secondary Model: Mistral Large 123B

- **Size**: ~70GB disk, ~80GB VRAM (quantized to 24GB with offloading)
- **Use Cases**: Complex reasoning, compliance analysis, multi-step workflows
- **Context**: 32K tokens
- **Performance**: ~8-12 tokens/sec on RTX 3090 Ti

## Usage

### Testing Ollama API

```powershell
# List available models
curl http://localhost:11434/api/tags

# Generate completion
curl -X POST http://localhost:11434/api/generate `
  -H "Content-Type: application/json" `
  -d '{"model":"llama3.1:70b","prompt":"Calculate DTI for income $8000, debts $3000","stream":false}'

# Chat completion
curl -X POST http://localhost:11434/api/chat `
  -H "Content-Type: application/json" `
  -d '{"model":"llama3.1:70b","messages":[{"role":"user","content":"Explain mortgage pre-approval"}],"stream":false}'
```

### Pulling Additional Models

```powershell
# List available models on Ollama registry
ollama list

# Pull a specific model
ollama pull llama3.1:70b

# Pull with specific quantization
ollama pull llama3.1:70b-q4_K_M

# Remove a model
ollama rm llama3.1:70b
```

### Managing Docker Stack

```powershell
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart ollama

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f ollama

# Scale health monitors (not needed, just example)
docker-compose up -d --scale health-monitor=2
```

### Monitoring

#### GPU Metrics

```powershell
# Check GPU usage
nvidia-smi

# Watch GPU usage in real-time
nvidia-smi -l 1

# Get detailed GPU info
nvidia-smi -q

# Check from Prometheus exporter
curl http://localhost:9835/metrics | Select-String "nvidia"
```

#### System Metrics

```powershell
# Node exporter metrics
curl http://localhost:9100/metrics

# Docker stats
docker stats

# Container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

#### Log Analysis

```powershell
# Ollama logs
Get-Content .\logs\ollama\ollama.log -Tail 100 -Wait

# Health monitor logs
Get-Content .\logs\health\health-monitor.log -Tail 50 -Wait

# Docker logs
docker-compose logs --tail=100 -f ollama
```

## Integration with Nexus Router

### Register Worker with Nexus

```powershell
# Get Nexus Router URL from environment
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

# Check registration status
curl "$nexusUrl/api/workers/worker-3090"
```

### Test End-to-End Request

```powershell
# Request via Nexus Router (auto-routes to Worker-3090)
curl -X POST "$nexusUrl/v1/chat/completions" `
  -H "Content-Type: application/json" `
  -d '{
    "model": "llama3.1:70b",
    "messages": [{"role":"user","content":"Calculate DTI for income $8000, debts $3000"}],
    "temperature": 0.7
  }'
```

## Troubleshooting

### Ollama Not Starting

```powershell
# Check if Ollama process is running
Get-Process ollama

# Restart Ollama service
Stop-Process -Name ollama -Force
Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden

# Check Ollama logs
Get-Content "$env:LOCALAPPDATA\Ollama\logs\server.log" -Tail 50
```

### GPU Not Detected

```powershell
# Verify NVIDIA driver
nvidia-smi

# Check Docker GPU access
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi

# Restart Docker Desktop
Restart-Service docker
```

### Models Not Loading

```powershell
# Check disk space
Get-PSDrive C

# Check model files
Get-ChildItem "$env:USERPROFILE\.ollama\models" -Recurse

# Re-pull corrupted model
ollama rm llama3.1:70b
ollama pull llama3.1:70b
```

### Network Connectivity Issues

```powershell
# Check Tailscale status
tailscale status

# Reconnect Tailscale
tailscale up

# Test Ollama API
curl http://localhost:11434/api/tags
curl http://worker-3090.tail-net.ts.net:11434/api/tags
```

### High Memory Usage

```powershell
# Check system memory
Get-CimInstance Win32_ComputerSystem | Select-Object TotalPhysicalMemory

# Check Docker memory
docker stats --no-stream

# Restart Ollama to free memory
docker-compose restart ollama
```

## Performance Tuning

### Ollama Configuration

Edit `.env` file:

```env
# Increase concurrent requests
OLLAMA_NUM_PARALLEL=4

# Adjust context window
OLLAMA_NUM_CTX=4096

# Enable flash attention
OLLAMA_FLASH_ATTENTION=1

# GPU layers (increase for more VRAM usage)
OLLAMA_NUM_GPU=35
```

### Docker Resource Limits

Edit `docker-compose.worker-3090.yml`:

```yaml
services:
  ollama:
    deploy:
      resources:
        limits:
          cpus: '16'
          memory: 32G
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
              options:
                - compute
                - utility
```

### Windows Power Settings

```powershell
# Set high performance power plan
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

# Disable sleep
powercfg /change standby-timeout-ac 0
powercfg /change standby-timeout-dc 0
```

## Maintenance

### Regular Tasks

```powershell
# Update Ollama models (monthly)
ollama pull llama3.1:70b
ollama pull mistral-large:123b

# Update Docker images (weekly)
docker-compose pull
docker-compose up -d

# Clean up old logs (weekly)
Remove-Item .\logs\* -Recurse -Force -Older 7

# Check disk space (daily)
Get-PSDrive C

# Run health check (hourly via Task Scheduler)
.\health-check.ps1
```

### Backup

```powershell
# Backup Ollama models
Copy-Item "$env:USERPROFILE\.ollama\models" -Destination "D:\Backups\ollama-models" -Recurse

# Backup configuration
Copy-Item .env -Destination .env.backup
Copy-Item docker-compose.worker-3090.yml -Destination docker-compose.worker-3090.yml.backup

# Backup logs
Compress-Archive -Path .\logs -DestinationPath "D:\Backups\worker-3090-logs-$(Get-Date -Format 'yyyy-MM-dd').zip"
```

## Security

### Firewall Rules

```powershell
# Allow Ollama port (if needed for external access)
New-NetFirewallRule -DisplayName "Ollama API" -Direction Inbound -Protocol TCP -LocalPort 11434 -Action Allow

# Allow Node Exporter
New-NetFirewallRule -DisplayName "Node Exporter" -Direction Inbound -Protocol TCP -LocalPort 9100 -Action Allow

# Allow NVIDIA Exporter
New-NetFirewallRule -DisplayName "NVIDIA GPU Exporter" -Direction Inbound -Protocol TCP -LocalPort 9835 -Action Allow
```

### Environment Variables

Never commit `.env` file to git. Use Infisical for secret management:

```powershell
# Pull secrets from Infisical
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/worker-3090" -- docker-compose up -d
```

## Support

### Logs

- **Ollama**: `.\logs\ollama\ollama.log`
- **Health Monitor**: `.\logs\health\health-monitor.log`
- **Docker**: `docker-compose logs`
- **Windows Event Log**: `Get-EventLog -LogName Application -Source Docker`

### Documentation

- **Project Nyra**: `C:\Dev\Projects\Repos\Project-Nyra\CLAUDE.md`
- **Ollama Docs**: https://ollama.ai/docs
- **Docker Docs**: https://docs.docker.com/
- **Tailscale Docs**: https://tailscale.com/kb/

### Contact

- **Project**: Project Nyra
- **Component**: GPU Worker-3090
- **Owner**: Infrastructure Team
- **Repository**: https://github.com/your-org/project-nyra

---

**Last Updated**: 2026-01-22
**Version**: 1.0.0
**Status**: Production Ready
