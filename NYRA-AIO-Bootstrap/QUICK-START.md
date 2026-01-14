# NYRA All-In-One Bootstrap - Quick Start

**Get your 4-PC cluster running in 15 minutes!**

This guide assumes you have basic familiarity with Docker and command-line tools. For detailed step-by-step instructions, see [COMPLETE-SETUP-GUIDE.md](../docs/COMPLETE-SETUP-GUIDE.md).

---

## ⚡ Prerequisites (5 minutes)

### Hardware Ready?
- [ ] **4 PCs** on same LAN network
- [ ] **PC1**: Mac Mini or similar (no GPU required) → Will be 10.0.0.1
- [ ] **PC2**: RTX 3060 12GB or better → Will be 10.0.0.2
- [ ] **PC3**: RTX 5090 32GB or better → Will be 10.0.0.3
- [ ] **PC4**: RTX 3090 Ti 24GB or better → Will be 10.0.0.4
- [ ] All PCs connected via **1Gbps Ethernet**

### Software Installed?
- [ ] **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- [ ] **Git** (for cloning repository)
- [ ] **Node.js 20+** (for Bootstrap GUI, optional)

### Credentials Ready?
- [ ] **Anthropic API Key** (Claude)
- [ ] **OpenRouter API Key** (backup LLM)
- [ ] **Google API Key** (Gemini, optional)
- [ ] **Tailscale Auth Key** (for VPN, optional)

---

## 🚀 Installation (10 Minutes)

### Option 1: Bootstrap GUI (Easiest)

#### Step 1: Clone Repository (All 4 PCs)
```bash
# Windows (PowerShell)
cd C:\Dev\Projects\Repos
git clone https://github.com/yourusername/Project-Nyra.git
cd Project-Nyra

# Linux/Mac
cd /opt
sudo git clone https://github.com/yourusername/Project-Nyra.git
cd Project-Nyra
```

#### Step 2: Launch GUI (Each PC)
```bash
cd bootstrap-gui
npm install
npm run dev
```

#### Step 3: Follow Wizard (9 Steps)
1. **Welcome** - Introduction
2. **PC Detection** - Auto-detects hardware, suggests role
3. **Network Config** - Assigns static IP (10.0.0.1-4)
4. **Docker Setup** - Installs/validates Docker
5. **Tailscale Setup** - Optional VPN mesh
6. **Service Deployment** - Pulls and starts services
7. **GPU Config** - Installs Ollama models (PC3 only)
8. **Health Check** - Validates all services
9. **Complete** - Success summary

**GUI handles everything automatically!**

---

### Option 2: Automation Scripts (Fastest)

#### Step 1: Clone Repository (All 4 PCs)
```bash
# Windows
cd C:\Dev\Projects\Repos
git clone https://github.com/yourusername/Project-Nyra.git
cd Project-Nyra

# Linux/Mac
cd /opt && sudo git clone https://github.com/yourusername/Project-Nyra.git
cd Project-Nyra
```

#### Step 2: Configure Environment Variables (PC1 Only)
```bash
# Copy template
cp master-.env.example .env

# Edit with your API keys
nano .env  # or use any text editor

# REQUIRED:
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENROUTER_API_KEY=sk-or-xxxxx

# OPTIONAL:
GOOGLE_API_KEY=xxxxx
TAILSCALE_AUTH_KEY=tskey-xxxxx
```

#### Step 3: Run Bootstrap Scripts

**PC1 - Orchestrator (Mac Mini)**
```powershell
# Windows
.\scripts\bootstrap-orchestrator.ps1

# Linux/Mac
sudo ./scripts/bootstrap-orchestrator.sh
```

**PC2 - Worker 2 (RTX 3060)**
```powershell
# Windows
.\scripts\bootstrap-worker.ps1 -WorkerRole worker-2

# Linux/Mac
sudo ./scripts/bootstrap-worker.sh worker-2
```

**PC3 - Worker 3 (RTX 5090)**
```powershell
# Windows
.\scripts\bootstrap-worker.ps1 -WorkerRole worker-3

# Linux/Mac
sudo ./scripts/bootstrap-worker.sh worker-3
```

**PC4 - Worker 4 (RTX 3090 Ti)**
```powershell
# Windows
.\scripts\bootstrap-worker.ps1 -WorkerRole worker-4

# Linux/Mac
sudo ./scripts/bootstrap-worker.sh worker-4
```

#### Step 4: Verify Deployment
```bash
# Run health check from ANY PC
.\scripts\health-check-all.ps1  # Windows
sudo ./scripts/health-check-all.sh  # Linux/Mac

# Expected output:
# Total Services:   22
# Healthy:          22
# Unhealthy:        0
# Unreachable:      0
# Health Score:     100.00%
```

---

## ✅ Verification Checklist

### 1. Network Connectivity
```bash
# From PC1, test other PCs
ping 10.0.0.2  # PC2
ping 10.0.0.3  # PC3
ping 10.0.0.4  # PC4

# All should respond < 1ms
```

### 2. Service Health
```bash
# PC1 - Orchestrator Services (8 services)
curl http://10.0.0.1:6000/health  # Nexus Router
curl http://10.0.0.1:8283/health  # Letta
curl http://10.0.0.1:4321/health  # Mem0
curl http://10.0.0.1:3010/health  # Claude Flow
curl http://10.0.0.1:8080/health  # AgentDB

# PC2 - Worker 2 Services (5 services)
curl http://10.0.0.2:3000/health  # TwentyCRM
curl http://10.0.0.2:5678/healthz # n8n
curl http://10.0.0.2:3001/health  # Dify

# PC3 - Worker 3 Services (3 services)
curl http://10.0.0.3:11434       # Ollama
curl http://10.0.0.3:7474        # Neo4j
curl http://10.0.0.3:6379        # FalkorDB

# PC4 - Worker 4 Services (4 services)
curl http://10.0.0.4:9090/-/healthy  # Prometheus
curl http://10.0.0.4:3005/api/health # Grafana
curl http://10.0.0.4:3100/ready      # Loki
```

All should return **200 OK** or **healthy** status.

### 3. GPU Detection (PC2/3/4)
```bash
# Verify GPU is accessible in Docker
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi

# Expected: GPU details displayed
```

### 4. Ollama Models (PC3 Only)
```bash
# List installed models
docker exec ollama ollama list

# Expected:
# llama3.1:latest
# mistral:latest
# codellama:latest
```

---

## 🌐 Access Services

Once deployment is complete, access services via web browser:

### PC1 - Orchestrator
- **Nexus Router**: http://10.0.0.1:6000 (LLM gateway)
- **Letta**: http://10.0.0.1:8283 (conversation memory)
- **Mem0**: http://10.0.0.1:4321 (universal memory)
- **Claude Flow**: http://10.0.0.1:3010 (orchestration)

### PC2 - Worker 2
- **TwentyCRM**: http://10.0.0.2:3000 (default: admin/admin)
- **n8n**: http://10.0.0.2:5678 (workflow automation)
- **Dify**: http://10.0.0.2:3002 (chat UI)

### PC3 - Worker 3
- **Ollama**: http://10.0.0.3:11434 (LLM inference)
- **Neo4j**: http://10.0.0.3:7474 (default: neo4j/password)

### PC4 - Worker 4
- **Grafana**: http://10.0.0.4:3005 (default: admin/admin)
- **Prometheus**: http://10.0.0.4:9090 (metrics)

---

## 🔧 Common Issues

### Issue 1: Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :6000  # Windows
lsof -i :6000                 # Linux/Mac

# Kill process
taskkill /PID [PID] /F        # Windows
sudo kill [PID]               # Linux/Mac

# Restart services
docker compose restart [service-name]
```

### Issue 2: GPU Not Detected
```bash
# Install NVIDIA drivers
# Windows: https://www.nvidia.com/Download/index.aspx
# Linux: sudo apt install nvidia-driver-535

# Install NVIDIA Container Toolkit
# Linux:
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

### Issue 3: Services Unhealthy
```bash
# Check logs
docker compose logs [service-name]

# Common fixes:
# 1. Missing environment variables → Edit .env file
# 2. Database not ready → Wait 30s and restart
# 3. Out of memory → Increase Docker memory limits

# Restart service
docker compose restart [service-name]
```

### Issue 4: Network Unreachable
```bash
# Verify static IP configuration
ipconfig  # Windows
ip addr   # Linux/Mac

# Reconfigure static IP
.\scripts\configure-static-ip.ps1 -PCRole PC1  # Windows
sudo ./scripts/configure-static-ip.sh PC1      # Linux/Mac

# Test connectivity
ping 10.0.0.1
```

For more troubleshooting, see [MASTER-TROUBLESHOOTING.md](../docs/MASTER-TROUBLESHOOTING.md).

---

## 📊 Performance Benchmarks

### Expected Performance (After Warmup)
- **Bootstrap time**: 15-20 minutes (script-driven)
- **Service startup**: 30-120 seconds
- **Health check**: < 5 seconds (all 22 services)
- **Quote generation**: < 2 seconds (p95)
- **Ollama inference**: 20-50 tokens/second (depends on model)
- **AgentDB search**: < 1ms (HNSW indexing)

### Resource Usage
| PC | RAM Usage | Disk Usage | GPU VRAM |
|----|-----------|------------|----------|
| PC1 | 8-12GB | 20GB | N/A |
| PC2 | 16-24GB | 50GB | 6-8GB |
| PC3 | 32-48GB | 100GB | 16-24GB |
| PC4 | 12-16GB | 30GB | 8-12GB |

---

## 🎯 Next Steps

### 1. Configure Services
- **TwentyCRM**: Create first user, import contacts
- **n8n**: Import mortgage drip campaign workflows
- **Grafana**: Configure dashboards and alerts
- **Dify**: Set up borrower chat flows

### 2. Deploy Frontend Applications
```bash
# RateHunter (public mortgage rate site)
cd apps/ratehunter
npm install && npm run build && npm start

# Nyra Admin (internal dashboard)
cd apps/nyra-admin
npm install && npm run build && npm start
```

### 3. Test End-to-End Workflow
1. Submit test lead → TwentyCRM
2. Generate quote → Quote Engine
3. Trigger campaign → n8n workflow
4. Chat with borrower → Dify interface

### 4. Set Up Daily Backups
```bash
# Schedule daily backup (runs at 2 AM)
# Windows: Task Scheduler
schtasks /create /tn "Nyra Daily Backup" /tr "C:\Dev\Projects\Repos\Project-Nyra\scripts\backup-daily.ps1" /sc daily /st 02:00

# Linux: Crontab
0 2 * * * /opt/Project-Nyra/scripts/backup-daily.sh
```

### 5. Enable Monitoring Alerts
Access Grafana (http://10.0.0.4:3005) and configure alerts for:
- Service downtime
- High CPU/memory usage
- Disk space < 20%
- API error rates > 1%

---

## 📚 Additional Resources

### Documentation
- **[Complete Setup Guide](../docs/COMPLETE-SETUP-GUIDE.md)** - Detailed 7-phase deployment
- **[Master Troubleshooting](../docs/MASTER-TROUBLESHOOTING.md)** - 100+ solutions
- **[Claude Flow Workflows](../docs/workflows/TOP-15-CLAUDE-FLOW-WORKFLOWS.md)** - 15 essential workflows
- **[Version Comparison](../docs/CLAUDE-FLOW-VERSION-COMPARISON.md)** - Migration guide

### Support
- **GitHub Issues**: https://github.com/yourusername/Project-Nyra/issues
- **Email**: support@ratehunter.net
- **Discord**: [Link TBD]

---

## 🎉 Success!

If you've reached this point with all 22 services healthy, **congratulations!** You now have a fully operational 4-PC distributed mortgage automation platform.

**Total deployment time**: 15-20 minutes (if using automation scripts)

Ready to process your first lead? Head to TwentyCRM: http://10.0.0.2:3000

---

**Last Updated**: 2026-01-13
**Version**: 1.0
**Maintainer**: Project Nyra Team
