# Worker-3060 Quick Start Guide

Get your RTX 3060 GPU worker running in under 30 minutes.

## Prerequisites

- Windows 10/11 Pro (for Docker Desktop)
- RTX 3060 GPU installed
- 16GB+ RAM recommended
- 150GB+ free disk space
- Administrator access

## Step-by-Step Setup

### 1. Run the Setup Script

Open PowerShell as Administrator:

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\workers\worker-3060

# Run setup
.\setup-worker-3060.ps1
```

This will install:
- Chocolatey package manager
- NVIDIA drivers and CUDA 12.4
- Docker Desktop
- Ollama with 3 models
- Infisical CLI
- Tailscale VPN
- Cloudflared tunnel
- Python and Node.js

**Expected time**: 20-45 minutes (depending on download speeds)

### 2. Restart Your Computer

After the setup completes, restart to ensure all drivers are loaded:

```powershell
Restart-Computer
```

### 3. Authenticate Services

After reboot, open PowerShell as Administrator:

```powershell
# Infisical authentication
infisical login

# Tailscale authentication (opens browser)
tailscale up

# Optional: Cloudflare tunnel
cloudflared tunnel login
```

### 4. Pull Secrets and Start Services

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\workers\worker-3060

# Option A: Use Infisical to inject secrets
infisical run --env=dev -- docker-compose -f docker-compose.worker-3060.yml up -d

# Option B: Use .env file
cp .env.example .env
# Edit .env with your secrets
docker-compose -f docker-compose.worker-3060.yml up -d
```

### 5. Verify Health

```powershell
# Run health check
.\health-check.ps1

# Check Docker services
docker-compose -f docker-compose.worker-3060.yml ps

# View logs
docker-compose -f docker-compose.worker-3060.yml logs -f
```

### 6. Test Ollama

```powershell
# Test local endpoint
curl http://localhost:11434/api/version

# Generate text
curl http://localhost:11434/api/generate -Method POST -Body '{"model":"codellama:34b","prompt":"Hello"}' -ContentType "application/json"

# List models
curl http://localhost:11434/api/tags
```

## Quick Commands

### Start Services
```powershell
docker-compose -f docker-compose.worker-3060.yml up -d
```

### Stop Services
```powershell
docker-compose -f docker-compose.worker-3060.yml down
```

### Restart Services
```powershell
docker-compose -f docker-compose.worker-3060.yml restart
```

### View Logs
```powershell
# All services
docker-compose -f docker-compose.worker-3060.yml logs -f

# Specific service
docker-compose -f docker-compose.worker-3060.yml logs -f ollama
```

### Check GPU
```powershell
nvidia-smi
```

### Health Check
```powershell
.\health-check.ps1
```

## Accessing Services

| Service | Local URL | Tailscale URL |
|---------|-----------|---------------|
| Ollama | http://localhost:11434 | http://worker-3060.tail-net.ts.net:11434 |
| ONNX Runtime | http://localhost:8001 | http://worker-3060.tail-net.ts.net:8001 |
| Embeddings | http://localhost:8080 | http://worker-3060.tail-net.ts.net:8080 |
| Health Monitor | http://localhost:9090 | http://worker-3060.tail-net.ts.net:9090 |
| Redis | localhost:6379 | worker-3060.tail-net.ts.net:6379 |

## Troubleshooting

### Docker not starting
```powershell
# Check Docker Desktop is running
Get-Process "Docker Desktop"

# Start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### GPU not detected
```powershell
# Check NVIDIA driver
nvidia-smi

# If error, reinstall driver:
choco install nvidia-display-driver --force -y
```

### Ollama models not pulling
```powershell
# Check disk space
Get-PSDrive C

# Manually pull models
ollama pull codellama:34b
ollama pull qwen2:32b
ollama pull gemma2:27b
```

### Services not healthy
```powershell
# Restart all services
docker-compose -f docker-compose.worker-3060.yml restart

# Check logs for errors
docker-compose -f docker-compose.worker-3060.yml logs --tail=50

# Rebuild services
docker-compose -f docker-compose.worker-3060.yml up -d --force-recreate
```

## Next Steps

1. **Register with Nexus Router**: Add worker to load balancer
2. **Configure Monitoring**: Connect to Prometheus/Grafana
3. **Setup Backups**: Schedule model and data backups
4. **Security Hardening**: Configure firewall rules and authentication
5. **Performance Tuning**: Optimize GPU memory and batch sizes

## Support

- **Full Documentation**: See `README.md`
- **Setup Issues**: Check `setup.log`
- **Service Logs**: `docker-compose logs -f`
- **Health Status**: `.\health-check.ps1`

## Validation Checklist

- [ ] NVIDIA driver installed (run `nvidia-smi`)
- [ ] Docker Desktop running with GPU support
- [ ] Ollama running on port 11434
- [ ] All 3 models pulled (codellama, qwen2, gemma2)
- [ ] Tailscale connected
- [ ] Health check passes
- [ ] Can generate text via Ollama API
- [ ] Services accessible via Tailscale network

Once all checkboxes are complete, your worker is ready for production!
