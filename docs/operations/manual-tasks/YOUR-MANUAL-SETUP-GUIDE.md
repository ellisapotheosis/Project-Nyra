# Your Manual Setup Guide - Project Nyra 4-PC Infrastructure

**Created**: 2026-01-22
**For**: Hardware setup, networking, GPU configuration
**Time Required**: 8-12 hours (spread over 2-3 days)

---

## 🎯 What This Guide Covers

This guide contains **ONLY the steps you must do manually** that Claude cannot automate:

✅ **Physical Hardware Setup** (IPs, MACs, static assignments)
✅ **Cloudflared Tunnel Configuration** (4 PCs, Docker vs native)
✅ **Tailscale VPN Setup** (mesh networking)
✅ **GPU Configuration** (Ollama + vLLM + optimal models)
✅ **Network Testing** (connectivity verification)

**What Claude WILL automate after this**: Service deployment, Docker Compose orchestration, database migrations, MCP server configuration

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **4 PCs powered on and connected to same network**
  - PC1: Orchestrator (Minisforum UH680)
  - PC2: Worker RTX 3060
  - PC3: Worker RTX 5090
  - PC4: Worker RTX 3090

- [ ] **Network Equipment**
  - Router with DHCP enabled
  - Access to router admin panel
  - Ethernet cables for all PCs

- [ ] **Accounts Created**
  - Cloudflare account (with domain or use ratehunter.net)
  - Tailscale account (free tier works)
  - GitHub account (for pulling code)

- [ ] **Software Installed on Each PC**
  - Windows 11 Pro
  - Docker Desktop
  - WSL2 with Ubuntu 22.04
  - Git for Windows

---

## 🌐 PHASE 1: Network Hardware Inventory (30 minutes)

### Step 1.1: Gather IP and MAC Addresses

**On EACH of the 4 PCs**, open PowerShell and run:

```powershell
# Get network adapter info
Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Format-Table Name, InterfaceDescription, MacAddress, Status

# Get IP configuration
ipconfig /all | Select-String "IPv4", "Physical Address", "Default Gateway"
```

**Create this table** (fill in as you go):

| PC  | Role         | Current IP     | MAC Address    | Target Static IP | Gateway       |
| --- | ------------ | -------------- | -------------- | ---------------- | ------------- |
| PC1 | Orchestrator | ****\_\_\_**** | ****\_\_\_**** | `192.168.1.100`  | `192.168.1.1` |
| PC2 | RTX 3060     | ****\_\_\_**** | ****\_\_\_**** | `192.168.1.101`  | `192.168.1.1` |
| PC3 | RTX 5090     | ****\_\_\_**** | ****\_\_\_**** | `192.168.1.102`  | `192.168.1.1` |
| PC4 | RTX 3090     | ****\_\_\_**** | ****\_\_\_**** | `192.168.1.103`  | `192.168.1.1` |

**Save this table** - you'll need it for router configuration!

---

### Step 1.2: Configure Static IP Addresses

**Option A: Router-Based (RECOMMENDED)**

1. **Log into your router admin panel**
   - Usually `192.168.1.1` or `192.168.0.1`
   - Default credentials often on router label

2. **Find DHCP Reservation / Static IP section**
   - May be called: "DHCP Reservation", "Address Reservation", "Static IPs"

3. **Add 4 reservations** using the MAC addresses from Step 1.1:
   - `192.168.1.100` → PC1 MAC address (Orchestrator)
   - `192.168.1.101` → PC2 MAC address (RTX 3060)
   - `192.168.1.102` → PC3 MAC address (RTX 5090)
   - `192.168.1.103` → PC4 MAC address (RTX 3090)

4. **Save and reboot router** (if required)

5. **On each PC**, run:
   ```powershell
   ipconfig /release
   ipconfig /renew
   ipconfig /all  # Verify new static IP assigned
   ```

**Option B: Windows Network Settings (if router doesn't support reservations)**

On each PC:

1. Open **Settings** → **Network & Internet** → **Ethernet**
2. Click **Edit** next to IP assignment
3. Choose **Manual** → Enable **IPv4**
4. Enter:
   - **IP address**: From table above (e.g., `192.168.1.100` for PC1)
   - **Subnet mask**: `255.255.255.0`
   - **Gateway**: `192.168.1.1` (your router IP)
   - **DNS**: `1.1.1.1` (Cloudflare) and `8.8.8.8` (Google)
5. Click **Save**

---

### Step 1.3: Test Network Connectivity

**From PC1 (Orchestrator)**, test connectivity to all workers:

```powershell
# Test ping to each worker
ping 192.168.1.101 -n 4  # RTX 3060
ping 192.168.1.102 -n 4  # RTX 5090
ping 192.168.1.103 -n 4  # RTX 3090

# Test internet connectivity
ping 1.1.1.1 -n 4
```

**Expected**: All pings should succeed with <1ms latency (local network)

---

## 🔐 PHASE 2: Cloudflared Tunnel Setup (45 minutes)

### Decision: Docker vs Native Installation

**RECOMMENDED: Use Docker** for easier management and consistency.

| Method     | Pros                                      | Cons                        | Use When            |
| ---------- | ----------------------------------------- | --------------------------- | ------------------- |
| **Docker** | Easy updates, consistent config, portable | Slight overhead             | **Default choice**  |
| **Native** | Slightly faster, OS-level service         | Manual updates, OS-specific | Advanced users only |

**We'll use Docker method below.**

---

### Step 2.1: Create Cloudflare Tunnel (One-Time Setup)

1. **Log into Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Select your domain (or add ratehunter.net)

2. **Navigate to Zero Trust**
   - Click **Zero Trust** in left sidebar
   - Go to **Access** → **Tunnels**

3. **Create New Tunnel**
   - Click **Create a tunnel**
   - Choose **Cloudflared** tunnel type
   - Name it: `nyra-4pc-cluster`
   - Click **Save tunnel**

4. **Get Your Tunnel Token**
   - Cloudflare will show you a token like:
     ```
     eyJhIjoiMTIzNDU2Nzg5MGFiY2RlZiIsInQiOiI5ODc2NTQzMjEwZmVkY2JhIiwicyI6IllvdXJTZWNyZXRUb2tlbkhlcmUifQ==
     ```
   - **COPY THIS TOKEN** - you'll need it for all 4 PCs

5. **Save token securely**:
   ```powershell
   # On PC1, save to file
   echo "YOUR_TUNNEL_TOKEN_HERE" > C:\nyra\cloudflare-tunnel-token.txt
   ```

---

### Step 2.2: Configure Public Hostnames (Optional but Recommended)

In Cloudflare Tunnel settings, add public hostnames:

| Hostname                  | Type | URL                                     |
| ------------------------- | ---- | --------------------------------------- |
| `app.projectnyra.com`     | HTTP | `http://192.168.1.100:3000` (TwentyCRM) |
| `n8n.projectnyra.com`     | HTTP | `http://192.168.1.100:5678` (n8n)       |
| `dify.projectnyra.com`    | HTTP | `http://192.168.1.100:3001` (Dify)      |
| `grafana.projectnyra.com` | HTTP | `http://192.168.1.100:3002` (Grafana)   |

**Skip this for now** if you just want internal access via Tailscale.

---

### Step 2.3: Deploy Cloudflared on Each PC via Docker

**On PC1 (Orchestrator)**:

```powershell
# Create cloudflared directory
mkdir C:\nyra\cloudflared
cd C:\nyra\cloudflared

# Create docker-compose.yml
@"
version: '3.8'
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared-pc1
    restart: unless-stopped
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=YOUR_TUNNEL_TOKEN_HERE
    networks:
      - nyra-network

networks:
  nyra-network:
    external: true
"@ | Out-File -FilePath docker-compose.yml -Encoding UTF8

# Replace YOUR_TUNNEL_TOKEN_HERE with your actual token
# Then start the tunnel
docker-compose up -d

# Verify it's running
docker ps | findstr cloudflared
docker logs cloudflared-pc1
```

**Repeat on PC2, PC3, PC4** with updated container names:

- PC2: `cloudflared-pc2`
- PC3: `cloudflared-pc3`
- PC4: `cloudflared-pc4`

**Verification**: In Cloudflare dashboard, you should see 4 connected instances under your tunnel.

---

## 🔗 PHASE 3: Tailscale Mesh VPN Setup (30 minutes)

Tailscale provides secure mesh networking between all 4 PCs without port forwarding.

### Step 3.1: Install Tailscale on Each PC

**On ALL 4 PCs**:

1. **Download Tailscale**
   - Go to https://tailscale.com/download/windows
   - Download and run the installer

2. **Install with default settings**
   - Click **Install**
   - Allow firewall permissions when prompted

3. **Sign in to Tailscale**
   - Click the Tailscale icon in system tray
   - Click **Log in**
   - Authenticate with your Tailscale account (Google, GitHub, Microsoft)

4. **Name each machine**:
   - PC1: `nyra-orchestrator`
   - PC2: `nyra-worker-3060`
   - PC3: `nyra-worker-5090`
   - PC4: `nyra-worker-3090`

---

### Step 3.2: Get Tailscale IPs

**On each PC**, open PowerShell:

```powershell
# Get Tailscale IP
tailscale ip -4
```

**Update your table**:

| PC  | Role         | LAN IP        | Tailscale IP | Purpose              |
| --- | ------------ | ------------- | ------------ | -------------------- |
| PC1 | Orchestrator | 192.168.1.100 | ****\_****   | Internal access only |
| PC2 | RTX 3060     | 192.168.1.101 | ****\_****   | Internal access only |
| PC3 | RTX 5090     | 192.168.1.102 | ****\_****   | Internal access only |
| PC4 | RTX 3090     | 192.168.1.103 | ****\_****   | Internal access only |

---

### Step 3.3: Enable Subnet Routing (Optional - For Remote Access)

If you want to access your entire LAN (`192.168.1.0/24`) via Tailscale:

**On PC1 (Orchestrator)** only:

```powershell
# Advertise your LAN subnet
tailscale up --advertise-routes=192.168.1.0/24 --accept-routes

# Enable IP forwarding (required for routing)
Set-NetIPInterface -Forwarding Enabled
```

**In Tailscale Admin Console** (https://login.tailscale.com/admin/machines):

- Find PC1 (`nyra-orchestrator`)
- Click **Edit route settings**
- **Approve** the `192.168.1.0/24` subnet

**On other PCs**:

```powershell
tailscale up --accept-routes
```

Now you can access ANY device on your LAN from anywhere via Tailscale!

---

### Step 3.4: Test Tailscale Connectivity

**From PC1**:

```powershell
# Ping Tailscale IPs of workers
ping TAILSCALE_IP_OF_PC2
ping TAILSCALE_IP_OF_PC3
ping TAILSCALE_IP_OF_PC4
```

**Expected**: All pings succeed with <50ms latency

---

## 🖥️ PHASE 4: GPU Configuration (60-90 minutes)

### Step 4.1: Verify GPU Drivers

**On PC2, PC3, PC4** (all GPU workers):

```powershell
# Check NVIDIA driver version
nvidia-smi

# Expected output: Driver version 560+ for RTX 5090, 535+ for others
# CUDA version 12.4+
```

**If drivers need updating**:

1. Go to https://www.nvidia.com/Download/index.aspx
2. Select your GPU model
3. Download and install **Game Ready Driver** or **Studio Driver**
4. Reboot PC after installation

---

### Step 4.2: Install Docker with GPU Support

**On PC2, PC3, PC4**:

1. **Install Docker Desktop** (if not already installed)
   - Download from https://www.docker.com/products/docker-desktop
   - During install, ensure **WSL 2** is enabled

2. **Enable GPU support in Docker**:

   ```powershell
   # In Docker Desktop settings:
   # Settings → Resources → WSL Integration → Enable Ubuntu
   # Settings → Features → Enable "Use the WSL 2 based engine"
   ```

3. **Test GPU access in Docker**:

   ```powershell
   docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi
   ```

   **Expected**: Should show your GPU info

---

### Step 4.3: Install Ollama on GPU Workers

**Choose ONE method per PC** (Docker recommended for consistency):

#### Method A: Docker (RECOMMENDED)

**On PC2 (RTX 3060 - 12GB VRAM)**:

```powershell
mkdir C:\nyra\ollama
cd C:\nyra\ollama

# Create docker-compose.yml for Ollama
@"
version: '3.8'
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama-3060
    restart: unless-stopped
    ports:
      - '11434:11434'
    volumes:
      - ollama-models:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_NUM_PARALLEL=2
      - OLLAMA_MAX_LOADED_MODELS=2
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    networks:
      - nyra-network

volumes:
  ollama-models:

networks:
  nyra-network:
    external: true
"@ | Out-File -FilePath docker-compose.yml -Encoding UTF8

# Start Ollama
docker-compose up -d

# Verify
docker logs ollama-3060
```

**On PC3 (RTX 5090 - 32GB VRAM)**:

```powershell
mkdir C:\nyra\ollama
cd C:\nyra\ollama

# Use same docker-compose.yml but update:
# - container_name: ollama-5090
# - OLLAMA_NUM_PARALLEL=4
# - OLLAMA_MAX_LOADED_MODELS=3

docker-compose up -d
```

**On PC4 (RTX 3090 - 24GB VRAM)**:

```powershell
# Same as PC3 but:
# - container_name: ollama-3090
# - OLLAMA_NUM_PARALLEL=3
```

---

### Step 4.4: Pull Optimal Models for Each GPU

**PC2 (RTX 3060 - 12GB VRAM)** - Small to medium models:

```bash
# Connect to Ollama container
docker exec -it ollama-3060 bash

# Pull models (run one at a time)
ollama pull llama3.1:8b           # 4.7GB - Fast general purpose
ollama pull codellama:13b         # 7.4GB - Code generation
ollama pull mistral:7b            # 4.1GB - Efficient reasoning
ollama pull deepseek-coder:6.7b   # 3.8GB - Code understanding

# Exit container
exit
```

**Recommended allocation**: 2-3 models loaded simultaneously, others on-demand

---

**PC3 (RTX 5090 - 32GB VRAM)** - Large models (FLAGSHIP):

```bash
docker exec -it ollama-5090 bash

# Pull large models
ollama pull llama3.1:70b          # 40GB - Best reasoning
ollama pull qwen2.5:72b           # 41GB - Multilingual + code
ollama pull mixtral:8x22b         # 88GB quant - MoE architecture
ollama pull codellama:70b         # 39GB - Advanced code gen

# For Mixtral, use quantized version:
ollama pull mixtral:8x22b-instruct-q4_K_M

exit
```

**Recommended**: Load 1-2 large models, swap as needed

---

**PC4 (RTX 3090 - 24GB VRAM)** - Medium to large models:

```bash
docker exec -it ollama-3090 bash

# Pull models
ollama pull llama3.1:70b          # 40GB quant fits with optimization
ollama pull qwen2.5:32b           # 19GB - Good balance
ollama pull codellama:34b         # 19GB - Large code model
ollama pull mixtral:8x7b          # 26GB quant - Efficient MoE

exit
```

---

### Step 4.5: Install vLLM (Optional - PC3/PC4 only)

vLLM provides faster inference than Ollama for production workloads.

**On PC3 (RTX 5090)** and **PC4 (RTX 3090)**:

```powershell
# In WSL2 Ubuntu
wsl

# Install vLLM
pip install vllm

# Test installation
python -c "import vllm; print(vllm.__version__)"

# Run vLLM server (example)
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-70B-Instruct \
  --tensor-parallel-size 1 \
  --gpu-memory-utilization 0.9 \
  --port 8000

# Exit WSL
exit
```

**Alternative: Docker vLLM** (recommended for production):

```powershell
docker run -d --name vllm-5090 \
  --gpus all \
  -p 8000:8000 \
  -v C:\nyra\models:/models \
  vllm/vllm-openai:latest \
  --model /models/Llama-3.1-70B-Instruct \
  --tensor-parallel-size 1 \
  --gpu-memory-utilization 0.9
```

---

### Step 4.6: Model Performance Testing

**Test Ollama endpoints**:

```powershell
# Test PC2 (RTX 3060)
curl http://192.168.1.101:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Write a Python function to calculate fibonacci"
}'

# Test PC3 (RTX 5090)
curl http://192.168.1.102:11434/api/generate -d '{
  "model": "llama3.1:70b",
  "prompt": "Explain quantum computing in simple terms"
}'

# Test PC4 (RTX 3090)
curl http://192.168.1.103:11434/api/generate -d '{
  "model": "qwen2.5:32b",
  "prompt": "Write a React component for a todo list"
}'
```

**Expected**: Responses within 1-5 seconds depending on model size

---

## 🎯 PHASE 5: Verify Complete Setup (15 minutes)

### Checklist

Run these verification commands from **PC1 (Orchestrator)**:

```powershell
# 1. Network Connectivity
ping 192.168.1.101
ping 192.168.1.102
ping 192.168.1.103

# 2. Tailscale Mesh
tailscale status

# 3. Cloudflared Tunnels
# Check Cloudflare dashboard - should show 4 connected

# 4. GPU Workers - Ollama
curl http://192.168.1.101:11434/api/tags  # PC2
curl http://192.168.1.102:11434/api/tags  # PC3
curl http://192.168.1.103:11434/api/tags  # PC4

# 5. Docker Networks
docker network ls | findstr nyra
```

---

## 📊 Your Setup Summary

Once complete, you'll have:

✅ **4 PCs with static IPs** on your LAN
✅ **Cloudflared tunnels** on all 4 PCs for secure external access
✅ **Tailscale mesh VPN** for remote administration
✅ **Ollama running** on 3 GPU workers with optimal models:

- PC2 (RTX 3060): 4 models (8B-13B range)
- PC3 (RTX 5090): 4 large models (70B+ range)
- PC4 (RTX 3090): 4 medium-large models (32B-70B range)
  ✅ **Docker with GPU support** on all workers
  ✅ **Network verified** (LAN + Tailscale)

---

## 🚀 Next Steps (What Claude Will Automate)

After completing this manual setup, Claude will handle:

1. **Docker Compose Deployment**
   - Deploy 25 services on PC1 (Orchestrator)
   - Configure MCP servers
   - Set up databases (PostgreSQL, Redis, Neo4j, Qdrant)

2. **Service Configuration**
   - Environment variables
   - Secrets management (Infisical)
   - Inter-service networking

3. **Application Deployment**
   - TwentyCRM, n8n, Dify
   - Nexus Router, LiteLLM
   - Monitoring stack (Prometheus, Grafana)

4. **Integration Testing**
   - End-to-end connectivity tests
   - GPU worker load balancing
   - MCP tool verification

---

## 🆘 Troubleshooting

### Issue: Cloudflared won't connect

**Solution**:

```powershell
# Check token is correct
docker logs cloudflared-pc1

# Restart tunnel
docker-compose restart

# Check Cloudflare dashboard for errors
```

---

### Issue: Ollama can't access GPU

**Solution**:

```powershell
# Verify GPU drivers
nvidia-smi

# Rebuild container with GPU support
docker-compose down
docker-compose up -d --build

# Check Docker Desktop → Settings → Resources → GPU
```

---

### Issue: Tailscale IPs not working

**Solution**:

```powershell
# Restart Tailscale
tailscale down
tailscale up

# Check status
tailscale status

# Verify accept-routes is enabled
tailscale up --accept-routes
```

---

## 📞 Need Help?

- **Cloudflare Docs**: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
- **Tailscale Docs**: https://tailscale.com/kb/
- **Ollama Docs**: https://ollama.ai/docs
- **vLLM Docs**: https://docs.vllm.ai/

**Save this file**: `C:\Dev\Projects\Repos\Project-Nyra\docs\manual-tasks\YOUR-MANUAL-SETUP-GUIDE.md`
