# Project Nyra - Deployment Checklist

**Phase 2 Complete - Ready for Production Deployment**

**Date**: 2026-01-27
**Version**: 1.0.0
**Status**: ✅ All Code Complete

---

## 📋 Pre-Deployment Validation

### ✅ Code Completion Status

#### PowerShell Scripts (6/6 Complete)
- [x] Install-Prerequisites.ps1 (190 lines)
- [x] Setup-Tailscale.ps1 (231 lines)
- [x] Get-PCHardwareInfo.ps1 (377 lines) - **Tested Successfully**
- [x] Setup-CloudflareTunnel.ps1 (459 lines)
- [x] Setup-vLLM.ps1 (166 lines)
- [x] Setup-Ollama.ps1 (65 lines)

#### React Components (3/3 Complete)
- [x] PrerequisitesScreen.tsx (161 lines)
- [x] CloudflareSetupScreen.tsx (205 lines)
- [x] VLLMSetupScreen.tsx (340 lines)

#### Backend Integration (Complete)
- [x] 6 IPC handlers in main.ts (+245 lines)
- [x] 6 TypeScript methods in preload.ts
- [x] App.tsx updated (11-screen flow)
- [x] TypeScript compilation passed ✓

#### Documentation (9/9 Complete)
- [x] BOOTSTRAP-CONSOLIDATION-PLAN.md
- [x] CONSOLIDATION-PHASE1-COMPLETE.md
- [x] CONSOLIDATION-PHASE1.5-COMPLETE.md
- [x] PHASE2-GUI-VLLM-IMPLEMENTATION.md
- [x] PHASE2-IMPLEMENTATION-STATUS.md
- [x] CONSOLIDATION-COMPLETE-SUMMARY.md
- [x] PROJECT-COMPLETE-SUMMARY.md
- [x] installer/QUICKSTART.md
- [x] DEPLOYMENT-CHECKLIST.md (this file)

---

## 🚀 Deployment Sequence

### PC1: Orchestrator (First)

**Hardware**: Minisforum UH680, Ryzen 7 6800H, 16GB DDR5

**Steps**:
```powershell
# 1. Navigate to installer
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\installer

# 2. Install dependencies (if not done)
npm install

# 3. Run GUI installer
npm run dev

# OR for production build:
npm run build
npm run start
```

**Installer Flow**:
1. Welcome → Continue
2. PC Detection → Verify shows orchestrator-mini (no GPU)
3. Prerequisites → Install all 6 packages (~15 mins)
4. Network Config → Set static IP 10.0.0.1
5. Docker Setup → Install Docker Desktop (~10 mins)
6. Tailscale VPN → Browser auth (~2 mins)
7. Cloudflare Tunnel → Setup 16 services (~5 mins)
8. Services → Deploy orchestrator compose (~10 mins)
9. GPU/Inference → Skip (no GPU)
10. Health Check → Verify all services running
11. Complete → Success!

**Expected Duration**: 45-60 minutes

**Validation**:
```powershell
# Check Docker containers
docker ps

# Should see ~20 containers running:
# - PostgreSQL, Redis
# - Nexus Router, Cloudflared, Tailscale
# - TwentyCRM, Dify, n8n, etc.

# Check Cloudflare tunnel
docker logs cloudflared

# Check Tailscale connection
docker exec tailscale tailscale status

# Open health dashboard
start ..\health-dashboard.html
```

**Critical Services to Verify**:
- [ ] PostgreSQL (port 5432)
- [ ] Redis (port 6379)
- [ ] Nexus Router (port 12008)
- [ ] Claude-Flow (port 8051)
- [ ] Cloudflared (tunnel active)
- [ ] Tailscale (VPN connected)

---

### PC2: Worker RTX 3060 (Second)

**Hardware**: Alienware m15 R7, RTX 3060 12GB, 32GB DDR5

**Steps**:
```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\installer
npm run dev
```

**Installer Flow**:
1. Welcome → Continue
2. PC Detection → Verify shows worker-rtx3060 (6GB GPU detected)
3. Prerequisites → Skip (already installed)
4. Network Config → Set static IP 10.0.0.2
5. Docker Setup → Skip if already installed
6. Tailscale VPN → Browser auth
7. Cloudflare Tunnel → Setup with `-SkipDNS` (2 services)
8. Services → Deploy worker compose
9. GPU/Inference → **Select Ollama**
   - Models: llama3:8b, mistral:7b
   - Duration: ~10 minutes (downloads)
10. Health Check → Verify Ollama running
11. Complete → Success!

**Expected Duration**: 25-35 minutes

**Validation**:
```powershell
# Check Ollama
ollama list

# Should see:
# llama3:8b
# mistral:7b

# Test Ollama
ollama run llama3:8b "Hello, test response"

# Check API
curl http://localhost:11434/api/tags

# Verify Tailscale connection to orchestrator
ping orchestrator-mini
```

**Critical Services to Verify**:
- [ ] Ollama (port 11434)
- [ ] Tailscale (connected to mesh)
- [ ] Cloudflared (optional, for HA)

---

### PC3: Worker RTX 5090 (Third - PRIMARY vLLM)

**Hardware**: Desktop, RTX 5090 32GB

**Steps**:
```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\installer
npm run dev
```

**Installer Flow**:
1. Welcome → Continue
2. PC Detection → Verify shows worker-rtx5090 (32GB GPU detected)
3. Prerequisites → Skip
4. Network Config → Set static IP 10.0.0.3
5. Docker Setup → Skip
6. Tailscale VPN → Browser auth
7. Cloudflare Tunnel → Setup with `-SkipDNS`
8. Services → Deploy worker compose
9. GPU/Inference → **Select vLLM**
   - Model: Llama 3 70B AWQ
   - Enable LMCache: Yes
   - Redis Host: orchestrator-mini
   - Redis Port: 6379
   - Max Model Len: 4096
   - GPU Memory: 0.95
   - Duration: ~20-30 minutes (model download)
10. Health Check → Verify vLLM running
11. Complete → Success!

**Expected Duration**: 35-45 minutes

**Validation**:
```powershell
# Check vLLM container
docker ps | grep vllm

# Should see:
# worker-rtx5090-vllm

# Check logs
docker logs worker-rtx5090-vllm --tail 50

# Verify health
curl http://localhost:8000/health

# Check API
curl http://localhost:8000/v1/models

# Test inference (first request will be slow - cache warming)
curl http://localhost:8000/v1/completions `
  -H "Content-Type: application/json" `
  -d '{"model":"TheBloke/Llama-3-70B-Instruct-AWQ","prompt":"Hello","max_tokens":10}'

# Ping orchestrator Redis
ping orchestrator-mini
Test-NetConnection orchestrator-mini -Port 6379
```

**Critical Services to Verify**:
- [ ] vLLM (port 8000)
- [ ] Docker runtime: nvidia
- [ ] GPU detected by Docker
- [ ] Redis connection to orchestrator
- [ ] LMCache enabled
- [ ] TTFT < 400ms (after cache warm-up)

**Performance Targets**:
- Initial TTFT: 1,500-2,500ms (cold cache)
- Warm cache TTFT: 150-400ms (5-10x faster)
- Cache hit rate: 87-90% (after 100+ prompts)

---

### PC4: Worker RTX 3090 Ti (Fourth - BACKUP vLLM)

**Hardware**: Area-51, RTX 3090 Ti 24GB

**Steps**: Same as PC3

**Installer Flow**:
1-8. Same as PC3
9. GPU/Inference → **Select vLLM**
   - Model: Llama 3 70B AWQ
   - Enable LMCache: Yes
   - Redis Host: orchestrator-mini (SHARED with PC3)
   - Redis Port: 6379
   - Duration: ~20-30 minutes

**Expected Duration**: 35-45 minutes

**Validation**: Same as PC3, plus:
```powershell
# Verify shared LMCache works
# Run same prompt on PC3 and PC4
# Second should be instant (cache hit)
```

**Critical Services to Verify**:
- [ ] vLLM (port 8000)
- [ ] Shared LMCache with PC3
- [ ] Failover capability

---

## ✅ Post-Deployment Validation

### System-Wide Checks

#### 1. Network Connectivity
```powershell
# From orchestrator, ping all workers
ping 10.0.0.2  # RTX 3060
ping 10.0.0.3  # RTX 5090
ping 10.0.0.4  # RTX 3090 Ti

# Verify Tailscale mesh
tailscale status

# Should show all 4 PCs connected
```

#### 2. Service Health
```powershell
# Open health dashboard on orchestrator
start ..\health-dashboard.html

# Should show all green:
# - PostgreSQL ✓
# - Redis ✓
# - Nexus Router ✓
# - Claude-Flow ✓
# - TwentyCRM ✓
# - Dify ✓
# - n8n ✓
# - Prometheus ✓
# - Grafana ✓
# - Loki ✓
# - Cloudflared ✓
# - Tailscale ✓
# - Workers ✓
```

#### 3. Public Access
```powershell
# Test public URLs (from orchestrator or external)
curl https://ratehunter.net
curl https://app.projectnyra.com
curl https://crm.projectnyra.com
curl https://monitor.ratehunter.net

# Should all return HTTP 200
```

#### 4. Inference Pipeline
```powershell
# Test Ollama (PC2)
curl http://10.0.0.2:11434/api/tags

# Test vLLM (PC3)
curl http://10.0.0.3:8000/health

# Test vLLM (PC4)
curl http://10.0.0.4:8000/health

# Via Nexus Router (orchestrator)
curl http://localhost:12008/health
```

#### 5. Monitoring
```powershell
# Access Grafana
start https://monitor.ratehunter.net

# Login and verify:
# - All 4 PCs appear as targets
# - Metrics flowing
# - GPU metrics visible (PC2, PC3, PC4)
# - No alerts firing
```

---

## 📊 Performance Benchmarking

### vLLM Performance Test (PC3 & PC4)

```powershell
# Run 100 test prompts to warm cache
for ($i=1; $i -le 100; $i++) {
    curl http://localhost:8000/v1/completions `
      -H "Content-Type: application/json" `
      -d "{\"model\":\"TheBloke/Llama-3-70B-Instruct-AWQ\",\"prompt\":\"Test prompt $i\",\"max_tokens\":50}"
}

# Benchmark TTFT
Measure-Command {
    curl http://localhost:8000/v1/completions `
      -H "Content-Type: application/json" `
      -d '{"model":"TheBloke/Llama-3-70B-Instruct-AWQ","prompt":"Hello","max_tokens":10}'
}

# Target: < 400ms
```

### Cache Hit Rate Validation

```powershell
# Check Redis cache metrics
docker exec redis redis-cli INFO stats

# Look for:
# - keyspace_hits / (keyspace_hits + keyspace_misses)
# Target: > 87%
```

### Ollama Performance Test (PC2)

```powershell
# Benchmark Ollama (for comparison)
Measure-Command {
    ollama run llama3:8b "Hello" --verbose
}

# Expected: 1,500-2,500ms (much slower than vLLM)
```

---

## 🔧 Troubleshooting

### Common Issues

#### GUI Installer Won't Start
```powershell
# Check Node.js installed
node --version  # Should be 20+

# Check npm dependencies
cd bootstrap/installer
npm install

# Check for TypeScript errors
npx tsc -p tsconfig.electron.json
```

#### Hardware Detection Fails
```powershell
# Run script manually
.\bootstrap\scripts\windows\Get-PCHardwareInfo.ps1

# If GPU not detected:
nvidia-smi  # Should show GPU info

# If still fails, check NVIDIA drivers
```

#### Prerequisites Installation Fails
```powershell
# Check winget available
winget --version

# If not, install from Microsoft Store:
# App Installer

# Try manual installation:
.\bootstrap\scripts\windows\Install-Prerequisites.ps1 -Verbose
```

#### Tailscale Auth Fails
```powershell
# Use auth key instead of browser auth
# Get key from: https://login.tailscale.com/admin/settings/keys

# Pass to script:
.\bootstrap\scripts\tailscale\Setup-Tailscale.ps1 -AuthKey "tskey-auth-xxxx"
```

#### Cloudflare Tunnel Won't Connect
```powershell
# Check tunnel logs
docker logs cloudflared --tail 100

# Verify cloudflared installed
cloudflared version

# Re-authenticate
cloudflared tunnel login
```

#### vLLM Container Won't Start
```powershell
# Check NVIDIA runtime
docker run --rm --runtime=nvidia nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi

# If fails, reinstall NVIDIA Container Toolkit
# See: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html

# Check GPU available
nvidia-smi

# Check Docker GPU support
docker info | grep -i nvidia
```

#### LMCache Not Working
```powershell
# Verify Redis accessible from worker
Test-NetConnection orchestrator-mini -Port 6379

# Check Redis container
docker logs redis

# Verify Redis allows remote connections
docker exec redis redis-cli PING
# Should return: PONG

# Check vLLM connected to Redis
docker logs worker-rtx5090-vllm | grep -i redis
```

---

## 📈 Success Metrics

### Deployment Complete When:

#### Infrastructure
- [ ] All 4 PCs have static IPs configured
- [ ] All PCs connected to Tailscale mesh
- [ ] Orchestrator has 20+ containers running
- [ ] Each worker has 3-4 containers running
- [ ] All services show "healthy" in health dashboard

#### Networking
- [ ] Public URLs accessible (ratehunter.net, etc.)
- [ ] All Cloudflare tunnels connected
- [ ] DNS records resolving correctly
- [ ] LAN connectivity between all PCs

#### Inference
- [ ] Ollama running on PC2, responding on port 11434
- [ ] vLLM running on PC3, responding on port 8000
- [ ] vLLM running on PC4, responding on port 8000
- [ ] LMCache cache hit rate > 87% (after warm-up)
- [ ] vLLM TTFT < 400ms (warm cache)

#### Monitoring
- [ ] Grafana accessible and showing all PCs
- [ ] Prometheus scraping metrics from all targets
- [ ] Loki collecting logs
- [ ] No critical alerts firing

---

## 🎉 Deployment Complete!

### Next Steps

1. **Configure Applications**
   - Setup TwentyCRM
   - Import n8n workflows
   - Configure Dify AI chat

2. **Team Training**
   - Nyra Admin walkthrough
   - Campaign creation guide
   - Monitoring dashboard usage

3. **Go Live**
   - Enable public access
   - Start first campaign
   - Monitor performance

4. **Optimization**
   - Tune vLLM parameters
   - Optimize cache warming
   - Review cost metrics
   - Scale as needed

---

## 📞 Support

### Documentation
- **Main Guide**: `bootstrap/BOOTSTRAP-MASTER-GUIDE.md`
- **Quick Start**: `bootstrap/installer/QUICKSTART.md`
- **Phase 2 Status**: `bootstrap/docs/PHASE2-IMPLEMENTATION-STATUS.md`
- **Project Summary**: `bootstrap/docs/PROJECT-COMPLETE-SUMMARY.md`

### Commands Reference
- **Hardware Detection**: `.\scripts\windows\Get-PCHardwareInfo.ps1`
- **Prerequisites**: `.\scripts\windows\Install-Prerequisites.ps1`
- **Tailscale**: `.\scripts\tailscale\Setup-Tailscale.ps1`
- **Cloudflare**: `.\scripts\cloudflare\Setup-CloudflareTunnel.ps1`
- **vLLM**: `.\scripts\workers\Setup-vLLM.ps1`
- **Ollama**: `.\scripts\workers\Setup-Ollama.ps1`

---

**Last Updated**: 2026-01-27
**Version**: 1.0.0
**Status**: ✅ Ready for Production Deployment
**Estimated Total Deployment Time**: 3-4 hours (all 4 PCs)
