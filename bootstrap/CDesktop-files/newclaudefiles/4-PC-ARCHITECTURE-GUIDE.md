# Project Nyra - 4-PC Architecture Guide

## 🎯 Why 4 PCs > Cloud APIs

### Cost Comparison (Monthly)

**Option A: Cloud APIs Only**
- Claude Sonnet 4: ~$3,000/month (10M tokens/day)
- OpenRouter DeepSeek: ~$500/month (fallback)
- **Total: $3,500/month = $42,000/year**

**Option B: Your Hardware (THIS)**
- Electricity: ~$50/month (4 PCs running 24/7)
- Cloud fallback: ~$300/month (critical tasks only)
- **Total: $350/month = $4,200/year**
- **Savings: $37,800/year** 💰

**ROI: 10.8x**

Your GPUs pay for themselves in **1 month**.

---

## 🏗️ Complete System Architecture

```
                    INTERNET
                       │
              ┌────────┴────────┐
              │  Cloudflare     │
              │  Tunnel         │
              └────────┬────────┘
                       │
         ┌─────────────┴─────────────┐
         │   Tailscale Mesh VPN      │
         │  (100.x.x.x addresses)    │
         └─────────────┬─────────────┘
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
    ▼                  ▼                  ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Home LAN    │  │ Work LAN    │  │ Mobile      │
│ 192.168.1.x │  │ 10.0.0.x    │  │ Anywhere    │
└─────────────┘  └─────────────┘  └─────────────┘

HOME LAN (192.168.1.0/24):

┌────────────────────────────────────────────────────┐
│ ORCHESTRATOR (Area51 - 192.168.1.10)              │
│ ┌────────────────────────────────────────────────┐ │
│ │ Windows 11                                     │ │
│ │ ├── Gitea (localhost:3000) - Git server       │ │
│ │ ├── Infisical Desktop - Secrets management    │ │
│ │ ├── Tailscale - VPN client                    │ │
│ │ └── VS Code - Development                     │ │
│ ├────────────────────────────────────────────────┤ │
│ │ WSL2 (Ubuntu 24.04)                           │ │
│ │ ├── Claude Code - AI coding assistant         │ │
│ │ ├── Docker Compose:                           │ │
│ │ │   ├── PostgreSQL (5432)                     │ │
│ │ │   ├── Redis (6379)                          │ │
│ │ │   ├── Neo4j (7474, 7687)                    │ │
│ │ │   ├── Qdrant (6333)                         │ │
│ │ │   ├── Dify (3000, 5001)                     │ │
│ │ │   ├── n8n (5678)                            │ │
│ │ │   ├── TwentyCRM (3001)                      │ │
│ │ │   ├── Letta (8283)                          │ │
│ │ │   └── Nexus Router (4000, 4001)             │ │
│ │ ├── Project-Nyra monorepo                     │ │
│ │ └── Archon MCP (3333)                         │ │
│ └────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ WORKER-5090     │ │ WORKER-3090     │ │ WORKER-3060     │
│ (AWM15R7)       │ │ (GPU PC 2)      │ │ (GPU PC 3)      │
│ 192.168.1.11    │ │ 192.168.1.12    │ │ 192.168.1.13    │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ Windows 11      │ │ Windows 11      │ │ Windows 11      │
│ ├── Tailscale   │ │ ├── Tailscale   │ │ ├── Tailscale   │ │
│ └── WSL2:       │ │ └── WSL2:       │ │ └── WSL2:       │ │
│     └── Docker: │ │     └── Docker: │ │     └── Docker: │ │
│         Ollama  │ │         Ollama  │ │         Ollama  │ │
│         :11434  │ │         :11434  │ │         :11434  │ │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ RTX 5090        │ │ RTX 3090 Ti     │ │ RTX 3060        │
│ 48GB VRAM       │ │ 24GB VRAM       │ │ 12GB VRAM       │
│                 │ │                 │ │                 │
│ Models:         │ │ Models:         │ │ Models:         │
│ • DeepSeek-R1   │ │ • Llama 3.1     │ │ • Qwen 2.5      │
│   236B (Q4)     │ │   70B (Q4)      │ │   32B (Q8)      │
│ • Qwen 2.5      │ │ • Mistral       │ │ • CodeLlama     │
│   72B (Q8)      │ │   Large 2       │ │   34B           │
│                 │ │   123B (Q4)     │ │ • Gemma 2       │
│                 │ │                 │ │   27B           │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 🔄 Request Flow Examples

### Example 1: Mortgage Quote Request

```
1. User → ratehunter.net (Cloudflare)
2. Cloudflare → Orchestrator:3000 (Dify)
3. Dify → Nexus Router:4000 (LLM routing decision)
4. Nexus → Worker-5090:11434 (DeepSeek-R1 for reasoning)
5. Worker-5090 → Nexus (response)
6. Nexus → Orchestrator Quote API:8000 (FastAPI)
7. Quote API → Rocket Mortgage API (external)
8. Quote API → Nexus (formatted quote)
9. Nexus → Dify (final response)
10. Dify → User (via Cloudflare)

Cost: $0 (all local except Rocket API)
Latency: ~2-3 seconds
```

### Example 2: Code Generation Task

```
1. Developer → Claude Code (in WSL2)
2. Claude Code → Archon MCP:3333 (task breakdown)
3. Archon → Nexus Router (route to best model)
4. Nexus → Worker-3060:11434 (CodeLlama specialized)
5. Worker-3060 → Nexus (generated code)
6. Nexus → Claude Code (review + refine)
7. Claude Code → Developer (final code)

Cost: $0
Latency: ~5-10 seconds
```

### Example 3: Complex Analysis (Hybrid)

```
1. Analyst → Dify chatbot
2. Dify → Nexus Router
3. Nexus → Worker-3090:11434 (Llama 3.1 attempt)
4. Worker-3090 → Nexus (confidence: 65% - too low)
5. Nexus → Anthropic API (Claude Sonnet 4 - high confidence needed)
6. Anthropic → Nexus (response)
7. Nexus → Dify → Analyst

Cost: ~$0.30 (only cloud call)
Latency: ~8 seconds
Quality: Guaranteed
```

---

## 📋 Step-by-Step Setup Guide

### Phase 1: Orchestrator Setup (Area51)

**Day 1 - Windows Setup:**
```powershell
# Run as Administrator

# 1. Install WSL2 + Ubuntu
wsl --install -d Ubuntu-24.04
wsl --set-default-version 2

# 2. Reboot
Restart-Computer

# After reboot:
# 3. Install Docker Desktop
winget install Docker.DockerDesktop

# 4. Install Tailscale
winget install tailscale.tailscale

# 5. Install Gitea
docker run -d `
    --name gitea `
    -p 3000:3000 `
    -p 2222:22 `
    -v C:\gitea-data:/data `
    --restart unless-stopped `
    gitea/gitea:latest

# 6. Configure Gitea
# Open http://localhost:3000
# Create admin user
# Create organization: 'nyra'
# Create repo: 'Project-Nyra'
```

**Day 1 - WSL2 Setup:**
```bash
# Inside WSL2 (run: wsl)

# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install essentials
sudo apt install -y build-essential curl git

# 3. Install Node.js via Volta
curl https://get.volta.sh | bash
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
echo 'export VOLTA_HOME="$HOME/.volta"' >> ~/.bashrc
echo 'export PATH="$VOLTA_HOME/bin:$PATH"' >> ~/.bashrc
volta install node@20
volta install pnpm

# 4. Install Claude Code
curl -fsSL https://cli.anthropic.com/install.sh | sh

# 5. Install Infisical CLI
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical

# 6. Clone Project-Nyra
cd ~
git clone http://localhost:3000/nyra/Project-Nyra.git
cd Project-Nyra

# 7. Install dependencies
pnpm install
```

**Day 2 - Docker Services:**
```bash
# Still in WSL2

cd ~/Project-Nyra

# Create docker-compose.yml (use template from previous docs)
cat > docker-compose.yml << 'EOF'
# [Full docker-compose.yml content from BOOTSTRAP-WORKFLOW.md]
EOF

# Start all services
docker-compose up -d

# Verify
docker-compose ps
# All should show "Up"

# Test services
curl http://localhost:5432  # Postgres
curl http://localhost:3000  # Dify
curl http://localhost:5678  # n8n
curl http://localhost:3001  # TwentyCRM
```

---

### Phase 2: GPU Worker Setup (All 3)

**On EACH worker PC:**

```powershell
# Run as Administrator

# 1. Install WSL2
wsl --install -d Ubuntu-24.04
wsl --set-default-version 2

# 2. Reboot
Restart-Computer

# After reboot:
# 3. Install Docker Desktop
winget install Docker.DockerDesktop

# 4. Install Tailscale
winget install tailscale.tailscale

# 5. Update GPU drivers (if needed)
# Download from NVIDIA website
```

**Configure NVIDIA Container Toolkit:**
```bash
# In WSL2 on each worker

# 1. Add NVIDIA repository
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
  sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

# 2. Install toolkit
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

# 3. Configure Docker
sudo nvidia-ctk runtime configure --runtime=docker

# 4. Restart Docker
sudo systemctl restart docker

# 5. Test GPU access
docker run --rm --gpus all nvidia/cuda:12.6.0-base-ubuntu22.04 nvidia-smi
# Should show your GPU details
```

**Start Ollama:**
```bash
# Create docker-compose.yml
cat > ~/docker-compose.yml << 'EOF'
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    environment:
      - OLLAMA_HOST=0.0.0.0:11434
      - OLLAMA_KEEP_ALIVE=24h
      - OLLAMA_MAX_LOADED_MODELS=2
    restart: unless-stopped

volumes:
  ollama-data:
EOF

# Start Ollama
docker-compose up -d

# Download models (adjust per worker)
# Worker 5090:
docker exec ollama ollama pull deepseek-r1:236b-q4_K_M
docker exec ollama ollama pull qwen2.5:72b-instruct-q8_0

# Worker 3090:
docker exec ollama ollama pull llama3.1:70b-instruct-q4_K_M
docker exec ollama ollama pull mistral-large:123b-instruct-2407-q4_K_M

# Worker 3060:
docker exec ollama ollama pull qwen2.5:32b-instruct-q8_0
docker exec ollama ollama pull codellama:34b-instruct-q8_0
docker exec ollama ollama pull gemma2:27b-instruct-q8_0
```

**Note:** Model downloads take 30min - 2 hours depending on internet speed.

---

### Phase 3: Networking (Tailscale)

**On ALL 4 PCs:**

```powershell
# Start Tailscale
Start-Service Tailscale

# Login (opens browser)
tailscale login

# Set hostname
# On orchestrator:
tailscale set --hostname orchestrator

# On workers:
tailscale set --hostname worker-5090
tailscale set --hostname worker-3090
tailscale set --hostname worker-3060

# On orchestrator only - advertise LAN subnet
tailscale up --advertise-routes=192.168.1.0/24 --accept-routes

# On workers - accept routes
tailscale up --accept-routes
```

**Test connectivity:**
```bash
# From orchestrator WSL2:
ping worker-5090.tail-net.ts.net
curl http://worker-5090.tail-net.ts.net:11434/v1/models

ping worker-3090.tail-net.ts.net
curl http://worker-3090.tail-net.ts.net:11434/v1/models

ping worker-3060.tail-net.ts.net
curl http://worker-3060.tail-net.ts.net:11434/v1/models
```

---

### Phase 4: Nexus Router Integration

**On orchestrator in WSL2:**

```bash
cd ~/Project-Nyra/services/routing

# Install Nexus
pnpm add @grafbase/nexus

# Create config
cat > nexus.config.ts << 'EOF'
import { nexus } from '@grafbase/nexus';

export default nexus({
  mcp: {
    port: 4001,
    servers: {
      'archon': {
        command: 'node',
        args: ['~/archon-mcp/server.js'],
        env: {
          PORT: '3333'
        }
      },
      'letta': {
        command: 'python',
        args: ['-m', 'letta.mcp_server'],
        env: {
          LETTA_SERVER_URL: 'http://localhost:8283'
        }
      }
    }
  },
  
  llm: {
    providers: {
      // Local GPU workers
      'worker-5090': {
        url: 'http://worker-5090.tail-net.ts.net:11434/v1',
        apiKey: 'ollama',  // Ollama doesn't need real key
        models: [
          'deepseek-r1:236b-q4_K_M',
          'qwen2.5:72b-instruct-q8_0'
        ]
      },
      'worker-3090': {
        url: 'http://worker-3090.tail-net.ts.net:11434/v1',
        apiKey: 'ollama',
        models: [
          'llama3.1:70b-instruct-q4_K_M',
          'mistral-large:123b-instruct-2407-q4_K_M'
        ]
      },
      'worker-3060': {
        url: 'http://worker-3060.tail-net.ts.net:11434/v1',
        apiKey: 'ollama',
        models: [
          'qwen2.5:32b-instruct-q8_0',
          'codellama:34b-instruct-q8_0',
          'gemma2:27b-instruct-q8_0'
        ]
      },
      
      // Cloud fallbacks
      'anthropic': {
        apiKey: process.env.ANTHROPIC_API_KEY!,
        models: ['claude-sonnet-4-20250514']
      },
      'openrouter': {
        apiKey: process.env.OPENROUTER_API_KEY!,
        baseURL: 'https://openrouter.ai/api/v1',
        models: ['deepseek/deepseek-r1']
      }
    },
    
    routing: {
      rules: [
        // Reasoning tasks → DeepSeek-R1 (local)
        {
          match: { task: 'reasoning' },
          provider: 'worker-5090',
          model: 'deepseek-r1:236b-q4_K_M',
          fallback: ['openrouter', 'anthropic']
        },
        
        // Coding tasks → CodeLlama (local)
        {
          match: { task: 'coding' },
          provider: 'worker-3060',
          model: 'codellama:34b-instruct-q8_0',
          fallback: ['worker-5090', 'anthropic']
        },
        
        // General chat → Qwen (local)
        {
          match: { task: 'chat' },
          provider: 'worker-5090',
          model: 'qwen2.5:72b-instruct-q8_0',
          fallback: ['worker-3090', 'anthropic']
        },
        
        // Critical mortgage logic → Claude (cloud)
        {
          match: { task: 'mortgage-compliance' },
          provider: 'anthropic',
          model: 'claude-sonnet-4-20250514'
        },
        
        // Analysis → Llama 3.1 (local)
        {
          match: { task: 'analysis' },
          provider: 'worker-3090',
          model: 'llama3.1:70b-instruct-q4_K_M',
          fallback: ['worker-5090', 'anthropic']
        }
      ],
      
      loadBalancing: {
        strategy: 'least-loaded',
        healthCheck: {
          interval: 30000,
          timeout: 5000,
          retries: 3
        }
      },
      
      fallback: {
        enabled: true,
        maxRetries: 2,
        timeout: 30000
      }
    }
  },
  
  logging: {
    level: 'info',
    format: 'json'
  }
});
EOF

# Start Nexus
pnpm dlx @grafbase/nexus start
```

---

## 🧪 Testing & Validation

### Test 1: GPU Workers Responding

```bash
# From orchestrator WSL2

# Test worker-5090
curl -X POST http://worker-5090.tail-net.ts.net:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-r1:236b-q4_K_M",
    "messages": [{"role": "user", "content": "Hello, test response"}],
    "max_tokens": 50
  }'

# Should get JSON response with completion

# Test worker-3090
curl -X POST http://worker-3090.tail-net.ts.net:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.1:70b-instruct-q4_K_M",
    "messages": [{"role": "user", "content": "Calculate 2+2"}],
    "max_tokens": 20
  }'

# Test worker-3060
curl -X POST http://worker-3060.tail-net.ts.net:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "codellama:34b-instruct-q8_0",
    "messages": [{"role": "user", "content": "Write a Python function to add two numbers"}],
    "max_tokens": 100
  }'
```

### Test 2: Nexus Router

```bash
# Test routing through Nexus
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "task": "coding",
    "messages": [{"role": "user", "content": "Write hello world in Python"}]
  }'

# Should route to worker-3060 (CodeLlama)
```

### Test 3: End-to-End

```bash
# From Dify chatbot (http://localhost:3000)
# Type: "Help me analyze the mortgage market"
# Should route through: Dify → Nexus → Worker-3090 (Llama) → Nexus → Dify

# Monitor logs:
docker-compose logs -f nexus
```

---

## 📊 Monitoring & Maintenance

### GPU Monitoring

**On each worker:**
```bash
# Watch GPU usage live
watch -n 1 nvidia-smi

# Or install btop (better monitoring)
sudo snap install btop
btop
```

### Service Health

**On orchestrator:**
```bash
# Check all Docker services
docker-compose ps

# Check Nexus Router
curl http://localhost:4000/health

# Check GPU workers
for worker in worker-5090 worker-3090 worker-3060; do
  echo "Testing $worker..."
  curl http://$worker.tail-net.ts.net:11434/v1/models
done
```

### Cost Tracking

```typescript
// services/analytics/cost-tracker.ts
export class CostTracker {
  async trackRequest(request: LLMRequest) {
    const cost = request.provider === 'anthropic' 
      ? this.calculateAnthropicCost(request.tokens)
      : 0;  // Local is free
    
    await this.db.insert({
      timestamp: new Date(),
      provider: request.provider,
      model: request.model,
      tokens: request.tokens,
      costUSD: cost,
      wasLocal: request.provider.startsWith('worker-')
    });
  }
  
  async getMonthlyReport() {
    const { localRequests, cloudRequests, totalCost } = 
      await this.db.query(`
        SELECT 
          COUNT(*) FILTER (WHERE wasLocal) as localRequests,
          COUNT(*) FILTER (WHERE NOT wasLocal) as cloudRequests,
          SUM(costUSD) as totalCost
        FROM llm_requests
        WHERE timestamp > NOW() - INTERVAL '30 days'
      `);
    
    return {
      localRequests,
      cloudRequests,
      localPercentage: (localRequests / (localRequests + cloudRequests)) * 100,
      totalCost,
      projectedMonthlySavings: (cloudRequests * 0.02) // Estimated savings
    };
  }
}
```

---

## 🚀 Next Steps

1. ✅ Run 4-PC-BOOTSTRAP.ps1 on each PC
2. ✅ Configure Nexus Router
3. ✅ Test GPU workers
4. ✅ Integrate with Dify
5. ✅ Deploy first workflow using local LLMs
6. ✅ Monitor costs (should drop to ~$300/month)
7. ✅ Optimize based on usage patterns

---

## ⚠️ Troubleshooting

### GPU not detected in Docker

```bash
# In WSL2:
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# Test again:
docker run --rm --gpus all nvidia/cuda:12.6.0-base-ubuntu22.04 nvidia-smi
```

### Ollama models not loading

```bash
# Check available VRAM:
nvidia-smi

# If model too large, use quantized version:
# Instead of: llama3.1:70b
# Use: llama3.1:70b-q4_K_M  (smaller)
```

### Tailscale connectivity issues

```powershell
# Restart Tailscale on all PCs:
Restart-Service Tailscale

# Check status:
tailscale status

# Re-login if needed:
tailscale logout
tailscale login
```

### High latency on local LLMs

- Check GPU usage: `nvidia-smi`
- Reduce concurrent requests
- Use smaller/faster models for simple tasks
- Increase `OLLAMA_MAX_LOADED_MODELS` if you have VRAM

---

**You're now running a $42k/year cloud setup for $350/month. 💪**
