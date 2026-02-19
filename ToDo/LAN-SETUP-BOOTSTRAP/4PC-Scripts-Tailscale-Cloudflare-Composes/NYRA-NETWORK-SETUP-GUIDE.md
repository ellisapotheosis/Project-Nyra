# Project Nyra — Network & Infrastructure Setup Guide

## Quick Answers to Your Questions

### Tailscale IP Question
**No, you don't need to add both WiFi and LAN IPs.** Tailscale handles this automatically:
- Tailscale assigns each device a **stable 100.x.x.x IP** that never changes
- Whether you're on WiFi, Ethernet, or mobile hotspot — same Tailscale IP
- Devices find each other through Tailscale's coordination servers
- You only care about the Tailscale IP for inter-service communication

### Claude-Flow @alpha Providers vs LiteLLM
**Yes, claude-flow@alpha's providers system CAN replace LiteLLM** for most use cases:
- The new modular providers support OpenRouter, Anthropic, OpenAI, Google, local Ollama
- Built-in cost tracking and model routing
- However, LiteLLM still has advantages for:
  - More granular spend limits per user/team
  - Broader provider support (50+ providers)
  - Better observability dashboards
  
**Recommendation:** Start with claude-flow@alpha providers, add LiteLLM later only if you need advanced cost controls.

---

## PHASE 1: Get Network Info From Each PC

### Step 1: Run This Script on Each PC (PowerShell)

\`\`\`powershell
# Save as: get-network-info.ps1
# Run on EACH of your 4 PCs

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NETWORK INFO FOR: $env:COMPUTERNAME" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Get all network adapters
Write-Host "`n--- NETWORK ADAPTERS ---" -ForegroundColor Yellow
Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | ForEach-Object {
    $adapter = $_
    $ipConfig = Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue
    
    Write-Host "`nAdapter: $($adapter.Name)" -ForegroundColor Green
    Write-Host "  MAC Address: $($adapter.MacAddress)"
    Write-Host "  Link Speed: $($adapter.LinkSpeed)"
    if ($ipConfig) {
        Write-Host "  IPv4 Address: $($ipConfig.IPAddress)"
    }
}

# Get Tailscale IP (if installed)
Write-Host "`n--- TAILSCALE ---" -ForegroundColor Yellow
$tailscaleStatus = tailscale status 2>$null
if ($LASTEXITCODE -eq 0) {
    $tailscaleIP = tailscale ip -4 2>$null
    Write-Host "Tailscale IP: $tailscaleIP" -ForegroundColor Green
    Write-Host "`nTailscale Network Status:"
    tailscale status
} else {
    Write-Host "Tailscale not running or not installed" -ForegroundColor Red
}

# Get public IP
Write-Host "`n--- PUBLIC IP ---" -ForegroundColor Yellow
try {
    $publicIP = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing -TimeoutSec 5).Content
    Write-Host "Public IP: $publicIP" -ForegroundColor Green
} catch {
    Write-Host "Could not determine public IP" -ForegroundColor Red
}

# Get hostname
Write-Host "`n--- HOSTNAME ---" -ForegroundColor Yellow
Write-Host "Hostname: $env:COMPUTERNAME"
Write-Host "FQDN: $([System.Net.Dns]::GetHostEntry($env:COMPUTERNAME).HostName)"

# Check if Docker is running
Write-Host "`n--- DOCKER STATUS ---" -ForegroundColor Yellow
$dockerStatus = docker info 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Docker: Running" -ForegroundColor Green
} else {
    Write-Host "Docker: Not running or not installed" -ForegroundColor Red
}

# GPU Info (if NVIDIA)
Write-Host "`n--- GPU INFO ---" -ForegroundColor Yellow
$gpuInfo = nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "NVIDIA GPU(s):" -ForegroundColor Green
    Write-Host $gpuInfo
} else {
    Write-Host "No NVIDIA GPU detected or nvidia-smi not available" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Copy this output and save it!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
\`\`\`

---

## PHASE 2: Tailscale Setup (Both PCs)

### What Tailscale Does
- Creates a secure mesh VPN between all your devices
- Each device gets a stable 100.x.x.x IP
- Devices can reach each other regardless of physical network
- No port forwarding needed

### Step 2A: Verify Tailscale is Running

On each PC, open PowerShell:

\`\`\`powershell
# Check Tailscale status
tailscale status

# You should see both your PCs listed like:
# 100.x.x.x   orchestrator-pc    username@    windows  -
# 100.x.x.y   rtx3060-laptop     username@    windows  -
\`\`\`

### Step 2B: Get Your Tailscale IPs

\`\`\`powershell
# On each PC, get the Tailscale IP
tailscale ip -4

# Example output: 100.64.0.1
\`\`\`

### Step 2C: Test Connectivity

From Orchestrator, ping the RTX3060 laptop:
\`\`\`powershell
ping 100.x.x.y  # Replace with RTX3060's Tailscale IP
\`\`\`

From RTX3060 laptop, ping the Orchestrator:
\`\`\`powershell
ping 100.x.x.x  # Replace with Orchestrator's Tailscale IP
\`\`\`

### Step 2D: Enable Tailscale SSH (Optional but Recommended)

\`\`\`powershell
# Enable SSH access via Tailscale
tailscale up --ssh
\`\`\`

---

## PHASE 3: Cloudflare Tunnel Setup

### Understanding Cloudflare Tunnels
- Tunnels expose your local services to the internet securely
- No port forwarding needed
- Traffic goes: Internet → Cloudflare → Tunnel → Your PC
- You run ONE cloudflared daemon per PC (not per service)

### Step 3A: Install Cloudflared on Each PC

\`\`\`powershell
# Download cloudflared
winget install Cloudflare.cloudflared

# Or download manually from:
# https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
\`\`\`

### Step 3B: Authenticate Cloudflared

Run this on EACH PC (do it once per PC):

\`\`\`powershell
cloudflared tunnel login
\`\`\`

This opens a browser — select your Cloudflare account and authorize.

### Step 3C: Create Tunnels

You need to decide your architecture. I recommend:

| Tunnel Name | PC | Services |
|-------------|-----|----------|
| nyra-orchestrator | Orchestrator | TwentyCRM, n8n, Activepieces, Nexus Router |
| nyra-gpu-3060 | RTX3060 Laptop | Ollama, dev services |
| nyra-gpu-5090 | RTX5090 Desktop | vLLM, heavy inference |
| nyra-gpu-3090 | RTX3090Ti Desktop | Ollama, embeddings |

**On Orchestrator PC:**
\`\`\`powershell
# Create the tunnel
cloudflared tunnel create nyra-orchestrator

# This outputs a tunnel ID and creates a credentials file
# Save the tunnel ID! Example: a]1b2c3d4-e5f6-7890-abcd-ef1234567890
\`\`\`

**On RTX3060 Laptop:**
\`\`\`powershell
cloudflared tunnel create nyra-gpu-3060
\`\`\`

### Step 3D: Create Tunnel Config Files

**On Orchestrator PC**, create \`C:\Users\<you>\.cloudflared\config.yml\`:

\`\`\`yaml
tunnel: <TUNNEL-ID-FROM-STEP-3C>
credentials-file: C:\Users\<you>\.cloudflared\<TUNNEL-ID>.json

ingress:
  # TwentyCRM
  - hostname: crm.ratehunter.net
    service: http://localhost:3000
  
  # n8n
  - hostname: n8n.ratehunter.net
    service: http://localhost:5678
  
  # Activepieces  
  - hostname: automations.ratehunter.net
    service: http://localhost:8080
  
  # Nexus Router (API Gateway)
  - hostname: api.ratehunter.net
    service: http://localhost:4000
  
  # Dify
  - hostname: chat.ratehunter.net
    service: http://localhost:3001
  
  # Open-WebUI
  - hostname: webui.ratehunter.net
    service: http://localhost:8081
  
  # Catch-all (required)
  - service: http_status:404
\`\`\`

**On RTX3060 Laptop**, create config:

\`\`\`yaml
tunnel: <TUNNEL-ID-FOR-3060>
credentials-file: C:\Users\<you>\.cloudflared\<TUNNEL-ID>.json

ingress:
  # Ollama API (if you want external access)
  - hostname: ollama-3060.ratehunter.net
    service: http://localhost:11434
  
  # Catch-all
  - service: http_status:404
\`\`\`

### Step 3E: Route DNS to Tunnels

For EACH hostname in your config, create a DNS route:

\`\`\`powershell
# On Orchestrator
cloudflared tunnel route dns nyra-orchestrator crm.ratehunter.net
cloudflared tunnel route dns nyra-orchestrator n8n.ratehunter.net
cloudflared tunnel route dns nyra-orchestrator automations.ratehunter.net
cloudflared tunnel route dns nyra-orchestrator api.ratehunter.net
cloudflared tunnel route dns nyra-orchestrator chat.ratehunter.net
cloudflared tunnel route dns nyra-orchestrator webui.ratehunter.net

# On RTX3060
cloudflared tunnel route dns nyra-gpu-3060 ollama-3060.ratehunter.net
\`\`\`

### Step 3F: Run Tunnels as Windows Services

\`\`\`powershell
# Install as Windows service (run as Administrator)
cloudflared service install

# Start the service
Start-Service cloudflared

# Check status
Get-Service cloudflared
\`\`\`

---

## PHASE 4: GPU Worker LLM Containers

### Hardware Recap
| PC | GPU | VRAM | Best For |
|----|-----|------|----------|
| RTX3060 Laptop | RTX 3060 | 6GB | Small models (7B quantized), embeddings |
| RTX5090 Desktop | RTX 5090 | 32GB | Large models (70B), vLLM, heavy inference |
| RTX3090Ti Desktop | RTX 3090Ti | 24GB | Medium models (13B-34B), embeddings |

### Step 4A: Docker Compose for RTX3060 (6GB VRAM)

\`\`\`yaml
# docker-compose.gpu-3060.yml
version: '3.8'

services:
  ollama-3060:
    image: ollama/ollama:latest
    container_name: ollama-3060
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_MODELS=/root/.ollama/models
      # Limit VRAM usage
      - OLLAMA_NUM_GPU=1
    volumes:
      - ollama_3060_data:/root/.ollama
    ports:
      - "11434:11434"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    restart: unless-stopped

volumes:
  ollama_3060_data:
\`\`\`

**Recommended models for 6GB VRAM:**
\`\`\`bash
# After container is running
docker exec ollama-3060 ollama pull llama3.2:3b      # 3B, fast
docker exec ollama-3060 ollama pull phi3:mini        # 3.8B, good reasoning  
docker exec ollama-3060 ollama pull nomic-embed-text # Embeddings
docker exec ollama-3060 ollama pull qwen2.5:7b-q4    # 7B quantized
\`\`\`

### Step 4B: Docker Compose for RTX3090Ti (24GB VRAM)

\`\`\`yaml
# docker-compose.gpu-3090.yml
version: '3.8'

services:
  ollama-3090:
    image: ollama/ollama:latest
    container_name: ollama-3090
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - OLLAMA_HOST=0.0.0.0
    volumes:
      - ollama_3090_data:/root/.ollama
    ports:
      - "11434:11434"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    restart: unless-stopped

  # Optional: Text Embeddings Inference for faster embeddings
  tei-3090:
    image: ghcr.io/huggingface/text-embeddings-inference:latest
    container_name: tei-3090
    runtime: nvidia
    environment:
      - MODEL_ID=BAAI/bge-large-en-v1.5
    ports:
      - "8082:80"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  ollama_3090_data:
\`\`\`

**Recommended models for 24GB VRAM:**
\`\`\`bash
docker exec ollama-3090 ollama pull llama3.1:70b-q4   # 70B quantized
docker exec ollama-3090 ollama pull codellama:34b     # Code generation
docker exec ollama-3090 ollama pull mixtral:8x7b      # MoE model
docker exec ollama-3090 ollama pull deepseek-coder:33b
\`\`\`

### Step 4C: Docker Compose for RTX5090 (32GB VRAM) — vLLM

\`\`\`yaml
# docker-compose.gpu-5090.yml
version: '3.8'

services:
  vllm-5090:
    image: vllm/vllm-openai:latest
    container_name: vllm-5090
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - HF_TOKEN=${HF_TOKEN}  # For gated models
    volumes:
      - vllm_5090_cache:/root/.cache/huggingface
    ports:
      - "8000:8000"
    command: >
      --model meta-llama/Llama-3.1-70B-Instruct
      --tensor-parallel-size 1
      --max-model-len 8192
      --gpu-memory-utilization 0.90
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    restart: unless-stopped

  # LMCache for faster inference (optional)
  lmcache-5090:
    image: lmcache/lmcache:latest
    container_name: lmcache-5090
    environment:
      - BACKEND_URL=http://vllm-5090:8000
    ports:
      - "8001:8000"
    depends_on:
      - vllm-5090

volumes:
  vllm_5090_cache:
\`\`\`

---

## PHASE 5: Claude-Flow Provider Configuration

### Step 5A: Check Current Claude-Flow Version

\`\`\`bash
# In your claude-flow directory
npm list claude-flow
# or
claude-flow --version
\`\`\`

### Step 5B: Configure Providers in Claude-Flow @alpha

Create or update \`.claude-flow/config.yaml\`:

\`\`\`yaml
# Claude-Flow @alpha Provider Configuration
providers:
  # Cloud providers (via API)
  anthropic:
    enabled: true
    api_key: \${ANTHROPIC_API_KEY}
    models:
      - claude-sonnet-4-20250514
      - claude-opus-4-20250514
    default_model: claude-sonnet-4-20250514
  
  openrouter:
    enabled: true
    api_key: \${OPENROUTER_API_KEY}
    # Access to 100+ models
    
  google:
    enabled: true
    api_key: \${GOOGLE_API_KEY}
    models:
      - gemini-2.0-flash
      - gemini-1.5-pro
  
  # Local providers (via Tailscale IPs)
  ollama:
    enabled: true
    endpoints:
      - name: orchestrator
        url: http://localhost:11434
        models: [llama3.2:3b]
      - name: gpu-3060
        url: http://100.x.x.x:11434  # Tailscale IP of 3060
        models: [phi3:mini, qwen2.5:7b-q4]
      - name: gpu-3090
        url: http://100.x.x.y:11434  # Tailscale IP of 3090Ti
        models: [llama3.1:70b-q4, codellama:34b]
  
  vllm:
    enabled: true
    endpoints:
      - name: gpu-5090
        url: http://100.x.x.z:8000  # Tailscale IP of 5090
        models: [meta-llama/Llama-3.1-70B-Instruct]

# Routing rules
routing:
  # Fast, cheap tasks → local small models
  - pattern: "embeddings|classification|simple"
    provider: ollama
    endpoint: gpu-3060
    model: phi3:mini
  
  # Code tasks → local code model
  - pattern: "code|programming|debug"
    provider: ollama
    endpoint: gpu-3090
    model: codellama:34b
  
  # Heavy reasoning → vLLM on 5090
  - pattern: "analysis|research|complex"
    provider: vllm
    endpoint: gpu-5090
  
  # Default fallback → Claude
  - pattern: "*"
    provider: anthropic
    model: claude-sonnet-4-20250514
\`\`\`

### Step 5C: Environment Variables File

Create \`.env\` in your project root:

\`\`\`bash
# === API KEYS ===
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENROUTER_API_KEY=sk-or-xxxxx
GOOGLE_API_KEY=AIzaxxxxx
HF_TOKEN=hf_xxxxx  # For Hugging Face gated models

# === TAILSCALE IPs (fill in after running network script) ===
ORCHESTRATOR_TAILSCALE_IP=100.x.x.x
GPU_3060_TAILSCALE_IP=100.x.x.y
GPU_3090_TAILSCALE_IP=100.x.x.z
GPU_5090_TAILSCALE_IP=100.x.x.w

# === CLOUDFLARE ===
CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR=xxxxx
CLOUDFLARE_TUNNEL_TOKEN_3060=xxxxx

# === DATABASE ===
POSTGRES_PASSWORD=your-secure-password
TWENTY_API_KEY=your-twenty-api-key

# === COMMUNICATION ===
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
SENDGRID_API_KEY=SG.xxxxx
\`\`\`

---

## PHASE 6: Cloudflare Pages (Landing Page)

### Step 6A: Export Your Old Landing Page

If your old host provides code export:
1. Download the HTML/CSS/JS files
2. Or use a tool like HTTrack to mirror the site

### Step 6B: Create New Next.js Landing Page

\`\`\`bash
# Create new Next.js project with shadcn
npx create-next-app@latest ratehunter-landing --typescript --tailwind --eslint --app

cd ratehunter-landing

# Add shadcn/ui
npx shadcn@latest init

# Add components you'll need
npx shadcn@latest add button card form input
\`\`\`

### Step 6C: Deploy to Cloudflare Pages

**Option 1: Connect GitHub Repo**
1. Push your landing page code to GitHub
2. Go to Cloudflare Dashboard → Pages
3. Click "Create a project" → "Connect to Git"
4. Select your repo
5. Build settings:
   - Framework preset: Next.js
   - Build command: \`npm run build\`
   - Build output: \`.next\`
6. Deploy!

**Option 2: Direct Upload**
\`\`\`bash
# Build your site
npm run build

# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy .next --project-name=ratehunter
\`\`\`

### Step 6D: Custom Domain on Cloudflare Pages

1. In Cloudflare Pages → your project → Custom domains
2. Add: \`ratehunter.net\` and \`www.ratehunter.net\`
3. Cloudflare auto-configures DNS

---

## Quick Reference: Commands Cheat Sheet

\`\`\`powershell
# === TAILSCALE ===
tailscale status              # Show all connected devices
tailscale ip -4               # Get your Tailscale IP
tailscale ping <device>       # Test connectivity
tailscale up --ssh            # Enable SSH access

# === CLOUDFLARED ===
cloudflared tunnel list                    # List all tunnels
cloudflared tunnel info <name>             # Tunnel details
cloudflared tunnel run <name>              # Run tunnel (foreground)
cloudflared service install                # Install as service
Get-Service cloudflared                    # Check service status

# === DOCKER GPU ===
docker run --gpus all nvidia/cuda:12.0-base nvidia-smi  # Test GPU access
docker compose -f docker-compose.gpu-3060.yml up -d     # Start GPU container

# === NETWORK INFO ===
Get-NetAdapter | Where Status -eq 'Up'     # List active adapters
Get-NetIPAddress -AddressFamily IPv4       # Get all IPv4 addresses
\`\`\`

---

## Troubleshooting

### Tailscale devices can't see each other
1. Both devices on same Tailscale account?
2. Run \`tailscale up\` on both
3. Check \`tailscale status\` shows both devices
4. Firewall blocking? Try \`tailscale ping <ip>\`

### Cloudflare tunnel not connecting
1. Check credentials file exists: \`C:\Users\<you>\.cloudflared\<tunnel-id>.json\`
2. Validate config: \`cloudflared tunnel ingress validate\`
3. Check logs: \`cloudflared tunnel --loglevel debug run <name>\`

### Docker GPU not detected
1. NVIDIA Container Toolkit installed?
2. Run: \`docker run --gpus all nvidia/cuda:12.0-base nvidia-smi\`
3. If fails, reinstall toolkit: \`winget install Nvidia.ContainerToolkit\`

