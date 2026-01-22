# Project Nyra - Complete Setup Guide

Comprehensive top-to-bottom setup guide for the 4-PC distributed AI mortgage platform.

## 🎯 Overview

This guide will walk you through setting up the complete Project Nyra infrastructure across 4 PCs with dual orchestration (Claude Flow + Archon OS), 22+ microservices, and distributed GPU compute.

**Timeline**: 2-4 hours for complete setup
**Difficulty**: Intermediate to Advanced

---

## 📋 Prerequisites

### Hardware Requirements

#### PC1 - Orchestrator (Mac Mini or similar)
- **CPU**: 8+ cores recommended
- **RAM**: 16GB minimum, 32GB recommended
- **Storage**: 100GB free space
- **GPU**: Not required (CPU-only coordination)
- **Network**: Gigabit Ethernet

#### PC2 - Worker (Alienware M15R7 or similar)
- **CPU**: 6+ cores
- **RAM**: 32GB minimum
- **Storage**: 200GB free space
- **GPU**: NVIDIA RTX 3060 12GB or better
- **Network**: Gigabit Ethernet

#### PC3 - Worker (Alienware Area-51 or similar)
- **CPU**: 8+ cores
- **RAM**: 64GB recommended
- **Storage**: 500GB free space
- **GPU**: NVIDIA RTX 5090 32GB or better
- **Network**: Gigabit Ethernet

#### PC4 - Worker (Desktop PC)
- **CPU**: 8+ cores
- **RAM**: 32GB minimum
- **Storage**: 200GB free space
- **GPU**: NVIDIA RTX 3090 Ti 24GB or better
- **Network**: Gigabit Ethernet

### Software Requirements

**All PCs**:
- Operating System: Windows 10/11 or macOS 12+
- Docker Desktop (latest version)
- Git (2.40+)
- Node.js 20+ (via Volta recommended)
- Administrator/sudo privileges

**Additional for Windows**:
- PowerShell 7+
- WSL 2 (for Docker)
- Windows Terminal (recommended)

**Additional for macOS**:
- Homebrew
- Xcode Command Line Tools

### Network Requirements
- All 4 PCs on same local network (switch/router)
- Static IP addresses available: 10.0.0.1-4
- Internet connection for downloads (~20GB total)
- Optional: Tailscale account for VPN mesh

### API Keys Required
- **Anthropic API Key** (critical) - https://console.anthropic.com
- **OpenRouter API Key** (recommended) - https://openrouter.ai
- **Google Gemini API Key** (optional) - https://makersuite.google.com
- **Twilio Account** (for SMS/voice) - https://twilio.com
- **SendGrid API Key** (for email) - https://sendgrid.com

---

## 🚀 Quick Start (30 Minutes)

For experienced users who want to get up and running quickly:

### 1. Clone Repository (All PCs)
```bash
git clone https://github.com/yourusername/Project-Nyra.git
cd Project-Nyra
```

### 2. Run Bootstrap GUI
```bash
cd bootstrap-gui
npm install
npm run dev
```

Follow the wizard to configure each PC.

### 3. Deploy Services
```bash
# PC1 (Orchestrator)
docker compose -f infra/docker-compose.orchestrator.yml up -d

# PC2, PC3, PC4 (Workers)
docker compose -f infra/docker-compose.worker.yml --profile worker-2 up -d  # PC2
docker compose -f infra/docker-compose.worker.yml --profile worker-3 up -d  # PC3
docker compose -f infra/docker-compose.worker.yml --profile worker-4 up -d  # PC4
```

### 4. Verify Health
```bash
docker compose ps
curl http://10.0.0.1:6000/health  # Nexus Router
```

---

## 📖 Detailed Setup Guide

### Phase 1: System Preparation (30 minutes)

#### Step 1.1: Install Base Software

**Windows**:
```powershell
# Install Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install required software
choco install -y git docker-desktop nodejs-lts powershell-core
```

**macOS**:
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required software
brew install git docker node
brew install --cask docker
```

#### Step 1.2: Install Volta (Package Manager)

**All platforms**:
```bash
# Install Volta
curl https://get.volta.sh | bash

# Configure Volta
volta install node@20
volta install pnpm@8
```

#### Step 1.3: Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
```

#### Step 1.4: Start Docker Desktop

- **Windows**: Launch Docker Desktop, wait for startup
- **macOS**: Open Docker.app, wait for "Docker Desktop is running"

Verify:
```bash
docker --version
docker compose version
```

---

### Phase 2: Network Configuration (20 minutes)

#### Step 2.1: Assign Static IPs

**PC1 (Orchestrator) - 10.0.0.1**

*Windows*:
```powershell
netsh interface ip set address "Ethernet" static 10.0.0.1 255.255.255.0 10.0.0.1
netsh interface ip set dns "Ethernet" static 8.8.8.8
netsh interface ip add dns "Ethernet" 8.8.4.4 index=2
```

*macOS*:
```bash
networksetup -setmanual "Ethernet" 10.0.0.1 255.255.255.0 10.0.0.1
networksetup -setdnsservers "Ethernet" 8.8.8.8 8.8.4.4
```

**PC2 (Worker-2) - 10.0.0.2**
**PC3 (Worker-3) - 10.0.0.3**
**PC4 (Worker-4) - 10.0.0.4**

Repeat above commands with appropriate IP addresses.

#### Step 2.2: Test Connectivity

```bash
# From any PC, test connectivity to all others
ping 10.0.0.1
ping 10.0.0.2
ping 10.0.0.3
ping 10.0.0.4
```

All pings should succeed with <1ms latency.

#### Step 2.3: Setup Tailscale (Optional but Recommended)

```bash
# Install Tailscale
# Windows: https://tailscale.com/download/windows
# macOS: brew install --cask tailscale

# Authenticate
tailscale up

# Verify
tailscale status
```

---

### Phase 3: Repository Setup (15 minutes)

#### Step 3.1: Clone Project Nyra

**All PCs**:
```bash
cd ~
mkdir -p Dev/Projects/Repos
cd Dev/Projects/Repos
git clone https://github.com/yourusername/Project-Nyra.git
cd Project-Nyra
```

#### Step 3.2: Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# Build packages
pnpm build
```

#### Step 3.3: Configure Environment Variables

```bash
# Copy master template
cp master-.env.example .env

# Edit with your API keys
# Use your preferred editor: nano, vim, code, etc.
nano .env
```

**Critical variables to set**:
```bash
# LLM Providers (at least one required)
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXX

# Optional but recommended
OPENROUTER_API_KEY=sk-or-v1-XXXXXXXX
GOOGLE_API_KEY=AIzaSyXXXXXX

# Database passwords (generate strong passwords)
LETTA_PG_PASSWORD=<strong-password>
TWENTYCRM_PG_PASSWORD=<strong-password>
N8N_PG_PASSWORD=<strong-password>
DIFY_PG_PASSWORD=<strong-password>

# Redis password
REDIS_PASSWORD=<strong-password>

# Infisical (secrets management)
INFISICAL_ENCRYPTION_KEY=<32-char-random>
INFISICAL_JWT_SECRET=<32-char-random>

# PC-specific (set on each PC)
PC_NAME=orchestrator  # or worker-2, worker-3, worker-4
PC_ROLE=orchestrator  # or worker-2, worker-3, worker-4
LAN_IP=10.0.0.1       # or 10.0.0.2, 10.0.0.3, 10.0.0.4
```

Generate secure passwords:
```bash
# Generate random password
openssl rand -base64 32
```

---

### Phase 4: Service Deployment (45 minutes)

#### Step 4.1: Deploy Orchestrator (PC1 only)

```bash
cd infra
docker compose -f docker-compose.orchestrator.yml pull
docker compose -f docker-compose.orchestrator.yml up -d

# Wait for services to start (2-3 minutes)
sleep 180

# Check health
docker compose -f docker-compose.orchestrator.yml ps
```

**Expected services**:
- nexus-router (port 6000)
- letta (port 8283)
- mem0 (port 4321)
- claude-flow (port 3010)
- agentdb (port 8080)
- ruvector (port 8888)
- infisical (port 8080)
- redis (port 6380)

#### Step 4.2: Deploy Worker 2 (PC2 only)

```bash
cd infra
docker compose -f docker-compose.worker.yml --profile worker-2 pull
docker compose -f docker-compose.worker.yml --profile worker-2 up -d

# Wait for services
sleep 180

# Check health
docker compose -f docker-compose.worker.yml ps
```

**Expected services**:
- twentycrm (port 3000)
- n8n (port 5678)
- dify (ports 3001, 3002)
- redis (port 6379)
- postgresql instances

#### Step 4.3: Deploy Worker 3 (PC3 only)

```bash
cd infra
docker compose -f docker-compose.worker.yml --profile worker-3 pull
docker compose -f docker-compose.worker.yml --profile worker-3 up -d

# Check health
docker compose -f docker-compose.worker.yml ps
```

**Expected services**:
- ollama (port 11434)
- neo4j (ports 7474, 7687)
- falkordb (port 6379)

#### Step 4.4: Deploy Worker 4 (PC4 only)

```bash
cd infra
docker compose -f docker-compose.worker.yml --profile worker-4 pull
docker compose -f docker-compose.worker.yml --profile worker-4 up -d

# Check health
docker compose -f docker-compose.worker.yml ps
```

**Expected services**:
- prometheus (port 9090)
- grafana (port 3005)
- loki (port 3100)
- promtail
- alertmanager (port 9093)

---

### Phase 5: GPU Worker Configuration (30 minutes, PC2/3/4 only)

#### Step 5.1: Verify GPU Access

```bash
# Check NVIDIA drivers
nvidia-smi

# Check Docker GPU access
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
```

#### Step 5.2: Pull Ollama Models (PC3 only)

```bash
# Pull models (15-20 minutes, ~16GB download)
docker exec ollama ollama pull llama3.1:8b
docker exec ollama ollama pull mistral:7b
docker exec ollama ollama pull codellama:13b

# Verify
docker exec ollama ollama list
```

#### Step 5.3: Test GPU Inference

```bash
# Test generation
docker exec ollama ollama run llama3.1:8b "What is 2+2?"
```

---

### Phase 6: Service Configuration (30 minutes)

#### Step 6.1: Configure Nexus Router (PC1)

Test routing:
```bash
curl -X POST http://10.0.0.1:6000/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

#### Step 6.2: Configure TwentyCRM (PC2)

1. Open browser: http://10.0.0.2:3000
2. Create admin account
3. Import mortgage pipeline template
4. Configure lead stages

#### Step 6.3: Configure n8n (PC2)

1. Open browser: http://10.0.0.2:5678
2. Login with N8N_USER/N8N_PASSWORD from .env
3. Import workflow templates from `workflows/n8n/`

#### Step 6.4: Configure Grafana (PC4)

1. Open browser: http://10.0.0.4:3005
2. Login with GRAFANA_USER/GRAFANA_PASSWORD
3. Verify Prometheus data source
4. Import dashboards from `infra/monitoring/grafana/dashboards/`

---

### Phase 7: Validation & Testing (20 minutes)

#### Step 7.1: Health Check All Services

```bash
# Run health check script
./scripts/health-check-all.sh

# Or manually check each service
curl http://10.0.0.1:6000/health
curl http://10.0.0.1:8283/health
curl http://10.0.0.1:4321/health
curl http://10.0.0.2:3000/health
curl http://10.0.0.2:5678/healthz
curl http://10.0.0.3:11434/
curl http://10.0.0.4:9090/-/healthy
```

#### Step 7.2: Test Inter-Service Communication

```bash
# Test Nexus → Claude API
curl -X POST http://10.0.0.1:6000/v1/messages \
  -H "Content-Type: application/json" \
  -d '{"model": "claude-3-5-sonnet-20241022", "max_tokens": 50, "messages": [{"role": "user", "content": "test"}]}'

# Test Ollama → GPU inference
curl http://10.0.0.3:11434/api/generate \
  -d '{"model": "llama3.1:8b", "prompt": "test", "stream": false}'

# Test Prometheus → metrics
curl http://10.0.0.4:9090/api/v1/query?query=up
```

#### Step 7.3: Run End-to-End Test

```bash
# Deploy test workflow
cd apps/ratehunter
npm install
npm run build
npm run test

# Test Quote Engine
cd ../../services/quote-engine
pytest

# Test Campaign Engine
cd ../campaign-engine
pytest
```

---

## 🎨 Post-Setup Configuration

### Enable Monitoring Alerts

Edit `infra/monitoring/alertmanager/alertmanager.yml`:
```yaml
receivers:
  - name: 'email'
    email_configs:
      - to: 'your-email@example.com'
        from: 'alerts@projectnyra.com'
```

### Setup Backup Strategy

```bash
# Create backup script
cat > scripts/backup-daily.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
docker exec postgres-twentycrm pg_dump -U twentycrm twentycrm > backups/twentycrm-$DATE.sql
docker exec postgres-dify pg_dump -U dify dify > backups/dify-$DATE.sql
tar czf backups/volumes-$DATE.tar.gz -C /var/lib/docker/volumes .
EOF

chmod +x scripts/backup-daily.sh

# Schedule with cron (Linux/macOS)
crontab -e
# Add: 0 2 * * * /path/to/scripts/backup-daily.sh
```

### Configure Infisical Secrets

1. Open http://10.0.0.1:8080
2. Create project: "Project-Nyra"
3. Add secrets:
   - ANTHROPIC_API_KEY
   - OPENROUTER_API_KEY
   - Database passwords
4. Update docker-compose.yml to use Infisical

---

## 🔧 Troubleshooting

### Service Won't Start

**Check logs**:
```bash
docker compose logs -f [service-name]
```

**Common issues**:
1. Port conflict → Change port in docker-compose.yml
2. Missing env var → Check .env file
3. Database connection → Verify PostgreSQL is running

### Can't Connect Between PCs

**Test connectivity**:
```bash
ping 10.0.0.X
curl http://10.0.0.X:[port]/health
```

**Solutions**:
1. Check firewall rules
2. Verify static IP configuration
3. Ensure all PCs on same network

### GPU Not Detected

**Check drivers**:
```bash
nvidia-smi
```

**Install NVIDIA Container Toolkit** (if missing):
```bash
# Follow: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html
```

### High Memory Usage

**Check usage**:
```bash
docker stats --no-stream
```

**Solutions**:
1. Reduce OLLAMA_MAX_LOADED_MODELS
2. Use smaller models (7b instead of 13b)
3. Increase system RAM
4. Enable swap

For more troubleshooting, see: `docs/MASTER-TROUBLESHOOTING.md`

---

## 📊 Verification Checklist

### ✅ Infrastructure
- [ ] All 4 PCs have static IPs (10.0.0.1-4)
- [ ] Inter-PC connectivity working (all pings succeed)
- [ ] Tailscale mesh connected (optional)
- [ ] Docker running on all PCs
- [ ] GPU detected on workers 2, 3, 4

### ✅ Services (PC1 - Orchestrator)
- [ ] Nexus Router: http://10.0.0.1:6000/health
- [ ] Letta: http://10.0.0.1:8283/health
- [ ] Mem0: http://10.0.0.1:4321/health
- [ ] Claude Flow: http://10.0.0.1:3010/health
- [ ] AgentDB: http://10.0.0.1:8080/health
- [ ] RuVector: http://10.0.0.1:8888/health
- [ ] Infisical: http://10.0.0.1:8080

### ✅ Services (PC2 - Worker-2)
- [ ] TwentyCRM: http://10.0.0.2:3000
- [ ] n8n: http://10.0.0.2:5678
- [ ] Dify: http://10.0.0.2:3001
- [ ] Redis accessible

### ✅ Services (PC3 - Worker-3)
- [ ] Ollama: http://10.0.0.3:11434
- [ ] Neo4j: http://10.0.0.3:7474
- [ ] FalkorDB: http://10.0.0.3:6379
- [ ] 3 models pulled (llama3.1, mistral, codellama)

### ✅ Services (PC4 - Worker-4)
- [ ] Prometheus: http://10.0.0.4:9090
- [ ] Grafana: http://10.0.0.4:3005
- [ ] Loki: http://10.0.0.4:3100
- [ ] Alertmanager: http://10.0.0.4:9093

### ✅ Configuration
- [ ] .env file populated with API keys
- [ ] Database passwords set
- [ ] Secrets stored in Infisical
- [ ] Monitoring dashboards imported

### ✅ Testing
- [ ] Nexus routes to Claude API successfully
- [ ] Ollama generates text on GPU
- [ ] TwentyCRM accessible and configured
- [ ] n8n workflows imported
- [ ] Grafana shows metrics

---

## 🚀 Next Steps

### 1. Deploy Frontend Applications

```bash
# RateHunter public site
cd apps/ratehunter
npm run build
# Deploy to port 3100

# Nyra Admin dashboard
cd ../nyra-admin
npm run build
# Deploy to port 3101
```

### 2. Create First Workflow

Use n8n to create mortgage lead drip campaign:
1. Open http://10.0.0.2:5678
2. Import `workflows/n8n/mortgage-drip-campaign.json`
3. Configure Twilio credentials
4. Activate workflow

### 3. Test Quote Generation

```bash
curl -X POST http://10.0.0.1:8001/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "loan_amount": 300000,
    "property_value": 400000,
    "credit_score": 750,
    "loan_type": "conventional"
  }'
```

### 4. Monitor System Health

Visit Grafana dashboards:
- System Overview: http://10.0.0.4:3005/d/system-overview
- Service Health: http://10.0.0.4:3005/d/service-health
- Business Metrics: http://10.0.0.4:3005/d/business-metrics

### 5. Review Documentation

- Architecture: `docs/ARCHITECTURE.md`
- Workflows: `docs/workflows/TOP-15-CLAUDE-FLOW-WORKFLOWS.md`
- Troubleshooting: `docs/MASTER-TROUBLESHOOTING.md`
- Best Practices: `docs/BEST-PRACTICES.md`

---

## 📞 Support & Resources

### Documentation
- **Master CLAUDE.md**: Project overview and architecture
- **Master Troubleshooting**: `docs/MASTER-TROUBLESHOOTING.md`
- **Workflow Guide**: `docs/workflows/TOP-15-CLAUDE-FLOW-WORKFLOWS.md`
- **Environment Variables**: `docs/environment/MASTER-ENV-VARS.md`

### Useful Commands
```bash
# View all services
docker compose ps

# View logs
docker compose logs -f

# Restart service
docker compose restart [service-name]

# Check resource usage
docker stats

# Full restart
docker compose down && docker compose up -d
```

### Common URLs
- Nexus Router: http://10.0.0.1:6000
- TwentyCRM: http://10.0.0.2:3000
- n8n: http://10.0.0.2:5678
- Grafana: http://10.0.0.4:3005

---

**Setup Time**: ~2-4 hours
**Last Updated**: 2026-01-13
**Version**: 1.0
**Maintainer**: Project Nyra Team

🎉 **Congratulations!** Your 4-PC Project Nyra cluster is now operational.
