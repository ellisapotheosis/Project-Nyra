# Nyra Fleet PC Runbook

> **Copy-paste commands** to get each PC up and running with the devcontainer.

---

## PC 1: Orchestrator (UH680 Mini PC)

**Hardware:** Ryzen 7 6800H, 16GB DDR5, 1TB SSD  
**Role:** Central dev environment + full infra stack  
**OS:** Windows 11 + WSL2 Ubuntu

### Step 1: Install prerequisites

```powershell
# Windows (as Admin)
# Install WSL2 if not present
wsl --install -d Ubuntu

# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop/

# Install Tailscale
# Download from: https://tailscale.com/download/windows

# Install Git for Windows
# Download from: https://git-scm.com/download/win

# Install VS Code
# Download from: https://code.visualstudio.com/
```

### Step 2: Configure Tailscale

```powershell
# Join tailnet (interactive auth)
tailscale up

# Set machine name (optional)
tailscale set --hostname orchestrator-mini
```

### Step 3: Clone repo in WSL (recommended)

```bash
# In WSL Ubuntu terminal
cd ~
mkdir -p projects
cd projects
git clone https://github.com/ellisapotheosis/project-nyra.git
cd project-nyra
```

### Step 4: Open in VS Code

```bash
code .
```

When VS Code prompts **"Reopen in Container"**, click it.

### Step 5: Inside devcontainer

```bash
# Install dependencies
pnpm install

# Start infrastructure
pnpm infra:up

# Verify health
docker ps
pnpm health:check

# Start dev servers
pnpm dev
```

### Step 6: Verify services

- Nyra Admin: http://localhost:3000
- Nyra API: http://localhost:8000
- Nexus Router: http://localhost:12010/nyra/complete
- Archon UI: http://localhost:3737
- Grafana: http://localhost:3001

### Step 7: Configure Cloudflared (optional)

```powershell
# Windows (as Admin)
# Download cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

# Install as service (use token from Cloudflare dashboard)
cloudflared service install <YOUR_TUNNEL_TOKEN>
```

---

## PC 2: Desktop (RTX 3090Ti Worker)

**Hardware:** RTX 3090Ti  
**Role:** Primary GPU worker for LLM inference (Quote Engine)  
**OS:** Windows 11

### Step 1: Install prerequisites

```powershell
# Windows (as Admin)
# Install Docker Desktop
# Install Tailscale
# Install Git
# Install VS Code
# Install NVIDIA GPU drivers + CUDA toolkit
```

### Step 2: Configure Tailscale

```powershell
tailscale up
tailscale set --hostname worker-rtx3090ti
```

### Step 3: Clone repo

```powershell
cd C:\Dev\Projects\Repos
git clone https://github.com/ellisapotheosis/project-nyra.git Project-Nyra
cd Project-Nyra
code .
```

### Step 4: Reopen in container

Click **"Reopen in Container"** in VS Code.

### Step 5: Inside devcontainer (worker mode)

```bash
# Set worker env
source .devcontainer/nyra-worker-env.sh

# Verify orchestrator connectivity
curl http://orchestrator-mini:8000/health

# Install dependencies (if needed)
pnpm install
```

### Step 6: Start LLM service on host (outside container)

```powershell
# In separate PowerShell window (host OS, not devcontainer)
# Install Ollama: https://ollama.ai/download

# Pull models
ollama pull llama2
ollama pull mistral

# Ollama runs as service on http://localhost:11434
# Accessible from orchestrator via: http://worker-rtx3090ti:11434
```

### Step 7: Test worker-orchestrator connection

```bash
# From devcontainer
curl http://orchestrator-mini:12010/nyra/complete/health
```

---

## PC 3: M15R7 (RTX 3060 Worker)

**Hardware:** Alienware M15R7, RTX 3060  
**Role:** Secondary GPU worker (Campaign Engine)  
**OS:** Windows 11

### Commands (same as Desktop worker)

```powershell
# Prerequisites
# Install Docker Desktop, Tailscale, Git, VS Code, NVIDIA drivers

# Tailscale
tailscale up
tailscale set --hostname worker-rtx3060

# Clone
cd C:\Dev\Projects\Repos
git clone https://github.com/ellisapotheosis/project-nyra.git Project-Nyra
cd Project-Nyra
code .

# Reopen in container → click prompt
```

Inside devcontainer:

```bash
source .devcontainer/nyra-worker-env.sh
curl http://orchestrator-mini:8000/health
pnpm install
```

LLM service on host:

```powershell
# Install Ollama
ollama pull llama2
# Service runs on http://localhost:11434
```

---

## PC 4: Area-51 (RTX 5090 Worker)

**Hardware:** Alienware Area-51, RTX 5090  
**Role:** Primary GPU worker for Dify + high-capacity inference  
**OS:** Windows 11

### Commands (same as other workers)

```powershell
# Prerequisites
# Install Docker Desktop, Tailscale, Git, VS Code, NVIDIA drivers

# Tailscale
tailscale up
tailscale set --hostname worker-rtx5090

# Clone
cd C:\Dev\Projects\Repos
git clone https://github.com/ellisapotheosis/project-nyra.git Project-Nyra
cd Project-Nyra
code .

# Reopen in container
```

Inside devcontainer:

```bash
source .devcontainer/nyra-worker-env.sh
curl http://orchestrator-mini:8000/health
pnpm install
```

LLM service on host:

```powershell
# Install Ollama
ollama pull llama2
ollama pull mistral
ollama pull llama3:70b  # RTX 5090 can handle larger models

# Optional: install vLLM for higher throughput
# Follow: https://docs.vllm.ai/en/latest/getting_started/installation.html
```

---

## Fleet-wide verification

### From orchestrator devcontainer:

```bash
# Check all workers are reachable via Tailscale
ping worker-rtx3090ti
ping worker-rtx3060
ping worker-rtx5090

# Test LLM endpoints
curl http://worker-rtx3090ti:11434/api/tags
curl http://worker-rtx3060:11434/api/tags
curl http://worker-rtx5090:11434/api/tags
```

### From any worker devcontainer:

```bash
# Verify orchestrator services
curl http://orchestrator-mini:8000/health
curl http://orchestrator-mini:12010/nyra/complete/health
curl http://orchestrator-mini:6333  # Qdrant
curl http://orchestrator-mini:5432  # Postgres
```

---

## Quick troubleshooting

### "Tailscale connection fails"

```powershell
# Check status
tailscale status

# Re-authenticate
tailscale up

# Check firewall (allow Tailscale)
```

### "Docker not running"

```powershell
# Start Docker Desktop
# Ensure WSL integration enabled (Settings → Resources → WSL Integration)
```

### "Devcontainer fails to build"

```bash
# Rebuild from scratch
# VS Code Command Palette: Dev Containers: Rebuild Container
```

### "GPU not accessible to Ollama"

```powershell
# Verify NVIDIA driver
nvidia-smi

# Restart Ollama service
# Task Manager → Services → Ollama → Restart
```

---

## Summary: commands by role

### Orchestrator daily workflow

```bash
cd ~/projects/project-nyra  # WSL
code .  # Open in VS Code
# → Reopen in Container
pnpm infra:up
pnpm dev
```

### Worker daily workflow

```bash
cd C:\Dev\Projects\Repos\Project-Nyra
code .
# → Reopen in Container
source .devcontainer/nyra-worker-env.sh
# LLM service already running on host
```

---

**Next:** Review `.devcontainer/README.md` for detailed architecture and troubleshooting.
