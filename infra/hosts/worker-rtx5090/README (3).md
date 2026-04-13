# Worker RTX 5090 Setup Guide

**GPU**: NVIDIA RTX 5090 (48GB VRAM)
**Purpose**: Complex reasoning tasks (mortgage calculations, compliance analysis)
**Primary Models**: DeepSeek-R1 236B, Qwen 2.5 72B
**Role**: Primary inference worker for most demanding LLM tasks

---

## 🎯 Overview

This worker handles the most computationally intensive AI tasks in Project Nyra:
- **DeepSeek-R1 236B**: Complex mortgage calculations, multi-step reasoning, compliance validation
- **Qwen 2.5 72B**: General-purpose reasoning, loan qualification logic, document analysis

With 48GB VRAM, this worker can run these massive models efficiently, providing 80% cost savings vs cloud inference.

---

## 📋 Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **GPU** | RTX 5090 48GB | RTX 5090 48GB |
| **RAM** | 32GB | 64GB+ |
| **Storage** | 500GB free | 1TB+ SSD |
| **Network** | 100Mbps | 1Gbps LAN |
| **OS** | Windows 10 | Windows 11 |

---

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

Run the setup script as Administrator:

```powershell
# Navigate to this directory
cd C:\Dev\Projects\Repos\Project-Nyra\infra\workers\worker-5090

# Run full setup
.\setup-worker-5090.ps1

# Or skip certain steps
.\setup-worker-5090.ps1 -SkipDocker -SkipModels

# Non-interactive mode
.\setup-worker-5090.ps1 -AutoYes
```

**What it does:**
1. Checks prerequisites (Windows version, disk space, RAM)
2. Installs/verifies Docker Desktop
3. Installs/verifies NVIDIA drivers and CUDA 12.4+
4. Sets up Infisical agent for secret management
5. Configures Tailscale for secure networking
6. Installs and configures Ollama
7. Pulls DeepSeek-R1 236B and Qwen 2.5 72B (2-4 hours)
8. Sets up Docker Compose stack
9. Configures health monitoring

---

### Option 2: Manual Setup

#### Step 1: Install Prerequisites

**Docker Desktop:**
```powershell
# Download and install
https://www.docker.com/products/docker-desktop

# Enable WSL 2 backend
# Enable GPU support in Settings > Resources > WSL Integration
```

**NVIDIA Drivers:**
```powershell
# Download Game Ready or Studio drivers
https://www.nvidia.com/Download/index.aspx

# Select: RTX 50 Series > RTX 5090 > Windows 10/11
# Install and reboot
```

**CUDA Toolkit 12.4+ (optional for native Ollama):**
```powershell
https://developer.nvidia.com/cuda-downloads
```

**Verify GPU:**
```bash
nvidia-smi

# Expected output:
# GPU 0: NVIDIA GeForce RTX 5090 (48GB)
```

---

#### Step 2: Install Ollama

**Download and install:**
```powershell
# Download installer
Invoke-WebRequest -Uri "https://ollama.com/download/OllamaSetup.exe" -OutFile "$env:TEMP\OllamaSetup.exe"

# Run installer
Start-Process "$env:TEMP\OllamaSetup.exe" -Wait
```

**Configure for network access:**
```powershell
# Set environment variables
[System.Environment]::SetEnvironmentVariable('OLLAMA_HOST', '0.0.0.0:11434', 'User')
[System.Environment]::SetEnvironmentVariable('OLLAMA_MAX_LOADED_MODELS', '2', 'User')
[System.Environment]::SetEnvironmentVariable('OLLAMA_NUM_PARALLEL', '8', 'User')
[System.Environment]::SetEnvironmentVariable('OLLAMA_KEEP_ALIVE', '30m', 'User')

# Restart Ollama
Stop-Process -Name "Ollama" -Force -ErrorAction SilentlyContinue
Start-Process "$env:LOCALAPPDATA\Programs\Ollama\Ollama.exe"
```

**Verify Ollama:**
```bash
curl http://localhost:11434/api/tags
```

---

#### Step 3: Pull Models

**DeepSeek-R1 236B (Primary - ~130GB):**
```bash
ollama pull deepseek-r1:236b-instruct-q4_K_M

# This will take 1-2 hours depending on your connection
# Ensure stable internet and sufficient disk space
```

**Qwen 2.5 72B (Secondary - ~48GB):**
```bash
ollama pull qwen2.5:72b-instruct-q5_K_M

# This will take 30-60 minutes
```

**Verify models:**
```bash
curl http://localhost:11434/api/tags

# Should show both models listed
```

**Test inference:**
```bash
# Test DeepSeek-R1 (complex reasoning)
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1:236b-instruct-q4_K_M",
  "prompt": "Calculate DTI ratio for borrower with $8,000 monthly income and $2,500 in debts. Explain if they qualify for conventional loan.",
  "stream": false
}'

# Test Qwen 2.5 (general purpose)
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:72b-instruct-q5_K_M",
  "prompt": "What are the key TRID disclosure requirements for mortgage lending?",
  "stream": false
}'
```

---

#### Step 4: Setup Infisical (Secret Management)

```powershell
# Install Infisical CLI
scoop install infisical

# Or download binary
https://github.com/Infisical/infisical/releases/latest

# Login
infisical login

# Download secrets
$projectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
infisical secrets get --projectId="$projectId" --env="dev" --path="/worker-5090" --format=dotenv > .env
```

**Required secrets:**
- `TAILSCALE_KEY` - Tailscale auth key
- `GPU_WORKER_ID` - Unique worker identifier
- `NEXUS_ROUTER_URL` - Nexus router endpoint
- `NEXUS_ADMIN_TOKEN` - Admin token for registration
- `LITELLM_MASTER_KEY` - LiteLLM API key
- `PROMETHEUS_PUSH_GATEWAY` - Prometheus endpoint

---

#### Step 5: Setup Tailscale

```powershell
# Download and install
https://tailscale.com/download/windows

# Connect to network
tailscale up --authkey="YOUR_AUTH_KEY"

# Verify connection
tailscale status

# Get IP address
tailscale ip -4
```

---

#### Step 6: Start Docker Stack

**Create configuration files:**

```bash
# Copy environment template
cp .env.worker-5090.template .env

# Edit .env with your values
notepad .env
```

**Start services:**
```bash
# Start all services
docker compose -f docker-compose.worker-5090.yml up -d

# Check status
docker compose -f docker-compose.worker-5090.yml ps

# View logs
docker compose -f docker-compose.worker-5090.yml logs -f

# View specific service
docker compose -f docker-compose.worker-5090.yml logs -f ollama
```

**Verify services:**
```bash
# Ollama
curl http://localhost:11434/api/tags

# LiteLLM
curl http://localhost:4000/health

# Model Manager
curl http://localhost:8080/health

# Performance Monitor
curl http://localhost:9090/metrics

# Health Check
curl http://localhost:8081/health
```

---

#### Step 7: Setup Health Monitoring

```powershell
# Run health monitor in foreground
.\health-monitor.ps1

# Or run in background
Start-Job -FilePath .\health-monitor.ps1 -Name "Worker5090Health"

# Check background job
Get-Job -Name "Worker5090Health"

# View job output
Receive-Job -Name "Worker5090Health"
```

---

## 🔧 Configuration

### Ollama Configuration

Create `~/.ollama/config.json`:
```json
{
  "keep_alive": "30m",
  "max_loaded_models": 2,
  "num_parallel": 8,
  "num_gpu": 1,
  "max_vram": "46GB"
}
```

Or use environment variables (already set by setup script):
```powershell
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_MAX_LOADED_MODELS=2
OLLAMA_NUM_PARALLEL=8
OLLAMA_KEEP_ALIVE=30m
```

---

### LiteLLM Configuration

Create `litellm-config.yaml`:
```yaml
model_list:
  - model_name: deepseek-r1-236b
    litellm_params:
      model: ollama/deepseek-r1:236b-instruct-q4_K_M
      api_base: http://ollama:11434

  - model_name: qwen-2.5-72b
    litellm_params:
      model: ollama/qwen2.5:72b-instruct-q5_K_M
      api_base: http://ollama:11434

general_settings:
  master_key: ${LITELLM_MASTER_KEY}
  database_url: ${LITELLM_DATABASE_URL}

litellm_settings:
  drop_params: true
  success_callback: ["prometheus"]
  failure_callback: ["prometheus"]
```

---

### Worker Configuration

Create `worker-5090-config.yaml`:
```yaml
worker:
  id: worker-5090
  role: primary_reasoning
  gpu:
    type: rtx_5090
    vram_gb: 48
    compute_capability: 8.9

  specialization:
    - complex_reasoning
    - mortgage_calculations
    - compliance_analysis
    - multi_step_logic

  models:
    primary:
      - name: deepseek-r1:236b-instruct-q4_K_M
        vram_usage: 130
        use_cases:
          - mortgage_qualification
          - compliance_validation
          - complex_calculations

      - name: qwen2.5:72b-instruct-q5_K_M
        vram_usage: 48
        use_cases:
          - general_reasoning
          - document_analysis
          - loan_logic

  networking:
    tailscale_hostname: worker-5090.tail-net.ts.net
    local_ip: ${MACHINE_IP_ETHERNET}
    ollama_port: 11434
    litellm_port: 4000

  monitoring:
    prometheus_port: 9090
    health_check_port: 8081
    log_level: info

  performance:
    gpu_temp_warning: 80
    gpu_temp_critical: 85
    vram_usage_warning: 85
    vram_usage_critical: 95
    check_interval: 30s
```

---

## 🌐 Networking

### Local Access
```bash
# Ollama API
http://localhost:11434

# LiteLLM Proxy
http://localhost:4000

# Model Manager
http://localhost:8080

# Performance Monitor
http://localhost:9090/metrics

# Health Check
http://localhost:8081/health
```

### Tailscale Access
```bash
# Get your Tailscale IP
tailscale ip -4

# Access from other machines
http://YOUR_TAILSCALE_IP:11434
http://worker-5090.tail-net.ts.net:11434
```

### Cloudflared Tunnel (Optional)

Create `cloudflared-config.yml`:
```yaml
tunnel: worker-5090
credentials-file: /path/to/credentials.json

ingress:
  - hostname: worker-5090.ratehunter.net
    service: http://localhost:11434
    originRequest:
      noTLSVerify: false
      connectTimeout: 30s

  - hostname: litellm-5090.ratehunter.net
    service: http://localhost:4000

  - service: http_status:404
```

Start tunnel:
```bash
cloudflared tunnel run --config cloudflared-config.yml worker-5090
```

---

## 📊 Monitoring

### GPU Monitoring
```bash
# Real-time GPU stats
nvidia-smi dmon -s pucvmet

# Continuous monitoring (update every 2s)
watch -n 2 nvidia-smi

# Log to file
nvidia-smi --query-gpu=timestamp,name,temperature.gpu,utilization.gpu,utilization.memory,memory.used,memory.free --format=csv -l 5 >> gpu-metrics.csv
```

### Ollama Monitoring
```bash
# Check loaded models
curl http://localhost:11434/api/ps

# Model details
curl http://localhost:11434/api/show -d '{"name": "deepseek-r1:236b-instruct-q4_K_M"}'

# List available models
curl http://localhost:11434/api/tags
```

### Performance Metrics
```bash
# Prometheus metrics
curl http://localhost:9090/metrics

# Health status
curl http://localhost:8081/health
```

### Docker Logs
```bash
# All services
docker compose -f docker-compose.worker-5090.yml logs -f

# Specific service
docker compose -f docker-compose.worker-5090.yml logs -f ollama

# Last 100 lines
docker compose -f docker-compose.worker-5090.yml logs --tail=100 ollama
```

---

## 🔧 Troubleshooting

### Ollama Not Starting
```bash
# Check process
Get-Process | Where-Object {$_.ProcessName -like '*ollama*'}

# View logs
Get-Content "$env:LOCALAPPDATA\Ollama\logs\server.log" -Tail 50

# Kill and restart
Stop-Process -Name "Ollama" -Force
Start-Process "$env:LOCALAPPDATA\Programs\Ollama\Ollama.exe"
```

### GPU Not Detected
```bash
# Verify NVIDIA driver
nvidia-smi

# Check CUDA
nvcc --version

# Verify Docker GPU access
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi
```

### Out of VRAM
```bash
# Unload all models (set keep_alive to 0)
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1:236b-instruct-q4_K_M",
  "keep_alive": 0
}'

# Check VRAM usage
nvidia-smi --query-gpu=memory.used,memory.free --format=csv
```

### Model Download Failed
```bash
# Check disk space
Get-PSDrive C

# Verify network
Test-NetConnection huggingface.co -Port 443

# Resume interrupted download
ollama pull deepseek-r1:236b-instruct-q4_K_M
```

### Slow Inference
**Possible causes:**
- Other GPU processes running (close them)
- Insufficient VRAM (use smaller quantization)
- Thermal throttling (check GPU temp)
- CPU bottleneck (upgrade to higher core count)

**Solutions:**
```bash
# Use Q3 quantization for faster inference
ollama pull deepseek-r1:236b-instruct-q3_K_M

# Reduce parallel requests
OLLAMA_NUM_PARALLEL=4

# Increase keep_alive to avoid reloading
OLLAMA_KEEP_ALIVE=60m
```

### Docker Services Not Starting
```bash
# Check Docker daemon
docker info

# Restart Docker Desktop
Restart-Service docker

# View service logs
docker compose -f docker-compose.worker-5090.yml logs --tail=50

# Rebuild services
docker compose -f docker-compose.worker-5090.yml up -d --build
```

---

## 🧪 Validation

Run the validation script:
```powershell
.\validate-setup.ps1

# Or run specific checks
.\validate-setup.ps1 -CheckGPU
.\validate-setup.ps1 -CheckOllama
.\validate-setup.ps1 -CheckDocker
.\validate-setup.ps1 -CheckModels
```

**Expected output:**
```
✓ GPU detected: RTX 5090 48GB
✓ NVIDIA driver version: 551.76
✓ CUDA version: 12.4
✓ Ollama running on port 11434
✓ Docker services: 5/5 healthy
✓ Models: DeepSeek-R1 236B, Qwen 2.5 72B
✓ Tailscale connected
✓ Health monitor active
```

---

## 📈 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Model Load Time** | DeepSeek-R1: <60s, Qwen: <30s | `curl /api/ps` |
| **Inference Latency** | DeepSeek-R1: 2-5s, Qwen: 1-3s | `time curl generate` |
| **GPU Utilization** | >70% average | `nvidia-smi dmon` |
| **VRAM Usage** | <95% max | `nvidia-smi --query-gpu=memory.used` |
| **GPU Temperature** | <80°C normal, <85°C peak | `nvidia-smi --query-gpu=temperature.gpu` |
| **Uptime** | >99.5% | Health monitor logs |
| **API Response Time** | <100ms (excluding inference) | `/health` endpoint |

---

## 🔗 Integration with Nexus Router

Update Nexus Router configuration in `infra/nexus/nexus-config.yaml`:

```yaml
workers:
  - id: worker-5090
    role: primary_reasoning
    url: http://worker-5090.tail-net.ts.net:11434
    # Or use Tailscale IP: http://100.x.x.x:11434

    models:
      - deepseek-r1:236b-instruct-q4_K_M
      - qwen2.5:72b-instruct-q5_K_M

    specialization:
      - complex_reasoning
      - mortgage_calculations
      - compliance_analysis

    priority: 1  # Highest priority for complex tasks
    max_concurrent: 4
    timeout: 300s

    health_check:
      endpoint: http://worker-5090.tail-net.ts.net:8081/health
      interval: 30s
```

Or use environment variables:
```bash
WORKER_5090_URL=http://worker-5090.tail-net.ts.net:11434
WORKER_5090_MODELS=deepseek-r1:236b-instruct-q4_K_M,qwen2.5:72b-instruct-q5_K_M
WORKER_5090_SPECIALIZATION=complex_reasoning,mortgage_calculations,compliance_analysis
```

---

## 📚 Resources

- **Ollama Documentation**: https://github.com/ollama/ollama/blob/main/docs/
- **DeepSeek-R1**: https://ollama.com/library/deepseek-r1
- **Qwen 2.5**: https://ollama.com/library/qwen2.5
- **LiteLLM**: https://docs.litellm.ai/
- **Docker Compose**: https://docs.docker.com/compose/
- **NVIDIA Container Toolkit**: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/
- **Tailscale**: https://tailscale.com/kb/

---

## 🆘 Support

For issues:
1. Check this README troubleshooting section
2. Run `.\validate-setup.ps1` for diagnostics
3. Review logs: `docker compose logs -f`
4. Check GPU health: `nvidia-smi`
5. See cluster setup guide: `infra/cluster-setup/CLUSTER-SETUP-GUIDE.md`
6. Project documentation: `CLAUDE.md`

---

**Last Updated**: 2026-01-22
**Maintainer**: Project Nyra Infrastructure Team
