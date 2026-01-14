# Project Nyra - 4-PC Distributed Deployment Guide

**Version**: 1.0
**Date**: 2026-01-12
**Status**: Ready for Deployment

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Hardware Requirements](#hardware-requirements)
3. [Network Configuration](#network-configuration)
4. [Pre-Deployment Checklist](#pre-deployment-checklist)
5. [Deployment Steps](#deployment-steps)
6. [Service Distribution](#service-distribution)
7. [Health Verification](#health-verification)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## 🎯 Overview

Project Nyra uses a distributed architecture across 4 PCs to maximize performance and scalability:

- **PC1**: Orchestrator (Nexus Router, Claude Flow, Archon OS, Monitoring)
- **PC2**: GPU Worker 1 (Ollama, Ruvector Leader, Memory Systems)
- **PC3**: GPU Worker 2 (Databases, CRM, Knowledge Graphs)
- **PC4**: GPU Worker 3 (Workflows, Business Services)

### Architecture Highlights

- **Ruvector Distributed Consensus**: 3-node Raft cluster for 10-100x vector database performance
- **Dual Orchestrator**: Claude Flow + Archon OS for redundancy
- **GPU Acceleration**: Ollama on PC2 for local LLM inference
- **Horizontal Scalability**: Services distributed across 4 machines
- **High Availability**: Automatic failover via Raft consensus

---

## 🖥️ Hardware Requirements

### PC1: Orchestrator (Mini PC)
- **CPU**: Intel i7 or AMD Ryzen 7 (8 cores minimum)
- **RAM**: 16GB DDR4/DDR5
- **Storage**: 256GB NVMe SSD
- **Network**: 1GbE or 10GbE
- **GPU**: Not required
- **OS**: Windows 10/11 Pro or Ubuntu 22.04

### PC2: GPU Worker 1
- **CPU**: Intel i9 or AMD Ryzen 9 (12+ cores)
- **RAM**: 64GB DDR4/DDR5
- **Storage**: 1TB NVMe SSD
- **Network**: 10GbE recommended
- **GPU**: NVIDIA RTX 4090 or better (24GB VRAM)
- **OS**: Windows 10/11 Pro or Ubuntu 22.04

### PC3: GPU Worker 2
- **CPU**: Intel i9 or AMD Ryzen 9 (12+ cores)
- **RAM**: 64GB DDR4/DDR5
- **Storage**: 2TB NVMe SSD (databases need space)
- **Network**: 10GbE recommended
- **GPU**: NVIDIA RTX 4080 or better (16GB VRAM)
- **OS**: Windows 10/11 Pro or Ubuntu 22.04

### PC4: GPU Worker 3
- **CPU**: Intel i9 or AMD Ryzen 9 (12+ cores)
- **RAM**: 32GB DDR4/DDR5
- **Storage**: 512GB NVMe SSD
- **Network**: 10GbE recommended
- **GPU**: NVIDIA RTX 4070 Ti or better (12GB VRAM)
- **OS**: Windows 10/11 Pro or Ubuntu 22.04

### Network Equipment
- **Switch**: Managed 10GbE switch (4+ ports)
- **Cables**: Cat6a or Cat7 Ethernet cables
- **Router**: For internet access and Cloudflare Tunnels
- **Optional**: UPS for power backup

---

## 🌐 Network Configuration

### Local Network (10.0.0.0/24)

All PCs must be on the same local subnet with static IPs:

| PC | IP Address | Hostname | Purpose |
|----|------------|----------|---------|
| PC1 | 10.0.0.1 | nyra-orchestrator | Control plane |
| PC2 | 10.0.0.2 | nyra-gpu-worker-1 | Ruvector leader |
| PC3 | 10.0.0.3 | nyra-gpu-worker-2 | Ruvector follower 1 |
| PC4 | 10.0.0.4 | nyra-gpu-worker-3 | Ruvector follower 2 |

### Setting Static IPs

**Windows (PowerShell as Administrator)**:
```powershell
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress "10.0.0.1" -PrefixLength 24 -DefaultGateway "10.0.0.254"
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses "8.8.8.8","8.8.4.4"
```

**Linux (Ubuntu)**:
```bash
# Edit /etc/netplan/01-netcfg.yaml
sudo nano /etc/netplan/01-netcfg.yaml

# Add configuration:
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses: [10.0.0.1/24]
      gateway4: 10.0.0.254
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]

# Apply configuration
sudo netplan apply
```

### Firewall Configuration

**Allow inter-PC communication** on these ports:

#### PC1 (Orchestrator)
- 8000 (Nexus Router)
- 9000-9003 (Claude Flow, Archon OS)
- 9090 (Prometheus)
- 3005 (Grafana)

#### PC2 (GPU Worker 1)
- 11434 (Ollama)
- 6370-6372 (Ruvector)
- 8283 (Letta)
- 4321 (Mem0)
- 3001 (Dify)

#### PC3 (GPU Worker 2)
- 6370-6372 (Ruvector)
- 5432 (PostgreSQL)
- 3000 (TwentyCRM)
- 7474, 7687 (Neo4j)
- 6379 (FalkorDB)
- 6333 (Qdrant)

#### PC4 (GPU Worker 3)
- 6370-6372 (Ruvector)
- 5678 (n8n)
- 3400 (Activepieces)
- 8001 (Quote Engine)
- 8002 (Campaign Engine)
- 8010 (Orchestrator)

**Windows Firewall**:
```powershell
# Allow all traffic from 10.0.0.0/24 subnet
New-NetFirewallRule -DisplayName "Nyra Cluster" -Direction Inbound -LocalAddress 10.0.0.0/24 -RemoteAddress 10.0.0.0/24 -Action Allow
```

**Linux UFW**:
```bash
sudo ufw allow from 10.0.0.0/24
sudo ufw enable
```

### Tailscale Mesh VPN (Optional but Recommended)

For secure remote access and hybrid cloud:

1. Install Tailscale on all PCs: https://tailscale.com/download
2. Authenticate each PC: `tailscale up --auth-key YOUR_AUTH_KEY`
3. Verify connectivity: `tailscale status`

Tailscale IPs (100.x.x.x range) can be used as fallback if local network fails.

---

## ✅ Pre-Deployment Checklist

### On All PCs

- [ ] Docker Desktop installed and running (Windows) OR Docker Engine (Linux)
- [ ] Docker Compose v2 installed
- [ ] Static IP configured (10.0.0.x)
- [ ] Firewall rules configured
- [ ] All PCs can ping each other
- [ ] Internet connectivity verified
- [ ] Sufficient disk space (check requirements above)
- [ ] Windows: WSL2 enabled (for Docker Desktop)
- [ ] Linux: User in docker group (`sudo usermod -aG docker $USER`)

### On GPU PCs (PC2, PC3, PC4)

- [ ] NVIDIA drivers installed (535+ recommended)
- [ ] NVIDIA Container Toolkit installed
- [ ] GPU accessible: `nvidia-smi` works
- [ ] GPU visible in Docker: `docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi`

### API Keys Ready

- [ ] Anthropic API Key (`sk-ant-...`)
- [ ] OpenRouter API Key (`sk-or-...`)
- [ ] Google Gemini API Key
- [ ] GitHub Personal Access Token
- [ ] Twilio Account SID + Auth Token (optional)
- [ ] SendGrid API Key (optional)

### Bootstrap Kits Copied

- [ ] `bootstrap-kit-pc1/` on PC1 (10.0.0.1)
- [ ] `bootstrap-kit-pc2/` on PC2 (10.0.0.2)
- [ ] `bootstrap-kit-pc3/` on PC3 (10.0.0.3)
- [ ] `bootstrap-kit-pc4/` on PC4 (10.0.0.4)

---

## 🚀 Deployment Steps

### Step 1: Deploy PC1 (Orchestrator) - FIRST

PC1 must be deployed first as it runs Nexus Router, which other services connect to.

**On PC1 (10.0.0.1)**:

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap-kit-pc1

# Copy environment template
Copy-Item .env.pc1.example .env.pc1

# Edit .env.pc1 with your API keys
notepad .env.pc1

# Run setup script
.\setup-pc1.ps1

# Wait 2-3 minutes for services to start

# Verify health
.\health-check-pc1.ps1
```

**Expected Output**:
```
✓ All services are healthy!

Services:
  Nexus Router:      http://localhost:8000
  Claude Flow:       http://localhost:9000
  Archon OS:         http://localhost:9002
  Prometheus:        http://localhost:9090
  Grafana:           http://localhost:3005
```

**Verify Nexus Router**:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### Step 2: Deploy PC2 (GPU Worker 1) - SECOND

PC2 runs the Ruvector **leader node**, which must be up before PC3/PC4.

**On PC2 (10.0.0.2)**:

```powershell
cd C:\Path\To\bootstrap-kit-pc2

# Copy environment template
Copy-Item .env.pc2.example .env.pc2

# Edit .env.pc2 with your API keys
notepad .env.pc2

# Run setup script (will pull Ollama models, takes 30-60 min)
.\setup-pc2.ps1

# Verify health
.\health-check-pc2.ps1
```

**Expected Output**:
```
✓ PC2 setup complete!

Services:
  Ollama:      http://localhost:11434
  Ruvector:    http://localhost:6370
  Letta:       http://localhost:8283
  Mem0:        http://localhost:4321
  Dify:        http://localhost:3001
```

**Verify Ruvector Leader**:
```bash
curl http://10.0.0.2:6370/health
# Should return: {"status":"healthy","role":"leader","cluster_size":1}
```

### Step 3: Deploy PC3 and PC4 in Parallel - THIRD

Once PC2's Ruvector leader is up, deploy PC3 and PC4 simultaneously.

**On PC3 (10.0.0.3)**:

```powershell
cd C:\Path\To\bootstrap-kit-pc3

Copy-Item .env.pc3.example .env.pc3
notepad .env.pc3

.\setup-pc3.ps1
.\health-check-pc3.ps1
```

**On PC4 (10.0.0.4)**:

```powershell
cd C:\Path\To\bootstrap-kit-pc4

Copy-Item .env.pc4.example .env.pc4
notepad .env.pc4

.\setup-pc4.ps1
.\health-check-pc4.ps1
```

**Verify Ruvector Cluster**:

After PC3 and PC4 are up, check Ruvector cluster status:

```bash
# On any PC, check cluster state
curl http://10.0.0.2:6370/cluster/status

# Expected response:
{
  "cluster_id": "nyra-cluster",
  "leader": "10.0.0.2:6370",
  "members": [
    {"id": "leader", "ip": "10.0.0.2", "role": "leader"},
    {"id": "follower1", "ip": "10.0.0.3", "role": "follower"},
    {"id": "follower2", "ip": "10.0.0.4", "role": "follower"}
  ],
  "status": "healthy",
  "consensus": "raft"
}
```

### Step 4: Verify Full Cluster Health

**Run master health check from PC1**:

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra
.\deploy-nyra-cluster.ps1 -HealthCheckOnly
```

**Expected Output**:
```
========================================
Cluster Status
========================================

PC1-Orchestrator: REACHABLE
PC2-GPU-Worker-1: REACHABLE
PC3-GPU-Worker-2: REACHABLE
PC4-GPU-Worker-3: REACHABLE

========================================
Post-Deployment Health Checks
========================================

Health check for PC1-Orchestrator:
[✓] Nexus Router
[✓] Claude Flow
[✓] Archon OS
[✓] Prometheus
[✓] Grafana
[✓] Loki
Status: 6 / 6 healthy

Health check for PC2-GPU-Worker-1:
[✓] Ollama
[✓] Ruvector Leader
[✓] Letta
[✓] Mem0
[✓] Dify Web
[✓] Dify API
Status: 6 / 6 healthy

Health check for PC3-GPU-Worker-2:
[✓] Ruvector Follower 1
[✓] PostgreSQL
[✓] TwentyCRM
[✓] Neo4j
[✓] FalkorDB
[✓] Qdrant
Status: 6 / 6 healthy

Health check for PC4-GPU-Worker-3:
[✓] Ruvector Follower 2
[✓] n8n
[✓] Activepieces
[✓] Quote Engine
[✓] Campaign Engine
[✓] Orchestrator
Status: 6 / 6 healthy
```

---

## 📊 Service Distribution

### PC1: Orchestrator (Control Plane)

| Service | Port | Purpose |
|---------|------|---------|
| Nexus Router | 8000 | Unified MCP + LLM gateway |
| Nexus Admin | 4001 | Admin dashboard |
| Claude Flow | 9000 | Primary orchestrator MCP |
| Claude Flow UI | 9001 | Web interface |
| Archon OS | 9002 | Secondary orchestrator MCP |
| Archon OS UI | 9003 | Web interface |
| Prometheus | 9090 | Metrics collection |
| Grafana | 3005 | Visualization dashboards |
| Loki | 3100 | Log aggregation |
| AlertManager | 9093 | Alert routing |

### PC2: GPU Worker 1 (Inference + Memory)

| Service | Port | Purpose |
|---------|------|---------|
| Ollama | 11434 | Local LLM inference (Llama 3.1 70B) |
| Ruvector Leader | 6370 | Vector DB leader (Raft consensus) |
| Letta | 8283 | Agent memory (OS-like persistence) |
| Mem0 | 4321 | Universal memory API |
| Dify Web | 3001 | Chat UI platform |
| Dify API | 5001 | Backend API |

### PC3: GPU Worker 2 (Databases + CRM)

| Service | Port | Purpose |
|---------|------|---------|
| Ruvector Follower 1 | 6370 | Vector DB follower |
| PostgreSQL | 5432 | Main relational database |
| TwentyCRM | 3000 | Lead management system |
| Neo4j | 7474, 7687 | Knowledge graph database |
| FalkorDB | 6379 | Redis-compatible graph DB |
| Qdrant | 6333 | Vector similarity search |

### PC4: GPU Worker 3 (Workflows + Business Logic)

| Service | Port | Purpose |
|---------|------|---------|
| Ruvector Follower 2 | 6370 | Vector DB follower |
| n8n | 5678 | Workflow automation (drip campaigns) |
| Activepieces | 3400 | Integration connectors |
| Quote Engine | 8001 | Mortgage quote calculations |
| Campaign Engine | 8002 | Campaign orchestration |
| Nyra Orchestrator | 8010 | Compliance + workflow coordination |

---

## 🔍 Health Verification

### Quick Checks

**From PC1**, test all critical endpoints:

```bash
# PC1 services
curl http://localhost:8000/health
curl http://localhost:9000/health
curl http://localhost:9002/health

# PC2 services (remote)
curl http://10.0.0.2:11434/api/tags
curl http://10.0.0.2:6370/health
curl http://10.0.0.2:8283/v1/health

# PC3 services (remote)
curl http://10.0.0.3:6370/health
curl http://10.0.0.3:3000/healthz

# PC4 services (remote)
curl http://10.0.0.4:6370/health
curl http://10.0.0.4:8001/health
curl http://10.0.0.4:8002/health
curl http://10.0.0.4:8010/health
```

### Grafana Dashboard

1. Open http://localhost:3005 (PC1)
2. Login: `admin` / `admin` (change immediately!)
3. Navigate to "Project Nyra Overview" dashboard
4. Verify all metrics are populating:
   - Service health checks
   - Resource usage (CPU, RAM, GPU)
   - Network traffic
   - Database connections
   - API request rates

### Ruvector Cluster Health

```bash
# Check cluster consensus
curl http://10.0.0.2:6370/cluster/status | jq

# Check replication status
curl http://10.0.0.2:6370/cluster/replication | jq

# Expected: All 3 nodes in sync, leader elected, healthy consensus
```

### Integration Test

Test end-to-end flow across all PCs:

```bash
# 1. Create a memory in Mem0 (PC2)
curl -X POST http://10.0.0.2:4321/memories \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","text":"Test memory for cluster validation"}'

# 2. Query memory from Ruvector (should be replicated to PC3, PC4)
curl http://10.0.0.3:6370/search?q=cluster+validation

# 3. Generate a quote via Quote Engine (PC4)
curl -X POST http://10.0.0.4:8001/quote \
  -H "Content-Type: application/json" \
  -d '{"loan_amount":400000,"credit_score":740,"loan_type":"conventional"}'

# 4. Check if quote was logged in TwentyCRM (PC3)
curl http://10.0.0.3:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ quotes { id amount } }"}'
```

---

## 🐛 Troubleshooting

### Problem: PC cannot reach other PCs

**Symptoms**: Health checks fail, services timeout

**Check**:
```bash
ping 10.0.0.1
ping 10.0.0.2
ping 10.0.0.3
ping 10.0.0.4
```

**Solutions**:
- Verify static IP configuration
- Check firewall rules (Windows Firewall, UFW, iptables)
- Ensure all PCs on same subnet (10.0.0.0/24)
- Verify switch configuration (managed switches need VLAN setup)

### Problem: Ruvector cluster won't form

**Symptoms**: PC3/PC4 Ruvector followers can't join cluster

**Check**:
```bash
# On PC2 (leader)
docker logs nyra-ruvector-leader-pc2

# On PC3 (follower 1)
docker logs nyra-ruvector-follower1-pc3

# On PC4 (follower 2)
docker logs nyra-ruvector-follower2-pc4
```

**Solutions**:
1. Ensure PC2 (leader) is fully started before PC3/PC4
2. Check `RUVECTOR_PEERS` environment variable matches
3. Verify port 6370 is open on all Ruvector nodes
4. Restart followers: `docker restart nyra-ruvector-follower1-pc3`
5. Check Raft logs for split-brain scenarios

### Problem: Docker containers won't start

**Symptoms**: `docker ps` shows containers in "Exited" state

**Check**:
```bash
docker compose -f docker-compose.pcN.yml logs
docker inspect <container-name>
```

**Common Causes**:
- Missing environment variables (check `.env.pcN` file)
- Port conflicts (another service using the port)
- Insufficient disk space
- GPU not accessible (GPU containers only)
- Missing API keys

**Solutions**:
```bash
# Check disk space
df -h

# Check GPU access (GPU containers)
nvidia-smi
docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi

# Restart specific service
docker restart <container-name>

# Rebuild and restart
docker compose -f docker-compose.pcN.yml up -d --build
```

### Problem: Ollama models not downloading

**Symptoms**: PC2 setup hangs on "Pulling Ollama models"

**Solutions**:
- Check internet connectivity on PC2
- Verify Ollama container is running: `docker ps | grep ollama`
- Manual pull: `docker exec nyra-ollama-pc2 ollama pull llama3.1:70b`
- Skip model pull: `.\setup-pc2.ps1 -PullModels:$false`

### Problem: API keys not working

**Symptoms**: Services fail with "Unauthorized" or "Invalid API key"

**Check**:
```bash
# Verify environment variables loaded
docker exec <container-name> env | grep API_KEY
```

**Solutions**:
- Verify API keys in `.env.pcN` files have no extra spaces
- Check API key format:
  - Anthropic: `sk-ant-...`
  - OpenRouter: `sk-or-...`
  - Gemini: No specific format
- Test API keys independently:
  ```bash
  curl https://api.anthropic.com/v1/messages \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d '{"model":"claude-3-5-sonnet-20241022","messages":[{"role":"user","content":"test"}],"max_tokens":10}'
  ```

### Problem: Grafana shows no data

**Symptoms**: Dashboards are empty

**Solutions**:
1. Verify Prometheus is scraping:
   - Open http://localhost:9090 (PC1)
   - Go to Status > Targets
   - All targets should be "UP"
2. Check Prometheus configuration: `bootstrap-kit-pc1/configs/prometheus/prometheus.yml`
3. Verify remote endpoints are accessible from PC1
4. Restart Prometheus: `docker restart nyra-prometheus-pc1`

### Problem: Inter-service communication fails

**Symptoms**: Services can't reach each other

**Debug**:
```bash
# Test from inside a container
docker exec <container-name> curl http://10.0.0.X:PORT/health

# Example: From PC4 Quote Engine, test PC3 PostgreSQL
docker exec nyra-quote-engine-pc4 nc -zv 10.0.0.3 5432
```

**Solutions**:
- Verify service is running on target PC
- Check firewall rules allow traffic
- Verify DNS resolution (if using hostnames)
- Check Docker network configuration

---

## 🎯 Next Steps

### Immediate (First Hour)

1. **Change Default Passwords**
   - Grafana admin password
   - Database passwords
   - TwentyCRM tokens
   - n8n password

2. **Configure Cloudflare Tunnels** (for remote access)
   ```bash
   # Install cloudflared on PC1
   cloudflared tunnel create nyra-orchestrator
   cloudflared tunnel route dns nyra-orchestrator nyra.ratehunter.net
   ```

3. **Setup Tailscale Mesh VPN**
   - Install on all PCs
   - Create ACLs for cross-PC access
   - Test remote access

4. **Import n8n Workflows**
   - Navigate to http://10.0.0.4:5678
   - Import mortgage drip campaign workflows
   - Configure Twilio/SendGrid credentials
   - Test with sample lead

5. **Configure TwentyCRM**
   - Navigate to http://10.0.0.3:3000
   - Create first workspace
   - Add sample lead
   - Test CRM integration

### Short Term (First Week)

6. **Deploy Frontend Applications**
   - RateHunter landing page (port 3100)
   - Nyra Admin dashboard (port 3101)
   - Configure authentication

7. **Implement Business Services**
   - Quote Engine logic (PC4)
   - Campaign Engine rules (PC4)
   - Compliance Sentinel (PC4)

8. **Setup Observability Alerts**
   - Configure AlertManager rules
   - Setup Slack/email notifications
   - Test alert delivery

9. **Load Test System**
   - Generate 1000 test quotes
   - Monitor performance metrics
   - Identify bottlenecks

10. **Backup Strategy**
    - PostgreSQL daily backups
    - Docker volume snapshots
    - Configuration file versioning

### Medium Term (First Month)

11. **Production Hardening**
    - SSL certificates for all services
    - Rotate all API keys
    - Security audit
    - Penetration testing

12. **Documentation**
    - Runbook for common operations
    - Disaster recovery procedures
    - On-call playbook

13. **Monitoring & Alerting**
    - SLA monitoring
    - Performance baselines
    - Capacity planning

14. **Integration Testing**
    - End-to-end workflow tests
    - Failover scenarios
    - Load testing

---

## 📚 Additional Resources

### Documentation
- **IMPLEMENTATION-REPORT-SESSION-3.md**: Complete research findings and architecture
- **DUAL-ORCHESTRATOR-ARCHITECTURE.md**: Claude Flow + Archon OS integration
- **NYRA_AIO_MASTER_BATCH.md**: SPARC consolidation requirements
- **README-OVERNIGHT-SETUP.md**: Autonomous deployment guide

### Bootstrap Kit Contents
Each `bootstrap-kit-pcN/` contains:
- `docker-compose.pcN.yml` - Service definitions
- `.env.pcN.example` - Environment variable template
- `setup-pcN.ps1` - Automated setup script
- `health-check-pcN.ps1` - Service validation
- `configs/` - Service-specific configurations

### External Links
- **Ruvector**: https://github.com/ruvnet/ruvector
- **Claude Flow**: https://github.com/ruvnet/claude-flow
- **Archon OS**: https://github.com/coleam00/Archon
- **TwentyCRM**: https://twenty.com
- **n8n**: https://n8n.io
- **Dify**: https://dify.ai

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ All 4 PCs are reachable on 10.0.0.1-4
✅ All 30+ Docker containers show "healthy" status
✅ Ruvector cluster has 3 members in consensus
✅ Nexus Router routes requests to all services
✅ Grafana dashboards show live metrics
✅ Test quote generates successfully
✅ Ollama responds to prompts
✅ TwentyCRM accessible and operational
✅ n8n workflows loaded
✅ All health checks pass

**Congratulations!** You now have a production-grade distributed AI mortgage automation platform running across 4 PCs.

---

**Deployment Guide Version**: 1.0
**Last Updated**: 2026-01-12
**Maintained By**: Project Nyra Team
