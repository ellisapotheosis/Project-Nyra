# PC1 Orchestrator Setup Guide

**Target Hardware**: Minisforum UH680 Mini PC
**Role**: Orchestrator/Controller
**Version**: 4.0.0
**Last Updated**: January 15, 2026

---

## 📋 Table of Contents

1. [Hardware Requirements](#-hardware-requirements)
2. [Pre-Installation Checklist](#-pre-installation-checklist)
3. [Network Configuration](#-network-configuration)
4. [GUI Installer Setup](#-gui-installer-setup)
5. [Service Configuration](#-service-configuration)
6. [Post-Installation Verification](#-post-installation-verification)
7. [Troubleshooting](#-troubleshooting)

---

## 💻 Hardware Requirements

### Minimum Specifications

```yaml
CPU: Intel Core i7-11800H (8 cores, 16 threads) or better
RAM: 32GB DDR4
Storage: 1TB NVMe SSD (minimum 500GB free)
Network: Gigabit Ethernet
OS: Windows 11 Pro (build 22000+)
```

### Verified Compatible Hardware

- **Minisforum UH680**: Intel Core i7-11800H, 32GB RAM
- **Minisforum UM690**: AMD Ryzen 9 6900HX, 32GB RAM
- **Intel NUC 11 Enthusiast**: Intel Core i7-11800H, 32GB RAM

### Storage Requirements

```
Operating System:     50GB
Docker Images:        100GB
PostgreSQL Data:      50GB
Redis Cache:          10GB
Qdrant Vectors:       30GB
Monitoring Data:      20GB
Logs:                 20GB
Temp/Scratch:         50GB
Total Recommended:    330GB+
```

---

## ✅ Pre-Installation Checklist

### Step 1: Windows Setup

```powershell
# Verify Windows version
winver
# Required: Windows 11 Pro, build 22000+

# Enable required Windows features
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Install WSL 2
wsl --install

# Restart computer
shutdown /r /t 0
```

### Step 2: Install Prerequisites

**Download and Install**:

1. **Git for Windows**
   ```powershell
   winget install Git.Git
   ```

2. **Node.js 20 LTS**
   ```powershell
   winget install OpenJS.NodeJS.LTS
   ```

3. **Python 3.11+**
   ```powershell
   winget install Python.Python.3.11
   ```

4. **Docker Desktop**
   ```powershell
   winget install Docker.DockerDesktop
   ```

5. **Tailscale VPN**
   ```powershell
   winget install Tailscale.Tailscale
   ```

**Verify Installations**:
```powershell
# Check versions
git --version          # Should be 2.40+
node --version         # Should be v20.x.x
python --version       # Should be 3.11+
docker --version       # Should be 24.0+
```

### Step 3: Clone Repository

```powershell
# Create project directory
mkdir C:\Dev\Projects\Repos
cd C:\Dev\Projects\Repos

# Clone repository
git clone https://github.com/your-org/Project-Nyra.git
cd Project-Nyra

# Verify bootstrap directory
dir bootstrap
```

---

## 🌐 Network Configuration

### Static IP Configuration

**Option 1: GUI Method**

1. Open **Settings** → **Network & Internet** → **Ethernet**
2. Click on your network adapter
3. Click **Edit** next to IP assignment
4. Select **Manual** and enable **IPv4**
5. Enter:
   ```
   IP address:     192.168.1.101
   Subnet mask:    255.255.255.0
   Gateway:        192.168.1.1
   Preferred DNS:  8.8.8.8
   Alternate DNS:  8.8.4.4
   ```
6. Click **Save**

**Option 2: PowerShell Method**

```powershell
# Find your network adapter name
Get-NetAdapter

# Set static IP (replace "Ethernet" with your adapter name)
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.1.101 -PrefixLength 24 -DefaultGateway 192.168.1.1

# Set DNS servers
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("8.8.8.8","8.8.4.4")

# Verify configuration
Get-NetIPAddress -InterfaceAlias "Ethernet"
```

### Tailscale VPN Setup

```powershell
# Start Tailscale
tailscale up

# Follow browser authentication prompt

# Verify connection
tailscale status

# Expected output:
# 100.x.x.x   pc1-orchestrator    your-email@  windows -
# 100.x.x.y   pc2-worker          your-email@  windows idle
```

### Firewall Configuration

```powershell
# Run as Administrator

# Allow Docker
New-NetFirewallRule -DisplayName "Docker Desktop" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 2375,2376 `
    -Action Allow

# Allow PostgreSQL
New-NetFirewallRule -DisplayName "PostgreSQL" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 5432 `
    -Action Allow

# Allow Redis
New-NetFirewallRule -DisplayName "Redis" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 6379 `
    -Action Allow

# Allow Qdrant
New-NetFirewallRule -DisplayName "Qdrant" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 6333,6334 `
    -Action Allow

# Allow Prometheus
New-NetFirewallRule -DisplayName "Prometheus" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 9090 `
    -Action Allow

# Allow Grafana
New-NetFirewallRule -DisplayName "Grafana" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 3000 `
    -Action Allow

# Allow Loki
New-NetFirewallRule -DisplayName "Loki" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 3100 `
    -Action Allow

# Allow Letta
New-NetFirewallRule -DisplayName "Letta" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 8000 `
    -Action Allow
```

---

## 🖥️ GUI Installer Setup

### Launch Installer

```powershell
# Navigate to installer directory
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\installer

# Install dependencies
npm install

# Start GUI installer
npm run dev
```

### Installation Wizard Walkthrough

#### Phase 1: PC Selection

1. **Select PC Role**: Choose **PC1 - Orchestrator**
2. **Hardware Detection**: Verify detected specs
   ```
   CPU: Intel Core i7-11800H (8 cores)
   RAM: 32GB
   Storage: 1TB NVMe
   Network: Gigabit Ethernet
   ```
3. Click **Continue**

#### Phase 2: Environment Selection

1. **Choose Environment**:
   - **Development**: For local testing (recommended for first setup)
   - **Staging**: Pre-production testing
   - **Production**: Live deployment
2. Click **Continue**

#### Phase 3: Component Selection

**Required Components** (auto-selected):
- ✅ Claude Code
- ✅ Docker Desktop

**Recommended Components**:
- ✅ Claude Desktop
- ✅ Claude Flow
- ✅ WSL Setup
- ✅ Infisical (Secrets Management)

**Optional Components**:
- ☐ Gitea (Local Git Server)

Click **Continue to MCP Configuration**

#### Phase 4: MCP Server Configuration

**Select MCP Servers**:
- ✅ claude-flow-mcp (Claude Flow orchestration)
- ✅ ruv-swarm-mcp (Swarm coordination)
- ✅ agentdb (Vector memory)
- ✅ ruvector (Neural patterns)
- ✅ letta (Memory server)
- ✅ graphiti (Graph memory)
- ✅ mem0 (Memory augmentation)
- ✅ filesystem (File operations)
- ✅ github (GitHub integration)

**Configure API Keys**:
```yaml
Anthropic API Key: sk-ant-api03-...
OpenAI API Key: sk-...
GitHub Token: ghp_...
```

Click **Continue**

#### Phase 5: Docker Setup

1. **Verify Docker Installation**
   - Status: ✅ Installed
   - Version: 24.0.x
   - Engine: Running

2. **Docker Configuration**
   - Memory: 16GB (recommended for PC1)
   - CPUs: 6 (leave 2 for host)
   - Disk: 500GB

Click **Continue**

#### Phase 6: Configuration Editor

**Edit Environment Variables**:

```bash
# .env.pc1
PC_ID=pc1
PC_ROLE=orchestrator
PC_IP=10.0.0.1

POSTGRES_USER=nyra_admin
POSTGRES_PASSWORD=<auto-generated-strong-password>
POSTGRES_DB=nyra

REDIS_PASSWORD=<auto-generated-strong-password>

ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

GRAFANA_PASSWORD=<auto-generated-strong-password>

TAILSCALE_AUTH_KEY=tskey-...
```

Click **Save and Continue**

#### Phase 7: Shim Generation

- Automatically generates MCP server wrapper scripts
- Creates startup shortcuts
- Configures environment paths

Click **Continue to Deployment**

#### Phase 8: Service Deployment

Watch real-time deployment progress:

```
[1/12] Pulling postgres:15...        ████████████ 100%
[2/12] Pulling redis:7-alpine...     ████████████ 100%
[3/12] Pulling qdrant/qdrant...      ████████████ 100%
[4/12] Pulling falkordb/falkordb...  ████████████ 100%
[5/12] Pulling letta/letta-server... ████████████ 100%
[6/12] Pulling litellm/litellm...    ████████████ 100%
[7/12] Pulling prometheus...         ████████████ 100%
[8/12] Pulling grafana...            ████████████ 100%
[9/12] Pulling loki...               ████████████ 100%
[10/12] Starting services...         ████████████ 100%
[11/12] Waiting for health checks... ████████████ 100%
[12/12] Deployment complete!         ████████████ 100%
```

#### Phase 9: Health Check

Automated validation:

```
✅ PostgreSQL - Healthy (5432)
✅ Redis - Healthy (6379)
✅ Qdrant - Healthy (6333)
✅ FalkorDB - Healthy (6380)
✅ Letta - Healthy (8000)
✅ LiteLLM - Healthy (4000)
✅ Prometheus - Healthy (9090)
✅ Grafana - Healthy (3000)
✅ Loki - Healthy (3100)
```

Click **Complete Setup**

#### Phase 10: Complete

```
✓ Installation Complete!

Your Project Nyra orchestrator has been successfully configured.

Services are running at:
- Grafana:    http://localhost:3000 (admin/<your-password>)
- Prometheus: http://localhost:9090
- Letta:      http://localhost:8000
- Qdrant:     http://localhost:6333

Next steps:
1. Set up worker PCs (PC2, PC3, PC4)
2. Configure Claude Code with MCP servers
3. Deploy your first AI workload

View logs: docker compose logs -f
```

---

## ⚙️ Service Configuration

### PostgreSQL Setup

```powershell
# Connect to PostgreSQL
docker exec -it nyra-postgres psql -U nyra_admin -d nyra

# Create extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

# Verify extensions
\dx

# Exit
\q
```

### Qdrant Configuration

```powershell
# Check Qdrant health
curl http://localhost:6333/health

# List collections
curl http://localhost:6333/collections

# Create a test collection
curl -X PUT http://localhost:6333/collections/test `
  -H "Content-Type: application/json" `
  -d '{\"vectors\":{\"size\":384,\"distance\":\"Cosine\"}}'
```

### Grafana Dashboard Setup

1. **Access Grafana**: http://localhost:3000
2. **Login**: admin / <your-grafana-password>
3. **Add Data Sources**:
   - Prometheus: http://prometheus:9090
   - Loki: http://loki:3100
4. **Import Dashboards**:
   - Go to **Dashboards** → **Import**
   - Upload from: `bootstrap/configs/grafana/dashboards/`
   - Import all JSON files

### Claude Flow Configuration

```powershell
# Initialize Claude Flow
cd C:\Dev\Projects\Repos\Project-Nyra
npx @claude-flow/cli@latest init --wizard

# Start daemon
npx @claude-flow/cli@latest daemon start

# Verify status
npx @claude-flow/cli@latest status

# Run doctor
npx @claude-flow/cli@latest doctor --fix
```

---

## ✔️ Post-Installation Verification

### Service Health Checks

```powershell
# Check all services
docker ps

# Expected output: All containers in "healthy" state

# Check specific service logs
docker compose logs postgres
docker compose logs redis
docker compose logs qdrant

# Check resource usage
docker stats
```

### Network Connectivity Tests

```powershell
# Test PostgreSQL
Test-NetConnection -ComputerName localhost -Port 5432

# Test Redis
Test-NetConnection -ComputerName localhost -Port 6379

# Test Qdrant
Test-NetConnection -ComputerName localhost -Port 6333

# Test Grafana
Test-NetConnection -ComputerName localhost -Port 3000

# Test Prometheus
Test-NetConnection -ComputerName localhost -Port 9090
```

### API Endpoint Tests

```powershell
# PostgreSQL
docker exec nyra-postgres pg_isready -U nyra_admin

# Redis
docker exec nyra-redis redis-cli ping

# Qdrant
curl http://localhost:6333/health

# Letta
curl http://localhost:8000/health

# Prometheus
curl http://localhost:9090/-/healthy

# Grafana
curl http://localhost:3000/api/health
```

### Performance Benchmarks

```powershell
# PostgreSQL benchmark
docker exec nyra-postgres pgbench -i -s 10 nyra
docker exec nyra-postgres pgbench -c 10 -j 2 -t 1000 nyra

# Redis benchmark
docker exec nyra-redis redis-benchmark -q -n 100000

# Qdrant benchmark
curl -X POST http://localhost:6333/collections/test/points/search `
  -H "Content-Type: application/json" `
  -d '{\"vector\":[0.1,0.2,0.3,...],\"limit\":10}'
```

---

## 🔧 Troubleshooting

### Docker Issues

**Issue**: Docker Desktop won't start

```powershell
# Restart Docker service
Restart-Service docker

# Reset Docker Desktop
& "C:\Program Files\Docker\Docker\Docker Desktop.exe" --reset-to-factory-defaults

# Check WSL integration
wsl --list --verbose
```

**Issue**: Containers keep restarting

```powershell
# Check logs
docker compose logs <service-name>

# Check resource limits
docker stats

# Increase Docker memory
# Docker Desktop → Settings → Resources → Memory: 16GB
```

### Network Issues

**Issue**: Can't reach services from other PCs

```powershell
# Check firewall rules
Get-NetFirewallRule -DisplayName "PostgreSQL"

# Test from PC1
Test-NetConnection -ComputerName 10.0.0.2 -Port 11434

# Verify Tailscale
tailscale status
tailscale ping 10.0.0.2
```

**Issue**: Static IP not persisting

```powershell
# Check adapter settings
Get-NetIPAddress -InterfaceAlias "Ethernet"

# Re-apply static IP
New-NetIPAddress -InterfaceAlias "Ethernet" `
  -IPAddress 192.168.1.101 `
  -PrefixLength 24 `
  -DefaultGateway 192.168.1.1
```

### Service-Specific Issues

**PostgreSQL**:
```powershell
# Check if database exists
docker exec nyra-postgres psql -U nyra_admin -l

# Reset database
docker compose down postgres
docker volume rm nyra_postgres-data
docker compose up -d postgres
```

**Redis**:
```powershell
# Check Redis status
docker exec nyra-redis redis-cli info server

# Clear cache if needed
docker exec nyra-redis redis-cli FLUSHALL
```

**Qdrant**:
```powershell
# Check Qdrant logs
docker compose logs qdrant

# Verify vector storage
curl http://localhost:6333/collections

# Reset Qdrant
docker compose down qdrant
docker volume rm nyra_qdrant-data
docker compose up -d qdrant
```

### Performance Issues

**High CPU Usage**:
```powershell
# Identify culprit
docker stats

# Limit CPU per service
# Edit docker-compose.yml:
deploy:
  resources:
    limits:
      cpus: '2.0'
```

**High Memory Usage**:
```powershell
# Check memory
docker stats --no-stream

# Increase Docker memory
# Docker Desktop → Settings → Resources → Memory: 20GB

# Restart services
docker compose restart
```

**Disk Space Issues**:
```powershell
# Check Docker disk usage
docker system df

# Prune unused data
docker system prune -a --volumes

# Clean old images
docker image prune -a
```

---

## 📚 Additional Resources

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture overview
- **[INSTALLER-GUIDE.md](INSTALLER-GUIDE.md)** - GUI installer detailed guide
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Comprehensive troubleshooting guide
- **[Docker Documentation](https://docs.docker.com/)** - Docker reference
- **[PostgreSQL Documentation](https://www.postgresql.org/docs/)** - PostgreSQL reference
- **[Qdrant Documentation](https://qdrant.tech/documentation/)** - Qdrant vector DB reference

---

## 🎉 Next Steps

1. **Set up worker PCs**:
   - [SETUP-WORKER-RTX4090.md](SETUP-WORKER-RTX4090.md) for PC2 and PC3
   - [SETUP-WORKER-RTX3060.md](SETUP-WORKER-RTX3060.md) for PC4

2. **Configure Claude Code**:
   - Add MCP servers to Claude Code
   - Test multi-agent workflows

3. **Deploy first workload**:
   - Initialize Claude Flow swarm
   - Run distributed AI task

---

**Completed**: ✅
**PC1 (Orchestrator) is now ready for coordinating distributed AI workloads!**
